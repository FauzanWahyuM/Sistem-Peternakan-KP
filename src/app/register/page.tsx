'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Calendar, MapPin, ChevronDown, Phone, Home, Navigation } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [userType, setUserType] = useState<'peternak' | 'penyuluh'>('peternak');
    const [kelompokOptions, setKelompokOptions] = useState([]);
    const [wilayahOptions, setWilayahOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        phoneNumber: '', // Tambahan: Nomor HP
        village: '', // Tambahan: Desa
        district: '', // Tambahan: Kecamatan
        kelompok: '',
        tempatLahir: '',
        tanggalLahir: '',
        umur: '',
    });
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    // Fetch data kelompok dan wilayah dari API
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setIsLoading(true);
                // Fetch kelompok peternak
                const kelompokRes = await fetch('/api/kelompok');
                const kelompokData = await kelompokRes.json();
                if (kelompokRes.ok) {
                    setKelompokOptions(kelompokData);
                }

                // Fetch wilayah binaan
                const wilayahRes = await fetch('/api/kelompok');
                const wilayahData = await wilayahRes.json();
                if (wilayahRes.ok) {
                    setWilayahOptions(wilayahData);
                }
            } catch (error) {
                console.error('Error fetching options:', error);
                setMessage('Gagal memuat data pilihan');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value,
        });

        // Hitung umur otomatis jika tanggal lahir diubah
        if (name === 'tanggalLahir' && value) {
            const birthDate = new Date(value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            setForm(prev => ({
                ...prev,
                umur: age.toString()
            }));
        }

        if (name === 'password') {
            validatePassword(value);
        }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        // Validasi password sebelum submit
        if (!validatePassword(form.password)) {
            return;
        }

        // Validasi nomor HP (opsional, tapi jika diisi harus valid)
        if (form.phoneNumber && !/^[0-9+\-\s()]{10,15}$/.test(form.phoneNumber)) {
            setMessage('❌ Format nomor HP tidak valid');
            return;
        }

        // Hapus data lahir jika userType adalah penyuluh
        const submitData = userType === 'penyuluh' ? {
            nama: form.name,
            username: form.username,
            email: form.email,
            password: form.password,
            phoneNumber: form.phoneNumber, // Tambahan
            village: form.village, // Tambahan
            district: form.district, // Tambahan
            wilayahBinaan: form.kelompok, // Untuk penyuluh, kelompok adalah wilayah binaan
            role: userType,
            status: 'Aktif',
        } : {
            nama: form.name,
            username: form.username,
            email: form.email,
            password: form.password,
            phoneNumber: form.phoneNumber, // Tambahan
            village: form.village, // Tambahan
            district: form.district, // Tambahan
            kelompokId: form.kelompok, // Untuk peternak, simpan ID kelompok
            tempatLahir: form.tempatLahir,
            tanggalLahir: form.tanggalLahir,
            umur: form.umur,
            role: userType,
            status: 'Aktif',
        };

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('✅ Registrasi berhasil! Mengarahkan ke login...');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setMessage(`❌ Registrasi gagal: ${data.error || 'Terjadi kesalahan'}`);
            }
        } catch (error) {
            console.error('Registration error:', error);
            setMessage('❌ Gagal terhubung ke server');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-4 py-10">
            <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8 border border-green-100">
                <h2 className="text-2xl font-bold text-center text-green-700 mb-2">Form Registrasi</h2>
                <p className="text-sm text-center text-gray-600 mb-6">Silakan pilih jenis akun yang ingin dibuat</p>

                {/* Toggle User Type */}
                <div className="flex bg-green-50 rounded-lg p-1 mb-6">
                    <button
                        type="button"
                        onClick={() => setUserType('peternak')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${userType === 'peternak'
                            ? 'bg-white text-green-700 shadow-sm'
                            : 'text-gray-600 hover:text-green-700'}`}
                    >
                        Peternak
                    </button>
                    <button
                        type="button"
                        onClick={() => setUserType('penyuluh')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${userType === 'penyuluh'
                            ? 'bg-white text-green-700 shadow-sm'
                            : 'text-gray-600 hover:text-green-700'}`}
                    >
                        Penyuluh
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Masukkan Nama Lengkap"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Masukkan Username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Masukkan Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Masukkan Password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {passwordError && (
                            <p className="text-red-600 text-xs mt-1">{passwordError}</p>
                        )}
                    </div>

                    {/* Field Tambahan: Nomor HP, Desa, Kecamatan */}
                    <div className="space-y-4 pt-2 border-t border-gray-200">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                Nomor HP
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    placeholder="Contoh: 081234567890"
                                    value={form.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg pl-10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                                />
                                <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                Desa
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="village"
                                    placeholder="Masukkan nama desa"
                                    value={form.village}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg pl-10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                                />
                                <Home size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                Kecamatan
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="district"
                                    placeholder="Masukkan nama kecamatan"
                                    value={form.district}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg pl-10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                                />
                                <Navigation size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Hanya tampilkan field lahir untuk peternak */}
                    {userType === 'peternak' && (
                        <>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Tempat Lahir</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="tempatLahir"
                                        placeholder="Masukkan Tempat Lahir"
                                        value={form.tempatLahir}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg pl-10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                                    />
                                    <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Tanggal Lahir</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="tanggalLahir"
                                        value={form.tanggalLahir}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg pl-10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                                    />
                                    <Calendar size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Umur</label>
                                <input
                                    type="number"
                                    name="umur"
                                    placeholder="Umur"
                                    value={form.umur}
                                    onChange={handleChange}
                                    required
                                    readOnly
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black bg-gray-50 transition-colors"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            {userType === 'peternak' ? 'Kelompok Peternak' : 'Wilayah Binaan'}
                        </label>
                        <div className="relative">
                            <select
                                name="kelompok"
                                value={form.kelompok}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black appearance-none transition-colors"
                            >
                                <option value="">Pilih {userType === 'peternak' ? 'Kelompok' : 'Wilayah'}</option>
                                {isLoading ? (
                                    <option value="" disabled>Memuat data...</option>
                                ) : userType === 'peternak' ? (
                                    kelompokOptions.map((kelompok) => (
                                        <option key={kelompok.id} value={kelompok.id}>
                                            {kelompok.nama}
                                        </option>
                                    ))
                                ) : (
                                    wilayahOptions.map((wilayah) => (
                                        <option key={wilayah.id} value={wilayah.id}>
                                            {wilayah.nama}
                                        </option>
                                    ))
                                )}
                            </select>
                            <ChevronDown size={18} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                        </div>
                        {userType === 'peternak' && kelompokOptions.length === 0 && !isLoading && (
                            <p className="text-red-600 text-xs mt-1">Tidak ada kelompok tersedia. Silakan hubungi administrator.</p>
                        )}
                        {userType === 'penyuluh' && wilayahOptions.length === 0 && !isLoading && (
                            <p className="text-red-600 text-xs mt-1">Tidak ada wilayah binaan tersedia. Silakan hubungi administrator.</p>
                        )}
                    </div>

                    {message && (
                        <p className={`text-sm text-center mt-2 ${message.includes('❌') ? 'text-red-600' : 'text-green-600'}`}>
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || (userType === 'peternak' && kelompokOptions.length === 0) || (userType === 'penyuluh' && wilayahOptions.length === 0)}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Memuat...' : `Daftar sebagai ${userType === 'peternak' ? 'Peternak' : 'Penyuluh'}`}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push('/login')}
                        className="w-full mt-3 bg-white text-gray-700 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm hover:shadow"
                    >
                        Kembali ke Login
                    </button>
                </form>

                <p className="text-xs text-center text-gray-500 mt-6">
                    Dengan mendaftar, Anda menyetujui Syarat & Ketentuan dan Kebijakan Privasi kami
                </p>
            </div>
        </div>
    );
}