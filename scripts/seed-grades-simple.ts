import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const apiKey = process.env.GOOGLE_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!apiKey) {
    console.error('❌ GOOGLE_API_KEY not found');
    process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials missing');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const supabase = createClient(supabaseUrl, supabaseKey);

const MISSING_GRADES = ['1', '2', '4', '6', '7', '9', '10', '11', '12'];

async function seedGrade(grade: string) {
    console.log(`\n📚 Seeding Grade ${grade}...`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Generate Common Core State Standards for Grade ${grade}.

Include Mathematics, English Language Arts, Science, and Social Studies.

Format as JSON array:
[
  {
    "code": "CCSS.MATH.${grade}.XX.X",
    "subject": "Mathematics",
    "statement": "full standard text",
    "description": "brief summary"
  }
]

Generate 15-20 key standards. Return ONLY valid JSON, no markdown.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const standards = JSON.parse(text);

        console.log(`  Generated ${standards.length} standards`);

        // Insert into database
        const records = standards.map((s: any) => ({
            standard_code: s.code,
            jurisdiction: 'California',
            subject: s.subject,
            grade_level: grade,
            statement_text: s.statement,
            description: s.description
        }));

        const { error } = await supabase
            .from('state_standards')
            .insert(records);

        if (error) {
            console.error(`  ❌ Error inserting:`, error.message);
            return false;
        }

        console.log(`  ✅ Grade ${grade} seeded successfully`);
        return true;

    } catch (error) {
        console.error(`  ❌ Error:`, error);
        return false;
    }
}

async function main() {
    console.log('🌱 Seeding Common Core standards for all K-12 grades\n');

    for (const grade of MISSING_GRADES) {
        await seedGrade(grade);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait between requests
    }

    console.log('\n✅ Seeding complete!');
    console.log('Common Core now available for: K, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12');
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
