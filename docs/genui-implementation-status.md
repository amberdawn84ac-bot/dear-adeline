# GenUI Implementation Status

**Last Updated:** 2026-02-03
**Status:** Testing Phase - Core implementation complete, debugging API integration

## What We Built

### Architecture Overview

We replaced the broken CopilotKit dependency with **Vercel AI SDK** to implement real Generative UI streaming with Gemini 2.0 Flash.

```
User clicks FloatingActionBar
    ↓
DashboardExperienceContext.triggerGenUIExperience()
    ↓
POST /api/copilotkit
    ↓
Vercel AI SDK streamObject() → Gemini API
    ↓
Stream ComposedUIPage JSON back
    ↓
ComposedPageRenderer displays components
```

### Key Components

#### 1. API Route (`src/app/api/copilotkit/route.ts`)
- **Purpose:** Server-side endpoint that calls Gemini AI
- **Model:** `gemini-1.5-flash-latest` (stable, not experimental)
- **Input:** Student message + mock context
- **Output:** Streams `ComposedUIPage` JSON with multiple UI components
- **Environment:** Requires `GOOGLE_GENERATIVE_AI_API_KEY`

#### 2. GenUIOrchestrator (`src/lib/services/genUIOrchestrator.ts`)
- **Purpose:** Adeline's "brain" for composing learning experiences
- **Key Types:**
  - `UIComponent` - Individual component (type + props)
  - `ComposedUIPage` - Full page (dialogue + components + actions)
- **Functions:**
  - `composePage()` - Main entry point (uses AI with fallback)
  - `composePageWithAI()` - Real Gemini integration
  - `buildPrompt()` - Constructs Charlotte Mason-based prompts

#### 3. DashboardExperienceContext (`src/contexts/DashboardExperienceContext.tsx`)
- **Purpose:** React Context for managing GenUI state
- **State:**
  - `composedPage` - Currently displayed page
  - `isLoadingGenUI` - Loading indicator
- **Methods:**
  - `triggerGenUIExperience(message)` - Calls API, handles streaming
  - `setComposedPage(page)` - Manually set page

#### 4. FloatingActionBar (`src/components/FloatingActionBar.tsx`)
- **Purpose:** Persistent UI for triggering GenUI experiences
- **Buttons:**
  - 🗺️ Explore - "I want to explore something new and interesting"
  - 🎓 Lesson - "I want to learn about money and how it works"
  - 🔍 Scout - "Help me find opportunities to learn"
  - 📖 Journal - "Help me reflect on what I learned today"
- **Integration:** Uses `useDashboardExperience()` hook

#### 5. ComposedPageRenderer (`src/components/genui/ComposedPageRenderer.tsx`)
- **Purpose:** Renders ComposedUIPage with all its components
- **Supports:**
  - `handDrawnIllustration` - Shows SVG illustrations
  - `dynamicLedger` - Interactive math tool
  - `guidingQuestion` - Reflective prompts

#### 6. GenUI Components (`src/components/genui/static/`)

**DynamicLedger.tsx**
- Interactive tool for learning math concepts
- Student adjusts retail prices, sees profit/margin calculations
- Props: scenario, items (name, wholesalePrice, retailPrice), learningGoal
- Logs interactions via `useInteractionLogger`

**HandDrawnIllustration.tsx**
- Displays hand-drawn SVG illustrations
- Props: src (path to /doodles/*.svg), alt

**GuidingQuestion.tsx**
- Shows reflective questions to prompt discovery
- Props: text

#### 7. Interaction Logger (`src/hooks/useInteractionLogger.ts`)
- **Purpose:** Tracks student interactions for adaptive learning
- **Events:** slider_change, button_click, input_change, etc.
- **Future:** Will feed into adaptation engine

## How It Works

### 1. Student Triggers Experience

```typescript
// FloatingActionBar button click
triggerGenUIExperience("I want to learn about money");
```

### 2. API Call with Streaming

```typescript
// POST /api/copilotkit
{
  message: "I want to learn about money"
}

// Response: Streamed JSON
{
  dialogue: "Let's explore money through a medieval marketplace...",
  components: [
    { type: "handDrawnIllustration", props: { src: "/doodles/marketplace.svg", ... } },
    { type: "dynamicLedger", props: { scenario: "...", items: [...], ... } },
    { type: "guidingQuestion", props: { text: "..." } }
  ],
  nextActions: [...]
}
```

### 3. Frontend Renders

```typescript
// ComposedPageRenderer maps component types to React components
<HandDrawnIllustration src="/doodles/marketplace.svg" alt="..." />
<DynamicLedger scenario="..." items={[...]} learningGoal="..." />
<GuidingQuestion text="..." />
```

## Setup & Configuration

### Environment Variables

Required in `.env.local` (development) and production:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

Get key from: https://aistudio.google.com/app/apikey

### Dependencies

```json
{
  "ai": "^6.0.7",
  "@ai-sdk/google": "^3.0.20"
}
```

CopilotKit packages were REMOVED (351 dependencies eliminated).

### Testing

All 77 tests passing:
```bash
pnpm test
```

Test coverage:
- `useInteractionLogger` - 8 tests
- `HandDrawnIllustration` - 6 tests
- `GuidingQuestion` - 8 tests
- `DynamicLedger` - 15 tests
- `GenUIOrchestrator` - 23 tests (14 unit + 9 AI integration)
- `ComposedPageRenderer` - 12 tests
- `DashboardExperienceContext` - 12 tests

## Current Issues

### Problem: "We're experiencing high demand" Error

**Symptoms:**
- FloatingActionBar buttons trigger loading state
- Error message appears in browser
- No GenUI page renders

**Potential Causes:**
1. ❌ Missing/invalid `GOOGLE_GENERATIVE_AI_API_KEY`
2. ❌ Gemini API rate limits (free tier restrictions)
3. ❌ Model availability issues
4. ❌ Network/CORS issues

**Troubleshooting Steps:**

1. **Check API Key:**
   ```bash
   grep GOOGLE_GENERATIVE_AI_API_KEY .env.local
   # Should return your key (not empty)
   ```

2. **Check Server Logs:**
   ```bash
   pnpm dev
   # Click button, watch for console output
   ```

3. **Check Browser Console:**
   - Open DevTools → Console
   - Look for errors from `/api/copilotkit`
   - Check Network tab for API response

4. **Verify Model Name:**
   ```typescript
   // In src/app/api/copilotkit/route.ts
   model: google('gemini-1.5-flash-latest')  // Current

   // Alternatives to try:
   model: google('gemini-1.5-flash')
   model: google('gemini-pro')
   ```

5. **Test Direct API Call:**
   ```bash
   curl -X POST http://localhost:3000/api/copilotkit \
     -H "Content-Type: application/json" \
     -d '{"message":"test"}'
   ```

## What's Complete ✅

- [x] Remove CopilotKit (351 packages eliminated)
- [x] Install Vercel AI SDK
- [x] Create `/api/copilotkit` streaming endpoint
- [x] Build GenUIOrchestrator with real AI integration
- [x] Create all GenUI static components
- [x] Build ComposedPageRenderer
- [x] Wire up DashboardExperienceContext
- [x] Connect FloatingActionBar to trigger experiences
- [x] Write 77 comprehensive tests (all passing)
- [x] Fix all build errors
- [x] Commit and push to GitHub

## What's TODO 📋

### Immediate (Debugging)
- [ ] Resolve Gemini API error ("high demand" message)
- [ ] Test end-to-end flow with real AI response
- [ ] Verify all component types render correctly

### Short-term (Enhancement)
- [ ] Replace mock student context with real database data
- [ ] Implement progressive rendering (stream components as they arrive)
- [ ] Add error UI component for failed AI calls
- [ ] Create SVG illustrations for `/public/doodles/`
- [ ] Wire up `nextActions` buttons in ComposedPageRenderer

### Medium-term (Features)
- [ ] Implement Discovery Dialogue Patterns (processInteractionEvent)
- [ ] Add Declarative GenUI (A2UI integration)
- [ ] Add Open-ended GenUI (MCP Apps)
- [ ] Connect to learning path for personalized prompts
- [ ] Add streaming progress indicator

### Long-term (Scale)
- [ ] Add GenUI analytics/logging
- [ ] Implement prompt caching for performance
- [ ] Add fallback for API failures (offline mode)
- [ ] Multi-language support

## File Reference

### Core Files
```
src/
├── app/
│   ├── api/
│   │   └── copilotkit/
│   │       └── route.ts              # API endpoint for GenUI
│   ├── dashboard/
│   │   └── DashboardClient.tsx       # Updated with imports
│   └── layout.tsx                    # Removed CopilotKit
│
├── components/
│   ├── FloatingActionBar.tsx         # Student action triggers
│   └── genui/
│       ├── ComposedPageRenderer.tsx  # Renders full pages
│       └── static/
│           ├── DynamicLedger.tsx     # Interactive math tool
│           ├── HandDrawnIllustration.tsx
│           └── GuidingQuestion.tsx
│
├── contexts/
│   └── DashboardExperienceContext.tsx # State management
│
├── hooks/
│   └── useInteractionLogger.ts       # Tracks student actions
│
└── lib/
    └── services/
        ├── genUIOrchestrator.ts      # AI orchestration
        └── __tests__/
            └── genUIOrchestrator.ai.test.ts
```

### Tests
```
src/
├── components/genui/__tests__/
│   └── ComposedPageRenderer.test.tsx
├── components/genui/static/__tests__/
│   ├── DynamicLedger.test.tsx
│   ├── GuidingQuestion.test.tsx
│   └── HandDrawnIllustration.test.tsx
├── contexts/__tests__/
│   └── DashboardExperienceContext.test.tsx
├── hooks/__tests__/
│   └── useInteractionLogger.test.ts
└── lib/services/__tests__/
    ├── genUIOrchestrator.test.ts
    └── genUIOrchestrator.ai.test.ts
```

## Git History

```bash
804dd3b fix: Wire up FloatingActionBar and use stable Gemini model
0e2f3fc feat: Replace CopilotKit with Vercel AI SDK for GenUI streaming
```

## Architecture Decisions

### Why Vercel AI SDK over CopilotKit?
- CopilotKit had 351 broken dependencies causing build failures
- Vercel AI SDK is actively maintained by Vercel (Next.js creators)
- Better TypeScript support and streaming capabilities
- More control over the runtime

### Why gemini-1.5-flash-latest?
- Stable model (not experimental like gemini-2.0-flash-exp)
- Lower rate limits than experimental models
- Good balance of speed and quality for educational content

### Why Manual Streaming vs. Hooks?
- Vercel AI SDK's `experimental_useObject` wasn't available in v6
- Manual streaming gives us more control
- Can add progressive rendering later (TODO in code)

## Learning Science Principles

The GenUI implementation follows Charlotte Mason principles:

1. **Discovery over Lectures:** Tools like DynamicLedger let students explore
2. **Narrative Context:** Prompts use storytelling ("medieval marketplace")
3. **Real-World Connections:** Scenarios relate to student interests
4. **Multi-Sensory:** Combines visuals, interaction, and reflection
5. **Student Agency:** FloatingActionBar gives control over learning

## Prompt Engineering

The `buildPrompt()` function in GenUIOrchestrator includes:

- Student message and context (interests, recent activity)
- Available component types with detailed specs
- Design principles (narrative, adventure, conciseness)
- Charlotte Mason educational philosophy
- Strict JSON output format

Example prompt structure:
```
You are Adeline, an AI tutor composing an interactive learning experience.

STUDENT MESSAGE: "I want to learn about money"
STUDENT CONTEXT: Interests: medieval history, baking, economics

YOUR TASK: Compose a "Journal Page" experience

AVAILABLE COMPONENTS: [detailed specs]
DESIGN PRINCIPLES: [guidelines]
RESPONSE FORMAT: [JSON schema]
```

## Contact & Support

- **Codebase:** https://github.com/amberdawn84ac-bot/dear-adeline
- **Issues:** Report in GitHub Issues
- **Documentation:** `/docs/plans/2026-02-01-genui-implementation-plan.md`

## For Next Claude Session

**Quick Start:**
1. Read this document first
2. Check if Gemini API is working: test `/api/copilotkit`
3. If broken, review "Current Issues" section
4. Run tests: `pnpm test` (should see 77 passing)
5. Check recent git log: `git log --oneline -5`

**Priority Tasks:**
1. Debug "high demand" API error
2. Get one successful GenUI render end-to-end
3. Then move to next phase from implementation plan
