'use client';

import React, { useState } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { FileDown, Trash2 } from 'lucide-react';

type Laporan = {
    id: number;
    judul: string;
    tanggal: string;
    kategori: string;
};

const customStyles = {
    headCells: {
        style: {
            fontWeight: 'bold',
            fontSize: '14px',
        },
    },
};

export default function TableSection() {
    const [data, setData] = useState<Laporan[]>([
        { id: 1, judul: 'Laporan Evaluasi Mingguan', tanggal: '2025-07-01', kategori: '85/100' },
        { id: 2, judul: 'Laporan Evaluasi Bulanan', tanggal: '2025-07-15', kategori: '90/100' },
        { id: 3, judul: 'Laporan Pelatihan Ternak', tanggal: '2025-07-20', kategori: '88/100' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = (laporan: Laporan) => {
        const newData = data.filter((item) => item.id !== laporan.id);
        setData(newData);
    };

    const handleDownload = (laporan: Laporan) => {
        alert(`Mengunduh laporan: ${laporan.judul}`);
    };

    const filteredData = data.filter((item) =>
        item.judul.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns: TableColumn<Laporan>[] = [
        {
            name: 'Judul Laporan',
            selector: (row) => row.judul,
            sortable: true,
        },
        {
            name: 'Nilai Kuesioner',
            selector: (row) => row.kategori,
            sortable: true,
            center: true, // ✔️ tetap boleh karena ini dikenali oleh react-data-table
        },
        {
            name: 'Tanggal',
            selector: (row) => row.tanggal,
            sortable: true,
        },
        {
            name: 'Aksi',
            cell: (row) => (
                <div className="flex gap-3">
                    <button
                        onClick={() => handleDownload(row)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Download PDF"
                        type="button"
                    >
                        <FileDown size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus"
                        type="button"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            button: true, // ✔️ tetap boleh karena dikenali oleh DataTable, bukan DOM
            allowOverflow: true, // ✔️ tetap boleh karena dikenali oleh DataTable, bukan DOM
        },
    ];

    return (
        <div className="rounded-xl bg-white p-4 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <input
                    type="text"
                    placeholder="Cari laporan..."
                    className="w-full sm:max-w-sm px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <DataTable
                columns={columns}
                data={filteredData}
                pagination
                responsive
                highlightOnHover
                customStyles={customStyles}
                noDataComponent="Belum ada data laporan."
            />
        </div>
    );
}
