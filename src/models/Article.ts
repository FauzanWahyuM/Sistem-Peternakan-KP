import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IArtikel extends Document {
  judul: string;
  deskripsi: string;
  gambar: string;
  tanggal: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ArtikelSchema = new Schema<IArtikel>(
  {
    judul: { type: String, required: true },
    deskripsi: { type: String, required: true },
    gambar: { type: String, required: true },
    tanggal: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// gunakan Model<IArtikel> supaya tidak error di TS
const Artikel: Model<IArtikel> =
  models.Artikel || mongoose.model<IArtikel>("Artikel", ArtikelSchema);

export default Artikel;
