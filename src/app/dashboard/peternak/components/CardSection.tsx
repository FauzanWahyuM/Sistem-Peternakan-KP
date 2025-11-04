// components/CardSection.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface ChartDataItem {
    name: string;
    nilai: number;
    fullName: string;
    periode: string;
    tahun: number;
}

interface TernakData {
    _id: string;
    userId: string;
    jenisHewan: string;
    jenisKelamin: string;
    umurTernak: string;
    statusTernak: string;
    kondisiKesehatan: string;
    tipe: string; // 'pribadi' atau 'kelompok'
    kelompokId?: string;
    kelompokNama?: string;
    createdAt: string;
    updatedAt: string;
}

interface DashboardData {
    jumlahTernakPribadi: number;
    jumlahTernakKelompok: number;
    totalTernak: number;
    totalKuesioner: number;
    evaluasi: number;
    chartData: ChartDataItem[];
    isFilled: boolean;
    loading: boolean;
    error: string | null;
}

export default function CardSection() {
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        jumlahTernakPribadi: 0,
        jumlahTernakKelompok: 0,
        totalTernak: 0,
        totalKuesioner: 0,
        evaluasi: 0,
        chartData: [],
        isFilled: false,
        loading: true,
        error: null
    });

    const [retryCount, setRetryCount] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    // Deteksi ukuran layar dengan lebih akurat
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => {
            window.removeEventListener('resize', checkIsMobile);
        };
    }, []);

    // Fungsi untuk mendapatkan nama periode yang singkat untuk chart
    const getShortPeriodName = (periode: string, tahun: number) => {
        if (periode === 'jan-jun') return `Jan-Jun\n${tahun}`;
        if (periode === 'jul-des') return `Jul-Des\n${tahun}`;
        return periode;
    };

    // Fungsi untuk mendapatkan nama periode lengkap untuk tooltip
    const getFullPeriodName = (periode: string, tahun: number) => {
        if (periode === 'jan-jun') return `Periode Januari-Juni ${tahun}`;
        if (periode === 'jul-des') return `Periode Juli-Desember ${tahun}`;
        return `Periode ${periode} ${tahun}`;
    };

    const loadDashboardData = async () => {
        try {
            setDashboardData(prev => ({ ...prev, loading: true, error: null }));

            // Data ternak (gunakan endpoint khusus dashboard)
            const ternakRes = await fetch("/api/ternak/dashboard", { credentials: 'include' });
            if (!ternakRes.ok) throw new Error('Gagal mengambil data dashboard ternak');
            const filteredTernakData: TernakData[] = await ternakRes.json();

            // Hitung ternak pribadi dan kelompok
            let jumlahTernakPribadi = 0;
            let jumlahTernakKelompok = 0;

            filteredTernakData.forEach((ternak) => {
                if (ternak.tipe === 'pribadi') {
                    jumlahTernakPribadi += 1;
                } else if (ternak.tipe === 'kelompok') {
                    jumlahTernakKelompok += 1;
                }
            });

            const totalTernak = jumlahTernakPribadi + jumlahTernakKelompok;

            // Data kuesioner - hanya hitung total
            let totalKuesioner = 0;
            try {
                const kuesionerRes = await fetch("/api/kuesioner?count=true", {
                    credentials: 'include'
                });

                if (kuesionerRes.ok) {
                    const kuesionerData = await kuesionerRes.json();
                    totalKuesioner = kuesionerData.total || 0;
                } else {
                    console.warn("Gagal mengambil data kuesioner count");
                }
            } catch (kuesionerError) {
                console.warn("Error pada API kuesioner count:", kuesionerError);
            }

            // Data evaluasi - ambil data per periode
            let evaluasiValue = 0;
            let chartData: ChartDataItem[] = [];

            try {
                const hasilRes = await fetch("/api/hasil", { credentials: 'include' });
                if (hasilRes.ok) {
                    const hasilData = await hasilRes.json();

                    if (hasilData && hasilData.length > 0) {
                        // Ambil nilai evaluasi terbaru
                        const latest = hasilData[0];
                        evaluasiValue = latest.nilaiEvaluasi || 0;

                        // Siapkan data chart per periode
                        chartData = hasilData.map((item: any) => {
                            const periode = item.periode || 'unknown';
                            const tahun = item.tahun || new Date().getFullYear();

                            return {
                                name: getShortPeriodName(periode, tahun),
                                nilai: item.nilaiEvaluasi || 0,
                                fullName: getFullPeriodName(periode, tahun),
                                periode: periode,
                                tahun: tahun
                            };
                        });

                        // Urutkan data chart berdasarkan tahun dan periode (terbaru dulu)
                        chartData.sort((a, b) => {
                            if (a.tahun !== b.tahun) {
                                return b.tahun - a.tahun; // Tahun descending
                            }
                            // Jika tahun sama, urutkan berdasarkan periode (jul-des dulu, lalu jan-jun)
                            return b.periode.localeCompare(a.periode);
                        });

                        // Balik urutan untuk chart (data terlama di kiri, terbaru di kanan)
                        chartData.reverse();
                    }
                } else {
                    console.warn("Gagal mengambil data evaluasi");
                }
            } catch (evaluasiError) {
                console.warn("Error pada API evaluasi:", evaluasiError);
            }

            // Status kuesioner periode ini
            let isFilled = false;
            try {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1;
                const currentPeriod = currentMonth <= 6 ? 'jan-jun' : 'jul-des';
                const questionnaireId = currentPeriod === 'jan-jun' ? 'Januari' : 'Juli';

                const checkRes = await fetch(
                    `/api/kuesioner?questionnaireId=${questionnaireId}&period=${currentPeriod}&year=${currentYear}`,
                    { credentials: 'include' }
                );

                if (checkRes.ok) {
                    const checkData = await checkRes.json();
                    isFilled = checkData.status === true;
                } else {
                    console.warn("Gagal memeriksa status kuesioner periode ini");
                }
            } catch (statusError) {
                console.warn("Error memeriksa status kuesioner:", statusError);
            }

            setDashboardData({
                jumlahTernakPribadi,
                jumlahTernakKelompok,
                totalTernak,
                totalKuesioner,
                evaluasi: evaluasiValue,
                chartData,
                isFilled,
                loading: false,
                error: null
            });

        } catch (err: any) {
            console.error("Error loading dashboard data:", err);
            setDashboardData(prev => ({
                ...prev,
                loading: false,
                error: err.message || "Gagal memuat data dashboard"
            }));
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, [retryCount]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
    };

    const {
        jumlahTernakPribadi,
        jumlahTernakKelompok,
        totalTernak,
        totalKuesioner,
        evaluasi,
        chartData,
        isFilled,
        loading,
        error
    } = dashboardData;

    const cards = [
        {
            title: 'Total Ternak',
            value: `${totalTernak} Ekor`,
            description: 'Total semua hewan ternak'
        },
        {
            title: 'Ternak Pribadi',
            value: `${jumlahTernakPribadi} Ekor`,
            description: 'Hewan ternak milik pribadi'
        },
        {
            title: 'Ternak Kelompok',
            value: `${jumlahTernakKelompok} Ekor`,
            description: 'Hewan ternak milik kelompok'
        },
        {
            title: 'Kuesioner',
            value: totalKuesioner > 0 ? `${totalKuesioner} Diisi` : 'Belum ada',
            description: totalKuesioner > 0
                ? 'Jumlah kuesioner yang telah diselesaikan'
                : 'Belum ada kuesioner yang diisi'
        },
        {
            title: 'Evaluasi',
            value: evaluasi > 0 ? `${evaluasi}%` : 'Belum ada',
            description: evaluasi > 0
                ? 'Nilai evaluasi terakhir'
                : 'Belum ada evaluasi'
        },
    ];

    if (loading) {
        return (
            <section className="p-3 sm:p-4 md:p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 text-sm sm:text-base">Memuat data dashboard...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="p-3 sm:p-4 md:p-6 overflow-x-hidden">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 sm:mb-6 rounded">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-red-400 text-lg sm:text-xl">⚠️</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-xs sm:text-sm text-red-700">
                                {error}
                            </p>
                            <div className="mt-2">
                                <button
                                    onClick={handleRetry}
                                    className="bg-red-100 text-red-700 px-2 py-1 sm:px-3 sm:py-1 rounded-md text-xs sm:text-sm font-medium"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Card Statistik */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8 w-full">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md p-3 sm:p-4 md:p-6 border-l-4 border-green-500 w-full"
                    >
                        <h3 className="text-xs xs:text-sm sm:text-base md:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">{card.title}</h3>
                        <p className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
                        <p className="text-[10px] xs:text-xs sm:text-sm text-gray-500 leading-tight sm:leading-normal">{card.description}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 md:mb-8 w-full">
                {/* Grafik Evaluasi Per Periode */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow p-3 sm:p-4 md:p-6 w-full">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-gray-700">
                        Performa Evaluasi Per Periode
                    </h2>
                    <div className="h-48 xs:h-56 sm:h-64 md:h-80 w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: isMobile ? 8 : 10 }}
                                        interval={0}
                                        angle={isMobile ? -45 : 0}
                                        textAnchor={isMobile ? "end" : "middle"}
                                        height={isMobile ? 60 : 40}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        tick={{ fontSize: isMobile ? 8 : 10 }}
                                        width={isMobile ? 25 : 30}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`${value}%`, 'Nilai Evaluasi']}
                                        labelFormatter={(label, payload) => {
                                            if (payload && payload[0]) {
                                                return payload[0].payload.fullName;
                                            }
                                            return label;
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="nilai"
                                        stroke="#60c67a"
                                        strokeWidth={2}
                                        dot={{ r: isMobile ? 2 : 3 }}
                                        activeDot={{ r: isMobile ? 4 : 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-gray-500">
                                    <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">📊</div>
                                    <p className="text-sm sm:text-base md:text-lg font-semibold">Belum ada data evaluasi</p>
                                    <p className="text-xs sm:text-sm">Isi kuesioner untuk melihat grafik evaluasi</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Kuesioner */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow p-3 sm:p-4 md:p-6 w-full">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-gray-700">
                        Status Kuesioner Periode Ini
                    </h2>
                    <div className="flex flex-col items-center justify-center h-40 xs:h-48 sm:h-56 md:h-64">
                        <div className={`rounded-full h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 flex items-center justify-center ${isFilled ? 'bg-green-100' : 'bg-yellow-100'}`}>
                            <span className="text-2xl sm:text-3xl md:text-4xl">{isFilled ? '✅' : '⏰'}</span>
                        </div>
                        <p className="mt-3 sm:mt-4 md:mt-6 text-sm sm:text-base md:text-lg font-semibold text-center px-2">
                            {isFilled ? 'Sudah mengisi kuesioner periode ini' : 'Belum mengisi kuesioner periode ini'}
                        </p>
                        <p className="text-gray-500 mt-1 sm:mt-2 text-center text-xs sm:text-sm px-2">
                            {isFilled
                                ? 'Terima kasih telah meluangkan waktu untuk mengisi kuesioner.'
                                : 'Silakan isi kuesioner untuk membantu kami meningkatkan layanan.'}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}