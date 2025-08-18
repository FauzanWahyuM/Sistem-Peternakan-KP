// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    group: { type: String },
    role: { type: String, enum: ["admin", "penyuluh", "peternak"], required: true }
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
