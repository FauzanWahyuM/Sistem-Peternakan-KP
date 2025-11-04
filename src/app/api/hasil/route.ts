// app/api/hasil/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "../../../lib/dbConnect";
import QuestionnaireResponse from "../../../models/Kuesioner";
import User from "../../../models/User";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    await connectDB();
    try {
        // Dapatkan session user yang sedang login
        const session = await getServerSession();

        if (!session || !session.user) {
            console.log('❌ Tidak ada session user');
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        console.log('🔍 Session user:', session.user);

        const { searchParams } = new URL(req.url);
        const all = searchParams.get("all");

        console.log('📝 API /api/hasil dipanggil oleh:', session.user.email, 'all=', all);

        // Cari user berdasarkan email dari session
        const currentUser = await User.findOne({
            email: session.user.email
        }).select('_id username nama role').lean();

        if (!currentUser) {
            console.log('❌ User tidak ditemukan di database');
            return NextResponse.json(
                { error: "User tidak ditemukan" },
                { status: 404 }
            );
        }

        console.log('✅ User ditemukan:', currentUser);

        // Tentukan query berdasarkan role dan parameter all
        let query: any = {};
        let isAdminMode = false;

        // Jika parameter all=true dan user adalah admin, ambil semua data
        if (all === 'true') {
            // Cek apakah user adalah admin
            const isAdmin = currentUser.role === 'admin';
            if (isAdmin) {
                console.log('👨‍💼 Admin mode: mengambil semua data');
                isAdminMode = true;
                // TIDAK ADA filter userId - ambil semua data
            } else {
                console.log('⚠️ User bukan admin, hanya mengambil data sendiri');
                query.userId = currentUser._id.toString();
            }
        } else {
            // Mode normal: hanya data user sendiri
            query.userId = currentUser._id.toString();
        }

        // Filter tambahan (opsional)
        const periode = searchParams.get("periode");
        const tahun = searchParams.get("tahun");
        const questionnaireId = searchParams.get("questionnaireId");

        if (periode) query.periode = periode;
        if (tahun) query.tahun = Number(tahun);
        if (questionnaireId) query.questionnaireId = questionnaireId;

        console.log('📋 Query database:', query);

        // Ambil data dari database
        const responses = await QuestionnaireResponse.find(query)
            .sort({ tahun: -1, createdAt: -1 })
            .lean();

        console.log(`📊 Ditemukan ${responses.length} response kuesioner`);

        if (responses.length === 0) {
            console.log('ℹ️ Tidak ada data response kuesioner');
            return NextResponse.json([], { status: 200 });
        }

        // Jika admin mode, kita perlu mengambil data semua user
        if (isAdminMode) {
            console.log('🔄 Admin mode: mengambil data semua user');

            // Dapatkan semua user IDs dari responses
            const userIds = responses.map(response => response.userId).filter(id => id);
            const uniqueUserIds = [...new Set(userIds)];

            console.log('👥 User IDs yang ditemukan:', uniqueUserIds);

            // Temukan semua user data sekaligus
            const users = await User.find({
                _id: {
                    $in: uniqueUserIds
                        .filter(id => mongoose.Types.ObjectId.isValid(id))
                        .map(id => new mongoose.Types.ObjectId(id))
                }
            }).select('username nama _id').lean();

            console.log('✅ Data user berhasil diambil:', users.length);

            // Buat mapping user by ID
            const userMap = new Map();
            users.forEach(user => {
                userMap.set(user._id.toString(), user);
            });

            // Format data untuk admin (dengan nama user yang benar)
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

                const nilaiEvaluasi = calculateEvaluationScore(item.answers);

                console.log(`📝 Response ${index + 1}: ${userName}, Nilai: ${nilaiEvaluasi}`);

                return {
                    _id: item._id?.toString(),
                    id: index + 1,
                    nama: userName,
                    username: userUsername,
                    periode: item.periode,
                    namaPeriode: getNamaPeriode(item), // Tambahkan nama periode yang user-friendly
                    tahun: item.tahun,
                    nilaiEvaluasi: nilaiEvaluasi,
                    questionnaireId: item.questionnaireId,
                    userId: item.userId,
                    createdAt: item.createdAt,
                    totalAnswers: item.answers?.length || 0
                };
            });

            console.log(`🎉 Data admin berhasil diformat: ${formattedData.length} items`);
            return NextResponse.json(formattedData, { status: 200 });

        } else {
            // Format data untuk user biasa (hanya data sendiri)
            console.log('👤 Mode user biasa: hanya data sendiri');

            const formattedData = responses.map((item: any, index: number) => {
                const nilaiEvaluasi = calculateEvaluationScore(item.answers);

                console.log(`📝 Response ${index + 1}: Periode ${item.periode}, Tahun ${item.tahun}, Nilai: ${nilaiEvaluasi}`);

                return {
                    _id: item._id?.toString(),
                    id: index + 1,
                    nama: currentUser.nama || currentUser.username || 'User',
                    username: currentUser.username || '',
                    periode: item.periode,
                    namaPeriode: getNamaPeriode(item), // Tambahkan nama periode yang user-friendly
                    tahun: item.tahun,
                    nilaiEvaluasi: nilaiEvaluasi,
                    questionnaireId: item.questionnaireId,
                    userId: item.userId,
                    createdAt: item.createdAt,
                    totalAnswers: item.answers?.length || 0
                };
            });

            console.log(`🎉 Data user biasa berhasil diformat: ${formattedData.length} items`);
            return NextResponse.json(formattedData, { status: 200 });
        }

    } catch (err) {
        console.error("❌ Error getting evaluation results:", err);
        return NextResponse.json(
            { error: "Gagal mengambil hasil evaluasi" },
            { status: 500 }
        );
    }
}

// Fungsi untuk mendapatkan nama periode yang user-friendly
function getNamaPeriode(item: any): string {
    if (item.namaPeriode) {
        return item.namaPeriode;
    }

    // Fallback berdasarkan field periode
    if (item.periode === 'jan-jun') return 'Januari-Juni';
    if (item.periode === 'jul-des') return 'Juli-Desember';

    // Fallback untuk data lama yang masih menggunakan bulan
    if (item.bulan) {
        const bulanNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return bulanNames[item.bulan - 1] || `Bulan ${item.bulan}`;
    }

    return 'Periode Tidak Diketahui';
}

// Fungsi untuk menghitung nilai evaluasi dari answers (skala 1-100)
function calculateEvaluationScore(answers: any[]): number {
    if (!answers || answers.length === 0) {
        console.log('⚠️ Tidak ada answers untuk dihitung');
        return 0;
    }

    let totalSkor = 0;
    let soalTerjawab = 0;

    answers.forEach((answer, index) => {
        if (answer && answer.answer !== undefined && answer.answer !== null) {
            const numericValue = convertAnswerToNumber(answer.answer);
            if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 5) {
                totalSkor += numericValue;
                soalTerjawab++;
            } else {
                console.log(`❌ Jawaban tidak valid: ${answer.answer} (soal ${index + 1})`);
            }
        }
    });

    console.log(`📊 Total skor: ${totalSkor}, Soal terjawab: ${soalTerjawab}`);

    if (soalTerjawab === 0) {
        console.log('⚠️ Tidak ada soal yang terjawab valid');
        return 0;
    }

    const skorRataRata = totalSkor / soalTerjawab;
    const skala100 = ((skorRataRata - 1) / 4) * 100;
    const nilaiAkhir = Math.round(skala100);

    console.log(`✅ Nilai akhir: ${nilaiAkhir}%`);

    return nilaiAkhir;
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
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
        'sangat tidak baik': 1,
        'tidak baik': 2,
        'cukup': 3,
        'baik': 4,
        'sangat baik': 5
    };

    const answerLower = answer.toString().toLowerCase().trim();

    if (jawabanMapping[answerLower] !== undefined) {
        return jawabanMapping[answerLower];
    }

    const numeric = parseFloat(answer.toString());
    return isNaN(numeric) ? 0 : numeric;
}