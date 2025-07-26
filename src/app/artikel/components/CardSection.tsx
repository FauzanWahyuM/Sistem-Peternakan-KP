'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Pencil, Trash2 } from 'lucide-react';

const DataTable = dynamic(() => import('react-data-table-component'), { ssr: false });

type Artikel = {
    id: number;
    judul: string;
    deskripsi: string;
    gambar: string;
    tanggal: string;
};

const customStyles = {
    headCells: {
        style: {
            fontWeight: 'bold',
            fontSize: '14px',
            backgroundColor: '#f9fafb',
            color: '#111827',
        },
    },
    rows: {
        style: {
            fontSize: '14px',
            color: '#374151',
        },
    },
};

export default function ArtikelManagement() {
    const [searchTerm, setSearchTerm] = useState<string>('');

    const [data, setData] = useState<Artikel[]>([
        {
            id: 1,
            judul: 'Permanenkan...',
            deskripsi: 'Jika...',
            gambar: 'Foto.jpg',
            tanggal: '11/02/2025',
        },
        {
            id: 2,
            judul: 'Artikel Tentang...',
            deskripsi: 'API...',
            gambar: 'Foto.png',
            tanggal: '16/03/2025',
        },
        {
            id: 3,
            judul: 'Jika Alam...',
            deskripsi: 'Apakah...',
            gambar: 'Foto.jpg',
            tanggal: '23/04/2025',
        },
    ]);

    const handleEdit = (row: Artikel) => {
        console.log('Edit artikel:', row);
    };

    const handleDelete = (row: Artikel) => {
        if (window.confirm(`Yakin ingin menghapus artikel "${row.judul}"?`)) {
            setData((prev) => prev.filter((artikel) => artikel.id !== row.id));
        }
    };

    const columns = [
        {
            name: 'Judul',
            selector: (row: Artikel) => row.judul,
            sortable: true,
        },
        {
            name: 'Deskripsi',
            selector: (row: Artikel) => row.deskripsi,
            sortable: true,
        },
        {
            name: 'Gambar',
            selector: (row: Artikel) => row.gambar,
        },
        {
            name: 'Tanggal',
            selector: (row: Artikel) => row.tanggal,
            sortable: true,
        },
        {
            name: 'Aksi',
            cell: (row: Artikel) => (
                <div className="flex gap-3">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true as const,
            button: true as const,
        },
    ];

    const filteredData = data.filter((artikel) =>
        artikel.judul.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="rounded-xl bg-white p-4 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <input
                        type="text"
                        placeholder="Cari judul artikel..."
                        className="w-full sm:max-w-sm px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow font-semibold"
                        onClick={() => alert("Fitur tambah user belum diimplementasikan")}
                    >
                        + Tambah Artikel
                    </button>
                </div>

            <DataTable
                columns={columns}
                data={filteredData}
                pagination
                responsive
                highlightOnHover
                striped
                dense
                customStyles={customStyles}
                noDataComponent="Tidak ada data artikel."
            />
        </div>
    );
}
