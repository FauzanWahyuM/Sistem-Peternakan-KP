// models/Kuesioner.ts
import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IKuesioner extends Document {
    questionnaireId: string;
    userId: Types.ObjectId;
    periode?: string;
    namaPeriode?: string; // 👈 Tambahkan field namaPeriode
    bulan: number;
    bulanAwal?: number; // 👈 Tambahkan field bulanAwal
    bulanAkhir?: number; // 👈 Tambahkan field bulanAkhir
    bulanRange?: number[]; // 👈 Tambahkan field bulanRange
    tahun: number;
    answers: {
        questionId: string;
        answer: string;
    }[];
    createdAt: Date;
}

const KuesionerSchema: Schema<IKuesioner> = new Schema(
    {
        questionnaireId: { type: String, required: true },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        periode: {
            type: String,
            enum: ['jan-jun', 'jul-des']
        },
        namaPeriode: { // 👈 Tambahkan field namaPeriode
            type: String,
            enum: ['Januari-Juni', 'Juli-Desember']
        },
        bulan: { type: Number, required: true },
        bulanAwal: { type: Number }, // 👈 Tambahkan field bulanAwal
        bulanAkhir: { type: Number }, // 👈 Tambahkan field bulanAkhir
        bulanRange: [{ type: Number }], // 👈 Tambahkan field bulanRange
        tahun: { type: Number, required: true },
        answers: [
            {
                questionId: { type: String, required: true },
                answer: { type: String, required: true },
            },
        ],
        createdAt: { type: Date, default: Date.now },
    },
    { collection: "kuesioner" }
);

const Kuesioner: Model<IKuesioner> =
    mongoose.models.Kuesioner as Model<IKuesioner> ||
    mongoose.model<IKuesioner>("Kuesioner", KuesionerSchema, "kuesioner");

export default Kuesioner;