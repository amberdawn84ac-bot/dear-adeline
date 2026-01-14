import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

const key = process.env.GOOGLE_API_KEY;

if (!key) {
    console.error('GOOGLE_API_KEY not found in .env.local');
    process.exit(1);
}

async function testKey() {
    try {
        const genAI = new GoogleGenerativeAI(key);
        console.log('Trying gemini-2.5-flash...');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent('Hello');
        console.log('Success with gemini-2.5-flash! Response:', result.response.text());
    } catch (error) {
        console.error('Error with gemini-2.5-flash:', error.message);
    }
}

testKey();
