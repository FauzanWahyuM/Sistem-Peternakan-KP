import { NextResponse } from 'next/server';
import { UserModel } from '../../../../models/User';
import { hashPassword } from '../../../../lib/auth';

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
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}