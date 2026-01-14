# Plan: AI-Powered Activity Logging and Translation

## Phase 1: Core AI Translation & Auto-Logging
*Implement the basic Adeline translation engine and the auto-save logging flow.*

- [ ] Task 1: Create AI Translation Service
    - [ ] Sub-task: Define Zod schema for Adeline's JSON response (Subject, Skills, Grade).
    - [ ] Sub-task: Implement AI prompt logic in a new utility or service.
    - [ ] Sub-task: Write unit tests for AI translation parsing and fallback handling.
- [ ] Task 2: Implement `/api/logs/translate` Endpoint
    - [ ] Sub-task: Write failing integration tests for the endpoint (authenticated, valid input, AI error).
    - [ ] Sub-task: Implement POST handler to call translation service and save to `activity_logs`.
    - [ ] Sub-task: Ensure grade context is pulled from the user's profile.
- [ ] Task 3: Refactor Dashboard UI for Simplified Logging
    - [ ] Sub-task: Create failing tests for the new simplified Activity Modal.
    - [ ] Sub-task: Replace complex form with a single text area.
    - [ ] Sub-task: Implement auto-save logic and success notification.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Core AI Translation & Auto-Logging' (Protocol in workflow.md)

## Phase 2: Gap Filling & Proactive Suggestions
*Integrate logging with the learning gaps system and enable proactive guidance.*

- [ ] Task 1: Gap Matching Logic
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
    - [ ] Sub-task: Write unit tests for report content accuracy.
- [ ] Task 2: UI Polishing & Depth of Study Feedback
    - [ ] Sub-task: Ensure the success notification clearly distinguishes between "New Mastery" and "Depth of Study."
    - [ ] Sub-task: Final mobile responsiveness check for the simplified logging flow.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Mastery Reporting & Parent Feedback' (Protocol in workflow.md)
