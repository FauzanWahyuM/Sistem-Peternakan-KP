'use client';

import Sidebar from '../components/Sidebar';

export default function HasilEvaluasiPage() {
    const evaluasiData = [
        {
            kelompok: 'A',
            anggota: [
                { nama: 'Gideon', nilai: '90/100' },
                { nama: 'Fauzan', nilai: '88/100' },
                { nama: 'Syahrul', nilai: '80/100' }
            ]
        },
        {
            kelompok: 'B',
            anggota: [
                { nama: 'Ahmad', nilai: '92/100' },
                { nama: 'Budi', nilai: '85/100' },
                { nama: 'Citra', nilai: '78/100' }
            ]
        },
        {
            kelompok: 'C',
            anggota: [
                { nama: 'Dani', nilai: '95/100' },
                { nama: 'Eka', nilai: '89/100' },
                { nama: 'Farid', nilai: '82/100' }
            ]
        },
        {
            kelompok: 'D',
            anggota: [
                { nama: 'Gita', nilai: '87/100' },
                { nama: 'Hadi', nilai: '91/100' },
                { nama: 'Ira', nilai: '84/100' }
            ]
        },
        {
            kelompok: 'E',
            anggota: [
                { nama: 'Joko', nilai: '93/100' },
                { nama: 'Kiki', nilai: '86/100' },
                { nama: 'Lina', nilai: '79/100' }
            ]
        },
        {
            kelompok: 'F',
            anggota: [
                { nama: 'Maya', nilai: '88/100' },
                { nama: 'Nani', nilai: '90/100' },
                { nama: 'Omar', nilai: '83/100' }
            ]
        }
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 text-center">Hasil Evaluasi</h1>
                </div>

                {/* Evaluation Tables Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
                    {evaluasiData.map((kelompok) => (
                        <div key={kelompok.kelompok} className="bg-white rounded-lg shadow-lg overflow-hidden">
                            {/* Table Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b">
                                <h3 className="text-xl font-bold text-gray-800">
                                    Kelompok {kelompok.kelompok}
                                </h3>
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
                                                Nilai Kuesioner
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
                                                    {anggota.nilai}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}