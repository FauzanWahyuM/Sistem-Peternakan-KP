'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Shield, MapPin, Calendar, Cake } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../../hooks/useAuth';

interface UserData {
    _id: string;
    nama: string;
    username: string;
    email: string;
    kelompok: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    profileImage?: string;
    tempatLahir?: string;
    tanggalLahir?: string;
    umur?: number;
    isHardcode?: boolean;
}

interface KelompokData {
    _id: string;
    nama: string;
}

const ProfilePage: React.FC = () => {
    const router = useRouter();
    const { user, token, loading: authLoading, logout } = useAuth();
    const userId = user?._id;
    const [userData, setUserData] = useState<UserData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [profileImage, setProfileImage] = useState('/Vector.svg');
    const [kelompokList, setKelompokList] = useState<KelompokData[]>([]);

    const loading = authLoading || (dataLoading && !userData);

    // Fungsi untuk menghitung umur berdasarkan tanggal lahir
    const calculateAge = (birthDate: string): number => {
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
        setProfileImage('/Vector.svg');
    }, []);

    // Fungsi untuk menyimpan data ke cache
    const saveUserDataToCache = useCallback((data: UserData) => {
        localStorage.setItem('userData', JSON.stringify(data));
    }, []);

    // Event listener untuk perubahan auth state
    useEffect(() => {
        const handleAuthChange = () => {
            if (!userId) {
                // User logout, bersihkan cache
                clearUserCache();
            }
        };

        window.addEventListener('authStateChanged', handleAuthChange);

        return () => {
            window.removeEventListener('authStateChanged', handleAuthChange);
        };
    }, [userId, clearUserCache]);

    // Fungsi untuk mengambil daftar kelompok dari API
    const fetchKelompokList = useCallback(async () => {
        if (!token) {
            console.log('Token tidak tersedia, skip fetching kelompok');
            return;
        }

        try {
            console.log('🔄 Fetching kelompok data dari:', '/api/kelompok');

            const response = await fetch('/api/kelompok', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
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
                }
            }
        } catch (error) {
            console.error('Error mengambil daftar kelompok:', error);
        }
    }, [token]);

    // Fetch user data - dengan handle admin hardcode
    const fetchUserData = useCallback(async () => {
        try {
            setDataLoading(true);
            console.log('🔄 Fetching user data...');

            // Cek jika ini admin hardcode
            const isHardcodeAdmin = sessionStorage.getItem('isHardcodeAdmin');
            if (isHardcodeAdmin === 'true') {
                console.log('🔐 Using hardcode admin data');
                const hardcodeAdminData = {
                    _id: 'admin-hardcode-id',
                    nama: 'Administrator System',
                    username: 'admin',
                    email: 'admin@sistem-peternakan.com',
                    kelompok: 'Administrator',
                    role: 'admin',
                    status: 'Aktif',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isHardcode: true
                };

                setUserData(hardcodeAdminData);
                setProfileImage('/Vector.svg');
                setDataLoading(false);
                return;
            }

            // Cek jika user tidak login, bersihkan cache
            if (!userId) {
                console.warn('⚠️ User ID belum tersedia dari useAuth, tetap lanjut ambil data dari API');
            }

            // 1. Coba ambil dari localStorage dulu
            const savedUserData = localStorage.getItem('userData');
            if (savedUserData) {
                try {
                    const cachedUserData = JSON.parse(savedUserData);
                    if (cachedUserData._id === userId) {
                        console.log('📦 Using cached user data');
                        setUserData(cachedUserData);
                        if (cachedUserData.profileImage) {
                            setProfileImage(getProfileImageUrl(cachedUserData.profileImage));
                        }
                        setDataLoading(false);
                        return;
                    }
                } catch (cacheError) {
                    console.error('Error parsing cached data:', cacheError);
                    localStorage.removeItem('userData');
                }
            }

            // 2. Jika tidak ada cached data yang valid, ambil dari API
            console.log('🌐 Fetching from API...');
            const response = await fetch('/api/auth/me', {
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            console.log('API auth/me response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ API response received');

                if (data.user) {
                    setUserData(data.user);
                    if (data.user.profileImage) {
                        setProfileImage(getProfileImageUrl(data.user.profileImage));
                    }

                    if (userId) {
                        saveUserDataToCache(data.user);
                    }

                    window.dispatchEvent(new Event('userDataUpdated'));
                    setDataLoading(false);
                    return;
                } else {
                    console.error('❌ No user data in response');
                }
            } else {
                console.error('❌ API failed, status:', response.status);
            }

        } catch (error) {
            console.error('❌ Error mengambil data user:', error);
        } finally {
            setDataLoading(false);
        }
    }, [userId, saveUserDataToCache]);

    useEffect(() => {
        console.log("Auth state:", { authLoading, userId, token });
        if (!authLoading && userId && token) {
            console.log("🔎 userId:", userId, "token:", token);
            fetchUserData();
            fetchKelompokList();
        }
    }, [authLoading, userId, token, fetchUserData, fetchKelompokList]);

    useEffect(() => {
        if (userData && dataLoading) {
            console.log("✅ User data sudah ada, hentikan loading");
            setDataLoading(false);
        }
    }, [userData, dataLoading]);

    // Timeout untuk mencegah infinite loading
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (loading) {
                console.log('Loading timeout triggered');
                setDataLoading(false);
            }
        }, 10000);

        return () => clearTimeout(timeout);
    }, [loading]);

    useEffect(() => {
        if (!userId) {
            (async () => {
                try {
                    console.log("🔄 Attempting to sync auth...");
                    const response = await fetch('/api/auth/sync');
                    if (response.ok) {
                        const data = await response.json();
                        if (data?.userId && data?.token) {
                            sessionStorage.setItem('userId', data.userId);
                            sessionStorage.setItem('token', data.token);
                            console.log("✅ Auth sync success:", data);
                            fetchUserData();
                            fetchKelompokList();
                        } else {
                            console.warn("❌ Sync gagal: data tidak lengkap");
                            router.push('/login');
                        }
                    } else {
                        console.warn("❌ Sync response:", response.status);
                        router.push('/login');
                    }
                } catch (error) {
                    console.error('Failed to sync auth data:', error);
                    router.push('/login');
                }
            })();
        }
    }, [userId, router, fetchUserData, fetchKelompokList]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat profil...</p>
                    <p className="text-sm text-gray-500 mt-2">Jika loading terlalu lama, silakan refresh halaman</p>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Aktif': return 'text-green-600 bg-green-100';
            case 'Nonaktif': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const isPeternak = userData?.role?.toLowerCase() === 'peternak';

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header minimalis */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-green-50"
                    >
                        <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                    </button>
                    <div className="ml-6 border-l border-gray-200 pl-6">
                        <h1 className="text-2xl font-bold text-gray-800">Profil Pengguna</h1>
                        <p className="text-gray-500 text-sm mt-1">Lihat informasi akun Anda</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Profile Header with Cover Photo */}
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
                                {/* Badge untuk admin hardcode */}
                                {userData?.isHardcode && (
                                    <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        SYSTEM
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="pt-20 px-8 pb-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{userData?.nama || 'Nama tidak tersedia'}</h2>
                                <p className="text-green-600 font-medium capitalize">{userData?.role || 'Role tidak tersedia'}</p>
                                {userData?.isHardcode && (
                                    <p className="text-yellow-600 text-sm mt-1">Hardcode Administrator</p>
                                )}
                            </div>
                            <div className="text-sm text-gray-500">
                                Data profil hanya dapat dilihat
                            </div>
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
                                        <p className="text-gray-800 font-medium">{userData?.nama || 'Tidak tersedia'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                                        <p className="text-gray-800 font-medium">{userData?.username || 'Tidak tersedia'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                        <p className="text-gray-800 font-medium">{userData?.email || 'Tidak tersedia'}</p>
                                    </div>

                                    {isPeternak && (
                                        <div>
                                            <label className="flex items-center gap-1 text-sm font-medium text-gray-600 mb-1">
                                                <MapPin size={14} />
                                                Tempat Lahir
                                            </label>
                                            <p className="text-gray-800 font-medium">{userData?.tempatLahir || 'Tidak tersedia'}</p>
                                        </div>
                                    )}

                                    {isPeternak && (
                                        <div>
                                            <label className="flex items-center gap-1 text-sm font-medium text-gray-600 mb-1">
                                                <Calendar size={14} />
                                                Tanggal Lahir
                                            </label>
                                            <p className="text-gray-800 font-medium">
                                                {userData?.tanggalLahir
                                                    ? new Date(userData.tanggalLahir).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : 'Tidak tersedia'
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {isPeternak && (
                                        <div>
                                            <label className="flex items-center gap-1 text-sm font-medium text-gray-600 mb-1">
                                                <Cake size={14} />
                                                Umur
                                            </label>
                                            <p className="text-gray-800 font-medium">
                                                {userData?.tanggalLahir
                                                    ? `${calculateAge(userData.tanggalLahir)} tahun`
                                                    : 'Tidak tersedia'
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Shield size={20} />
                                    Informasi Akun
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Kelompok</label>
                                        <p className="text-gray-800 font-medium">
                                            {kelompokList.find(k => k._id === userData?.kelompok)?.nama || userData?.kelompok || 'Tidak tersedia'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                                        <p className="text-gray-800 font-medium capitalize">{userData?.role || 'Tidak tersedia'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(userData?.status || '')}`}>
                                            {userData?.status || 'Tidak tersedia'}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Bergabung Sejak</label>
                                        <p className="text-gray-800 font-medium">
                                            {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'Tidak tersedia'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Terakhir Diupdate</label>
                                        <p className="text-gray-800 font-medium">
                                            {userData?.updatedAt ? new Date(userData.updatedAt).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'Tidak tersedia'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Security Note */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start">
                                <Shield size={18} className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-blue-800 text-sm font-medium">
                                        Keamanan Profil
                                    </p>
                                    <p className="text-blue-600 text-xs mt-1">
                                        Profil ini dikunci dan tidak dapat diubah untuk menjaga keamanan data sistem.
                                        Hubungi administrator jika diperlukan perubahan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;