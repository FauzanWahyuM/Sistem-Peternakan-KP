import { NextResponse } from 'next/server';
import { UserModel } from '../../../models/User';
import { verifyPassword, generateToken } from '../../../lib/auth';

// POST /api/auth/login - Login user
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Find user by username
    const user = await UserModel.findByUsername(username);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Generate token
    const token = generateToken(user);

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