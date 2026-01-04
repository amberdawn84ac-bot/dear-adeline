import Anthropic from '@anthropic-ai/sdk';
import { AcademicMission, Track } from '@/types/learning';
import { sanitizeForPrompt } from '@/lib/sanitize';

export async function generateStructuredLesson(
    topic: string,
    studentGrade: string,
    studentInterests: string[],
    conversationContext: string,
    suggestedTrack?: Track
): Promise<Omit<AcademicMission, 'id' | 'student_id' | 'evidence_submissions' | 'status' | 'progress_percentage' | 'started_at' | 'completed_at' | 'conversation_id' | 'created_at' | 'updated_at'>> {
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `You are Adeline, an expert curriculum designer specializing in Oklahoma homeschool standards and the 8 Tracks framework.

STUDENT CONTEXT:
- Grade Level: ${sanitizeForPrompt(studentGrade)}
- Interests: ${studentInterests.map(sanitizeForPrompt).join(', ')}
- Current Conversation: ${sanitizeForPrompt(conversationContext)}
${suggestedTrack ? `- Suggested Track: ${sanitizeForPrompt(suggestedTrack)}` : ''}

TOPIC: ${sanitizeForPrompt(topic)}

Generate a comprehensive Academic Mission that:
1. Maps to one or more of the 8 Tracks:
   - creation_science (God's Creation & Science)
   - health_naturopathy (Health & Naturopathy)
   - food_systems (Food Systems)
   - government_economics (Government & Economics)
   - justice (Justice)
   - discipleship (Discipleship)
   - history (History)
   - english_literature (English & Literature)

2. Aligns with Oklahoma state standards for grade ${studentGrade}
3. Provides specific, actionable learning objectives
4. Includes a step-by-step action plan (4-8 steps)
5. Lists skills to develop with mastery levels
6. Suggests evidence capture opportunities
7. Estimates credit hours (0.5 to 4.0)

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Engaging mission title",
  "description": "What the student will accomplish",
  "primary_track": "one of the 8 tracks",
  "secondary_tracks": ["optional additional tracks"],
  "credit_areas": ["oklahoma credit areas like 'science', 'english_language_arts'"],
  "oklahoma_standards": ["specific OK standards like 'OK.SCI.HS.LS2.1'"],
  "estimated_credits": 1.5,
  "learning_objectives": ["Specific, measurable objective 1", "Objective 2"],
  "action_plan": [
    {
      "order": 1,
      "title": "Step title",
      "description": "Detailed description of what to do",
      "estimated_time": "2 hours",
      "completed": false
    }
  ],
  "skills_checklist": [
    {
      "skill_name": "Skill name",
      "track": "relevant track",
      "description": "What mastery looks like",
      "mastery_level": "developing",
      "evidence_required": true
    }
  ],
  "evidence_prompts": [
    {
      "prompt": "What evidence to capture",
      "evidence_type": "photo",
      "required": true
    }
  ]
}`;

    const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
        try {
            const missionData = JSON.parse(content.text);
            return {
                title: missionData.title,
                description: missionData.description,
                primary_track: missionData.primary_track,
                secondary_tracks: missionData.secondary_tracks || [],
                credit_areas: missionData.credit_areas,
                oklahoma_standards: missionData.oklahoma_standards || [],
                estimated_credits: missionData.estimated_credits,
                learning_objectives: missionData.learning_objectives,
                action_plan: missionData.action_plan,
                skills_checklist: missionData.skills_checklist,
                evidence_prompts: missionData.evidence_prompts,
            };
        } catch (error) {
            console.error('Failed to parse mission JSON:', error);
            throw new Error('Failed to parse generated mission data');
        }
    }

    throw new Error('Failed to generate lesson');
}
