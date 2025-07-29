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
    id: string;
    nama: string;
    role: 'Peternak' | 'Penyuluh' | 'Admin';
    status?: string;
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

    const handleDeleteUser = (id: string) => {
        const updatedUsers = data.filter((u) => u.id !== id);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        setData(updatedUsers);
        setUserData(updatedUsers.slice(0, 5));
    };

    const handleDeleteArtikel = (id: number) => {
        const artikelList = JSON.parse(localStorage.getItem("artikels") || "[]");
        const updatedArtikels = artikelList.filter((a: Artikel) => a.id !== id);
        localStorage.setItem("artikels", JSON.stringify(updatedArtikels));
        setArtikelData(updatedArtikels.slice(0, 5));
    };


    useEffect(() => {
        try {
            // Ambil dan parse data users
            const localUserData = JSON.parse(localStorage.getItem("users") || "[]");

            // Format lengkap dengan default status "Aktif" jika belum ada
            const formattedUserData: User[] = localUserData.map((u: any) => ({
                id: u.id,
                nama: u.nama,
                role: u.role,
                status: u.status ?? "Aktif",
            }));

            setData(formattedUserData); // misalnya untuk DataTable
            setUserData(formattedUserData.slice(0, 5)); // misalnya untuk dashboard ringkasan

            // Simpan kembali data users jika ada data yang belum punya status
            const needsUpdate = localUserData.some((u: any) => !u.status);
            if (needsUpdate) {
                localStorage.setItem("users", JSON.stringify(formattedUserData));
            }

        } catch (error) {
            console.error("Gagal parsing data users:", error);
            setData([]);
            setUserData([]);
        }

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
                    onDelete={() => console.log('Delete', row)}
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
                    onEdit={() => router.push(`/admin/user/edituser?id=${row.id}`)}
                    onDelete={() => handleDeleteUser(row.id)}
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
