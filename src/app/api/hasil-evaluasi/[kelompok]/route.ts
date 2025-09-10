// app/api/hasil-evaluasi/[kelompok]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConnect";
import QuestionnaireResponse from "../../../../models/Kuesioner";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import User from "../../../../models/User";

interface KelompokEvaluasiDetail {
    kelompok: string;
    anggota: any[];
    totalNilai: number;
    jumlahAnggota: number;
    jumlahResponden: number;
    rataRata: number;
    persentaseResponden: number;
    status: string;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ kelompok: string }> }
) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const kelompokId = resolvedParams.kelompok;

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

        console.log(`Fetching data for kelompok: ${kelompokId}`);

        // Ambil user dengan role peternak dan kelompok tertentu
        // Handle khusus untuk "Belum Dikelompokkan"
        const userQuery: any = { role: 'peternak' };

        if (kelompokId === 'Belum Dikelompokkan') {
            userQuery.$or = [
                { kelompok: { $exists: false } },
                { kelompok: null },
                { kelompok: '' },
                { kelompok: 'Belum Dikelompokkan' }
            ];
        } else {
            userQuery.kelompok = kelompokId;
        }

        const allUsers = await User.find(userQuery)
            .select('username nama _id kelompok')
            .lean();

        console.log(`Total peternak users found for kelompok ${kelompokId}:`, allUsers.length);

        // 2. Ambil responses yang sesuai filter
        const responses = await QuestionnaireResponse.find(query)
            .sort({ tahun: -1, bulan: -1 })
            .lean();

        console.log("Total responses found:", responses.length);

        // 3. Buat mapping untuk responses by userId
        const responseMap = new Map();
        responses.forEach(response => {
            if (response.userId) {
                const userIdStr = response.userId.toString();
                // Hanya simpan response terbaru untuk setiap user
                if (!responseMap.has(userIdStr)) {
                    responseMap.set(userIdStr, response);
                }
            }
        });

        // 4. Siapkan data evaluasi untuk kelompok tertentu dengan tipe yang benar
        const kelompokData: KelompokEvaluasiDetail = {
            kelompok: kelompokId,
            anggota: [],
            totalNilai: 0,
            jumlahAnggota: 0,
            jumlahResponden: 0,
            rataRata: 0,
            persentaseResponden: 0,
            status: 'Belum Ada Responden'
        };

        allUsers.forEach((user, index) => {
            const userIdStr = user._id.toString();

            // Cek apakah user ini memiliki response
            const userResponse = responseMap.get(userIdStr);

            let nilaiEvaluasi = 0;
            let hasResponse = false;

            if (userResponse && userResponse.answers) {
                nilaiEvaluasi = calculateEvaluationScore(userResponse.answers);
                hasResponse = true;
                console.log(`User ${user.nama || user.username} has response with score: ${nilaiEvaluasi}`);
            }

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

            kelompokData.anggota.push(evaluationData);
            kelompokData.jumlahAnggota += 1;

            if (hasResponse) {
                kelompokData.totalNilai += nilaiEvaluasi;
                kelompokData.jumlahResponden += 1;
            }
        });

        // 5. Hitung rata-rata
        if (kelompokData.jumlahResponden > 0) {
            kelompokData.rataRata = Math.round(kelompokData.totalNilai / kelompokData.jumlahResponden);
        }

        // Hitung persentase responden
        kelompokData.persentaseResponden = kelompokData.jumlahAnggota > 0
            ? Math.round((kelompokData.jumlahResponden / kelompokData.jumlahAnggota) * 100)
            : 0;

        // Status kelompok berdasarkan responden
        if (kelompokData.jumlahResponden === 0) {
            kelompokData.status = 'Belum Ada Responden';
        } else if (kelompokData.jumlahResponden === kelompokData.jumlahAnggota) {
            kelompokData.status = 'Semua Sudah Mengisi';
        } else {
            kelompokData.status = 'Sebagian Sudah Mengisi';
        }

        // Urutkan anggota
        kelompokData.anggota.sort((a: any, b: any) => {
            if (a.hasResponse && !b.hasResponse) return -1;
            if (!a.hasResponse && b.hasResponse) return 1;
            if (a.hasResponse && b.hasResponse && a.nilaiEvaluasi !== b.nilaiEvaluasi) {
                return b.nilaiEvaluasi - a.nilaiEvaluasi;
            }
            return a.nama.localeCompare(b.nama);
        });

        console.log("Final data prepared for kelompok:", kelompokId, "with", kelompokData.jumlahAnggota, "members and", kelompokData.jumlahResponden, "respondents");
        return NextResponse.json(kelompokData, { status: 200 });

    } catch (err) {
        console.error("Error getting evaluation results:", err);
        return NextResponse.json(
            { error: "Gagal mengambil hasil evaluasi" },
            { status: 500 }
        );
    }
}

// Fungsi untuk menghitung nilai evaluasi
function calculateEvaluationScore(answers: any[]): number {
    if (!answers || answers.length === 0) return 0;

    let totalSkor = 0;
    let soalTerjawab = 0;

    answers.forEach((answer) => {
        const numericValue = convertAnswerToNumber(answer.answer || answer.value || answer);
        if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 5) {
            totalSkor += numericValue;
            soalTerjawab++;
        }
    });

    if (soalTerjawab === 0) return 0;

    const skorRataRata = totalSkor / soalTerjawab;
    const skala100 = ((skorRataRata - 1) / 4) * 100;
    return Math.round(skala100);
}

// Helper function untuk konversi jawaban ke angka
function convertAnswerToNumber(answer: any): number {
    if (answer === null || answer === undefined) return 0;

    if (typeof answer === 'number') return answer;

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

        const numeric = parseFloat(answerLower);
        if (!isNaN(numeric)) return numeric;
    }

    return 0;
}

function getBulanSingkat(bulanNumber: number): string {
    const bulanList = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return bulanList[bulanNumber - 1] || `${bulanNumber}`;
}