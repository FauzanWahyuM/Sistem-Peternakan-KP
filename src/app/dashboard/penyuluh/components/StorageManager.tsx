import React, { useState, useRef } from 'react';
import { Download, Upload, Trash2, Info, RefreshCw } from 'lucide-react';
import { StorageUtils } from '../utils/storageUtils';
import { pelatihanStorage } from '../services/pelatihanStorage';

interface StorageManagerProps {
    onDataChange?: () => void;
}

export default function StorageManager({ onDataChange }: StorageManagerProps) {
    const [storageInfo, setStorageInfo] = useState({
        size: StorageUtils.getStorageSize(),
        keys: StorageUtils.getAllKeys(),
        isAvailable: StorageUtils.isLocalStorageAvailable()
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshStorageInfo = () => {
        setStorageInfo({
            size: StorageUtils.getStorageSize(),
            keys: StorageUtils.getAllKeys(),
            isAvailable: StorageUtils.isLocalStorageAvailable()
        });
    };

    const handleExportPelatihan = () => {
        const data = pelatihanStorage.exportData();
        const timestamp = new Date().toISOString().split('T')[0];
        StorageUtils.downloadFile(data, `pelatihan_backup_${timestamp}.json`);
    };

    const handleExportAll = () => {
        const data = StorageUtils.exportAllData();
        const timestamp = new Date().toISOString().split('T')[0];
        StorageUtils.downloadFile(data, `localStorage_backup_${timestamp}.json`);
    };

    const handleImportPelatihan = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const success = pelatihanStorage.importData(content);
                if (success) {
                    alert('Data pelatihan berhasil diimport!');
                    refreshStorageInfo();
                    onDataChange?.();
                } else {
                    alert('Gagal mengimport data. Format file tidak valid.');
                }
            } catch (error) {
                alert('Error membaca file: ' + error);
            }
        };
        reader.readAsText(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClearPelatihan = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus semua data pelatihan? Tindakan ini tidak dapat dibatalkan.')) {
            pelatihanStorage.clearAllData();
            alert('Semua data pelatihan telah dihapus!');
            refreshStorageInfo();
            onDataChange?.();
        }
    };

    const handleClearAll = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus SEMUA data localStorage? Tindakan ini tidak dapat dibatalkan.')) {
            StorageUtils.clearAllData();
            alert('Semua data localStorage telah dihapus!');
            refreshStorageInfo();
            onDataChange?.();
        }
    };

    if (!storageInfo.isAvailable) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center text-red-800">
                    <Info size={20} className="mr-2" />
                    <span>localStorage tidak tersedia di browser ini.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Storage Manager</h3>
                <button
                    onClick={refreshStorageInfo}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    <RefreshCw size={16} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Storage Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Storage Usage</h4>
                    <p className="text-2xl font-bold text-blue-600">{storageInfo.size} KB</p>
                    <p className="text-sm text-blue-600">{storageInfo.keys.length} keys stored</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Pelatihan Data</h4>
                    <p className="text-2xl font-bold text-green-600">
                        {pelatihanStorage.getAllPelatihan().length}
                    </p>
                    <p className="text-sm text-green-600">total pelatihan</p>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
                {/* Pelatihan Data Management */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Data Pelatihan</h4>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleExportPelatihan}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Download size={16} />
                            <span>Export Pelatihan</span>
                        </button>

                        <label className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer">
                            <Upload size={16} />
                            <span>Import Pelatihan</span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleImportPelatihan}
                                className="hidden"
                            />
                        </label>

                        <button
                            onClick={handleClearPelatihan}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            <Trash2 size={16} />
                            <span>Clear Pelatihan</span>
                        </button>
                    </div>
                </div>

                {/* All Data Management */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Semua Data localStorage</h4>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleExportAll}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Download size={16} />
                            <span>Export All</span>
                        </button>

                        <button
                            onClick={handleClearAll}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            <Trash2 size={16} />
                            <span>Clear All</span>
                        </button>
                    </div>
                </div>

                {/* Storage Keys List */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">localStorage Keys ({storageInfo.keys.length})</h4>
                    <div className="max-h-32 overflow-y-auto">
                        {storageInfo.keys.length === 0 ? (
                            <p className="text-gray-500 text-sm">Tidak ada data tersimpan</p>
                        ) : (
                            <div className="space-y-1">
                                {storageInfo.keys.map((key, index) => (
                                    <div key={index} className="text-sm bg-gray-50 px-2 py-1 rounded">
                                        {key}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}