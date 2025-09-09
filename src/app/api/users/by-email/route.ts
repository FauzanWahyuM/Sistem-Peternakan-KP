import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConnect";
import User from "../../../../models/User";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
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
        console.error("Error in POST /api/user/by-email:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}