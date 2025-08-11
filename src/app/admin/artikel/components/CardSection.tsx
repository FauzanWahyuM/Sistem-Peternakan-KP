'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { TableColumn } from 'react-data-table-component';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    const [data, setData] = useState<Artikel[]>([]);
    const [selectedArtikel, setSelectedArtikel] = useState<Artikel | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const router = useRouter();

    useEffect(() => {
        try {
            const localData = JSON.parse(localStorage.getItem('artikels') || '[]');
            setData(localData);
        } catch (error) {
            console.error('Gagal membaca artikel dari localStorage:', error);
            setData([]);
        }
    }, []);

    const openModal = (artikel: Artikel) => {
        setSelectedArtikel(artikel);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedArtikel(null);
    };

    const confirmDelete = () => {
        if (selectedArtikel) {
            const updated = data.filter((a) => a.id !== selectedArtikel.id);
            setData(updated);
            localStorage.setItem('artikels', JSON.stringify(updated));
            closeModal();
        }
    };

    const handleEdit = (artikel: Artikel) => {
        router.push(`/admin/artikel/editartikel?id=${artikel.id}`);
    };

    const columns: TableColumn<Artikel>[] = [
        {
            name: 'Judul',
            selector: (row) => row.judul,
            sortable: true,
        },
        {
            name: 'Deskripsi',
            selector: (row) => row.deskripsi,
            sortable: false,
        },
        {
            name: 'Gambar',
            cell: (row) => (
                <Image src={row.gambar} alt="Gambar" width={64} height={64} className="w-16 h-16 object-cover rounded" />
            ),
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
                        onClick={() => handleEdit(row)}
                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition"
                        title="Edit"
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        onClick={() => openModal(row)}
                        className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition"
                        title="Hapus"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    const filteredData = data.filter((artikel) =>
        artikel.judul.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="rounded-xl bg-white p-4 shadow-md relative">
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
                    onClick={() => router.push('/admin/artikel/tambahartikel')}
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
                dense
                striped
                customStyles={customStyles}
                noDataComponent="Tidak ada data artikel."
            />

            <div className="mt-3 text-sm text-gray-600">
                Total artikel: <strong>{filteredData.length}</strong>
            </div>

            {/* Modal Konfirmasi Hapus */}
            {isModalOpen && selectedArtikel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
                        <div className="flex items-center mb-4 gap-2 text-red-600">
                            <AlertTriangle size={24} />
                            <h2 className="text-lg font-bold">Konfirmasi Hapus</h2>
                        </div>
                        <p className="text-gray-700 mb-6">
                            Apakah Anda yakin ingin menghapus artikel{' '}
                            <strong>{selectedArtikel.judul}</strong>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
