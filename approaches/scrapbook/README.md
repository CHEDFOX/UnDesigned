# Design approach: Scrapbook

> Full data lives beside this file: [research.md](research.md) (the dossier and sources), [approach.json](approach.json) (principles, layer rules, evidence scores), [art.json](art.json) (edges, layers, rotation, overlap, tape, shadows, palette ratios, ephemera vocabulary, method), [motion.json](motion.json) (stop-motion moves and timings), [typography.json](typography.json) (type direction, fit for each pairing, new pairings, ransom-note and handwriting limits) and [sample.mjs](sample.mjs) (a sample poster in code). The structure every approach follows is in [../STYLE-SPEC.md](../STYLE-SPEC.md).

**A page made from things people keep.** Torn paper, tape, stickers, stamps, bordered photos and ticket stubs, layered with small rotations and overlaps, with one hero item and one short handwritten mark.

Status: `profile` (rules and a sample poster; no drawing engine yet).

## When to use it

- Products about memories, events, places, making or collecting: bakeries and cafés, travel, music and festivals, stationery, gifts, schools, local shops, community projects.
- Campaigns that need to feel personal and made by people, and to be remembered in a busy feed.
- Audiences who make collages themselves (journaling, zines, social posts).

## When not to use it

- Text-heavy or data-heavy work (reports, dashboards, forms): collage adds noise around content people need to read.
- Products that must feel precise, clinical or high-security (banking apps, medical devices).
- Very small formats where 4 items cannot fit (favicons, app icons). Use the `single` placement (one taped item and one note) or another approach.

## Principles

| | Principle | Rule |
|---|---|---|
| SB1 | Kept things | Build from ephemera a person would really keep: bordered photo, ticket, label, stamp, sticker, scrap of paper. |
| SB2 | One hero on top | One hero item at 30–45% of the canvas; every other item at most half its size; 4–7 items plus tape. |
| SB3 | A reading path | Headline (top 35%) → hero → message → brand. Brand beside the headline. |
| SB4 | Stuck down, slightly askew | Rotations −8 to +8 degrees (text strips −2 to +2); 5–25% overlap; every item visibly fixed. |
| SB5 | Cut, torn, honest | Torn, cut and die-cut edges; flat offset shadows only; tape is the only translucent material. |
| SB6 | Ransom type as a spice | Mixed cut-out letters on one headline word at most; everything else in the pairing. |
| SB7 | A person was here | One hand mark (arrow, circle, underline or a note of six words or fewer) pointing at the hero or the message. |
| SB8 | Paper physics | Pieces drop, settle and get taped, in stop-motion steps (12 poses a second), one at a time. |

## Across every layer

| Layer | Do | Don't |
|---|---|---|
| Colour | One Wada combination: its bg as the page (kraft, cream, buff, grey), paper in White, ink in Black, accent on two small items at most, support colours for tape, tickets and photo content. | Mixed combinations, gradients, blurred shadows, glows. |
| Typography | The pairing for headline and body, the mono for labels and tickets, all text on paper strips. Ransom letters on one word; one handwritten note. | Ransom-note body copy, handwriting for headlines or calls to action, text on busy collage. |
| Layout | 3–5 layers, one hero, 5–25% overlaps, at least 25% visible ground, a Z or column reading path. | Filling every corner, more than 7 items, text covered by other items. |
| Illustration | Ephemera drawn flat: bordered photos, torn sheets, tape, die-cut stickers, rubber stamps, tickets, halftone for print. | 3D paper, photo-real textures, stock scrapbook kits, clip-art stickers. |
| Motion | Drop, slap, tape, stamp and scribble in steps(n), one item at a time, under 3 s, ending still. | Smooth floating, parallax, everything jittering. |
| Photography | Real candid photos with a white border or cut out, one or two per piece, taped down. | Glossy stock, fake-aged filters, more than two photos. |
| Copy | Plain and personal, like a note in a friend's album; real facts on tickets and labels. | Exclamation marks, borrowed subculture slang, invented dates or numbers. |

## Evidence in one line

Strong on **handmade** and **familiar-with-a-twist**, partly on **natural roughness**; it goes **against** the low-complexity and curvature findings. The guard rails (one hero, 7 items, 25% ground, text on paper) pull complexity back to moderate. What it wins beyond liking: **memorability** (Borkin et al., 2013; Bateman et al., 2010), **distinctiveness** (von Restorff, 1933) and **warmth**. Scores and reasons are in `approach.json` → `evidence`; the argument is in [research.md](research.md) section 3.

| curves | simplicity | maya | nature | handmade | colour | glance |
|---|---|---|---|---|---|---|
| 0 | 1 | 2 | 1 | 2 | 1 | 1 |

## Colour

Choose a combination whose light-mode bg looks like a page (cream, buff, kraft, pale yellow, pale pink or newsprint grey), with `inkUse: "body"`, and one saturated colour for the accent. Recommended: 190, 154, 313, 221, 151, 243, 275, 166, 276, 303 (reasons in `art.json` → `palette.recommendedCombinations`).

## Type

Core pairings: `bricolage-figtree` and `schibsted`. New Google Fonts pairings proposed in `typography.json`:

| id | Display | Body | Mono |
|---|---|---|---|
| `archivo-courier` (Cut and Paste) | Archivo 800–900 (Omnibus-Type) | Archivo 400–500 | Courier Prime (Alan Dague-Greene) |
| `anton-worksans` (Zine) | Anton (Vernon Adams) | Work Sans (Wei Huang) | Special Elite (Astigmatic, Apache 2.0) |
| `dmserif-dmsans` (Clippings) | DM Serif Display (Colophon) | DM Sans (Colophon) | DM Mono (Colophon) |

Optional accent for one handwritten note: Caveat (Impallari Type) or Permanent Marker (Font Diner), six words at most.

## Sample

```js
import { samplePoster } from './approaches/scrapbook/sample.mjs';
const svg = samplePoster(
  { ground: '#f5ecc2', ink: '#111314', paper: '#ffffff', accent: '#e31f26', support: ['#fff200', '#006eb8'] },
  { headline: 'Kept, cut and pasted', subhead: 'A poster in the scrapbook manner', brand: 'UnDesigned' }
);
```

The poster shows the method: a torn grid-paper sheet at the back, a taped instant photo as the hero, the first headline word as ransom-note tiles and the rest on torn newsprint strips, a die-cut brand sticker beside the headline, a typed label, a ticket stub, a postmark and one hand-drawn arrow. It is deterministic (seeded by the copy) and uses only the palette passed in.

## Scorecard

Ten checks, 0–2 each, 16 of 20 to pass: see [research.md](research.md) section 6.
