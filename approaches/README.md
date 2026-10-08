# Approaches (art directions)

An approach is a complete art direction: the research behind it, the rules, and the data and code to apply it. The guide keeps only a **few** approaches, each researched in depth. A product picks one in `products/<product>/brand.json` (`"approach": "<id>"`).

| id | Name | Status |
|---|---|---|
| `humanist-minimal` | Humanist Minimal | First art direction. Complete. |

## What every approach must contain

Every approach has the same files, so a designer or Claude can read any of them the same way:

```
approaches/<id>/
├── README.md          overview: what it is, how to use it, a one-page summary
├── research.md        the dossier: definition, lineage, evidence, what it is and isn't, risks, scorecard, sources
├── approach.json      principles and do/don't per layer (colour, type, layout, illustration, motion, photography, copy)
├── art.json           illustration and shape data: line, shape, corners, composition, palette ratios, texture, motif vocabulary, metaphors
├── motion.json        motion data: springs, easings, durations, choreography, loops, reduced-motion rules
├── typography.json    type direction: what letterforms suit it, fit rating for each pairing, sizes per format, type with art
├── illustration.mjs   the drawing engine: createIllustrator(approach, palette) -> scene(), primitives
└── references/        the source images and recordings
```

Rules for every approach:

- **Colours always come from the colour system** (a Wada combination plus ink and paper). An approach says *how* colour is used (ratios, roles), never *which* colours.
- **Fonts always come from `foundations/typography/source/pairings.json`.** An approach rates each pairing in its own `typography.json`.
- **Every claim in research.md has a source.** Mark rules of thumb as rules of thumb.
- **Numbers are relative** (to a 400 × 400 artboard, or as a percentage), so they scale to any format.

## Adding an approach

1. Copy `humanist-minimal/` to `approaches/<new-id>/` and replace every file's content. Keep the keys in the JSON files.
2. Register its engine in `approaches/build.mjs` (`APPROACHES`).
3. Add it to the table above, then run `npm run build`.
