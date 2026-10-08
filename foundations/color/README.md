# Colour system

The UnDesigned palette is built on Sanzo Wada's *A Dictionary of Color Combinations* (1933, Seigensha edition): **159 colours** arranged into **348 combinations** of 2, 3 or 4 colours. Every design (posters, social, web, print) uses only these colours, and each piece uses one combination.

## How it works

```
foundations/color/
├── source/wada-colors.json     the book's colours (name, CMYK, RGB, Lab, combinations)
├── source/families.json        hand-curated colour families (edit to regroup)
└── build.mjs                   generates every colour file in dist/
config/brand.config.json        which combinations are the brand palettes ("color" section)
```

Change `config/brand.config.json`, then run:

```sh
npm run build
```

## Picking palettes

Open `dist/brand-hub/index.html (Colour tab)` in a browser. Each combination is shown as a small poster. Filter by number of colours, search by colour name, or open the **Colour index** (grouped by colour family or by the book's chapters) to see every combination that uses one colour. Star the ones you like and use **Copy shortlist**.

Add your choices to `config/brand.config.json`:

```json
{
  "prefix": "ud",
  "color": {
    "palettes": {
      "primary":  { "combination": 232, "mode": "light" },
      "campaign": { "combination": 313, "mode": "light" },
      "night":    { "combination": 145, "mode": "dark" }
    }
  }
}
```

- `mode: "light"` uses the lightest colour as the background; `"dark"` uses the darkest.
- To override a role, add `"roles": { "accent": "burnt-sienna" }`. Colour ids are the names in lowercase with hyphens.

## Groupings

| Grouping | Groups | Where you see it |
|---|---|---|
| Colour family | Reds, Pinks & roses, Wines & magentas, Oranges, Browns & tans, Yellows, Olives, Greens, Teals & aquas, Blues, Purples & violets, Neutrals | CSS/SCSS/Tailwind comments, `$ud-families`, JS `families`, Figma `wada.<family>.*`, `wada-by-family.ase`, `.gpl`, explorer |
| Book chapter | Chapters I–VI, as in Wada's book | `wada-by-chapter.ase`, tokens JSON, explorer |
| Combination size | Pairs (120), trios (120), quartets (108) | `combinations.css` sections, `$ud-combinations`, JS `combinationGroups`, Figma `combinations.<size>.*`, one `.ase` per size |

Families are a judgement call (Wada names some wine reds "purple"). To move a colour, edit `foundations/color/source/families.json`; the build stops if a colour is missing or listed twice.

## Roles

Each combination is assigned roles automatically so templates can use it without manual picking:

| Role | What it is | Use for |
|---|---|---|
| `bg` | Lightest colour (or darkest in dark mode) | Page or poster background |
| `ink` | The colour with the most contrast against `bg` | Headlines, logo |
| `accent` | The most saturated of the remaining colours | Shapes, highlights, buttons |
| `support-N` | Any remaining colours | Secondary shapes, dividers |
| `text` | `ink` if it reaches 4.5:1 against `bg`; otherwise the book's Black or White | Body copy, small text |

Many of Wada's combinations are tonal and low-contrast by design. The explorer marks each one:

- **AA**: ink is safe for any text size.
- **Large type**: ink is safe only for big headlines (3:1 or more). Use `text` for body copy.
- **Decor**: ink is decorative. Use it for shapes and use `text` for all words.

## Using the colours

### CSS (websites, HTML posters, emails)

```html
<link rel="stylesheet" href="dist/web/css/colors.css">
<style>
  .poster { background: var(--ud-bg); color: var(--ud-text); }
  .poster h1 { color: var(--ud-ink); }
  .poster .shape { background: var(--ud-accent); }
  .sticker { background: var(--ud-wada-burnt-sienna); } /* any single colour */
</style>
```

To use other palettes, add `class="ud-palette-campaign"` for a named brand palette, or load `dist/web/css/combinations.css` and use `class="ud-combo-042"` (add `ud-dark` for the dark version) for any of the 348 combinations. Everything inside picks up that palette's `--ud-*` variables.

### SCSS

```scss
@use 'dist/web/scss/colors' as *;
.cta { background: map-get($ud-primary, 'accent'); }
.tag { color: $ud-wada-carmine; }
// $ud-combinations: (232: (#cc1236, #eeb480, #051230), ...)
// $ud-families: ('reds': ('spectrum-red': #e31f26, ...), ...)
```

### JavaScript / TypeScript (canvas, generative posters, React)

```js
import { brand, palette, families, combinationGroups, combinationsWith, color } from './dist/web/js/colors.mjs';

brand.primary.accent;            // '#cc1236'
palette(42, 'dark');             // { bg, ink, accent, text, support, all, contrast }
combinationsWith('burnt-sienna'); // every combination using that colour
color('carmine').cmyk;           // [0, 100, 75, 16]
families.blues.colors;           // every blue, in order
combinationGroups.trios;         // all 120 three-colour combinations
```

CommonJS: `require('./dist/web/js/colors.cjs')`. Types are in `colors.d.ts`.

### Tailwind

- v3: `presets: [require('./dist/web/tailwind/preset.cjs')]` gives you `bg-wada-carmine`, `text-brand-ink` and `bg-brand-accent`.
- v4: `@import "./dist/web/tailwind/theme.css";` defines the same colours as `--color-*` theme variables.

### Figma

Import `dist/design-apps/figma/colors.tokens.json` with the Tokens Studio plugin. Colours are grouped by family (`wada.blues.deep-indigo`), combinations by size (`combinations.trios.232.c1`), and brand roles (`brand.primary.accent`) reference the base colours.

### Adobe Illustrator, InDesign, Photoshop, Affinity

Load these from the Swatches panel: Open Swatch Library > Other Library.

| File | Contents |
|---|---|
Use `dist/design-apps/adobe/print-cmyk/` for print and `screen-rgb/` for screen. Each folder holds:

| File | Contents |
|---|---|
| `brand.ase` | Brand palettes, labelled by role |
| `wada-by-family.ase` | All 159 colours, one group per colour family |
| `wada-by-chapter.ase` | All 159 colours, grouped by the book's six chapters |
| `combinations-2-colour.ase` / `-3-` / `-4-` | Every combination of that size, one group each |

The CMYK values are the book's original printing values, so CMYK is the accurate version for print. RGB is converted from it.

### Canva, GIMP, Inkscape, Krita

- Canva: paste the hex codes from `dist/design-apps/canva/brand-colors.txt` into your Brand Kit.
- GIMP, Inkscape, Krita: import `dist/design-apps/gimp-inkscape-krita/wada-by-family.gpl` (all colours) or `brand-primary.gpl`.

### Everything else

`dist/tokens/colors.json` holds every colour (name, family, chapter, hex, RGB, CMYK, Lab, combinations), the family, chapter and size groupings, and every combination with its roles and contrast ratios.

## Credits

Colour names, CMYK values and combinations are from Sanzo Wada's *A Dictionary of Color Combinations* (Seigensha Art). The dataset comes from [mattdesl/dictionary-of-colour-combinations](https://github.com/mattdesl/dictionary-of-colour-combinations) (MIT, see `source/LICENSE-dataset.md`), which builds on work by Dain M. Blodorn Kim.
