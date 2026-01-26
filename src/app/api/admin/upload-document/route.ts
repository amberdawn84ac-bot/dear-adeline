import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PDFService } from '@/lib/services/pdfService';

export const config = {
    api: {
        bodyParser: false, // Required for file uploads
    },
};

/**
 * POST /api/admin/upload-document
 * 
 * Upload a PDF document for processing and indexing.
 * Requires admin role.
 * 
 * Form data:
 * - file: PDF file
 * - title: Document title
 * - author: (optional) Author name
 * - subject: (optional) Subject area
 * - category: (optional) Category
 * - tags: (optional) Comma-separated tags
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        // Parse form data
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const title = formData.get('title') as string | null;
        const author = formData.get('author') as string | null;
        const subject = formData.get('subject') as string | null;
        const category = formData.get('category') as string | null;
        const tagsString = formData.get('tags') as string | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        // Check file type
        if (file.type !== 'application/pdf') {
            return NextResponse.json(
                { error: 'Only PDF files are supported' },
                { status: 400 }
            );
        }

        // Check file size (max 50MB)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 50MB' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse tags
        const tags = tagsString
            ? tagsString.split(',').map(t => t.trim()).filter(t => t.length > 0)
            : [];

        // Process the PDF
        const result = await PDFService.processPDF(
            buffer,
            {
                title,
                author: author || undefined,
                subject: subject || undefined,
                category: category || undefined,
                tags,
                uploadedBy: user.id
            },
            supabase
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Processing failed' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            sourceId: result.sourceId,
            title: result.title,
            chunkCount: result.chunkCount,
            message: `Successfully processed "${result.title}" into ${result.chunkCount} searchable chunks`
        });

    } catch (error) {
        console.error('[Upload] Error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/admin/upload-document
 * 
 * List all uploaded documents.
 * Requires admin role.
 */
export async function GET() {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        // Get all sources
        const { data: sources, error } = await supabase
            .from('knowledge_sources')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[Upload] List error:', error);
            return NextResponse.json(
                { error: 'Failed to list documents' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            sources,
            count: sources?.length || 0
        });

    } catch (error) {
        console.error('[Upload] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
