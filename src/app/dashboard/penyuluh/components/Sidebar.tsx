'use client';

import { useRouter } from 'next/navigation';
import { Home, Users, FileText, LogOut, Newspaper } from 'lucide-react';

export default function Sidebar() {
    const router = useRouter();

    const handleLogout = () => {
        // Kalau ada proses logout lainnya, letakkan di sini, contoh:
        // localStorage.removeItem('token');
        // cookies().delete('authToken'); // kalau pakai cookies
        router.push('/login');
    };

    return (
        <aside className="bg-green-600 text-white w-64 flex flex-col justify-between min-h-screen py-6 px-4">
            <div>
                <h2 className="text-2xl font-bold mb-8 text-center">SiTernak</h2>
                <nav className="space-y-4">
                    <a href="/dashboard" className="flex items-center space-x-3 hover:bg-green-700 px-3 py-2 rounded">
                        <Home size={20} />
                        <span>Dashboard</span>
                    </a>
                    <a href="/dashboard/user" className="flex items-center space-x-3 hover:bg-green-700 px-3 py-2 rounded">
                        <Users size={20} />
                        <span>Data Kelompok</span>
                    </a>
                    <a href="/dashboard/artikel" className="flex items-center space-x-3 hover:bg-green-700 px-3 py-2 rounded">
                        <Newspaper size={20} />
                        <span>Hasil Evaluasi</span>
                    </a>
                    <a href="/dashboard/laporan" className="flex items-center space-x-3 hover:bg-green-700 px-3 py-2 rounded">
                        <FileText size={20} />
                        <span>Pelatihan</span>
                    </a>
                </nav>
            </div>
            <div className="mt-8 px-3">
                <p className="text-sm mb-2">Hi, Penyuluh</p>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 w-full text-white py-2 rounded flex items-center justify-center space-x-2"
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
