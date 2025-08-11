import { NextResponse } from 'next/server';
import { QuestionnaireModel, QuestionnaireResponseModel } from '../../../models/Questionnaire';

// GET /api/questionnaires - Get all questionnaires with optional filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if we need to filter by user
    const userId = searchParams.get('userId');
    if (userId) {
      const questionnaires = await QuestionnaireModel.findByUserId(userId);
      return NextResponse.json({ questionnaires });
    }
    
    // Check if we need responses for a specific user
    const userResponses = searchParams.get('userResponses');
    if (userResponses) {
      const responses = await QuestionnaireResponseModel.findByUserId(userResponses);
      return NextResponse.json({ responses });
    }
    
    // Get all questionnaires
    const questionnaires = await QuestionnaireModel.findAll();
    return NextResponse.json({ questionnaires });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questionnaire data' }, { status: 500 });
  }
}

// POST /api/questionnaires - Create a new questionnaire
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.judul || !body.pertanyaan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const questionnaire = await QuestionnaireModel.create(body);
    
    return NextResponse.json({ questionnaire }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create questionnaire' }, { status: 500 });
  }
}