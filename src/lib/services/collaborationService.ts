import { SupabaseClient } from '@supabase/supabase-js';

export interface Collaborator {
    id: string;
    student_id: string;
    role: 'owner' | 'collaborator';
    added_at: string;
    profile?: {
        display_name: string;
    };
}

export interface SharedProject {
    id: string;
    title: string;
    description: string | null;
    pod_id: string;
    created_at: string;
    updated_at: string;
    collaborators: Collaborator[];
}

export class CollaborationService {
    static async getPodProjects(podId: string, supabase: SupabaseClient): Promise<SharedProject[]> {
        const { data, error } = await supabase
            .from('projects')
            .select(`
        id,
        title,
        description,
        pod_id,
        created_at,
        updated_at,
        project_collaborators (
          id,
          student_id,
          role,
          added_at,
          profiles!student_id (display_name)
        )
      `)
            .eq('pod_id', podId)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching pod projects:', error);
            return [];
        }

        return (data || []).map(p => ({
            ...p,
            collaborators: p.project_collaborators || [],
        }));
    }

    static async createSharedProject(
        podId: string,
        title: string,
        description: string,
        ownerId: string,
        supabase: SupabaseClient
    ): Promise<string | null> {
        // Create the project
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
                title,
                description,
                pod_id: podId,
                student_id: ownerId,
            })
            .select('id')
            .single();

        if (projectError || !project) {
            console.error('Error creating shared project:', projectError);
            return null;
        }

        // Add owner as collaborator
        await supabase.from('project_collaborators').insert({
            project_id: project.id,
            student_id: ownerId,
            role: 'owner',
            added_by: ownerId,
        });

        return project.id;
    }

    static async addCollaborator(
        projectId: string,
        studentId: string,
        addedBy: string,
        supabase: SupabaseClient
    ): Promise<boolean> {
        const { error } = await supabase.from('project_collaborators').insert({
            project_id: projectId,
            student_id: studentId,
            role: 'collaborator',
            added_by: addedBy,
        });

        if (error) {
            console.error('Error adding collaborator:', error);
            return false;
        }

        return true;
    }

    static async removeCollaborator(
        projectId: string,
        studentId: string,
        supabase: SupabaseClient
    ): Promise<boolean> {
        const { error } = await supabase
            .from('project_collaborators')
            .delete()
            .eq('project_id', projectId)
            .eq('student_id', studentId)
            .neq('role', 'owner'); // Cannot remove owner

        if (error) {
            console.error('Error removing collaborator:', error);
            return false;
        }

        return true;
    }

    static async getCollaborators(projectId: string, supabase: SupabaseClient): Promise<Collaborator[]> {
        const { data, error } = await supabase
            .from('project_collaborators')
            .select(`
        id,
        student_id,
        role,
        added_at,
        profiles!student_id (display_name)
      `)
            .eq('project_id', projectId);

        if (error) {
            console.error('Error fetching collaborators:', error);
            return [];
        }

        return data || [];
    }

    static async isCollaborator(
        projectId: string,
        studentId: string,
        supabase: SupabaseClient
    ): Promise<boolean> {
        const { data } = await supabase
            .from('project_collaborators')
            .select('id')
            .eq('project_id', projectId)
            .eq('student_id', studentId)
            .single();

        return !!data;
    }

    static async isOwner(
        projectId: string,
        studentId: string,
        supabase: SupabaseClient
    ): Promise<boolean> {
        const { data } = await supabase
            .from('project_collaborators')
            .select('id')
            .eq('project_id', projectId)
            .eq('student_id', studentId)
            .eq('role', 'owner')
            .single();

        return !!data;
    }
}
