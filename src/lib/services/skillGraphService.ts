import { SupabaseClient } from '@supabase/supabase-js';

export interface Skill {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  prerequisites: string[];
  difficulty_order: number;
}

export interface GapDetectionResult {
  hasGap: boolean;
  missingSkills: Skill[];
  message?: string;
}

export interface PrerequisiteCheckResult {
  allowed: boolean;
  missingPrereqs: Array<{
    skillId: string;
    skillName: string;
    category: string;
  }>;
}

export class SkillGraphService {
  /**
   * Check if student has completed all prerequisites for a skill
   */
  static async canAttemptSkill(
    studentId: string,
    skillId: string,
    supabase: SupabaseClient
  ): Promise<PrerequisiteCheckResult> {
    try {
      const { data, error } = await supabase.rpc('can_attempt_skill', {
        p_student_id: studentId,
        p_skill_id: skillId
      });

      if (error) {
        console.error('Error checking prerequisites:', error);
        // Default to allowing if check fails
        return { allowed: true, missingPrereqs: [] };
      }

      return data as PrerequisiteCheckResult;
    } catch (error) {
      console.error('Exception in canAttemptSkill:', error);
      return { allowed: true, missingPrereqs: [] };
    }
  }

  /**
   * Get recommended next skills for student in a category
   */
  static async getNextSkills(
    studentId: string,
    category: string,
    limit: number = 5,
    supabase: SupabaseClient
  ): Promise<Skill[]> {
    try {
      const { data, error } = await supabase.rpc('get_next_skills', {
        p_student_id: studentId,
        p_category: category,
        p_limit: limit
      });

      if (error) {
        console.error('Error getting next skills:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.skill_id,
        name: row.skill_name,
        description: row.skill_description,
        category,
        prerequisites: [],
        difficulty_order: row.difficulty_order
      }));
    } catch (error) {
      console.error('Exception in getNextSkills:', error);
      return [];
    }
  }

  /**
   * Detect when student is attempting skill without prerequisites
   * Returns gap information and suggested intervention
   */
  static async detectGap(
    studentId: string,
    attemptedSkillId: string,
    supabase: SupabaseClient
  ): Promise<GapDetectionResult> {
    const check = await this.canAttemptSkill(studentId, attemptedSkillId, supabase);

    if (check.allowed) {
      return { hasGap: false, missingSkills: [] };
    }

    // Get full skill details for missing prerequisites
    if (check.missingPrereqs.length === 0) {
      return { hasGap: false, missingSkills: [] };
    }

    const missingIds = check.missingPrereqs.map(p => p.skillId);

    const { data: missingSkills, error } = await supabase
      .from('skills')
      .select('*')
      .in('id', missingIds);

    if (error) {
      console.error('Error fetching missing skills:', error);
      return { hasGap: false, missingSkills: [] };
    }

    // Generate intervention message
    const skillNames = check.missingPrereqs.map(p => p.skillName);
    const message = this.generateGapMessage(skillNames);

    return {
      hasGap: true,
      missingSkills: missingSkills || [],
      message
    };
  }

  /**
   * Generate a natural language message for gap detection
   */
  private static generateGapMessage(missingSkillNames: string[]): string {
    if (missingSkillNames.length === 0) return '';

    if (missingSkillNames.length === 1) {
      return `Hold on, let's back up. Before we do this, we need to make sure you've got ${missingSkillNames[0]} down. Let me check...`;
    }

    const allButLast = missingSkillNames.slice(0, -1).join(', ');
    const last = missingSkillNames[missingSkillNames.length - 1];

    return `Hold on, let's back up. Before we do this, we need to cover ${allButLast} and ${last} first. Let me check where you're at with those...`;
  }

  /**
   * Find a skill by name or partial match
   */
  static async findSkillByName(
    skillName: string,
    supabase: SupabaseClient
  ): Promise<Skill | null> {
    try {
      // Try exact match first
      let { data, error } = await supabase
        .from('skills')
        .select('*')
        .ilike('name', skillName)
        .limit(1)
        .single();

      if (!error && data) {
        return data as Skill;
      }

      // Try partial match
      const { data: partialMatch } = await supabase
        .from('skills')
        .select('*')
        .ilike('name', `%${skillName}%`)
        .limit(1)
        .single();

      return partialMatch as Skill | null;
    } catch (error) {
      console.error('Error finding skill by name:', error);
      return null;
    }
  }

  /**
   * Identify skill being discussed from message content
   * Uses keyword matching - could be enhanced with AI/NLP
   */
  static async identifySkillFromMessage(
    message: string,
    supabase: SupabaseClient
  ): Promise<string | null> {
    const lowerMessage = message.toLowerCase();

    // Common skill keywords
    const skillKeywords = [
      { keywords: ['algebra', 'equation', 'solve for x'], category: 'math' },
      { keywords: ['fraction', 'numerator', 'denominator'], category: 'math' },
      { keywords: ['percentage', 'percent'], category: 'math' },
      { keywords: ['geometry', 'angle', 'triangle', 'circle'], category: 'math' },
      { keywords: ['photosynthesis', 'plant', 'chlorophyll'], category: 'science' },
      { keywords: ['scientific method', 'hypothesis', 'experiment'], category: 'science' },
      { keywords: ['thesis', 'essay', 'paragraph'], category: 'writing' },
      { keywords: ['grammar', 'punctuation', 'sentence'], category: 'writing' },
      { keywords: ['hebrew', 'aleph', 'bet'], category: 'hebrew' },
    ];

    // Find matching category
    let matchedCategory: string | null = null;
    let matchedKeyword: string | null = null;

    for (const { keywords, category } of skillKeywords) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          matchedCategory = category;
          matchedKeyword = keyword;
          break;
        }
      }
      if (matchedCategory) break;
    }

    if (!matchedCategory || !matchedKeyword) {
      return null;
    }

    // Try to find a skill in that category matching the keyword
    const skill = await this.findSkillByName(matchedKeyword, supabase);
    return skill?.id || null;
  }

  /**
   * Get prerequisite chain for a skill (all dependencies recursively)
   */
  static async getPrerequisiteChain(
    skillId: string,
    supabase: SupabaseClient
  ): Promise<Skill[]> {
    const chain: Skill[] = [];
    const visited = new Set<string>();

    const traverse = async (currentSkillId: string) => {
      if (visited.has(currentSkillId)) return;
      visited.add(currentSkillId);

      const { data: skill } = await supabase
        .from('skills')
        .select('*')
        .eq('id', currentSkillId)
        .single();

      if (!skill) return;

      chain.push(skill as Skill);

      if (skill.prerequisites && skill.prerequisites.length > 0) {
        for (const prereqId of skill.prerequisites) {
          await traverse(prereqId);
        }
      }
    };

    await traverse(skillId);
    return chain;
  }
}
