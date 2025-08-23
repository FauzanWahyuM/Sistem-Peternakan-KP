import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConnect";
import User from "../../../../models/User";

// ✅ GET user by ID
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params; // ⬅️ harus pakai await

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ✅ PUT update user
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params; // ⬅️ harus pakai await
        const body = await req.json();

        const updatedUser = await User.findByIdAndUpdate(id, body, { new: true });
        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user: updatedUser });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to update user" },
            { status: 500 }
        );
    }
}

// ✅ DELETE hapus user
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params; // ⬅️ harus pakai await

        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to delete user" },
            { status: 500 }
        );
    }
}
