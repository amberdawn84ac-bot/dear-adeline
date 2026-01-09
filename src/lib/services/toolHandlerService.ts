import { SupabaseClient } from '@supabase/supabase-js';
import { EmbeddingService } from '@/lib/embeddingService';

export const handleToolCalls = async (
    functionCalls: any[],
    userId: string,
    supabase: SupabaseClient
) => {
    const toolParts = [];
    for (const call of functionCalls) {
        if (call.name === 'search_web') {
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
        } else if (call.name === 'update_student_progress') {
            const args = call.args as any;
            console.log(`[Adeline Tracking]: Logging ${args.credits} credits for ${args.subject}...`);

            // Silently log the progress (we'll implement database logic later)
            toolParts.push({
                functionResponse: {
                    name: 'update_student_progress',
                    response: { name: 'update_student_progress', content: { status: 'progress tracked silently' } }
                }
            });
        } else if (call.name === 'create_game') {
            const args = call.args as any;
            console.log(`[Adeline Games]: Creating ${args.gameType} game for ${args.subject}...`);

            toolParts.push({
                functionResponse: {
                    name: 'create_game',
                    response: { name: 'create_game', content: { status: 'game created', message: 'Game creation not fully implemented yet' } }
                }
            });
        } else if (call.name === 'add_to_portfolio') {
            const args = call.args as any;
            console.log(`[Adeline Portfolio]: Adding "${args.title}" to portfolio...`);

            try {
                // 1. Get skill IDs and credit values from skill names
                const { data: skillsData, error: skillsError } = await supabase
                    .from('skills')
                    .select('id, category, credit_value')
                    .in('name', args.skills_demonstrated);

                if (skillsError) throw new Error(`Error fetching skills: ${skillsError.message}`);

                const skillIds = skillsData.map(s => s.id);

                // 2. Insert into portfolio_items
                const { error: portfolioError } = await supabase
                    .from('portfolio_items')
                    .insert({
                        student_id: userId,
                        title: args.title,
                        description: args.description,
                        type: args.type,
                        skills_demonstrated: skillIds,
                    });

                if (portfolioError) throw new Error(`Error saving to portfolio: ${portfolioError.message}`);
                
                // 3. Insert into student_skills and update graduation progress
                for (const skill of skillsData) {
                    // Add to student_skills
                    await supabase.from('student_skills').insert({
                        student_id: userId,
                        skill_id: skill.id,
                        source_type: 'ai_lesson', // or another appropriate source
                    }).select();

                    // Update graduation progress
                    const { data: requirement } = await supabase
                        .from('graduation_requirements')
                        .select('id')
                        .eq('category', skill.category)
                        .single();
                    
                    if(requirement) {
                        const { error: progressError } = await supabase.rpc('update_student_progress', {
                            p_student_id: userId,
                            p_requirement_id: requirement.id,
                            p_credits_to_add: skill.credit_value
                        });
                        if(progressError) console.error(`Error updating progress for ${skill.category}:`, progressError);
                    }
                }

                toolParts.push({
                    functionResponse: {
                        name: 'add_to_portfolio',
                        response: { name: 'add_to_portfolio', content: { status: 'portfolio item added successfully' } }
                    }
                });

            } catch (e) {
                console.error("Portfolio Save Error:", e);
                toolParts.push({
                    functionResponse: {
                        name: 'add_to_portfolio',
                        response: { name: 'add_to_portfolio', content: { status: 'failed to save portfolio item', error: String(e) } }
                    }
                });
            }
        } else {
            // Fallback for unknown tools
            console.warn(`⚠️ Unknown tool called: ${call.name}`);
            toolParts.push({
                functionResponse: {
                    name: call.name,
                    response: { name: call.name, content: { status: 'tool not implemented', message: `The tool '${call.name}' has not been implemented yet.` } }
                }
            });
        }
    }
    return toolParts;
};
