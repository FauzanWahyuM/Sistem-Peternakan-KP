import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITernak extends Document {
    jenisHewan: "Sapi" | "Kambing" | "Domba" | "Ayam" | "Bebek";
    jenisKelamin: "Jantan" | "Betina";
    umurTernak: string; // kalau mau angka bisa diganti Number
    statusTernak: string;
    kondisiKesehatan: "Sehat" | "Sakit";
}

const TernakSchema = new Schema<ITernak>(
    {
        jenisHewan: { type: String, enum: ["Sapi", "Kambing", "Domba", "Ayam", "Bebek"], required: true },
        jenisKelamin: { type: String, enum: ["Jantan", "Betina"], required: true },
        umurTernak: { type: String, required: true }, // bisa diganti Number kalau umur harus angka
        statusTernak: { type: String, required: true },
        kondisiKesehatan: { type: String, enum: ["Sehat", "Sakit"], required: true },
    },
    { timestamps: true }
);

const Ternak: Model<ITernak> =
    mongoose.models.Ternak || mongoose.model<ITernak>("Ternak", TernakSchema);

export default Ternak;
