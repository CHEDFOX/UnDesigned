# Storyboard: motion-tree (growing tree)

File `video/motion-tree.svg` (animated SVG, CSS keyframes; frames in `previews/motion-tree-frame-*.png`). Rules: `foundations/video/video.json`, `foundations/layout/media.json` → video, `approaches/commercial-modernism/motion.json`.

## 1. The piece

| Field | Answer |
|---|---|
| One message (W1) | What matters grows: does it matter? Then plant it. |
| Big idea (O2) | A seed becomes a tree on a black stage; the brand's one question lands when it is grown. |
| Content type | brand-film (short) / title-card |
| Format | story 9:16 (1080 × 1920), safe area top 14%, bottom 35%, sides 6% |
| Length | 11.6 s, ends on a still (no loop) |
| Style | Commercial Modernism: `wipe` 600 ms cruise, `bandSlide` 500 ms streamline; no overshoot |
| Palette | 340 dark: Black ground, White cards, Sea Green line; frames duotoned Black→Sea Green→White |
| Type | Schibsted Grotesk 800/400, JetBrains Mono 500 |
| Sound | Works sound-off (all words on screen). Suggested: one low sustained note that opens with the tree; no voice. |
| Proof | Every quarter, in every city XOOTEQ works in, it plants trees (site fact). No numbers. |

## 2. Beats

| # | Beat | Time (s) | Shot | On-screen text | Words | Hold needed (s) | Motion |
|---|---|---|---|---|---|---|---|
| 1 | Hook, first frame, brand in | 0–2.6 | Seed in soil on black (frame 001) | Lockup + GREEN REVOLUTION + "It starts in the dirt." | 5 | 2.38 | none: a still first frame |
| 2 | Product as hero | 2.6–7.6 | Tree grows: 9 crossfades (300 ms) every 500 ms, frames 012→120 | same card, static | — | (re-read) | one mover: the tree |
| 3 | The turn | 7.7–8.3 | Grown tree | card 1 cut on the change; "Does it matter?" wipes on | 3 | 1.63 | `wipe` 600 ms |
| 4 | Hold | 8.3–10.2 | Grown tree | "Does it matter?" | 3 | 1.9 s held (≥ 1.63) | none |
| 5 | CTA, end card | 10.2–11.6+ | Grown tree | "Then plant it." + xooteq.com/green-revolution | 4 | 2.0; the end frame stays | `bandSlide` 500 ms, then still |

## 3. First frame and end card

| Frame | Subject | Headline | Brand | CTA | Works as a still? |
|---|---|---|---|---|---|
| First | seed in soil | It starts in the dirt. | lockup at the top of the safe area | — | yes |
| End | grown tree | Does it matter? Then plant it. | lockup | xooteq.com/green-revolution | yes (this is also the reduced-motion frame) |

## 4. Safety

- No flashes: each crossfade only adds light over the previous frame (no dark-light-dark alternation); the text change is a small-area cut on a constant Black ground. Well under three luminance changes per second over 25% of the screen. The duotone keeps the glow, never strobing.
- Text never moves over moving footage and sits on flat Black above the image (worst frame under the text zone would be 1.5:1, so the cards were placed off the image; final composite 7.1:1).
- `prefers-reduced-motion: reduce` turns all animations off; the base state of every element is the end card.
- On the web: it stops by itself at 11.6 s; for longer embeds add a pause control (WCAG 2.2.2). For social, export to MP4 from the frames.
