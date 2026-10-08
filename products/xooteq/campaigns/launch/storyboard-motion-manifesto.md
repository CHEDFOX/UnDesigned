# Storyboard: motion-manifesto (five beliefs)

File `video/motion-manifesto.svg` (animated SVG; frames in `previews/motion-manifesto-frame-*.png`).

## 1. The piece

| Field | Answer |
|---|---|
| One message (W1) | Five beliefs, one question: does it matter? |
| Big idea (O2) | The manifesto read aloud by type alone: one belief at a time on the beam from the carousel, then the filter. |
| Content type | title-card sequence |
| Format | instagram-post 4:5 (1080 × 1350) |
| Length | 26.8 s, ends on a still |
| Style | CM `wipe` (hard-edged mask left to right, 600 ms, cubic-bezier(0.65,0,0.35,1)); text changes on a cut; CTA arrives with `bandSlide` |
| Palette / type | 340 dark; the Sea Green beam is static; Schibsted Grotesk 800/400, JetBrains Mono |
| Sound | Sound-off first; a soft click on each cut would mark the cards if sound is added. |

## 2. Beats (holds = max(1.5 s, 0.375 s × words + 0.5 s) + 0.5 s margin)

| # | Card | Words | Start (s) | Wipe | Hold (s) |
|---|---|---|---|---|---|
| 0 | Lockup, label, beam (brand in from frame 1) | — | 0 | — | 0.6 |
| 1 | Value over valuation. | 3 | 0.6 | 0.6 | 2.13 |
| 2 | Fun is fuel, not the opposite of serious work. | 9 | 3.6 | 0.6 | 4.38 |
| 3 | Degrees don't build things. People do. | 6 | 8.8 | 0.6 | 3.25 |
| 4 | The best ideas come from those with nothing to lose. | 10 | 12.9 | 0.6 | 4.75 |
| 5 | Grow together or don't grow at all. | 7 | 18.5 | 0.6 | 3.63 |
| 6 | Does it matter? + subhead + CTA (Send yours: hello@xooteq.com) | 3 + 9 | 23.0 | 0.6 | 3.2, then still |

## 3. Safety and access

- One mover at a time (the wipe); cards change on a cut on a constant Black ground: no flashes.
- Reduced motion: animations off, the end card is the base state.
- The final frame works as a post (brand, question, CTA). Captions are not needed (no speech); the description in the SVG `<desc>` lists every belief for screen readers.
