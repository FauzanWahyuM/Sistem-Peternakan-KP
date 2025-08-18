import { NextResponse } from 'next/server';
import { UserModel } from '../../../../models/User';
import { hashPassword } from '../../../../lib/auth';

// Handle CORS preflight requests
export async function OPTIONS() {
  const allowedOrigin = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') // Remove /api if present
    : '*';
    
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

// POST /api/auth/register - Register a new user
export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('Register request received:', body.username);
    
    // Hash password
    const hashedPassword = await hashPassword(body.password);
    
    // Create user
    const userData = {
      ...body,
      password: hashedPassword
    };
    
    const user = await UserModel.create(userData);
    
    console.log('User created successfully:', user.username);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({ 
      message: 'User created successfully',
      user: userWithoutPassword
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    // Return more specific error message
    if (error.message === 'Username already exists' || error.message === 'Email already exists') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Registration failed: ' + error.message }, { status: 500 });
  }
}