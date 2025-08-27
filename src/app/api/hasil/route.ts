import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/dbConnect";
import QuestionnaireResponse from "../../../models/Kuesioner";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import User from "../../../models/User";
import mongoose from "mongoose";

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
        const questionnaireId = searchParams.get("questionnaireId");

        // Query untuk mengambil data
        const query: any = {};

        // Jika bukan admin, hanya bisa melihat data sendiri
        if (user.role !== 'admin') {
            query.userId = session.user.id;
        }

        // Jika admin ingin filter by user tertentu
        if (userId && user.role === 'admin') {
            // Cari user berdasarkan username atau ID
            const userFilter = await User.findOne({
                $or: [
                    { username: userId },
                    { _id: mongoose.Types.ObjectId.isValid(userId) ? userId : null }
                ]
            });
            if (userFilter) {
                query.userId = userFilter._id;
            } else {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }
        }

        if (bulan) query.bulan = Number(bulan);
        if (tahun) query.tahun = Number(tahun);
        if (questionnaireId) query.questionnaireId = questionnaireId;

        // Temukan semua response yang sesuai
        const responses = await QuestionnaireResponse.find(query)
            .sort({ tahun: -1, bulan: -1 })
            .lean();

        // Dapatkan semua user IDs dari responses
        const userIds = responses.map(response => response.userId).filter(id => id);

        // Temukan semua user data sekaligus
        const users = await User.find({
            $or: [
                { _id: { $in: userIds.filter(id => mongoose.Types.ObjectId.isValid(id)) } },
                { username: { $in: userIds.filter(id => !mongoose.Types.ObjectId.isValid(id) && typeof id === 'string') } }
            ]
        }).select('username nama _id').lean();

        // Buat mapping user by ID dan username
        const userMap = new Map();
        users.forEach(user => {
            // Mapping by ObjectId string
            userMap.set(user._id.toString(), user);
            // Mapping by username
            userMap.set(user.username, user);
        });

        // Format data untuk frontend
        const formattedData = responses.map((item: any, index: number) => {
            let userName = 'Unknown User';
            let userData = null;

            if (item.userId) {
                // Coba cari user berdasarkan berbagai format
                if (mongoose.Types.ObjectId.isValid(item.userId)) {
                    // Jika userId adalah ObjectId yang valid
                    userData = userMap.get(item.userId.toString());
                } else if (typeof item.userId === 'string') {
                    // Jika userId adalah string (mungkin username)
                    userData = userMap.get(item.userId);
                }

                if (userData) {
                    userName = userData.nama || userData.username || `User ${item.userId}`;
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