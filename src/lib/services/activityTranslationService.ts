import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGoogleAIAPIKey } from '@/lib/server/config';
import { z } from 'zod';

const ActivityTranslationSchema = z.object({
  translation: z.string(),
  skills: z.array(z.string()),
  grade: z.string(),
});

export type ActivityTranslation = z.infer<typeof ActivityTranslationSchema>;

export class ActivityTranslationService {
  private static modelName = 'gemini-2.0-flash';

  // Keyword mappings for fallback skill detection
  private static skillKeywords: Record<string, string[]> = {
    'Mathematics': ['math', 'counting', 'numbers', 'addition', 'subtraction', 'multiplication', 'division', 'geometry', 'algebra', 'fractions', 'measuring', 'calculator'],
    'Reading & Literacy': ['read', 'reading', 'book', 'story', 'phonics', 'spelling', 'vocabulary', 'literature', 'library'],
    'Writing & Composition': ['write', 'writing', 'journal', 'essay', 'letter', 'poem', 'poetry', 'story writing', 'handwriting'],
    'Science': ['science', 'experiment', 'nature', 'plants', 'animals', 'biology', 'chemistry', 'physics', 'weather', 'insects', 'birds', 'observation'],
    'History & Social Studies': ['history', 'geography', 'map', 'states', 'countries', 'president', 'war', 'timeline', 'culture', 'community'],
    'Art & Creativity': ['art', 'draw', 'drawing', 'paint', 'painting', 'craft', 'color', 'creative', 'design', 'sculpture', 'collage'],
    'Music': ['music', 'piano', 'guitar', 'violin', 'singing', 'song', 'instrument', 'rhythm', 'melody', 'practice'],
    'Physical Education': ['exercise', 'sports', 'running', 'swimming', 'basketball', 'soccer', 'gymnastics', 'dance', 'yoga', 'hiking', 'bike', 'biking'],
    'Life Skills': ['cooking', 'baking', 'cleaning', 'organizing', 'sewing', 'laundry', 'gardening', 'chores', 'responsibility'],
    'Technology': ['computer', 'coding', 'programming', 'typing', 'game design', 'robotics', 'app', 'website'],
    'Foreign Language': ['spanish', 'french', 'german', 'latin', 'language', 'vocabulary', 'translation'],
    'Bible & Character': ['bible', 'devotion', 'prayer', 'verse', 'memorization', 'church', 'faith', 'character', 'virtue', 'kindness', 'service'],
    'Critical Thinking': ['puzzle', 'problem solving', 'logic', 'chess', 'strategy', 'thinking', 'research', 'project'],
  };

  static async translate(activityDescription: string, studentGradeLevel?: string | null): Promise<ActivityTranslation> {
    try {
      const apiKey = getGoogleAIAPIKey();
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const gradeContext = studentGradeLevel ? `The student is in ${studentGradeLevel}.` : '';

      const prompt = `
        You are Adeline, an expert homeschool academic advisor who understands that learning happens everywhere.
        Translate the following student activity into a formal academic achievement that would impress on a transcript.
        
        Activity: "${activityDescription}"
        ${gradeContext}
        
        IMPORTANT: Be SPECIFIC about the skills demonstrated. Map activities to concrete academic subjects and skills:
        
        Skill Categories to consider:
        - Academic Subjects: Mathematics, Reading & Literacy, Writing & Composition, Science, History & Social Studies, Foreign Language
        - Creative Arts: Visual Art, Music, Drama, Creative Writing
        - Physical: Physical Education, Health & Nutrition, Athletics
        - Life Skills: Home Economics, Financial Literacy, Time Management, Organization
        - Technology: Computer Science, Digital Literacy, Typing
        - Character: Service Learning, Leadership, Communication, Collaboration
        - Critical Thinking: Research, Problem Solving, Analysis, Logic
        
        For example:
        - "Baked cookies" → Skills: ["Home Economics", "Mathematics (Measurement)", "Following Instructions"]
        - "Played outside" → Skills: ["Physical Education", "Gross Motor Development", "Nature Exploration"]
        - "Watched documentary about space" → Skills: ["Science (Astronomy)", "Visual Learning", "Active Listening"]
        - "Helped mom grocery shop" → Skills: ["Mathematics (Budgeting)", "Life Skills", "Decision Making"]
        
        Return a JSON object with:
        - translation: A formal, impressive academic title for this activity (e.g., "Applied Chemistry Lab: Baking Science" not just "Baking")
        - skills: An array of 2-4 SPECIFIC skills from the categories above (be precise, not vague)
        - grade: The estimated grade level equivalent (e.g., "3rd Grade", "Middle School", "High School")
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const json = JSON.parse(responseText);
      return ActivityTranslationSchema.parse(json);
    } catch (error) {
      console.error("AI Translation Failed:", error);
      // Smart fallback: detect skills from keywords
      const detectedSkills = this.detectSkillsFromDescription(activityDescription);
      const formalTitle = this.generateFallbackTitle(activityDescription);

      return {
        translation: formalTitle,
        skills: detectedSkills.length > 0 ? detectedSkills : ["Independent Study"],
        grade: "Ungraded"
      };
    }
  }

  /**
   * Translate and log an activity to the credit ledger
   */
  static async translateAndLog(
    studentId: string,
    activityDescription: string,
    sourceType: 'life_experience' | 'project' | 'course' | 'daily_plan',
    supabase: any // Using any to avoid circular dependency issues if SupabaseClient type isn't readily available, but standard is SupabaseClient
  ): Promise<{ translation: ActivityTranslation, ledgerId?: string }> {
    try {
      // 1. Get student context if needed (optional)
      const { data: profile } = await supabase.from('profiles').select('grade_level').eq('id', studentId).single();

      // 2. Translate
      const translation = await this.translate(activityDescription, profile?.grade_level);

      // 3. Log to Ledger
      // Default to a micro-credit for life experiences
      const amount = 0.05;

      const { data: ledger, error } = await supabase.from('credit_ledger').insert({
        student_id: studentId,
        amount: amount,
        credit_category: translation.skills[0] || 'General',
        source_type: sourceType,
        source_details: {
          description: activityDescription,
          translation: translation,
          skills: translation.skills
        },
        verification_status: 'verified' // Auto-verified for now to delight users
      }).select().single();

      if (error) console.error("Error logging to ledger:", error);

      return { translation, ledgerId: ledger?.id };
    } catch (error) {
      console.error("Error in translateAndLog:", error);
      throw error;
    }
  }

  private static detectSkillsFromDescription(description: string): string[] {
    const lowerDesc = description.toLowerCase();
    const detectedSkills: string[] = [];

    for (const [skill, keywords] of Object.entries(this.skillKeywords)) {
      for (const keyword of keywords) {
        if (lowerDesc.includes(keyword) && !detectedSkills.includes(skill)) {
          detectedSkills.push(skill);
          break; // Found a match for this skill category, move to next
        }
      }
      if (detectedSkills.length >= 4) break; // Max 4 skills
    }

    return detectedSkills;
  }

  private static generateFallbackTitle(description: string): string {
    // Capitalize first letter and add "Activity" if too short
    const trimmed = description.trim();
    const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    if (trimmed.length < 20) {
      return `${capitalized} - Learning Activity`;
    }
    return capitalized;
  }
}
