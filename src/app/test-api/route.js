import { NextResponse } from 'next/server';
import { UserModel } from '../../../models/User';
import { connectToDatabase } from '../../../lib/mongodb';

// GET /api/test-api - Test endpoint to check users in database
export async function GET() {
  try {
    // Connect to database
    const { db } = await connectToDatabase();
    console.log('Connected to database');
    
    // Get all users
    const users = await UserModel.findAll();
    console.log('Users in database:', users);
    
    return NextResponse.json({ 
      message: 'Database connection successful',
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        role: user.role
      }))
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ error: 'Test failed', details: error.message }, { status: 500 });
  }
}