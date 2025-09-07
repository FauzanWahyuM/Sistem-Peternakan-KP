// models/Evaluation.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvaluation extends Document {
    userId: mongoose.Types.ObjectId;
    kelompok: string;
    nama: string;
    nilai: number;
    totalSoal: number;
    jawabanBenar: number;
    createdAt: Date;
    updatedAt: Date;
}

const EvaluationSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        kelompok: {
            type: String,
            required: true
        },
        nama: {
            type: String,
            required: true
        },
        nilai: {
            type: Number,
            required: true
        },
        totalSoal: {
            type: Number,
            required: true
        },
        jawabanBenar: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
);

const Evaluation: Model<IEvaluation> =
    mongoose.models.Evaluation || mongoose.model<IEvaluation>("Evaluation", EvaluationSchema);

export default Evaluation;