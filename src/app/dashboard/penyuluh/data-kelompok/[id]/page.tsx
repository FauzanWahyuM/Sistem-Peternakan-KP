'use client';

import Sidebar from '../../components/UnifiedSidebar';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function AnggotaKelompokPage() {
    const router = useRouter();
    const params = useParams();
    const kelompokId = params?.id as string;

    // Data anggota kelompok - dalam implementasi nyata, ini akan diambil dari API berdasarkan kelompokId
    const anggotaData = [
        {
            nama: 'Gideon',
            jenis: 'Peternak',
            phone: '+62 822 4862 2546',
            status: 'aktif'
        },
        {
            nama: 'Fauzan',
            jenis: 'Peternak',
            phone: '+62 822 4862 2547',
            status: 'aktif'
        },
        {
            nama: 'Syahrul',
            jenis: 'Peternak',
            phone: '+62 822 4862 2548',
            status: 'aktif'
        }
    ];

    // Informasi kelompok
    const kelompokInfo = {
        jenis: 'Isi',
        kelompok: kelompokId?.toUpperCase() || 'A',
        alamat: 'Lorem ipsum dolor sit amet consectetur.',
        jenisTernak: 'Sapi, kambing',
        jumlahTernak: '50',
        tahunMulaiBeternak: '2000'
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar userType="penyuluh" />
            <main className="flex-1 p-6">
                {/* Back Button and Header */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <button
                            onClick={handleBack}
                            className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors mr-4"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Anggota Kelompok {kelompokId?.toUpperCase()}
                        </h1>
                    </div>
                </div>

                {/* Anggota Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 max-w-6xl">
                    {anggotaData.map((anggota, index) => (
                        <div key={index} className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-xl font-bold mb-2">{anggota.nama}</h3>
                            <p className="text-white opacity-90 mb-1">{anggota.jenis}</p>
                            <p className="text-white opacity-90 mb-1">{anggota.phone}</p>
                            <p className="text-white opacity-90">{anggota.status}</p>
                        </div>
                    ))}
                </div>

                {/* Informasi Kelompok */}
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Informasi kelompok</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-4 px-4 font-medium text-gray-700 bg-gray-50">Jenis</td>
                                    <td className="py-4 px-4 text-gray-800">{kelompokInfo.jenis}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-4 px-4 font-medium text-gray-700 bg-gray-50">Kelompok</td>
                                    <td className="py-4 px-4 text-gray-800">{kelompokInfo.kelompok}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-4 px-4 font-medium text-gray-700 bg-gray-50">Alamat</td>
                                    <td className="py-4 px-4 text-gray-800">{kelompokInfo.alamat}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-4 px-4 font-medium text-gray-700 bg-gray-50">Jenis ternak</td>
                                    <td className="py-4 px-4 text-gray-800">{kelompokInfo.jenisTernak}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-4 px-4 font-medium text-gray-700 bg-gray-50">Jumlah ternak</td>
                                    <td className="py-4 px-4 text-gray-800">{kelompokInfo.jumlahTernak}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 font-medium text-gray-700 bg-gray-50">Tahun mulai beternak</td>
                                    <td className="py-4 px-4 text-gray-800">{kelompokInfo.tahunMulaiBeternak}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}