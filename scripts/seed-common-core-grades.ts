/**
 * Seed Common Core standards for all K-12 grades
 * Run with: npx tsx scripts/seed-common-core-grades.ts
 */

import * as dotenv from 'dotenv';

// Load env vars FIRST before importing anything else
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { StandardsGenerationService } from '../src/lib/services/standardsGenerationService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Missing grades that need to be seeded
const MISSING_GRADES = ['1', '2', '4', '6', '7', '9', '10', '11', '12'];

async function seedAllGrades() {
    console.log('🌱 Seeding Common Core (California) standards for all K-12 grades...\n');

    for (const grade of MISSING_GRADES) {
        console.log(`\n📚 Processing Grade ${grade}...`);

        try {
            const success = await StandardsGenerationService.seedStandards(
                'California', // Common Core is stored under California
                grade,
                supabase
            );

            if (success) {
                console.log(`✅ Grade ${grade} seeded successfully`);
            } else {
                console.error(`❌ Failed to seed Grade ${grade}`);
            }

            // Wait a bit between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.error(`❌ Error seeding Grade ${grade}:`, error);
        }
    }

    console.log('\n✅ All grades processed!');
    console.log('Common Core standards now available for: K, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12');
}

seedAllGrades().then(() => {
    console.log('\n🎉 Seeding complete!');
    process.exit(0);
}).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
