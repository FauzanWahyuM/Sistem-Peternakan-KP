'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Dummy logic login
        if (email === 'admin@gmail.com' && password === 'admin123') {
            router.push('/dashboard/admin');
        }
        else if (email == "penyuluh@gmail.com" && password === "penyuluh123") {
            router.push('/dashboard/penyuluh');
        }
        else if (email == "peternak@gmail.com" && password === "peternak123") {
            router.push('/dashboard/peternak'); 
        }
        else {
            setErrorMsg('Email atau password salah');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-100 via-white to-green-100 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-green-200">
                {/* Logo atau Judul */}
                <div className="text-center mb-6">
                    {/* Ganti src jika ingin logo */}
                    {/* <img src="/logo.png" alt="Logo" className="mx-auto h-12 mb-2" /> */}
                    <h2 className="text-3xl font-bold text-green-700">Login SiTernak</h2>
                    <p className="text-gray-600 text-sm mt-1">Masuk untuk melanjutkan</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="Masukkan Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            placeholder="Masukkan Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                            required
                        />
                    </div>

                    {errorMsg && <p className="text-red-500 text-sm text-center">{errorMsg}</p>}

                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition duration-200"
                    >
                        Masuk
                    </button>

                    <p className="text-center text-sm mt-3 text-gray-600">
                        Belum punya akun?{' '}
                        <a href="/register" className="text-green-600 hover:underline font-medium">
                            Daftar di sini
                        </a>
                    </p>
                </form>
                <Link href="/">
                    <button
                        type="button"
                        className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition duration-200"
                    >
                        Kembali ke Dashboard
                    </button>
                </Link>
            </div>
        </div>
    );
}
