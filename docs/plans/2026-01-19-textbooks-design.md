# Textbooks Feature Design

## Overview

Add interactive Science and History "textbooks" to the left sidebar menu. These provide structured learning content with a biblical worldview as the foundation.

- **History:** Horizontal timeline from Creation to current events, showing mainstream narrative vs. primary source truth
- **Science:** Skill tree of practical, real-world science concepts with honest epistemology

## Core Principles

### Biblical Worldview Always
- Creation is the anchor point, not an assumption to work around
- Scripture is a valid primary source alongside historical documents
- "God designed it" is a legitimate explanation for complexity
- Stewardship lens for nature (dominion with responsibility)
- "Who does this glorify?" as a lens for evaluating claims

### Epistemic Honesty
Every concept clearly distinguishes:
- **What we observe** - Facts we can verify
- **What models describe** - Useful tools, not absolute truth
- **What we don't know** - Honest about gaps and mysteries

No presenting theories as facts. No "gravity IS a force" - instead "Newton described gravity as a force, Einstein described it as curved spacetime, nobody knows what it actually is."

---

## Navigation

New sidebar items (between "Project Library" and "Opportunities"):

```
📚 Textbooks
  ├── 🔬 Science
  └── 🏛️ History
```

- Collapsible section - clicking "Textbooks" expands to show Science and History
- Routes: `/textbooks/science` and `/textbooks/history`
- Mobile: Links appear as full menu items (no nesting)

---

## History Timeline

### Layout
- Horizontal scrollable timeline at top
- Zoom levels: Era → Century → Decade
- Events appear as markers; click to expand
- Mobile: Becomes vertical for easier scrolling

### Eras (left to right)
1. Creation & Early Earth
2. Ancient World
3. Classical Era
4. Medieval Period
5. Reformation & Renaissance
6. Modern Era
7. Current Events

### Event Card Structure
```
┌─────────────────────────────────────────┐
│ 🏛️ [Event Title]           [Date/Era]  │
├─────────────────────────────────────────┤
│ 📺 MAINSTREAM NARRATIVE                 │
│ "What textbooks say..."                 │
├─────────────────────────────────────────┤
│ 📜 PRIMARY SOURCES                      │
│ "What documents actually show..."       │
│ [Source citations incl. Scripture]      │
├─────────────────────────────────────────┤
│ [💬 Ask Adeline] [🎯 Take Challenge]   │
└─────────────────────────────────────────┘
```

### Interactive Features
- **Ask Adeline:** Opens chat panel focused on this event
- **Take Challenge:** 3-question quiz, awards skills/credits on completion

### Starter Content (~30+ events)

**Creation & Early Earth:**
- Creation (Genesis account)
- The Fall
- The Flood (global event)
- Tower of Babel (origin of nations/languages)

**Ancient World:**
- Egyptian dynasties
- Hebrew patriarchs
- Exodus
- Greek philosophers

**Classical Era:**
- Roman Empire
- Life of Christ
- Early Church
- Council of Nicaea (what was actually decided)

**Bible History:**
- Jerome's Latin Vulgate (translation choices)
- Dead Sea Scrolls discovery
- King James translation (political motivations)
- Removed books - who decided and why
- Hebrew vs. Greek Septuagint differences

**Medieval & Reformation:**
- Medieval period
- Reformation
- Renaissance

**Modern Era:**
- American founding (Christian foundations)
- Industrial Revolution
- Federal Reserve creation
- World Wars

**Declassified Documents:**
- Operation Mockingbird (CIA media control)
- MKUltra (mind control experiments)
- Operation Paperclip (Nazi scientist recruitment)
- Gulf of Tonkin (Vietnam War pretext)
- COINTELPRO (FBI domestic surveillance)
- Tuskegee experiments

---

## Science Skill Tree

### Layout
- Visual tree/web of interconnected concepts
- Nodes are circles with icons
- Lines connect prerequisites
- Locked nodes grayed out until prerequisites mastered
- Completed nodes glow with checkmark
- Mobile: Becomes vertical list

### Concept Card Structure
```
┌─────────────────────────────────────────┐
│ ⚡ [Concept Name]          [Mastery: 0%]│
├─────────────────────────────────────────┤
│ WHY THIS MATTERS                        │
│ "Real-world application..."             │
├─────────────────────────────────────────┤
│ WHAT WE OBSERVE                         │
│ • Verifiable fact 1                     │
│ • Verifiable fact 2                     │
├─────────────────────────────────────────┤
│ WHAT MODELS DESCRIBE                    │
│ "Scientists describe this as..."        │
├─────────────────────────────────────────┤
│ WHAT WE DON'T KNOW                      │
│ "The mystery remaining..."              │
├─────────────────────────────────────────┤
│ [📖 Learn] [💬 Ask Adeline] [🎯 Quiz]  │
└─────────────────────────────────────────┘
```

### Interactive Features
- **Learn:** Short lesson (2-3 paragraphs + diagram)
- **Ask Adeline:** Opens chat focused on this concept
- **Quiz:** Mastery check, awards skills/credits

### Starter Content (~35 concepts)

**Matter:**
- Atoms & Elements
- Molecules & Compounds
- States of Matter
- Phase Changes

**Energy:**
- Forms of Energy
- Conservation of Energy
- Heat Transfer
- Electricity Basics

**Forces & Motion:**
- Friction
- Magnetism
- Simple Machines (lever, pulley, wedge, inclined plane, wheel & axle, screw)
- Newton's Laws (as useful descriptions)

**Gravity (honest approach):**
- What We Observe (things fall, orbits)
- Newton's Model (useful math)
- Einstein's Model (spacetime curvature)
- What We Don't Know

**Growing Things:**
- Soil Health & Composting
- Seed Saving
- Companion Planting
- Seasons & Planting Cycles
- Permaculture Basics

**Animals:**
- Chicken Keeping Basics
- Animal Behavior & Communication
- Natural Pest Control
- Livestock Health Signs

**Food & Preservation:**
- Fermentation
- Canning & Food Safety
- Dehydration
- Raw Milk & Dairy Science

**Natural Health:**
- Herbs & Their Uses
- Terrain Theory vs. Germ Theory
- How the Body Heals Itself
- Reading Your Body's Signals

**Weather & Navigation:**
- Reading Clouds & Sky
- Predicting Weather Naturally
- Finding Direction Without Tools
- Moon Phases & Their Effects

**Water:**
- Finding & Testing Water
- Natural Filtration
- Wells & Springs
- Water Rights Basics

**Life:**
- Cells (God's design)
- Body Systems
- Nutrition
- Ecosystems & Stewardship

---

## Database Schema

### textbook_events (History)
```sql
CREATE TABLE textbook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date_display TEXT NOT NULL,
  era TEXT NOT NULL,
  century INTEGER,
  decade INTEGER,
  mainstream_narrative TEXT NOT NULL,
  primary_sources TEXT NOT NULL,
  source_citations JSONB DEFAULT '[]',
  scripture_references JSONB DEFAULT '[]',
  related_event_ids UUID[] DEFAULT '{}',
  skills_awarded JSONB DEFAULT '[]',
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### textbook_concepts (Science)
```sql
CREATE TABLE textbook_concepts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  branch TEXT NOT NULL,
  prerequisite_ids UUID[] DEFAULT '{}',
  why_it_matters TEXT NOT NULL,
  what_we_observe JSONB DEFAULT '[]',
  what_models_say TEXT,
  what_we_dont_know TEXT,
  key_ideas JSONB DEFAULT '[]',
  learn_content TEXT,
  skills_awarded JSONB DEFAULT '[]',
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### student_textbook_progress
```sql
CREATE TABLE student_textbook_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('event', 'concept')),
  mastery_level TEXT DEFAULT 'not_started',
  quiz_scores JSONB DEFAULT '[]',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, item_id, item_type)
);
```

---

## Implementation Phases

### Phase 1: Foundation
- Add Textbooks menu section to sidebar
- Create page routes and layouts
- Database migrations
- Basic responsive shells

### Phase 2: History Timeline
- Horizontal scrollable timeline component
- Zoom functionality (era/century/decade)
- Event cards with mainstream vs. primary source
- "Ask Adeline" integration
- Quiz/challenge generation
- AI-generate ~30 starter events

### Phase 3: Science Skill Tree
- Visual node tree with prerequisites
- Concept cards with observe/model/unknown sections
- Learn, Ask, Quiz buttons
- Progress tracking and unlocks
- AI-generate ~35 starter concepts

### Phase 4: Polish
- Animations and transitions
- Progress syncs with graduation credits
- Mobile optimization
- Performance tuning

---

## Success Criteria

1. Students can browse History from Creation to current events
2. Every event shows mainstream narrative vs. primary source truth
3. Students can explore Science through prerequisite-based skill tree
4. All content maintains epistemic honesty (observe/model/unknown)
5. Biblical worldview is the foundation throughout
6. Progress earns credits toward graduation requirements
7. Works smoothly on mobile devices
