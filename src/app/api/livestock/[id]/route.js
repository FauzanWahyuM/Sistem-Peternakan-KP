import { NextResponse } from 'next/server';
import { LivestockModel } from '../../../../models/Livestock';

// GET /api/livestock/:id - Get a specific livestock record
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing livestock ID' }, { status: 400 });
    }
    
    const livestock = await LivestockModel.findById(id);
    
    if (!livestock) {
      return NextResponse.json({ error: 'Livestock record not found' }, { status: 404 });
    }
    
    return NextResponse.json({ livestock });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch livestock record' }, { status: 500 });
  }
}

// PUT /api/livestock/:id - Update a livestock record
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing livestock ID' }, { status: 400 });
    }
    
    const result = await LivestockModel.updateById(id, body);
    
    if (!result) {
      return NextResponse.json({ error: 'Livestock record not found' }, { status: 404 });
    }
    
    // Fetch updated record
    const updatedLivestock = await LivestockModel.findById(id);
    
    return NextResponse.json({ livestock: updatedLivestock });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update livestock record' }, { status: 500 });
  }
}

// DELETE /api/livestock/:id - Delete a livestock record
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing livestock ID' }, { status: 400 });
    }
    
    const result = await LivestockModel.deleteById(id);
    
    if (!result) {
      return NextResponse.json({ error: 'Livestock record not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Livestock record deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete livestock record' }, { status: 500 });
  }
}