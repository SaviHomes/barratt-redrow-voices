# Plan: Add Facebook group notice to homepage announcement popup

## What we're building
Add a new section directly below the existing "Hazel Park, Stevenage" section in the homepage announcement popup (`AnnouncementDialog`). The section will draw visitors' attention to the independent Facebook group "Don't Buy Redrow" and make it clear that the site is not affiliated with or responsible for that group.

## Why
The popup is the first thing visitors see. A short, prominent pointer to an independent community group can help affected homeowners find peer support, while the disclaimer protects the site from being mistaken for the group's operator.

## Changes to make

### `src/components/AnnouncementDialog.tsx`

Insert a new section between the existing "Hazel Park, Stevenage" section and the divider that precedes the "Important Notice" section.

- **Heading:** "Facebook Group: Don't Buy Redrow" with an icon from `lucide-react` (e.g. `ExternalLink` or `Users`) to match the existing popup iconography.
- **Body text:** A short paragraph that:
  - Points visitors to the "Don't Buy Redrow" Facebook group.
  - Clearly states that the website creator is not affiliated with and not responsible for the group or its content.
- **Call to action:** A small `Button` that:
  - Links to `https://www.facebook.com/share/g/19GHJCV7Qj/?mibextid=wwXIfr`.
  - Opens in a new tab (`target="_blank"` with `rel="noopener noreferrer"`).
  - Dismisses the popup using the existing `handleDismiss` pattern, matching the "View News Articles" and "Get in Touch" buttons.
- **Visual treatment:** Use a `Card`-style container with a distinct accent colour (e.g. `text-sky-600 dark:text-sky-400` or similar) so it is visually separate from the blue Hazel Park section, the red/destructive Important Notice section, and the amber What's Coming section.

## Acceptance criteria
- The new section appears directly below the "Hazel Park, Stevenage" section and above the "Important Notice" section.
- The heading reads "Facebook Group: Don't Buy Redrow".
- The body includes a clear disclaimer that the site is not affiliated with or responsible for the Facebook group.
- The link opens the specified Facebook URL in a new tab and dismisses the popup when clicked.
- The section uses the existing `Button`, icon, and `handleDismiss` patterns and matches the dialog's visual language.
- No other popup sections are removed or reordered.
