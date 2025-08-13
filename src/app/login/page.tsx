'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthClient } from '../../lib/api-client';


export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await AuthClient.login(username, password);
            console.log('Login response:', response);
            
            // Save token to localStorage for future requests
            localStorage.setItem('token', response.token);
            
            // Redirect based on user role
            console.log('User role:', response.user.role);
            const role = response.user.role?.toLowerCase();
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
                    console.log('Unknown role:', response.user.role);
                    router.push('/');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMsg('Username atau password salah');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-100 via-white to-green-100 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-green-200">
                {/* Logo atau Judul */}
                <div className="text-center mb-6">
                    {/* Ganti src jika ingin logo */}
                    {/* <img src="/logo.png" alt="Logo" className="mx-auto h-12 mb-2" /> */}
                    <h2 className="text-3xl font-bold text-green-700">Login SIMANTEK</h2>
                    <p className="text-gray-600 text-sm mt-1">Masuk untuk melanjutkan</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
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

                    <div className="flex items-center my-4">
                        <div className="flex-grow h-px bg-gray-300"></div>
                        <span className="px-4 text-gray-500 text-sm">atau login dengan</span>
                        <div className="flex-grow h-px bg-gray-300"></div>
                    </div>

                    <div className="flex justify-center space-x-4 mb-4">
                        <button
                            className="bg-blue-600 text-white p-3 rounded-full flex items-center justify-center w-12 h-12"
                            onClick={() => router.push('/dashboard/peternak')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                            </svg>
                        </button>
                        <button
                            className="bg-red-600 text-white p-3 rounded-full flex items-center justify-center w-12 h-12"
                            onClick={() => router.push('/dashboard/peternak')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                                <path d="M12.24 10.285v3.29h5.275c-.263 1.367-1.038 2.538-2.201 3.318l-.02.013-3.085 2.02-.81-2.998c-1.69.307-3.5.252-5.19-.165-1.7-.417-3.26-1.27-4.51-2.475l-.05-.05-2.21-1.87 2.89-2.25c1.3-.99 2.4-2.25 3.16-3.72.76-1.47 1.17-3.12 1.17-4.84 0-.52-.04-1.03-.12-1.53l-.06-.33 2.89-2.25c.76-.59 1.67-.93 2.65-.93.99 0 1.9.34 2.66.93l2.89 2.25-.06.33c-.08.5-.12 1.01-.12 1.53 0 1.72.41 3.37 1.17 4.84.76 1.47 1.86 2.73 3.16 3.72l2.21 1.87-2.89 2.25c-.76.59-1.67.93-2.65.93-.65 0-1.28-.12-1.87-.34l-.81 2.998-3.085-2.02-.02-.013c-1.163-.78-1.938-1.951-2.201-3.318h-5.275v-3.29h-3.485z"/>
                            </svg>
                        </button>
                    </div>

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
