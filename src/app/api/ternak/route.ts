import { NextRequest } from 'next/server';
import connectDB from "../../../lib/dbConnect";
import Ternak from "../../../models/Ternak";
import mongoose from 'mongoose';

// Interface untuk user
interface IUser {
    _id: mongoose.Types.ObjectId;
    kelompok?: string;
}

// GET: ambil data ternak
export async function GET(req: NextRequest) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const stats = searchParams.get("stats");
        const id = searchParams.get("id");
        const userId = searchParams.get("userId");
        const tipe = searchParams.get("tipe");
        const jenis = searchParams.get("jenis");

        console.log('GET Ternak Params:', { stats, id, userId, tipe, jenis });

        if (stats === "true") {
            let matchStage: any = {};

            if (tipe === "pribadi") {
                // Data pribadi: hanya data user ini dengan tipe pribadi
                matchStage = { userId, tipe: "pribadi" };
                console.log('Filter pribadi:', matchStage);
            } else if (tipe === "kelompok") {
                // Data kelompok: ambil data user dulu untuk mendapatkan kelompok
                if (!userId) {
                    return new Response(JSON.stringify([]), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                // Gunakan approach yang lebih aman untuk mongoose model
                let userData: IUser | null = null;

                // Coba ambil data user dengan beberapa cara
                try {
                    // Cara 1: Jika model User sudah ada
                    if (mongoose.models.User) {
                        userData = await mongoose.models.User.findById(userId).select('kelompok').lean().exec() as IUser;
                    }
                    // Cara 2: Jika model User belum ada, buat schema sederhana
                    else {
                        const userSchema = new mongoose.Schema({
                            kelompok: String
                        });
                        const UserModel = mongoose.model('User', userSchema);
                        userData = await UserModel.findById(userId).select('kelompok').lean().exec() as IUser;
                    }
                } catch (userError) {
                    console.error('Error fetching user data:', userError);
                    // Jika gagal, asumsikan user tidak memiliki kelompok
                    userData = null;
                }

                if (userData && userData.kelompok && userData.kelompok !== 'Tidak tersedia') {
                    matchStage = {
                        kelompokId: userData.kelompok,
                        tipe: "kelompok"
                    };
                } else {
                    // User tidak punya kelompok, return empty
                    return new Response(JSON.stringify([]), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                console.log('Filter kelompok:', matchStage);
            } else {
                // Default: semua data user ini (baik pribadi maupun kelompok)
                matchStage = { userId };
            }

            // Hitung jumlah ternak per jenis
            const statistics = await Ternak.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: "$jenisHewan",
                        total: { $sum: 1 }
                    }
                }
            ]);

            console.log('Aggregation Result:', statistics);
            return new Response(JSON.stringify(statistics), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (id) {
            // Ambil detail ternak by id
            const ternak = await Ternak.findById(id).exec();
            if (!ternak) {
                return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            return new Response(JSON.stringify(ternak), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Default: ambil data berdasarkan filter
        // Default: ambil data berdasarkan filter
        // Default: ambil data berdasarkan filter
        let filter: any = {};

        // PERBAIKAN: Jangan gunakan tipe dari URL parameter untuk filter API
        // Biarkan frontend yang handle filtering berdasarkan pilihan user
        if (userId) {
            // Ambil semua data user (baik pribadi maupun kelompok)
            let userData: IUser | null = null;
            try {
                if (mongoose.models.User) {
                    userData = await mongoose.models.User.findById(userId)
                        .select('kelompok')
                        .lean()
                        .exec() as IUser;
                } else {
                    const userSchema = new mongoose.Schema({ kelompok: String });
                    const UserModel = mongoose.model('User', userSchema);
                    userData = await UserModel.findById(userId)
                        .select('kelompok')
                        .lean()
                        .exec() as IUser;
                }
            } catch (err) {
                console.error("Error fetch user:", err);
                userData = null;
            }

            if (userData?.kelompok && userData.kelompok !== "Tidak tersedia") {
                filter = {
                    $or: [
                        { userId, tipe: "pribadi" },
                        { kelompokId: userData.kelompok, tipe: "kelompok" }
                    ]
                };
                console.log('Filter semua (dengan kelompok):', filter);
            } else {
                filter = { userId, tipe: "pribadi" };
                console.log('Filter semua (hanya pribadi):', filter);
            }
        }

        // Filter tambahan berdasarkan jenis hewan dari URL
        if (jenis && jenis.toLowerCase() !== "semua" && jenis.toLowerCase() !== "all") {
            filter.jenisHewan = { $regex: new RegExp(jenis, 'i') }; // Case insensitive
            console.log('Added jenis filter:', filter.jenisHewan);
        }

        console.log('Find Filter:', filter);
        const ternak = await Ternak.find(filter).exec();
        console.log('Find Result:', ternak.length, 'documents');

        return new Response(JSON.stringify(ternak), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error("Error GET ternak:", error);
        return new Response(JSON.stringify({ error: "Gagal ambil data", detail: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// POST: tambah ternak
export async function POST(req: Request) {
    await connectDB();
    try {
        const body = await req.json();
        console.log('POST Ternak Body:', body);

        const { userId, kelompokId, kelompokNama, jenisHewan, jenisKelamin, umurTernak, statusTernak, kondisiKesehatan, tipe } = body;

        // Validasi data
        if (!userId || !jenisHewan || !jenisKelamin || !umurTernak || !statusTernak || !kondisiKesehatan || !tipe) {
            return new Response(JSON.stringify({ error: "Data tidak lengkap" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validasi umurTernak tidak boleh kosong
        if (!umurTernak.trim()) {
            return new Response(JSON.stringify({ error: "Umur ternak tidak boleh kosong" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const ternakData: any = {
            userId,
            jenisHewan,
            jenisKelamin,
            umurTernak: umurTernak.trim(),
            statusTernak,
            kondisiKesehatan,
            tipe
        };

        // Jika tipe kelompok, ambil data kelompok dari user
        if (tipe === "kelompok") {
            // Gunakan approach yang lebih aman untuk mongoose model
            let userData: IUser | null = null;

            try {
                if (mongoose.models.User) {
                    userData = await mongoose.models.User.findById(userId).select('kelompok').lean().exec() as IUser;
                } else {
                    const userSchema = new mongoose.Schema({
                        kelompok: String
                    });
                    const UserModel = mongoose.model('User', userSchema);
                    userData = await UserModel.findById(userId).select('kelompok').lean().exec() as IUser;
                }
            } catch (userError) {
                console.error('Error fetching user data:', userError);
                userData = null;
            }

            if (userData && userData.kelompok && userData.kelompok !== 'Tidak tersedia') {
                ternakData.kelompokId = userData.kelompok;
                ternakData.kelompokNama = `Kelompok ${userData.kelompok}`;
            } else {
                return new Response(JSON.stringify({ error: "User tidak memiliki kelompok" }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        const ternakBaru = await Ternak.create(ternakData);
        console.log('Ternak Created:', ternakBaru);

        return new Response(JSON.stringify({
            success: true,
            data: ternakBaru,
            message: "Data ternak berhasil disimpan"
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error("Error tambah ternak:", error);
        return new Response(JSON.stringify({ error: "Gagal tambah data", detail: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// PUT: update ternak
export async function PUT(req: Request) {
    await connectDB();
    try {
        const body = await req.json();
        console.log('PUT Ternak Body:', body);

        const { id, ...data } = body;

        if (!id) {
            return new Response(JSON.stringify({ error: "ID tidak ditemukan" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const ternakUpdate = await Ternak.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
        if (!ternakUpdate) {
            return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Ternak Updated:', ternakUpdate);
        return new Response(JSON.stringify(ternakUpdate), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error("Error update ternak:", error);
        return new Response(JSON.stringify({ error: "Gagal update data", detail: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// DELETE: hapus ternak
export async function DELETE(req: Request) {
    await connectDB();
    try {
        const body = await req.json();
        console.log('DELETE Ternak Body:', body);

        const { id } = body;

        if (!id) {
            return new Response(JSON.stringify({ error: "ID tidak ditemukan" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const ternakHapus = await Ternak.findByIdAndDelete(id).exec();
        if (!ternakHapus) {
            return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Ternak Deleted:', id);
        return new Response(JSON.stringify({ message: "Data berhasil dihapus" }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error("Error hapus ternak:", error);
        return new Response(JSON.stringify({ error: "Gagal hapus data", detail: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}