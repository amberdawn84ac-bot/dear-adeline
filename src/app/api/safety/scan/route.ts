import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { studentId, conversationId, message, context } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message required' }, { status: 400 });
        }

        // Use Claude to analyze content for safety concerns
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const contextStr = context ? context.join('\n') : 'No previous context';

        const scanPrompt = `You are a safety monitoring system for a K-12 educational platform.

Analyze this student message for ANY of the following safety concerns:

1. SELF-HARM: Suicide, self-injury, hopelessness, self-destructive behavior
2. VIOLENCE: Threats to others, violent plans, weapon mentions
3. INAPPROPRIATE: Adult language, sexual content, drugs/alcohol
4. PREDATORY: Grooming patterns, secret-keeping, boundary violations

Student Message: "${message}"

Context (previous messages): ${contextStr}

Respond in JSON format ONLY:
{
    "safe": boolean,
    "alert": {
        "type": "self_harm" | "violence" | "inappropriate" | "predatory" | null,
        "severity": "low" | "medium" | "high" | "critical",
        "analysis": "Brief explanation of concern",
        "triggers": ["specific phrases that triggered alert"],
        "recommendedAction": "Immediate action needed"
    }
}

Be HIGHLY SENSITIVE to safety concerns. When in doubt, flag it.
Consider age-appropriate context but prioritize safety.
If the message is safe, set "safe": true and "alert": null.`;

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 500,
            messages: [{ role: 'user', content: scanPrompt }],
        });

        const resultText = response.content[0].type === 'text' ? response.content[0].text : '{}';

        // Parse JSON response
        let scanResult;
        try {
            scanResult = JSON.parse(resultText);
        } catch (e) {
            console.error('Failed to parse safety scan result:', e);
            // Default to safe if parsing fails
            scanResult = { safe: true, alert: null };
        }

        // If not safe, create alert
        if (!scanResult.safe && scanResult.alert) {
            const { error: insertError } = await supabase
                .from('safety_alerts')
                .insert({
                    student_id: studentId,
                    conversation_id: conversationId,
                    message_content: message,
                    alert_type: scanResult.alert.type,
                    severity: scanResult.alert.severity,
                    ai_analysis: scanResult.alert.analysis,
                    context_messages: context || []
                });

            if (insertError) {
                console.error('Error creating safety alert:', insertError);
            }
        }

        return NextResponse.json(scanResult);

    } catch (error: unknown) {
        console.error('Safety scan error:', error);
        // Default to safe on error to avoid blocking legitimate conversations
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ safe: true, alert: null, details: errorMessage });
    }
}
