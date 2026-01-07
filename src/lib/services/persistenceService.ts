import { SupabaseClient } from '@supabase/supabase-js';

export const persistConversation = async (
    conversationId: string | null,
    prompt: string,
    finalResponseText: string,
    cleanedMessages: any[],
    userId: string,
    supabase: SupabaseClient
) => {
    let activeConversationId = conversationId;
    let newTitle = null;

    try {
        const updatedMessages = [...cleanedMessages, { role: 'assistant', content: finalResponseText }];

        if (activeConversationId) {
            await supabase
                .from('conversations')
                .update({
                    messages: updatedMessages,
                    updated_at: new Date().toISOString()
                })
                .eq('id', activeConversationId);
        } else {
            const simpleTitle = prompt.split(' ').slice(0, 6).join(' ') + '...';

            const { data: newConv, error: newConvError } = await supabase
                .from('conversations')
                .insert({
                    student_id: userId,
                    title: simpleTitle,
                    messages: updatedMessages,
                    topic: 'General',
                    is_active: true
                })
                .select('id')
                .single();

            if (newConvError) {
                console.error('Failed to create conversation:', newConvError);
            } else if (newConv) {
                activeConversationId = newConv.id;
                newTitle = simpleTitle;
            }
        }
    } catch (persistError) {
        console.error('Persistence Error:', persistError);
    }

    return { activeConversationId, newTitle };
};
