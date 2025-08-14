import { NextResponse } from 'next/server';
import { UserModel } from '../../../../models/User';
import { generateToken, verifyPassword } from '../../../../lib/auth';

// Handle CORS preflight requests
export async function OPTIONS() {
  const allowedOrigin = process.env.NODE_ENV === 'development'
    ? '*'
    : process.env.NEXT_PUBLIC_API_URL || '*';
    
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// POST /api/auth/login - Login user
export async function POST(request) {
  try {
    console.log('Login route called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    let { username, password } = body;

    // Pastikan username dan password ada
    if (!username || !password) {
      console.log('Missing username or password');
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Normalisasi username agar case-insensitive
    username = username.trim();
    console.log('Normalized username:', username);

    // Cari user berdasarkan username (case-insensitive)
    const user = await UserModel.findByUsername(username);
    console.log('User found:', user);
    
    if (!user) {
        console.log('User not found for username:', username);
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Log user role for debugging
    console.log('User role:', user.role);

    // Verifikasi password menggunakan bcrypt
    const isPasswordValid = await verifyPassword(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Hapus password dari objek user
    const { password: _, ...userWithoutPassword } = user;
    
    // Pastikan role ada dalam user object
    if (!userWithoutPassword.role) {
      console.log('User role not found');
      return NextResponse.json({ error: 'User data incomplete' }, { status: 500 });
    }

    // Generate token
    const token = generateToken(userWithoutPassword);
    console.log('Token generated');

    return NextResponse.json({
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}