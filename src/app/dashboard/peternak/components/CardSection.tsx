'use client';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useState, useEffect } from 'react';

export default function CardSection() {
    const [jumlahTernak, setJumlahTernak] = useState(0);
    const [totalKuesioner, setTotalKuesioner] = useState(0);
    const [evaluasi, setEvaluasi] = useState(0);
    const [chartData, setChartData] = useState<any[]>([]);
    const [isFilled, setIsFilled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // 🚜 Jumlah ternak
                const ternakRes = await fetch("/api/ternak", {
                    credentials: 'include'
                });
                if (!ternakRes.ok) throw new Error('Gagal mengambil data ternak');
                const ternakData = await ternakRes.json();
                setJumlahTernak(ternakData.length);

                // 📝 Kuesioner → ambil total
                const kuesionerRes = await fetch("/api/kuesioner?count=true", {
                    credentials: 'include'
                });
                if (!kuesionerRes.ok) throw new Error('Gagal mengambil data kuesioner');
                const kuesionerData = await kuesionerRes.json();
                setTotalKuesioner(kuesionerData.total);

                // ✅ Ambil bulan sekarang
                const bulanNama = new Date().toLocaleString("id-ID", { month: "long" });
                const capitalized = bulanNama.charAt(0).toUpperCase() + bulanNama.slice(1);
                const tahun = new Date().getFullYear();
                const bulanIndex = new Date().getMonth() + 1;

                // ✅ Cek apakah kuesioner bulan ini sudah diisi
                const checkRes = await fetch(
                    `/api/kuesioner?questionnaireId=${capitalized}&month=${bulanIndex}&year=${tahun}`,
                    { credentials: 'include' }
                );

                if (checkRes.ok) {
                    const checkData = await checkRes.json();
                    setIsFilled(checkData.status === true);
                } else {
                    setIsFilled(false);
                }

                // 📊 Evaluasi → untuk card & grafik
                const hasilRes = await fetch("/api/hasil", {
                    credentials: 'include'
                });

                if (!hasilRes.ok) throw new Error('Gagal mengambil data evaluasi');
                const hasilData = await hasilRes.json();

                if (hasilData.length > 0) {
                    // Ambil nilai evaluasi terbaru
                    const latest = hasilData[0]; // Data sudah diurutkan dari terbaru
                    setEvaluasi(latest.nilaiEvaluasi || 0);

                    // Siapkan data untuk chart
                    const mapped = hasilData.map((item: any) => ({
                        bulan: item.bulanSingkat || `Bln ${item.bulan}`, // Gunakan bulanSingkat dari API
                        nilai: item.nilaiEvaluasi || 0,
                    }));
                    setChartData(mapped);
                } else {
                    setEvaluasi(0);
                    setChartData([]);
                }

                setError(null);
            } catch (err: any) {
                console.error("Error loading data:", err);
                setError(err.message || "Gagal memuat data");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const cards = [
        { title: 'Jumlah Ternak', value: `${jumlahTernak} Ekor` },
        { title: 'Kuesioner', value: `${totalKuesioner} Diisi` },
        { title: 'Evaluasi', value: `${evaluasi > 0 ? evaluasi : 'Belum ada'}` },
    ];

    // ✅ Data untuk chart
    const displayData = chartData.length > 0 ? chartData : [
        { bulan: 'Jan', nilai: 0 },
        { bulan: 'Feb', nilai: 0 },
        { bulan: 'Mar', nilai: 0 },
    ];

    if (loading) {
        return (
            <section className="p-6">
                <div className="flex justify-center items-center h-64">
                    <p className="text-lg font-[Judson]">Memuat data...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="p-6">
            {/* Card Statistik */}
            <div className="flex justify-center gap-60 flex-wrap mb-10">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-[#60c67a] text-white rounded-lg shadow-md px-10 py-8 text-center min-w-[250px]"
                    >
                        <div className="text-3xl font-[Judson] font-semibold">{card.title}</div>
                        <div className="text-2xl font-[Judson] mt-1">{card.value}</div>
                    </div>
                ))}
            </div>

            {/* Grafik Evaluasi Bulanan */}
            <div className="bg-white rounded-xl shadow p-6 max-w-4xl mx-auto mb-10">
                <h2 className="text-xl font-bold mb-4 text-gray-700 text-center">
                    Performa Evaluasi Bulanan
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={displayData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="bulan" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="nilai"
                            stroke="#60c67a"
                            strokeWidth={3}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Aktivitas Terakhir */}
            <div className="flex justify-center">
                <div className="bg-[#60c67a] text-white rounded-lg shadow-md px-6 py-4 text-center">
                    <h2 className="text-3xl font-[Judson] font-bold mb-2">Aktivitas Terakhir</h2>
                    <p className="text-2xl font-[Judson] font-semibold">
                        {isFilled
                            ? '✅ Sudah mengisi kuesioner bulan ini'
                            : '⚠️ Belum mengisi kuesioner bulan ini'}
                    </p>
                </div>
            </div>

            {error && (
                <div className="flex justify-center items-center h-10 mb-4">
                    <p className="text-lg font-[Judson] text-red-500">{error}</p>
                </div>
            )}
        </section>
    );
}