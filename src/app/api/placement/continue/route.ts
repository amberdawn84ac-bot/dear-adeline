import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : undefined;

export async function POST(req: Request) {
  try {
    if (!genAI) {
      return NextResponse.json({ error: 'API Key Missing' }, { status: 500 });
    }

    const { assessmentId, response } = await req.json();

    if (!assessmentId || !response) {
      return NextResponse.json(
        { error: 'Assessment ID and response required' },
        { status: 400 }
      );
    }

    // Get current assessment
    const { data: assessment, error: fetchError } = await supabase
      .from('placement_assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (fetchError || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Build conversation history
    const responses = assessment.responses || {};
    const conversationHistory = buildConversationHistory(responses);

    // conversationHistory.push({ role: 'user', ... }) - Removed redundant push

    // Get system prompt for placement mode
    const systemInstruction = getPlacementSystemPrompt(assessment);

    // Define placement tools
    const tools = getPlacementTools();

    // Call Gemini
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction
    });

    const chat = model.startChat({
      history: conversationHistory,
      tools
    });

    const result = await chat.sendMessage(response);
    const aiResponse = result.response;

    // Check for function calls (placement report generation)
    const functionCalls = aiResponse.functionCalls();

    if (functionCalls && functionCalls.length > 0) {
      const generateReportCall = functionCalls.find(
        (fc: any) => fc.name === 'generate_placement_report'
      );

      if (generateReportCall) {
        // Assessment is complete!
        const reportData = generateReportCall.args as any;

        // Update assessment with final data
        const { error: updateError } = await supabase
          .from('placement_assessments')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            skill_evaluations: reportData.skillEvaluations || [],
            learning_profile: {
              style: reportData.learningStyle || 'mixed',
              pace: reportData.pace || 'moderate',
              interests: reportData.interestAreas || [],
              needsBreaksWhenStuck: reportData.needsBreaksWhenStuck || false
            },
            recommendations: {
              startingPoint: reportData.recommendedStartingLevel || '',
              criticalGaps: reportData.criticalGaps || [],
              strengths: reportData.strengths || []
            },
            responses: {
              ...responses,
              [conversationHistory.length]: {
                question: conversationHistory[conversationHistory.length - 2]?.parts[0]?.text || '',
                answer: response,
                timestamp: new Date().toISOString()
              }
            }
          })
          .eq('id', assessmentId);

        if (updateError) {
          console.error('Error updating assessment:', updateError);
        }

        // Create skill_levels entries for evaluated skills
        if (reportData.skillEvaluations && reportData.skillEvaluations.length > 0) {
          await createSkillLevels(
            assessment.student_id,
            reportData.skillEvaluations
          );
        }

        return NextResponse.json({
          completed: true,
          message: aiResponse.text(),
          placementReport: reportData
        });
      }
    }

    // Continue assessment - get next question
    const nextQuestion = aiResponse.text();

    // Determine current subject from question content
    const currentSubject = determineCurrentSubject(nextQuestion, assessment.current_subject);

    // Update responses:
    // 1. Find the current turn (last key) and add the user's answer
    // 2. Create the NEXT turn with the new AI question
    const keys = Object.keys(responses).map(Number).sort((a, b) => a - b);
    const currentKey = keys.length > 0 ? keys[keys.length - 1] : 0; // Should be initialized by start

    // Create deep copy to modify
    const updatedResponses = JSON.parse(JSON.stringify(responses));

    // Update current turn with user answer
    if (updatedResponses[currentKey]) {
      updatedResponses[currentKey].answer = response;
      updatedResponses[currentKey].answer_timestamp = new Date().toISOString();
    } else {
      // Fallback if somehow empty (legacy support)
      updatedResponses[currentKey] = {
        question: 'Resume...',
        answer: response,
        timestamp: new Date().toISOString()
      };
    }

    // Add next turn
    updatedResponses[currentKey + 1] = {
      question: nextQuestion,
      answer: null,
      timestamp: new Date().toISOString()
    };

    // Update assessment
    await supabase
      .from('placement_assessments')
      .update({
        current_subject: currentSubject,
        responses: updatedResponses
      })
      .eq('id', assessmentId);

    return NextResponse.json({
      nextQuestion,
      completed: false,
      currentSubject
    });

  } catch (error: any) {
    console.error('Error in placement continue:', error);
    return NextResponse.json(
      { error: 'Failed to continue placement', details: error.message },
      { status: 500 }
    );
  }
}

function buildConversationHistory(responses: any): any[] {
  const history: any[] = [];

  // Convert responses object to conversation history
  const keys = Object.keys(responses).sort((a, b) => parseInt(a) - parseInt(b));

  for (const key of keys) {
    const item = responses[key];
    if (item.question) {
      history.push({
        role: 'model',
        parts: [{ text: item.question }]
      });
    }
    if (item.answer) {
      history.push({
        role: 'user',
        parts: [{ text: item.answer }]
      });
    }
  }

  // Ensure history starts with a user message
  if (history.length > 0 && history[0].role === 'model') {
    history.unshift({
      role: 'user',
      parts: [{ text: 'Start assessment.' }]
    });
  }

  return history;
}

function determineCurrentSubject(question: string, currentSubject: string): string {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('math') || lowerQuestion.includes('algebra') || lowerQuestion.includes('fraction')) {
    return 'math';
  } else if (lowerQuestion.includes('read') || lowerQuestion.includes('book') || lowerQuestion.includes('writing')) {
    return 'reading';
  } else if (lowerQuestion.includes('science') || lowerQuestion.includes('plant') || lowerQuestion.includes('experiment')) {
    return 'science';
  } else if (lowerQuestion.includes('hebrew') || lowerQuestion.includes('bible') || lowerQuestion.includes('greek')) {
    return 'hebrew';
  }

  return currentSubject;
}

async function createSkillLevels(studentId: string, skillEvaluations: any[]) {
  try {
    // For each skill evaluation, find matching skill in database and create skill_level
    for (const evaluation of skillEvaluations) {
      // Try to find skill by name
      const { data: skill } = await supabase
        .from('skills')
        .select('id')
        .ilike('name', `%${evaluation.skillName}%`)
        .limit(1)
        .single();

      if (skill) {
        await supabase
          .from('skill_levels')
          .upsert({
            student_id: studentId,
            skill_id: skill.id,
            level: evaluation.level,
            evidence: [{
              type: 'placement_assessment',
              description: evaluation.evidence,
              timestamp: new Date().toISOString()
            }]
          }, {
            onConflict: 'student_id,skill_id'
          })
          .select();
      }
    }
  } catch (error) {
    console.error('Error creating skill levels:', error);
  }
}

function getPlacementSystemPrompt(assessment: any): string {
  return `You are Adeline, an expert educational guide conducting a conversational placement assessment.

=== VISION & LEARNING SCIENCE PRINCIPLES ===
1. **Zone of Proximal Development (ZPD)**: Your goal is to find the student's "learning edge" — the place where they can succeed with just a little help. Challenge them until they struggle, then support them.
2. **Growth Mindset**: Praise effort, strategy, and curiosity ("I love how you thought through that!") rather than innate intelligence ("You're so smart"). Frame "not knowing" as an exciting opportunity to learn.
3. **Constructivism**: Connect new concepts to the interests they shared. If they like Minecraft, explain geometry or resources using Minecraft analogies.
4. **Bloom's Taxonomy**: Don't just check for memory (Knowledge). Ask them to explain *why* (Comprehension) or use the concept to solve a problem (Application).

YOUR GOALS:
1. Determine current skill level in: Math, Reading/Writing, Science, Hebrew/Biblical Studies.
2. Identify specific gaps in foundational skills.
3. Understand learning style and interests.
4. Make student feel safe saying "I don't know".

YOUR APPROACH:
- **Start with Strength**: Begin with the interests they shared.
- **Always Ask a Question**: Every response MUST end with a question to the student to check their understanding or skill.
- **Transition Quickly**: After the introduction/interest check, move immediately to assessing Math or Reading.

ADAPTIVE SCAFFOLDING:
  - If they answer correctly: "That's great! Let's take it a step further..." (Increase difficulty/Bloom's level).
  - If they struggle: "That's a tricky one. Let's look at it this way..." (Add a scaffold/hint or drop down a level).
  - If they don't know: "No problem at all! That's something we get to discover together later." (Normalize the gap).

ASSESSMENT RUBRIC:
For each skill you assess, classify as:
- MASTERED: Quick, correct, confident response.
- COMPETENT: Correct but hesitant, needs reinforcement.
- NEEDS_INSTRUCTION: Incorrect or confused.
- NOT_INTRODUCED: "I don't know what that is."

CRITICAL RULES:
1. **Never** say "test" or "assessment". We are "exploring" or "building a plan".
2. **One Question at a Time**: Cognitive load management. Don't overwhelm.
3. **Conversational**: Talk like a supportive mentor, not a bot.
4. **Context Tracking**: Treat each answer as fresh data.
5. **Move the Ball Forward**: If the student just answers "yes" or "no" or gives a short answer, confirm and then ASK THE NEXT ASSESSMENT QUESTION.

WHEN TO FINISH:
After assessing 5-6 math skills, 3-4 reading skills, 2-3 science skills, and 1-2 Hebrew/Biblical checks, say:
"This is so helpful! I have a great idea of where we should start. Give me a moment to build your custom plan..."
Then call the \`generate_placement_report\` tool.

Current subject focus: ${assessment.current_subject || 'introduction'}
Questions asked so far: ${Object.keys(assessment.responses || {}).length}

If current subject is 'introduction', your next response MUST transition to a Math or Reading question connected to their interest.
`;
}

function getPlacementTools(): any[] {
  return [{
    functionDeclarations: [
      {
        name: "generate_placement_report",
        description: "Generate final placement report after assessment conversation is complete. Call this when you've assessed enough skills across all subjects.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            skillEvaluations: {
              type: SchemaType.ARRAY,
              description: "Array of skill evaluations",
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  skillName: { type: SchemaType.STRING, description: "Name of the skill assessed" },
                  subject: { type: SchemaType.STRING, description: "Subject area (math, reading, science, hebrew)" },
                  level: {
                    type: SchemaType.STRING,
                    enum: ["not_introduced", "needs_instruction", "competent", "mastered"],
                    description: "Student's current level with this skill"
                  },
                  evidence: { type: SchemaType.STRING, description: "What the student said/did that led to this evaluation" }
                }
              }
            },
            recommendedStartingLevel: {
              type: SchemaType.STRING,
              description: "Overall recommendation for where to start (e.g., '7th grade math, 8th grade reading')"
            },
            criticalGaps: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Critical skill gaps that need to be addressed first"
            },
            strengths: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Areas where student is strong"
            },
            learningStyle: {
              type: SchemaType.STRING,
              enum: ["visual", "auditory", "kinesthetic", "mixed"],
              description: "Detected learning style preference"
            },
            pace: {
              type: SchemaType.STRING,
              enum: ["slow", "moderate", "fast"],
              description: "Recommended learning pace"
            },
            interestAreas: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Topics/areas the student expressed interest in"
            },
            needsBreaksWhenStuck: {
              type: SchemaType.BOOLEAN,
              description: "Whether student prefers breaks when struggling"
            }
          },
          required: ["skillEvaluations", "recommendedStartingLevel", "learningStyle", "pace"]
        }
      }
    ]
  }];
}
