# Instructions for Gemini: Task -1.2 Event Bus

## Task Overview
Create an event bus system that allows bidirectional communication between GenUI tools and Adeline.

## Deliverables
1. `src/lib/genui/EventBus.ts` - Event bus implementation
2. `src/lib/genui/__tests__/EventBus.test.ts` - Tests

## Full Specification
Follow the complete specification in: `/home/amber/code/dear-adeline/docs/plans/phase-minus-1-student-agency.md` Task -1.2

## TDD Steps (MUST FOLLOW IN ORDER)

### Step 1: Create directories
```bash
mkdir -p src/lib/genui
mkdir -p src/lib/genui/__tests__
```

### Step 2: Write the failing test
Create `src/lib/genui/__tests__/EventBus.test.ts` with the exact test code from the spec.

### Step 3: Run test to verify it fails
```bash
npm test -- EventBus.test.ts
```
Expected: FAIL (EventBus doesn't exist yet)

### Step 4: Create the EventBus
Create `src/lib/genui/EventBus.ts` with the exact implementation from the spec.

### Step 5: Run test to verify it passes
```bash
npm test -- EventBus.test.ts
```
Expected: PASS (all tests green)

### Step 6: Commit
```bash
git add src/lib/genui/EventBus.ts src/lib/genui/__tests__/EventBus.test.ts
git commit -m "feat: add GenUI event bus for bidirectional communication

Enables tools to emit events (discovery, stuck, etc.) that Adeline can respond to in real-time."
```

## Success Criteria
- [ ] All tests pass
- [ ] TypeScript compiles with no errors
- [ ] EventBus supports on/off/emit methods
- [ ] Multiple listeners can subscribe to same event
- [ ] Events include timestamp
- [ ] Singleton instance exported for app-wide use

## Notes
- Use exact code from the spec
- This is a foundational piece - must be bulletproof
- Follow TDD discipline strictly
