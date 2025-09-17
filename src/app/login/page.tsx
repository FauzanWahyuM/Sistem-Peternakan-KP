'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { signIn, getSession } from "next-auth/react";
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Kredensial hardcode untuk admin
    const adminCredentials = {
        username: 'admin',
        password: 'Admin@1234'
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            // Cek jika kredensial admin
            if (username === adminCredentials.username && password === adminCredentials.password) {
                // Simulasi login admin berhasil
                const mockAdminUser = {
                    _id: 'admin-001',
                    username: 'admin',
                    email: 'admin@sima.com',
                    role: 'admin',
                    name: 'Administrator'
                };

                // Simpan ke sessionStorage dan localStorage
                sessionStorage.setItem('userId', mockAdminUser._id);
                localStorage.setItem('userData', JSON.stringify(mockAdminUser));

                // Redirect ke dashboard admin
                router.push('/dashboard/admin');
                return;
            }

            // LOGIN pakai NextAuth credentials untuk user biasa
            const res = await signIn('credentials', {
                username,
                password,
                redirect: false,
            });

            if (!res?.ok) {
                setErrorMsg('Login gagal, periksa username/password');
                setIsLoading(false);
                return;
            }

            // Ambil session terbaru
            const session = await getSession();
            if (session?.user) {
                // Simpan userId dan userData
                const userId = (session.user as any)._id;
                sessionStorage.setItem('userId', userId);
                localStorage.setItem('userData', JSON.stringify(session.user));
            }
            const role = (session?.user as any)?.role?.toLowerCase();

            // redirect ke dashboard sesuai role
            switch (role) {
                case 'admin':
                    router.push('/dashboard/admin');
                    break;
                case 'penyuluh':
                    router.push('/dashboard/penyuluh');
                    break;
                case 'peternak':
                    router.push('/dashboard/peternak');
                    break;
                default:
                    router.push('/');
            }

        } catch (err: any) {
            console.error('Login error:', err);
            setErrorMsg('Terjadi kesalahan saat login');
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setErrorMsg('');
        setIsLoading(true);

        try {
            await signIn("google", {
                callbackUrl: '/dashboard/peternak'
            });
        } catch (error) {
            console.error('Google login error:', error);
            setErrorMsg('Terjadi kesalahan saat login dengan Google');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-100 via-white to-green-100 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-green-200">
                {/* Logo / Judul */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-green-700">Login SIMANTEK</h2>
                    <p className="text-gray-600 text-sm mt-1">Masuk untuk melanjutkan</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="Masukkan Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-700 block mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Masukkan Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                                disabled={isLoading}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {errorMsg && (
                        <p className="text-red-500 text-sm text-center">{errorMsg}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Memproses...' : 'Masuk'}
                    </button>

                    <p className='text-sm text-black text-center'>
                        Atau Login menggunakan:
                    </p>

                    <div className="flex justify-center space-x-4 mb-4">
                        {/* Tombol Google G */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-12 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            <Image
                                src="/google.svg"
                                alt="google"
                                width={48}
                                height={48}
                                className="object-contain"
                            />
                        </button>
                    </div>

                    <p className="text-center text-sm mt-3 text-gray-600">
                        Belum punya akun?{' '}
                        <a
                            href="/register"
                            className="text-green-600 hover:underline font-medium"
                        >
                            Daftar di sini
                        </a>
                    </p>
                </form>

                <Link href="/">
                    <button
                        type="button"
                        className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        Kembali ke Dashboard
                    </button>
                </Link>
            </div>
        </div>
    );
}