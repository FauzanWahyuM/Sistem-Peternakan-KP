'use client';

import Sidebar from '../components/UnifiedSidebar';
import { useState, useEffect } from 'react';

interface AnggotaEvaluasi {
    nama: string;
    nilai: string;
    score: number;
    jawabanBenar: number;
    totalSoal: number;
    persentase: number;
}

interface KelompokEvaluasi {
    kelompok: string;
    anggota: AnggotaEvaluasi[];
}

export default function HasilEvaluasiPage() {
    const [evaluasiData, setEvaluasiData] = useState<KelompokEvaluasi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data dari API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/evaluasi');

                if (!response.ok) {
                    throw new Error('Gagal mengambil data evaluasi');
                }

                const data = await response.json();
                setEvaluasiData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getGradeColor = (persentase: number) => {
        if (persentase >= 90) return 'text-green-600';
        if (persentase >= 80) return 'text-blue-600';
        if (persentase >= 70) return 'text-yellow-600';
        if (persentase >= 60) return 'text-orange-600';
        return 'text-red-600';
    };

    const getGradeText = (persentase: number) => {
        if (persentase >= 90) return 'Sangat Baik';
        if (persentase >= 80) return 'Baik';
        if (persentase >= 70) return 'Cukup';
        if (persentase >= 60) return 'Kurang';
        return 'Sangat Kurang';
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar userType="penyuluh" />
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
                <Sidebar userType="penyuluh" />
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
            <Sidebar userType="penyuluh" />
            <main className="flex-1 p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 text-center">Hasil Evaluasi</h1>
                    {evaluasiData.length > 0 && (
                        <p className="text-gray-600 text-center mt-2">
                            Total {evaluasiData.length} kelompok terdata
                        </p>
                    )}
                </div>

                {/* Evaluation Tables Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
                    {evaluasiData.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-lg">
                                Belum ada data evaluasi.
                            </p>
                        </div>
                    ) : (
                        evaluasiData.map((kelompok) => (
                            <div key={kelompok.kelompok} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                {/* Table Header */}
                                <div className="bg-green-500 px-6 py-4 border-b">
                                    <h3 className="text-xl font-bold text-white">
                                        Kelompok {kelompok.kelompok}
                                    </h3>
                                    <p className="text-white opacity-90 text-sm mt-1">
                                        {kelompok.anggota.length} anggota
                                    </p>
                                </div>

                                {/* Table Content */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-100 border-b border-gray-200">
                                                <th className="text-left py-3 px-6 font-semibold text-gray-700">
                                                    Nama
                                                </th>
                                                <th className="text-left py-3 px-6 font-semibold text-gray-700">
                                                    Nilai
                                                </th>
                                                <th className="text-left py-3 px-6 font-semibold text-gray-700">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {kelompok.anggota.map((anggota, index) => (
                                                <tr
                                                    key={index}
                                                    className={`border-b border-gray-200 hover:bg-gray-50 ${index === kelompok.anggota.length - 1 ? 'border-b-0' : ''
                                                        }`}
                                                >
                                                    <td className="py-4 px-6 text-gray-800">
                                                        {anggota.nama}
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-800">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold">{anggota.nilai}</span>
                                                            <span className="text-sm text-gray-500">
                                                                {anggota.jawabanBenar} dari {anggota.totalSoal} soal
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`font-medium ${getGradeColor(anggota.persentase)}`}>
                                                            {getGradeText(anggota.persentase)}
                                                        </span>
                                                        <br />
                                                        <span className="text-sm text-gray-500">
                                                            ({anggota.persentase}%)
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Table Footer dengan Rata-rata */}
                                <div className="bg-gray-50 px-6 py-3 border-t">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">
                                            Rata-rata Kelompok:
                                        </span>
                                        <span className="text-lg font-bold text-green-600">
                                            {Math.round(
                                                kelompok.anggota.reduce((sum, anggota) => sum + anggota.persentase, 0) /
                                                kelompok.anggota.length
                                            )}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}