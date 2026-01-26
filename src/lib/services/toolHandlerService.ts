import { SupabaseClient } from '@supabase/supabase-js';
import { EmbeddingService } from '@/lib/embeddingService';
import { MasteryService } from './masteryService';

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

            try {
                // Map subject to graduation requirement category
                const subjectToCategoryMap: Record<string, string> = {
                    'math': 'Math',
                    'mathematics': 'Math',
                    'science': "God's Creation & Science",
                    'biology': "God's Creation & Science",
                    'chemistry': "God's Creation & Science",
                    'physics': "God's Creation & Science",
                    'health': 'Health/Naturopathy',
                    'naturopathy': 'Health/Naturopathy',
                    'food': 'Food Systems',
                    'agriculture': 'Food Systems',
                    'farming': 'Food Systems',
                    'government': 'Government/Economics',
                    'economics': 'Government/Economics',
                    'civics': 'Government/Economics',
                    'justice': 'Justice',
                    'law': 'Justice',
                    'discipleship': 'Discipleship',
                    'theology': 'Discipleship',
                    'bible': 'Discipleship',
                    'history': 'History',
                    'english': 'English/Lit',
                    'literature': 'English/Lit',
                    'writing': 'English/Lit',
                    'reading': 'English/Lit'
                };

                const category = subjectToCategoryMap[args.subject.toLowerCase()] || args.subject;

                // Get the graduation requirement for this category
                const { data: requirement, error: reqError } = await supabase
                    .from('graduation_requirements')
                    .select('id')
                    .eq('category', category)
                    .single();

                if (reqError) {
                    console.warn(`No graduation requirement found for category: ${category}`);
                    throw reqError;
                }

                if (requirement) {
                    // Update graduation progress using RPC
                    const { error: progressError } = await supabase.rpc('update_student_progress', {
                        p_student_id: userId,
                        p_requirement_id: requirement.id,
                        p_credits_to_add: args.credits
                    });

                    if (progressError) throw progressError;

                    // Also log the activity for transparency
                    await supabase.from('activity_logs').insert({
                        student_id: userId,
                        caption: args.activity,
                        translation: `${category}: ${args.activity}`,
                        skills: null,
                        grade: null
                    });

                    console.log(`✅ Tracked ${args.credits} credits for ${category}`);
                }

                toolParts.push({
                    functionResponse: {
                        name: 'update_student_progress',
                        response: {
                            name: 'update_student_progress',
                            content: {
                                status: 'progress tracked successfully',
                                credits: args.credits,
                                category: category
                            }
                        }
                    }
                });
            } catch (e) {
                console.error('Progress Tracking Error:', e);
                toolParts.push({
                    functionResponse: {
                        name: 'update_student_progress',
                        response: {
                            name: 'update_student_progress',
                            content: {
                                status: 'failed to track progress',
                                error: String(e)
                            }
                        }
                    }
                });
            }
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

                    if (requirement) {
                        const { error: progressError } = await supabase.rpc('update_student_progress', {
                            p_student_id: userId,
                            p_requirement_id: requirement.id,
                            p_credits_to_add: skill.credit_value
                        });
                        if (progressError) console.error(`Error updating progress for ${skill.category}:`, progressError);
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
        } else if (call.name === 'create_library_content') {
            const args = call.args as any;
            console.log(`[Adeline Library]: Creating "${args.title}" for the project library...`);

            try {
                // Parse comma-separated fields
                const materials = args.materials ? args.materials.split(',').map((m: string) => m.trim()) : [];
                const gradeLevels = args.grade_levels ? args.grade_levels.split(',').map((g: string) => g.trim()) : [];
                const keyConcepts = args.key_concepts ? args.key_concepts.split(',').map((k: string) => k.trim()) : [];

                // Insert into library_projects table
                const { error } = await supabase
                    .from('library_projects')
                    .insert({
                        title: args.title,
                        description: args.lesson_content.substring(0, 200) + '...', // First 200 chars as description
                        category: args.category,
                        instructions: args.project_instructions,
                        materials: materials,
                        lesson_content: args.lesson_content,
                        lesson_type: 'ai_generated',
                        key_concepts: keyConcepts,
                        grade_levels: gradeLevels,
                        credit_value: 0.01, // Default 0.01 credit (about 1 hour of work)
                        difficulty: 'beginner', // Default difficulty
                        estimated_time: '30-60 minutes', // Default time
                        approved: false, // Requires admin approval
                        approval_status: 'pending'
                    });

                if (error) throw error;

                toolParts.push({
                    functionResponse: {
                        name: 'create_library_content',
                        response: {
                            name: 'create_library_content',
                            content: {
                                status: 'library content created successfully',
                                message: `"${args.title}" has been added to the project library and is pending approval!`
                            }
                        }
                    }
                });
            } catch (e) {
                console.error("Library Content Creation Error:", e);
                toolParts.push({
                    functionResponse: {
                        name: 'create_library_content',
                        response: {
                            name: 'create_library_content',
                            content: {
                                status: 'failed to create library content',
                                error: String(e)
                            }
                        }
                    }
                });
            }
        } else if (call.name === 'log_activity') {
            const args = call.args as any;
            console.log(`[Adeline Activity Log]: "${args.caption}" → ${args.translation}`);

            try {
                // Process Skills for Mastery
                let masteryResults = [];
                if (args.skills) {
                    const skillList = typeof args.skills === 'string'
                        ? args.skills.split(',').map((s: string) => s.trim())
                        : Array.isArray(args.skills) ? args.skills : [];

                    if (skillList.length > 0) {
                        masteryResults = await MasteryService.processSkills(userId, skillList, supabase);
                    }
                }

                // Insert into activity_logs table
                const { error } = await supabase
                    .from('activity_logs')
                    .insert({
                        student_id: userId,
                        caption: args.caption,
                        translation: args.translation,
                        skills: args.skills || null,
                        grade: args.grade || null
                    });

                if (error) throw error;

                toolParts.push({
                    functionResponse: {
                        name: 'log_activity',
                        response: {
                            name: 'log_activity',
                            content: {
                                status: 'activity logged successfully',
                                message: `Logged: ${args.caption} as ${args.translation}. ${masteryResults.length} skills processed.`
                            }
                        }
                    }
                });
            } catch (e) {
                console.error("Activity Log Error:", e);
                toolParts.push({
                    functionResponse: {
                        name: 'log_activity',
                        response: {
                            name: 'log_activity',
                            content: {
                                status: 'failed to log activity',
                                error: String(e)
                            }
                        }
                    }
                });
            }
        } else if (call.name === 'generate_student_game') {
            const args = call.args as any;
            console.log(`[Game Generation]: Creating "${args.title}" (${args.gameType})...`);

            try {
                // Save student game to database
                const { data: gameData, error: gameError } = await supabase
                    .from('student_games')
                    .insert({
                        student_id: userId,
                        title: args.title,
                        description: args.description || `A ${args.gameType} game about ${args.subject}`,
                        game_type: args.gameType,
                        subject: args.subject,
                        skill_id: args.skillId || null,
                        manifest: args.manifest,
                        is_public: false // Students can make it public later
                    })
                    .select()
                    .single();

                if (gameError) throw new Error(`Error saving game: ${gameError.message}`);

                // Add to portfolio
                await supabase
                    .from('portfolio_items')
                    .insert({
                        student_id: userId,
                        title: `Game: ${args.title}`,
                        description: `Student-designed ${args.gameType} game about ${args.subject}`,
                        type: 'game',
                        content: JSON.stringify({ gameId: gameData.id }),
                        skills_demonstrated: args.skillId ? [args.skillId] : []
                    });

                toolParts.push({
                    functionResponse: {
                        name: 'generate_student_game',
                        response: {
                            name: 'generate_student_game',
                            content: {
                                status: 'game created successfully',
                                gameId: gameData.id,
                                message: `Game "${args.title}" has been created and saved to your portfolio!`
                            }
                        }
                    }
                });
            } catch (e) {
                console.error("Game Generation Error:", e);
                toolParts.push({
                    functionResponse: {
                        name: 'generate_student_game',
                        response: {
                            name: 'generate_student_game',
                            content: {
                                status: 'failed to create game',
                                error: String(e)
                            }
                        }
                    }
                });
            }
        } else if (call.name === 'create_project') {
            const args = call.args as any;
            console.log(`[Adeline Projects]: Creating project "${args.title}" in journal...`);

            try {
                const { data: entry, error } = await supabase
                    .from('spiritual_journal_entries')
                    .insert({
                        student_id: userId,
                        title: `Project: ${args.title}`,
                        content: `${args.description}\n\n${args.manifest}`,
                        tags: [...(args.tags || []), 'project', 'plan'],
                        mood: 'excited' // Default mood for starting a project
                    })
                    .select()
                    .single();

                if (error) throw error;

                toolParts.push({
                    functionResponse: {
                        name: 'create_project',
                        response: {
                            name: 'create_project',
                            content: {
                                status: 'project created',
                                entryId: entry.id,
                                message: `I've saved the plan for "${args.title}" in your journal!`
                            }
                        }
                    }
                });
            } catch (e) {
                console.error("Project Creation Error:", e);
                toolParts.push({
                    functionResponse: {
                        name: 'create_project',
                        response: {
                            name: 'create_project',
                            content: {
                                status: 'failed to create project',
                                error: String(e)
                            }
                        }
                    }
                });
            }
        } else if (call.name === 'share_sketchnote') {
            const args = call.args as { topic: string; subject?: string; addToJournal?: string };
            console.log(`[Adeline Sketchnotes]: Searching for "${args.topic}"...`);

            try {
                // Search for matching sketchnotes
                let query = supabase
                    .from('sketchnotes')
                    .select('*')
                    .ilike('topic', `%${args.topic}%`);

                if (args.subject) {
                    query = query.ilike('subject', `%${args.subject}%`);
                }

                const { data: sketchnotes, error: searchError } = await query.limit(3);

                if (searchError) throw searchError;

                if (!sketchnotes || sketchnotes.length === 0) {
                    toolParts.push({
                        functionResponse: {
                            name: 'share_sketchnote',
                            response: {
                                name: 'share_sketchnote',
                                content: {
                                    status: 'no sketchnotes found',
                                    message: `No sketchnotes found for "${args.topic}". Try a different topic.`
                                }
                            }
                        }
                    });
                } else {
                    const sketchnote = sketchnotes[0]; // Use best match

                    // Optionally add to today's journal
                    let journalMessage = '';
                    if (args.addToJournal === 'true') {
                        // Get or create today's journal entry
                        const today = new Date().toISOString().split('T')[0];

                        const { data: existingEntry } = await supabase
                            .from('journal_entries')
                            .select('id')
                            .eq('student_id', userId)
                            .eq('entry_date', today)
                            .maybeSingle();

                        let journalEntryId = existingEntry?.id;

                        if (!journalEntryId) {
                            // Create today's journal entry
                            const { data: newEntry } = await supabase
                                .from('journal_entries')
                                .insert({
                                    student_id: userId,
                                    entry_date: today
                                })
                                .select('id')
                                .single();
                            journalEntryId = newEntry?.id;
                        }

                        if (journalEntryId) {
                            // Attach sketchnote to journal
                            await supabase
                                .from('journal_sketchnotes')
                                .upsert({
                                    journal_entry_id: journalEntryId,
                                    sketchnote_id: sketchnote.id
                                }, {
                                    onConflict: 'journal_entry_id,sketchnote_id'
                                });
                            journalMessage = ' Added to your journal!';
                        }
                    }

                    toolParts.push({
                        functionResponse: {
                            name: 'share_sketchnote',
                            response: {
                                name: 'share_sketchnote',
                                content: {
                                    status: 'sketchnote found',
                                    sketchnote: {
                                        id: sketchnote.id,
                                        title: sketchnote.title,
                                        topic: sketchnote.topic,
                                        subject: sketchnote.subject,
                                        file_url: sketchnote.file_url,
                                        description: sketchnote.description,
                                        presentation_content: sketchnote.presentation_content
                                    },
                                    message: `Found "${sketchnote.title}"!${journalMessage}`
                                }
                            }
                        }
                    });
                }
            } catch (e) {
                console.error("Sketchnote Search Error:", e);
                toolParts.push({
                    functionResponse: {
                        name: 'share_sketchnote',
                        response: {
                            name: 'share_sketchnote',
                            content: {
                                status: 'error',
                                error: String(e)
                            }
                        }
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
