'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../components/UnifiedSidebar';
import { ChevronLeft, Edit, Trash2, AlertTriangle, X } from 'lucide-react';

function LihatTernakContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [ternakList, setTernakList] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ State modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'delete' | 'success' | null>(null);
    const [modalMessage, setModalMessage] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Filter states
    const [filters, setFilters] = useState({
        jenisHewan: searchParams?.get('jenis') || '',
        jenisKelamin: '',
        statusTernak: '',
        umurTernak: '',
        kondisiKesehatan: ''
    });

    // Filter options
    const jenisHewanOptions = ['Sapi', 'Kambing', 'Domba', 'Ayam', 'Bebek'];
    const jenisKelaminOptions = ['Jantan', 'Betina'];
    const kondisiKesehatanOptions = ['Sehat', 'Sakit'];

    // Load data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                const response = await fetch('/api/ternak', { cache: "no-store" });
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const result = await response.json();
                setTernakList(result);
                setFilteredData(result);

                setError(null);
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Gagal memuat data ternak');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = [...ternakList];

        if (filters.jenisHewan) {
            filtered = filtered.filter(item => item.jenisHewan === filters.jenisHewan);
        }
        if (filters.jenisKelamin) {
            filtered = filtered.filter(item => item.jenisKelamin === filters.jenisKelamin);
        }
        if (filters.statusTernak) {
            filtered = filtered.filter(item => item.statusTernak === filters.statusTernak);
        }
        if (filters.umurTernak) {
            filtered = filtered.filter(item =>
                item.umurTernak && item.umurTernak.toLowerCase().includes(filters.umurTernak.toLowerCase())
            );
        }
        if (filters.kondisiKesehatan) {
            filtered = filtered.filter(item => item.kondisiKesehatan === filters.kondisiKesehatan);
        }

        setFilteredData(filtered);
    }, [filters, ternakList]);

    const getStatusOptions = () => {
        const { jenisHewan, jenisKelamin } = filters;
        if (!jenisHewan || !jenisKelamin) {
            const uniqueStatuses = [...new Set(ternakList.map(item => item.statusTernak))];
            return uniqueStatuses.filter(status => status);
        }
        const statusOptions = {
            'Sapi': { 'Jantan': ['Pejantan', 'Sapi Potong', 'Sapi Kerja', 'Bibit', 'Penggemukan'], 'Betina': ['Indukan', 'Sapi Perah', 'Sapi Potong', 'Bibit', 'Dara'] },
            'Kambing': { 'Jantan': ['Pejantan', 'Kambing Potong', 'Bibit', 'Penggemukan', 'Kambing Kerja'], 'Betina': ['Indukan', 'Kambing Perah', 'Kambing Potong', 'Bibit', 'Dara'] },
            'Domba': { 'Jantan': ['Pejantan', 'Domba Potong', 'Bibit', 'Penggemukan', 'Domba Wol'], 'Betina': ['Indukan', 'Domba Potong', 'Bibit', 'Dara', 'Domba Wol'] },
            'Ayam': { 'Jantan': ['Pejantan', 'Ayam Potong', 'Ayam Aduan', 'Bibit', 'Ayam Hias'], 'Betina': ['Indukan', 'Ayam Petelur', 'Ayam Potong', 'Bibit', 'Ayam Hias'] },
            'Bebek': { 'Jantan': ['Pejantan', 'Bebek Potong', 'Bibit', 'Bebek Hias', 'Penggemukan'], 'Betina': ['Indukan', 'Bebek Petelur', 'Bebek Potong', 'Bibit', 'Bebek Hias'] }
        };
        return statusOptions[jenisHewan]?.[jenisKelamin] || [];
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value,
            ...(filterName === 'jenisHewan' || filterName === 'jenisKelamin' ? { statusTernak: '' } : {})
        }));
    };

    const handleBack = () => {
        router.push('/peternak/ternak');
    };

    const handleEdit = (id) => {
        router.push(`/peternak/ternak/edit?id=${id}`);
    };

    // ✅ Ubah delete -> pakai modal
    const handleDelete = (id) => {
        setSelectedId(id);
        setModalType('delete');
        setModalMessage('Apakah Anda yakin ingin menghapus data ternak ini?');
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedId) return;
        try {
            const response = await fetch('/api/ternak', {
                method: 'DELETE',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: selectedId }),
            });

            if (!response.ok) throw new Error('Failed to delete data');

            const updatedList = ternakList.filter(item => item._id !== selectedId);
            setTernakList(updatedList);
            setFilteredData(updatedList);

            setModalType('success');
            setModalMessage('Data ternak berhasil dihapus!');
        } catch (error) {
            console.error('Error deleting ternak:', error);
            setModalType('success');
            setModalMessage('Gagal menghapus data ternak.');
        } finally {
            setSelectedId(null);
        }
    };

    const clearAllFilters = () => {
        setFilters({
            jenisHewan: '',
            jenisKelamin: '',
            statusTernak: '',
            umurTernak: '',
            kondisiKesehatan: ''
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen">
                <Sidebar userType="peternak" />
                <main className="flex-1 bg-gray-100 p-6">
                    <div className="flex items-center justify-center h-full">
                        <p className="text-lg font-[Judson]">Memuat data...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar userType="peternak" />
            <main className="flex-1 bg-gray-100 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center mb-8">
                        <button 
                            onClick={handleBack}
                            className="mr-4 p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-3xl font-bold font-[Judson] text-center flex-1">Data Ternak</h1>
                    </div>

                    {/* Filters */}
                    <div className="flex justify-center">
                        <div className="bg-white rounded-lg shadow p-6 mb-6 mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4 justify-center">
                            {/* Jenis Hewan Filter */}
                            <div>
                                <label className="block text-sm font-medium font-[Judson] text-gray-700 mb-2">
                                    Jenis Hewan
                                </label>
                                <div className="relative">
                                    <select
                                        value={filters.jenisHewan}
                                        onChange={(e) => handleFilterChange('jenisHewan', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Semua Jenis</option>
                                        {jenisHewanOptions.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Jenis Kelamin Filter */}
                            <div>
                                <label className="block text-sm font-medium font-[Judson] text-gray-700 mb-2">
                                    Jenis Kelamin
                                </label>
                                <div className="relative">
                                    <select
                                        value={filters.jenisKelamin}
                                        onChange={(e) => handleFilterChange('jenisKelamin', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Semua Kelamin</option>
                                        {jenisKelaminOptions.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Status Ternak Filter */}
                            <div>
                                <label className="block text-sm font-medium font-[Judson] text-gray-700 mb-2">
                                    Status Ternak
                                </label>
                                <div className="relative">
                                    <select
                                        value={filters.statusTernak}
                                        onChange={(e) => handleFilterChange('statusTernak', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Semua Status</option>
                                        {getStatusOptions().map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Umur Filter - Search Bar */}
                            <div>
                                <label className="block text-sm font-medium font-[Judson] text-gray-700 mb-2">
                                    Umur
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={filters.umurTernak}
                                        onChange={(e) => handleFilterChange('umurTernak', e.target.value)}
                                        placeholder="Cari berdasarkan umur..."
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Kondisi Kesehatan Filter */}
                            <div>
                                <label className="block text-sm font-medium font-[Judson] text-gray-700 mb-2">
                                    Kondisi Kesehatan
                                </label>
                                <div className="relative">
                                    <select
                                        value={filters.kondisiKesehatan}
                                        onChange={(e) => handleFilterChange('kondisiKesehatan', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Semua Kondisi</option>
                                        {kondisiKesehatanOptions.map((option) => (
                                            <option key={option} value={option}>{option}</option>
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

                        {/* Clear Filters Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={clearAllFilters}
                                className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-[Judson]"
                            >
                                Reset Filter
                            </button>
                        </div>
                    </div>
                </div>

                    {/* Data Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium font-[Judson] text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium font-[Judson] text-gray-500 uppercase tracking-wider">
                                            Jenis
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium font-[Judson] text-gray-500 uppercase tracking-wider">
                                            Kelamin
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium font-[Judson] text-gray-500 uppercase tracking-wider">
                                            Umur
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium font-[Judson] text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium font-[Judson] text-gray-500 uppercase tracking-wider">
                                            Kondisi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium font-[Judson] text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredData.length > 0 ? (
                                        filteredData.map((ternak, index) => (
                                            <tr key={ternak._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-[Judson] text-gray-900">
                                                    {String(index + 1).padStart(2, '0')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-[Judson] text-gray-900">
                                                    {ternak.jenisHewan}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-[Judson] text-gray-900">
                                                    {ternak.jenisKelamin}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-[Judson] text-gray-900">
                                                    {ternak.umurTernak}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-[Judson] text-gray-900">
                                                    {ternak.statusTernak}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-[Judson] text-gray-900">
                                                    {ternak.kondisiKesehatan}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(ternak._id)}
                                                            className="text-orange-600 hover:text-orange-900"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(ternak._id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center text-sm font-[Judson] text-gray-500">
                                                {ternakList.length === 0 
                                                    ? 'Belum ada data ternak. Silakan tambah data ternak terlebih dahulu.'
                                                    : 'Tidak ada data yang sesuai dengan filter yang dipilih.'
                                                }
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Data Summary */}
                    {filteredData.length > 0 && (
                        <div className="mt-4 text-sm font-[Judson] text-gray-600">
                            Menampilkan {filteredData.length} dari {ternakList.length} data ternak
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 flex justify-center">
                            <p className="text-lg font-[Judson] text-red-500">{error}</p>
                        </div>
                    )}

                    {/* ✅ Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
                                {modalType === 'delete' && (
                                    <>
                                        <div className="flex items-center mb-4 gap-2 text-red-600">
                                            <AlertTriangle size={24} />
                                            <h2 className="text-lg font-bold">Konfirmasi Hapus</h2>
                                        </div>
                                        <p className="text-gray-700 mb-6">{modalMessage}</p>
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => setIsModalOpen(false)}
                                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                onClick={confirmDelete}
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                                            >
                                                Ya, Hapus
                                            </button>
                                        </div>
                                    </>
                                )}

                                {modalType === 'success' && (
                                    <>
                                        <h2 className="text-lg font-bold text-green-600 mb-4">Notifikasi</h2>
                                        <p className="text-gray-700 mb-6">{modalMessage}</p>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => setIsModalOpen(false)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                                            >
                                                OK
                                            </button>
                                        </div>
                                    </>
                                )}

                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                                >
                                    <X />
                                </button>
                            </div>
                        </div>
                    )}
                    
                </div>
            </main>
        </div>
    );
}

// Main page component
export default function LihatTernakPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LihatTernakContent />
        </Suspense>
    );
}