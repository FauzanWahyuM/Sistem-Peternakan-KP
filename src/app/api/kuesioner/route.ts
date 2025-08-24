// app/api/kuesioner/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/dbConnect";
import QuestionnaireResponse from "../../../models/Kuesioner";

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const body = await req.json();
        let { questionnaireId, userId, formData, month, year } = body;

        if (typeof questionnaireId === "string" && questionnaireId.length > 0) {
            questionnaireId =
                questionnaireId.charAt(0).toUpperCase() + questionnaireId.slice(1);
        }

        const response = new QuestionnaireResponse({
            questionnaireId,
            userId,
            bulan: month, // pastikan field sama dengan model
            tahun: year,
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
    } catch (err) {
        console.error("Error saving response:", err);
        return NextResponse.json(
            { error: "Gagal menyimpan jawaban" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        let questionnaireId = searchParams.get("questionnaireId");
        const userId = searchParams.get("userId");
        const month = searchParams.get("month");
        const year = searchParams.get("year");
        const detail = searchParams.get("detail"); // 👈 cek mode

        if (questionnaireId) {
            questionnaireId =
                questionnaireId.charAt(0).toUpperCase() + questionnaireId.slice(1);
        }

        if (!questionnaireId || !userId) {
            return NextResponse.json(
                { error: "questionnaireId dan userId wajib ada" },
                { status: 400 }
            );
        }

        const query: any = { questionnaireId, userId };
        if (month) query.bulan = Number(month);
        if (year) query.tahun = Number(year);

        const response = await QuestionnaireResponse.findOne(query);

        // 🔹 kalau detail=true → balikin semua data termasuk answers
        if (detail === "true") {
            return NextResponse.json(response, { status: 200 });
        }

        // 🔹 default → hanya balikin status
        return NextResponse.json({ status: !!response }, { status: 200 });
    } catch (err) {
        console.error("Error getting response:", err);
        return NextResponse.json(
            { error: "Gagal mengambil jawaban" },
            { status: 500 }
        );
    }
}
