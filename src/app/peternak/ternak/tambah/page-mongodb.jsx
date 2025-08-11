'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/UnifiedSidebar';
import Header from '../components/Header';
import { ChevronLeft } from 'lucide-react';

export default function TambahTernakPageMongoDB() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        jenisHewan: '',
        jenisKelamin: '',
        umurTernak: '',
        statusTernak: '',
        kondisiKesehatan: ''
    });

    // Data untuk dropdown
    const jenisHewanOptions = ['Sapi', 'Kambing', 'Domba', 'Ayam', 'Bebek'];
    const jenisKelaminOptions = ['Jantan', 'Betina'];
    const kondisiKesehatanOptions = ['Sehat', 'Sakit'];

    // Status ternak berdasarkan jenis hewan dan kelamin
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
            // Reset status ternak jika jenis hewan atau kelamin berubah
            ...(field === 'jenisHewan' || field === 'jenisKelamin' ? { statusTernak: '' } : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // In a real implementation, you would get the actual user ID from session/context
            const userId = 'user-id-placeholder'; // This should be replaced with actual user ID
            
            const newTernak = {
                userId: userId,
                jenisHewan: formData.jenisHewan,
                jenisKelamin: formData.jenisKelamin,
                umurTernak: formData.umurTernak,
                statusTernak: formData.statusTernak,
                kondisiKesehatan: formData.kondisiKesehatan
            };

            const response = await fetch('/api/livestock', {
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
            console.log('Data ternak saved to MongoDB:', result.livestock);
            alert('Data ternak berhasil disimpan!');
            router.push('/peternak/ternak');
        } catch (error) {
            console.error('Error saving ternak data:', error);
            alert('Gagal menyimpan data ternak: ' + error.message);
        }
    };

    const handleCancel = () => {
        router.push('/peternak/ternak');
    };

    const handleBack = () => {
        router.push('/peternak/ternak');
    };

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
                        <h1 className="text-3xl font-bold font-[Judson] text-center flex-1">Tambah Ternak</h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Jenis Hewan */}
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

                        {/* Jenis Kelamin */}
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

                        {/* Umur Ternak */}
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

                        {/* Status Ternak */}
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

                        {/* Kondisi Kesehatan */}
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
                    </form>
                </div>
            </main>
        </div>
    );
}