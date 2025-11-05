// app/peternak/pelatihan/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, Users, BookOpen } from 'lucide-react';

const PelatihanPage = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-green-50"
                    >
                        <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                        <span>Kembali</span>
                    </button>
                    <div className="ml-6 border-l border-gray-200 pl-6">
                        <h1 className="text-2xl font-bold text-gray-800">Pelatihan & Edukasi</h1>
                        <p className="text-gray-500 text-sm mt-1">Platform pembelajaran untuk peternak</p>
                    </div>
                </div>
                
                {/* Coming Soon Section */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="relative bg-gradient-to-r bg-green-600 py-16 px-8 text-center">
                        <div className="relative z-10">
                            <div className="w-24 h-24 mx-auto mb-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <Clock size={48} className="text-black" />
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-4">Coming Soon</h2>
                            <p className="text-white text-xl mb-8 opacity-90">
                                Fitur pelatihan sedang dalam pengembangan
                            </p>
                            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
                                <p className="text-black text-sm">
                                    Kami sedang menyiapkan konten pelatihan yang berkualitas untuk membantu Anda
                                    mengembangkan usaha peternakan dengan lebih baik.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Features Preview */}
                    <div className="p-8">
                        <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">
                            Yang Akan Hadir
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-100">
                                <div className="w-12 h-12 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <BookOpen size={24} className="text-white" />
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-2">Materi Pelatihan</h4>
                                <p className="text-gray-600 text-sm">
                                    Video tutorial dan modul pembelajaran tentang berbagai aspek peternakan
                                </p>
                            </div>

                            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="w-12 h-12 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Users size={24} className="text-white" />
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-2">Kelas Online</h4>
                                <p className="text-gray-600 text-sm">
                                    Sesi interaktif dengan ahli peternakan dan sesi tanya jawab langsung
                                </p>
                            </div>

                            <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-100">
                                <div className="w-12 h-12 mx-auto mb-4 bg-purple-500 rounded-full flex items-center justify-center">
                                    <Calendar size={24} className="text-white" />
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-2">Jadwal Terstruktur</h4>
                                <p className="text-gray-600 text-sm">
                                    Program pembelajaran bertahap dengan jadwal yang fleksibel
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PelatihanPage;