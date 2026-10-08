# UnDesigned

Design system for UnDesigned marketing: posters, social media, web and print. One set of sources and settings generates ready-to-use files for every tool.

## Folder map

```
UnDesigned/
├── config/
│   └── brand.config.json        your brand choices (palettes now; type and layout later)
│
├── foundations/                 the building blocks, one folder each
│   ├── color/                   Sanzo Wada colour system: source data, build, docs
│   ├── typography/              planned
│   └── layout/                  planned
│
├── templates/                   ready-made designs that use the foundations
│   ├── posters/                 planned
│   ├── social/                  planned
│   └── print/                   planned
│
├── assets/                      brand files
│   ├── logos/
│   ├── fonts/
│   └── images/
│
├── tools/                       helper pages (palette explorer)
├── scripts/build.mjs            builds everything into dist/
│
└── dist/                        GENERATED: never edit by hand
    ├── web/                     code: css/, scss/, js/, tailwind/
    ├── design-apps/             apps: adobe/ (print-cmyk, screen-rgb), figma/, canva/, gimp-inkscape-krita/
    ├── tokens/                  full JSON for anything else
    └── palette-explorer/        open index.html to browse palettes
```

Rule of thumb: you edit `config/`, `foundations/*/source/`, `templates/` and `assets/`. You use files from `dist/`.

## Status

| Layer | State | Docs |
|---|---|---|
| Colour | Done. 159 colours, 12 families, 348 combinations | [foundations/color](foundations/color/README.md) |
| Typography | Not started | [foundations/typography](foundations/typography/README.md) |
| Layout and grid | Not started | [foundations/layout](foundations/layout/README.md) |
| Templates | Not started | [templates](templates/README.md) |

## Build

```sh
npm run build          # everything (Node 18+, no dependencies)
npm run build:color    # colour only
```

## Where to find what

| I'm working in | Use |
|---|---|
| Illustrator, InDesign, Photoshop, Affinity | `dist/design-apps/adobe/print-cmyk/` (print) or `screen-rgb/` (screen) |
| Figma | `dist/design-apps/figma/` (Tokens Studio) |
| Canva | `dist/design-apps/canva/brand-colors.txt` |
| GIMP, Inkscape, Krita | `dist/design-apps/gimp-inkscape-krita/` |
| Websites, HTML posters, emails | `dist/web/css/` |
| Sass, JavaScript, Tailwind | `dist/web/scss/`, `dist/web/js/`, `dist/web/tailwind/` |
