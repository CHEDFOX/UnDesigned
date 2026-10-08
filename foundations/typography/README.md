# Typography

Modern, humanist and minimal type: open, warm, very readable faces. There are eight pairings, all free Google Fonts under the SIL Open Font License. Each product picks one in `products/<product>/brand.json`:

```json
"typography": { "pairing": "bricolage-figtree", "scale": 1.25 }
```

Compare them on the Typography tab of the hub (`dist/hub/index.html`), where every pairing is shown in the product's own palette and copy.

## Pairings

| id | Name | Headline + body | Fit with Humanist Minimal | Best for |
|---|---|---|---|---|
| `bricolage-figtree` | Warm Modern | Bricolage Grotesque + Figtree | Recommended | Most products. Posters, social, websites. |
| `instrument` | Modern Editorial | Instrument Serif + Instrument Sans | Recommended | Culture, design, premium services. |
| `source` | Humanist Classic | Source Serif 4 + Source Sans 3 | Recommended | Education, health, lots of text. |
| `young-onest` | Friendly | Young Serif + Onest | Recommended | Food, hospitality, family, local. |
| `alegreya` | Calligraphic Humanist | Alegreya + Alegreya Sans | Works well | Books, crafts, wellbeing. |
| `schibsted` | Single-Family Minimal | Schibsted Grotesk | Works well | Tech, products, maximum restraint. |
| `fraunces-commissioner` | Soft Serif | Fraunces + Commissioner | Works well | Lifestyle, kids, independent shops. |
| `plex` | Technical Humanist | IBM Plex Serif + IBM Plex Sans | Special use | Science, data, B2B, reports. |

Each pairing also has a monospace face for small data such as dates, prices and codes. Add pairings in `source/pairings.json`.

## Rules

- Two families at most (headline + body), plus the mono for small data.
- Sentence case everywhere. All capitals only for short labels of one to three words, with letter-spacing.
- Three sizes per piece is usually enough: headline, body, small.
- Big headlines: tight leading (about 1.0), slightly negative tracking. Body: leading 1.5, lines of 45–75 characters.
- Left-align text. Centre only one or two short lines on a centred poster.
- Handwriting only as one short accent, from the handwritten library below, where the style allows it.

## Handwritten faces

`source/handwritten.json` holds 17 free Google Fonts hand faces, each with designer, licence, scripts and a reading tier. They sit on top of the pairing as one accent per piece; they never replace it. A product picks one, if its style allows it:

```json
"typography": { "pairing": "young-onest", "scale": 1.25, "hand": "caveat" }
```

The build then adds `--<prefix>-font-hand` and the class `.<prefix>-hand` (sized up for legibility), and fails if the style does not list the face (`approaches/<id>/typography.json` → `handwritten`).

| Tier | Words | Minimum size | Faces |
|---|---|---|---|
| Readable | up to 12 | body × 1.15 | Shantell Sans, Patrick Hand, Kalam (Devanagari), Gaegu (Korean) |
| Glance | up to 6 | body × 1.25 | Architects Daughter, Caveat, Caveat Brush, Gochi Hand, Permanent Marker, Nanum Pen Script (Korean), Mansalva |
| Display only | up to 3 | headline size | Pacifico, Yellowtail, Dancing Script, Kaushan Script, Reenie Beanie, Rock Salt |

| Style | Hand faces |
|---|---|
| Humanist Minimal | One note: Shantell Sans, Patrick Hand, Caveat, Kalam, Gaegu |
| Doodles | Part of the style (headline up to 8 words): Shantell Sans, Gochi Hand, Patrick Hand, Gaegu, Architects Daughter, Caveat, Kalam |
| Scrapbook | One note: Caveat, Permanent Marker, Nanum Pen Script, Mansalva, Architects Daughter, Reenie Beanie |
| Neon Surf | One sticker or tag: Permanent Marker, Rock Salt, Mansalva, Pacifico, Kaushan Script |
| Mid-century Modernism | One script word: Yellowtail, Dancing Script, Caveat Brush |
| Desi Maximalism | One note: Kalam |
| Bauhaus, Commercial Modernism, Posterize | None |

Why, and when not to: hand type adds a sense of a person and raises attachment and perceived care for warm, safe products, but it lowers trust in data, makes instructions feel harder, reverses for functional products and adds little to brands people already love. The evidence is in `foundations/research/handwriting.json` and on the hub's Brain research tab.

## Scale

Sizes are steps of the product's `scale` ratio (1.2 calm, 1.25 balanced, 1.333 bold) from a base of 16 px on screen and 24 px for posters (A3 width; scale with the artboard). The steps are caption, small, body, lead, h3, h2, h1, display and hero.

## Generated files (per product)

| File | Contents |
|---|---|
| `dist/<product>/web/css/typography.css` | Google Fonts import, `--<prefix>-font-*` and `--<prefix>-text-*` variables, classes `.<prefix>-hero`, `-display`, `-h1`, `-h2`, `-h3`, `-lead`, `-body`, `-small`, `-label`, `-data` |
| `dist/<product>/design-apps/fonts.txt` | Fonts to install for Figma, Adobe and Canva, with download links and the size table |
| `dist/<product>/tokens/typography.json` | Everything as JSON |
