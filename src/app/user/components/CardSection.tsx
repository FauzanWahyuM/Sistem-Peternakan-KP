"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { TableColumn } from "react-data-table-component"; // ⬅️ penting!

const DataTable = dynamic(() => import("react-data-table-component"), { ssr: false });

type User = {
    id: number;
    nama: string;
    role: string;
    status: string;
};

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [data, setData] = useState<User[]>([
        { id: 1, nama: "Gideon", role: "Penyuluh", status: "Aktif" },
        { id: 2, nama: "Zaki", role: "Peternak", status: "Aktif" },
        { id: 3, nama: "Fauzan", role: "Admin", status: "Aktif" },
        { id: 4, nama: "Wahyu", role: "Admin", status: "Aktif" },
    ]);

    const handleEdit = (row: User) => {
        console.log("Edit user:", row);
    };

    const handleDelete = (row: User) => {
        if (window.confirm(`Yakin ingin menghapus ${row.nama}?`)) {
            setData((prevData) => prevData.filter((user) => user.id !== row.id));
        }
    };

    const columns: TableColumn<User>[] = [ // ✅ tambahkan typing di sini
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
                        className="text-yellow-600 hover:text-yellow-800"
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
            allowOverflow: true,
            button: true,
        },
    ];

    const filteredData = data.filter((user) =>
        user.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="rounded-xl bg-white p-4 shadow-md">
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
                        onClick={() => alert("Fitur tambah user belum diimplementasikan")}
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
                        noDataComponent="Tidak ada data user."
                    />
        </div>
    );
}
