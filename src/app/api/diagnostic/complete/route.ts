import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const TRACK_NAMES: Record<string, string> = {
    creation_science: 'Creation & Science',
    economics: 'Economics',
    english: 'English/Literature',
    history: 'History',
    justice: 'Justice & Change-making',
    food_systems: 'Food Systems',
    health: 'Health & Body',
    discipleship: 'Discipleship',
    government: 'Government/Systems'
};

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionId } = await request.json();

        // Get session
        const { data: session, error: sessionError } = await supabase
            .from('diagnostic_results')
            .select('*')
            .eq('id', sessionId)
            .eq('student_id', user.id)
            .single();

        if (sessionError || !session) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
        }

        const questionsAnswered = session.questions_answered || [];

        // Analyze results
        const trackLevels: Record<string, any> = {};
        const trackStats: Record<string, { correct: number; total: number; avgDifficulty: number }> = {};

        // Group by track
        questionsAnswered.forEach((q: any) => {
            if (!trackStats[q.track]) {
                trackStats[q.track] = { correct: 0, total: 0, avgDifficulty: 0 };
            }
            trackStats[q.track].total++;
            if (q.isCorrect) trackStats[q.track].correct++;
            trackStats[q.track].avgDifficulty += q.difficulty;
        });

        // Calculate levels per track
        Object.keys(trackStats).forEach(track => {
            const stats = trackStats[track];
            stats.avgDifficulty = Math.round(stats.avgDifficulty / stats.total);

            const accuracy = stats.correct / stats.total;
            let level = stats.avgDifficulty;

            // Adjust level based on accuracy
            if (accuracy >= 0.8) {
                level = Math.min(12, stats.avgDifficulty + 1);
            } else if (accuracy < 0.5) {
                level = Math.max(6, stats.avgDifficulty - 1);
            }

            trackLevels[track] = {
                level,
                confidence: accuracy >= 0.7 ? 'high' : accuracy >= 0.5 ? 'medium' : 'low',
                correct: stats.correct,
                total: stats.total
            };
        });

        // Calculate overall level (average of all tracks)
        const levels = Object.values(trackLevels).map((t: any) => t.level);
        const overallLevel = Math.round(levels.reduce((a, b) => a + b, 0) / levels.length);

        // Identify strengths and growth areas
        const sortedTracks = Object.entries(trackLevels).sort((a, b) => b[1].level - a[1].level);
        const strengths = sortedTracks.slice(0, 3).map(([track]) => TRACK_NAMES[track]);
        const growthAreas = sortedTracks.slice(-3).map(([track]) => TRACK_NAMES[track]);

        // Generate 2-week plan using Claude
        const twoWeekPlan = await generateTwoWeekPlan(trackLevels, strengths, growthAreas, overallLevel);

        // Generate subject assessments
        const subjectAssessments = Object.entries(trackLevels).map(([track, data]: [string, any]) => ({
            track: TRACK_NAMES[track],
            level: `Grade ${data.level}`,
            confidence: data.confidence,
            correct: data.correct,
            total: data.total
        }));

        // Update session to completed
        await supabase
            .from('diagnostic_results')
            .update({
                status: 'completed',
                subject_assessments: subjectAssessments,
                two_week_plan: twoWeekPlan,
                completed_at: new Date().toISOString()
            })
            .eq('id', sessionId);

        return NextResponse.json({
            report: {
                overallLevel: `Grade ${overallLevel}`,
                trackLevels,
                strengths,
                growthAreas,
                twoWeekPlan,
                subjectAssessments
            }
        });
    } catch (error) {
        console.error('Complete diagnostic error:', error);
        return NextResponse.json(
            { error: 'Failed to complete diagnostic' },
            { status: 500 }
        );
    }
}

async function generateTwoWeekPlan(
    trackLevels: Record<string, any>,
    strengths: string[],
    growthAreas: string[],
    overallLevel: number
) {
    if (!process.env.ANTHROPIC_API_KEY) {
        return 'Unable to generate plan - AI service not configured';
    }

    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const trackSummary = Object.entries(trackLevels)
        .map(([track, data]: [string, any]) => `- ${TRACK_NAMES[track]}: Grade ${data.level} (${data.correct}/${data.total} correct)`)
        .join('\n');

    const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
            role: 'user',
            content: `Create a personalized 2-week learning plan for an Oklahoma homeschool student.

**Student Profile:**
- Overall Level: Grade ${overallLevel}
- Strengths: ${strengths.join(', ')}
- Growth Areas: ${growthAreas.join(', ')}

**Track Levels:**
${trackSummary}

**Requirements:**
- Focus on growth areas while maintaining strengths
- Include specific, actionable activities
- Make it engaging and age-appropriate
- Reference Oklahoma standards where relevant
- Keep it realistic for 2 weeks

Format as a clear, encouraging plan with daily or weekly goals.`
        }]
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
}
