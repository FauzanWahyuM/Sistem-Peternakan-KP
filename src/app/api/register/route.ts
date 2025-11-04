import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "../../../lib/dbConnect";
import User from "../../../models/User";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("📩 Incoming body:", body);

        // Tambahkan field baru di sini
        const {
            nama,
            username,
            email,
            password,
            phoneNumber, // Tambahan: Nomor HP
            village, // Tambahan: Desa
            district, // Tambahan: Kecamatan
            kelompokId, // untuk peternak
            wilayahBinaan, // untuk penyuluh
            tempatLahir,
            tanggalLahir,
            umur,
            role,
            status
        } = body;

        await connectDB();
        console.log("✅ Database connected");

        // cek apakah user sudah ada
        const existingUser = await User.findOne({
            username: new RegExp(`^${username}$`, "i"),
        });
        if (existingUser) {
            console.warn("⚠️ User already exists:", username);
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("🔑 Password hashed");

        // Tentukan kelompok berdasarkan role
        const kelompok = role === 'peternak' ? kelompokId : wilayahBinaan;

        // Buat objek user dengan field yang sesuai
        const userData: any = {
            nama,
            username,
            email,
            password: hashedPassword,
            phoneNumber: phoneNumber || '', // Tambahan: Default empty string jika tidak diisi
            village: village || '', // Tambahan: Default empty string jika tidak diisi
            district: district || '', // Tambahan: Default empty string jika tidak diisi
            kelompok,
            role,
            status: status || 'Aktif',
        };

        // Tambahkan field khusus peternak
        if (role === 'peternak') {
            userData.tempatLahir = tempatLahir;
            userData.tanggalLahir = tanggalLahir;
            userData.umur = umur;
        }

        // simpan user baru
        const newUser = await User.create(userData);

        console.log("✅ New user created:", newUser._id.toString());

        // Siapkan response data
        const responseData: any = {
            id: newUser._id,
            nama: newUser.nama,
            username: newUser.username,
            email: newUser.email,
            phoneNumber: newUser.phoneNumber, // Tambahan
            village: newUser.village, // Tambahan
            district: newUser.district, // Tambahan
            kelompok: newUser.kelompok,
            role: newUser.role,
            status: newUser.status,
        };

        // Tambahkan field khusus peternak dalam response
        if (role === 'peternak') {
            responseData.tempatLahir = newUser.tempatLahir;
            responseData.tanggalLahir = newUser.tanggalLahir;
            responseData.umur = newUser.umur;
        }

        return NextResponse.json(
            {
                message: "Register success",
                user: responseData,
            },
            { status: 201 }
        );
    } catch (err: any) {
        console.error("❌ Register error:", err);

        // jika duplicate key error dari Mongo
        if (err.code === 11000) {
            return NextResponse.json(
                { error: "Email or username already exists" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: err.message || "Something went wrong" },
            { status: 500 }
        );
    }
}