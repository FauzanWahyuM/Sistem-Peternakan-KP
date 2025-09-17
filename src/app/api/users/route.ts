import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/dbConnect";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

// GET semua user
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const users = await User.find({}).select('-password');

        return NextResponse.json(users.map(user => {
            const userData: any = {
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

            // Tambahkan field khusus untuk peternak
            if (user.role?.toLowerCase() === 'peternak') {
                userData.tempatLahir = user.tempatLahir || null;
                userData.tanggalLahir = user.tanggalLahir || null;
                userData.umur = user.umur || null;
            }

            return userData;
        }));
    } catch (error: any) {
        console.error("Error in GET /api/users:", error);
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

        // Hash password
        if (body.password) {
            body.password = await bcrypt.hash(body.password, 10);
        }

        // Hitung umur otomatis jika tanggalLahir disediakan dan role peternak
        if (body.role?.toLowerCase() === 'peternak' && body.tanggalLahir) {
            const today = new Date();
            const birthDate = new Date(body.tanggalLahir);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            body.umur = age;
        }

        const newUser = new User(body);
        await newUser.save();

        // Siapkan response tanpa password
        const userResponse: any = {
            _id: newUser._id.toString(),
            nama: newUser.nama,
            username: newUser.username,
            email: newUser.email,
            kelompok: newUser.kelompok,
            role: newUser.role,
            status: newUser.status,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
            profileImage: newUser.profileImage
        };

        // Tambahkan field khusus untuk peternak dalam response
        if (newUser.role?.toLowerCase() === 'peternak') {
            userResponse.tempatLahir = newUser.tempatLahir || null;
            userResponse.tanggalLahir = newUser.tanggalLahir || null;
            userResponse.umur = newUser.umur || null;
        }

        return NextResponse.json(userResponse, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/users error:", error.message);
        return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
    }
}