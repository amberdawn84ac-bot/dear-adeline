import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { EmbeddingQueueService } from '@/lib/services/embeddingQueueService';

// Create service-level supabase client for CRON jobs
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/cron/process-embeddings
 * 
 * CRON endpoint to process the embedding queue.
 * Configure in vercel.json or your CRON service:
 * 
 * ```json
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-embeddings",
 *     "schedule": "0 * * * *"  // Every hour
 *   }]
 * }
 * ```
 */
export async function GET(req: Request) {
    try {
        // Verify CRON secret (optional but recommended)
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            console.warn('[CRON] Unauthorized access attempt');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('[CRON] Starting embedding queue processing...');

        // Process the queue
        const result = await EmbeddingQueueService.processQueue(supabase, 20);

        console.log(`[CRON] Complete: ${result.processed} processed, ${result.failed} failed`);

        // Get updated stats
        const stats = await EmbeddingQueueService.getStats(supabase);

        return NextResponse.json({
            success: true,
            processed: result.processed,
            failed: result.failed,
            queueStats: stats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[CRON] Error:', error);
        return NextResponse.json(
            {
                error: 'Processing failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
