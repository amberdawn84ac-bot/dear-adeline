# Track Plan: Implement the core AI learning companion using Google's Generative AI.

This plan outlines the steps to implement the core AI learning companion, Adeline, using Google's Generative AI. Each task follows the Test-Driven Development (TDD) workflow as defined in `conductor/workflow.md`.

## Phase 1: Google AI API Integration and Basic AI Response

### Tasks

*   [x] Task: Set up secure environment variables for Google AI API key.
    *   [x] Task: Write Tests: Verify secure loading of API key without exposing it.
    *   [x] Task: Implement Feature: Configure environment variable handling and create a utility in `src/lib/server/config.ts` to access it securely.
*   [ ] Task: Create API route for basic Google AI API interaction.
    *   [ ] Task: Write Tests: Test successful and failed calls to the Google AI API.
    *   [ ] Task: Implement Feature: Develop a Next.js API route (`src/app/api/adeline/route.ts`) that takes a prompt and returns a basic response from the Google AI API.
*   [ ] Task: Integrate basic AI response into the `ConversationUI.tsx` component.
    *   [ ] Task: Write Tests: Test that the UI displays AI responses correctly.
    *   [ ] Task: Implement Feature: Modify src/components/ConversationUI.tsx to send user input to the new API route and display Adeline's response.
*   [ ] Task: Conductor - User Manual Verification 'Google AI API Integration and Basic AI Response' (Protocol in workflow.md)

## Phase 2: Student Interest Capture and Storage

### Tasks

*   [ ] Task: Define new database schema for student interests.
    *   [ ] Task: Write Tests: (Not directly applicable, but verify schema creation with a migration test if possible)
    *   [ ] Task: Implement Feature: Create a new Supabase migration (`supabase/migrations/`) to add a `student_interests` table, linking to `profiles` table.
*   [ ] Task: Implement API route to save student interests.
    *   [ ] Task: Write Tests: Test saving new interests and updating existing ones for a student.
    *   [ ] Task: Implement Feature: Develop a Next.js API route (`src/app/api/student-interests/save/route.ts`) to handle POST requests for saving student interests.
*   [ ] Task: Implement API route to retrieve student interests.
    *   [ ] Task: Write Tests: Test retrieving interests for a given student.
    *   [ ] Task: Implement Feature: Develop a Next.js API route (`src/app/api/student-interests/get/route.ts`) to handle GET requests for retrieving student interests.
*   [ ] Task: Add UI elements in `ConversationUI.tsx` to capture and display student interests.
    *   [ ] Task: Write Tests: Test interaction and display of student interests in the UI.
    *   [ ] Task: Implement Feature: Update `src/components/ConversationUI.tsx` to allow students to input their interests and display a list of current interests.
*   [ ] Task: Conductor - User Manual Verification 'Student Interest Capture and Storage' (Protocol in workflow.md)

## Phase 3: Personalized Lesson Generation

### Tasks

*   [ ] Task: Develop a service to craft Google AI API prompts from student interests.
    *   [ ] Task: Write Tests: Test various interest combinations and verify the generated prompts are well-formed and contextually relevant.
    *   [ ] Task: Implement Feature: Create a utility function (`src/lib/adelinePromptGenerator.ts`) that takes student interests and generates an optimized prompt for personalized lesson generation.
*   [ ] Task: Create API route to trigger personalized lesson generation.
    *   [ ] Task: Write Tests: Test the API route, ensuring it calls the prompt generator and Google AI API correctly, and handles responses.
    *   [ ] Task: Implement Feature: Develop a Next.js API route (`src/app/api/adeline/generate-lesson/route.ts`) that uses the prompt generator and calls the Google AI API.
*   [ ] Task: Define new database schema for storing generated lessons.
    *   [ ] Task: Write Tests: (Not directly applicable, but verify schema creation with a migration test if possible)
    *   [ ] Task: Implement Feature: Create a new Supabase migration (`supabase/migrations/`) to add a `personalized_lessons` table, linking to `profiles` and potentially `skills`.
*   [ ] Task: Implement API route to save generated personalized lessons.
    *   [ ] Task: Write Tests: Test saving lesson content to the database.
    *   [ ] Task: Implement Feature: Develop a Next.js API route (`src/app/api/personalized-lessons/save/route.ts`) to persist lesson content after generation.
*   [ ] Task: Implement API route to retrieve personalized lessons.
    *   [ ] Task: Write Tests: Test retrieving lessons for a given student.
    *   [ ] Task: Implement Feature: Develop a Next.js API route (`src/app/api/personalized-lessons/get/route.ts`) to fetch stored lessons.
*   [ ] Task: Integrate lesson generation and display into the `ConversationUI.tsx` component.
    *   [ ] Task: Write Tests: Test the full flow from interest input, lesson generation, saving, and display in the UI.
    *   [ ] Task: Implement Feature: Enhance `src/components/ConversationUI.tsx` to trigger lesson generation and display the generated lessons to the student.
*   [ ] Task: Conductor - User Manual Verification 'Personalized Lesson Generation' (Protocol in workflow.md)