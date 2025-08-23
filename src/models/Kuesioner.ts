import mongoose, { Document, Schema, Model } from "mongoose";

export interface IKuesioner extends Document {
    questionnaireId: string;
    userId: string;
    answers: {
        questionId: string;
        answer: string;
    }[];
    createdAt: Date;
}

const KuesionerSchema: Schema<IKuesioner> = new Schema(
    {
        questionnaireId: { type: String, required: true },
        userId: { type: String, required: true },
        answers: [
            {
                questionId: { type: String, required: true },
                answer: { type: String, required: true },
            },
        ],
        createdAt: { type: Date, default: Date.now },
    },
    { collection: "kuesioner" } // 👈 fix nama collection
);

// ✅ pakai model name "Kuesioner", jangan campur dengan QuestionnaireResponse
const Kuesioner: Model<IKuesioner> =
    mongoose.models.Kuesioner as Model<IKuesioner> ||
    mongoose.model<IKuesioner>("Kuesioner", KuesionerSchema, "kuesioner");

export default Kuesioner;
