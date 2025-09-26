'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2, X, AlertTriangle, Loader } from 'lucide-react';
import dynamic from 'next/dynamic';
import { TableColumn } from 'react-data-table-component';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const DataTable = dynamic(() => import('react-data-table-component'), { ssr: false });

type Artikel = {
    _id: string;
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

// Fungsi untuk memformat tanggal
const formatTanggal = (tanggalString: string) => {
    try {
        const tanggal = new Date(tanggalString);
        return tanggal.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return tanggalString; // Jika gagal, kembalikan string asli
    }
};

export default function ArtikelManagement() {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [data, setData] = useState<Artikel[]>([]);
    const [selectedArtikel, setSelectedArtikel] = useState<Artikel | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        async function fetchArtikels() {
            try {
                setIsLoading(true);
                setError(null);

                const res = await fetch("/api/artikel");

                if (!res.ok) {
                    throw new Error(`Gagal mengambil data: ${res.status}`);
                }

                const data = await res.json();
                setData(data);

            } catch (err) {
                console.error("Gagal fetch artikel:", err);
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
            } finally {
                setIsLoading(false);
            }
        }
        fetchArtikels();
    }, []);

    const openModal = (artikel: Artikel) => {
        setSelectedArtikel(artikel);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedArtikel(null);
    };

    const confirmDelete = async () => {
        if (selectedArtikel) {
            try {
                setIsLoading(true);
                await fetch(`/api/artikel/${selectedArtikel._id}`, { method: "DELETE" });
                setData(data.filter((a) => a._id !== selectedArtikel._id));
                closeModal();
            } catch (err) {
                console.error("Gagal hapus artikel:", err);
                setError('Gagal menghapus artikel');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleEdit = (artikel: Artikel) => {
        router.push(`/admin/artikel/editartikel?id=${artikel._id}`);
    };

    const columns: TableColumn<Artikel>[] = [
        {
            name: 'Judul',
            selector: (row) => row.judul,
            sortable: true,
            wrap: true,
        },
        {
            name: 'Deskripsi',
            selector: (row) => row.deskripsi.length > 100 ? `${row.deskripsi.substring(0, 100)}...` : row.deskripsi,
            sortable: false,
            wrap: true,
        },
        {
            name: 'Gambar',
            cell: (row) => (
                <div className="flex justify-center">
                    <Image
                        src={row.gambar}
                        alt="Gambar artikel"
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-image.jpg';
                        }}
                    />
                </div>
            ),
            width: '100px',
        },
        {
            name: 'Tanggal',
            selector: (row) => formatTanggal(row.tanggal),
            sortable: true,
            width: '120px',
        },
        {
            name: 'Aksi',
            cell: (row) => (
                <div className="flex gap-3">
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition duration-200"
                        title="Edit"
                        disabled={isLoading}
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        onClick={() => openModal(row)}
                        className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition duration-200"
                        title="Hapus"
                        disabled={isLoading}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            width: '120px',
        },
    ];

    const filteredData = data.filter((artikel) =>
        artikel.judul && artikel.judul.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Animasi Loading
    if (isLoading) {
        return (
            <div className="rounded-xl bg-white p-8 shadow-md">
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="relative">
                        {/* Spinner utama */}
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>

                        {/* Spinner kedua untuk efek layered */}
                        <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-300 opacity-50"
                            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>

                        {/* Spinner ketiga untuk efek tambahan */}
                        <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-r-4 border-l-4 border-green-400 opacity-30"
                            style={{ animationDuration: '2s' }}></div>
                    </div>

                    <p className="mt-6 text-lg font-medium text-gray-700">Memuat data artikel...</p>
                    <p className="mt-2 text-sm text-gray-500">Silakan tunggu sebentar</p>
                </div>
            </div>
        );
    }

    // Tampilan Error
    if (error) {
        return (
            <div className="rounded-xl bg-white p-8 shadow-md">
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="bg-red-100 p-4 rounded-full mb-4">
                        <AlertTriangle size={48} className="text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Gagal Memuat Data</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-white p-4 shadow-md relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <input
                    type="text"
                    placeholder="Cari judul artikel..."
                    className="w-full sm:max-w-sm px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 transition duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isLoading}
                />

                <button
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => router.push('/admin/artikel/tambahartikel')}
                    disabled={isLoading}
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
                noDataComponent={
                    <div className="py-8 text-center">
                        <p className="text-gray-500">Tidak ada data artikel yang ditemukan.</p>
                    </div>
                }
                progressPending={isLoading}
                progressComponent={
                    <div className="py-8 text-center">
                        <Loader className="animate-spin mx-auto mb-2" size={24} />
                        <p>Memuat data...</p>
                    </div>
                }
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
                            Apakah anda yakin ingin menghapus artikel <strong>{selectedArtikel.judul}</strong>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition duration-200 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition duration-200 disabled:opacity-50 flex items-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader className="animate-spin" size={16} />
                                        Menghapus...
                                    </>
                                ) : (
                                    'Ya, Hapus'
                                )}
                            </button>
                        </div>
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-200"
                            disabled={isLoading}
                        >
                            <X />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}