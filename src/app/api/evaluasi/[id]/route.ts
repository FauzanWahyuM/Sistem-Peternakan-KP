// app/api/evaluasi/[kelompok]/[userId]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Evaluation from '../../../../models/Evaluasi';

interface Params {
    params: {
        kelompok: string;
        userId: string;
    };
}

export async function GET(request: Request, { params }: Params) {
    try {
        await dbConnect();

        const { kelompok, userId } = params;

        // Ambil detail evaluasi untuk user tertentu
        const evaluation = await Evaluation.findOne({
            kelompok: kelompok,
            userId: userId
        }).exec();

        if (!evaluation) {
            return NextResponse.json(
                { error: 'Data evaluasi tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            nama: evaluation.nama,
            kelompok: evaluation.kelompok,
            nilai: evaluation.nilai,
            totalSoal: evaluation.totalSoal,
            jawabanBenar: evaluation.jawabanBenar,
            persentase: Math.round((evaluation.nilai / evaluation.totalSoal) * 100),
            createdAt: evaluation.createdAt,
            detailJawaban: [] // Anda bisa menambahkan field detail jawaban jika ada
        });
    } catch (error) {
        console.error('Error fetching evaluation detail:', error);
        return NextResponse.json(
            { error: 'Gagal mengambil detail evaluasi' },
            { status: 500 }
        );
    }
}