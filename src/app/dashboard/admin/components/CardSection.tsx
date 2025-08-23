'use client';

import dynamic from 'next/dynamic';
import { Pencil, Trash2, FileDown, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
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
    id: number;
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
    const [data, setData] = useState<User[]>([]);
    const [userData, setUserData] = useState<User[]>([]);
    const [artikelData, setArtikelData] = useState<Artikel[]>([]);
    const [selectedItem, setSelectedItem] = useState<{ type: 'user' | 'artikel', data: User | Artikel } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await ApiClient.getUsers();

            // Pastikan response berbentuk array
            const users: User[] = Array.isArray(response) ? response : response.users || [];

            // Sort users by createdAt (descending)
            const sortedUsers = users.sort((a: User, b: User) => {
                if (a.createdAt && b.createdAt) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                return 0;
            });

            setData(sortedUsers);              // simpan semua user
            setUserData(sortedUsers.slice(0, 5)); // hanya ambil 5 user terbaru
        } catch (error) {
            console.error("Gagal mengambil data users:", error);
            setData([]);
            setUserData([]);
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteUser = async (id: string) => {
        try {
            await ApiClient.deleteUser(id);
            await fetchUsers(); // Refresh the user list
        } catch (error) {
            console.error("Gagal menghapus user:", error);
            alert("Gagal menghapus user");
        }
    };

    const handleDeleteArtikel = (id: number) => {
        const artikelList = JSON.parse(localStorage.getItem("artikels") || "[]");
        const updatedArtikels = artikelList.filter((a: Artikel) => a.id !== id);
        localStorage.setItem("artikels", JSON.stringify(updatedArtikels));
        setArtikelData(updatedArtikels.slice(0, 5));
    };

    const openModal = (type: 'user' | 'artikel', item: User | Artikel) => {
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
                const user = selectedItem.data as User;
                await handleDeleteUser(user._id);
            } else if (selectedItem.type === 'artikel') {
                const artikel = selectedItem.data as Artikel;
                handleDeleteArtikel(artikel.id);
            }
            closeModal();
        }
    };


    useEffect(() => {
        fetchUsers();

        try {
            // Ambil dan parse data artikels
            const localArtikelData = JSON.parse(localStorage.getItem("artikels") || "[]");
            setArtikelData(localArtikelData.slice(0, 5));
        } catch (error) {
            console.error("Gagal parsing data artikels:", error);
            setArtikelData([]);
        }
    }, []);


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
        { name: 'Tanggal', selector: (row: Artikel) => row.tanggal },
        {
            name: 'Aksi',
            cell: (row: Artikel) => (
                <ActionButtons
                    onEdit={() => router.push(`/admin/artikel/editartikel?id=${row.id}`)}
                    onDelete={() => openModal('artikel', row)}
                />
            ),
        },
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
