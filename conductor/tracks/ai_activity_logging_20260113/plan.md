# Plan: AI-Powered Activity Logging and Translation

## Phase 1: Core AI Translation & Auto-Logging [checkpoint: ffb4721]
*Implement the basic Adeline translation engine, credit calculation logic, and the auto-save logging flow.*

- [x] Task 1: Create AI Translation Service
    - [x] Sub-task: Define Zod schema for Adeline's JSON response (Subject, Skills, Grade).
    - [x] Sub-task: Implement AI prompt logic to extract academic translation and skills.
    - [x] Sub-task: Write unit tests for AI translation parsing and fallback handling.
- [x] Task 2: Implement Mastery & Credit Logic
    - [x] Sub-task: Create a service method to calculate credits based on skills (1 credit = mastery of year's skills).
    - [x] Sub-task: Implement logic to check if a skill is new (Credit) or repeated (Depth of Study).
    - [x] Sub-task: Write tests for credit calculation and "Depth of Study" detection.
- [x] Task 3: Implement `/api/logs/translate` Endpoint
    - [x] Sub-task: Write failing integration tests for the endpoint.
    - [x] Sub-task: Implement POST handler to call translation service, apply credit logic, and save to `activity_logs`.
    - [x] Sub-task: Ensure grade context is pulled from the user's profile.
- [x] Task 4: Refactor Dashboard UI for Simplified Logging
    - [x] Sub-task: Create failing tests for the new simplified Activity Modal.
    - [x] Sub-task: Replace complex form with a single text area.
    - [x] Sub-task: Implement auto-save logic and success notification.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Core AI Translation & Auto-Logging' (Protocol in workflow.md)

## Phase 2: Gap Filling & Proactive Suggestions
*Integrate logging with the learning gaps system and enable proactive guidance.*

- [~] Task 1: Gap Matching Logic
    - [ ] Sub-task: Write unit tests for matching identified skills against open learning gaps.
    - [ ] Sub-task: Implement logic to update `learning_gaps` status when a skill is demonstrated.
- [ ] Task 2: Proactive Activity Suggestions
    - [ ] Sub-task: Create a service to generate activity suggestions for remaining gaps.
    - [ ] Sub-task: Update the Dashboard/API to return these suggestions after logging an activity.
    - [ ] Sub-task: Write tests for suggestion relevance and formatting.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Gap Filling & Proactive Suggestions' (Protocol in workflow.md)

## Phase 3: Mastery Reporting & Parent Feedback
*Finalize the loop by including gap status in parent reports.*

- [ ] Task 1: Update Parent Report Generation
    - [ ] Sub-task: Modify report generation service to include a section for "Learning Gaps & Progress."
    - [ ] Sub-task: Ensure "Depth of Study" activities are highlighted in the report.
    - [ ] Sub-task: Write unit tests for report content accuracy.
- [ ] Task 2: UI Polishing & Depth of Study Feedback
    - [ ] Sub-task: Update the success notification to clearly distinguish between "New Mastery" (Credit) and "Depth of Study".
    - [ ] Sub-task: Final mobile responsiveness check for the simplified logging flow.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Mastery Reporting & Parent Feedback' (Protocol in workflow.md)