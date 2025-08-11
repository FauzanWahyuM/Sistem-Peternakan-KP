'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Kuesioner() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // In a real implementation, you would get the actual user ID from session/context
        const userId = 'user-id-placeholder'; // This should be replaced with actual user ID
        
        const loadData = async () => {
            try {
                setLoading(true);
                
                // Fetch questionnaires
                const questionnaireResponse = await fetch(`/api/questionnaires?userId=${userId}`);
                let questionnaireData = { questionnaires: [] };
                
                if (questionnaireResponse.ok) {
                    questionnaireData = await questionnaireResponse.json();
                }
                
                // Fetch user responses
                const responseResponse = await fetch(`/api/questionnaire-responses?userId=${userId}`);
                let responseData = { responses: [] };
                
                if (responseResponse.ok) {
                    responseData = await responseResponse.json();
                }
                
                // Create a set of questionnaire IDs that have been filled
                const filledQuestionnaireIds = new Set(
                    responseData.responses ? responseData.responses.map(response => response.questionnaireId) : []
                );
                
                // Map questionnaire data to the format expected by the component
                const statusData = (questionnaireData.questionnaires || []).map((item, idx) => {
                    const isFilled = filledQuestionnaireIds.has(item._id);
                    return {
                        id: item._id,
                        bulan: item.judul || `Kuesioner ${idx + 1}`,
                        tanggal: new Date(item.createdAt).toLocaleDateString('id-ID'),
                        filled: isFilled,
                        status: isFilled ? 'Sudah Diisi' : 'Belum Diisi',
                    };
                });
                
                setData(statusData);
                setError(null);
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Gagal memuat data kuesioner');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleButtonClick = (item) => {
        if (item.filled) {
            router.push(`/peternak/kuesioner/lihatform?id=${item.id}`);
        } else {
            router.push(`/peternak/kuesioner/isiform?id=${item.id}`);
        }
    };

    if (loading) {
        return (
            <div className="w-full px-4 py-6">
                <div className="flex justify-center items-center h-64">
                    <p className="text-lg font-[Judson]">Memuat data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full px-4 py-6">
                <div className="flex justify-center items-center h-64">
                    <p className="text-lg font-[Judson] text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-4 py-6">
            <div className="space-y-4">
                {data.length > 0 ? (
                    data.map((item, idx) => (
                        <div
                            key={item.id || idx}
                            className="bg-white w-full shadow-md border rounded-md p-6 flex justify-between items-center"
                        >
                            <div>
                                <h3 className="text-3xl font-semibold">{item.bulan}</h3>
                                <p className="text-xl mt-1">Status : {item.status}</p>
                                <p className="text-xl">Tanggal : {item.tanggal}</p>
                            </div>

                            <button
                                onClick={() => handleButtonClick(item)}
                                className="flex items-center gap-2 px-4 py-2 rounded-md text-white font-semibold shadow-md bg-green-500 hover:bg-green-600"
                            >
                                <Image src="/edit.svg" alt="edit" width={25} height={25} />
                                {item.filled ? 'Lihat Form' : 'Isi Form'}
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="bg-white w-full shadow-md border rounded-md p-6 flex justify-center items-center h-64">
                        <p className="text-2xl font-[Judson] text-gray-500">Tidak ada kuesioner</p>
                    </div>
                )}
            </div>
        </div>
    );
}
