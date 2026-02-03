import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Adapter to use Gemini with the GenUI orchestrator
 * Wraps the Google Generative AI SDK for use in the application
 */
export class GeminiAdapter {
  private model: string;
  private genAI: GoogleGenerativeAI | null = null;

  constructor(modelName: string = 'gemini-2.0-flash') {
    this.model = modelName;

    // Only initialize if API key is available
    const apiKey = process.env.GOOGLE_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateContent(prompt: string): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    const model = this.genAI.getGenerativeModel({ model: this.model });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }

  async streamGenerateContent(prompt: string): Promise<AsyncIterable<string>> {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    const model = this.genAI.getGenerativeModel({ model: this.model });
    const result = await model.generateContentStream(prompt);

    async function* streamText() {
      for await (const chunk of result.stream) {
        yield chunk.text();
      }
    }

    return streamText();
  }

  getModelName(): string {
    return this.model;
  }
}
