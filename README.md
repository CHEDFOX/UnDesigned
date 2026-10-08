# UnDesigned

Design system for UnDesigned marketing: posters, social media, web and print. One source of truth that generates ready-to-use files for every tool.

## Status

| Layer | State | Docs |
|---|---|---|
| Colour | Built on Sanzo Wada's *A Dictionary of Color Combinations* | [docs/colors.md](docs/colors.md) |
| Typography | Not started | |
| Layout and grid | Not started | |
| Poster and social templates | Not started | |

## Quick start

```sh
npm run build     # regenerates dist/ from brand.config.json (Node 18+, no dependencies)
```

Then open `dist/explorer/index.html` to browse palettes.

## What's in dist/

| Folder | For |
|---|---|
| `css/` | Websites, HTML posters, emails (CSS variables) |
| `scss/` | Sass projects |
| `js/` | JavaScript and TypeScript, canvas and generative work |
| `tailwind/` | Tailwind v3 preset and v4 theme |
| `figma/` | Tokens Studio import |
| `adobe/` | `.ase` swatches for Illustrator, InDesign, Photoshop, Affinity (CMYK and RGB) |
| `palettes/` | GIMP/Inkscape/Krita `.gpl` and hex codes for Canva |
| `tokens/` | Full JSON for anything else |
| `explorer/` | The palette browser |
