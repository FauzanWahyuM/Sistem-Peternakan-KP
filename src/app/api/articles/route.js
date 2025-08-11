import { NextResponse } from 'next/server';
import { ArticleModel } from '../../../models/Article';

// GET /api/articles - Get all articles with optional filters
export async function GET(request, { params = {} }) {
  try {
    // If we have an ID parameter, get a specific article
    if (params.id) {
      const article = await ArticleModel.findById(params.id);
      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      return NextResponse.json({ article });
    }
    
    const { searchParams } = new URL(request.url);
    
    // Check if we need to filter by status
    const status = searchParams.get('status');
    if (status) {
      const articles = await ArticleModel.findByStatus(status);
      return NextResponse.json({ articles });
    }
    
    // Check if we need to filter by category
    const category = searchParams.get('category');
    if (category) {
      const articles = await ArticleModel.findByCategory(category);
      return NextResponse.json({ articles });
    }
    
    // Check if we need to search by title
    const searchTerm = searchParams.get('search');
    if (searchTerm) {
      const articles = await ArticleModel.searchByTitle(searchTerm);
      return NextResponse.json({ articles });
    }
    
    // Check if we need to filter by user
    const userId = searchParams.get('userId');
    if (userId) {
      const articles = await ArticleModel.findByUserId(userId);
      return NextResponse.json({ articles });
    }
    
    // Get all articles
    const articles = await ArticleModel.findAll();
    return NextResponse.json({ articles });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

// POST /api/articles - Create a new article
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.judul || !body.konten) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Set default status to draft if not provided
    if (!body.status) {
      body.status = 'draft';
    }
    
    const article = await ArticleModel.create(body);
    
    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
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