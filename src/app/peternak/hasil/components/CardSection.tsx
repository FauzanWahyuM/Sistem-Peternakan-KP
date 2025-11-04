// app/peternak/hasil-evaluasi/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function HasilEvaluasiContent() {
    const router = useRouter();
    const [dataEvaluasi, setDataEvaluasi] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        periode: '',
        tahun: '',
        search: ''
    });
    const [availableYears, setAvailableYears] = useState<number[]>([]);

    const periodeOptions = [
        { value: '', label: 'Semua Periode' },
        { value: 'jan-jun', label: 'Periode Januari-Juni' },
        { value: 'jul-des', label: 'Periode Juli-Desember' }
    ];

    // Ambil data dari API
    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch('/api/hasil', {
                    cache: "no-store",
                    credentials: 'include'
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        router.push('/login');
                        return;
                    }
                    throw new Error('Gagal mengambil data');
                }

                const result = await res.json();
                console.log('Data evaluasi user:', result);
                setDataEvaluasi(result);
                setFilteredData(result);

                // Generate available years dari data
                const years = extractAvailableYears(result);
                setAvailableYears(years);

            } catch (err) {
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [router]);

    // Fungsi untuk extract tahun dari data
    const extractAvailableYears = (data: any[]) => {
        if (!data || data.length === 0) {
            // Jika tidak ada data, tampilkan tahun berjalan dan beberapa tahun ke depan
            const currentYear = new Date().getFullYear();
            return [currentYear - 1, currentYear, currentYear + 1];
        }

        // Ambil semua tahun unik dari data
        const uniqueYears = [...new Set(data.map(item => item.tahun))] as number[];

        // Urutkan descending (tahun terbaru dulu)
        uniqueYears.sort((a, b) => b - a);

        // Tambahkan tahun berjalan jika belum ada
        const currentYear = new Date().getFullYear();
        if (!uniqueYears.includes(currentYear)) {
            uniqueYears.unshift(currentYear);
        }

        // Tambahkan tahun depan untuk antisipasi
        const nextYear = currentYear + 1;
        if (!uniqueYears.includes(nextYear)) {
            uniqueYears.unshift(nextYear);
        }

        return uniqueYears;
    };

    // Terapkan filter
    useEffect(() => {
        let filtered = [...dataEvaluasi];

        if (filters.periode) {
            filtered = filtered.filter(item => item.periode === filters.periode);
        }

        if (filters.tahun) {
            filtered = filtered.filter(item => String(item.tahun) === filters.tahun);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(item =>
                item.nama.toLowerCase().includes(searchLower) ||
                String(item.nilaiEvaluasi).includes(searchLower) ||
                (item.namaPeriode && item.namaPeriode.toLowerCase().includes(searchLower))
            );
        }

        setFilteredData(filtered);
    }, [filters, dataEvaluasi]);

    const handleBack = () => {
        router.push('/peternak/dashboard');
    };

    const clearFilters = () => {
        setFilters({ periode: '', tahun: '', search: '' });
    };

    // Fungsi untuk menampilkan nama periode yang lebih user-friendly
    const getNamaPeriode = (item: any) => {
        if (item.namaPeriode) {
            return item.namaPeriode;
        }
        // Fallback untuk data lama
        if (item.periode === 'jan-jun') return 'Januari-Juni';
        if (item.periode === 'jul-des') return 'Juli-Desember';
        return `Periode ${item.bulan}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 font-[Judson] text-gray-600">Memuat data evaluasi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Filters */}
            <div className="flex justify-center">
                <div className="bg-white rounded-lg shadow p-6 mb-6 max-w-6xl w-full mx-auto">
                    <div className="flex gap-4 mb-4">
                        {/* Periode */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium font-[Judson] text-gray-700 mb-2">
                                Periode
                            </label>
                            <div className="relative">
                                <select
                                    value={filters.periode}
                                    onChange={(e) => setFilters({ ...filters, periode: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    {periodeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
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

                        {/* Tahun - OTOMATIS */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium font-[Judson] text-gray-700 mb-2">
                                Tahun
                            </label>
                            <div className="relative">
                                <select
                                    value={filters.tahun}
                                    onChange={(e) => setFilters({ ...filters, tahun: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Semua Tahun</option>
                                    {availableYears.map((tahun) => (
                                        <option key={tahun} value={tahun}>
                                            {tahun}
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

                        {/* Search */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium font-[Judson] text-gray-700 mb-2">
                                Cari
                            </label>
                            <input
                                type="text"
                                placeholder="Cari nama, nilai, atau periode..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg font-[Judson] focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    {/* Reset Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-[Judson] transition-colors"
                        >
                            Reset Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabel Hasil Evaluasi */}
            <div className="bg-white rounded-lg shadow overflow-hidden max-w-6xl mx-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-[Judson]">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-[Judson]">Periode</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-[Judson]">Tahun</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-[Judson]">Nilai Evaluasi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-[Judson]">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.length > 0 ? (
                            filteredData.map((item, idx) => (
                                <tr key={item._id ?? idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-[Judson] whitespace-nowrap">{idx + 1}</td>
                                    <td className="px-6 py-4 font-[Judson] whitespace-nowrap">
                                        {getNamaPeriode(item)}
                                    </td>
                                    <td className="px-6 py-4 font-[Judson]">{item.tahun}</td>
                                    <td className="px-6 py-4 font-[Judson] font-semibold">
                                        <span className={`px-3 py-1 rounded-full text-sm ${item.nilaiEvaluasi >= 80 ? 'bg-green-100 text-green-800' :
                                            item.nilaiEvaluasi >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {item.nilaiEvaluasi}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-[Judson]">
                                        <span className={`px-2 py-1 rounded text-xs ${item.nilaiEvaluasi >= 80 ? 'bg-green-50 text-green-700' :
                                            item.nilaiEvaluasi >= 60 ? 'bg-yellow-50 text-yellow-700' :
                                                'bg-red-50 text-red-700'
                                            }`}>
                                            {item.nilaiEvaluasi >= 80 ? 'Sangat Baik' :
                                                item.nilaiEvaluasi >= 60 ? 'Baik' : 'Perlu Perbaikan'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500 font-[Judson]">
                                    {dataEvaluasi.length === 0
                                        ? 'Belum ada data hasil evaluasi. Silakan isi kuesioner terlebih dahulu.'
                                        : 'Data tidak ditemukan dengan filter yang dipilih.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Data Summary */}
            {filteredData.length > 0 && (
                <div className="mt-4 text-sm text-gray-600 font-[Judson] text-center">
                    Menampilkan {filteredData.length} dari {dataEvaluasi.length} data evaluasi
                </div>
            )}
        </div>
    );
}

export default function HasilEvaluasiPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 font-[Judson] text-gray-600">Memuat halaman...</p>
                </div>
            </div>
        }>
            <HasilEvaluasiContent />
        </Suspense>
    );
}