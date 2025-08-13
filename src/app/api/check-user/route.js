import { NextResponse } from 'next/server';
import { UserModel } from '../../../models/User';

// GET /api/check-user/[username] - Check a specific user
export async function GET(request, { params }) {
  try {
    const { username } = params;
    
    // Find user by username
    const user = await UserModel.findByUsername(username);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        username: username
      }, { status: 404 });
    }
    
    // Return user info (excluding password for security)
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({ 
      user: userWithoutPassword,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    });
  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json({ 
      error: 'Failed to check user',
      details: error.message 
    }, { status: 500 });
  }
}