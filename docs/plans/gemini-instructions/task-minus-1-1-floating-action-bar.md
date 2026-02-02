# Instructions for Gemini: Task -1.1 Floating Action Bar

## Task Overview
Create a Floating Action Bar component that gives students agency to trigger actions (Explore, Scout, Map, Reflect, Ask).

## Deliverables
1. `src/components/FloatingActionBar.tsx` - The component
2. `src/components/__tests__/FloatingActionBar.test.tsx` - Tests

## Full Specification
Follow the complete specification in: `/home/amber/code/dear-adeline/docs/plans/phase-minus-1-student-agency.md` Task -1.1

## TDD Steps (MUST FOLLOW IN ORDER)

### Step 1: Write the failing test
Create `src/components/__tests__/FloatingActionBar.test.tsx` with the exact test code from the spec.

### Step 2: Run test to verify it fails
```bash
npm test -- FloatingActionBar.test.tsx
```
Expected: FAIL (component doesn't exist yet)

### Step 3: Create the component
Create `src/components/FloatingActionBar.tsx` with the exact implementation from the spec.

### Step 4: Run test to verify it passes
```bash
npm test -- FloatingActionBar.test.tsx
```
Expected: PASS (all tests green)

### Step 5: Commit
```bash
git add src/components/FloatingActionBar.tsx src/components/__tests__/FloatingActionBar.test.tsx
git commit -m "feat: add Floating Action Bar for student-initiated actions

Provides always-visible UI for students to trigger Explore, Scout, Map, Reflect, and Ask actions."
```

## Success Criteria
- [ ] Tests pass
- [ ] TypeScript compiles with no errors
- [ ] Component renders 5 action buttons
- [ ] Tooltips show on hover
- [ ] onClick handlers fire correctly
- [ ] Component matches hand-drawn aesthetic (rounded, whimsical colors)

## Notes
- Use exact code from the spec (it's battle-tested)
- Don't add extra features
- Follow TDD discipline strictly
- Commit only when tests pass
