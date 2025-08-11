import { NextResponse } from 'next/server';
import { ArticleModel } from '../../../../models/Article';

// GET /api/articles/:id - Get a specific article
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing article ID' }, { status: 400 });
    }
    
    const article = await ArticleModel.findById(id);
    
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

// PUT /api/articles/:id - Update an article
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing article ID' }, { status: 400 });
    }
    
    const result = await ArticleModel.updateById(id, body);
    
    if (!result) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    // Fetch updated record
    const updatedArticle = await ArticleModel.findById(id);
    
    return NextResponse.json({ article: updatedArticle });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

// DELETE /api/articles/:id - Delete an article
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing article ID' }, { status: 400 });
    }
    
    const result = await ArticleModel.deleteById(id);
    
    if (!result) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}