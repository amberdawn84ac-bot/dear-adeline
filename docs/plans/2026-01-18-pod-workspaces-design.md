# Pod Workspaces Design

## Overview

Expand the existing peer learning pods into functional collaboration workspaces where students can work on shared projects together and have discussions.

## Goals

- Enable shared project ownership with revision history
- Support flexible discussion threads (project-specific, topic-based, assignment-linked)
- Implement trust-based content moderation for K-12 safety
- Provide hands-off teacher oversight with activity summaries and flagged content alerts

## Data Model

### New Tables

**`project_collaborators`** - Links multiple students to a project
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| project_id | uuid | FK to projects |
| student_id | uuid | FK to profiles |
| role | text | 'owner' or 'collaborator' |
| added_at | timestamp | When added |
| added_by | uuid | Who added them |

**`project_revisions`** - Tracks edit history
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| project_id | uuid | FK to projects |
| editor_id | uuid | FK to profiles |
| content_snapshot | jsonb | Full project state |
| change_summary | text | Brief description of changes |
| created_at | timestamp | When saved |

**`pod_discussions`** - Discussion threads in a pod
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| pod_id | uuid | FK to learning_pods |
| project_id | uuid | FK (nullable) - if attached to project |
| assignment_id | uuid | FK (nullable) - if teacher-created |
| title | text | Thread title |
| body | text | Original post content |
| author_id | uuid | FK to profiles |
| is_pinned | boolean | Pinned to top |
| created_at | timestamp | When created |

**`discussion_replies`** - Responses to threads
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| discussion_id | uuid | FK to pod_discussions |
| author_id | uuid | FK to profiles |
| body | text | Reply content |
| created_at | timestamp | When posted |

**`student_trust_levels`** - Publishing permissions
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| student_id | uuid | FK to profiles |
| trust_score | int | 0-100 score |
| auto_publish | boolean | True when score > threshold |
| updated_at | timestamp | Last updated |

**`pending_content`** - Content awaiting approval
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| content_type | text | 'discussion', 'reply', 'project_edit' |
| content_id | uuid | FK to the actual content |
| author_id | uuid | FK to profiles |
| pod_id | uuid | FK to learning_pods |
| status | text | 'pending', 'approved', 'rejected' |
| reviewed_by | uuid | FK (nullable) - teacher who reviewed |
| feedback | text | Optional rejection reason |
| created_at | timestamp | When submitted |

### Modifications to Existing Tables

- `projects`: Add `pod_id` column (uuid, nullable, FK to learning_pods)

## Trust System

### Score Calculation

Students start at score 0 (requires approval for all content).

**Positive actions:**
- +5 points: Each approved edit or discussion post
- +10 points: Teacher explicitly endorses content
- +2 points: Peer gives positive feedback on contribution

**Negative actions:**
- -20 points: Content flagged and confirmed inappropriate by teacher

### Auto-Publish Threshold

50 points (roughly 10 approved contributions)

### Moderation Flow

1. **New/low-trust student** posts content:
   - Goes to `pending_content` queue
   - Teacher sees in dashboard
   - Approves or rejects
   - Student notified of outcome

2. **Trusted student** posts content:
   - AI safety scan runs via `/api/safety/scan`
   - If flagged: goes to teacher queue
   - If clean: publishes immediately

3. **Teacher review dashboard** shows:
   - Pending content needing approval
   - Recently flagged content
   - Activity summary per pod

### Revert Capability

Teachers can view revision history and restore any previous version. Problematic edits are logged and affect the editor's trust score.

## User Interface

### Pod Workspace

When student clicks "Enter Workspace" on a pod card, they see:

**Projects Tab:**
- Grid of shared projects in this pod
- Each card shows: title, thumbnail, last editor, last updated
- "New Shared Project" button
- Clicking project opens editor with collaborator sidebar

**Discussions Tab:**
- List of threads sorted by recent activity
- Filter chips: "All" | "Project threads" | "General" | "Assignments"
- Pinned threads at top
- "New Discussion" button
- Thread view shows original post + replies

**Activity Tab:**
- Timeline of recent pod activity
- "Sarah edited Math Game", "James started a discussion", etc.

### Project Editing

- Same editor as solo projects
- New "History" button shows revision timeline
- "Restore this version" on any past revision
- Low-trust students see "Submit for review" instead of "Save"
- Conflict warning if project changed since loaded

### Collaborator Management

- Owner clicks "Manage Collaborators" in sidebar
- List of pod members with checkboxes
- Selected members become collaborators
- Only owner can remove collaborators or delete project

## Discussion Threads

### Three Thread Types

**Project threads:**
- Created from within a shared project
- Auto-linked to that project
- Title prefixed with project name

**General threads:**
- Created from Discussions tab
- No project link
- Optional tags for categorization

**Assignment threads:**
- Only teachers can create
- Appear pinned with assignment badge
- Can have participation due date

### Reply Features

- Simple text replies (no nested threading)
- Author, avatar, timestamp shown
- Authors can edit within 15 minutes
- Trust system applies to replies

### Notifications

- Reply to your thread
- New reply in thread you participated in
- Teachers: flagged content only

## Teacher Oversight

### Pod Activity Section

Added to existing teacher dashboard (not separate page).

**Activity summary cards per pod:**
- Member count and new members this week
- Active discussions (last 7 days)
- Shared projects count
- Pending approvals badge

### Pending Approvals Queue

- Content type icon
- Author name and trust score
- Content preview
- Approve/Reject buttons
- Rejection can include feedback

### Flagged Content Alerts

When AI flags trusted student's content:
- Notification badge
- Separate "Review Flagged" section
- Options: Approve anyway, Remove and warn, Remove and reduce trust

### Activity Feed

- Timeline across all pods
- Filterable by pod
- Loose awareness without micromanaging

## Implementation

### New Files

```
src/components/
  PodWorkspace.tsx          # Main workspace with tabs
  PodProjects.tsx           # Shared projects grid
  PodDiscussions.tsx        # Discussion list and thread view
  PodActivity.tsx           # Activity timeline
  ProjectCollaborators.tsx  # Collaborator management
  RevisionHistory.tsx       # Version history viewer
  ContentApprovalQueue.tsx  # Teacher review queue

src/lib/services/
  collaborationService.ts   # Shared project CRUD
  discussionService.ts      # Threads and replies
  trustService.ts           # Score calculation
  revisionService.ts        # Save/restore revisions

src/app/api/
  pods/[podId]/projects/    # Shared project endpoints
  pods/[podId]/discussions/ # Discussion endpoints
  pods/[podId]/activity/    # Activity feed endpoint
  content/approve/          # Approval endpoint
  content/flag/             # Flagging endpoint

supabase/migrations/
  35_pod_workspaces.sql     # New tables and RLS policies
```

### Modifications to Existing

- `projects` table: add `pod_id` column
- `PeerLearningHub.tsx`: wire up "Enter Workspace" button
- `TeacherClient.tsx`: add Pod Activity section

### Build Order

1. Database migration (tables, RLS policies)
2. Core services (collaboration, revisions, trust)
3. Pod workspace UI shell
4. Shared projects feature
5. Discussions feature
6. Teacher oversight dashboard
