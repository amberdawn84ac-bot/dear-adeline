import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export interface StateStandard {
  id: string;
  standard_code: string;
  jurisdiction: string;
  subject: string;
  grade_level: string;
  statement_text: string;
  description?: string;
  case_identifier_uuid?: string;
}

export interface LearningComponent {
  id: string;
  standard_id: string;
  component_text: string;
  component_order?: number;
  case_identifier_uuid?: string;
}

export interface StandardProgress {
  student_id: string;
  standard_id: string;
  mastery_level: 'introduced' | 'developing' | 'proficient' | 'mastered';
  demonstrated_at: string;
  source_type?: string;
  source_id?: string;
}

export interface SkillStandardMapping {
  skill_id: string;
  standard_id: string;
  alignment_strength: 'full' | 'partial' | 'related';
  notes?: string;
}

export class StandardsService {
  /**
   * Fetches or creates a state standard by code
   * Uses MCP tool to fetch official standard statement if not in database
   */
  static async getOrCreateStandard(
    standardCode: string,
    jurisdiction: string,
    supabaseClient?: SupabaseClient
  ): Promise<StateStandard | null> {
    const supabase = supabaseClient || await createClient();

    // First, check if we already have this standard
    const { data: existing, error } = await supabase
      .from('state_standards')
      .select('*')
      .eq('standard_code', standardCode)
      .eq('jurisdiction', jurisdiction)
      .single();

    if (existing && !error) {
      return existing;
    }

    // If not found, we would need to fetch from CASE API
    // For now, return null and let the calling code handle MCP integration
    return null;
  }

  /**
   * Maps a skill to state standards
   */
  static async mapSkillToStandards(
    skillId: string,
    standardIds: string[],
    alignmentStrength: 'full' | 'partial' | 'related' = 'full',
    supabaseClient?: SupabaseClient
  ): Promise<SkillStandardMapping[]> {
    const supabase = supabaseClient || await createClient();
    const mappings: SkillStandardMapping[] = [];

    for (const standardId of standardIds) {
      const { data, error } = await supabase
        .from('skill_standard_mappings')
        .upsert({
          skill_id: skillId,
          standard_id: standardId,
          alignment_strength: alignmentStrength
        })
        .select()
        .single();

      if (data && !error) {
        mappings.push(data);
      }
    }

    return mappings;
  }

  /**
   * Gets all standards mapped to a skill
   */
  static async getStandardsForSkill(
    skillId: string,
    supabaseClient?: SupabaseClient
  ): Promise<StateStandard[]> {
    const supabase = supabaseClient || await createClient();

    const { data, error } = await supabase
      .from('skill_standard_mappings')
      .select(`
        standard_id,
        state_standards (*)
      `)
      .eq('skill_id', skillId);

    if (error || !data) {
      return [];
    }

    return data
      .map((mapping: any) => mapping.state_standards)
      .filter((standard: any) => standard !== null);
  }

  /**
   * Tracks student progress on a standard
   * Called automatically by database trigger when skills are earned
   */
  static async recordStandardProgress(
    studentId: string,
    standardId: string,
    sourceType: 'activity_log' | 'ai_lesson' | 'library_project' | 'manual' | 'assessment',
    sourceId?: string,
    supabaseClient?: SupabaseClient
  ): Promise<StandardProgress | null> {
    const supabase = supabaseClient || await createClient();

    // Check current mastery level
    const { data: existing } = await supabase
      .from('student_standards_progress')
      .select('mastery_level')
      .eq('student_id', studentId)
      .eq('standard_id', standardId)
      .single();

    let newMasteryLevel: 'introduced' | 'developing' | 'proficient' | 'mastered' = 'developing';

    if (existing) {
      // Progress to next level
      const progression = {
        'introduced': 'developing',
        'developing': 'proficient',
        'proficient': 'mastered',
        'mastered': 'mastered'
      } as const;
      newMasteryLevel = progression[existing.mastery_level];
    }

    const { data, error } = await supabase
      .from('student_standards_progress')
      .upsert({
        student_id: studentId,
        standard_id: standardId,
        mastery_level: newMasteryLevel,
        source_type: sourceType,
        source_id: sourceId,
        demonstrated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording standard progress:', error);
      return null;
    }

    return data;
  }

  /**
   * Gets student's progress on all standards
   */
  static async getStudentStandardsProgress(
    studentId: string,
    options?: {
      subject?: string;
      gradeLevel?: string;
      masteryLevel?: 'introduced' | 'developing' | 'proficient' | 'mastered';
    },
    supabaseClient?: SupabaseClient
  ): Promise<StandardProgress[]> {
    const supabase = supabaseClient || await createClient();

    let query = supabase
      .from('student_standards_progress')
      .select(`
        *,
        state_standards (*)
      `)
      .eq('student_id', studentId);

    if (options?.masteryLevel) {
      query = query.eq('mastery_level', options.masteryLevel);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    // Filter by subject/grade if specified
    let filtered = data;
    if (options?.subject) {
      filtered = filtered.filter((p: any) =>
        p.state_standards?.subject === options.subject
      );
    }
    if (options?.gradeLevel) {
      filtered = filtered.filter((p: any) =>
        p.state_standards?.grade_level === options.gradeLevel
      );
    }

    return filtered;
  }

  /**
   * Gets standards that a student has NOT yet demonstrated
   * Useful for identifying gaps
   */
  static async getUnmetStandards(
    studentId: string,
    jurisdiction: string,
    gradeLevel: string,
    subject?: string,
    supabaseClient?: SupabaseClient
  ): Promise<StateStandard[]> {
    const supabase = supabaseClient || await createClient();

    // Get all standards for this jurisdiction/grade/subject
    let query = supabase
      .from('state_standards')
      .select('*')
      .eq('jurisdiction', jurisdiction)
      .eq('grade_level', gradeLevel);

    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data: allStandards, error: standardsError } = await query;

    if (standardsError || !allStandards) {
      return [];
    }

    // Get standards the student has demonstrated
    const { data: studentProgress } = await supabase
      .from('student_standards_progress')
      .select('standard_id')
      .eq('student_id', studentId);

    const demonstratedIds = new Set(
      studentProgress?.map((p: any) => p.standard_id) || []
    );

    // Return standards not yet demonstrated
    return allStandards.filter((s: any) => !demonstratedIds.has(s.id));
  }

  /**
   * Links a learning gap to a specific standard
   */
  static async linkGapToStandard(
    gapId: string,
    standardId: string,
    supabaseClient?: SupabaseClient
  ): Promise<boolean> {
    const supabase = supabaseClient || await createClient();

    const { error } = await supabase
      .from('learning_gaps')
      .update({ standard_id: standardId })
      .eq('id', gapId);

    return !error;
  }

  /**
   * Gets learning components for a standard
   * These are the granular sub-skills within a standard
   */
  static async getLearningComponents(
    standardId: string,
    supabaseClient?: SupabaseClient
  ): Promise<LearningComponent[]> {
    const supabase = supabaseClient || await createClient();

    const { data, error } = await supabase
      .from('learning_components')
      .select('*')
      .eq('standard_id', standardId)
      .order('component_order', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data;
  }

  /**
   * Stores learning components for a standard
   */
  static async storeLearningComponents(
    standardId: string,
    components: Array<{ text: string; order?: number; caseId?: string }>,
    supabaseClient?: SupabaseClient
  ): Promise<LearningComponent[]> {
    const supabase = supabaseClient || await createClient();
    const stored: LearningComponent[] = [];

    for (const component of components) {
      const { data, error } = await supabase
        .from('learning_components')
        .insert({
          standard_id: standardId,
          component_text: component.text,
          component_order: component.order,
          case_identifier_uuid: component.caseId
        })
        .select()
        .single();

      if (data && !error) {
        stored.push(data);
      }
    }

    return stored;
  }
}
