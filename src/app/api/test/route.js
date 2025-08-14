import { NextResponse } from 'next/server';

// Handle CORS preflight requests
export async function OPTIONS() {
  const allowedOrigin = process.env.NEXT_PUBLIC_API_URL 
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') // Remove /api if present
    : '*';
    
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

// GET /api/test - Test API endpoint
export async function GET() {
  return NextResponse.json({ 
    message: 'API is working correctly',
    timestamp: new Date().toISOString()
  });
}