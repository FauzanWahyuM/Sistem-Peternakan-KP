// app/api/kuesioner/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/dbConnect";
import QuestionnaireResponse from "../../../models/Kuesioner";

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const body = await req.json();
        const { questionnaireId, userId, formData } = body;

        // ubah formData ke format array of {questionId, answer}
        const answers = Object.entries(formData).map(([questionId, answer]) => ({
            questionId,
            answer: String(answer),
        }));

        const response = new QuestionnaireResponse({
            questionnaireId,
            userId,
            answers,
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
        const questionnaireId = searchParams.get("questionnaireId");
        const userId = searchParams.get("userId");

        const response = await QuestionnaireResponse.findOne({
            questionnaireId,
            userId,
        });

        if (!response) {
            return NextResponse.json(null, { status: 200 }); // ⬅️ biar frontend tahu belum ada data
        }

        return NextResponse.json(response, { status: 200 });
    } catch (err) {
        console.error("Error getting response:", err);
        return NextResponse.json(
            { error: "Gagal mengambil jawaban" },
            { status: 500 }
        );
    }
}
