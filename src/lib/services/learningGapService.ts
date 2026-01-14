import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export class LearningGapService {
  static async resolveGaps(studentId: string, skillNames: string[], supabaseClient?: SupabaseClient): Promise<string[]> {
    const supabase = supabaseClient || await createClient();
    const resolved: string[] = [];

    // 1. Fetch open gaps for this student
    const { data: gaps, error } = await supabase
      .from('learning_gaps')
      .select('id, skill_area')
      .eq('student_id', studentId)
      .is('resolved_at', null);

    if (error || !gaps) return [];

    for (const gap of gaps) {
      // 2. Check if gap matches any of the demonstrated skills
      // Simple case-insensitive matching for now
      const match = skillNames.find(s => s.toLowerCase() === gap.skill_area.toLowerCase());
      
      if (match) {
        // 3. Mark gap as resolved
        const { error: updateError } = await supabase
          .from('learning_gaps')
          .update({ resolved_at: new Date().toISOString() })
          .eq('id', gap.id);

        if (!updateError) {
          resolved.push(gap.skill_area);
        }
      }
    }

    return resolved;
  }
}
