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
                const ternakRes = await fetch("/api/ternak");
                const ternakData = await ternakRes.json();
                setJumlahTernak(ternakData.length);

                // 📝 Kuesioner → ambil total
                const kuesionerRes = await fetch("/api/kuesioner?count=true");
                const kuesionerData = await kuesionerRes.json();
                setTotalKuesioner(kuesionerData.total);

                // ✅ Ambil bulan sekarang
                const bulanNama = new Date().toLocaleString("id-ID", { month: "long" });
                const capitalized = bulanNama.charAt(0).toUpperCase() + bulanNama.slice(1);
                const tahun = new Date().getFullYear();

                // userId kalau memang masih dipakai route.ts
                const userId = "123";
                const bulanIndex = new Date().getMonth() + 1;

                // ✅ Konsisten: sama persis kayak halaman kuesioner
                const checkRes = await fetch(
                    `/api/kuesioner?questionnaireId=${capitalized}&userId=${userId}&month=${bulanIndex}&year=${tahun}`
                );
                const checkData = checkRes.ok ? await checkRes.json() : null;

                // ✅ cek status dari API, bukan sekadar array length
                setIsFilled(checkData?.status === true);

                // 📊 Evaluasi → untuk card & grafik
                const hasilRes = await fetch("/api/hasil");
                const hasilData = await hasilRes.json();

                if (hasilData.length > 0) {
                    const latest = hasilData[hasilData.length - 1];
                    setEvaluasi(latest.nilaiEvaluasi);

                    const mapped = hasilData.map((item: any) => ({
                        bulan: item.bulan.substring(0, 3),
                        nilai: item.nilaiEvaluasi,
                    }));
                    setChartData(mapped);
                }

                setError(null);
            } catch (err) {
                console.error("Error loading data:", err);
                setError("Gagal memuat data");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const cards = [
        { title: 'Jumlah Ternak', value: `${jumlahTernak} Ekor` },
        { title: 'Kuesioner', value: `${totalKuesioner} Diisi` },
        { title: 'Evaluasi', value: `${evaluasi} Baik` },
    ];

    // ✅ kalau chartData kosong fallback biar tidak error
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

            {/* Grafik Evaluasi Bulanan */}{
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
            }

            {/* Aktivitas Terakhir */}{
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
            }

            {error && (
                <div className="flex justify-center items-center h-10 mb-4">
                    <p className="text-lg font-[Judson] text-red-500">{error}</p>
                </div>
            )}
        </section>
    );
}
