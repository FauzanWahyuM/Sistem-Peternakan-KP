// lib/gridfs.ts
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';
import mongoose from 'mongoose';

// Interface untuk file object
interface FileObject {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}

let gridFSBucket: GridFSBucket;

export const initGridFS = async () => {
    try {
        const conn = mongoose.connection;
        if (!conn.db) {
            await mongoose.connect(process.env.MONGODB_URI!);
        }
        gridFSBucket = new GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads'
        });
        console.log('GridFS initialized successfully');
    } catch (error) {
        console.error('Failed to initialize GridFS:', error);
        throw error;
    }
};

// lib/gridfs.ts - Perbaiki uploadFile function
export const uploadFile = async (file: FileObject): Promise<string> => {
    if (!gridFSBucket) {
        await initGridFS();
    }

    return new Promise((resolve, reject) => {
        const readableStream = Readable.from(file.buffer);
        const uploadStream = gridFSBucket.openUploadStream(file.originalname, {
            metadata: {
                contentType: file.mimetype,
                originalMimetype: file.mimetype, // Simpan sebagai backup
                uploadDate: new Date(),
                size: file.size
            }
        });

        readableStream.pipe(uploadStream)
            .on('error', (error) => {
                console.error('Upload error:', error);
                reject(error);
            })
            .on('finish', () => {
                console.log('Upload finished, file ID:', uploadStream.id.toString());
                console.log('File metadata:', {
                    contentType: file.mimetype,
                    size: file.size,
                    filename: file.originalname
                });
                resolve(uploadStream.id.toString());
            });
    });
};

export const getFileStream = (fileId: string) => {
    if (!gridFSBucket) {
        throw new Error('GridFS not initialized');
    }

    try {
        const objectId = new ObjectId(fileId);
        return gridFSBucket.openDownloadStream(objectId);
    } catch (error) {
        console.error('Invalid ObjectId:', fileId, error);
        throw error;
    }
};

// Fungsi untuk mendapatkan file info termasuk contentType
export async function getFileInfo(fileId: string) {
    try {
        if (!gridFSBucket) {
            await initGridFS();
        }

        const objectId = new ObjectId(fileId);
        const files = await gridFSBucket.find({ _id: objectId }).toArray();

        if (files.length === 0) {
            console.log('No files found with ID:', fileId);
            return null;
        }

        const fileInfo = files[0];
        console.log('File found:', {
            id: fileInfo._id.toString(),
            filename: fileInfo.filename,
            length: fileInfo.length,
            metadata: fileInfo.metadata
        });

        return fileInfo;

    } catch (error) {
        console.error("Error getting file info for ID:", fileId, error);
        throw error;
    }
}

export const deleteFile = async (fileId: string): Promise<void> => {
    if (!gridFSBucket) {
        await initGridFS();
    }

    try {
        const objectId = new ObjectId(fileId);
        await gridFSBucket.delete(objectId);
        console.log('File deleted:', fileId);
    } catch (error: any) {
        console.error('Error deleting file:', fileId, error);
        throw error;
    }
};

// Inisialisasi GridFS saat modul dimuat
initGridFS().catch(console.error);