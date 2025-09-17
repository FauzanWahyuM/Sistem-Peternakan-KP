// app/api/kelompok/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Kelompok from '../../../../models/Kelompok';
import User from '../../../../models/User';
import type { FilterQuery } from 'mongoose';

// Helper function untuk safe operations
const safeFind = async (model: any, filter: FilterQuery<any>, projection?: any, options?: any) => {
    return model.find(filter, projection, options).lean().exec();
};

const safeFindOne = async (model: any, filter: FilterQuery<any>, projection?: any, options?: any) => {
    return model.findOne(filter, projection, options).lean().exec();
};

export async function GET(
    _request: NextRequest,
    context: any
) {
    try {
        await dbConnect();

        const { id } = context.params;

        // Cari kelompok berdasarkan kelompokid
        const kelompok = await safeFindOne(Kelompok, { kelompokid: id });

        if (!kelompok) {
            return NextResponse.json(
                { error: 'Kelompok tidak ditemukan' },
                { status: 404 }
            );
        }

        // Ambil semua user dengan role peternak yang termasuk dalam kelompok ini
        const users = await safeFind(User, {
            kelompok: id,
            role: 'peternak'
        }, 'nama username email role status createdAt', { sort: { createdAt: 1 } });

        const responseData = {
            id: kelompok.kelompokid,
            nama: kelompok.nama || `Kelompok ${kelompok.kelompokid}`,
            anggota: users.map((user: any) => ({
                nama: user.nama,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                joinDate: user.createdAt,
            })),
            status: kelompok.status || 'Non-Aktif',
            totalAnggota: users.length,
            totalAktif: users.filter((user: any) => user.status === 'Aktif').length,
            totalNonAktif: users.filter((user: any) => user.status === 'Non-Aktif').length,
            // TAMBAHKAN INI: tanggal dibuat kelompok
            tanggalDibuat: kelompok.tanggalDibuat || kelompok.createdAt || new Date()
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