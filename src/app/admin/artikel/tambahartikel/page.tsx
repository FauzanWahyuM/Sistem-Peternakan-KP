'use client';

import React, { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { ArrowLeft, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TambahArtikel: React.FC = () => {
    const router = useRouter();
    const [judul, setJudul] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [gambar, setGambar] = useState('');
    const [gambarFileName, setGambarFileName] = useState('');
    const [tanggal, setTanggal] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleGambarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.size < 20 * 1024 * 1024) {
            setGambarFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => setGambar(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            alert('Ukuran gambar harus kurang dari 20MB!');
        }
    };


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!judul || !deskripsi || !gambar || !tanggal) {
            alert('Semua kolom harus diisi!');
            return;
        }

        try {
            let existingData = [];
            try {
                const stored = localStorage.getItem('artikels');
                existingData = stored ? JSON.parse(stored) : [];
            } catch (err) {
                console.warn('Data artikel rusak, reset ke array kosong.');
                existingData = [];
            }

            const newArtikel = {
                id: Date.now(),
                judul,
                deskripsi,
                gambar,
                tanggal,
            };

            const updatedData = [...existingData, newArtikel];
            localStorage.setItem('artikels', JSON.stringify(updatedData));
            alert('Artikel berhasil ditambahkan!');
            router.push('/admin/artikel');
        } catch (error) {
            console.error('Gagal menyimpan artikel:', error);
            alert('Terjadi kesalahan saat menyimpan data.');
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
                                * Upload gambar persegi, ukuran &lt; 20MB
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
                                    <img
                                        src={gambar}
                                        alt="Preview"
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
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                        >
                            Simpan
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
        </div>
    );
};

export default TambahArtikel;
