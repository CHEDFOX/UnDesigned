# Designing a product with UnDesigned

This guide sets how everything is designed. You bring a product. Follow these steps in order; each one points to the part of the guide it uses. The sample product, `products/sample-bakery/` (an invented bakery), shows every step finished.

## 0. Before you start

- Install [Node 18 or newer](https://nodejs.org). Nothing else is needed.
- Run `npm run build` and open `dist/hub/index.html`. It shows the whole guide; switch products at the top.
- Read the approach once: [approaches/humanist-minimal/README.md](approaches/humanist-minimal/README.md). Every decision below follows it.

## 1. Create the product

```sh
npm run new-product -- "Product name"
```

This creates `products/<product>/` from the template, with:

- `brand.json`: settings (name, approach, palettes, type).
- `messaging.json`: what the product says.
- `assets/`: logos, fonts, images.
- `campaigns/`: the work itself.

Put the logo in `assets/logos/` (SVG if you have it) and any photography in `assets/images/`.

## 2. Write the message first

Fill in `products/<product>/messaging.json` before any visual work. The fields follow the messaging playbook:

| Section | Answers | Rules |
|---|---|---|
| positioning | Who is it for? What is it, in one sentence and one paragraph? | P1, P2 |
| oneLiner | Problem, solution, result | S9 |
| brandscript | The customer, their problem (external, internal, philosophical), you as guide, the plan, the calls to action, the stakes and the success | S1–S7 |
| voice | What the product sounds like and doesn't; words to avoid | O11 |
| proof | Facts, numbers, testimonials, clients | O5, S4 |

The Brand message tab of the hub shows what's still missing.

## 3. Choose colours

1. Open the hub's Colour tab. Each of the 348 combinations is a small poster.
2. Star the ones that fit the product, then compare them. Prefer combinations marked **AA**: their headline colour is readable on the background.
3. Set the choice in `brand.json`:

```json
"color": {
  "status": "chosen",
  "palettes": {
    "primary":  { "combination": 344, "mode": "light" },
    "seasonal": { "combination": 313, "mode": "light" }
  }
}
```

`primary` is the everyday palette. Add more named palettes for campaigns or a dark version. Each piece uses **one** combination. Ink is always black and paper is always white.

## 4. Choose typography

Open the Typography tab. Every pairing is shown in the product's palette and copy. Start with the four marked *Recommended*. Set the choice in `brand.json`:

```json
"typography": { "pairing": "young-onest", "scale": 1.25 }
```

## 5. Build

```sh
npm run build -- <product>
```

Everything for the product lands in `dist/<product>/`: colour swatches for Adobe, Figma, Canva and GIMP, CSS for web, fonts to install (`design-apps/fonts.txt`), illustrations in the product's palette, a message sheet, and a one-product hub page to share.

## 6. Design a campaign

For each campaign, create `products/<product>/campaigns/<campaign>/`.

1. **Brief:** copy [templates/briefs/creative-brief.md](templates/briefs/creative-brief.md) to `brief.md` and fill it in: the one message, the big idea, the formats.
2. **Words:** write each piece in a `.copy.json` file (format, headline, subhead, body, cta), then run `npm run check:copy`. Fix every ERROR and most WARNs. The hub's Copy checker tab does the same live and previews the layout.
3. **Design:** lay out each piece following the approach:
   - one idea and one focal point, with lots of empty ground (H3, H4)
   - the palette's background as the ground, black ink, white paper, and the accent on one object (H5)
   - an ink-and-paper illustration from `dist/<product>/illustration/`, or drawn by hand in the same style (H1)
   - type from the product's pairing: headline, body, small, in sentence case
   - the brand name or logo next to the headline (O4)
4. **Check before sign-off:** use the list at the end of the brief.

## 7. Hand it over

Share `dist/<product>/brand-hub/index.html` (one file, works offline) and `dist/<product>/brand-guide/message-sheet.md` with anyone else working on the product.

## Changing the guide itself

The guide is shared by every product, so change it deliberately:

| To change | Edit |
|---|---|
| The approach's rules, illustration or motion | `approaches/humanist-minimal/` |
| A new approach | add `approaches/<id>/` and register it in `approaches/build.mjs` |
| Colour families | `foundations/color/source/families.json` |
| Type pairings | `foundations/typography/source/pairings.json` |
| Copy rules, word limits, clichés | `foundations/messaging/source/` |

Then run `npm run build`; every product picks up the change.
