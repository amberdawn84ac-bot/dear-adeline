# Adaptive Learning System - Implementation Plan

## Summary of Priorities

Based on your feedback:

1. **Conversational Placement Assessment** - NECESSARY (no placement right now)
2. **Skill Prerequisite Graph** - SOUNDS IMPORTANT
3. **Real-World Competency Layer** - PROMISED TO DO
4. **Student-Designed Games** - WOULD BE AWESOME
5. ~~Whiteboard~~ - SKIP (has been a mess)
6. ~~Photo Verification~~ - LATER (just portfolio uploads for now)

---

## PHASE 1: Conversational Placement Assessment (CRITICAL)

### Problem
- Current onboarding only asks: name, grade, city, state
- No diagnostic assessment of actual skill levels
- No gap detection on first contact
- Adeline doesn't know where student is starting from

### Solution
Transform onboarding into a 20-30 minute diagnostic conversation with Adeline.

### Database Changes

**New Table: `placement_assessments`**
```sql
create table public.placement_assessments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('in_progress', 'completed')) default 'in_progress',
  current_subject text, -- math, reading, science, etc.
  responses jsonb default '{}'::jsonb, -- Q&A pairs
  skill_evaluations jsonb default '[]'::jsonb, -- [{skill_id, level: mastered/competent/needs_instruction/not_introduced}]
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.placement_assessments enable row level security;

create policy "Students can manage own assessments" on public.placement_assessments
  for all using (student_id = auth.uid());
```

**New Table: `skill_levels`**
```sql
create table public.skill_levels (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  skill_id uuid references public.skills(id) on delete cascade not null,
  level text check (level in ('not_introduced', 'needs_instruction', 'competent', 'mastered')) default 'not_introduced',
  attempts int default 0,
  successes int default 0,
  last_attempted timestamp with time zone,
  mastery_date timestamp with time zone,
  evidence jsonb default '[]'::jsonb, -- Array of evidence: photos, responses, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, skill_id)
);

alter table public.skill_levels enable row level security;

create policy "Students can view own skill levels" on public.skill_levels
  for select using (student_id = auth.uid());

create policy "Teachers can view their students skill levels" on public.skill_levels
  for select using (
    exists (
      select 1 from public.teacher_students
      where teacher_id = auth.uid() and student_id = public.skill_levels.student_id
    )
  );

create trigger update_skill_levels_updated_at
  before update on public.skill_levels
  for each row execute procedure public.update_updated_at_column();
```

### API Endpoints

**1. Start Placement Assessment**
```
POST /api/placement/start
Body: { userId: string }
Response: { assessmentId: string, firstQuestion: string }
```

**2. Continue Assessment**
```
POST /api/placement/continue
Body: { assessmentId: string, response: string }
Response: {
  nextQuestion?: string,
  completed?: boolean,
  placementReport?: PlacementReport
}
```

**3. Get Placement Report**
```
GET /api/placement/report?userId={userId}
Response: PlacementReport (see data structure below)
```

### Component Changes

**1. Extend OnboardingModal.tsx**

Add a new step 5: "Assessment Conversation"

```typescript
{step === 5 && (
  <PlacementAssessment
    userId={userId}
    onComplete={(report) => setPlacementReport(report)}
  />
)}
```

**2. New Component: `PlacementAssessment.tsx`**

Chat-like interface where Adeline asks diagnostic questions:
- Math: "What's the last math thing you remember working on?"
- Reading: "What's the last book you read that you enjoyed?"
- Science: "Do you know why plants need sunlight?"
- etc.

Conversational, not quiz-like. Student can say "I don't know" and that's valuable data.

### Prompt Engineering

**New System Prompt Section for Placement Mode:**

```
=== PLACEMENT ASSESSMENT MODE ===

You are conducting a conversational placement assessment for a new student.

YOUR GOALS:
1. Determine current skill level in: Math, Reading/Writing, Science, Hebrew/Biblical Studies
2. Identify specific gaps in foundational skills
3. Understand learning style and interests
4. Make student feel safe saying "I don't know"

YOUR APPROACH:
- Start with open questions: "What's the last math you remember working on?"
- Follow up based on responses
- Assess WITHOUT making it feel like a test
- Disguise diagnostic questions as conversation
- If student struggles, drop down a level
- If student excels, probe higher

ASSESSMENT RUBRIC:
For each skill you assess, classify as:
- MASTERED: Quick, correct, confident
- COMPETENT: Correct but hesitant, needs reinforcement
- NEEDS_INSTRUCTION: Incorrect or confused
- NOT_INTRODUCED: "I don't know what that is"

CRITICAL RULES:
1. Never say "this is a test" or "assessment"
2. Be encouraging when student doesn't know something: "No problem, we'll start there"
3. Spend 5-7 minutes per subject area
4. After 20-30 minutes, wrap up and generate placement report

WHEN TO FINISH:
After you've assessed:
- 5-6 math skills
- 3-4 reading/writing skills
- 2-3 science skills
- 1-2 biblical/Hebrew knowledge checks

Call the generate_placement_report tool with your findings.
```

**New Tool: `generate_placement_report`**

```typescript
{
  name: "generate_placement_report",
  description: "Generate final placement report after assessment conversation",
  parameters: {
    type: "object",
    properties: {
      skillEvaluations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            skillId: { type: "string" },
            skillName: { type: "string" },
            level: { type: "string", enum: ["not_introduced", "needs_instruction", "competent", "mastered"] },
            evidence: { type: "string" }
          }
        }
      },
      recommendedStartingLevel: { type: "string" },
      learningStyleNotes: { type: "string" },
      interestAreas: { type: "array", items: { type: "string" } }
    }
  }
}
```

### Placement Report Data Structure

```typescript
interface PlacementReport {
  studentId: string;
  date: string;

  subjects: {
    math: SubjectPlacement;
    reading: SubjectPlacement;
    science: SubjectPlacement;
    hebrew: SubjectPlacement;
  };

  learningProfile: {
    style: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    pace: 'slow' | 'moderate' | 'fast';
    interests: string[];
    needsBreaksWhenStuck: boolean;
  };

  recommendations: {
    startingPoint: string; // "Start with 7th grade math, fill gaps in fractions first"
    criticalGaps: string[]; // ["Percentages", "Advanced fractions"]
    strengths: string[]; // ["Reading comprehension", "Basic geometry"]
  };
}

interface SubjectPlacement {
  currentLevel: string; // "6th-7th grade"
  mastered: SkillEvaluation[];
  competent: SkillEvaluation[];
  gaps: SkillEvaluation[];
  recommendedAction: string;
}

interface SkillEvaluation {
  skillId: string;
  skillName: string;
  level: 'not_introduced' | 'needs_instruction' | 'competent' | 'mastered';
  evidence: string; // What student said/did that led to this evaluation
}
```

### Parent Dashboard View

**New Section: "Placement Report"**

```
┌─────────────────────────────────────────────────┐
│ SARAH'S PLACEMENT REPORT                        │
│ Age: 13 │ Grade Level: 8th │ Date: Jan 13, 2026 │
├─────────────────────────────────────────────────┤
│                                                 │
│ MATHEMATICS - Current Level: 6th-7th grade      │
│                                                 │
│ ✅ MASTERED:                                    │
│ • Basic fractions (add/subtract same denom)     │
│ • Multiplication tables                         │
│ • Basic geometry (area, perimeter)              │
│                                                 │
│ 🟡 COMPETENT (needs reinforcement):             │
│ • Fractions with different denominators         │
│ • Decimal operations                            │
│                                                 │
│ ❌ GAPS (needs instruction):                    │
│ • Fractions × fractions                         │
│ • Percentages                                   │
│ • Basic algebra concepts                        │
│                                                 │
│ 📊 RECOMMENDATION:                              │
│ Start with 7th grade math curriculum            │
│ Fill gaps in fractions/percentages first        │
│ Then progress to pre-algebra                    │
└─────────────────────────────────────────────────┘
```

### Implementation Steps

1. **Database Migration**
   - Create `placement_assessments` table
   - Create `skill_levels` table
   - Add RLS policies

2. **API Routes**
   - `/api/placement/start` - Initialize assessment
   - `/api/placement/continue` - Process responses
   - `/api/placement/report` - Get final report

3. **Prompt Engineering**
   - Add placement mode to system prompt
   - Create assessment rubric
   - Add `generate_placement_report` tool

4. **UI Components**
   - Extend `OnboardingModal` with step 5
   - Create `PlacementAssessment` component (chat-like)
   - Create `PlacementReportView` component for dashboard

5. **Parent Notification**
   - Email when placement is complete
   - Show report in parent dashboard
   - Allow parent to adjust recommendations

---

## PHASE 2: Skill Prerequisite Graph (IMPORTANT)

### Problem
- Skills exist in isolation
- No enforcement of prerequisites
- Student can attempt algebra without mastering fractions
- Leads to frustration and gaps

### Solution
Add prerequisite relationships and enforce them before teaching.

### Database Changes

**Modify `skills` table:**
```sql
-- Add prerequisite column
alter table public.skills
add column prerequisites uuid[] default array[]::uuid[];

-- Add difficulty_order for sorting within category
alter table public.skills
add column difficulty_order int default 0;
```

**Example Data:**
```sql
-- Fractions Basic (no prerequisites)
update public.skills
set prerequisites = array[]::uuid[]
where name = 'Basic Fractions';

-- Fractions with Different Denominators (requires Basic Fractions)
update public.skills
set prerequisites = array[
  (select id from public.skills where name = 'Basic Fractions')
]
where name = 'Fractions with Different Denominators';

-- Multiplying Fractions (requires both)
update public.skills
set prerequisites = array[
  (select id from public.skills where name = 'Basic Fractions'),
  (select id from public.skills where name = 'Fractions with Different Denominators')
]
where name = 'Multiplying Fractions';
```

### New Service: `SkillGraphService.ts`

```typescript
export class SkillGraphService {
  /**
   * Check if student has completed all prerequisites for a skill
   */
  static async canAttemptSkill(
    studentId: string,
    skillId: string,
    supabase: SupabaseClient
  ): Promise<{ allowed: boolean; missingPrereqs: string[] }> {
    // Get skill prerequisites
    const { data: skill } = await supabase
      .from('skills')
      .select('prerequisites')
      .eq('id', skillId)
      .single();

    if (!skill?.prerequisites?.length) {
      return { allowed: true, missingPrereqs: [] };
    }

    // Check student's skill levels for each prerequisite
    const { data: studentLevels } = await supabase
      .from('skill_levels')
      .select('skill_id, level')
      .eq('student_id', studentId)
      .in('skill_id', skill.prerequisites);

    const missingPrereqs = skill.prerequisites.filter(prereqId => {
      const studentLevel = studentLevels?.find(sl => sl.skill_id === prereqId);
      return !studentLevel || studentLevel.level !== 'mastered';
    });

    return {
      allowed: missingPrereqs.length === 0,
      missingPrereqs
    };
  }

  /**
   * Get recommended next skills for student
   */
  static async getNextSkills(
    studentId: string,
    category: string,
    supabase: SupabaseClient
  ): Promise<Skill[]> {
    // Get all skills in category
    const { data: skills } = await supabase
      .from('skills')
      .select('*')
      .eq('category', category)
      .order('difficulty_order');

    if (!skills) return [];

    // Filter to skills where prerequisites are met
    const nextSkills = [];
    for (const skill of skills) {
      const { allowed } = await this.canAttemptSkill(studentId, skill.id, supabase);
      if (allowed) {
        // Check if student has already mastered
        const { data: studentLevel } = await supabase
          .from('skill_levels')
          .select('level')
          .eq('student_id', studentId)
          .eq('skill_id', skill.id)
          .single();

        if (!studentLevel || studentLevel.level !== 'mastered') {
          nextSkills.push(skill);
        }
      }
    }

    return nextSkills;
  }

  /**
   * Detect when student is attempting skill without prerequisites
   */
  static async detectGap(
    studentId: string,
    attemptedSkillId: string,
    supabase: SupabaseClient
  ): Promise<{ hasGap: boolean; missingSkills: Skill[] }> {
    const { allowed, missingPrereqs } = await this.canAttemptSkill(
      studentId,
      attemptedSkillId,
      supabase
    );

    if (allowed) {
      return { hasGap: false, missingSkills: [] };
    }

    // Get missing skill details
    const { data: missingSkills } = await supabase
      .from('skills')
      .select('*')
      .in('id', missingPrereqs);

    return {
      hasGap: true,
      missingSkills: missingSkills || []
    };
  }
}
```

### Update Adeline's Teaching Logic

**In chat API, before teaching a concept:**

```typescript
// When student asks about or attempts a skill
const skillId = identifySkillFromMessage(userPrompt);

if (skillId) {
  const { hasGap, missingSkills } = await SkillGraphService.detectGap(
    userId,
    skillId,
    supabase
  );

  if (hasGap) {
    // Inject gap detection into system prompt
    systemInstruction += `\n\n
    CRITICAL: Student is attempting "${skillName}" but is missing prerequisites:
    ${missingSkills.map(s => `- ${s.name}`).join('\n')}

    You MUST:
    1. Pause the current lesson
    2. Say: "Hold on, let's back up. Before we do [current topic], we need to make sure you've got [prerequisite] down."
    3. Assess the prerequisite skill with a quick check
    4. If student doesn't have it, teach the prerequisite FIRST
    5. Then return to original topic
    `;
  }
}
```

### Example User Experience

**Without Prerequisite Graph:**
```
Student: "Can you teach me algebra?"
Adeline: "Sure! Let's start with solving for x..."
[Student gets confused because they don't understand fractions]
```

**With Prerequisite Graph:**
```
Student: "Can you teach me algebra?"
Adeline: "Before we jump into algebra, let me check something.
If I have the equation x/2 = 5, could you solve for x?"

Student: "Um... I'm not sure how to do that."

Adeline: "No problem! That tells me we need to work on fractions first.
Algebra uses a lot of fractions, so let's get really solid on those,
THEN algebra will make way more sense. Sound good?"

Student: "Okay!"

[Gap logged, prerequisite taught first]
```

### Implementation Steps

1. **Database Migration**
   - Add `prerequisites` column to skills
   - Add `difficulty_order` column
   - Populate initial prerequisite relationships

2. **Skill Graph Service**
   - `canAttemptSkill()`
   - `getNextSkills()`
   - `detectGap()`

3. **Chat Integration**
   - Skill identification from user message
   - Prerequisite check before teaching
   - Gap injection into system prompt

4. **Dashboard Views**
   - Show skill tree/graph
   - Highlight locked skills (prerequisites not met)
   - Show recommended next skills

---

## PHASE 3: Real-World Competency Layer (PROMISED)

### Problem
- System tracks "7th grade math standard 7.RP.A.1"
- Parents don't know what that means
- Students don't see how skills connect to real life
- Need both: state compliance AND real-world meaning

### Solution
Dual-layer tracking: Standards (backend) + Competencies (frontend)

### Database Changes

**New Table: `competencies`**
```sql
create table public.competencies (
  id uuid default uuid_generate_v4() primary key,
  name text not null, -- "Calculate materials for construction projects"
  description text,
  category text not null, -- math, science, writing, practical
  real_world_applications text[], -- ["Building greenhouse", "Planning garden"]
  demonstration_examples text[], -- What counts as evidence
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.competencies enable row level security;

create policy "Anyone can view competencies" on public.competencies
  for select using (true);
```

**New Table: `competency_skills_map`**
```sql
-- Maps which skills contribute to which competencies
create table public.competency_skills_map (
  id uuid default uuid_generate_v4() primary key,
  competency_id uuid references public.competencies(id) on delete cascade not null,
  skill_id uuid references public.skills(id) on delete cascade not null,
  weight decimal(3,2) default 1.0, -- How much this skill contributes to competency
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(competency_id, skill_id)
);

alter table public.competency_skills_map enable row level security;

create policy "Anyone can view competency mappings" on public.competency_skills_map
  for select using (true);
```

**New Table: `student_competencies`**
```sql
create table public.student_competencies (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  competency_id uuid references public.competencies(id) on delete cascade not null,
  status text check (status in ('not_started', 'developing', 'competent', 'advanced')) default 'not_started',
  evidence jsonb default '[]'::jsonb, -- Array of portfolio items, photos, etc.
  last_demonstrated timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, competency_id)
);

alter table public.student_competencies enable row level security;

create policy "Students can view own competencies" on public.student_competencies
  for select using (student_id = auth.uid());

create policy "Teachers can view their students competencies" on public.student_competencies
  for select using (
    exists (
      select 1 from public.teacher_students
      where teacher_id = auth.uid() and student_id = public.student_competencies.student_id
    )
  );

create trigger update_student_competencies_updated_at
  before update on public.student_competencies
  for each row execute procedure public.update_updated_at_column();
```

### Example Competency Data

```sql
-- Math Competency: Calculate materials for construction
insert into public.competencies (name, description, category, real_world_applications, demonstration_examples) values
('Calculate Materials for Construction',
 'Determine quantities, measurements, and costs for building projects',
 'math',
 array['Building greenhouse', 'Chicken coop design', 'Garden bed layout'],
 array['Calculated board lengths for frame', 'Determined concrete volume', 'Estimated costs within 10% accuracy']
);

-- Map skills to this competency
insert into public.competency_skills_map (competency_id, skill_id, weight) values
((select id from public.competencies where name = 'Calculate Materials for Construction'),
 (select id from public.skills where name = 'Fractions'),
 0.3),
((select id from public.competencies where name = 'Calculate Materials for Construction'),
 (select id from public.skills where name = 'Unit Conversion'),
 0.3),
((select id from public.competencies where name = 'Calculate Materials for Construction'),
 (select id from public.skills where name = 'Geometry'),
 0.4);

-- Science Competency: Understand and apply plant biology
insert into public.competencies (name, description, category, real_world_applications, demonstration_examples) values
('Understand and Apply Plant Biology',
 'Knowledge of photosynthesis, growth cycles, and plant care for food production',
 'science',
 array['Growing vegetables', 'Greenhouse management', 'Permaculture design'],
 array['Explained photosynthesis process', 'Optimized light/water conditions', 'Documented plant growth experiment']
);

-- Writing Competency: Document processes clearly
insert into public.competencies (name, description, category, real_world_applications, demonstration_examples) values
('Document Processes with Writing and Photos',
 'Create clear instructions and documentation for projects',
 'writing',
 array['Building instructions', 'Recipe documentation', 'Science experiment reports'],
 array['Wrote step-by-step greenhouse build guide', 'Created photo journal of project', 'Documented experiment with photos and captions']
);
```

### Parent Dashboard View

**Competency View (What Parents See):**

```
┌─────────────────────────────────────────────────┐
│ WHAT SARAH CAN DO (Real-World Competencies)    │
├─────────────────────────────────────────────────┤
│                                                 │
│ ✅ COMPETENT:                                   │
│                                                 │
│ Calculate Materials for Construction            │
│ Evidence:                                       │
│ • Dec 15: Calculated board lengths for         │
│   greenhouse frame (Photo)                      │
│ • Dec 18: Determined concrete volume (Photo)   │
│ • Dec 20: Estimated wire for chicken coop      │
│ [View Portfolio Evidence]                       │
│                                                 │
│ Document Processes with Writing and Photos      │
│ Evidence:                                       │
│ • Dec 22: Greenhouse build photo journal        │
│ • Jan 5: Bread recipe documentation            │
│ [View Portfolio Evidence]                       │
│                                                 │
├─────────────────────────────────────────────────┤
│ 🟡 DEVELOPING:                                  │
│                                                 │
│ Understand and Apply Plant Biology              │
│ Recent Work:                                    │
│ • Learning photosynthesis (in progress)         │
│ • Started greenhouse planting (Week 2)          │
│                                                 │
├─────────────────────────────────────────────────┤
│ ❌ NOT YET STARTED:                             │
│                                                 │
│ Research from Multiple Sources                  │
│ Read Biblical Hebrew                            │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ STANDARDS COVERAGE (For Transcripts)           │
├─────────────────────────────────────────────────┤
│ 7th Grade Math: 85% coverage                    │
│ 8th Grade Science: 60% coverage                 │
│ 8th Grade ELA: 90% coverage                     │
│ [View Detailed Standards Report]                │
└─────────────────────────────────────────────────┘
```

### Automatic Competency Updates

When student earns a skill, check if it contributes to a competency:

```typescript
// In toolHandlerService.ts - update_student_progress tool
async function updateStudentProgress(studentId: string, skillId: string) {
  // Award skill (existing logic)
  await supabase.from('student_skills').insert({
    student_id: studentId,
    skill_id: skillId
  });

  // NEW: Check if this skill contributes to any competencies
  const { data: competencyMaps } = await supabase
    .from('competency_skills_map')
    .select('competency_id, weight')
    .eq('skill_id', skillId);

  for (const map of competencyMaps || []) {
    await updateCompetencyProgress(studentId, map.competency_id);
  }
}

async function updateCompetencyProgress(studentId: string, competencyId: string) {
  // Get all skills mapped to this competency
  const { data: requiredSkills } = await supabase
    .from('competency_skills_map')
    .select('skill_id, weight')
    .eq('competency_id', competencyId);

  // Check how many the student has mastered
  const { data: studentSkills } = await supabase
    .from('skill_levels')
    .select('skill_id, level')
    .eq('student_id', studentId)
    .in('skill_id', requiredSkills.map(s => s.skill_id));

  // Calculate completion percentage
  const totalWeight = requiredSkills.reduce((sum, s) => sum + s.weight, 0);
  const earnedWeight = studentSkills
    ?.filter(s => s.level === 'mastered')
    .reduce((sum, s) => {
      const skillMap = requiredSkills.find(rs => rs.skill_id === s.skill_id);
      return sum + (skillMap?.weight || 0);
    }, 0) || 0;

  const percentage = earnedWeight / totalWeight;

  // Determine status
  let status = 'not_started';
  if (percentage > 0 && percentage < 0.5) status = 'developing';
  else if (percentage >= 0.5 && percentage < 0.8) status = 'competent';
  else if (percentage >= 0.8) status = 'advanced';

  // Update student competency
  await supabase
    .from('student_competencies')
    .upsert({
      student_id: studentId,
      competency_id: competencyId,
      status,
      last_demonstrated: new Date().toISOString()
    });
}
```

### Implementation Steps

1. **Database Migration**
   - Create `competencies` table
   - Create `competency_skills_map` table
   - Create `student_competencies` table
   - Populate initial competencies

2. **Automatic Updates**
   - Update `update_student_progress` tool to trigger competency updates
   - Create `updateCompetencyProgress()` function

3. **Parent Dashboard**
   - Create `CompetencyView` component
   - Show real-world achievements
   - Link to portfolio evidence
   - Keep standards view in separate tab

4. **Student View**
   - Show "What I Can Do" section
   - Visual badges/progress for competencies
   - Show how skills build toward competencies

---

## PHASE 4: Student-Designed Games (AWESOME)

### Problem
- Games are teacher-created
- Students consume, don't create
- Missing opportunity for deeper learning (game design = understanding)

### Solution
Let students co-design games with Adeline about topics they're learning.

### Database Changes

**New Table: `student_games`**
```sql
create table public.student_games (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  game_type text check (game_type in ('matching', 'sorting', 'labeling', 'quiz', 'memory', 'path')) not null,
  subject text not null,
  skill_id uuid references public.skills(id),
  manifest jsonb not null, -- Game definition in JSON format
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  play_count int default 0,
  is_public boolean default false -- Can other students play it?
);

alter table public.student_games enable row level security;

create policy "Students can manage own games" on public.student_games
  for all using (student_id = auth.uid());

create policy "Public games are viewable by all" on public.student_games
  for select using (is_public = true);

create trigger update_student_games_updated_at
  before update on public.student_games
  for each row execute procedure public.update_updated_at_column();
```

### Game Manifest Format

```typescript
interface GameManifest {
  gameId: string;
  type: 'matching' | 'sorting' | 'labeling' | 'quiz' | 'memory' | 'path';

  // Visual assets
  assets: {
    backgroundImage?: string; // Student's photo or generated image
    elements: GameElement[];
  };

  // Game mechanics
  mechanics: {
    winCondition: string;
    lives?: number;
    timer?: boolean;
    timerSeconds?: number;
  };

  // Educational content
  pedagogy: {
    skillId: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

interface GameElement {
  id: string;
  type: 'text' | 'image' | 'hotspot';
  content: string;
  position?: { x: number; y: number };
  correctAnswer?: string | string[];
  distractor?: boolean; // Is this a wrong answer?
}
```

### Example Game Manifests

**1. Angle Labeling Game (Using Student's Photo)**
```json
{
  "gameId": "sarah-angle-hunt-001",
  "type": "labeling",
  "assets": {
    "backgroundImage": "https://storage.../greenhouse-frame.jpg",
    "elements": [
      {
        "id": "angle_1",
        "type": "hotspot",
        "content": "Click the obtuse angle",
        "position": { "x": 120, "y": 450 },
        "correctAnswer": "obtuse"
      },
      {
        "id": "angle_2",
        "type": "hotspot",
        "content": "Click the right angle",
        "position": { "x": 500, "y": 100 },
        "correctAnswer": "right"
      }
    ]
  },
  "mechanics": {
    "winCondition": "all_targets_identified",
    "timer": false
  },
  "pedagogy": {
    "skillId": "math-geometry-angles",
    "difficulty": "medium"
  }
}
```

**2. Hebrew Letter Matching Game**
```json
{
  "gameId": "sarah-hebrew-memory-001",
  "type": "memory",
  "assets": {
    "elements": [
      { "id": "aleph_hebrew", "type": "image", "content": "א" },
      { "id": "aleph_sound", "type": "text", "content": "ah" },
      { "id": "bet_hebrew", "type": "image", "content": "ב" },
      { "id": "bet_sound", "type": "text", "content": "b" }
    ]
  },
  "mechanics": {
    "winCondition": "all_pairs_matched",
    "timer": false
  },
  "pedagogy": {
    "skillId": "hebrew-alphabet-recognition",
    "difficulty": "easy"
  }
}
```

### Co-Design Conversation Flow

```
Student: "Can I make a game about angles?"

Adeline: "Yes! What kind of game?
• Matching (match angle type to measurement)
• Sorting (order angles by size)
• Labeling (click angles in a photo)
• Quiz (solve angle problems for points)

Which sounds fun?"

Student: "The labeling one!"

Adeline: "Perfect! Should I use YOUR greenhouse photos where you
measured angles, or should I draw generic diagrams?"

Student: "My photos!"

Adeline: "Great! Players will identify which angles are 90°, 45°,
obtuse, etc. How many rounds? 5? 10?"

Student: "10"

Adeline: "Timer or no timer?"

Student: "No timer"

Adeline: "Building your game now..."
[Calls generate_student_game tool]

"Here it is! Try it out. Tell me what you want to change."
[Game rendered in chat]
```

### New Tool: `generate_student_game`

```typescript
{
  name: "generate_student_game",
  description: "Generate a student-designed learning game based on their choices",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string" },
      gameType: {
        type: "string",
        enum: ["matching", "sorting", "labeling", "quiz", "memory", "path"]
      },
      subject: { type: "string" },
      skillId: { type: "string" },
      useStudentPhotos: { type: "boolean" },
      manifest: { type: "object" } // Full game manifest
    }
  }
}
```

### Game Renderer Component

**New Component: `StudentGameRenderer.tsx`**

Takes a game manifest and renders playable game:

```typescript
export function StudentGameRenderer({ manifest }: { manifest: GameManifest }) {
  const [gameState, setGameState] = useState('playing');
  const [score, setScore] = useState(0);

  switch (manifest.type) {
    case 'labeling':
      return <LabelingGame manifest={manifest} onComplete={(score) => {...}} />;
    case 'matching':
      return <MatchingGame manifest={manifest} onComplete={(score) => {...}} />;
    case 'memory':
      return <MemoryGame manifest={manifest} onComplete={(score) => {...}} />;
    // etc.
  }
}
```

### Assessment Through Game Design

**The Secret:** To create a game about a topic, you must understand the topic deeply.

**Before Game Creation:**
```typescript
// When student asks to make a game about skill X
const { data: studentLevel } = await supabase
  .from('skill_levels')
  .select('level')
  .eq('student_id', studentId)
  .eq('skill_id', skillId)
  .single();

if (!studentLevel || studentLevel.level === 'needs_instruction') {
  // Inject into system prompt:
  systemInstruction += `
  Student wants to make a game about ${skillName}, but they haven't mastered it yet.

  You should say:
  "Love the idea! Before we build the game, let's make sure you can [skill].
  That way your game will be awesome. Ready to practice?"

  Teach the skill FIRST, then allow game creation.
  `;
}
```

### Portfolio Integration

Games created by students become portfolio items:

```typescript
// When game is created
await supabase.from('portfolio_items').insert({
  student_id: studentId,
  title: `Game: ${gameTitle}`,
  description: `Student-designed ${gameType} game about ${subject}`,
  type: 'game',
  content: JSON.stringify(manifest),
  skills_demonstrated: [skillId]
});
```

### Implementation Steps

1. **Database Migration**
   - Create `student_games` table

2. **Game Generation Tool**
   - Add `generate_student_game` tool
   - Implement tool handler

3. **Game Renderer**
   - Create `StudentGameRenderer` component
   - Implement game types: labeling, matching, memory

4. **Co-Design Flow**
   - Add game design prompts to Adeline
   - Implement iterative design (student can request changes)

5. **Portfolio Integration**
   - Save games as portfolio items
   - Allow sharing with other students

---

## Implementation Timeline

### Week 1-2: Phase 1 (Placement Assessment)
- Database migration
- API endpoints
- Extend onboarding
- Placement assessment component
- Prompt engineering
- Parent dashboard report view

### Week 3: Phase 2 (Skill Prerequisites)
- Database migration (add prerequisites column)
- Skill graph service
- Chat integration (gap detection)
- Populate prerequisite data for key skills

### Week 4: Phase 3 (Real-World Competencies)
- Database migration
- Competency mapping
- Automatic competency updates
- Parent dashboard competency view
- Populate initial competencies

### Week 5-6: Phase 4 (Student-Designed Games)
- Database migration
- Game generation tool
- Co-design conversation flow
- Game renderer component
- Portfolio integration

---

## Success Metrics

### Phase 1: Placement Assessment
- ✅ 100% of new students complete placement
- ✅ Accurate skill level detection (validated by parent/teacher)
- ✅ Placement report generated within 30 minutes
- ✅ Gaps identified and logged

### Phase 2: Skill Prerequisites
- ✅ Zero instances of teaching without checking prerequisites
- ✅ Automatic gap detection when student struggles
- ✅ Reduced frustration (measured by conversation sentiment)
- ✅ Prerequisite remediation offered before advancing

### Phase 3: Real-World Competencies
- ✅ Parent dashboard shows competencies, not just standards
- ✅ Competencies automatically update when skills earned
- ✅ Evidence linked to competencies (portfolio items, photos)
- ✅ Parent satisfaction with "what they can do" view

### Phase 4: Student-Designed Games
- ✅ Students create at least 1 game per month
- ✅ Game creation leads to deeper understanding (assessed in conversation)
- ✅ Games saved to portfolio
- ✅ Students replay their own games for practice

---

## Technical Notes

### Database Migrations
All migrations should be run in order:
1. `001_placement_assessment.sql`
2. `002_skill_levels.sql`
3. `003_skill_prerequisites.sql`
4. `004_competencies.sql`
5. `005_student_games.sql`

### Backward Compatibility
- Existing skills work without prerequisites (empty array)
- Students without placement can take it later
- Competencies layer is additive (standards still tracked)

### Performance Considerations
- Index `prerequisites` array column for fast lookups
- Cache skill graph in memory for common paths
- Lazy-load competency calculations

---

## Questions to Answer Before Starting

1. **Placement Assessment:**
   - Should placement be required or optional?
   - Can students re-take placement if they feel it was wrong?
   - Do teachers/parents get to override placement recommendations?

2. **Skill Prerequisites:**
   - How strict should prerequisite enforcement be?
   - Can students request to skip prerequisites if they think they know it?
   - What happens if student fails a prerequisite check?

3. **Real-World Competencies:**
   - Who defines competencies? Admin? Community?
   - Can teachers/parents add custom competencies?
   - Should competencies be state-specific or universal?

4. **Student-Designed Games:**
   - Can students share games publicly?
   - Should there be moderation for public games?
   - Can students earn credits for creating high-quality games?

---

Ready to start implementation? Let me know which phase you want to tackle first!
