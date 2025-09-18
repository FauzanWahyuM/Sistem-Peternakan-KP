'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../components/UnifiedSidebar';
import { ChevronLeft, CheckCircle, Plus, X } from 'lucide-react';

function EditTernakContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const ternakId = searchParams?.get('id');

    const [formData, setFormData] = useState({
        jenisHewan: '',
        jenisKelamin: '',
        umurTernak: '',
        statusTernak: '',
        kondisiKesehatan: '',
        penyakit: [] as string[]
    });

    const [newPenyakit, setNewPenyakit] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const kondisiKesehatanOptions = ['Sehat', 'Sakit'];

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

    // Fungsi untuk menambah penyakit
    const addPenyakit = () => {
        if (newPenyakit.trim() && !formData.penyakit.includes(newPenyakit.trim())) {
            setFormData(prev => ({
                ...prev,
                penyakit: [...prev.penyakit, newPenyakit.trim()]
            }));
            setNewPenyakit('');
        }
    };

    // Fungsi untuk menghapus penyakit
    const removePenyakit = (index: number) => {
        setFormData(prev => ({
            ...prev,
            penyakit: prev.penyakit.filter((_, i) => i !== index)
        }));
    };

    useEffect(() => {
        if (!ternakId) {
            alert('ID ternak tidak ditemukan!');
            router.push('/peternak/ternak');
            return;
        }
        const loadData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/ternak?id=${ternakId}`);
                if (!response.ok) throw new Error('Failed to fetch data');
                const result = await response.json();

                setFormData({
                    jenisHewan: result.jenisHewan,
                    jenisKelamin: result.jenisKelamin,
                    umurTernak: result.umurTernak,
                    statusTernak: result.statusTernak,
                    kondisiKesehatan: result.kondisiKesehatan,
                    penyakit: result.penyakit || []
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

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/ternak`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: ternakId,
                    ...formData
                }),
            });
            if (!response.ok) throw new Error('Failed to update data');

            const result = await response.json();
            console.log('Data ternak updated:', result);

            // 🔔 tampilkan modal sukses
            setShowSuccessModal(true);

            // setelah 2 detik, redirect ke lihat data
            setTimeout(() => {
                setShowSuccessModal(false);
                router.push('/peternak/ternak/lihat');
            }, 2000);
        } catch (error: any) {
            console.error('Error updating ternak data:', error);
            alert('Gagal memperbarui data ternak: ' + error.message);
        }
    };

    const handleCancel = () => router.push('/peternak/ternak/lihat');
    const handleBack = () => router.push('/peternak/ternak/lihat');

    if (loading) {
        return (
            <div className="flex min-h-screen">
                <Sidebar userType="peternak" />
                <main className="flex-1 bg-gray-100 p-6 flex items-center justify-center">
                    <p className="text-lg font-[Judson]">Memuat data...</p>
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
                        <h1 className="text-3xl font-bold font-[Judson] text-gray-800 text-center flex-1">Edit Data Ternak</h1>
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
                                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Field Penyakit yang Pernah Menyerang */}
                        <div>
                            <label className="block text-lg font-medium font-[Judson] text-gray-700 mb-2">
                                Penyakit yang Pernah Menyerang
                            </label>
                            <div className="space-y-3">
                                {/* Input untuk menambah penyakit baru */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newPenyakit}
                                        onChange={(e) => setNewPenyakit(e.target.value)}
                                        placeholder="Masukkan nama penyakit"
                                        className="flex-1 p-4 border border-gray-300 rounded-lg bg-white font-[Judson] text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addPenyakit();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={addPenyakit}
                                        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg font-medium font-[Judson] flex items-center justify-center"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                {/* Daftar penyakit yang sudah ditambahkan */}
                                {formData.penyakit.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-medium text-gray-700 mb-2 font-[Judson]">
                                            Daftar Penyakit:
                                        </h4>
                                        <div className="space-y-2">
                                            {formData.penyakit.map((penyakit, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                                                    <span className="font-[Judson] text-black">{penyakit}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removePenyakit(index)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
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

                        {/* 🔔 Modal sukses */}
                        {showSuccessModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                                <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative text-center">

                                    {/* Icon centang */}
                                    <div className="flex justify-center text-green-600 mb-4">
                                        <CheckCircle size={48} />
                                    </div>

                                    {/* Judul */}
                                    <h2 className="text-lg font-bold text-green-600 mb-4">Berhasil</h2>

                                    {/* Pesan */}
                                    <p className="text-gray-700 mb-6">Data berhasil diubah!</p>

                                    {/* Tombol OK full width */}
                                    <button
                                        onClick={() => {
                                            setShowSuccessModal(false);
                                            router.push("/peternak/ternak/lihat");
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-6 text-center">
                                <p className="text-red-500 font-[Judson]">{error}</p>
                            </div>
                        )}
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