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
            },
            body: JSON.stringify({
                api_key: apiKey,
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
        const summary = results
            .map((r: any) => `${r.title}: ${r.content}`)
            .join('\n\n');

        return summary;
    } catch (error) {
        console.error('Search error:', error);
        return '';
    }
}
