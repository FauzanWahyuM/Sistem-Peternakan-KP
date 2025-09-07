// app/api/evaluasi/[kelompok]/[userId]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Evaluation from '../../../../models/Evaluasi';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const { id } = params;

        // Ambil detail evaluasi untuk user tertentu
        const evaluation = await Evaluation.findById(id).exec();

        if (!evaluation) {
            return NextResponse.json(
                { error: 'Data evaluasi tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            _id: evaluation._id,
            nama: evaluation.nama,
            kelompok: evaluation.kelompok,
            nilai: evaluation.nilai,
            totalSoal: evaluation.totalSoal,
            jawabanBenar: evaluation.jawabanBenar,
            persentase: Math.round((evaluation.nilai / evaluation.totalSoal) * 100),
            createdAt: evaluation.createdAt,
            updatedAt: evaluation.updatedAt
        });
    } catch (error) {
        console.error('Error fetching evaluation detail:', error);
        return NextResponse.json(
            { error: 'Gagal mengambil detail evaluasi' },
            { status: 500 }
        );
    }
}