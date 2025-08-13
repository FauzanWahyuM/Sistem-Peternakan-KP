import { NextResponse } from 'next/server';
import { UserModel } from '../../../../models/User';

// GET /api/users/:id - Get a specific user
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }
    
    const user = await UserModel.findById(id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Remove password field from response
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Fetch user error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/users/:id - Update a user
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }
    
    // Hash password if it's being updated
    let updateData = { ...body };
    if (body.password) {
      const { hashPassword } = await import('../../../../lib/auth');
      updateData.password = await hashPassword(body.password);
    }
    
    const result = await UserModel.updateById(id, updateData);
    
    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Fetch updated record
    const updatedUser = await UserModel.findById(id);
    const { password, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users/:id - Delete a user
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const result = await UserModel.deleteById(id);
    
    if (result) {
      return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}