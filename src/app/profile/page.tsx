'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Save, Edit2, User, Shield, X, MapPin, Calendar, Cake, Phone, Home, Navigation } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../hooks/useAuth';

interface UserData {
    _id: string;
    nama: string;
    username: string;
    email: string;
    phoneNumber?: string;
    village?: string;
    district?: string;
    kelompok: string;
    role: string;
    status: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    profileImage?: string;
    tempatLahir?: string;
    tanggalLahir?: string | Date;
    umur?: number;
}

interface KelompokData {
    _id: string;
    nama: string;
}

const ProfilePage: React.FC = () => {
    const router = useRouter();
    const { user, token, loading: authLoading, logout } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        nama: '',
        email: '',
        kelompok: '',
        tempatLahir: '',
        tanggalLahir: '',
        phoneNumber: '',
        village: '',
        district: '',
    });
    const [profileImage, setProfileImage] = useState('/Vector.svg');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [kelompokList, setKelompokList] = useState<KelompokData[]>([]);
    const [kelompokLoading, setKelompokLoading] = useState(false);

    const loading = authLoading || dataLoading;

    // Fungsi untuk menghitung umur berdasarkan tanggal lahir
    const calculateAge = (birthDate: string): number => {
        if (!birthDate) return 0;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // Fungsi untuk mendapatkan URL gambar profil yang valid
    const getProfileImageUrl = (profileImage?: string) => {
        if (!profileImage) return '/Vector.svg';

        if (profileImage.startsWith('http') || profileImage.startsWith('/')) {
            return profileImage;
        }

        if (profileImage.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(profileImage)) {
            return '/Vector.svg';
        }

        return `/api/auth/profile/image/${profileImage}`;
    };

    // Fungsi untuk membersihkan cache
    const clearUserCache = useCallback(() => {
        localStorage.removeItem('userData');
        setUserData(null);
        setEditData({
            nama: '',
            email: '',
            kelompok: '',
            tempatLahir: '',
            tanggalLahir: '',
            phoneNumber: '',
            village: '',
            district: '',
        });
        setProfileImage('/Vector.svg');
    }, []);

    // Fungsi untuk menyimpan data ke cache
    const saveUserDataToCache = useCallback((data: UserData) => {
        localStorage.setItem('userData', JSON.stringify(data));
    }, []);

    // Fungsi untuk mengambil daftar kelompok dari API
    const fetchKelompokList = useCallback(async () => {
        try {
            setKelompokLoading(true);
            console.log('🔄 Fetching kelompok data dari:', '/api/kelompok');

            const response = await fetch('/api/kelompok', {
                credentials: 'include'
            });

            console.log('Response status kelompok:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Data kelompok dari API:', data);

                if (Array.isArray(data)) {
                    const formattedKelompok = data.map(item => ({
                        _id: item.id || item._id || item.kelompokid,
                        nama: item.nama
                    }));
                    setKelompokList(formattedKelompok);
                    console.log('Formatted kelompok data:', formattedKelompok);
                } else {
                    console.error('Data kelompok bukan array:', data);
                }
            } else {
                console.error('Gagal mengambil daftar kelompok, status:', response.status);
            }
        } catch (error) {
            console.error('Error mengambil daftar kelompok:', error);
        } finally {
            setKelompokLoading(false);
        }
    }, []);

    // ✅ PERBAIKI: Fetch user data dengan retry mechanism
    const fetchUserData = useCallback(async (retryCount = 0) => {
        try {
            setDataLoading(true);
            console.log('🔄 Fetching user data from MongoDB...');

            // Coba ambil data dari API
            const response = await fetch('/api/auth/me', {
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ User data from API:', data.user);

                if (data.user) {
                    const safeUserData: UserData = {
                        _id: data.user._id || '',
                        nama: data.user.nama || '',
                        username: data.user.username || '',
                        email: data.user.email || '',
                        kelompok: data.user.kelompok || '',
                        role: data.user.role || '',
                        status: data.user.status || 'Aktif',
                        createdAt: data.user.createdAt || new Date(),
                        updatedAt: data.user.updatedAt || new Date(),
                        phoneNumber: data.user.phoneNumber || '',
                        village: data.user.village || '',
                        district: data.user.district || '',
                        profileImage: data.user.profileImage,
                        tempatLahir: data.user.tempatLahir || '',
                        tanggalLahir: data.user.tanggalLahir || '',
                        umur: data.user.umur || 0
                    };

                    setUserData(safeUserData);
                    setEditData({
                        nama: safeUserData.nama,
                        email: safeUserData.email,
                        kelompok: safeUserData.kelompok,
                        tempatLahir: safeUserData.tempatLahir || '',
                        tanggalLahir: typeof safeUserData.tanggalLahir === 'string'
                            ? safeUserData.tanggalLahir
                            : safeUserData.tanggalLahir?.toISOString().split('T')[0] || '',
                        phoneNumber: safeUserData.phoneNumber || '',
                        village: safeUserData.village || '',
                        district: safeUserData.district || '',
                    });

                    if (safeUserData.profileImage) {
                        setProfileImage(getProfileImageUrl(safeUserData.profileImage));
                    }

                    saveUserDataToCache(safeUserData);
                    return true;
                }
            } else if (response.status === 401) {
                console.log('❌ 401 from /api/auth/me - User not authenticated');
                if (retryCount < 2) {
                    console.log(`🔄 Retrying fetch... attempt ${retryCount + 1}`);
                    // Tunggu sebentar sebelum retry
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return fetchUserData(retryCount + 1);
                }
                return false;
            }

            return false;

        } catch (error) {
            console.error('❌ Error fetching user data:', error);
            if (retryCount < 2) {
                console.log(`🔄 Retrying fetch due to error... attempt ${retryCount + 1}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchUserData(retryCount + 1);
            }
            return false;
        } finally {
            setDataLoading(false);
        }
    }, [saveUserDataToCache]);

    // ✅ PERBAIKI: Main data fetching effect - JANGAN langsung redirect
    useEffect(() => {
        const initializeData = async () => {
            if (!authLoading) {
                console.log('🔍 Initializing profile data...');

                // Coba fetch data dulu
                const success = await fetchUserData();

                if (!success) {
                    // Jika gagal fetch data, cek apakah ada user dari auth hook
                    if (user) {
                        console.log('⚠️ Using user data from auth hook as fallback');
                        const safeUserData: UserData = {
                            _id: user._id || '',
                            nama: user.nama || '',
                            username: user.username || '',
                            email: user.email || '',
                            kelompok: user.kelompok || '',
                            role: user.role || '',
                            status: user.status || 'Aktif',
                            createdAt: user.createdAt || new Date(),
                            updatedAt: user.updatedAt || new Date(),
                            phoneNumber: user.phoneNumber || '',
                            village: user.village || '',
                            district: user.district || '',
                            profileImage: user.profileImage,
                            tempatLahir: user.tempatLahir || '',
                            tanggalLahir: user.tanggalLahir || '',
                            umur: user.umur || 0
                        };

                        setUserData(safeUserData);
                        setEditData({
                            nama: safeUserData.nama,
                            email: safeUserData.email,
                            kelompok: safeUserData.kelompok,
                            tempatLahir: safeUserData.tempatLahir || '',
                            tanggalLahir: typeof safeUserData.tanggalLahir === 'string'
                                ? safeUserData.tanggalLahir
                                : safeUserData.tanggalLahir?.toISOString().split('T')[0] || '',
                            phoneNumber: safeUserData.phoneNumber || '',
                            village: safeUserData.village || '',
                            district: safeUserData.district || '',
                        });

                        if (safeUserData.profileImage) {
                            setProfileImage(getProfileImageUrl(safeUserData.profileImage));
                        }
                    } else {
                        // Hanya tampilkan warning, jangan langsung redirect
                        console.warn('⚠️ No user data available, but not redirecting immediately');
                        setModalMessage('Tidak dapat memuat data profil. Silakan refresh halaman atau login kembali.');
                        setShowModal(true);
                    }
                }

                // Fetch kelompok list terlepas dari status auth
                fetchKelompokList();
            }
        };

        initializeData();
    }, [authLoading, user, fetchUserData, fetchKelompokList]);

    // ✅ PERBAIKI: Handle save function - lebih toleran
    const handleSave = async () => {
        try {
            console.log('💾 Saving profile data...', editData);

            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(editData),
            });

            const result = await response.json();
            console.log('📡 Save response status:', response.status);
            console.log('📡 Save response data:', result);

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('❌ 401 Unauthorized');
                    setModalMessage('Sesi telah berakhir, silakan login kembali');
                    setShowModal(true);
                    // Jangan langsung logout, biarkan user memutuskan
                    return;
                }
                throw new Error(result.error || `Gagal menyimpan: ${response.status}`);
            }

            if (result.success && result.user) {
                const updatedUserData: UserData = {
                    _id: result.user._id || userData?._id || '',
                    nama: result.user.nama || '',
                    username: result.user.username || userData?.username || '',
                    email: result.user.email || '',
                    kelompok: result.user.kelompok || '',
                    role: result.user.role || userData?.role || '',
                    status: result.user.status || userData?.status || 'Aktif',
                    createdAt: result.user.createdAt || userData?.createdAt || new Date(),
                    updatedAt: result.user.updatedAt || new Date(),
                    phoneNumber: result.user.phoneNumber || '',
                    village: result.user.village || '',
                    district: result.user.district || '',
                    profileImage: result.user.profileImage,
                    tempatLahir: result.user.tempatLahir || '',
                    tanggalLahir: result.user.tanggalLahir || '',
                    umur: result.user.umur || 0
                };

                setUserData(updatedUserData);
                saveUserDataToCache(updatedUserData);

                setModalMessage('Profil berhasil diperbarui!');
                setShowModal(true);
                setIsEditing(false);

                // Refresh data
                setTimeout(() => {
                    fetchUserData();
                }, 500);
            } else {
                throw new Error(result.error || 'Gagal memperbarui profil');
            }

        } catch (error: any) {
            console.error('❌ Save error:', error);
            setModalMessage(error.message || 'Terjadi kesalahan saat menyimpan data');
            setShowModal(true);
        }
    };

    // Handle image upload
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setModalMessage('Ukuran gambar maksimal 2MB');
            setShowModal(true);
            return;
        }

        if (!file.type.startsWith('image/')) {
            setModalMessage('File harus berupa gambar');
            setShowModal(true);
            return;
        }

        setUploadingImage(true);

        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await fetch('/api/auth/profile/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            const result = await response.json();
            console.log('📡 Upload response:', result);

            if (!response.ok) {
                if (response.status === 401) {
                    setModalMessage('Sesi telah berakhir, silakan login kembali');
                    setShowModal(true);
                    return;
                }
                throw new Error(result.error || `Upload failed: ${response.status}`);
            }

            if (result.user && result.user.profileImage) {
                const imageUrl = getProfileImageUrl(result.user.profileImage);
                setProfileImage(imageUrl);

                if (userData) {
                    const updatedUserData: UserData = {
                        ...userData,
                        profileImage: result.user.profileImage
                    };
                    setUserData(updatedUserData);
                    saveUserDataToCache(updatedUserData);
                }

                setModalMessage('Foto profil berhasil diubah!');
                setShowModal(true);
            } else {
                throw new Error('Data user tidak ditemukan dalam response');
            }

        } catch (error: any) {
            console.error('❌ Upload error:', error);
            setModalMessage(error.message || 'Gagal mengupload gambar');
            setShowModal(true);
        } finally {
            setUploadingImage(false);
        }
    };

    // Close modal function
    const closeModal = () => {
        setShowModal(false);
        // Jika ada pesan session expired, redirect ke login
        if (modalMessage.includes('Sesi telah berakhir') || modalMessage.includes('login kembali')) {
            setTimeout(() => {
                logout();
                router.push('/login');
            }, 1000);
        }
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Aktif': return 'text-green-600 bg-green-100';
            case 'Nonaktif': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const isPeternak = userData?.role?.toLowerCase() === 'peternak';

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat profil...</p>
                </div>
            </div>
        );
    }

    // Jika tidak ada user data setelah loading selesai
    if (!userData && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Tidak dapat memuat data profil</p>
                    <div className="space-y-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="block w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Refresh Halaman
                        </button>
                        <button
                            onClick={() => {
                                clearUserCache();
                                logout();
                                router.push('/login');
                            }}
                            className="block w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Login Kembali
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-green-50"
                    >
                        <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                    </button>
                    <div className="ml-6 border-l border-gray-200 pl-6">
                        <h1 className="text-2xl font-bold text-gray-800">Profil Pengguna</h1>
                        <p className="text-gray-500 text-sm mt-1">Kelola informasi akun Anda</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Profile Header */}
                    <div className="h-40 bg-gradient-to-r from-green-500 to-green-700 relative">
                        <div className="absolute -bottom-16 left-8">
                            <div className="relative">
                                <Image
                                    src={profileImage}
                                    alt="Profile"
                                    width={128}
                                    height={128}
                                    className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        if (target.src !== '/Vector.svg') {
                                            target.src = '/Vector.svg';
                                        }
                                    }}
                                    priority
                                />
                                <label htmlFor="profile-upload" className="absolute bottom-2 right-2 bg-green-600 p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors shadow-lg">
                                    {uploadingImage ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <Camera size={16} className="text-white" />
                                    )}
                                    <input
                                        id="profile-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        disabled={uploadingImage}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="pt-20 px-8 pb-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{userData?.nama || 'Nama tidak tersedia'}</h2>
                                <p className="text-green-600 font-medium capitalize">{userData?.role || 'Role tidak tersedia'}</p>
                            </div>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Edit2 size={18} />
                                    Edit Profil
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                        disabled={uploadingImage}
                                    >
                                        <Save size={18} />
                                        Simpan
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Information */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <User size={20} />
                                    Informasi Pribadi
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Nama Lengkap</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.nama}
                                                onChange={(e) => setEditData({ ...editData, nama: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Masukkan nama lengkap"
                                            />
                                        ) : (
                                            <p className="text-gray-800">{userData?.nama || 'Tidak tersedia'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                                        <p className="text-gray-800">{userData?.username || 'Tidak tersedia'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={editData.email}
                                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Masukkan email"
                                            />
                                        ) : (
                                            <p className="text-gray-800">{userData?.email || 'Tidak tersedia'}</p>
                                        )}
                                    </div>

                                    {/* Phone Number Field */}
                                    <div>
                                        <label className="flex items-center gap-1 text-sm font-medium text-gray-600 mb-1">
                                            <Phone size={14} />
                                            Nomor HP
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={editData.phoneNumber}
                                                onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Contoh: 081234567890"
                                            />
                                        ) : (
                                            <p className="text-gray-800">{userData?.phoneNumber || 'Tidak tersedia'}</p>
                                        )}
                                    </div>

                                    {isPeternak && (
                                        <>
                                            <div>
                                                <label className="flex items-center gap-1 text-sm font-medium text-gray-600 mb-1">
                                                    <MapPin size={14} />
                                                    Tempat Lahir
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editData.tempatLahir}
                                                        onChange={(e) => setEditData({ ...editData, tempatLahir: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                        placeholder="Masukkan tempat lahir"
                                                    />
                                                ) : (
                                                    <p className="text-gray-800">{userData?.tempatLahir || 'Tidak tersedia'}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-1 text-sm font-medium text-gray-600 mb-1">
                                                    <Calendar size={14} />
                                                    Tanggal Lahir
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="date"
                                                        value={editData.tanggalLahir}
                                                        onChange={(e) => setEditData({ ...editData, tanggalLahir: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    />
                                                ) : (
                                                    <p className="text-gray-800">
                                                        {userData?.tanggalLahir
                                                            ? new Date(userData.tanggalLahir).toLocaleDateString('id-ID', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })
                                                            : 'Tidak tersedia'
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-1 text-sm font-medium text-gray-600 mb-1">
                                                    <Cake size={14} />
                                                    Umur
                                                </label>
                                                <p className="text-gray-800">
                                                    {userData?.umur ? `${userData.umur} tahun` : 'Tidak tersedia'}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Shield size={20} />
                                    Informasi Akun & Lokasi
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Kelompok</label>
                                        {isEditing ? (
                                            <select
                                                value={editData.kelompok}
                                                onChange={(e) => setEditData({ ...editData, kelompok: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                disabled={kelompokLoading}
                                            >
                                                <option value="">Pilih Kelompok</option>
                                                {kelompokList.map((kelompok) => (
                                                    <option key={kelompok._id} value={kelompok._id}>
                                                        {kelompok.nama}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <p className="text-gray-800">
                                                {kelompokList.find(k => k._id === userData?.kelompok)?.nama || userData?.kelompok || 'Tidak tersedia'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Village Field */}
                                    <div>
                                        <label className="flex items-center gap-1 text-sm font-medium text-gray-600 mb-1">
                                            <Home size={14} />
                                            Desa
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.village}
                                                onChange={(e) => setEditData({ ...editData, village: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Masukkan nama desa"
                                            />
                                        ) : (
                                            <p className="text-gray-800">{userData?.village || 'Tidak tersedia'}</p>
                                        )}
                                    </div>

                                    {/* District Field */}
                                    <div>
                                        <label className="flex items-center gap-1 text-sm font-medium text-gray-600 mb-1">
                                            <Navigation size={14} />
                                            Kecamatan
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.district}
                                                onChange={(e) => setEditData({ ...editData, district: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Masukkan nama kecamatan"
                                            />
                                        ) : (
                                            <p className="text-gray-800">{userData?.district || 'Tidak tersedia'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                                        <p className="text-gray-800 capitalize">{userData?.role || 'Tidak tersedia'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(userData?.status || '')}`}>
                                            {userData?.status || 'Tidak tersedia'}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Bergabung Sejak</label>
                                        <p className="text-gray-800">
                                            {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'Tidak tersedia'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal untuk notifikasi */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Notifikasi</h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="mb-6 text-gray-700">{modalMessage}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;