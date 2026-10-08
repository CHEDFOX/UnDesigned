# Storyboard: motion-wheel

From `templates/video/storyboard.md`. File: `motion/motion-wheel.svg` (animated SVG); frames in `motion/motion-wheel-frame-*.png`.

## 1. The piece

| Field | Answer |
|---|---|
| Product | `products/plutto/` |
| Campaign brief | `campaigns/launch/brief.md` (pillar: Five lenses) |
| One message (W1) | One birth, read through the lens you choose; Plutto switches lenses mid-sentence. |
| Big idea (O2) | The Western and Vedic zodiacs are the same sky turned by about 24° (the ayanamsa, Lahiri value about 24° in 2026). Show the turn. |
| Content type | explainer (one change, shown in shot) |
| Format | instagram-post 1:1, 1080 × 1080 |
| Length | about 16 s, no loop |
| Style | Negative Space: `still` spring (wheel in), `drift` easing (turn, 4 s), `settle` (text), `fade` (brand) |
| Wada combination | 255 dark; orb in brand colours |
| Sound | sound off first; a low sustained tone during the turn if sound is used |

## 2. Beats

| # | Beat | Time (s) | Shot | On-screen text | Words | Hold (s) | Motion |
|---|---|---|---|---|---|---|---|
| 1 | Open on ground | 0–0.8 | empty | — | — | — | none |
| 2 | The chart | 0.8–2.8 | Natal wheel (tropical, 0° Aries at the ascendant) with the orb at its centre | — | — | — | fade on `still` |
| 3 | The turn | 2.8–6.8 | The sign ring turns 24° anticlockwise; houses, ascendant and orb stay still | — | — | — | rotate, `drift`, the only mover (video.json change-at-cut: show the change in shot) |
| 4 | The line | 7.2–13.4 | — | "Western to Vedic: the same sky, turned 24°." / "Plutto switches lenses mid-sentence." | 12 | 5.0 | rise on `settle` |
| 5 | End card | 13.4–16.3 | Wordmark + plutto.space | 2 + brand | 1.5+ | fade, then hold |

## 4. Motion plan

| Item | Value |
|---|---|
| Opening hold | 800 ms |
| Moves | 3 (wheel in, turn, text), then the brand fade (motion.json totalMovesMax 3 + closing fade) |
| Final hold | indefinite still |
| Reduced motion | animations removed; the wheel shows the final, sidereal position with the text |

## 6. Accessibility and safety

- [x] No flashes; slow rotation (6° per second at most).
- [x] Reduced motion shows the final frame.
- [x] Text contrast 18.6:1.
