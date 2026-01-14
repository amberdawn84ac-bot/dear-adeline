# Specification: AI-Powered Activity Logging and Translation

## Overview
Transform the "Log Activity" feature into an intelligent, proactive system where Adeline translates student activities into academic credits, verifies skill mastery against state standards, and actively manages learning gaps.

## Functional Requirements

### 1. Simplified Logging Interface
- Replace the multi-field "Log Activity" form with a single text area: "What did you do?"
- The modal should be streamlined to focus solely on the student's narrative.

### 2. Adeline's Academic Translation Engine
- **Subject Mapping:** AI identifies the academic subject area (e.g., "Chemistry: Fermentation Science").
- **Skill Extraction:** AI extracts 2-4 specific skills demonstrated (e.g., "Measurement", "Chemical Reactions").
- **Grade Context:** AI uses the student's existing grade level profile to ensure the translation is academically appropriate.

### 3. Mastery-Based Credit Logic
- **Skill Check-off:** Credits are awarded based on the mastery of specific required skills matching state standards.
- **Micro-Credit Accumulation:** Total subject credits progress as individual required skills are checked off.
- **Depth of Study:** If an activity demonstrates a skill already mastered, it is logged as "Reinforcement" or "Depth of Study."

### 4. Gap Filling Integration
- **Gap Matching:** The system must check identified skills against the student's known "Learning Gaps."
- **Gap Resolution:** If the activity demonstrates mastery of a skill listed as a gap, that gap is marked as "addressed" or "filled."
- **Feedback:** The success notification explicitly informs the user if a gap was filled.

### 5. Proactive Gap Management
- **Activity Suggestions:** When the system identifies persistent learning gaps, Adeline must generate and display specific activity suggestions to help the student fill them.
- **Parent Reporting:** Learning gaps (both open and filled) must be included in the generated reports for parents to provide a complete picture of academic progress.

### 6. Automated Workflow (Auto-Save)
- Once the user submits the description, the system calls the translation API.
- The activity is **auto-saved** to the database without further user intervention.
- The user receives a success notification displaying Adeline's translation, skills identified, gaps filled, and any new suggestions.

## Non-Functional Requirements
- **Response Latency:** The AI translation and save process should complete within a reasonable timeframe (aiming for < 3 seconds).
- **Graceful Failure:** If the AI fails to parse the activity, default to a "General Activity" log.

## Acceptance Criteria
- [ ] UI contains only one required input field for activity logging.
- [ ] Submitting an activity triggers an AI call that produces a subject, skills, and mastery-based progress.
- [ ] Activities are saved automatically to the `activity_logs` table.
- [ ] Repeated skills are flagged as "Depth of Study."
- [ ] Activities addressing known learning gaps update the gap status.
- [ ] Adeline provides specific activity suggestions for remaining gaps.
- [ ] Parent reports include a section on Learning Gaps status.

## Out of Scope
- Manual editing of AI-generated translations (v1 will rely on Adeline's expertise).
- Full redesign of the Parent Portal (only the report content generation is in scope).
