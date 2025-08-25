import { NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConnect";
import Artikel from "../../../../models/Article";

// GET by ID
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params; // ✅ bukan context
    await connectDB();
    const artikel = await Artikel.findById(id);
    return NextResponse.json(artikel);
}

// UPDATE by ID
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params; // ✅ bukan context
    await connectDB();
    const body = await req.json();
    const artikel = await Artikel.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(artikel);
}

// DELETE by ID
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params; // ✅ konsisten
    await connectDB();
    await Artikel.findByIdAndDelete(id);
    return NextResponse.json({ message: "Artikel berhasil dihapus" });
}
