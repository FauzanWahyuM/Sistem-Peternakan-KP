// app/peternak/kuesioner/isiform/page.tsx
"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../components/UnifiedSidebar';
import { ChevronLeft } from 'lucide-react';
import { questions } from '../pertanyaan/questions';
import { Suspense } from 'react';
import { useSession } from "next-auth/react";

function IsiFormContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const period = searchParams.get('period');
    const year = searchParams.get('year');

    const [formData, setFormData] = useState<Record<string, string>>({});
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        if (status === "loading") return;
        if (!session?.user?.id) {
            setModalMessage("Anda harus login untuk mengisi kuesioner");
            setShowModal(true);
            return;
        }
        if (Object.keys(formData).length < questions.length) {
            setModalMessage("Mohon isi semua pertanyaan!");
            setShowModal(true);
            return;
        }

        if (!period || !year) {
            setModalMessage("Data periode tidak valid");
            setShowModal(true);
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/kuesioner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    questionnaireId: getQuestionnaireId(),
                    period: period,
                    year: parseInt(year),
                    formData,
                }),
            });

            const result = await res.json();

            if (res.ok) {
                setModalMessage("Kuesioner berhasil disimpan!");
                setShowModal(true);

                // REDIRECT DENGAN PARAMETER SEPERTI YANG DULU - INI YANG MEMBUAT BERHASIL
                setTimeout(() => {
                    router.push(`/peternak/kuesioner?submitted=${period}&year=${year}`);
                }, 1500);
            } else {
                setModalMessage(result.error || "Gagal menyimpan jawaban");
                setShowModal(true);
            }
        } catch (err) {
            console.error(err);
            setModalMessage("Terjadi error saat menyimpan jawaban");
            setShowModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        // Jika pesan sukses dan belum redirect, redirect ke halaman kuesioner
        if (modalMessage === "Kuesioner berhasil disimpan!") {
            router.push(`/peternak/kuesioner`);
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
                    <h1 className="text-4xl font-[Judson] font-bold text-gray-800 ml-5">
                        Kuesioner {getPeriodName()} {year}
                    </h1>
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

                <div className="max-w-4xl mx-auto p-6 mb-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`w-full px-6 py-3 rounded-md font-bold font-[Judson] text-2xl text-center ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Kirim'}
                    </button>
                </div>

                {/* Modal untuk notifikasi */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">{modalMessage}</h3>
                                <button
                                    onClick={closeModal}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-semibold"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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