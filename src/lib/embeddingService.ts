import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.warn('Warning: GOOGLE_API_KEY is not defined. EmbeddingService will fail.');
}

const genAI = new GoogleGenerativeAI(apiKey || '');
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

export class EmbeddingService {
    static async embed(text: string): Promise<number[] | null> {
        try {
            if (!text || !text.trim()) return null;

            const result = await model.embedContent(text);
            const embedding = result.embedding;
            return embedding.values;
        } catch (error) {
            console.error('Embedding Generation Error:', error);
            return null;
        }
    }

    static async embedBatch(texts: string[]): Promise<number[][] | null> {
        try {
            // text-embedding-004 supports batch embedding but for simplicity/reliability 
            // with the current SDK version we'll map promises.
            // Real batch implementation should use embedContent (it accepts arrays in some versions)
            // or separate calls if needed.

            // Note: The SDK typically expects single content valid for embedContent.
            // We will do parallel requests for now.
            const promises = texts.map(t => this.embed(t));
            const results = await Promise.all(promises);

            // Filter out nulls if strict, or keep structure?
            // Let's return null if ANY fail, or just filter.
            // For now, let's just return the valid ones, but type says number[][] | null.
            const valid = results.filter(r => r !== null) as number[][];
            return valid.length === texts.length ? valid : null;
        } catch (error) {
            console.error('Batch Embedding Error:', error);
            return null;
        }
    }
}
