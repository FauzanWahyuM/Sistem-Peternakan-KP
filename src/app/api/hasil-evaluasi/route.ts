// app/api/hasil-evaluasi/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/dbConnect";
import QuestionnaireResponse from "../../../models/Kuesioner";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import Kelompok from "../../../models/Kelompok";
import User from "../../../models/User";

export async function GET(req: NextRequest) {
    await connectDB();
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const periode = searchParams.get("periode");
        const tahun = searchParams.get("tahun");

        const currentDate = new Date();
        const finalTahun = tahun ? Number(tahun) : currentDate.getFullYear();

        console.log('🔍 Fetching evaluation data with params:', { periode, tahun: finalTahun });

        // 1. Ambil semua kelompok
        const semuaKelompokDocs = await Kelompok.find({})
            .select("kelompokid nama status")
            .sort({ kelompokid: 1 });
        const semuaKelompok = semuaKelompokDocs.map(doc => doc.toObject());

        // 2. Ambil semua peternak
        const semuaPeternakDocs = await User.find({ role: "peternak" })
            .select("nama username _id role kelompok");
        const semuaPeternak = semuaPeternakDocs.map(doc => doc.toObject());

        console.log(`📊 Found ${semuaKelompok.length} kelompok and ${semuaPeternak.length} peternak`);

        // Build query untuk responses
        const query: any = {};
        if (periode) query.periode = periode;
        if (tahun) query.tahun = finalTahun;

        console.log('📋 Query for responses:', query);

        // Ambil responses berdasarkan filter
        const responsesDocs = await QuestionnaireResponse.find(query)
            .populate("userId", "nama username kelompok")
            .sort({ tahun: -1, createdAt: -1 });
        const responses = responsesDocs.map(doc => doc.toObject());

        console.log(`📝 Found ${responses.length} questionnaire responses`);

        // Mapping responses by userId
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

        // Kelompokkan peternak berdasarkan kelompok
        const peternakByKelompok = new Map();
        const peternakTanpaKelompok: any[] = [];
        semuaKelompok.forEach((kelompok: any) => {
            peternakByKelompok.set(kelompok.kelompokid, []);
        });
        semuaPeternak.forEach((peternak: any) => {
            const kelompok = peternak.kelompok;
            if (kelompok && peternakByKelompok.has(kelompok)) {
                peternakByKelompok.get(kelompok).push(peternak);
            } else {
                peternakTanpaKelompok.push(peternak);
            }
        });

        // Format hasil evaluasi per kelompok
        const evaluasiData = semuaKelompok.map((kelompok: any) => {
            const anggotaKelompok = peternakByKelompok.get(kelompok.kelompokid) || [];
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
                    jumlahResponden += 1;
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

            return {
                kelompok: kelompok.kelompokid,
                namaKelompok: kelompok.nama,
                statusKelompok: kelompok.status,
                anggota: anggotaDenganEvaluasi,
                totalNilai,
                jumlahAnggota,
                jumlahResponden,
                rataRata,
                persentaseResponden,
                statusEvaluasi,
            };
        });

        // Tambah kategori "Belum Dikelompokkan"
        if (peternakTanpaKelompok.length > 0) {
            evaluasiData.push({
                kelompok: "Belum Dikelompokkan",
                namaKelompok: "Belum Dikelompokkan",
                statusKelompok: "aktif",
                anggota: peternakTanpaKelompok.map((user: any, index: number) => {
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
                }),
                totalNilai: 0,
                jumlahAnggota: peternakTanpaKelompok.length,
                jumlahResponden: 0,
                rataRata: 0,
                persentaseResponden: 0,
                statusEvaluasi: "Belum Ada Responden",
            });
        }

        console.log(`✅ Successfully processed ${evaluasiData.length} kelompok data`);
        return NextResponse.json(evaluasiData, { status: 200 });
    } catch (err) {
        console.error("❌ Error getting evaluation results:", err);
        return NextResponse.json(
            { error: "Gagal mengambil hasil evaluasi" },
            { status: 500 }
        );
    }
}

// Fungsi hitung nilai
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
        if (jawabanMapping[answerLower] !== undefined) {
            return jawabanMapping[answerLower];
        }
        const numeric = parseFloat(answerLower);
        if (!isNaN(numeric)) return numeric;
    }
    return 0;
}