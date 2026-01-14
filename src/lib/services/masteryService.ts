import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export interface SkillResult {
  skill: string;
  status: 'Mastered' | 'Depth of Study' | 'New Discovery';
  creditEarned: number;
}

export class MasteryService {
  static async processSkills(studentId: string, skillNames: string[], supabaseClient?: SupabaseClient): Promise<SkillResult[]> {
    const supabase = supabaseClient || await createClient();
    const results: SkillResult[] = [];

    for (const name of skillNames) {
      // 1. Find the skill definition
      // We perform a case-insensitive search to be robust
      const { data: skillDef } = await supabase
        .from('skills')
        .select('id, credit_value')
        .ilike('name', name)
        .maybeSingle();

      if (!skillDef) {
        // Skill doesn't exist in DB. 
        // In a full implementation, we might auto-create it with AI categorization.
        // For now, we mark it as a discovery without credit.
        results.push({ skill: name, status: 'New Discovery', creditEarned: 0 });
        continue;
      }

      // 2. Check if student already has it
      const { data: existing } = await supabase
        .from('student_skills')
        .select('id')
        .eq('student_id', studentId)
        .eq('skill_id', skillDef.id)
        .maybeSingle();

      if (existing) {
        results.push({ skill: name, status: 'Depth of Study', creditEarned: 0 });
      } else {
        // 3. Award new mastery
        const { error: insertError } = await supabase.from('student_skills').insert({
          student_id: studentId,
          skill_id: skillDef.id,
          earned_at: new Date().toISOString(),
          source_type: 'manual'
        });

        if (insertError) {
            console.error(`Failed to award skill ${name}:`, insertError);
            // If failed (e.g. race condition), treat as depth of study? 
            // Or just error. Let's assume depth if duplicate error.
            if (insertError.code === '23505') { // Unique violation
                 results.push({ skill: name, status: 'Depth of Study', creditEarned: 0 });
            } else {
                 results.push({ skill: name, status: 'New Discovery', creditEarned: 0 }); // Fallback
            }
        } else {
            results.push({ skill: name, status: 'Mastered', creditEarned: Number(skillDef.credit_value) });
        }
      }
    }

    return results;
  }
}
