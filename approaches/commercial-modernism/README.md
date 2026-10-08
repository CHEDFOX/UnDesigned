# Design approach: Commercial Modernism

> Full data lives beside this file: [research.md](research.md) (the dossier and sources), [approach.json](approach.json) (principles, layer rules, evidence scores), [art.json](art.json) (object scale, perspective, lettering zones, airbrush rules, palette ratios and recommended Wada combinations, vocabulary, method), [motion.json](motion.json) (eases, glides, push-ins, speed lines) and [typography.json](typography.json) (type direction, fit for each pairing, three new pairings, sizes per format). A sample poster is drawn by [sample.mjs](sample.mjs). The structure every approach follows is in [../STYLE-SPEC.md](../STYLE-SPEC.md).

**One product, shown like a monument.** Modern art put to work selling things, as in the posters of Cassandre, McKnight Kauffer, Lucian Bernhard, Herbert Matter and Lester Beall (about 1905–1950): one object, a bold viewpoint, smooth airbrushed volume, a big brand name and a short slogan.

A product chooses it in `products/<product>/brand.json` (`"approach": "commercial-modernism"`). Status: **profile** (rules and a sample poster; no drawing engine yet).

## When to use it

- Travel, transport, hospitality, energy, engineering, drinks, premium everyday goods: anything whose promise is speed, scale, precision or modern quality.
- Campaigns that need to read from a distance or in a glance: posters, billboards, banners, thumbnails.
- Brands that want confidence and polish more than warmth.

## When not to use it

- Products whose promise is care, craft or intimacy (use Humanist Minimal: the handmade look is the point there).
- Playful, flat, witty pieces with hand-cut shapes: that is Mid-century Modern, a separate approach (see [research.md 2.5](research.md#25-the-boundary-with-mid-century-modern)).
- Text-heavy pieces: this style carries a slogan and a name, not paragraphs.

## Principles

| | Principle | Rule |
|---|---|---|
| CM1 | The product is the hero | One object at 40–65% of the canvas height, or cropped by one edge. Remove everything else. |
| CM2 | One bold viewpoint | A low horizon (lower 20–35%) so the object looms, a vanishing point, or a frontal monument. |
| CM3 | Diagonals carry energy | At least one dominant diagonal (15–40°) or converging line set; speed lines, rails, beams. |
| CM4 | Airbrush, within one combination | Two-stop gradients between colours of the piece's Wada combination (plus Black and White), inside hard edges. None on lettering. |
| CM5 | Lettering is part of the picture | Brand and slogan in planned zones (a band, a perspective line); the brand word large, in tracked capitals. |
| CM6 | Few words, said once | A slogan of 2–7 words plus the brand. No body copy on the image. |
| CM7 | Machine-age polish, not nostalgia | Clean, precise, new. No fake wear, decorative sunbursts or period slang. |

## Across every layer

| Layer | Do | Don't |
|---|---|---|
| Colour | One Wada combination; object in its dark colour or Black; accent on one object; two-stop airbrush between its colours. | Off-combination gradients, glows, drop shadows, chrome. |
| Typography | Geometric sans (Jost) and one Art Deco display word (Limelight) or Bodoni for editorial; brand in tracked capitals, slogan in sentence case. | Rounded, calligraphic, handwriting or distressed fonts. |
| Layout | Hero object 40–65% of height; deliberate horizon; lettering in a band (bottom 18–28% or top 10–18%). | Several products, eye-level product shots, text over gradients. |
| Illustration | Hard stencil edges, no outlines; lit face and shade face; streamline curves against straight diagonals. | Outlines, wobble, texture, detailed scenes, heroic figures. |
| Motion | Glide along diagonals, slow push-ins, speed lines, hard-edged wipes; no overshoot. | Bounces, shakes, spins, fades on text. |
| Photography | Matter-style montage: one big cut-out against a small scene (4:1 scale jump), duotone in the combination. | Raw stock photos, many small images. |
| Copy | A short, confident slogan with a specific fact; brand set large beside it. | Exclamation marks, period pastiche, unproven superlatives. |

## Measurable rules (summary)

| Rule | Value | Where |
|---|---|---|
| Hero object height | 40–65% of canvas | `art.json` → `composition.motifSizePct` |
| Horizon | 65–80% down (low), 15–30% (high), 45–55% (tunnel) | `art.json` → `perspective.horizon` |
| Vanishing points | 1–2; at least one off-canvas for two-point | `art.json` → `perspective.vanishingPoints` |
| Dominant diagonal | 15–40° | `art.json` → `perspective.diagonal` |
| Airbrush | 2 stops, one combination, ≥ 25% of the shape, ≤ 4 modelled objects | `art.json` → `airbrush` |
| Lettering zones | bottom band 18–28%, top band 10–18%; brand word 45–90% of width | `art.json` → `lettering` |
| Colour areas | ground 35–55%, object 20–35%, band 15–28%, paper 3–12%, accent 2–10% | `art.json` → `palette.roles` |
| Empty ground | at least 25% | `art.json` → `composition` |

All of these are rules of thumb measured from the period posters, not published standards.

## Colour

Recommended Wada combinations (details and reasons in `art.json` → `palette.recommendedCombinations`): **126** Ivory Buff, Yellow Ocher, Deep Lyons Blue · **151** Sulpher Yellow, Yellow Orange, Vandar Poel's Blue · **154** Carmine, Yellow, Blue · **190** Ivory Buff, English Red, Black · **232** Carmine, Pinkish Cinnamon, Deep Indigo · **179** Red Orange, Golden Yellow, Deep Lyons Blue · **313** Carmine, Yellow, Diamine Green, Black · **344** Cinnamon Buff, Deep Lyons Blue, Aconite Violet, Black · **221** Carmine Red, Neutral Gray, Black · **259** Lemon Yellow, Green Blue, Helvetia Blue, Warm Gray · **343** Burnt Sienna, Ivory Buff, Deep Grayish Olive, Vandar Poel's Blue · **298** Raw Sienna, Lemon Yellow, Peach Red, Black.

Unlike Humanist Minimal, this style uses gradients. They are built only between colours of the piece's one combination (plus Wada Black and White), with exactly two stops; that keeps every hex value inside the product's generated palette.

## Sample

```js
import { samplePoster } from './approaches/commercial-modernism/sample.mjs';

samplePoster(
  { ground, ink, paper, accent, support: [light, dark] },   // hex values from one Wada combination
  { headline: 'Travel by morning light', subhead: '…', brand: 'UnDesigned' }
); // -> '<svg viewBox="0 0 400 566">…</svg>'
```

It draws a liner's bow from a low viewpoint over a low horizon (the *monument* placement), with airbrushed hull faces, accent funnels, speed lines and a lettering band.

## Motion

| Move | Duration | Easing | Use |
|---|---|---|---|
| glide | spring `glide` (no overshoot) | | Hero object arriving along its diagonal |
| pushIn | 5000 ms | cubic-bezier(0.65, 0, 0.35, 1) | Slow camera push, scale 1 → 1.06 |
| speedLines | 700 ms, 60 ms stagger | cubic-bezier(0.22, 1, 0.36, 1) | Lines drawing on from the object outward |
| wipe | 600 ms | cubic-bezier(0.65, 0, 0.35, 1) | Brand and slogan revealed by a hard-edged mask |
| sweep | 3000 ms loop | cubic-bezier(0.45, 0, 0.55, 1) | A beam or ray sweeping ±8° |
| serial | 1200 ms per frame | | Three frames building one idea (Dubonnet) |
| depart | 450 ms | cubic-bezier(0.7, 0, 0.84, 0) | Leaving toward the vanishing point |

## Scorecard

Ten items, 0–2 each, 16 of 20 to pass: see [research.md section 6](research.md#6-scorecard).
