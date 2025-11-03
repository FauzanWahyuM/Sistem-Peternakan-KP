// app/peternak/components/CardSection.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

const periods = [
    { id: 'jan-jun', name: 'Periode Jan-Jun', months: [1, 2, 3, 4, 5, 6] },
    { id: 'jul-des', name: 'Periode Jul-Des', months: [7, 8, 9, 10, 11, 12] },
];

interface PeriodStatus {
    [key: string]: boolean;
}

export default function CardSection() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [periodStatus, setPeriodStatus] = useState<PeriodStatus>({});

    // Generate available years (current year and previous 2 years)
    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= currentYear - 2; i--) {
            years.push(i);
        }
        setAvailableYears(years);
    }, []);

    // Load data function dengan useCallback - MIRIP DENGAN YANG DULU
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Check if we're returning from a form submission - SAMA SEPERTI DULU
            const urlParams = new URLSearchParams(window.location.search);
            const submittedPeriod = urlParams.get('submitted');
            const submittedYear = urlParams.get('year');

            console.log('URL Params:', { submittedPeriod, submittedYear });

            if (submittedPeriod && submittedYear) {
                // OPTIMISTIC UPDATE: langsung update status tanpa delay - KEY DI SINI!
                const submittedKey = `${submittedPeriod}-${submittedYear}`;
                console.log('Optimistic update for:', submittedKey);

                // Update status optimistically
                setPeriodStatus(prev => ({
                    ...prev,
                    [submittedKey]: true
                }));

                // Clean up URL parameter - SAMA SEPERTI DULU
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }

            // Load actual status from API untuk semua period
            console.log('Loading actual status for year:', selectedYear);
            const statusPromises = periods.map(async (period) => {
                const periodKey = `${period.id}-${selectedYear}`;

                try {
                    const questionnaireId = period.id === 'jan-jun' ? 'Januari' : 'Juli';
                    const res = await fetch(
                        `/api/kuesioner?questionnaireId=${questionnaireId}&period=${period.id}&year=${selectedYear}`,
                        {
                            method: 'GET',
                            credentials: 'include',
                        }
                    );

                    if (res.ok) {
                        const data = await res.json();
                        return { periodKey, status: data.status };
                    } else {
                        console.error(`Failed to fetch status for ${periodKey}`);
                        return { periodKey, status: false };
                    }
                } catch (err) {
                    console.error(`Error fetching status for ${periodKey}:`, err);
                    return { periodKey, status: false };
                }
            });

            const results = await Promise.all(statusPromises);
            const newStatus: PeriodStatus = {};
            results.forEach(result => {
                newStatus[result.periodKey] = result.status;
            });

            // Merge dengan optimistic update jika ada
            setPeriodStatus(prev => {
                const merged = { ...newStatus, ...prev };
                console.log('Merged status:', merged);
                return merged;
            });

        } catch (err: any) {
            console.error("Error loading data:", err);
            setError(err.message || "Gagal memuat data kuesioner");
        } finally {
            setLoading(false);
        }
    }, [selectedYear]);

    useEffect(() => {
        loadData();
    }, [loadData, retryCount, selectedYear]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
    };

    const isFillFormActive = (periodId: string) => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        if (selectedYear < currentYear) {
            return false;
        }

        if (selectedYear === currentYear) {
            if (periodId === 'jan-jun') {
                return currentMonth >= 1 && currentMonth <= 6;
            } else if (periodId === 'jul-des') {
                return currentMonth >= 7 && currentMonth <= 12;
            }
        }

        return false;
    };

    const handleViewForm = (periodId: string) => {
        router.push(`/peternak/kuesioner/lihatform?period=${periodId}&year=${selectedYear}`);
    };

    const handleFillForm = (periodId: string) => {
        router.push(`/peternak/kuesioner/isiform?period=${periodId}&year=${selectedYear}`);
    };

    const getPeriodDateRange = (periodId: string) => {
        if (periodId === 'jan-jun') {
            return `1 Januari ${selectedYear} - 30 Juni ${selectedYear}`;
        } else {
            return `1 Juli ${selectedYear} - 31 Desember ${selectedYear}`;
        }
    };

    const getCurrentPeriod = () => {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        return currentMonth <= 6 ? 'jan-jun' : 'jul-des';
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
            {/* Year Selection Dropdown */}
            <div className="mb-6">
                <label htmlFor="year-select" className="block text-sm font-[Judson] font-medium text-gray-700 mb-2">
                    Pilih Tahun:
                </label>
                <select
                    id="year-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="block w-48 px-3 py-2 border border-gray-300 font-[Judson] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                    {availableYears.map(year => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-4">
                {periods.map((period) => {
                    const canFillForm = isFillFormActive(period.id);
                    const periodKey = `${period.id}-${selectedYear}`;
                    const statusNow = periodStatus[periodKey] || false;
                    const currentPeriod = getCurrentPeriod();
                    const isCurrentPeriod = period.id === currentPeriod && selectedYear === new Date().getFullYear();

                    console.log(`Rendering ${periodKey}:`, statusNow);

                    return (
                        <div
                            key={period.id}
                            className={`bg-white w-full shadow-lg rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border ${isCurrentPeriod ? 'border-green-500 border-2' : 'border-gray-200'
                                }`}
                        >
                            <div className="flex-1">
                                <h3 className="text-2xl font-[Judson] font-bold text-gray-800">
                                    {period.name} {selectedYear}
                                    {isCurrentPeriod && (
                                        <span className="ml-2 px-2 py-1 text-xs font-[Judson] bg-green-100 text-green-800 rounded-full">
                                            Periode Saat Ini
                                        </span>
                                    )}
                                </h3>
                                <div className="mt-2 flex flex-wrap items-center gap-4">
                                    {statusNow ? (
                                        <span className="px-3 py-1 rounded-full text-sm font-[Judson] font-semibold bg-green-100 text-green-800">
                                            Sudah Diisi
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full text-sm font-[Judson] font-semibold bg-yellow-100 text-yellow-800">
                                            Belum Diisi
                                        </span>
                                    )}
                                    <p className="text-gray-600 font-[Judson]">
                                        <span className="font-medium">Tanggal:</span>{" "}
                                        {getPeriodDateRange(period.id)}
                                    </p>
                                    {!canFillForm && !statusNow && (
                                        <span className="px-2 py-1 text-xs bg-gray-100 font-[Judson] text-gray-600 rounded">
                                            Belum waktunya mengisi
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                {/* Tombol Lihat Form - selalu aktif jika sudah diisi */}
                                {statusNow && (
                                    <button
                                        onClick={() => handleViewForm(period.id)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-[Judson] font-semibold shadow-md transition-colors duration-300 bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Image src="/view.svg" alt="view" width={20} height={20} />
                                        <span>Lihat Form</span>
                                    </button>
                                )}

                                {/* Tombol Isi Form - hanya aktif jika dalam periode yang sesuai */}
                                {!statusNow && (
                                    <button
                                        onClick={() => handleFillForm(period.id)}
                                        disabled={!canFillForm}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-[Judson] font-semibold shadow-md transition-colors duration-300 ${canFillForm
                                            ? "bg-[#60c67a] hover:bg-[#4fae65]"
                                            : "bg-gray-400 cursor-not-allowed"
                                            }`}
                                    >
                                        <Image src="/edit.svg" alt="edit" width={20} height={20} />
                                        <span>Isi Form</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}