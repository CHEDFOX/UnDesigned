# Design approach: Posterize

> Full data lives beside this file: [research.md](research.md) (the dossier and sources), [approach.json](approach.json) (principles, layer rules, evidence scores), [art.json](art.json) (levels, thresholds, colour mapping, halftone, registration, cropping, palette ratios), [motion.json](motion.json) (springs, step timings, choreography) and [typography.json](typography.json) (type direction, fit for each pairing, new pairings, sizes per format). Code: [posterize.mjs](posterize.mjs) (the engine) and [sample.mjs](sample.mjs) (a sample poster). The structure every approach follows is in [../STYLE-SPEC.md](../STYLE-SPEC.md).

**A real photograph, printed in a few flat colours.** The photo is cut into 2 to 5 tonal levels and each level becomes one flat Wada colour, as in screen printing: dark tones are ink, middle tones the accent, light tones the ground or paper. One subject, cropped close, bold condensed type on flat colour.

A product chooses it in `products/<product>/brand.json` (`"approach": "posterize"`).

## When to use it

- The product has real people, hands or objects worth showing, and photos it owns.
- The work must be seen at a distance or in a fast feed: posters, events, music, campaigns, civic and community causes, launches.
- The brand wants one recognisable treatment that turns any photo into a brand asset.

## When not to use it

- No good photography, or only stock images. Posterizing makes generic photos more generic.
- Calm, intimate or clinical subjects (health, grief, finance advice) where a loud print feels wrong; if used, choose a soft ladder (combinations 166, 303) at 3 levels.
- Products whose message is detail (texture of food, fabric, skin care): posterizing removes exactly that.

## Principles

| | Principle | Rule |
|---|---|---|
| PZ1 | Few levels | 2-5 flat tonal levels, usually 3 or 4. No gradients or photo texture survive. |
| PZ2 | Tone keeps its order | Ink darkest, accent middle, ground or paper lightest; adjacent levels 15 L* apart. |
| PZ3 | A real subject, a strong silhouette | A real photo, side lit, cropped close (50-80% of the image block), background removed. |
| PZ4 | Keep the features | Ink covers 20-35% of the subject; eyes, nose shadow and mouth stay readable. |
| PZ5 | Show the print | One plate 0.5-1.5% out of register, or one halftone fade. Hard, slightly wandering edges. |
| PZ6 | One subject, one message | One image, one headline; they never repeat each other. |
| PZ7 | Words on flat colour | Type never crosses the image; text 4.5:1, ink plate 3:1 against the ground. |
| PZ8 | Own the image | Only owned or licensed photos, with consent. No public figures, no borrowed protest icons. |

## Across every layer

| Layer | Do | Don't |
|---|---|---|
| Colour | One Wada combination with a light-to-dark ladder. Ink darkest, accent middle, ground or paper light. | Gradients, transparency, more than five colours, inverted tone on the hero piece. |
| Typography | Bold condensed grotesques and gothics, sentence case, tight; plain grotesque body. | Handwriting, light headlines, grunge or outline fonts, text over the image. |
| Layout | Image block (55-70%) and flat text block; 7% margin; one focal point. | Text across the image, several photos, decorative frames. |
| Illustration | The posterized photo is the illustration; one flat block or halftone fade as support. | Mixing with line illustration or 3D, fake grunge everywhere. |
| Motion | Level steps, plates sliding into register, hard colour cuts, dots growing. | Crossfades, zooms, more than three colour changes a second. |
| Photography | Side light 30-60 degrees, plain background, close crop, real people with consent. | Flat front light, busy scenes, small faces, stock models. |
| Copy | 3-8 word headlines that say what the image cannot. | Political slogans for products, hype, exclamation marks. |

## The method in short

1. Choose a photo with one hard side light; remove the background; raise contrast; blur 0.5-1% of the short side.
2. Cut at the percentile defaults (3 levels: 28/66; 4 levels: 22/52/80). Check it still reads at 2 levels and at 48 px.
3. Map levels to the combination: ink, accent, ground, paper. Nudge cuts up to 8 points to save the eyes and mouth.
4. Add at most one print sign: a misregistered ink plate or a halftone fade.
5. Set the headline in the pairing's bold display face on flat ground beside the image.

Recommended combinations (art.json → `palette.recommendedCombinations`): 190 (Ivory Buff, English Red, Black), 298, 313, 154, 295, 276, 303, 166, 344, and the duotones 31, 88 and 104.

## Code

`posterize.mjs` posterizes a canvas `ImageData` (or any `{ data, width, height }`) in place. Pure JavaScript, no imports, deterministic.

```js
import { posterizeImageData } from './approaches/posterize/posterize.mjs';

const img = ctx.getImageData(0, 0, w, h);
const report = posterizeImageData(img, { ink, accent, ground, paper }, { levels: 4, smooth: 2 });
ctx.putImageData(img, 0, 0);
// report = { levels, thresholds, shares (% per level), colours }

posterizeImageData(img, ['#111314', '#d96629', '#ebd3a2'], { levels: 3, thresholds: [0.3, 0.66] });
posterizeImageData(img, palette, { levels: 3, dither: 'halftone', cell: 8, angle: 45, spread: 0.5 });
posterizeImageData(img, palette, { levels: 2, dither: 'bayer8' });
```

- Luminance uses Rec. 709 weights; thresholds come from percentiles of the visible pixels unless you pass them (0-255 or 0-1).
- A role palette is mapped as in art.json → `posterize.roleMapping` and sorted by luminance; an array is used as given (dark to light).
- `dither` adds ordered dither or round halftone dots only in a band around each cut (`spread`), so plates stay flat.
- Transparent pixels are left alone, so cut-out subjects keep their background.

`sample.mjs` exports `samplePoster(palette, copy)`, which returns a 400 x 566 SVG poster: a procedurally drawn, side-lit face posterized by SVG filters into ink, accent and paper plates, with an out-of-register ink plate and a halftone fade.

## Motion

| Move | Timing | Use |
|---|---|---|
| levelStep | 6 frames at 12 fps (500 ms), steps() | Image builds from 2 levels to its final count |
| separationSlide | spring: stiffness 300, damping 24 | Plates enter from 4-8% off and snap into register |
| pull | 450 ms, cubic-bezier(0.3, 0, 0.2, 1) | A plate revealed by a squeegee-like wipe |
| colourCycle | 700-1000 ms per combination, hard cut | Same image through 3-4 combinations |
| dotGrow | 600 ms, 12 ms stagger per row | Halftone dots growing to size |

Loops last 2-4 s and end on the registered still. With reduced motion, show the still.
