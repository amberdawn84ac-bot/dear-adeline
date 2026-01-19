import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        anthropic_key_exists: !!process.env.ANTHROPIC_API_KEY,
        anthropic_key_length: process.env.ANTHROPIC_API_KEY?.length || 0,
        tavily_key_exists: !!process.env.TAVILY_API_KEY,
        supabase_url_exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_anon_key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
}
