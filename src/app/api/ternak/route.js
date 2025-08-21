import connectDB from "../../../lib/dbConnect"; 
import Ternak from "../../../models/Ternak";

// Get semua data ternak
export async function GET(req) {
    await connectDB();
    try {
        const ternak = await Ternak.find();
        return new Response(JSON.stringify(ternak), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

// Tambah data ternak
export async function POST(req) {
    await connectDB();
    try {
        const body = await req.json();
        const newTernak = await Ternak.create(body);
        return new Response(JSON.stringify(newTernak), { status: 201 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

// Edit data ternak
export async function PUT(req) {
    await connectDB();
    try {
        const { id, ...data } = await req.json();
        const updated = await Ternak.findByIdAndUpdate(id, data, { new: true });
        return new Response(JSON.stringify(updated), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

// Hapus data ternak
export async function DELETE(req) {
    await connectDB();
    try {
        const { id } = await req.json();
        await Ternak.findByIdAndDelete(id);
        return new Response(JSON.stringify({ message: "Data terhapus" }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
