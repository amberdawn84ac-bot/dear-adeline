import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const TRACKS = [
    'creation_science', 'economics', 'english', 'history', 'justice',
    'food_systems', 'health', 'discipleship', 'government'
];

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

const QUESTIONS_PER_TRACK = 2;
const TOTAL_QUESTIONS = TRACKS.length * QUESTIONS_PER_TRACK;

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body;

        // START ACTION
        if (action === 'start') {
            const { data: profile } = await supabase
                .from('profiles')
                .select('grade_level')
                .eq('id', user.id)
                .single();

            const gradeLevel = profile?.grade_level || 9;

            // Check for existing in-progress session
            const { data: existingSession } = await supabase
                .from('diagnostic_results')
                .select('*')
                .eq('student_id', user.id)
                .eq('status', 'in_progress')
                .order('started_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (existingSession) {
                const questionsAnswered = existingSession.questions_answered || [];
                const currentIndex = questionsAnswered.length;
                const nextQuestion = await generateQuestion(
                    TRACKS[Math.floor(currentIndex / QUESTIONS_PER_TRACK) % TRACKS.length],
                    gradeLevel,
                    questionsAnswered
                );

                return NextResponse.json({
                    sessionId: existingSession.id,
                    question: nextQuestion,
                    progress: { current: currentIndex + 1, total: TOTAL_QUESTIONS },
                    resumed: true
                });
            }

            // Create new session
            const { data: newSession, error } = await supabase
                .from('diagnostic_results')
                .insert({
                    student_id: user.id,
                    questions_answered: [],
                    status: 'in_progress',
                    current_track: TRACKS[0],
                    current_question_index: 0,
                    started_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            const firstQuestion = await generateQuestion(TRACKS[0], gradeLevel, []);

            return NextResponse.json({
                sessionId: newSession.id,
                question: firstQuestion,
                progress: { current: 1, total: TOTAL_QUESTIONS },
                resumed: false
            });
        }

        // ANSWER ACTION
        if (action === 'answer') {
            const { sessionId, answer, questionData } = body;

            const { data: session } = await supabase
                .from('diagnostic_results')
                .select('*')
                .eq('id', sessionId)
                .eq('student_id', user.id)
                .eq('status', 'in_progress')
                .single();

            if (!session) {
                return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
            }

            const questionsAnswered = session.questions_answered || [];
            const isCorrect = answer === questionData.correctAnswer;

            const newQuestionRecord = {
                track: questionData.track,
                question: questionData.question,
                options: questionData.options,
                studentAnswer: answer,
                correctAnswer: questionData.correctAnswer,
                isCorrect,
                difficulty: questionData.difficulty,
                timestamp: new Date().toISOString()
            };

            const updatedQuestions = [...questionsAnswered, newQuestionRecord];
            const isComplete = updatedQuestions.length >= TOTAL_QUESTIONS;

            await supabase
                .from('diagnostic_results')
                .update({
                    questions_answered: updatedQuestions,
                    current_question_index: updatedQuestions.length
                })
                .eq('id', sessionId);

            if (isComplete) {
                return NextResponse.json({
                    correct: isCorrect,
                    explanation: questionData.explanation,
                    complete: true,
                    progress: { current: updatedQuestions.length, total: TOTAL_QUESTIONS }
                });
            }

            const nextTrackIndex = Math.floor(updatedQuestions.length / QUESTIONS_PER_TRACK) % TRACKS.length;
            const nextTrack = TRACKS[nextTrackIndex];

            const { data: profile } = await supabase
                .from('profiles')
                .select('grade_level')
                .eq('id', user.id)
                .single();

            const gradeLevel = profile?.grade_level || 9;
            const nextQuestion = await generateQuestion(nextTrack, gradeLevel, updatedQuestions);

            await supabase
                .from('diagnostic_results')
                .update({ current_track: nextTrack })
                .eq('id', sessionId);

            return NextResponse.json({
                correct: isCorrect,
                explanation: questionData.explanation,
                nextQuestion,
                progress: { current: updatedQuestions.length + 1, total: TOTAL_QUESTIONS },
                complete: false
            });
        }

        // COMPLETE ACTION
        if (action === 'complete') {
            const { sessionId } = body;

            const { data: session } = await supabase
                .from('diagnostic_results')
                .select('*')
                .eq('id', sessionId)
                .eq('student_id', user.id)
                .single();

            if (!session) {
                return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
            }

            const questionsAnswered = session.questions_answered || [];
            const trackLevels: Record<string, any> = {};
            const trackStats: Record<string, { correct: number; total: number; avgDifficulty: number }> = {};

            questionsAnswered.forEach((q: any) => {
                if (!trackStats[q.track]) {
                    trackStats[q.track] = { correct: 0, total: 0, avgDifficulty: 0 };
                }
                trackStats[q.track].total++;
                if (q.isCorrect) trackStats[q.track].correct++;
                trackStats[q.track].avgDifficulty += q.difficulty;
            });

            Object.keys(trackStats).forEach(track => {
                const stats = trackStats[track];
                stats.avgDifficulty = Math.round(stats.avgDifficulty / stats.total);
                const accuracy = stats.correct / stats.total;
                let level = stats.avgDifficulty;

                if (accuracy >= 0.8) level = Math.min(12, stats.avgDifficulty + 1);
                else if (accuracy < 0.5) level = Math.max(6, stats.avgDifficulty - 1);

                trackLevels[track] = {
                    level,
                    confidence: accuracy >= 0.7 ? 'high' : accuracy >= 0.5 ? 'medium' : 'low',
                    correct: stats.correct,
                    total: stats.total
                };
            });

            const levels = Object.values(trackLevels).map((t: any) => t.level);
            const overallLevel = Math.round(levels.reduce((a, b) => a + b, 0) / levels.length);

            const sortedTracks = Object.entries(trackLevels).sort((a, b) => b[1].level - a[1].level);
            const strengths = sortedTracks.slice(0, 3).map(([track]) => TRACK_NAMES[track]);
            const growthAreas = sortedTracks.slice(-3).map(([track]) => TRACK_NAMES[track]);

            const twoWeekPlan = await generateTwoWeekPlan(trackLevels, strengths, growthAreas, overallLevel);

            const subjectAssessments = Object.entries(trackLevels).map(([track, data]: [string, any]) => ({
                track: TRACK_NAMES[track],
                level: `Grade ${data.level}`,
                confidence: data.confidence,
                correct: data.correct,
                total: data.total
            }));

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
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('Diagnostic API error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error message:', error.message);
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

async function generateQuestion(track: string, gradeLevel: number, previousQuestions: any[]) {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const trackQuestions = previousQuestions.filter(q => q.track === track);
    let difficulty = gradeLevel;

    if (trackQuestions.length > 0) {
        const lastQuestion = trackQuestions[trackQuestions.length - 1];
        difficulty = lastQuestion.isCorrect
            ? Math.min(12, lastQuestion.difficulty + 2)
            : Math.max(6, lastQuestion.difficulty - 2);
    }

    const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{
            role: 'user',
            content: `Generate a multiple-choice question for a Grade ${difficulty} student on ${TRACK_NAMES[track]}.

Requirements:
- Appropriate for Grade ${difficulty}
- 4 options (A, B, C, D)
- Exactly one correct answer
- Engaging for Oklahoma students

Return ONLY valid JSON:
{
  "question": "...",
  "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
  "correctAnswer": "A",
  "explanation": "..."
}`
        }]
    });

    const aiText = response.content[0].type === 'text' ? response.content[0].text : '';
    let jsonText = aiText.trim();
    const codeBlockMatch = aiText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) jsonText = codeBlockMatch[1];

    const questionData = JSON.parse(jsonText);
    return { track, difficulty, ...questionData };
}

async function generateTwoWeekPlan(trackLevels: Record<string, any>, strengths: string[], growthAreas: string[], overallLevel: number) {
    if (!process.env.ANTHROPIC_API_KEY) return 'Unable to generate plan';

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const trackSummary = Object.entries(trackLevels)
        .map(([track, data]: [string, any]) => `- ${TRACK_NAMES[track]}: Grade ${data.level} (${data.correct}/${data.total})`)
        .join('\n');

    const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
            role: 'user',
            content: `Create a 2-week learning plan for an Oklahoma homeschool student.

Profile:
- Overall: Grade ${overallLevel}
- Strengths: ${strengths.join(', ')}
- Growth: ${growthAreas.join(', ')}

Tracks:
${trackSummary}

Make it engaging, actionable, and realistic for 2 weeks.`
        }]
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
}
