import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "../../../lib/dbConnect";
import User from "../../../models/User";

export async function POST(req: Request) {
    try {
        const { nama, username, email, password, kelompok, role, status } =
            await req.json();

        await connectDB();

        // cek apakah user sudah ada
        const existingUser = await User.findOne({username: new RegExp(`^${username}$`, "i")});
        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // simpan user baru
        const newUser = await User.create({
            nama,
            username,
            email,
            password: hashedPassword,
            kelompok,
            role,
            status,
        });

        return NextResponse.json(
            {
                message: "Register success",
                user: {
                    id: newUser._id,
                    nama: newUser.nama,
                    username: newUser.username,
                    email: newUser.email,
                    kelompok: newUser.kelompok,
                    role: newUser.role,
                    status: newUser.status,
                },
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("Register error:", err);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
