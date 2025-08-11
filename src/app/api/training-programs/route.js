import { NextResponse } from 'next/server';
import { TrainingProgramModel } from '../../../models/TrainingProgram';

// GET /api/training-programs - Get all training programs with optional filters
export async function GET(request, { params = {} }) {
  try {
    // If we have an ID parameter, get a specific training program
    if (params.id) {
      const trainingProgram = await TrainingProgramModel.findById(params.id);
      if (!trainingProgram) {
        return NextResponse.json({ error: 'Training program not found' }, { status: 404 });
      }
      return NextResponse.json({ trainingProgram });
    }
    
    const { searchParams } = new URL(request.url);
    
    // Check if we need to filter by date range
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (startDate && endDate) {
      const trainingPrograms = await TrainingProgramModel.findByDateRange(startDate, endDate);
      return NextResponse.json({ trainingPrograms });
    }
    
    // Check if we need to search by title
    const searchTerm = searchParams.get('search');
    if (searchTerm) {
      const trainingPrograms = await TrainingProgramModel.searchByTitle(searchTerm);
      return NextResponse.json({ trainingPrograms });
    }
    
    // Check if we need to filter by user
    const userId = searchParams.get('userId');
    if (userId) {
      const trainingPrograms = await TrainingProgramModel.findByUserId(userId);
      return NextResponse.json({ trainingPrograms });
    }
    
    // Get all training programs
    const trainingPrograms = await TrainingProgramModel.findAll();
    return NextResponse.json({ trainingPrograms });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch training programs' }, { status: 500 });
  }
}

// POST /api/training-programs - Create a new training program
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.judul || !body.tanggal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const trainingProgram = await TrainingProgramModel.create(body);
    
    return NextResponse.json({ trainingProgram }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create training program' }, { status: 500 });
  }
}

// PUT /api/training-programs/:id - Update a training program
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing training program ID' }, { status: 400 });
    }
    
    const result = await TrainingProgramModel.updateById(id, body);
    
    if (!result) {
      return NextResponse.json({ error: 'Training program not found' }, { status: 404 });
    }
    
    // Fetch updated record
    const updatedTrainingProgram = await TrainingProgramModel.findById(id);
    
    return NextResponse.json({ trainingProgram: updatedTrainingProgram });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update training program' }, { status: 500 });
  }
}

// DELETE /api/training-programs/:id - Delete a training program
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing training program ID' }, { status: 400 });
    }
    
    const result = await TrainingProgramModel.deleteById(id);
    
    if (!result) {
      return NextResponse.json({ error: 'Training program not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Training program deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete training program' }, { status: 500 });
  }
}