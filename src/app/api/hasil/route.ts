import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/dbConnect";
import QuestionnaireResponse from "../../../models/Kuesioner";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import User from "../../../models/User"; // Import model User

export async function GET(req: NextRequest) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Cek role user
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const bulan = searchParams.get("bulan");
        const tahun = searchParams.get("tahun");

        // Query untuk mengambil data
        const query: any = {};

        // Jika bukan admin, hanya bisa melihat data sendiri
        if (user.role !== 'admin') {
            query.userId = session.user.id;
        }

        // Jika admin ingin filter by user tertentu
        if (userId && user.role === 'admin') {
            query.userId = userId;
        }

        if (bulan) query.bulan = Number(bulan);
        if (tahun) query.tahun = Number(tahun);

        const responses = await QuestionnaireResponse.find(query)
            .sort({ tahun: -1, bulan: -1 })
            .populate('userId', 'username') // Populate user data
            .lean();

        // Format data untuk frontend
        // Di bagian formattedData, pastikan nama user benar
        const formattedData = responses.map((item: any, index: number) => {
            // Pastikan nama user tidak null/undefined
            let userName = 'Unknown User';
            if (item.userId) {
                if (typeof item.userId === 'object') {
                    userName = item.userId.username || `User ${item.userId._id}`;
                } else {
                    userName = `User ${item.userId}`;
                }
            }

            return {
                _id: item._id,
                id: index + 1,
                nama: userName,
                bulan: item.bulan,
                tahun: item.tahun,
                bulanSingkat: getBulanSingkat(item.bulan),
                nilaiEvaluasi: calculateEvaluationScore(item.answers),
                questionnaireId: item.questionnaireId,
                userId: item.userId
            };
        });

        return NextResponse.json(formattedData, { status: 200 });
    } catch (err) {
        console.error("Error getting evaluation results:", err);
        return NextResponse.json(
            { error: "Gagal mengambil hasil evaluasi" },
            { status: 500 }
        );
    }
}

// Fungsi untuk menghitung nilai evaluasi dari answers (skala 1-100)
function calculateEvaluationScore(answers: any[]): number {
    if (!answers || answers.length === 0) return 0;

    const TOTAL_SOAL = 30;
    const SKALA_JAWABAN = 5; // 1-5

    let totalSkor = 0;
    let soalTerjawab = 0;

    answers.forEach(answer => {
        const numericValue = convertAnswerToNumber(answer.answer);
        if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 5) {
            totalSkor += numericValue;
            soalTerjawab++;
        }
    });

    // Jika tidak ada jawaban yang valid, return 0
    if (soalTerjawab === 0) return 0;

    // Hitung skor rata-rata (1-5)
    const skorRataRata = totalSkor / soalTerjawab;

    // Konversi ke skala 1-100
    // Rumus: ((skor_rata_rata - 1) / (5 - 1)) * 100
    const skala100 = ((skorRataRata - 1) / 4) * 100;

    // Bulatkan ke integer terdekat
    return Math.round(skala100);
}

// Helper function untuk konversi jawaban ke angka
function convertAnswerToNumber(answer: string): number {
    // Mapping jawaban teks ke angka
    const jawabanMapping: { [key: string]: number } = {
        'sangat tidak setuju': 1,
        'tidak setuju': 2,
        'netral': 3,
        'setuju': 4,
        'sangat setuju': 5,
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5
    };

    const answerLower = answer.toLowerCase().trim();

    // Jika jawaban ada di mapping, return nilai angka
    if (jawabanMapping[answerLower] !== undefined) {
        return jawabanMapping[answerLower];
    }

    // Jika berupa angka, return angka tersebut
    const numeric = parseFloat(answer);
    return isNaN(numeric) ? 0 : numeric;
}

function getBulanSingkat(bulanNumber: number): string {
    const bulanList = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return bulanList[bulanNumber - 1] || `${bulanNumber}`;
}