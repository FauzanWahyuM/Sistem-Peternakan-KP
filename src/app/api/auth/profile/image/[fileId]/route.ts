// src/app/api/auth/profile/image/[fileId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getFileStream, getFileInfo } from "../../../../../../lib/gridfs";
import connectDB from "../../../../../../lib/dbConnect";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ fileId: string }> }
) {
    try {
        await connectDB();

        const resolvedParams = await params;
        const { fileId } = resolvedParams;
        console.log('Requested file ID:', fileId);

        // Validasi ObjectId
        if (!fileId || fileId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(fileId)) {
            console.log('Invalid file ID format');
            return NextResponse.redirect(new URL('/Vector.svg', request.url));
        }

        // Dapatkan informasi file
        const fileInfo = await getFileInfo(fileId);
        if (!fileInfo) {
            console.log('File not found in GridFS');
            return NextResponse.redirect(new URL('/Vector.svg', request.url));
        }

        console.log('File info:', {
            filename: fileInfo.filename,
            metadata: fileInfo.metadata,
            contentType: fileInfo.metadata?.contentType,
            length: fileInfo.length
        });

        // Dapatkan stream file
        const stream = getFileStream(fileId);

        // Konversi stream ke buffer
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }

        if (chunks.length === 0) {
            console.log('No data received from GridFS stream');
            return NextResponse.redirect(new URL('/Vector.svg', request.url));
        }

        const buffer = Buffer.concat(chunks);
        console.log('Buffer length:', buffer.length);

        // Tentukan content type dengan prioritas lebih baik
        let contentType = 'application/octet-stream';

        // 1. Coba dari metadata (prioritas utama)
        if (fileInfo.metadata?.contentType) {
            contentType = fileInfo.metadata.contentType;
            console.log('Using metadata contentType:', contentType);
        }
        // 2. Coba deteksi dari buffer (deteksi magic numbers)
        else if (buffer.length > 0) {
            // Deteksi tipe gambar dari magic numbers
            const magicNumbers: { [key: string]: string } = {
                'ffd8ffe0': 'image/jpeg', // JPEG
                'ffd8ffe1': 'image/jpeg', // JPEG
                'ffd8ffe2': 'image/jpeg', // JPEG
                '89504e47': 'image/png',  // PNG
                '47494638': 'image/gif',  // GIF
                '52494646': 'image/webp', // WEBP
                '3c737667': 'image/svg+xml', // SVG
            };

            const hexStart = buffer.slice(0, 4).toString('hex');
            console.log('File magic numbers:', hexStart);

            for (const [magic, type] of Object.entries(magicNumbers)) {
                if (hexStart.startsWith(magic)) {
                    contentType = type;
                    console.log('Detected content type from magic numbers:', contentType);
                    break;
                }
            }
        }
        // 3. Coba dari filename (fallback)
        else if (fileInfo.filename) {
            const extension = fileInfo.filename.toLowerCase().split('.').pop();
            const extensionMap: { [key: string]: string } = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'webp': 'image/webp',
                'svg': 'image/svg+xml',
                'jfif': 'image/jpeg',
                'ico': 'image/x-icon',
                'bmp': 'image/bmp',
                'tiff': 'image/tiff'
            };
            if (extension && extensionMap[extension]) {
                contentType = extensionMap[extension];
                console.log('Using extension-based contentType:', contentType);
            }
        }

        // Validasi bahwa ini adalah gambar
        if (!contentType.startsWith('image/')) {
            console.log('Invalid content type, redirecting to default image:', contentType);
            return NextResponse.redirect(new URL('/Vector.svg', request.url));
        }

        console.log('Sending image response:', {
            contentType,
            bufferLength: buffer.length,
            isImage: contentType.startsWith('image/')
        });

        // Return response gambar
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });

    } catch (error: any) {
        console.error('Error in image endpoint:', error.message);
        console.error(error.stack);

        // Redirect ke default image pada error
        return NextResponse.redirect(new URL('/Vector.svg', request.url));
    }
}