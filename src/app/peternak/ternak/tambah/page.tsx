'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/UnifiedSidebar';
import { ChevronLeft, CheckCircle, XCircle, Plus, X } from 'lucide-react';

export default function TambahTernakPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        tipe: 'pribadi',
        kelompokId: '',
        kelompokNama: '',
        jenisHewan: '',
        jenisKelamin: '',
        umurTernak: '',
        statusTernak: '',
        kondisiKesehatan: '',
        penyakit: [] as string[]
    });

    const [kelompokOptions, setKelompokOptions] = useState<{ id: string, nama: string }[]>([]);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [userData, setUserData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [previousKelompokData, setPreviousKelompokData] = useState({
        kelompokId: '',
        kelompokNama: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newPenyakit, setNewPenyakit] = useState('');
    const jenisHewanOptions = ['Sapi', 'Kambing', 'Domba', 'Ayam', 'Bebek'];
    const jenisKelaminOptions = ['Jantan', 'Betina'];
    const kondisiKesehatanOptions = ['Sehat', 'Sakit'];
    const tipeOptions = ['pribadi', 'kelompok'];
    // Tambahan state
    const [jumlahTernak, setJumlahTernak] = useState(1);
    const [umurNumber, setUmurNumber] = useState('');


    useEffect(() => {
        const loadUserData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/auth/me');

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data.user);

                    if (data.user.kelompok && data.user.kelompok !== 'Tidak tersedia') {
                        loadKelompokOptions(data.user.kelompok);
                    } else {
                        setIsLoading(false);
                    }
                } else {
                    console.error('Failed to fetch user data');
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error loading user data:', error);
                setIsLoading(false);
            }
        };

        loadUserData();
    }, []);

    const loadKelompokOptions = async (userKelompok: string) => {
        try {
            if (userKelompok && userKelompok !== 'Tidak tersedia') {
                const kelompokData = {
                    id: userKelompok,
                    nama: `Kelompok ${userKelompok}`
                };

                setKelompokOptions([kelompokData]);

                setFormData(prev => ({
                    ...prev,
                    kelompokId: userKelompok,
                    kelompokNama: `Kelompok ${userKelompok}`
                }));

                setPreviousKelompokData({
                    kelompokId: userKelompok,
                    kelompokNama: `Kelompok ${userKelompok}`
                });
            }

            setIsLoading(false);
        } catch (error) {
            console.error('Error loading kelompok options:', error);
            setIsLoading(false);
        }
    };

    const getStatusTernakOptions = () => {
        const { jenisHewan, jenisKelamin } = formData;

        if (!jenisHewan || !jenisKelamin) return [];

        const statusOptions: Record<string, Record<string, string[]>> = {
            'Sapi': {
                'Jantan': ['Pejantan', 'Sapi Potong', 'Sapi Kerja', 'Bibit', 'Penggemukan'],
                'Betina': ['Indukan', 'Sapi Perah', 'Sapi Potong', 'Bibit', 'Dara']
            },
            'Kambing': {
                'Jantan': ['Pejantan', 'Kambing Potong', 'Bibit', 'Penggemukan', 'Kambing Kerja'],
                'Betina': ['Indukan', 'Kambing Perah', 'Kambing Potong', 'Bibit', 'Dara']
            },
            'Domba': {
                'Jantan': ['Pejantan', 'Domba Potong', 'Bibit', 'Penggemukan', 'Domba Wol'],
                'Betina': ['Indukan', 'Domba Potong', 'Bibit', 'Dara', 'Domba Wol']
            },
            'Ayam': {
                'Jantan': ['Pejantan', 'Ayam Potong', 'Ayam Aduan', 'Bibit', 'Ayam Hias'],
                'Betina': ['Indukan', 'Ayam Petelur', 'Ayam Potong', 'Bibit', 'Ayam Hias']
            },
            'Bebek': {
                'Jantan': ['Pejantan', 'Bebek Potong', 'Bibit', 'Bebek Hias', 'Penggemukan'],
                'Betina': ['Indukan', 'Bebek Petelur', 'Bebek Potong', 'Bibit', 'Bebek Hias']
            }
        };

        return statusOptions[jenisHewan]?.[jenisKelamin] || [];
    };

    // Fungsi untuk handle perubahan input umur
    const handleUmurChange = (value: string) => {
        // Hanya menerima angka
        const numbers = value.replace(/\D/g, '');
        setUmurNumber(numbers);

        // Update formData dengan format "angka bulan"
        if (numbers) {
            setFormData(prev => ({
                ...prev,
                umurTernak: `${numbers} bulan`
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                umurTernak: ''
            }));
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => {
            let newData = { ...prev };

            if (field === 'tipe') {
                if (value === 'pribadi') {
                    setPreviousKelompokData({
                        kelompokId: prev.kelompokId,
                        kelompokNama: prev.kelompokNama
                    });

                    newData = {
                        ...prev,
                        tipe: value,
                        kelompokId: '',
                        kelompokNama: ''
                    };
                } else if (value === 'kelompok') {
                    newData = {
                        ...prev,
                        tipe: value,
                        kelompokId: previousKelompokData.kelompokId,
                        kelompokNama: previousKelompokData.kelompokNama
                    };
                }
            } else if (field === 'umurTernak') {
                // Skip karena sudah dihandle oleh handleUmurChange
                return prev;
            } else {
                newData = {
                    ...prev,
                    [field]: value,
                    ...(field === 'jenisHewan' || field === 'jenisKelamin' ? { statusTernak: '' } : {})
                };
            }

            return newData;
        });
    };

    // Fungsi untuk menambah penyakit
    const addPenyakit = () => {
        if (newPenyakit.trim() && !formData.penyakit.includes(newPenyakit.trim())) {
            setFormData(prev => ({
                ...prev,
                penyakit: [...prev.penyakit, newPenyakit.trim()]
            }));
            setNewPenyakit('');
        }
    };

    // Fungsi untuk menghapus penyakit
    const removePenyakit = (index: number) => {
        setFormData(prev => ({
            ...prev,
            penyakit: prev.penyakit.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (!userData) {
                throw new Error('User data not available');
            }

            // Validasi data
            if (!formData.jenisHewan || !formData.jenisKelamin || !formData.umurTernak ||
                !formData.statusTernak || !formData.kondisiKesehatan) {
                throw new Error('Harap isi semua field yang wajib diisi');
            }

            const dataToSend = {
                ...formData,
                userId: userData._id,
                jumlahTernak // <-- ini dikirim ke backend
            };

            console.log('Data to send:', dataToSend);

            const response = await fetch('/api/ternak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Gagal menambah data ternak');
            }

            setMessage('Data ternak berhasil disimpan!');
            setIsSuccessOpen(true);

            setTimeout(() => {
                router.push('/peternak/ternak');
                router.refresh();
            }, 2000);

        } catch (error: any) {
            console.error('Error saving ternak data:', error);
            setMessage('Gagal menyimpan data ternak: ' + error.message);
            setError(error.message);
            setIsErrorOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/peternak/ternak');
    };

    const handleBack = () => {
        router.push('/peternak/ternak');
    };

    const closeSuccess = () => {
        setIsSuccessOpen(false);
        router.push('/peternak/ternak');
    };

    const closeError = () => {
        setIsErrorOpen(false);
    };

    if (isLoading && !isSuccessOpen && !isErrorOpen) {
        return (
            <div className="flex min-h-screen">
                <Sidebar userType="peternak" />
                <main className="flex-1 bg-gray-100 p-6 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-700">Memuat data...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <div className="sticky top-0 h-screen">
                <Sidebar userType="peternak" />
            </div>

            <main className="flex-1 bg-gray-100 p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center mb-8">
                        <button
                            onClick={handleBack}
                            className="mr-4 p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-3xl font-bold font-[Judson] text-gray-800 text-center flex-1">Tambah Ternak</h1>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Pilihan Tipe */}
                        <div>
                            <label className="block text-lg font-medium font-[Judson] text-gray-700 mb-2">
                                Tipe Ternak
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {tipeOptions.map((option: string) => (
                                    <div
                                        key={option}
                                        className={`p-4 border rounded-lg cursor-pointer text-center font-[Judson] ${formData.tipe === option
                                            ? 'bg-green-100 border-green-500 text-green-700'
                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        onClick={() => handleInputChange('tipe', option)}
                                    >
                                        {option === 'pribadi' ? 'Pribadi' : 'Kelompok'}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pilihan Kelompok (hanya muncul jika tipe kelompok) */}
                        {formData.tipe === 'kelompok' && (
                            <div>
                                <label className="block text-lg font-medium font-[Judson] text-gray-700 mb-2">
                                    Kelompok
                                </label>
                                {kelompokOptions.length > 0 ? (
                                    <>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.kelompokNama}
                                                className="w-full p-4 border border-gray-300 rounded-lg bg-gray-100 font-[Judson] text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                readOnly
                                            />
                                            {/* Hidden input untuk menyimpan kelompokId */}
                                            <input
                                                type="hidden"
                                                value={formData.kelompokId}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 text-center">
                                        <p className="text-gray-500">Anda belum tergabung dalam kelompok</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-lg font-medium font-[Judson] text-gray-700 mb-2">
                                Jenis Hewan
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.jenisHewan}
                                    onChange={(e) => handleInputChange('jenisHewan', e.target.value)}
                                    className="w-full p-4 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    <option value="">Pilih Jenis Hewan</option>
                                    {jenisHewanOptions.map((option: string) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-lg font-medium font-[Judson] text-gray-700 mb-2">
                                Jenis Kelamin
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.jenisKelamin}
                                    onChange={(e) => handleInputChange('jenisKelamin', e.target.value)}
                                    className="w-full p-4 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    <option value="">Pilih Jenis Kelamin</option>
                                    {jenisKelaminOptions.map((option: string) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Input Umur Ternak yang lebih user-friendly */}
                        <div>
                            <label className="block text-lg font-medium font-[Judson] text-gray-700 mb-2">
                                Umur Ternak
                            </label>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        value={umurNumber}
                                        onChange={(e) => handleUmurChange(e.target.value)}
                                        placeholder="Masukkan umur"
                                        min="0"
                                        max="1000"
                                        className="w-full p-4 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div className="w-32">
                                    <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-100 font-[Judson] text-gray-700 text-center">
                                        bulan
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 font-[Judson]">
                                * Masukkan angka umur ternak dalam bulan
                            </p>
                        </div>

                        <div>
                            <label className="block text-lg font-medium font-[Judson] text-gray-700 mb-2">
                                Status Ternak
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.statusTernak}
                                    onChange={(e) => handleInputChange('statusTernak', e.target.value)}
                                    className="w-full p-4 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                    disabled={!formData.jenisHewan || !formData.jenisKelamin}
                                >
                                    <option value="">Pilih Status Ternak</option>
                                    {getStatusTernakOptions().map((option: string) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-lg font-medium font-[Judson] text-gray-700 mb-2">
                                Kondisi Kesehatan
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.kondisiKesehatan}
                                    onChange={(e) => handleInputChange('kondisiKesehatan', e.target.value)}
                                    className="w-full p-4 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    <option value="">Pilih Kondisi Kesehatan</option>
                                    {kondisiKesehatanOptions.map((option: string) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Field Penyakit yang Pernah Menyerang */}
                        <div>
                            <label className="block text-lg font-medium font-[Judson] text-gray-700 mb-2">
                                Penyakit yang Pernah Menyerang
                            </label>
                            <div className="space-y-3">
                                {/* Input untuk menambah penyakit baru */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newPenyakit}
                                        onChange={(e) => setNewPenyakit(e.target.value)}
                                        placeholder="Masukkan nama penyakit"
                                        className="flex-1 p-4 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addPenyakit();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={addPenyakit}
                                        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg font-medium font-[Judson] flex items-center justify-center"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                {/* Daftar penyakit yang sudah ditambahkan */}
                                {formData.penyakit.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-medium text-gray-700 mb-2 font-[Judson]">
                                            Daftar Penyakit:
                                        </h4>
                                        <div className="space-y-2">
                                            {formData.penyakit.map((penyakit, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                                                    <span className="font-[Judson] text-black">{penyakit}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removePenyakit(index)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-lg font-medium font-[Judson] text-gray-700 mb-2">
                                Jumlah Ternak
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={jumlahTernak}
                                onChange={(e) => setJumlahTernak(Number(e.target.value))}
                                className="w-full p-4 border border-gray-300 rounded-lg bg-white font-[Judson] text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-green-500 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium font-[Judson] text-lg disabled:opacity-50"
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 bg-red-500 hover:bg-red-900 text-white py-3 px-6 rounded-lg font-medium font-[Judson] text-lg"
                            >
                                Batal
                            </button>
                        </div>

                        {/* Modal Success */}
                        {isSuccessOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                                <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative text-center">
                                    <div className="flex justify-center text-green-600 mb-4">
                                        <CheckCircle size={48} />
                                    </div>
                                    <h2 className="text-lg font-bold text-green-600 mb-4">Berhasil</h2>
                                    <p className="text-gray-700 mb-6">{message}</p>
                                    <button
                                        onClick={closeSuccess}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Modal Error */}
                        {isErrorOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                                <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative text-center">
                                    <div className="flex justify-center text-red-600 mb-4">
                                        <XCircle size={48} />
                                    </div>
                                    <h2 className="text-lg font-bold text-red-600 mb-4">Gagal</h2>
                                    <p className="text-gray-700 mb-6">{message}</p>
                                    <button
                                        onClick={closeError}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
}