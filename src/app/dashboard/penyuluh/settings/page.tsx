'use client';

import Sidebar from '../components/Sidebar';
import StorageManager from '../components/StorageManager';
import { useState } from 'react';

export default function SettingsPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleDataChange = () => {
        // Trigger refresh untuk komponen lain yang mungkin menggunakan data
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Pengaturan</h1>
                    <p className="text-gray-600 mt-2">Kelola data dan pengaturan aplikasi</p>
                </div>

                {/* Storage Manager */}
                <StorageManager key={refreshKey} onDataChange={handleDataChange} />
            </main>
        </div>
    );
}
