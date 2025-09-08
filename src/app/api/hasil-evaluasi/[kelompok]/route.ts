// app/api/hasil-evaluasi/[kelompok]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConnect";
import QuestionnaireResponse from "../../../../models/Kuesioner";
import User from "../../../../models/User";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ kelompok: string }> }
) {
    await connectDB();

    try {
        const { kelompok } = await params;

        // Decode URL parameter
        const decodedKelompok = decodeURIComponent(kelompok);

        // Ambil semua user dari kelompok tertentu
        const users = await User.find({
            kelompok: decodedKelompok === 'Belum Dikelompokkan' ? '' : decodedKelompok
        }).select('username nama _id kelompok').lean();

        // Ambil semua responses
        const responses = await QuestionnaireResponse.find({})
            .sort({ tahun: -1, bulan: -1 })
            .lean();

        // Buat mapping untuk responses by userId
        const responseMap = new Map();
        responses.forEach(response => {
            if (response.userId) {
                const userIdStr = response.userId.toString();
                responseMap.set(userIdStr, response);
            }
        });

        // Process data
        const anggotaData = users.map(user => {
            const userIdStr = user._id.toString();
            const userResponse = responseMap.get(userIdStr);

            let nilaiEvaluasi = 0;
            let hasResponse = false;

            if (userResponse && userResponse.answers) {
                nilaiEvaluasi = calculateEvaluationScore(userResponse.answers);
                hasResponse = true;
            }

            return {
                _id: userResponse?._id || userIdStr,
                nama: user.nama || user.username || `User ${userIdStr}`,
                nilaiEvaluasi,
                hasResponse,
                status: hasResponse ? 'Sudah Mengisi' : 'Belum Mengisi',
                bulan: userResponse?.bulan || null,
                tahun: userResponse?.tahun || null,
                bulanSingkat: userResponse?.bulan ? getBulanSingkat(userResponse.bulan) : '-',
                questionnaireId: userResponse?.questionnaireId || null,
                userId: userIdStr
            };
        });

        // Hitung statistik kelompok
        const jumlahAnggota = users.length;
        const jumlahResponden = anggotaData.filter(a => a.hasResponse).length;
        const totalNilai = anggotaData.filter(a => a.hasResponse).reduce((sum, a) => sum + a.nilaiEvaluasi, 0);
        const rataRata = jumlahResponden > 0 ? Math.round(totalNilai / jumlahResponden) : 0;
        const persentaseResponden = jumlahAnggota > 0 ? Math.round((jumlahResponden / jumlahAnggota) * 100) : 0;

        let status = 'Belum Ada Responden';
        if (jumlahResponden === jumlahAnggota) {
            status = 'Semua Sudah Mengisi';
        } else if (jumlahResponden > 0) {
            status = 'Sebagian Sudah Mengisi';
        }

        const responseData = {
            kelompok: decodedKelompok,
            anggota: anggotaData,
            totalNilai,
            jumlahAnggota,
            jumlahResponden,
            rataRata,
            persentaseResponden,
            status
        };

        return NextResponse.json(responseData, { status: 200 });

    } catch (err) {
        console.error("Error getting evaluation results:", err);
        return NextResponse.json(
            { error: "Gagal mengambil hasil evaluasi" },
            { status: 500 }
        );
    }
}

// Helper function untuk konversi jawaban ke angka
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

// Fungsi untuk menghitung nilai evaluasi
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

function getBulanSingkat(bulanNumber: number): string {
    const bulanList = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return bulanList[bulanNumber - 1] || `${bulanNumber}`;
}