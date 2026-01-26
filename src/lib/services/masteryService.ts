import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export interface SkillResult {
  skill: string;
  status: 'Mastered' | 'Competent' | 'Needs Instruction' | 'Not Introduced';
  level: number; // 0-100 placeholder or mapped from status
  creditEarned: number;
}

export class MasteryService {

  /**
   * Process skill mastery update based on performance
   * Uses the advanced `skill_levels` table and database RPCs
   */
  static async processSkill(
    studentId: string,
    skillName: string,
    success: boolean,
    evidence?: any,
    supabaseClient?: SupabaseClient
  ): Promise<SkillResult | null> {
    const supabase = supabaseClient || await createClient();

    // 1. Find the skill ID
    const { data: skillDef, error: skillError } = await supabase
      .from('skills')
      .select('id, credit_value')
      .ilike('name', skillName)
      .maybeSingle();

    if (skillError || !skillDef) {
      console.warn(`[MasteryService] Skill not found: ${skillName}`);
      return null;
    }

    // 2. Call the database function to update level
    // This handles attempts, successes, and level calculation logic in SQL
    const { error: rpcError } = await supabase.rpc('update_skill_level', {
      p_student_id: studentId,
      p_skill_id: skillDef.id,
      p_success: success,
      p_evidence: evidence ? JSON.stringify(evidence) : null
    });

    if (rpcError) {
      console.error('[MasteryService] RPC update failed:', rpcError);
      return null;
    }

    // 3. Fetch the updated state to return result
    const { data: currentLevel } = await supabase
      .from('skill_levels')
      .select('level')
      .eq('student_id', studentId)
      .eq('skill_id', skillDef.id)
      .single();

    const statusMap: Record<string, string> = {
      'mastered': 'Mastered',
      'competent': 'Competent',
      'needs_instruction': 'Needs Instruction',
      'not_introduced': 'Not Introduced'
    };

    const status = currentLevel?.level || 'not_introduced';
    const credit = status === 'mastered' ? Number(skillDef.credit_value) : 0;

    return {
      skill: skillName,
      status: statusMap[status] as any,
      level: status === 'mastered' ? 100 : status === 'competent' ? 70 : 30,
      creditEarned: credit
    };
  }

  /**
   * Bulk process skills (Legacy support wrapper)
   */
  static async processSkills(studentId: string, skillNames: string[], supabaseClient?: SupabaseClient): Promise<SkillResult[]> {
    const results: SkillResult[] = [];
    for (const name of skillNames) {
      // Assume success for legacy calls ("awarding" skills usually means they did it)
      const result = await this.processSkill(studentId, name, true, null, supabaseClient);
      if (result) results.push(result);
    }
    return results;
  }
}
