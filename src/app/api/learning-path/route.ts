import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LearningPathService } from '@/lib/services/learningPathService';

/**
 * GET /api/learning-path
 * Get the current student's learning path
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check for student_id query param (for teachers viewing student paths)
        const studentId = request.nextUrl.searchParams.get('student_id') || user.id;

        // If viewing another student's path, verify teacher relationship
        if (studentId !== user.id) {
            const { data: relationship } = await supabase
                .from('teacher_students')
                .select('id')
                .eq('teacher_id', user.id)
                .eq('student_id', studentId)
                .single();

            if (!relationship) {
                return NextResponse.json({ error: 'Unauthorized to view this student' }, { status: 403 });
            }
        }

        // Get the learning path
        const path = await LearningPathService.getPath(studentId, supabase);

        if (!path) {
            return NextResponse.json({
                path: null,
                message: 'No learning path found. Set grade level and state to generate one.'
            });
        }

        // Get summary statistics
        const summary = await LearningPathService.getPathSummary(studentId, supabase);

        return NextResponse.json({
            path,
            summary
        });

    } catch (error) {
        console.error('Error fetching learning path:', error);
        return NextResponse.json(
            { error: 'Failed to fetch learning path' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/learning-path
 * Generate a new learning path for a student
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            student_id,
            grade_level,
            jurisdiction,
            interests = []
        } = body;

        // Use authenticated user if no student_id provided
        const targetStudentId = student_id || user.id;

        // If generating for another student, verify permission
        if (targetStudentId !== user.id) {
            const { data: relationship } = await supabase
                .from('teacher_students')
                .select('id')
                .eq('teacher_id', user.id)
                .eq('student_id', targetStudentId)
                .single();

            if (!relationship) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }
        }

        // Validate required fields
        if (!grade_level || !jurisdiction) {
            return NextResponse.json(
                { error: 'grade_level and jurisdiction are required' },
                { status: 400 }
            );
        }

        // Generate the learning path
        const path = await LearningPathService.generatePath(
            targetStudentId,
            grade_level,
            jurisdiction,
            interests,
            supabase
        );

        if (!path) {
            return NextResponse.json(
                { error: `Failed to generate learning path. No standards found for Grade ${grade_level} in ${jurisdiction}. Please try Grade 8, or states CA, TX, FL.` },
                { status: 400 }
            );
        }

        // Get summary
        const summary = await LearningPathService.getPathSummary(targetStudentId, supabase);

        let message = `Learning path generated with ${path.pathData.length} standards.`;
        if (path.jurisdiction !== jurisdiction || path.gradeLevel !== grade_level) {
            message += ` Note: exact standards for ${jurisdiction} Grade ${grade_level} were not available, so we provided a similar path for ${path.jurisdiction} Grade ${path.gradeLevel} as a starting point.`;
        }

        return NextResponse.json({
            success: true,
            message,
            path,
            summary
        });

    } catch (error) {
        console.error('Error generating learning path:', error);
        return NextResponse.json(
            { error: 'Failed to generate learning path' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/learning-path
 * Update learning path (add interests, update preferences)
 */
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            action,
            interests,
            milestone_id,
            engagement_score,
            approach_used,
            choice,
            new_info
        } = body;

        let result;

        switch (action) {
            case 'add_interests':
                if (!interests || !Array.isArray(interests)) {
                    return NextResponse.json(
                        { error: 'interests array is required' },
                        { status: 400 }
                    );
                }
                result = await LearningPathService.addInterests(user.id, interests, supabase);
                break;

            case 'complete_milestone':
                if (!milestone_id) {
                    return NextResponse.json(
                        { error: 'milestone_id is required' },
                        { status: 400 }
                    );
                }
                result = await LearningPathService.completeMilestone(
                    user.id,
                    milestone_id,
                    engagement_score,
                    approach_used,
                    supabase
                );
                break;

            case 'record_choice':
                result = await LearningPathService.adaptPath(
                    user.id,
                    'choice_made',
                    { choiceMade: choice },
                    supabase
                );
                break;

            case 'new_info':
                result = await LearningPathService.adaptPath(
                    user.id,
                    'new_info',
                    { newInfo: new_info },
                    supabase
                );
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: add_interests, complete_milestone, record_choice, or new_info' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Error updating learning path:', error);
        return NextResponse.json(
            { error: 'Failed to update learning path' },
            { status: 500 }
        );
    }
}
