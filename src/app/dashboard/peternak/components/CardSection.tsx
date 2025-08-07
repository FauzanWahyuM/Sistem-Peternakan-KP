'use client';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useState, useEffect } from 'react';

export default function CardSection({ totalKuesioner = 0, evaluasi = 0 }) {
    const [jumlahTernak, setJumlahTernak] = useState(0);

    useEffect(() => {
        // Load ternak count from localStorage
        const loadTernakCount = () => {
            const savedData = localStorage.getItem('ternakList');
            if (savedData) {
                const ternakList = JSON.parse(savedData);
                setJumlahTernak(ternakList.length);
            }
        };

        loadTernakCount();

        // Listen for updates to ternak data
        const handleTernakUpdate = () => {
            loadTernakCount();
        };

        window.addEventListener('ternakDataUpdated', handleTernakUpdate);

        return () => {
            window.removeEventListener('ternakDataUpdated', handleTernakUpdate);
        };
    }, []);

    const cards = [
        { title: 'Jumlah Ternak', value: `${jumlahTernak} Ekor` },
        { title: 'Kuesioner', value: `${totalKuesioner} Diisi` },
        { title: 'Evaluasi', value: `${evaluasi}% Baik` },
    ];

    const chartData = [
        { bulan: 'Jan', nilai: 80 },
        { bulan: 'Feb', nilai: 82 },
        { bulan: 'Mar', nilai: 85 },
        { bulan: 'Apr', nilai: 83 },
        { bulan: 'Mei', nilai: 88 },
        { bulan: 'Jun', nilai: 90 },
        { bulan: 'Jul', nilai: 89 },
    ];

    const kuesionerData = {
        Jan: true,
        Feb: true,
        Mar: true,
        Apr: false,
        Mei: true,
        Jun: true,
        Jul: true,
    };

    // ✅ Cek bulan sekarang
    const bulanSekarang = new Date().toLocaleString('id-ID', { month: 'short' });
    const isFilled = kuesionerData[bulanSekarang] ?? false;

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
                    <LineChart data={chartData}>
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
        </section>
    );
}
