import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { pelatihanStorage } from '../services/pelatihanStorage';

interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export default function DataValidator() {
    const [validation, setValidation] = useState<ValidationResult>({
        isValid: true,
        errors: [],
        warnings: []
    });

    useEffect(() => {
        validateData();
    }, []);

    const validateData = () => {
        const errors: string[] = [];
        const warnings: string[] = [];

        try {
            const pelatihan = pelatihanStorage.getAllPelatihan();

            // Validasi struktur data
            pelatihan.forEach((item, index) => {
                if (!item.id || typeof item.id !== 'number') {
                    errors.push(`Pelatihan #${index + 1}: ID tidak valid`);
                }

                if (!item.judul || item.judul.trim() === '') {
                    errors.push(`Pelatihan #${index + 1}: Judul kosong`);
                }

                if (!item.deskripsi || item.deskripsi.trim() === '') {
                    warnings.push(`Pelatihan #${index + 1}: Deskripsi kosong`);
                }

                if (!item.tanggal) {
                    errors.push(`Pelatihan #${index + 1}: Tanggal tidak valid`);
                } else {
                    const date = new Date(item.tanggal);
                    if (isNaN(date.getTime())) {
                        errors.push(`Pelatihan #${index + 1}: Format tanggal tidak valid`);
                    }
                }
            });

            // Cek duplicate ID
            const ids = pelatihan.map(p => p.id);
            const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
            if (duplicateIds.length > 0) {
                errors.push(`Ditemukan ID duplikat: ${duplicateIds.join(', ')}`);
            }

            setValidation({
                isValid: errors.length === 0,
                errors,
                warnings
            });

        } catch (error) {
            setValidation({
                isValid: false,
                errors: ['Error saat memvalidasi data: ' + error],
                warnings: []
            });
        }
    };

    if (validation.isValid && validation.warnings.length === 0) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center text-green-800">
                    <CheckCircle size={20} className="mr-2" />
                    <span className="font-medium">Data Valid</span>
                </div>
                <p className="text-green-700 text-sm mt-1">Semua data dalam kondisi baik</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {validation.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center text-red-800 mb-2">
                        <XCircle size={20} className="mr-2" />
                        <span className="font-medium">Errors ({validation.errors.length})</span>
                    </div>
                    <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                        {validation.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {validation.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center text-yellow-800 mb-2">
                        <AlertTriangle size={20} className="mr-2" />
                        <span className="font-medium">Warnings ({validation.warnings.length})</span>
                    </div>
                    <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                        {validation.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                        ))}
                    </ul>
                </div>
            )}

            <button
                onClick={validateData}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
                Validasi Ulang
            </button>
        </div>
    );
}