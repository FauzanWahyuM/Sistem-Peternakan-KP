'use client';

import { useState, useEffect, Suspense } from 'react';
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

    const bulanOptions = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Ambil data dari API
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const loadData = async () => {
            try {
                const res = await fetch('/api/hasil', { cache: "no-store" });
                if (!res.ok) throw new Error('Gagal mengambil data');
                const result = await res.json();

                setDataEvaluasi(result);
                setFilteredData(result);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData(); // panggil pertama kali
        interval = setInterval(loadData, 5000); // refresh tiap 5 detik

        return () => clearInterval(interval); // bersihkan interval
    }, []);

    // Terapkan filter
    useEffect(() => {
        let filtered = [...dataEvaluasi];

        if (filters.bulan) {
            filtered = filtered.filter(item => item.bulan === filters.bulan);
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
    }, [filters, dataEvaluasi]);

    const clearFilters = () => {
        setFilters({ bulan: '', tahun: '', search: '' });
    };

    // Fungsi Download PDF
    const handleDownload = async () => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // Tambahkan logo
            const logo = await fetch('/img/Logo Sistem.png').then(res => res.blob());
            const reader = new FileReader();

            reader.readAsDataURL(logo);
            reader.onloadend = () => {
                const base64data = reader.result as string;

                // Logo kiri atas
                doc.addImage(base64data, 'PNG', 20, 12, 20, 20);

                // === KOP SIMANTEK ===
                doc.setFont("helvetica", "bold");
                doc.setFontSize(14);
                doc.text(
                    "SISTEM INFORMASI PENJAMINAN MUTU KELOMPOK PETERNAK (SIMANTEK)",
                    pageWidth / 2,
                    22,
                    { align: "center", maxWidth: 170 }
                );

                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.text(
                    "Jl. Jend. Sudirman No.57, Pesayangan, Kedungwuluh, Kec. Purwokerto Bar.",
                    pageWidth / 2,
                    30,
                    { align: "center", maxWidth: 170 }
                );
                doc.text(
                    "Kabupaten Banyumas, Jawa Tengah 53131",
                    pageWidth / 2,
                    35,
                    { align: "center" }
                );

                // === Garis Bawah Kop ===
                doc.setLineWidth(0.7);
                doc.line(15, 40, pageWidth - 15, 40);

                // Judul Laporan
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text("Laporan Hasil Evaluasi Kuesioner", pageWidth / 2, 48, { align: "center" });

                // === Tabel Data ===
                const tableColumn = ["No", "Nama", "Bulan", "Tahun", "Nilai Evaluasi"];
                const tableRows: any[] = [];

                filteredData.forEach((item, idx) => {
                    tableRows.push([
                        String(idx + 1).padStart(2, "0"),
                        item.nama ?? "Hasil Kuesioner",
                        item.bulan,
                        item.tahun,
                        item.nilaiEvaluasi,
                    ]);
                });

                autoTable(doc, {
                    startY: 55,
                    head: [tableColumn],
                    body: tableRows,
                    styles: { fontSize: 9, halign: "center" },
                    headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: "bold" },
                    columnStyles: {
                        1: { halign: "left" } // Nama rata kiri, biar lebih natural
                    }
                });

                // Footer
                const date = new Date().toLocaleDateString("id-ID");
                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                doc.text(`Dicetak pada: ${date}`, 15, doc.internal.pageSize.height - 10);

                doc.save("laporan-hasil-evaluasi.pdf");
            };
        } catch (error) {
            console.error("Gagal memuat logo:", error);
        }
    };


    if (loading) {
        return <div className="p-6">Memuat data...</div>;
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
                            filteredData.map((item, idx) => (
                                <tr key={item._id ?? idx} className="hover:bg-gray-50 text-black">
                                    <td className="px-6 py-4 font-[Judson]">{String(idx + 1).padStart(2, '0')}</td>
                                    <td className="px-6 py-4 font-[Judson]">{item.nama ?? 'Hasil Kuesioner'}</td>
                                    <td className="px-6 py-4 font-[Judson]">{item.bulan}</td>
                                    <td className="px-6 py-4 font-[Judson]">{item.tahun}</td>
                                    <td className="px-6 py-4 font-[Judson]">{item.nilaiEvaluasi}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-4 text-gray-500 font-[Judson]">
                                    Tidak ada data hasil evaluasi.
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
