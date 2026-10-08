# Design approach: Desi Maximalism

> Full data lives beside this file: [research.md](research.md) (the dossier and sources), [art.json](art.json) (borders, pattern, symmetry, palette ratios and Wada combinations, ornament vocabulary, hierarchy guards), [motion.json](motion.json) (springs, timings, choreography), [typography.json](typography.json) (type direction, Latin and Indic scripts, fit for each pairing, sizes per format) and [sample.mjs](sample.mjs) (a sample poster in code). The structure every approach follows is in [../STYLE-SPEC.md](../STYLE-SPEC.md).

**More is more, in order.** Frames inside frames, pattern on every free surface, many flat colours, ornament with meaning and bold painted lettering, organised by symmetry so one message still reads first.

The grammar comes from South Asian popular visual culture: Pakistani and Indian truck art, hand-painted cinema posters and shop signs, matchbox labels, calendar prints, Sanganer and Bagru block printing, Kutch mirror work, and kolam and rangoli geometry. These are living crafts with named communities and makers. This style borrows their structure and spirit, credits them, and keeps away from their sacred content.

A product chooses it in `products/<product>/brand.json` (`"approach": "desi-maximalism"`). Status: **profile** (rules, data and a sample; no illustration engine yet).

## When to use it

- Celebrations, launches, festivals of food, music, fashion and film; anything that should feel generous and energetic.
- Products made by, or for, South Asian communities at home and in the diaspora, ideally with people from those communities on the team.
- Brands that need to stand out in a feed of minimal layouts and can keep a consistent border and medallion as recognisable assets.

## When not to use it

- Calm, high-trust or high-stakes services (health, finance, legal, crisis support): the style raises arousal and lowers first-glance liking on average (research.md 3).
- Interfaces people use for long periods; use the style for campaign pieces and keep the product UI quiet.
- Religious or festival-specific work, unless people from that community lead it.
- When nobody can check the scripts or the cultural references.

## Principles

| | Principle | Rule |
|---|---|---|
| DM1 | Abundance with order | Fill the surface in three zones (border, field, centre). Pattern covers 45-70% of the area; nothing floats loose. |
| DM2 | Frames within frames | 3-5 nested border bands (solid band, bead chain, scallops, fine rules), 8-14% of the short side; corners covered by rosettes. |
| DM3 | Symmetry is the skeleton | Mirror about the vertical axis, or radial (8/12/16/32-fold). Only the message may break it. |
| DM4 | The message still wins | Headline in a quiet, framed, pattern-free cartouche; 4.5:1 contrast; one focal element; pattern keeps clear. |
| DM5 | Many colours, one system | One Wada combination, at most one bridge combination that shares a colour, Black ink and White paper. Flat colour only. |
| DM6 | Ornament that means something | Motifs from the vocabulary (flowers, leaves, paisley, birds, mirrors, garlands), chosen for the message. |
| DM7 | Named hands, respected sources | Name the craft and place, credit and commission artisans; no deities, religious symbols or ritual designs as decoration; no caricature. |
| DM8 | Celebrate, then settle | Rings turn in, garlands swing, mirrors glint; one loop at a time, 2-4 s, ends still; no flashing above 3 per second. |

## Across every layer

| Layer | Do | Don't |
|---|---|---|
| Colour | Base Wada combination + optional bridge combination + ink + paper. Accent dominates one band or ring; every colour repeats at least 3 times, symmetrically. | Off-palette hex, gradients, glows, neon, metallics, a third combination. |
| Typography | Bold or high-contrast display with a flat drop line, in a cartouche. Latin and Indic scripts from families designed together, checked by a fluent reader. | Fake "Indian" Latin fonts, script as texture, machine translation. |
| Layout | Border, field, centre. One medallion or image plus a framed headline and a brand plate. | Loose elements, pattern under text, several focal points. |
| Illustration | Flat painted shapes with an even ink outline, built into rings, borders and half-drop repeats. | Deities, places of worship, exotic clip art, 3D. |
| Motion | Outside-in reveal, then the headline; one loop (garland sway, mirror glint or ring drift). | Continuous spinning, strobing, many loops, moving text. |
| Photography | Real people, places and products from the community, inside a decorated frame; credited. | Stock "exotic" clichés, costumes, worshippers as decoration. |
| Copy | Warm, generous, specific; the audience's own languages when a fluent writer provides them. | Mock accents, borrowed truck slogans, religious greetings used to sell. |

## Colour: a rich look from Wada's 3-4 colour combinations

Wada's combinations have 2-4 colours; this style needs 6-7. It gets there without leaving the system:

1. **Base combination** (from the 10 recommended in `art.json` → `palette`, e.g. 154 Carmine / Yellow / Blue).
2. **Bridge combination**: one more combination that shares at least one colour with the base (e.g. 313 Carmine / Yellow / Diamine Green / Black). The shared colour ties the two together.
3. **Ink and paper**: Wada Black and Wada White, used for outlines, beads and mirror discs.
4. **Kin colour** (optional, 5% or less): one more Wada colour from the same family as a base colour.

Recommended: 154, 313, 164, 170, 247, 155, 266, 122, 314, 257 (reasons and bridge pairs in `art.json`).

## The anatomy of a piece

```
┌ outer band with bead chain ──────────────────────┐
│ ┌ scallop edge, keyline, dotted rule ──────────┐ │
│ │  toran (garland)                             │ │
│ │     ·  ·   ╭── medallion ──╮   ·  ·  field   │ │
│ │   ·  ·     │ rings, mirrors │     ·  · (buti) │ │
│ │     ·  ·   ╰───────────────╯   ·  ·          │ │
│ │   ╭──────── headline cartouche ─────────╮    │ │
│ │   │  Headline                           │    │ │
│ │   │  subhead                            │    │ │
│ │   ╰─────────────────────────────────────╯    │ │
│ │    ▼▼▼▼▼▼ jhalar fringe                     │ │
│ │          paisley ( brand plate ) paisley     │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

## Drawing it in code

`sample.mjs` draws a poster in this style as an SVG string, in the browser or in Node:

```js
import { samplePoster } from './approaches/desi-maximalism/sample.mjs';

samplePoster(
  { ground: '#…', ink: '#…', paper: '#…', accent: '#…', support: ['#…', '#…'] }, // from the product's Wada palette
  { headline: 'More is more', subhead: 'One line of support', brand: 'Brand' }
);
```

It is pure and deterministic, uses only the palette passed in, keeps pattern out of the headline's clear zone, fits the headline (shrinking the medallion, never the type below 26 px) and switches outlines on dark grounds. It is a reference, not a production engine: hero pieces should be painted or drawn by artisans in the tradition, credited and paid.

## Motion

| Move | Timing | Use |
|---|---|---|
| border-draw | 700 ms, cubic-bezier(0.22, 1, 0.36, 1) | Frame bands draw on from the corners |
| bead-run | 600 ms, 12 ms stagger | Beads and scallops pop along the border |
| mandala-reveal | spring (k 60, c 15), 90 ms stagger | Rings appear centre-out, rotating from ±30° into place |
| tile-in | 500 ms, 20 ms stagger | Field pattern pops in row by row from the centre line |
| garland-drop / sway | spring (k 80, c 9, m 1.2); 3.2 s loop, ±2° | Toran drops and swings, then sways |
| mirror-glint | 360 ms every 2.4 s | A glint crosses one mirror disc at a time |
| headline-rise | spring (k 140, c 22) | Headline rises last and stays still |

Full data in [motion.json](motion.json).

## Scorecard

Ten items, 0-2 each; 16 of 20 to pass, and "abundance has structure" and "cultural respect" must both score 2. See [research.md](research.md) section 6.

## Evidence in one line

It goes against the low-complexity finding on purpose; it wins attention, arousal, distinctiveness and cultural meaning, but only when the complexity is organised (Pieters, Wedel & Batra, 2010). Scores and notes are in `approach.json` → `evidence`.
