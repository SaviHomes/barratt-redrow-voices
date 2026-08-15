# Plan: Add Hazel Park notice to homepage announcement popup

## What we're building
Add a new section to the top of the homepage announcement popup (`AnnouncementDialog`) above the existing "Important Notice" section. The section will explain that the site creator is basing their experience on the Hazel Park development in Stevenage and invite anyone thinking of buying there to get in touch for an honest view.

## Why
The homepage popup is the first thing visitors see. A clear, upfront personal note about the creator's direct experience at Hazel Park adds credibility and helps potential buyers on that development reach out.

## Changes to make

### `src/components/AnnouncementDialog.tsx`
Insert a new section between the existing "New Content Incoming" banner and the "Important Notice" section. Use the following structure:

- **Heading:** "Hazel Park, Stevenage" with a `MapPin` icon from `lucide-react` to match the existing iconography.
- **Body text:** A short paragraph written in first person, explaining the site creator is basing their experience on the Hazel Park development in Stevenage and encouraging anyone considering buying there to contact them for an honest view.
- **Call to action:** A small `Button` linking to the existing `/contact` page. Clicking the link should also dismiss the popup, using the same `handleDismiss` pattern used by the "View News Articles" button inside the dialog.
- **Visual treatment:** Use a `Card`-style container with a subtle blue/info accent (`text-blue-600 dark:text-blue-400` and matching icon color) so it is distinct from the red/destructive "Important Notice" section and the amber "What's Coming" section.

### Content
Suggested copy (to be confirmed in build):
> "The experiences shared on this site are drawn from my own journey as a homeowner on the Hazel Park development in Stevenage. If you are considering buying a property there and would like an honest, first-hand view of what life on the development has been like, please get in touch."

## Acceptance criteria
- The new section appears above "Important Notice" inside the popup.
- The heading reads "Hazel Park, Stevenage".
- A link to the `/contact` page is included and dismisses the popup when clicked.
- The section uses the existing `Link`/`Button`/`lucide-react` patterns and matches the dialog's visual language.
- No other popup sections are removed or reordered.
