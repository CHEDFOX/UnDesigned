# Design approach: Humanist Minimal

**Very few marks, each one made by a human hand.** Warm, plain and calm: one idea, lots of space, imperfect lines on flat paper.

This is the approach every UnDesigned piece follows. The other foundations supply the materials: colour comes from the colour system, words from the messaging playbook, and type and layout will follow this approach once they're built. The look comes from the references in `assets/references/illustration/`.

## Principles

| | Principle | Rule |
|---|---|---|
| H1 | The human hand | Every mark looks made by a person: ink lines with a slight wobble, shapes cut with scissors. Nothing looks generated, glossy or machine-perfect. |
| H2 | Few marks | Minimal means fewer things, not thinner things. If a line, shape or word can go, it goes. |
| H3 | One idea | Each piece says one thing, usually by joining two everyday symbols into a metaphor (molecule on a column, apple on a book, sound wave in a speech bubble). |
| H4 | Space is content | One focal point and generous empty ground, at least 40% of the area. Centre it, or push it to one side to make room for words. |
| H5 | Flat and honest | Flat colour from one Wada combination, black ink and white paper. No gradients, shadows, glows or 3D. The only tone is printed halftone dots. |
| H6 | Plain symbols | Hands, eyes, books, suns, globes, columns, speech bubbles: things anyone recognises in a second. |
| H7 | Warm, not cute | Friendly and a little playful, never childish. Wit comes from the idea, not decoration. |
| H8 | Gentle motion | Things are drawn on, pop in, blink or radiate in short loops, and always settle on a still frame. |

H3 matches the messaging rule W1 (say one thing). H5 is why illustrations take their colours from the colour system rather than having colours of their own.

## Across every layer

| Layer | Do | Don't |
|---|---|---|
| Colour | One Wada combination per piece: its background as the ground, its accent on at most one object. Ink is Black, paper is White. | Mix combinations in one piece, add gradients, tint the ink. |
| Typography | Humanist typefaces: open, warm, very readable. Sentence case, few sizes, few weights. The hand lives in the illustration, not the type. | Handwriting or "marker" fonts, decorative display faces, many weights. |
| Layout | A simple grid, wide margins, one focal point, text aligned to one edge. Illustration and headline work as a pair. | Filling every corner, boxes around everything, centred paragraphs. |
| Illustration | Ink line over cut-paper shapes on a flat ground. One motif per piece. | Stock icons, perfect geometric vectors, detailed scenes. |
| Motion | Draw-on lines, popping shapes, small character beats; loops of 2–4 seconds. | Long sequences, camera moves, fading the whole artwork, bouncy text. |
| Photography | Natural light, real people and hands, uncluttered backgrounds; cut-out photos on a flat ground. | Glossy stock, heavy filters, busy scenes. |
| Copy | Plain, warm, short, to one person (see the messaging playbook). | Jargon, hype, exclamation marks. |

## Illustration

Three ingredients, always in this stacking order:

1. **Ground:** the background colour of the chosen Wada combination, flat.
2. **Paper:** shapes cut from Wada White with straight facets (scissors, not compasses), sitting slightly off the line. One object may be cut from the combination's accent colour instead.
3. **Ink:** Wada Black line on top. Thick, even marker weight (about 2.25% of the artboard), round ends, a slight wobble. Ink dots mark joints and ends. Halftone dots are the only shading.

### Drawing it in code

`dist/web/js/illustration.mjs` draws the style as SVG, in the browser or in Node:

```js
import { scene, paletteFor, palettes, illustrator } from './dist/web/js/illustration.mjs';

scene({ motif: 'sun' });                                  // animated, brand palette
scene({ motif: 'apple-book', animate: false });           // still
scene({ motif: 'eye', palette: paletteFor(42, 'dark') }); // any Wada combination
illustrator.inkLine([[40, 200], [360, 200]]);             // path data for your own drawings
illustrator.cutPaper(200, 200, 80, 80);                   // a faceted paper disc
```

The motifs are `sun`, `sound-bubble`, `eye`, `apple-book` and `molecule-column`. Each is built from the same primitives (`inkLine`, `cutPaper`, `cutPaperPolygon`), so new motifs follow the style automatically. Add them in `foundations/approach/illustration.mjs`.

Ready-made files in the primary brand palette are in `dist/illustration/svg/`: a still and an animated version of each motif. They open in a browser, Figma or Illustrator; the animated ones play in browsers.

The code versions follow the references but aren't hand-drawn. For hero pieces, draw by hand (marker on paper, or a textured brush in Procreate or Fresco) and keep to these rules. The library is for quick, consistent everyday use.

## Motion

| Move | Duration | Easing | Use |
|---|---|---|---|
| draw | 600 ms | cubic-bezier(0.65, 0, 0.35, 1) | Ink lines drawing on, start to end |
| pop | 320 ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Paper and accent shapes appearing, small overshoot |
| morph | 450 ms | cubic-bezier(0.65, 0, 0.35, 1) | One object turning into another |
| radiate | 1800 ms loop | cubic-bezier(0.33, 0, 0.67, 1) | Dots growing into rays, travelling outward |
| blink | 220 ms every 2.6 s | | Character beats |
| talk | 900 ms, alternating | ease-in-out | Gentle pulse in a sound wave |
| stagger | 40 ms | | Between items in a sequence |

Timings are read from the reference recordings at 60 fps. For HTML pieces, `dist/web/css/motion.css` provides these as CSS variables (`--ud-motion-draw` …) and classes: `.ud-draw` (needs `pathLength="1"` on the path), `.ud-pop`, `.ud-rise` and `.ud-stagger`. All of them respect reduced-motion settings.

Rules:
- Every animation ends on a still frame that works on its own.
- Lines draw on and paper shapes pop on. Never fade the whole artwork in.
- Loops are seamless and under 4 seconds.

## Files

```
foundations/approach/
├── source/approach.json   principles, layer rules, illustration and motion tokens, references
├── illustration.mjs       the drawing library
└── build.mjs              builds dist/ files from the brand palettes
assets/references/illustration/   the reference stills, recordings and frame strips
```

| Generated | Contents |
|---|---|
| `dist/web/js/illustration.mjs` | The library with the approach data and brand palettes built in |
| `dist/web/css/motion.css` | Motion tokens and classes |
| `dist/illustration/svg/` | Each motif, still and animated, in the primary palette |
| `dist/tokens/approach.json` | Everything as JSON |
