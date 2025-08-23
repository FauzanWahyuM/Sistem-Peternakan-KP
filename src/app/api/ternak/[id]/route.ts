import connectDB from "../../../../lib/dbConnect";
import Ternak from "../../../../models/Ternak";

// GET detail ternak by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
    await connectDB();
    try {
        const ternak = await Ternak.findById(params.id);
        if (!ternak) {
            return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), { status: 404 });
        }
        return new Response(JSON.stringify({ livestock: ternak }), { status: 200 });
    } catch (error) {
        console.error("Error GET ternak by id:", error);
        return new Response(JSON.stringify({ error: "Gagal ambil data" }), { status: 500 });
    }
}

// PUT update ternak by ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    await connectDB();
    try {
        const data = await req.json();
        const ternakUpdate = await Ternak.findByIdAndUpdate(params.id, data, { new: true });
        if (!ternakUpdate) {
            return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), { status: 404 });
        }
        return new Response(JSON.stringify({ livestock: ternakUpdate }), { status: 200 });
    } catch (error) {
        console.error("Error update ternak:", error);
        return new Response(JSON.stringify({ error: "Gagal update data" }), { status: 500 });
    }
}

// DELETE hapus ternak by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    await connectDB();
    try {
        const ternakHapus = await Ternak.findByIdAndDelete(params.id);
        if (!ternakHapus) {
            return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), { status: 404 });
        }
        return new Response(JSON.stringify({ message: "Data berhasil dihapus" }), { status: 200 });
    } catch (error) {
        console.error("Error hapus ternak:", error);
        return new Response(JSON.stringify({ error: "Gagal hapus data" }), { status: 500 });
    }
}
