/**
 * CASE Standards Integration Service
 *
 * Integrates with the Student Achievement Partners CASE framework via MCP tools
 * to fetch official state standards, learning components, and progression mappings.
 *
 * MCP Tools Available:
 * - find_standard_statement: Get official standard by code
 * - find_learning_components_from_standard: Get granular sub-skills
 * - find_standards_progression_from_standard: Get prerequisite/next standards
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { StandardsService, StateStandard } from './standardsService';

export interface CASEStandardResult {
  statementCode: string;
  statementText: string;
  jurisdiction: string;
  caseIdentifierUUID: string;
  subject?: string;
  gradeLevel?: string;
}

export interface CASELearningComponent {
  componentText: string;
  caseIdentifierUUID: string;
}

export interface CASEProgression {
  direction: 'backward' | 'forward';
  standards: CASEStandardResult[];
}

export class CASEStandardsIntegration {
  /**
   * Fetches a standard from CASE API via MCP and stores in database
   *
   * Example usage:
   * const standard = await fetchAndStoreStandard('OK.MATH.8.A.1', 'Oklahoma', supabase);
   */
  static async fetchAndStoreStandard(
    standardCode: string,
    jurisdiction: string,
    supabaseClient: SupabaseClient,
    mcpClient?: any // MCP client would be injected here
  ): Promise<StateStandard | null> {
    // First check if we already have it
    const existing = await StandardsService.getOrCreateStandard(
      standardCode,
      jurisdiction,
      supabaseClient
    );

    if (existing) {
      return existing;
    }

    // If MCP client not provided, we can't fetch new standards
    if (!mcpClient) {
      console.warn('MCP client not provided, cannot fetch new standards');
      return null;
    }

    try {
      // Call MCP tool to fetch standard
      // This would use the actual MCP protocol in production
      const result = await mcpClient.callTool('find_standard_statement', {
        statementCode: standardCode,
        jurisdiction: jurisdiction
      });

      if (!result || !result.statementText) {
        return null;
      }

      // Parse subject and grade from standard code
      // Example: "OK.MATH.8.A.1" -> subject: "Mathematics", grade: "8"
      const { subject, gradeLevel } = parseStandardCode(standardCode);

      // Store in database
      const { data, error } = await supabaseClient
        .from('state_standards')
        .insert({
          standard_code: standardCode,
          jurisdiction: jurisdiction,
          subject: subject,
          grade_level: gradeLevel,
          statement_text: result.statementText,
          case_identifier_uuid: result.caseIdentifierUUID
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing standard:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching standard from CASE:', error);
      return null;
    }
  }

  /**
   * Fetches and stores learning components for a standard
   */
  static async fetchAndStoreLearningComponents(
    standardId: string,
    caseIdentifierUUID: string,
    supabaseClient: SupabaseClient,
    mcpClient?: any
  ): Promise<void> {
    if (!mcpClient) {
      console.warn('MCP client not provided, cannot fetch learning components');
      return;
    }

    try {
      // Call MCP tool to fetch learning components
      const result = await mcpClient.callTool('find_learning_components_from_standard', {
        caseIdentifierUUID: caseIdentifierUUID
      });

      if (!result || !result.components) {
        return;
      }

      // Store each component
      const components = result.components.map((c: any, index: number) => ({
        text: c.componentText,
        order: index + 1,
        caseId: c.caseIdentifierUUID
      }));

      await StandardsService.storeLearningComponents(
        standardId,
        components,
        supabaseClient
      );
    } catch (error) {
      console.error('Error fetching learning components:', error);
    }
  }

  /**
   * Gets prerequisite standards for a given standard
   * Useful for identifying what students need to learn first
   */
  static async getPrerequisiteStandards(
    caseIdentifierUUID: string,
    mcpClient?: any
  ): Promise<CASEStandardResult[]> {
    if (!mcpClient) {
      return [];
    }

    try {
      const result = await mcpClient.callTool('find_standards_progression_from_standard', {
        caseIdentifierUUID: caseIdentifierUUID,
        direction: 'backward'
      });

      return result?.standards || [];
    } catch (error) {
      console.error('Error fetching prerequisite standards:', error);
      return [];
    }
  }

  /**
   * Gets next standards in progression
   * Useful for planning what to learn next
   */
  static async getNextStandards(
    caseIdentifierUUID: string,
    mcpClient?: any
  ): Promise<CASEStandardResult[]> {
    if (!mcpClient) {
      return [];
    }

    try {
      const result = await mcpClient.callTool('find_standards_progression_from_standard', {
        caseIdentifierUUID: caseIdentifierUUID,
        direction: 'forward'
      });

      return result?.standards || [];
    } catch (error) {
      console.error('Error fetching next standards:', error);
      return [];
    }
  }

  /**
   * Bulk imports standards for a grade level
   * This would typically be run as a background job
   */
  static async importStandardsForGrade(
    jurisdiction: string,
    gradeLevel: string,
    subject: string,
    standardCodes: string[],
    supabaseClient: SupabaseClient,
    mcpClient?: any
  ): Promise<{ imported: number; failed: number }> {
    let imported = 0;
    let failed = 0;

    for (const code of standardCodes) {
      const result = await this.fetchAndStoreStandard(
        code,
        jurisdiction,
        supabaseClient,
        mcpClient
      );

      if (result) {
        imported++;

        // Also fetch learning components if we have the CASE ID
        if (result.case_identifier_uuid) {
          await this.fetchAndStoreLearningComponents(
            result.id,
            result.case_identifier_uuid,
            supabaseClient,
            mcpClient
          );
        }
      } else {
        failed++;
      }
    }

    return { imported, failed };
  }
}

/**
 * Parses a standard code to extract subject and grade level
 *
 * Examples:
 * - "OK.MATH.8.A.1" -> { subject: "Mathematics", gradeLevel: "8" }
 * - "OK.ELA.HS.RL.1" -> { subject: "English Language Arts", gradeLevel: "9-12" }
 * - "CCSS.MATH.8.NS.A.1" -> { subject: "Mathematics", gradeLevel: "8" }
 */
function parseStandardCode(code: string): { subject: string; gradeLevel: string } {
  const parts = code.split('.');

  let subject = 'Unknown';
  let gradeLevel = 'Unknown';

  // Try to identify subject from code
  if (code.includes('MATH')) {
    subject = 'Mathematics';
  } else if (code.includes('ELA') || code.includes('RL') || code.includes('RI')) {
    subject = 'English Language Arts';
  } else if (code.includes('SCI')) {
    subject = 'Science';
  } else if (code.includes('SS') || code.includes('HIST')) {
    subject = 'Social Studies';
  }

  // Try to identify grade from code
  if (parts.length >= 3) {
    const gradePart = parts[2];
    if (gradePart === 'HS') {
      gradeLevel = '9-12';
    } else if (gradePart === 'MS') {
      gradeLevel = '6-8';
    } else if (gradePart === 'ES') {
      gradeLevel = 'K-5';
    } else if (!isNaN(parseInt(gradePart))) {
      gradeLevel = gradePart;
    }
  }

  return { subject, gradeLevel };
}
