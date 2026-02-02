# Instructions for Gemini: Task -1.3 Interaction Patterns

## Task Overview
Create TOML configuration files that define how Adeline responds when students initiate actions vs when Adeline suggests.

## Deliverables
1. `~/.adeline/modes/patterns/student-initiated.toml` - Student-initiated patterns
2. Updates to `~/.adeline/modes/tutor.toml` - Add pattern imports
3. `docs/interaction-patterns.md` - Documentation

## Full Specification
Follow the complete specification in: `/home/amber/code/dear-adeline/docs/plans/phase-minus-1-student-agency.md` Task -1.3

## Implementation Steps

### Step 1: Create patterns directory
```bash
mkdir -p ~/.adeline/modes/patterns
```

### Step 2: Create student-initiated patterns file
Create `~/.adeline/modes/patterns/student-initiated.toml` with the exact content from the spec.

**Important:** Use the exact TOML structure provided. This file defines:
- How Adeline responds when student clicks "Explore"
- How Adeline responds when student clicks "Scout"
- How Adeline responds when student clicks "Map"
- How Adeline responds when student clicks "Reflect"
- How Adeline responds when student clicks "Ask"

### Step 3: Update tutor.toml
Modify `~/.adeline/modes/tutor.toml`:
- Add the `[patterns]` section (after line 66)
- Add the `[interaction_modes]` section
- Use the exact content from the spec

### Step 4: Create documentation
Create `docs/interaction-patterns.md` with the exact markdown from the spec.

This documents:
- Student-Initiated vs AI-Suggested patterns
- Examples of each
- Real-time guidance during tool use

### Step 5: Validate TOML syntax
```bash
# Verify TOML is valid
cat ~/.adeline/modes/patterns/student-initiated.toml | grep -v "^#" | head -20

# Should print valid TOML without errors
```

### Step 6: Commit
```bash
git add docs/interaction-patterns.md
git commit -m "feat: add student-initiated interaction patterns

Defines how Adeline responds when students initiate actions vs when Adeline suggests, enabling true agency."
```

**Note:** The TOML files in `~/.adeline/` are NOT tracked in git (user config), only the docs are committed.

## Success Criteria
- [ ] `student-initiated.toml` exists and is valid TOML
- [ ] `tutor.toml` has been updated with pattern imports
- [ ] Documentation is clear with examples
- [ ] No TOML syntax errors
- [ ] Patterns cover all 5 action types (explore, scout, map, reflect, ask)

## Notes
- Be very careful with TOML syntax (use exact formatting from spec)
- The response_template fields use triple-quoted strings for multi-line
- Don't add extra patterns not in the spec
- These patterns will be loaded by ConfigLoader in Phase 0
