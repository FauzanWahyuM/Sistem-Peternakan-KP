import connectDB from "../../../../lib/dbConnect";
import Ternak from "../../../../models/Ternak";

// GET: ambil data ternak by id
export async function GET(req, { params }) {
    await connectDB();
    try {
        const { id } = params; // ✅ ambil langsung dari params
        const ternak = await Ternak.findById(id);
        if (!ternak) {
            return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), { status: 404 });
        }
        return new Response(JSON.stringify(ternak), { status: 200 });
    } catch (error) {
        console.error("Error GET ternak:", error);
        return new Response(JSON.stringify({ error: "Gagal ambil data" }), { status: 500 });
    }
}

// PUT: update ternak by id
export async function PUT(req, { params }) {
    await connectDB();
    try {
        const { id } = params;
        const data = await req.json();

        const ternakUpdate = await Ternak.findByIdAndUpdate(id, data, { new: true });
        if (!ternakUpdate) {
            return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), { status: 404 });
        }
        return new Response(JSON.stringify(ternakUpdate), { status: 200 });
    } catch (error) {
        console.error("Error update ternak:", error);
        return new Response(JSON.stringify({ error: "Gagal update data" }), { status: 500 });
    }
}

// DELETE: hapus ternak by id
export async function DELETE(req, { params }) {
    await connectDB();
    try {
        const { id } = params;
        const ternakHapus = await Ternak.findByIdAndDelete(id);
        if (!ternakHapus) {
            return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), { status: 404 });
        }
        return new Response(JSON.stringify({ message: "Data berhasil dihapus" }), { status: 200 });
    } catch (error) {
        console.error("Error hapus ternak:", error);
        return new Response(JSON.stringify({ error: "Gagal hapus data" }), { status: 500 });
    }
}
