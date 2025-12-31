# Track Specification: Implement the Core AI Learning Companion and Personalized Lesson Generation

## 1. Overview

This track focuses on developing the foundational components for Adeline, the AI learning companion, and enabling the generation of personalized lessons based on student interests. This involves integrating with the Anthropic API for AI capabilities, designing data structures to store student interests and generated lesson content, and implementing the logic for Adeline to curate and present educational materials.

## 2. Goals

*   Integrate the Anthropic API for AI-driven responses and content generation.
*   Enable students to input their interests.
*   Develop Adeline's capability to generate personalized lessons based on student interests.
*   Establish a mechanism for storing and retrieving personalized lesson content.
*   Provide a user interface for students to interact with Adeline and access their personalized lessons.

## 3. Proposed Solution

### 3.1. API Integration

*   **Anthropic API:** Utilize the Anthropic API to power Adeline's conversational abilities and content generation. This will involve secure API key management and robust error handling.

### 3.2. Data Models

*   **Student Interests:** A new data model to store student-defined interests, potentially linked to existing `profiles` table.
*   **Lesson Content:** Data model to store generated personalized lesson plans, including text, associated skills, and links to external resources.

### 3.3. Core Logic

*   **Interest Processing:** Develop a service that takes student interests and formulates prompts for the Anthropic API to generate relevant lesson content.
*   **Lesson Generation:** Implement a function that calls the Anthropic API with crafted prompts and processes the AI's response into a structured lesson format.
*   **Lesson Storage & Retrieval:** Functions to save generated lessons to the database and retrieve them for display to the student.

### 3.4. User Interface

*   **Chat Interface:** Enhance the existing chat interface (`ConversationUI.tsx`) to allow students to express interests and receive Adeline's generated lessons.
*   **Lesson Display:** A component to clearly present personalized lesson content to the student.

## 4. Technical Details

*   **Frontend:** Next.js, React, TypeScript.
*   **Backend:** Next.js API Routes, TypeScript.
*   **Database:** Supabase (PostgreSQL) for storing student interests and generated lesson data.
*   **AI:** Anthropic API.
*   **Authentication:** Supabase Auth for user identification.

## 5. Acceptance Criteria

*   Students can input their interests via a chat interface.
*   Adeline (AI) can respond intelligently to student queries and interests.
*   Personalized lessons are generated based on student interests using the Anthropic API.
*   Generated lessons are stored persistently and can be retrieved by the student.
*   The generated lessons are displayed clearly and engagingly in the UI.
*   Secure handling of Anthropic API keys.
*   Error handling is robust for API calls and data operations.
