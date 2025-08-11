'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CardSection() {
    const router = useRouter();
    const [ternakData, setTernakData] = useState([
        { jenis: 'Sapi', jumlah: 0 },
        { jenis: 'Kambing', jumlah: 0 },
        { jenis: 'Domba', jumlah: 0 },
        { jenis: 'Ayam', jumlah: 0 },
        { jenis: 'Bebek', jumlah: 0 }
    ]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load data from MongoDB when component mounts
    useEffect(() => {
        const loadTernakData = async () => {
            try {
                setLoading(true);
                // In a real implementation, you would get the actual user ID from session/context
                const userId = 'user-id-placeholder'; // This should be replaced with actual user ID
                
                const response = await fetch(`/api/livestock?stats=true&userId=${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch livestock statistics');
                }
                
                const result = await response.json();
                
                // Convert statistics data to the format expected by the UI
                const counts = {
                    'Sapi': 0,
                    'Kambing': 0,
                    'Domba': 0,
                    'Ayam': 0,
                    'Bebek': 0
                };
                
                // Update counts based on statistics data
                result.statistics.forEach(stat => {
                    if (counts.hasOwnProperty(stat._id)) {
                        counts[stat._id] = stat.total;
                    }
                });
                
                // Update ternak data with actual counts
                const updatedData = [
                    { jenis: 'Sapi', jumlah: counts['Sapi'] },
                    { jenis: 'Kambing', jumlah: counts['Kambing'] },
                    { jenis: 'Domba', jumlah: counts['Domba'] },
                    { jenis: 'Ayam', jumlah: counts['Ayam'] },
                    { jenis: 'Bebek', jumlah: counts['Bebek'] }
                ];
                
                setTernakData(updatedData);
                setError(null);
            } catch (err) {
                console.error('Error loading livestock data:', err);
                setError('Gagal memuat data ternak');
            } finally {
                setLoading(false);
            }
        };

        loadTernakData();
    }, []);

    const handleLihatData = (jenis) => {
        console.log(`Lihat data ${jenis}`);
        // Navigate to detail page with animal type filter
        router.push(`/peternak/ternak/lihat?jenis=${jenis}`);
    };

    const handleTambahData = () => {
        router.push('/peternak/ternak/tambah');
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header dengan tombol Tambah Data */}
                <div className="flex justify-end items-center">
                    <button
                        onClick={handleTambahData}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium font-[Judson]"
                    >
                        Tambah Data
                    </button>
                </div>

                {/* Loading state */}
                <div className="space-y-4">
                    <div className="flex justify-center items-center h-32">
                        <p className="text-lg font-[Judson]">Memuat data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                {/* Header dengan tombol Tambah Data */}
                <div className="flex justify-end items-center">
                    <button
                        onClick={handleTambahData}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium font-[Judson]"
                    >
                        Tambah Data
                    </button>
                </div>

                {/* Error state */}
                <div className="space-y-4">
                    <div className="flex justify-center items-center h-32">
                        <p className="text-lg font-[Judson] text-red-500">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header dengan tombol Tambah Data */}
            <div className="flex justify-end items-center">
                <button
                    onClick={handleTambahData}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium font-[Judson]"
                >
                    Tambah Data
                </button>
            </div>

            {/* Cards untuk setiap jenis ternak */}
            <div className="space-y-4">
                {ternakData.map((ternak, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-2 font-[Judson]">{ternak.jenis}</h2>
                                <p className="text-gray-600 text-xl font-[Judson]">Jumlah Ternak : {ternak.jumlah}</p>
                            </div>
                            <button
                                onClick={() => handleLihatData(ternak.jenis)}
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium font-[Judson]"
                            >
                                Lihat Data
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
