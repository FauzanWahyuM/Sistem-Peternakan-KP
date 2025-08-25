import { NextResponse } from "next/server";
import connectDB from "../../../lib/dbConnect";
import Artikel from "../../../models/Article";

// GET semua artikel
export async function GET() {
    await connectDB();
    const artikels = await Artikel.find().sort({ createdAt: -1 });
    return NextResponse.json(artikels);
}

// POST artikel baru
export async function POST(req: Request) {
    await connectDB();
    const body = await req.json();
    const artikel = await Artikel.create(body);
    return NextResponse.json(artikel, { status: 201 });
}
