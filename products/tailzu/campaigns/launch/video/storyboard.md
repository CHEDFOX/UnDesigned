# Storyboard: Talk. It writes. (15 s story)

From `templates/video/storyboard.md`. Rules: `foundations/video/video.json`, `foundations/layout/media.json`. Motion: `approaches/humanist-minimal/motion.json`. The end card (beat 6) is built as `story-title-card.svg` (the last 7 s, see section 4); beats 1–5 reuse the campaign's drawings (`design.mjs`) as animated frames.

## 1. The piece

| Field | Answer |
|---|---|
| Product | `products/tailzu/` |
| Campaign brief | `campaigns/launch/brief.md` |
| One message (W1) | Say it the way you talk, and Tailzu writes it clean in any app. |
| Big idea (O2) | Tangled talk in, one clean line out: a looping ink thread runs into one mic key and leaves as a calm line the clean sentence sits on. |
| Content type | product-demo, ending on a title-card |
| Format(s) | story 9:16 (1080 × 1920); the 6 s cut is the title card alone |
| Cuts | 15 s: the said-to-written demo, then the end card. 6 s: `story-title-card.svg` (thread, key, line, headline, brand, CTA). |
| Placement | Stories and Reels, autoplay muted, full screen, skippable |
| Style | Humanist Minimal (springs: `gentle` for text, `lively` for the key pop; easings: `draw` for ink; hold: 700 ms) |
| Wada combination | 344 light: ground Cinnamon Buff, ink and text Black, accent Deep Lyons Blue (the key only) |
| Type pairing | Instrument Serif / Instrument Sans (IBM Plex Mono for labels); Caveat for the said note |
| Sound | Designed sound-off first. With sound: one real voice saying the line roughly ("um so like can we push the call to four"), then a soft key tap as the key pops; no music needed. Voice and tap to confirm with the user. |
| Proof available | Site facts only: 22 Indian languages, Hinglish and English; filler out, punctuation in, names and amounts kept; every app; 800 words a month free |

## 2. Beats

| # | Beat | 6 s | 15 s | Shot (one focal point) | On-screen text | Words | Hold (s) | Motion | Sound | Principles |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Hook and first frame | 0–1.5 | 0–2 | The looping ink thread is already half-drawn, coming down from the top edge; the said note sits beside it | `um… so like…` (Caveat) | 3 | 1.63 | thread `draw` (700 ms), then still | the rough voice line starts | O2, W1, S8 |
| 2 | Brand in | 0–1.5 | 2–3 | Mark and name small under the note | `Tailzu` | 1 | 1.5 (held into beat 3) | name `rise` on `gentle` (660 ms) | — | O4 |
| 3 | Problem | — | 3–5 | Thread keeps looping (one more loop draws on) | — | 0 | — | `draw` | voice keeps rambling | S1, S3 |
| 4 | Product as hero | 1.5–2.3 | 5–10 | The mic key pops in where the thread ends; the calm line draws out to the right, and the clean sentence appears on it | `Can we push the call to four?` | 7 | 3.13 | key `pop` (`lively`, ~790 ms), then line `draw` (600 ms), then sentence `rise` | soft key tap on the pop; voice stops | W8, W5 |
| 5 | Proof | — | 10–12 | Same frame; one small line under the sentence | `22 Indian languages. Every app.` | 5 | 2.38 | `rise` | — | S4, O5 |
| 6 | CTA and end card | 2.3–7 | 12–15 (shortened end card, or 15–22 for the full one) | Title card: key and line above, headline, brand, CTA | `Talk. It writes.` · `Tailzu` · `Download free` | 3 + 1 + 2 | 1.63 / 1.5 / 1.5 | headline, brand, CTA `rise` on `gentle`, one at a time; still from 5.1 s | silence | S6, O4 |

Checks: every hold fits its beat; only one thing moves at a time (thread, then key, then line, then each text); text stays in the live area (top 14%, bottom 35%, sides 6%); the thread is the only thing in the overlay zones.

## 3. First frame and end card

| Frame | Subject | Headline | Brand | CTA | Works as a still? |
|---|---|---|---|---|---|
| First frame / cover | Looping thread and said note on the buff ground | `um… so like…` (note) | — (enters at 2 s) | — | yes: reads as messy talk |
| End card (final still) | Thread, blue mic key, calm line | Talk. It writes. | Tailzu | Download free | yes: `video/story-title-card.png` |

## 4. Motion plan (as built in `story-title-card.svg`)

| Item | Value | Source |
|---|---|---|
| Opening hold on ground or first frame | 2300 ms, in which the thread draws (100–800 ms), the key pops (820 ms, `lively`), then the line draws (≈1630–2230 ms) | `choreography.order`: paper, ink, accent, then text |
| Arrival spring for text | `gentle` (k 120, c 20), settles in 660 ms; headline 2300 ms, brand 3925 ms, CTA 4585 ms | `springs.gentle`, `moves.rise`; title-card.mjs reading holds |
| Arrival for objects | thread and line `draw` (cubic-bezier(0.65, 0, 0.35, 1)); key `pop` on `lively` | `moves.draw`, `moves.pop` |
| Exits | none (ends on a still) | — |
| Final hold | still from ≈5.2 s to 7 s (≥ 1 s) | `choreography.hold`, title-card.mjs |
| Loop | none | `choreography.loop` (not used: a story should end still) |
| Reduced-motion version | final frame only; every animation off | `@media (prefers-reduced-motion: reduce)` in the SVG |

## 5. Sound plan

| Item | Plan |
|---|---|
| Works with sound off? | Yes: the said note, the clean sentence and the headline carry it |
| Captions | Burned in: the clean sentence is the caption of the voice; inside the live area |
| Music | None, so the voice and the tap carry it (to confirm) |
| Voice-over | One person saying the site's line roughly: "um so like can we push the call to four" (a real recording; no invented testimonial) |
| Sonic logo | A soft key tap on the key pop, the same every time |
| Audio description | Not needed: everything said is on screen |

## 6. Accessibility and safety checklist

- [x] No flashes; the ground never changes; nothing strobes.
- [x] Reduced-motion version: the SVG shows the final frame.
- [x] Nothing moves for more than 5 s; it stops on a still by itself.
- [x] Speech is on screen as the clean sentence.
- [x] Key information is in the text, not only in the picture.
- [x] Contrast: Black on Cinnamon Buff 11.95:1 on every frame (flat ground).
- [x] Text, logo and CTA inside the 9:16 safe area at every frame.

## 7. Copy check

`story-title-card.copy.json` (format `story`) and `story-say-it-rough.copy.json`: `npm run check:copy -- products/tailzu` reports 0 errors, 0 warnings.

## 8. Score (foundations/video/research.md §12)

| # | Item | 0 / 1 / 2 | Note |
|---|---|---|---|
| 1 | First frame works as a still | 2 | The thread and note read as messy talk |
| 2 | Hook earns the first seconds | 2 | The loop is unusual and draws itself |
| 3 | Brand early, pulsed, next to the headline | 1 | Name at 2 s and on the end card; in the 6 s cut only at 3.9 s |
| 4 | One message, one focus per shot | 2 | |
| 5 | Story with the product as hero; real facts | 2 | Site example and site facts only |
| 6 | Pace varied; words get held shots | 2 | Reading holds from title-card.mjs |
| 7 | Text still, safe, held for its reading time | 2 | |
| 8 | One move at a time; style springs; ends on a still | 2 | |
| 9 | Works with sound off, better with sound on | 2 | |
| 10 | Safe for everyone | 2 | |
| | **Total** | **19/20** | Style scorecard: 19/20 (see brief) |
