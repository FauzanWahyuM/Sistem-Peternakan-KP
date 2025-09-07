// app/api/kelompok/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export async function GET() {
    try {
        await dbConnect();

        // Ambil semua user dari database
        const users = await User.find({}).select('nama kelompok status');

        // Kelompokkan data berdasarkan kelompok
        const kelompokMap = new Map();

        users.forEach(user => {
            const kelompok = user.kelompok;
            if (kelompok) {
                if (!kelompokMap.has(kelompok)) {
                    kelompokMap.set(kelompok, {
                        id: kelompok,
                        nama: `Kelompok ${kelompok}`,
                        anggota: [],
                        statusCount: {
                            aktif: 0,
                            nonAktif: 0
                        }
                    });
                }

                // Tambahkan nama user ke anggota kelompok
                if (user.nama) {
                    kelompokMap.get(kelompok).anggota.push(user.nama);
                }

                // Hitung status anggota
                if (user.status === 'Aktif') {
                    kelompokMap.get(kelompok).statusCount.aktif++;
                } else if (user.status === 'Non-Aktif') {
                    kelompokMap.get(kelompok).statusCount.nonAktif++;
                }
            }
        });

        // Konversi map ke array dan tentukan status kelompok
        const kelompokData = Array.from(kelompokMap.values()).map(kelompok => {
            // Jika semua anggota non-aktif, kelompok non-aktif
            if (kelompok.statusCount.nonAktif > 0 && kelompok.statusCount.aktif === 0) {
                return {
                    ...kelompok,
                    status: 'non-aktif'
                };
            }
            // Jika ada anggota aktif, kelompok aktif
            return {
                ...kelompok,
                status: 'aktif'
            };
        });

        return NextResponse.json(kelompokData);
    } catch (error) {
        console.error('Error fetching kelompok data:', error);
        return NextResponse.json(
            { error: 'Gagal mengambil data kelompok' },
            { status: 500 }
        );
    }
}