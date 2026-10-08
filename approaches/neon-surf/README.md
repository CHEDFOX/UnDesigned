# Design approach: Rad Dog / Neon Surf

> Full data lives beside this file: [research.md](research.md) (the dossier and sources), [approach.json](approach.json) (principles, layer rules, evidence scores), [art.json](art.json) (outline, cartoon shapes, patterns, stickers, diagonals, palette ratios, recommended Wada combinations, the fluorescent extension, vocabulary), [motion.json](motion.json) (bouncy springs, squash and stretch, loops) and [typography.json](typography.json) (type direction, fit for each pairing, three proposed Google Fonts pairings, sizes per format). [sample.mjs](sample.mjs) draws a reference poster. The structure every approach follows is in [../STYLE-SPEC.md](../STYLE-SPEC.md).

**One rad hero, a fat black outline, hot colour on a tilt.** This is the late-1980s and early-1990s surf and skate look: a cartoon dog in shades riding a curling wave, a striped sunset sun, a checkerboard band, a splash of paint and chunky sticker lettering. It is loud and funny, and it is kept readable by strict limits.

"Rad Dog / Neon Surf" is the name of an entry in the Consumer Aesthetics Research Institute (CARI) archive of commercial styles. The name plays on **Rude Dog**, the sunglasses-wearing cartoon dog Brad McMahon drew for Sun Sportswear, which got its own CBS cartoon in 1989. No brand is actually called "Rad Dog". See [research.md](research.md) 1.

Status: **profile** (rules, data and a sample poster; no drawing engine yet).

## When to use it

- Consumer brands that want energy, youth, summer or play: drinks, snacks, apparel, events, surf and skate, games, festivals.
- Campaigns and sub-brands: a "summer" voice next to a calmer core identity.
- Audiences who grew up with 1980s-90s surf, skate and Saturday-morning culture (nostalgia), and younger audiences who read it as plain fun.

## When not to use it

- Health, finance, legal, grief, or anything that must look careful and quiet.
- Luxury and premium calm.
- Text-heavy pieces: the style needs room for a character.
- Anything Hawaiian or Polynesian in subject where the style's history of borrowed "tribal" decoration would offend (research.md 2.5).

## Principles

| | Principle | Rule |
|---|---|---|
| NS1 | One rad hero | One character or object owns the frame (30-45% of the area). Everything else supports it. |
| NS2 | Fat black outline | One heavy ink outline (1.5% of the short side) on everything, plus a hard ink block shadow on type and stickers. |
| NS3 | Hot ground, cold sea | The brightest Wada combinations: hot ground, cool sea colour, black and white. Fluorescent ink only with approval. |
| NS4 | Tilt it | One dominant diagonal: headlines at -4 to -8 degrees, pattern bands at -10 to -15 degrees. At most two angles. |
| NS5 | A small pattern kit | At most two of checkerboard, sunset stripes, Memphis confetti, splatter and spray stipple; at least 25% calm ground. |
| NS6 | Sticker logic | Brand, prices, dates and CTAs on stickers and badges, slightly rotated. The brand sticker sits next to the headline. |
| NS7 | Funny, not dumb | The joke is in the picture; copy is plain and specific. No fake slang, no exclamation marks. |
| NS8 | Bouncy, then still | Springy arrivals, squash and stretch, wiggles and rolling waves; one short VHS jitter at most; loops end on a still frame. |

## Across every layer

| Layer | Do | Don't |
|---|---|---|
| Colour | One bright Wada combination, using all its colours, plus ink and paper. One airbrush fade on the sun or sky, or spray stipple. | Mix combinations, use muddy or pastel-only sets, add glows or blurred shadows, specify fluorescent ink without approval. |
| Typography | Chunky rounded display, big, tilted, outlined, with block shadow. Sentence case; capitals on short stickers. | Thin weights, hairline serifs, handwriting body fonts, chrome effects on text. |
| Layout | One hero, one diagonal, text stacked top-left, art anchored to the bottom, 25% calm ground. | Pattern in every corner, competing angles, text over busy pattern. |
| Illustration | Bold outlined cartoon characters, curling waves, sunset suns, checkerboards, splatter, stipple. | Sketchy lines, realistic shading, tiki and faux-tribal motifs, copied mascots. |
| Motion | Bouncy springs, squash and stretch, rolling loops of 2-3 s. | Constant glitch, strobing, many things moving at once. |
| Photography | Real people surfing and skating, cut out as stickers with a fat white border on a bright ground. | Glossy stock, neon filters over faces, staged retro costumes. |
| Copy | Plain, warm, specific, to one person. | Pastiche slang, hype, exclamation marks. |

## Colour

Default: Wada-only. The recommended combinations are in `art.json` → `palette.recommendedCombinations`:

| No. | Colours | Why |
|---|---|---|
| 240 | Fresh Color, Yellow, Cerulian Blue | The flagship: yellow ground, coral sun, surf-blue sea |
| 21 | Grenadine Pink, Sea Green | The classic 1980s pink and teal |
| 313 | Carmine, Yellow, Diamine Green, Black | Yellow and black sticker energy |
| 62 | Yellow, Black | Stripped-down stickers and small formats |
| 154 | Carmine, Yellow, Blue | Primary skate-deck pop |
| 112 | Grenadine Pink, Black | Loudest cheap two-colour print |
| 144 | Rosolanc Purple, Orange, Black | Dusk and night sessions |
| 340 | Peach Red, Sea Green, Neutral Gray, Black | Hot and teal; dark mode |
| 315 | Grenadine Pink, Sulpher Yellow, Golden Yellow, Eupatorium Purple | Sunset sky, softer |
| 138 | Golden Yellow, Lemon Yellow, Venice Green | Sunniest, tropical aqua |
| 286 | Burnt Sienna, Orange Yellow, Peacock Blue, Violet Blue | Warmer, vintage surf |

Area shares: ground 40-55%, sea 15-30%, paper 8-15%, ink 10-18%, accent 3-10%.

**Extension (needs approval):** true neon needs fluorescent spot inks (Pantone 801-807 basics), because no Wada, CMYK or sRGB colour fluoresces. Screens can only show stand-ins. Use at most two fluorescent spots per print piece, replacing the ground and accent. Proof them physically. Details are in `art.json` → `palette.extensions`.

## Type

Best existing pairings: **nunito** (core), bricolage-figtree and young-onest (good). Proposed new Google Fonts pairings (in `typography.json` → `newPairings`):

| id | Display / body | Use |
|---|---|---|
| `titan-rubik` | Titan One (Rodrigo Fuenzalida) / Rubik (Hubert and Fischer) | The default "surf shop" sign look |
| `shrikhand-rubik` | Shrikhand (Jonny Pinhorn) / Rubik | Curvy italic sticker headlines of five words or fewer |
| `lilita-nunito-sans` | Lilita One (Juan Montoreano) / Nunito Sans | Longer headlines, web and banners |

## Motion

| Move | Timing | Use |
|---|---|---|
| pop | spring bouncy (k 260, c 16) | Characters and splats appearing |
| slap | spring boing (k 380, c 14) | Stickers and headline landing |
| squash | 180 ms, then wobble spring | Landing on the wave or ground |
| wiggle | 600 ms, ±6°, 3 cycles | One "look at me", or an idle CTA |
| rollWave | 2400 ms loop | The wave rolling |
| bob | 1600 ms loop | Rider bobbing |
| vhsJitter | 300 ms, 3 steps, once | Retro accent; never on body text |

## Sample

```js
import { samplePoster } from './approaches/neon-surf/sample.mjs';
samplePoster(
  { ground: '#fff200', ink: '#111314', paper: '#ffffff', accent: '#f37f94', support: ['#00939b', '#e31f26'] },
  { headline: 'Ride the good waves', subhead: 'A poster in the neon surf manner', brand: 'UnDesigned' }
); // -> '<svg viewBox="0 0 400 566">…</svg>'
```

The poster shows a dog in shades surfing a curling wave in front of a striped sunset sun, with a checkerboard band on a -12 degree diagonal, splatter, Memphis confetti, a brand sticker and an outlined, tilted headline. `support[0]` is the sea and `support[1]` (or the accent) the board and splatter.

## Scorecard

Score with the 10 items in [research.md](research.md) section 6; 15 or more out of 20 is ready.
