'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import '../dashboard.css';

export default function LihatForm() {
    const router = useRouter();
    const [questionnaireId, setQuestionnaireId] = useState('0');
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get ID from URL on client side
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id') || '0';
            setQuestionnaireId(id);
            
            // Ambil data form yang sudah disimpan berdasarkan ID
            try {
                const savedData = localStorage.getItem(`kuesionerFormData_${id}`);
                if (savedData) {
                    setFormData(JSON.parse(savedData));
                }
            } catch (error) {
                console.error('Error loading form data:', error);
            } finally {
                setLoading(false);
            }
        }
    }, []);

    if (loading) {
        return (
            <div className="flex">
                <aside className="fixed w-56 h-screen bg-green-700 text-white z-50">
                    <Sidebar />
                </aside>
                <main className="ml-65 w-full p-6 bg-gray-100 min-h-screen flex items-center justify-center">
                    <div className="text-xl">Memuat data...</div>
                </main>
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="flex">
                <aside className="fixed w-56 h-screen bg-green-700 text-white z-50">
                    <Sidebar />
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

    return (
        <div className="flex">
            {/* Sidebar tetap di kiri */}
            <aside className="fixed w-56 h-screen bg-green-700 text-white z-50">
                <Sidebar />
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
                    {/* Pertanyaan 1 */}
                    <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">Pertanyaan 1</h3>
                        <div className="space-y-3">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="pertanyaan1_view"
                                    checked={formData.pertanyaan1 === 'opsi1'}
                                    readOnly
                                    className="mr-3 w-4 h-4 text-black"
                                />
                                <span className="text-gray-700">Opsi 1</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="pertanyaan1_view"
                                    checked={formData.pertanyaan1 === 'opsi2'}
                                    readOnly
                                    className="mr-3 w-4 h-4 text-black"
                                />
                                <span className="text-gray-700">Opsi 2</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="pertanyaan1_view"
                                    checked={formData.pertanyaan1 === 'opsi3'}
                                    readOnly
                                    className="mr-3 w-4 h-4 text-black"
                                />
                                <span className="text-gray-700">Opsi 3</span>
                            </label>
                        </div>
                    </div>

                    {/* Pertanyaan 2 */}
                    <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">Pertanyaan 2</h3>
                        <div className="space-y-3">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="pertanyaan2_view"
                                    checked={formData.pertanyaan2 === 'opsi1'}
                                    readOnly
                                    className="mr-3 w-4 h-4 text-black"
                                />
                                <span className="text-gray-700">Opsi 1</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="pertanyaan2_view"
                                    checked={formData.pertanyaan2 === 'opsi2'}
                                    readOnly
                                    className="mr-3 w-4 h-4 text-black"
                                />
                                <span className="text-gray-700">Opsi 2</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="pertanyaan2_view"
                                    checked={formData.pertanyaan2 === 'opsi3'}
                                    readOnly
                                    className="mr-3 w-4 h-4 text-black"
                                />
                                <span className="text-gray-700">Opsi 3</span>
                            </label>
                        </div>
                    </div>

                    {/* Pertanyaan 3 */}
                    <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">Pertanyaan 3</h3>
                        <input
                            type="text"
                            value={formData.pertanyaan3 || 'Contoh jawaban'}
                            readOnly
                            className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}