# Approaches (art directions)

An approach is a complete art direction: the research behind it, the rules, and the data and code to apply it. The guide keeps a small set of approaches, each researched in depth to [STYLE-SPEC.md](STYLE-SPEC.md). A product picks one in `products/<product>/brand.json` (`"approach": "<id>"`).

| id | Name | Evidence /14 | Status |
|---|---|---|---|
| `humanist-minimal` | Humanist Minimal | 12 | Complete, with drawing engine |
| `bauhaus` | Bauhaus | 7 | Researched profile, sample poster |
| `commercial-modernism` | Commercial Modernism | 8 | Researched profile, sample poster |
| `mid-century-modernism` | Mid-century Modernism | 11 | Researched profile, sample poster |
| `scrapbook` | Scrapbook | 8 | Researched profile, sample poster |
| `desi-maximalism` | Desi Maximalism | 7 | Researched profile, sample poster |
| `neon-surf` | Rad Dog / Neon Surf | 7 | Researched profile, sample poster |
| `posterize` | Posterize | 10 | Researched profile, sample poster + posterize.mjs filter |
| `doodles` | Doodles | 9 | Researched profile, sample poster |

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
├── sample.mjs         samplePoster(palette, copy): a poster that shows the style
└── references/        the source images and recordings
```

`_inbox/` holds references not yet assigned to a style. Approaches with `illustration.mjs` are **complete**; the others are **profiles** (full research and data plus a sample poster) until an engine is written.

Rules for every approach:

- **Colours always come from the colour system** (a Wada combination plus ink and paper). An approach says *how* colour is used (ratios, roles), never *which* colours.
- **Fonts always come from `foundations/typography/source/pairings.json`.** An approach rates each pairing in its own `typography.json`.
- **Every claim in research.md has a source.** Mark rules of thumb as rules of thumb.
- **Numbers are relative** (to a 400 × 400 artboard, or as a percentage), so they scale to any format.

## Adding an approach

1. Copy `humanist-minimal/` to `approaches/<new-id>/` and replace every file's content. Keep the keys in the JSON files.
2. The build finds it automatically. If you write a drawing engine, register it in `approaches/build.mjs` (`ENGINES`).
3. Add it to the table above, then run `npm run build`.
