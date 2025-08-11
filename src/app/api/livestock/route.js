import { NextResponse } from 'next/server';
import { LivestockModel } from '../../../models/Livestock';

// GET /api/livestock - Get all livestock with optional filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if we need statistics
    const stats = searchParams.get('stats');
    if (stats === 'true') {
      const userId = searchParams.get('userId');
      const statistics = await LivestockModel.getStatistics(userId);
      return NextResponse.json({ statistics });
    }
    
    // Check if we need to filter by user
    const userId = searchParams.get('userId');
    if (userId) {
      const livestock = await LivestockModel.findByUserId(userId);
      return NextResponse.json({ livestock });
    }
    
    // Get all livestock
    const livestock = await LivestockModel.findAll();
    return NextResponse.json({ livestock });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch livestock data' }, { status: 500 });
  }
}

// POST /api/livestock - Create a new livestock record
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.jenisHewan || !body.jenisKelamin) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const livestock = await LivestockModel.create(body);
    
    return NextResponse.json({ livestock }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create livestock record' }, { status: 500 });
  }
}