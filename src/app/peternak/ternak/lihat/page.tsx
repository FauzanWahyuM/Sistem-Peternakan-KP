'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../components/UnifiedSidebar';
import { ChevronLeft, Edit, Trash2 } from 'lucide-react';

function LihatTernakContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [ternakList, setTernakList] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    
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

    // Load data from localStorage
    useEffect(() => {
        const loadData = () => {
            const savedData = localStorage.getItem('ternakList');
            if (savedData) {
                const data = JSON.parse(savedData);
                setTernakList(data);
                setFilteredData(data);
            }
        };

        loadData();

        // Listen for data updates
        const handleDataUpdate = () => {
            loadData();
        };

        window.addEventListener('ternakDataUpdated', handleDataUpdate);
        window.addEventListener('storage', handleDataUpdate);

        return () => {
            window.removeEventListener('ternakDataUpdated', handleDataUpdate);
            window.removeEventListener('storage', handleDataUpdate);
        };
    }, []);

    // Apply filters whenever filters or data change
    useEffect(() => {
        let filtered = [...ternakList];

        // Filter by jenis hewan
        if (filters.jenisHewan) {
            filtered = filtered.filter(item => item.jenisHewan === filters.jenisHewan);
        }

        // Filter by jenis kelamin
        if (filters.jenisKelamin) {
            filtered = filtered.filter(item => item.jenisKelamin === filters.jenisKelamin);
        }

        // Filter by status ternak
        if (filters.statusTernak) {
            filtered = filtered.filter(item => item.statusTernak === filters.statusTernak);
        }

        // Filter by umur ternak
        if (filters.umurTernak) {
            filtered = filtered.filter(item => 
                item.umurTernak.toLowerCase().includes(filters.umurTernak.toLowerCase())
            );
        }

        // Filter by kondisi kesehatan
        if (filters.kondisiKesehatan) {
            filtered = filtered.filter(item => item.kondisiKesehatan === filters.kondisiKesehatan);
        }

        setFilteredData(filtered);
    }, [filters, ternakList]);

    // Get status options based on selected animal type and gender (same logic as add form)
    const getStatusOptions = () => {
        const { jenisHewan, jenisKelamin } = filters;
        
        // If no animal type or gender selected, show all unique statuses from data
        if (!jenisHewan || !jenisKelamin) {
            const uniqueStatuses = [...new Set(ternakList.map(item => item.statusTernak))];
            return uniqueStatuses.filter(status => status); // Remove empty values
        }

        // Same status logic as in the add form
        const statusOptions = {
            'Sapi': {
                'Jantan': ['Pejantan', 'Sapi Potong', 'Sapi Kerja', 'Bibit', 'Penggemukan'],
                'Betina': ['Indukan', 'Sapi Perah', 'Sapi Potong', 'Bibit', 'Dara']
            },
            'Kambing': {
                'Jantan': ['Pejantan', 'Kambing Potong', 'Bibit', 'Penggemukan', 'Kambing Kerja'],
                'Betina': ['Indukan', 'Kambing Perah', 'Kambing Potong', 'Bibit', 'Dara']
            },
            'Domba': {
                'Jantan': ['Pejantan', 'Domba Potong', 'Bibit', 'Penggemukan', 'Domba Wol'],
                'Betina': ['Indukan', 'Domba Potong', 'Bibit', 'Dara', 'Domba Wol']
            },
            'Ayam': {
                'Jantan': ['Pejantan', 'Ayam Potong', 'Ayam Aduan', 'Bibit', 'Ayam Hias'],
                'Betina': ['Indukan', 'Ayam Petelur', 'Ayam Potong', 'Bibit', 'Ayam Hias']
            },
            'Bebek': {
                'Jantan': ['Pejantan', 'Bebek Potong', 'Bibit', 'Bebek Hias', 'Penggemukan'],
                'Betina': ['Indukan', 'Bebek Petelur', 'Bebek Potong', 'Bibit', 'Bebek Hias']
            }
        };

        return statusOptions[jenisHewan]?.[jenisKelamin] || [];
    };


    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value,
            // Reset status ternak if jenis hewan or kelamin changes
            ...(filterName === 'jenisHewan' || filterName === 'jenisKelamin' ? { statusTernak: '' } : {})
        }));
    };

    const handleBack = () => {
        router.push('/peternak/ternak');
    };

    const handleEdit = (id) => {
        console.log('Edit ternak:', id);
        // Navigate to edit page with ternak ID
        router.push(`/peternak/ternak/edit?id=${id}`);
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data ternak ini?')) {
            const updatedList = ternakList.filter(item => item.id !== id);
            localStorage.setItem('ternakList', JSON.stringify(updatedList));
            setTernakList(updatedList);
            
            // Trigger update event
            window.dispatchEvent(new CustomEvent('ternakDataUpdated'));
            
            alert('Data ternak berhasil dihapus!');
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
                                            <tr key={ternak.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-[Judson] text-gray-900">
                                                    {String(index + 1).padStart(2, '0')}
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
                                                            onClick={() => handleEdit(ternak.id)}
                                                            className="text-orange-600 hover:text-orange-900"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(ternak.id)}
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
                                            <td colSpan={6} className="px-6 py-4 text-center text-sm font-[Judson] text-gray-500">
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
                </div>
            </main>
        </div>
    );
}

// Loading component for Suspense fallback
function LoadingFallback() {
    return (
        <div className="flex min-h-screen">
            <Sidebar userType="peternak" />
            <main className="flex-1 bg-gray-100 p-6">
                <div className="flex items-center justify-center h-full">
                    <p className="text-lg font-[Judson]">Memuat halaman...</p>
                </div>
            </main>
        </div>
    );
}

// Main page component with Suspense boundary
export default function LihatTernakPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <LihatTernakContent />
        </Suspense>
    );
}