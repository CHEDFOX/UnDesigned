# Design approach: Mid-century Modernism

> Full data lives beside this file: [research.md](research.md) (the dossier and sources), [art.json](art.json) (shape vocabulary, misregistration, texture, figure stylisation, palette ratios, recommended Wada combinations), [motion.json](motion.json) (limited-animation timing), [typography.json](typography.json) (type direction, fit for each pairing, two new pairings, sizes per format) and [sample.mjs](sample.mjs) (a sample poster in code). The structure every approach follows is in [../STYLE-SPEC.md](../STYLE-SPEC.md).

**One emblem, cut from paper, printed in a few inks.** Post-war graphic optimism, roughly 1945–1970: Saul Bass's cut-paper emblems, Charley Harper's counted-wing birds, Paul Rand's and Jim Flora's play, UPA's limited animation, Girard's and the Eameses' warm modern objects. Modernist order underneath, American playfulness on top.

A product chooses it in `products/<product>/brand.json` (`"approach": "mid-century-modernism"`). Status: **profile** (rules and data; no drawing engine yet; `sample.mjs` shows the look).

## When to use it

- Products that want to feel well made, friendly and confident: design goods, furniture, food and drink, books, music, events, cultural venues, family products.
- Launches and campaigns that need one memorable image more than a lot of information.
- Brands with a story about craft, optimism or "good things for everyone".

## When not to use it

- Products that must look cutting-edge or technical first (developer tools, security, finance dashboards).
- Text-heavy work where the image can't lead.
- Audiences or contexts where 1950s associations are unwelcome (period gender roles, Cold War imagery).
- If the only idea is "make it look retro": that produces pastiche (research.md 5).

## Principles

| | Principle | Rule |
|---|---|---|
| MC1 | One emblem | Reduce the message to one image a stranger could redraw from memory. |
| MC2 | Cut, don't render | Flat shapes with cut edges; texture from printing, never from lighting. |
| MC3 | Off register, on purpose | Colour plates sit 0.75–1.5% off the black key line, all one direction. |
| MC4 | Few inks | Two to four inks counting black; white is paper; no blends or transparency. |
| MC5 | Count the wings | Animals in 5–9 geometric parts; keep the one feature that makes them recognisable. |
| MC6 | Angular but friendly | Every sharp form has a soft partner; points on at most a third of the outlines. |
| MC7 | Play inside order | Grid, margins, left-aligned type, plus exactly one playful break. |
| MC8 | Limited motion | Hold, then snap, on twos or threes; end on a held poster frame. |

## Across every layer

| Layer | Do | Don't |
|---|---|---|
| Colour | One Wada combination as a 2–4 ink print job: bg as ground, a support colour for the big shape, accent on the emblem, black key. Warm ground against teal, or the reverse. | More than four inks, blends, transparency, gradients, big muddy olive or brown fields. |
| Typography | Heavy geometric sans headline, old-style serif or Futura-style sans text, letter-spaced labels. | Handwriting fonts, deco faces, distressed fonts, scripts in long lines. |
| Layout | Asymmetric balance, 8% margins, emblem 40–70% of the short side, text on the other side, at least 35% empty ground. | Centred stacks, boxes around everything, text over shape edges. |
| Illustration | Kidney, boomerang, starburst, leaf, tapered triangle, circle; stylised animals and figures; offset key line; light dry brush or speckle. | Realism, 3D, traced outlines, Corporate Memphis figures, ethnic caricature, period props. |
| Motion | Holds of 0.5–1.5 s, poses stepped on twos (83 ms) or threes (125 ms), cut-ons, bar wipes, morphs. | Smooth tweening of everything, floating, parallax, bouncing text. |
| Photography | Rarely; cut-out, one-ink halftone, combined with drawn shapes. | Glossy colour photos, vintage filters, fake grain. |
| Copy | Short, confident, a little witty, to one person. | Period pastiche, hype, exclamation marks, 1950s stereotypes. |

## Colour

Recommended Wada combinations (details in `art.json` → `palette`): **122** Carmine / Cream Yellow / Benzol Green, **144** Rosolanc Purple / Orange / Black, **149** Olive Ocher / Orange / Deep Slate Green, **155** Jasper Red / Benzol Green / Deep Indigo, **243** Raw Sienna / Ivory Buff / Olive Green / Slate Color, **247** Raw Sienna / Apricot Yellow / Benzol Green / Deep Lyons Blue, **255** Raw Sienna / Pyrite Yellow / Calamine Blue / Black, **263** Burnt Sienna / Pinkish Cinnamon / Turquoise Green / Slate Color, **286** Burnt Sienna / Orange Yellow / Peacock Blue / Violet Blue, **304** Hay's Russet / Cream Yellow / Dark Citrine / Benzol Green, **343** Burnt Sienna / Ivory Buff / Deep Grayish Olive / Vandar Poel's Blue.

Area shares: ground 45–65%, shape 15–30%, accent 5–15% (one object), key 5–12%, paper 3–10%.

## Type

Core: the new pairings **spartan-caslon** (League Spartan + Libre Caslon Text) and **boogaloo-jost** (Boogaloo + Jost), and the existing **bricolage-figtree**. Good: young-onest, fraunces-commissioner, schibsted. Full ratings in `typography.json`. The new pairings need adding to `foundations/typography/source/pairings.json` before a product can select them.

## Motion

| Move | Timing | Use |
|---|---|---|
| cut-on | 0 ms, `steps(1, end)` | Default arrival: the shape is just there |
| pop | 4 drawings on twos (333 ms) | The emblem appears with one overshoot drawing |
| bar-wipe | 500 ms on twos, bars staggered 83 ms | Bass-style reveal of type or the emblem |
| slide | 4 drawings on twos (333 ms) | A shape moves to its next pose |
| morph | 6 drawings on threes (750 ms) | One shape becomes the next idea |
| blink | 1 drawing (125 ms) every 2.6 s | Character beat |
| hold | 500–1500 ms | Between every move |

One thing moves at a time; loops of 2–4 s end on a held frame; reduced motion shows the final frame.

## Sample

```js
import { samplePoster } from './approaches/mid-century-modernism/sample.mjs';
samplePoster(
  { ground: '#e2b540', ink: '#111314', paper: '#ffffff', accent: '#cc1236', support: ['#00978d', '#f37420'] },
  { headline: 'Good things, made simply', subhead: 'A poster in the mid-century manner', brand: 'UnDesigned' }
); // -> '<svg viewBox="0 0 400 566">…</svg>'
```

A Harper-style bird in the accent on a dry-brushed kidney, a starburst sun, a boomerang, colour plates offset from the key line, League Spartan headline and Libre Caslon italic subhead. Pass hex values from the product's generated palette only.

## Files

```
approaches/mid-century-modernism/
├── README.md         this overview
├── research.md       definition, lineage, evidence, what it is and isn't, risks, scorecard, sources
├── approach.json     principles, layer rules, evidence scores
├── art.json          line, shape vocabulary, misregistration, figures, composition, palette, texture, vocabulary, method
├── motion.json       limited-animation frame rates, moves, choreography
├── typography.json   type direction, fit ratings, new pairings, sizes per format
└── sample.mjs        samplePoster(palette, copy) -> SVG
```
