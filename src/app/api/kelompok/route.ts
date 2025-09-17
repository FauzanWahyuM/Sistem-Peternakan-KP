// app/api/kelompok/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Kelompok from '../../../models/Kelompok';
import User from '../../../models/User';
import type { FilterQuery, QueryOptions } from 'mongoose';

// Helper function to safely call Mongoose methods
const safeFind = async (model: any, filter: FilterQuery<any>, projection?: any, options?: QueryOptions) => {
    return model.find(filter, projection, options).lean().exec();
};

const safeFindOne = async (model: any, filter: FilterQuery<any>, projection?: any, options?: QueryOptions) => {
    return model.findOne(filter, projection, options).lean().exec();
};

const safeFindOneAndUpdate = async (model: any, filter: FilterQuery<any>, update: any, options?: QueryOptions) => {
    return model.findOneAndUpdate(filter, update, { ...options, new: true }).lean().exec();
};

const safeFindOneAndDelete = async (model: any, filter: FilterQuery<any>, options?: QueryOptions) => {
    return model.findOneAndDelete(filter, options).lean().exec();
};

const safeCountDocuments = async (model: any, filter: FilterQuery<any>) => {
    return model.countDocuments(filter).exec();
};

export async function GET() {
    try {
        await dbConnect();

        // Use the safe helper function
        const kelompokData = await safeFind(Kelompok, {}, null, { sort: { tanggalDibuat: -1 } });

        const kelompokWithDetails = await Promise.all(
            kelompokData.map(async (kelompok: any) => {
                const filterAktif: FilterQuery<typeof User> = {
                    kelompok: kelompok.kelompokid,
                    status: 'Aktif'
                };
                const filterNonAktif: FilterQuery<typeof User> = {
                    kelompok: kelompok.kelompokid,
                    status: 'Non-Aktif'
                };
                const filterAnggota: FilterQuery<typeof User> = {
                    kelompok: kelompok.kelompokid
                };

                const [anggotaAktif, anggotaNonAktif, anggotaUsers] = await Promise.all([
                    safeCountDocuments(User, filterAktif),
                    safeCountDocuments(User, filterNonAktif),
                    safeFind(User, filterAnggota, 'nama status')
                ]);

                return {
                    id: kelompok.kelompokid,
                    nama: kelompok.nama,
                    anggota: anggotaUsers.map((user: any) => user.nama),
                    status: kelompok.status,
                    statusCount: {
                        aktif: anggotaAktif,
                        nonAktif: anggotaNonAktif
                    },
                    totalAnggota: anggotaAktif + anggotaNonAktif
                };
            })
        );

        return NextResponse.json(kelompokWithDetails);
    } catch (error) {
        console.error('Error fetching kelompok data:', error);
        return NextResponse.json(
            { error: 'Gagal mengambil data kelompok' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { kelompokid, nama, anggota, status } = body;

        if (!kelompokid || !nama) {
            return NextResponse.json(
                { error: 'ID Kelompok dan nama kelompok diperlukan' },
                { status: 400 }
            );
        }

        const existingKelompok = await safeFindOne(Kelompok, { kelompokid });
        if (existingKelompok) {
            return NextResponse.json(
                { error: 'ID Kelompok sudah digunakan' },
                { status: 400 }
            );
        }

        const newKelompok = new Kelompok({
            kelompokid,
            nama,
            anggota: anggota || [],
            status: status || 'aktif',
            tanggalDibuat: new Date(),
            tanggalDiupdate: new Date()
        });

        const savedKelompok = await newKelompok.save();

        return NextResponse.json(
            {
                message: 'Kelompok berhasil ditambahkan',
                data: savedKelompok
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error creating kelompok:', error);
        return NextResponse.json(
            { error: 'Gagal menambahkan kelompok' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { id, nama, status, anggota } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'ID Kelompok diperlukan' },
                { status: 400 }
            );
        }

        const updateData: any = { tanggalDiupdate: new Date() };
        if (nama) updateData.nama = nama;
        if (status) updateData.status = status;
        if (anggota) updateData.anggota = anggota;

        const filter: FilterQuery<typeof Kelompok> = { kelompokid: id };

        const updatedKelompok = await safeFindOneAndUpdate(Kelompok, filter, updateData);

        if (!updatedKelompok) {
            return NextResponse.json(
                { error: 'Kelompok tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Kelompok berhasil diupdate',
            data: updatedKelompok
        });

    } catch (error) {
        console.error('Error updating kelompok:', error);
        return NextResponse.json(
            { error: 'Gagal mengupdate kelompok' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID Kelompok diperlukan' },
                { status: 400 }
            );
        }

        const filter: FilterQuery<typeof Kelompok> = { kelompokid: id };

        const deletedKelompok = await safeFindOneAndDelete(Kelompok, filter);

        if (!deletedKelompok) {
            return NextResponse.json(
                { error: 'Kelompok tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Kelompok berhasil dihapus',
            data: deletedKelompok
        });

    } catch (error) {
        console.error('Error deleting kelompok:', error);
        return NextResponse.json(
            { error: 'Gagal menghapus kelompok' },
            { status: 500 }
        );
    }
}