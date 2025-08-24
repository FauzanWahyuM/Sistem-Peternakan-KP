'use client';

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const months = [
    { id: 'januari', name: 'Januari' },
    { id: 'februari', name: 'Februari' },
    { id: 'maret', name: 'Maret' },
    { id: 'april', name: 'April' },
    { id: 'mei', name: 'Mei' },
    { id: 'juni', name: 'Juni' },
    { id: 'juli', name: 'Juli' },
    { id: 'agustus', name: 'Agustus' },
    { id: 'september', name: 'September' },
    { id: 'oktober', name: 'Oktober' },
    { id: 'november', name: 'November' },
    { id: 'desember', name: 'Desember' },
];

export default function CardSection() {
    const router = useRouter();
    const [status, setStatus] = useState<{ [key: string]: boolean }>({});
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());

    // hitung jumlah hari di bulan
    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const userId = "123";
                const newStatus: { [key: string]: boolean } = {};

                // pakai entries supaya ada idx
                for (const [idx, month] of months.entries()) {
                    const res = await fetch(
                        `/api/kuesioner?questionnaireId=${month.name}&userId=${userId}&month=${idx + 1}&year=${year}`
                    );
                    const data = res.ok ? await res.json() : null;
                    // ✅ cek status dari API, bukan sekadar cek ada data
                    newStatus[month.id] = data?.status === true;
                }

                setStatus(newStatus);
            } catch (err) {
                console.error("Gagal ambil status kuesioner:", err);
            }
        };

        fetchStatus();
    }, [year]); // ✅ tambahkan year sebagai dependency


    const handleViewForm = (id: string) => {
        router.push(`/peternak/kuesioner/lihatform?id=${id}`);
    };

    const handleFillForm = (id: string) => {
        router.push(`/peternak/kuesioner/isiform?id=${id}`);
    };

    return (
        <div className="w-full px-4 py-6">
            <div className="space-y-4">
                {months.map((month, idx) => {
                    const isActive = idx === currentMonth; // hanya bulan sekarang yg aktif
                    const totalDays = getDaysInMonth(idx, year);
                    const statusNow = status[month.id] || false;

                    return (
                        <div
                            key={month.id}
                            className="bg-white w-full shadow-lg rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gray-200"
                        >
                            <div className="flex-1">
                                <h3 className="text-2xl font-[Judson] font-bold text-gray-800">
                                    Kuesioner Bulan {month.name}
                                </h3>
                                <div className="mt-2 flex flex-wrap items-center gap-4">
                                    {statusNow ? (
                                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                            Sudah Diisi
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                                            Belum Diisi
                                        </span>
                                    )}
                                    <p className="text-gray-600">
                                        <span className="font-medium">Tanggal:</span>{" "}
                                        1 {month.name} {year} - {totalDays} {month.name} {year}
                                    </p>
                                </div>
                            </div>

                            {statusNow ? (
                                <button
                                    onClick={() => handleViewForm(month.id)}
                                    disabled={!isActive}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-[Judson] font-semibold shadow-md transition-colors duration-300 ${isActive
                                            ? "bg-[#60c67a] hover:bg-[#4fae65]"
                                            : "bg-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    <Image src="/edit.svg" alt="edit" width={20} height={20} />
                                    <span>Lihat Form</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleFillForm(month.id)}
                                    disabled={!isActive}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-[Judson] font-semibold shadow-md transition-colors duration-300 ${isActive
                                            ? "bg-[#60c67a] hover:bg-[#4fae65]"
                                            : "bg-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    <Image src="/edit.svg" alt="edit" width={20} height={20} />
                                    <span>Isi Form</span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
