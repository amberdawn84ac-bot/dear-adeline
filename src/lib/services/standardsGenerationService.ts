import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupabaseClient } from '@supabase/supabase-js';
import { StateStandard } from './standardsService';

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : undefined;

export class StandardsGenerationService {

    /**
     * Generates and seeds standards for a specific jurisdiction and grade level using Gemini
     */
    static async seedStandards(
        jurisdiction: string,
        gradeLevel: string,
        supabase: SupabaseClient
    ): Promise<boolean> {
        if (!genAI) {
            console.error('Google API Key missing, cannot generate standards');
            return false;
        }

        console.log(`Generating standards for ${jurisdiction} grade ${gradeLevel}...`);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const prompt = `Generate a comprehensive list of educational standards for **${jurisdiction}** grade **${gradeLevel}**.
            
            Focus on the main core subjects: Mathematics, English Language Arts, Science, and Social Studies/History.
            
            For each standard, provide:
            1. The official code (e.g., "TEKS.MATH.8.2A" or "CCSS.MATH.8.EE.1") - make up a plausible code format if specific one isn't known, but try to be accurate.
            2. The subject.
            3. The official statement text.
            4. A brief user-friendly description.

            Format as a JSON array of objects:
            [
              {
                "code": "standard_code",
                "subject": "Mathematics",
                "statement": "full text of standard",
                "description": "short summary"
              }
            ]
            
            Generate at least 15-20 key standards that cover the most important concepts for this grade. Ensure valid JSON output.`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            let standards = [];
            try {
                const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                standards = JSON.parse(cleanJson);
            } catch (e) {
                console.error('Failed to parse generated standards JSON', e);
                return false;
            }

            if (!Array.isArray(standards) || standards.length === 0) {
                console.warn('AI returned no standards');
                return false;
            }

            // Insert into database
            const records = standards.map(s => ({
                standard_code: s.code,
                jurisdiction: jurisdiction,
                subject: s.subject,
                grade_level: gradeLevel,
                statement_text: s.statement,
                description: s.description
            }));

            const { error } = await supabase
                .from('state_standards')
                .upsert(records, { onConflict: 'standard_code,jurisdiction' });

            if (error) {
                console.error('Error seeding generated standards:', error);
                return false;
            }

            console.log(`Successfully seeded ${records.length} standards for ${jurisdiction} grade ${gradeLevel}`);
            return true;

        } catch (error) {
            console.error('Error in standards generation:', error);
            return false;
        }
    }
}
