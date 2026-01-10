# Spec: The Library (Adeline's RAG System)

## 1. Goal

The goal of this track is to implement a Retrieval-Augmented Generation (RAG) system for Adeline, called "The Library". This will allow Adeline to access a private library of documents and use them to inform her responses, ensuring her answers are aligned with the project's core principles and not solely based on the mainstream internet.

## 2. User Stories

*   As a developer, I want to be able to upload books and documents to Adeline's library, so that she has a private knowledge base.
*   As a user, when I ask Adeline a question, I want her to first consult her private library and use that information to formulate her response, so that her answers are unique and aligned with the project's values.

## 3. Technical Requirements

*   Enable the `vector` extension in the Supabase database.
*   Create a `library` table in Supabase to store document chunks, metadata, and embeddings.
*   Create a `match_library` function in Supabase to search for relevant documents.
*   Create a script `upload-book.js` to ingest PDF documents into the library, including chunking, embedding, and storing.
*   Modify the chat API endpoint to embed the user's query, search the library, and inject the retrieved context into the system prompt.
*   Install new dependencies: `langchain`, `@langchain/openai`, `@langchain/community`, `pdf-parse`.

## 4. Acceptance Criteria

*   The `vector` extension is enabled in Supabase.
*   The `library` table and `match_library` function are created in Supabase.
*   The `upload-book.js` script can successfully ingest a PDF document into the library.
*   When a user asks a question related to an ingested document, the chat API successfully retrieves relevant excerpts from the library and uses them to generate a response.
