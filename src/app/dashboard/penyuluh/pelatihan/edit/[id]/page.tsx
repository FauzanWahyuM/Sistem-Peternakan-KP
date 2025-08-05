'use client';

import Sidebar from '../../../components/Sidebar';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Calendar, Image } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function EditPelatihanPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [formData, setFormData] = useState({
        judul: '',
        deskripsi: '',
        tanggal: '',
        gambar: null as File | null,
        currentGambar: ''
    });

    const pelatihanId = parseInt(params.id as string);

    useEffect(() => {
        // Load data langsung dari localStorage
        if (!pelatihanId || isNaN(pelatihanId)) {
            alert('ID pelatihan tidak valid!');
            router.push('/dashboard/penyuluh/pelatihan');
            return;
        }

        try {
            const data = localStorage.getItem('pelatihan_data');
            if (!data) {
                alert('Data pelatihan tidak ditemukan!');
                router.push('/dashboard/penyuluh/pelatihan');
                return;
            }

            const allPelatihan = JSON.parse(data);
            const pelatihan = allPelatihan.find((p: any) => p.id === pelatihanId);

            if (pelatihan) {
                setFormData({
                    judul: pelatihan.judul || '',
                    deskripsi: pelatihan.deskripsi || '',
                    tanggal: pelatihan.tanggal || '',
                    gambar: null,
                    currentGambar: pelatihan.gambar || ''
                });
            } else {
                alert('Pelatihan tidak ditemukan!');
                router.push('/dashboard/penyuluh/pelatihan');
                return;
            }
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Terjadi kesalahan saat memuat data!');
            router.push('/dashboard/penyuluh/pelatihan');
        } finally {
            setDataLoading(false);
        }
    }, [pelatihanId, router]);

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

            // Update data di localStorage
            const data = localStorage.getItem('pelatihan_data');
            if (!data) {
                alert('Data tidak ditemukan!');
                return;
            }

            const allPelatihan = JSON.parse(data);
            const index = allPelatihan.findIndex((p: any) => p.id === pelatihanId);

            if (index === -1) {
                alert('Pelatihan tidak ditemukan!');
                return;
            }

            // Update data
            const gambarName = formData.gambar ? formData.gambar.name : formData.currentGambar;

            allPelatihan[index] = {
                ...allPelatihan[index],
                judul: formData.judul.trim(),
                deskripsi: formData.deskripsi.trim(),
                tanggal: formData.tanggal,
                gambar: gambarName,
                updatedAt: new Date().toISOString()
            };

            // Simpan kembali ke localStorage
            localStorage.setItem('pelatihan_data', JSON.stringify(allPelatihan));

            alert('Pelatihan berhasil diperbarui!');
            router.push('/dashboard/penyuluh/pelatihan');

        } catch (error) {
            console.error('Error updating pelatihan:', error);
            alert('Terjadi kesalahan saat memperbarui pelatihan!');
        } finally {
            setLoading(false);
        }
    };

    const handleBatal = () => {
        router.push('/dashboard/penyuluh/pelatihan');
    };

    if (dataLoading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-lg text-gray-600">Loading...</div>
                    </div>
                </main>
            </div>
        );
    }

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
                        <h1 className="text-3xl font-bold text-gray-800">Edit Pelatihan</h1>
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
                                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                                        <p className="text-xs text-gray-500 mb-3">
                                            Gambar saat ini: {formData.currentGambar}
                                        </p>
                                        <div className="flex items-center justify-center space-x-4">
                                            <label className="bg-green-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-600 transition-colors">
                                                <span>Choose New File</span>
                                                <input
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                            </label>
                                            <span className="text-gray-500">
                                                {formData.gambar ? formData.gambar.name : 'No New File Chosen'}
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10 text-black"
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