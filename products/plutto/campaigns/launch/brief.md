# Creative brief

**Campaign:** Launch (social, web and print, ahead of the iOS and Android release)
**Date / deadline:** unknown (the site says only "iOS & Android — soon")
**Owner:** Plutto, by xooteq Lab

**Style:** Negative Space (`approaches/negative-space`). Set per campaign, as in `products/sample-bakery/campaigns/quiet-mornings`: `brand.json` keeps `approach: humanist-minimal` only because the hub build (`tools/brand-hub/build.mjs`) needs a drawing engine (`illustration.mjs`) for the brand's approach, and Negative Space has none yet. With `negative-space` in `brand.json` the whole build (and every other product's hub) fails.

## 0. Choices (proposed; colour status stays "placeholder" until approved)

| Choice | Pick | Why, in one line |
|---|---|---|
| Style | Negative Space | Plutto already speaks this way (a black void, one gold orb, "quiet depth"); the style's own vocabulary lists the night sky and moon, its evidence is prestige, trust and quality (Pracejus et al. 2006, 2013), and it allows dark grounds "for night themes" with text at 7:1. |
| Not chosen | Humanist Minimal (12/14) | Scores higher on warmth, but cut paper and wobbly ink would turn an exact, literary oracle into something cute. |
| Colour | Wada 255 in dark mode, with roles: ground Black `#111314`, ink and text White `#ffffff`, accent Pyrite Yellow `#cab356` | 255 is the only combination that holds both Wada Black (closest to the site's `#000` void) and a gold; Pyrite Yellow is the nearest gold that sits with Black (the site's `#D4AF37` is not in the Wada palette; Olive Ocher `#d6b43e` is closer but only pairs with Deep Slate Green, a visibly green-black ground). |
| Trade-off | — | Pyrite Yellow is a little greener and paler than `#D4AF37`, and dark yellows are among the less-liked colours (colour-valence), so it stays on 0.2–2% of each piece, only on the orb: the same rule the site's code states ("the single sacred place where gold lives"). Negative Space prefers light grounds by default; dark is its stated exception for night themes. Calamine Blue (support, echoes the blue planet rim in `public/floating-logo.png`) and Raw Sienna are kept out of the launch. |
| Type | `instrument`: Instrument Serif 400 over Instrument Sans 400/600 | Rated core by Negative Space (and by Humanist Minimal). The site actually sets Cormorant Garamond (light) over Inter in `app/layout.js`, while its README says Playfair Display; neither is in `pairings.json`. Instrument Serif is the closest quiet, high-contrast, narrow display serif with an italic. |
| Hand face | none | Negative Space allows no handwriting, and an oracle that reads charts should not look scribbled. |
| Logo | `assets/logos/plutto-mark.svg` (the site's `app/icon.svg`: ring and dot) next to the name in Instrument Sans | Drawn in white in the pieces so the orb stays the only gold. `assets/images/floating-planet.png` is the site's planet image, kept for reference. |

## 1. Research (O1)

- What the product is and how it works: a voice-first astrology oracle. You enter your birth once and choose a tradition (Vedic, Western, Chinese, KP, numerology); the chart follows you, the voice changes with the lens and your memory is kept. Charts computed with Swiss Ephemeris; voice on OpenAI Realtime, so you can interrupt it, hold it and switch traditions mid-sentence. 89 languages, 19 divisional charts, 300+ classical yogas, 7 dasha systems. Built by xooteq Lab. iOS and Android coming soon.
- What customers say: nothing yet (no reviews or testimonials on the site).
- What competitors say, so we must not: horoscopes for twelve sun signs. The site's own line: "an astrology app, but not a horoscope … it does not deal in twelve boxes." We never claim that Plutto predicts anything.

## 2. Audience (P2, S2)

- The one person: someone who wants to understand their own birth chart and has outgrown sun-sign horoscopes (inferred from the site; confirm with the team).
- What they want: to ask about their chart out loud and hear it in plain words, in the tradition they trust.

## 3. Problem (S3)

- External: horoscopes speak to a sun sign, not to a person's own chart.
- Internal: unknown (ask the team).
- Philosophical: unknown (ask the team).

## 4. The one thing (W1)

> Ask your own birth chart out loud, and Plutto answers.

## 5. Dramatic truth and proof (W2, O5, S4)

- The honest fact: it is a voice, not a page of text; you can interrupt it, hold it and switch traditions mid-sentence.
- Proof (site facts only): Swiss Ephemeris; 5 traditions; 89 languages; 19 divisional charts; 300+ classical yogas; 7 dasha systems; built by xooteq Lab.

## 6. Big idea (O2, W8)

> The dark is the sky people have watched for thousands of years; the one gold light in it is Plutto, the point that answers back.

What the space stands for (NS1): the night sky, and the silence before an answer. The object is always the gold orb (the site's Oracle, flattened to one disc); each piece gives the orb one relation to the dark:

| Piece | Object and space | Layout |
|---|---|---|
| post-1 | the orb's voice (three fading arcs) travelling into the empty field toward the words | `ns-post-4x5-gaze` |
| post-2 | the orb at the heart of a twelve-part wheel: your chart, not twelve boxes | optical centre, words in a foot strip (`ns-poster-corner-type`) |
| post-3 | one disc cut in two, half white and half gold, the gold half dropped: the lens changing mid-sentence | `ns-poster-object-low` |
| carousel 1–4 | one hairline orbit runs across all four slides; the orb rises out of slide 1 and sets into slide 4 as you swipe | text high, orbit low |
| story-1 | the orb's voice rising toward the words | `ns-story-float` |
| story-2 | the orb rising over the curved hairline edge of a planet (the site's floating-planet image, redrawn) | `ns-story-float` |
| linkedin | the orb inside one tilted orbit: "every system" | `ns-square-headline-high` |
| web-banner, hero, thumbnail | the orb's voice facing back toward the words | `ns-banner-strip`, `ns-hero-wide` |
| poster | the orb half-risen on one hairline horizon: thousands of years of watching it rise | `ns-poster-object-low` |

## 7. Call to action (S6)

- Direct: Visit plutto.space (hero: "See how it works", which leads to /about).
- Transitional: none exists yet (no waitlist, email list or social handle on the site). Ask the team.
- Long term (P4): unknown until a waitlist or app-store links exist.

## 8. Stakes and success (S7)

- If they do nothing: unknown (not stated on the site; ask).
- After they act: their own chart, explained in plain words, in the tradition they chose, by a voice that remembers them.

## 9. Formats and deliverables

All generated by `design.mjs` (`node products/plutto/campaigns/launch/design.mjs` after `npm run build -- plutto`). PNG previews sit next to each SVG; everything together in `contact-sheet.png`.

| Format (formats.json) | Size | Palette | Copy file | Artwork | Empty ground |
|---|---|---|---|---|---|
| instagram-post 4:5 | 1080×1350 | primary (255 dark) | `post-1-out-loud.copy.json` | `social/post-1-out-loud.svg` | 84% |
| instagram-post 4:5 | 1080×1350 | primary | `post-2-twelve-boxes.copy.json` | `social/post-2-twelve-boxes.svg` | 83% |
| instagram-post 4:5 | 1080×1350 | primary | `post-3-mid-sentence.copy.json` | `social/post-3-mid-sentence.svg` | 85% |
| carousel-slide ×4 | 1080×1350 | primary | `carousel.copy.json` | `social/carousel-1…4.svg` | 87–92% |
| story ×2 | 1080×1920 | primary | `story-1-talks-back.copy.json`, `story-2-languages.copy.json` | `social/story-1-talks-back.svg`, `social/story-2-languages.svg` | 90%, 94% |
| instagram-post 1:1 (LinkedIn; formats.json names this format "Instagram / LinkedIn post") | 1080×1080 | primary | `linkedin-square.copy.json` | `social/linkedin-square.svg` | 79% |
| web-banner | 970×250 | primary | `web-banner.copy.json` | `web/web-banner.svg` | 87% |
| landing-hero | 1440×810 | primary | `landing-hero.copy.json` | `web/landing-hero.svg` | 89% |
| thumbnail | 1280×720 | primary | `thumbnail.copy.json` | `web/thumbnail.svg` | 74% |
| poster | A2/A3 (1000×1414) | primary | `poster.copy.json` | `print/poster.svg` | 89% |
| story title card (video) | 1080×1920, 10 s | primary | `story-1-talks-back.copy.json` | `video/story-title-card.svg`, plan in `video/storyboard.md` | — |

Sizes used (typography.json → sizes.byFormat): post headline 92 px (cap 4.9% of height), body 38, small 30; carousel 80/36/28 (cap 4.3%); square 80/34/27; story 84/40/32 (cap 3.2%); banner 42 (cap 12%)/18/16; hero 62/21/17–20; thumbnail 132 (cap 13.2%)/34; poster 66 (cap 3.4%)/25/20. Margins 10% of the short side; stories keep everything in the live band (top 14%, bottom 35%). Every text line was measured in Chromium with the real fonts and sits inside the margins or safe area. Ids in each SVG are prefixed `pl-<piece>-` (title card `pl-tcs-`).

## 10. Headlines (W3)

1. **Ask your birth chart, out loud.** (chosen: post-1)
2. **Not twelve boxes. Your own chart.** (chosen: post-2)
3. **Switch traditions mid-sentence.** (chosen: post-3)
4. **Talk to your chart. It talks back.** (chosen: story-1, title card)
5. **Ask in any of 89 languages.** (chosen: story-2)
6. **Every reading. Every system. One voice.** (chosen: LinkedIn; adapted from the site's title)
7. **An oracle that speaks back.** (chosen: thumbnail, carousel 4; the site's own line)
8. **Thousands of years of observation. Now you can ask.** (chosen: poster; first half is the site's line)
9. **An astrology oracle you can talk to.** (chosen: hero)
10. **Talk to your birth chart.** (chosen: banner)
11. Enter your birth once. Then ask.
12. Choose from 5 traditions.
13. Your chart, in your own words.
14. Interrupt the oracle. It listens.
15. Vedic for exactness, Western for psychology.
16. The pattern, named in plain words.
17. One birth. Five traditions.
18. Hold the answer. Ask again.
19. A voice that remembers your chart.
20. Ask the sky something specific.
21. Your memory is kept.
22. Not a horoscope. A conversation.

Test 1 against 4 in the feed (O10): "out loud" vs "it talks back".

## 11. Check before sign-off

- [x] Grunt test: a voice astrology oracle, it reads your own chart, visit plutto.space (S8)
- [x] One message only (W1)
- [x] Customer is the hero: "your chart", "you can"; no "we" anywhere (S1)
- [x] Brand mark and name directly under every headline (O4)
- [x] Words and image add to each other: no picture shows what its line says (W5)
- [x] Still makes sense in five years (P3); no claims of prediction
- [x] `npm run check:copy -- products/plutto`: 0 errors, 0 warnings (tips only: no number in some headlines, by choice: Negative Space keeps lines short)
- [x] Colours from palette 255 plus Wada White only; white on Black is 18.6:1 (aim 7:1). O8: light-on-dark copy kept short (longest body 14 words)
- [x] Negative Space: one object, 74–94% empty ground, headline small on a margin, 10% margins, edges 15%+ or deliberately on the margin

## 12. Scorecard (approaches/negative-space/research.md section 6)

Items: 1 empty ground, 2 the space means something, 3 one object, 4 faces the open field, 5 deliberate edges, 6 one combination and accent ratio, 7 quiet headline + brand + 3 sizes + 2 weights, 8 contrast, 9 media, 10 motion. Still graphics have no media or motion: 9 and 10 are scored 2 as "not applicable", following the sample bakery practice; ready is 16/20.

| Piece | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | Total | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| post-1 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | – | – | 20 | orb 17% from the left edge; voice points at the words |
| post-2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | – | – | 20 | wheel is white ink (2%), gold only at its heart |
| post-3 | 2 | 2 | 2 | 1 | 2 | 2 | 2 | 2 | – | – | 19 | split disc has no front; placed low-right as a symmetric object |
| carousel 1–4 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | – | – | 19 | the slide count "n / 4" is a fourth text item; orb rests on the bottom margin on slides 1 and 4 (deliberate, "near") |
| story-1 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | – | – | 20 | |
| story-2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | – | – | 20 | the planet's rim is the one hairline |
| linkedin | 1 | 2 | 2 | 1 | 2 | 2 | 1 | 2 | – | – | 17 | 79% empty; most text of the set (LinkedIn wants facts); four text groups |
| web-banner | 2 | 1 | 2 | 2 | 2 | 2 | 2 | 2 | – | – | 19 | at 250 px tall the voice reads as a small icon |
| landing-hero | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | – | – | 20 | |
| thumbnail | 1 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | – | – | 19 | 74% empty: thumbnails need big words (cap 13%) |
| poster | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | – | – | 20 | |
| title card | 2 | 1 | 2 | 1 | 2 | 1 | 1 | 2 | – | 2 | 16 | the template centres the words and sets them large (≈130 px) with its own line breaks ("chart. It"); orb added and faded in first |

## 13. How we'll measure it (O10, P5)

- Success metric: visits to plutto.space from each placement (no waitlist exists yet).
- What we'll test: post-1 vs story-1 headline; the orbit carousel vs single posts.
- Evergreen version after launch: post-2 ("Not twelve boxes") and the poster.
