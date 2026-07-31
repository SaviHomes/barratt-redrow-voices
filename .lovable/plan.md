## Plan: Update "View All Evidence" Homepage Button

### Overview
On the homepage, the "View All Evidence" call-to-action button currently navigates to `/public-gallery`. Change it so it takes the user to the specific evidence detail URL requested.

### Changes

**File: `src/pages/Index.tsx`**
- Update the `href` of the "View All Evidence" button (around line 293) from `/public-gallery` to `https://www.redrowexposed.co.uk/evidence/09a9b3d9-063f-4c58-8fa8-e1e55f8598fd`.
- Keep the existing button styling, size, and arrow icon unchanged.

### Verification
- After the change, clicking the homepage "View All Evidence" button will open the requested external evidence detail URL in the same tab (or navigate the router if the domain is the same origin).
