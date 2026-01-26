import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CitationService } from '@/lib/services/citationService';

/**
 * GET /api/citations
 * 
 * Get citations for a student.
 * Parents/teachers can view their children's citations.
 * 
 * Query params:
 * - studentId: (required for parents/teachers viewing children)
 * - startDate: (optional) Filter start date
 * - endDate: (optional) Filter end date
 * - subject: (optional) Filter by subject
 * - format: 'json' | 'summary' | 'by-subject'
 */
export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get query params
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId') || user.id;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const subject = searchParams.get('subject');
        const format = searchParams.get('format') || 'json';

        // If viewing another student's citations, verify permission
        if (studentId !== user.id) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            // Check if user is parent, teacher, or admin
            const isAuthorized = profile?.role === 'admin' ||
                profile?.role === 'parent' ||
                profile?.role === 'teacher';

            if (!isAuthorized) {
                // Check teacher_students relationship
                const { data: relationship } = await supabase
                    .from('teacher_students')
                    .select('id')
                    .eq('teacher_id', user.id)
                    .eq('student_id', studentId)
                    .single();

                if (!relationship) {
                    return NextResponse.json(
                        { error: 'Not authorized to view this student\'s citations' },
                        { status: 403 }
                    );
                }
            }
        }

        // Get data based on format
        switch (format) {
            case 'by-subject': {
                const bySubject = await CitationService.getCitationsBySubject(studentId, supabase);
                return NextResponse.json({ bySubject });
            }

            case 'top-sources': {
                const topSources = await CitationService.getTopSources(studentId, supabase);
                return NextResponse.json({ topSources });
            }

            case 'summary': {
                const citations = await CitationService.getStudentCitations(studentId, supabase, {
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                    subject: subject || undefined
                });
                const formatted = CitationService.formatForDisplay(citations);
                return NextResponse.json({ summary: formatted, count: citations.length });
            }

            default: {
                const citations = await CitationService.getStudentCitations(studentId, supabase, {
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                    subject: subject || undefined
                });
                return NextResponse.json({
                    citations,
                    count: citations.length,
                    studentId
                });
            }
        }

    } catch (error) {
        console.error('[Citations API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
