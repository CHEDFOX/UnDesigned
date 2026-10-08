# Storyboard: <piece name>

Copy this file to `products/<id>/campaigns/<campaign>/storyboard-<piece>.md` and fill it in after the creative brief. Rules and evidence: `foundations/video/video.json` and `research.md`. Text over footage: `foundations/layout/media.json`. Motion: the product's style, `approaches/<approach>/motion.json`.

## 1. The piece

| Field | Answer |
|---|---|
| Product | `products/<id>/` |
| Campaign brief | `campaigns/<campaign>/brief.md` |
| One message (W1) | |
| Big idea (O2) | |
| Content type | product-demo / how-to / ugc-testimonial / brand-film / explainer / title-card (`video.json` → `contentTypes`) |
| Format(s) | story 9:16 / instagram-post 4:5 / 1:1 / youtube-in-stream 16:9 / landing-hero / web-banner (`video.json` → `formats`) |
| Cuts | 6 s / 15 s / 30 s / 60 s, and the job of each |
| Placement | skippable? autoplay muted? feed or full screen? |
| Style | `approaches/<approach>/` (springs: … ; easings: … ; hold: … ms) |
| Wada combination | number and roles (ground, ink, accent) |
| Type pairing | display / body |
| Sound | music (and why it fits), voice-over, sonic logo |
| Proof available | real facts, results or customers only; never invented |

## 2. Beats

Fill one row per beat. Use the seconds for each cut from `video.json` → `structure`; blank cells mean the beat is skipped in that cut. Merge or split beats, but keep the order principles: hook first, brand early and pulsed, product as hero, CTA end card last.

**Hold** for each text card = max(1.5 s, 0.375 s × words + 0.5 s), from `media.json` → `video` → `on-screen-time`. Ready-made values:

| Words | 1–2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 |
|---|---|---|---|---|---|---|---|---|
| Hold (s) | 1.5 | 1.63 | 2.0 | 2.38 | 2.75 | 3.13 | 3.5 | 4.25 |

| # | Beat | 6 s | 15 s | 30 s | Shot (what we see; one focal point) | On-screen text | Words | Hold (s) | Motion (style move from motion.json) | Sound | Principles |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Hook and first frame | 0–1.5 | 0–2 | 0–3 | | | | | | | O2, W1, S8 |
| 2 | Brand in | 0–1.5 | 0–3 | 0–5 | | | | | | | O4 |
| 3 | Problem | — | 2–5 | 3–9 | | | | | | | S1, S3 |
| 4 | Product as hero | 1.5–4 | 5–10 | 9–20 | | | | | | | W8, W5 |
| 5 | Proof | — | 10–12 | 20–25 | | | | | | | S4, O5 |
| 6 | CTA and end card | 4–6 | 12–15 | 25–30 | | | | | | | S6, O4 |

Check each row:
- The hold fits inside the beat. If not, cut words or lengthen the beat. Text changes on a cut.
- Only one thing moves at a time. Name the move (for example `rise` on spring `gentle`, `pop`, `draw`, `fadeIn`) and its duration from the style.
- The text sits in a still zone of the shot, inside the safe area, and never over a face.

## 3. First frame and end card

| Frame | Subject | Headline | Brand | CTA | Works as a still? |
|---|---|---|---|---|---|
| First frame / cover / thumbnail | | | | — | yes / no |
| End card (final still) | | | | | yes / no |

## 4. Motion plan

| Item | Value | Source |
|---|---|---|
| Opening hold on ground or first frame | ms | style `choreography` |
| Arrival spring for text | name, settle ms | style `springs` + `moves.rise` |
| Arrival for objects | move, ms | style `moves` |
| Exits | easing, ms (150–300) | style `easings.exit` |
| Final hold | ms (≥ reading time of the end card, ≥ 1 s) | style `choreography.hold` |
| Loop | none / move, length | style `choreography.loop` |
| Reduced-motion version | final frames, cuts or fades | `video.json` → `accessibility.reducedMotion` |

## 5. Sound plan

| Item | Plan |
|---|---|
| Works with sound off? | the one message is on screen as text and image |
| Captions | burned in / caption file; inside the safe area |
| Music | track, why it fits (mood, genre, brand) |
| Voice-over | script; says what the picture can't; conversational |
| Sonic logo | where, how long; used the same way every time |
| Audio description | key visual-only information said in the voice-over? |

## 6. Accessibility and safety checklist

- [ ] No more than three flashes in any second; no red flashes; no strobing stripes. Paid or broadcast video tested with a flash and pattern analyser.
- [ ] Reduced-motion version: final frames, no zooms, spins or parallax, loops stopped.
- [ ] On the web: anything moving for more than 5 s has pause, stop or hide controls, or stops by itself; autoplay audio over 3 s can be paused or muted.
- [ ] All speech captioned, synchronised, inside the safe area.
- [ ] Key information that is only visual is also said or described.
- [ ] Text contrast checked on the worst frame (`templates/layouts/overlay.mjs` → `analyseFrames`).
- [ ] Text, logo and CTA inside the format's safe area at every frame and crop.

## 7. Copy check

Put the words in a `.copy.json` in the campaign folder, using the format whose limits apply (`story` for 9:16 covers and frames). Then run `npm run check:copy -- products/<id>`. No exclamation marks, sentence case, brand next to the headline, a direct CTA starting with a verb.

## 8. Score

Use the scorecard in `foundations/video/research.md` section 12 (pass: 16 of 20). Over footage, also use `media-research.md` section 9; always also use the style's own scorecard.

| # | Item | 0 / 1 / 2 | Note |
|---|---|---|---|
| 1 | First frame works as a still | | |
| 2 | Hook earns the first seconds | | |
| 3 | Brand early, pulsed, next to the headline | | |
| 4 | One message, one focus per shot | | |
| 5 | Story with the product as hero; real facts | | |
| 6 | Pace varied; words get held shots | | |
| 7 | Text still, safe, held for its reading time | | |
| 8 | One move at a time; style springs; ends on a still | | |
| 9 | Works with sound off, better with sound on | | |
| 10 | Safe for everyone | | |
| | **Total** | **/20** | |
