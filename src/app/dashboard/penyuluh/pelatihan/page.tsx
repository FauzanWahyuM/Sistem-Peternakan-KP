'use client';

import Sidebar from '../components/Sidebar';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2 } from 'lucide-react';

export default function PelatihanPage() {
    const router = useRouter();

    // Data pelatihan
    const pelatihanData = [
        {
            id: 1,
            judul: 'Pemahaman Dasar Peternakan Modern',
            deskripsi: 'Pembelajaran tentang teknologi terbaru dalam bidang peternakan',
            gambar: 'Foto.jpg',
            tanggal: '11/02/2025'
        },
        {
            id: 2,
            judul: 'Artikel Manajemen Pakan Ternak',
            deskripsi: 'Panduan lengkap mengenai nutrisi dan manajemen pakan',
            gambar: 'Foto.png',
            tanggal: '16/03/2025'
        },
        {
            id: 3,
            judul: 'Jika Ternak Sakit: Penanganan Pertama',
            deskripsi: 'Langkah-langkah penanganan darurat untuk ternak yang sakit',
            gambar: 'Foto.jpg',
            tanggal: '23/04/2025'
        }
    ];

    const handleTambahPelatihan = () => {
        router.push('/dashboard/penyuluh/pelatihan/tambah');
    };

    const handleEdit = (id: number) => {
        console.log('Edit pelatihan', id);
        // Implementasi edit functionality
    };

    const handleDelete = (id: number) => {
        console.log('Delete pelatihan', id);
        // Implementasi delete functionality
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 p-6">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Pelatihan</h1>
                    <button
                        onClick={handleTambahPelatihan}
                        className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                    >
                        Tambah Pelatihan
                    </button>
                </div>

                {/* Pelatihan Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                                        Judul
                                    </th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                                        Deskripsi
                                    </th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                                        Gambar
                                    </th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                                        Tanggal
                                    </th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {pelatihanData.map((pelatihan, index) => (
                                    <tr
                                        key={pelatihan.id}
                                        className={`border-b border-gray-200 hover:bg-gray-50 ${index === pelatihanData.length - 1 ? 'border-b-0' : ''
                                            }`}
                                    >
                                        <td className="py-4 px-6 text-gray-800">
                                            {pelatihan.judul.length > 30
                                                ? `${pelatihan.judul.substring(0, 30)}...`
                                                : pelatihan.judul
                                            }
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">
                                            {pelatihan.deskripsi.length > 40
                                                ? `${pelatihan.deskripsi.substring(0, 40)}...`
                                                : pelatihan.deskripsi
                                            }
                                        </td>
                                        <td className="py-4 px-6 text-gray-800">
                                            {pelatihan.gambar}
                                        </td>
                                        <td className="py-4 px-6 text-gray-800">
                                            {pelatihan.tanggal}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => handleEdit(pelatihan.id)}
                                                    className="text-orange-500 hover:text-orange-700 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(pelatihan.id)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}