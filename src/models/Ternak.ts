import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITernak extends Document {
    userId: mongoose.Types.ObjectId;
    jenisHewan: "Sapi" | "Kambing" | "Domba" | "Ayam" | "Bebek";
    jenisKelamin: "Jantan" | "Betina";
    umurTernak: string;
    statusTernak: string;
    kondisiKesehatan: "Sehat" | "Sakit";
}

const TernakSchema = new Schema < ITernak > (
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        jenisHewan: { type: String, enum: ["Sapi", "Kambing", "Domba", "Ayam", "Bebek"], required: true },
        jenisKelamin: { type: String, enum: ["Jantan", "Betina"], required: true },
        umurTernak: { type: String, required: true },
        statusTernak: { type: String, required: true },
        kondisiKesehatan: { type: String, enum: ["Sehat", "Sakit"], required: true },
    },
    { timestamps: true }
);

// ✅ kasih type Model<ITernak>
const Ternak: Model<ITernak> =
    mongoose.models.Ternak || mongoose.model < ITernak > ("Ternak", TernakSchema);

export default Ternak;
