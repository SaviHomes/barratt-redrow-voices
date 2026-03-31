

## Plan: Add "View More Images" and "View Comments" Buttons to EvidencePreviewCard

### Overview
Add two buttons below the description text on each `EvidencePreviewCard` that link to the evidence detail page — one scrolling to images, one to comments.

### Changes

**File:** `src/components/evidence/EvidencePreviewCard.tsx`

- Import `Link` from `react-router-dom`, `Button` from `@/components/ui/button`, and `ImageIcon`/`MessageSquare` icons (already imported)
- Add a row of two buttons below the description paragraph:
  - **"View More Images"** — links to `/evidence/{id}` (where the photos section lives)
  - **"View Comments"** — links to `/evidence/{id}#comments` (scrolls to comments section)
- Both buttons use `e.stopPropagation()` to prevent triggering the card's `onClick`
- Use `variant="outline"` with small size for a clean look

**File:** `src/pages/EvidenceDetail.tsx`

- Add `id="comments"` to the `CommentsSection` wrapper so the `#comments` hash link scrolls to it

### Technical Details
- Buttons are rendered as `Link` components via `asChild` on `Button`
- `stopPropagation` ensures clicking buttons doesn't also navigate via the card's `onClick`
- The `#comments` anchor uses a simple `id` attribute on the comments section div

