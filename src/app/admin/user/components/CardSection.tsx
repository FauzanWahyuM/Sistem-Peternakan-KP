"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, X, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { TableColumn } from "react-data-table-component";
import { useRouter } from "next/navigation";
import { ApiClient } from "../../../../lib/api-client";

const DataTable = dynamic(() => import("react-data-table-component"), { ssr: false });

type User = {
    _id: string;
    nama: string;
    role: string;
    status: string;
};

const customStyles = {
    headCells: {
        style: {
            fontWeight: "bold",
            fontSize: "14px",
            backgroundColor: "#f9fafb",
            color: "#111827",
        },
    },
    rows: {
        style: {
            fontSize: "14px",
            color: "#374151",
        },
    },
};

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [data, setData] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await ApiClient.getUsers();
            const users = response.users || [];
            setData(users);
        } catch (error) {
            console.error("Gagal mengambil data pengguna:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const confirmDelete = async () => {
        if (selectedUser) {
            try {
                await ApiClient.deleteUser(selectedUser._id);
                await fetchUsers(); // Refresh the user list
                closeModal();
            } catch (error) {
                console.error("Gagal menghapus pengguna:", error);
                alert("Gagal menghapus pengguna");
            }
        }
    };

    const handleEdit = (row: User) => {
        router.push(`/admin/user/edituser?id=${row._id}`);
    };

    const columns: TableColumn<User>[] = [
        {
            name: "Nama",
            selector: (row) => row.nama,
            sortable: true,
        },
        {
            name: "Role",
            selector: (row) => row.role,
            sortable: true,
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
        },
        {
            name: "Aksi",
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

    const filteredData = data.filter((user) =>
        user.nama && user.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="rounded-xl bg-white p-4 shadow-md">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-white p-4 shadow-md relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <input
                    type="text"
                    placeholder="Cari nama user..."
                    className="w-full sm:max-w-sm px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <button
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow font-semibold"
                    onClick={() => router.push("/admin/user/tambahuser")}
                >
                    + Tambah Pengguna
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
                noDataComponent="Tidak ada data user."
            />

            <div className="mt-3 text-sm text-gray-600">
                Total pengguna: <strong>{filteredData.length}</strong>
            </div>

            {/* Modal Konfirmasi */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
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
