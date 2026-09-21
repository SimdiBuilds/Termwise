# Termwise design system

Foundation: deep academic navy + a single cool-blue accent on calm, cool neutrals. Learning content is the focus; the interface stays out of the way.

## Tokens (`src/index.css`)
- Navy `navy-900 #141e33` for text, the one dark surface per screen, and brand moments.
- Blue `brand-600 #2b57cc` for the primary action, active states and links. Never for decoration.
- Neutrals: `canvas #f6f8fb`, `surface #fff`, `sunken #eef2f7`, `line #e1e6ef`, text `ink / ink-2 / ink-3`.
- Success / warning / error colours only carry meaning (feedback, mistakes). No decorative use.
- Radius: 6 (chips), 10 (controls), 14 (panels). Shadow only on menus and dialogs.
- Type: Figtree (self-hosted via `@fontsource-variable/figtree`, no external requests), weights 400 / 500 / 600.
  Scale: `t-display` 32, `t-title` 24, `t-h2` 18, `t-body` 15, `t-small` 13, `t-micro` 12.

## Rules
- One primary button per view. Secondary = outlined, tertiary = text.
- Structure comes from spacing, hairlines and type, not boxes. A container must mean a real grouping.
- No emoji, no "AI" labels, no gradients except the logo.
- Icons: `lucide-react` only.
- Motion: 150-250 ms, `cubic-bezier(0.2, 0, 0, 1)`, no bounce. It marks state changes (page change, task done, feedback, dialog).
  `MotionConfig reducedMotion="user"` plus a CSS media query honour reduced-motion preferences.

## Layout
- >= 1024 px: 248 px sidebar. 768-1023 px: 76 px icon rail. < 768 px: top bar with logo, bottom tab bar, "More" sheet.
- Reading column for lessons is 720 px with a 68 ch measure.

## Components (`src/components/ui`)
`Button`, `Field / Input / Textarea / Select / SearchInput / Toggle / FileDrop`, `Dialog / ConfirmDialog / RowMenu`,
`Notice / EmptyState / Skeleton / PageHeader / Meter / MasteryRing / Collapse / Segmented / BuildProgress`.
Shared learning pieces live in `src/components/learning` (`QuestionBlock`, `FeedbackPanel`).

## Brand assets
`public/` holds the favicon, apple-touch icon, social image and full logo. `src/components/brand/logoPaths.ts` is the logo traced to vector
from the supplied PNG. Supply a vector master when you have one and regenerate that file for sharper large-size edges.
