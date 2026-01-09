import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js 15/16 Route Handler
 * params must be awaited from the context object
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // 1. Await the params from the context
  const { id } = await context.params;

  try {
    // 2. Use the id to load your data
    // Example logic:
    // const conversation = await yourDataFetchFunction(id);
    
    return NextResponse.json({ 
      conversation: { id, status: "loaded" } 
    });
  } catch (error) {
    console.error("Error loading conversation:", error);
    return NextResponse.json(
      { error: "Failed to load conversation" },
      { status: 500 }
    );
  }
}