import { NextRequest, NextResponse } from "next/server";

// In-memory storage for ideas (in a real app, this would be a database)
let ideas: any[] = [];
let nextId = 1;

// POST /api/ideas/[id]/vote - Vote on an idea
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // In a real implementation, we would verify the user's authentication here
    // For now, we'll just increment the vote count
    
    // Find the idea
    const ideaIndex = ideas.findIndex((idea: any) => idea.id === parseInt(id));
    
    if (ideaIndex === -1) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }
    
    // Increment votes
    ideas[ideaIndex].votes += 1;
    
    return NextResponse.json(ideas[ideaIndex]);
  } catch (error) {
    console.error("Error voting on idea:", error);
    return NextResponse.json(
      { error: "Failed to vote on idea" },
      { status: 500 }
    );
  }
}