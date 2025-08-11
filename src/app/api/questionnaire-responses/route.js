import { NextResponse } from 'next/server';
import { QuestionnaireResponseModel } from '../../../models/Questionnaire';

// GET /api/questionnaire-responses - Get all questionnaire responses with optional filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if we need to filter by questionnaire
    const questionnaireId = searchParams.get('questionnaireId');
    if (questionnaireId) {
      const responses = await QuestionnaireResponseModel.findByQuestionnaireId(questionnaireId);
      return NextResponse.json({ responses });
    }
    
    // Check if we need to filter by user
    const userId = searchParams.get('userId');
    if (userId) {
      const responses = await QuestionnaireResponseModel.findByUserId(userId);
      return NextResponse.json({ responses });
    }
    
    // Get all responses
    const responses = await QuestionnaireResponseModel.findAll();
    return NextResponse.json({ responses });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questionnaire responses' }, { status: 500 });
  }
}

// POST /api/questionnaire-responses - Create a new questionnaire response
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.questionnaireId || !body.userId || !body.responses) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const response = await QuestionnaireResponseModel.create(body);
    
    return NextResponse.json({ response }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create questionnaire response' }, { status: 500 });
  }
}