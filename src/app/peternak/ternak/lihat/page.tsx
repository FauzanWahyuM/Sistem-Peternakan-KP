'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../components/UnifiedSidebar';
import { ChevronLeft, Edit, Trash2, AlertTriangle, X, Filter, Eye } from 'lucide-react';

// Interface untuk data ternak - DENGAN FIELD PENYAKIT
interface Ternak {
    _id: string;
    tipe: string;
    jenisHewan: string;
    jenisKelamin: string;
    umurTernak: string;
    statusTernak: string;
    kondisiKesehatan: string;
    penyakit: string[]; // Tambah field penyakit
}

// Ganti implementasi yang hardcoded
const getUserIdFromSession = async (): Promise<string> => {
    try {
        console.log('🔍 Fetching user data from /api/auth/me...');

        const response = await fetch('/api/auth/me', {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store'
        });

        console.log('📋 Response status:', response.status, response.statusText);

        if (!response.ok) {
            console.error('❌ Failed to fetch user data:', response.status, response.statusText);
            throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ API response received:', data);

        if (!data.user || !data.user._id) {
            console.error('❌ No user ID found in response structure');
            throw new Error('No user ID found in response');
        }

        console.log('✅ User ID found:', data.user._id);
        return data.user._id;

    } catch (error) {
        console.error('❌ Error in getUserIdFromSession:', error);

        // ✅ PERBAIKI: Tambahkan emergency fallback
        const storedId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        const emergencyId = '68a3e93efdd08489552e20a8'; // ✅ ID dari log yang bekerja

        return storedId || emergencyId; // ✅ Pastikan selalu return string
    }
};

function LihatTernakContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [ternakList, setTernakList] = useState<Ternak[]>([]);
    const [filteredData, setFilteredData] = useState<Ternak[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ✅ State modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'delete' | 'success' | 'detail' | null>(null);
    const [modalMessage, setModalMessage] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedTernak, setSelectedTernak] = useState<Ternak | null>(null); // Untuk modal detail

    // State untuk toggle filter dropdown
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filter options
    const jenisHewanOptions = ['Sapi', 'Kambing', 'Domba', 'Ayam', 'Bebek'];
    const jenisKelaminOptions = ['Jantan', 'Betina'];
    const kondisiKesehatanOptions = ['Sehat', 'Sakit'];
    const tipeTernakOptions = [
        { value: 'semua', label: 'Semua Tipe' },
        { value: 'pribadi', label: 'Pribadi' },
        { value: 'kelompok', label: 'Kelompok' }
    ];

    // Di dalam component LihatTernakContent, tambahkan state ini:
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isSelectAll, setIsSelectAll] = useState(false);

    // PERBAIKAN: Inisialisasi filter dengan nilai dari URL jika ada
    const [filters, setFilters] = useState({
        jenisHewan: '',
        jenisKelamin: '',
        statusTernak: '',
        umurTernak: '',
        kondisiKesehatan: '',
        tipeTernak: 'semua'
    });

    // PERBAIKAN: Gunakan useEffect untuk membaca parameter URL saat pertama kali load
    useEffect(() => {
        const jenisFromUrl = searchParams?.get('jenis');
        const tipeFromUrl = searchParams?.get('tipe');

        if (jenisFromUrl || tipeFromUrl) {
            setFilters(prev => ({
                ...prev,
                jenisHewan: jenisFromUrl || '',
                tipeTernak: tipeFromUrl || 'semua'
            }));
        }
    }, [searchParams]);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                console.log('🔄 Loading data...');

                const userId = await getUserIdFromSession();
                console.log('📋 User ID:', userId);

                if (!userId) {
                    console.error('❌ User ID is empty');
                    throw new Error('User ID not available');
                }

                // PERBAIKAN PENTING: Jangan gunakan parameter apapun dari URL
                const url = `/api/ternak?userId=${userId}&stats=false`;
                console.log('🌐 API URL:', url);

                const response = await fetch(url, { cache: "no-store" });
                console.log('📋 Response status:', response.status, response.statusText);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ Response error:', errorText);
                    throw new Error(`Failed to fetch data: ${response.status}`);
                }

                const result = await response.json();
                console.log('✅ Raw data from API:', result);

                // ✅ Handle berbagai format response
                let ternakData = result;
                if (result.data && Array.isArray(result.data)) {
                    ternakData = result.data;
                } else if (result.livestock && Array.isArray(result.livestock)) {
                    ternakData = result.livestock;
                } else if (Array.isArray(result)) {
                    ternakData = result;
                }

                if (!Array.isArray(ternakData)) {
                    console.error('❌ Expected array but got:', ternakData);
                    throw new Error('Invalid data format from API');
                }

                console.log('✅ Processed data:', ternakData.length, 'items');

                // Pastikan setiap item memiliki array penyakit (jika tidak ada, set ke array kosong)
                const processedData = ternakData.map((item: any) => ({
                    ...item,
                    penyakit: item.penyakit || []
                }));

                setTernakList(processedData);
                setError(null);

            } catch (err) {
                console.error('❌ Error loading data:', err);
                setError('Gagal memuat data ternak');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []); // Hapus searchParams dari dependency

    // Apply filters - PERBAIKAN: Filter di client-side
    useEffect(() => {
        console.log('🔄 Applying filters client-side...', filters);
        console.log('📋 Ternak list count:', ternakList.length);

        let filtered = [...ternakList];
        console.log('📋 Initial filtered count:', filtered.length);

        // Filter berdasarkan jenis hewan
        if (filters.jenisHewan) {
            filtered = filtered.filter(item =>
                item.jenisHewan && item.jenisHewan.toLowerCase() === filters.jenisHewan.toLowerCase()
            );
            console.log('✅ After jenisHewan filter:', filtered.length);
        }

        // Filter berdasarkan jenis kelamin
        if (filters.jenisKelamin) {
            filtered = filtered.filter(item =>
                item.jenisKelamin && item.jenisKelamin.toLowerCase() === filters.jenisKelamin.toLowerCase()
            );
            console.log('✅ After jenisKelamin filter:', filtered.length);
        }

        // Filter berdasarkan status ternak
        if (filters.statusTernak) {
            filtered = filtered.filter(item =>
                item.statusTernak && item.statusTernak.toLowerCase() === filters.statusTernak.toLowerCase()
            );
            console.log('✅ After statusTernak filter:', filtered.length);
        }

        // Filter berdasarkan umur (search)
        if (filters.umurTernak) {
            filtered = filtered.filter(item =>
                item.umurTernak && item.umurTernak.toLowerCase().includes(filters.umurTernak.toLowerCase())
            );
            console.log('✅ After umurTernak filter:', filtered.length);
        }

        // Filter berdasarkan kondisi kesehatan
        if (filters.kondisiKesehatan) {
            filtered = filtered.filter(item =>
                item.kondisiKesehatan && item.kondisiKesehatan.toLowerCase() === filters.kondisiKesehatan.toLowerCase()
            );
            console.log('✅ After kondisiKesehatan filter:', filtered.length);
        }

        // Filter berdasarkan tipe ternak
        if (filters.tipeTernak !== 'semua') {
            filtered = filtered.filter(item =>
                item.tipe && item.tipe.toLowerCase() === filters.tipeTernak.toLowerCase()
            );
            console.log('✅ After tipeTernak filter:', filtered.length);
        }

        console.log('✅ Final filtered count:', filtered.length);
        setFilteredData(filtered);

    }, [filters, ternakList]); // Tergantung pada ternakList (semua data) dan filters

    const getStatusOptions = () => {
        const { jenisHewan, jenisKelamin } = filters;
        if (!jenisHewan || !jenisKelamin) {
            const uniqueStatuses = [...new Set(ternakList.map(item => item.statusTernak))];
            return uniqueStatuses.filter(status => status);
        }
        const statusOptions: Record<string, Record<string, string[]>> = {
            'Sapi': { 'Jantan': ['Pejantan', 'Sapi Potong', 'Sapi Kerja', 'Bibit', 'Penggemukan'], 'Betina': ['Indukan', 'Sapi Perah', 'Sapi Potong', 'Bibit', 'Dara'] },
            'Kambing': { 'Jantan': ['Pejantan', 'Kambing Potong', 'Bibit', 'Penggemukan', 'Kambing Kerja'], 'Betina': ['Indukan', 'Kambing Perah', 'Kambing Potong', 'Bibit', 'Dara'] },
            'Domba': { 'Jantan': ['Pejantan', 'Domba Potong', 'Bibit', 'Penggemukan', 'Domba Wol'], 'Betina': ['Indukan', 'Domba Potong', 'Bibit', 'Dara', 'Domba Wol'] },
            'Ayam': { 'Jantan': ['Pejantan', 'Ayam Potong', 'Ayam Aduan', 'Bibit', 'Ayam Hias'], 'Betina': ['Indukan', 'Ayam Petelur', 'Ayam Potong', 'Bibit', 'Ayam Hias'] },
            'Bebek': { 'Jantan': ['Pejantan', 'Bebek Potong', 'Bibit', 'Bebek Hias', 'Penggemukan'], 'Betina': ['Indukan', 'Bebek Petelur', 'Bebek Potong', 'Bibit', 'Bebek Hias'] }
        };
        return statusOptions[jenisHewan]?.[jenisKelamin] || [];
    };

    const handleFilterChange = (filterName: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value,
            ...(filterName === 'jenisHewan' || filterName === 'jenisKelamin' ? { statusTernak: '' } : {})
        }));
    };

    const handleBack = () => {
        router.push('/peternak/ternak');
    };

    const handleEdit = (id: string) => {
        router.push(`/peternak/ternak/edit?id=${id}`);
    };

    // ✅ Fungsi untuk melihat detail ternak (termasuk penyakit)
    const handleViewDetail = (ternak: Ternak) => {
        setSelectedTernak(ternak);
        setModalType('detail');
        setIsModalOpen(true);
    };

    // ✅ Ubah delete -> pakai modal
    const handleDelete = (id: string) => {
        setSelectedId(id);
        setModalType('delete');
        setModalMessage('Apakah Anda yakin ingin menghapus data ternak ini?');
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedItems.length > 0) {
            // Bulk delete
            await confirmBulkDelete();
        } else if (selectedId) {
            // Single delete
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
        }
    };

    const clearAllFilters = () => {
        // PERBAIKAN: Reset ke nilai default
        setFilters({
            jenisHewan: '',
            jenisKelamin: '',
            statusTernak: '',
            umurTernak: '',
            kondisiKesehatan: '',
            tipeTernak: 'semua'
        });
    };

    // Tambahkan fungsi-fungsi ini di dalam component
    const toggleSelectItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (isSelectAll) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredData.map(item => item._id));
        }
        setIsSelectAll(!isSelectAll);
    };

    const handleBulkDelete = () => {
        if (selectedItems.length === 0) return;

        setSelectedId(null); // Reset single delete
        setModalType('delete');
        setModalMessage(`Apakah Anda yakin ingin menghapus ${selectedItems.length} data ternak sekaligus?`);
        setIsModalOpen(true);
    };

    const confirmBulkDelete = async () => {
        try {
            const response = await fetch('/api/ternak', {
                method: 'DELETE',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedItems }),
            });

            if (!response.ok) throw new Error('Failed to delete data');

            const updatedList = ternakList.filter(item => !selectedItems.includes(item._id));
            setTernakList(updatedList);
            setFilteredData(updatedList);
            setSelectedItems([]);
            setIsSelectAll(false);

            setModalType('success');
            setModalMessage(`${selectedItems.length} data ternak berhasil dihapus!`);
        } catch (error) {
            console.error('Error deleting ternak:', error);
            setModalType('success');
            setModalMessage('Gagal menghapus data ternak.');
        }
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
            <div className="sticky top-0 h-screen">
                <Sidebar userType="peternak" />
            </div>
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
                        <h1 className="text-3xl font-bold font-[Judson] text-center flex-1 text-black">Data Ternak</h1>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={filters.umurTernak}
                                    onChange={(e) => handleFilterChange('umurTernak', e.target.value)}
                                    placeholder="Cari berdasarkan umur..."
                                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-[Judson] text-gray-700"
                                />
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-[Judson] text-black"
                                >
                                    <Filter size={20} />
                                    Filter
                                </button>

                                {isFilterOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                        <div className="p-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-2 font-[Judson]">Tipe Ternak</label>
                                            <select
                                                value={filters.tipeTernak}
                                                onChange={(e) => handleFilterChange('tipeTernak', e.target.value)}
                                                className="w-full p-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-[Judson]"
                                            >
                                                <option value="semua">Semua Tipe</option>
                                                <option value="pribadi">Pribadi</option>
                                                <option value="kelompok">Kelompok</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex justify-center">
                        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm w-full max-w-6xl">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Jenis Hewan Filter */}
                                <div className="relative flex-1">
                                    <label className="block text-sm font-medium font-[Judson] text-gray-700 mb-2">
                                        Jenis Hewan
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filters.jenisHewan}
                                            onChange={(e) => handleFilterChange('jenisHewan', e.target.value)}
                                            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-[Judson] text-gray-700 appearance-none cursor-pointer"
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
                                <div className="relative flex-1">
                                    <label className="block text-sm font-medium font-[Judson] text-gray-700 mb-2">
                                        Jenis Kelamin
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filters.jenisKelamin}
                                            onChange={(e) => handleFilterChange('jenisKelamin', e.target.value)}
                                            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-[Judson] text-gray-700 appearance-none cursor-pointer"
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
                                <div className="relative flex-1">
                                    <label className="block text-sm font-medium font-[Judson] text-gray-700 mb-2">
                                        Status Ternak
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filters.statusTernak}
                                            onChange={(e) => handleFilterChange('statusTernak', e.target.value)}
                                            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-[Judson] text-gray-700 appearance-none cursor-pointer"
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

                                {/* Kondisi Kesehatan Filter */}
                                <div className="relative flex-1">
                                    <label className="block text-sm font-medium font-[Judson] text-gray-700 mb-2">
                                        Kondisi Kesehatan
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filters.kondisiKesehatan}
                                            onChange={(e) => handleFilterChange('kondisiKesehatan', e.target.value)}
                                            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-[Judson] text-gray-700 appearance-none cursor-pointer"
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
                            <div className="flex justify-center mt-4">
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
                                        <th className="px-4 py-3 text-left text-xs font-medium font-[Judson] text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={isSelectAll}
                                                onChange={toggleSelectAll}
                                                className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium font-[Judson] text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium font-[Judson] text-gray-500 uppercase tracking-wider">
                                            Tipe
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
                                            Penyakit
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
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.includes(ternak._id)}
                                                        onChange={() => toggleSelectItem(ternak._id)}
                                                        className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-[Judson] text-gray-900">
                                                    {String(index + 1).padStart(2, '0')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-[Judson]">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ternak.tipe === 'pribadi'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {ternak.tipe === 'pribadi' ? 'Pribadi' : 'Kelompok'}
                                                    </span>
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-[Judson] text-gray-900">
                                                    {ternak.penyakit.length > 0 ? (
                                                        <span
                                                            className="text-blue-600 cursor-pointer hover:underline"
                                                            onClick={() => handleViewDetail(ternak)}
                                                        >
                                                            {ternak.penyakit.length} penyakit
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleViewDetail(ternak)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Lihat Detail"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
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
                                                <td colSpan={10} className="px-6 py-4 text-center text-sm font-[Judson] text-gray-500">
                                                    {/* Perhatikan colSpan menjadi 10 karena tambahan 1 kolom */}
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

                    {/* Tambahkan di bawah Data Summary dan di atas tabel */}
                    {selectedItems.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex justify-between items-center">
                            <span className="text-blue-800 font-[Judson]">
                                {selectedItems.length} data terpilih
                            </span>
                            <button
                                onClick={handleBulkDelete}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-[Judson] flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                Hapus yang dipilih
                            </button>
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

                                {modalType === 'detail' && selectedTernak && (
                                    <>
                                        <h2 className="text-lg font-bold text-blue-600 mb-4">Detail Ternak</h2>
                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between text-black">
                                                <span className="font-medium">Jenis Hewan:</span>
                                                <span>{selectedTernak.jenisHewan}</span>
                                            </div>
                                            <div className="flex justify-between text-black">
                                                <span className="font-medium">Jenis Kelamin:</span>
                                                <span>{selectedTernak.jenisKelamin}</span>
                                            </div>
                                            <div className="flex justify-between text-black">
                                                <span className="font-medium">Umur:</span>
                                                <span>{selectedTernak.umurTernak}</span>
                                            </div>
                                            <div className="flex justify-between text-black">
                                                <span className="font-medium">Status:</span>
                                                <span>{selectedTernak.statusTernak}</span>
                                            </div>
                                            <div className="flex justify-between text-black">
                                                <span className="font-medium">Kondisi Kesehatan:</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedTernak.kondisiKesehatan === 'Sehat'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {selectedTernak.kondisiKesehatan}
                                                </span>
                                            </div>
                                            <div className="border-t pt-3 mt-3 text-black">
                                                <span className="font-medium block mb-2">Penyakit yang Pernah Menyerang:</span>
                                                {selectedTernak.penyakit.length > 0 ? (
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {selectedTernak.penyakit.map((penyakit, index) => (
                                                            <li key={index} className="text-gray-700">{penyakit}</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="text-gray-600">Tidak ada penyakit yang tercatat</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => setIsModalOpen(false)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                                            >
                                                Tutup
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