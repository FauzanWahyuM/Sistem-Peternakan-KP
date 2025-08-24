'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../components/UnifiedSidebar';
import { ChevronLeft } from 'lucide-react';
import { questions } from '../pertanyaan/questions';

function LihatFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const questionnaireId = searchParams.get('id') || '0';

    const [formData, setFormData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/kuesioner?questionnaireId=${questionnaireId}&userId=123`);
                if (res.ok) {
                    const data = await res.json();
                    if (data?.answers) {
                        const reconstructed: any = {};
                        data.answers.forEach((a: any) => {
                            reconstructed[a.questionId] = a.answer;
                        });
                        setFormData(reconstructed);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [questionnaireId]);

    if (loading) return <p>Loading...</p>;
    if (!formData) return <p>Tidak ada data</p>;

    return (
        <div className="flex">
            <aside className="fixed w-56 h-screen bg-green-700 text-white z-50">
                <Sidebar userType="peternak" />
            </aside>

            <main className="ml-65 w-full p-6 bg-gray-100 min-h-screen">
                <div className="flex items-center mb-8 max-w-4xl mx-auto">
                    <button
                        onClick={() => router.push('/peternak/kuesioner')}
                        className="mr-4 p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-4xl font-[Judson] font-bold text-gray-800 ml-45">
                        Kuesioner - Hasil Jawaban
                    </h1>
                </div>

                {questions.map((q, i) => (
                    <div key={q.id} className="max-w-4xl mx-auto bg-white rounded-lg border border-gray-300 p-6 mb-6">
                        <h3 className="font-semibold mb-6">{i + 1}. {q.text}</h3>
                        <div className="flex justify-center space-x-6">
                            {[1, 2, 3, 4, 5].map((val) => (
                                <label key={val} className="flex flex-col items-center">
                                    <input
                                        type="radio"
                                        name={q.id}
                                        value={val}
                                        checked={formData[q.id] === String(val)}
                                        disabled
                                        className="w-5 h-5 text-green-600"
                                    />
                                    <span className="mt-1">{val}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}

export default function LihatForm() {
    return (
        <Suspense fallback={<p>Loading halaman...</p>}>
            <LihatFormContent />
        </Suspense>
    );
}
