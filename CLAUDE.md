# UnDesigned: instructions for Claude

This repository is a **universal design guide**. The user will give you a product (a brand, business, launch or idea) and ask you to design things for it: posters, social posts, banners, flyers, web pages, illustrations, copy. Use this guide for every decision. Don't invent a new style per product; apply this one.

## Your workflow when given a product

1. **Find or create the product.** Look in `products/`. If it's not there, run `npm run new-product -- "<name>"` (add `--palette <n>` or `--pairing <id>` only if the user specified them).
2. **Fill in the message from what the user told you.** Put it in `products/<id>/messaging.json` (positioning, oneLiner, brandscript, voice, proof).
   - Use only facts the user gave you. Leave unknown fields empty and ask about them.
   - Never invent numbers, testimonials or clients.
   - `products/sample-bakery/` shows a completed file.
3. **Choose colours and type unless the user already did.** Pick what fits the product, set `color.status` to `"chosen"` once the user agrees, and explain each choice in one line.
   - **Palettes:** read `dist/<id>/tokens/colors.json` (or `foundations/color/source/wada-colors.json` before a build). Prefer combinations whose light-mode `roles.light.inkUse` is `"body"`, so the headline colour passes AA contrast.
   - **Type:** pick from `foundations/typography/source/pairings.json`, preferring `fit: "core"`.
4. **Build:** `npm run build -- <id>`. Outputs go to `dist/<id>/`.
5. **Write a brief** for each campaign: `products/<id>/campaigns/<campaign>/brief.md`, from `templates/briefs/creative-brief.md`. Settle the one message (W1) and the big idea (O2) before designing.
6. **Write the copy** as `.copy.json` files in the campaign folder. Respect the word limits in `foundations/messaging/source/formats.json`. Run `npm run check:copy -- products/<id>`, then fix every ERROR and the WARNs that apply.
7. **Design** with the generated files only (rules below). Save the work in the campaign folder.
8. **Show the work.** Rebuild, and if you can publish pages, publish or update the hub so the user can see it.

## Design rules (Humanist Minimal)

The full approach is in `approaches/humanist-minimal/README.md` and `approach.json`. In short:

- **One idea per piece.** Usually two everyday symbols joined into a metaphor. One focal point, at least 40% empty ground.
- **Colour:**
  - one Wada combination per piece: its `bg` is the ground and its `accent` goes on at most one object
  - ink is Wada Black, paper is Wada White
  - no gradients, shadows, glows or 3D; halftone dots are the only shading
  - never use a hex value that isn't in the product's generated palette files
- **Type:**
  - only the product's pairing, in sentence case
  - three sizes per piece (headline, body, small), left-aligned
  - no handwriting fonts
- **Illustration:**
  - black ink line over white cut-paper shapes on a flat ground
  - use `dist/<id>/web/js/illustration.mjs` (`scene`, `inkLine`, `cutPaper`, `cutPaperPolygon`), or extend `approaches/humanist-minimal/illustration.mjs` with new motifs built from the same primitives
  - no stock icons or perfect geometric vectors
- **Motion:** draw on lines, pop shapes, loops of 2–4 s ending on a still frame. Timings and classes are in `dist/<id>/web/css/motion.css`.
- **Copy:**
  - plain and warm, written to one person
  - the customer is the hero, and the brand name or logo sits next to the headline
  - specific facts, no clichés, no exclamation marks
  - every format that needs a call to action gets a direct one

## Files to use when building designs

| Need | File |
|---|---|
| Colours as CSS variables | `dist/<id>/web/css/colors.css` (`--<prefix>-bg`, `-ink`, `-accent`, `-text`; any combination via `combinations.css` and `.<prefix>-combo-NNN`) |
| Type | `dist/<id>/web/css/typography.css` (`.<prefix>-hero`, `-display`, `-h1` … `-body`, `-small`, `-label`) |
| Motion | `dist/<id>/web/css/motion.css` |
| Illustrations | `dist/<id>/web/js/illustration.mjs`, `dist/<id>/illustration/svg/` |
| Copy checking in code | `dist/<id>/web/js/messaging.mjs` (`check(piece)`) |
| Everything as data | `dist/<id>/tokens/*.json` |
| Print colours | `dist/<id>/design-apps/adobe/print-cmyk/` (the book's original CMYK values) |

Format sizes and canvas proportions are in `foundations/messaging/source/formats.json` (`aspect`).

## Don'ts

- Don't edit anything in `dist/`. It's regenerated; change the sources and rebuild.
- Don't change the guide (`approaches/`, `foundations/`, `templates/`) while working on one product unless the user asks. Product work stays in `products/<id>/`.
- Don't put a product's details in the guide, or the guide's rules in a product.
- `products/sample-bakery/` is an invented example. Never present its content as real.

## Checks before you say a design is done

- `npm run build` succeeds and `npm run check:copy` has no errors for the product.
- Each piece answers the brief checklist: one message, the customer as hero, brand next to the headline, words and image adding to each other, readable contrast.
