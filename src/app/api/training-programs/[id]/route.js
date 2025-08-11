import { NextResponse } from 'next/server';
import { TrainingProgramModel } from '../../../../models/TrainingProgram';

// GET /api/training-programs/:id - Get a specific training program
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing training program ID' }, { status: 400 });
    }
    
    const trainingProgram = await TrainingProgramModel.findById(id);
    
    if (!trainingProgram) {
      return NextResponse.json({ error: 'Training program not found' }, { status: 404 });
    }
    
    return NextResponse.json({ trainingProgram });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch training program' }, { status: 500 });
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