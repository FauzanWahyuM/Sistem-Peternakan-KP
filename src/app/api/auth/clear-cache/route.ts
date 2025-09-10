// src/app/api/auth/clear-cache/route.ts
import { NextResponse } from "next/server";

export async function POST() {
    try {
        return NextResponse.json({
            message: 'Cache cleared successfully',
            timestamp: Date.now()
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to clear cache' },
            { status: 500 }
        );
    }
}