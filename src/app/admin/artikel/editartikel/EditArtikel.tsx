'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react';
import { ArrowLeft, UploadCloud } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface ArtikelData {
    id: number;
    judul: string;
    deskripsi: string;
    gambar: string;
    tanggal: string;
}

const EditArtikel: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const artikelId = searchParams.get('id');

    const [formData, setFormData] = useState<ArtikelData>({
        id: 0,
        judul: '',
        deskripsi: '',
        gambar: '',
        tanggal: '',
    });
    const [gambarFileName, setGambarFileName] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (artikelId) {
            const artikels = JSON.parse(localStorage.getItem('artikels') || '[]');
            const artikelToEdit = artikels.find((a: ArtikelData) => a.id.toString() === artikelId);

            if (artikelToEdit) {
                setFormData(artikelToEdit);
                setGambarFileName(artikelToEdit.gambar ? 'Sudah dipilih' : '');
            } else {
                alert('Artikel tidak ditemukan');
                router.push('/admin/artikel');
            }
        }
    }, [artikelId, router]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleGambarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.size < 20 * 1024 * 1024) {
            setGambarFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({ ...prev, gambar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        } else {
            alert('Ukuran gambar maksimal 20MB!');
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        try {
            const artikels = JSON.parse(localStorage.getItem('artikels') || '[]');
            const updated = artikels.map((a: ArtikelData) =>
                a.id.toString() === artikelId ? formData : a
            );
            localStorage.setItem('artikels', JSON.stringify(updated));
            alert('Artikel berhasil diperbarui!');
            router.push('/admin/artikel');
        } catch (error) {
            console.error('Gagal menyimpan ke localStorage:', error);
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
                <h1 className="text-2xl font-bold mb-6 text-center text-black">Edit Artikel</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block font-semibold mb-1 text-black">Judul</label>
                        <input
                            type="text"
                            name="judul"
                            value={formData.judul}
                            onChange={handleChange}
                            className="w-full border rounded px-4 py-2 text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1 text-black">Deskripsi</label>
                        <textarea
                            name="deskripsi"
                            value={formData.deskripsi}
                            onChange={handleChange}
                            className="w-full border rounded px-4 py-2 min-h-[120px] text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1 text-black">Gambar</label>
                        <div className="border border-gray-300 rounded p-4 bg-gray-50">
                            <p className="text-xs italic text-gray-600 mb-2">
                                * Upload gambar maksimal 20MB
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
                            {formData.gambar && (
                                <div className="mt-3">
                                    <Image
                                        src={formData.gambar}
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
                            name="tanggal"
                            value={formData.tanggal}
                            onChange={handleChange}
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

export default EditArtikel;
