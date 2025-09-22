
import { NextRequest } from 'next/server';
import { getServerSession } from "next-auth";
import connectDB from "../../../../lib/dbConnect";
import Ternak from "../../../../models/Ternak";
import mongoose from 'mongoose';
import { authOptions } from "../../../../lib/authOptions";

// Interface user untuk ambil kelompok
interface IUser {
    _id: mongoose.Types.ObjectId;
    kelompok?: string;
}

export async function GET(req: NextRequest) {
    await connectDB();

    try {
        // 🔑 Ambil session user login
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new Response(JSON.stringify([]), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const currentUserId = session.user.id;

        // 🔎 Ambil kelompok user dari DB
        let userData: IUser | null = null;
        try {
            if (mongoose.models.User) {
                userData = await mongoose.models.User.findById(currentUserId)
                    .select('kelompok')
                    .lean()
                    .exec() as IUser;
            } else {
                const userSchema = new mongoose.Schema({ kelompok: String });
                const UserModel = mongoose.model('User', userSchema);
                userData = await UserModel.findById(currentUserId)
                    .select('kelompok')
                    .lean()
                    .exec() as IUser;
            }
        } catch (err) {
            console.error("Error fetch user:", err);
        }

        // 🛡 Filter khusus untuk dashboard
        let filter: any = {};
        if (userData?.kelompok && userData.kelompok !== "Tidak tersedia") {
            filter = {
                $or: [
                    { userId: currentUserId, tipe: "pribadi" },
                    { kelompokId: userData.kelompok, tipe: "kelompok" }
                ]
            };
        } else {
            filter = { userId: currentUserId, tipe: "pribadi" };
        }

        // 📦 Ambil semua data ternak sesuai filter
        const ternak = await Ternak.find(filter).exec();
        return new Response(JSON.stringify(ternak), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error("Error GET dashboard ternak:", error);
        return new Response(JSON.stringify({ error: "Gagal ambil data dashboard", detail: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
