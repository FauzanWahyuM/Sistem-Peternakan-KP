import { NextResponse } from 'next/server';
import { UserModel } from '../../../models/User';
import { hashPassword } from '../../../lib/auth';

// GET /api/users - Get all users
export async function GET(request) {
  try {
    const users = await UserModel.findAll();
    
    // Remove password field from response
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return NextResponse.json({ users: usersWithoutPassword });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create a new user
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Check if user already exists
    const existingUser = await UserModel.findByUsername(body.username);
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(body.password);
    
    // Create user
    const userData = {
      ...body,
      password: hashedPassword
    };
    
    const user = await UserModel.create(userData);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}