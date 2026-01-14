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
  private static modelName = 'gemini-2.5-flash';

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
        You are Adeline, an expert academic advisor.
        Translate the following student activity into a formal academic achievement.
        
        Activity: "${activityDescription}"
        ${gradeContext}
        
        Return a JSON object with:
        - translation: A formal academic title for the activity.
        - skills: An array of 2-4 specific academic or practical skills demonstrated.
        - grade: The estimated grade level equivalent.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const json = JSON.parse(responseText);
      return ActivityTranslationSchema.parse(json);
    } catch (error) {
      console.error("AI Translation Failed:", error);
      // Fallback
      return {
        translation: "General Activity",
        skills: ["Self-Directed Learning"],
        grade: "Ungraded"
      };
    }
  }
}
