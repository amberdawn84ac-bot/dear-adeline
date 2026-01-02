import { sanitizeForPrompt } from './sanitize';

// Tavily Search API helper
// Uses direct fetch instead of SDK to avoid npm install issues

export async function searchWeb(query: string): Promise<string> {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
        console.warn('TAVILY_API_KEY not set, skipping search');
        return '';
    }

    try {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                query,
                search_depth: 'basic',
                max_results: 3,
            }),
        });

        if (!response.ok) {
            console.error('Tavily API error:', response.statusText);
            return '';
        }

        const data = await response.json();

        // Combine results into a summary
        const results = data.results || [];

        // Define a type for the search results to avoid using 'any'
        interface TavilyResult {
            title: string;
            content: string;
        }

        const summary = results
            .map((r: TavilyResult) => `${r.title}: ${r.content}`)
            .join('\n\n');

        // Sanitize the output to prevent prompt injection from web content
        return sanitizeForPrompt(summary);
    } catch (error) {
        console.error('Search error:', error);
        return '';
    }
}
