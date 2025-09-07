'use client';

import Sidebar from '../../components/UnifiedSidebar';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Anggota {
    nama: string;
    username: string;
    email: string;
    role: string;
    status: string;
    joinDate: string;
}

interface KelompokData {
    id: string;
    nama: string;
    anggota: Anggota[];
    status: string;
    totalAnggota: number;
}

export default function AnggotaKelompokPage() {
    const router = useRouter();
    const params = useParams();
    const kelompokId = params?.id as string;

    const [kelompokData, setKelompokData] = useState<KelompokData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data dari API berdasarkan kelompokId
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/kelompok/${kelompokId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Kelompok tidak ditemukan');
                    }
                    throw new Error('Gagal mengambil data kelompok');
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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'aktif':
                return 'bg-green-600';
            case 'tidak aktif':
                return 'bg-red-500';
            case 'pending':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getBackButtonColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'aktif':
                return 'bg-green-500 hover:bg-green-600';
            case 'tidak aktif':
                return 'bg-red-500 hover:bg-red-600';
            case 'pending':
                return 'bg-yellow-500 hover:bg-yellow-600';
            default:
                return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'aktif':
                return 'Aktif';
            case 'tidak aktif':
                return 'Tidak Aktif';
            case 'pending':
                return 'Pending';
            default:
                return status;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                            <p className="mt-4 text-gray-600">Memuat data anggota kelompok...</p>
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
                        <p className="text-gray-500 text-lg">Data kelompok tidak ditemukan.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar dengan sticky */}
            <div className="sticky top-0 h-screen">
                <Sidebar userType="penyuluh" />
            </div>

            <main className="flex-1 p-6">
                {/* Back Button and Header */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <button
                            onClick={handleBack}
                            className={`flex items-center justify-center w-10 h-10 ${getBackButtonColor(kelompokData.status)} text-white rounded-full transition-colors mr-4`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center">
                            <h1 className="text-3xl font-bold text-gray-800 mr-4">
                                Anggota Kelompok {kelompokData.id.toUpperCase()}
                            </h1>
                            <span className={`${getStatusColor(kelompokData.status)} text-white px-4 py-2 rounded-full text-sm font-medium`}>
                                {getStatusText(kelompokData.status)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Anggota Cards - 4 per baris */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 max-w-7xl mx-auto">
                    {kelompokData.anggota.map((anggota, index) => (
                        <div key={index} className={`${getStatusColor(anggota.status)} text-white p-6 rounded-lg shadow-lg flex flex-col`}>
                            <h3 className="text-xl font-bold mb-2">{anggota.nama}</h3>
                            <div className="flex-grow space-y-2">
                                <p className="text-white opacity-90">
                                    <span className="font-medium">Username:</span> {anggota.username}
                                </p>
                                <p className="text-white opacity-90">
                                    <span className="font-medium">Email:</span> {anggota.email}
                                </p>
                                <p className="text-white opacity-90">
                                    <span className="font-medium">Role:</span> {anggota.role}
                                </p>
                                <p className="text-white opacity-90">
                                    <span className="font-medium">Status:</span> {getStatusText(anggota.status)}
                                </p>
                                <p className="text-white opacity-90">
                                    <span className="font-medium">Bergabung:</span> {formatDate(anggota.joinDate)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Informasi Kelompok - Ditengah */}
                <div className="flex justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Informasi Kelompok</h2>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <tbody>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-4 px-4 font-medium text-gray-700 bg-gray-50">Nama Kelompok</td>
                                        <td className="py-4 px-4 text-gray-800">{kelompokData.nama}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-4 px-4 font-medium text-gray-700 bg-gray-50">Kode Kelompok</td>
                                        <td className="py-4 px-4 text-gray-800">{kelompokData.id.toUpperCase()}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-4 px-4 font-medium text-gray-700 bg-gray-50">Status Kelompok</td>
                                        <td className="py-4 px-4">
                                            <span className={`${getStatusColor(kelompokData.status)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                                                {getStatusText(kelompokData.status)}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-4 px-4 font-medium text-gray-700 bg-gray-50">Total Anggota</td>
                                        <td className="py-4 px-4 text-gray-800">{kelompokData.totalAnggota} orang</td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 px-4 font-medium text-gray-700 bg-gray-50">Tanggal Dibuat</td>
                                        <td className="py-4 px-4 text-gray-800">
                                            {kelompokData.anggota.length > 0
                                                ? formatDate(kelompokData.anggota[0].joinDate)
                                                : 'Tidak tersedia'
                                            }
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}