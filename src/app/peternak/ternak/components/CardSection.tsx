'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CardSection() {
    const router = useRouter();
    const [ternakPribadi, setTernakPribadi] = useState([
        { jenis: 'Sapi', jumlah: 0 },
        { jenis: 'Kambing', jumlah: 0 },
        { jenis: 'Domba', jumlah: 0 },
        { jenis: 'Ayam', jumlah: 0 },
        { jenis: 'Bebek', jumlah: 0 }
    ]);
    const [ternakKelompok, setTernakKelompok] = useState([
        { jenis: 'Sapi', jumlah: 0 },
        { jenis: 'Kambing', jumlah: 0 },
        { jenis: 'Domba', jumlah: 0 },
        { jenis: 'Ayam', jumlah: 0 },
        { jenis: 'Bebek', jumlah: 0 }
    ]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    setUserId(data.user._id);
                    return data.user._id;
                }
                return null;
            } catch (error) {
                console.error('Error loading user data:', error);
                return null;
            }
        };

        const loadTernakData = async () => {
            try {
                setLoading(true);

                // Ambil userId dari session
                const user = await loadUserData();
                if (!user) {
                    throw new Error('User tidak ditemukan');
                }

                console.log('Loading data for user:', user);

                // Ambil data pribadi
                const responsePribadi = await fetch(`/api/ternak?stats=true&userId=${user}&tipe=pribadi`);
                if (!responsePribadi.ok) {
                    console.error('Error response pribadi:', responsePribadi.status, responsePribadi.statusText);
                    throw new Error('Gagal mengambil data ternak pribadi');
                }

                // Ambil data kelompok
                const responseKelompok = await fetch(`/api/ternak?stats=true&userId=${user}&tipe=kelompok`);
                if (!responseKelompok.ok) {
                    console.error('Error response kelompok:', responseKelompok.status, responseKelompok.statusText);
                    throw new Error('Gagal mengambil data ternak kelompok');
                }

                const resultPribadi = await responsePribadi.json();
                const resultKelompok = await responseKelompok.json();

                console.log('Data Pribadi:', resultPribadi);
                console.log('Data Kelompok:', resultKelompok);

                const countsPribadi: Record<string, number> = {
                    'Sapi': 0,
                    'Kambing': 0,
                    'Domba': 0,
                    'Ayam': 0,
                    'Bebek': 0
                };

                const countsKelompok: Record<string, number> = {
                    'Sapi': 0,
                    'Kambing': 0,
                    'Domba': 0,
                    'Ayam': 0,
                    'Bebek': 0
                };

                // Hitung total pribadi
                if (Array.isArray(resultPribadi)) {
                    resultPribadi.forEach((stat: any) => {
                        if (stat._id && countsPribadi.hasOwnProperty(stat._id)) {
                            countsPribadi[stat._id] = stat.total;
                        }
                    });
                }

                // Hitung total kelompok
                if (Array.isArray(resultKelompok)) {
                    resultKelompok.forEach((stat: any) => {
                        if (stat._id && countsKelompok.hasOwnProperty(stat._id)) {
                            countsKelompok[stat._id] = stat.total;
                        }
                    });
                }

                setTernakPribadi([
                    { jenis: 'Sapi', jumlah: countsPribadi['Sapi'] },
                    { jenis: 'Kambing', jumlah: countsPribadi['Kambing'] },
                    { jenis: 'Domba', jumlah: countsPribadi['Domba'] },
                    { jenis: 'Ayam', jumlah: countsPribadi['Ayam'] },
                    { jenis: 'Bebek', jumlah: countsPribadi['Bebek'] }
                ]);

                setTernakKelompok([
                    { jenis: 'Sapi', jumlah: countsKelompok['Sapi'] },
                    { jenis: 'Kambing', jumlah: countsKelompok['Kambing'] },
                    { jenis: 'Domba', jumlah: countsKelompok['Domba'] },
                    { jenis: 'Ayam', jumlah: countsKelompok['Ayam'] },
                    { jenis: 'Bebek', jumlah: countsKelompok['Bebek'] }
                ]);

                setError(null);
            } catch (err: any) {
                console.error('Error:', err);
                setError(err.message || 'Gagal memuat data ternak');
            } finally {
                setLoading(false);
            }
        };

        loadTernakData();
    }, [router]);

    // Fungsi untuk menangani klik Lihat Data dengan parameter
    const handleLihatData = (jenis: string, tipe: string) => {
        // Kirim parameter jenis dan tipe ke URL untuk filter otomatis
        router.push(`/peternak/ternak/lihat?jenis=${encodeURIComponent(jenis)}&tipe=${encodeURIComponent(tipe)}`);
    };

    const handleTambahData = () => {
        router.push('/peternak/ternak/tambah');
    };

    // Fungsi untuk refresh data
    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <p className="text-lg font-[Judson]">Memuat data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex justify-end gap-4">
                    <button
                        onClick={handleRefresh}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium font-[Judson]"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={handleTambahData}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium font-[Judson]"
                    >
                        Tambah Data
                    </button>
                </div>

                <div className="flex justify-center items-center mt-4">
                    <p className="text-lg font-[Judson] text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-end gap-4">
                <button
                    onClick={handleRefresh}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium font-[Judson]"
                >
                    Refresh Data
                </button>
                <button
                    onClick={handleTambahData}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium font-[Judson]"
                >
                    Tambah Data
                </button>
            </div>

            {/* Section Ternak Pribadi */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 font-[Judson] flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                        Data Ternak Pribadi
                    </h2>
                    <p className="text-gray-600 mt-1 font-[Judson]">
                        Data ternak milik pribadi Anda
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {ternakPribadi.map((ternak, i) => (
                        <div key={i} className="bg-blue-50 rounded-lg border border-blue-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-blue-800 mb-2 font-[Judson]">
                                    {ternak.jenis}
                                </h3>
                                <p className="text-3xl font-bold text-blue-600 mb-4 font-[Judson]">
                                    {ternak.jumlah}
                                </p>
                                <p className="text-sm text-blue-700 mb-4 font-[Judson]">
                                    Ekor
                                </p>
                                <button
                                    onClick={() => handleLihatData(ternak.jenis, 'pribadi')}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium font-[Judson] w-full"
                                >
                                    Lihat Data
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section Ternak Kelompok */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 font-[Judson] flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                        Data Ternak Kelompok
                    </h2>
                    <p className="text-gray-600 mt-1 font-[Judson]">
                        Data ternak milik kelompok Anda
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {ternakKelompok.map((ternak, i) => (
                        <div key={i} className="bg-green-50 rounded-lg border border-green-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-green-800 mb-2 font-[Judson]">
                                    {ternak.jenis}
                                </h3>
                                <p className="text-3xl font-bold text-green-600 mb-4 font-[Judson]">
                                    {ternak.jumlah}
                                </p>
                                <p className="text-sm text-green-700 mb-4 font-[Judson]">
                                    Ekor
                                </p>
                                <button
                                    onClick={() => handleLihatData(ternak.jenis, 'kelompok')}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium font-[Judson] w-full"
                                >
                                    Lihat Data
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}