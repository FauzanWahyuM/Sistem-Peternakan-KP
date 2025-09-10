// src/app/api/auth/profile/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/dbConnect";
import User from "../../../../../models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/authOptions";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

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

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const timestamp = Date.now();
        const extension = path.extname(file.name);
        const filename = `profile-${user._id}-${timestamp}${extension}`;

        // Save file to public/uploads directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const filepath = path.join(uploadDir, filename);

        // Simpan file (dalam development, untuk production sebaiknya gunakan cloud storage)
        await writeFile(filepath, buffer);

        // Update user profile image
        user.profileImage = `/uploads/${filename}`;
        await user.save();

        const updatedUser = {
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

        return NextResponse.json({
            user: updatedUser,
            imageUrl: user.profileImage
        });

    } catch (error: any) {
        console.error("Error uploading profile image:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}