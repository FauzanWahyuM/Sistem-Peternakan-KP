'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, Users, FileText, LogOut, BookOpen } from 'lucide-react';
import Image from 'next/image';

export default function SidebarPenyuluh() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        // localStorage.removeItem('token');
        // cookies().delete('authToken');
        router.push('/login');
    };

    const menuItems = [
        { href: '/dashboard/penyuluh', icon: Home, label: 'Dashboard' },
        { href: '/dashboard/penyuluh/data-kelompok', icon: Users, label: 'Data kelompok' },
        { href: '/dashboard/penyuluh/hasil-evaluasi', icon: FileText, label: 'Hasil evaluasi' },
        { href: '/dashboard/penyuluh/pelatihan', icon: BookOpen, label: 'Pelatihan' }
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard/penyuluh') {
            return pathname === '/dashboard/penyuluh';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="bg-green-600 text-white w-64 flex flex-col justify-between min-h-screen py-6 px-4">
            <div>
                <Image src="/img/Logo Sistem.png" alt="logo" width={200} height={200} className="mx-auto mb-5" />

                <nav className="space-y-4">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <a
                                key={index}
                                href={item.href}
                                className={`flex items-center gap-3 font-[Judson] text-xl transition-colors ${active
                                        ? 'text-black bg-gray-100 px-5 py-2 rounded-l-full -mr-4 -ml-2 shadow-sm'
                                        : 'text-black hover:bg-green-700 px-3 py-2 rounded'
                                    }`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </a>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-8 px-3">
                <div className="flex items-center gap-3 mb-6 ml-4">
                    <Image src="/Vector.svg" alt="Vector" width={40} height={40} />
                    <p className="font-[Judson] text-xl">Hi, Penyuluh</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-800 w-full text-white py-2 rounded flex items-center justify-center space-x-2"
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}