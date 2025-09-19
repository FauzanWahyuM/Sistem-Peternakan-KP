'use client';

import Sidebar from '../components/UnifiedSidebar';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface KelompokEvaluasi {
    kelompok: string;
    namaKelompok: string;
    statusKelompok: string;
    anggota: any[];
    totalNilai: number;
    jumlahAnggota: number;
    jumlahResponden: number;
    rataRata: number;
    persentaseResponden: number;
    statusEvaluasi: string;
}

export default function HasilEvaluasiPage() {
    const router = useRouter();
    const [evaluasiData, setEvaluasiData] = useState<KelompokEvaluasi[]>([]);
    const [filteredData, setFilteredData] = useState<KelompokEvaluasi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [kelompokFilter, setKelompokFilter] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/hasil-evaluasi');

                if (!response.ok) {
                    throw new Error('Gagal mengambil data evaluasi');
                }

                const data = await response.json();
                setEvaluasiData(data);
                setFilteredData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Apply filter
    useEffect(() => {
        if (kelompokFilter) {
            const filtered = evaluasiData.filter(item =>
                item.kelompok.toLowerCase() === kelompokFilter.toLowerCase()
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(evaluasiData);
        }
    }, [kelompokFilter, evaluasiData]);

    // Get unique filter options from data
    const kelompokOptions = [...new Set(evaluasiData.map(item => item.kelompok))].sort();

    const handleFilterChange = (value: string) => {
        setKelompokFilter(value);
    };

    const clearFilter = () => {
        setKelompokFilter('');
    };

    const handleKelompokClick = (kelompokId: string) => {
        router.push(`/dashboard/penyuluh/hasil-evaluasi/${kelompokId}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Semua Sudah Mengisi': return 'bg-green-100 text-green-800 border border-green-200';
            case 'Sebagian Sudah Mengisi': return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'Belum Ada Responden': return 'bg-gray-100 text-gray-800 border border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const getStatusKelompokColor = (status: string) => {
        switch (status) {
            case 'aktif': return 'bg-green-100 text-green-800 border border-green-200';
            case 'nonaktif': return 'bg-red-100 text-red-800 border border-red-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const getGradeColor = (nilai: number) => {
        if (nilai >= 90) return 'text-green-600';
        if (nilai >= 80) return 'text-blue-600';
        if (nilai >= 70) return 'text-yellow-600';
        if (nilai >= 60) return 'text-orange-600';
        return 'text-red-600';
    };

    const getGradeText = (nilai: number) => {
        if (nilai >= 90) return 'Sangat Baik';
        if (nilai >= 80) return 'Baik';
        if (nilai >= 70) return 'Cukup';
        if (nilai >= 60) return 'Kurang';
        return 'Sangat Kurang';
    };

    const formatNama = (nama: string) => {
        if (!nama) return 'Tidak Ada Nama';
        if (nama.includes('@') || nama.includes('.com') || nama.includes('.ac.id')) {
            const emailParts = nama.split('@')[0].split('.');
            const cleanName = emailParts.map(part =>
                part.charAt(0).toUpperCase() + part.slice(1)
            ).join(' ');
            return cleanName || 'User';
        }
        if (nama.length > 20) return nama.split(' ')[0];
        return nama;
    };

    const formatNamaKelompok = (kelompokId: string, namaKelompok: string) => {
        if (kelompokId === 'Belum Dikelompokkan') {
            return 'Belum Dikelompokkan';
        }
        return namaKelompok || `Kelompok ${kelompokId}`;
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <div className="sticky top-0 h-screen">
                    <Sidebar userType="penyuluh" />
                </div>
                <main className="flex-1 p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Memuat data evaluasi...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <div className="sticky top-0 h-screen">
                    <Sidebar userType="penyuluh" />
                </div>
                <main className="flex-1 p-6">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-red-400 text-xl">⚠️</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium mt-2"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="sticky top-0 h-screen">
                <Sidebar userType="penyuluh" />
            </div>

            <main className="flex-1 p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 text-center">Hasil Evaluasi Kuesioner</h1>
                    <p className="text-gray-600 text-center mt-2">
                        Monitoring dan analisis hasil evaluasi seluruh kelompok
                    </p>
                </div>

                {/* Filters Section */}
                <div className="flex justify-center">
                    <div className="bg-white rounded-lg shadow p-6 mb-6 max-w-2xl w-full">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Filter Kelompok</h3>

                        <div className="flex flex-col md:flex-row gap-4 mb-4 justify-center items-center">
                            {/* Kelompok Filter */}
                            <div className="w-full md:w-2/3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kelompok
                                </label>
                                <div className="relative">
                                    <select
                                        value={kelompokFilter}
                                        onChange={(e) => handleFilterChange(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Semua Kelompok</option>
                                        {kelompokOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option === 'Belum Dikelompokkan' ? 'Belum Dikelompokkan' : `Kelompok ${option}`}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Clear Filter Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={clearFilter}
                                className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                            >
                                Reset Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto">
                    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="rounded-full bg-blue-50 p-3">
                                <span className="text-blue-600 text-2xl">👥</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600 font-medium">Total Kelompok</p>
                                <p className="text-2xl font-bold text-gray-800">{evaluasiData.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="rounded-full bg-green-50 p-3">
                                <span className="text-green-600 text-2xl">✓</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600 font-medium">Total Responden</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {evaluasiData.reduce((sum, kelompok) => sum + kelompok.jumlahResponden, 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="rounded-full bg-purple-50 p-3">
                                <span className="text-purple-600 text-2xl">📊</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600 font-medium">Rata-rata Nilai Keseluruhan</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {evaluasiData.length > 0
                                        ? Math.round(evaluasiData.reduce((sum, kelompok) => sum + kelompok.rataRata, 0) / evaluasiData.length)
                                        : 0
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Summary */}
                {filteredData.length > 0 && (
                    <div className="mb-4 text-sm text-gray-600 text-center">
                        Menampilkan {filteredData.length} dari {evaluasiData.length} kelompok
                    </div>
                )}

                {/* Kelompok Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {filteredData.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <div className="bg-white rounded-xl p-8 shadow-sm border">
                                <span className="text-6xl">📋</span>
                                <h3 className="text-xl font-semibold text-gray-800 mt-4">
                                    {evaluasiData.length === 0
                                        ? 'Belum ada data evaluasi'
                                        : 'Tidak ada data yang sesuai dengan filter yang dipilih'
                                    }
                                </h3>
                                <p className="text-gray-600 mt-2">
                                    {evaluasiData.length === 0
                                        ? 'Data akan muncul setelah peserta mengisi kuesioner'
                                        : 'Coba gunakan filter yang berbeda'
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        filteredData.map((kelompok) => (
                            <div key={kelompok.kelompok} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow flex flex-col">
                                {/* Card Header */}
                                <div className="px-6 py-4 border-b">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">
                                                {formatNamaKelompok(kelompok.kelompok, kelompok.namaKelompok)}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusKelompokColor(kelompok.statusKelompok)} mt-1 inline-block`}>
                                                {kelompok.statusKelompok}
                                            </span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(kelompok.statusEvaluasi)}`}>
                                            {kelompok.statusEvaluasi}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="mr-4">👥 {kelompok.jumlahAnggota} anggota</span>
                                        <span className="text-green-600">✓ {kelompok.jumlahResponden} responden</span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="px-6 py-4 flex-1">
                                    {/* Rata-rata Kelompok */}
                                    <div className="text-center mb-4">
                                        <p className="text-sm text-gray-600 mb-1">Rata-rata Kelompok</p>
                                        <p className={`text-3xl font-bold ${getGradeColor(kelompok.rataRata)}`}>
                                            {kelompok.rataRata}
                                        </p>
                                        <p className={`text-sm ${getGradeColor(kelompok.rataRata)}`}>
                                            {getGradeText(kelompok.rataRata)}
                                        </p>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>Progress Responden</span>
                                            <span>{kelompok.persentaseResponden}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${kelompok.persentaseResponden}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Top Performers */}
                                    {kelompok.jumlahResponden > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Performansi Terbaik:</p>
                                            <div className="space-y-2">
                                                {kelompok.anggota
                                                    .filter(a => a.hasResponse)
                                                    .sort((a, b) => b.nilaiEvaluasi - a.nilaiEvaluasi)
                                                    .slice(0, 3)
                                                    .map((anggota, index) => (
                                                        <div key={anggota._id} className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-700 truncate" title={anggota.nama}>
                                                                {formatNama(anggota.nama)}
                                                            </span>
                                                            <span className={`font-semibold ${getGradeColor(anggota.nilaiEvaluasi)}`}>
                                                                {anggota.nilaiEvaluasi}
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer */}
                                <div className="px-6 py-4 border-t bg-gray-50">
                                    <button
                                        onClick={() => handleKelompokClick(kelompok.kelompok)}
                                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                        Lihat Detail Lengkap
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Info */}
                {filteredData.length > 0 && (
                    <div className="mt-8 text-center">
                        <p className="text-gray-600 text-sm">
                            Menampilkan {filteredData.length} dari {evaluasiData.length} kelompok •
                            Total {evaluasiData.reduce((sum, k) => sum + k.jumlahAnggota, 0)} anggota
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}