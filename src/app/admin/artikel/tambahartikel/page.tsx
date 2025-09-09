'use client';

import React, { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { ArrowLeft, UploadCloud, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const TambahArtikel: React.FC = () => {
    const router = useRouter();
    const [judul, setJudul] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [gambar, setGambar] = useState('');
    const [gambarFileName, setGambarFileName] = useState('');
    const [tanggal, setTanggal] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleGambarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.size < 5 * 1024 * 1024) { // <= 5MB
            setGambarFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => setGambar(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setModalMessage('Ukuran gambar harus kurang dari 5MB!');
            setShowModal(true);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!judul || !deskripsi || !gambar || !tanggal) {
            setModalMessage('Semua kolom harus diisi!');
            setShowModal(true);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/artikel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    judul,
                    deskripsi,
                    gambar,
                    tanggal: new Date(tanggal), // pastikan tanggal ke format Date
                }),
            });

            if (!res.ok) throw new Error('Gagal menambahkan artikel');

            setModalMessage('Artikel berhasil ditambahkan!');
            setShowModal(true);
        } catch (error) {
            console.error('Gagal menyimpan artikel:', error);
            setModalMessage('Terjadi kesalahan saat menyimpan data.');
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        // Jika pesan sukses, redirect ke halaman artikel
        if (modalMessage === 'Artikel berhasil ditambahkan!') {
            router.push('/admin/artikel');
        }
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <button
                onClick={() => router.back()}
                className="mb-6 text-green-700 flex items-center gap-2"
            >
                <ArrowLeft /> Kembali
            </button>

            <div className="bg-white p-8 rounded-md shadow max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-center text-black">Tambah Artikel</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block font-semibold mb-1 text-black">Judul</label>
                        <input
                            type="text"
                            value={judul}
                            onChange={(e) => setJudul(e.target.value)}
                            className="w-full border rounded px-4 py-2 text-black"
                            placeholder="Masukkan Judul Artikel"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1 text-black">Deskripsi</label>
                        <textarea
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            className="w-full border rounded px-4 py-2 min-h-[120px] text-black"
                            placeholder="Masukkan Deskripsi Artikel"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1 text-black">Gambar</label>
                        <div className="border border-gray-300 rounded p-4 bg-gray-50">
                            <p className="text-xs italic text-gray-600 mb-2">
                                * Upload gambar persegi, ukuran &lt; 5MB
                            </p>
                            <div className="flex items-center gap-4 mb-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                                >
                                    <UploadCloud size={18} /> Pilih Gambar
                                </button>
                                <span className="text-sm text-gray-700">{gambarFileName}</span>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleGambarChange}
                                className="hidden"
                            />
                            {gambar && (
                                <div className="mt-3">
                                    <Image
                                        src={gambar}
                                        alt="Preview"
                                        width={128}
                                        height={128}
                                        className="w-32 h-32 object-cover rounded border shadow-sm"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1 text-black">Tanggal</label>
                        <input
                            type="date"
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                            className="w-full border rounded px-4 py-2 text-black"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                        >
                            {loading ? "Menyimpan..." : "Simpan"}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal untuk notifikasi */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Notifikasi</h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="mb-4 text-gray-800">{modalMessage}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TambahArtikel;