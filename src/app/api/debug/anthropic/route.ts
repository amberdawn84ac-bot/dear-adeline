import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // Try different model versions to see which one works
        const modelsToTest = [
            'claude-3-sonnet-20240229',
            'claude-3-opus-20240229',
            'claude-3-haiku-20240307',
            'claude-3-5-sonnet-20240620',
            'claude-3-5-sonnet-20241022',
        ];

        const results = [];

        for (const model of modelsToTest) {
            try {
                const response = await anthropic.messages.create({
                    model,
                    max_tokens: 10,
                    messages: [{ role: 'user', content: 'Hi' }],
                });

                results.push({
                    model,
                    status: 'SUCCESS',
                    response: response.content[0].type === 'text' ? response.content[0].text : 'OK'
                });
            } catch (error: any) {
                results.push({
                    model,
                    status: 'FAILED',
                    error: error.message,
                    statusCode: error.status
                });
            }
        }

        return NextResponse.json({
            apiKeySet: !!process.env.ANTHROPIC_API_KEY,
            apiKeyPrefix: process.env.ANTHROPIC_API_KEY?.substring(0, 20),
            results
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
