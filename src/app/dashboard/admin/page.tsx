'use client';

import Sidebar from './components/UnifiedSidebar';
import Header from './components/Header';
import CardSection from './components/CardSection';
import { useState, useEffect } from 'react';
import './dashboard.css';

export default function DashboardPage() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Deteksi ukuran layar
    useEffect(() => {
        const checkIfMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    return (
        <div className="flex">
            {/* Sidebar tetap di kiri */}
            <aside className={`fixed h-screen bg-green-700 text-white z-50 transition-all duration-300 ${isSidebarCollapsed ? 'w-10' : 'w-64'}`}>
                <Sidebar
                    userType="admin"
                    isCollapsed={isSidebarCollapsed}
                    onCollapseChange={setIsSidebarCollapsed}
                />
            </aside>

            {/* Konten utama bergeser ke kanan */}
            <main className={`w-full p-6 bg-gray-100 min-h-screen transition-all duration-300 ${isSidebarCollapsed && !isMobile ? 'ml-20' : 'ml-64'}`}>
                <Header />
                <CardSection />
            </main>
        </div>
    );
}