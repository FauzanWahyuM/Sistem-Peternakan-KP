'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, Users, FileText, LogOut, BookOpen } from 'lucide-react';

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        // Kalau ada proses logout lainnya, letakkan di sini, contoh:
        // localStorage.removeItem('token');
        // cookies().delete('authToken'); // kalau pakai cookies
        router.push('/login');
    };

    const menuItems = [
        { href: '/dashboard/penyuluh', icon: Home, label: 'Dashboard' },
        { href: '/dashboard/penyuluh/data-kelompok', icon: Users, label: 'Data kelompok' },
        { href: '/dashboard/penyuluh/hasil-evaluasi', icon: FileText, label: 'Hasil evaluasi' },
        { href: '/dashboard/penyuluh/pelatihan', icon: BookOpen, label: 'Pelatihan' }
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="bg-green-600 text-white w-64 flex flex-col min-h-screen">
            {/* Logo Section */}
            <div className="py-6">
                <div className="flex items-center justify-center">
                    <div className="w-48 h-48"> {/* Ubah ukuran di sini */}
                        <img
                            src="/img/Logo Sistem.png"
                            alt="logo"
                            className="w-48 h-48 object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4">
                <ul className="space-y-2">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <li key={index}>
                                <a
                                    href={item.href}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active
                                        ? 'bg-green-700 text-white'
                                        : 'text-green-100 hover:bg-green-700 hover:text-white'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-green-500">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-green-800 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">P</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Hai,</p>
                        <p className="text-sm text-green-100">Penyuluh</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                    <LogOut size={16} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}