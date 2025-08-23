'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiClient } from '../../../../lib/api-client';

interface FormData {
    nama: string;
    username: string;
    email: string;
    password: string;
    kelompok: string;
    role: 'Peternak' | 'Penyuluh' | 'Admin' | '';
    status: 'Aktif' | 'Non-Aktif' | '';
}

const EditUser: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('id');

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        nama: '',
        username: '',
        email: '',
        password: '',
        kelompok: '',
        role: '',
        status: '',
    });
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (userId) {
            fetchUser();
        }
    }, [userId]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await ApiClient.getUserById(userId);
            const user = response.user;

            if (user) {
                // Normalisasi role supaya huruf besar depan (Peternak, Penyuluh, Admin)
                let normalizedRole: "" | "Peternak" | "Penyuluh" | "Admin" = "";
                if (user.role) {
                    const roleLower = user.role.toLowerCase();
                    if (roleLower === 'peternak') normalizedRole = 'Peternak';
                    else if (roleLower === 'penyuluh') normalizedRole = 'Penyuluh';
                    else if (roleLower === 'admin') normalizedRole = 'Admin';
                }

                // Merge user data dengan form
                setFormData({
                    nama: user.nama || '',
                    username: user.username || '',
                    email: user.email || '',
                    password: '',
                    kelompok: user.kelompok || '',
                    role: normalizedRole,
                    status: user.status || '',
                });
            } else {
                alert('User tidak ditemukan');
                router.push('/admin/user');
            }
        } catch (error) {
            console.error('Gagal mengambil data pengguna:', error);
            alert('Terjadi kesalahan saat mengambil data pengguna.');
            router.push('/admin/user');
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (role: FormData['role']) => {
        setFormData((prev) => ({ ...prev, role }));
    };

    const handleStatusChange = (status: FormData['status']) => {
        setFormData((prev) => ({ ...prev, status }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            // Only send password if it's not empty (meaning it's being updated)
            const userData = { ...formData };
            if (!userData.password) {
                delete userData.password;
            }
            
            await ApiClient.updateUser(userId, userData);
            alert('User berhasil diperbarui!');
            router.push('/admin/user');
        } catch (error) {
            console.error('Gagal menyimpan ke database:', error);
            alert('Terjadi kesalahan saat menyimpan data.');
        }
    };

    if (loading) {
        return (
            <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <button
                onClick={() => router.back()}
                className="mb-6 text-green-700 flex items-center gap-2"
            >
                <ArrowLeft /> Kembali
            </button>

            <div className="bg-white p-8 rounded-md shadow max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-center text-black">Edit User</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block font-semibold mb-1 text-black">Nama User</label>
                        <input
                            type="text"
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            className="w-full border rounded px-4 py-2 text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1 text-black">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full border rounded px-4 py-2 text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1 text-black">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border rounded px-4 py-2 text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1 text-black">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full border rounded px-4 py-2 pr-10 text-black"
                                placeholder="Biarkan kosong jika tidak ingin mengganti password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-2.5 right-3 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold mb-2 text-black">Status</label>
                        <div className="flex gap-8 text-black">
                            {['Aktif', 'Non-Aktif'].map((status) => (
                                <label key={status} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="status"
                                        value={status}
                                        checked={formData.status === status}
                                        onChange={() => handleStatusChange(status as FormData['status'])}
                                    />
                                    {status}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1 text-black">Kelompok Peternak</label>
                        <input
                            type="text"
                            name="kelompok"
                            value={formData.kelompok}
                            onChange={handleChange}
                            className="w-full border rounded px-4 py-2 text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-2 text-black">Role</label>
                        <div className="flex gap-8 text-black">
                            {['Peternak', 'Penyuluh', 'Admin'].map((role) => (
                                <label key={role} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="role"
                                        value={role}
                                        checked={formData.role === role}
                                        onChange={() => handleRoleChange(role as FormData['role'])}
                                    />
                                    {role}
                                </label>
                            ))}
                        </div>
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

export default EditUser;