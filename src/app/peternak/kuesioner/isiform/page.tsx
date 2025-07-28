'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../dashboard.css';

export default function IsiForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const questionnaireId = searchParams.get('id') || '0';
    const [formData, setFormData] = useState({
        pertanyaan1: '',
        pertanyaan2: '',
        pertanyaan3: ''
    });

    const handleRadioChange = (questionName: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [questionName]: value
        }));
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        // Validasi sederhana
        if (!formData.pertanyaan1 || !formData.pertanyaan2 || !formData.pertanyaan3) {
            alert('Mohon lengkapi semua pertanyaan!');
            return;
        }

        // Simpan data form dengan ID yang sesuai
        localStorage.setItem(`kuesionerFormData_${questionnaireId}`, JSON.stringify(formData));
        localStorage.setItem(`kuesioner_filled_${questionnaireId}`, 'true');
        
        alert('Kuesioner berhasil disimpan!');
        router.push('/peternak/kuesioner');
    };

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
                    <h1 className="text-4xl font-[Judson] font-bold text-gray-800">Kuesioner</h1>
                </div>
                
                <div className="max-w-4xl mx-auto">
                    {/* Pertanyaan 1 */}
                    <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">Pertanyaan 1</h3>
                        <div className="space-y-3">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="pertanyaan1"
                                    value="opsi1"
                                    checked={formData.pertanyaan1 === 'opsi1'}
                                    onChange={(e) => handleRadioChange('pertanyaan1', e.target.value)}
                                    className="mr-3 w-4 h-4 text-green-600"
                                />
                                <span className="text-gray-700">Opsi 1</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="pertanyaan1"
                                    value="opsi2"
                                    checked={formData.pertanyaan1 === 'opsi2'}
                                    onChange={(e) => handleRadioChange('pertanyaan1', e.target.value)}
                                    className="mr-3 w-4 h-4 text-green-600"
                                />
                                <span className="text-gray-700">Opsi 1</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="pertanyaan1"
                                    value="opsi3"
                                    checked={formData.pertanyaan1 === 'opsi3'}
                                    onChange={(e) => handleRadioChange('pertanyaan1', e.target.value)}
                                    className="mr-3 w-4 h-4 text-green-600"
                                />
                                <span className="text-gray-700">Opsi 1</span>
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
                                    name="pertanyaan2"
                                    value="opsi1"
                                    checked={formData.pertanyaan2 === 'opsi1'}
                                    onChange={(e) => handleRadioChange('pertanyaan2', e.target.value)}
                                    className="mr-3 w-4 h-4 text-green-600"
                                />
                                <span className="text-gray-700">Opsi 1</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="pertanyaan2"
                                    value="opsi2"
                                    checked={formData.pertanyaan2 === 'opsi2'}
                                    onChange={(e) => handleRadioChange('pertanyaan2', e.target.value)}
                                    className="mr-3 w-4 h-4 text-green-600"
                                />
                                <span className="text-gray-700">Opsi 1</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="pertanyaan2"
                                    value="opsi3"
                                    checked={formData.pertanyaan2 === 'opsi3'}
                                    onChange={(e) => handleRadioChange('pertanyaan2', e.target.value)}
                                    className="mr-3 w-4 h-4 text-green-600"
                                />
                                <span className="text-gray-700">Opsi 1</span>
                            </label>
                        </div>
                    </div>

                    {/* Pertanyaan 3 */}
                    <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">Pertanyaan 3</h3>
                        <textarea
                            name="pertanyaan3"
                            value={formData.pertanyaan3}
                            onChange={handleTextChange}
                            placeholder="Masukkan jawaban disini"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            rows={4}
                        />
                    </div>

                    {/* Tombol Kirim */}
                    <div className="flex justify-start">
                        <button
                            onClick={handleSubmit}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                        >
                            Kirim
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}