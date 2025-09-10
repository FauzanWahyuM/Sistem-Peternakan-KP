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
        const { nama, email, kelompok } = body;

        // Cari user by email dari session
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Update fields
        if (nama) user.nama = nama;
        if (email) user.email = email;
        if (kelompok) user.kelompok = kelompok;

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

        return NextResponse.json({ user: updatedUser });

    } catch (error: any) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}