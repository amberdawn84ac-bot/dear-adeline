
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { searchWeb } from '@/lib/search';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { state } = await req.json();

    if (!state) {
      return NextResponse.json({ error: 'State is required' }, { status: 400 });
    }

    console.log(`Discovering requirements for: ${state}`);

    // 1. Search for public school graduation requirements (the gold standard for compliance)
    const searchQuery = `official public high school graduation credit requirements ${state} table`;
    const searchResults = await searchWeb(searchQuery);

    // 2. Search for homeschool requirements to compare
    const homeschoolQuery = `homeschool high school graduation requirements ${state}`;
    const homeschoolResults = await searchWeb(homeschoolQuery);

    const prompt = `
You are the Graduation Compliance Architect for Dear Adeline Academy. 
Your task is to analyze search results for high school graduation requirements in ${state} and map them to our unique 9 Modern Tracks.

### SEARCH RESULTS (PUBLIC SCHOOLS):
${searchResults}

### SEARCH RESULTS (HOMESCHOOL):
${homeschoolResults}

### OUR 9 MODERN TRACKS:
1. **God's Creation & Science** (creation_science): Biology, Chemistry, Physics, Earth Science.
2. **Health/Naturopathy** (health_naturopathy): Health, Wellness, Temple Stewardship.
3. **Food Systems** (food_systems): Agriculture, Nutrition, Farm studies.
4. **Government/Economics** (gov_econ): Civics, Economics, Financial Stewardship.
5. **Justice** (justice): Ethics, Law, Community Advocacy.
6. **Discipleship** (discipleship): Character, Bible study, Hebrew roots.
7. **History** (history): World History, State History, Human Story.
8. **English/Lit** (english_lit): ELA, Reading, Writing, Poetry.
9. **Math** (math): Algebra, Geometry, Statistics, Creation Order.

### CRITICAL INSTRUCTION:
Compare the Public School requirements and the Homeschool requirements for ${state}.
**IF HOMESCHOOL REQUIREMENTS ARE LESS THAN PUBLIC SCHOOL, YOU MUST GO WITH THE PUBLIC SCHOOL STANDARDS.** 
We do not aim for the minimum legal requirement if it is low; we aim for a robust foundation that exceeds or at least matches a standard diploma.

### OUTPUT JSON FORMAT:
Map the required credits to our 9 tracks.
[
  {
    "name": "God's Creation & Science",
    "description": "...",
    "category": "creation_science",
    "required_credits": 4.0,
    "state_standards": "${state.toLowerCase()}"
  },
  {
    "name": "Health & Naturopathy",
    "description": "...",
    "category": "health_naturopathy",
    "required_credits": 2.0,
    "state_standards": "${state.toLowerCase()}"
  },
  {
    "name": "Food Systems",
    "description": "...",
    "category": "food_systems",
    "required_credits": 2.0,
    "state_standards": "${state.toLowerCase()}"
  },
  {
    "name": "Government & Economics",
    "description": "...",
    "category": "gov_econ",
    "required_credits": 3.0,
    "state_standards": "${state.toLowerCase()}"
  },
  {
    "name": "Justice",
    "description": "...",
    "category": "justice",
    "required_credits": 1.0,
    "state_standards": "${state.toLowerCase()}"
  },
  {
    "name": "Discipleship",
    "description": "...",
    "category": "discipleship",
    "required_credits": 4.0,
    "state_standards": "${state.toLowerCase()}"
  },
  {
    "name": "History",
    "description": "...",
    "category": "history",
    "required_credits": 4.0,
    "state_standards": "${state.toLowerCase()}"
  },
  {
    "name": "English & Literature",
    "description": "...",
    "category": "english_lit",
    "required_credits": 4.0,
    "state_standards": "${state.toLowerCase()}"
  },
  {
    "name": "Mathematics",
    "description": "...",
    "category": "math",
    "required_credits": 4.0,
    "state_standards": "${state.toLowerCase()}"
  }
]
`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
      system: "You only output valid JSON. Return an array of 9 objects, one for each of the Modern Tracks."
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    let jsonStr = content.trim();
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
    }

    const requirements = JSON.parse(jsonStr);

    // Note: We are returning these to the frontend. 
    // We could auto-insert if we had the service role key, but for now we return them
    // so the user can see/confirm them.

    return NextResponse.json({ requirements });

  } catch (error: any) {
    console.error('Discovery Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
