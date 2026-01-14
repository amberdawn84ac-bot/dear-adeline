import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface UpdateData {
    approved: boolean;
    approval_status: 'approved' | 'rejected';
    approved_by: string;
    approved_at: string;
    rejection_reason?: string;
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin or teacher
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || (profile.role !== 'admin' && profile.role !== 'teacher')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { projectId, approved, rejectionReason, adminId } = await req.json();

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
        }

        // Update project approval status
        const updateData: UpdateData = {
            approved,
            approval_status: approved ? 'approved' : 'rejected',
            approved_by: adminId,
            approved_at: new Date().toISOString(),
        };

        if (!approved && rejectionReason) {
            updateData.rejection_reason = rejectionReason;
        }

        const { data, error } = await supabase
            .from('library_projects')
            .update(updateData)
            .eq('id', projectId)
            .select()
            .single();

        if (error) {
            console.error('Approval error:', error);
            return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            project: data,
            message: approved ? 'Project approved' : 'Project rejected'
        });

    } catch (error: unknown) {
        console.error('Project approval error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Approval failed',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: 500 });
    }
}
