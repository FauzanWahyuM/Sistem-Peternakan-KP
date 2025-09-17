import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConnect";
import User from "../../../../models/User";
import mongoose from "mongoose";

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const params = await context.params;
        const { id } = params;

        console.log('🔍 Mencari user dengan ID:', id);

        // Validasi ID
        if (!id || id === "undefined" || id === "null") {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        let user;

        // Coba cari berdasarkan ObjectId jika valid
        if (mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findById(id);
        }

        // Jika tidak ditemukan atau bukan ObjectId, cari berdasarkan username atau email
        if (!user) {
            user = await User.findOne({
                $or: [
                    { username: id },
                    { email: id }
                ]
            });
        }

        if (!user) {
            console.log('❌ User tidak ditemukan untuk ID:', id);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Siapkan data user
        const userData: any = {
            _id: user._id.toString(),
            nama: user.nama,
            username: user.username,
            email: user.email,
            kelompok: user.kelompok,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            profileImage: user.profileImage
        };

        // Tambahkan field khusus untuk peternak
        if (user.role?.toLowerCase() === 'peternak') {
            userData.tempatLahir = user.tempatLahir || null;
            userData.tanggalLahir = user.tanggalLahir || null;
            userData.umur = user.umur || null;
        }

        console.log('✅ User ditemukan:', user.username);
        return NextResponse.json({ user: userData });
    } catch (error: any) {
        console.error("❌ Error in GET /api/users/[id]:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const params = await context.params;
        const { id } = params;
        const body = await req.json();

        console.log('🔄 Memperbarui user dengan ID:', id);

        // Hitung ulang umur jika tanggalLahir diupdate dan role peternak
        if (body.role?.toLowerCase() === 'peternak' && body.tanggalLahir) {
            const today = new Date();
            const birthDate = new Date(body.tanggalLahir);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            body.umur = age;
        }

        const user = await User.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Siapkan response
        const userData: any = {
            _id: user._id.toString(),
            nama: user.nama,
            username: user.username,
            email: user.email,
            kelompok: user.kelompok,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            profileImage: user.profileImage
        };

        // Tambahkan field khusus untuk peternak
        if (user.role?.toLowerCase() === 'peternak') {
            userData.tempatLahir = user.tempatLahir || null;
            userData.tanggalLahir = user.tanggalLahir || null;
            userData.umur = user.umur || null;
        }

        return NextResponse.json({
            message: "User updated successfully",
            user: userData
        });
    } catch (error: any) {
        console.error("❌ Error in PUT /api/users/[id]:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}