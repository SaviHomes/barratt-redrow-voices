

## Plan: Show Comments in a Popup Dialog

### Overview
Change the "View Comments" button on `EvidencePreviewCard` to open a dialog showing that evidence post's approved comments and a comment form, instead of navigating to the detail page.

### Changes

**File: `src/components/evidence/EvidencePreviewCard.tsx`**
- Add state `showCommentsDialog` (boolean)
- Replace the "View Comments" `Link` button with a regular `Button` that sets `showCommentsDialog = true`
- Import and render `CommentsSection` inside a `Dialog` at the bottom of the component
- The dialog will show the evidence title, the existing `CommentsSection` component (which already handles fetching approved comments + comment form), wrapped in a scrollable container

**No new components needed** — reuses the existing `CommentsSection` from `src/components/comments/CommentsSection.tsx` which already handles:
- Fetching approved comments for an evidence ID
- Displaying the comments list
- Comment submission form with refresh

### Technical Details
- Import `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` from UI components
- `stopPropagation` on the button click to prevent card navigation
- Dialog uses `max-h-[80vh] overflow-y-auto` for scrollable content

