import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EmbeddingQueueService } from '@/lib/services/embeddingQueueService';

/**
 * POST /api/webhooks/embed-content
 * 
 * Webhook to add content to the embedding queue.
 * Called by scraping services when new content is found.
 * 
 * Body:
 * - type: 'opportunity' | 'article' | 'manual' | 'scraped'
 * - content: The text to embed
 * - title: (optional) Title of the content
 * - sourceUrl: (optional) Original URL
 * - contentId: (optional) Reference ID
 * - metadata: (optional) Additional metadata
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();

        // Parse request body
        const body = await req.json();
        const { type, content, title, sourceUrl, contentId, metadata } = body;

        // Validate required fields
        if (!type || !content) {
            return NextResponse.json(
                { error: 'Missing required fields: type, content' },
                { status: 400 }
            );
        }

        // Validate type
        const validTypes = ['opportunity', 'article', 'manual', 'scraped'];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
                { status: 400 }
            );
        }

        // Add to queue
        const result = await EmbeddingQueueService.enqueue(
            {
                type,
                text: content,
                title,
                sourceUrl,
                contentId,
                metadata
            },
            supabase
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to enqueue' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            queueId: result.queueId,
            message: 'Content queued for embedding'
        });

    } catch (error) {
        console.error('[Webhook] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/webhooks/embed-content
 * 
 * Get queue statistics (for monitoring).
 */
export async function GET() {
    try {
        const supabase = await createClient();
        const stats = await EmbeddingQueueService.getStats(supabase);

        return NextResponse.json({
            stats,
            healthy: true
        });

    } catch (error) {
        console.error('[Webhook] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', healthy: false },
            { status: 500 }
        );
    }
}
