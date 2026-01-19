# Dear Adeline

**Dear Adeline** is a personalized, AI-powered learning platform designed to adapt to a student's unique interests, pace, and state standards (specifically Oklahoma). It moves beyond rote memorization to foster genuine understanding through conversation and project-based learning.

![Adeline Interface](/public/adeline-sketch.png)

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + pgvector)
- **AI**: 
  - **Google Gemini 2.5 Flash** (Primary Conversational Model)
  - **Google Gemini Pro** (Backup/Reasoning)
  - **Model Router** (Intelligent switching between Gemini, Grok, GPT-4)
- **Styling**: Tailwind CSS (v4)

## Key Features

- **Conversational Placement Assessment**: Assesses student level naturally without a "test".
- **Adaptive Difficulty**: AI adjusts complexity (Lexile level, scaffolding) based on student performance in real-time.
- **The Hippocampus**: RAG (Retrieval Augmented Generation) system that injects "Truth Documents" into the AI context.
- **Project-Based Learning**: Students co-design games and projects with Adeline.
- **State Standards Tracking**: Automatically maps activities to Oklahoma Academic Standards.

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase CLI installed (`npm i -g supabase`)

### Environment Setup

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_API_KEY=your_gemini_api_key
```

### Local Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start local database:**
    ```bash
    supabase start
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the app:**
    Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

The project is deployed on [Vercel](https://vercel.com).
Live URL: [https://dearadeline.vercel.app](https://dearadeline.vercel.app)

## License
Proprietary.
