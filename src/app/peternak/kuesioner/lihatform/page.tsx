'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/UnifiedSidebar';
import '../dashboard.css';

export default function LihatForm() {
    const router = useRouter();
    const [questionnaireId, setQuestionnaireId] = useState('');
    const [questionnaire, setQuestionnaire] = useState(null);
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Get ID from URL on client side
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            if (id) {
                setQuestionnaireId(id);
                loadResponseData(id);
            } else {
                setError('ID kuesioner tidak ditemukan');
                setLoading(false);
            }
        }
    }, []);

    const loadResponseData = async (id) => {
        try {
            setLoading(true);
            
            // In a real implementation, you would get the actual user ID from session/context
            const userId = 'user-id-placeholder'; // This should be replaced with actual user ID
            
            // Fetch questionnaire
            const questionnaireResponse = await fetch(`/api/questionnaires/${id}`);
            if (!questionnaireResponse.ok) {
                throw new Error('Failed to fetch questionnaire');
            }
            const questionnaireResult = await questionnaireResponse.json();
            setQuestionnaire(questionnaireResult.questionnaire);
            
            // Fetch user response
            const responseResponse = await fetch(`/api/questionnaire-responses?questionnaireId=${id}&userId=${userId}`);
            if (!responseResponse.ok) {
                throw new Error('Failed to fetch response');
            }
            const responseResult = await responseResponse.json();
            
            if (responseResult.responses && responseResult.responses.length > 0) {
                setResponse(responseResult.responses[0]);
            }
            
            setError(null);
        } catch (err) {
            console.error('Error loading response data:', err);
            setError('Gagal memuat data kuesioner');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex">
                <aside className="fixed w-56 h-screen bg-green-700 text-white z-50">
                    <Sidebar userType="peternak" />
                </aside>
                <main className="ml-65 w-full p-6 bg-gray-100 min-h-screen flex items-center justify-center">
                    <div className="text-xl">Memuat data...</div>
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
                <main className="ml-65 w-full p-6 bg-gray-100 min-h-screen">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => router.push('/peternak/kuesioner')}
                            className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full mr-4 transition-colors duration-200"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                        <h1 className="text-4xl font-[Judson] font-bold text-gray-800">Kuesioner</h1>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-xl text-red-600">{error}</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!response) {
        return (
            <div className="flex">
                <aside className="fixed w-56 h-screen bg-green-700 text-white z-50">
                    <Sidebar userType="peternak" />
                </aside>
                <main className="ml-65 w-full p-6 bg-gray-100 min-h-screen">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => router.push('/peternak/kuesioner')}
                            className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full mr-4 transition-colors duration-200"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                        <h1 className="text-4xl font-[Judson] font-bold text-gray-800">Kuesioner</h1>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-xl text-gray-600">Belum ada data kuesioner yang tersimpan.</p>
                        <button
                            onClick={() => router.push(`/peternak/kuesioner/isiform?id=${questionnaireId}`)}
                            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md"
                        >
                            Isi Kuesioner
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // Create a map of responses for easier access
    const responseMap = {};
    if (response.responses) {
        response.responses.forEach(resp => {
            responseMap[resp.pertanyaanId] = resp.jawaban;
        });
    }

    return (
        <div className="flex">
            {/* Sidebar tetap di kiri */}
            <aside className="fixed w-56 h-screen bg-green-700 text-white z-50">
                <Sidebar userType="peternak" />
            </aside>

            {/* Konten utama bergeser ke kanan */}
            <main className="ml-65 w-full p-6 bg-gray-100 min-h-screen">
                {/* Header dengan tombol kembali */}
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => router.push('/peternak/kuesioner')}
                        className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full mr-4 transition-colors duration-200"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                    <h1 className="text-4xl font-[Judson] font-bold text-gray-800">Kuesioner - Hasil Jawaban</h1>
                </div>
                
                <div className="max-w-4xl mx-auto">
                    {questionnaire && (
                        <h2 className="text-2xl font-[Judson] font-bold mb-6 text-gray-700">
                            {questionnaire.judul}
                        </h2>
                    )}
                    
                    {questionnaire && questionnaire.pertanyaan && questionnaire.pertanyaan.map((q, index) => {
                        const questionId = `pertanyaan_${q.id || index}`;
                        const answer = responseMap[questionId] || '';
                        
                        if (q.tipe === 'pilihan_ganda') {
                            return (
                                <div key={q.id || index} className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                                    <h3 className="text-lg font-semibold mb-4">{q.teks}</h3>
                                    <div className="space-y-3">
                                        {q.opsi && q.opsi.map((opsi, opsiIndex) => (
                                            <label key={opsiIndex} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`pertanyaan_${index}_view`}
                                                    checked={answer === opsi}
                                                    readOnly
                                                    className="mr-3 w-4 h-4 text-black"
                                                />
                                                <span className="text-gray-700">{opsi}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        } else if (q.tipe === 'text') {
                            return (
                                <div key={q.id || index} className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                                    <h3 className="text-lg font-semibold mb-4">{q.teks}</h3>
                                    <input
                                        type="text"
                                        value={answer || ''}
                                        readOnly
                                        className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none"
                                    />
                                </div>
                            );
                        }
                        
                        return null;
                    })}
                    
                    {(!questionnaire || !questionnaire.pertanyaan || questionnaire.pertanyaan.length === 0) && (
                        <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                            <p className="text-gray-700">Tidak ada pertanyaan dalam kuesioner ini.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}