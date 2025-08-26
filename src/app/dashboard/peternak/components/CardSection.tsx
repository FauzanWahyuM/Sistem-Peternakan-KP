// components/CardSection.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function CardSection() {
    const [dashboardData, setDashboardData] = useState({
        jumlahTernak: 0,
        totalKuesioner: 0,
        evaluasi: 0,
        chartData: [],
        isFilled: false,
        loading: true,
        error: null
    });

    const [retryCount, setRetryCount] = useState(0);

    const loadDashboardData = async () => {
        try {
            setDashboardData(prev => ({ ...prev, loading: true, error: null }));

            // Data ternak
            const ternakRes = await fetch("/api/ternak", { credentials: 'include' });
            if (!ternakRes.ok) throw new Error('Gagal mengambil data ternak');
            const ternakData = await ternakRes.json();

            // Data kuesioner
            const kuesionerRes = await fetch("/api/kuesioner?count=true", {
                credentials: 'include'
            });

            if (!kuesionerRes.ok) {
                const errorData = await kuesionerRes.text();
                console.error("Error response dari API kuesioner:", errorData);
                throw new Error(`Server error: ${kuesionerRes.status}`);
            }

            const kuesionerData = await kuesionerRes.json();

            // Data evaluasi
            const hasilRes = await fetch("/api/hasil", { credentials: 'include' });
            if (!hasilRes.ok) throw new Error('Gagal mengambil data evaluasi');
            const hasilData = await hasilRes.json();

            // Status kuesioner bulan ini
            const bulanNama = new Date().toLocaleString("id-ID", { month: "long" });
            const capitalized = bulanNama.charAt(0).toUpperCase() + bulanNama.slice(1);
            const tahun = new Date().getFullYear();
            const bulanIndex = new Date().getMonth() + 1;

            const checkRes = await fetch(
                `/api/kuesioner?questionnaireId=${capitalized}&month=${bulanIndex}&year=${tahun}`,
                { credentials: 'include' }
            );

            const checkData = checkRes.ok ? await checkRes.json() : { status: false };

            // Siapkan data chart
            let chartData = [];
            if (hasilData.length > 0) {
                const latest = hasilData[0];
                chartData = hasilData.map((item, index) => ({
                    name: item.bulanSingkat || `Bln ${item.bulan}`,
                    nilai: item.nilaiEvaluasi || 0,
                    fullName: `Bulan ${item.bulan}`
                }));
                // Ganti bagian else statement untuk chartData
            } else {
                // Jangan gunakan data placeholder, biarkan array kosong
                chartData = [];
            }

            setDashboardData({
                jumlahTernak: ternakData.length || 4,
                totalKuesioner: kuesionerData.total || 1,
                evaluasi: hasilData.length > 0 ? hasilData[0].nilaiEvaluasi : 50,
                chartData,
                isFilled: checkData.status === true,
                loading: false,
                error: null
            });

        } catch (err) {
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

    const { jumlahTernak, totalKuesioner, evaluasi, chartData, isFilled, loading, error } = dashboardData;

    const cards = [
        {
            title: 'Jumlah Ternak',
            value: `${jumlahTernak} Ekor`,
            description: 'Total hewan ternak yang dimiliki'
        },
        {
            title: 'Kuesioner',
            value: `${totalKuesioner} Diisi`,
            description: 'Jumlah kuesioner yang telah diselesaikan'
        },
        {
            title: 'Evaluasi',
            value: evaluasi > 0 ? `${evaluasi}%` : 'Belum ada',
            description: evaluasi > 0 ? 'Nilai evaluasi terakhir' : 'Belum ada evaluasi'
        },
    ];

    if (loading) {
        return (
            <section className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Memuat data dashboard...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="p-6">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-red-400 text-xl">⚠️</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                {error}
                            </p>
                            <div className="mt-2">
                                <button
                                    onClick={handleRetry}
                                    className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Card Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500"
                    >
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">{card.title}</h3>
                        <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
                        <p className="text-sm text-gray-500">{card.description}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                {/* Grafik Evaluasi Bulanan */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-700">
                        Performa Evaluasi Bulanan
                    </h2>
                    <div className="h-80">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip
                                        formatter={(value) => [`${value}%`, 'Nilai Evaluasi']}
                                        labelFormatter={(label) => `Bulan: ${label}`}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="nilai"
                                        stroke="#60c67a"
                                        strokeWidth={3}
                                        dot={{ r: 5 }}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-gray-500">
                                    <div className="text-4xl mb-2">📊</div>
                                    <p className="text-lg font-semibold">Belum ada data evaluasi</p>
                                    <p className="text-sm">Isi kuesioner untuk melihat grafik evaluasi</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Kuesioner */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-700">
                        Status Kuesioner Bulan Ini
                    </h2>
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className={`rounded-full h-24 w-24 flex items-center justify-center ${isFilled ? 'bg-green-100' : 'bg-yellow-100'}`}>
                            <span className="text-4xl">{isFilled ? '✅' : '⚠️'}</span>
                        </div>
                        <p className="mt-6 text-lg font-semibold">
                            {isFilled ? 'Sudah mengisi kuesioner bulan ini' : 'Belum mengisi kuesioner bulan ini'}
                        </p>
                        <p className="text-gray-500 mt-2 text-center">
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