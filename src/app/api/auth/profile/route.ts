// src/app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConnect";
import User from "../../../../models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/authOptions";

export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        // Cek session
        const session = await getServerSession(authOptions);
        console.log("🔍 Session data:", {
            hasSession: !!session,
            userId: session?.user?.id
        });

        if (!session || !session.user || !session.user.id) {
            console.log("❌ No valid session found");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        console.log("📦 Update request body:", body);

        const {
            nama,
            email,
            kelompok,
            tempatLahir,
            tanggalLahir,
            phoneNumber,
            village,
            district
        } = body;

        // Cari user by ID dari session
        const user = await User.findById(session.user.id);
        if (!user) {
            console.log("❌ User not found for ID:", session.user.id);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        console.log("✅ User found:", user.email, "Role:", user.role);

        // ✅ FIX: Safe update - hanya update field yang ada di request body
        const updateData: any = {};

        if (nama !== undefined) updateData.nama = nama;
        if (email !== undefined) updateData.email = email;
        if (kelompok !== undefined) updateData.kelompok = kelompok;

        // Field baru - handle dengan safe default
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber || '';
        if (village !== undefined) updateData.village = village || '';
        if (district !== undefined) updateData.district = district || '';

        // Field khusus peternak
        if (user.role?.toLowerCase() === 'peternak') {
            if (tempatLahir !== undefined) updateData.tempatLahir = tempatLahir || '';

            if (tanggalLahir !== undefined) {
                if (tanggalLahir && tanggalLahir.trim() !== '') {
                    const birthDate = new Date(tanggalLahir);
                    if (!isNaN(birthDate.getTime())) {
                        updateData.tanggalLahir = birthDate;

                        // Hitung ulang umur
                        const today = new Date();
                        let age = today.getFullYear() - birthDate.getFullYear();
                        const monthDiff = today.getMonth() - birthDate.getMonth();
                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                        }
                        updateData.umur = age;
                    }
                } else {
                    updateData.tanggalLahir = null;
                    updateData.umur = null;
                }
            }
        }

        console.log("🔄 Data to update:", updateData);

        // Lakukan update dengan $set untuk menghindari overwrite field lain
        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { $set: updateData },
            { new: true, runValidators: true } // new: true untuk return document yang sudah diupdate
        );

        if (!updatedUser) {
            throw new Error("Failed to update user");
        }

        console.log("✅ User updated successfully");

        // Format response data dengan default values untuk field yang mungkin masih null
        const userResponse = {
            _id: updatedUser._id.toString(),
            nama: updatedUser.nama,
            username: updatedUser.username,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber || '',
            village: updatedUser.village || '',
            district: updatedUser.district || '',
            kelompok: updatedUser.kelompok,
            role: updatedUser.role,
            status: updatedUser.status,
            profileImage: updatedUser.profileImage,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        };

        // Tambahkan field khusus peternak
        if (updatedUser.role?.toLowerCase() === 'peternak') {
            (userResponse as any).tempatLahir = updatedUser.tempatLahir || '';
            (userResponse as any).tanggalLahir = updatedUser.tanggalLahir
                ? updatedUser.tanggalLahir.toISOString().split('T')[0]
                : '';
            (userResponse as any).umur = updatedUser.umur || null;
        }

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            user: userResponse
        });

    } catch (error: any) {
        console.error("❌ Error updating profile:", error);

        // Berikan error message yang lebih spesifik
        let errorMessage = "Internal server error";
        if (error.name === 'ValidationError') {
            errorMessage = "Data tidak valid: " + Object.values(error.errors).map((e: any) => e.message).join(', ');
        } else if (error.name === 'CastError') {
            errorMessage = "Format data tidak valid";
        }

        return NextResponse.json(
            {
                success: false,
                error: errorMessage
            },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}