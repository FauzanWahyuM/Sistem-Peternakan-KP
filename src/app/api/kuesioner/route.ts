import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/dbConnect";
import Kuesioner from "../../../models/Kuesioner";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import mongoose from "mongoose";

const periodMonths = {
    'jan-jun': [1, 2, 3, 4, 5, 6],
    'jul-des': [7, 8, 9, 10, 11, 12]
};

const periodNames = {
    'jan-jun': 'Januari-Juni',
    'jul-des': 'Juli-Desember'
};

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Anda harus login" }, { status: 401 });
        }

        const body = await req.json();
        let { questionnaireId, formData, period, year } = body;

        console.log("Received data:", { questionnaireId, period, year, formData });

        if (typeof questionnaireId === "string" && questionnaireId.length > 0) {
            questionnaireId = questionnaireId.charAt(0).toUpperCase() + questionnaireId.slice(1);
        }

        // Validasi periode
        if (!period || !periodMonths[period as keyof typeof periodMonths]) {
            return NextResponse.json(
                { error: "Periode tidak valid" },
                { status: 400 }
            );
        }

        const months = periodMonths[period as keyof typeof periodMonths];
        const periodName = periodNames[period as keyof typeof periodNames];

        // Untuk kompatibilitas, gunakan bulan pertama dari periode sebagai nilai bulan
        const firstMonthOfPeriod = months[0];
        const lastMonthOfPeriod = months[months.length - 1];

        // Convert userId string to ObjectId
        const userId = new mongoose.Types.ObjectId(session.user.id);

        // Cek apakah sudah ada response untuk periode dan tahun ini
        try {
            const existingResponse = await Kuesioner.findOne({
                questionnaireId,
                userId: userId,
                periode: period,
                tahun: Number(year)
            });

            if (existingResponse) {
                return NextResponse.json(
                    { error: "Anda sudah mengisi kuesioner untuk periode ini" },
                    { status: 400 }
                );
            }
        } catch (error) {
            console.log("Skip duplicate check due to error:", error);
            // Lanjutkan tanpa pengecekan duplikat jika ada error
        }

        const response = new Kuesioner({
            questionnaireId,
            userId: userId,
            periode: period,
            namaPeriode: periodName, // 👈 Simpan nama periode (Januari-Juni / Juli-Desember)
            bulan: firstMonthOfPeriod, // Tetap simpan bulan pertama untuk kompatibilitas
            bulanAwal: firstMonthOfPeriod, // 👈 Simpan bulan awal
            bulanAkhir: lastMonthOfPeriod, // 👈 Simpan bulan akhir  
            bulanRange: months, // 👈 Simpan semua bulan dalam periode
            tahun: Number(year),
            answers: Object.entries(formData).map(([questionId, answer]) => ({
                questionId,
                answer: String(answer),
            })),
        });

        await response.save();

        return NextResponse.json(
            { message: "Jawaban berhasil disimpan", response },
            { status: 201 }
        );
    } catch (err: any) {
        console.error("Error saving response:", err);
        return NextResponse.json(
            { error: "Gagal menyimpan jawaban", details: err.message },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);

        console.log("Session user ID:", session?.user?.id);
        console.log("Session user role:", (session?.user as any)?.role);
        console.log("Session user email:", session?.user?.email);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        let questionnaireId = searchParams.get("questionnaireId");
        const period = searchParams.get("period");
        const year = searchParams.get("year");
        const detail = searchParams.get("detail");
        const count = searchParams.get("count");

        if (questionnaireId) {
            questionnaireId = questionnaireId.charAt(0).toUpperCase() + questionnaireId.slice(1);
        }

        // Convert userId string to ObjectId
        const userId = new mongoose.Types.ObjectId(session.user.id);

        // === MODE COUNT (dashboard) ===
        if (count === "true") {
            const query: any = { userId: userId };
            if (questionnaireId) query.questionnaireId = questionnaireId;
            if (period) query.periode = period;
            if (year) query.tahun = Number(year);

            const total = await Kuesioner.countDocuments(query);
            return NextResponse.json({ total }, { status: 200 });
        }

        // === MODE DETAIL / STATUS ===
        if (!questionnaireId) {
            return NextResponse.json(
                { error: "questionnaireId wajib ada" },
                { status: 400 }
            );
        }

        const query: any = {
            questionnaireId,
            userId: userId
        };

        if (period) query.periode = period;
        if (year) query.tahun = Number(year);

        const response = await Kuesioner.findOne(query);

        if (detail === "true") {
            return NextResponse.json(response, { status: 200 });
        }

        return NextResponse.json({ status: !!response }, { status: 200 });
    } catch (err: any) {
        console.error("Error getting response:", err);
        return NextResponse.json(
            { error: "Gagal mengambil jawaban", details: err.message },
            { status: 500 }
        );
    }
}