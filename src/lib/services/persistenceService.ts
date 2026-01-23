import { SupabaseClient } from '@supabase/supabase-js';

export interface PersistenceResult {
    activeConversationId: string | null;
    newTitle: string | null;
    error?: string;
}

export const persistConversation = async (
    conversationId: string | null,
    prompt: string,
    finalResponseText: string,
    cleanedMessages: any[],
    userId: string,
    supabase: SupabaseClient
): Promise<PersistenceResult> => {
    let activeConversationId = conversationId;
    let newTitle = null;
    let error: string | undefined;

    try {
        const updatedMessages = [...cleanedMessages, { role: 'assistant', content: finalResponseText }];

        if (activeConversationId) {
            const { error: updateError } = await supabase
                .from('conversations')
                .update({
                    messages: updatedMessages,
                    updated_at: new Date().toISOString()
                })
                .eq('id', activeConversationId);

            if (updateError) {
                console.error('Failed to update conversation:', updateError);
                error = 'Failed to save conversation. Your messages may not be saved.';
            }
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
                error = 'Failed to save new conversation. Your messages may not be saved.';
            } else if (newConv) {
                activeConversationId = newConv.id;
                newTitle = simpleTitle;
            }
        }
    } catch (persistError) {
        console.error('Persistence Error:', persistError);
        error = 'An unexpected error occurred while saving the conversation.';
    }

    return { activeConversationId, newTitle, error };
};
