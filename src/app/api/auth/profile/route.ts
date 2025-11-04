// src/app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConnect";
import User from "../../../../models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/authOptions";

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const body = await request.json();
        const {
            nama,
            email,
            kelompok,
            tempatLahir,
            tanggalLahir,
            phoneNumber, // Tambahkan
            village, // Tambahkan
            district // Tambahkan
        } = body;

        // Cari user by email dari session
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Update fields dasar
        if (nama) user.nama = nama;
        if (email) user.email = email;
        if (kelompok) user.kelompok = kelompok;

        // Update fields baru (untuk semua role)
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        if (village !== undefined) user.village = village;
        if (district !== undefined) user.district = district;

        // Update fields khusus untuk peternak
        if (user.role?.toLowerCase() === 'peternak') {
            if (tempatLahir !== undefined) user.tempatLahir = tempatLahir;

            // Pastikan tanggalLahir dalam format yang benar
            if (tanggalLahir !== undefined && tanggalLahir !== 'Tidak tersedia') {
                // Jika format sudah YYYY-MM-DD, simpan sebagai Date object
                user.tanggalLahir = new Date(tanggalLahir);

                // Hitung ulang umur
                const today = new Date();
                const birthDate = new Date(tanggalLahir);
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();

                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                user.umur = age;
            }
        }

        await user.save();

        // Siapkan data user yang akan dikembalikan
        const updatedUser: any = {
            _id: user._id.toString(),
            nama: user.nama,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber || '', // Tambahkan
            village: user.village || '', // Tambahkan
            district: user.district || '', // Tambahkan
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

        return NextResponse.json({ user: updatedUser });

    } catch (error: any) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// ✅ Tambahkan handler untuk OPTIONS method (preflight requests)
export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}