// app/peternak/components/CardSection.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Edit, Eye } from 'lucide-react';

const periods = [
    { id: 'jan-jun', name: 'Periode Januari-Juni', months: [1, 2, 3, 4, 5, 6] },
    { id: 'jul-des', name: 'Periode Juli-Desember', months: [7, 8, 9, 10, 11, 12] },
];

interface PeriodStatus {
    [key: string]: boolean;
}

interface PeriodInfo {
    status: 'completed' | 'available' | 'upcoming' | 'overdue' | 'future' | 'past';
    message: string;
    canFill: boolean;
    canView: boolean;
    isCurrent: boolean;
}

export default function CardSection() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [periodStatus, setPeriodStatus] = useState<PeriodStatus>({});

    // Generate available years (2 tahun lalu, tahun ini, 2 tahun depan)
    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const years = [];

        // 2 tahun lalu hingga 2 tahun depan
        for (let i = currentYear - 2; i <= currentYear + 2; i++) {
            years.push(i);
        }

        setAvailableYears(years);
        setSelectedYear(currentYear);
    }, []);

    // Load data function dengan useCallback
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Check if we're returning from a form submission
            // Gunakan URLSearchParams dari window, bukan dari next/navigation
            const urlParams = new URLSearchParams(window.location.search);
            const submittedPeriod = urlParams.get('submitted');
            const submittedYear = urlParams.get('year');

            if (submittedPeriod && submittedYear) {
                const submittedKey = `${submittedPeriod}-${submittedYear}`;
                setPeriodStatus(prev => ({
                    ...prev,
                    [submittedKey]: true
                }));
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }

            // Load actual status from API untuk semua period
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
                    }
                    return { periodKey, status: false };
                } catch (err) {
                    return { periodKey, status: false };
                }
            });

            const results = await Promise.all(statusPromises);
            const newStatus: PeriodStatus = {};
            results.forEach(result => {
                newStatus[result.periodKey] = result.status;
            });

            setPeriodStatus(prev => ({ ...newStatus, ...prev }));
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

    const getPeriodInfo = useCallback((periodId: string, statusNow: boolean): PeriodInfo => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const isCurrentYear = selectedYear === currentYear;
        const isPastYear = selectedYear < currentYear;
        const isFutureYear = selectedYear > currentYear;

        // Tahun mendatang - belum tersedia
        if (isFutureYear) {
            return {
                status: 'upcoming',
                message: 'Periode akan datang',
                canFill: false,
                canView: false,
                isCurrent: false
            };
        }

        // Tahun lalu - hanya bisa lihat jika sudah diisi
        if (isPastYear) {
            return {
                status: statusNow ? 'completed' : 'past',
                message: statusNow ? 'Sudah diisi (masa lalu)' : 'Tidak ada data',
                canFill: false,
                canView: statusNow,
                isCurrent: false
            };
        }

        // Tahun berjalan
        const isJanJun = periodId === 'jan-jun';
        const isJulDes = periodId === 'jul-des';

        // Periode Jan-Jun
        if (isJanJun) {
            if (currentMonth <= 6) {
                // Masih dalam periode Jan-Jun
                if (statusNow) {
                    return {
                        status: 'completed',
                        message: 'Sudah diisi',
                        canFill: false,
                        canView: true,
                        isCurrent: true
                    };
                } else {
                    return {
                        status: 'available',
                        message: 'Saat ini dapat diisi',
                        canFill: true,
                        canView: false,
                        isCurrent: true
                    };
                }
            } else {
                // Periode Jan-Jun sudah lewat
                if (statusNow) {
                    return {
                        status: 'completed',
                        message: 'Sudah diisi',
                        canFill: false,
                        canView: true,
                        isCurrent: false
                    };
                } else {
                    return {
                        status: 'overdue',
                        message: 'Terlambat mengisi',
                        canFill: false,
                        canView: false,
                        isCurrent: false
                    };
                }
            }
        }

        // Periode Jul-Des
        if (isJulDes) {
            if (currentMonth >= 7 && currentMonth <= 12) {
                // Masih dalam periode Jul-Des
                if (statusNow) {
                    return {
                        status: 'completed',
                        message: 'Sudah diisi',
                        canFill: false,
                        canView: true,
                        isCurrent: true
                    };
                } else {
                    return {
                        status: 'available',
                        message: 'Saat ini dapat diisi',
                        canFill: true,
                        canView: false,
                        isCurrent: true
                    };
                }
            } else if (currentMonth < 7) {
                // Periode Jul-Des belum dimulai
                return {
                    status: 'upcoming',
                    message: 'Belum saatnya mengisi',
                    canFill: false,
                    canView: false,
                    isCurrent: false
                };
            } else {
                // Periode Jul-Des sudah lewat
                if (statusNow) {
                    return {
                        status: 'completed',
                        message: 'Sudah diisi',
                        canFill: false,
                        canView: true,
                        isCurrent: false
                    };
                } else {
                    return {
                        status: 'overdue',
                        message: 'Terlambat mengisi',
                        canFill: false,
                        canView: false,
                        isCurrent: false
                    };
                }
            }
        }

        return {
            status: 'past',
            message: 'Tidak tersedia',
            canFill: false,
            canView: false,
            isCurrent: false
        };
    }, [selectedYear]);

    const getStatusConfig = useCallback((status: string) => {
        const configs = {
            completed: {
                icon: CheckCircle,
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                badgeColor: 'bg-green-100 text-green-800',
                badgeText: 'Selesai'
            },
            available: {
                icon: Edit,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                badgeColor: 'bg-blue-100 text-blue-800',
                badgeText: 'Dapat Diisi'
            },
            upcoming: {
                icon: Calendar,
                color: 'text-purple-600',
                bgColor: 'bg-purple-50',
                borderColor: 'border-purple-200',
                badgeColor: 'bg-purple-100 text-purple-800',
                badgeText: 'Akan Datang'
            },
            overdue: {
                icon: XCircle,
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                badgeColor: 'bg-red-100 text-red-800',
                badgeText: 'Terlambat'
            },
            past: {
                icon: Clock,
                color: 'text-gray-500',
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-200',
                badgeColor: 'bg-gray-100 text-gray-600',
                badgeText: 'Masa Lalu'
            }
        };
        return configs[status as keyof typeof configs] || configs.past;
    }, []);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
    };

    const handleViewForm = (periodId: string) => {
        router.push(`/peternak/kuesioner/lihatform?period=${periodId}&year=${selectedYear}`);
    };

    const handleFillForm = (periodId: string) => {
        router.push(`/peternak/kuesioner/isiform?period=${periodId}&year=${selectedYear}`);
    };

    const getPeriodDateRange = useCallback((periodId: string) => {
        if (periodId === 'jan-jun') {
            return `1 Januari - 30 Juni ${selectedYear}`;
        } else {
            return `1 Juli - 31 Desember ${selectedYear}`;
        }
    }, [selectedYear]);

    if (loading) {
        return (
            <div className="w-full px-4 py-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 font-[Judson]">Memproses data kuesioner...</p>
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
                            <AlertCircle className="text-red-400" size={20} />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700 font-[Judson]">
                                {error}
                            </p>
                            <div className="mt-2">
                                <button
                                    onClick={handleRetry}
                                    className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium font-[Judson]"
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
            {/* Year Selection Only */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-gray-600 font-[Judson]">
                            Pilih tahun untuk melihat dan mengisi kuesioner
                        </p>
                    </div>

                    {/* Year Selection */}
                    <div className="flex items-center gap-3">
                        <label htmlFor="year-select" className="text-sm font-[Judson] font-medium text-gray-700 whitespace-nowrap">
                            Tahun:
                        </label>
                        <select
                            id="year-select"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="px-4 py-2 border border-gray-300 font-[Judson] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white min-w-[140px]"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>
                                    {year} {year === new Date().getFullYear() ? '(Tahun Ini)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Period Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {periods.map((period) => {
                    const periodKey = `${period.id}-${selectedYear}`;
                    const statusNow = periodStatus[periodKey] || false;
                    const periodInfo = getPeriodInfo(period.id, statusNow);
                    const config = getStatusConfig(periodInfo.status);
                    const IconComponent = config.icon;

                    return (
                        <div
                            key={period.id}
                            className={`rounded-xl p-6 border-2 ${config.borderColor} ${config.bgColor} transition-all duration-300 hover:shadow-lg`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <IconComponent className={`${config.color} flex-shrink-0`} size={24} />
                                    <div>
                                        <h3 className="text-lg font-[Judson] font-bold text-gray-800">
                                            {period.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 font-[Judson]">
                                            {getPeriodDateRange(period.id)}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-[Judson] font-semibold ${config.badgeColor}`}>
                                    {config.badgeText}
                                </span>
                            </div>

                            {/* Status Message */}
                            <div className="mb-6">
                                <p className={`text-sm font-[Judson] ${config.color} font-medium`}>
                                    {periodInfo.message}
                                </p>
                                {periodInfo.isCurrent && (
                                    <p className="text-xs text-green-600 font-[Judson] mt-1">
                                        ⚡ Periode berjalan
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                {periodInfo.canFill && (
                                    <button
                                        onClick={() => handleFillForm(period.id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-[Judson] font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md"
                                    >
                                        <Edit size={18} />
                                        Isi Kuesioner
                                    </button>
                                )}

                                {periodInfo.canView && (
                                    <button
                                        onClick={() => handleViewForm(period.id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-[Judson] font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                                    >
                                        <Eye size={18} />
                                        Lihat Hasil
                                    </button>
                                )}

                                {!periodInfo.canFill && !periodInfo.canView && (
                                    <div className="flex-1 text-center py-3 text-gray-500 font-[Judson] text-sm">
                                        Tidak tersedia aksi
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend Section */}
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                <h4 className="font-[Judson] font-semibold text-gray-800 mb-4 text-lg">Keterangan Status:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-[Judson] text-gray-700">Selesai - Sudah diisi</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-[Judson] text-gray-700">Dapat Diisi - Saat ini aktif</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-[Judson] text-gray-700">Akan Datang - Belum waktunya</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-[Judson] text-gray-700">Terlambat - Melewati batas waktu</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-sm font-[Judson] text-gray-700">Masa Lalu - Periode sebelumnya</span>
                    </div>
                </div>
            </div>

            {/* Information Section */}
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="text-green-600" size={18} />
                    <h5 className="font-[Judson] font-semibold text-gray-800">Informasi Penting:</h5>
                </div>
                <ul className="text-sm text-gray-600 font-[Judson] space-y-1">
                    <li>• Hanya periode yang sedang berjalan yang dapat diisi</li>
                    <li>• Data periode sebelumnya dapat dilihat jika sudah diisi</li>
                    <li>• Periode yang terlewat tidak dapat diisi kembali</li>
                    <li>• Pastikan mengisi kuesioner sebelum periode berakhir</li>
                </ul>
            </div>
        </div>
    );
}