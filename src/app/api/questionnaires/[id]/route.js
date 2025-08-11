import { NextResponse } from 'next/server';
import { QuestionnaireModel, QuestionnaireResponseModel } from '../../../../models/Questionnaire';

// GET /api/questionnaires/:id - Get a specific questionnaire
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing questionnaire ID' }, { status: 400 });
    }
    
    const questionnaire = await QuestionnaireModel.findById(id);
    
    if (!questionnaire) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
    }
    
    return NextResponse.json({ questionnaire });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questionnaire' }, { status: 500 });
  }
}

// PUT /api/questionnaires/:id - Update a questionnaire
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing questionnaire ID' }, { status: 400 });
    }
    
    const result = await QuestionnaireModel.updateById(id, body);
    
    if (!result) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
    }
    
    // Fetch updated record
    const updatedQuestionnaire = await QuestionnaireModel.findById(id);
    
    return NextResponse.json({ questionnaire: updatedQuestionnaire });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update questionnaire' }, { status: 500 });
  }
}

// DELETE /api/questionnaires/:id - Delete a questionnaire
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing questionnaire ID' }, { status: 400 });
    }
    
    const result = await QuestionnaireModel.deleteById(id);
    
    if (!result) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Questionnaire deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete questionnaire' }, { status: 500 });
  }
}