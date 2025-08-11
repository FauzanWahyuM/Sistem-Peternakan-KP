'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/UnifiedSidebar';
import Header from '../components/Header';
import '../dashboard.css';

export default function IsiForm() {
    const router = useRouter();
    const [questionnaireId, setQuestionnaireId] = useState('');
    const [questionnaire, setQuestionnaire] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        // Get ID from URL on client side
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            if (id) {
                setQuestionnaireId(id);
                loadQuestionnaire(id);
            } else {
                setError('ID kuesioner tidak ditemukan');
                setLoading(false);
            }
        }
    }, []);

    const loadQuestionnaire = async (id) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/questionnaires/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch questionnaire');
            }
            const result = await response.json();
            setQuestionnaire(result.questionnaire);
            
            // Initialize form data with empty values
            const initialFormData = {};
            if (result.questionnaire.pertanyaan) {
                result.questionnaire.pertanyaan.forEach((q, index) => {
                    initialFormData[`pertanyaan_${q.id || index}`] = '';
                });
            }
            setFormData(initialFormData);
            
            setError(null);
        } catch (err) {
            console.error('Error loading questionnaire:', err);
            setError('Gagal memuat kuesioner');
        } finally {
            setLoading(false);
        }
    };

    const handleRadioChange = (questionId, value) => {
        setFormData(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        // Validasi sederhana
        const hasEmptyAnswer = Object.values(formData).some(value => !value);
        if (hasEmptyAnswer) {
            alert('Mohon lengkapi semua pertanyaan!');
            return;
        }

        try {
            // In a real implementation, you would get the actual user ID from session/context
            const userId = 'user-id-placeholder'; // This should be replaced with actual user ID
            
            // Prepare response data
            const responses = Object.entries(formData).map(([questionId, jawaban]) => ({
                pertanyaanId: questionId,
                jawaban
            }));
            
            const responsePayload = {
                questionnaireId,
                userId,
                responses
            };
            
            // Save response to database
            const response = await fetch('/api/questionnaire-responses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(responsePayload),
            });
            
            if (!response.ok) {
                throw new Error('Failed to save response');
            }
            
            alert('Kuesioner berhasil disimpan!');
            router.push('/peternak/kuesioner');
        } catch (error) {
            console.error('Error saving response:', error);
            alert('Gagal menyimpan kuesioner: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex">
                {/* Sidebar tetap di kiri */}
                <aside className="fixed w-56 h-screen bg-green-700 text-white z-50">
                    <Sidebar userType="peternak" />
                </aside>

                {/* Konten utama bergeser ke kanan */}
                <main className="ml-65 w-full p-6 bg-gray-100 min-h-screen">
                    <div className="flex items-center justify-center h-full">
                        <p className="text-lg font-[Judson]">Memuat kuesioner...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex">
                {/* Sidebar tetap di kiri */}
                <aside className="fixed w-56 h-screen bg-green-700 text-white z-50">
                    <Sidebar userType="peternak" />
                </aside>

                {/* Konten utama bergeser ke kanan */}
                <main className="ml-65 w-full p-6 bg-gray-100 min-h-screen">
                    <div className="flex items-center justify-center h-full">
                        <p className="text-lg font-[Judson] text-red-500">{error}</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!questionnaire) {
        return (
            <div className="flex">
                {/* Sidebar tetap di kiri */}
                <aside className="fixed w-56 h-screen bg-green-700 text-white z-50">
                    <Sidebar userType="peternak" />
                </aside>

                {/* Konten utama bergeser ke kanan */}
                <main className="ml-65 w-full p-6 bg-gray-100 min-h-screen">
                    <div className="flex items-center justify-center h-full">
                        <p className="text-lg font-[Judson]">Kuesioner tidak ditemukan</p>
                    </div>
                </main>
            </div>
        );
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
                    <h1 className="text-4xl font-[Judson] font-bold text-gray-800">Kuesioner</h1>
                </div>
                
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-[Judson] font-bold mb-6 text-gray-700">
                        {questionnaire.judul}
                    </h2>
                    
                    {questionnaire.pertanyaan && questionnaire.pertanyaan.map((q, index) => {
                        const questionId = `pertanyaan_${q.id || index}`;
                        
                        if (q.tipe === 'pilihan_ganda') {
                            return (
                                <div key={q.id || index} className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                                    <h3 className="text-lg font-semibold mb-4">{q.teks}</h3>
                                    <div className="space-y-3">
                                        {q.opsi && q.opsi.map((opsi, opsiIndex) => (
                                            <label key={opsiIndex} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={questionId}
                                                    value={opsi}
                                                    checked={formData[questionId] === opsi}
                                                    onChange={(e) => handleRadioChange(questionId, e.target.value)}
                                                    className="mr-3 w-4 h-4 text-green-600"
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
                                    <textarea
                                        name={questionId}
                                        value={formData[questionId] || ''}
                                        onChange={handleTextChange}
                                        placeholder="Masukkan jawaban disini"
                                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                        rows={4}
                                    />
                                </div>
                            );
                        }
                        
                        return null;
                    })}
                    
                    {(!questionnaire.pertanyaan || questionnaire.pertanyaan.length === 0) && (
                        <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                            <p className="text-gray-700">Tidak ada pertanyaan dalam kuesioner ini.</p>
                        </div>
                    )}

                    {/* Tombol Kirim */}
                    <div className="flex justify-start">
                        <button
                            onClick={handleSubmit}
                            disabled={!questionnaire.pertanyaan || questionnaire.pertanyaan.length === 0}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50"
                        >
                            Kirim
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}