'use client';

import Sidebar from '../../components/Sidebar';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, Upload, Image } from 'lucide-react';
import { useState } from 'react';

export default function TambahPelatihanPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        judul: '',
        deskripsi: '',
        tanggal: '',
        gambar: null as File | null
    });

    const handleBack = () => {
        router.back();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData(prev => ({
            ...prev,
            gambar: file
        }));
    };

    const handleSimpan = () => {
        // Implementasi save functionality
        console.log('Simpan pelatihan:', formData);
        router.push('/dashboard/pelatihan');
    };

    const handleBatal = () => {
        router.push('/dashboard/pelatihan');
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
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
                                Judul
                            </label>
                            <input
                                type="text"
                                name="judul"
                                value={formData.judul}
                                onChange={handleInputChange}
                                placeholder="Masukkan Judul"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Deskripsi
                            </label>
                            <textarea
                                name="deskripsi"
                                value={formData.deskripsi}
                                onChange={handleInputChange}
                                rows={6}
                                placeholder="Masukkan Deskripsi"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
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
                                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tanggal */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="tanggal"
                                    value={formData.tanggal}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
                                />
                                <Calendar size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                onClick={handleSimpan}
                                className="bg-green-500 text-white px-8 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
                            >
                                Simpan
                            </button>
                            <button
                                onClick={handleBatal}
                                className="bg-red-500 text-white px-8 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
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