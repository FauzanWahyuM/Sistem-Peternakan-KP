import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    nama: string;
    username: string;
    email: string;
    password: string;
    kelompok: string;
    tempatLahir?: string;
    tanggalLahir?: Date;  
    umur?: number;        
    role: string;
    status: string;
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Definisikan Schema
const UserSchema = new Schema<IUser>(
    {
        nama: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        kelompok: { type: String, required: true },
        tempatLahir: { type: String, default: null },
        tanggalLahir: { type: Date, default: null },
        umur: { type: Number, default: null },
        role: {
            type: String,
            required: true,
            enum: ["admin", "peternak", "penyuluh"],
            lowercase: true,
        },
        status: {
            type: String,
            enum: ["Aktif", "Non-Aktif"],
            default: "Aktif",
            required: true,
        },
        profileImage: { type: String },
    },
    { timestamps: true }
);

// Model dengan typing yang benar
const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;