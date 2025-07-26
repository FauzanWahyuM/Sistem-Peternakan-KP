'use client';

import { useRouter } from 'next/navigation';
import { Home, Users, FileText, LogOut, Newspaper, Group } from 'lucide-react';
import Image from 'next/image';

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
                <Image src="/img/Logo Sistem.png" alt="group" width={200} height={200} className='items-center ml-15' />
                <nav className="space-y-4">
                    <a href="/dashboard/peternak" className="flex text-black font-[Judson] text-xl items-center space-x-3 hover:bg-green-700 px-3 py-2 rounded">
                        <Image src="/group.svg" alt="group" width={20} height={20} />
                        <span>Dashboard</span>
                    </a>
                    <a href="/dashboard/peternak/kuesioner" className="flex text-black font-[Judson] text-xl items-center space-x-3 hover:bg-green-700 px-3 py-2 rounded">
                        <Image src="/task-square.svg" alt="group" width={20} height={20} />
                        <span>Kuesioner</span>
                    </a>
                    <a href="/dashboard/peternak/ternak" className="flex text-black font-[Judson] text-xl items-center space-x-3 hover:bg-green-700 px-3 py-2 rounded">
                        <Image src="/folder-2.svg" alt="group" width={20} height={20} />
                        <span>Data Ternak</span>
                    </a>
                    <a href="/dashboard/peternak/pelatihan" className="flex items-center gap-3 font-[Judson] text-xl text-black bg-gray-100 px-5 py-2 rounded-l-full -mr-4 -ml-2 shadow-sm">
                        <Image src="/book.svg" alt="group" width={20} height={20} />
                        <span>Pelatihan</span>
                    </a>
                    <a href="/dashboard/peternak/hasil" className="flex text-black font-[Judson] text-xl items-center space-x-3 hover:bg-green-700 px-3 py-2 rounded">
                        <Image src="/clipboard-text.svg" alt="group" width={20} height={20} />
                        <span>Hasil Evaluasi</span>
                    </a>
                </nav>
            </div>
            <div className="mt-8 px-3">
                <div className="flex items-center gap-3 mb-6 ml-4">
                    <Image src="/Vector.svg" alt="Vector" width={40} height={40} />
                    <p className="font-[Judson] text-xl">Hi, Peternak</p>
                </div>
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
