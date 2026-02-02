# Phase -1: Student Agency Foundation

> **Execute BEFORE Phase 0** - This establishes the sovereignty architecture that makes students active explorers, not passive recipients.

**Goal:** Create bidirectional control flow where students can initiate exploration, not just receive lessons from Adeline.

**Core Principle:** Students should be able to say "I want to explore this" and Adeline responds, OR Adeline can suggest and students choose.

---

## Task -1.1: Create Floating Action Bar Component

**Files:**
- Create: `src/components/FloatingActionBar.tsx`
- Create: `src/components/__tests__/FloatingActionBar.test.tsx`

**Purpose:** Always-visible UI element that gives students agency to trigger actions.

### Step 1: Write the failing test

Create `src/components/__tests__/FloatingActionBar.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingActionBar } from '../FloatingActionBar';

describe('FloatingActionBar', () => {
  it('renders all action buttons', () => {
    const mockOnAction = jest.fn();

    render(<FloatingActionBar onAction={mockOnAction} />);

    expect(screen.getByLabelText('Explore')).toBeInTheDocument();
    expect(screen.getByLabelText('Scout')).toBeInTheDocument();
    expect(screen.getByLabelText('Map')).toBeInTheDocument();
    expect(screen.getByLabelText('Reflect')).toBeInTheDocument();
  });

  it('calls onAction with correct command when button clicked', () => {
    const mockOnAction = jest.fn();

    render(<FloatingActionBar onAction={mockOnAction} />);

    fireEvent.click(screen.getByLabelText('Explore'));

    expect(mockOnAction).toHaveBeenCalledWith('explore');
  });

  it('shows tooltip on hover', async () => {
    render(<FloatingActionBar onAction={jest.fn()} />);

    const exploreButton = screen.getByLabelText('Explore');
    fireEvent.mouseEnter(exploreButton);

    expect(await screen.findByText(/Discover new tools and concepts/)).toBeInTheDocument();
  });
});
```

### Step 2: Run test to verify failure

Run: `npm test -- FloatingActionBar.test.tsx`
Expected: FAIL - component not found

### Step 3: Create the component

Create `src/components/FloatingActionBar.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import { Compass, Map, Sparkles, BookOpen, MessageCircle } from 'lucide-react';

interface FloatingActionBarProps {
  onAction: (action: 'explore' | 'scout' | 'map' | 'reflect' | 'ask') => void;
  className?: string;
}

const actions = [
  {
    id: 'explore' as const,
    icon: Sparkles,
    label: 'Explore',
    tooltip: 'Discover new tools and concepts',
    color: '#8B5CF6' // Purple
  },
  {
    id: 'scout' as const,
    icon: Compass,
    label: 'Scout',
    tooltip: 'Find real-world opportunities',
    color: '#3B82F6' // Blue
  },
  {
    id: 'map' as const,
    icon: Map,
    label: 'Map',
    tooltip: 'See your learning constellation',
    color: '#10B981' // Green
  },
  {
    id: 'reflect' as const,
    icon: BookOpen,
    label: 'Reflect',
    tooltip: 'Summarize what you learned',
    color: '#F59E0B' // Amber
  },
  {
    id: 'ask' as const,
    icon: MessageCircle,
    label: 'Ask',
    tooltip: 'Talk with Adeline',
    color: '#EC4899' // Pink
  }
];

export function FloatingActionBar({ onAction, className = '' }: FloatingActionBarProps) {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 ${className}`}
      role="toolbar"
      aria-label="Learning actions"
    >
      {/* Tooltip */}
      {hoveredAction && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap">
          {actions.find(a => a.id === hoveredAction)?.tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-full shadow-2xl border-2 border-[#2F4731] p-2 flex gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
              aria-label={action.label}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                backgroundColor: hoveredAction === action.id ? action.color : '#F4E9D9',
                color: hoveredAction === action.id ? 'white' : action.color
              }}
            >
              <Icon size={20} strokeWidth={2.5} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

### Step 4: Run test to verify pass

Run: `npm test -- FloatingActionBar.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/components/FloatingActionBar.tsx src/components/__tests__/FloatingActionBar.test.tsx
git commit -m "feat: add Floating Action Bar for student-initiated actions

Provides always-visible UI for students to trigger Explore, Scout, Map, Reflect, and Ask actions."
```

---

## Task -1.2: Create Event Bus for Bidirectional Communication

**Files:**
- Create: `src/lib/genui/EventBus.ts`
- Create: `src/lib/genui/__tests__/EventBus.test.ts`

**Purpose:** Allow tools to emit events (student stuck, discovered concept, etc.) that Adeline can respond to in real-time.

### Step 1: Write the failing test

Create `src/lib/genui/__tests__/EventBus.test.ts`:

```typescript
import { GenUIEventBus, GenUIEvent } from '../EventBus';

describe('GenUIEventBus', () => {
  let eventBus: GenUIEventBus;

  beforeEach(() => {
    eventBus = new GenUIEventBus();
  });

  it('emits and receives events', () => {
    const listener = jest.fn();

    eventBus.on('tool_interaction', listener);
    eventBus.emit({
      type: 'tool_interaction',
      toolName: 'dynamic_ledger',
      action: 'slider_moved',
      data: { value: 5 }
    });

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'tool_interaction',
        toolName: 'dynamic_ledger'
      })
    );
  });

  it('removes listeners correctly', () => {
    const listener = jest.fn();

    eventBus.on('tool_interaction', listener);
    eventBus.off('tool_interaction', listener);
    eventBus.emit({
      type: 'tool_interaction',
      toolName: 'test',
      action: 'test'
    });

    expect(listener).not.toHaveBeenCalled();
  });

  it('supports multiple listeners for same event', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    eventBus.on('discovery', listener1);
    eventBus.on('discovery', listener2);
    eventBus.emit({
      type: 'discovery',
      concept: 'profit_margin',
      confidence: 0.8
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });
});
```

### Step 2: Run test to verify failure

Run: `npm test -- EventBus.test.ts`
Expected: FAIL

### Step 3: Create EventBus

Create `src/lib/genui/EventBus.ts`:

```typescript
/**
 * Event types that can be emitted during GenUI interactions
 */
export type GenUIEventType =
  | 'tool_interaction'    // Student interacts with a tool (slider, button, etc.)
  | 'discovery'           // Student discovers a concept
  | 'stuck'               // Student appears stuck (no interaction for 30s)
  | 'breakthrough'        // Student has an insight
  | 'tool_complete'       // Student completes a tool
  | 'student_action';     // Student triggers action from Floating Action Bar

export interface GenUIEvent {
  type: GenUIEventType;
  timestamp?: number;
  [key: string]: any;  // Additional event-specific data
}

export type EventListener = (event: GenUIEvent) => void;

/**
 * Simple event bus for bidirectional communication between:
 * - GenUI tools → Adeline (student stuck, made discovery, etc.)
 * - Adeline → GenUI tools (show hint, highlight element, etc.)
 * - Student actions → Adeline (clicked Explore, Scout, etc.)
 */
export class GenUIEventBus {
  private listeners: Map<GenUIEventType, Set<EventListener>> = new Map();

  /**
   * Subscribe to an event type
   */
  on(eventType: GenUIEventType, listener: EventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
  }

  /**
   * Unsubscribe from an event type
   */
  off(eventType: GenUIEventType, listener: EventListener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit an event to all listeners
   */
  emit(event: GenUIEvent): void {
    const eventWithTimestamp = {
      ...event,
      timestamp: event.timestamp || Date.now()
    };

    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => listener(eventWithTimestamp));
    }
  }

  /**
   * Clear all listeners (useful for cleanup)
   */
  clear(): void {
    this.listeners.clear();
  }
}

// Singleton instance for app-wide use
export const eventBus = new GenUIEventBus();
```

### Step 4: Run test to verify pass

Run: `npm test -- EventBus.test.ts`
Expected: PASS

### Step 5: Commit

```bash
git add src/lib/genui/EventBus.ts src/lib/genui/__tests__/EventBus.test.ts
git commit -m "feat: add GenUI event bus for bidirectional communication

Enables tools to emit events (discovery, stuck, etc.) that Adeline can respond to in real-time."
```

---

## Task -1.3: Create Student-Initiated Interaction Patterns

**Files:**
- Create: `~/.adeline/modes/patterns/student-initiated.toml`
- Modify: `~/.adeline/modes/tutor.toml`

**Purpose:** Define how Adeline responds when students initiate actions vs when Adeline suggests.

### Step 1: Create student-initiated patterns file

Create `~/.adeline/modes/patterns/student-initiated.toml`:

```toml
# Patterns for student-initiated interactions
# These apply when student clicks Floating Action Bar or explicitly asks

[patterns.explore]
trigger = "Student clicks 'Explore' or says 'I want to explore X'"
response_template = """
What sparks your curiosity right now?

I have several ways we can explore:
- **Math & Numbers** - Dynamic Ledger, trading games, pattern puzzles
- **Discovery & Goals** - Interactive Compass, interest mapping
- **Your Progress** - Constellation Map, portfolio review
- **Real World** - Opportunity Scout, find apprenticeships

What calls to you?
"""
await_choice = true
present_as_options = true

[patterns.scout]
trigger = "Student clicks 'Scout'"
response_template = """
Ah, you're ready to find real-world adventures!

Based on what you're learning, I'll search for:
- Competitions and challenges
- Apprenticeships and mentorships
- Projects and portfolios
- Community opportunities

*Activating Opportunity Scout...*
"""
auto_trigger_tool = "opportunity_scout"

[patterns.map]
trigger = "Student clicks 'Map'"
response_template = """
Let's see the constellation you've been building!

*Revealing your learning map...*
"""
auto_trigger_tool = "constellation_map"

[patterns.reflect]
trigger = "Student clicks 'Reflect'"
response_template = """
Beautiful time to pause and reflect.

What did you discover today? What surprised you?
"""
await_narration = true
then_stream_summary = true

[patterns.ask]
trigger = "Student clicks 'Ask' or sends chat message"
response_template = """
I'm listening. What's on your mind?
"""
mode = "conversational"
```

### Step 2: Update tutor.toml to import patterns

Modify `~/.adeline/modes/tutor.toml`, add after line 66:

```toml
[patterns]
student_initiated = "@{patterns/student-initiated.toml}"

[interaction_modes]
# How to respond based on who initiated

student_led = """
When student initiates (clicks action or explicitly asks):
1. Acknowledge their agency ("You want to explore...")
2. Present OPTIONS, don't prescribe
3. Let them CHOOSE the path
4. Guide but don't lecture
"""

adeline_suggested = """
When you notice an opportunity to teach:
1. Ask permission ("Would you like to explore...")
2. Explain WHY this would help
3. Launch tool if they agree
4. Make it feel like an adventure, not homework
"""
```

### Step 3: Document the patterns

Create `docs/interaction-patterns.md`:

```markdown
# Interaction Patterns

## Student-Initiated vs AI-Suggested

### Student-Initiated
**Trigger:** Student clicks Floating Action Bar or explicitly asks

**Adeline's Role:** Present options, let student choose

**Example:**
```
Student: [clicks "Explore"]
Adeline: "What sparks your curiosity? I have tools for math, discovery,
          or we could look at your progress map. What calls to you?"
Student: "Math"
Adeline: "Perfect! Since you love Minecraft, let's explore profit margins
          through a merchant's marketplace..."
          [launches Dynamic Ledger]
```

### AI-Suggested
**Trigger:** Adeline notices a teaching opportunity

**Adeline's Role:** Suggest and ask permission

**Example:**
```
Student: "I don't understand percentages"
Adeline: "Percentages can feel tricky! Would you like to explore them
          through something hands-on? I have a merchant's ledger where
          you can see how changing prices affects profits..."
Student: "Sure!"
Adeline: [launches Dynamic Ledger]
```

## Real-Time Guidance During Tools

When student is using a tool, Adeline can respond to events:

**Stuck (no interaction for 30s):**
```
Event: { type: 'stuck', toolName: 'dynamic_ledger', lastAction: 'slider_moved' }
Adeline: "Try setting the price really high - what happens to profit percentage?"
```

**Discovery:**
```
Event: { type: 'discovery', concept: 'profit_margin', confidence: 0.8 }
Adeline: "Brilliant! You found that the percentage changes based on the relationship
          between cost and price. That's called a profit margin!"
```

**Breakthrough:**
```
Event: { type: 'breakthrough', pattern: 'found_optimal_price' }
Adeline: "YES! You discovered the sweet spot! Most merchants aim for that range.
          Why do you think they don't just charge the maximum?"
```
```

### Step 4: Commit

```bash
git add ~/.adeline/modes/patterns/student-initiated.toml ~/.adeline/modes/tutor.toml docs/interaction-patterns.md
git commit -m "feat: add student-initiated interaction patterns

Defines how Adeline responds when students initiate actions vs when Adeline suggests, enabling true agency."
```

---

## Task -1.4: Integrate Floating Action Bar into Dashboard

**Files:**
- Modify: `src/app/dashboard/page.tsx` (or wherever chat lives)

**Purpose:** Make the Floating Action Bar visible and wire it to Adeline's chat.

### Step 1: Add FloatingActionBar to dashboard

Find the dashboard page and add:

```typescript
import { FloatingActionBar } from '@/components/FloatingActionBar';
import { eventBus } from '@/lib/genui/EventBus';

// In the component:
const handleStudentAction = (action: string) => {
  // Emit event for Adeline to respond to
  eventBus.emit({
    type: 'student_action',
    action
  });

  // Send message to chat based on action
  const actionMessages = {
    explore: "I want to explore something new",
    scout: "Find me real-world opportunities",
    map: "Show me my learning map",
    reflect: "Help me reflect on what I learned",
    ask: "" // Just opens chat input
  };

  if (action !== 'ask') {
    sendMessage(actionMessages[action]);
  }
};

// In the JSX:
<>
  {/* Existing chat UI */}

  <FloatingActionBar onAction={handleStudentAction} />
</>
```

### Step 2: Test manually

- Start dev server
- Click each action button
- Verify messages sent to chat
- Verify Adeline responds (even if just text for now)

### Step 3: Commit

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: integrate Floating Action Bar into dashboard

Students can now initiate Explore, Scout, Map, Reflect, and Ask actions."
```

---

## Task -1.5: Update Chat API to Handle Student-Initiated Actions

**Files:**
- Modify: `src/app/api/chat/route.ts` (or wherever Gemini chat is)

**Purpose:** Detect student-initiated actions and load appropriate patterns from tutor.toml.

### Step 1: Add pattern detection to chat handler

In the chat API route, before calling Gemini:

```typescript
// Detect if this is a student-initiated action
const studentAction = detectStudentAction(message);

if (studentAction) {
  // Load student-initiated pattern from tutor.toml
  const pattern = await loadPattern(studentAction); // e.g., 'explore', 'scout'

  // Inject pattern-specific guidance into system prompt
  systemPrompt += `\n\nSTUDENT INITIATED ACTION: ${studentAction}\n${pattern.response_template}`;

  if (pattern.auto_trigger_tool) {
    // Automatically trigger the tool
    // This will be handled by CopilotKit in Phase 0
  }
}
```

### Step 2: Implement pattern loader

```typescript
async function loadPattern(action: string) {
  const configLoader = new AdelineConfigLoader();
  const patterns = configLoader.loadPatterns('student-initiated');
  return patterns[action] || patterns.default;
}

function detectStudentAction(message: string): string | null {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('explore') || lowerMsg.includes('i want to')) return 'explore';
  if (lowerMsg.includes('find') && lowerMsg.includes('opportunit')) return 'scout';
  if (lowerMsg.includes('show') && lowerMsg.includes('map')) return 'map';
  if (lowerMsg.includes('reflect') || lowerMsg.includes('what i learned')) return 'reflect';

  return null;
}
```

### Step 3: Test

- Send message: "I want to explore fractions"
- Verify Adeline responds with student-initiated pattern (presents options)
- NOT with AI-suggested pattern (prescriptive)

### Step 4: Commit

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: handle student-initiated actions in chat API

Detects when student initiates and uses appropriate response patterns from tutor.toml."
```

---

## Validation Checklist

Before proceeding to Phase 0, verify:

- [ ] Floating Action Bar renders and buttons work
- [ ] Clicking buttons sends appropriate messages to chat
- [ ] EventBus can emit and receive events
- [ ] Student-initiated patterns exist in tutor.toml
- [ ] Chat API detects student actions and responds differently than AI-suggested
- [ ] Tests pass for FloatingActionBar and EventBus

## What This Unlocks

With Phase -1 complete, students can:

✅ **Initiate exploration** instead of waiting for Adeline
✅ **Choose their path** when Adeline presents options
✅ **Trigger tools themselves** (Scout, Map, etc.)
✅ **Have bidirectional communication** (tools → Adeline, Adeline → tools)

This is the foundation for **sovereignty-first learning**.

---

**Next:** Proceed to Phase 0 (Foundation Setup) with student agency already in place.
