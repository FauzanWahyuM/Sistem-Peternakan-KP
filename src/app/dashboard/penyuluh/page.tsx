'use client';

import { Home, Users, FileText, BookOpen } from 'lucide-react';
import Sidebar from "./components/Sidebar";
import Header from './components/Header';
import CardSection from './components/CardSection';
import './dashboard.css';

export default function DashboardPage() {
    // Daftar menu untuk Sidebar penyuluh
    const menuItems = [
        { href: '/dashboard/penyuluh', icon: Home, label: 'Dashboard' },
        { href: '/dashboard/penyuluh/data-kelompok', icon: Users, label: 'Data kelompok' },
        { href: '/dashboard/penyuluh/hasil-evaluasi', icon: FileText, label: 'Hasil evaluasi' },
        { href: '/dashboard/penyuluh/pelatihan', icon: BookOpen, label: 'Pelatihan' }
    ];

    return (
        <div className="flex min-h-screen">
            <Sidebar/>
            <main className="flex-1 bg-gray-100 p-6">
                <Header />
                <CardSection />
            </main>
        </div>
    );
}
