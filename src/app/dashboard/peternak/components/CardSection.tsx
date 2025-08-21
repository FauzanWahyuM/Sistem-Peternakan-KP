'use client';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useState, useEffect } from 'react';

export default function CardSection() {
    const [jumlahTernak, setJumlahTernak] = useState(0);
    const [totalKuesioner, setTotalKuesioner] = useState(0);
    const [evaluasi, setEvaluasi] = useState(0);
    const [isFilled, setIsFilled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // In a real implementation, you would get the actual user ID from session/context
        const userId = 'user-id-placeholder'; // This should be replaced with actual user ID
        
        const loadData = async () => {
            try {
                setLoading(true);
                
                // Fetch livestock count
                const livestockResponse = await fetch(`/api/livestock?userId=${userId}`);
                if (!livestockResponse.ok) {
                    throw new Error('Failed to fetch livestock data');
                }
                const livestockData = await livestockResponse.json();
                setJumlahTernak(livestockData.livestock.length);
                
                // Fetch questionnaire responses
                const questionnaireResponse = await fetch(`/api/questionnaire-responses?userId=${userId}`);
                let questionnaireData = { responses: [] };
                
                if (questionnaireResponse.ok) {
                    questionnaireData = await questionnaireResponse.json();
                }
                
                // Set total kuesioner count (0 if no data or error)
                setTotalKuesioner(questionnaireData.responses ? questionnaireData.responses.length : 0);
                
                // Check if current month's questionnaire is filled
                const currentMonth = new Date().toLocaleString('id-ID', { month: 'short' });
                const currentYear = new Date().getFullYear();
                
                // Find if any response was submitted this month
                const isCurrentMonthFilled = questionnaireData.responses && questionnaireData.responses.some(response => {
                    const responseDate = new Date(response.submittedAt);
                    const responseMonth = responseDate.toLocaleString('id-ID', { month: 'short' });
                    const responseYear = responseDate.getFullYear();
                    return responseMonth === currentMonth && responseYear === currentYear;
                });
                
                setIsFilled(isCurrentMonthFilled);
                
                // Fetch evaluation data (this is a placeholder - you would need to implement this)
                // For now, we'll simulate this data
                setEvaluasi(85); // Placeholder value
                
                setError(null);
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Gagal memuat data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
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

    // ✅ Cek bulan sekarang
    const bulanSekarang = new Date().toLocaleString('id-ID', { month: 'short' });

    if (loading) {
        return (
            <section className="p-6">
                <div className="flex justify-center items-center h-64">
                    <p className="text-lg font-[Judson]">Memuat data...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="p-6">
                <div className="flex justify-center items-center h-64">
                    <p className="text-lg font-[Judson] text-red-500">{error}</p>
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
        </section>
    );
}
