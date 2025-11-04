// app/peternak/kuesioner/lihatform/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../components/UnifiedSidebar';
import { ChevronLeft } from 'lucide-react';
import { questions } from '../pertanyaan/questions';
// Hapus import dashboard.css yang error

function LihatFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const period = searchParams.get('period');
    const year = searchParams.get('year');

    const [formData, setFormData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Map period to questionnaireId
    const getQuestionnaireId = () => {
        if (period === 'jan-jun') return 'Januari';
        if (period === 'jul-des') return 'Juli';
        return 'Default';
    };

    // Get period name for display
    const getPeriodName = () => {
        if (period === 'jan-jun') return 'Periode Januari-Juni';
        if (period === 'jul-des') return 'Periode Juli-Desember';
        return 'Periode';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!period || !year) {
                    setError('Data periode tidak valid');
                    setLoading(false);
                    return;
                }

                const questionnaireId = getQuestionnaireId();
                console.log('Fetching data for:', { questionnaireId, period, year });

                const res = await fetch(
                    `/api/kuesioner?questionnaireId=${questionnaireId}&period=${period}&year=${year}&detail=true`,
                    {
                        credentials: 'include',
                    }
                );

                if (res.ok) {
                    const data = await res.json();
                    console.log('API Response:', data);

                    if (data?.answers) {
                        const reconstructed: Record<string, string> = {};
                        data.answers.forEach((a: any) => {
                            reconstructed[a.questionId] = a.answer;
                        });
                        setFormData(reconstructed);
                    } else {
                        setError('Tidak ada data jawaban ditemukan');
                    }
                } else {
                    setError('Gagal mengambil data dari server');
                }
            } catch (err) {
                console.error(err);
                setError('Terjadi error saat mengambil data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [period, year]);

    if (loading) {
        return (
            <div className="flex">
                <aside className="fixed w-56 h-screen bg-green-700 text-white z-50">
                    <Sidebar userType="peternak" />
                </aside>
                <main className="ml-56 w-full p-6 bg-gray-100 min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Memuat data...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex">
                <aside className="fixed w-56 h-screen bg-green-700 text-white z-50">
                    <Sidebar userType="peternak" />
                </aside>
                <main className="ml-56 w-full p-6 bg-gray-100 min-h-screen">
                    <div className="flex items-center mb-8 max-w-4xl mx-auto">
                        <button
                            onClick={() => router.push('/peternak/kuesioner')}
                            className="mr-4 p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-4xl font-[Judson] font-bold text-gray-800">Kuesioner - Hasil Jawaban</h1>
                    </div>
                    <div className="max-w-4xl mx-auto bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <p className="text-red-700">{error}</p>
                    </div>
                </main>
            </div>
        );
    }

    if (Object.keys(formData).length === 0) {
        return (
            <div className="flex">
                <aside className="fixed w-56 h-screen bg-green-700 text-white z-50">
                    <Sidebar userType="peternak" />
                </aside>
                <main className="ml-56 w-full p-6 bg-gray-100 min-h-screen">
                    <div className="flex items-center mb-8 max-w-4xl mx-auto">
                        <button
                            onClick={() => router.push('/peternak/kuesioner')}
                            className="mr-4 p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-4xl font-[Judson] font-bold text-gray-800">Kuesioner - Hasil Jawaban</h1>
                    </div>
                    <div className="max-w-4xl mx-auto bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                        <p className="text-yellow-700">Tidak ada data jawaban ditemukan untuk periode ini.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex">
            <aside className="fixed w-56 h-screen bg-green-700 text-white z-50">
                <Sidebar userType="peternak" />
            </aside>

            <main className="ml-56 w-full p-6 bg-gray-100 min-h-screen">
                <div className="flex items-center mb-8 max-w-4xl mx-auto">
                    <button
                        onClick={() => router.push('/peternak/kuesioner')}
                        className="mr-4 p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-4xl font-[Judson] font-bold text-gray-800">
                        Kuesioner {getPeriodName()} {year} - Hasil Jawaban
                    </h1>
                </div>

                {questions.map((q, i) => (
                    <div key={q.id} className="max-w-4xl mx-auto bg-white rounded-lg border border-gray-300 p-6 mb-6">
                        <h3 className="font-semibold mb-6 text-gray-800">{i + 1}. {q.text}</h3>
                        <div className="flex justify-center space-x-6 text-gray-800">
                            {[1, 2, 3, 4, 5].map((val) => (
                                <label key={val} className="flex flex-col items-center text-gray-800">
                                    <input
                                        type="radio"
                                        name={q.id}
                                        value={val}
                                        checked={formData[q.id] === String(val)}
                                        readOnly
                                        className="w-5 h-5 text-green-600"
                                    />
                                    <span className="mt-1">{val}</span>
                                </label>
                            ))}
                        </div>
                        {formData[q.id] && (
                            <div className="mt-4 text-center">
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                    Jawaban: {formData[q.id]}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </main>
        </div>
    );
}

export default function LihatForm() {
    return (
        <Suspense fallback={
            <div className="p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-center mt-2">Loading halaman...</p>
            </div>
        }>
            <LihatFormContent />
        </Suspense>
    );
}