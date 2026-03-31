

## Plan: Add Comment Counts to Evidence Cards + Recent Comments Section on Public Gallery

### Overview
Two additions: (1) show approved comment count badges on `EvidencePreviewCard` components, and (2) add a "Recent Comments" section to the Public Gallery page showing the latest approved comments with links to their evidence posts.

### 1. Add Comment Count Badge to EvidencePreviewCard

**File:** `src/components/evidence/EvidencePreviewCard.tsx`

- Import `MessageSquare` icon from lucide-react
- Accept an optional `commentCount` prop
- Add a comment count badge in the badges row (next to photo count), showing `MessageSquare` icon + count

### 2. Fetch Comment Counts in Public Gallery

**File:** `src/pages/PublicGallery.tsx`

- After fetching evidence, query `evidence_comments` table to get counts of approved comments grouped by `evidence_id`
- Pass `commentCount` prop to each `EvidencePreviewCard`

### 3. Fetch Comment Counts on Homepage

**File:** `src/pages/Index.tsx`

- Same approach as Public Gallery — fetch approved comment counts for the 3 recent evidence items and pass to `EvidencePreviewCard`

### 4. Add "Recent Comments" Section to Public Gallery

**File:** `src/pages/PublicGallery.tsx`

- Add a section below the gallery grid showing the 5 most recent approved comments
- Each comment displays: commenter name, truncated comment text, evidence title as a link to `/evidence/:id`, and relative timestamp
- Query `evidence_comments` joined with evidence title (via separate query since no FK), filtered by `moderation_status = 'approved'` and evidence `is_public = true`

### Technical Details

- Comment counts query: `SELECT evidence_id, COUNT(*) FROM evidence_comments WHERE moderation_status = 'approved' GROUP BY evidence_id` — filtered to only the current evidence IDs
- Recent comments query: fetch latest 5 approved comments, then fetch their evidence titles separately
- No database changes needed — all data already exists with correct RLS policies

