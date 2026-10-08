# UnDesigned

A **universal design guide**. Hand this repository to a designer, or to Claude, together with any product, and they can design for that product the same way every time: posters, social, web and print.

The guide fixes *how* things are designed (the approach, colour method, type, copy rules). Each product brings *what* is designed (its name, palette choice, typeface choice, message, assets).

- **Designers:** start with [GUIDE.md](GUIDE.md).
- **Claude / AI assistants:** [CLAUDE.md](CLAUDE.md) holds the working instructions and is read automatically.
- **See it all in one page:** run `npm run build`, then open `dist/hub/index.html`.

## What's in the guide

| Part | What it gives you | Docs |
|---|---|---|
| Research | What the brain likes: 9 evidence-backed findings (curves, simplicity, fluency, 50 ms impressions, familiar + fresh, natural complexity, handmade, colour associations, aesthetic-usability), myths to drop, and style families scored | [foundations/research](foundations/research/README.md) |
| Approach | **Humanist Minimal**: 8 principles, do/don't for every layer, an illustration library (ink line, cut paper) and motion timings, built from the references | [approaches/humanist-minimal](approaches/humanist-minimal/README.md) |
| Colour | 159 colours and 348 combinations from Sanzo Wada's *A Dictionary of Color Combinations*, with roles, contrast checks and exports for every tool | [foundations/color](foundations/color/README.md) |
| Typography | 8 modern, humanist pairings (free Google Fonts) with a type scale and rules | [foundations/typography](foundations/typography/README.md) |
| Messaging | A playbook of 33 rules from Ogilvy, StoryBrand, Perennial Seller and Hey Whipple, word limits for 12 formats, and a copy checker | [foundations/messaging](foundations/messaging/README.md) |
| Briefs | A creative brief form for each campaign | [templates/briefs](templates/briefs/creative-brief.md) |
| Layout, templates | Planned | [foundations/layout](foundations/layout/README.md), [templates](templates/README.md) |

## Folder map

```
UnDesigned/
├── GUIDE.md                 how a designer uses this guide with a product
├── CLAUDE.md                how Claude uses this guide with a product
├── products/                one folder per product, brand or idea
│   ├── _template/           copied by `npm run new-product`
│   ├── sample-bakery/       a complete worked example (invented)
│   └── undesigned/          UnDesigned itself
│       ├── brand.json       name, CSS prefix, approach, palettes, type pairing
│       ├── messaging.json   positioning, one-liner, BrandScript, voice, proof
│       ├── assets/          logos/ · fonts/ · images/
│       └── campaigns/       one folder per campaign: brief.md + *.copy.json
├── approaches/              design approaches a product can choose
│   └── humanist-minimal/    approach.json · illustration.mjs · references/ · README
├── foundations/             shared libraries every product uses
│   ├── research/            what the brain likes: findings, myths, style scores
│   ├── color/               Wada colour data and exports
│   ├── typography/          type pairings and scale
│   ├── messaging/           playbook, format limits, copy checker
│   └── layout/              planned
├── templates/               briefs/ · posters/ · social/ · print/ (planned)
├── tools/brand-hub/         the hub page source
├── scripts/                 build · new-product · check-copy
└── dist/                    GENERATED, never edit by hand
    ├── hub/index.html       the whole guide, all products, with a switcher
    └── <product>/           web/ · design-apps/ · illustration/ · brand-guide/ · tokens/ · brand-hub/
```

Rule of thumb: the guide lives in `approaches/`, `foundations/` and `templates/` and rarely changes. Product work happens in `products/<product>/`. Finished files come out of `dist/<product>/`.

## Commands

```sh
npm run new-product -- "Product name"   # new folder in products/ from the template
npm run build                           # build every product + the hub (Node 18+, no installs)
npm run build -- sample-bakery          # build one product
npm run check:copy                      # check every *.copy.json under products/
npm run check:copy:sample               # see the checker on the sample product
```

## Where to find files for a product

| Working in | Use |
|---|---|
| Illustrator, InDesign, Photoshop, Affinity | `dist/<product>/design-apps/adobe/` (`print-cmyk/` for print, `screen-rgb/` for screen) |
| Figma | `dist/<product>/design-apps/figma/` (Tokens Studio) |
| Canva | `dist/<product>/design-apps/canva/brand-colors.txt` and `design-apps/fonts.txt` |
| GIMP, Inkscape, Krita | `dist/<product>/design-apps/gimp-inkscape-krita/` |
| Illustrations | `dist/<product>/illustration/svg/` or `dist/<product>/web/js/illustration.mjs` |
| Websites, HTML posters, emails | `dist/<product>/web/css/` (colours, typography, motion) |
| Sass, JavaScript, Tailwind | `dist/<product>/web/scss/`, `web/js/`, `web/tailwind/` |
| Briefing a designer or writer | `dist/<product>/brand-guide/message-sheet.md`, `dist/<product>/brand-hub/index.html`, `templates/briefs/creative-brief.md` |
