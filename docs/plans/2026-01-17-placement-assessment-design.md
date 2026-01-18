# Placement Assessment Design

**Date:** January 17, 2026
**Status:** Approved for implementation

## Overview

A conversational, adaptive placement assessment that determines where students sit against their state's education standards. The assessment is quick (15-30 minutes), non-threatening, and refines over time through daily use.

### Goals (Prioritized)

1. **Standards alignment** - Map students to their state's standards for graduation tracking
2. **Personalization** - Learn interests, learning style, and pace for tailored experiences
3. **Skill gaps** - Identify what they know vs. don't know to fill gaps effectively

### Key Requirements

- State-agnostic: Loads standards from student's state (Oklahoma, Texas, etc.)
- Grade-adaptive: Starts at declared grade, silently probes up/down to find true level
- Non-judgmental: No scores shown to students, "I don't know" is always valid
- Quick start: 15-30 min initial assessment, accuracy improves over time
- Hybrid format: Multiple choice for skills, conversation for interests, activities for engagement

---

## Overall Flow

### Phase 1: Warmup (2-3 minutes)

Adeline has a brief conversation to learn:
- What subjects they enjoy / find hard
- How they like to learn (reading, hands-on, videos)
- Any specific goals or interests

This is conversational, no right/wrong answers. Sets a friendly tone and populates Adeline's memory.

### Phase 2: Adaptive Skill Check (10-20 minutes)

For each core subject (Math, ELA, Science, Social Studies, plus curriculum additions):

1. Present 3 "gateway" questions at declared grade level
2. Based on results, probe up or down one grade
3. Stop when boundary is found (struggles at level N, succeeds at N-1)
4. Record the placement level per subject

Questions are multiple choice for reliable scoring. Mix in simple activities where available.

### Phase 3: Wrap-up (1-2 minutes)

Adeline summarizes what she learned in a friendly way: "You're really strong in reading! Math we'll work on together." No grades or scores shown to student.

### Post-Assessment

- Skill levels written to database
- Learning plan generated
- Parent report created
- Adeline's memory updated

---

## Adaptive Sampling Algorithm

### Gateway Skill Selection

Each subject has 2-3 "gateway" skills per grade level - core competencies that indicate overall mastery. These are pre-selected from the standards database and marked with `is_gateway = true`.

Examples for 5th grade:
- **Math:** Multi-digit multiplication, fraction operations, basic geometry
- **ELA:** Reading comprehension (inference), paragraph writing, vocabulary in context
- **Science:** Scientific method, basic earth/life science concepts
- **Social Studies:** Map skills, historical cause/effect

### Probing Algorithm

```
1. Start at declared grade (e.g., Grade 5)
2. Ask 3 gateway questions for that grade
3. Score and decide:
   - 3/3 correct (100%) → Probe UP one grade
   - 2/3 correct (67%) → Ask 1 more; if correct, probe up
   - 0/3 correct (0%) → Probe DOWN one grade
   - 1/3 correct (33%) → Ask 1 more; if wrong, probe down
4. Repeat until boundary found (max 3 levels in either direction)
5. Record "comfortable level" and "stretch level" per subject
```

### Thresholds

| Result | Classification |
|--------|----------------|
| 80%+ success at a grade level | **Comfortable** - solid mastery |
| 60-79% at the level above comfortable | **Stretch** - can reach with support |
| Below 50% at any level | Drop down one grade |
| Max 6 questions per subject | Calculate best fit, move on |

### Edge Cases

- **Way above grade:** Cap at 3 levels up, note "exceeds assessment range"
- **Way below grade:** Cap at 3 levels down, note "needs foundational review"
- **Inconsistent answers:** Flag for Adeline to revisit in future sessions

---

## Data Model

### New Tables

#### `assessment_questions`

Pre-built questions for reliable assessment.

```sql
create table public.assessment_questions (
  id uuid primary key default uuid_generate_v4(),

  -- What this question assesses
  skill_id uuid references public.skills(id) on delete cascade,
  standard_id uuid references public.state_standards(id) on delete set null,

  -- Question content
  question_type text not null check (question_type in (
    'multiple_choice', 'fill_blank', 'drag_sort', 'true_false', 'activity'
  )),
  prompt text not null,
  options jsonb,                           -- For MC: [{text, isCorrect}]
  correct_answer text,                     -- For fill_blank/simple answers
  activity_config jsonb,                   -- For activity type: game config

  -- Targeting
  grade_level text not null,
  subject text not null,
  is_gateway boolean default false,

  -- Metadata
  difficulty_weight integer default 5,     -- 1-10
  estimated_seconds integer default 30,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_aq_skill on assessment_questions(skill_id);
create index idx_aq_grade_subject on assessment_questions(grade_level, subject);
create index idx_aq_gateway on assessment_questions(is_gateway) where is_gateway = true;
```

#### `assessment_responses`

Individual question responses (normalized, not JSON blob).

```sql
create table public.assessment_responses (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid references public.placement_assessments(id) on delete cascade not null,
  question_id uuid references public.assessment_questions(id) on delete set null,

  -- Response data
  student_answer text,
  is_correct boolean,
  time_spent_seconds integer,

  -- For adaptive algorithm
  grade_level_tested text not null,
  was_probe_up boolean default false,
  was_probe_down boolean default false,

  answered_at timestamptz default now()
);

create index idx_ar_assessment on assessment_responses(assessment_id);
```

#### `subject_placements`

Per-subject placement results.

```sql
create table public.subject_placements (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid references public.placement_assessments(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,

  subject text not null,
  declared_grade text not null,
  comfortable_grade text not null,
  stretch_grade text,

  questions_asked integer not null,
  questions_correct integer not null,
  confidence text check (confidence in ('high', 'medium', 'low')),

  created_at timestamptz default now(),

  unique(assessment_id, subject)
);
```

### Modifications to Existing Tables

#### `profiles`

```sql
alter table public.profiles
  add column jurisdiction text,
  add column declared_grade text,
  add column onboarding_status text default 'not_started'
    check (onboarding_status in (
      'not_started', 'in_progress', 'placement_pending',
      'placement_in_progress', 'complete'
    ));
```

#### `placement_assessments`

```sql
alter table public.placement_assessments
  add column jurisdiction text,
  add column declared_grade text,
  add column phase text default 'warmup'
    check (phase in ('warmup', 'assessment', 'complete')),
  add column current_subject_index integer default 0,
  add column subjects_to_assess text[] default array[
    'Mathematics', 'English Language Arts', 'Science', 'Social Studies'
  ];
```

---

## API Structure

```
/api/placement/
  ├── start/route.ts        - Initialize assessment, return first warmup prompt
  ├── warmup/route.ts       - Handle conversational warmup responses
  ├── question/route.ts     - Get next question based on adaptive algorithm
  ├── answer/route.ts       - Submit answer, get scoring, trigger next question
  ├── complete/route.ts     - Finalize assessment, generate outputs
  └── report/route.ts       - Fetch completed report for student/parent
```

### Core Service Functions

```typescript
// placementService.ts

getGatewayQuestions(jurisdiction, subject, gradeLevel)
// Returns 2-3 gateway questions for initial probing

scoreAnswer(questionId, studentAnswer)
// Auto-scores based on question type, returns {isCorrect, feedback}

determineNextAction(assessmentId, latestResponse)
// Decides: probe up, probe down, move to next subject, or complete
// Returns: {action: 'question'|'next_subject'|'complete', data: ...}

calculatePlacement(assessmentId, subject)
// Analyzes responses, determines comfortable/stretch grades

generateLearningPlan(studentId, placements)
// Creates personalized learning plan based on placements

generateParentReport(assessmentId)
// Creates human-readable summary for parents/teachers

updateAdelineMemory(studentId, warmupResponses, placements)
// Stores insights in Adeline's memory system
```

### Authentication

All routes use service role key (fixes the original RLS bug):

```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Service role, not anon
);
```

---

## Frontend Components

```
PlacementAssessment/
  ├── PlacementAssessment.tsx      - Main orchestrator
  ├── WarmupChat.tsx               - Conversational phase
  ├── QuestionCard.tsx             - Displays question based on type
  ├── MultipleChoice.tsx           - MC answer selection
  ├── FillBlank.tsx                - Text input answer
  ├── DragSort.tsx                 - Drag-and-drop ordering
  ├── ActivityEmbed.tsx            - Mini-game wrapper
  ├── SubjectTransition.tsx        - Friendly transitions
  ├── ProgressIndicator.tsx        - Shows subjects completed (no scores)
  └── CompletionSummary.tsx        - Friendly wrap-up message
```

### UX Principles

1. **No scores visible** - Student never sees "2/3 correct"
2. **"I don't know" always valid** - Treated as incorrect but never shamed
3. **Encouraging transitions** - Adeline comments positively between subjects
4. **No time pressure** - No visible timer (tracked silently)
5. **Progress = subjects, not performance** - Shows "Math ✓ Reading ○ ○ ○"

---

## Assessment Outputs

### 1. Skill Levels Population

```typescript
// For each subject placement:
// Skills at comfortable_grade → 'competent'
// Skills at stretch_grade → 'needs_instruction'
// Skills below comfortable_grade → 'mastered' (assumed)
// Skills above stretch_grade → 'not_introduced'
```

Evidence recorded:
```json
{
  "type": "placement_assessment",
  "assessment_id": "uuid",
  "date": "2026-01-17",
  "comfortable_grade": "5",
  "stretch_grade": "6"
}
```

### 2. Learning Plan Generation

```json
{
  "grade_level": "5",
  "state": "Oklahoma",
  "yearly_goals": {
    "math": "Solidify Grade 5, reach Grade 6 by spring",
    "ela": "Already strong - enrich with challenging texts",
    "science": "Build foundation from Grade 4 gaps"
  },
  "immediate_focus": [
    { "subject": "Math", "skill": "Fraction operations", "reason": "Gateway to Grade 6" },
    { "subject": "Science", "skill": "Scientific method", "reason": "Foundation gap" }
  ]
}
```

### 3. Adeline's Memory

```json
{
  "student_profile": {
    "interests": ["dinosaurs", "building things", "minecraft"],
    "learning_style": "hands-on",
    "communication": "likes examples, not long explanations",
    "strengths": ["reading", "creativity"],
    "growth_areas": ["math facts", "showing work"],
    "motivators": "connecting to real-world projects"
  },
  "placement_summary": {
    "math": { "comfortable": "4", "stretch": "5" },
    "ela": { "comfortable": "6", "stretch": "7" },
    "science": { "comfortable": "5", "stretch": "5" },
    "social_studies": { "comfortable": "5", "stretch": "6" }
  }
}
```

### 4. Parent/Teacher Report

```markdown
# Placement Assessment Report
**Student:** Emma
**Date:** January 17, 2026
**Standards:** Oklahoma Academic Standards

## Summary
Emma completed a 20-minute placement assessment covering Math,
English Language Arts, Science, and Social Studies.

## Subject Placements

| Subject | Comfortable Level | Stretch Level | Notes |
|---------|------------------|---------------|-------|
| Math | Grade 4 | Grade 5 | Strong conceptually, needs fact fluency |
| ELA | Grade 6 | Grade 7 | Advanced reader, loves stories |
| Science | Grade 5 | Grade 5 | Solid foundation |
| Social Studies | Grade 5 | Grade 6 | Good map skills |

## Recommended Starting Points
- **Math:** Begin with Grade 5 fraction operations
- **ELA:** Challenge with Grade 6-7 texts, focus on analytical writing
- **Science:** Continue at grade level with hands-on experiments
- **Social Studies:** Explore Grade 6 world history

## Learning Style Observations
- Prefers hands-on activities and real-world connections
- Responds well to short, focused tasks
- Interests: dinosaurs, building, Minecraft

## Next Steps
Adeline will tailor daily lessons based on these findings.
Reassessment available in 30 days or upon request.
```

---

## Refinement Over Time

### Continuous Calibration

As students complete lessons, games, and activities:

1. **Success rate tracking** - Each skill attempt updates `skill_levels`
2. **Automatic level adjustment** - If struggling at "competent" level, demote
3. **Automatic promotion** - If 90%+ on "needs_instruction" skills, promote

### Re-evaluation Triggers

| Trigger | Action |
|---------|--------|
| 5+ consecutive failures on a skill | Flag for review, possibly lower placement |
| 90%+ success on 10+ problems at level | Auto-promote to next level |
| Student/parent requests reassessment | Allow full reassessment (bypass 30-day wait) |
| New subject area explored | Mini-assessment for just that subject |
| Semester boundary | Optional comprehensive check-in |

### Subtle Probing

Adeline occasionally slips in assessment-style questions during regular conversation:
- "Quick challenge - what's 7 × 8?"
- During reading: comprehension check questions

These feed back into `skill_levels` without feeling like a test.

---

## Implementation Sequence

### Phase 1: Foundation
1. Database migration (new tables, profile updates)
2. Fix auth bug (service role key)
3. Basic `/api/placement/start` and `/api/placement/answer` routes
4. Seed 3-5 gateway questions per subject for Grades 3-8

### Phase 2: Core Assessment
5. Adaptive algorithm in `placementService.ts`
6. Frontend components (MultipleChoice, ProgressIndicator)
7. Warmup chat flow
8. Subject transitions

### Phase 3: Outputs
9. Skill levels population
10. Learning plan generation
11. Parent report generation
12. Adeline memory integration

### Phase 4: Polish
13. Additional question types (fill_blank, drag_sort)
14. Activity-based questions (mini-games)
15. Analytics dashboard for teachers
16. Continuous calibration system

---

## Open Questions (For Future Design)

1. **Hebrew/Biblical studies integration** - How to assess curriculum-specific subjects not in state standards?
2. **Question bank management** - Admin UI for adding/editing questions?
3. **Multi-language support** - Assessments in Spanish or other languages?
4. **Accessibility** - Screen reader support, extended time options?

---

## Appendix: Question Format Examples

### Multiple Choice
```json
{
  "question_type": "multiple_choice",
  "prompt": "What is 3/4 + 1/2?",
  "options": [
    { "text": "1 1/4", "isCorrect": true },
    { "text": "4/6", "isCorrect": false },
    { "text": "1", "isCorrect": false },
    { "text": "I don't know", "isCorrect": false }
  ],
  "grade_level": "5",
  "subject": "Mathematics",
  "is_gateway": true
}
```

### Fill in the Blank
```json
{
  "question_type": "fill_blank",
  "prompt": "The capital of Oklahoma is ___.",
  "correct_answer": "Oklahoma City",
  "grade_level": "4",
  "subject": "Social Studies",
  "is_gateway": false
}
```

### Drag Sort
```json
{
  "question_type": "drag_sort",
  "prompt": "Put these fractions in order from smallest to largest:",
  "options": [
    { "text": "1/2", "correctPosition": 2 },
    { "text": "1/4", "correctPosition": 1 },
    { "text": "3/4", "correctPosition": 3 }
  ],
  "grade_level": "4",
  "subject": "Mathematics",
  "is_gateway": false
}
```
