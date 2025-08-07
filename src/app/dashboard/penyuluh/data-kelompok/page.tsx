'use client';

import Sidebar from '../components/UnifiedSidebar';
import { useRouter } from 'next/navigation';

export default function DataKelompokPage() {
    const router = useRouter();

    const kelompokData = [
        {
            id: 'A',
            nama: 'Kelompok A',
            anggota: ['Gideon', 'Fauzan', 'Syahrul']
        },
        {
            id: 'B',
            nama: 'Kelompok B',
            anggota: ['Ahmad', 'Budi', 'Citra']
        },
        {
            id: 'C',
            nama: 'Kelompok C',
            anggota: ['Dani', 'Eka', 'Farid']
        },
        {
            id: 'D',
            nama: 'Kelompok D',
            anggota: ['Gita', 'Hadi', 'Ira']
        }
    ];

    const handleKelompokClick = (kelompokId: string) => {
        router.push(`/dashboard/penyuluh/data-kelompok/${kelompokId}`);
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
                        <div key={kelompok.id} className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-xl font-bold mb-4">{kelompok.nama}</h3>

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
                                className="bg-white text-green-600 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors w-full"
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