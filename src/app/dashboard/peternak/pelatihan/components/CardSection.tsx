import DataTable from 'react-data-table-component';

export default function CardSection() {
    const ActionButtons = ({ onEdit, onDelete, onDownload }) => (
        <div className="flex gap-2">
            {onEdit && <button onClick={onEdit} className="text-blue-600 hover:underline">Edit</button>}
            {onDelete && <button onClick={onDelete} className="text-red-600 hover:underline">Hapus</button>}
            {onDownload && <button onClick={onDownload} className="text-green-600 hover:underline">Download</button>}
        </div>
    );

    const userColumns = [
        { name: 'Nama', selector: row => row.nama, sortable: true },
        { name: 'Role', selector: row => row.role },
        { name: 'Status', selector: row => row.status },
        {
            name: 'Actions',
            cell: (row) => (
                <ActionButtons
                    onEdit={() => console.log('Edit user', row)}
                    onDelete={() => console.log('Hapus user', row)} onDownload={undefined}                />
            ),
        }
    ];

    const userData = [
        { nama: 'Gibson', role: 'Penyuluh', status: 'Aktif' },
        { nama: 'Zaki', role: 'Admin', status: 'Aktif' }
    ];

    const artikelColumns = [
        { name: 'Judul', selector: row => row.judul },
        { name: 'Deskripsi', selector: row => row.deskripsi },
        { name: 'Gambar', cell: () => <span>📷</span> },
        { name: 'Tanggal', selector: row => row.tanggal },
        {
            name: 'Actions',
            cell: (row) => (
                <ActionButtons
                    onEdit={() => console.log('Edit artikel', row)}
                    onDelete={() => console.log('Hapus artikel', row)} onDownload={undefined}                />
            ),
        }
    ];

    const artikelData = [
        { judul: 'Pertanian', deskripsi: '...', tanggal: '16/07/2025' },
        { judul: '...', deskripsi: '...', tanggal: '...' }
    ];

    const laporanColumns = [
        { name: 'Nama', selector: row => row.nama },
        { name: 'Nilai Kepuasan', selector: row => row.nilai },
        {
            name: 'Actions',
            cell: (row) => (
                <ActionButtons
                    onEdit={() => console.log('Lihat detail', row)}
                    onDelete={() => console.log('Hapus laporan', row)}
                    onDownload={() => console.log('Download laporan', row)}
                />
            ),
        }
    ];

    const laporanData = [
        { nama: 'Gibson', nilai: '100/100' },
        { nama: 'Zaki', nilai: '79/100' }
    ];

    return (
        <div className="space-y-6">
            {/* User Card */}
            <section className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-bold mb-4">User</h2>
                <DataTable
                    columns={userColumns}
                    data={userData}
                    pagination
                    dense
                    responsive
                    highlightOnHover
                    className="rounded"
                />
                <button className="mt-4 bg-gray-100 px-4 py-2 rounded">User Lainnya ⮞</button>
            </section>

            {/* Artikel Card */}
            <section className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-bold mb-4">Artikel</h2>
                <DataTable
                    columns={artikelColumns}
                    data={artikelData}
                    pagination
                    dense
                    responsive
                    highlightOnHover
                    className="rounded"
                />
                <button className="mt-4 bg-gray-100 px-4 py-2 rounded">Artikel Lainnya ⮞</button>
            </section>

            {/* Laporan Card */}
            <section className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-bold mb-4">Laporan</h2>
                <DataTable
                    columns={laporanColumns}
                    data={laporanData}
                    pagination
                    dense
                    responsive
                    highlightOnHover
                    className="rounded"
                />
                <button className="mt-4 bg-gray-100 px-4 py-2 rounded">Laporan Lainnya ⮞</button>
            </section>
        </div>
    );
}
