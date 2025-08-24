"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../components/UnifiedSidebar';
import Header from '../components/Header';
import { ChevronLeft } from 'lucide-react';
import { questions } from '../pertanyaan/questions';
import { Suspense } from 'react';
import '../dashboard.css';

function IsiFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const questionnaireId = searchParams.get('id') || '0';

    const [formData, setFormData] = useState<Record<string, string>>({});

    const handleChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        if (Object.keys(formData).length < questions.length) {
            alert("Mohon isi semua pertanyaan!");
            return;
        }

        const now = new Date();
        const month = now.getMonth() + 1; // Januari = 1
        const year = now.getFullYear();

        try {
            const res = await fetch("/api/kuesioner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionnaireId,
                    userId: "123", // ganti dengan user login
                    month,
                    year,
                    formData,
                }),
            });

            if (res.ok) {
                alert("Kuesioner berhasil disimpan!");
                router.push('/peternak/kuesioner');
            } else {
                alert("Gagal menyimpan jawaban");
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi error saat menyimpan jawaban");
        }
    };


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
                    <h1 className="text-4xl font-[Judson] font-bold text-gray-800 ml-75">Kuesioner</h1>
                </div>

                <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg border border-gray-300 mb-6">
                    <h2 className="text-lg font-semibold mb-2 text-gray-800">Petunjuk:</h2>
                    <p className="mb-2 text-gray-800">Pilihlah angka yang paling sesuai dengan pendapat Anda.</p>
                    <p className="mb-4 text-gray-800">1 = Sangat Tidak Setuju, 2 = Tidak Setuju, 3 = Netral, 4 = Setuju, 5 = Sangat Setuju</p>
                </div>

                {questions.map((q, i) => (
                    <div key={q.id} className="max-w-4xl mx-auto bg-white rounded-lg border border-gray-300 p-6 mb-6">
                        <h3 className="font-semibold mb-6 text-gray-800">{i + 1}. {q.text}</h3>
                        <div className="flex justify-center space-x-6 text-gray-800">
                            {[1, 2, 3, 4, 5].map(val => (
                                <label key={val} className="flex flex-col items-center text-gray-800">
                                    <input
                                        type="radio"
                                        name={q.id}
                                        value={val}
                                        checked={formData[q.id] === String(val)}
                                        onChange={(e) => handleChange(q.id, e.target.value)}
                                        className="w-5 h-5 text-blue-600"
                                    />
                                    <span className="mt-1">{val}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleSubmit}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium ml-88 mb-6"
                >
                    Kirim
                </button>
            </main>
        </div>
    );
}

export default function IsiForm() {
    return (
        <Suspense fallback={<div className="p-6">Loading form...</div>}>
            <IsiFormContent />
        </Suspense>
    );
}
