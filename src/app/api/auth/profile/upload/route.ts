// src/app/api/auth/profile/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/dbConnect";
import User from "../../../../../models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/authOptions";
import { uploadFile, deleteFile } from "../../../../../lib/gridfs";

export async function POST(request: NextRequest) {
    try {
        // Connect database terlebih dahulu
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Cari user by email dari session
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const formData = await request.formData();
        const file = formData.get("profileImage") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validasi bahwa file adalah gambar
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: "File must be an image" }, { status: 400 });
        }

        // Validasi ukuran file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
        }

        // Convert File to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Hapus file lama jika ada
        if (user.profileImage) {
            try {
                await deleteFile(user.profileImage);
            } catch (error) {
                console.error("Error deleting old profile image:", error);
                // Lanjutkan meskipun gagal menghapus file lama
            }
        }

        // Upload ke GridFS menggunakan interface yang sesuai
        const fileId = await uploadFile({
            originalname: file.name,
            mimetype: file.type,
            buffer: buffer,
            size: buffer.length,
            fieldname: 'profileImage',
            encoding: '7bit'
        });

        // Update user profile image reference
        user.profileImage = fileId;
        await user.save();

        // Siapkan data user yang akan dikembalikan DENGAN FIELD BARU
        const updatedUser: any = {
            _id: user._id.toString(),
            nama: user.nama,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber || '', // TAMBAHKAN
            village: user.village || '', // TAMBAHKAN
            district: user.district || '', // TAMBAHKAN
            kelompok: user.kelompok,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            profileImage: user.profileImage
        };

        // Tambahkan field khusus untuk peternak dalam response
        if (user.role?.toLowerCase() === 'peternak') {
            updatedUser.tempatLahir = user.tempatLahir || 'Tidak tersedia';
            updatedUser.tanggalLahir = user.tanggalLahir || 'Tidak tersedia';
            updatedUser.umur = user.umur || 0;
        }

        return NextResponse.json({
            user: updatedUser,
            imageUrl: `/api/auth/profile/image/${fileId}?t=${Date.now()}` // Tambahkan timestamp untuk cache busting
        });

    } catch (error: any) {
        console.error("Error uploading profile image:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}