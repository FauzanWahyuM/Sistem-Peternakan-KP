import { NextResponse } from "next/server";
import connectDB from "../../../lib/dbConnect";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

// GET semua user
export async function GET() {
    try {
        await connectDB();
        const users = await User.find().sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
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
