import { NextResponse } from "next/server";
import connectDB from "../../../lib/dbConnect";
import bcrypt from "bcryptjs";
import User from "../../../models/User";  // langsung import, sudah ada tipe

export async function POST(req: Request) {
    try {
        await connectDB();
        const { username, password } = await req.json();

        const user = await User.findOne({ username: new RegExp(`^${username}$`, "i") });  // sekarang aman ✅
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
