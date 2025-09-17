'use client';

import Sidebar from '../components/UnifiedSidebar';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Kelompok {
    _id?: string;
    id: string;
    nama: string;
    anggota: string[];
    status: string;
}

export default function DataKelompokPage() {
    const router = useRouter();
    const [kelompokData, setKelompokData] = useState<Kelompok[]>([]);
    const [filteredData, setFilteredData] = useState<Kelompok[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [kelompokFilter, setKelompokFilter] = useState('');

    // Fetch data kelompok dari MongoDB Atlas
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/kelompok');

                if (!response.ok) {
                    throw new Error('Gagal mengambil data kelompok');
                }

                const data = await response.json();
                setKelompokData(data);
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
            const filtered = kelompokData.filter(item =>
                item.id.toLowerCase() === kelompokFilter.toLowerCase()
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(kelompokData);
        }
    }, [kelompokFilter, kelompokData]);

    // Get unique filter options from data
    const kelompokOptions = [...new Set(kelompokData.map(item => item.id))].sort();

    const handleFilterChange = (value: string) => {
        setKelompokFilter(value);
    };

    const clearFilter = () => {
        setKelompokFilter('');
    };

    const handleKelompokClick = (kelompokId: string) => {
        router.push(`/dashboard/penyuluh/data-kelompok/${kelompokId}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'aktif':
                return 'bg-green-500';
            case 'non-aktif':
                return 'bg-gray-500';
            case 'pending':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getButtonColor = (status: string) => {
        switch (status) {
            case 'aktif':
                return 'bg-white text-green-600 hover:bg-gray-100';
            case 'non-aktif':
                return 'bg-white text-gray-600 hover:bg-gray-100';
            case 'pending':
                return 'bg-white text-yellow-600 hover:bg-gray-100';
            default:
                return 'bg-white text-gray-600 hover:bg-gray-100';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'aktif':
                return 'Aktif';
            case 'non-aktif':
                return 'Non-Aktif';
            case 'pending':
                return 'Pending';
            default:
                return status;
        }
    };

    // Fungsi untuk mendapatkan lebar bubble berdasarkan status
    const getStatusBubbleClass = (status: string) => {
        const baseClass = "bg-white bg-opacity-20 rounded-full text-sm font-medium text-black whitespace-nowrap";
        switch (status) {
            case 'non-aktif':
                return `${baseClass} px-4 py-1 min-w-[85px] text-center`;
            case 'pending':
                return `${baseClass} px-3 py-1`;
            default:
                return `${baseClass} px-3 py-1`;
        }
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
                            <p className="mt-4 text-gray-600">Memuat data kelompok...</p>
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
            {/* Sidebar dengan sticky */}
            <div className="sticky top-0 h-screen">
                <Sidebar userType="penyuluh" />
            </div>

            <main className="flex-1 p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 text-center">Data Kelompok</h1>
                </div>

                {/* Filters Section - Hanya Kelompok */}
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
                                                Kelompok {option.toUpperCase()}
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

                        {/* Clear Filter Button dan Tambah Kelompok Button */}
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={clearFilter}
                                className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                            >
                                Reset Filter
                            </button>
                            <Link
                                href="/dashboard/penyuluh/data-kelompok/tambah-kelompok"
                                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg"
                            >
                                Tambah Kelompok
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Data Summary */}
                {filteredData.length > 0 && (
                    <div className="mb-4 text-sm text-gray-600 text-center">
                        Menampilkan {filteredData.length} dari {kelompokData.length} kelompok
                    </div>
                )}

                {/* Kelompok Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {filteredData.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-lg">
                                {kelompokData.length === 0
                                    ? 'Belum ada data kelompok.'
                                    : 'Tidak ada data yang sesuai dengan filter yang dipilih.'
                                }
                            </p>
                        </div>
                    ) : (
                        filteredData.map((kelompok) => (
                            <div key={kelompok.id} className={`${getStatusColor(kelompok.status)} text-white p-6 rounded-lg shadow-lg flex flex-col`}>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold">{kelompok.nama}</h3>
                                    <span className={getStatusBubbleClass(kelompok.status)}>
                                        {getStatusText(kelompok.status)}
                                    </span>
                                </div>

                                {/* Anggota List - Maksimal 5 */}
                                <div className="mb-6 space-y-1 flex-grow">
                                    {kelompok.anggota.slice(0, 5).map((anggota, index) => (
                                        <p key={index} className="text-white opacity-90">
                                            {anggota}
                                        </p>
                                    ))}
                                    {kelompok.anggota.length > 5 && (
                                        <p className="text-white opacity-70 text-sm">
                                            +{kelompok.anggota.length - 5} anggota lainnya...
                                        </p>
                                    )}
                                </div>

                                {/* Selengkapnya Button - Tetap di bawah */}
                                <div className="mt-auto">
                                    <button
                                        onClick={() => handleKelompokClick(kelompok.id)}
                                        className={`${getButtonColor(kelompok.status)} px-6 py-2 rounded-full font-medium transition-colors w-full`}
                                    >
                                        Selengkapnya
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}