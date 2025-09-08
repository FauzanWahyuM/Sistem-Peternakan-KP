'use client';

import Sidebar from '../../components/UnifiedSidebar';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AnggotaEvaluasi {
    _id: string;
    nama: string;
    nilaiEvaluasi: number;
    hasResponse: boolean;
    status: string;
    bulan: number | null;
    tahun: number | null;
    bulanSingkat: string;
    questionnaireId: string | null;
    userId: string;
}

interface KelompokEvaluasiDetail {
    kelompok: string;
    anggota: AnggotaEvaluasi[];
    totalNilai: number;
    jumlahAnggota: number;
    jumlahResponden: number;
    rataRata: number;
    persentaseResponden: number;
    status: string;
}

export default function DetailHasilEvaluasiPage() {
    const router = useRouter();
    const params = useParams();
    const kelompokId = params?.id as string;

    const [kelompokData, setKelompokData] = useState<KelompokEvaluasiDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAnggota, setSelectedAnggota] = useState<AnggotaEvaluasi | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/hasil-evaluasi/${kelompokId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Data evaluasi kelompok tidak ditemukan');
                    }
                    throw new Error('Gagal mengambil data evaluasi');
                }

                const data = await response.json();
                setKelompokData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
            } finally {
                setLoading(false);
            }
        };

        if (kelompokId) {
            fetchData();
        }
    }, [kelompokId]);

    const handleBack = () => {
        router.back();
    };

    const handleAnggotaClick = (anggota: AnggotaEvaluasi) => {
        setSelectedAnggota(anggota);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Semua Sudah Mengisi': return 'bg-green-500';
            case 'Sebagian Sudah Mengisi': return 'bg-blue-500';
            case 'Belum Ada Responden': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    const getGradeColor = (nilai: number) => {
        if (nilai >= 90) return 'text-green-600 bg-green-50';
        if (nilai >= 80) return 'text-blue-600 bg-blue-50';
        if (nilai >= 70) return 'text-yellow-600 bg-yellow-50';
        if (nilai >= 60) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
    };

    const getBarColor = (nilai: number) => {
        if (nilai >= 90) return 'bg-green-500';
        if (nilai >= 80) return 'bg-blue-500';
        if (nilai >= 70) return 'bg-yellow-500';
        if (nilai >= 60) return 'bg-orange-500';
        return 'bg-red-500';
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
        return nama;
    };

    // Fungsi untuk menghitung distribusi nilai
    const calculateScoreDistribution = () => {
        if (!kelompokData) return [];

        const distribution = [
            { range: '90-100%', count: 0, color: 'bg-green-500' },
            { range: '80-89%', count: 0, color: 'bg-blue-500' },
            { range: '70-79%', count: 0, color: 'bg-yellow-500' },
            { range: '60-69%', count: 0, color: 'bg-orange-500' },
            { range: '0-59%', count: 0, color: 'bg-red-500' }
        ];

        kelompokData.anggota.forEach(anggota => {
            if (anggota.hasResponse) {
                if (anggota.nilaiEvaluasi >= 90) distribution[0].count++;
                else if (anggota.nilaiEvaluasi >= 80) distribution[1].count++;
                else if (anggota.nilaiEvaluasi >= 70) distribution[2].count++;
                else if (anggota.nilaiEvaluasi >= 60) distribution[3].count++;
                else distribution[4].count++;
            }
        });

        return distribution;
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

    if (!kelompokData) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <div className="sticky top-0 h-screen">
                    <Sidebar userType="penyuluh" />
                </div>
                <main className="flex-1 p-6">
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">Data evaluasi tidak ditemukan.</p>
                    </div>
                </main>
            </div>
        );
    }

    const scoreDistribution = calculateScoreDistribution();
    const maxCount = Math.max(...scoreDistribution.map(item => item.count), 1);
    const totalResponden = kelompokData.jumlahResponden;

    // Data untuk grafik batang per user
    const userChartData = kelompokData.anggota
        .filter(anggota => anggota.hasResponse)
        .sort((a, b) => b.nilaiEvaluasi - a.nilaiEvaluasi);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="sticky top-0 h-screen">
                <Sidebar userType="penyuluh" />
            </div>

            <main className="flex-1 p-6">
                {/* Back Button and Header */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <button
                            onClick={handleBack}
                            className={`flex items-center justify-center w-10 h-10 ${getStatusColor(kelompokData.status)} text-white rounded-full transition-colors mr-4`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center">
                            <h1 className="text-3xl font-bold text-gray-800 mr-4">
                                Hasil Evaluasi - {kelompokData.kelompok === 'Belum Dikelompokkan' ? 'Belum Dikelompokkan' : `Kelompok ${kelompokData.kelompok}`}
                            </h1>
                            <span className={`${getStatusColor(kelompokData.status)} text-white px-4 py-2 rounded-full text-sm font-medium`}>
                                {kelompokData.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Statistik Kelompok */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600">{kelompokData.jumlahAnggota}</div>
                        <p className="text-gray-600">Total Anggota</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <div className="text-3xl font-bold text-green-600">{kelompokData.jumlahResponden}</div>
                        <p className="text-gray-600">Sudah Mengisi</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <div className="text-3xl font-bold text-yellow-600">{kelompokData.jumlahAnggota - kelompokData.jumlahResponden}</div>
                        <p className="text-gray-600">Belum Mengisi</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <div className={`text-3xl font-bold ${getGradeColor(kelompokData.rataRata).split(' ')[0]}`}>
                            {kelompokData.rataRata}%
                        </div>
                        <p className="text-gray-600">Rata-rata Nilai</p>
                    </div>
                </div>

                {/* Daftar Anggota */}
                <div className="bg-white rounded-lg shadow-lg mb-8">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Daftar Anggota</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Nama</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Nilai</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Periode</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kelompokData.anggota.map((anggota) => (
                                    <tr
                                        key={anggota._id}
                                        className="border-b hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleAnggotaClick(anggota)}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center">
                                                <div className={`w-3 h-3 rounded-full mr-3 ${anggota.hasResponse ? 'bg-green-400' : 'bg-gray-300'}`} />
                                                <span className="font-medium text-gray-900">{formatNama(anggota.nama)}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {anggota.hasResponse ? (
                                                <span className={`font-bold ${getGradeColor(anggota.nilaiEvaluasi).split(' ')[0]}`}>
                                                    {anggota.nilaiEvaluasi}%
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            {anggota.hasResponse ? (
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeColor(anggota.nilaiEvaluasi)}`}>
                                                    {getGradeText(anggota.nilaiEvaluasi)}
                                                </span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                                                    Belum Mengisi
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            {anggota.hasResponse ? `${anggota.bulanSingkat} ${anggota.tahun}` : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Grafik Performa */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Grafik Performa Kelompok</h2>

                    {/* Grafik Batang untuk Setiap User */}
                    <div className="mb-8">
                        <h3 className="font-semibold mb-4 text-gray-700">Nilai Evaluasi per Anggota</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            {userChartData.length > 0 ? (
                                <div className="space-y-4">
                                    {userChartData.map((anggota, index) => (
                                        <div key={anggota._id} className="flex items-center">
                                            <div className="w-40 text-sm text-gray-900 font-medium truncate">
                                                {formatNama(anggota.nama)}
                                            </div>
                                            <div className="flex-1 ml-2">
                                                <div className="flex items-center">
                                                    <div
                                                        className={`h-6 rounded-l ${getBarColor(anggota.nilaiEvaluasi)}`}
                                                        style={{ width: `${anggota.nilaiEvaluasi}%` }}
                                                    ></div>
                                                    <span className="ml-2 text-sm font-medium text-gray-900">
                                                        {anggota.nilaiEvaluasi}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">Tidak ada data evaluasi</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Grafik Distribusi Nilai */}
                        <div>
                            <h3 className="font-semibold mb-4 text-gray-700">Distribusi Nilai</h3>
                            <div className="space-y-4">
                                {scoreDistribution.map((item, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className="w-20 text-sm text-gray-900">{item.range}</div>
                                        <div className="flex-1 ml-2">
                                            <div className="flex items-center">
                                                <div
                                                    className={`h-6 ${item.color} rounded-l`}
                                                    style={{ width: `${(item.count / maxCount) * 80}%` }}
                                                ></div>
                                                <span className="ml-2 text-sm font-medium text-gray-900">{item.count} orang</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Grafik Status Pengisian */}
                        <div>
                            <h3 className="font-semibold mb-4 text-gray-700">Status Pengisian</h3>
                            <div className="flex items-center justify-center">
                                <div className="relative w-40 h-40">
                                    {/* Chart lingkaran */}
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        {/* Latar belakang lingkaran */}
                                        <circle
                                            className="text-gray-200 stroke-current"
                                            strokeWidth="10"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                        />
                                        {/* Bagian sudah mengisi */}
                                        <circle
                                            className="text-green-500 stroke-current"
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                            strokeDasharray={2 * Math.PI * 40}
                                            strokeDashoffset={
                                                2 * Math.PI * 40 * (1 - (kelompokData.jumlahResponden / kelompokData.jumlahAnggota))
                                            }
                                            transform="rotate(-90 50 50)"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {Math.round((kelompokData.jumlahResponden / kelompokData.jumlahAnggota) * 100)}%
                                        </span>
                                        <span className="text-xs text-gray-500">Telah Mengisi</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2 text-center">
                                <div className="flex items-center justify-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                    <span className="text-sm text-gray-900">Sudah Mengisi: {kelompokData.jumlahResponden} orang</span>
                                </div>
                                <div className="flex items-center justify-center">
                                    <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                                    <span className="text-sm text-gray-900">Belum Mengisi: {kelompokData.jumlahAnggota - kelompokData.jumlahResponden} orang</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Detail Anggota */}
                {selectedAnggota && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full">
                            <div className="px-6 py-4 border-b">
                                <h3 className="text-lg font-bold text-gray-900">Detail Evaluasi</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nama</label>
                                        <p className="mt-1 font-medium text-gray-900">{formatNama(selectedAnggota.nama)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nilai</label>
                                        <p className={`mt-1 font-bold text-xl ${getGradeColor(selectedAnggota.nilaiEvaluasi).split(' ')[0]}`}>
                                            {selectedAnggota.nilaiEvaluasi}%
                                        </p>
                                        <p className={`text-sm ${getGradeColor(selectedAnggota.nilaiEvaluasi)}`}>
                                            {getGradeText(selectedAnggota.nilaiEvaluasi)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Periode</label>
                                        <p className="mt-1 text-gray-900">{selectedAnggota.bulanSingkat} {selectedAnggota.tahun}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t">
                                <button
                                    onClick={() => setSelectedAnggota(null)}
                                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}