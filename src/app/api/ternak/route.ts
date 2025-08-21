import connectDB from "../../../lib/dbConnect"; 
import Ternak from "../../../models/Ternak";

// GET semua data ternak
export async function GET(req) {
    await connectDB();
    try {
        const ternak = await Ternak.find();
        return new Response(JSON.stringify(ternak), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Gagal ambil data" }), { status: 500 });
    }
}

// POST tambah ternak
export async function POST(req: Request) {
    await connectDB();
    try {
        const body = await req.json();
        const ternakBaru = await Ternak.create<typeof body>(body); // ✅ kasih generic
        return new Response(JSON.stringify(ternakBaru), { status: 201 });
    } catch (error) {
        console.error("Error tambah ternak:", error);
        return new Response(JSON.stringify({ error: "Gagal tambah data" }), { status: 500 });
    }
}