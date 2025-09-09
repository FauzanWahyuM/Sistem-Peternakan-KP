// app/api/user/[id]/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/dbConnect";
import User from "../../../../../models/User";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const params = await context.params;
        const { id } = params;

        // Validasi ID
        if (!id || id === "undefined" || id === "null") {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("profileImage") as File;

        if (!file) {
            return NextResponse.json(
                { error: "File is required" },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const timestamp = Date.now();
        const extension = path.extname(file.name);
        const filename = `profile-${id}-${timestamp}${extension}`;

        // Save file to public/uploads directory
        const uploadDir = path.join(process.cwd(), "public/uploads");
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);

        // Update user profile image in database
        const imageUrl = `/uploads/${filename}`;
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { profileImage: imageUrl },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Image uploaded successfully",
            imageUrl
        });
    } catch (error: any) {
        console.error("Error in POST /api/user/[id]/upload:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}