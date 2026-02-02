# Generative UI Redesign: Adeline as Sovereign Learning Orchestrator

**Date:** 2026-02-01
**Status:** Design Complete - Ready for Implementation
**Philosophy:** Chat as Orchestrator, GenUI as Manifestation

---

## Problem Statement

**Current State:**
- Adeline responds primarily with text/markdown in chat interface
- Kids find the experience boring and don't use the app
- Interactive elements exist (`<GAME>` tags, sketchnotes) but are text-embedded and not engaging enough
- Experience feels institutional and passive despite sophisticated backend

**Core Issues:**
1. **Text-first approach** - Kids see walls of text and bounce
2. **Hidden interactivity** - Games/visuals exist but aren't prominent or compelling
3. **Passive consumption** - Reading responses rather than exploring and commanding
4. **Institutional feel** - Confined to chat stream, lacks sovereignty and agency

**Success Metric:** Kids open the app daily on their own and engage for 20+ minutes

---

## Design Vision

### The Sovereignty Principle

> "If we keep Adeline trapped in a text-only chatbox, we're just building a faster typewriter. The 'minimalist' chat window is exactly where mainstream institutions want to keep us: confined to a narrow stream of prose that's easy to monitor and hard to explore."

**The "Adeline" Formula: Chat + GenUI**

Think of the chat as the **pen** and the GenUI as the **journal page**. They aren't separate things; they are a **collaborative cockpit for discovery**.

- **Chat = Orchestrator** - Adeline's voice, guidance, and intelligence
- **GenUI = Manifestation** - Student's agency, exploration, and sovereignty
- **Pattern:** Dialogue → UI Reveal → Interactive Exploration

### The Three-Part Interaction Pattern

Every engaging lesson follows this flow:

1. **Dialogue** - Adeline explains in chat (Charlotte Mason wisdom)
2. **UI Reveal** - Visual component "sketches itself" into existence (hand-drawn aesthetic)
3. **Interactive Exploration** - Student clicks/explores, doesn't just consume

**Example - "Botanical Discovery":**
```
Student: "Tell me about dandelions"

Adeline (Dialogue): "The dandelion is not a weed; it is a pioneer.
It grows where the soil is broken..."

[UI Reveal: Hand-drawn dandelion sketch fades in]

[Interactive Part: Student clicks taproot to learn about root systems]
```

---

## Architecture: Configuration-Driven Adeline

### Core Principle: Deterministic Execution

**Instead of hardcoded prompts, Adeline's behavior is defined in `.toml` configuration files.**

**Benefits:**
- ✅ Consistent persona across sessions
- ✅ Easy to modify (edit config, no code deployment)
- ✅ Parents/teachers can customize behavior
- ✅ Version controllable and shareable
- ✅ Aligned with sovereignty (no institutional lock-in)

### Directory Structure

```
~/.adeline/
├── modes/
│   ├── scout.toml          # Opportunity Scout
│   ├── tutor.toml          # Lesson delivery
│   ├── historian.toml      # Primary source analysis
│   ├── botanist.toml       # Nature discovery
│   └── mentor.toml         # Crisis support
├── data/
│   ├── learning_insights.json    # Student progress/mastery
│   ├── student_progress.json     # Credits/graduation tracking
│   └── current_interests.json    # Active learning path
└── templates/
    └── a2ui/                     # A2UI JSON templates
        ├── botanical-discovery.json
        ├── mission-card.json
        └── constellation-progress.json
```

### Configuration Example: Opportunity Scout

**File:** `~/.adeline/modes/scout.toml`

```toml
[mode]
name = "Opportunity Scout"
description = "Scans for real-world missions matching student mastery"
persona = "Adeline as guide to providential opportunities"

[context]
# File injection - reads local student data
learning_insights = "@{learning_insights.json}"
mastery_nodes = "@{student_progress.json}"
interests = "@{current_interests.json}"

[behavior]
primary_role = """
Your primary role is the 'Opportunity Scout' for the Seeker.

1. **Investigate**: Analyze the student's mastery nodes and current interests
2. **Search**: Use web search to find niche, non-institutional opportunities:
   - Apprenticeships with local artisans
   - Heirloom seed grants
   - Historical society contests
   - Craft competitions
   - Community science projects
3. **Plan**: Devise a 'Providential Mission' connecting theory to sovereignty
4. **Respond**: Output in sharp, whimsical Adeline voice
"""

[output]
format = "a2ui"
template = "mission-card"
# When opportunities found, render A2UI "Mission Card" in dashboard
```

### How Configuration Loading Works

**Backend Flow:**
```
1. Student triggers Scout mode
2. System reads ~/.adeline/modes/scout.toml
3. Injects files: @{learning_insights.json} → actual JSON data
4. Constructs system prompt with persona + context + behavior
5. Calls Gemini with constructed prompt
6. Gemini responds following config instructions
7. If output.format = "a2ui", streams A2UI JSON to frontend
8. Frontend renders using A2UI renderer
```

**Code Structure:**
```typescript
// src/lib/adeline/ConfigLoader.ts
class AdelineConfigLoader {
  loadMode(modeName: string): AdelineMode {
    // Read ~/.adeline/modes/{modeName}.toml
    // Parse TOML
    // Return structured config
  }

  injectContext(config: AdelineMode): string {
    // Replace @{filename} with actual file contents
    // Return complete system prompt
  }
}

// src/lib/adeline/Orchestrator.ts
class AdelineOrchestrator {
  async respond(message: string, mode: string) {
    const config = configLoader.loadMode(mode);
    const prompt = configLoader.injectContext(config);
    const response = await gemini.generate(prompt + message);

    if (config.output.format === 'a2ui') {
      return { type: 'a2ui', data: response };
    }
    return { type: 'text', data: response };
  }
}
```

---

## The Three Types of Generative UI

### 1. Static GenUI (useFrontendTool) - Pre-built Interactive Components

**Pattern:** Adeline selects pre-built component, populates with data, renders immediately.

**Not Generic "Games" - Sovereignty Tools:**

| Tool | Purpose | What It Teaches | GenUI Type |
|------|---------|-----------------|------------|
| **Fog of War Map** | Reveals interests as student explores | Self-discovery, curiosity | Interactive map that clears zones |
| **Interactive Compass** | Student clicks interests to set "North Star" | Agency, goal-setting | Clickable compass rose |
| **Dynamic Ledger** | Sliders show real-time cause/effect | Math, economics, stewardship | Live calculation interface |
| **Constellation Map** | Draws stars for each accomplishment | Progress, mastery | Animated star field |
| **Merchant's Ledger** | Trading game teaching fractions/money | Math, commerce | Trading interface |
| **Time Traveler's Quest** | Historical decision points | History, cause/effect | Timeline with choices |
| **Naturalist's Notebook** | Observation journal | Science, classification | Specimen catalog |

**Implementation with useFrontendTool:**

```typescript
// src/components/genui/static/FogOfWarMap.tsx
useFrontendTool({
  name: "reveal_fog_of_war",
  description: "Interactive map revealing student interests as they explore",
  parameters: z.object({
    currentInterest: z.string(),
    relatedTopics: z.array(z.string()),
    clearRadius: z.number()
  }),
  handler: async ({ currentInterest, relatedTopics, clearRadius }) => {
    // Update map state, log exploration
    return { revealed: relatedTopics, newConnections: [...] };
  },
  render: ({ status, args, result }) => {
    if (status === "executing") {
      return <FogOfWarMap
        center={args.currentInterest}
        topics={args.relatedTopics}
        clearRadius={args.clearRadius}
      />;
    }
    if (status === "complete") {
      return <MapRevealSummary discoveries={result.revealed} />;
    }
  }
});
```

**Key Characteristics:**
- **No text wrapper** - Component appears directly in chat
- **Hand-drawn aesthetic** - Uses RoughJS for organic feel
- **Immediate interactivity** - Students click/drag/explore right away
- **Logs to portfolio** - Every interaction records mastery

### 2. Declarative GenUI (A2UI) - JSON-Described Interfaces

**Pattern:** Adeline streams A2UI JSON blueprint, frontend renders as beautiful visual page.

**Use Cases:**
- Daily journal summaries (Pinterest-style visual recaps)
- Lesson completion cards (achievements, key concepts, next steps)
- Mission cards (opportunities discovered by Scout)
- Progress visualization (Constellation Map updates)

**A2UI Template Example - Botanical Discovery:**

**File:** `~/.adeline/templates/a2ui/botanical-discovery.json`

```json
[
  {
    "surfaceUpdate": {
      "surfaceId": "botany-lesson-01",
      "components": [
        {
          "id": "lesson-card",
          "component": {
            "Card": {
              "title": "The Sovereign Dandelion",
              "child": "lesson-layout",
              "style": { "backgroundColor": "#FFF9F0", "border": "2px solid #2F4731" }
            }
          }
        },
        {
          "id": "lesson-layout",
          "component": {
            "Column": {
              "children": {
                "explicitList": ["dandelion-sketch", "discovery-text", "taproot-detail", "action-button"]
              }
            }
          }
        },
        {
          "id": "dandelion-sketch",
          "component": {
            "Image": {
              "url": "/doodles/dandelion.svg",
              "altText": "Hand-drawn sketch of Taraxacum officinale",
              "style": { "transform": "rotate(-2deg)" }
            }
          }
        },
        {
          "id": "discovery-text",
          "component": {
            "Text": {
              "usageHint": "body",
              "text": {
                "literalString": "The dandelion is not a weed; it is a pioneer. It grows where the soil is broken. The taproot can reach 10 feet deep, breaking up compacted earth so other plants can thrive."
              },
              "style": { "fontFamily": "Kalam", "fontSize": "18px" }
            }
          }
        },
        {
          "id": "taproot-detail",
          "component": {
            "Image": {
              "url": "/doodles/taproot-diagram.svg",
              "altText": "Taproot cross-section showing depth",
              "interactive": true,
              "clickAction": { "name": "explore_taproot", "params": { "depth": 10 } }
            }
          }
        },
        {
          "id": "action-button",
          "component": {
            "Button": {
              "text": { "literalString": "🌿 I Found a Taproot!" },
              "action": {
                "name": "record_discovery",
                "params": { "subject": "Botany", "concept": "Taproots", "xp": 10 }
              },
              "primary": true
            }
          }
        }
      ]
    }
  },
  {
    "dataModelUpdate": {
      "surfaceId": "botany-lesson-01",
      "path": "/",
      "contents": [
        { "key": "lesson_complete", "valueBoolean": false },
        { "key": "discoveries", "valueNumber": 0 }
      ]
    }
  },
  {
    "beginRendering": {
      "surfaceId": "botany-lesson-01",
      "root": "lesson-card",
      "styles": {
        "primaryColor": "#2F4731",
        "font": "Kalam"
      }
    }
  }
]
```

**Implementation:**

```typescript
// src/app/layout.tsx
import { CopilotKitProvider } from "@copilotkit/react";
import { createA2UIMessageRenderer } from "@copilotkit/a2ui-renderer";

const A2UIRenderer = createA2UIMessageRenderer({
  theme: {
    primaryColor: "#2F4731",
    fontFamily: "Kalam, cursive",
    borderStyle: "hand-drawn",
    animations: "sketch-in"
  }
});

export default function RootLayout({ children }) {
  return (
    <CopilotKitProvider
      runtimeUrl="/api/copilotkit"
      renderActivityMessages={[A2UIRenderer]}
    >
      {children}
    </CopilotKitProvider>
  );
}
```

**Key Characteristics:**
- **Streams from Adeline** - JSON builds progressively
- **Platform agnostic** - Same spec works web/mobile/desktop
- **Hand-drawn styling** - Custom theme for organic feel
- **Interactive elements** - Buttons trigger actions back to Adeline

### 3. Open-Ended GenUI (MCP Apps) - Embedded External Tools

**Pattern:** Adeline embeds specialized external tools directly in dashboard.

**Use Cases:**
- **Opportunity Scout** - Grant/scholarship databases with search/filters
- **Primary Source Vault** - Historical document archives (Library of Congress, etc.)
- **Star Map** - Astronomy tools for science lessons
- **Local Resources** - Community calendars, farmer's markets, craft fairs

**Implementation with MCP Apps:**

```typescript
// src/app/api/copilotkit/route.ts
import { CopilotRuntime } from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { MCPAppsMiddleware } from "@ag-ui/mcp-apps-middleware";

const agent = new BuiltInAgent({
  model: "gemini/gemini-2.0-flash",
  prompt: configLoader.loadMode("scout").behavior.primary_role
}).use(
  new MCPAppsMiddleware({
    mcpServers: [
      {
        type: "http",
        url: "http://localhost:3108/mcp",
        serverId: "opportunity-scout"
      },
      {
        type: "http",
        url: "https://loc.gov/mcp",
        serverId: "primary-sources"
      }
    ]
  })
);

const runtime = new CopilotRuntime({
  agents: { default: agent }
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new ExperimentalEmptyAdapter(),
    endpoint: "/api/copilotkit"
  });
  return handleRequest(req);
};
```

**Key Characteristics:**
- **Full external UIs** - Iframe embeds or custom apps
- **Security boundary** - MCP protocol keeps apps sandboxed
- **Real-time data** - Live searches, not cached results
- **Sovereignty** - Access tools institutions don't control

---

## Migration Strategy: Phased Implementation

### Phase 1A: Learning Path & Lessons (HIGHEST PRIORITY)

**Why:** Core daily experience where kids spend time. If this is boring, nothing else matters.

**Current State:**
- LearningPathClient.tsx shows milestones/progress
- Lessons are likely text-heavy
- Limited interactivity

**Desired State:**
```
Kid: "Start my math lesson"

Adeline (Dialogue): "Let's explore how merchants tracked trades..."

[UI Reveal: Dynamic Ledger sketches in]

[Interactive: Sliders adjust prices, calculate profit/loss in real-time]

Adeline: "See how hidden fees compound? Now try setting honest prices..."

[After interaction: A2UI lesson summary with achievements]
```

**Technical Tasks:**
1. Build Dynamic Ledger component (Static GenUI)
2. Create lesson-summary A2UI template (Declarative GenUI)
3. Update LearningPathClient to trigger GenUI instead of text
4. Configure tutor.toml with lesson delivery behavior

**Success Metrics:**
- ✅ Kids complete lessons without prompting
- ✅ Average lesson time increases (engaged, not rushing)
- ✅ Kids ask "What's my next lesson?"

### Phase 1B: Journal (Daily Reflection)

**Why:** Daily touchpoint with high visual appeal potential.

**Current State:**
- NewJournalClient.tsx is basic form
- Text-based entry

**Desired State:**
```
Kid: "What did I learn today?"

Adeline: [Streams A2UI blueprint]

[UI Reveals: Pinterest-style page with:]
- Hand-drawn doodles of concepts learned
- Constellation Map showing new stars earned
- Achievement badges
- "Next Adventure" preview
```

**Technical Tasks:**
1. Create journal-summary A2UI template
2. Add "Ask Adeline to Summarize" button to journal page
3. Integrate with existing journal_entries table
4. Configure botanist.toml (or tutor.toml) for journal summaries

**Success Metrics:**
- ✅ Kids want to see their journal pages
- ✅ Kids show parents their visual summaries
- ✅ Kids ask "What did I earn today?"

### Phase 2: Game Library (Static GenUI)

**Why:** Build reusable sovereignty tools Adeline can orchestrate.

**Components to Build:**
1. **Fog of War Map** - Interest exploration
2. **Interactive Compass** - Goal setting
3. **Constellation Map** - Progress visualization
4. **Merchant's Ledger** - Math/economics
5. **Time Traveler's Quest** - History
6. **Naturalist's Notebook** - Science

**Technical Tasks:**
- Create `/src/components/genui/static/` directory
- Implement each component with useFrontendTool
- Use RoughJS for hand-drawn aesthetic
- Register tools in orchestrator
- Update tutor.toml to know when to trigger each tool

**Success Metrics:**
- ✅ Adeline selects appropriate tool based on lesson context
- ✅ Kids engage with tools for 10+ minutes
- ✅ Tools log mastery data to portfolio

### Phase 3: Opportunity Scout (Open-Ended GenUI)

**Why:** Real-world sovereignty and exploration.

**Current State:**
- Opportunities page is static
- Limited discoverability

**Desired State:**
```
Kid: "Find me science competitions"

Adeline: "Let me scout for you..." [activates scout.toml]

[UI Reveals: Embedded MCP app with:]
- Live search of science fairs
- Filter by age/location/topic
- Map view of local opportunities
- "Mission Card" for each match
```

**Technical Tasks:**
1. Configure scout.toml mode
2. Set up MCP Apps middleware
3. Create opportunity-discovery MCP server
4. Design mission-card A2UI template
5. Update opportunities page to embed MCP app

**Success Metrics:**
- ✅ Kids discover opportunities independently
- ✅ Kids click through to external resources
- ✅ Kids ask "What competitions can I enter?"

---

## Integration with Existing System

### Keep What Works

**Preserve existing infrastructure:**
- ✅ Supabase tables (conversations, journal_entries, student_progress, learning_paths)
- ✅ Existing tools (log_activity, update_student_progress, add_to_portfolio)
- ✅ Gemini backend (Flash/Pro models)
- ✅ Model router (Gemini/Grok/GPT-4 selection)
- ✅ Adaptive difficulty tracking
- ✅ Charlotte Mason + Life of Fred philosophy

### How GenUI Layers In

**Two Parallel Flows:**

**Flow 1 (Preserved): Text Q&A**
```
Quick question → /api/chat → Gemini response → Text answer
```

**Flow 2 (New): GenUI Experiences**
```
Lesson/Experience request → /api/copilotkit → Gemini + GenUI tools → Interactive UI
```

**Bridge Pattern:**
- CopilotKit runtime wraps existing Gemini setup
- Configuration loader reads .toml files
- Adeline's persona becomes runtime agent
- When Adeline needs GenUI, uses new tools (launch_ledger, render_journal)
- When Adeline needs text, responds normally
- Both flows log to same Supabase tables

### Tool Evolution

**Current Tools (Keep):**
- `log_activity` - Logs learning with academic translation
- `update_student_progress` - Tracks graduation credits
- `remember_this` - Saves to memory with embeddings
- `create_project` - Saves project plan to journal
- `add_to_portfolio` - Records accomplishments
- `search_web` - Tavily API for current info

**New GenUI Tools (Add):**
- `launch_fog_of_war` - Triggers interest map (Static GenUI)
- `launch_dynamic_ledger` - Triggers math tool (Static GenUI)
- `launch_time_traveler` - Triggers history game (Static GenUI)
- `render_journal_page` - Generates A2UI blueprint (Declarative GenUI)
- `render_mission_card` - Generates opportunity card (Declarative GenUI)
- `embed_external_tool` - Loads MCP app (Open-ended GenUI)

**Key Insight:** GenUI is additive. Text chat still works for quick questions. GenUI activates for lessons/experiences.

---

## Technical Implementation Details

### Backend Stack

**Core Dependencies:**
```json
{
  "@copilotkit/runtime": "latest",
  "@copilotkit/runtime-client-gql": "latest",
  "@copilotkit/react": "latest",
  "@copilotkitnext/react": "latest",
  "@copilotkit/a2ui-renderer": "^1.51.3",
  "@ag-ui/mcp-apps-middleware": "latest",
  "@google/generative-ai": "^0.24.1",
  "toml": "^3.0.0",
  "roughjs": "^4.6.6"
}
```

**New Files:**
```
src/
├── lib/
│   ├── adeline/
│   │   ├── ConfigLoader.ts         # Loads .toml configs
│   │   ├── Orchestrator.ts         # Routes to appropriate mode
│   │   ├── FileInjector.ts         # Handles @{file} syntax
│   │   └── GeminiAdapter.ts        # Wraps Gemini for CopilotRuntime
│   └── genui/
│       ├── A2UITheme.ts            # Hand-drawn theme config
│       └── ToolRegistry.ts         # Registers all GenUI tools
├── components/
│   └── genui/
│       ├── static/
│       │   ├── FogOfWarMap.tsx
│       │   ├── DynamicLedger.tsx
│       │   ├── InteractiveCompass.tsx
│       │   ├── ConstellationMap.tsx
│       │   ├── MerchantsLedger.tsx
│       │   ├── TimeTravelerQuest.tsx
│       │   └── NaturalistNotebook.tsx
│       ├── declarative/
│       │   ├── JournalPageRenderer.tsx
│       │   └── MissionCardRenderer.tsx
│       └── open-ended/
│           └── MCPAppContainer.tsx
└── app/
    └── api/
        └── copilotkit/
            └── route.ts            # CopilotRuntime endpoint

~/.adeline/                          # Config directory
├── modes/
│   ├── scout.toml
│   ├── tutor.toml
│   ├── historian.toml
│   └── botanist.toml
├── data/
│   ├── learning_insights.json
│   └── student_progress.json
└── templates/
    └── a2ui/
        ├── botanical-discovery.json
        ├── mission-card.json
        ├── journal-summary.json
        └── constellation-progress.json
```

### Frontend Integration

**App Layout (app/layout.tsx):**
```tsx
import { CopilotKitProvider } from "@copilotkit/react";
import { createA2UIMessageRenderer } from "@copilotkit/a2ui-renderer";
import { adelineTheme } from "@/lib/genui/A2UITheme";

const A2UIRenderer = createA2UIMessageRenderer({ theme: adelineTheme });

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CopilotKitProvider
          runtimeUrl="/api/copilotkit"
          renderActivityMessages={[A2UIRenderer]}
          showDevConsole={false}
        >
          <Providers>
            {children}
          </Providers>
        </CopilotKitProvider>
      </body>
    </html>
  );
}
```

**Adeline Theme (lib/genui/A2UITheme.ts):**
```typescript
export const adelineTheme = {
  primaryColor: "#2F4731",      // Forest green
  secondaryColor: "#F4E9D9",    // Cream
  accentColor: "#8B4513",       // Brown
  fontFamily: "Kalam, cursive", // Hand-drawn font

  // Hand-drawn styling
  borderStyle: "rough",          // Use RoughJS for borders
  borderWidth: 2,
  roughness: 1.5,               // Organic feel

  // Animation
  animationStyle: "sketch-in",  // Components sketch themselves in
  animationDuration: 800,

  // Component overrides
  Card: {
    backgroundColor: "#FFF9F0",
    transform: "rotate(-1deg)",  // Slight tilt for whimsy
    boxShadow: "4px 4px 8px rgba(0,0,0,0.1)"
  },
  Button: {
    fontFamily: "Fredoka, sans-serif",
    textTransform: "none",
    borderRadius: 8
  },
  Text: {
    body: { fontSize: 18, lineHeight: 1.6 },
    h1: { fontSize: 36, fontFamily: "Architects Daughter" },
    h2: { fontSize: 28, fontFamily: "Architects Daughter" }
  }
};
```

### API Route (app/api/copilotkit/route.ts)

```typescript
import { CopilotRuntime, ExperimentalEmptyAdapter } from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { MCPAppsMiddleware } from "@ag-ui/mcp-apps-middleware";
import { copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { AdelineConfigLoader } from "@/lib/adeline/ConfigLoader";
import { GeminiAdapter } from "@/lib/adeline/GeminiAdapter";
import { ToolRegistry } from "@/lib/genui/ToolRegistry";

const configLoader = new AdelineConfigLoader();
const toolRegistry = new ToolRegistry();

// Load Adeline's current mode (could be dynamic based on context)
const mode = configLoader.loadMode("tutor");
const prompt = configLoader.injectContext(mode);

const agent = new BuiltInAgent({
  model: new GeminiAdapter("gemini-2.0-flash"),
  prompt: prompt,
  tools: toolRegistry.getAllTools()
}).use(
  new MCPAppsMiddleware({
    mcpServers: [
      {
        type: "http",
        url: "http://localhost:3108/mcp",
        serverId: "opportunity-scout"
      }
    ]
  })
);

const runtime = new CopilotRuntime({
  agents: { default: agent }
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new ExperimentalEmptyAdapter(),
    endpoint: "/api/copilotkit"
  });
  return handleRequest(req);
};
```

### Configuration Loader (lib/adeline/ConfigLoader.ts)

```typescript
import fs from 'fs';
import path from 'path';
import TOML from 'toml';

export interface AdelineMode {
  name: string;
  description: string;
  persona: string;
  context: Record<string, string>;  // Files to inject
  behavior: {
    primary_role: string;
  };
  output: {
    format: 'text' | 'a2ui' | 'mcp-app';
    template?: string;
  };
}

export class AdelineConfigLoader {
  private configDir: string;

  constructor() {
    this.configDir = path.join(process.env.HOME!, '.adeline', 'modes');
  }

  loadMode(modeName: string): AdelineMode {
    const configPath = path.join(this.configDir, `${modeName}.toml`);
    const tomlContent = fs.readFileSync(configPath, 'utf-8');
    const config = TOML.parse(tomlContent);

    return {
      name: config.mode.name,
      description: config.mode.description,
      persona: config.mode.persona,
      context: config.context || {},
      behavior: config.behavior,
      output: config.output
    };
  }

  injectContext(mode: AdelineMode): string {
    let prompt = mode.behavior.primary_role;

    // Replace @{filename} with actual file contents
    for (const [key, filePath] of Object.entries(mode.context)) {
      if (filePath.startsWith('@{') && filePath.endsWith('}')) {
        const filename = filePath.slice(2, -1);
        const dataPath = path.join(process.env.HOME!, '.adeline', 'data', filename);

        if (fs.existsSync(dataPath)) {
          const fileContent = fs.readFileSync(dataPath, 'utf-8');
          prompt = prompt.replace(filePath, fileContent);
        }
      }
    }

    return prompt;
  }
}
```

---

## Data Flow Examples

### Example 1: Math Lesson with Dynamic Ledger

```
1. Student clicks "Start Math Lesson" in Learning Path

2. Frontend → /api/copilotkit
   Request: { message: "Start lesson: Fractions and percentages", mode: "tutor" }

3. Backend:
   - Loads tutor.toml config
   - Injects @{student_progress.json} into prompt
   - Gemini sees: "Student needs fractions. Has basic addition mastery."
   - Gemini decides: Use Dynamic Ledger tool

4. Gemini calls tool:
   launch_dynamic_ledger({
     scenario: "Merchant selling bread at market",
     items: [
       { name: "Loaf", wholeSalePrice: 2, retailPrice: 3 },
       { name: "Baguette", wholeSalePrice: 1.5, retailPrice: 2.5 }
     ],
     learningGoal: "Understand profit margins as fractions and percentages"
   })

5. Frontend:
   - useFrontendTool receives call
   - Renders <DynamicLedger> component immediately
   - Student sees: Trading interface with sliders
   - Student adjusts prices, sees profit/margin update in real-time

6. Student finishes game (10 minutes):
   - Returns: { score: 85, concepts: ["profit margin", "markup percentage"] }

7. Gemini receives completion:
   - Streams A2UI JSON for lesson summary
   - Beautiful visual page with:
     - Hand-drawn bread doodles
     - Key concepts learned
     - Stars earned on Constellation Map
     - Credits logged (0.02 for extended lesson)

8. Backend logs:
   - log_activity({ activity: "Math lesson: Fractions", academic_equiv: "Pre-Algebra" })
   - update_student_progress({ subject: "Math", credits: 0.02 })
   - add_to_portfolio({ title: "Merchant's Ledger Master", evidence: "85% score" })

9. Student sees:
   - Beautiful A2UI summary page
   - Progress bar updates
   - New star appears on Constellation Map
```

### Example 2: Daily Journal Summary

```
1. Student clicks "Ask Adeline to Summarize" in Journal page

2. Frontend → /api/copilotkit
   Request: {
     message: "Summarize today's learning",
     mode: "tutor",
     context: {
       activities: [...today's activities from DB...],
       projects: [...current projects...],
       credits_earned: 0.05
     }
   }

3. Backend:
   - Loads tutor.toml config
   - Gemini analyzes activities
   - Decides: Render journal summary with A2UI

4. Gemini streams A2UI JSON:
   {
     "surfaceUpdate": {
       "components": [
         // Beautiful Pinterest-style layout
         // Hand-drawn doodles of concepts
         // Constellation showing today's stars
         // "Next Adventure" preview
       ]
     }
   }

5. Frontend:
   - A2UI renderer receives stream
   - Components "sketch in" progressively
   - Student watches page build in real-time (like watching an artist draw)

6. Final result:
   - Gorgeous visual summary
   - Student shows parent: "Look what I learned!"
   - Parent sees academic standards met (in parent view)
```

### Example 3: Opportunity Scout

```
1. Student asks: "Find me science competitions"

2. Frontend → /api/copilotkit
   Request: { message: "Find science competitions", mode: "scout" }

3. Backend:
   - Loads scout.toml config
   - Injects @{learning_insights.json} (student strong in biology, interested in bees)
   - Gemini searches web using Tavily API
   - Finds:
     - Local science fair (deadline 3 weeks)
     - Beekeeping apprenticeship (nearby farm)
     - Young naturalist contest (state level)

4. Gemini decides: Render mission cards with A2UI + embed external tool

5. Response includes:
   - 3 A2UI mission cards (one per opportunity)
   - MCP app embed for "Opportunity Tracker" (external tool for managing deadlines)

6. Frontend:
   - Renders 3 beautiful mission cards
   - Embeds Opportunity Tracker iframe
   - Student clicks card → sees details
   - Student clicks "Track This" → adds to their calendar

7. Student discovers sovereignty:
   - Finds real-world mission aligned with interests
   - Takes agency in pursuing it
   - Adeline guides but student leads
```

---

## The Floating Action Bar

**Concept:** Move beyond "Altar of the Chat Input" - give students ability to **command** rather than just **prompt**.

**Design:**
```
┌─────────────────────────────────────────────┐
│  Learning Path Dashboard                     │
│                                              │
│  [Constellation Map showing progress]        │
│                                              │
│  Current Milestone: "Pioneer Botanist"       │
│  Stars earned: 7/10                          │
│                                              │
└─────────────────────────────────────────────┘

        Floating Action Bar (bottom of screen)
┌─────────────────────────────────────────────┐
│  [🗺️ Explore]  [🎓 Lesson]  [🔍 Scout]  [📖 Journal]  │
└─────────────────────────────────────────────┘
```

**Actions:**
- **🗺️ Explore** → Opens Fog of War Map
- **🎓 Lesson** → Launches next lesson in path (with appropriate GenUI tool)
- **🔍 Scout** → Activates Opportunity Scout mode
- **📖 Journal** → Opens today's journal with "Summarize" button

**Implementation:**
```tsx
// src/components/FloatingActionBar.tsx
export function FloatingActionBar() {
  const { activateMode } = useAdelineOrchestrator();

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2
                    bg-white border-2 border-forest rounded-full
                    shadow-lg px-6 py-3 flex gap-4">
      <ActionButton
        icon="🗺️"
        label="Explore"
        onClick={() => activateMode('explorer')}
      />
      <ActionButton
        icon="🎓"
        label="Lesson"
        onClick={() => activateMode('tutor')}
      />
      <ActionButton
        icon="🔍"
        label="Scout"
        onClick={() => activateMode('scout')}
      />
      <ActionButton
        icon="📖"
        label="Journal"
        onClick={() => activateMode('journalist')}
      />
    </div>
  );
}
```

**Philosophy:** Students don't type "Can you help me find opportunities?" - they click **Scout** and Adeline springs into action.

---

## Success Metrics

### Primary Metric: Daily Active Usage
- **Current:** Kids don't use app
- **Target:** Kids open app daily without prompting
- **Measure:** Daily active users, average session length

### Engagement Metrics by Phase

**Phase 1A - Interactive Lessons:**
- ✅ Kids complete lessons without being asked
- ✅ Average lesson time increases (engaged, not rushing)
- ✅ Kids ask "What's my next lesson?"
- ✅ Lesson completion rate > 80%

**Phase 1B - Visual Journal:**
- ✅ Kids want to see their journal pages
- ✅ Kids show parents their summaries
- ✅ Kids ask "What did I earn today?"
- ✅ Daily journal entry rate > 70%

**Phase 2 - Game Library:**
- ✅ Kids engage with tools for 10+ minutes
- ✅ Multiple tool uses per session
- ✅ Kids request specific tools by name

**Phase 3 - Opportunity Scout:**
- ✅ Kids discover opportunities independently
- ✅ Kids click through to external resources
- ✅ Kids pursue at least 1 opportunity per month

### Leading Indicators (Early Wins)
- Time in app increases week over week
- Completion rates increase
- Kids smile/laugh during lessons (observe!)
- Kids share screens with siblings/parents
- Kids open app without being told

### The Ultimate Test
**Do your kids open the app on their own?**

---

## Implementation Validation

### Week 1 Validation (After Phase 1A)
1. Deploy interactive lessons with Dynamic Ledger
2. Watch kids use for 5 days
3. Measure:
   - Session length
   - Lesson completion
   - Voluntary usage
4. Interview kids: "Was that fun? What would make it better?"

### Decision Point
- **If engaged:** Continue to Phase 1B (Journal)
- **If not engaged:** Iterate on game design, aesthetics, or lesson flow before proceeding

### Week 2 Validation (After Phase 1B)
1. Add visual journal summaries
2. Observe for 5 days
3. Measure:
   - Journal page views
   - Sharing behavior
   - Voluntary check-ins
4. Interview: "Do you like seeing your progress this way?"

### Full Validation (After Phase 2)
1. All sovereignty tools deployed
2. Observe for 2 weeks
3. Full engagement analysis
4. Decision: Proceed to Phase 3 or refine existing tools

---

## Risk Mitigation

### Technical Risks

**Risk:** Configuration-driven system adds complexity
- **Mitigation:** Start with 2-3 modes (tutor, scout), prove pattern works
- **Fallback:** Can revert to hardcoded prompts if config system fails

**Risk:** A2UI rendering breaks or looks bad
- **Mitigation:** Build 3 solid templates first, test thoroughly before generalizing
- **Fallback:** Can render as structured HTML if A2UI fails

**Risk:** MCP Apps introduce security concerns
- **Mitigation:** Start with trusted servers only, sandbox iframes
- **Fallback:** Phase 3 is optional, can use declarative GenUI instead

### User Experience Risks

**Risk:** Kids still find it boring despite GenUI
- **Mitigation:** Early validation after Phase 1A, iterate before proceeding
- **Pivot:** Adjust aesthetics, game mechanics, or lesson pacing based on feedback

**Risk:** GenUI feels gimmicky, not substantive
- **Mitigation:** Ensure every interaction teaches real concepts, logs mastery
- **Validation:** Track academic progress alongside engagement

**Risk:** Parents concerned about "just playing games"
- **Mitigation:** Parent view shows standards met, credits earned, academic translation
- **Communication:** Frame as "Charlotte Mason meets digital interactivity"

### Scope Risks

**Risk:** Trying to build too much at once
- **Mitigation:** Strict phasing, validate each phase before next
- **Discipline:** If Phase 1A doesn't work, don't proceed to 1B

**Risk:** Configuration system becomes over-engineered
- **Mitigation:** Start simple (3 .toml files), only add complexity if needed
- **YAGNI:** Don't build config features until we need them

---

## Next Steps

### Immediate Actions (Before Implementation)

1. **✅ Design document complete** (this document)
2. **Commit design to git**
3. **Create isolated workspace** (use git worktree)
4. **Write detailed implementation plan** (use writing-plans skill)

### Implementation Sequence

1. **Foundation Setup**
   - Install CopilotKit dependencies
   - Create configuration system (.toml loader)
   - Set up /api/copilotkit route
   - Wrap app in CopilotKitProvider

2. **Phase 1A: First Interactive Lesson**
   - Build Dynamic Ledger component
   - Create tutor.toml config
   - Implement useFrontendTool hook
   - Test with one math lesson
   - **VALIDATE WITH KIDS**

3. **Phase 1A: Lesson Summary**
   - Build lesson-summary A2UI template
   - Configure A2UI renderer with Adeline theme
   - Stream summary after lesson completion
   - **VALIDATE WITH KIDS**

4. **Phase 1B: Visual Journal**
   - Create journal-summary A2UI template
   - Add "Summarize" button to journal page
   - Integrate with existing journal data
   - **VALIDATE WITH KIDS**

5. **Phase 2: Sovereignty Tools**
   - Build Fog of War Map
   - Build Interactive Compass
   - Build Constellation Map
   - Update tutor.toml to orchestrate tools
   - **VALIDATE WITH KIDS**

6. **Phase 3: Opportunity Scout**
   - Configure scout.toml
   - Set up MCP Apps middleware
   - Create mission-card A2UI template
   - Integrate with opportunities page
   - **VALIDATE WITH KIDS**

### Documentation

- **This design doc:** Source of truth for vision and architecture
- **Implementation plan:** Detailed step-by-step tasks (created next)
- **Weekly notes:** Track what works, what doesn't, kid feedback
- **Parent communication:** Share progress, show academic rigor

---

## Conclusion

This redesign transforms Adeline from a text-first chatbot into a **sovereignty-first learning orchestrator**. By combining configuration-driven behavior, three types of Generative UI, and a philosophy of student agency, we create an experience where kids **explore, command, and discover** rather than passively consume.

**The core insight:** Chat is the pen, GenUI is the journal. Together they form a collaborative cockpit for learning that respects sovereignty, encourages curiosity, and makes education an adventure rather than an obligation.

**Success looks like:** Kids opening the app on their own, engaging for 20+ minutes, and asking "What's next?" instead of needing to be told to learn.

**The path forward:** Build iteratively, validate with real kids after each phase, and be willing to pivot based on what actually engages them. Technology serves the philosophy, not the other way around.

---

**Ready for implementation planning.**
