# Creative brief

**Campaign:** Launch (social, web, print and a story video)
**Date / deadline:** not given (question for the user)
**Owner:** XOOTEQ (XOOTEQ LAB PRIVATE LIMITED)

Every fact below comes from the XOOTEQ website source (`src/content/site.ts` and the page files). Nothing is invented: no numbers, testimonials, clients or dates beyond what the site states.

## 0. Direction (proposed, awaiting approval; `brand.json` → `color.status` stays "placeholder")

| Choice | Pick | Why, in one line |
|---|---|---|
| Style | Humanist Minimal (`approaches/humanist-minimal`) | "Engineer the organic tomorrow" is two worlds joined, which is exactly this style's method (two plain symbols, one idea), and it has the strongest evidence in the guide (12/14) and a drawing engine. |
| Colour | Wada 207 (Glaucous Green, Black, Sudan Brown), `primary` = light | From the style's recommended list; a sage ground keeps the site's green identity, black ink passes 11.05:1 (inkUse "body"), and the brown accent is literally soil. |
| Second palette | Wada 207 dark, `night` | Same combination reversed: a Wada Black ground with glaucous green text (11.05:1) is the closest the Wada palette gets to the site's near-black #0A0A0A and electric green, so night pieces feel like the website. The site's #00E676 and #FF6B35 are not Wada colours and are not used. |
| Type | `bricolage-figtree` (Bricolage Grotesque + Figtree) | Rated core by the style, and the closest core pairing to the site's Syne + DM Sans: an expressive grotesque headline over an open, calm sans. |
| Hand face | None | The guide reserves hand faces for warm, personal products (food, gifts, care); a technology R&D company isn't that case. |
| Logo | Static redraw of the site's mark (circle, X, tail) from `src/components/LogoMark.tsx`, beside "XOOTEQ" set in Bricolage Grotesque 700 | The site's wordmark lettering isn't available as a file; see open questions. Copies of the PNG mark and XQ monogram are in `assets/logos/`. |

## 1. Research (O1)

- What the product is and how it actually works: a technology R&D company in four parts: Technology (software, AI, infrastructure "if it solves a real problem"; products Plutto and Tailzu), AI Cinema (the studio DUMBORD, established 2025), the Green Revolution (every quarter, in every city it operates in, it plants trees, protects green spaces and spreads awareness), and Community / Build With Us (workspace, living space, hardware, GPU access, dev infrastructure and peers for builders aged 18 to 35). Every idea, project and person runs through one question: "Does it matter?"
- What customers say about it, in their own words: nothing on the site (no testimonials). Question for the user.
- What competitors say (and so what we must not say): agencies and accelerators: pitch decks, demo days, form-letter rejections, "carbon credits". The site defines XOOTEQ against all of them, so we never sound like a pitch: no hype words, no "disrupt", no "revolutionary".

## 2. Audience (P2, S2)

- The one person this is for: an engineer, filmmaker, researcher or designer aged 18 to 35 with an unconventional idea that won't let them sleep, and no place, hardware or peers to build it with.
- What they want, specifically: the environment and support to build it, without having to pitch for it.

## 3. Problem (S3)

- External: they need workspace, hardware, GPU access and dev infrastructure they don't have.
- Internal: not stated on the site (question for the user; we have not invented one).
- Philosophical: "Degrees don't build things. People do."

## 4. The one thing (W1)

> "Does it matter?" is the one test at XOOTEQ, for its own work and for yours.

## 5. Dramatic truth and proof (W2, O5, S4)

- The honest fact: XOOTEQ applies the same filter to everything, its own software, its films, its trees and the people it invites in: if it doesn't create real value for real people, it doesn't ship.
- Proof (from the site only): products Plutto and Tailzu; the studio DUMBORD (2025); trees planted every quarter in every city it works in; Build With Us offers workspace, living space, hardware, GPU access, dev infrastructure and peers; "We respond to everyone." No numbers, results or testimonials are available yet.

## 6. Big idea (O2, W8)

> Technology that grows: every piece joins one plain tech symbol with one living thing (code braces with a sprout, a microchip with a tree, a keycap that shines, a question mark that grows), drawn by hand, so "Engineer the organic tomorrow" is seen, not said; the headline then asks or answers "Does it matter?".

The motifs (all drawn with the product's primitives `inkLine`, `blob`, `paperPolygon` from `dist/xooteq/web/js/illustration.mjs`):

| Motif | Symbols joined | Says |
|---|---|---|
| bracket-sprout | code braces + sprout (soil clod in the accent) | software that grows something real |
| chip-tree | microchip (accent) + tree, roots drawn as circuit traces | engineer the organic tomorrow |
| question-sprout | question mark + growing stem, seed (accent) as the dot | does it matter? |
| key-sun | keyboard key + sun | fun is fuel |
| table-chair | work table + one chair pulled out (accent seat) | a seat at the table |
| hand-soil | hand + sapling in a mound of soil (accent) | direct, physical planting |
| calendar-sprout | calendar page + sprout, one date marked (accent) | every quarter |
| moon-eye | crescent moon + an open eye, iris in the accent | the idea that won't let you sleep |
| hand-blocks | hand + stack of blocks (top block accent) | people build things |

## 7. Call to action (S6)

- Direct: "Tell us what you're building" / "Email hello@xooteq.com" (the site: "We respond to everyone").
- Transitional: "See the Green Revolution" (xooteq.com/green-revolution); "Join the beta at xooteq.com/creation" on the web hero.
- What it builds long term (P4): applications to Build With Us, the beta list at /creation, followers of @xooteq.

## 8. Stakes and success (S7)

- If they do nothing: not stated on the site (question for the user).
- After they act: "Join the table. Get the environment and support you need. Ship something that actually matters."

## 9. Formats and deliverables

All artwork is generated by `design.mjs` (`node products/xooteq/campaigns/launch/design.mjs --render` also writes `previews/*.png` and `contact-sheet.png`, and runs the layout QA).

| Format (formats.json) | Size | Palette | Copy file | Artwork | Motif |
|---|---|---|---|---|---|
| instagram-post 4:5 | 1080 x 1350 | primary | `post-launch.copy.json` | `social/post-launch.svg` | bracket-sprout |
| instagram-post 4:5 | 1080 x 1350 | primary | `post-green.copy.json` | `social/post-green.svg` (Green Revolution) | hand-soil |
| instagram-post 4:5 | 1080 x 1350 | primary | `post-build.copy.json` | `social/post-build.svg` (Build With Us) | table-chair |
| carousel-slide x 4 | 1080 x 1350 | primary | `carousel-filter.copy.json` | `social/carousel-1.svg` … `carousel-4.svg` | question-sprout, bracket-sprout, key-sun, table-chair |
| story | 1080 x 1920 | night | `story-night.copy.json` | `social/story-night.svg` (Build With Us) | moon-eye |
| story | 1080 x 1920 | primary | `story-green.copy.json` | `social/story-green.svg` (Green Revolution) | calendar-sprout |
| instagram-post 1:1 (LinkedIn; no LinkedIn format exists, this is the closest) | 1080 x 1080 | primary | `linkedin-people.copy.json` | `social/linkedin-people.svg` | hand-blocks |
| web-banner | 970 x 250 | primary | `banner-build.copy.json` | `web/banner-build.svg` | bracket-sprout |
| thumbnail | 1280 x 720 | primary | `thumbnail-builds.copy.json` | `social/thumbnail-builds.svg` | chip-tree |
| poster | A3/A2 (1190 x 1684) | primary | `poster-organic.copy.json` | `print/poster-organic.svg` | chip-tree |
| landing-hero | 1440 x 810 | primary | `hero-organic.copy.json` | `web/hero-organic.svg` | chip-tree |
| story video (title card) | 1080 x 1920, 6 s | night | `story-title-card.copy.json` | `video/story-title-card.svg`, plan in `video/storyboard.md` | type only |

Instagram and LinkedIn captions are in the `caption` field of each post's copy file.

Layout: feed posts and slides follow `post-4x5-single-focal` (art above, one text group on the bottom margin; brand moved directly under the headline for O4); stories follow `story-stacked` with every word inside the safe area (top 14%, bottom 35%, sides 6%) and the art below, allowed to run into the overlay band; banner `banner-strip`; thumbnail `thumbnail-split` (bottom-right stamp corner kept clear); hero `hero-split`; poster `poster-single-focal`. Margins 8% of the short side (10% on the banner). Type sizes from the style's `typography.json`: headline cap height 5.1% (posts), 4.5% (slides), 3.85% (stories), 5.4% (square), 12.5% (thumbnail), 12.2% (banner), 4.9% (poster), 84 px (hero); body at or above each format's minimum. Ink line about 1.9% of the short side (the references run 1.5–2%; the style's figure is 2.25%), headline in Bricolage 800 so its stems sit near the line weight.

## 10. Headlines (W3)

1. **Does it matter? Then it gets built.** (chosen: launch post)
2. **You bring the purpose. We bring everything else.** (chosen: Build With Us post)
3. **Not carbon credits. Dirt under the nails.** (chosen: Green Revolution post)
4. One question decides what XOOTEQ builds (chosen: carousel hook)
5. Degrees don't build things. People do. (chosen: LinkedIn)
6. An idea that won't let you sleep? (chosen: night story)
7. New trees, every quarter, in every city. (chosen: green story)
8. Engineer the organic tomorrow. (the site's tagline: poster and hero)
9. What XOOTEQ actually builds (thumbnail)
10. Build here. No pitch deck required. (banner)
11. People who can't stop building. (title card)
12. If it doesn't matter, it doesn't ship.
13. No pitch deck. Just what you've built.
14. A productive home for your obsession
15. Value over valuation.
16. Grow together or don't grow at all.
17. We reply to everyone. Even you.
18. Your idea, our GPUs.
19. Code that plants trees
20. Fun is fuel.
21. Software, films, forests and a table
22. Pull up a chair.

Test 1 against 2 as the lead post (O10).

## 11. Check before sign-off

- [x] Passes the grunt test: a technology R&D company; it builds what matters and gives builders the table; tell it what you're building (S8)
- [x] One message only (W1)
- [x] Customer is the hero: "you" at least as often as "we" in every piece (S1, checked)
- [x] Brand name or logo beside the headline (O4): mark + name directly under every headline; in the thumbnail headline itself
- [x] Words and image add to each other, not repeat (W5)
- [x] Still makes sense in five years (P3)
- [x] `npm run check:copy -- products/xooteq`: 13 pieces in 12 files, 0 errors, 0 warnings (only O5 "no numbers" tips, because the site gives no figures)
- [x] Colours from the brand palette only (design.mjs refuses any other hex); text 11.05:1 on both grounds, button labels 18.6:1 and 11.05:1
- [x] Layout QA (in the browser): every text box inside its safe area, no text overlapping text: 0 problems

## 12. Scorecard (approaches/humanist-minimal/research.md section 6)

0 = no, 1 = partly, 2 = yes. Item 9 (motion) does not apply to still pieces, so they are scored out of 18 (pass = 14.4, the same 80% as 16/20).

| Piece | 1 Reads in 2 s | 2 Two symbols | 3 ≥40% empty (measured) | 4 Ink line | 5 Organic shapes | 6 One combination, one accent | 7 Pairing, 3 sizes | 8 Weight matches line | 10 Warm, not cute | Total |
|---|---|---|---|---|---|---|---|---|---|---|
| post-launch | 2 | 2 | 2 (67%) | 2 | 2 | 2 | 2 | 2 | 2 | 18/18 |
| post-green | 1 | 2 | 2 (65%) | 2 | 2 | 2 | 2 | 2 | 2 | 17/18 |
| post-build | 2 | 2 | 2 (64%) | 2 | 2 | 2 | 2 | 2 | 2 | 18/18 |
| carousel-1 | 2 | 2 | 2 (60%) | 2 | 2 | 2 | 2 | 2 | 2 | 18/18 |
| carousel-2 | 2 | 2 | 2 (60%) | 2 | 2 | 2 | 2 | 2 | 2 | 18/18 |
| carousel-3 | 1 | 2 | 2 (66%) | 2 | 2 | 2 | 2 | 2 | 2 | 17/18 |
| carousel-4 | 2 | 2 | 2 (70%) | 2 | 2 | 2 | 2 | 2 | 2 | 18/18 |
| story-night | 2 | 2 | 2 (64%) | 2 | 2 | 2 | 2 | 2 | 1 | 17/18 |
| story-green | 1 | 2 | 2 (67%) | 2 | 2 | 2 | 2 | 2 | 2 | 17/18 |
| linkedin-people | 1 | 2 | 2 (67%) | 2 | 2 | 2 | 2 | 2 | 2 | 17/18 |
| banner-build | 1 | 2 | 2 (67%) | 2 | 2 | 2 | 2 | 2 | 2 | 17/18 |
| thumbnail-builds | 2 | 2 | 2 (42%) | 2 | 2 | 2 | 2 | 2 | 2 | 18/18 |
| poster-organic | 2 | 2 | 2 (67%) | 2 | 2 | 2 | 2 | 2 | 2 | 18/18 |
| hero-organic | 2 | 2 | 2 (60%) | 2 | 2 | 2 | 2 | 2 | 2 | 18/18 |
| story-title-card (video) | 1 (type only) | 0 (no image) | 2 | – | – | 2 | 2 | – | 2 | style 9/12 applicable; video scorecard 18/20 (`video/storyboard.md`) |

Notes on the 1s: the hand under the soil reads a beat slower than the braces; the key-sun could read as a framed picture at a glance; the calendar's sprout is small at phone size; the LinkedIn hand is stylised (after the globe-and-hands reference); the banner's drawing is small at 250 px; the moon with an eye leans toward cute, so it stays on one piece only.

## 13. How we'll measure it (O10, P5)

- Success metric: applications to hello@xooteq.com and beta sign-ups at xooteq.com/creation (no baseline known).
- What we'll test: launch post (headline 1) against the Build With Us post (headline 2) as the lead.
- Evergreen version after launch: the poster and web hero ("Engineer the organic tomorrow." with the chip-tree).

## 14. Open questions for the user

1. Approve style, palette 207 (and the dark "night" version) and the pairing, so `color.status` can become "chosen".
2. Any numbers we may use: trees planted, cities, builders hosted, products shipped, DUMBORD films? (Every O5 tip in the copy check is for lack of these.)
3. Testimonials or named builders/partners who agreed to be quoted?
4. The internal problem and the stakes for the audience, in XOOTEQ's words (BrandScript fields left empty).
5. The wordmark as a vector file (the site shows custom wide lettering in its share images); designs use the mark plus "XOOTEQ" set in Bricolage Grotesque until then.
6. Campaign dates, and where the poster will hang (sets size and quantity).
7. Should the thumbnail's video exist (what is it, and how long)? Music for the story video?
8. Is the beta (xooteq.com/creation) open to everyone, and is there a public way to join a Green Revolution planting day? That would give the green pieces a stronger direct call to action.
