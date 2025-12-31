import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const TRACKS = [
    'creation_science',
    'economics',
    'english',
    'history',
    'justice',
    'food_systems',
    'health',
    'discipleship',
    'government'
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

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get student's grade level from profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('grade_level')
            .eq('id', user.id)
            .single();

        const gradeLevel = profile?.grade_level || 9; // Default to grade 9

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
            // Resume existing session
            const questionsAnswered = existingSession.questions_answered || [];
            const currentIndex = questionsAnswered.length;

            // Generate next question
            const nextQuestion = await generateQuestion(
                TRACKS[Math.floor(currentIndex / 3) % TRACKS.length],
                gradeLevel,
                questionsAnswered
            );

            return NextResponse.json({
                sessionId: existingSession.id,
                question: nextQuestion,
                progress: {
                    current: currentIndex + 1,
                    total: 20
                },
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

        // Generate first question
        const firstQuestion = await generateQuestion(TRACKS[0], gradeLevel, []);

        return NextResponse.json({
            sessionId: newSession.id,
            question: firstQuestion,
            progress: {
                current: 1,
                total: 20
            },
            resumed: false
        });
    } catch (error) {
        console.error('Start diagnostic error:', error);
        return NextResponse.json(
            { error: 'Failed to start diagnostic' },
            { status: 500 }
        );
    }
}

async function generateQuestion(track: string, gradeLevel: number, previousQuestions: any[]) {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Adjust difficulty based on previous answers in this track
    const trackQuestions = previousQuestions.filter(q => q.track === track);
    let difficulty = gradeLevel;

    if (trackQuestions.length > 0) {
        const lastQuestion = trackQuestions[trackQuestions.length - 1];
        if (lastQuestion.isCorrect) {
            difficulty = Math.min(12, lastQuestion.difficulty + 2);
        } else {
            difficulty = Math.max(6, lastQuestion.difficulty - 2);
        }
    }

    const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{
            role: 'user',
            content: `Generate a multiple-choice question for a Grade ${difficulty} student on the topic of ${TRACK_NAMES[track]}.

The question should:
- Be appropriate for Grade ${difficulty} level
- Have 4 options (A, B, C, D)
- Have exactly one correct answer
- Be engaging and relevant to Oklahoma students
- Test actual understanding, not just memorization

Return ONLY valid JSON (no markdown, no explanations):
{
  "question": "...",
  "options": {
    "A": "...",
    "B": "...",
    "C": "...",
    "D": "..."
  },
  "correctAnswer": "A",
  "explanation": "..."
}`
        }]
    });

    const aiText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON from response
    let jsonText = aiText.trim();
    const codeBlockMatch = aiText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
        jsonText = codeBlockMatch[1];
    }

    const questionData = JSON.parse(jsonText);

    return {
        track,
        difficulty,
        ...questionData
    };
}
