import { NextRequest, NextResponse } from "next/server";

// In-memory storage for ideas (in a real app, this would be a database)
let ideas: any[] = [];
let nextId = 1;

// GET /api/ideas - Get all ideas
export async function GET() {
  return NextResponse.json(ideas);
}

// POST /api/ideas - Create a new idea
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { title, description, category, author } = body;
    
    // Validate required fields
    if (!title || !description || !category || !author) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Create new idea
    const newIdea = {
      id: nextId++,
      title,
      description,
      category,
      author,
      votes: 0,
      createdAt: new Date().toISOString(),
    };
    
    ideas.push(newIdea);
    
    return NextResponse.json(newIdea, { status: 201 });
  } catch (error) {
    console.error("Error creating idea:", error);
    return NextResponse.json(
      { error: "Failed to create idea" },
      { status: 500 }
    );
  }
}