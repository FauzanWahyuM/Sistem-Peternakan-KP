'use client';

import Sidebar from '../../components/UnifiedSidebar';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, Image } from 'lucide-react';
import { useState } from 'react';

export default function TambahPelatihanPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        judul: '',
        deskripsi: '',
        tanggal: '',
        gambar: null
    });

    const handleBack = () => {
        router.back();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        setFormData(prev => ({
            ...prev,
            gambar: file
        }));
    };

    const handleSimpan = async () => {
        // Validasi form
        if (!formData.judul.trim()) {
            alert('Judul harus diisi!');
            return;
        }
        if (!formData.deskripsi.trim()) {
            alert('Deskripsi harus diisi!');
            return;
        }
        if (!formData.tanggal) {
            alert('Tanggal harus diisi!');
            return;
        }

        try {
            setLoading(true);

            // Untuk demo, kita simpan nama file. Dalam implementasi nyata,
            // Anda bisa upload file ke server dan simpan URL-nya
            const gambarName = formData.gambar ? formData.gambar.name : 'default.jpg';

            // In a real implementation, you would get the actual user ID from session/context
            const userId = 'user-id-placeholder'; // This should be replaced with actual user ID

            const newPelatihan = {
                userId: userId,
                judul: formData.judul.trim(),
                deskripsi: formData.deskripsi.trim(),
                tanggal: formData.tanggal,
                gambar: gambarName
            };

            const response = await fetch('/api/training-programs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPelatihan),
            });

            if (!response.ok) {
                throw new Error('Failed to save data');
            }

            const result = await response.json();
            console.log('Pelatihan saved to MongoDB:', result.trainingProgram);
            alert('Pelatihan berhasil ditambahkan!');
            router.push('/dashboard/penyuluh/pelatihan');
        } catch (error) {
            console.error('Error saving pelatihan:', error);
            alert('Terjadi kesalahan saat menyimpan pelatihan!');
        } finally {
            setLoading(false);
        }
    };

    const handleBatal = () => {
        if (formData.judul || formData.deskripsi || formData.tanggal || formData.gambar) {
            if (window.confirm('Data yang sudah diisi akan hilang. Yakin ingin membatalkan?')) {
                router.push('/dashboard/penyuluh/pelatihan');
            }
        } else {
            router.push('/dashboard/penyuluh/pelatihan');
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar userType="penyuluh" />
            <main className="flex-1 p-6">
                {/* Header with Back Button */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <button
                            onClick={handleBack}
                            className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors mr-4"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800">Tambah Pelatihan</h1>
                    </div>
                </div>

                {/* Form */}
                <div className="max-w-4xl">
                    <div className="bg-white rounded-lg shadow p-6 space-y-6">
                        {/* Judul */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Judul <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="judul"
                                value={formData.judul}
                                onChange={handleInputChange}
                                placeholder="Masukkan Judul"
                                className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                required
                            />
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Deskripsi <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="deskripsi"
                                value={formData.deskripsi}
                                onChange={handleInputChange}
                                rows={6}
                                placeholder="Masukkan Deskripsi"
                                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                                required
                            />
                        </div>

                        {/* Gambar Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gambar
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <Image size={32} className="text-gray-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-2">
                                            Please upload square image, size less than 100KB
                                        </p>
                                        <div className="flex items-center justify-center space-x-4">
                                            <label className="bg-green-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-600 transition-colors">
                                                <span>Choose File</span>
                                                <input
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                            </label>
                                            <span className="text-gray-500">
                                                {formData.gambar ? formData.gambar.name : 'No File Chosen'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tanggal */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="tanggal"
                                    value={formData.tanggal}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
                                    required
                                />
                                <Calendar size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                onClick={handleSimpan}
                                disabled={loading}
                                className="bg-green-500 text-white px-8 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                            >
                                {loading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                            <button
                                onClick={handleBatal}
                                disabled={loading}
                                className="bg-red-500 text-white px-8 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}