# Plan: The Library (Adeline's RAG System)

## Phase 1: Database Setup

*   [~] Task: Enable the `vector` extension in Supabase.
*   [ ] Task: Create the `library` table.
*   [ ] Task: Create the `match_library` function.

## Phase 2: Ingestion Script

*   [ ] Task: Install new dependencies: `langchain`, `@langchain/openai`, `@langchain/community`, `pdf-parse`.
*   [ ] Task: Create the `upload-book.js` script.

## Phase 3: Retrieval and Augmentation

*   [ ] Task: Modify the chat API endpoint (`src/app/api/adeline/route.ts`) to embed the user's query.
*   [ ] Task: Modify the chat API endpoint to search the library using the `match_library` function.
*   [ ] Task: Modify the chat API endpoint to inject the retrieved context into the system prompt.
*   [ ] Task: Conductor - User Manual Verification 'Retrieval and Augmentation' (Protocol in workflow.md)