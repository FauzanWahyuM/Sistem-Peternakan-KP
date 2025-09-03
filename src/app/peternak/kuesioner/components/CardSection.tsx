'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const months = [
    { id: 'januari', name: 'Januari', number: 1 },
    { id: 'februari', name: 'Februari', number: 2 },
    { id: 'maret', name: 'Maret', number: 3 },
    { id: 'april', name: 'April', number: 4 },
    { id: 'mei', name: 'Mei', number: 5 },
    { id: 'juni', name: 'Juni', number: 6 },
    { id: 'juli', name: 'Juli', number: 7 },
    { id: 'agustus', name: 'Agustus', number: 8 },
    { id: 'september', name: 'September', number: 9 },
    { id: 'oktober', name: 'Oktober', number: 10 },
    { id: 'november', name: 'November', number: 11 },
    { id: 'desember', name: 'Desember', number: 12 },
];

export default function CardSection() {
    const router = useRouter();
    const { data: session } = useSession();
    const [status, setStatus] = useState<{ [key: string]: boolean }>({});
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    // hitung jumlah hari di bulan
    const getDaysInMonth = useCallback((month: number, year: number) => {
        return new Date(year, month, 0).getDate();
    }, []);

    useEffect(() => {
        const fetchStatus = async () => {
            if (!session?.user?.id) return;

            try {
                const newStatus: { [key: string]: boolean } = {};

                for (const month of months) {
                    const res = await fetch(
                        `/api/kuesioner?questionnaireId=${month.name}&userId=${session.user.id}&month=${month.number}&year=${currentYear}`
                    );

                    if (res.ok) {
                        const data = await res.json();
                        newStatus[month.id] = data?.status === true;
                    } else {
                        newStatus[month.id] = false;
                    }
                }

                setStatus(newStatus);
            } catch (err) {
                console.error("Gagal ambil status kuesioner:", err);
            }
        };

        fetchStatus();
    }, [session, currentYear]);

    const isMonthActive = useCallback((monthNumber: number) => {
        const now = new Date();
        return (
            monthNumber === now.getMonth() + 1 &&
            currentYear === now.getFullYear()
        );
    }, [currentYear]);

    const handleViewForm = (id: string) => {
        router.push(`/peternak/kuesioner/lihatform?id=${id}`);
    };

    const handleFillForm = (id: string) => {
        router.push(`/peternak/kuesioner/isiform?id=${id}`);
    };

    return (
        <div className="w-full px-4 py-6">
            <div className="space-y-4">
                {months.map((month) => {
                    const isActive = isMonthActive(month.number);
                    const totalDays = getDaysInMonth(month.number, currentYear);
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
                                        1 {month.name} {currentYear} - {totalDays} {month.name} {currentYear}
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