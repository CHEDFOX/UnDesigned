# Design engine

The guide renders a product's pieces itself. A product brings its facts, copy, original marks, photos and (optionally) its own motifs; the guide brings everything else.

```
npm run design -- <product> [campaign] [--png] [--only <piece>]
node tools/design/preview.mjs <style> --png      # the test copy in any style, with its own recommended palette
```

## What happens for each piece

1. **Format and layout.** The piece's `format` gives the canvas (`foundations/messaging/source/formats.json`). The engine picks a layout for it from the style's own `layouts.json` and `templates/layouts/layouts.json`, preferring the compositions the skin lists and varying them across the set; carousels keep one layout across their slides; photo pieces get media layouts.
2. **Colour and type.** The product's Wada palette (`palette`, default `primary`) and pairing, from `dist/<id>/tokens/`. Text is fitted with real glyph widths measured once in Chromium (`font-metrics.json`).
3. **The style skin** (`approaches/<style>/skin.mjs`, API in `skins/base.mjs`) draws the ground, the art, photo treatments, text furniture, the button and the marks that run across carousel slides.
4. **The brand.** The original mark from `identity.json` (`kind`: icon, wordmark or lockup; `on`: dark, light or any), placed as is; SVG marks are inlined so their own fonts load.
5. **Photos.** Each photo's tones are measured once (`photo-tones.json`): text over a photo takes the colour that reads on its worst-case pixels behind the text, and skins get luminance percentiles for posterizing and duotones.
6. **Motion** (`animate: true`): one element at a time, the style's arrival spring from `motion.json`, the headline held for its reading time (`foundations/layout/media.json`), ending on a still; reduced motion shows the end frame.
7. **No brand** (`brand: false`): leaves out the logo and name on that piece, when the user asks for it.
8. **Campaign style** (`campaign.json`): `approach`, `combination`, `mode`, and `text` ("white" or "black") to set the text colour on the ground.

## The ten skins

| Style | Draws |
|---|---|
| Humanist Minimal | Ink line over white cut paper (its own drawing engine); ink-outlined pill; one ink line across carousel slides |
| Negative Space | One small silhouette facing the open field, a hairline horizon, small quiet type |
| Bauhaus | Constructions of circle, square, triangle and bars on a grid; duotone photos; sharp blocks |
| Commercial Modernism | Streamlined scenes (liner, tunnel, tower, flock) in two-stop gradients; lettering bands; toned photos |
| Mid-century Modernism | Flat cut shapes, starbursts, emblems, slight misregistration |
| Neon Surf | Black-outlined stickers, waves, sun, checkerboard |
| Desi Maximalism | Nested frames, a cartouche, radial and mirror pattern |
| Posterize | Photos and subjects cut into 3–4 flat tones, out-of-register plates |
| Scrapbook | Torn strips, tape, prints, stamps, ticket stubs; headline on newsprint strips |
| Doodles | One-pen doodles around a focal drawing; hand-lettered headline where the style allows |

Improve a skin or the layouts when a style can't express something, so every product gains.
