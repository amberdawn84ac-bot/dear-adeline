import { SupabaseClient } from '@supabase/supabase-js';
import { EmbeddingService } from '@/lib/embeddingService';

export const handleToolCalls = async (
    functionCalls: any[],
    userId: string,
    supabase: SupabaseClient
) => {
    const toolParts = [];
    for (const call of functionCalls) {
        if (call.name === 'log_activity') {
            const args = call.args as any;
            console.log("TOOL CALL: log_activity", args);

            const { error } = await supabase
                .from('activity_logs')
                .insert({
                    student_id: userId,
                    type: args.type || 'text',
                    caption: args.caption,
                    translation: args.translation,
                    skills: args.skills,
                    grade: args.grade
                });

            if (error) console.error("Database Log Error:", error);

            toolParts.push({
                functionResponse: {
                    name: 'log_activity',
                    response: { name: 'log_activity', content: { status: 'logged successfully' } }
                }
            });
        } else if (call.name === 'search_web') {
            const args = call.args as any;
            console.log(`[Adeline Eyes]: Searching web for "${args.query}"...`);

            let searchResults = [];
            try {
                const tavilyApiKey = process.env.TAVILY_API_KEY;
                if (tavilyApiKey) {
                    const response = await fetch("https://api.tavily.com/search", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            api_key: tavilyApiKey,
                            query: args.query,
                            search_depth: "basic",
                            include_answer: true,
                            max_results: 3
                        })
                    });
                    const data = await response.json();
                    searchResults = data.results || [];
                } else {
                    console.warn("Tavily API Key missing. Returning mock data.");
                    searchResults = [{ title: "Mock Result", content: "TAVILY_API_KEY not found. Please add it to your environment variables." }];
                }
            } catch (e) {
                console.error("Search Error:", e);
                searchResults = [{ error: "Search failed." }];
            }
            toolParts.push({
                functionResponse: {
                    name: 'search_web',
                    response: { name: 'search_web', content: { results: searchResults } }
                }
            });
        } else if (call.name === 'remember_this') {
            const args = call.args as any;
            console.log(`[Adeline Memory]: Saving "${args.content}"...`);

            try {
                const embedding = await EmbeddingService.embed(args.content);
                if (embedding) {
                    const { error } = await supabase
                        .from('memories')
                        .insert({
                            student_id: userId,
                            content: args.content,
                            embedding: embedding,
                            metadata: { category: args.category || 'general' }
                        });

                    if (error) throw error;

                    toolParts.push({
                        functionResponse: {
                            name: 'remember_this',
                            response: { name: 'remember_this', content: { status: 'memory saved' } }
                        }
                    });
                } else {
                    throw new Error('Failed to generate embedding');
                }
            } catch (e) {
                console.error("Memory Save Error:", e);
                toolParts.push({
                    functionResponse: {
                        name: 'remember_this',
                        response: { name: 'remember_this', content: { status: 'failed to save memory', error: String(e) } }
                    }
                });
            }
        }
    }
    return toolParts;
};
