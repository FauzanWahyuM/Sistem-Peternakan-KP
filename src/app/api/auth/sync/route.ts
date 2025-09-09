// app/api/auth/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/authOptions";
import connectDB from "../../../../lib/dbConnect";
import User from "../../../../models/User";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        await connectDB();

        // Cari user berdasarkan email dari session
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            userId: user._id.toString(),
            user: {
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
            }
        });
    } catch (error: any) {
        console.error("Error in auth sync:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}