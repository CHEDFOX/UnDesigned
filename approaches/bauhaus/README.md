# Design approach: Bauhaus

> Full data lives beside this file: [research.md](research.md) (the dossier and sources), [art.json](art.json) (grid, angles, elementary forms, bar weights, palette ratios, vocabulary, construction method), [motion.json](motion.json) (crisp springs, axis moves, choreography), [typography.json](typography.json) (type direction, fit for each pairing, new pairings, sizes per format) and [sample.mjs](sample.mjs) (a sample poster). The structure every approach follows is in [../STYLE-SPEC.md](../STYLE-SPEC.md).

**Construction, not decoration.** Circle, square and triangle, heavy bars and one diagonal, set on a grid with bold sans-serif type. Black and white plus one strong primary, flat. Asymmetric, precise, read at a glance.

The graphic language of the German school (Weimar 1919, Dessau 1925, Berlin 1932–33) and the New Typography around it: Joost Schmidt's 1923 exhibition poster, Moholy-Nagy's typophoto and the Bauhaus books, Herbert Bayer's universal alphabet and banknotes, Albers's and Kandinsky's colour teaching. A product chooses it in `products/<product>/brand.json` (`"approach": "bauhaus"`). Status: **profile** (full data and a sample poster, no drawing engine yet).

## When to use it

- Architecture, furniture, engineering, design studios, galleries, education, culture.
- Products whose promise is clarity, structure or "well made".
- Event posters and campaigns that must stand out from soft, rounded competitors.

## When not to

- Care, health, children, food and anything that must feel soft and personal first: the style goes against the curvature and handmade findings (research.md 3). Humanist Minimal fits better.
- Products that can't live up to "rational and well made": the look promises precision.
- Pieces that need many images or a story in several parts.

## Principles

| | Principle | Rule |
|---|---|---|
| BH1 | Clarity first | Every element serves the message; nothing is ornament. |
| BH2 | Elementary forms | Circle, square, triangle, bar (plus half and quarter circles). Exact, flat, no outline. At most five forms. |
| BH3 | Few, strong colours | Black, white and one Wada combination with a strong primary. Primary on the focal form; a second primary at most 10%. |
| BH4 | Asymmetric balance | Focal form on a third or bleeding off an edge; type on the opposite side. Never centred. |
| BH5 | One diagonal | Edges at 0° and 90°, plus one 45° axis per piece. |
| BH6 | Bars and rules build the page | Three weights only: 4%, 2% and 0.75% of the short side. |
| BH7 | Type as structure | Bold geometric or grotesque sans, large, left-aligned, may run up an edge. Sentence case or all lowercase. |
| BH8 | Machine precision | Exact geometry; motion slides on an axis or turns by 90°, never bounces. |

## Across every layer

| Layer | Do | Don't |
|---|---|---|
| Colour | One Wada combination with a strong primary, plus black and white. Accent on the focal form only. | Pastels, gradients, equal amounts of red, yellow and blue. |
| Typography | Geometric or grotesque sans, bold headline, three sizes, left-aligned. | Serifs, scripts, rounded faces, ITC Bauhaus, centred text. |
| Layout | 8-column grid, 6% margin, asymmetric, square corners, a form meets the edge. | Centred symmetry, rounded cards, boxes around text. |
| Illustration | Constructed from elementary forms, overlapping, flat. Cut-out black-and-white photos. | Hand-drawn lines, blobs, outlines, copies of famous Bauhaus works. |
| Motion | Slide on an axis, wipe a bar, stamp a form, turn 90°. Critically damped. | Bounces, wobbles, morphs, odd-angle spins. |
| Photography | Black-and-white or duotone, high contrast, steep angles, hard crops. | Soft stock, colour filters, rounded masks. |
| Copy | Short, factual, direct, to one person. | "Form follows function", hype, German words as decoration. |

## Colour

Recommended Wada combinations (details in `art.json` → `palette.recommendedCombinations`):

| # | Colours | Use |
|---|---|---|
| 154 | Carmine, Yellow, Blue | The primary triad: yellow ground, blue focal form, carmine type |
| 62 | Yellow, Black | Maximum contrast posters |
| 117 | Carmine, Black | Red and black, white type |
| 221 | Carmine Red, Neutral Gray, Black | Restrained and very readable |
| 313 | Carmine, Yellow, Diamine Green, Black | Yellow ground, carmine focal form |
| 22 | Yellow, Deep Lyons Blue | Yellow and deep blue |
| 52 | Sulpher Yellow, Black | Cream "book paper" calm |
| 104 | Carmine Red, Sulpher Yellow | Red on cream |
| 39 | Carmine, Helvetia Blue | Red and blue, white type |
| 164 | Red Orange, Orange Yellow, Violet | A warmer shifted triad |

Area shares: ground 45–65%, accent 10–25% (one form), black 10–25%, support 10% or less.

## Construction in seven steps

1. Write the one message (W1).
2. Pick the one form that carries it; make it 45–75% of the short side.
3. Decide the diagonal (or none).
4. Place the form on a third or bleeding off an edge; headline in the opposite field.
5. Link them with a bar or an overlap.
6. Accent on the focal form, black on bars and type.
7. Squint: only the form and the headline should remain.

## Motion

| Move | Timing | Easing | Use |
|---|---|---|---|
| draw | 400 ms | cubic-bezier(0.7, 0, 0.2, 1) | A bar wipes on along its axis |
| pop | spring `snap` (~360 ms) | critically damped | A form stamps in, no overshoot |
| rise | spring `machine` (~470 ms) | critically damped | Text slides up onto the baseline |
| slide | spring `machine` | critically damped | A form travels whole grid modules on one axis |
| turn | 450 ms | crisp | A form turns exactly 90° |
| rotate | 4000 ms loop | linear | A circle turns once; the only free rotation |
| cycle | 2400 ms loop | steps(4) | Accent cycles through the combination in hard cuts |

Sequential, like an assembly line: each step starts when the last has locked in place. Loops of 2–4 s end on the finished composition. Reduced motion shows the final frame.

## Sample poster

`sample.mjs` exports `samplePoster(palette, copy)`, which returns a 400 × 566 SVG: a focal circle in the accent bleeding off the right edge, a black square behind it, a right-angled triangle and a heavy bar on the 45° diagonal, a masthead bar, and the headline, rule, subhead and brand on an 8-column grid. It adapts to dark grounds and long headlines.

## Files

```
approaches/bauhaus/
├── README.md          this overview
├── research.md        definition, lineage, evidence, is / isn't, risks, scorecard, sources
├── approach.json      principles, layer rules, evidence scores
├── art.json           grid, angles, forms, bars, palette, photomontage, vocabulary, method
├── motion.json        springs, easings, moves, choreography
├── typography.json    type direction, pairing fit, new pairings, sizes
└── sample.mjs         sample poster generator
```
