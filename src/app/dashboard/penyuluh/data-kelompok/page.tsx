'use client';

import Sidebar from '../components/UnifiedSidebar';
import { useRouter } from 'next/navigation';

export default function DataKelompokPage() {
    const router = useRouter();

    const kelompokData = [
        {
            id: 'A',
            nama: 'Kelompok A',
            anggota: ['Gideon', 'Fauzan', 'Syahrul'],
            status: 'aktif'
        },
        {
            id: 'B',
            nama: 'Kelompok B',
            anggota: ['Ahmad', 'Budi', 'Citra'],
            status: 'tidak aktif'
        },
        {
            id: 'C',
            nama: 'Kelompok C',
            anggota: ['Dani', 'Eka', 'Farid'],
            status: 'aktif'
        },
        {
            id: 'D',
            nama: 'Kelompok D',
            anggota: ['Gita', 'Hadi', 'Ira'],
            status: 'pending'
        }
    ];

    const handleKelompokClick = (kelompokId: string) => {
        router.push(`/dashboard/penyuluh/data-kelompok/${kelompokId}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'aktif':
                return 'bg-green-500';
            case 'tidak aktif':
                return 'bg-red-500';
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
            case 'tidak aktif':
                return 'bg-white text-red-600 hover:bg-gray-100';
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
            case 'tidak aktif':
                return 'Tidak Aktif';
            case 'pending':
                return 'Pending';
            default:
                return status;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar userType="penyuluh" />
            <main className="flex-1 p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 text-center">Data Kelompok</h1>
                </div>

                {/* Kelompok Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {kelompokData.map((kelompok) => (
                        <div key={kelompok.id} className={`${getStatusColor(kelompok.status)} text-white p-6 rounded-lg shadow-lg`}>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold">{kelompok.nama}</h3>
                                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium text-black">
                                    {getStatusText(kelompok.status)}
                                </span>
                            </div>

                            {/* Anggota List */}
                            <div className="mb-6 space-y-1">
                                {kelompok.anggota.map((anggota, index) => (
                                    <p key={index} className="text-white opacity-90">
                                        {anggota}
                                    </p>
                                ))}
                            </div>

                            {/* Selengkapnya Button */}
                            <button
                                onClick={() => handleKelompokClick(kelompok.id)}
                                className={`${getButtonColor(kelompok.status)} px-6 py-2 rounded-full font-medium transition-colors w-full`}
                            >
                                Selengkapnya
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}