// app/peternak/components/CardSection.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useKuesionerStatus } from '../../../hooks/useKuesionerStatus';

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
    const { status, updateStatus } = useKuesionerStatus();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const currentYear = new Date().getFullYear();

    // Load data function dengan useCallback
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Check if we're returning from a form submission
            const urlParams = new URLSearchParams(window.location.search);
            const submittedMonth = urlParams.get('submitted');

            if (submittedMonth) {
                // Simulate API call delay for form submission - 10 DETIK
                await new Promise(resolve => setTimeout(resolve, 10000));

                // Update the status for the submitted month
                updateStatus(submittedMonth, true);

                // Clean up URL parameter
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            } else {
                // Simulate initial data loading - 10 DETIK
                await new Promise(resolve => setTimeout(resolve, 10000));
            }

            setLoading(false);

        } catch (err: any) {
            console.error("Error loading data:", err);
            setError(err.message || "Gagal memuat data kuesioner");
            setLoading(false);
        }
    }, [updateStatus]);

    useEffect(() => {
        loadData();
    }, [loadData, retryCount]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
    };

    // hitung jumlah hari di bulan
    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month, 0).getDate();
    };

    const isMonthActive = (monthNumber: number) => {
        const now = new Date();
        return (
            monthNumber === now.getMonth() + 1 &&
            currentYear === now.getFullYear()
        );
    };

    const handleViewForm = (id: string) => {
        router.push(`/peternak/kuesioner/lihatform?id=${id}`);
    };

    const handleFillForm = (id: string) => {
        router.push(`/peternak/kuesioner/isiform?id=${id}&year=${currentYear}`);
    };

    if (loading) {
        return (
            <div className="w-full px-4 py-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Memproses data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full px-4 py-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-red-400 text-xl">⚠️</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                {error}
                            </p>
                            <div className="mt-2">
                                <button
                                    onClick={handleRetry}
                                    className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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