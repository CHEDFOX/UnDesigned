# Layout templates

Ready-made layouts for every format in `foundations/messaging/source/formats.json`, saved as data, with a tiny renderer that turns one into an SVG. A template fixes the skeleton (format, grid, margins, safe area, where each element goes). Each piece changes only the idea, the image, the words and the Wada combination. Why: familiar frames are processed fluently and help people find the brand, while fresh ideas stop wear-out (see `foundations/layout/research.md`, section 8).

## Templates

| Id | Format | Aspect | Composition |
|---|---|---|---|
| `poster-single-focal` | poster | 1 : 1.414 | single-focal |
| `poster-type-led` | poster | 1 : 1.414 | type-led |
| `event-poster-stacked` | event-poster | 1 : 1.414 | stacked |
| `square-single-focal` | instagram-post | 1 : 1 | single-focal |
| `post-4x5-single-focal` | instagram-post | 4 : 5 | single-focal |
| `post-4x5-full-bleed-band` | instagram-post | 4 : 5 | full-bleed-band |
| `carousel-grid-of-4` | carousel-slide | 4 : 5 | grid-of-n |
| `story-stacked` | story | 9 : 16 | stacked |
| `hero-split` | landing-hero | 16 : 9 | split |
| `thumbnail-split` | thumbnail | 16 : 9 | split |
| `banner-strip` | web-banner | 970 : 250 | split |
| `email-header-split` | email-header | 600 : 300 | split |
| `flyer-stacked` | flyer | 1 : 1.414 | stacked |
| `print-ad-long-copy` | print-ad | 1 : 1.414 | long-copy |
| `billboard-split` | billboard | 48 : 14 | split |

Photo and video backgrounds (each has a `media` object; rules in `foundations/layout/media.json`):

| Id | Format | Aspect | Media | Treatment |
|---|---|---|---|---|
| `poster-photo-calm-region` | poster | 1 : 1.414 | photo | calm-region |
| `post-4x5-photo-scrim` | instagram-post | 4 : 5 | photo | scrim-gradient (or solid-band, halftone-fade) |
| `square-photo-plate` | instagram-post | 1 : 1 | photo | plate |
| `story-video-overlay` | story | 9 : 16 | video | plate |
| `hero-video-split-scrim` | landing-hero | 16 : 9 | video | scrim-gradient (or solid-band, plate) |
| `thumbnail-photo-gaze` | thumbnail | 16 : 9 | photo | calm-region |
| `billboard-photo-band` | billboard | 48 : 14 | photo | solid-band |

Check the treatment against the style before using a template: most styles ban gradients, so the scrim templates fall back to their `alternatives`.

## The data (`layouts.json`)

Each layout has:

- `id`, `name`, `format` (an id from formats.json), `aspect` ([width, height]), `composition` (an id from `foundations/layout/layout.json` → `composition`)
- `grid`: columns, margin and gutter (percent of the short side), baseline, and the resulting `liveArea` (percent of the artboard)
- `safeArea`: the platform overlay insets used, or `null`
- `panels` (optional): solid areas such as the band in `full-bleed-band`
- `slots`: `name`, `role` (`headline`, `subhead`, `body`, `cta`, `brand`, `art`, `image`, `note`), `box` (`x`, `y`, `w`, `h` in percent of the artboard, from the top left), `align`, and `maxWords` from formats.json where it applies
- `notes`, and `evidence` (finding ids in `foundations/layout/layout.json` or `foundations/layout/media.json`)
- `media` (photo and video layouts only):
  - `kind` (`photo` or `video`), `fill` (`full-bleed`)
  - `treatment`: an id from `media.json` → `treatments`; `alternatives` for styles that don't allow it
  - `text`: the palette role for all text (`ink` or `paper`)
  - `textZone`: the box every text slot sits inside
  - `subject` and `gaze`: where the person or product is and which way they look (`left`, `right`, `up`, `down`, `up-left` …); `avoid`: boxes text must not cover
  - `overlay`: the treated area: `box`, `colour` (a palette role), `opacity`, `from` (the opaque side of a scrim or band), `radiusPctShortSide` for plates
  - `video` (video only): timing and caption notes

Boxes are snapped to the grid's columns. Text, brand and CTA slots always sit inside the live area (the grid margin or the safe area, whichever is larger). Art and image slots may bleed to the edge.

## Rendering

```js
import { readFileSync } from 'node:fs';
import { renderLayout } from './templates/layouts/render.mjs';

const { layouts } = JSON.parse(readFileSync('templates/layouts/layouts.json', 'utf8'));
const layout = layouts.find(l => l.id === 'poster-single-focal');

const svg = renderLayout(layout, {
  palette: { ground, ink, accent, paper },        // from dist/<id>/tokens/colors.json, one Wada combination
  copy: { headline, subhead, body, cta, brand, note },
  fonts: { display: 'Bricolage Grotesque', body: 'Figtree' }, // the product's pairing
  art: svgString,                                 // optional, e.g. from dist/<id>/web/js/illustration.mjs
  media: svgStringOrHref,                         // optional background photo (or a video's poster frame), full-bleed
  mirror: false,                                  // true for right-to-left scripts
  guides: false,                                  // true draws the live area and slot outlines
});
```

- Plain ESM, Node 18+ or a browser, no dependencies.
- Text is wrapped with an estimated glyph width and shrunk until it fits its box. The estimate is generous, but check the final piece with the real font.
- Without `art`, art slots get a soft placeholder blob in the accent colour and image slots a simple placeholder.
- The CTA is drawn as an ink-outlined pill, so the accent stays on one object (the art).
- Media layouts: `media` (an SVG string or an image URL) is drawn full-bleed under everything, cropped to fill. The layout's treatment is drawn on top in palette colours only (band, plate, scrim as a `linearGradient`, tint, halftone fade, blur, duotone filter, hard text shadow). Without `media`, a placeholder photo (sky, hills and a person looking at the text) is drawn so the template still reads as a photo layout. Text uses the palette role in `media.text`; `textColour` overrides it. For video, pass the poster frame; the renderer draws stills.

## Measuring text over a photo (`overlay.mjs`)

Zero-dependency ESM for Node and the browser. Images are `{ width, height, data }` with RGBA data (from canvas `getImageData()` or any decoder); boxes are percent of the image.

```js
import { analyseRegion, recommendTreatment, findCalmRegion, analyseFrames, gridCandidates } from './templates/layouts/overlay.mjs';

const zone = layout.media.textZone;
analyseRegion(img, zone);
// -> { meanLuminance, p10Luminance, p90Luminance, busyness, contrastWithInk(hex), contrastWithPaper(hex), ... }

recommendTreatment(img, zone, { ink, paper, minContrast: 4.5, allowed: ['calm-region', 'plate', 'solid-band', 'halftone-fade'] });
// -> { text: 'ink' | 'paper', treatment, opacity, fill, achievedContrast, reason }

findCalmRegion(img, gridCandidates(4, 3, 2, 1, 8), { ink, paper, avoid: [faceBox] });
// -> candidates sorted best first: { box, score, busyness, contrast, text, passes }

analyseFrames(frames, zone); // video: the worst frame decides
```

- Contrast is WCAG 2.x, measured on the worst-case pixels (10th percentile for dark text, 90th for light), never the mean.
- `recommendTreatment` tries no treatment first, then the least intrusive allowed treatment, and solves the scrim or tint opacity by blending palette colours over the actual pixels. Set `allowed` from the style's row in `media.json` → `treatments`.
- Busyness (0 to 1) combines edge density and fine texture on a coarse grid; 0.2 or less is calm (rule of thumb).
- Blur results are estimates; measure the blurred file.
- The renderer is for wireframes, previews and simple pieces. It sizes each slot on its own, so it can produce more than three type sizes; for finished work, set sizes from `approaches/<id>/typography.json` → `sizes.byFormat` and keep to three.

## Rules when using a template

- Respect `maxWords`; run `npm run check:copy` on the copy.
- Leave a slot empty rather than filling it with filler; drop the subhead before shrinking the headline.
- Keep text out of panels' edges and photos' busy areas; never over a face. Measure with `overlay.mjs`.
- Reuse the same few templates for a product across campaigns; vary the idea, image and combination.
- The style's own composition rules (`approaches/<id>/art.json` → `composition`) win where they differ, e.g. empty-ground minimums.
