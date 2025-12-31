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

const QUESTIONS_PER_TRACK = 2; // Can be 2-3
const TOTAL_QUESTIONS = TRACKS.length * QUESTIONS_PER_TRACK;

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionId, answer } = await request.json();

        // Get session
        const { data: session, error: sessionError } = await supabase
            .from('diagnostic_results')
            .select('*')
            .eq('id', sessionId)
            .eq('student_id', user.id)
            .eq('status', 'in_progress')
            .single();

        if (sessionError || !session) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
        }

        const questionsAnswered = session.questions_answered || [];
        const currentIndex = questionsAnswered.length;

        // Get the last question to evaluate
        if (currentIndex === 0) {
            return NextResponse.json({ error: 'No question to answer' }, { status: 400 });
        }

        // The last question was generated but not yet answered
        // We need to get it from the previous response or regenerate
        // For now, we'll assume the client sends the question data
        const { questionData } = await request.json();

        if (!questionData) {
            return NextResponse.json({ error: 'Question data required' }, { status: 400 });
        }

        // Evaluate answer
        const isCorrect = answer === questionData.correctAnswer;

        // Add to questions_answered
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

        // Check if diagnostic is complete
        const isComplete = updatedQuestions.length >= TOTAL_QUESTIONS;

        if (isComplete) {
            // Update session to completed (will be finalized by /complete endpoint)
            await supabase
                .from('diagnostic_results')
                .update({
                    questions_answered: updatedQuestions,
                    current_question_index: updatedQuestions.length
                })
                .eq('id', sessionId);

            return NextResponse.json({
                correct: isCorrect,
                explanation: questionData.explanation,
                complete: true,
                progress: {
                    current: updatedQuestions.length,
                    total: TOTAL_QUESTIONS
                }
            });
        }

        // Determine next track
        const nextTrackIndex = Math.floor(updatedQuestions.length / QUESTIONS_PER_TRACK) % TRACKS.length;
        const nextTrack = TRACKS[nextTrackIndex];

        // Get student's grade level for difficulty adjustment
        const { data: profile } = await supabase
            .from('profiles')
            .select('grade_level')
            .eq('id', user.id)
            .single();

        const gradeLevel = profile?.grade_level || 9;

        // Generate next question
        const nextQuestion = await generateQuestion(nextTrack, gradeLevel, updatedQuestions);

        // Update session
        await supabase
            .from('diagnostic_results')
            .update({
                questions_answered: updatedQuestions,
                current_track: nextTrack,
                current_question_index: updatedQuestions.length
            })
            .eq('id', sessionId);

        return NextResponse.json({
            correct: isCorrect,
            explanation: questionData.explanation,
            nextQuestion,
            progress: {
                current: updatedQuestions.length + 1,
                total: TOTAL_QUESTIONS
            },
            complete: false
        });
    } catch (error) {
        console.error('Answer diagnostic error:', error);
        return NextResponse.json(
            { error: 'Failed to process answer' },
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
