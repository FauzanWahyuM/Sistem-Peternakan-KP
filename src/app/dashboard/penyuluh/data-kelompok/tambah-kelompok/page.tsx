'use client';

import Sidebar from '../../components/UnifiedSidebar';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Anggota {
    _id: string;
    nama: string;
    role: string;
}

export default function TambahKelompokPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
    const [loadingAnggota, setLoadingAnggota] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state tetap menggunakan nama
    const [newKelompok, setNewKelompok] = useState({
        nama: '',
        anggota: [] as string[],
        status: 'aktif'
    });

    // Fetch data anggota saat komponen dimuat
    useEffect(() => {
        fetchAnggota();
    }, []);

    // Fungsi untuk mengambil data anggota
    const fetchAnggota = async () => {
        try {
            setLoadingAnggota(true);
            const response = await fetch('/api/users');

            if (!response.ok) {
                throw new Error('Gagal mengambil data anggota');
            }

            const data = await response.json();
            // Filter hanya user dengan role peternak
            const peternakUsers = data.filter((user: Anggota) => user.role === 'peternak');
            setAnggotaList(peternakUsers);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setLoadingAnggota(false);
        }
    };

    // Fungsi untuk menangani perubahan form
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewKelompok(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Fungsi untuk menangani pemilihan anggota
    const toggleAnggota = (nama: string) => {
        setNewKelompok(prev => {
            if (prev.anggota.includes(nama)) {
                return {
                    ...prev,
                    anggota: prev.anggota.filter(a => a !== nama)
                };
            } else {
                return {
                    ...prev,
                    anggota: [...prev.anggota, nama]
                };
            }
        });
    };

    // Fungsi untuk submit form tambah kelompok
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            // Data yang akan dikirim ke API - ubah nama menjadi kelompokid
            const dataToSend = {
                kelompokid: newKelompok.nama, // Gunakan nama sebagai kelompokid
                nama: newKelompok.nama,       // Tetap kirim nama juga jika diperlukan
                anggota: newKelompok.anggota,
                status: newKelompok.status
            };

            const response = await fetch('/api/kelompok', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend), // Kirim data yang sudah dimodifikasi
            });

            if (!response.ok) {
                throw new Error('Gagal menambahkan kelompok');
            }

            // Redirect kembali ke halaman data kelompok
            router.push('/dashboard/penyuluh/data-kelompok');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
            setLoading(false);
        }
    };

    // Filter anggota berdasarkan pencarian
    const filteredAnggota = anggotaList.filter(anggota =>
        anggota.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar dengan sticky */}
            <div className="sticky top-0 h-screen">
                <Sidebar userType="penyuluh" />
            </div>

            <main className="flex-1 p-6">
                {/* Header dengan tombol kembali */}
                <div className="mb-8 flex items-center">
                    <Link
                        href="/dashboard/penyuluh/data-kelompok"
                        className="text-green-600 hover:text-green-800 mr-4"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800">Tambah Kelompok Baru</h1>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-red-400 text-xl">⚠️</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Kelompok
                            </label>
                            <input
                                type="text"
                                name="nama"
                                value={newKelompok.nama}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                                placeholder="Masukkan nama kelompok"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={newKelompok.status}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="aktif">Aktif</option>
                                <option value="non-aktif">Non-Aktif</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pilih Anggota (Peternak)
                            </label>

                            {loadingAnggota ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                                    <span className="ml-2 text-gray-600">Memuat data anggota...</span>
                                </div>
                            ) : (
                                <>
                                    {/* Search input */}
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            placeholder="Cari anggota..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600 placeholder-gray-400"
                                        />
                                    </div>

                                    {/* Anggota selection */}
                                    <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                                        {filteredAnggota.length === 0 ? (
                                            <p className="text-gray-500 text-center py-4">
                                                {searchTerm ? 'Tidak ada anggota yang sesuai' : 'Tidak ada anggota peternak tersedia'}
                                            </p>
                                        ) : (
                                            filteredAnggota.map(anggota => (
                                                <div key={anggota._id} className="flex items-center mb-2 last:mb-0">
                                                    <input
                                                        type="checkbox"
                                                        id={`anggota-${anggota._id}`}
                                                        checked={newKelompok.anggota.includes(anggota.nama)}
                                                        onChange={() => toggleAnggota(anggota.nama)}
                                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                                    />
                                                    <label
                                                        htmlFor={`anggota-${anggota._id}`}
                                                        className="ml-2 block text-sm text-gray-700 cursor-pointer"
                                                    >
                                                        {anggota.nama}
                                                    </label>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Selected count */}
                                    <div className="mt-2 text-sm text-gray-600">
                                        {newKelompok.anggota.length} anggota terpilih
                                    </div>

                                    {/* Selected list */}
                                    {newKelompok.anggota.length > 0 && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Anggota terpilih:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {newKelompok.anggota.map((nama, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                                    >
                                                        {nama}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleAnggota(nama)}
                                                            className="ml-1.5 inline-flex rounded-full flex-shrink-0 p-0.5 text-green-500 hover:bg-green-200 hover:text-green-600"
                                                        >
                                                            <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                                                <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                                            </svg>
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <Link
                                href="/dashboard/penyuluh/data-kelompok"
                                className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                            >
                                {loading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}