// app/api/hasil-evaluasi/route.ts
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
        const currentUser = await User.findById(session.user.id);
        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const bulan = searchParams.get("bulan");
        const tahun = searchParams.get("tahun");
        const questionnaireId = searchParams.get("questionnaireId");

        // Query untuk mengambil data responses
        const query: any = {};
        if (bulan) query.bulan = Number(bulan);
        if (tahun) query.tahun = Number(tahun);
        if (questionnaireId) query.questionnaireId = questionnaireId;

        // Cek role user yang mengakses
        if (currentUser.role !== 'penyuluh' && currentUser.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Ambil user dengan role peternak saja
        const allUsers = await User.find({ role: 'peternak' })
            .select('username nama _id kelompok')
            .lean();

        console.log("Total peternak users found:", allUsers.length);

        // 2. Ambil responses yang sesuai filter
        const responses = await QuestionnaireResponse.find(query)
            .sort({ tahun: -1, bulan: -1 })
            .lean();

        console.log("Total responses found:", responses.length);

        // 3. Buat mapping untuk responses by userId
        const responseMap = new Map();
        responses.forEach(response => {
            if (response.userId) {
                // Handle both ObjectId and string userId
                const userIdStr = response.userId.toString();
                responseMap.set(userIdStr, response);

                // Debug: log response data
                console.log("Response for user:", userIdStr, "Answers:", response.answers ? response.answers.length : 0);
                if (response.answers && response.answers.length > 0) {
                    console.log("Sample answer:", response.answers[0]);
                }
            }
        });

        // 4. Kelompokkan data berdasarkan kelompok dari semua user
        const kelompokMap = new Map();

        allUsers.forEach((user, index) => {
            const userKelompok = user.kelompok || 'Belum Dikelompokkan';
            const userIdStr = user._id.toString();

            // Cek apakah user ini memiliki response
            const userResponse = responseMap.get(userIdStr);

            let nilaiEvaluasi = 0;
            let hasResponse = false;

            if (userResponse && userResponse.answers) {
                nilaiEvaluasi = calculateEvaluationScore(userResponse.answers);
                hasResponse = true;
                console.log(`User ${user.nama} has response with score: ${nilaiEvaluasi}`);
            }

            // Prioritaskan nama, jika tidak ada baru pakai username
            const userDisplayName = user.nama || user.username || `User ${userIdStr}`;

            const evaluationData = {
                _id: userResponse?._id || userIdStr,
                id: index + 1,
                nama: userDisplayName,
                bulan: userResponse?.bulan || null,
                tahun: userResponse?.tahun || null,
                bulanSingkat: userResponse?.bulan ? getBulanSingkat(userResponse.bulan) : '-',
                nilaiEvaluasi: nilaiEvaluasi,
                questionnaireId: userResponse?.questionnaireId || null,
                userId: userIdStr,
                hasResponse: hasResponse,
                status: hasResponse ? 'Sudah Mengisi' : 'Belum Mengisi'
            };

            // Kelompokkan berdasarkan kelompok user
            if (!kelompokMap.has(userKelompok)) {
                kelompokMap.set(userKelompok, {
                    kelompok: userKelompok,
                    anggota: [],
                    totalNilai: 0,
                    jumlahAnggota: 0,
                    jumlahResponden: 0,
                    rataRata: 0
                });
            }

            const kelompok = kelompokMap.get(userKelompok);
            kelompok.anggota.push(evaluationData);
            kelompok.jumlahAnggota += 1;

            // Hanya tambahkan nilai jika punya response
            if (hasResponse) {
                kelompok.totalNilai += nilaiEvaluasi;
                kelompok.jumlahResponden += 1;
            }
        });

        // 5. Hitung rata-rata untuk setiap kelompok
        kelompokMap.forEach(kelompok => {
            console.log(`Kelompok ${kelompok.kelompok}: totalNilai=${kelompok.totalNilai}, jumlahResponden=${kelompok.jumlahResponden}`);

            if (kelompok.jumlahResponden > 0) {
                kelompok.rataRata = Math.round(kelompok.totalNilai / kelompok.jumlahResponden);
            } else {
                kelompok.rataRata = 0;
            }

            // Hitung persentase responden
            kelompok.persentaseResponden = kelompok.jumlahAnggota > 0
                ? Math.round((kelompok.jumlahResponden / kelompok.jumlahAnggota) * 100)
                : 0;

            // Status kelompok berdasarkan responden
            if (kelompok.jumlahResponden === 0) {
                kelompok.status = 'Belum Ada Responden';
            } else if (kelompok.jumlahResponden === kelompok.jumlahAnggota) {
                kelompok.status = 'Semua Sudah Mengisi';
            } else {
                kelompok.status = 'Sebagian Sudah Mengisi';
            }
        });

        // 6. Konversi map ke array dan urutkan
        const evaluasiData = Array.from(kelompokMap.values())
            .sort((a, b) => {
                if (a.kelompok === 'Belum Dikelompokkan') return 1;
                if (b.kelompok === 'Belum Dikelompokkan') return -1;
                return a.kelompok.localeCompare(b.kelompok);
            });

        // 7. Untuk setiap kelompok, urutkan anggota
        evaluasiData.forEach(kelompok => {
            kelompok.anggota.sort((a: any, b: any) => {
                // Urutkan: sudah mengisi di atas, belum mengisi di bawah
                if (a.hasResponse && !b.hasResponse) return -1;
                if (!a.hasResponse && b.hasResponse) return 1;
                // Jika sama-sama sudah mengisi, urutkan berdasarkan nilai
                if (a.hasResponse && b.hasResponse && a.nilaiEvaluasi !== b.nilaiEvaluasi) {
                    return b.nilaiEvaluasi - a.nilaiEvaluasi;
                }
                // Jika sama atau belum mengisi, urutkan berdasarkan nama
                return a.nama.localeCompare(b.nama);
            });
        });

        console.log("Final data prepared with", evaluasiData.length, "kelompok");
        return NextResponse.json(evaluasiData, { status: 200 });

    } catch (err) {
        console.error("Error getting evaluation results:", err);
        return NextResponse.json(
            { error: "Gagal mengambil hasil evaluasi" },
            { status: 500 }
        );
    }
}

// Fungsi untuk menghitung nilai evaluasi dengan debugging
function calculateEvaluationScore(answers: any[]): number {
    if (!answers || answers.length === 0) {
        console.log("No answers provided");
        return 0;
    }

    console.log(`Calculating score for ${answers.length} answers`);

    let totalSkor = 0;
    let soalTerjawab = 0;

    answers.forEach((answer, index) => {
        if (!answer) {
            console.log(`Answer ${index} is null or undefined`);
            return;
        }

        const numericValue = convertAnswerToNumber(answer.answer || answer.value || answer);
        console.log(`Answer ${index}: ${answer.answer || answer.value || answer} -> ${numericValue}`);

        if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 5) {
            totalSkor += numericValue;
            soalTerjawab++;
        } else {
            console.log(`Invalid answer value at index ${index}:`, answer);
        }
    });

    console.log(`Total skor: ${totalSkor}, Soal terjawab: ${soalTerjawab}`);

    if (soalTerjawab === 0) {
        console.log("No valid answers found");
        return 0;
    }

    const skorRataRata = totalSkor / soalTerjawab;
    const skala100 = ((skorRataRata - 1) / 4) * 100;
    const roundedScore = Math.round(skala100);

    console.log(`Final score: ${roundedScore} (from average: ${skorRataRata})`);
    return roundedScore;
}

// Helper function untuk konversi jawaban ke angka dengan lebih banyak opsi
function convertAnswerToNumber(answer: any): number {
    if (answer === null || answer === undefined) {
        return 0;
    }

    // Jika sudah angka, langsung return
    if (typeof answer === 'number') {
        return answer;
    }

    // Jika string, coba konversi
    if (typeof answer === 'string') {
        const answerLower = answer.toLowerCase().trim();

        const jawabanMapping: { [key: string]: number } = {
            'sangat tidak setuju': 1, 'tidak setuju': 2, 'netral': 3,
            'setuju': 4, 'sangat setuju': 5,
            'sts': 1, 'ts': 2, 'n': 3, 's': 4, 'ss': 5,
            '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
        };

        if (jawabanMapping[answerLower] !== undefined) {
            return jawabanMapping[answerLower];
        }

        // Coba parse sebagai angka
        const numeric = parseFloat(answerLower);
        if (!isNaN(numeric)) {
            return numeric;
        }
    }

    console.log(`Cannot convert answer to number:`, answer);
    return 0;
}

function getBulanSingkat(bulanNumber: number): string {
    const bulanList = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return bulanList[bulanNumber - 1] || `${bulanNumber}`;
}