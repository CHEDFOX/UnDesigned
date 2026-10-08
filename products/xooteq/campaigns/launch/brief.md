# Creative brief: XOOTEQ launch (redo)

**Campaign:** launch, rebuilt from the brand's core (`products/xooteq/identity.json`) and the content strategy (`strategy.md`).
**Date / deadline:** to confirm.
**Owner:** to confirm.
**Status:** palette, type and style are proposals (`brand.json` → `color.status: "placeholder"`) awaiting approval.

What changed from the rejected first round: the original XQ monogram (`assets/logos/icon-512.png`) replaces the redrawn mark; the brand's own photographs replace hand-drawn doodles; the pastel sage Humanist Minimal look is replaced by Commercial Modernism on Wada 340 dark (the closest the guide gets to the site's near-black, electric green and orange); and the copy is written from the core instead of lifting site lines.

## 1. Research (O1)

- **What it is:** a technology R&D company (XOOTEQ LAB PRIVATE LIMITED) that builds software and AI (products Plutto and Tailzu), makes AI films through its studio DUMBORD (started 2025), runs the Green Revolution (every quarter, in every city it works in, it plants trees, protects green spaces and spreads awareness; not carbon credits), and gives builders aged 18 to 35 a table: workspace, living space, hardware, GPU access, dev infrastructure, peers, and resources, connections and funding when it fits. Everything passes one filter: "Does it matter?"
- **What customers say:** nothing on record yet (no testimonials in the source). Open question.
- **What competitors say (so we must not):** accelerator talk (demo days, pitch decks, cohorts, "unicorns"), agency talk, carbon-offset language.

## 2. Audience (P2, S2)

- **The one person:** a 23-year-old who has built something on their own (a model, a short film, a tool) and has an idea that keeps them up, but no hardware, no room and no peers good enough to push them.
- **What they want:** a place, compute and people, without performing for gatekeepers.

## 3. Problem (S3)

- **External:** no workspace, no GPUs, no dev infrastructure.
- **Internal:** being judged on degrees and decks instead of what they made.
- **Philosophical:** "Degrees don't build things. People do." (the brand's belief)

## 4. The one thing (W1)

> If what you're building matters, there's a table for you at XOOTEQ.

## 5. Dramatic truth and proof (W2, O5, S4)

- **Dramatic truth:** a technology company that proves its values with dirt under its nails: it plants trees every quarter where it works, and replies to every applicant.
- **Proof (facts only):** the four parts; the offer list; the three steps; "We respond to everyone. No automated rejections. No form letters."; DUMBORD est. 2025; Plutto and Tailzu product lines. No numbers of trees, cities or builders exist in the source, so none are used.

## 6. Big idea (O2, W8)

> **Does it matter?** Every piece shows one thing that grows (a sprout, a tree, an idea on paper, a beam rising) and asks the brand's one question, so builders recognise themselves in the answer.

## 7. Call to action (S6)

- **Direct:** tell XOOTEQ what you're building at hello@xooteq.com.
- **Transitional:** join the beta at xooteq.com/creation; join the Green Revolution at xooteq.com/green-revolution; vote or answer in a story sticker.
- **Long term (P4):** a list of builders and beta members; followers who share the manifesto.

## 8. Stakes and success (S7)

- **If they do nothing:** the idea stays on a laptop at 2 am.
- **After they act:** a seat at the table and something shipped that matters.

## 9. Style, palette, type (CLAUDE.md step 4)

| Choice | What | Why (one line) |
|---|---|---|
| Style | `commercial-modernism` | Its method (one hero, bold viewpoint, one diagonal, words in planned bands, duotone photos, a fade into Black) fits a cinematic, photo-led, bold-type brand and is how the site's own og cards already work; Humanist Minimal's pastel doodles were rejected. |
| Palette | Wada **340** dark (`primary`): Black ground, White headlines, Sea Green accent, Neutral Gray body, Peach Red warm signal; 340 light (`daylight`) for one piece | The one combination holding all three site signals: Black (#0A0A0A), the most electric green that shares a combination with Black and an orange (Sea Green for #00E676), and Peach Red (Delta E about 6 from #FF6B35). Sea Green on Black 7.1:1, White 18.6:1, Neutral Gray 9.95:1, Peach Red 5.5:1. |
| Type | `schibsted`: Schibsted Grotesk 800/400 + JetBrains Mono 500 | Rated core in the style; the closest pairing to Syne + DM Sans + JetBrains Mono (the mono is the site's own). Syne itself is not in the guide. |
| Marks | Original XQ monogram on its own white square, next to XOOTEQ in tracked capitals | The site never shows a reversed monogram, so it is placed as is; nothing redrawn. |
| Photos | The brand's own (`assets/photos/`), duotoned inside 340: Black→Sea Green→White, or Black→Peach Red→White for warm light | CM's photography rule; keeps every piece on palette while keeping the glow. |

Not chosen and why: Posterize (bans all text over photos and pushes light grounds), Neon Surf (cartoon heroes, needs approval for fluorescents), Negative Space (quiet small type, light grounds), Bauhaus (no photos as heroes, primaries).

## 10. Formats and deliverables

Previews in `previews/`, all pieces on `contact-sheet.png`, SVGs in `social/`, `web/`, `print/`, `video/`. Overlay measurements in `overlay-results.json`; contrast of every text element against the final composite (text hidden, worst-case pixels) in `qa-contrast.json`.

| # | Piece (file) | Pillar | Format | Composition | Idea | Research finding used | Copy file |
|---|---|---|---|---|---|---|---|
| 1–5 | `social/carousel-beliefs-1…5.svg` | Does it matter? | carousel-slide 4:5 | type-led; a Sea Green beam (three tapering speed lines) zigzags at 16° across all five slides and ends in the CTA on slide 5 | One belief per slide, what it means for you, the filter at the end | pop-out, first-glance; implied motion of diagonals (Kourtzi & Kanwisher 2000); repetition with variation; carousel ends on the CTA | `carousel-beliefs.copy.json` |
| 6 | `social/post-seedling.svg` | Dirt under the nails | instagram-post 4:5 | monument (low horizon, sprout looms) + top lettering zone + bottom band | "Good infrastructure has roots": a tech word on a soil picture | picture-superiority, photo-saliency (text beside the subject), word-picture figure (W5) | `post-seedling.copy.json` |
| 7 | `social/story-green.svg` | Dirt under the nails | story 9:16 + poll sticker | stacked: brand, headline, CTA on Black; poll sticker over the canopy | "Did you plant anything this year?" Yes / Not yet | touch-centre and story safe areas (top 14%, bottom 35%, sides 6%) | `story-green.copy.json` |
| 8 | `print/poster-tree.svg` | Dirt under the nails | poster (A-ratio) | monument: horizon at 75%, tree looming, Neutral Gray lettering band (21%) with XOOTEQ at 74% of the width | "Leave more life than you found." | first-impression (one silhouette on black); Pieters & Wedel 2004 (picture + big lettering + brand) | `poster-tree.copy.json` |
| 9 | `social/carousel-build-1.svg` | The table | carousel-slide 4:5 | full-bleed photo + calm region + band; a Sea Green "table edge" rule runs at the same height on all four slides | "The idea that keeps you up needs a table." | real-photos; photo-saliency (screen and lit paper hold the eye, words in the calm black) | `carousel-build.copy.json` |
| 10 | `social/carousel-build-2.svg` | The table | carousel-slide 4:5 | grid-of-n (2 × 3) on the table edge | What you get | grouping, scan-patterns | same |
| 11 | `social/carousel-build-3.svg` | The table | carousel-slide 4:5 | diagonal: three airbrushed steps rising at 24° to the Sea Green "Build" | Apply, Connect, Build as a climb | StoryBrand S5; implied motion; pop-out (only the last step is green) | same |
| 12 | `social/carousel-build-4.svg` | The table | carousel-slide 4:5 | split portrait: photo top, words and CTA on the table edge | "Every application gets an answer from a person." | gaze-cue (figures face each other, eye drops to the words); S6 | same |
| 13 | `social/linkedin-desk.svg` | The table | instagram-post 1:1 (LinkedIn) | full-bleed photo + calm region (the wall) + band | The empty desk is the invitation | word-picture figure (W5); calm-region placement measured | `linkedin-desk.copy.json` |
| 14 | `social/story-build.svg` | The table | story 9:16 + question sticker | tunnel: one-point perspective, the sticker at the vanishing point | "What are you building right now?" | converging lines lead to the focal point (CM perspective rule); touch-centre | `story-build.copy.json` |
| 15 | `web/banner-build.svg` | The table | web-banner 970×250 | split: words left, photo right with a fade | "Bring your idea. Find GPUs here." | left-lean; banner-blindness (one headline, one brand, one button, a real photo) | `banner-build.copy.json` |
| 16 | `web/hero-landing.svg` | Core | landing-hero 16:9 | split (hero-video-split-scrim): words on flat Black, trees fading in on the right | "Build technology that leaves more life behind." | left-lean, picture-captures; light streaks as speed lines pointing at the words | `hero-landing.copy.json` |
| 17 | `social/thumbnail-dumbord.svg` | We shoot the impossible | thumbnail 16:9 | split (thumbnail-photo-gaze): face left, gaze up-right to the headline | "No set. No crew." | faces-first, gaze-cue; bottom-right stamp zone kept clear | `thumbnail-dumbord.copy.json` |
| 18 | `social/post-dumbord.svg` | We shoot the impossible | instagram-post 4:5, daylight palette | object (Sachplakat): chrome wave on Neutral Gray, Black band | "The set is optional now." | MAYA; wear-out (one light piece keeps a dark feed from repeating) | `post-dumbord.copy.json` |
| 19 | `social/post-family.svg` | Made at XOOTEQ | instagram-post 4:5 | grid-of-2 split by a 26° diagonal (type-led) | Plutto and Tailzu with their own one-line descriptions, beta CTA | grouping; brand beside the headline (O4) | `post-family.copy.json` |
| 20 | `video/motion-tree.svg` | Dirt under the nails / Does it matter? | story 9:16, animated, 11.6 s | monument; the tree grows from seed in 10 crossfaded frames | "It starts in the dirt." → "Does it matter?" → "Then plant it." | brand early (zap-dispersion), first frame works as a still, one mover, static text, reading-time holds, no flashes | `motion-tree.copy.json`, `storyboard-motion-tree.md` |
| 21 | `video/motion-manifesto.svg` | Does it matter? | instagram-post 4:5, animated, 26.8 s | type-led sequence on the still carousel beam | The five beliefs one at a time, then the filter and CTA | on-screen-reading holds; one mover (the wipe); text changes on a cut; end-still | `motion-manifesto.copy.json`, `storyboard-motion-manifesto.md` |

Compositions used: type-led, monument, stacked, full-bleed + calm region + band, grid-of-n, diagonal, split, tunnel, object, grid-of-2 (10). Photo-led pieces: 12 (pieces 6–9, 12–18, 20).

## 11. Text over photos (media.json, overlay.mjs)

Treatments allowed in Commercial Modernism: calm-region (in a planned zone), solid-band, scrim (a two-stop fade into Wada Black, text on its solid end) and duotone. No plates, blur, tints or text shadows. Each photo is duotoned first, then `overlay.mjs` `recommendTreatment` runs on the treated pixels for each text zone (`overlay-results.json`), and the final composite is measured again with the text hidden (`qa-contrast.json`, 10th/90th percentile worst case).

| Piece | Photo (ladder) | overlay.mjs on the zone | What we did | Worst case on the final composite |
|---|---|---|---|---|
| post-seedling | green-seedling (green) | headline: calm-region, 5.5:1, busyness 0.12; band zone: scrim needed (busyness 0.48) | headline in the calm top over a fade into Black; sub and CTA on a solid band (stronger than the scrim) | 7.1:1 (Sea Green label lowest; White headline far higher) |
| story-green | hero-trees (green) | headline zone: scrim; sticker zone: busy (0.44), worst 1.4:1 | moved all words onto solid Black above the photo; only the opaque poll sticker sits on the canopy | 7.1:1 |
| poster-tree | tree frame 120 (green, black point lifted) | image edge under the headline: scrim needed | headline and sub on flat Black above the image, a fade at the image top, a solid Neutral Gray band below | 7.1:1 |
| carousel-build-1 | build-hands (warm) | calm-region, 18.6:1, busyness 0 | headline in the calm black left of the screen; sub on the band below the table edge | 5.5:1 (Peach Red label) |
| carousel-build-4 | builders-dreamers (green) | calm-region at top (13.2:1) and under the headline (11.2:1) | lockup on the photo's calm top; headline on Black below a fade | 5.6:1 |
| linkedin-desk | about-studio (green) | calm-region on the wall, 16.5:1, busyness 0.01 | headline on the wall; sub and CTA on a band over the desks | 6.5:1 |
| story-build | green-revolution-room (green) | calm-region, 17.3:1 | words on the dark ceiling; sticker at the vanishing point | 6.9:1 |
| banner-build | build-hands (warm) | photo side calm | words on flat Black left; photo fades in from the left | 7.1:1 |
| hero-landing | hero-trees (green) | calm-region where the fade begins, 6.2:1 | words on flat Black; a 360 px fade joins the photo | 7.1:1 |
| thumbnail-dumbord | creation-vr (warm) | calm | headline on flat Black right of the face, in its gaze | 5.5:1 |
| post-dumbord | xo-studio (neutral, mid set to the ground) | calm-region, ink 5.8:1 | headline on flat Neutral Gray above the object; sub and CTA on a Black band | 5.5:1 |
| motion-tree | 10 tree frames (green) | analyseFrames on the overlap: worst frame 1.5:1 (the canopy is bright) | cards placed above the frames on flat Black, so no text ever crosses the moving tree | 7.1:1 (final frame) |

Faces and subjects are never covered: avoid-zones were set for the sprout, the screen and hand, the two figures, the desks, the canopy and the VR face.

## 12. Headlines (W3)

Shortlist written for the pillars (chosen in bold): **Good infrastructure has roots.** · Push to soil. · Roots ship slower. Roots last. · **Leave more life than you found.** · Grown here, not offset. · **The desk is waiting. Bring the idea.** · **The idea that keeps you up needs a table.** · No pitch deck. Just what you built. · **Three steps. No pitch deck.** · **Every application gets an answer from a person.** · **What are you building right now?** · **Did you plant anything this year?** · **Bring your idea. Find GPUs here.** · **Build technology that leaves more life behind.** · **No set. No crew.** · **The set is optional now.** · Cinema without a location. · **Two tools from the same table.** · **It starts in the dirt.** · Value over valuation. (brand belief) · Does it matter? (brand filter).
Test (O10): "Good infrastructure has roots" vs "Push to soil" on the seedling post; "The desk is waiting" vs "No pitch deck. Just what you built." on LinkedIn.

## 13. Scorecard (Commercial Modernism, research.md 6: 10 items × 0–2, 16/20 to pass)

| Piece | 1 hero | 2 size | 3 view | 4 diag | 5 airbrush | 6 edges | 7 lettering/brand | 8 slogan | 9 accent/AA | 10 motion | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|
| beliefs 1–5 | 1 | 0 | 1 | 2 | 2 | 2 | 1 | 1 | 2 | 2 | 14 |
| post-seedling | 2 | 2 | 2 | 1 | 2 | 2 | 1 | 2 | 2 | 2 | 18 |
| story-green | 1 | 1 | 1 | 1 | 2 | 2 | 1 | 1 | 2 | 2 | 14 |
| poster-tree | 2 | 2 | 2 | 0 | 2 | 2 | 2 | 2 | 2 | 2 | 18 |
| build-1 | 2 | 2 | 1 | 1 | 2 | 2 | 1 | 2 | 2 | 2 | 17 |
| build-2 | 0 | 0 | 1 | 0 | 2 | 2 | 1 | 1 | 2 | 2 | 11 |
| build-3 | 2 | 1 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | 2 | 18 |
| build-4 | 1 | 1 | 1 | 0 | 2 | 2 | 1 | 1 | 2 | 2 | 13 |
| linkedin-desk | 1 | 1 | 2 | 1 | 2 | 2 | 1 | 2 | 2 | 2 | 16 |
| story-build | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | 2 | 19 |
| banner-build | 2 | 2 | 1 | 1 | 2 | 2 | 2 | 2 | 2 | 2 | 18 |
| hero-landing | 2 | 2 | 1 | 2 | 2 | 2 | 1 | 2 | 2 | 2 | 18 |
| thumbnail-dumbord | 2 | 2 | 2 | 1 | 2 | 2 | 1 | 2 | 2 | 2 | 18 |
| post-dumbord | 2 | 2 | 1 | 2 | 2 | 2 | 1 | 2 | 2 | 2 | 18 |
| post-family | 0 | 1 | 1 | 2 | 2 | 2 | 1 | 1 | 2 | 2 | 14 |
| motion-tree | 2 | 2 | 2 | 0 | 2 | 2 | 1 | 1 | 2 | 2 | 16 |
| motion-manifesto | 1 | 0 | 1 | 2 | 2 | 2 | 1 | 1 | 2 | 2 | 14 |

Item 5 scores 2 where gradients are two-stop within 340/Black/White or absent; item 10 scores 2 for stills (no motion to fail). Below 16: the type-led pieces (beliefs, build-2, family, manifesto) and build-4/story-green. They lose on CM's object rules (a single looming hero), which a manifesto of words cannot meet; they keep the style's diagonal, bands, edges and palette. Item 7 is the set's common weak spot: the brand word is large only on the poster and banner; elsewhere the lockup is small and fixed in position (distinctive-assets). See open questions.

## 14. Check before sign-off

- [x] Grunt test: what (a table, compute, peers; trees; films), how it helps, what to do next (S8)
- [x] One message per piece (W1)
- [x] "You" more than "we" (S1): checker passes
- [x] Original monogram + wordmark beside every headline (O4)
- [x] Words and image add to each other (W5)
- [x] `npm run check:copy -- products/xooteq`: 0 errors, 1 accepted warning (the brand's own belief contains "the best")
- [x] Colours only from 340 + Black + White (audited in design.mjs); every text element ≥ 4.5:1 on its worst-case pixels (`qa-contrast.json`, minimum 5.5:1)
- [x] Every SVG has viewBox, width, height; all ids, classes and keyframes prefixed `xq2-<piece>-`; fonts via `@import` in their own `<style>`; each file < 450 KB (largest 254 KB)

## 15. Open questions for the brand

1. Approve palette 340, pairing `schibsted` and Commercial Modernism (then `color.status` → "chosen")? Or add Syne + DM Sans to the guide's pairings so the wordmark matches the site exactly?
2. Is there a reversed (white) version of the XQ monogram, or a vector file? The pieces use the PNG on its white square because the site has no reversed version.
3. The circle-X line mark (`src/assets/logo.png`, `LogoMark.tsx`) is not used on the site: retired, or planned?
4. Real numbers for the Green Revolution (trees, cities, dates) and Build With Us (builders at the table) would let us replace the "every quarter" lines with specifics (O5). Any testimonials from builders (with consent)?
5. Is Build With Us free for builders? (We avoided saying so.)
6. Are the photos and tree frames licensed for social and print (some look generated)? Can DUMBORD supply a real film still for the thumbnail?
7. Should the brand word appear larger more often (CM wants it big), at the cost of the quieter lockup?
8. Cadence and owner (strategy.md), and the export of the two motion pieces to MP4 for social (the SVGs stop on their end frame; reduced motion shows the end frame).
