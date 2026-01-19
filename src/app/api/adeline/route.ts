// src/app/api/adeline/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { getGoogleAIAPIKey } from '@/lib/server/config';
import { createClient } from '@/lib/supabase/server'; // Import Supabase client
import { generateSystemPrompt } from '@/lib/services/promptService'; // Import the system prompt generator
import { autoFormatSketchnote } from '@/lib/sketchnoteUtils';
import { ModelRouter } from '@/lib/services/modelRouter';

// Use the recommended "flash" model for speed and cost-effectiveness
const GOOGLE_FLASH_MODEL = 'gemini-2.5-flash';
const GOOGLE_PRO_MODEL = 'gemini-1.5-pro'; // More capable model for complex tasks


// Define the log_activity tool schema for Google Generative AI
const tools = [
  {
    functionDeclarations: [
      {
        name: "log_activity",
        description: "Save a learning activity to the cloud transcript, tracking skills and academic credits. Everything learned earns skills, and these skills are tracked to build toward graduation requirements in real-time. This is Adeline's primary mechanism for recording a student's learning journey.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            caption: { 
              type: SchemaType.STRING, 
              description: "A detailed description of the activity performed by the student. E.g., 'Baked sourdough bread from scratch', 'Built a working model of a solar system', 'Researched the history of feudalism in Japan'.",
              nullable: false
            },
            translation: { 
              type: SchemaType.STRING, 
              description: "The academic translation of the activity, identifying the primary subject area and core academic concept. E.g., 'Chemistry: Fermentation, Reaction Kinetics', 'Astronomy: Orbital Mechanics, Scale Modeling', 'History: Feudal Systems, Cultural Exchange'.",
              nullable: false
            },
            skills: { 
              type: SchemaType.ARRAY, 
              items: { 
                type: SchemaType.STRING 
              }, 
              description: "An array of specific skills acquired or demonstrated during the activity. These should be concise and academically relevant. E.g., ['Experimentation', 'Data Analysis', 'Problem Solving', 'Historical Research', 'Baking Fundamentals'].",
              nullable: false
            },
            grade: { 
              type: SchemaType.STRING, 
              description: "The approximate grade level equivalent of the activity or skill. E.g., 'K', '3rd Grade', 'Middle School Science', 'High School Chemistry'.",
              nullable: false
            }
          },
          required: ["caption", "translation", "skills", "grade"]
        }
      }
    ]
  }
];

interface HistoryMessage {
  speaker: 'student' | 'model';
  text: string;
}

interface LogActivityArgs {
  caption: string;
  translation: string;
  skills: string[];
  grade: string;
}

export async function POST(request: Request) {
  try {
    const googleApiKey = getGoogleAIAPIKey();
    const supabase = await createClient(); // Initialize Supabase client

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const genAI = new GoogleGenerativeAI(googleApiKey);
    const { prompt, history, studentInfo } = await request.json(); // Expect history and studentInfo for system prompt

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    // Use ModelRouter to intelligently select the best model
    const route = ModelRouter.detectMode(prompt);
    console.log(`🎯 Adeline Model Router: ${route.model} (${route.reason})`);

    let selectedModel;
    switch (route.model) {
        case 'gemini': // Default gemini case
            selectedModel = GOOGLE_FLASH_MODEL; // Default to the cheaper model for cost savings
            break;
        case 'grok':
        case 'gpt4':
        default:
            console.warn(`⚠️ ${route.model} not yet implemented in Adeline endpoint, falling back to Gemini`);
            selectedModel = GOOGLE_FLASH_MODEL; // Fallback for unimplemented models
            break;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = genAI.getGenerativeModel({ model: selectedModel, tools: tools as any }); // Pass tools to the model


    // Generate the dynamic system prompt including the "Master Soul"
    const systemPrompt = generateSystemPrompt(studentInfo, null, history && history.length > 0 ? history[history.length - 1] : null);

    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: systemPrompt }], // Send system prompt as initial user message for chat context
            },
            {
                role: "model",
                parts: [{ text: "Understood." }], // Acknowledge system prompt
            },
            ...(history || []).map((msg: HistoryMessage) => ({ // Add previous chat history
                role: msg.speaker === 'student' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }))
        ],
        generationConfig: {
            // responseMimeType: "text/plain", // Default to text/plain for normal chat
        },
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;

    // Check for tool calls
    const functionCall = response.functionCall();

    if (functionCall && functionCall.name === "log_activity") {
      console.log("AI called log_activity:", functionCall.args);
      const args = functionCall.args as LogActivityArgs;
      const { caption, translation, skills, grade } = args;

      // Execute the tool: Save activity to Supabase
      const { error: insertError } = await supabase.from('activity_logs').insert({
        student_id: user.id,
        caption,
        translation,
        skills,
        grade,
      });

      if (insertError) {
        console.error("Error logging activity to Supabase:", insertError);
        // Inform the model that the tool failed
        const toolFailedResponse = await chat.sendMessage([
          { functionResponse: { name: "log_activity", response: { success: false, error: insertError.message } } }
        ]);
        return NextResponse.json({ message: toolFailedResponse.response.text() }, { status: 500 });
      }

      // Inform the model that the tool succeeded
      const toolSuccessResponse = await chat.sendMessage([
        { functionResponse: { name: "log_activity", response: { success: true, message: "Activity successfully logged to cloud database." } } }
      ]);
      
      let messageText = toolSuccessResponse.response.text();
      messageText = autoFormatSketchnote(prompt, messageText);
      
      return NextResponse.json({ message: messageText }, { status: 200 });

    } else {
      // No tool call, just return the AI's text response
      let messageText = response.text();
      messageText = autoFormatSketchnote(prompt, messageText);
      return NextResponse.json({ message: messageText }, { status: 200 });
    }

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Missing GOOGLE_AI_API_KEY environment variable') {
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
      }
      console.error('Google AI API Error:', error.message);
      return NextResponse.json({ error: 'Failed to get response from Google AI API.' }, { status: 500 });
    }
    console.error('Unknown error in Adeline API route:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
