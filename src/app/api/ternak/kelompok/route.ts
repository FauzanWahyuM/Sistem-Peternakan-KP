import connectDB from "../../../../lib/dbConnect";

// Endpoint untuk mendapatkan daftar kelompok user
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        // TODO: Implementasi sebenarnya untuk mendapatkan daftar kelompok user
        // Ini contoh data dummy
        const kelompokData = [
            { id: '1', nama: 'Kelompok Tani Maju Jaya' },
            { id: '2', nama: 'Kelompok Tani Sejahtera' },
            { id: '3', nama: 'Kelompok Tani Makmur' }
        ];

        return new Response(JSON.stringify(kelompokData), { status: 200 });
    } catch (error) {
        console.error("Error GET kelompok:", error);
        return new Response(JSON.stringify({ error: "Gagal ambil data kelompok" }), { status: 500 });
    }
}