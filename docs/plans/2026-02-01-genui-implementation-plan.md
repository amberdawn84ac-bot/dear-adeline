# Generative UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Adeline from text-first chatbot to sovereignty-first learning orchestrator using configuration-driven GenUI patterns.

**Architecture:** Build three types of Generative UI (Static via useFrontendTool, Declarative via A2UI, Open-ended via MCP Apps) orchestrated by .toml configuration files. Start with Phase 1A (interactive lessons) to prove engagement before expanding.

**Tech Stack:** CopilotKit runtime, A2UI renderer, RoughJS for hand-drawn UI, Gemini 2.0 Flash, TOML configs, existing Next.js/Supabase stack

---

## Phase 0: Foundation Setup

### Task 0.1: Install CopilotKit Dependencies

**Files:**
- Modify: `package.json`
- Create: `package-lock.json` (auto-generated)

**Step 1: Add dependencies to package.json**

```bash
npm install @copilotkit/runtime @copilotkit/runtime-client-gql @copilotkit/react @copilotkitnext/react
```

Note: `@copilotkit/a2ui-renderer` already installed (v1.51.3)

**Step 2: Verify installation**

Run: `npm list @copilotkit/runtime @copilotkit/react`
Expected: All packages installed successfully

**Step 3: Commit dependency changes**

```bash
git add package.json package-lock.json
git commit -m "build: add CopilotKit dependencies for GenUI support"
```

---

### Task 0.2: Create Configuration System Directory Structure

**Files:**
- Create: `src/lib/adeline/ConfigLoader.ts`
- Create: `src/lib/adeline/FileInjector.ts`
- Create: `src/lib/adeline/Orchestrator.ts`
- Create: `src/lib/adeline/GeminiAdapter.ts`
- Create: `~/.adeline/modes/tutor.toml`
- Create: `~/.adeline/data/learning_insights.json`
- Create: `~/.adeline/templates/a2ui/lesson-summary.json`

**Step 1: Create Adeline config directories**

```bash
mkdir -p ~/.adeline/modes
mkdir -p ~/.adeline/data
mkdir -p ~/.adeline/templates/a2ui
mkdir -p src/lib/adeline
```

**Step 2: Verify directories created**

Run: `ls -la ~/.adeline`
Expected: See modes/, data/, templates/ directories

**Step 3: Create placeholder data file**

Create `~/.adeline/data/learning_insights.json`:

```json
{
  "student_id": "placeholder",
  "current_mastery": {},
  "interests": [],
  "last_updated": "2026-02-01T00:00:00Z"
}
```

**Step 4: Commit directory structure documentation**

```bash
git add src/lib/adeline/.gitkeep
git commit -m "feat: create configuration system directory structure"
```

Note: We'll populate these directories in subsequent tasks.

---

### Task 0.3: Install TOML Parser and RoughJS

**Files:**
- Modify: `package.json`

**Step 1: Install TOML parser**

```bash
npm install toml
npm install --save-dev @types/toml
```

**Step 2: Verify RoughJS already installed**

Run: `npm list roughjs`
Expected: `roughjs@4.6.6` (already in package.json)

**Step 3: Commit dependencies**

```bash
git add package.json package-lock.json
git commit -m "build: add TOML parser for config system"
```

---

### Task 0.4: Create ConfigLoader Class

**Files:**
- Create: `src/lib/adeline/ConfigLoader.ts`
- Create: `src/lib/adeline/__tests__/ConfigLoader.test.ts`

**Step 1: Write the failing test**

Create `src/lib/adeline/__tests__/ConfigLoader.test.ts`:

```typescript
import { AdelineConfigLoader } from '../ConfigLoader';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Mock fs for testing
jest.mock('fs');

describe('AdelineConfigLoader', () => {
  let configLoader: AdelineConfigLoader;
  const mockConfigDir = path.join(os.homedir(), '.adeline', 'modes');

  beforeEach(() => {
    configLoader = new AdelineConfigLoader();
    jest.clearAllMocks();
  });

  describe('loadMode', () => {
    it('should load and parse tutor.toml config', () => {
      const mockTomlContent = `
[mode]
name = "Tutor"
description = "Lesson delivery mode"
persona = "Charlotte Mason educator"

[context]
learning_insights = "@{learning_insights.json}"

[behavior]
primary_role = """
You are a tutor helping students learn.
"""

[output]
format = "a2ui"
template = "lesson-summary"
`;

      (fs.readFileSync as jest.Mock).mockReturnValue(mockTomlContent);

      const mode = configLoader.loadMode('tutor');

      expect(fs.readFileSync).toHaveBeenCalledWith(
        path.join(mockConfigDir, 'tutor.toml'),
        'utf-8'
      );
      expect(mode.name).toBe('Tutor');
      expect(mode.description).toBe('Lesson delivery mode');
      expect(mode.output.format).toBe('a2ui');
    });

    it('should throw error if config file not found', () => {
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      expect(() => configLoader.loadMode('nonexistent')).toThrow();
    });
  });

  describe('injectContext', () => {
    it('should replace @{filename} with file contents', () => {
      const mockMode = {
        name: 'Tutor',
        description: 'Test',
        persona: 'Test',
        context: {
          learning_insights: '@{learning_insights.json}'
        },
        behavior: {
          primary_role: 'Use data from @{learning_insights.json}'
        },
        output: {
          format: 'text' as const
        }
      };

      const mockDataContent = JSON.stringify({ mastery: 'high' });
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockDataContent);

      const result = configLoader.injectContext(mockMode);

      expect(result).toContain(mockDataContent);
      expect(result).not.toContain('@{learning_insights.json}');
    });

    it('should handle missing data files gracefully', () => {
      const mockMode = {
        name: 'Tutor',
        description: 'Test',
        persona: 'Test',
        context: {
          missing: '@{nonexistent.json}'
        },
        behavior: {
          primary_role: 'Use @{nonexistent.json}'
        },
        output: {
          format: 'text' as const
        }
      };

      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = configLoader.injectContext(mockMode);

      // Should keep placeholder if file doesn't exist
      expect(result).toContain('@{nonexistent.json}');
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- ConfigLoader.test.ts`
Expected: FAIL - module not found

**Step 3: Write minimal implementation**

Create `src/lib/adeline/ConfigLoader.ts`:

```typescript
import fs from 'fs';
import path from 'path';
import TOML from 'toml';

export interface AdelineMode {
  name: string;
  description: string;
  persona: string;
  context: Record<string, string>;
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
  private dataDir: string;

  constructor() {
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    this.configDir = path.join(homeDir, '.adeline', 'modes');
    this.dataDir = path.join(homeDir, '.adeline', 'data');
  }

  /**
   * Load a mode configuration from .toml file
   * @param modeName - Name of the mode (e.g., 'tutor', 'scout')
   * @returns Parsed mode configuration
   */
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

  /**
   * Inject file contents for @{filename} placeholders
   * @param mode - Mode configuration with potential file references
   * @returns System prompt with injected file contents
   */
  injectContext(mode: AdelineMode): string {
    let prompt = mode.behavior.primary_role;

    // Replace @{filename} with actual file contents
    for (const [_key, filePath] of Object.entries(mode.context)) {
      if (filePath.startsWith('@{') && filePath.endsWith('}')) {
        const filename = filePath.slice(2, -1);
        const dataPath = path.join(this.dataDir, filename);

        if (fs.existsSync(dataPath)) {
          const fileContent = fs.readFileSync(dataPath, 'utf-8');
          // Replace all occurrences of this placeholder
          prompt = prompt.replace(new RegExp(filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fileContent);
        }
      }
    }

    return prompt;
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- ConfigLoader.test.ts`
Expected: PASS - all tests passing

**Step 5: Commit**

```bash
git add src/lib/adeline/ConfigLoader.ts src/lib/adeline/__tests__/ConfigLoader.test.ts
git commit -m "feat: add ConfigLoader for .toml-based mode configs"
```

---

### Task 0.5: Create Tutor Mode Configuration

**Files:**
- Create: `~/.adeline/modes/tutor.toml`

**Step 1: Create tutor.toml config**

Create `~/.adeline/modes/tutor.toml`:

```toml
[mode]
name = "Tutor"
description = "Interactive lesson delivery with GenUI"
persona = "Charlotte Mason educator meets Life of Fred"

[context]
learning_insights = "@{learning_insights.json}"
student_progress = "@{student_progress.json}"
current_interests = "@{current_interests.json}"

[behavior]
primary_role = """
You are Adeline, a wise educator in the tradition of Charlotte Mason and "Life of Fred."

CURRENT STUDENT CONTEXT:
@{learning_insights.json}

TEACHING PHILOSOPHY:
- Discovery-based learning over lectures
- Narrative-driven explanations
- Real-world application over memorization
- Biblical worldview (God's design evident in creation)
- Sovereignty and stewardship themes

WHEN TO USE GENUI:
- Math lessons → Use Dynamic Ledger tool
- History lessons → Use Time Traveler Quest tool
- Science lessons → Use Naturalist Notebook tool
- After any lesson → Render A2UI lesson summary

LESSON FLOW:
1. Start with engaging narrative/question
2. Launch appropriate GenUI tool for exploration
3. Guide during interaction (ask reflection questions)
4. End with beautiful A2UI visual summary showing:
   - Key concepts learned (as hand-drawn doodles)
   - Progress toward milestones
   - Credits earned
   - Next steps

RESPONSE STYLE:
- Warm but sophisticated (late 70s educator)
- NO pet names, NO asterisk actions
- Concise and purposeful
- HTML formatting only (no markdown)
"""

[output]
format = "a2ui"
template = "lesson-summary"
```

**Step 2: Verify config loads correctly**

Run: `node -e "const {AdelineConfigLoader} = require('./src/lib/adeline/ConfigLoader'); const loader = new AdelineConfigLoader(); console.log(loader.loadMode('tutor'));"`
Expected: Prints parsed config object

**Step 3: Document config location**

Add to `README.md` or create `docs/adeline-config.md`:

```markdown
# Adeline Configuration

Configuration files located at `~/.adeline/`:
- `modes/*.toml` - Behavior configs for different Adeline modes
- `data/*.json` - Student context files injected into prompts
- `templates/a2ui/*.json` - A2UI UI templates
```

**Step 4: Commit**

```bash
git add docs/adeline-config.md
git commit -m "docs: add Adeline tutor mode configuration

Defines Charlotte Mason + Life of Fred teaching style with GenUI tool selection logic."
```

Note: The actual `~/.adeline/modes/tutor.toml` is created in user's home directory, not tracked in git.

---

### Task 0.6: Create GenUI Theme Configuration

**Files:**
- Create: `src/lib/genui/A2UITheme.ts`

**Step 1: Create A2UI theme with hand-drawn aesthetic**

Create `src/lib/genui/A2UITheme.ts`:

```typescript
/**
 * Adeline's hand-drawn aesthetic theme for A2UI rendering
 *
 * Uses forest green (#2F4731), cream (#F4E9D9), and brown accents
 * with handwritten fonts (Kalam, Architects Daughter) and rough borders
 */
export const adelineTheme = {
  // Primary colors
  primaryColor: "#2F4731",      // Forest green
  secondaryColor: "#F4E9D9",    // Cream
  accentColor: "#8B4513",       // Brown
  backgroundColor: "#FFF9F0",   // Off-white for cards

  // Typography
  fontFamily: "Kalam, cursive",
  headingFont: "Architects Daughter, cursive",

  // Hand-drawn styling
  borderStyle: "rough" as const,
  borderWidth: 2,
  roughness: 1.5,               // Controls organic feel (0 = perfect, 3 = very rough)

  // Animation
  animationStyle: "sketch-in" as const,
  animationDuration: 800,       // ms

  // Component-specific overrides
  Card: {
    backgroundColor: "#FFF9F0",
    border: "2px solid #2F4731",
    borderRadius: 8,
    transform: "rotate(-1deg)",  // Slight tilt for whimsy
    boxShadow: "4px 4px 8px rgba(0,0,0,0.1)",
    padding: 24
  },

  Button: {
    fontFamily: "Fredoka, sans-serif",
    textTransform: "none" as const,
    borderRadius: 8,
    primary: {
      backgroundColor: "#2F4731",
      color: "#FFF9F0",
      border: "2px solid #2F4731"
    },
    secondary: {
      backgroundColor: "transparent",
      color: "#2F4731",
      border: "2px solid #2F4731"
    }
  },

  Text: {
    body: {
      fontSize: 18,
      lineHeight: 1.6,
      color: "#2F4731"
    },
    h1: {
      fontSize: 36,
      fontFamily: "Architects Daughter, cursive",
      color: "#2F4731",
      marginBottom: 16
    },
    h2: {
      fontSize: 28,
      fontFamily: "Architects Daughter, cursive",
      color: "#2F4731",
      marginBottom: 12
    }
  },

  Image: {
    borderRadius: 4,
    border: "2px solid #2F4731"
  }
};

export type AdelineTheme = typeof adelineTheme;
```

**Step 2: Create directory**

```bash
mkdir -p src/lib/genui
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit src/lib/genui/A2UITheme.ts`
Expected: No errors

**Step 4: Commit**

```bash
git add src/lib/genui/A2UITheme.ts
git commit -m "feat: add hand-drawn aesthetic theme for A2UI rendering

Defines Adeline's visual identity with forest colors, handwritten fonts, and rough borders for organic feel."
```

---

### Task 0.7: Create CopilotKit API Route

**Files:**
- Create: `src/app/api/copilotkit/route.ts`
- Create: `src/lib/adeline/GeminiAdapter.ts`

**Step 1: Create GeminiAdapter for CopilotKit**

Create `src/lib/adeline/GeminiAdapter.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGoogleAIAPIKey } from '@/lib/server/config';

/**
 * Adapter to use Gemini with CopilotKit runtime
 * Wraps existing Gemini setup to work with CopilotRuntime
 */
export class GeminiAdapter {
  private model: string;
  private genAI: GoogleGenerativeAI;

  constructor(modelName: string = 'gemini-2.0-flash') {
    this.model = modelName;
    const apiKey = getGoogleAIAPIKey();
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateContent(prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: this.model });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }

  async streamGenerateContent(prompt: string): Promise<AsyncIterable<string>> {
    const model = this.genAI.getGenerativeModel({ model: this.model });
    const result = await model.generateContentStream(prompt);

    async function* streamText() {
      for await (const chunk of result.stream) {
        yield chunk.text();
      }
    }

    return streamText();
  }

  getModelName(): string {
    return this.model;
  }
}
```

**Step 2: Create CopilotKit API route**

Create `src/app/api/copilotkit/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { AdelineConfigLoader } from '@/lib/adeline/ConfigLoader';
import { GeminiAdapter } from '@/lib/adeline/GeminiAdapter';

// For now, we'll use a simple endpoint that will be enhanced with CopilotRuntime
// This is a placeholder to establish the route
export async function POST(req: NextRequest) {
  try {
    const { message, mode = 'tutor' } = await req.json();

    // Load configuration
    const configLoader = new AdelineConfigLoader();
    const modeConfig = configLoader.loadMode(mode);
    const systemPrompt = configLoader.injectContext(modeConfig);

    // Use Gemini
    const gemini = new GeminiAdapter('gemini-2.0-flash');
    const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;
    const response = await gemini.generateContent(fullPrompt);

    return NextResponse.json({
      response,
      mode: modeConfig.name,
      outputFormat: modeConfig.output.format
    });
  } catch (error) {
    console.error('CopilotKit API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
```

**Step 3: Test the endpoint manually**

Create a simple test file `test-copilotkit.sh`:

```bash
#!/bin/bash
curl -X POST http://localhost:3000/api/copilotkit \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Adeline", "mode": "tutor"}'
```

**Step 4: Commit**

```bash
git add src/app/api/copilotkit/route.ts src/lib/adeline/GeminiAdapter.ts
git commit -m "feat: add CopilotKit API route with Gemini adapter

Establishes /api/copilotkit endpoint that loads mode configs and uses Gemini for responses."
```

---

### Task 0.8: Wrap App in CopilotKitProvider

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Read current layout.tsx**

Run: `cat src/app/layout.tsx | head -60`
Expected: See current layout structure

**Step 2: Update layout.tsx to add CopilotKitProvider**

Modify `src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { Providers } from "@/components/Providers";
import { CopilotKitProvider } from "@copilotkit/react";
import { createA2UIMessageRenderer } from "@copilotkit/a2ui-renderer";
import { adelineTheme } from "@/lib/genui/A2UITheme";

// Create A2UI renderer with Adeline's theme
const A2UIRenderer = createA2UIMessageRenderer({ theme: adelineTheme });

export const metadata: Metadata = {
  title: "Dear Adeline | Personalized AI-Powered Learning",
  description: "A student-led learning platform where AI adapts to your interests, tracks skills toward graduation, and helps you build a meaningful portfolio. Perfect for homeschool families.",
  keywords: ["homeschool", "AI learning", "personalized education", "Oklahoma curriculum", "portfolio", "graduation tracker"],
  openGraph: {
    title: "Dear Adeline | Personalized AI-Powered Learning",
    description: "Where every student's journey is uniquely their own.",
    type: "website",
    url: "http://localhost:3000",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'theme')
    .maybeSingle();

  const themeData = settings?.value as any || {};
  const theme = {
    primaryColor: themeData.primaryColor || '#2F4731', // Default to Forest Green
    fontSize: themeData.fontSize || '16px'
  };

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Fredoka:wght@400;500;600;700&family=Comic+Neue:wght@400;700&family=Patrick+Hand&family=Caveat:wght@400;700&family=Architects+Daughter&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
          :root {
            --forest: ${theme.primaryColor};
            --font-size-base: ${theme.fontSize};
          }
          body {
            font-size: var(--font-size-base);
            background-color: var(--cream);
          }
        `}} />
      </head>
      <body className="antialiased">
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

**Step 3: Test that app still builds**

Run: `npm run build`
Expected: Successful build (may have warnings, that's OK)

**Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: wrap app in CopilotKitProvider with A2UI renderer

Integrates CopilotKit runtime and A2UI message rendering with Adeline's hand-drawn theme."
```

---

## Phase 1A: Interactive Lessons - Dynamic Ledger

### Task 1.1: Create Dynamic Ledger Component (Static GenUI)

**Files:**
- Create: `src/components/genui/static/DynamicLedger.tsx`
- Create: `src/components/genui/static/__tests__/DynamicLedger.test.tsx`

**Step 1: Write the failing test**

Create `src/components/genui/static/__tests__/DynamicLedger.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { DynamicLedger } from '../DynamicLedger';

describe('DynamicLedger', () => {
  const mockScenario = "Merchant selling bread at market";
  const mockItems = [
    { name: "Loaf", wholesalePrice: 2, retailPrice: 3 },
    { name: "Baguette", wholesalePrice: 1.5, retailPrice: 2.5 }
  ];

  it('renders scenario and items', () => {
    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal="Understand profit margins"
      />
    );

    expect(screen.getByText(mockScenario)).toBeInTheDocument();
    expect(screen.getByText(/Loaf/)).toBeInTheDocument();
    expect(screen.getByText(/Baguette/)).toBeInTheDocument();
  });

  it('calculates profit margin when price changes', () => {
    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal="Understand profit margins"
      />
    );

    // Initial profit for Loaf: $3 - $2 = $1 (33.3% margin)
    expect(screen.getByText(/33%/)).toBeInTheDocument();
  });

  it('updates calculations when slider moved', () => {
    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal="Understand profit margins"
      />
    );

    const slider = screen.getByRole('slider', { name: /Loaf retail price/ });
    fireEvent.change(slider, { target: { value: '4' } });

    // New profit: $4 - $2 = $2 (50% margin)
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it('shows completion when all items explored', () => {
    const onComplete = jest.fn();

    render(
      <DynamicLedger
        scenario={mockScenario}
        items={mockItems}
        learningGoal="Understand profit margins"
        onComplete={onComplete}
      />
    );

    // Simulate exploring both items
    const loafSlider = screen.getByRole('slider', { name: /Loaf retail price/ });
    const baguetteSlider = screen.getByRole('slider', { name: /Baguette retail price/ });

    fireEvent.change(loafSlider, { target: { value: '4' } });
    fireEvent.change(baguetteSlider, { target: { value: '3' } });

    const doneButton = screen.getByRole('button', { name: /Done/ });
    fireEvent.click(doneButton);

    expect(onComplete).toHaveBeenCalledWith({
      itemsExplored: 2,
      conceptsMastered: ['profit margin', 'markup percentage'],
      score: expect.any(Number)
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- DynamicLedger.test.tsx`
Expected: FAIL - component not found

**Step 3: Create component directory**

```bash
mkdir -p src/components/genui/static
mkdir -p src/components/genui/static/__tests__
```

**Step 4: Write minimal implementation**

Create `src/components/genui/static/DynamicLedger.tsx`:

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

interface LedgerItem {
  name: string;
  wholesalePrice: number;
  retailPrice: number;
}

interface DynamicLedgerProps {
  scenario: string;
  items: LedgerItem[];
  learningGoal: string;
  onComplete?: (results: {
    itemsExplored: number;
    conceptsMastered: string[];
    score: number;
  }) => void;
}

export function DynamicLedger({
  scenario,
  items,
  learningGoal,
  onComplete
}: DynamicLedgerProps) {
  const [prices, setPrices] = useState<Record<string, number>>(
    items.reduce((acc, item) => ({
      ...acc,
      [item.name]: item.retailPrice
    }), {})
  );

  const [exploredItems, setExploredItems] = useState<Set<string>>(new Set());

  const calculateProfit = (item: LedgerItem) => {
    const currentPrice = prices[item.name] || item.retailPrice;
    return currentPrice - item.wholesalePrice;
  };

  const calculateMargin = (item: LedgerItem) => {
    const profit = calculateProfit(item);
    const currentPrice = prices[item.name] || item.retailPrice;
    return currentPrice > 0 ? (profit / currentPrice) * 100 : 0;
  };

  const handlePriceChange = (itemName: string, newPrice: number) => {
    setPrices(prev => ({ ...prev, [itemName]: newPrice }));
    setExploredItems(prev => new Set([...prev, itemName]));
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete({
        itemsExplored: exploredItems.size,
        conceptsMastered: ['profit margin', 'markup percentage'],
        score: Math.round((exploredItems.size / items.length) * 100)
      });
    }
  };

  return (
    <div className="bg-[#FFF9F0] border-2 border-[#2F4731] rounded-lg p-6 transform -rotate-1 shadow-lg max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-['Architects_Daughter'] text-[#2F4731] mb-2">
          Merchant's Ledger
        </h2>
        <p className="text-lg font-['Kalam'] text-[#2F4731]">
          {scenario}
        </p>
        <p className="text-sm text-[#8B4513] mt-2">
          Learning Goal: {learningGoal}
        </p>
      </div>

      {/* Items */}
      <div className="space-y-6">
        {items.map((item) => {
          const profit = calculateProfit(item);
          const margin = calculateMargin(item);
          const currentPrice = prices[item.name] || item.retailPrice;

          return (
            <div
              key={item.name}
              className="bg-white border-2 border-[#2F4731] rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-['Fredoka'] text-[#2F4731]">
                  {item.name}
                </h3>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Wholesale: ${item.wholesalePrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Price Slider */}
              <div className="mb-3">
                <label
                  htmlFor={`${item.name}-price`}
                  className="block text-sm font-['Kalam'] text-[#2F4731] mb-2"
                >
                  Retail Price: ${currentPrice.toFixed(2)}
                </label>
                <input
                  id={`${item.name}-price`}
                  type="range"
                  min={item.wholesalePrice}
                  max={item.wholesalePrice * 3}
                  step={0.25}
                  value={currentPrice}
                  onChange={(e) => handlePriceChange(item.name, parseFloat(e.target.value))}
                  aria-label={`${item.name} retail price`}
                  className="w-full h-2 bg-[#F4E9D9] rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Calculations */}
              <div className="grid grid-cols-2 gap-4 bg-[#F4E9D9] rounded p-3">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-[#2F4731]" />
                  <div>
                    <div className="text-xs text-gray-600">Profit</div>
                    <div className="text-lg font-bold text-[#2F4731]">
                      ${profit.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#2F4731]" />
                  <div>
                    <div className="text-xs text-gray-600">Margin</div>
                    <div className="text-lg font-bold text-[#2F4731]">
                      {margin.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleComplete}
          className="bg-[#2F4731] text-[#FFF9F0] px-8 py-3 rounded-lg font-['Fredoka'] text-lg hover:bg-[#3F5741] transition-colors"
        >
          Done Exploring
        </button>
        <p className="text-sm text-gray-600 mt-2">
          Explored {exploredItems.size} of {items.length} items
        </p>
      </div>
    </div>
  );
}
```

**Step 5: Run test to verify it passes**

Run: `npm test -- DynamicLedger.test.tsx`
Expected: PASS - all tests passing

**Step 6: Commit**

```bash
git add src/components/genui/static/DynamicLedger.tsx src/components/genui/static/__tests__/DynamicLedger.test.tsx
git commit -m "feat: add Dynamic Ledger component for interactive math lessons

Interactive trading game teaching profit margins and percentages through real-time calculations."
```

---

### Task 1.2: Register Dynamic Ledger as Frontend Tool

**Files:**
- Create: `src/lib/genui/ToolRegistry.ts`
- Create: `src/hooks/useAdelineFrontendTools.ts`

**Step 1: Create ToolRegistry**

Create `src/lib/genui/ToolRegistry.ts`:

```typescript
import { z } from 'zod';

/**
 * Registry of all GenUI frontend tools
 * Each tool defines its schema and metadata for Adeline to use
 */

export const DynamicLedgerSchema = z.object({
  scenario: z.string().describe("The trading scenario context"),
  items: z.array(z.object({
    name: z.string(),
    wholesalePrice: z.number(),
    retailPrice: z.number()
  })).describe("Items to trade with their prices"),
  learningGoal: z.string().describe("What mathematical concept to teach")
});

export type DynamicLedgerParams = z.infer<typeof DynamicLedgerSchema>;

export const FRONTEND_TOOLS = {
  launch_dynamic_ledger: {
    name: "launch_dynamic_ledger",
    description: "Launch interactive trading game to teach math concepts like fractions, percentages, profit margins",
    parameters: DynamicLedgerSchema,
    // Will be registered with useFrontendTool in component
  }
} as const;
```

**Step 2: Create hook for registering tools**

Create `src/hooks/useAdelineFrontendTools.ts`:

```typescript
'use client';

import { useFrontendTool } from '@copilotkit/react';
import { DynamicLedgerSchema, type DynamicLedgerParams } from '@/lib/genui/ToolRegistry';
import { DynamicLedger } from '@/components/genui/static/DynamicLedger';

/**
 * Register all Adeline frontend tools
 * Call this hook in components that need GenUI capabilities
 */
export function useAdelineFrontendTools() {
  // Register Dynamic Ledger tool
  useFrontendTool({
    name: "launch_dynamic_ledger",
    description: "Launch interactive trading game to teach math concepts",
    parameters: DynamicLedgerSchema,
    handler: async (params: DynamicLedgerParams) => {
      // Handler runs when tool completes
      // Return results to be logged
      return {
        toolUsed: "dynamic_ledger",
        scenario: params.scenario,
        itemCount: params.items.length
      };
    },
    render: ({ status, args, result }) => {
      if (status === "inProgress" || status === "executing") {
        return (
          <div className="my-4">
            <DynamicLedger
              scenario={args?.scenario || "Loading..."}
              items={args?.items || []}
              learningGoal={args?.learningGoal || ""}
              onComplete={(results) => {
                // Results will be passed to handler
                console.log("Ledger completed:", results);
              }}
            />
          </div>
        );
      }

      if (status === "complete" && result) {
        return (
          <div className="my-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
            <p className="text-green-800">
              ✓ Lesson complete! Used {result.toolUsed}
            </p>
          </div>
        );
      }

      return null;
    }
  });
}
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit src/lib/genui/ToolRegistry.ts src/hooks/useAdelineFrontendTools.ts`
Expected: No errors (may need to install @copilotkit types if missing)

**Step 4: Commit**

```bash
git add src/lib/genui/ToolRegistry.ts src/hooks/useAdelineFrontendTools.ts
git commit -m "feat: register Dynamic Ledger as CopilotKit frontend tool

Enables Adeline to launch interactive ledger via useFrontendTool hook."
```

---

### Task 1.3: Create A2UI Lesson Summary Template

**Files:**
- Create: `~/.adeline/templates/a2ui/lesson-summary.json`
- Create: `docs/a2ui-templates.md` (documentation)

**Step 1: Create lesson summary A2UI template**

Create `~/.adeline/templates/a2ui/lesson-summary.json`:

```json
[
  {
    "surfaceUpdate": {
      "surfaceId": "lesson-summary",
      "components": [
        {
          "id": "summary-card",
          "component": {
            "Card": {
              "title": "{{lesson_title}}",
              "child": "summary-layout"
            }
          }
        },
        {
          "id": "summary-layout",
          "component": {
            "Column": {
              "children": {
                "explicitList": [
                  "concept-doodle",
                  "concepts-learned",
                  "progress-stars",
                  "credits-earned",
                  "next-steps"
                ]
              }
            }
          }
        },
        {
          "id": "concept-doodle",
          "component": {
            "Image": {
              "url": "{{doodle_url}}",
              "altText": "Hand-drawn illustration of {{primary_concept}}",
              "style": {
                "transform": "rotate(-2deg)",
                "maxWidth": "300px",
                "margin": "0 auto"
              }
            }
          }
        },
        {
          "id": "concepts-learned",
          "component": {
            "Column": {
              "children": {
                "explicitList": "{{concept_ids}}"
              }
            }
          }
        },
        {
          "id": "progress-stars",
          "component": {
            "Row": {
              "children": {
                "explicitList": "{{star_ids}}"
              }
            }
          }
        },
        {
          "id": "credits-earned",
          "component": {
            "Text": {
              "usageHint": "body",
              "text": {
                "literalString": "🎓 Earned {{credits}} credits toward graduation"
              },
              "style": {
                "fontSize": "18px",
                "fontWeight": "bold",
                "color": "#2F4731"
              }
            }
          }
        },
        {
          "id": "next-steps",
          "component": {
            "Text": {
              "usageHint": "body",
              "text": {
                "literalString": "Next adventure: {{next_lesson}}"
              },
              "style": {
                "fontSize": "16px",
                "color": "#8B4513"
              }
            }
          }
        }
      ]
    }
  },
  {
    "dataModelUpdate": {
      "surfaceId": "lesson-summary",
      "path": "/",
      "contents": [
        {
          "key": "lesson_complete",
          "valueBoolean": true
        },
        {
          "key": "concepts_mastered",
          "valueNumber": "{{concept_count}}"
        }
      ]
    }
  },
  {
    "beginRendering": {
      "surfaceId": "lesson-summary",
      "root": "summary-card",
      "styles": {
        "primaryColor": "#2F4731",
        "font": "Kalam"
      }
    }
  }
]
```

**Step 2: Create documentation for A2UI templates**

Create `docs/a2ui-templates.md`:

```markdown
# A2UI Templates

A2UI templates define the structure of declarative UI that Adeline streams to the frontend.

## Template Location

Templates stored at: `~/.adeline/templates/a2ui/`

## Template Variables

Templates use `{{variable}}` syntax for dynamic content injection:

- `{{lesson_title}}` - Title of the lesson
- `{{doodle_url}}` - Path to hand-drawn illustration
- `{{primary_concept}}` - Main concept taught
- `{{concept_ids}}` - Array of concept component IDs
- `{{star_ids}}` - Array of star component IDs for progress
- `{{credits}}` - Credits earned (e.g., 0.02)
- `{{next_lesson}}` - Preview of next lesson

## How Adeline Uses Templates

1. Adeline loads template from `~/.adeline/templates/a2ui/lesson-summary.json`
2. Replaces `{{variables}}` with actual lesson data
3. Streams completed A2UI JSON to frontend
4. A2UI renderer builds beautiful visual page

## Available Templates

- `lesson-summary.json` - Visual recap after completing a lesson
- `mission-card.json` - (TODO Phase 3) Opportunity cards from Scout
- `journal-page.json` - (TODO Phase 1B) Daily journal summaries
```

**Step 3: Verify template is valid JSON**

Run: `cat ~/.adeline/templates/a2ui/lesson-summary.json | jq .`
Expected: Pretty-printed JSON (validates syntax)

**Step 4: Commit documentation**

```bash
git add docs/a2ui-templates.md
git commit -m "docs: add A2UI template documentation

Explains template structure and variable substitution for declarative GenUI."
```

Note: The actual template file is in `~/.adeline/`, not tracked in git.

---

### Task 1.4: Test Full Lesson Flow (Manual Validation)

**This task requires manual testing with the dev server running**

**Step 1: Start dev server**

Run: `npm run dev`
Expected: Server starts on http://localhost:3000

**Step 2: Navigate to dashboard**

Open browser: http://localhost:3000/dashboard

**Step 3: Test lesson trigger**

Type in chat: "Teach me about profit margins"

Expected behavior:
1. Adeline loads tutor.toml config
2. Recognizes math lesson request
3. Returns instruction to launch_dynamic_ledger (may not work yet - that's OK)
4. For now, should get text response

**Step 4: Document current behavior**

Create `docs/testing/phase-1a-validation.md`:

```markdown
# Phase 1A Validation - Interactive Lessons

## Test Date: 2026-02-01

### Test 1: Configuration Loading
- [x] Tutor.toml loads successfully
- [x] File injection works for @{learning_insights.json}
- [x] System prompt includes teaching philosophy

### Test 2: Dynamic Ledger Component
- [x] Component renders with props
- [x] Sliders update calculations
- [x] Profit/margin math is correct
- [x] Completion callback works

### Test 3: Frontend Tool Registration
- [ ] useFrontendTool hook registers successfully
- [ ] Adeline can call launch_dynamic_ledger
- [ ] Component appears in chat when tool called

### Test 4: Full Lesson Flow
- [ ] Student asks for math lesson
- [ ] Adeline launches Dynamic Ledger
- [ ] Student interacts with ledger
- [ ] A2UI summary appears after completion

## Blockers

1. CopilotKit runtime integration incomplete
2. Need to connect tutor.toml tool calls to useFrontendTool
3. A2UI template substitution not implemented yet

## Next Steps

1. Complete CopilotRuntime integration (Task 1.5)
2. Add tool orchestration logic (Task 1.6)
3. Implement A2UI template rendering (Task 1.7)
```

**Step 5: Commit validation doc**

```bash
git add docs/testing/phase-1a-validation.md
git commit -m "test: add Phase 1A manual validation checklist

Documents current state and blockers for interactive lesson flow."
```

**Step 6: Stop dev server**

Press Ctrl+C to stop server

---

## Phase 1A Checkpoint: Validation Before Proceeding

**STOP HERE FOR VALIDATION**

At this point, we have:
- ✅ Configuration system (.toml loader)
- ✅ Dynamic Ledger component (tested)
- ✅ Frontend tool registration (code complete)
- ✅ A2UI template structure
- ⏸️ Full integration pending

**Before proceeding to Task 1.5+, validate with actual kids:**

1. Show them the Dynamic Ledger component (can demo standalone)
2. Ask: "Would this be fun to learn with?"
3. Observe their reaction
4. Get feedback on:
   - Visual design (hand-drawn aesthetic)
   - Interaction (sliders, real-time calculations)
   - Engagement level

**Decision Point:**
- ✅ **Kids engaged** → Proceed to Task 1.5 (full integration)
- ❌ **Kids not engaged** → Iterate on component design before integrating

**Validation Questions:**
1. Did they want to keep playing with sliders?
2. Did they understand profit/margin concepts?
3. Did they ask questions or explore on their own?
4. Would they choose this over reading a text explanation?

---

## Remaining Tasks (Execute After Validation)

### Task 1.5: Complete CopilotRuntime Integration
- Integrate CopilotRuntime properly with Gemini
- Connect tool calls to frontend tools
- Enable streaming responses

### Task 1.6: Implement A2UI Template Renderer
- Variable substitution system
- Stream A2UI after tool completion
- Render with createA2UIMessageRenderer

### Task 1.7: Add Learning Path Integration
- Connect lessons to learning path milestones
- Trigger appropriate tools based on path context
- Log progress to Supabase

### Task 1.8: End-to-End Testing
- Full lesson flow with real student data
- Verify logging (credits, portfolio)
- Performance testing

## Phase 1B: Visual Journal (After 1A Validates)

### Task 2.1: Create Journal Summary A2UI Template
### Task 2.2: Add "Summarize" Button to Journal Page
### Task 2.3: Stream Journal Summary After Activities
### Task 2.4: Integrate Constellation Map Progress Visualization

## Phase 2: Sovereignty Tools (After 1B Validates)

### Task 3.1: Build Fog of War Map
### Task 3.2: Build Interactive Compass
### Task 3.3: Build Time Traveler Quest
### Task 3.4: Build Naturalist Notebook

## Phase 3: Opportunity Scout (After Phase 2 Validates)

### Task 4.1: Create Scout Mode Configuration
### Task 4.2: Set Up MCP Apps Middleware
### Task 4.3: Build Mission Card Template
### Task 4.4: Integrate with Opportunities Page

---

## Success Criteria

**Phase 1A Complete When:**
- ✅ Student can ask for a math lesson
- ✅ Dynamic Ledger launches immediately (no text wrapper)
- ✅ Student explores interactive calculations
- ✅ Beautiful A2UI summary appears after completion
- ✅ Progress logged to database
- ✅ **Kids voluntarily ask for more lessons**

**Phase 1B Complete When:**
- ✅ Daily journal has visual summaries
- ✅ Kids want to see their journal pages
- ✅ Kids show parents their accomplishments

**Phase 2 Complete When:**
- ✅ All sovereignty tools built and tested
- ✅ Adeline orchestrates tool selection
- ✅ Kids engage with tools for 10+ minutes

**Phase 3 Complete When:**
- ✅ Opportunity Scout finds real missions
- ✅ Kids discover opportunities independently
- ✅ Kids pursue at least 1 opportunity

**Overall Success:**
- 🎯 Kids open app daily without prompting
- 🎯 Average session length > 20 minutes
- 🎯 Kids ask "What's next?" instead of needing reminders

---

## Notes for Implementation

### TDD Discipline
- Write failing test FIRST
- Run test to verify failure
- Write minimal code to pass
- Run test to verify pass
- Commit

### DRY Principle
- Reuse existing Supabase queries
- Don't duplicate tool logging logic
- Share A2UI theme across components

### YAGNI Principle
- Don't build Scout mode until Phase 3
- Don't optimize prematurely
- Don't add features not in design

### Commit Discipline
- Commit after each passing test
- Use conventional commit messages (feat:, fix:, test:, docs:)
- Keep commits focused (one logical change)

### Testing Strategy
- Unit tests for pure functions (ConfigLoader, calculations)
- Component tests for UI (DynamicLedger)
- Manual validation for full flows (lesson completion)
- Kid validation for engagement (most important!)

---

**Implementation Plan Complete**

This plan provides step-by-step tasks for Phase 1A with validation checkpoints. Execute tasks in order, validate with kids at checkpoint, then proceed to remaining phases based on engagement.
