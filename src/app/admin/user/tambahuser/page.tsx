'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, X, ChevronDown, Calendar, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '../../../../lib/api-client';

interface FormData {
    nama: string;
    username: string;
    email: string;
    password: string;
    kelompok: string;
    role: 'Peternak' | 'Penyuluh' | 'Admin' | '';
    status: 'Aktif' | 'Non-Aktif' | '';
    tempatLahir: string;
    tanggalLahir: string;
    umur: string;
}

interface KelompokOption {
    id: string;
    nama: string;
}

const TambahUser: React.FC = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        nama: '',
        username: '',
        email: '',
        password: '',
        kelompok: '',
        role: '',
        status: '',
        tempatLahir: '',
        tanggalLahir: '',
        umur: '',
    });
    const [passwordError, setPasswordError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [kelompokOptions, setKelompokOptions] = useState<KelompokOption[]>([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState<boolean>(true);

    // Fetch data kelompok dari API
    useEffect(() => {
        const fetchKelompokOptions = async () => {
            try {
                setIsLoadingOptions(true);
                const response = await fetch('/api/kelompok');
                if (response.ok) {
                    const data = await response.json();
                    setKelompokOptions(data);
                } else {
                    console.error('Gagal mengambil data kelompok');
                    setModalMessage('Gagal memuat data kelompok. Silakan coba lagi.');
                    setShowModal(true);
                }
            } catch (error) {
                console.error('Error fetching kelompok options:', error);
                setModalMessage('Terjadi kesalahan saat memuat data kelompok.');
                setShowModal(true);
            } finally {
                setIsLoadingOptions(false);
            }
        };

        fetchKelompokOptions();
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Hitung umur otomatis jika tanggal lahir diubah
        if (name === 'tanggalLahir' && value) {
            const birthDate = new Date(value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            setFormData(prev => ({
                ...prev,
                umur: age.toString()
            }));
        }

        if (name === 'password') {
            validatePassword(value);
        }
    };

    const handleRoleChange = (role: FormData['role']) => {
        setFormData((prev) => ({
            ...prev,
            role,
            // Reset kelompok dan data lahir ketika role diubah
            ...(role !== 'Peternak' && {
                kelompok: '',
                tempatLahir: '',
                tanggalLahir: '',
                umur: ''
            })
        }));
    };

    const handleStatusChange = (status: FormData['status']) => {
        setFormData((prev) => ({ ...prev, status }));
    };

    const validatePassword = (password: string): boolean => {
        const minLength = 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[^A-Za-z0-9]/.test(password);

        if (password.length < minLength) {
            setPasswordError('Password minimal 8 karakter.');
            return false;
        }
        if (!hasUppercase) {
            setPasswordError('Password harus mengandung huruf besar.');
            return false;
        }
        if (!hasLowercase) {
            setPasswordError('Password harus mengandung huruf kecil.');
            return false;
        }
        if (!hasNumber) {
            setPasswordError('Password harus mengandung angka.');
            return false;
        }
        if (!hasSymbol) {
            setPasswordError('Password harus mengandung simbol.');
            return false;
        }

        setPasswordError('');
        return true;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validatePassword(formData.password)) {
            setModalMessage('Password tidak memenuhi kriteria keamanan. Silakan periksa kembali.');
            setShowModal(true);
            return;
        }

        // Validasi untuk Peternak
        if (formData.role === 'Peternak') {
            if (!formData.kelompok) {
                setModalMessage('Kelompok Peternak harus dipilih untuk role Peternak.');
                setShowModal(true);
                return;
            }
            if (!formData.tempatLahir || !formData.tanggalLahir || !formData.umur) {
                setModalMessage('Data tempat lahir, tanggal lahir, dan umur harus diisi untuk role Peternak.');
                setShowModal(true);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            // Siapkan data berdasarkan role
            const userData: any = {
                nama: formData.nama,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                kelompok: formData.kelompok,
                role: formData.role.toLowerCase(),
                status: formData.status
            };

            // Tambahkan data lahir hanya untuk Peternak
            if (formData.role === 'Peternak') {
                userData.tempatLahir = formData.tempatLahir;
                userData.tanggalLahir = formData.tanggalLahir;
                userData.umur = parseInt(formData.umur);
            }

            const res = await ApiClient.createUser(userData);

            if (res.error) {
                setModalMessage(res.error || 'Terjadi kesalahan saat menyimpan data.');
                setShowModal(true);
            } else {
                setModalMessage('User berhasil ditambahkan!');
                setShowModal(true);
            }
        } catch (error: any) {
            console.error('Gagal menyimpan ke database:', error);
            setModalMessage('Terjadi kesalahan saat menyimpan data.');
            setShowModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        // Jika pesan sukses, redirect ke halaman user
        if (modalMessage === 'User berhasil ditambahkan!') {
            router.push('/admin/user');
        }
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <button
                onClick={() => router.back()}
                className="mb-6 text-green-700 flex items-center gap-2"
            >
                <ArrowLeft /> Kembali
            </button>

            <div className="bg-white p-8 rounded-md shadow max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-center text-black">Tambah User</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block font-semibold mb-1 text-black">Nama User</label>
                        <input
                            type="text"
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            className="w-full border rounded px-4 py-2 text-black"
                            placeholder="Masukkan Nama Anda"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1 text-black">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full border rounded px-4 py-2 text-black"
                            placeholder="Masukkan Username Anda"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1 text-black">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full border rounded px-4 py-2 pr-10 text-black"
                                placeholder="Masukkan Password Anda"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-2.5 right-3 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {passwordError && (
                            <p className="text-red-600 text-sm mt-1">{passwordError}</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-semibold mb-1 text-black">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border rounded px-4 py-2 text-black"
                            placeholder="Masukkan Email Anda"
                            required
                        />
                    </div>

                    {/* Field data lahir - Hanya tampil untuk Peternak */}
                    {formData.role === 'Peternak' && (
                        <>
                            <div>
                                <label className="block font-semibold mb-1 text-black">Tempat Lahir</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="tempatLahir"
                                        value={formData.tempatLahir}
                                        onChange={handleChange}
                                        className="w-full border rounded px-4 py-2 pl-10 text-black"
                                        placeholder="Masukkan Tempat Lahir"
                                        required
                                    />
                                    <MapPin size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1 text-black">Tanggal Lahir</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="tanggalLahir"
                                        value={formData.tanggalLahir}
                                        onChange={handleChange}
                                        className="w-full border rounded px-4 py-2 pl-10 text-black"
                                        required
                                        max={new Date().toISOString().split('T')[0]} // Tidak boleh lebih dari hari ini
                                    />
                                    <Calendar size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1 text-black">Umur</label>
                                <input
                                    type="number"
                                    name="umur"
                                    value={formData.umur}
                                    onChange={handleChange}
                                    className="w-full border rounded px-4 py-2 text-black bg-gray-50"
                                    placeholder="Umur akan terisi otomatis"
                                    required
                                    readOnly
                                    min="1"
                                    max="120"
                                />
                            </div>
                        </>
                    )}

                    {/* Field Kelompok dengan dropdown select */}
                    <div>
                        <label className="block font-semibold mb-1 text-black">
                            {formData.role === 'Peternak' ? 'Kelompok Peternak' :
                                formData.role === 'Penyuluh' ? 'Wilayah Binaan' : 'Kelompok/Wilayah'}
                        </label>
                        <div className="relative">
                            <select
                                name="kelompok"
                                value={formData.kelompok}
                                onChange={handleChange}
                                className="w-full border rounded px-4 py-2 pr-10 text-black appearance-none"
                                disabled={formData.role === 'Admin' || isLoadingOptions}
                                required={formData.role === 'Peternak' || formData.role === 'Penyuluh'}
                            >
                                <option value="">
                                    {isLoadingOptions
                                        ? 'Memuat data...'
                                        : formData.role === 'Admin'
                                            ? 'Tidak diperlukan untuk Admin'
                                            : `Pilih ${formData.role === 'Peternak' ? 'Kelompok' : 'Wilayah'}`
                                    }
                                </option>
                                {kelompokOptions.map((kelompok) => (
                                    <option key={kelompok.id} value={kelompok.id}>
                                        {kelompok.nama}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={18} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                        </div>
                        {formData.role === 'Peternak' && kelompokOptions.length === 0 && !isLoadingOptions && (
                            <p className="text-red-600 text-sm mt-1">Tidak ada kelompok tersedia. Silakan tambahkan kelompok terlebih dahulu.</p>
                        )}
                        {formData.role === 'Penyuluh' && kelompokOptions.length === 0 && !isLoadingOptions && (
                            <p className="text-red-600 text-sm mt-1">Tidak ada wilayah binaan tersedia. Silakan tambahkan wilayah terlebih dahulu.</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-semibold mb-2 text-black">Status</label>
                        <div className="flex gap-8 text-black">
                            {['Aktif', 'Non-Aktif'].map((status) => (
                                <label key={status} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="status"
                                        value={status}
                                        checked={formData.status === status}
                                        onChange={() => handleStatusChange(status as FormData['status'])}
                                    />
                                    {status}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold mb-2 text-black">Role</label>
                        <div className="flex gap-8 text-black">
                            {['Peternak', 'Penyuluh', 'Admin'].map((role) => (
                                <label key={role} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="role"
                                        value={role}
                                        checked={formData.role === role}
                                        onChange={() => handleRoleChange(role as FormData['role'])}
                                    />
                                    {role}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                            disabled={isSubmitting ||
                                (formData.role === 'Peternak' && kelompokOptions.length === 0) ||
                                (formData.role === 'Penyuluh' && kelompokOptions.length === 0)}
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
                        >
                            Batal
                        </button>
                    </div>
                </form>
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

export default TambahUser;