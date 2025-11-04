// app/api/hasil-evaluasi/[kelompok]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConnect";
import QuestionnaireResponse from "../../../../models/Kuesioner";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import Kelompok from "../../../../models/Kelompok";
import User from "../../../../models/User";

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

        // Tunggu params selesai di-resolve
        const resolvedParams = await params;
        const kelompokId = resolvedParams.kelompok;

        const { searchParams } = new URL(req.url);
        const periode = searchParams.get("periode");
        const tahun = searchParams.get("tahun");

        // Default tahun
        const currentDate = new Date();
        const finalTahun = tahun ? Number(tahun) : currentDate.getFullYear();

        console.log('🔍 Fetching detail evaluation data for:', { kelompokId, periode, tahun: finalTahun });

        let namaKelompok = "Belum Dikelompokkan";
        let statusKelompok = "aktif";
        let anggotaKelompok: any[] = [];

        if (kelompokId !== "Belum Dikelompokkan") {
            const kelompokDataFromDB = await Kelompok.findOne({ kelompokid: kelompokId })
                .select("kelompokid nama status")
                .lean();

            if (!kelompokDataFromDB) {
                return NextResponse.json({ error: "Kelompok tidak ditemukan" }, { status: 404 });
            }

            namaKelompok = kelompokDataFromDB.nama;
            statusKelompok = kelompokDataFromDB.status;

            anggotaKelompok = await User.find({
                role: "peternak",
                kelompok: kelompokId,
            }).select("username nama _id role kelompok").lean();
        } else {
            anggotaKelompok = await User.find({
                role: "peternak",
                $or: [
                    { kelompok: { $exists: false } },
                    { kelompok: null },
                    { kelompok: "" },
                ],
            }).select("username nama _id role kelompok").lean();

            namaKelompok = "Belum Dikelompokkan";
            statusKelompok = "aktif";
        }

        console.log(`📊 Found ${anggotaKelompok.length} anggota in kelompok ${kelompokId}`);

        // Build query untuk responses
        const query: any = {};
        if (periode) query.periode = periode;
        if (tahun) query.tahun = finalTahun;

        console.log('📋 Query for responses:', query);

        // Ambil responses berdasarkan filter
        const responses = await QuestionnaireResponse.find(query)
            .populate("userId", "nama username kelompok")
            .sort({ tahun: -1, createdAt: -1 })
            .lean();

        console.log(`📝 Found ${responses.length} questionnaire responses`);

        const responseMap = new Map();
        responses.forEach((response) => {
            if (response.userId && (response.userId as any)._id) {
                const userIdStr = (response.userId as any)._id.toString();
                responseMap.set(userIdStr, {
                    ...response,
                    userId: response.userId,
                    periode: response.periode,
                    tahun: response.tahun
                });
            }
        });

        // Hitung evaluasi
        let totalNilai = 0;
        let jumlahResponden = 0;

        const anggotaDenganEvaluasi = anggotaKelompok.map((user: any, index: number) => {
            const userIdStr = user._id.toString();
            const userResponse = responseMap.get(userIdStr);

            let nilaiEvaluasi = 0;
            let hasResponse = false;

            if (userResponse && userResponse.answers) {
                nilaiEvaluasi = calculateEvaluationScore(userResponse.answers);
                hasResponse = true;
                totalNilai += nilaiEvaluasi;
                jumlahResponden++;
            }

            return {
                _id: userResponse?._id || userIdStr,
                id: index + 1,
                nama: user.nama || user.username || `User ${userIdStr}`,
                periode: userResponse?.periode || null,
                tahun: userResponse?.tahun || null,
                nilaiEvaluasi,
                questionnaireId: userResponse?.questionnaireId || null,
                userId: userIdStr,
                hasResponse,
                status: hasResponse ? "Sudah Mengisi" : "Belum Mengisi",
                userData: {
                    username: user.username,
                    nama: user.nama,
                    role: user.role,
                    kelompok: user.kelompok,
                },
            };
        });

        const jumlahAnggota = anggotaKelompok.length;
        const rataRata = jumlahResponden > 0 ? Math.round(totalNilai / jumlahResponden) : 0;
        const persentaseResponden = jumlahAnggota > 0
            ? Math.round((jumlahResponden / jumlahAnggota) * 100)
            : 0;

        let statusEvaluasi = "Belum Ada Data";
        if (jumlahResponden === 0) statusEvaluasi = "Belum Ada Responden";
        else if (jumlahResponden === jumlahAnggota) statusEvaluasi = "Semua Sudah Mengisi";
        else statusEvaluasi = "Sebagian Sudah Mengisi";

        // Urutkan anggota: yang sudah mengisi di atas, diurutkan berdasarkan nilai
        anggotaDenganEvaluasi.sort((a: any, b: any) => {
            if (a.hasResponse && !b.hasResponse) return -1;
            if (!a.hasResponse && b.hasResponse) return 1;
            if (a.hasResponse && b.hasResponse && a.nilaiEvaluasi !== b.nilaiEvaluasi) {
                return b.nilaiEvaluasi - a.nilaiEvaluasi;
            }
            return a.nama.localeCompare(b.nama);
        });

        const result = {
            kelompok: kelompokId,
            namaKelompok,
            statusKelompok,
            anggota: anggotaDenganEvaluasi,
            totalNilai,
            jumlahAnggota,
            jumlahResponden,
            rataRata,
            persentaseResponden,
            statusEvaluasi,
        };

        console.log(`✅ Successfully processed detail data for kelompok ${kelompokId}`);
        return NextResponse.json(result, { status: 200 });

    } catch (err) {
        console.error("❌ Error getting evaluation results:", err);
        return NextResponse.json(
            { error: "Gagal mengambil hasil evaluasi" },
            { status: 500 }
        );
    }
}

// Hitung nilai evaluasi
function calculateEvaluationScore(answers: any[]): number {
    if (!answers || answers.length === 0) return 0;
    let totalSkor = 0;
    let soalTerjawab = 0;
    answers.forEach((answer) => {
        if (!answer) return;
        const numericValue = convertAnswerToNumber(answer.answer || answer.value || answer);
        if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 5) {
            totalSkor += numericValue;
            soalTerjawab++;
        }
    });
    if (soalTerjawab === 0) return 0;
    const skorRataRata = totalSkor / soalTerjawab;
    return Math.round(((skorRataRata - 1) / 4) * 100);
}

function convertAnswerToNumber(answer: any): number {
    if (answer === null || answer === undefined) return 0;
    if (typeof answer === "number") return answer;
    if (typeof answer === "string") {
        const answerLower = answer.toLowerCase().trim();
        const jawabanMapping: { [key: string]: number } = {
            "sangat tidak setuju": 1, "tidak setuju": 2, "netral": 3,
            "setuju": 4, "sangat setuju": 5,
            "sts": 1, "ts": 2, "n": 3, "s": 4, "ss": 5,
            "1": 1, "2": 2, "3": 3, "4": 4, "5": 5,
        };
        if (jawabanMapping[answerLower] !== undefined) return jawabanMapping[answerLower];
        const numeric = parseFloat(answerLower);
        if (!isNaN(numeric)) return numeric;
    }
    return 0;
}