import { SupabaseClient } from '@supabase/supabase-js';

export interface Competency {
  id: string;
  name: string;
  description?: string;
  category: string;
  real_world_applications: string[];
  demonstration_examples: string[];
}

export interface StudentCompetency {
  id: string;
  student_id: string;
  competency_id: string;
  status: 'not_started' | 'developing' | 'competent' | 'advanced';
  evidence: any[];
  last_demonstrated?: string;
  competency?: Competency;
}

export interface CompetencySummary {
  competencies: {
    notStarted: StudentCompetency[];
    developing: StudentCompetency[];
    competent: StudentCompetency[];
    advanced: StudentCompetency[];
  };
  stats: {
    total: number;
    advanced: number;
    competent: number;
    developing: number;
    notStarted: number;
  };
}

export class CompetencyService {
  /**
   * Update student's competency progress based on skill mastery
   * This is typically called after a skill is earned
   */
  static async updateCompetencyProgress(
    studentId: string,
    competencyId: string,
    supabase: SupabaseClient
  ): Promise<void> {
    try {
      await supabase.rpc('update_competency_progress', {
        p_student_id: studentId,
        p_competency_id: competencyId
      });
    } catch (error) {
      console.error('Error updating competency progress:', error);
    }
  }

  /**
   * Update all competencies for a student after earning a skill
   * This finds all competencies that use the earned skill and updates them
   */
  static async updateCompetenciesForSkill(
    studentId: string,
    skillId: string,
    supabase: SupabaseClient
  ): Promise<void> {
    try {
      // Find all competencies that use this skill
      const { data: mappings } = await supabase
        .from('competency_skills_map')
        .select('competency_id')
        .eq('skill_id', skillId);

      if (!mappings || mappings.length === 0) {
        return;
      }

      // Update each competency
      for (const mapping of mappings) {
        await this.updateCompetencyProgress(
          studentId,
          mapping.competency_id,
          supabase
        );
      }
    } catch (error) {
      console.error('Error updating competencies for skill:', error);
    }
  }

  /**
   * Get student's competency summary grouped by status
   */
  static async getCompetencySummary(
    studentId: string,
    supabase: SupabaseClient
  ): Promise<CompetencySummary> {
    try {
      // Get all competencies with student progress
      const { data: studentCompetencies } = await supabase
        .from('student_competencies')
        .select(`
          *,
          competency:competencies(*)
        `)
        .eq('student_id', studentId);

      // Get all competencies (including ones student hasn't started)
      const { data: allCompetencies } = await supabase
        .from('competencies')
        .select('*');

      if (!allCompetencies) {
        return this.emptyCompetencySummary();
      }

      // Create map of student's competencies
      const studentCompMap = new Map<string, any>();
      (studentCompetencies || []).forEach(sc => {
        studentCompMap.set(sc.competency_id, sc);
      });

      // Build full list with not_started for missing ones
      const fullList: StudentCompetency[] = allCompetencies.map(comp => {
        const existing = studentCompMap.get(comp.id);
        if (existing) {
          return {
            ...existing,
            competency: comp
          };
        }
        // Not started
        return {
          id: '',
          student_id: studentId,
          competency_id: comp.id,
          status: 'not_started' as const,
          evidence: [],
          competency: comp
        };
      });

      // Group by status
      const notStarted = fullList.filter(c => c.status === 'not_started');
      const developing = fullList.filter(c => c.status === 'developing');
      const competent = fullList.filter(c => c.status === 'competent');
      const advanced = fullList.filter(c => c.status === 'advanced');

      return {
        competencies: {
          notStarted,
          developing,
          competent,
          advanced
        },
        stats: {
          total: fullList.length,
          advanced: advanced.length,
          competent: competent.length,
          developing: developing.length,
          notStarted: notStarted.length
        }
      };
    } catch (error) {
      console.error('Error getting competency summary:', error);
      return this.emptyCompetencySummary();
    }
  }

  /**
   * Add evidence to a student competency
   */
  static async addEvidence(
    studentId: string,
    competencyId: string,
    evidence: {
      type: 'photo' | 'portfolio' | 'project' | 'conversation';
      description: string;
      url?: string;
      timestamp: string;
    },
    supabase: SupabaseClient
  ): Promise<void> {
    try {
      // Get current evidence
      const { data: current } = await supabase
        .from('student_competencies')
        .select('evidence')
        .eq('student_id', studentId)
        .eq('competency_id', competencyId)
        .single();

      const currentEvidence = current?.evidence || [];

      // Append new evidence
      const newEvidence = [...currentEvidence, evidence];

      // Update
      await supabase
        .from('student_competencies')
        .upsert({
          student_id: studentId,
          competency_id: competencyId,
          evidence: newEvidence,
          last_demonstrated: evidence.timestamp
        }, {
          onConflict: 'student_id,competency_id'
        });
    } catch (error) {
      console.error('Error adding competency evidence:', error);
    }
  }

  /**
   * Get competencies by category
   */
  static async getCompetenciesByCategory(
    category: string,
    supabase: SupabaseClient
  ): Promise<Competency[]> {
    try {
      const { data, error } = await supabase
        .from('competencies')
        .select('*')
        .eq('category', category);

      if (error) {
        console.error('Error fetching competencies:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCompetenciesByCategory:', error);
      return [];
    }
  }

  /**
   * Helper to create empty summary
   */
  private static emptyCompetencySummary(): CompetencySummary {
    return {
      competencies: {
        notStarted: [],
        developing: [],
        competent: [],
        advanced: []
      },
      stats: {
        total: 0,
        advanced: 0,
        competent: 0,
        developing: 0,
        notStarted: 0
      }
    };
  }
}
