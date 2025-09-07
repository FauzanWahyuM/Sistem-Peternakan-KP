// app/api/kelompok/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import User, { IUser } from '../../../../models/User';

interface Params {
    params: {
        id: string;
    };
}

interface UserResponse {
    nama: string;
    username: string;
    email: string;
    role: string;
    status: string;
    joinDate: Date;
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        await dbConnect();

        const { id } = params;

        // Ambil semua user yang memiliki kelompok yang sesuai
        const users: IUser[] = await User.find({ kelompok: id })
            .select('nama username email role status createdAt')
            .sort({ createdAt: 1 }) // Urutkan berdasarkan tanggal bergabung
            .exec();

        if (users.length === 0) {
            return NextResponse.json(
                { error: 'Kelompok tidak ditemukan atau tidak memiliki anggota' },
                { status: 404 }
            );
        }

        // Format data untuk response
        const responseData = {
            id: id,
            nama: `Kelompok ${id}`,
            anggota: users.map((user: IUser) => ({
                nama: user.nama,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                joinDate: user.createdAt
            })),
            status: users.some(user => user.status === 'Aktif') ? 'Aktif' : 'Non-Aktif',
            totalAnggota: users.length,
            totalAktif: users.filter(user => user.status === 'Aktif').length,
            totalNonAktif: users.filter(user => user.status === 'Non-Aktif').length
        };

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Error fetching kelompok data:', error);
        return NextResponse.json(
            { error: 'Gagal mengambil data kelompok' },
            { status: 500 }
        );
    }
}