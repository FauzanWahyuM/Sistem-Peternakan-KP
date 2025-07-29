'use client';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CardSection from './components/CardSection';
import './dashboard.css'; 

export default function DashboardPage() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 bg-gray-100 p-6 ml-64">
                <Header />
                <CardSection />
            </main>
        </div>
    );
}
