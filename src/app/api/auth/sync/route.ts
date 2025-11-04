// app/api/auth/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/authOptions";
import connectDB from "../../../../lib/dbConnect";
import User from "../../../../models/User";

export async function GET(_req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        console.log("🔎 Session sync:", session);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // ✅ Ambil accessToken jika ada (cast supaya tidak error TypeScript)
        const accessToken = (session as any)?.accessToken;

        // ✅ Kembalikan data user lengkap untuk sync
        const userData = {
            _id: user._id.toString(),
            nama: user.nama,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber || '', // Tambahkan
            village: user.village || '', // Tambahkan
            district: user.district || '', // Tambahkan
            kelompok: user.kelompok,
            role: user.role,
            status: user.status,
            profileImage: user.profileImage,
            // Tambahkan field khusus peternak jika diperlukan
            ...(user.role?.toLowerCase() === 'peternak' && {
                tempatLahir: user.tempatLahir,
                tanggalLahir: user.tanggalLahir,
                umur: user.umur
            })
        };

        return NextResponse.json({
            userId: user._id.toString(),
            token: accessToken || "next-auth-sync-token",
            user: userData // Tambahkan data user lengkap
        });
    } catch (error: any) {
        console.error("❌ Error in auth sync:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}