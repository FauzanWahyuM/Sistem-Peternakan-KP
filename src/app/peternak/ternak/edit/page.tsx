'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../components/UnifiedSidebar';
import { ChevronLeft } from 'lucide-react';

function EditTernakContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const ternakId = searchParams?.get('id');
    
    const [formData, setFormData] = useState({
        jenisHewan: '',
        jenisKelamin: '',
        umurTernak: '',
        statusTernak: '',
        kondisiKesehatan: ''
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Data untuk dropdown
    const kondisiKesehatanOptions = ['Sehat', 'Sakit'];

    // Status ternak berdasarkan jenis hewan dan kelamin (sama seperti form tambah)
    const getStatusTernakOptions = () => {
        const { jenisHewan, jenisKelamin } = formData;
        
        if (!jenisHewan || !jenisKelamin) return [];

        const statusOptions = {
            'Sapi': {
                'Jantan': ['Pejantan', 'Sapi Potong', 'Sapi Kerja', 'Bibit', 'Penggemukan'],
                'Betina': ['Indukan', 'Sapi Perah', 'Sapi Potong', 'Bibit', 'Dara']
            },
            'Kambing': {
                'Jantan': ['Pejantan', 'Kambing Potong', 'Bibit', 'Penggemukan', 'Kambing Kerja'],
                'Betina': ['Indukan', 'Kambing Perah', 'Kambing Potong', 'Bibit', 'Dara']
            },
            'Domba': {
                'Jantan': ['Pejantan', 'Domba Potong', 'Bibit', 'Penggemukan', 'Domba Wol'],
                'Betina': ['Indukan', 'Domba Potong', 'Bibit', 'Dara', 'Domba Wol']
            },
            'Ayam': {
                'Jantan': ['Pejantan', 'Ayam Potong', 'Ayam Aduan', 'Bibit', 'Ayam Hias'],
                'Betina': ['Indukan', 'Ayam Petelur', 'Ayam Potong', 'Bibit', 'Ayam Hias']
            },
            'Bebek': {
                'Jantan': ['Pejantan', 'Bebek Potong', 'Bibit', 'Bebek Hias', 'Penggemukan'],
                'Betina': ['Indukan', 'Bebek Petelur', 'Bebek Potong', 'Bibit', 'Bebek Hias']
            }
        };

        return statusOptions[jenisHewan]?.[jenisKelamin] || [];
    };

    // Load data ternak yang akan diedit
    useEffect(() => {
        if (!ternakId) {
            alert('ID ternak tidak ditemukan!');
            router.push('/peternak/ternak');
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/livestock/${ternakId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                
                const result = await response.json();
                setFormData({
                    jenisHewan: result.livestock.jenisHewan,
                    jenisKelamin: result.livestock.jenisKelamin,
                    umurTernak: result.livestock.umurTernak,
                    statusTernak: result.livestock.statusTernak,
                    kondisiKesehatan: result.livestock.kondisiKesehatan
                });
                setError(null);
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Gagal memuat data ternak');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [ternakId, router]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`/api/livestock/${ternakId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update data');
            }
            
            const result = await response.json();
            console.log('Data ternak updated:', result.livestock);
            alert('Data ternak berhasil diperbarui!');
            router.push('/peternak/ternak/lihat');
        } catch (error) {
            console.error('Error updating ternak data:', error);
            alert('Gagal memperbarui data ternak: ' + error.message);
        }
    };

    const handleCancel = () => {
        router.push('/peternak/ternak/lihat');
    };

    const handleBack = () => {
        router.push('/peternak/ternak/lihat');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen">
                <Sidebar userType="peternak" />
                <main className="flex-1 bg-gray-100 p-6">
                    <div className="flex items-center justify-center h-full">
                        <p className="text-lg font-[Judson]">Memuat data...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen">
                <Sidebar userType="peternak" />
                <main className="flex-1 bg-gray-100 p-6">
                    <div className="flex items-center justify-center h-full">
                        <p className="text-lg font-[Judson] text-red-500">{error}</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar userType="peternak" />
            <main className="flex-1 bg-gray-100 p-6">
                <div className="max-w-2xl mx-auto">
                    {/* Back Button dan Header */}
                    <div className="flex items-center mb-8">
                        <button
                            onClick={handleBack}
                            className="mr-4 p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-3xl font-bold font-[Judson] text-center flex-1">Edit Data Ternak</h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Jenis Hewan - Disabled */}
                        <div>
                            <label className="block text-lg font-medium font-[Judson] text-gray-700 mb-2">
                                Jenis Hewan
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.jenisHewan}
                                    disabled
                                    className="w-full p-4 border border-gray-300 rounded-lg bg-gray-100 font-[Judson] text-gray-500 appearance-none cursor-not-allowed"
                                >
                                    <option value={formData.jenisHewan}>{formData.jenisHewan}</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Jenis Kelamin - Disabled */}
                        <div>
                            <label className="block text-lg font-medium font-[Judson] text-gray-700 mb-2">
                                Jenis Kelamin
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.jenisKelamin}
                                    disabled
                                    className="w-full p-4 border border-gray-300 rounded-lg bg-gray-100 font-[Judson] text-gray-500 appearance-none cursor-not-allowed"
                                >
                                    <option value={formData.jenisKelamin}>{formData.jenisKelamin}</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Umur Ternak - Editable */}
                        <div>
                            <label className="block text-lg font-medium font-[Judson] text-gray-700 mb-2">
                                Umur Ternak
                            </label>
                            <input
                                type="text"
                                value={formData.umurTernak}
                                onChange={(e) => handleInputChange('umurTernak', e.target.value)}
                                placeholder="Masukkan Umur Ternak"
                                className="w-full p-4 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        {/* Status Ternak - Editable */}
                        <div>
                            <label className="block text-lg font-medium font-[Judson] text-gray-700 mb-2">
                                Status Ternak
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.statusTernak}
                                    onChange={(e) => handleInputChange('statusTernak', e.target.value)}
                                    className="w-full p-4 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    <option value="">Masukkan Status Ternak</option>
                                    {getStatusTernakOptions().map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Kondisi Kesehatan - Editable */}
                        <div>
                            <label className="block text-lg font-medium font-[Judson] text-gray-700 mb-2">
                                Kondisi Kesehatan
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.kondisiKesehatan}
                                    onChange={(e) => handleInputChange('kondisiKesehatan', e.target.value)}
                                    className="w-full p-4 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    <option value="">Masukkan Kondisi Kesehatan</option>
                                    {kondisiKesehatanOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium font-[Judson] text-lg"
                            >
                                Simpan Perubahan
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium font-[Judson] text-lg"
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

// Main page component
export default function EditTernakPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditTernakContent />
        </Suspense>
    );
}