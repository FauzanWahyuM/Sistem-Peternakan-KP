import { NextResponse } from 'next/server';
import { QuestionnaireResponseModel } from '../../../../models/Questionnaire';

// GET /api/questionnaire-responses/:id - Get a specific questionnaire response
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing response ID' }, { status: 400 });
    }
    
    const response = await QuestionnaireResponseModel.findById(id);
    
    if (!response) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }
    
    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch response' }, { status: 500 });
  }
}

// PUT /api/questionnaire-responses/:id - Update a questionnaire response
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing response ID' }, { status: 400 });
    }
    
    // Note: In practice, responses shouldn't be updated, but we'll include this for completeness
    // const result = await QuestionnaireResponseModel.updateById(id, body);
    
    // if (!result) {
    //   return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    // }
    
    // Fetch updated record
    // const updatedResponse = await QuestionnaireResponseModel.findById(id);
    
    return NextResponse.json({ message: 'Updating responses is not supported' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update response' }, { status: 500 });
  }
}

// DELETE /api/questionnaire-responses/:id - Delete a questionnaire response
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing response ID' }, { status: 400 });
    }
    
    const result = await QuestionnaireResponseModel.deleteById(id);
    
    if (!result) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Response deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete response' }, { status: 500 });
  }
}