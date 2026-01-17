# Credit and Standards Tracking System

## Overview

Dear Adeline uses a **dual-tracking system** to meet both Oklahoma's time-based credit requirements and competency-based learning goals.

## Two Parallel Systems

### 1. Time-Based Credits (Oklahoma Compliance)

**Purpose**: Meet Oklahoma's requirement that 1 credit = 120 hours of instruction (full year course)

**How It Works**:
- Students earn credits based on **time spent** on activities
- Credit calculation:
  - 0.005 credits = 30 minutes (0.6 hours)
  - 0.01 credits = 1 hour
  - 0.02 credits = 2-3 hours
- Tracked in `graduation_requirements` and `student_graduation_progress` tables
- Categories like "Math", "English/Lit", "God's Creation & Science", etc.

**Database Tables**:
- `graduation_requirements`: Defines how many credits needed per category (e.g., Math needs 3.0 credits)
- `student_graduation_progress`: Tracks credits earned toward each requirement

**Tools**:
- `update_student_progress`: Adeline uses this to track credits when students complete activities
- Guidance: "0.005 for 30 min, 0.01 for 1 hour, 0.02 for 2-3 hours"

### 2. Standards-Based Mastery (Competency Tracking)

**Purpose**: Track what students actually **know and can do** based on Oklahoma state standards

**How It Works**:
- State standards define specific learning objectives (e.g., "OK.MATH.8.A.1")
- Students progress through mastery levels:
  - **Introduced**: First exposure to the standard
  - **Developing**: Working toward proficiency
  - **Proficient**: Meets the standard
  - **Mastered**: Exceeds the standard
- Each time a student demonstrates a skill, their mastery level increases
- Tracked in `state_standards` and `student_standards_progress` tables

**Database Tables**:
- `state_standards`: Official Oklahoma standards with codes, subjects, grade levels
- `learning_components`: Granular sub-skills within each standard
- `skills`: Dear Adeline's skill definitions (e.g., "Algebra Problem Solving")
- `skill_standard_mappings`: Links skills to state standards
- `student_standards_progress`: Tracks mastery level for each standard per student

**Automatic Progression**:
When a student earns a skill (added to `student_skills`), a database trigger automatically:
1. Finds all state standards mapped to that skill
2. Upgrades the student's mastery level on those standards
3. Records evidence (source_type, source_id, timestamp)

## How They Work Together

When Adeline teaches a lesson:

1. **During the Activity**:
   - Student works on a math problem for 1 hour
   - They demonstrate skills like "Algebra Problem Solving"

2. **Credits Tracked** (via `update_student_progress` tool):
   ```
   subject: "mathematics"
   credits: 0.01  // 1 hour
   activity: "Solved linear equations"
   ```
   - Adds 0.01 credits to Math graduation requirement
   - Brings student closer to the 3.0 credits needed for math graduation

3. **Standards Tracked** (via `log_activity` tool → MasteryService):
   ```
   skills: ["Algebra Problem Solving", "Linear Equations"]
   ```
   - Adds skills to `student_skills` table
   - Database trigger fires
   - Finds standards mapped to those skills (e.g., "OK.MATH.8.A.2")
   - Upgrades mastery: introduced → developing → proficient → mastered

4. **Result**:
   - Student has earned **0.01 credits** toward Math (time-based)
   - Student has progressed in **mastery** of specific standards (competency-based)
   - Both are tracked independently and serve different purposes

## Current State

### ✅ Fully Implemented
- Time-based credit tracking
- Graduation requirement definitions
- Skills and mastery tracking
- Database triggers for automatic standards progression
- Standards service and CASE integration code structure

### ⚠️ Partially Implemented
- `state_standards` table has basic Grade 8 Oklahoma standards seeded
- Standards are NOT yet fully connected to daily plans or chat
- Skill-to-standard mappings need to be created

### 🚧 To Be Built
- Full CASE API integration via MCP tools
- Complete Oklahoma standards for all grades K-12
- Comprehensive skill-to-standard mappings
- Standards-aware lesson planning
- Standards progress reporting for parents

## For Developers

### Adding Standards Support to a Feature

If you're building a feature that should track standards (like daily plans or projects):

1. **Identify relevant skills**
   - What skills does this activity develop?
   - Example: "Pythagorean Theorem", "Text Analysis", "Historical Cause and Effect"

2. **Use existing tools**
   ```typescript
   // Log the activity with skills
   await toolHandler.handleToolCalls([{
     name: 'log_activity',
     args: {
       caption: "Solved geometry problems",
       translation: "Mathematics: Geometry problem solving",
       skills: "Pythagorean Theorem, Geometric Reasoning"
     }
   }], userId, supabase);
   ```

3. **The database handles the rest**
   - Skills are added to `student_skills`
   - Trigger finds mapped standards
   - Standards mastery is updated automatically

### Mapping Skills to Standards

To link a skill to a standard:

```sql
-- Find the skill ID
SELECT id FROM skills WHERE name = 'Pythagorean Theorem';

-- Find the standard ID
SELECT id FROM state_standards
WHERE standard_code = 'OK.MATH.8.GM.1';

-- Create the mapping
INSERT INTO skill_standard_mappings (skill_id, standard_id, alignment_strength)
VALUES ('[skill-uuid]', '[standard-uuid]', 'full');
```

## Files Reference

- `src/lib/services/standardsService.ts`: Standards tracking logic
- `src/lib/services/caseStandardsIntegration.ts`: CASE API integration (future)
- `src/lib/services/masteryService.ts`: Processes skills and awards mastery
- `src/lib/services/toolHandlerService.ts`: Handles AI tool calls
- `supabase/migrations/28_add_standards_tracking.sql`: Database schema for standards
- `supabase/seed_oklahoma_standards.sql`: Starter Oklahoma standards

## Next Steps

1. Run the Oklahoma standards seed file to populate initial standards
2. Create mappings between common skills and standards
3. Update daily plan generation to suggest standards-aligned activities
4. Build standards progress view for students/parents
5. Implement full CASE API integration for all grades and subjects
