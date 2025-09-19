import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell } from 'recharts';
import { usePelatihanStorage } from '../hooks/usePelatihanStorage';
import { useState, useEffect } from 'react';
import { Users, FileText, Calendar, TrendingUp, ArrowRight, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Ganti dengan next/navigation

// Interface untuk data evaluasi kelompok
interface KelompokEvaluasi {
    kelompok: string;
    anggota: any[];
    totalNilai: number;
    jumlahAnggota: number;
    jumlahResponden: number;
    rataRata: number;
    persentaseResponden: number;
    status: string;
}

// Custom Tooltip untuk grafik
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                <p className="font-semibold text-gray-800">{label}</p>
                <p className="text-green-600 font-bold">
                    Nilai: <span className="text-blue-600">{payload[0].value}</span>
                </p>
            </div>
        );
    }
    return null;
};

// Komponen untuk statistik card
const StatCard = ({ title, value, subtitle, icon, color, loading }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    loading?: boolean;
}) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 ${loading ? 'animate-pulse' : ''}`}>
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${color}`}>
                {icon}
            </div>
            <div className="text-right">
                {loading ? (
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                ) : (
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                )}
            </div>
        </div>
        <h3 className="text-sm font-semibold text-gray-600 mb-1">{title}</h3>
        {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
        )}
    </div>
);

export default function CardSection() {
    const router = useRouter(); // Sekarang menggunakan next/navigation
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [evaluasiData, setEvaluasiData] = useState<KelompokEvaluasi[]>([]);
    const [loading, setLoading] = useState(true);

    // Mengambil data evaluasi dari API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/hasil-evaluasi');

                if (!response.ok) {
                    throw new Error('Gagal mengambil data evaluasi');
                }

                const data = await response.json();
                setEvaluasiData(data);
            } catch (err) {
                console.error('Error fetching data:', err);
                // Optional: Add error handling UI here if needed
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Data untuk grafik evaluasi (diambil dari data API)
    const evaluationData = evaluasiData.map(kelompok => ({
        name: kelompok.kelompok === 'Belum Dikelompokkan' ? 'Belum Dikelompokkan' : `Kel ${kelompok.kelompok}`,
        fullName: kelompok.kelompok === 'Belum Dikelompokkan' ? 'Belum Dikelompokkan' : `Kelompok ${kelompok.kelompok}`,
        value: Math.round(kelompok.rataRata),
        color: kelompok.rataRata >= 80 ? '#4CAF50' :
            kelompok.rataRata >= 70 ? '#FF9800' : '#E91E63'
    }));

    const averageScore = evaluationData.length > 0
        ? evaluationData.reduce((sum, item) => sum + item.value, 0) / evaluationData.length
        : 0;

    // Fungsi untuk mendapatkan warna berdasarkan nilai
    const getGradeColor = (nilai: number) => {
        if (nilai >= 80) return 'text-green-600';
        if (nilai >= 70) return 'text-yellow-600';
        if (nilai >= 60) return 'text-orange-600';
        return 'text-red-600';
    };

    // Fungsi untuk navigasi
    const handleLihatDetail = () => {
        router.push('/dashboard/penyuluh/hasil-evaluasi');
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">Dashboard Penyuluh</h1>
                <p className="text-green-100">Monitor perkembangan kelompok dan evaluasi pelatihan</p>
            </div>

            {/* Statistics Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Jumlah Kelompok"
                    value={loading ? "..." : `${evaluasiData.length} Kelompok`}
                    subtitle="Total kelompok binaan"
                    icon={<Users className="w-6 h-6 text-white" />}
                    color="bg-blue-500"
                    loading={loading}
                />

                <StatCard
                    title="Kuesioner Terisi"
                    value={loading ? "..." : `${evaluasiData.filter(k => k.jumlahResponden > 0).length} Kelompok`}
                    subtitle={loading ? "..." : `${Math.round((evaluasiData.filter(k => k.jumlahResponden > 0).length / Math.max(evaluasiData.length, 1)) * 100)}% completion rate`}
                    icon={<FileText className="w-6 h-6 text-white" />}
                    color="bg-green-500"
                    loading={loading}
                />

                <StatCard
                    title="Rata-rata Nilai"
                    value={loading ? "..." : Math.round(averageScore)}
                    subtitle={loading ? "..." : "Nilai keseluruhan"}
                    icon={<BookOpen className="w-6 h-6 text-white" />}
                    color="bg-orange-500"
                    loading={loading}
                />
            </div>

            {/* Main Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Evaluasi Kelompok</h3>
                            <p className="text-sm text-gray-600">Nilai rata-rata bulan ini</p>
                        </div>
                        {!loading && (
                            <div className="bg-green-50 px-3 py-1 rounded-full">
                                <span className={`font-semibold text-sm ${getGradeColor(averageScore)}`}>
                                    Avg: {averageScore.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="h-80 flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Memuat data evaluasi...</p>
                            </div>
                        </div>
                    ) : evaluationData.length === 0 ? (
                        <div className="h-80 flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-4xl">📋</span>
                                <p className="mt-4 text-gray-600">Belum ada data evaluasi</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={evaluationData}
                                        layout="vertical"
                                        margin={{ top: 20, right: 30, left: 60, bottom: 30 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis
                                            type="number"
                                            domain={[0, 100]}
                                            axisLine={false}
                                            tickLine={false}
                                            fontSize={12}
                                            tickMargin={10}
                                        />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            fontSize={12}
                                            tickMargin={10}
                                            width={60}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar
                                            dataKey="value"
                                            radius={[0, 6, 6, 0]}
                                            background={{ fill: '#f5f5f5', radius: 4 }}
                                        >
                                            {evaluationData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={activeIndex === index ? '#2E7D32' : entry.color}
                                                    style={{ transition: 'fill 0.2s ease' }}
                                                    onMouseEnter={() => setActiveIndex(index)}
                                                    onMouseLeave={() => setActiveIndex(null)}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <span className="text-sm text-gray-600">Data evaluasi terkini</span>
                                </div>
                                <button
                                    onClick={handleLihatDetail}
                                    className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                                >
                                    Lihat detail
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Pelatihan Terbaru */}
                <PelatihanTerbaru />
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600">Total Anggota</p>
                    <p className="font-bold text-gray-800">
                        {loading ? '...' : `${evaluasiData.reduce((sum, k) => sum + k.jumlahAnggota, 0)} Peternak`}
                    </p>
                </div>

                <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600">Total Responden</p>
                    <p className="font-bold text-gray-800">
                        {loading ? '...' : `${evaluasiData.reduce((sum, k) => sum + k.jumlahResponden, 0)} Orang`}
                    </p>
                </div>

                <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                    <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-600">Rata-rata Nilai</p>
                    <p className="font-bold text-gray-800">
                        {loading ? '...' : Math.round(averageScore)}
                    </p>
                </div>

                <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                    <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="font-bold text-gray-800">
                        {loading ? '...' : `${Math.round((evaluasiData.reduce((sum, k) => sum + k.jumlahResponden, 0) / Math.max(evaluasiData.reduce((sum, k) => sum + k.jumlahAnggota, 0), 1)) * 100)}%`}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Komponen terpisah untuk menampilkan pelatihan terbaru
function PelatihanTerbaru() {
    const { pelatihan } = usePelatihanStorage();
    const [isClient, setIsClient] = useState(false);
    const router = useRouter(); // Juga ganti di sini

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Ambil 3 pelatihan terbaru berdasarkan tanggal
    const pelatihanTerbaru = isClient
        ? [...pelatihan].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).slice(0, 3)
        : [];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Pelatihan Terbaru</h3>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center">
                    Lihat semua <ArrowRight className="w-4 h-4 ml-1" />
                </button>
            </div>

            <div className="space-y-4">
                {!isClient ? (
                    // Skeleton loading
                    [1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-50 p-4 rounded-xl animate-pulse">
                            <div className="h-5 bg-gray-200 rounded mb-3 w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
                            <div className="flex justify-between items-center">
                                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-8 bg-gray-200 rounded-full w-1/4"></div>
                            </div>
                        </div>
                    ))
                ) : pelatihanTerbaru.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Belum ada pelatihan</p>
                        <p className="text-sm text-gray-400 mt-1">Jadwalkan pelatihan pertama Anda</p>
                    </div>
                ) : (
                    pelatihanTerbaru.map((pelatihanItem) => (
                        <div key={pelatihanItem.id} className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold text-gray-800 line-clamp-2">
                                    {pelatihanItem.judul}
                                </h4>
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full ml-3 flex-shrink-0">
                                    {new Date(pelatihanItem.tanggal).toLocaleDateString('id-ID')}
                                </span>
                            </div>

                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {pelatihanItem.deskripsi}
                            </p>

                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                    {new Date(pelatihanItem.tanggal).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center">
                                    Detail
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}