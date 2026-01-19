import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export interface ActivitySuggestion {
  skillArea: string;
  description?: string;
  severity: 'minor' | 'moderate' | 'significant';
  suggestions: string[];
}

const SEVERITY_ORDER: Record<string, number> = {
  significant: 0,
  moderate: 1,
  minor: 2,
};

export class ActivitySuggestionService {
  static async getSuggestionsForRemainingGaps(
    studentId: string,
    supabaseClient?: SupabaseClient
  ): Promise<ActivitySuggestion[]> {
    const supabase = supabaseClient || await createClient();

    const { data: gaps, error } = await supabase
      .from('learning_gaps')
      .select('id, skill_area, description, severity, suggested_activities')
      .eq('student_id', studentId)
      .is('resolved_at', null);

    if (error || !gaps) return [];

    const suggestions: ActivitySuggestion[] = gaps.map((gap) => ({
      skillArea: gap.skill_area,
      description: gap.description,
      severity: gap.severity || 'minor',
      suggestions: gap.suggested_activities || [],
    }));

    // Sort by severity (significant first, then moderate, then minor)
    suggestions.sort((a, b) => {
      return (SEVERITY_ORDER[a.severity] ?? 2) - (SEVERITY_ORDER[b.severity] ?? 2);
    });

    return suggestions;
  }
}
