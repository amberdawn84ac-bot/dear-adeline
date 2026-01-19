/**
 * Activity to Standards Mapper
 *
 * Maps student activities to relevant state standards by analyzing
 * the skills demonstrated and matching them to appropriate standards.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGoogleAIAPIKey } from '@/lib/server/config';
import { ActivityTranslation } from './activityTranslationService';
import { StandardsService, StateStandard } from './standardsService';
import { z } from 'zod';

const StandardSuggestionSchema = z.object({
  suggestions: z.array(z.object({
    standard_code: z.string(),
    subject: z.string(),
    reasoning: z.string(),
    confidence: z.enum(['high', 'medium', 'low'])
  }))
});

type StandardSuggestion = z.infer<typeof StandardSuggestionSchema>;

export interface ActivityStandardsMapping {
  activityAnalysis: ActivityTranslation;
  suggestedStandards: Array<{
    standard_code: string;
    subject: string;
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
    matched?: StateStandard; // If we found it in our database
  }>;
}

export class ActivityToStandardsMapper {
  /**
   * Analyzes an activity and suggests relevant state standards
   */
  static async suggestStandards(
    activityDescription: string,
    activityAnalysis: ActivityTranslation,
    jurisdiction: string,
    gradeLevel: string,
    supabaseClient: SupabaseClient
  ): Promise<ActivityStandardsMapping> {
    try {
      const apiKey = getGoogleAIAPIKey();
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });

      const prompt = `
        You are an expert in state education standards alignment.

        A student completed this activity: "${activityDescription}"

        Skills demonstrated: ${activityAnalysis.skills.join(', ')}
        Grade level: ${gradeLevel}
        State: ${jurisdiction}

        Suggest 2-4 specific state standards that this activity aligns with.
        Use standard codes in this format:
        - Mathematics: ${jurisdiction}.MATH.{grade}.{strand}.{standard}
        - English Language Arts: ${jurisdiction}.ELA.{grade}.{strand}.{standard}
        - Science: ${jurisdiction}.SCI.{grade}.{strand}.{standard}
        - Social Studies: ${jurisdiction}.SS.{grade}.{strand}.{standard}

        For each suggestion, provide:
        - standard_code: The specific standard code
        - subject: Mathematics, English Language Arts, Science, or Social Studies
        - reasoning: Brief explanation of why this activity aligns with this standard
        - confidence: high, medium, or low based on alignment strength

        Return JSON with a "suggestions" array.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed = StandardSuggestionSchema.parse(JSON.parse(responseText));

      // Try to match suggestions with standards in our database
      const mappedSuggestions = await Promise.all(
        parsed.suggestions.map(async (suggestion) => {
          const matched = await StandardsService.getOrCreateStandard(
            suggestion.standard_code,
            jurisdiction,
            supabaseClient
          );

          return {
            ...suggestion,
            matched: matched || undefined
          };
        })
      );

      return {
        activityAnalysis,
        suggestedStandards: mappedSuggestions
      };
    } catch (error) {
      console.error('Error suggesting standards:', error);
      return {
        activityAnalysis,
        suggestedStandards: []
      };
    }
  }

  /**
   * Records that a student demonstrated a standard through an activity
   */
  static async recordStandardDemonstration(
    studentId: string,
    standardIds: string[],
    activityLogId: string,
    supabaseClient: SupabaseClient
  ): Promise<void> {
    for (const standardId of standardIds) {
      await StandardsService.recordStandardProgress(
        studentId,
        standardId,
        'activity_log',
        activityLogId,
        supabaseClient
      );
    }
  }

  /**
   * Auto-links activity to standards based on AI suggestions
   * Returns the standards that were actually recorded
   */
  static async autoLinkActivityToStandards(
    studentId: string,
    activityLogId: string,
    activityDescription: string,
    activityAnalysis: ActivityTranslation,
    jurisdiction: string,
    gradeLevel: string,
    supabaseClient: SupabaseClient,
    confidenceThreshold: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<StateStandard[]> {
    // Get standard suggestions
    const mapping = await this.suggestStandards(
      activityDescription,
      activityAnalysis,
      jurisdiction,
      gradeLevel,
      supabaseClient
    );

    // Filter by confidence threshold
    const confidenceLevels = { high: 3, medium: 2, low: 1 };
    const threshold = confidenceLevels[confidenceThreshold];

    const highConfidenceSuggestions = mapping.suggestedStandards.filter(
      (s) => confidenceLevels[s.confidence] >= threshold && s.matched
    );

    // Record progress for matched standards
    const recordedStandards: StateStandard[] = [];
    for (const suggestion of highConfidenceSuggestions) {
      if (suggestion.matched) {
        await StandardsService.recordStandardProgress(
          studentId,
          suggestion.matched.id,
          'activity_log',
          activityLogId,
          supabaseClient
        );
        recordedStandards.push(suggestion.matched);
      }
    }

    return recordedStandards;
  }

  /**
   * Gets all standards demonstrated by a student through activities
   */
  static async getStudentStandardsFromActivities(
    studentId: string,
    supabaseClient: SupabaseClient
  ): Promise<Array<{ standard: StateStandard; activities: string[] }>> {
    const { data, error } = await supabaseClient
      .from('student_standards_progress')
      .select(`
        standard_id,
        source_id,
        state_standards (*)
      `)
      .eq('student_id', studentId)
      .eq('source_type', 'activity_log');

    if (error || !data) {
      return [];
    }

    // Group by standard
    const grouped = new Map<string, { standard: StateStandard; activities: string[] }>();

    for (const record of data) {
      const standard = Array.isArray(record.state_standards)
        ? record.state_standards[0]
        : record.state_standards;
      if (!standard) continue;

      if (!grouped.has(standard.id)) {
        grouped.set(standard.id, {
          standard,
          activities: []
        });
      }

      if (record.source_id) {
        grouped.get(standard.id)!.activities.push(record.source_id);
      }
    }

    return Array.from(grouped.values());
  }

  /**
   * Identifies standards gaps for a student
   * Returns standards they should demonstrate but haven't yet
   */
  static async identifyStandardsGaps(
    studentId: string,
    jurisdiction: string,
    gradeLevel: string,
    subject?: string,
    supabaseClient?: SupabaseClient
  ): Promise<StateStandard[]> {
    const supabase = supabaseClient || await (await import('@/lib/supabase/server')).createClient();

    return StandardsService.getUnmetStandards(
      studentId,
      jurisdiction,
      gradeLevel,
      subject,
      supabase
    );
  }
}
