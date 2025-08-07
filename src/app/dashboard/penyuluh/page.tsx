'use client';

import Sidebar from './components/UnifiedSidebar';
import Header from './components/Header';
import CardSection from './components/CardSection';
import './dashboard.css';

export default function DashboardPage() {
    return (
        <div className="flex min-h-screen">
            <Sidebar userType="penyuluh" />
            <main className="flex-1 bg-gray-100 p-6">
                <Header />
                <CardSection />
            </main>
        </div>
    );
}
