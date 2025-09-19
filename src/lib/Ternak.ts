// lib/ternak.ts
import { ObjectId } from 'mongodb';
import dbConnect from './dbConnect';
import TernakModel from '../models/Ternak'; // Sesuaikan dengan path model Anda

export interface Ternak {
    _id: string;
    tipe: string;
    jenisHewan: string;
    jenisKelamin: string;
    umurTernak: string;
    statusTernak: string;
    kondisiKesehatan: string;
    penyakit: string[];
    userId: string;
}

export async function deleteTernak(ids: string[]) {
    try {
        await dbConnect();

        // Delete multiple documents
        const result = await TernakModel.deleteMany({
            _id: { $in: ids }
        });

        return result;
    } catch (error) {
        console.error('Error deleting ternak:', error);
        throw error;
    }
}