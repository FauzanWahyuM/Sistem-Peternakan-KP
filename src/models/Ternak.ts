import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITernak extends Document {
    userId: string;
    kelompokId?: string;
    kelompokNama?: string;
    jenisHewan: string;
    jenisKelamin: string;
    umurTernak: string;
    statusTernak: string;
    kondisiKesehatan: string;
    tipe: 'pribadi' | 'kelompok';
    createdAt: Date;
    updatedAt: Date;
}

const TernakSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true
    },
    kelompokId: {
        type: String,
        required: false
    },
    kelompokNama: {
        type: String,
        required: false
    },
    jenisHewan: {
        type: String,
        required: true,
        enum: ['Sapi', 'Kambing', 'Domba', 'Ayam', 'Bebek']
    },
    jenisKelamin: {
        type: String,
        required: true,
        enum: ['Jantan', 'Betina']
    },
    umurTernak: {
        type: String,
        required: true
    },
    statusTernak: {
        type: String,
        required: true
    },
    penyakit: {
        type: [String], // Array of strings untuk menyimpan multiple penyakit
        default: []
    },
    kondisiKesehatan: {
        type: String,
        required: true,
        enum: ['Sehat', 'Sakit']
    },
    tipe: {
        type: String,
        required: true,
        enum: ['pribadi', 'kelompok'],
        default: 'pribadi'
    }
}, {
    timestamps: true
});

// Validasi untuk ternak kelompok
TernakSchema.path('kelompokId').validate(function (value) {
    if (this.tipe === 'kelompok') {
        return value != null && value !== '';
    }
    return true;
}, 'Kelompok ID diperlukan untuk ternak kelompok');

TernakSchema.path('kelompokNama').validate(function (value) {
    if (this.tipe === 'kelompok') {
        return value != null && value !== '';
    }
    return true;
}, 'Kelompok Nama diperlukan untuk ternak kelompok');

const Ternak: Model<ITernak> = mongoose.models.Ternak || mongoose.model<ITernak>('Ternak', TernakSchema);

export default Ternak;