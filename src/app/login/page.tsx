'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Login gagal');
            }

            const data = await res.json();
            console.log('Login success:', data);

            // simpan token di localStorage
            localStorage.setItem('token', data.token);

            // redirect berdasarkan role
            const role = data.user.role?.toLowerCase();
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
            setErrorMsg(err.message || 'Terjadi kesalahan saat login');
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
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Masukkan Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                            required
                        />
                    </div>

                    {errorMsg && (
                        <p className="text-red-500 text-sm text-center">{errorMsg}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition duration-200"
                    >
                        Masuk
                    </button>

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
                        className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition duration-200"
                    >
                        Kembali ke Dashboard
                    </button>
                </Link>
            </div>
        </div>
    );
}
