import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.join(__dirname, '..');

dotenv.config({ path: path.join(projectRoot, '.env.local') });

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.error("Missing GOOGLE_API_KEY");
    process.exit(1);
}

async function listModels() {
    console.log("Listing models...");
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!res.ok) {
            console.error(`Failed ${res.status}:`, await res.text());
            return;
        }
        const json = await res.json();
        const models = json.models || [];
        console.log(`Found ${models.length} models.`);

        const output = models.map(m => `- ${m.name} (${m.supportedGenerationMethods.join(', ')})`).join('\n');
        fs.writeFileSync('models.log', output);
        console.log(`Saved list to models.log`);
    } catch (e) {
        console.error("Error:", e);
    }
}

listModels();
