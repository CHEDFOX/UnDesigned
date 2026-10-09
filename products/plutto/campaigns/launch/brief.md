# Creative brief

> **Rendered by the guide.** Every piece is drawn by the design engine from the copy files in this folder: `npm run design -- plutto launch --png` (outputs in `designs/`, contact sheet beside them). The style skin (`approaches/<style>/skin.mjs`) draws it; this product only adds its facts, copy, original marks, photos and its own motifs (`products/plutto/art.mjs`).

**Campaign:** Launch (social, web, print and motion, ahead of the iOS and Android release)
**Date / deadline:** unknown (the site says only "iOS & Android — soon")
**Owner:** Plutto, by xooteq Lab

Read first: `../../identity.json` (core, marks, signals), `strategy.md` (pillars and series), `../../messaging.json`. Designs: the guide's design engine (`npm run design -- plutto launch --png`, outputs in `designs/`). Storyboards: `storyboard-motion-orb-answer.md`, `storyboard-motion-wheel.md`.

## 0. Choices (proposed; colour status stays "placeholder" until approved)

| Choice | Pick | Why, in one line |
|---|---|---|
| Style | Negative Space | Plutto already speaks this way (a black void, one gold orb, "quiet depth"); its evidence is prestige, trust and quality (Pracejus, Olsen & O'Guinn 2006, 2013) and attention to the brand when clutter is low (Pieters, Wedel & Batra 2010); its palette rules allow dark grounds for night themes with text at 7:1. |
| Colour | Wada 255, dark: ground Black `#111314`, type White `#ffffff` (18.6:1), accent Pyrite Yellow `#cab356` | The only Wada combination with Black and a gold. Combination 149 has a closer gold (Olive Ocher) but a green-black ground. |
| Brand exception | The orb keeps the site's own gradient stops (`#f4d98a` → `#060401`, halo `#D4AF37` at 22%) | The orb is the brand's signature ("the single sacred place where gold lives"); recorded in `identity.json`. Gold appears only on the orb and the app icon; no other gradient or glow anywhere. |
| Type | `instrument`: Instrument Serif 400 (roman + italic), Instrument Sans 400/500, IBM Plex Mono for degrees | Nearest to the site's Cormorant Garamond + Inter (quiet, high-contrast display serif with a true italic over a neutral sans); rated core by Negative Space. Cormorant and Inter appear only inside the original wordmark. |
| Glyphs | Noto Sans Symbols with U+FE0E | Zodiac and planet signs as text, never colour emoji (open question: allowed outside pairings.json?). |
| Marks | `assets/logos/plutto-wordmark.svg` (the Nav lockup, unchanged) beside every headline; `assets/logos/plutto-app-icon.svg` (`app/icon.svg`, byte for byte) on stories, thumbnail and the app-launch post | The old pieces used a white ring-dot beside sans text: not the brand's mark. |
| Photo | `assets/images/floating-planet.png` (`public/floating-logo.png`) as JPEG in `media/` | Placed by `media.json`; composited with `lighten` over Wada Black so its black space becomes the palette's Black (a tint-class treatment; the rim and stars are untouched). `overlay.mjs`: every text zone is calm-region, no overlay, 18.6:1, busyness 0. |
| Hand face | none | Negative Space allows none. |

## 1. Research (O1)

- What it is: a voice-first astrology oracle. You enter your birth once and choose a tradition (Vedic, Western, Chinese, KP, numerology); the chart follows you, the voice changes with the lens, your memory is kept. Charts computed with Swiss Ephemeris, "the same source observatories use"; voice on OpenAI Realtime: interrupt it, hold it, switch traditions mid-sentence. 300+ classical yogas, 19 divisional charts, 7 dasha systems, 89 languages. Built by xooteq Lab. iOS and Android soon.
- What customers say: nothing yet (no reviews or testimonials exist). Example questions are labelled as examples.
- What competitors say, so we must not: twelve sun-sign boxes; predictions. We never claim Plutto predicts anything.

## 2. Audience (P2, S2)

- The one person: someone who has outgrown sun-sign horoscopes and wants to understand their own birth chart (inferred from the site; confirm with the team).
- What they want: to ask about their chart out loud and hear it in plain words, in the tradition they trust.

## 3. Problem (S3)

- External: horoscopes speak to a sun sign, not to a person's own chart.
- Internal: unknown (ask the team).
- Philosophical: unknown (ask the team).

## 4. The one thing (W1)

> Ask your own birth chart out loud, and it answers you in plain words.

## 5. Dramatic truth and proof (W2, O5, S4)

- The honest fact: the oldest way of asking meets a voice you can interrupt; it reads your chart, not your sun sign.
- Proof (site facts only): Swiss Ephemeris; 5 traditions; 89 languages; 19 divisional charts; 300+ classical yogas; 7 dasha systems; voice on OpenAI Realtime; built by xooteq Lab.

## 6. Big idea (O2, W8)

> The sky has been asked for thousands of years. Plutto is where it answers: one gold light in the dark that listens and speaks.

What the space stands for (NS1): the night sky people have always looked up at, and the quiet before an answer. The one object is always something the brand owns: the orb, a chart drawn precisely, the brand's planet photo, or the app icon.

## 7. Call to action (S6)

- Direct: plutto.space (open question: waitlist?).
- Transitional: ask your question in the story sticker; it may be answered in an Ask the sky post.
- Long term (P4): the questions people send become the series.

## 8. Stakes and success (S7)

- If they do nothing: another paragraph written for a twelfth of the world.
- After they act: your own chart, explained in plain words, by a voice that remembers you.

## 9. Formats and deliverables

Every piece: research finding it uses, composition (`foundations/layout/layout.json` → composition, plus the style's placements), layout template it starts from, and its scorecard total (research.md 6, out of 20; 16 ships; estimates by eye with the measured contrast and overlay checks).

| # | Piece (file) | Pillar | Idea | Composition (template) | Finding | Score |
|---|---|---|---|---|---|---|
| 1 | `social/post-ask-voice` 4:5 | Ask the sky | Two voices: your question as an italic line with a voice-memo trace, Plutto's answer as a roman line with a waveform leaving the orb | Dialogue; object low left facing into the field (`ns-post-4x5-gaze`) | Inward bias + gaze cue; W5 words and picture | 19 |
| 2 | `social/post-question` 1:1 | Ask the sky | The question is the object; the orb waits beside it | Type-led (`ns-square-headline-high`) | Pop-out by isolation; first-glance | 18 |
| 3 | `social/post-twelve-boxes` 4:5 | Not twelve boxes | Twelve small boxes at the top; the orb alone in the open field | Two masses across the field, object low right (`ns-poster-object-low`) | Pop-out (isolation + colour); NS1 space = freedom | 19 |
| 4 | `social/post-natal-wheel` 1:1 | Not twelve boxes | A precise sample chart (degree ticks, glyphs, 12 houses from the ascendant, 7 planets) with the orb at its centre | Optical centre, words in a foot strip (`ns-poster-corner-type`) | Centre bias; fluency (precision, symmetry) | 17 (wheel is 59% of the side; empty ground about 55%) |
| 5 | `social/post-photo` 4:5 | Not twelve boxes | The brand's planet small and low, the black sky as the ground | Full-bleed photo, calm region (`ns-post-4x5-photo`) | Real photos; calm-region; picture superiority | 19 |
| 6 | `social/post-coming-soon` 1:1 | Coming soon | The original app icon alone | Optical centre, corner type | Distinctive assets; news (O6) | 18 |
| 7 | `social/linkedin-craft` 1:1 | The craft | One sign's 30 degrees as a hairline ruler, ticks every 10′, the orb resting at 17°22′ Leo (sample) | Horizon: a full-bleed hairline, words below | O5 specific facts; prestige of space; fluency | 18 |
| 8–13 | `social/carousel-five-lenses-1…6` 4:5 | Five lenses | One thread crosses every seam and the orb travels into each lens: hook, Vedic square chart (orb in house 1), Western wheel with unequal houses, five elements (generating circle, controlling star), KP (27 nakshatras, 9 Vimshottari sub-lords each), numerology (P-L-U-T-T-O = 23, 2 + 3 = 5 on the orb) | Carousel panorama; each slide headline high, lens centred, body low | Carousel story (formats.json); picture superiority; repetition | 18 each (lenses are 44–55% of the side) |
| 14 | `social/story-ask` 9:16 | Ask the sky | App icon + wordmark, the question in italic, a question-sticker zone, the orb below it | Stacked in the live band (`ns-story-float`) | Touch-centre; P4 owned audience | 18 |
| 15 | `social/story-planet` 9:16 | Coming soon | The planet's rim low as a horizon, headline and sticker zone in the sky | Full-bleed photo, low horizon (`ns-story-video` skeleton) | Real photos; first-frame; calm-region | 18 (planet larger than 6% of the frame) |
| 16 | `print/poster-photo` A-series | Brand | "We have always asked the sky. Now it answers." over the planet's horizon | Full-bleed photo, sky as the ground (`ns-poster-photo`) | Prestige of white space; real photos; calm-region | 18 |
| 17 | `web/thumbnail` 16:9 | Ask the sky | Big serif headline, app icon, the orb at full glow; duration corner clear | Split, words on the reading-start side | Left-lean; first-glance (one bright thing) | 19 |
| 18 | `web/web-banner` 970×250 | Ask the sky | Headline, wordmark, orb in the gap, outlined button | Strip with wide gaps (`ns-banner-strip`) | Banner blindness (one headline, one brand, one button) | 19 |
| 19 | `web/landing-hero` 16:9 | Brand | The site's own signature, the orb in a faint wheel, set on the guide's hero grid | Far-side split (`ns-hero-wide`) | Left-lean; grunt test (S8); text-whitespace | 18 |
| 20 | `motion/motion-orb-answer` 9:16 animated | Ask the sky | The orb arrives and breathes once; a question rises; the answer rises with its waveform; the brand settles | Stacked in the live band | video.json one-mover, on-screen-reading holds; peak-end | 19 |
| 21 | `motion/motion-wheel` 1:1 animated | Five lenses | The sign ring turns 24° (the ayanamsa): Western becomes Vedic; then the line | Optical centre, foot strip | Animation congruence (animate only what changes in the idea) | 18 |

Formats and copy: one `.copy.json` per piece (the carousel has one file with six slides). `npm run check:copy -- products/plutto`: 16 files, 0 errors, 0 warnings.

Technical: every SVG has a viewBox and width/height; ids, classes and keyframes are prefixed `pl2-<piece>-`; fonts by `@import`; the photo is a JPEG data URI (1024 px, 86%); every SVG is under 60 KB; text boxes are checked against margins and the story safe area (top 14%, bottom 35%, sides 6%) by the design engine. Previews: a PNG beside each SVG, `*-sticker-preview.png` for the stories, five frames per animation, `contact-sheet.png`.

## 10. Headlines (W3)

1. Why do I keep starting over? (example question)
2. What is this year asking of me?
3. You were never one of twelve. ★
4. Drawn for the minute you were born. ★
5. Your birth sky, explained in plain words.
6. Every degree computed with Swiss Ephemeris.
7. One sky. Five ways of reading it. ★
8. Vedic, for exactness.
9. Western, for psychology.
10. Chinese, for the elements.
11. KP, for the finer divisions.
12. Numerology, for measuring a name.
13. What would you ask your chart first?
14. Soon, the sky answers back.
15. We have always asked the sky. Now it answers.
16. Talk to your birth chart.
17. Your birth chart, out loud.
18. Ask your own birth chart, out loud.
19. Soon, your chart will talk back.
20. Western to Vedic: the same sky, turned 24°.
21. Why does this year feel so slow? (example question)
22. A sun sign is a twelfth of the sky. (not used)

Test (O10): 3 vs 7 as the first paid post; 15 vs 16 for video thumbnails.

## 11. Check before sign-off

- [x] Passes the grunt test: what we offer, how it helps, what to do next (S8)
- [x] One message only (W1)
- [x] Customer is the hero, "you" more than "we" (S1)
- [x] Wordmark beside the headline in every piece (O4)
- [x] Words and image add to each other, not repeat (W5)
- [x] Still makes sense in five years (P3)
- [x] `npm run check:copy` passes with no errors
- [x] Colours from the brand palette (plus the orb and icon as brand elements); long copy is short (O8)

## 12. How we'll measure it (O10, P5)

- Success metric: sticker replies and saves on the carousel (interest in the traditions), clicks to plutto.space.
- What we'll test: headline 3 vs 7; photo vs drawn pieces.
- Evergreen version after launch: the Five lenses carousel and the Ask the sky series.
