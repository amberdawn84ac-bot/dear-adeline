import { SupabaseClient } from '@supabase/supabase-js';

export interface Revision {
    id: string;
    project_id: string;
    editor_id: string;
    content_snapshot: Record<string, unknown>;
    change_summary: string | null;
    created_at: string;
    editor?: {
        display_name: string;
    };
}

export class RevisionService {
    static async createRevision(
        projectId: string,
        editorId: string,
        contentSnapshot: Record<string, unknown>,
        changeSummary: string,
        supabase: SupabaseClient
    ): Promise<void> {
        const { error } = await supabase.from('project_revisions').insert({
            project_id: projectId,
            editor_id: editorId,
            content_snapshot: contentSnapshot,
            change_summary: changeSummary,
        });

        if (error) {
            console.error('Error creating revision:', error);
            throw new Error('Failed to create revision');
        }
    }

    static async getRevisions(projectId: string, supabase: SupabaseClient): Promise<Revision[]> {
        const { data, error } = await supabase
            .from('project_revisions')
            .select(`
        id,
        project_id,
        editor_id,
        content_snapshot,
        change_summary,
        created_at,
        profiles!editor_id (display_name)
      `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching revisions:', error);
            return [];
        }

        return data || [];
    }

    static async getRevision(revisionId: string, supabase: SupabaseClient): Promise<Revision | null> {
        const { data, error } = await supabase
            .from('project_revisions')
            .select('*')
            .eq('id', revisionId)
            .single();

        if (error) {
            console.error('Error fetching revision:', error);
            return null;
        }

        return data;
    }

    static async restoreRevision(
        projectId: string,
        revisionId: string,
        editorId: string,
        supabase: SupabaseClient
    ): Promise<boolean> {
        // Get the revision to restore
        const revision = await this.getRevision(revisionId, supabase);
        if (!revision) return false;

        // Update the project with the snapshot content
        const { error: updateError } = await supabase
            .from('projects')
            .update(revision.content_snapshot)
            .eq('id', projectId);

        if (updateError) {
            console.error('Error restoring revision:', updateError);
            return false;
        }

        // Create a new revision noting the restore
        await this.createRevision(
            projectId,
            editorId,
            revision.content_snapshot,
            `Restored from revision ${revisionId.slice(0, 8)}`,
            supabase
        );

        return true;
    }
}
