import connectDB from "../../../../lib/dbConnect";
import Ternak from "../../../../models/Ternak";

// GET: ambil data ternak
export async function GET(req) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const stats = searchParams.get("stats");
        const id = searchParams.get("id");

        if (stats === "true") {
            // Hitung jumlah ternak per jenis
            const statistics = await Ternak.aggregate([
                {
                    $group: {
                        _id: "$jenisHewan",
                        total: { $sum: 1 }
                    }
                }
            ]);
            return new Response(JSON.stringify(statistics), { status: 200 });
        }

        if (id) {
            // Ambil detail ternak by id
            const ternak = await Ternak.findById(id);
            if (!ternak) {
                return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), { status: 404 });
            }
            return new Response(JSON.stringify(ternak), { status: 200 });
        }

        // Default: ambil semua data ternak
        const ternak = await Ternak.find();
        return new Response(JSON.stringify(ternak), { status: 200 });

    } catch (error) {
        console.error("Error GET ternak:", error);
        return new Response(JSON.stringify({ error: "Gagal ambil data" }), { status: 500 });
    }
}

// POST: tambah ternak
export async function POST(req) {
    await connectDB();
    try {
        const body = await req.json();
        const { jenisHewan, jenisKelamin, umurTernak, statusTernak, kondisiKesehatan } = body;

        const ternakBaru = await Ternak.create({
            jenisHewan,
            jenisKelamin,
            umurTernak,
            statusTernak,
            kondisiKesehatan,
        });

        return new Response(JSON.stringify(ternakBaru), { status: 201 });
    } catch (error) {
        console.error("Error tambah ternak:", error);
        return new Response(JSON.stringify({ error: "Gagal tambah data", detail: error.message }), { status: 500 });
    }
}

// PUT: update ternak
export async function PUT(req) {
    await connectDB();
    try {
        const { id, ...data } = await req.json();
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

// DELETE: hapus ternak
export async function DELETE(req) {
    await connectDB();
    try {
        const { id } = await req.json();
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