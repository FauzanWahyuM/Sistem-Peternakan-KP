// src/app/api/user/[id]/route.ts
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

        console.log('✅ User ditemukan:', user.username);
        return NextResponse.json({
            user: {
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
            }
        });
    } catch (error: any) {
        console.error("❌ Error in GET /api/user/[id]:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const { id } = params;
        const body = await req.json();

        console.log('🔄 Memperbarui user dengan ID:', id);

        const user = await User.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "User updated successfully",
            user: {
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
            }
        });
    } catch (error: any) {
        console.error("❌ Error in PUT /api/user/[id]:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}