# Storyboard: motion-orb-answer

From `templates/video/storyboard.md`. Rules: `foundations/video/video.json`, `foundations/layout/media.json` (on-screen reading), `approaches/negative-space/motion.json`. File: `motion/motion-orb-answer.svg` (animated SVG, CSS keyframes); frames in `motion/motion-orb-answer-frame-*.png`.

## 1. The piece

| Field | Answer |
|---|---|
| Product | `products/plutto/` |
| Campaign brief | `campaigns/launch/brief.md` (pillar: Ask the sky) |
| One message (W1) | Ask your own birth chart out loud, and it answers you in plain words. |
| Big idea (O2) | The one gold light in the dark listens, then speaks. |
| Content type | title-card (a spoken exchange, sound off) |
| Format | story 9:16, 1080 × 1920; safe area top 14%, bottom 35%, sides 6% |
| Length | about 20 s, no loop: ends on the final still |
| Style | Negative Space: springs `still` (orb, 1590 ms) and `settle` (text, 1170 ms), easing `drift` (breath), `fade` (brand) |
| Wada combination | 255 dark: Black ground, White type; the orb in its own brand colours |
| Type pairing | Instrument Serif italic (question), roman (answer); Instrument Sans (CTA); the original wordmark |
| Sound | Designed for sound off. With sound: one soft tone as the orb breathes, the answer in the Plutto voice (to be supplied by the team), captions = the on-screen text |
| Proof available | none needed; the question is labelled an example in the post caption |

## 2. Beats

Hold = max(1.5 s, 0.375 s × words + 0.5 s).

| # | Beat | Time (s) | Shot | On-screen text | Words | Hold (s) | Motion | Principles |
|---|---|---|---|---|---|---|---|---|
| 1 | Open on ground | 0–0.8 | Empty Wada Black | — | — | — | none (NS: the space is introduced first) | NS8 |
| 2 | Hook: the orb | 0.8–2.4 | The orb arrives in the live band | — | — | — | fade on `still` spring | O2, first frame |
| 3 | Breath | 2.4–6.9 | The orb breathes once (scale 1 → 1.018 → 1, the site's 9 s breath at half period) | — | — | — | `drift` easing; only the orb moves | one-mover |
| 4 | Question | 6.9–11.2 | — | "Why does this year feel so slow?" (italic) | 7 | 3.1 | rise 14 px on `settle` | S2, W5 |
| 5 | Answer | 11.2–16.2 | Waveform + answer appear together | "Let's look at the period your chart is in." | 9 | 3.9 | rise on `settle` | S1, never predicts |
| 6 | Brand + CTA end card | 16.2–19.9 | Wordmark (original lockup) + "Ask at plutto.space" | 4 + brand | 2.0 + | fade 900 ms, then hold | O4, S6, end-still |

Only one thing moves at any moment; text never moves after it lands; no flashes.

## 3. First frame and end card

| Frame | Subject | Headline | Brand | CTA | Works as a still? |
|---|---|---|---|---|---|
| First frame | empty ground (style rule), then the orb at 0.8 s | — | — | — | the cover uses the final frame |
| End card | orb, question, answer | yes | wordmark | Ask at plutto.space | yes (`motion-orb-answer.png`) |

## 4. Motion plan

| Item | Value | Source |
|---|---|---|
| Opening hold on ground | 800 ms | motion.json choreography.openOnGround |
| Object arrival | fade, `still` spring 1590 ms | motion.json springs.still |
| Text arrival | rise 14 px, `settle` spring 1170 ms | motion.json moves.rise |
| Final hold | from 17.1 s, indefinitely (animation fill: both) | motion.json choreography.hold |
| Loop | none | motion.json: most pieces should not loop |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` removes all animations; base styles are the final frame | video.json accessibility.reducedMotion |

## 6. Accessibility and safety

- [x] No flashes at all (WCAG 2.3.2 level).
- [x] Reduced motion shows the final frame.
- [x] All text inside the story safe area (checked by design.mjs); contrast 18.6:1 (white), 7.2:1 (white at 60%).
- [x] Works with sound off.
