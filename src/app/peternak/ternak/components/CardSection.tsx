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

    // Load data from localStorage when component mounts
    useEffect(() => {
        const loadTernakData = () => {
            const savedData = localStorage.getItem('ternakList');
            if (savedData) {
                const ternakList = JSON.parse(savedData);
                
                // Count animals by type
                const counts = {
                    'Sapi': 0,
                    'Kambing': 0,
                    'Domba': 0,
                    'Ayam': 0,
                    'Bebek': 0
                };

                ternakList.forEach(ternak => {
                    if (counts.hasOwnProperty(ternak.jenisHewan)) {
                        counts[ternak.jenisHewan]++;
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
            }
        };

        loadTernakData();

        // Listen for storage changes (when data is added from other tabs/windows)
        const handleStorageChange = (e) => {
            if (e.key === 'ternakList') {
                loadTernakData();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for custom events (when data is added in the same tab)
        const handleTernakUpdate = () => {
            loadTernakData();
        };

        window.addEventListener('ternakDataUpdated', handleTernakUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('ternakDataUpdated', handleTernakUpdate);
        };
    }, []);

    const handleLihatData = (jenis) => {
        console.log(`Lihat data ${jenis}`);
        // Navigate to detail page with animal type filter
        router.push(`/peternak/ternak/lihat?jenis=${jenis}`);
    };

    const handleTambahData = () => {
        router.push('/peternak/ternak/tambah');
    };
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
