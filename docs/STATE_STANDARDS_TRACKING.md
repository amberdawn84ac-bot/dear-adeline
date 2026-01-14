# State Standards Tracking System

## Overview

The Dear Adeline platform now includes comprehensive state standards tracking that automatically maps student activities, skills, and learning gaps to official state education standards. This enables standards-based progress reporting and ensures alignment with state educational requirements.

## Key Features

### 1. **Automatic Standards Mapping**
When students log activities, the system:
- Analyzes the activity using AI
- Identifies demonstrated skills
- Maps to relevant state standards automatically
- Tracks progress levels (introduced → developing → proficient → mastered)

### 2. **CASE Framework Integration**
Integration with Student Achievement Partners CASE framework via MCP tools:
- `find_standard_statement` - Fetch official standard statements
- `find_learning_components_from_standard` - Get granular sub-skills
- `find_standards_progression_from_standard` - Get prerequisite/next standards

### 3. **Progress Tracking**
Four mastery levels for each standard:
- **Introduced**: First time encountering the standard
- **Developing**: Demonstrated once, building understanding
- **Proficient**: Demonstrated multiple times with competence
- **Mastered**: Consistent demonstration of mastery

### 4. **Learning Components**
Each standard can be broken down into granular learning components, allowing for detailed skill tracking within broader standards.

## Database Schema

### Core Tables

#### `state_standards`
Stores official state standards with CASE framework integration.

```sql
{
  id: uuid,
  standard_code: "OK.MATH.8.A.1",
  jurisdiction: "Oklahoma",
  subject: "Mathematics",
  grade_level: "8",
  statement_text: "Understand rational and irrational numbers...",
  case_identifier_uuid: "..."
}
```

#### `learning_components`
Granular sub-skills within each standard.

```sql
{
  id: uuid,
  standard_id: uuid,
  component_text: "Identify rational numbers",
  component_order: 1,
  case_identifier_uuid: "..."
}
```

#### `skill_standard_mappings`
Maps Dear Adeline skills to state standards.

```sql
{
  skill_id: uuid,
  standard_id: uuid,
  alignment_strength: "full" | "partial" | "related"
}
```

#### `student_standards_progress`
Tracks individual student progress on standards.

```sql
{
  student_id: uuid,
  standard_id: uuid,
  mastery_level: "introduced" | "developing" | "proficient" | "mastered",
  demonstrated_at: timestamp,
  source_type: "activity_log" | "ai_lesson" | "library_project" | "manual",
  source_id: uuid
}
```

#### `learning_gaps` (updated)
Now linked to specific standards.

```sql
{
  id: uuid,
  student_id: uuid,
  skill_area: string,
  standard_id: uuid,  // NEW: links gap to specific standard
  severity: "minor" | "moderate" | "significant",
  resolved_at: timestamp
}
```

## API Integration

### Activity Translation Endpoint

**POST `/api/logs/translate`**

Now returns standards progress:

```json
{
  "success": true,
  "log": { ... },
  "analysis": { ... },
  "mastery": [ ... ],
  "resolvedGaps": [ ... ],
  "standardsProgress": [
    {
      "code": "OK.MATH.8.A.1",
      "subject": "Mathematics",
      "statement": "Understand rational and irrational numbers"
    }
  ]
}
```

## Service Layer

### StandardsService

Core operations for standards tracking.

```typescript
import { StandardsService } from '@/lib/services/standardsService';

// Get or create a standard
const standard = await StandardsService.getOrCreateStandard(
  'OK.MATH.8.A.1',
  'Oklahoma',
  supabase
);

// Get standards for a skill
const standards = await StandardsService.getStandardsForSkill(
  skillId,
  supabase
);

// Record student progress
await StandardsService.recordStandardProgress(
  studentId,
  standardId,
  'activity_log',
  activityId,
  supabase
);

// Get unmet standards (gaps)
const gaps = await StandardsService.getUnmetStandards(
  studentId,
  'Oklahoma',
  '8',
  'Mathematics',
  supabase
);
```

### ActivityToStandardsMapper

AI-powered mapping of activities to standards.

```typescript
import { ActivityToStandardsMapper } from '@/lib/services/activityToStandardsMapper';

// Auto-link activity to standards
const standards = await ActivityToStandardsMapper.autoLinkActivityToStandards(
  studentId,
  activityLogId,
  activityDescription,
  activityAnalysis,
  'Oklahoma',
  '8',
  supabase,
  'medium' // confidence threshold
);

// Identify standards gaps
const gaps = await ActivityToStandardsMapper.identifyStandardsGaps(
  studentId,
  'Oklahoma',
  '8',
  'Mathematics',
  supabase
);
```

### CASEStandardsIntegration

Integration with CASE framework MCP tools.

```typescript
import { CASEStandardsIntegration } from '@/lib/services/caseStandardsIntegration';

// Fetch and store a standard from CASE
const standard = await CASEStandardsIntegration.fetchAndStoreStandard(
  'OK.MATH.8.A.1',
  'Oklahoma',
  supabase,
  mcpClient
);

// Fetch learning components
await CASEStandardsIntegration.fetchAndStoreLearningComponents(
  standardId,
  caseIdentifierUUID,
  supabase,
  mcpClient
);

// Get prerequisite standards
const prerequisites = await CASEStandardsIntegration.getPrerequisiteStandards(
  caseIdentifierUUID,
  mcpClient
);
```

## Automatic Progress Tracking

The system includes a database trigger that automatically updates standards progress when skills are earned:

```sql
CREATE TRIGGER on_student_skill_earned
  AFTER INSERT ON student_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_student_standards_progress();
```

This ensures that:
1. When a skill is demonstrated
2. All mapped standards are identified
3. Student progress is updated automatically
4. Mastery levels advance through progression

## How It Works: Complete Flow

### 1. Student Logs Activity
```
Student: "I baked bread and measured ingredients by fractions"
```

### 2. AI Translation
```
Translation: "Practical Application of Fractions in Baking"
Skills: ["Fraction Measurement", "Recipe Following", "Math Application"]
Grade: "6th"
```

### 3. Skills Processing
```
MasteryService.processSkills()
→ Awards skill credits
→ Marks as "Mastered" or "Depth of Study"
```

### 4. Standards Mapping (NEW)
```
ActivityToStandardsMapper.autoLinkActivityToStandards()
→ AI suggests: "OK.MATH.6.N.1" (Understand fractions)
→ Confidence: "high"
→ Records progress as "developing"
```

### 5. Gap Resolution
```
LearningGapService.resolveGaps()
→ Checks open gaps
→ Matches demonstrated skills
→ Marks gaps as resolved
→ Links resolved gaps to standards
```

### 6. Response
```json
{
  "mastery": [...],
  "resolvedGaps": ["Fraction Measurement"],
  "standardsProgress": [
    {
      "code": "OK.MATH.6.N.1",
      "subject": "Mathematics",
      "statement": "Demonstrate understanding of fractions..."
    }
  ]
}
```

## Configuration

### Confidence Threshold

Control how aggressively activities are linked to standards:

- **high**: Only link when AI is very confident (recommended for formal reporting)
- **medium**: Balance between coverage and accuracy (default)
- **low**: Link more liberally (good for exploration)

```typescript
const standards = await ActivityToStandardsMapper.autoLinkActivityToStandards(
  // ... parameters ...
  'high' // confidence threshold
);
```

### State Standards Selection

Each student profile has a `state_standards` field:

```sql
SELECT state_standards FROM profiles WHERE id = student_id;
-- Returns: "Oklahoma", "Texas", "California", etc.
```

## Checklist UI (Future Enhancement)

The system is designed to support a standards checklist UI:

```typescript
// Get all standards for grade/subject
const allStandards = await supabase
  .from('state_standards')
  .select('*')
  .eq('jurisdiction', 'Oklahoma')
  .eq('grade_level', '8')
  .eq('subject', 'Mathematics');

// Get student's progress
const progress = await StandardsService.getStudentStandardsProgress(
  studentId,
  { gradeLevel: '8', subject: 'Mathematics' }
);

// Display as checklist with status
allStandards.forEach(standard => {
  const studentProgress = progress.find(p => p.standard_id === standard.id);
  const status = studentProgress?.mastery_level || 'not_started';

  renderCheckbox(standard, status);
});
```

## Gap Identification

Identify specific standards a student hasn't demonstrated:

```typescript
const gaps = await StandardsService.getUnmetStandards(
  studentId,
  'Oklahoma',
  '8',
  'Mathematics'
);

// Create learning gaps linked to standards
for (const standard of gaps) {
  await supabase.from('learning_gaps').insert({
    student_id: studentId,
    skill_area: standard.statement_text,
    standard_id: standard.id,
    severity: 'moderate',
    suggested_activities: [...]
  });
}
```

## Migration

To enable this system in your database:

```bash
npm run db:push
# Or
supabase db push
```

This will run migration `28_add_standards_tracking.sql` which creates all necessary tables, indexes, triggers, and RLS policies.

## Testing

Run the test suite:

```bash
npm test -- standardsService
```

All 7 tests should pass:
- ✓ Get or create standard
- ✓ Get standards for skill
- ✓ Record standard progress
- ✓ Progress through mastery levels
- ✓ Identify unmet standards
- ✓ Get learning components

## Next Steps

### Immediate
1. Run database migration
2. Test with sample activities
3. Verify standards are being tracked

### Future Enhancements
1. **Standards Checklist UI**: Display student progress on all standards
2. **Gap Dashboard**: Visual representation of unmet standards
3. **Bulk Import**: Import all standards for a state/grade
4. **Parent Reports**: Include standards progress in reports
5. **Learning Component Tracking**: Track granular sub-skills
6. **Prerequisite Chains**: Show what students need to learn first
7. **Standards-Based Planning**: Generate learning plans from gaps

## Support

The system is fully backward compatible. If standards tracking is not enabled for a student (no `state_standards` set), the activity translation flow continues to work normally without standards mapping.

## Architecture Benefits

1. **Automatic**: No manual standard selection required
2. **Intelligent**: AI determines standard alignment
3. **Progressive**: Mastery levels track growth over time
4. **Integrated**: Works seamlessly with existing activity logging
5. **Flexible**: Confidence thresholds prevent false positives
6. **Auditable**: Full history of when/how standards were demonstrated
7. **Granular**: Learning components allow detailed tracking
8. **Connected**: Links standards, skills, gaps, and activities

## Example: Complete Student Journey

### Week 1
```
Activity: "Practiced long division"
→ Standards: OK.MATH.5.N.2 (introduced)
→ Gaps: None created yet
```

### Week 2
```
Activity: "Divided numbers with remainders"
→ Standards: OK.MATH.5.N.2 (developing)
→ Gaps: Still learning
```

### Week 3
```
Activity: "Solved word problems using division"
→ Standards: OK.MATH.5.N.2 (proficient)
→ Gaps: Resolved!
```

### Week 4
```
Activity: "Taught sibling how to divide"
→ Standards: OK.MATH.5.N.2 (mastered)
→ Gaps: Fully resolved, can teach others
```

Throughout this journey, the student never manually selected standards. The system automatically tracked their progress from introduction to mastery, resolved their learning gaps, and created an auditable record of their learning journey aligned to state standards.
