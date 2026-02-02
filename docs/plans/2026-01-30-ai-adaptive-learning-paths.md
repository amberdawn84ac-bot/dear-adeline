# AI-Designed Adaptive Learning Paths Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform learning paths from static standards lists into AI-designed, adaptive learning journeys that engage kids through their interests and grow dynamically as they learn.

**Architecture:** Use Gemini AI to design personalized learning sequences based on student interests and grade-level standards. Present paths as engaging milestones/quests to students (hide raw standards) while showing technical standards to parents. Paths start small (5-10 initial milestones) and grow dynamically as Adeline learns more about the student.

**Tech Stack:**
- Gemini 2.0 Flash for path generation
- Existing learningPathService.ts (major refactor)
- New UI components for student vs parent views
- update_learning_path tool integration

---

## Current Problems

1. **Shows ALL standards** - Dumps 100+ grade-level standards as flat list
2. **Not kid-friendly** - Shows raw standard text like "CCSS.MATH.6.EE.1"
3. **Static** - Path doesn't grow or adapt based on learning
4. **No AI design** - Just sorts by interest, doesn't design coherent journey
5. **No parent/student views** - Everyone sees same boring list

## Solution Overview

**For Kids**: "Your Learning Adventure" with engaging milestone names like "Master Fractions Through Gaming" or "Build Your First Weather Station"

**For Parents**: See underlying standards, progress tracking, state compliance

**AI-Designed**: Gemini creates logical learning sequences: "Since you love Minecraft, we'll learn geometry through building, then physics through redstone"

**Dynamic Growth**: Start with 5-10 milestones, add more as student completes them or shows new interests

---

## Task 1: Add AI Path Design Function

**Files:**
- Modify: `src/lib/services/learningPathService.ts` (add new method)
- No test (AI generation - will verify manually)

**Step 1: Add designLearningPath method**

Add after line 656 in learningPathService.ts:

```typescript
/**
 * Use AI to design an engaging, personalized learning path
 * Returns 5-10 initial milestones with kid-friendly names and approaches
 */
private static async designLearningPath(
    standards: StateStandard[],
    interests: string[],
    gradeLevel: string,
    studentName?: string
): Promise<{ milestones: PathMilestone[], reasoning: string }> {
    if (!process.env.GOOGLE_API_KEY) {
        console.warn('No API key, falling back to default path');
        return this.createDefaultPath(standards, interests);
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const interestsText = interests.length > 0
        ? interests.join(', ')
        : 'general learning';

    const prompt = `You are Adeline, an AI tutor designing a personalized learning path for a ${gradeLevel} student who loves: ${interestsText}.

**Available Standards** (${standards.length} total):
${standards.slice(0, 30).map(s => `- ${s.subject}: ${s.statement_text}`).join('\n')}
${standards.length > 30 ? `... and ${standards.length - 30} more` : ''}

**Your Task**: Design the FIRST 5-10 learning milestones for their journey. Each milestone should:
1. Connect to their interests in an exciting way
2. Group related standards together logically
3. Have a kid-friendly name (NOT the standard code)
4. Build on previous milestones (proper learning sequence)
5. Feel like an adventure, not homework

**Example good milestone**:
{
  "title": "Build Epic Minecraft Structures with Geometry",
  "description": "Learn about shapes, angles, and area by designing your dream Minecraft castle",
  "standardIds": ["std_123", "std_124"],
  "estimatedWeeks": 2,
  "approachSummary": "Use Minecraft as the main learning environment for geometry concepts"
}

**Example bad milestone**: "CCSS.MATH.6.G.1: Find area and volume" (too boring!)

Return ONLY valid JSON:
{
  "milestones": [
    {
      "title": "engaging title",
      "description": "2-3 sentence description that excites them",
      "standardIds": ["standard IDs from the list above"],
      "estimatedWeeks": 1-3,
      "approachSummary": "brief teaching approach"
    }
  ],
  "reasoning": "1-2 sentences about why you chose this sequence"
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);

        // Map standard IDs to actual standards
        const standardMap = new Map(standards.map(s => [s.id, s]));

        const milestones: PathMilestone[] = parsed.milestones.map((m: any, index: number) => ({
            id: `milestone_${Date.now()}_${index}`,
            title: m.title,
            description: m.description,
            standardIds: m.standardIds.filter((id: string) => standardMap.has(id)),
            standards: m.standardIds
                .filter((id: string) => standardMap.has(id))
                .map((id: string) => standardMap.get(id)!),
            estimatedWeeks: m.estimatedWeeks,
            approachSummary: m.approachSummary,
            status: index === 0 ? 'in_progress' : 'upcoming',
            sequenceOrder: index + 1
        }));

        return {
            milestones,
            reasoning: parsed.reasoning
        };

    } catch (error) {
        console.error('AI path design failed:', error);
        return this.createDefaultPath(standards, interests);
    }
}

/**
 * Fallback when AI fails: create simple default path
 */
private static createDefaultPath(
    standards: StateStandard[],
    interests: string[]
): { milestones: PathMilestone[], reasoning: string } {
    // Group standards by subject, take first 5-10
    const bySubject = new Map<string, StateStandard[]>();
    for (const std of standards.slice(0, 20)) {
        if (!bySubject.has(std.subject)) {
            bySubject.set(std.subject, []);
        }
        bySubject.get(std.subject)!.push(std);
    }

    const milestones: PathMilestone[] = Array.from(bySubject.entries()).map(([subject, stds], index) => ({
        id: `milestone_${Date.now()}_${index}`,
        title: `Explore ${subject}`,
        description: `Learn key concepts in ${subject}`,
        standardIds: stds.map(s => s.id),
        standards: stds,
        estimatedWeeks: 2,
        approachSummary: 'Standard curriculum approach',
        status: index === 0 ? 'in_progress' : 'upcoming',
        sequenceOrder: index + 1
    }));

    return {
        milestones,
        reasoning: 'Using default subject-based grouping'
    };
}
```

**Step 2: Add PathMilestone type**

Add to types section (after line 48):

```typescript
export interface PathMilestone {
    id: string;
    title: string; // Kid-friendly name
    description: string; // Engaging description
    standardIds: string[]; // Which standards this covers
    standards?: StateStandard[]; // Full standard objects
    estimatedWeeks: number;
    approachSummary: string; // Teaching approach
    status: 'upcoming' | 'in_progress' | 'completed';
    sequenceOrder: number;
    completedAt?: string;
    engagementScore?: number; // 1-10
}

export interface LearningPath {
    id: string;
    studentId: string;
    jurisdiction: string;
    gradeLevel: string;
    interests: string[];
    learningStyle: string | null;
    pace: 'accelerated' | 'moderate' | 'relaxed';
    currentMilestoneId: string | null; // Changed from currentStandardId
    status: 'active' | 'paused' | 'completed';
    milestones: PathMilestone[]; // Changed from pathData
    designReasoning?: string; // Why AI chose this sequence
    createdAt: string;
    updatedAt: string;
}
```

**Step 3: Commit**

```bash
git add src/lib/services/learningPathService.ts
git commit -m "feat: Add AI path design with kid-friendly milestones"
```

---

## Task 2: Refactor generatePath to Use AI Design

**Files:**
- Modify: `src/lib/services/learningPathService.ts:92-240`

**Step 1: Replace orderStandardsByInterests with AI design**

Replace lines 196-201 with:

```typescript
            // 4. Use AI to design engaging learning path (5-10 initial milestones)
            const { milestones, reasoning } = await this.designLearningPath(
                standards,
                interests,
                gradeLevel
            );

            if (milestones.length === 0) {
                console.error('Failed to design path');
                return null;
            }
```

**Step 2: Update path creation to use milestones**

Replace lines 204-220 with:

```typescript
            // 5. Create the learning path record
            const { data: path, error: pathError } = await supabase
                .from('student_learning_paths')
                .upsert({
                    student_id: studentId,
                    jurisdiction: jurisdiction,
                    grade_level: gradeLevel,
                    interests: interests,
                    pace: 'moderate',
                    current_milestone_id: milestones[0].id,
                    status: 'active',
                    milestones: milestones, // Store as JSONB
                    design_reasoning: reasoning,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'student_id',
                    ignoreDuplicates: false
                })
                .select()
                .single();
```

**Step 3: Test manually**

Run onboarding with a new student and check:
- Path generates with 5-10 milestones
- Milestones have engaging titles (not standard codes)
- Interests are reflected in milestone names

**Step 4: Commit**

```bash
git add src/lib/services/learningPathService.ts
git commit -m "refactor: Use AI to design milestone-based paths"
```

---

## Task 3: Update Database Schema for Milestones

**Files:**
- Create: `supabase/migrations/50_learning_path_milestones.sql`

**Step 1: Create migration**

```sql
-- Update student_learning_paths to store milestones instead of flat standards
ALTER TABLE student_learning_paths
ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS design_reasoning TEXT,
ADD COLUMN IF NOT EXISTS current_milestone_id TEXT;

-- Migrate old pathData to milestones (if any exist)
-- This is a one-way migration - old format won't work after this

-- Add index for faster milestone queries
CREATE INDEX IF NOT EXISTS idx_learning_paths_student_status
ON student_learning_paths(student_id, status);

-- Add index for JSONB milestone queries
CREATE INDEX IF NOT EXISTS idx_learning_paths_milestones
ON student_learning_paths USING gin(milestones);
```

**Step 2: Run migration**

```bash
npx supabase migration up
```

**Step 3: Commit**

```bash
git add supabase/migrations/50_learning_path_milestones.sql
git commit -m "feat: Add milestone support to learning paths schema"
```

---

## Task 4: Create Student View Component

**Files:**
- Create: `src/components/LearningAdventure.tsx`

**Step 1: Create engaging student view**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket, Star, Trophy, ChevronRight, Sparkles } from 'lucide-react';
import { PathMilestone } from '@/lib/services/learningPathService';

interface LearningAdventureProps {
    milestones: PathMilestone[];
    studentName?: string;
}

export function LearningAdventure({ milestones, studentName }: LearningAdventureProps) {
    const router = useRouter();
    const currentMilestone = milestones.find(m => m.status === 'in_progress');
    const completedCount = milestones.filter(m => m.status === 'completed').length;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Rocket className="w-8 h-8" />
                    <h1 className="text-3xl font-bold">Your Learning Adventure</h1>
                </div>
                <p className="text-lg opacity-90">
                    {completedCount > 0
                        ? `Amazing! You've completed ${completedCount} milestone${completedCount > 1 ? 's' : ''}! 🎉`
                        : "Let's start your personalized learning journey!"}
                </p>
            </div>

            {/* Current Milestone */}
            {currentMilestone && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-purple-200">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            <h2 className="text-xl font-bold text-gray-800">Up Next</h2>
                        </div>
                        <span className="text-sm text-gray-500">~{currentMilestone.estimatedWeeks} weeks</span>
                    </div>

                    <h3 className="text-2xl font-bold text-purple-600 mb-3">
                        {currentMilestone.title}
                    </h3>

                    <p className="text-gray-700 mb-6">
                        {currentMilestone.description}
                    </p>

                    <button
                        onClick={() => {
                            const message = encodeURIComponent(`I'm ready to start: ${currentMilestone.title}`);
                            router.push(`/dashboard?message=${message}`);
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                    >
                        Start This Adventure
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Upcoming Milestones */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Coming Up
                </h2>

                {milestones
                    .filter(m => m.status === 'upcoming')
                    .slice(0, 5)
                    .map((milestone, index) => (
                        <div
                            key={milestone.id}
                            className="bg-white rounded-lg shadow p-5 border border-gray-200 hover:border-purple-300 transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-gray-500">
                                            #{milestone.sequenceOrder}
                                        </span>
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {milestone.title}
                                        </h3>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        {milestone.description}
                                    </p>
                                </div>
                                <span className="text-xs text-gray-500 ml-4">
                                    {milestone.estimatedWeeks}w
                                </span>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Completed Milestones */}
            {completedCount > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Completed Adventures
                    </h2>
                    <div className="text-gray-600">
                        You've mastered {completedCount} milestone{completedCount > 1 ? 's' : ''}!
                        Check your portfolio to see everything you've learned.
                    </div>
                </div>
            )}
        </div>
    );
}
```

**Step 2: Commit**

```bash
git add src/components/LearningAdventure.tsx
git commit -m "feat: Add engaging student view for learning paths"
```

---

## Task 5: Create Parent View Component

**Files:**
- Create: `src/components/ParentPathView.tsx`

**Step 1: Create detailed parent view**

```typescript
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { PathMilestone } from '@/lib/services/learningPathService';

interface ParentPathViewProps {
    milestones: PathMilestone[];
    jurisdiction: string;
    gradeLevel: string;
}

export function ParentPathView({ milestones, jurisdiction, gradeLevel }: ParentPathViewProps) {
    const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Learning Path Details</h1>
                <p className="text-gray-600">
                    Standards-aligned path for Grade {gradeLevel} ({jurisdiction === 'California' ? 'Common Core (CCSS/NGSS)' : jurisdiction})
                </p>
            </div>

            <div className="space-y-4">
                {milestones.map((milestone) => {
                    const isExpanded = expandedMilestone === milestone.id;
                    const isCompleted = milestone.status === 'completed';

                    return (
                        <div
                            key={milestone.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200"
                        >
                            <button
                                onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                                className="w-full p-6 text-left flex items-start justify-between hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start gap-4 flex-1">
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-gray-300 flex-shrink-0 mt-1" />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                            {milestone.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-2">
                                            {milestone.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{milestone.standards?.length || 0} standards</span>
                                            <span>•</span>
                                            <span>{milestone.estimatedWeeks} weeks</span>
                                            <span>•</span>
                                            <span className="capitalize">{milestone.status}</span>
                                        </div>
                                    </div>
                                </div>
                                {isExpanded ? (
                                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                            </button>

                            {isExpanded && (
                                <div className="px-6 pb-6 border-t border-gray-100">
                                    <div className="pt-4">
                                        <h4 className="font-medium text-gray-700 mb-3">Teaching Approach</h4>
                                        <p className="text-gray-600 text-sm mb-6">
                                            {milestone.approachSummary}
                                        </p>

                                        <h4 className="font-medium text-gray-700 mb-3">Covered Standards</h4>
                                        <div className="space-y-2">
                                            {milestone.standards?.map((standard) => (
                                                <div
                                                    key={standard.id}
                                                    className="bg-gray-50 rounded p-3"
                                                >
                                                    <div className="font-mono text-xs text-gray-500 mb-1">
                                                        {standard.standard_code}
                                                    </div>
                                                    <div className="text-sm text-gray-700">
                                                        {standard.statement_text}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
```

**Step 2: Commit**

```bash
git add src/components/ParentPathView.tsx
git commit -m "feat: Add detailed parent view with standards visibility"
```

---

## Task 6: Update Learning Path Page to Use New Components

**Files:**
- Modify: `src/app/learning-path/page.tsx`
- Modify: `src/app/learning-path/LearningPathClient.tsx`

**Step 1: Update page to detect user role**

In `page.tsx`, add role detection:

```typescript
// After line 22 (after profile fetch)
const isParent = profile.role === 'teacher' || profile.role === 'admin';
```

Pass to client:

```typescript
<LearningPathClient
    profile={profile}
    studentState={studentState}
    isParent={isParent}
    initialPath={learningPath}
    initialSummary={summary}
    initialNextFocus={nextFocus}
/>
```

**Step 2: Update LearningPathClient to show appropriate view**

Replace the entire path display section (lines 240-360) with:

```typescript
import { LearningAdventure } from '@/components/LearningAdventure';
import { ParentPathView } from '@/components/ParentPathView';

// In component:
{path && (
    isParent ? (
        <ParentPathView
            milestones={path.milestones || []}
            jurisdiction={path.jurisdiction}
            gradeLevel={path.gradeLevel}
        />
    ) : (
        <LearningAdventure
            milestones={path.milestones || []}
            studentName={profile.display_name}
        />
    )
)}
```

**Step 3: Test both views**

- Login as student → should see "Learning Adventure" with engaging milestones
- Login as parent/teacher → should see detailed standards view
- Click "Start This Adventure" → should navigate to dashboard with message

**Step 4: Commit**

```bash
git add src/app/learning-path/page.tsx src/app/learning-path/LearningPathClient.tsx
git commit -m "feat: Show student vs parent views based on role"
```

---

## Task 7: Wire Up update_learning_path Tool for Dynamic Growth

**Files:**
- Modify: `src/lib/services/toolHandlerService.ts` (add to existing update_learning_path handler around line 540)

**Step 1: Enhance update_learning_path to add new milestones**

Find the existing `update_learning_path` handler and add milestone generation:

```typescript
} else if (call.name === 'update_learning_path') {
    const args = call.args as any;
    console.log(`[Adeline Path]: Updating learning path - ${args.action}`);

    try {
        // Get current path
        const { data: currentPath } = await supabase
            .from('student_learning_paths')
            .select('*')
            .eq('student_id', userId)
            .single();

        if (!currentPath) {
            throw new Error('No learning path found');
        }

        let updatedPath = currentPath;

        if (args.action === 'add_interests') {
            // Student showed new interest - add related milestones
            const newInterests = args.interests || [];
            const allInterests = [...(currentPath.interests || []), ...newInterests];

            // Use AI to generate 2-3 new milestones based on new interests
            const { data: standards } = await supabase
                .from('state_standards')
                .select('*')
                .eq('jurisdiction', currentPath.jurisdiction)
                .eq('grade_level', currentPath.grade_level)
                .limit(50);

            if (standards && standards.length > 0) {
                const { designLearningPath } = await import('@/lib/services/learningPathService');
                const { milestones: newMilestones } = await (LearningPathService as any).designLearningPath(
                    standards,
                    newInterests,
                    currentPath.grade_level
                );

                // Add to existing milestones
                const existingMilestones = currentPath.milestones || [];
                const maxSequence = Math.max(...existingMilestones.map((m: any) => m.sequenceOrder), 0);

                const milestonesToAdd = newMilestones.slice(0, 3).map((m: any, index: number) => ({
                    ...m,
                    sequenceOrder: maxSequence + index + 1,
                    status: 'upcoming'
                }));

                updatedPath = {
                    ...currentPath,
                    interests: allInterests,
                    milestones: [...existingMilestones, ...milestonesToAdd]
                };
            }
        } else if (args.action === 'complete_milestone') {
            // Mark milestone complete
            const milestones = currentPath.milestones || [];
            const updated = milestones.map((m: any) =>
                m.id === args.milestone_id
                    ? { ...m, status: 'completed', completedAt: new Date().toISOString(), engagementScore: args.engagement_score }
                    : m
            );

            // Move to next milestone
            const nextMilestone = updated.find((m: any) => m.status === 'upcoming');
            if (nextMilestone) {
                nextMilestone.status = 'in_progress';
                updatedPath = {
                    ...currentPath,
                    milestones: updated,
                    current_milestone_id: nextMilestone.id
                };
            } else {
                updatedPath = {
                    ...currentPath,
                    milestones: updated
                };
            }
        }

        // Save updated path
        await supabase
            .from('student_learning_paths')
            .update(updatedPath)
            .eq('student_id', userId);

        toolParts.push({
            functionResponse: {
                name: 'update_learning_path',
                response: {
                    name: 'update_learning_path',
                    content: { status: 'path updated successfully' }
                }
            }
        });

    } catch (e) {
        console.error('Path update error:', e);
        toolParts.push({
            functionResponse: {
                name: 'update_learning_path',
                response: {
                    name: 'update_learning_path',
                    content: { status: 'failed to update path', error: String(e) }
                }
            }
        });
    }
}
```

**Step 2: Update tool description in chat handler**

In `src/app/api/chat/route.ts`, update the update_learning_path tool description (around line 447):

```typescript
{
    name: "update_learning_path",
    description: "Update student's learning path when: 1) Student shows new interest ('I love volcanoes!'), 2) Student completes a milestone, 3) You learn something new about their learning style. This adds new milestones or marks progress.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            action: {
                type: SchemaType.STRING,
                enum: ["add_interests", "complete_milestone", "record_choice", "new_info"],
                description: "Type of update"
            },
            interests: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: "New interests to add (for add_interests action)"
            },
            milestone_id: {
                type: SchemaType.STRING,
                description: "ID of completed milestone (for complete_milestone action)"
            },
            engagement_score: {
                type: SchemaType.NUMBER,
                description: "1-10 engagement score (for complete_milestone)"
            }
        },
        required: ["action"]
    }
}
```

**Step 3: Test dynamic growth**

- Complete a milestone with Adeline
- Show new interest ("I love space!")
- Check that new milestones are added to path

**Step 4: Commit**

```bash
git add src/lib/services/toolHandlerService.ts src/app/api/chat/route.ts
git commit -m "feat: Enable dynamic milestone addition based on learning"
```

---

## Task 8: Update getPath and Related Methods

**Files:**
- Modify: `src/lib/services/learningPathService.ts` (methods that return path data)

**Step 1: Update getPath to return new structure**

Find getPath method (around line 670) and ensure it returns milestones:

```typescript
static async getPath(studentId: string, supabaseClient?: SupabaseClient): Promise<LearningPath | null> {
    const supabase = supabaseClient || await createClient();

    const { data: dbPath, error } = await supabase
        .from('student_learning_paths')
        .select('*')
        .eq('student_id', studentId)
        .single();

    if (error || !dbPath) {
        return null;
    }

    return {
        id: dbPath.id,
        studentId: dbPath.student_id,
        jurisdiction: dbPath.jurisdiction,
        gradeLevel: dbPath.grade_level,
        interests: dbPath.interests || [],
        learningStyle: dbPath.learning_style,
        pace: dbPath.pace || 'moderate',
        currentMilestoneId: dbPath.current_milestone_id,
        status: dbPath.status,
        milestones: dbPath.milestones || [], // Return milestones
        designReasoning: dbPath.design_reasoning,
        createdAt: dbPath.created_at,
        updatedAt: dbPath.updated_at
    };
}
```

**Step 2: Update suggestNextFocus to work with milestones**

Replace suggestNextFocus (around line 750) to suggest current milestone:

```typescript
static async suggestNextFocus(
    studentId: string,
    supabaseClient?: SupabaseClient
): Promise<NextFocusSuggestion | null> {
    const path = await this.getPath(studentId, supabaseClient);
    if (!path || !path.milestones) return null;

    const currentMilestone = path.milestones.find(m => m.status === 'in_progress');
    if (!currentMilestone) return null;

    // Return the milestone as the focus
    return {
        standardId: currentMilestone.id,
        subject: currentMilestone.standards?.[0]?.subject || 'Learning',
        statementText: currentMilestone.title,
        reason: currentMilestone.description
    };
}
```

**Step 3: Commit**

```bash
git add src/lib/services/learningPathService.ts
git commit -m "refactor: Update path methods to work with milestones"
```

---

## Testing Checklist

Before marking complete, verify:

- [ ] New student onboarding generates AI-designed path with 5-10 milestones
- [ ] Student sees "Learning Adventure" with engaging titles (no standard codes)
- [ ] Parent/teacher sees detailed view with standards
- [ ] "Start This Adventure" button works and sends message to Adeline
- [ ] Completing milestone with Adeline marks it complete
- [ ] Showing new interest adds related milestones
- [ ] Path grows dynamically as student learns
- [ ] Database migration applied successfully
- [ ] All commits pushed to main

---

## Architecture Decisions

**Why milestone-based instead of flat standards?**
- Kids respond to quests/adventures, not "CCSS.MATH.6.EE.1"
- Allows logical grouping (related standards together)
- Path can start small and grow
- More engaging and less overwhelming

**Why AI-designed sequences?**
- Generic sorting isn't personalized enough
- AI can create coherent learning progressions
- Can connect concepts across subjects based on interests
- Reasoning explains why this path makes sense

**Why separate student/parent views?**
- Kids don't care about standard codes
- Parents need compliance/progress visibility
- Different audiences need different information

**Why store as JSONB instead of separate table?**
- Simpler schema (path is one document)
- Easier to update entire path atomically
- AI can generate custom structures per student
- Can query individual milestones with GIN index

---

## Future Enhancements (Not in This Plan)

- Milestone badges/rewards system
- Visual progress map (tree/path visualization)
- Peer milestone sharing
- AI-suggested project ideas per milestone
- Parent progress reports (PDF export)
- Integration with daily plans (auto-suggest based on current milestone)
