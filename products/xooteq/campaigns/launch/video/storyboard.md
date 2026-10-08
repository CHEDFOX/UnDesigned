# Storyboard: People who can't stop building (15 s story)

Filled from `templates/video/storyboard.md`. Rules: `foundations/video/video.json`, `foundations/layout/media.json`. Motion: `approaches/humanist-minimal/motion.json`. The last beat is the animated title card already made: `video/story-title-card.svg` (6 s, ends on a still).

## 1. The piece

| Field | Answer |
|---|---|
| Product | `products/xooteq/` |
| Campaign brief | `campaigns/launch/brief.md` |
| One message (W1) | "Does it matter?" is the one test at XOOTEQ, for its own work and for yours. |
| Big idea (O2) | Technology that grows: one plain tech symbol joined with one living thing, drawn by hand. |
| Content type | title-card / explainer (motion graphic, no footage) |
| Format(s) | story 9:16 (1080 x 1920) |
| Cuts | 15 s (this board). A 6 s cut = beat 6 alone (`story-title-card.svg`). |
| Placement | Instagram story / reel, autoplay muted, full screen, skippable by tap |
| Style | Humanist Minimal. Springs: `lively` (pop), `gentle` (text rise), `float`; easings: `draw` cubic-bezier(0.65,0,0.35,1), `exit` cubic-bezier(0.55,0,1,0.45); hold 700 ms minimum |
| Wada combination | 207, dark mode ("night"): ground Wada Black #111314, text Glaucous Green #b4cdc2 (11.05:1), accent Sudan Brown #a36752, paper Wada White |
| Type pairing | Bricolage Grotesque 800 / Figtree |
| Sound | Music: not chosen (question for the user). No voice-over needed; every word is on screen. No sonic logo exists yet. |
| Proof available | From the site only: workspace, living space, hardware, GPU access, dev infrastructure, peers; ages 18 to 35; "We respond to everyone." |

## 2. Beats

| # | Beat | 15 s | Shot (one focal point) | On-screen text | Words | Hold (s) | Motion (style move) | Sound | Principles |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Hook and first frame | 0–2 | Black ground; the paper crescent moon (story-night art) is already there; its eye blinks once | "An idea that won't let you sleep?" | 7 | 3.13 (runs into beat 2) | eye `blink` 220 ms at 0.8 s; nothing else moves | music in | O2, W1, S8 |
| 2 | Brand in | 0–3 | Same frame; XOOTEQ mark + name rise under the headline | "XOOTEQ" | 1 | 1.5 | `rise`, spring gentle (~660 ms) | | O4 |
| 3 | Problem | 3–5 | Cut: the moon exits up (`exit` 250 ms); one ink line draws across the ground as a table edge | "You bring the purpose." | 4 | 2.0 | `draw` 600 ms, then text `rise` | | S1, S3 |
| 4 | Product as hero | 5–9 | The table-and-chair drawing: legs draw on, paper top and the brown chair seat pop | "We bring everything else." then "Workspace. GPUs. Peers." (on a cut at 7 s) | 4 / 3 | 2.0 / 1.63 | `draw` 600 ms, `pop` (lively) per shape, stagger 50 ms | | W8, W5 |
| 5 | Proof | 9–10 (bridge, kept short) | Same drawing, held still | "We respond to everyone." | 4 | 2.0 (overlaps into 11 s; trim beat 6 open to 300 ms) | none (text cut only) | | S4, O5 |
| 6 | CTA and end card | 9–15 | `story-title-card.svg`: empty ground, headline rises, brand, CTA with the brown bar; holds still | "People who can't stop building." / "XOOTEQ" / "Email hello@xooteq.com" | 5 / 1 / 2 | 2.38 / 1.5 / 1.5 | title card timeline: headline 0.6 s, brand 2.98 s, CTA 3.64 s, still from 4.3 s to 6 s | music resolves | S6, O4 |

Checks: every hold fits its beat after the timing above; text changes only on cuts; one thing moves at a time; all text sits inside the story safe area (top 14%, bottom 35%, sides 6%).

## 3. First frame and end card

| Frame | Subject | Headline | Brand | CTA | Works as a still? |
|---|---|---|---|---|---|
| First frame / cover | Moon with one open eye | An idea that won't let you sleep? | XOOTEQ mark + name under the headline | (Email hello@xooteq.com, as in `social/story-night.svg`) | yes: it is `social/story-night.svg` |
| End card | Type on the night ground | People who can't stop building. | XOOTEQ | Email hello@xooteq.com | yes: the title card's un-animated state is the final frame |

## 4. Motion plan

| Item | Value | Source |
|---|---|---|
| Opening hold on ground or first frame | 600 ms (title card), first frame shown from 0 ms | `title-card.mjs` DEFAULTS.openMs |
| Arrival spring for text | `gentle` (stiffness 120, damping 20), settles in ~660 ms | motion.json springs + moves.rise |
| Arrival for objects | lines `draw` 600 ms; paper shapes `pop` on `lively` | motion.json moves |
| Exits | `exit` easing, 250 ms | motion.json easings.exit |
| Final hold | 1.7 s still (4.3–6.0 s of the card) | choreography.hold (700 ms min) |
| Loop | none | |
| Reduced-motion version | the title card shows its final frame; the full cut becomes three still cards with cuts (story-night, post-build art, end card) | video.json accessibility.reducedMotion |

## 5. Sound plan

| Item | Plan |
|---|---|
| Works with sound off? | Yes: the message is entirely on screen |
| Captions | Not needed (no speech) |
| Music | To choose with the user: calm, warm, unhurried; no drops timed to flashes |
| Voice-over | None |
| Sonic logo | None exists |
| Audio description | Not needed: all information is in text |

## 6. Accessibility and safety checklist

- [x] No flashes: the ground never changes; each element fades in once.
- [x] Reduced motion: final frame (built into `story-title-card.svg`).
- [x] Under 15 s, stops on a still; on the web, it stops by itself within 6 s (title card).
- [x] No speech, so no captions needed.
- [x] Key information is text.
- [x] Contrast: glaucous green on black 11.05:1 on every frame (flat ground, no footage).
- [x] Text, logo and CTA inside the story safe area.

## 7. Copy check

`story-title-card.copy.json` (format `story`) passes `npm run check:copy -- products/xooteq`. Beat 1 uses `story-night.copy.json` (passes).

## 8. Score (foundations/video/research.md section 12)

| # | Item | 0 / 1 / 2 | Note |
|---|---|---|---|
| 1 | First frame works as a still | 2 | It is the story-night post |
| 2 | Hook earns the first seconds | 2 | A question about the viewer, plus a moon that's awake |
| 3 | Brand early, pulsed, next to the headline | 2 | 0–3 s, again on the end card |
| 4 | One message, one focus per shot | 2 | |
| 5 | Story with the product as hero; real facts | 1 | Real facts only, but no proof beyond the offer list (no numbers available) |
| 6 | Pace varied; words get held shots | 2 | |
| 7 | Text still, safe, held for its reading time | 2 | |
| 8 | One move at a time; style springs; ends on a still | 2 | |
| 9 | Works with sound off, better with sound on | 1 | Music not chosen yet |
| 10 | Safe for everyone | 2 | |
| | **Total** | **18/20** | |
