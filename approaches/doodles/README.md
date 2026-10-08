# Design approach: Doodles

> Full data lives beside this file: [research.md](research.md) (the dossier and sources), [art.json](art.json) (one pen, mark vocabulary, density modes, palette ratios, recommended Wada combinations), [motion.json](motion.json) (line boil, stepped draw-on, wiggles), [typography.json](typography.json) (hand lettering with set type, fit for each pairing, two new pairings) and [sample.mjs](sample.mjs) (a sample poster). The structure every approach follows is in [../STYLE-SPEC.md](../STYLE-SPEC.md).

**Thinking out loud with a pen.** Quick monoline marks (arrows, stars, spirals, squiggles, loops, faces, clouds) drawn around one message, or all over a surface, with flat Wada colour slapped on slightly off the line and a few hand-lettered words over plain set type.

Status: **profile** (rules, data and a sample poster; no drawing engine yet).

## When to use it

- Launches, events, workshops, education, food, kids-and-family (for the grown-ups), creative tools, community projects: anything that should feel open, human and a bit unfinished.
- Explaining a process or a recap (page mode, like a sketchnote).
- Brand walls, packaging wraps and backdrops that must be recognised from across a room (wall mode).

## When not to

- Serious, high-trust moments (medical results, money problems, legal notices): sketchiness reads as provisional.
- Precise data: sketchy rendering lowers the accuracy of area judgements (research.md 3). Keep charts clean; doodle around them.
- When the product already chose Humanist Minimal: the two share a hand line but not a density. Three marks or fewer with lots of space is Humanist Minimal; marks that annotate the message or fill the surface are Doodles (research.md 1).

## Principles

| | Principle | Rule |
|---|---|---|
| DD1 | One pen | One line weight, round ends, visible wobble, loops that overshoot. No pressure swell, no second pen. |
| DD2 | Marks have jobs | Each mark points, counts, circles, links, celebrates or reacts. Only walls may use marks as texture. |
| DD3 | One focal idea, even in a crowd | A focal element at least 3x any other mark; in walls it sits in a clearing of 25-40% of the area. |
| DD4 | Choose the density | Margin (5-15 marks, 45% empty), page (3-7 clusters, 30% empty) or wall (70-90% covered, with a clearing). |
| DD5 | Colour off the line | Black ink on a light Wada ground; flat fills from at most two combination colours, offset 2-5 units in one direction; accent on one object. |
| DD6 | Hand letters for a few words | Hand lettering for up to 8 headline words or 3-word labels; body, CTA and prices in set type. |
| DD7 | Playful, not childish | Wit from what the marks say; minimal faces; no mascots; never copy another artist's characters. |
| DD8 | Boil, don't glide | Artwork moves frame by frame at 8-12 fps: boil, stepped draw-on, wiggles; then a still frame. |

## Across every layer

| Layer | Do | Don't |
|---|---|---|
| Colour | One Wada combination with a light ground; Black ink; one or two fill colours offset from the line; accent on one object. | Coloured ink, gradients, every shape filled, traced fills. |
| Typography | A hand-lettered display for a short headline (Shantell Sans or Gochi Hand, or drawn), a clear body face, sentence case, three sizes. | Hand faces for body, buttons or prices; scripts; joke or grunge fonts. |
| Layout | One density mode; text aligned to one edge; a mark-free band (one margin) around body text and CTA; marks point inward at the message. | Doodles through body text; layouts that are neither sparse nor full. |
| Illustration | Monoline marks from the vocabulary, one focal object, hatching as the only shading. | Stock or emoji doodles, perfect geometry, artist copies, graffiti tags. |
| Motion | Line boil (3 frames at ~10 fps, `steps()`), stepped draw-on, wiggles on held beats; loops of 2-4 s. | Smooth tweens, morphs, camera moves, boiling text. |
| Photography | Photos annotated in ink: circles, arrows, 1-3 word labels. | Doodles over faces or the product; busy photos. |
| Copy | Plain and warm, to one person; hand-lettered words sound spoken. | Exclamation marks (written or drawn), long lettered sentences. |

## Density modes

| Mode | Marks | Empty ground | Pen | Use |
|---|---|---|---|---|
| margin | 5-15 around one focal | at least 45% | marker or fineliner | Default: ads, social, heroes, packaging fronts |
| page | 3-7 clusters on a route | at least 30% | fineliner | Sketchnotes: how it works, menus, recaps |
| wall | covers 70-90% | clearing of 25-40% | fineliner | Brand walls, wraps, backdrops; at most one piece in three |

## Colour

Recommended Wada combinations (details in `art.json` → `palette`): **313** Yellow, Carmine, Diamine Green, Black · **298** Lemon Yellow, Peach Red, Raw Sienna, Black · **276** Seashell Pink, Yellow Green, Eosine Pink, Black · **190** Ivory Buff, English Red, Black · **154** Yellow, Blue, Carmine · **88** Seashell Pink, Blue · **49** Pale King's Blue, Blue · **31** Pale Lemon Yellow, Red Orange · **25** Nile Blue, Etruscan Red · **62** Yellow, Black · **256** Vinaceous Cinnamon, Orange, Dull Viridian Green, Black.

## Motion

| Move | Timing | Easing | Use |
|---|---|---|---|
| boil | 3 frames, 100 ms each, looping | steps(1, end) | Focal object or headline staying alive |
| draw | 400-1000 ms | steps(n), n = ms / 83 | Lines appearing stroke by stroke |
| scribbleFill | 330 ms | steps(4, end) | Colour slapping on, offset from the line |
| pop | spring 420 / 20 | stepped to 12 fps | Small marks appearing |
| wiggle | 3 poses, 250 ms holds, ±4° | steps(1, end) | A star twinkling, a face nodding |
| rise | spring 170 / 26 | smooth | Set text and CTA |

Boil stops after 10 s and is off for reduced motion.

## Sample

`sample.mjs` exports `samplePoster(palette, copy)`, which returns a 400 x 566 SVG poster in wall mode: a doodle wall with a paper clearing, a pen whose loop-de-loop line ends in the accent star, a hand-lettered headline with a wavy underline and a curly arrow, and set subhead and brand.

```js
import { samplePoster } from './approaches/doodles/sample.mjs';
samplePoster(
  { ground: '#fff200', ink: '#111314', paper: '#ffffff', accent: '#cc1236', support: ['#1a7444'] }, // Wada combination 313,
  { headline: 'Think with your pen', subhead: 'A poster in the doodle manner', brand: 'UnDesigned' }
);
```

## Files

```
approaches/doodles/
├── README.md         this page
├── research.md       definition, lineage, evidence, is/isn't, risks, scorecard, sources
├── approach.json     principles, layer rules, evidence scores
├── art.json          pen, marks, density modes, palette, vocabulary, method, checklist
├── motion.json       boil, stepped draw-on, springs, choreography
├── typography.json   hand-lettering rules, pairing fit, new pairings, sizes
└── sample.mjs        samplePoster(palette, copy)
```
