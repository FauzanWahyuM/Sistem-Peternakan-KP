'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '../../lib/api-client';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        kelompok: '',
        role: '',
    });
    const [successMsg, setSuccessMsg] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Create user object matching the database schema
            const userData = {
                nama: form.name,
                username: form.username,
                email: form.email,
                password: form.password,
                kelompok: form.kelompok,
                role: form.role,
                status: 'Aktif' // Default status
            };

            // Save user to database
            await ApiClient.createUser(userData);
            
            setSuccessMsg('Registrasi berhasil! Mengarahkan ke login...');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error) {
            console.error('Registration error:', error);
            setSuccessMsg('Registrasi gagal. Silakan coba lagi.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-4 py-10">
            <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-8">
                <h2 className="text-2xl font-semibold text-center text-green-700 mb-6">Form Registrasi</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-700 block mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            name="name"
                            placeholder='Masukkan Nama Lengkap'
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-700 block mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            placeholder='Masukkan Username'
                            value={form.username}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-700 block mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder='Masukkan Email'
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-700 block mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder='Masukkan Password'
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-700 block mb-1">Kelompok Peternak</label>
                        <input
                            type="text"
                            name="kelompok"
                            placeholder='Masukkan Kelompok Peternak'
                            value={form.kelompok}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-700 block mb-2">Role</label>
                        <div className="flex justify-between">
                            {['Peternak', 'Penyuluh', 'Admin'].map((role) => (
                                <label key={role} className="inline-flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="role"
                                        value={role}
                                        checked={form.role === role}
                                        onChange={handleChange}
                                        className="accent-green-600"
                                        required
                                    />
                                    <span className="text-sm text-gray-800">{role}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {successMsg && (
                        <p className="text-sm text-green-600 text-center">{successMsg}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-200"
                    >
                        Simpan
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push('/login')}
                        className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition duration-200"
                    >
                        Batal
                    </button>
                </form>
            </div>
        </div>
    );
}
