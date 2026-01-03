# Track Spec: Implement the Core AI Learning Companion with Google's Generative AI

## 1. Overview

This track focuses on implementing the foundational AI features of the Dear Adeline platform using Google's Generative AI. The primary goal is to create a functional AI learning companion ("Adeline") that can interact with students, understand their interests, and generate personalized lessons based on those interests.

## 2. Functional Requirements

*   **FR1: AI Interaction:** The system must provide a chat interface where students can send messages to and receive messages from the AI companion.
*   **FR2: Secure API Communication:** All communication with the Google Generative AI service must be handled securely through a dedicated API route. API keys must not be exposed on the client side.
*   **FR3: Student Interest Storage:** The system must be able to capture and persist a student's stated interests in the database.
*   **FR4: Personalized Prompt Generation:** The system must be able to take a student's interests and construct a tailored, effective prompt for the Google AI model to generate a relevant lesson.
*   **FR5: Lesson Generation:** The system must be able to use the generated prompt to call the Google AI service and receive a structured lesson.
*   **FR6: Lesson Storage and Retrieval:** The system must save the generated lessons to the database, associated with the student, and be able to retrieve them for display.
*   **FR7: UI Integration:** The chat interface must be able to display the generated lessons to the student.

## 3. Non-Functional Requirements

*   **NFR1: Performance:** The AI response time should be reasonable to maintain user engagement. The UI should indicate when a response is being generated.
*   **NFR2: Scalability:** The backend services should be designed to handle multiple concurrent users interacting with the AI.
*   **NFR3: Testability:** All new backend and frontend components must be unit-tested according to the TDD workflow outlined in `conductor/workflow.md`.
*   **NFR4: Security:** All user data, especially personal interests and generated lessons, must be handled securely with appropriate database policies (RLS).

## 4. Out of Scope

*   Advanced, multi-turn conversational memory beyond the immediate context.
*   Real-time collaboration on lessons.
*   Complex grading or assessment of student work based on lessons.
*   Generation of non-textual content (e.g., images, videos).
