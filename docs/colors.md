# Colour system

The UnDesigned palette is built on Sanzo Wada's *A Dictionary of Color Combinations* (1933, Seigensha edition): **159 colours** arranged into **348 combinations** of 2, 3 or 4 colours. Every design (posters, social, web, print) uses only these colours, and each piece uses one combination.

## How it works

```
colors/source/wada-colors.json   the book's colours (name, CMYK, RGB, Lab, combinations)
brand.config.json                which combinations are the brand palettes
scripts/build-colors.mjs         generates everything in dist/
dist/                            ready-to-use files for each tool
```

Change `brand.config.json`, then run:

```sh
npm run build
```

## Picking palettes

Open `dist/explorer/index.html` in a browser. Each combination is shown as a small poster. Filter by number of colours, search by colour name, or open the **Colour index** to see every combination that uses one colour. Star the ones you like and use **Copy shortlist**.

Add your choices to `brand.config.json`:

```json
{
  "prefix": "ud",
  "palettes": {
    "primary":  { "combination": 232, "mode": "light" },
    "campaign": { "combination": 313, "mode": "light" },
    "night":    { "combination": 145, "mode": "dark" }
  }
}
```

- `mode: "light"` uses the lightest colour as the background; `"dark"` uses the darkest.
- To override a role, add `"roles": { "accent": "burnt-sienna" }`. Colour ids are the names in lowercase with hyphens.

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
<link rel="stylesheet" href="dist/css/colors.css">
<style>
  .poster { background: var(--ud-bg); color: var(--ud-text); }
  .poster h1 { color: var(--ud-ink); }
  .poster .shape { background: var(--ud-accent); }
  .sticker { background: var(--ud-wada-burnt-sienna); } /* any single colour */
</style>
```

To use other palettes, add `class="ud-palette-campaign"` for a named brand palette, or load `dist/css/combinations.css` and use `class="ud-combo-042"` (add `ud-dark` for the dark version) for any of the 348 combinations. Everything inside picks up that palette's `--ud-*` variables.

### SCSS

```scss
@use 'dist/scss/colors' as *;
.cta { background: map-get($ud-primary, 'accent'); }
.tag { color: $ud-wada-carmine; }
// $ud-combinations: (232: (#cc1236, #eeb480, #051230), ...)
```

### JavaScript / TypeScript (canvas, generative posters, React)

```js
import { brand, palette, combinationsWith, color } from './dist/js/colors.mjs';

brand.primary.accent;            // '#cc1236'
palette(42, 'dark');             // { bg, ink, accent, text, support, all, contrast }
combinationsWith('burnt-sienna'); // every combination using that colour
color('carmine').cmyk;           // [0, 100, 75, 16]
```

CommonJS: `require('./dist/js/colors.cjs')`. Types are in `colors.d.ts`.

### Tailwind

- v3: `presets: [require('./dist/tailwind/preset.cjs')]` gives you `bg-wada-carmine`, `text-brand-ink` and `bg-brand-accent`.
- v4: `@import "./dist/tailwind/theme.css";` defines the same colours as `--color-*` theme variables.

### Figma

Import `dist/figma/tokens.json` with the Tokens Studio plugin. It holds every colour (`wada.*`), every combination (`combinations.042.c1`) and the brand roles (`brand.primary.accent`), all referencing the base colours.

### Adobe Illustrator, InDesign, Photoshop, Affinity

Load these from the Swatches panel: Open Swatch Library > Other Library.

| File | Contents |
|---|---|
| `dist/adobe/brand-cmyk.ase` | Brand palettes, CMYK. **Use for print.** |
| `dist/adobe/brand-rgb.ase` | Brand palettes, RGB. Use for screen. |
| `dist/adobe/wada-colors-*.ase` | All 159 colours, grouped by the book's six chapters |
| `dist/adobe/wada-combinations-*.ase` | All 348 combinations, one group each |

The CMYK values are the book's original printing values, so CMYK is the accurate version for print. RGB is converted from it.

### Canva, GIMP, Inkscape, Krita

- Canva: paste the hex codes from `dist/palettes/brand-hex.txt` into your Brand Kit.
- GIMP, Inkscape, Krita: import `dist/palettes/wada-colors.gpl`.

### Everything else

`dist/tokens/colors.json` holds every colour with name, hex, RGB, CMYK, Lab, chapter and combinations, plus every combination with its roles and contrast ratios.

## Credits

Colour names, CMYK values and combinations are from Sanzo Wada's *A Dictionary of Color Combinations* (Seigensha Art). The dataset comes from [mattdesl/dictionary-of-colour-combinations](https://github.com/mattdesl/dictionary-of-colour-combinations) (MIT, see `colors/source/LICENSE-dataset.md`), which builds on work by Dain M. Blodorn Kim.
