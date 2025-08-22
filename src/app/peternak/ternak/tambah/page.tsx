'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/UnifiedSidebar';
import { ChevronLeft, CheckCircle, XCircle } from 'lucide-react';

export default function TambahTernakPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        jenisHewan: '',
        jenisKelamin: '',
        umurTernak: '',
        statusTernak: '',
        kondisiKesehatan: ''
    });

    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [message, setMessage] = useState('');

    const jenisHewanOptions = ['Sapi', 'Kambing', 'Domba', 'Ayam', 'Bebek'];
    const jenisKelaminOptions = ['Jantan', 'Betina'];
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

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
            ...(field === 'jenisHewan' || field === 'jenisKelamin' ? { statusTernak: '' } : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 👉 nanti bisa diganti dengan id user login
            const userId = 'user-id-placeholder';

            const newTernak = {
                userId,
                ...formData
            };

            const response = await fetch('/api/ternak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTernak),
            });

            if (!response.ok) {
                throw new Error('Failed to save data');
            }

            const result = await response.json();
            console.log('Data ternak saved to MongoDB:', result);

            setMessage('Data ternak berhasil disimpan!');
            setIsSuccessOpen(true);
        } catch (error) {
            console.error('Error saving ternak data:', error);
            setMessage('Gagal menyimpan data ternak: ' + error.message);
            setIsErrorOpen(true);
        }
    };

    const handleCancel = () => {
        router.push('/peternak/ternak');
    };

    const handleBack = () => {
        router.push('/peternak/ternak');
    };

    const closeSuccess = () => {
        setIsSuccessOpen(false);
        router.push('/peternak/ternak');
    };

    const closeError = () => {
        setIsErrorOpen(false);
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar userType="peternak" />
            <main className="flex-1 bg-gray-100 p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center mb-8">
                        <button 
                            onClick={handleBack}
                            className="mr-4 p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-3xl font-bold font-[Judson] text-gray-800 text-center flex-1">Tambah Ternak</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-lg font-medium font-[Judson] text-gray-700 mb-2">
                                Jenis Hewan
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.jenisHewan}
                                    onChange={(e) => handleInputChange('jenisHewan', e.target.value)}
                                    className="w-full p-4 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    <option value="">Masukkan Jenis Hewan</option>
                                    {jenisHewanOptions.map((option) => (
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

                        <div>
                            <label className="block text-lg font-medium font-[Judson] text-gray-700 mb-2">
                                Jenis Kelamin
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.jenisKelamin}
                                    onChange={(e) => handleInputChange('jenisKelamin', e.target.value)}
                                    className="w-full p-4 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    <option value="">Masukkan Jenis Kelamin</option>
                                    {jenisKelaminOptions.map((option) => (
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
                                    disabled={!formData.jenisHewan || !formData.jenisKelamin}
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

                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                className="flex-1 bg-green-500 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium font-[Judson] text-lg"
                            >
                                Simpan
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 bg-red-500 hover:bg-red-900 text-white py-3 px-6 rounded-lg font-medium font-[Judson] text-lg"
                            >
                                Batal
                            </button>
                        </div>

                        {/* Modal Success */}
                        {isSuccessOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                                <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative text-center">
                                    <div className="flex justify-center text-green-600 mb-4">
                                        <CheckCircle size={48} />
                                    </div>
                                    <h2 className="text-lg font-bold text-green-600 mb-4">Berhasil</h2>
                                    <p className="text-gray-700 mb-6">{message}</p>
                                    <button
                                        onClick={closeSuccess}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Modal Error */}
                        {isErrorOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                                <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative text-center">
                                    <div className="flex justify-center text-red-600 mb-4">
                                        <XCircle size={48} />
                                    </div>
                                    <h2 className="text-lg font-bold text-red-600 mb-4">Gagal</h2>
                                    <p className="text-gray-700 mb-6">{message}</p>
                                    <button
                                        onClick={closeError}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
}