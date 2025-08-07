'use client';

import Sidebar from './components/UnifiedSidebar';
import Header from './components/Header';
import CardSection from './components/CardSection';
import './dashboard.css';

export default function DashboardPage() {
    return (
        <div className="flex">
            {/* Sidebar tetap di kiri */}
            <aside className="fixed w-56 h-screen bg-green-700 text-white z-50">
                <Sidebar userType="peternak" />
            </aside>

            {/* Konten utama bergeser ke kanan */}
            <main className="ml-65 w-full p-6 bg-gray-100 min-h-screen">
                <Header />
                <CardSection />
            </main>
        </div>
    );
}
