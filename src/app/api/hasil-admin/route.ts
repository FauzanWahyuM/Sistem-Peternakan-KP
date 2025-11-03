// app/api/hasil/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/dbConnect";
import QuestionnaireResponse from "../../../models/Kuesioner";
import User from "../../../models/User";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const all = searchParams.get("all"); // PARAMETER UNTUK MENDAPATKAN SEMUA DATA

        console.log('API Hit dengan parameters:', { all });

        // Query untuk mengambil data
        const query: any = {};

        // Jika parameter all=true, ambil semua data tanpa filter user
        if (all === 'true') {
            // Tidak ada filter userId - ambil semua data
            console.log('Mengambil semua data tanpa filter user');
        } else {
            // Jika tidak ada parameter all, return error atau data kosong
            return NextResponse.json([], { status: 200 });
        }

        // Terapkan filter lainnya jika ada (opsional)
        const bulan = searchParams.get("bulan");
        const tahun = searchParams.get("tahun");
        const questionnaireId = searchParams.get("questionnaireId");

        if (bulan) query.bulan = Number(bulan);
        if (tahun) query.tahun = Number(tahun);
        if (questionnaireId) query.questionnaireId = questionnaireId;

        console.log('Final query:', query);

        // Temukan semua response yang sesuai
        const responses = await QuestionnaireResponse.find(query)
            .sort({ tahun: -1, bulan: -1, createdAt: -1 })
            .lean();

        console.log('Total responses found:', responses.length);

        // Jika tidak ada data, return array kosong
        if (responses.length === 0) {
            console.log('Tidak ada data yang ditemukan');
            return NextResponse.json([], { status: 200 });
        }

        // Dapatkan semua user IDs dari responses
        const userIds = responses.map(response => response.userId).filter(id => id);
        const uniqueUserIds = [...new Set(userIds)];

        console.log('Unique user IDs to fetch:', uniqueUserIds);

        // Temukan semua user data sekaligus
        const users = await User.find({
            _id: {
                $in: uniqueUserIds
                    .filter(id => mongoose.Types.ObjectId.isValid(id))
                    .map(id => new mongoose.Types.ObjectId(id))
            }
        }).select('username nama _id').lean();

        console.log('Users found:', users.length);

        // Buat mapping user by ID
        const userMap = new Map();
        users.forEach(user => {
            userMap.set(user._id.toString(), user);
        });

        // Format data untuk frontend
        const formattedData = responses.map((item: any, index: number) => {
            let userName = 'Unknown User';
            let userUsername = '';

            if (item.userId) {
                const userData = userMap.get(item.userId.toString());
                if (userData) {
                    userName = userData.nama || userData.username || `User ${item.userId}`;
                    userUsername = userData.username || '';
                } else {
                    userName = `User ${item.userId}`;
                    userUsername = '';
                }
            }

            // Hitung nilai evaluasi
            const nilaiEvaluasi = calculateEvaluationScore(item.answers);

            return {
                _id: item._id?.toString(),
                id: index + 1,
                nama: userName,
                username: userUsername,
                bulan: item.bulan,
                tahun: item.tahun,
                nilaiEvaluasi: nilaiEvaluasi,
                questionnaireId: item.questionnaireId,
                userId: item.userId,
                createdAt: item.createdAt
            };
        });

        console.log('Formatted data length:', formattedData.length);
        console.log('Sample formatted data:', formattedData.slice(0, 2));

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

    let totalSkor = 0;
    let soalTerjawab = 0;

    answers.forEach(answer => {
        if (answer && answer.answer) {
            const numericValue = convertAnswerToNumber(answer.answer);
            if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 5) {
                totalSkor += numericValue;
                soalTerjawab++;
            }
        }
    });

    if (soalTerjawab === 0) return 0;

    const skorRataRata = totalSkor / soalTerjawab;
    const skala100 = ((skorRataRata - 1) / 4) * 100;

    return Math.round(skala100);
}

// Helper function untuk konversi jawaban ke angka
function convertAnswerToNumber(answer: string | number): number {
    if (typeof answer === 'number') {
        return answer >= 1 && answer <= 5 ? answer : 0;
    }

    if (!answer) return 0;

    const jawabanMapping: { [key: string]: number } = {
        'sangat tidak setuju': 1,
        'tidak setuju': 2,
        'netral': 3,
        'setuju': 4,
        'sangat setuju': 5,
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    };

    const answerLower = answer.toString().toLowerCase().trim();

    if (jawabanMapping[answerLower] !== undefined) {
        return jawabanMapping[answerLower];
    }

    const numeric = parseFloat(answer.toString());
    return isNaN(numeric) ? 0 : numeric;
}