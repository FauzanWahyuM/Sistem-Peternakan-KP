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

// POST: tambah ternak (support single, bulk & jumlahTernak)
export async function POST(req: Request) {
    await connectDB();
    try {
        const body = await req.json();
        console.log('POST Ternak Body:', body);

        // Kalau request berupa array langsung
        let dataArray: any[] = [];

        if (Array.isArray(body)) {
            dataArray = body;
        }
        // Kalau ada jumlahTernak di body, duplikasi datanya
        else if (body.jumlahTernak && body.jumlahTernak > 1) {
            dataArray = Array.from({ length: body.jumlahTernak }, () => {
                const { jumlahTernak, ...rest } = body;
                return { ...rest };
            });
        }
        // Default: 1 data saja
        else {
            dataArray = [body];
        }

        // Validasi data
        for (const item of dataArray) {
            if (!item.userId || !item.jenisHewan || !item.jenisKelamin || !item.umurTernak ||
                !item.statusTernak || !item.kondisiKesehatan || !item.tipe) {
                return new Response(JSON.stringify({ error: "Data tidak lengkap" }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            if (!item.umurTernak.trim()) {
                return new Response(JSON.stringify({ error: "Umur ternak tidak boleh kosong" }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Mapping data
        const processedData = await Promise.all(
            dataArray.map(async (item) => {
                const ternakData: any = {
                    userId: item.userId,
                    jenisHewan: item.jenisHewan,
                    jenisKelamin: item.jenisKelamin,
                    umurTernak: item.umurTernak.trim(),
                    statusTernak: item.statusTernak,
                    kondisiKesehatan: item.kondisiKesehatan,
                    tipe: item.tipe,
                    penyakit: item.penyakit || []
                };

                // Kalau tipe kelompok → ambil kelompok user
                if (item.tipe === "kelompok") {
                    let userData: IUser | null = null;
                    try {
                        if (mongoose.models.User) {
                            userData = await mongoose.models.User.findById(item.userId)
                                .select('kelompok')
                                .lean()
                                .exec() as IUser;
                        } else {
                            const userSchema = new mongoose.Schema({ kelompok: String });
                            const UserModel = mongoose.model('User', userSchema);
                            userData = await UserModel.findById(item.userId)
                                .select('kelompok')
                                .lean()
                                .exec() as IUser;
                        }
                    } catch (err) {
                        console.error("Error fetch user:", err);
                        userData = null;
                    }

                    if (userData?.kelompok && userData.kelompok !== "Tidak tersedia") {
                        ternakData.kelompokId = userData.kelompok;
                        ternakData.kelompokNama = `Kelompok ${userData.kelompok}`;
                    } else {
                        throw new Error("User tidak memiliki kelompok");
                    }
                }

                return ternakData;
            })
        );

        // Simpan ke DB sekaligus
        const result = await Ternak.insertMany(processedData);

        return new Response(JSON.stringify({
            success: true,
            data: result,
            message: `Data ternak berhasil disimpan (${result.length} entri)`
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
// DELETE: hapus ternak (support single & bulk)
export async function DELETE(req: Request) {
    await connectDB();
    try {
        const body = await req.json();
        console.log('DELETE Ternak Body:', body);

        const { id, ids } = body;

        if (!id && (!ids || !Array.isArray(ids))) {
            return new Response(JSON.stringify({ error: "ID atau daftar ID tidak ditemukan" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (ids && Array.isArray(ids)) {
            // Bulk delete
            const objectIds = ids.map((id: string) => new mongoose.Types.ObjectId(id));
            const result = await Ternak.deleteMany({ _id: { $in: objectIds } }).exec();
            console.log('Bulk Deleted:', result.deletedCount, 'records');

            return new Response(JSON.stringify({
                message: `${result.deletedCount} data berhasil dihapus`
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else if (id) {
            // Single delete
            const ternakHapus = await Ternak.findByIdAndDelete(new mongoose.Types.ObjectId(id)).exec();
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
        }

    } catch (error: any) {
        console.error("Error hapus ternak:", error);
        return new Response(JSON.stringify({ error: "Gagal hapus data", detail: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}