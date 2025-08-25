'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function HasilEvaluasiContent() {
    const [dataEvaluasi, setDataEvaluasi] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        bulan: '',
        tahun: '',
        search: ''
    });

    const bulanOptions = useMemo(() => [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ], []);

    // Ambil data dari API
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const loadData = async () => {
            try {
                console.log('Fetching data from /api/hasil...');
                const res = await fetch('/api/hasil', {
                    cache: "no-store",
                    credentials: 'include'
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

                setDataEvaluasi(result);
                setFilteredData(result);
            } catch (err) {
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
        interval = setInterval(loadData, 5000);

        return () => clearInterval(interval);
    }, []);

    // Terapkan filter
    // Replace the useEffect with this:
    useEffect(() => {
        let filtered = [...dataEvaluasi];

        if (filters.bulan) {
            // Konversi nama bulan ke angka (1-12)
            const bulanIndex = bulanOptions.indexOf(filters.bulan) + 1;
            filtered = filtered.filter(item => item.bulan === bulanIndex);
        }

        if (filters.tahun) {
            filtered = filtered.filter(item => String(item.tahun) === filters.tahun);
        }

        if (filters.search) {
            filtered = filtered.filter(item =>
                item.nama?.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        setFilteredData(filtered);
    }, [filters, dataEvaluasi, bulanOptions]); // Added bulanOptions to dependencies

    const clearFilters = () => {
        setFilters({ bulan: '', tahun: '', search: '' });
    };

    // Fungsi Download PDF
    // Fungsi Download PDF
    const handleDownload = async () => {
        try {
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
    // Fungsi untuk membuat konten PDF dengan logo
    // Fungsi untuk membuat konten PDF dengan logo
    // Fungsi untuk membuat konten PDF dengan logo
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

            tableRows.push([
                String(idx + 1).padStart(2, "0"),
                item.nama || 'Unknown',
                namaBulan,
                item.tahun,
                item.nilaiEvaluasi + '%',
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

            tableRows.push([
                String(idx + 1).padStart(2, "0"),
                item.nama && item.nama.length > 20 ? item.nama.substring(0, 20) + '...' : item.nama || 'Unknown',
                namaBulan,
                item.tahun,
                item.nilaiEvaluasi + '%',
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
            margin: { left: 14, right: 14 } // Tambahkan margin ini
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

            tableRows.push([
                String(idx + 1).padStart(2, "0"),
                item.nama && item.nama.length > 20 ? item.nama.substring(0, 20) + '...' : item.nama || 'Unknown',
                namaBulan,
                item.tahun,
                item.nilaiEvaluasi + '%',
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
            margin: { left: 14, right: 14 } // Tambahkan margin ini
        });

        // Footer
        const date = new Date().toLocaleDateString('id-ID');
        doc.setFontSize(8);
        doc.text(`Dicetak pada: ${date}`, 14, doc.internal.pageSize.height - 10);

        doc.save("laporan-hasil-evaluasi.pdf");
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="flex justify-center items-center h-64">
                    <p className="text-lg font-[Judson]">Memuat data evaluasi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Tombol Download */}
            <div className="flex justify-end max-w-6xl mx-auto mb-4">
                <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-[Judson]"
                >
                    Download Laporan
                </button>
            </div>
            {/* Filters */}
            <div className="flex justify-center">
                <div className="bg-white rounded-lg shadow p-6 mb-6 max-w-6xl w-full mx-auto">

                    {/* Ganti grid -> flex agar dropdown rata penuh */}
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
                                    {[2020, 2021, 2022, 2023, 2024, 2025].map((tahun) => (
                                        <option key={tahun} value={tahun}>{tahun}</option>
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

                    {/* Reset Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-[Judson]"
                        >
                            Reset Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabel Hasil Evaluasi */}
            <div className="bg-white rounded-lg shadow overflow-hidden max-w-6xl mx-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-[Judson]">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-[Judson]">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-[Judson]">Bulan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-[Judson]">Tahun</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-[Judson]">Nilai Evaluasi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.length > 0 ? (
                            filteredData.map((item, idx) => {
                                // Konversi angka bulan ke nama bulan
                                const namaBulan = item.bulan && item.bulan >= 1 && item.bulan <= 12
                                    ? bulanOptions[item.bulan - 1]
                                    : item.bulan;

                                return (
                                    <tr key={item._id ?? idx} className="hover:bg-gray-50 text-black">
                                        <td className="px-6 py-4 font-[Judson]">{String(idx + 1).padStart(2, '0')}</td>
                                        <td className="px-6 py-4 font-[Judson]">{item.nama ?? 'Hasil Kuesioner'}</td>
                                        <td className="px-6 py-4 font-[Judson]">{namaBulan}</td>
                                        <td className="px-6 py-4 font-[Judson]">{item.tahun}</td>
                                        <td className="px-6 py-4 font-[Judson]">{item.nilaiEvaluasi}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-4 text-gray-500 font-[Judson]">
                                    {loading ? 'Memuat data...' : 'Tidak ada data hasil evaluasi.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Data Summary */}
            {filteredData.length > 0 && (
                <div className="mt-4 text-sm text-gray-600 font-[Judson] text-center">
                    Menampilkan {filteredData.length} dari {dataEvaluasi.length} data evaluasi
                </div>
            )}
        </div>
    );
}

export default function HasilEvaluasiPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HasilEvaluasiContent />
        </Suspense>
    );
}