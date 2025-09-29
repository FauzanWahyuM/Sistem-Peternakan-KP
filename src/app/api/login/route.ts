import { NextResponse } from "next/server";
import connectDB from "../../../lib/dbConnect";
import bcrypt from "bcryptjs";
import User from "../../../models/User";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "ini_rahasia";

// Admin hardcode credentials
const HARDCODE_ADMIN = {
    username: "admin",
    password: "Admin@1234", // Password plain untuk hardcode
    nama: "Administrator System",
    email: "admin@sistem-peternakan.com",
    role: "admin",
    status: "Aktif"
};

export async function POST(req: Request) {
    try {
        await connectDB();
        const { username, password } = await req.json();

        // Cek jika ini admin hardcode
        if (username.toLowerCase() === HARDCODE_ADMIN.username.toLowerCase() && password === HARDCODE_ADMIN.password) {
            console.log("🔄 Login dengan admin hardcode");

            // Buat user object untuk admin hardcode
            const hardcodeAdminUser = {
                _id: "admin-hardcode-id",
                nama: HARDCODE_ADMIN.nama,
                username: HARDCODE_ADMIN.username,
                email: HARDCODE_ADMIN.email,
                role: HARDCODE_ADMIN.role,
                status: HARDCODE_ADMIN.status,
                kelompok: "Administrator",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Buat JWT untuk admin hardcode
            const token = jwt.sign(
                {
                    id: hardcodeAdminUser._id,
                    username: hardcodeAdminUser.username,
                    role: hardcodeAdminUser.role,
                    isHardcode: true // Flag untuk menandai ini admin hardcode
                },
                SECRET_KEY,
                { expiresIn: "1d" }
            );

            return NextResponse.json({
                message: "Login berhasil (Hardcode Admin)",
                user: hardcodeAdminUser,
                token,
                isHardcode: true
            }, { status: 200 });
        }

        // Jika bukan admin hardcode, cari di database
        const user = await User.findOne({ username: new RegExp(`^${username}$`, "i") });
        if (!user) {
            return NextResponse.json({ message: "User tidak ditemukan" }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ message: "Password salah" }, { status: 401 });
        }

        // Buat JWT untuk user database
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            SECRET_KEY,
            { expiresIn: "1d" }
        );

        return NextResponse.json({
            message: "Login berhasil",
            user: {
                _id: user._id,
                nama: user.nama,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                kelompok: user.kelompok,
                profileImage: user.profileImage,
                tempatLahir: user.tempatLahir,
                tanggalLahir: user.tanggalLahir,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            token
        }, { status: 200 });
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
    }
}