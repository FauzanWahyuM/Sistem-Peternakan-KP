'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Save, Edit2, User, Shield, X, MapPin, Calendar, Cake } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../hooks/useAuth';

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
}

// Tambahkan interface untuk data kelompok
interface KelompokData {
    _id: string;
    nama: string;
    // tambahkan field lain jika diperlukan
}

const ProfilePage: React.FC = () => {
    const router = useRouter();
    const { userId, token, loading: authLoading } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        nama: '',
        email: '',
        kelompok: '',
        tempatLahir: '',
        tanggalLahir: '',
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

        // Jika sudah URL lengkap atau path default
        if (profileImage.startsWith('http') || profileImage.startsWith('/')) {
            return profileImage;
        }

        // Validasi bahwa profileImage adalah ObjectId yang valid
        if (profileImage.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(profileImage)) {
            return '/Vector.svg';
        }

        // Gunakan endpoint API untuk mengambil gambar dari GridFS
        return `/api/auth/profile/image/${profileImage}`;
    };

    // Fungsi untuk mengambil daftar kelompok dari API
    const fetchKelompokList = useCallback(async () => {
        if (!token) return;

        try {
            setKelompokLoading(true);
            const response = await fetch('/api/kelompok', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setKelompokList(data.kelompok || []);
            } else {
                console.error('Gagal mengambil daftar kelompok');
            }
        } catch (error) {
            console.error('Error mengambil daftar kelompok:', error);
        } finally {
            setKelompokLoading(false);
        }
    }, [token]);

    const fetchUserData = useCallback(async () => {
        try {
            setDataLoading(true);

            console.log('🔄 Fetching user data...');

            // 1. Coba ambil dari localStorage dulu
            const savedUserData = localStorage.getItem('userData');
            if (savedUserData) {
                const userData = JSON.parse(savedUserData);
                console.log('📦 Using cached user data:', userData);
                setUserData(userData);
                setEditData({
                    nama: userData.nama || '',
                    email: userData.email || '',
                    kelompok: userData.kelompok || '',
                    tempatLahir: userData.tempatLahir || '',
                    tanggalLahir: userData.tanggalLahir || '',
                });
                if (userData.profileImage) {
                    setProfileImage(getProfileImageUrl(userData.profileImage));
                }
                setDataLoading(false);
                return;
            }

            // 2. Jika tidak ada cached data, coba ambil dari API
            console.log('🌐 Fetching from API...');
            const response = await fetch('/api/auth/me', {
                credentials: 'include' // Penting untuk mengirim cookie session
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ API response:', data);

                if (data.user) {
                    setUserData(data.user);
                    setEditData({
                        nama: data.user.nama || '',
                        email: data.user.email || '',
                        kelompok: data.user.kelompok || '',
                        tempatLahir: data.user.tempatLahir || '',
                        tanggalLahir: data.user.tanggalLahir || '',
                    });
                    if (data.user.profileImage) {
                        setProfileImage(getProfileImageUrl(data.user.profileImage));
                    }
                    localStorage.setItem('userData', JSON.stringify(data.user));

                    // Dispatch event untuk memberi tahu komponen lain tentang pembaruan data
                    window.dispatchEvent(new Event('userDataUpdated'));
                } else {
                    console.error('❌ No user data in response');
                    setModalMessage('Data pengguna tidak ditemukan dalam respons');
                    setShowModal(true);
                }
            } else {
                console.error('❌ API failed, status:', response.status);
                const errorData = await response.json().catch(() => ({}));
                console.error('Error details:', errorData);
                setModalMessage('Gagal memuat data profil. Silakan login kembali.');
                setShowModal(true);
            }

        } catch (error) {
            console.error('❌ Error mengambil data user:', error);
            setModalMessage('Gagal memuat data profil');
            setShowModal(true);
        } finally {
            setDataLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading) {
            fetchUserData();
            fetchKelompokList(); // Panggil fungsi untuk mengambil daftar kelompok
        }
    }, [authLoading, fetchUserData, fetchKelompokList]);

    const handleSave = async () => {
        if (!userId || !token) {
            setModalMessage('Silakan login kembali');
            setShowModal(true);
            return;
        }

        try {
            console.log('Memperbarui data user:', editData);

            const response = await fetch(`/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editData),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token tidak valid, redirect ke login
                    sessionStorage.removeItem('userId');
                    sessionStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userData');
                    setModalMessage('Sesi telah berakhir, silakan login kembali');
                    setShowModal(true);
                    return;
                }

                let errorMessage = `Gagal memperbarui data: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Response update:', data);

            if (!data.user) {
                throw new Error('Data user tidak ditemukan dalam response');
            }

            // Update state dan cache
            setUserData(data.user);
            localStorage.setItem('userData', JSON.stringify(data.user));

            // Dispatch event untuk memberi tahu komponen lain tentang pembaruan data
            window.dispatchEvent(new Event('userDataUpdated'));

            setModalMessage('Profil berhasil diperbarui');
            setShowModal(true);
            setIsEditing(false);
        } catch (error: any) {
            console.error('Gagal menyimpan perubahan:', error);
            setModalMessage(error.message || 'Gagal menyimpan perubahan');
            setShowModal(true);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!userId || !token) {
            setModalMessage('Silakan login kembali');
            setShowModal(true);
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi ukuran file (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setModalMessage('Ukuran gambar maksimal 2MB');
            setShowModal(true);
            return;
        }

        // Validasi tipe file
        if (!file.type.startsWith('image/')) {
            setModalMessage('File harus berupa gambar');
            setShowModal(true);
            return;
        }

        setUploadingImage(true);

        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            console.log('Upload gambar profil untuk user:', userId);

            const response = await fetch(`/api/auth/profile/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                if (response.status === 401) {
                    sessionStorage.removeItem('userId');
                    sessionStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userData');
                    setModalMessage('Sesi telah berakhir, silakan login kembali');
                    setShowModal(true);
                    return;
                }

                let errorMessage = `Gagal upload gambar: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Response upload:', data);

            if (!data.user || !data.user.profileImage) {
                throw new Error('Data user tidak ditemukan dalam response');
            }

            // Update gambar profil dengan URL yang benar
            const imageUrl = getProfileImageUrl(data.user.profileImage);
            setProfileImage(imageUrl);

            // Update user data dengan gambar baru
            if (userData) {
                const updatedUserData = {
                    ...userData,
                    profileImage: data.user.profileImage
                };
                setUserData(updatedUserData);
                localStorage.setItem('userData', JSON.stringify(updatedUserData));

                // Dispatch event untuk memberi tahu komponen lain tentang pembaruan data
                window.dispatchEvent(new Event('userDataUpdated'));
            }

            setModalMessage('Foto profil berhasil diubah');
            setShowModal(true);
        } catch (error: any) {
            console.error('Error uploading image:', error);
            setModalMessage(error.message || 'Gagal mengupload gambar');
            setShowModal(true);
        } finally {
            setUploadingImage(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !userId) {
            const syncAuthData = async () => {
                try {
                    const response = await fetch('/api/auth/sync');
                    if (response.ok) {
                        const data = await response.json();
                        if (data.userId) {
                            sessionStorage.setItem('userId', data.userId);
                            sessionStorage.setItem('token', 'next-auth-sync-token');
                            window.location.reload();
                        }
                    }
                } catch (error) {
                    console.error('Failed to sync auth data:', error);
                    router.push('/login');
                }
            };

            syncAuthData();
        }
    }, [authLoading, userId, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
        );
    }

    const closeModal = () => {
        setShowModal(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Aktif': return 'text-green-600 bg-green-100';
            case 'Nonaktif': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    // Cek apakah user memiliki role peternak
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
                        <p className="text-gray-500 text-sm mt-1">Kelola informasi akun Anda</p>
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
                                    className="w-32 h-32 rounded-full object-cover shadow-lg"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        if (target.src !== '/Vector.svg') {
                                            target.src = '/Vector.svg';
                                        }
                                    }}
                                    priority
                                />
                                <label htmlFor="profile-upload" className="absolute bottom-2 right-2 bg-green-600 p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors">
                                    {uploadingImage ? (
                                        <div className="animate-spin rounded-full h-4 w-4"></div>
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
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        ) : (
                                            <p className="text-gray-800">{userData?.email || 'Tidak tersedia'}</p>
                                        )}
                                    </div>

                                    {/* Tambahan: Tempat Lahir - Hanya tampil untuk peternak */}
                                    {isPeternak && (
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
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                />
                                            ) : (
                                                <p className="text-gray-800">{userData?.tempatLahir || 'Tidak tersedia'}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Tambahan: Tanggal Lahir - Hanya tampil untuk peternak */}
                                    {isPeternak && (
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
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                    )}

                                    {/* Tambahan: Umur (hanya tampil, tidak bisa diedit) - Hanya untuk peternak */}
                                    {isPeternak && (
                                        <div>
                                            <label className="flex items-center gap-1 text-sm font-medium text-gray-600 mb-1">
                                                <Cake size={14} />
                                                Umur
                                            </label>
                                            <p className="text-gray-800">
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
                                        {isEditing ? (
                                            <select
                                                value={editData.kelompok}
                                                onChange={(e) => setEditData({ ...editData, kelompok: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                disabled={kelompokLoading}
                                            >
                                                <option value="">Pilih Kelompok</option>
                                                {kelompokList.map((kelompok) => (
                                                    <option key={kelompok._id} value={kelompok.nama}>
                                                        {kelompok.nama}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <p className="text-gray-800">{userData?.kelompok || 'Tidak tersedia'}</p>
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Notifikasi</h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-800 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="mb-4 text-gray-800">{modalMessage}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
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