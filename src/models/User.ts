import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    nama: string;
    username: string;
    email: string;
    password: string;
    kelompok: string;
    role: string;
    status: string;
}

// Definisikan Schema
const UserSchema = new Schema<IUser>(
    {
        nama: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        kelompok: { type: String, required: true },
        role: { 
            type: String, 
            required: true, 
            enum: ["admin", "peternak", "penyuluh"] 
        },
        status: { type: String, required: true, default: "aktif" },
    },
    { timestamps: true }
);


// Model dengan typing yang benar
const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
