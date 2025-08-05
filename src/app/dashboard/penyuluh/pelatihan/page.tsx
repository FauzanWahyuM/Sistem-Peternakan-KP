'use client';

import Sidebar from '../components/Sidebar';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2 } from 'lucide-react';
import { usePelatihanStorage } from '../hooks/usePelatihanStorage';
import { useState } from 'react';

export default function PelatihanPage() {
    const router = useRouter();
    const { pelatihan, loading, deletePelatihan } = usePelatihanStorage();
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

    // Format tanggal untuk ditampilkan
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleTambahPelatihan = () => {
        router.push('/dashboard/penyuluh/pelatihan/tambah');
    };

    const handleEdit = (id: number) => {
        router.push(`/dashboard/penyuluh/pelatihan/edit/${id}`);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pelatihan ini?')) {
            try {
                setDeleteLoading(id);
                const success = deletePelatihan(id);
                if (success) {
                    alert('Pelatihan berhasil dihapus!');
                } else {
                    alert('Gagal menghapus pelatihan!');
                }
            } catch (error) {
                console.error('Error deleting pelatihan:', error);
                alert('Terjadi kesalahan saat menghapus pelatihan!');
            } finally {
                setDeleteLoading(null);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-lg text-gray-600">Loading...</div>
                    </div>
                </main>
            </div>
        );
    }

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
                                {pelatihan.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 px-6 text-center text-gray-500">
                                            Belum ada data pelatihan
                                        </td>
                                    </tr>
                                ) : (
                                    pelatihan.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className={`border-b border-gray-200 hover:bg-gray-50 ${index === pelatihan.length - 1 ? 'border-b-0' : ''
                                                }`}
                                        >
                                            <td className="py-4 px-6 text-gray-800">
                                                {item.judul.length > 30
                                                    ? `${item.judul.substring(0, 30)}...`
                                                    : item.judul
                                                }
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">
                                                {item.deskripsi.length > 40
                                                    ? `${item.deskripsi.substring(0, 40)}...`
                                                    : item.deskripsi
                                                }
                                            </td>
                                            <td className="py-4 px-6 text-gray-800">
                                                {item.gambar}
                                            </td>
                                            <td className="py-4 px-6 text-gray-800">
                                                {formatDate(item.tanggal)}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => handleEdit(item.id)}
                                                        className="text-orange-500 hover:text-orange-700 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        disabled={deleteLoading === item.id}
                                                        className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}