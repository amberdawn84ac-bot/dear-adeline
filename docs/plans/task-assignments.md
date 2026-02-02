# Task Assignments: Claude vs Gemini

## Division Strategy

**Claude (Complex/Integration):**
- Architectural decisions
- Integration between systems
- Critical path items
- Testing and verification
- Code review

**Gemini (Implementation/Config):**
- Straightforward components
- Config file creation
- Template generation
- Repetitive implementation
- Following clear specs

---

## Phase -1: Student Agency Foundation

### ✅ Gemini Tasks

**Task -1.1: Floating Action Bar Component**
- Status: Assign to Gemini
- Why: Straightforward React component with clear spec
- Deliverables:
  - `src/components/FloatingActionBar.tsx`
  - `src/components/__tests__/FloatingActionBar.test.tsx`
- Instructions: Follow the spec in `docs/plans/phase-minus-1-student-agency.md` Task -1.1 exactly
- Verification: Tests must pass

**Task -1.2: Event Bus**
- Status: Assign to Gemini
- Why: Simple TypeScript class with clear interface
- Deliverables:
  - `src/lib/genui/EventBus.ts`
  - `src/lib/genui/__tests__/EventBus.test.ts`
- Instructions: Follow the spec in Task -1.2 exactly
- Verification: Tests must pass

**Task -1.3: Interaction Patterns (Config Files)**
- Status: Assign to Gemini
- Why: TOML config creation, examples provided
- Deliverables:
  - `~/.adeline/modes/patterns/student-initiated.toml`
  - Updates to `~/.adeline/modes/tutor.toml`
  - `docs/interaction-patterns.md`
- Instructions: Create files as specified in Task -1.3
- Verification: TOML validates, files load correctly

### 🔵 Claude Tasks

**Task -1.4: Dashboard Integration**
- Status: Assign to Claude
- Why: Needs to understand existing dashboard structure, integration work
- Deliverables:
  - Modify dashboard page to include FloatingActionBar
  - Wire up event handlers
  - Connect to chat
- Dependencies: Wait for Gemini to complete Tasks -1.1 and -1.2
- Verification: Manual testing - buttons work and send messages

**Task -1.5: Chat API Enhancement**
- Status: Assign to Claude
- Why: Critical path, complex integration with existing chat system
- Deliverables:
  - Pattern detection logic
  - Pattern loader implementation
  - Integration with existing chat API
- Dependencies: Wait for Gemini to complete Task -1.3
- Verification: Student-initiated vs AI-suggested responses work correctly

---

## Phase 0: Foundation Setup

### ✅ Gemini Tasks

**Task 0.1: Install CopilotKit Dependencies**
- Status: Assign to Gemini
- Why: Package installation, straightforward
- Deliverables: Updated package.json, verified installation
- Instructions: Follow spec exactly
- Note: `@copilotkit/a2ui-renderer` already installed, just need the rest

**Task 0.2: Create Configuration System Directory Structure**
- Status: ⚠️ Partially Done (Gemini already did this)
- Action: Verify and document what exists
- Deliverables: Ensure all directories exist, add .gitkeep if needed

**Task 0.3: Install TOML Parser and RoughJS**
- Status: Assign to Gemini
- Why: Package installation
- Deliverables: Updated package.json with toml and types
- Note: RoughJS already installed, just verify

**Task 0.4: Create ConfigLoader Class**
- Status: Assign to Gemini with Claude Review
- Why: Important foundational class, but spec is clear
- Process:
  1. Gemini implements following spec
  2. Claude reviews before committing
- Deliverables:
  - `src/lib/adeline/ConfigLoader.ts`
  - `src/lib/adeline/__tests__/ConfigLoader.test.ts`
- Verification: Tests pass, Claude reviews architecture

**Task 0.5: Create Tutor Mode Configuration**
- Status: ✅ Already Done (Gemini did this)
- Action: Verify tutor.toml has all required sections
- May need: Updates based on Phase -1 patterns

**Task 0.6: Create GenUI Theme Configuration**
- Status: Assign to Gemini
- Why: Straightforward type definitions and theme object
- Deliverables:
  - `src/lib/genui/A2UITheme.ts`
- Instructions: Follow spec in plan
- Verification: TypeScript compiles

### 🔵 Claude Tasks

**Task 0.7: Create CopilotKit API Route**
- Status: Assign to Claude
- Why: Complex integration, connects multiple systems
- Deliverables:
  - `src/app/api/copilotkit/route.ts`
  - `src/lib/adeline/GeminiAdapter.ts`
- Dependencies: ConfigLoader must be done
- Verification: API route works, loads configs, calls Gemini

**Task 0.8: Wrap App in CopilotKitProvider**
- Status: Assign to Claude
- Why: Critical integration point, layout modification
- Deliverables: Updated `src/app/layout.tsx`
- Dependencies: Theme and API route must be done
- Verification: App builds, CopilotKit initializes

---

## Phase 1A: Interactive Lessons - Dynamic Ledger

### ✅ Gemini Tasks

**Task 1.1: Create Dynamic Ledger Component**
- Status: Assign to Gemini
- Why: UI component with clear requirements
- Deliverables:
  - `src/components/genui/static/DynamicLedger.tsx`
  - `src/components/genui/static/__tests__/DynamicLedger.test.tsx`
- Instructions: Follow TDD spec in plan
- Verification: Tests pass

**Task 1.2: Register Dynamic Ledger as Frontend Tool**
- Status: Assign to Gemini
- Why: Straightforward tool registration
- Deliverables:
  - `src/lib/genui/ToolRegistry.ts`
  - `src/hooks/useAdelineFrontendTools.ts`
- Instructions: Follow spec
- Verification: TypeScript compiles

**Task 1.3: Create A2UI Lesson Summary Template**
- Status: ⚠️ Partially Done
- Action: Verify existing template, update if needed
- Deliverables:
  - Verify `~/.adeline/templates/a2ui/lesson-summary.json`
  - Create `docs/a2ui-templates.md`

### 🔵 Claude Tasks

**Task 1.4: Test Full Lesson Flow**
- Status: Assign to Claude
- Why: Manual validation, user experience testing
- Process: Start dev server, test interactions, document findings

**Task 1.5: Complete CopilotRuntime Integration**
- Status: Assign to Claude
- Why: Complex integration work
- Deliverables: Connect Gemini to CopilotKit runtime properly

**Task 1.6: Implement A2UI Template Renderer**
- Status: Assign to Claude
- Why: Variable substitution system, streaming logic
- Deliverables: Template variables get replaced, A2UI streams correctly

**Task 1.7: Add Learning Path Integration**
- Status: Assign to Claude
- Why: Integration with existing learning path system
- Deliverables: Lessons connect to milestones, log progress

**Task 1.8: End-to-End Testing**
- Status: Assign to Claude
- Why: Comprehensive testing and verification

---

## Phase 1B: Visual Journal

### ✅ Gemini Tasks

**Task 2.1: Create Journal Summary A2UI Template**
- Straightforward template creation

**Task 2.2: Add "Summarize" Button to Journal Page**
- UI component addition

### 🔵 Claude Tasks

**Task 2.3: Stream Journal Summary After Activities**
- Integration work

**Task 2.4: Integrate Constellation Map Progress Visualization**
- Complex visualization integration

---

## Workflow

### For Gemini Tasks:

1. **You give Gemini:**
   - The task number and description
   - Link to the spec in the plan document
   - Clear deliverables list
   - Success criteria

2. **Gemini delivers:**
   - Code files
   - Test files (if applicable)
   - Runs tests and confirms they pass

3. **You verify:**
   - Tests actually pass
   - Code follows the spec
   - Commit the work

### For Claude Tasks:

1. **You tell me:**
   - Which task to work on
   - Context from Gemini's completed work
   - Any issues or concerns

2. **I deliver:**
   - Implementation with integration
   - Testing and verification
   - Architectural decisions
   - Code review of Gemini's work when needed

---

## Current Priority Order

### Immediate (Start with Gemini):
1. Task -1.1: Floating Action Bar (Gemini)
2. Task -1.2: Event Bus (Gemini)
3. Task -1.3: Interaction Patterns (Gemini)

### Next (Claude):
4. Task -1.4: Dashboard Integration (Claude - needs -1.1 and -1.2 done)
5. Task -1.5: Chat API Enhancement (Claude - needs -1.3 done)

### Then Phase 0 (Mix):
6. Tasks 0.1, 0.3, 0.6 (Gemini - can run in parallel)
7. Task 0.4 (Gemini with Claude review)
8. Tasks 0.7, 0.8 (Claude - integration)

---

## Estimated Usage

**Gemini tasks:** ~10-15 (mostly component/config generation)
**Claude tasks:** ~8-10 (integration, testing, review)

**Total:** This should reduce your Claude usage by about 50-60% while keeping me focused on the complex/critical work.

---

## Notes

- Gemini is great at following specs but may need iteration
- Claude should review Gemini's work on critical components (ConfigLoader, EventBus)
- Manual testing tasks should be Claude (better at identifying UX issues)
- Integration always Claude (needs context of entire system)
