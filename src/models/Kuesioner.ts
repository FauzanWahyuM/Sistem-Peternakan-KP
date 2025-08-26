import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IKuesioner extends Document {
    questionnaireId: string;
    userId: Types.ObjectId;
    bulan: number;   // 👈 tambahkan
    tahun: number;   // 👈 tambahkan
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
            type: Schema.Types.ObjectId, // 👈 Ubah menjadi ObjectId
            ref: 'User', // 👈 Tambahkan reference ke model User
            required: true
        },
        bulan: { type: Number, required: true },
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

// ✅ pakai model name "Kuesioner", jangan campur dengan QuestionnaireResponse
const Kuesioner: Model<IKuesioner> =
    mongoose.models.Kuesioner as Model<IKuesioner> ||
    mongoose.model<IKuesioner>("Kuesioner", KuesionerSchema, "kuesioner");

export default Kuesioner;
