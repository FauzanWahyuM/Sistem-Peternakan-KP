import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/dbConnect";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

// GET semua user
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const users = await User.find({}).select('-password');

        return NextResponse.json(users.map(user => ({
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
        })));
    } catch (error: any) {
        console.error("Error in GET /api/user:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// POST tambah user baru
export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();

        // hash password
        if (body.password) {
            body.password = await bcrypt.hash(body.password, 10);
        }

        const newUser = new User(body);
        await newUser.save();

        return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/users error:", error.message);
        return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
    }
}
