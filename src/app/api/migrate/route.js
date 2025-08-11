import { NextResponse } from 'next/server';
import { migrateFromExtractedData } from '../../../lib/migrate-localstorage';

// POST /api/migrate - Migrate data from localStorage to MongoDB
export async function POST(request) {
  try {
    // Check for authorization header (in a real app, use proper auth)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.MIGRATION_TOKEN || 'migration-token';
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    // Run the migration
    const result = await migrateFromExtractedData(body);
    
    if (result) {
      return NextResponse.json({ message: 'Migration completed successfully' });
    } else {
      return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed: ' + error.message }, { status: 500 });
  }
}

// GET /api/migrate - Migration status endpoint
export async function GET() {
  return NextResponse.json({ 
    message: 'Migration endpoint ready', 
    instructions: 'POST to this endpoint with localStorage data to migrate' 
  });
}