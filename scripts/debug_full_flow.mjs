import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.join(__dirname, '..');

dotenv.config({ path: path.join(projectRoot, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('1. Fetching a user...');
    const { data: user, error } = await supabase.from('profiles').select('id, display_name').limit(1).single();

    if (error || !user) {
        console.error('Failed to get user:', error);
        return;
    }

    console.log('Found user:', user.id);

    // 2. Start Assessment
    console.log('2. Calling /api/placement/start...');
    let assessmentId;
    try {
        const res = await fetch('http://localhost:3000/api/placement/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
        });

        if (!res.ok) {
            console.error(`Start Failed ${res.status}:`, await res.text());
            return;
        }

        const json = await res.json();
        console.log('Start Success:', (json.firstQuestion || '').substring(0, 50) + '...');
        assessmentId = json.assessmentId;

    } catch (e) {
        console.error('Start Fetch failed:', e.message);
        return;
    }

    // 3. Continue Assessment (Turn 1)
    console.log(`3. Calling /api/placement/continue (Turn 1) with ID ${assessmentId}...`);
    try {
        const res = await fetch('http://localhost:3000/api/placement/continue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                assessmentId: assessmentId,
                response: "I am going into 5th grade."
            })
        });

        if (!res.ok) {
            const text = await res.text();
            fs.writeFileSync('error_api.log', text);
            console.error(`Continue 1 Failed ${res.status}: Saved to error_api.log`);
            return;
        }

        const json = await res.json();
        console.log('Continue 1 Success:', json.nextQuestion ? json.nextQuestion.substring(0, 50) + '...' : 'No next question');

        // 4. Continue Assessment (Turn 2)
        console.log(`4. Calling /api/placement/continue (Turn 2) with ID ${assessmentId}...`);
        try {
            const res2 = await fetch('http://localhost:3000/api/placement/continue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assessmentId: assessmentId,
                    response: "Fractions"
                })
            });

            if (!res2.ok) {
                const text = await res2.text();
                fs.writeFileSync('error_api_turn2.log', text);
                console.error(`Continue 2 Failed ${res2.status}: Saved to error_api_turn2.log`);
                return;
            }

            const json2 = await res2.json();
            console.log('Continue 2 Success:', json2);

        } catch (e) {
            console.error('Continue 2 Fetch failed:', e.message);
        }

    } catch (e) {
        console.error('Continue Fetch failed:', e.message);
    }
}

test();
