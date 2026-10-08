# UnDesigned

Design system for UnDesigned marketing: posters, social media, web and print. The design approach is **Humanist Minimal**: very few marks, each one made by a human hand. One set of sources and settings generates ready-to-use files for every tool.

## Folder map

```
UnDesigned/
├── config/
│   ├── brand.config.json        visual choices (palettes now; type and layout later)
│   └── messaging.json           brand message: positioning, one-liner, BrandScript, voice
│
├── foundations/                 the building blocks, one folder each
│   ├── approach/                Humanist Minimal: principles, illustration library, motion
│   ├── color/                   Sanzo Wada colour system: source data, build, docs
│   ├── messaging/               copy playbook (Ogilvy, StoryBrand, Perennial Seller, Whipple) + copy checker
│   ├── typography/              planned
│   └── layout/                  planned
│
├── templates/                   ready-made designs that use the foundations
│   ├── briefs/                  creative brief to fill in per campaign
│   ├── posters/                 planned
│   ├── social/                  planned
│   └── print/                   planned
│
├── assets/                      brand files
│   ├── logos/
│   ├── fonts/
│   ├── images/
│   └── references/              reference stills and recordings for the approach
│
├── tools/                       brand-hub/: the page that shows the whole system
├── scripts/
│   ├── build.mjs                builds everything into dist/
│   └── check-copy.mjs           checks *.copy.json against the messaging rules
│
└── dist/                        GENERATED: never edit by hand
    ├── web/                     code: css/, scss/, js/, tailwind/
    ├── design-apps/             apps: adobe/ (print-cmyk, screen-rgb), figma/, canva/, gimp-inkscape-krita/
    ├── illustration/            ready-made SVG illustrations, still and animated
    ├── brand-guide/             readable sheets to share (message sheet)
    ├── tokens/                  full JSON for anything else
    └── brand-hub/               open index.html: the whole system in one page
```

Rule of thumb: you edit `config/`, `foundations/*/source/`, `templates/` and `assets/`. You use files from `dist/`.

## How a campaign is made

1. Fill in a [creative brief](templates/briefs/creative-brief.md) (strategy, the one message, big idea).
2. Pick a palette in the brand hub (dist/brand-hub/index.html).
3. Write the copy in a `.copy.json` file and run `npm run check:copy`.
4. Lay it out using the files in `dist/` (templates coming).

## Status

| Layer | State | Docs |
|---|---|---|
| Approach | Humanist Minimal: principles, rules per layer, illustration library, motion | [foundations/approach](foundations/approach/README.md) |
| Colour | Done. 159 colours, 12 families, 348 combinations | [foundations/color](foundations/color/README.md) |
| Messaging | Playbook and checker done. Brand message waiting to be filled in (`config/messaging.json`) | [foundations/messaging](foundations/messaging/README.md) |
| Typography | Not started | [foundations/typography](foundations/typography/README.md) |
| Layout and grid | Not started | [foundations/layout](foundations/layout/README.md) |
| Templates | Not started | [templates](templates/README.md) |

## Build

```sh
npm run build              # everything (Node 18+, no dependencies)
npm run build:color        # colour only
npm run build:approach     # approach only
npm run build:messaging    # messaging only
npm run check:copy         # check every *.copy.json under templates/
```

## Where to find what

| I'm working in | Use |
|---|---|
| Illustrator, InDesign, Photoshop, Affinity | `dist/design-apps/adobe/print-cmyk/` (print) or `screen-rgb/` (screen) |
| Figma | `dist/design-apps/figma/` (Tokens Studio) |
| Canva | `dist/design-apps/canva/brand-colors.txt` |
| GIMP, Inkscape, Krita | `dist/design-apps/gimp-inkscape-krita/` |
| Briefing a designer or copywriter | `dist/brand-guide/message-sheet.md` and `templates/briefs/creative-brief.md` |
| Illustrations | `dist/illustration/svg/` or `dist/web/js/illustration.mjs` |
| Websites, HTML posters, emails | `dist/web/css/` (colours, motion) |
| Sass, JavaScript, Tailwind | `dist/web/scss/`, `dist/web/js/`, `dist/web/tailwind/` |
