# UnDesigned: instructions for Claude

This repository is a **universal design guide**. The user will give you a product (a brand, business, launch or idea) and ask you to design things for it: posters, social posts, banners, flyers, web pages, illustrations, copy. Use this guide for every decision. Don't invent a new style per product; apply this one.

## Your workflow when given a product

1. **Find or create the product.** Look in `products/`. If it's not there, run `npm run new-product -- "<name>"` (add `--palette <n>` or `--pairing <id>` only if the user specified them).
2. **Fill in the message from what the user told you.** Put it in `products/<id>/messaging.json` (positioning, oneLiner, brandscript, voice, proof).
   - Use only facts the user gave you. Leave unknown fields empty and ask about them.
   - Never invent numbers, testimonials or clients.
   - `products/sample-bakery/` shows a completed file.
3. **Find the brand's core before anything else.** Read everything the brand has (site, repo, assets, what the user says) and write down, in `products/<id>/identity.json` (see `products/_template/identity.json`):
   - **The core:** what the brand believes, the change it makes in someone's life, its character in three words, and the one tension or truth that makes it interesting. Content comes from this core, never from restating the website.
   - **Its marks:** the original logo files, copied from the brand. Never redraw, simplify, substitute or invent a mark; use the files as they are (recolour only if the brand itself does).
   - **Its signals:** the colours, type, imagery and signature elements people already know it by. The guide's choices below should echo them (nearest Wada combinations, closest pairing, a style whose method fits).
4. **Use a researched combination; don't pick parts one by one.**
   - **Fastest:** pick a recipe from `foundations/combinations/recipes.json`. Choose by mood and `useFor`; each recipe is a complete style + Wada palette + pairing + hand + motion combination scored for general human liking. Put `{ "recipe": "<id>" }` in the campaign's `campaign.json`. See the samples in `tools/design/recipes/`.
   - **For a specific brand:** run `npm run compose -- <id> [campaign] [--goal ...] --write` (after a first `npm run build -- <id>`).
   - It reads the brand's core and places every style, Wada palette, pairing and hand face on the same five perceptual axes: roundness, activity, potency, warmth, hand.
   - It applies the researched combination rules (`foundations/combinations/README.md`, evidence in `foundations/research/combinations.json`) and writes the winner into the campaign's `campaign.json`, explained rule by rule. The design engine follows that file.
   - Use the user's choice when they made one (`--style`, or edit `campaign.json`).
   - When the user disagrees with a result, fix the cause in `foundations/combinations/combinations.json` (a missing brand word, a style profile, a weight) with the reason, so every later product gets it right the first time.
   - Handwriting stays within its rules: never for body, prices, data, steps or buttons (`foundations/research/handwriting.json`).
5. **Build:** `npm run build -- <id>`. Outputs go to `dist/<id>/`.
6. **Plan content, then write a brief.** Turn the core into 3 to 5 content pillars (the customer's moments, the product's dramatic truths, proof, education, community) and repeatable series. Then, for each campaign, write `products/<id>/campaigns/<campaign>/brief.md`, from `templates/briefs/creative-brief.md`. Settle the one message (W1) and the big idea (O2) before designing.
7. **Write the copy** as `.copy.json` files in the campaign folder. Respect the word limits in `foundations/messaging/source/formats.json`. Run `npm run check:copy -- products/<id>`, then fix every ERROR and the WARNs that apply.
8. **Design with the engine.** Never hand-build a product's pieces. Run `npm run design -- <id> [campaign] --png`: the guide renders every copy file in the product's style (layout per format, Wada palette, pairing, original marks, the style's skin `approaches/<style>/skin.mjs`, motion and reading-time holds), into `campaigns/<campaign>/designs/` with a contact sheet. The product adds only what is its own:
   - in each `.copy.json`: `art` (`{ "motif": "<name>" }`, `{ "image": "assets/photos/x.jpg" }` or `{ "file": "art/x.svg" }`, optional `"size"`), `series` for carousels (`{ "name", "index", "of" }`), `animate: true` for motion, `layout` to force a layout, `palette` to pick one;
   - `products/<id>/art.mjs` for the product's own metaphors, drawn with the style's primitives (it receives the drawing helpers); `identity.json` marks with `kind` (icon, wordmark, lockup) and `on` (dark, light, any).
   If a style or layout can't express something, improve the skin or the layouts in the guide (so every product gains), not a one-off script. Preview any style with `node tools/design/preview.mjs <style> --png`. Use the whole guide: vary compositions across a set (`foundations/layout/layout.json` → `composition`), make carousels tell one story across slides, place the brand's real photos with the media rules (`foundations/layout/media.json`, checked with `templates/layouts/overlay.mjs`), make motion pieces timed by `foundations/video/video.json`, and note which research finding each piece uses. A set that is all one recipe (flat ground, headline, one drawing) is not finished. Start from a layout in `templates/layouts/layouts.json` for the format (draw it with `templates/layouts/render.mjs`) and follow `foundations/layout/layout.json` (grid, safe area, hierarchy). Save the work in the campaign folder.
   - **Video and motion:** plan with `templates/video/storyboard.md` and follow `foundations/video/video.json` (beats, pacing, timing, sound, accessibility: never more than three flashes a second, honour reduced motion). The style's `motion.json` decides how motion feels. `templates/video/title-card.mjs` makes an animated title card from the product's tokens. For a full film, write the storyboard as `campaigns/<campaign>/film.json` (scenes with `pre`, `text`, `accent`; an optional `recipe`; the end card) and run `npm run film -- <id> <campaign> --mp4` (`tools/design/film.mjs`). It times every line by the reading rule, keeps one mover at a time, puts the brand in early and ends on a still. The product's own film art goes in `art.mjs` → `film`, and `tools/design/video.mjs` makes frame-exact MP4s.
9. **Show the work.** Rebuild, and if you can publish pages, publish or update the hub so the user can see it.

## Design rules: follow the product's style

Every product picks one art direction in `brand.json` → `approach`. The rules for that style live in `approaches/<approach>/`: `README.md`, `research.md` (why, with sources), `approach.json` (principles, layer rules, evidence), `art.json` (line, shape, corners, composition, colour ratios, recommended Wada combinations, vocabulary), `motion.json` (springs and timings), `typography.json` (type direction, which pairings fit, sizes per format) and `sample.mjs` (a sample poster). Read them before designing, together with `foundations/research/visual-preference.json` (the evidence every style builds on). Score finished work with the scorecard in that style's `research.md`.

- **The style's own rules win over the general ones below.** For example, Bauhaus allows sharp corners, Commercial Modernism allows two-stop gradients, and Doodles and Scrapbook allow one hand-lettered accent. Where a style marks something `needsApproval` (for example fluorescent inks in Neon Surf), ask the user before using it.
- **Always, in every style:** colours come only from the product's Wada combinations (plus Black and White), fonts only from `foundations/typography/source/pairings.json` (plus one hand face from `handwritten.json` where the style allows it), and copy follows the messaging playbook.
- Styles: `humanist-minimal` (complete, with a drawing engine), plus researched profiles `bauhaus`, `commercial-modernism`, `mid-century-modernism`, `scrapbook`, `desi-maximalism`, `neon-surf`, `posterize` (with `posterize.mjs` for photos), `doodles` and `negative-space` (60–90% empty ground, one small object, its own layouts including photo and video). See `approaches/README.md`.

### Example: Humanist Minimal (the first art direction) in short

- **One idea per piece.** Usually two everyday symbols joined into a metaphor (follow `art.json` → `metaphor.recipe`). One focal point, at least 40% empty ground.
- **Soft geometry.** Organic shapes and rounded corners (`art.json` → `shape`, `corners`); no sharp corners or perfect geometry.
- **Colour:**
  - one Wada combination per piece: its `bg` is the ground and its `accent` goes on at most one object
  - ink is Wada Black, paper is Wada White
  - no gradients, shadows, glows or 3D; halftone dots are the only shading
  - never use a hex value that isn't in the product's generated palette files
- **Type:**
  - only the product's pairing, in sentence case
  - three sizes per piece (headline, body, small), left-aligned
  - no handwriting fonts, except at most one short note (six words or fewer) in a hand face the style lists (`approaches/humanist-minimal/typography.json` → `handwritten`)
- **Illustration:**
  - black ink line over white cut-paper shapes on a flat ground
  - use `dist/<id>/web/js/illustration.mjs` (`scene`, `inkLine`, `cutPaper`, `cutPaperPolygon`), or extend `approaches/humanist-minimal/illustration.mjs` with new motifs built from the same primitives
  - no stock icons or perfect geometric vectors
- **Motion:** fluid and spring-based: springs for arriving, sine curves for looping, acceleration for leaving; one thing moves at a time; loops of 2–4 s ending on a still frame. Springs, timings and classes are in `dist/<id>/web/css/motion.css` (`.<prefix>-pop`, `-rise`, `-draw`, `-breathe`, `-float`, `-spring`).
- **Copy:**
  - plain and warm, written to one person
  - the customer is the hero, and the brand name or logo sits next to the headline
  - specific facts, no clichés, no exclamation marks
  - every format that needs a call to action gets a direct one

## Files to use when building designs

| Need | File |
|---|---|
| Colours as CSS variables | `dist/<id>/web/css/colors.css` (`--<prefix>-bg`, `-ink`, `-accent`, `-text`; any combination via `combinations.css` and `.<prefix>-combo-NNN`) |
| Type | `dist/<id>/web/css/typography.css` (`.<prefix>-hero`, `-display`, `-h1` … `-body`, `-small`, `-label`, and `-hand` when the product has a hand face) |
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
