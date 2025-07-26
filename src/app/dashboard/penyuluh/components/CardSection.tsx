import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export default function CardSection() {
    // Data untuk grafik evaluasi
    const evaluationData = [
        { name: 'Kelompok A', value: 78 },
        { name: 'Kelompok B', value: 86 },
        { name: 'Kelompok C', value: 79 },
        { name: 'Kelompok D', value: 90 }
    ];

    // Data pelatihan
    const pelatihanData = [
        {
            judul: "Teknik Budidaya Modern",
            deskripsi: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt..."
        },
        {
            judul: "Manajemen Pakan Ternak",
            deskripsi: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt..."
        }
    ];

    return (
        <div className="space-y-6">
            {/* Statistics Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Jumlah Kelompok Card */}
                <div className="bg-green-500 text-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Jumlah Kelompok</h3>
                    <p className="text-3xl font-bold">4 Kelompok</p>
                </div>

                {/* Kuesioner Card */}
                <div className="bg-green-500 text-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Kuesioner</h3>
                    <p className="text-lg font-medium">3 Kelompok</p>
                    <p className="text-sm opacity-90">selesai mengisi</p>
                </div>

                {/* Evaluasi Card */}
                <div className="bg-green-500 text-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Evaluasi</h3>
                    <p className="text-3xl font-bold">91% Baik</p>
                </div>
            </div>

            {/* Main Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grafik Evaluasi */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">Grafik Evaluasi Kelompok Bulan ini</h3>
                    <div className="bg-green-100 p-4 rounded-lg">
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={evaluationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={12}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={12}
                                        domain={[0, 100]}
                                    />
                                    <Bar dataKey="value" fill="#4FC3F7" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Pelatihan Terakhir */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">Pelatihan Terakhir</h3>
                    <div className="space-y-4">
                        {pelatihanData.map((pelatihan, index) => (
                            <div key={index} className="bg-green-500 text-white p-4 rounded-lg">
                                <h4 className="text-lg font-semibold mb-2">Judul</h4>
                                <p className="text-sm mb-3 opacity-90">
                                    {pelatihan.deskripsi}
                                </p>
                                <button className="bg-white text-green-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
                                    Selengkapnya
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}