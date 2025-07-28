'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Kuesioner() {
    const [data, setData] = useState([]);
    const router = useRouter();

    useEffect(() => {
        // Simulasi pengambilan data dan status dari localStorage
        const defaultData = [
            { bulan: 'Bulan Ke-1', tanggal: '25-Juli-2025' },
            { bulan: 'Bulan Ke-2', tanggal: '25-Agustus-2025' },
            { bulan: 'Bulan Ke-3', tanggal: '25-September-2025' },
            { bulan: 'Bulan Ke-4', tanggal: '25-Oktober-2025' },
        ];

        let storedData;
        try {
            const stored = localStorage.getItem('kuesionerData');
            storedData = stored ? JSON.parse(stored) : defaultData;
            // Pastikan storedData adalah array
            if (!Array.isArray(storedData)) {
                storedData = defaultData;
            }
        } catch (error) {
            storedData = defaultData;
        }

        const statusData = storedData.map((item, idx) => {
            const isFilled = localStorage.getItem(`kuesioner_filled_${idx}`) === 'true';
            return {
                ...item,
                filled: isFilled,
                status: isFilled ? 'Sudah Diisi' : 'Belum Diisi',
            };
        });

        setData(statusData);
    }, []);

    const handleButtonClick = (idx) => {
        if (data[idx].filled) {
            router.push(`/peternak/kuesioner/lihatform?id=${idx}`);
        } else {
            router.push(`/peternak/kuesioner/isiform?id=${idx}`);
        }
    };

    return (
        <div className="w-full px-4 py-6">
            <div className="space-y-4">
                {data.map((item, idx) => (
                    <div
                        key={idx}
                        className="bg-white w-full shadow-md border rounded-md p-6 flex justify-between items-center"
                    >
                        <div>
                            <h3 className="text-3xl font-semibold">{item.bulan}</h3>
                            <p className="text-xl mt-1">Status : {item.status}</p>
                            <p className="text-xl">Tanggal : {item.tanggal}</p>
                        </div>

                        <button
                            onClick={() => handleButtonClick(idx)}
                            className="flex items-center gap-2 px-4 py-2 rounded-md text-white font-semibold shadow-md bg-green-500 hover:bg-green-600"
                        >
                            <Image src="/edit.svg" alt="edit" width={25} height={25} />
                            {item.filled ? 'Lihat Form' : 'Isi Form'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

