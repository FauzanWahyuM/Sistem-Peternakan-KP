import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const uri: string = process.env.MONGODB_URI as string; // pastikan ada di .env.local
const client = new MongoClient(uri);
const bulanOptions = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

interface KuesionerDoc {
    _id: ObjectId;
    nama?: string;
    bulan?: string;
    tahun?: number;
    jawaban?: number[];
    questionnaireId?: string; // 👈 penting
}

interface HasilEvaluasi {
    _id: string;
    nama: string;
    bulan: string;
    tahun: number;
    nilaiEvaluasi: number;
}

export async function GET() {
    try {
        await client.connect();
        const db = client.db("simantek");
        const collection = db.collection<KuesionerDoc>("kuesioner");

        const docs = await collection.find({}).toArray();

        const hasil: HasilEvaluasi[] = docs.map((doc) => {
            let jawaban: number[] = [];

            if (Array.isArray(doc.jawaban)) {
                jawaban = doc.jawaban;
            } else if (Array.isArray((doc as any).answers)) {
                jawaban = (doc as any).answers.map((a: any) =>
                    parseInt(a.answer, 10) || 0
                );
            }

            const totalSkor = jawaban.reduce((a, b) => a + b, 0);
            const nilaiEvaluasi =
                jawaban.length > 0
                    ? Math.round((totalSkor / (jawaban.length * 5)) * 100)
                    : 0;

            let bulanLabel = "Tidak diketahui";

            if (doc.bulan) {
                const bulanIndex =
                    typeof doc.bulan === "string" ? parseInt(doc.bulan, 10) : doc.bulan;
                if (bulanIndex >= 1 && bulanIndex <= 12) {
                    bulanLabel = bulanOptions[bulanIndex - 1];
                }
            } else if (doc.questionnaireId) {
                bulanLabel = doc.questionnaireId; // fallback pakai field ini
            }

            return {
                _id: doc._id.toString(),
                nama: doc.nama ?? "Hasil Kuesioner",
                bulan: bulanLabel,
                tahun: doc.tahun ?? new Date().getFullYear(),
                nilaiEvaluasi,
            };
        });

        return NextResponse.json(hasil);
    } catch (err) {
        console.error("Error fetching data:", err);
        return NextResponse.json(
            { error: "Gagal mengambil data" },
            { status: 500 }
        );
    } finally {
        await client.close();
    }
}
