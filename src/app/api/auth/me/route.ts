// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/authOptions";
import connectDB from "../../../../lib/dbConnect";
import User from "../../../../models/User";

export async function GET(req: NextRequest) {
    try {
        console.log('🔍 /api/auth/me called');

        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            console.log('❌ Not authenticated');
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        await connectDB();

        // Cari user berdasarkan email dari session
        const user = await User.findOne({ email: session.user.email }).select('-password'); // Exclude password

        if (!user) {
            console.log('❌ User not found');
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Pastikan semua field yang diperlukan ada
        const userData = {
            _id: user._id.toString(),
            nama: user.nama || 'Tidak tersedia',
            username: user.username || 'Tidak tersedia',
            email: user.email || 'Tidak tersedia',
            kelompok: user.kelompok || 'Tidak tersedia',
            role: user.role || 'Tidak tersedia',
            status: user.status || 'Tidak tersedia',
            createdAt: user.createdAt || new Date(),
            updatedAt: user.updatedAt || new Date(),
            profileImage: user.profileImage || '/Vector.svg'
        };

        console.log('✅ Returning user data:', userData);
        return NextResponse.json({ user: userData });

    } catch (error: any) {
        console.error("❌ Error in /api/auth/me:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// ✅ Tambahkan handler untuk OPTIONS method (preflight requests)
export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}