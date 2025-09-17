// models/Kelompok.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IKelompok extends Document {
    kelompokid: string;
    nama: string;
    anggota: string[];
    status: 'aktif' | 'non-aktif' | 'pending';
    tanggalDibuat: Date;
    tanggalDiupdate?: Date;
}

const KelompokSchema: Schema = new Schema({
    kelompokid: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    nama: {
        type: String,
        required: true,
        trim: true
    },
    anggota: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['aktif', 'non-aktif', 'pending'],
        default: 'aktif'
    },
    tanggalDibuat: {
        type: Date,
        default: Date.now
    },
    tanggalDiupdate: {
        type: Date,
        default: Date.now
    }
});

// Update tanggalDiupdate sebelum menyimpan
KelompokSchema.pre('save', function (next) {
    (this as any).tanggalDiupdate = new Date();
    next();
});

export default mongoose.models.Kelompok || mongoose.model<IKelompok>('Kelompok', KelompokSchema);