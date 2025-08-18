// route.ts
import { NextResponse } from "next/server";
import connectDB from "../../../lib/dbConnect";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Karena User.js masih JS, kita pakai dynamic import dengan tipe mongoose.Model
const User = mongoose.models.User || mongoose.model("User");


export async function POST(req: Request) {
    try {
        await connectDB();
        const { username, password } = await req.json();

        const user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json({ message: "User tidak ditemukan" }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ message: "Password salah" }, { status: 401 });
        }

        return NextResponse.json({ message: "Login berhasil", user }, { status: 200 });
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
    }
}
