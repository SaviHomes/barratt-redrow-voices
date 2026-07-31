# Plan: Show development location in homepage evidence title

## Goal
Make it clear on the Homepage that the featured evidence post "Major Creaking Floor Issue & Over 170 Other Issues" relates to the **Hazel Park development in Stevenage**, by adding the location as part of the card title.

## Implementation approach

### 1. Database migration
Add a `development_name` column to the `public.evidence` table so evidence submissions can store a structured location (e.g., "Hazel Park, Stevenage").

### 2. Data update
Backfill `development_name` for the existing evidence record `09a9b3d9-063f-4c58-8fa8-e1e55f8598fd` with the value **"Hazel Park, Stevenage"**.

### 3. Frontend type update
Add `development_name` to the `EvidenceWithPhotos` interface in `src/hooks/useEvidencePhotos.tsx`.

### 4. Homepage card title update
Update `src/components/evidence/EvidencePreviewCard.tsx` so that when a `development_name` is present, the title renders as:

```text
{title} — {development_name}
```

For example: "Major Creaking Floor Issue & Over 170 Other Issues — Hazel Park, Stevenage".

This keeps the change scoped to the Homepage preview card and avoids hardcoding anything specific to a single post.

## Verification
After implementation, confirm the Homepage card displays the updated title with the development location visible.
