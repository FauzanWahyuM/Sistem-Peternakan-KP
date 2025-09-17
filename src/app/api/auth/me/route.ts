// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/authOptions";
import connectDB from "../../../../lib/dbConnect";
import User from "../../../../models/User";

// Interface untuk format tanggal MongoDB
interface MongoDBDate {
    $date: {
        $numberLong: string;
    } | string | number;
}

// Type guard untuk memeriksa MongoDB date format
function isMongoDBDate(obj: any): obj is MongoDBDate {
    return obj && typeof obj === 'object' && '$date' in obj;
}

// Fungsi untuk mengonversi berbagai format tanggal ke string ISO
function convertToISODate(dateValue: any): string {
    if (!dateValue) return 'Tidak tersedia';

    try {
        // Jika sudah Date object
        if (dateValue instanceof Date) {
            return dateValue.toISOString().split('T')[0];
        }

        // Jika format MongoDB
        if (isMongoDBDate(dateValue)) {
            let timestamp: number;

            if (typeof dateValue.$date === 'object' && dateValue.$date && '$numberLong' in dateValue.$date) {
                timestamp = parseInt((dateValue.$date as { $numberLong: string }).$numberLong);
            } else if (typeof dateValue.$date === 'string') {
                return dateValue.$date.split('T')[0]; // Jika sudah string ISO, ambil bagian tanggalnya
            } else if (typeof dateValue.$date === 'number') {
                timestamp = dateValue.$date;
            } else {
                return 'Tidak tersedia';
            }

            return new Date(timestamp).toISOString().split('T')[0];
        }

        // Jika sudah string
        if (typeof dateValue === 'string') {
            // Jika string sudah dalam format ISO, ambil bagian tanggalnya
            if (dateValue.includes('T')) {
                return dateValue.split('T')[0];
            }
            return dateValue; // Jika sudah format YYYY-MM-DD
        }

        return 'Tidak tersedia';
    } catch (error) {
        console.error('Error converting date:', error);
        return 'Tidak tersedia';
    }
}

export async function GET() {
    try {
        console.log('🔍 /api/auth/me called');

        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            console.log('❌ Not authenticated');
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        await connectDB();

        // Cari user berdasarkan email dari session
        const user = await User.findOne({ email: session.user.email }).select('-password');

        if (!user) {
            console.log('❌ User not found');
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Convert MongoDB document to plain object
        const userObject = user.toObject ? user.toObject() : user;

        // Data dasar yang selalu dikembalikan
        const userData: any = {
            _id: userObject._id.toString(),
            nama: userObject.nama || 'Tidak tersedia',
            username: userObject.username || 'Tidak tersedia',
            email: userObject.email || 'Tidak tersedia',
            kelompok: userObject.kelompok || 'Tidak tersedia',
            role: userObject.role || 'Tidak tersedia',
            status: userObject.status || 'Tidak tersedia',
            createdAt: userObject.createdAt || new Date(),
            updatedAt: userObject.updatedAt || new Date(),
            profileImage: userObject.profileImage || '/Vector.svg'
        };

        // Tambahkan field khusus untuk peternak
        if (userObject.role?.toLowerCase() === 'peternak') {
            userData.tempatLahir = userObject.tempatLahir || 'Tidak tersedia';
            userData.tanggalLahir = convertToISODate(userObject.tanggalLahir);
            userData.umur = userObject.umur || 0;
        }

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