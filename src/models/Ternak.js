import mongoose from "mongoose";

const TernakSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // biar tiap ternak terhubung ke user
        ref: "User",
        required: true,
    },
    jenisHewan: {
        type: String,
        enum: ['Sapi', 'Kambing', 'Domba', 'Ayam', 'Bebek'],
        required: true,
    },
    jenisKelamin: {
        type: String,
        enum: ['Jantan', 'Betina'],
        required: true,
    },
    umurTernak: {
        type: String, // contoh: "2 tahun", "3 bulan"
        required: true,
    },
    statusTernak: {
        type: String, // fleksibel (disesuaikan di frontend)
        required: true,
    },
    kondisiKesehatan: {
        type: String,
        enum: ['Sehat', 'Sakit'],
        required: true,
    },
}, { timestamps: true });

export default mongoose.models.Ternak || mongoose.model("Ternak", TernakSchema);
