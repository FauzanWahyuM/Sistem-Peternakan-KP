import { NextResponse } from 'next/server';
import { staticUsers } from '../../lib/static-users';

// GET /api/test-api - Test endpoint to check users in database
export async function GET() {
  try {
    console.log('Using static user data');
    
    // Get all users from static data
    const users = staticUsers;
    console.log('Users in static data:', users);
    
    return NextResponse.json({
      message: 'Static data implementation successful',
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role
      }))
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ error: 'Test failed', details: error.message }, { status: 500 });
  }
}