'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Pencil, Trash2, FileDown } from 'lucide-react';

const DataTable = dynamic(() => import('react-data-table-component'), { ssr: false });

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

type ActionButtonsProps = {
    onEdit?: () => void;
    onDelete?: () => void;
    onDownload?: () => void;
};

const ActionButtons = ({ onEdit, onDelete, onDownload }: ActionButtonsProps) => (
    <div className="flex gap-2">
        {onEdit && (
            <button type="button" onClick={onEdit} className="text-blue-600 hover:text-blue-800" title="Edit">
                <Pencil size={16} />
            </button>
        )}
        {onDelete && (
            <button type="button" onClick={onDelete} className="text-red-600 hover:text-red-800" title="Hapus">
                <Trash2 size={16} />
            </button>
        )}
        {onDownload && (
            <button type="button" onClick={onDownload} className="text-green-600 hover:text-green-800" title="Download">
                <FileDown size={16} />
            </button>
        )}
    </div>
);

type User = {
    nama: string;
    role: string;
    status: string;
};

type Artikel = {
    judul: string;
    deskripsi: string;
    tanggal: string;
};

type Laporan = {
    nama: string;
    nilai: string;
};

export default function CardSection() {
    const userColumns = [
        { name: 'Nama', selector: (row: User) => row.nama, sortable: true },
        { name: 'Role', selector: (row: User) => row.role },
        { name: 'Status', selector: (row: User) => row.status },
        {
            name: 'Actions',
            cell: (row: User) => (
                <ActionButtons
                    onEdit={() => console.log('Edit user', row)}
                    onDelete={() => console.log('Hapus user', row)}
                />
            ),
        }
    ];

    const artikelColumns = [
        { name: 'Judul', selector: (row: Artikel) => row.judul },
        { name: 'Deskripsi', selector: (row: Artikel) => row.deskripsi },
        { name: 'Gambar', cell: () => <span>📷</span> },
        { name: 'Tanggal', selector: (row: Artikel) => row.tanggal },
        {
            name: 'Actions',
            cell: (row: Artikel) => (
                <ActionButtons
                    onEdit={() => console.log('Edit artikel', row)}
                    onDelete={() => console.log('Hapus artikel', row)}
                />
            ),
        }
    ];

    const laporanColumns = [
        { name: 'Nama', selector: (row: Laporan) => row.nama },
        { name: 'Nilai Kepuasan', selector: (row: Laporan) => row.nilai },
        {
            name: 'Actions',
            cell: (row: Laporan) => (
                <ActionButtons
                    onDelete={() => console.log('Hapus laporan', row)}
                    onDownload={() => console.log('Download laporan', row)}
                />
            ),
        }
    ];

    const userData: User[] = [
        { nama: 'Gibson', role: 'Penyuluh', status: 'Aktif' },
        { nama: 'Zaki', role: 'Admin', status: 'Aktif' }
    ];

    const artikelData: Artikel[] = [
        { judul: 'Pertanian', deskripsi: 'Artikel tentang pertanian...', tanggal: '16/07/2025' },
        { judul: 'Pangan Lokal', deskripsi: 'Deskripsi singkat...', tanggal: '18/07/2025' }
    ];

    const laporanData: Laporan[] = [
        { nama: 'Gibson', nilai: '100/100' },
        { nama: 'Zaki', nilai: '79/100' }
    ];

    return (
        <div className="space-y-6">
            {/* User Card */}
            <section className="bg-white rounded-xl shadow-md p-4">
                <h1 className="text-xl font-bold mb-4">User</h1>
                <DataTable
                    columns={userColumns}
                    data={userData}
                    pagination
                    dense
                    responsive
                    highlightOnHover
                    customStyles={customStyles}
                />
            </section>

            {/* Artikel Card */}
            <section className="bg-white rounded-xl shadow-md p-4">
                <h1 className="text-xl font-bold mb-4">Artikel</h1>
                <DataTable
                    columns={artikelColumns}
                    data={artikelData}
                    pagination
                    dense
                    responsive
                    highlightOnHover
                    customStyles={customStyles}
                />
            </section>

            {/* Laporan Card */}
            <section className="bg-white rounded-xl shadow-md p-4">
                <h1 className="text-xl font-bold mb-4">Laporan</h1>
                <DataTable
                    columns={laporanColumns}
                    data={laporanData}
                    pagination
                    dense
                    responsive
                    highlightOnHover
                    customStyles={customStyles}
                />
            </section>
        </div>
    );
}
