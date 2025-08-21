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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTernakData = async () => {
            try {
                setLoading(true);

                // TODO: ganti dengan userId dari login session
                const userId = '1234567890';

                const response = await fetch(`/api/ternak?stats=true&userId=${userId}`);
                if (!response.ok) {
                    throw new Error('Gagal mengambil data ternak');
                }

                const result = await response.json();

                const counts: Record<string, number> = {
                    'Sapi': 0,
                    'Kambing': 0,
                    'Domba': 0,
                    'Ayam': 0,
                    'Bebek': 0
                };

                // result.statistics = [{_id: "Sapi", total: 10}, ...]
                result.statistics.forEach((stat: any) => {
                    if (counts.hasOwnProperty(stat._id)) {
                        counts[stat._id] = stat.total;
                    }
                });

                setTernakData([
                    { jenis: 'Sapi', jumlah: counts['Sapi'] },
                    { jenis: 'Kambing', jumlah: counts['Kambing'] },
                    { jenis: 'Domba', jumlah: counts['Domba'] },
                    { jenis: 'Ayam', jumlah: counts['Ayam'] },
                    { jenis: 'Bebek', jumlah: counts['Bebek'] }
                ]);
                setError(null);
            } catch (err) {
                console.error('Error:', err);
                setError('Gagal memuat data ternak');
            } finally {
                setLoading(false);
            }
        };

        loadTernakData();
    }, []);

    const handleLihatData = (jenis: string) => {
        router.push(`/peternak/ternak/lihat?jenis=${jenis}`);
    };

    const handleTambahData = () => {
        router.push('/peternak/ternak/tambah');
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
            <div className="flex justify-center items-center h-32">
                <p className="text-lg font-[Judson] text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-end">
                <button
                    onClick={handleTambahData}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium font-[Judson]"
                >
                    Tambah Data
                </button>
            </div>

            {/* Cards */}
            <div className="space-y-4">
                {ternakData.map((ternak, i) => (
                    <div key={i} className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-2 font-[Judson]">
                                    {ternak.jenis}
                                </h2>
                                <p className="text-gray-600 text-xl font-[Judson]">
                                    Jumlah Ternak : {ternak.jumlah}
                                </p>
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
