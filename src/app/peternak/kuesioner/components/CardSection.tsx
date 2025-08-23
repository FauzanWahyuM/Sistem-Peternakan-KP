'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CardSection() {
    const router = useRouter();
    const [status, setStatus] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const userId = "123"; // TODO: ganti dengan user login sebenarnya

                // Cek April
                const aprilRes = await fetch(`/api/kuesioner?questionnaireId=april&userId=${userId}`);
                const aprilData = aprilRes.ok ? await aprilRes.json() : null;

                // Cek Mei
                const meiRes = await fetch(`/api/kuesioner?questionnaireId=mei&userId=${userId}`);
                const meiData = meiRes.ok ? await meiRes.json() : null;

                setStatus({
                    april: !!aprilData, // true jika ada jawaban
                    mei: !!meiData,
                });
            } catch (err) {
                console.error("Gagal ambil status kuesioner:", err);
                setStatus({ april: false, mei: false });
            }
        };

        fetchStatus();
    }, []);

    const handleViewForm = (id: string) => {
        router.push(`/peternak/kuesioner/lihatform?id=${id}`);
    };

    const handleFillForm = (id: string) => {
        router.push(`/peternak/kuesioner/isiform?id=${id}`);
    };

    return (
        <div className="w-full px-4 py-6">
            <div className="space-y-4">
                {/* Card April */}
                <div className="bg-white w-full shadow-lg rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gray-200">
                    <div className="flex-1">
                        <h3 className="text-2xl font-[Judson] font-bold text-gray-800">Kuesioner Bulan April</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-4">
                            {status.april ? (
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                    Sudah Diisi
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                                    Belum Diisi
                                </span>
                            )}
                            <p className="text-gray-600">
                                <span className="font-medium">Tanggal:</span> 15 April 2024
                            </p>
                        </div>
                    </div>

                    {status.april ? (
                        <button
                            onClick={() => handleViewForm('april')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-[Judson] font-semibold shadow-md bg-[#60c67a] hover:bg-[#4fae65] transition-colors duration-300"
                        >
                            <Image src="/edit.svg" alt="edit" width={20} height={20} />
                            <span>Lihat Form</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => handleFillForm('april')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-[Judson] font-semibold shadow-md bg-[#60c67a] hover:bg-[#4fae65] transition-colors duration-300"
                        >
                            <Image src="/edit.svg" alt="edit" width={20} height={20} />
                            <span>Isi Form</span>
                        </button>
                    )}
                </div>

                {/* Card Mei */}
                <div className="bg-white w-full shadow-lg rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gray-200">
                    <div className="flex-1">
                        <h3 className="text-2xl font-[Judson] font-bold text-gray-800">Kuesioner Bulan Mei</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-4">
                            {status.mei ? (
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                    Sudah Diisi
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                                    Belum Diisi
                                </span>
                            )}
                            <p className="text-gray-600">
                                <span className="font-medium">Tanggal:</span> 20 Mei 2024
                            </p>
                        </div>
                    </div>

                    {status.mei ? (
                        <button
                            onClick={() => handleViewForm('mei')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-[Judson] font-semibold shadow-md bg-[#60c67a] hover:bg-[#4fae65] transition-colors duration-300"
                        >
                            <Image src="/edit.svg" alt="edit" width={20} height={20} />
                            <span>Lihat Form</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => handleFillForm('mei')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-[Judson] font-semibold shadow-md bg-[#60c67a] hover:bg-[#4fae65] transition-colors duration-300"
                        >
                            <Image src="/edit.svg" alt="edit" width={20} height={20} />
                            <span>Isi Form</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
