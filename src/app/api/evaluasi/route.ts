// app/api/evaluasi/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Evaluation from '../../../models/Evaluasi';

export async function GET() {
    try {
        await dbConnect();

        // Ambil semua data evaluasi
        const evaluations = await Evaluation.find({})
            .sort({ kelompok: 1, nilai: -1 })
            .exec();

        // Kelompokkan data berdasarkan kelompok
        const kelompokMap = new Map();

        evaluations.forEach((evaluation) => {
            const kelompok = evaluation.kelompok;
            if (!kelompokMap.has(kelompok)) {
                kelompokMap.set(kelompok, {
                    kelompok: kelompok,
                    anggota: []
                });
            }

            kelompokMap.get(kelompok).anggota.push({
                nama: evaluation.nama,
                nilai: `${evaluation.nilai}/${evaluation.totalSoal}`,
                score: evaluation.nilai,
                jawabanBenar: evaluation.jawabanBenar,
                totalSoal: evaluation.totalSoal,
                persentase: Math.round((evaluation.nilai / evaluation.totalSoal) * 100)
            });
        });

        // Konversi map ke array
        const evaluasiData = Array.from(kelompokMap.values());

        return NextResponse.json(evaluasiData);
    } catch (error) {
        console.error('Error fetching evaluation data:', error);
        return NextResponse.json(
            { error: 'Gagal mengambil data evaluasi' },
            { status: 500 }
        );
    }
}