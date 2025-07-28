'use client';

import dynamic from 'next/dynamic';
import { Pencil, Trash2, FileDown, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
            <button type="button" onClick={onEdit} className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition" title="Edit">
                <Pencil size={16} />
            </button>
        )}
        {onDelete && (
            <button type="button" onClick={onDelete} className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition" title="Hapus">
                <Trash2 size={16} />
            </button>
        )}
        {onDownload && (
            <button type="button" onClick={onDownload} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition" title="Download">
                <FileDown size={16} />
            </button>
        )}
    </div>
);

type User = {
    id: number;
    nama: string;
    role: string;
    status: string;
};

type Artikel = {
    judul: string;
    deskripsi: string;
    gambar: string;
    tanggal: string;
};

type Laporan = {
    judul: string;
    nilai: string;
    tanggal: string;
};

export default function CardSection() {
    const router = useRouter();
    const [userData, setUserData] = useState<User[]>([]);

    useEffect(() => {
        try {
            const localData = JSON.parse(localStorage.getItem("users") || "[]");
            const formatted = localData.map((u: any) => ({
                id: u.id,
                nama: u.nama,
                role: u.role,
                status: 'Aktif',
            }));
            setUserData(formatted.slice(0, 5)); // Hanya ambil 5 user teratas
        } catch (error) {
            console.error("Gagal membaca user dari localStorage:", error);
        }
    }, []);

    const artikelColumns = [
        { name: 'Judul', selector: (row: Artikel) => row.judul },
        { name: 'Deskripsi', selector: (row: Artikel) => row.deskripsi },
        { name: 'Gambar', selector: (row: Artikel) => row.gambar },
        { name: 'Tanggal', selector: (row: Artikel) => row.tanggal },
        {
            name: 'Aksi',
            cell: (row: Artikel) => (
                <ActionButtons
                    onEdit={() => console.log('Edit artikel', row)}
                    onDelete={() => console.log('Hapus artikel', row)}
                />
            ),
        }
    ];

    const laporanColumns = [
        { name: 'Judul Laporan', selector: (row: Laporan) => row.judul },
        { name: 'Nilai Kuesioner', selector: (row: Laporan) => row.nilai },
        { name: 'Tanggal', selector: (row: Laporan) => row.tanggal },
        {
            name: 'Aksi',
            cell: (row: Laporan) => (
                <ActionButtons
                    onDownload={() => console.log('Download laporan', row)}
                    onDelete={() => console.log('Hapus laporan', row)}
                />
            ),
        }
    ];

    const artikelData: Artikel[] = [
        {
            judul: 'Pertanian',
            deskripsi: 'Artikel tentang pertanian...',
            gambar: 'pertanian.jpg',
            tanggal: '16/07/2025'
        },
        {
            judul: 'Pangan Lokal',
            deskripsi: 'Deskripsi singkat...',
            gambar: 'pangan-lokal.png',
            tanggal: '18/07/2025'
        }
    ];

    const laporanData: Laporan[] = [
        { judul: 'Evaluasi Penyuluhan', nilai: '100/100', tanggal: '20/07/2025' },
        { judul: 'Penilaian Program', nilai: '79/100', tanggal: '21/07/2025' }
    ];

    const userColumns = [
        { name: 'Nama', selector: (row: User) => row.nama, sortable: true },
        { name: 'Role', selector: (row: User) => row.role },
        { name: 'Status', selector: (row: User) => row.status },
        {
            name: 'Aksi',
            cell: (row: User) => (
                <ActionButtons
                    onEdit={() => console.log('Edit user', row)}
                    onDelete={() => console.log('Hapus user', row)}
                />
            ),
        }
    ];

    return (
        <div className="space-y-6">
            {/* User Card */}
            <section className="bg-white rounded-xl shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">User</h1>
                </div>
                <DataTable
                    columns={userColumns}
                    data={userData}
                    pagination
                    dense
                    responsive
                    highlightOnHover
                    customStyles={customStyles}
                />
                <button
                    className="mt-4 flex items-center gap-2 border border-black text-black px-4 py-2 rounded-md hover:bg-gray-100"
                    onClick={() => router.push('/admin/user')}
                >
                    <span>Lainnya</span>
                    <ArrowRight size={16} />
                </button>
            </section>

            {/* Artikel Card */}
            <section className="bg-white rounded-xl shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Artikel</h1>
                </div>
                <DataTable
                    columns={artikelColumns}
                    data={artikelData}
                    pagination
                    dense
                    responsive
                    highlightOnHover
                    customStyles={customStyles}
                />
                <button
                    className="mt-4 flex items-center gap-2 border border-black text-black px-4 py-2 rounded-md hover:bg-gray-100"
                    onClick={() => router.push('/admin/artikel')}
                >
                    <span>Lainnya</span>
                    <ArrowRight size={16} />
                </button>
            </section>

            {/* Laporan Card */}
            <section className="bg-white rounded-xl shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Laporan</h1>
                </div>
                <DataTable
                    columns={laporanColumns}
                    data={laporanData}
                    pagination
                    dense
                    responsive
                    highlightOnHover
                    customStyles={customStyles}
                />
                <button
                    className="mt-4 flex items-center gap-2 border border-black text-black px-4 py-2 rounded-md hover:bg-gray-100"
                    onClick={() => router.push('/admin/laporan')}
                >
                    <span>Lainnya</span>
                    <ArrowRight size={16} />
                </button>
            </section>
        </div>
    );
}
