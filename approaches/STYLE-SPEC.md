# Style spec: how to write an approach

Every approach in `approaches/<id>/` must follow this spec exactly, so designers, Claude and the build can read any style the same way. `humanist-minimal/` is the reference implementation: copy its structure and depth.

## Files

| File | Required | Contents |
|---|---|---|
| `README.md` | yes | One-page overview: what it is, when to use it, when not to, a summary of the rules, links to the other files. |
| `research.md` | yes | The dossier. Sections: 1 Definition (and the two failure modes either side), 2 Lineage (tables: who / when / what we take), 3 Why it works (evidence, linked to `foundations/research/visual-preference.json` findings by id, honest about where the style *goes against* the evidence and why that can still be right), 4 What it is and isn't (table), 5 Risks and guards, 6 Scorecard (10 items, 0-2 each, pass mark), 7 Sources (full citations with URLs). Every factual claim has a source; rules of thumb are labelled as such. |
| `approach.json` | yes | `name`, `summary`, `status` (`"complete"` with an engine, `"profile"` without), `principles` (6-8 items: `id` (2-3 letter prefix + number), `title`, `rule`, `source`), `layers` (exactly: Colour, Typography, Layout, Illustration, Motion, Photography, Copy; each `do` and `dont`), `evidence` (see below), `references` (array, may be empty). |
| `art.json` | yes | Same top-level keys as humanist-minimal where they apply: `line`, `shape`, `corners`, `composition`, `palette`, `texture`, `vocabulary` (`symbols` with meanings, `avoid` with reasons), `metaphor` or an equivalent `method`, `checklist`. Numbers relative to a 400 x 400 artboard or as percentages. Add style-specific keys as needed (e.g. `grid`, `collage`, `pattern`, `posterize`). |
| `motion.json` | yes | `character`, `springs` (same schema: stiffness, damping, mass, use), `easings` (`css` cubic-bezier + use), `moves` (named moves with duration or spring, use), `durations`, `choreography` (order, stagger, loop), `rules`. |
| `typography.json` | yes | `character`, `anatomy` (what to look for), `fit` (a rating for **every** pairing id in `foundations/typography/source/pairings.json`: `core` / `good` / `accent` / `avoid`, with `why`), `newPairings` (0-3 pairings in the exact schema of pairings.json, **Google Fonts only**, designer credits verified), `typeWithArt`, `sizes.byFormat` (same format ids as humanist-minimal), `setting`, `rules`. |
| `sample.mjs` | yes | `export function samplePoster(palette, copy)` returning a complete `<svg viewBox="0 0 400 566">` string: a poster that unmistakably shows the style. Pure function, no imports, no external images, deterministic (seeded random only). `palette` = `{ ground, ink, paper, accent, support: [hex...] }`; use only those colours (plus black/white via ink/paper). `copy` = `{ headline, subhead, brand }`. Use `<text>` with the style's display font family first in the stack and a generic fallback. Keep it under ~250 lines. |

## The `evidence` block (approach.json)

Scores 0-2 on the seven criteria in `foundations/research/visual-preference.json` → `criteria` (`curves`, `simplicity`, `maya`, `nature`, `handmade`, `colour`, `glance`), plus `notes` explaining each score in one line, plus `beyondPreference`: what the style wins that liking scores miss (attention, memorability, distinctiveness, cultural meaning), with sources.

## Colour

Colours always come from the colour system (Sanzo Wada's combinations). An approach says *how* colour is used, never which hex values. `art.json` → `palette` must include:

- `roles` with area shares, as in humanist-minimal
- `method`: how to choose a combination for this style
- `recommendedCombinations`: 6-12 Wada combination numbers that suit the style, each with a one-line reason. Pick them from `dist/sample-bakery/tokens/colors.json` (`combinations[].colors`, `roles`); give the colour names too.
- `extensions` (optional): only if the style genuinely cannot work within Wada (e.g. fluorescent inks), say exactly what is needed, and mark it `"needsApproval": true`.

## Quality bar

- Research with web search; verify names, dates and credits. Prefer primary sources, museums, publishers and peer-reviewed work. No invented quotes.
- Be specific and measurable: ratios, counts, sizes, angles, durations.
- Write plainly; no hype.
- Respect cultures: for styles rooted in a living tradition, name the communities and makers, explain context, and add rules against caricature or appropriation.
