import { SupabaseClient } from '@supabase/supabase-js';
import { EmbeddingService } from '@/lib/embeddingService';

// We'll use pdf-parse for Node.js PDF extraction
// Note: This requires `pnpm add pdf-parse` to be run

interface ChunkResult {
    content: string;
    pageNumber?: number;
    chunkIndex: number;
}

interface PDFProcessingResult {
    sourceId: string;
    title: string;
    chunkCount: number;
    success: boolean;
    error?: string;
}

/**
 * PDF INGESTION SERVICE
 * 
 * Handles:
 * - PDF text extraction
 * - Smart chunking with overlap
 * - Embedding generation
 * - Storage in knowledge_chunks table
 */
export class PDFService {

    // Target ~500 tokens per chunk, with 50 token overlap
    static readonly CHUNK_SIZE = 2000; // characters (~500 tokens)
    static readonly CHUNK_OVERLAP = 200; // characters (~50 tokens)

    /**
     * Process a PDF buffer and store chunks with embeddings
     */
    static async processPDF(
        pdfBuffer: Buffer,
        metadata: {
            title: string;
            author?: string;
            subject?: string;
            category?: string;
            tags?: string[];
            uploadedBy?: string;
        },
        supabase: SupabaseClient
    ): Promise<PDFProcessingResult> {
        try {
            // Step 1: Extract text from PDF
            console.log(`[PDF] Processing: ${metadata.title}`);
            const text = await this.extractText(pdfBuffer);

            if (!text || text.trim().length < 100) {
                return {
                    sourceId: '',
                    title: metadata.title,
                    chunkCount: 0,
                    success: false,
                    error: 'PDF has no extractable text (may be image-only)'
                };
            }

            console.log(`[PDF] Extracted ${text.length} characters`);

            // Step 2: Create source record
            const { data: source, error: sourceError } = await supabase
                .from('knowledge_sources')
                .insert({
                    title: metadata.title,
                    source_type: 'pdf',
                    author: metadata.author,
                    subject: metadata.subject,
                    category: metadata.category,
                    tags: metadata.tags || [],
                    uploaded_by: metadata.uploadedBy,
                    is_processed: false
                })
                .select('id')
                .single();

            if (sourceError || !source) {
                console.error('[PDF] Failed to create source:', sourceError);
                return {
                    sourceId: '',
                    title: metadata.title,
                    chunkCount: 0,
                    success: false,
                    error: 'Failed to create source record'
                };
            }

            console.log(`[PDF] Created source: ${source.id}`);

            // Step 3: Chunk the text
            const chunks = this.chunkText(text);
            console.log(`[PDF] Created ${chunks.length} chunks`);

            // Step 4: Generate embeddings and store chunks
            let storedCount = 0;
            const batchSize = 10; // Process 10 chunks at a time

            for (let i = 0; i < chunks.length; i += batchSize) {
                const batch = chunks.slice(i, i + batchSize);
                const chunkRecords = [];

                for (const chunk of batch) {
                    const embedding = await EmbeddingService.embed(chunk.content);

                    if (embedding) {
                        chunkRecords.push({
                            source_id: source.id,
                            content: chunk.content,
                            chunk_index: chunk.chunkIndex,
                            page_number: chunk.pageNumber,
                            embedding,
                            metadata: {}
                        });
                    }
                }

                if (chunkRecords.length > 0) {
                    const { error: chunkError } = await supabase
                        .from('knowledge_chunks')
                        .insert(chunkRecords);

                    if (chunkError) {
                        console.error('[PDF] Chunk insert error:', chunkError);
                    } else {
                        storedCount += chunkRecords.length;
                    }
                }

                console.log(`[PDF] Progress: ${Math.min(i + batchSize, chunks.length)}/${chunks.length} chunks`);
            }

            // Step 5: Mark source as processed
            await supabase
                .from('knowledge_sources')
                .update({
                    is_processed: true,
                    chunk_count: storedCount
                })
                .eq('id', source.id);

            console.log(`[PDF] Complete: ${storedCount} chunks stored`);

            return {
                sourceId: source.id,
                title: metadata.title,
                chunkCount: storedCount,
                success: true
            };

        } catch (error) {
            console.error('[PDF] Processing error:', error);
            return {
                sourceId: '',
                title: metadata.title,
                chunkCount: 0,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Extract text from PDF buffer
     */
    static async extractText(pdfBuffer: Buffer): Promise<string> {
        try {
            // pdf-parse v2 uses PDFParse class with data option
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { PDFParse } = await import('pdf-parse') as any;
            const parser = new PDFParse({ data: pdfBuffer, verbosity: 0 });
            const result = await parser.getText();
            return result.text || '';
        } catch (error) {
            console.error('[PDF] Text extraction failed:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }

    /**
     * Split text into overlapping chunks
     * Tries to break at sentence boundaries when possible
     */
    static chunkText(text: string): ChunkResult[] {
        const chunks: ChunkResult[] = [];

        // Clean up the text
        const cleanText = text
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/\n{3,}/g, '\n\n') // Max 2 newlines
            .trim();

        let position = 0;
        let chunkIndex = 0;

        while (position < cleanText.length) {
            // Get chunk of target size
            let end = position + this.CHUNK_SIZE;

            // If not at the end, try to break at a sentence boundary
            if (end < cleanText.length) {
                // Look for sentence ending (. ! ?) within the last 20% of the chunk
                const searchStart = position + Math.floor(this.CHUNK_SIZE * 0.8);
                const searchEnd = Math.min(end + 100, cleanText.length);
                const searchText = cleanText.substring(searchStart, searchEnd);

                // Find the last sentence boundary
                const sentenceEnd = searchText.search(/[.!?]\s+/);
                if (sentenceEnd !== -1) {
                    end = searchStart + sentenceEnd + 1; // Include the punctuation
                }
            } else {
                end = cleanText.length;
            }

            const chunkContent = cleanText.substring(position, end).trim();

            if (chunkContent.length > 50) { // Skip very short chunks
                chunks.push({
                    content: chunkContent,
                    chunkIndex,
                    // Note: Page numbers would require parsing PDF page markers
                    // This is a simplified implementation
                });
                chunkIndex++;
            }

            // Move position forward, accounting for overlap
            position = end - this.CHUNK_OVERLAP;

            // Prevent infinite loop
            if (position >= cleanText.length - 50) {
                break;
            }
        }

        return chunks;
    }

    /**
     * Search knowledge chunks
     */
    static async searchKnowledge(
        query: string,
        supabase: SupabaseClient,
        options: {
            threshold?: number;
            maxResults?: number;
            sourceType?: string;
            subject?: string;
        } = {}
    ) {
        try {
            const queryEmbedding = await EmbeddingService.embed(query);

            if (!queryEmbedding) {
                console.warn('[PDF] Failed to embed search query');
                return null;
            }

            const { data, error } = await supabase.rpc('match_knowledge', {
                query_embedding: queryEmbedding,
                match_threshold: options.threshold || 0.7,
                match_count: options.maxResults || 10,
                filter_source_type: options.sourceType || null,
                filter_subject: options.subject || null
            });

            if (error) {
                console.error('[PDF] Search error:', error);
                return null;
            }

            return data;

        } catch (error) {
            console.error('[PDF] Search failed:', error);
            return null;
        }
    }

    /**
     * Format search results for chat context injection
     */
    static formatForPrompt(results: any[]): string {
        if (!results || results.length === 0) return '';

        let formatted = '\n### 📚 KNOWLEDGE BASE CONTEXT\n\n';
        formatted += 'The following excerpts are from your curriculum library. Use them to inform your response:\n\n';

        for (const result of results) {
            const title = result.source_title || 'Unknown Source';
            const page = result.page_number ? ` (p. ${result.page_number})` : '';
            const similarity = Math.round(result.similarity * 100);

            formatted += `**${title}${page}** [${similarity}% relevant]\n`;
            formatted += `${result.content}\n\n---\n\n`;
        }

        return formatted;
    }
}
