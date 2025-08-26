'use client';

import dynamic from 'next/dynamic';
import { Pencil, Trash2, FileDown, ArrowRight, X, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApiClient } from '../../../../lib/api-client';

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
    _id: string;
    nama: string;
    role: 'Peternak' | 'Penyuluh' | 'Admin';
    status?: string;
    createdAt?: string;
};

type Artikel = {
    _id: string;
    judul: string;
    deskripsi: string;
    gambar: string;
    tanggal: string;
    createdAt?: string;
};

type Laporan = {
    _id?: string;
    nama: string;
    bulan: number;
    tahun: number;
    nilaiEvaluasi: number;
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

export default function CardSection() {
    const router = useRouter();
    const [data, setData] = useState<User[]>([]);
    const [userData, setUserData] = useState<User[]>([]);
    const [artikelData, setArtikelData] = useState<Artikel[]>([]);
    const [laporanData, setLaporanData] = useState<Laporan[]>([]);
    const [selectedItem, setSelectedItem] = useState<{ type: 'user' | 'artikel' | 'laporan', data: User | Artikel | Laporan } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [laporanLoading, setLaporanLoading] = useState<boolean>(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await ApiClient.getUsers();
            const users: User[] = Array.isArray(response) ? response : response.users || [];
            const sortedUsers = users.sort((a, b) =>
                a.createdAt && b.createdAt
                    ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    : 0
            );
            setData(sortedUsers);
            setUserData(sortedUsers.slice(0, 5));
        } catch (error) {
            console.error("Gagal mengambil data users:", error);
            setData([]);
            setUserData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchArtikels = async () => {
        try {
            const response = await fetch("/api/artikel");
            if (!response.ok) throw new Error("Gagal fetch artikel");
            const artikels: Artikel[] = await response.json();
            const sorted = artikels.sort((a, b) =>
                a.createdAt && b.createdAt
                    ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    : 0
            );
            setArtikelData(sorted.slice(0, 3));
        } catch (error) {
            console.error("Gagal mengambil artikel:", error);
            setArtikelData([]);
        }
    };

    const fetchLaporan = async () => {
        try {
            setLaporanLoading(true);
            const response = await fetch('/api/hasil', {
                cache: "no-store",
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Unauthorized, redirecting to login...');
                    return;
                }
                throw new Error(`Gagal mengambil data: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            // Ambil hanya 5 data terbaru
            const limitedData = result.slice(0, 5);
            setLaporanData(limitedData);
        } catch (err) {
            console.error('Error loading laporan data:', err);
            setLaporanData([]);
        } finally {
            setLaporanLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        try {
            await ApiClient.deleteUser(id);
            await fetchUsers();
        } catch (error) {
            console.error("Gagal menghapus user:", error);
            alert("Gagal menghapus user");
        }
    };

    const handleDeleteArtikel = async (id: string) => {
        try {
            await fetch(`/api/artikel/${id}`, { method: "DELETE" });
            await fetchArtikels();
        } catch (error) {
            console.error("Gagal menghapus artikel:", error);
            alert("Gagal menghapus artikel");
        }
    };

    const openModal = (type: 'user' | 'artikel' | 'laporan', item: User | Artikel | Laporan) => {
        setSelectedItem({ type, data: item });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const confirmDelete = async () => {
        if (selectedItem) {
            if (selectedItem.type === 'user') {
                await handleDeleteUser((selectedItem.data as User)._id);
            } else if (selectedItem.type === 'artikel') {
                await handleDeleteArtikel((selectedItem.data as Artikel)._id);
            }
            closeModal();
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchArtikels();
        fetchLaporan();
    }, []);

    const bulanOptions = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const artikelColumns = [
        { name: 'Judul', selector: (row: Artikel) => row.judul },
        { name: 'Deskripsi', selector: (row: Artikel) => row.deskripsi },
        {
            name: 'Gambar',
            cell: (row: Artikel) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.gambar} alt="gambar artikel" className="w-12 h-12 object-cover rounded" />
            ),
        },
        {
            name: 'Tanggal',
            selector: (row: Artikel) => formatTanggal(row.tanggal) // Format tanggal di sini
        },
        {
            name: 'Aksi',
            cell: (row: Artikel) => (
                <ActionButtons
                    onEdit={() => router.push(`/admin/artikel/editartikel?id=${row._id}`)}
                    onDelete={() => openModal('artikel', row)}
                />
            ),
        },
    ];

    // Kolom untuk laporan - TANPA kolom Aksi
    const laporanColumns = [
        {
            name: 'Nama',
            selector: (row: Laporan) => row.nama || 'Unknown',
            sortable: true
        },
        {
            name: 'Bulan',
            selector: (row: Laporan) => {
                return row.bulan && row.bulan >= 1 && row.bulan <= 12
                    ? bulanOptions[row.bulan - 1]
                    : row.bulan;
            },
            sortable: true
        },
        {
            name: 'Tahun',
            selector: (row: Laporan) => row.tahun,
            sortable: true
        },
        {
            name: 'Nilai Evaluasi',
            selector: (row: Laporan) => `${row.nilaiEvaluasi}%`,
            sortable: true
        }
        // Kolom Aksi dihapus dari sini
    ];

    const userColumns = [
        { name: 'Nama', selector: (row: User) => row.nama, sortable: true },
        { name: 'Role', selector: (row: User) => row.role },
        { name: 'Status', selector: (row: User) => row.status },
        {
            name: 'Aksi',
            cell: (row: User) => (
                <ActionButtons
                    onEdit={() => router.push(`/admin/user/edituser?id=${row._id}`)}
                    onDelete={() => openModal('user', row)}
                />
            ),
        }
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-bold">User</h1>
                    </div>
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                    </div>
                </div>
            </div>
        );
    }

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
                {laporanLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                    </div>
                ) : (
                    <>
                        <DataTable
                            columns={laporanColumns}
                            data={laporanData}
                            pagination
                            dense
                            responsive
                            highlightOnHover
                            customStyles={customStyles}
                        />
                        <div className="mt-3 text-sm text-gray-600">
                            Menampilkan {laporanData.length} data evaluasi
                        </div>
                    </>
                )}
                <button
                    className="mt-4 flex items-center gap-2 border border-black text-black px-4 py-2 rounded-md hover:bg-gray-100"
                    onClick={() => router.push('/admin/laporan')}
                >
                    <span>Lainnya</span>
                    <ArrowRight size={16} />
                </button>
            </section>

            {/* Modal Konfirmasi Hapus */}
            {isModalOpen && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
                        <div className="flex items-center mb-4 gap-2 text-red-600">
                            <AlertTriangle size={24} />
                            <h2 className="text-lg font-bold">Konfirmasi Hapus</h2>
                        </div>
                        <p className="text-gray-700 mb-6">
                            Apakah anda ingin menghapus?
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