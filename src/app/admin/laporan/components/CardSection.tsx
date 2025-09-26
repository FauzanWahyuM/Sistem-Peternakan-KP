'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function HasilEvaluasiContent() {
    const [dataEvaluasi, setDataEvaluasi] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        bulan: '',
        tahun: '',
        search: ''
    });

    const bulanOptions = useMemo(() => [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ], []);

    // Ambil semua data hasil kuesioner dari database
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                if (!isMounted) return;

                setError(null);
                console.log('Fetching all data from /api/hasil...');

                // TAMBAHKAN PARAMETER UNTUK MENDAPATKAN SEMUA DATA
                const res = await fetch('/api/hasil?all=true', {
                    cache: "no-store",
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                console.log('Response status:', res.status);

                if (!res.ok) {
                    if (res.status === 401) {
                        console.log('Unauthorized, redirecting to login...');
                        window.location.href = '/login';
                        return;
                    }
                    throw new Error(`Gagal mengambil data: ${res.status} ${res.statusText}`);
                }

                const result = await res.json();
                console.log('Data received:', result);

                // Pastikan result adalah array dan ambil semua data
                let dataArray = [];

                if (Array.isArray(result)) {
                    dataArray = result;
                } else if (result.data && Array.isArray(result.data)) {
                    dataArray = result.data;
                } else {
                    // Jika bukan array, coba ekstrak semua properti yang mungkin berisi array
                    const allData = [];
                    for (const key in result) {
                        if (Array.isArray(result[key])) {
                            allData.push(...result[key]);
                        }
                    }
                    dataArray = allData.length > 0 ? allData : [result];
                }

                console.log('Processed data array length:', dataArray.length);
                console.log('Sample data:', dataArray.slice(0, 3));

                if (isMounted) {
                    setDataEvaluasi(dataArray);
                    setFilteredData(dataArray);
                }
            } catch (err) {
                console.error('Error loading data:', err);
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Terapkan filter
    useEffect(() => {
        let filtered = [...dataEvaluasi];

        if (filters.bulan) {
            const bulanIndex = bulanOptions.indexOf(filters.bulan) + 1;
            filtered = filtered.filter(item => item.bulan === bulanIndex);
        }

        if (filters.tahun) {
            filtered = filtered.filter(item => String(item.tahun) === filters.tahun);
        }

        if (filters.search) {
            filtered = filtered.filter(item =>
                item.nama?.toLowerCase().includes(filters.search.toLowerCase()) ||
                item.username?.toLowerCase().includes(filters.search.toLowerCase()) ||
                (item.questionnaireId && item.questionnaireId.toLowerCase().includes(filters.search.toLowerCase()))
            );
        }

        setFilteredData(filtered);
    }, [filters, dataEvaluasi, bulanOptions]);

    const clearFilters = () => {
        setFilters({ bulan: '', tahun: '', search: '' });
    };

    const retryLoadData = () => {
        setLoading(true);
        setError(null);
        window.location.reload();
    };

    // FUNGSI DOWNLOAD PDF DARI CODE KEDUA
    const handleDownload = async () => {
        try {
            if (filteredData.length === 0) {
                alert('Tidak ada data untuk diunduh');
                return;
            }

            // Gunakan font yang support karakter Indonesia
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // Ganti bagian logo dengan error handling
            try {
                const logo = await fetch('/img/Logo Sistem.png').then(res => {
                    if (!res.ok) throw new Error('Logo not found');
                    return res.blob();
                });
                const reader = new FileReader();

                reader.readAsDataURL(logo);
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    doc.addImage(base64data, 'PNG', 10, 10, 30, 30);
                    // Lanjutkan dengan membuat konten PDF
                    createPDFContentWithLogo(doc, pageWidth, filteredData);
                };

                reader.onerror = () => {
                    // Jika gagal load logo, buat PDF tanpa logo
                    createPDFContentWithoutLogo(doc, pageWidth, filteredData);
                };
            } catch (error) {
                console.warn("Logo tidak ditemukan, membuat PDF tanpa logo");
                createPDFContentWithoutLogo(doc, pageWidth, filteredData);
            }
        } catch (error) {
            console.error("Gagal membuat PDF:", error);
            // Fallback: buat PDF sederhana
            createSimplePDF(filteredData);
        }
    };

    // Fungsi untuk membuat konten PDF dengan logo
    const createPDFContentWithLogo = (doc: jsPDF, pageWidth: number, data: any[]) => {
        // === KOP SIMANTEK ===
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(
            "SISTEM INFORMASI PENJAMINAN MUTU KELOMPOK PETERNAK",
            pageWidth / 2,
            20,
            { align: "center" }
        );

        doc.text(
            "(SIMANTEK)",
            pageWidth / 2,
            25,
            { align: "center" }
        );

        doc.setFontSize(9);
        doc.text(
            "Jl. Jend. Sudirman No.57, Pesayangan, Kedungwuluh, Kec. Purwokerto Bar.",
            pageWidth / 2,
            32,
            { align: "center" }
        );
        doc.text(
            "Kabupaten Banyumas, Jawa Tengah 53131",
            pageWidth / 2,
            37,
            { align: "center" }
        );

        // === Garis Bawah Kop ===
        doc.setLineWidth(0.5);
        doc.line(15, 42, pageWidth - 15, 42);

        // Judul Laporan
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Laporan Hasil Evaluasi Kuesioner", pageWidth / 2, 50, { align: "center" });

        // === Tabel Data ===
        const tableColumn = ["No", "Nama Pengguna", "Bulan", "Tahun", "Nilai"];
        const tableRows: any[] = [];

        data.forEach((item, idx) => {
            const namaBulan = item.bulan && item.bulan >= 1 && item.bulan <= 12
                ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][item.bulan - 1]
                : item.bulan;

            // TANPA PERSEN (sesuai permintaan code pertama)
            tableRows.push([
                String(idx + 1).padStart(2, "0"),
                item.nama || item.username || 'Unknown',
                namaBulan,
                item.tahun || '-',
                (item.nilaiEvaluasi || item.nilai || item.score || 0).toString() // TANPA PERSEN
            ]);
        });

        // PERBAIKAN: Sesuaikan lebar kolom persis seperti contoh PDF
        const columnStyles: { [key: string]: any } = {
            0: { cellWidth: 15, halign: "center" },  // No
            1: { cellWidth: 90, halign: "left" },    // Nama Pengguna
            2: { cellWidth: 25, halign: "center" },  // Bulan
            3: { cellWidth: 25, halign: "center" },  // Tahun
            4: { cellWidth: 25, halign: "center" }   // Nilai
        };

        autoTable(doc, {
            startY: 55,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            styles: {
                fontSize: 10,
                halign: "center",
                font: "helvetica",
                cellPadding: 3
            },
            headStyles: {
                fillColor: [96, 198, 122],
                textColor: 255,
                fontStyle: "bold",
                fontSize: 10,
                cellPadding: 3
            },
            bodyStyles: {
                fontSize: 9,
                cellPadding: 3
            },
            columnStyles: columnStyles,
            margin: { left: 15, right: 15 }
        });

        // Footer
        const date = new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Dicetak pada: ${date}`, 15, doc.internal.pageSize.height - 15);

        doc.save("laporan-hasil-evaluasi.pdf");
    };

    // Fungsi untuk membuat konten PDF tanpa logo
    const createPDFContentWithoutLogo = (doc: jsPDF, pageWidth: number, data: any[]) => {
        // === HEADER ===
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("LAPORAN HASIL EVALUASI KUESIONER", pageWidth / 2, 15, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("SIMANTEK - Sistem Informasi Penjaminan Mutu Kelompok Peternak", pageWidth / 2, 22, { align: "center" });

        // === Tabel Data ===
        const tableColumn = ["No", "Nama", "Bulan", "Tahun", "Nilai"];
        const tableRows: any[] = [];

        data.forEach((item, idx) => {
            const namaBulan = item.bulan && item.bulan >= 1 && item.bulan <= 12
                ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][item.bulan - 1]
                : item.bulan;

            // TANPA PERSEN (sesuai permintaan code pertama)
            tableRows.push([
                String(idx + 1).padStart(2, "0"),
                (item.nama || item.username || 'Unknown').length > 20 ?
                    (item.nama || item.username || 'Unknown').substring(0, 20) + '...' :
                    (item.nama || item.username || 'Unknown'),
                namaBulan,
                item.tahun || '-',
                (item.nilaiEvaluasi || item.nilai || item.score || 0).toString() // TANPA PERSEN
            ]);
        });

        autoTable(doc, {
            startY: 30,
            head: [tableColumn],
            body: tableRows,
            styles: { fontSize: 8, halign: "center" },
            headStyles: {
                fillColor: [96, 198, 122],
                textColor: 255,
                fontStyle: "bold"
            },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { halign: "left", cellWidth: 60 },
                2: { cellWidth: 20 },
                3: { cellWidth: 20 },
                4: { cellWidth: 20 }
            },
            margin: { left: 14, right: 14 }
        });

        // Footer
        const date = new Date().toLocaleDateString('id-ID');
        doc.setFontSize(8);
        doc.text(`Dicetak pada: ${date}`, 14, doc.internal.pageSize.height - 10);

        doc.save("laporan-hasil-evaluasi.pdf");
    };

    // Fallback function untuk PDF sederhana tanpa logo
    const createSimplePDF = (data: any[]) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // === HEADER ===
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("LAPORAN HASIL EVALUASI KUESIONER", pageWidth / 2, 15, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("SIMANTEK - Sistem Informasi Penjaminan Mutu Kelompok Peternak", pageWidth / 2, 22, { align: "center" });

        // === Tabel Data ===
        const tableColumn = ["No", "Nama", "Bulan", "Tahun", "Nilai"];
        const tableRows: any[] = [];

        data.forEach((item, idx) => {
            const namaBulan = item.bulan && item.bulan >= 1 && item.bulan <= 12
                ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][item.bulan - 1]
                : item.bulan;

            // TANPA PERSEN (sesuai permintaan code pertama)
            tableRows.push([
                String(idx + 1).padStart(2, "0"),
                (item.nama || item.username || 'Unknown').length > 20 ?
                    (item.nama || item.username || 'Unknown').substring(0, 20) + '...' :
                    (item.nama || item.username || 'Unknown'),
                namaBulan,
                item.tahun || '-',
                (item.nilaiEvaluasi || item.nilai || item.score || 0).toString() // TANPA PERSEN
            ]);
        });

        autoTable(doc, {
            startY: 30,
            head: [tableColumn],
            body: tableRows,
            styles: { fontSize: 8, halign: "center" },
            headStyles: {
                fillColor: [96, 198, 122],
                textColor: 255,
                fontStyle: "bold"
            },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { halign: "left", cellWidth: 60 },
                2: { cellWidth: 20 },
                3: { cellWidth: 20 },
                4: { cellWidth: 20 }
            },
            margin: { left: 14, right: 14 }
        });

        // Footer
        const date = new Date().toLocaleDateString('id-ID');
        doc.setFontSize(8);
        doc.text(`Dicetak pada: ${date}`, 14, doc.internal.pageSize.height - 10);

        doc.save("laporan-hasil-evaluasi.pdf");
    };

    // Animasi Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-green-600"></div>
                        <div className="absolute top-0 left-0 animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-green-300 opacity-50"
                            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <p className="mt-6 text-lg font-medium text-gray-700 font-[Judson]">Memuat data evaluasi...</p>
                    <p className="mt-2 text-sm text-gray-500 font-[Judson]">Silakan tunggu sebentar</p>
                </div>
            </div>
        );
    }

    // Tampilan Error
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="bg-red-100 p-4 rounded-full mb-4">
                        <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 font-[Judson]">Gagal Memuat Data</h3>
                    <p className="text-gray-600 mb-6 font-[Judson] max-w-md">{error}</p>
                    <button
                        onClick={retryLoadData}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-200 font-[Judson]"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Header dengan Tombol Download di SEBELAH KIRI */}
            <div className="flex justify-between items-center max-w-6xl mx-auto mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleDownload}
                        disabled={filteredData.length === 0}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-[Judson] transition duration-200 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Laporan
                    </button>
                </div>
                <div className="text-sm text-gray-600 font-[Judson]">
                    Total Data: {dataEvaluasi.length} | Ditampilkan: {filteredData.length}
                </div>
            </div>

            {/* Filters */}
            <div className="flex justify-center">
                <div className="bg-white rounded-lg shadow p-6 mb-6 max-w-6xl w-full mx-auto">
                    <div className="flex gap-4 mb-4">
                        {/* Bulan */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium font-[Judson] text-gray-700 mb-2">
                                Bulan
                            </label>
                            <div className="relative">
                                <select
                                    value={filters.bulan}
                                    onChange={(e) => setFilters({ ...filters, bulan: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Semua Bulan</option>
                                    {bulanOptions.map((b) => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Tahun */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium font-[Judson] text-gray-700 mb-2">
                                Tahun
                            </label>
                            <div className="relative">
                                <select
                                    value={filters.tahun}
                                    onChange={(e) => setFilters({ ...filters, tahun: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Semua Tahun</option>
                                    {[2023, 2024, 2025].map((tahun) => (
                                        <option key={tahun} value={tahun.toString()}>{tahun}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search dan Reset */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium font-[Judson] text-gray-700 mb-2">
                                Cari Nama/Username
                            </label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                placeholder="Cari berdasarkan nama atau username..."
                                className="w-full p-3 border border-gray-300 rounded-lg font-[Judson] text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-[Judson] transition duration-200"
                            >
                                Reset Filter
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabel Hasil Evaluasi */}
            <div className="bg-white rounded-lg shadow overflow-hidden max-w-6xl mx-auto">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-[Judson]">No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-[Judson]">Nama Pengguna</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-[Judson]">Bulan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-[Judson]">Tahun</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-[Judson]">Nilai Evaluasi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.length > 0 ? (
                                filteredData.map((item, idx) => {
                                    const namaBulan = item.bulan && item.bulan >= 1 && item.bulan <= 12
                                        ? bulanOptions[item.bulan - 1]
                                        : item.bulan || '-';

                                    const nilai = item.nilaiEvaluasi || item.nilai || item.score || 0;

                                    return (
                                        <tr key={item._id ?? idx} className="hover:bg-gray-50 transition duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-[Judson]">
                                                {String(idx + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-[Judson]">
                                                {item.nama || item.username || 'Hasil Evaluasi'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-[Judson]">
                                                {namaBulan}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-[Judson]">
                                                {item.tahun || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-[Judson]">
                                                {nilai}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-gray-500 font-[Judson] text-lg">Tidak ada data hasil evaluasi</p>
                                            <p className="text-gray-400 font-[Judson] text-sm mt-1">
                                                {dataEvaluasi.length === 0 ?
                                                    'Belum ada data evaluasi yang tersedia' :
                                                    'Coba ubah filter pencarian Anda'
                                                }
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Data Summary */}
            {filteredData.length > 0 && (
                <div className="mt-6 max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600 font-[Judson]">{filteredData.length}</p>
                                <p className="text-sm text-green-800 font-[Judson]">Total Data Ditampilkan</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600 font-[Judson]">
                                    {Math.round(filteredData.reduce((sum, item) => sum + (item.nilaiEvaluasi || item.nilai || item.score || 0), 0) / filteredData.length)}
                                </p>
                                <p className="text-sm text-blue-800 font-[Judson]">Rata-rata Nilai</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <p className="text-2xl font-bold text-purple-600 font-[Judson]">{dataEvaluasi.length}</p>
                                <p className="text-sm text-purple-800 font-[Judson]">Total Data di Database</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Komponen Loading untuk Suspense
function LoadingFallback() {
    return (
        <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
                <p className="text-gray-600 font-[Judson]">Memuat halaman hasil evaluasi...</p>
            </div>
        </div>
    );
}

export default function HasilEvaluasiPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <HasilEvaluasiContent />
        </Suspense>
    );
}