# Video and motion

How to make pieces that move: short video ads, stories and reels, demos, how-tos, testimonials, brand films, explainers, animated title cards and interface motion. This foundation gives every product the same evidence, beat structure, pacing, timing bounds, sound rules and safety rules. The storyboard template and the title-card generator that use it are in [`templates/video/`](../../templates/video/).

The style still decides how motion feels. Springs, easings, moves and choreography come from `approaches/<id>/motion.json`, and where the style sets a number, it wins. This foundation sets what holds in every style. Text over footage follows [`foundations/layout/media.json`](../layout/media.json) (still text, still zone, worst frame, reading time, captions, first frame); this foundation doesn't repeat it.

## How to use it

1. Write the brief (`templates/briefs/creative-brief.md`): the one message (W1) and the big idea (O2).
2. Copy [`templates/video/storyboard.md`](../../templates/video/storyboard.md) into the campaign folder. Pick the content type and the cuts (6, 15, 30, 60 s).
3. Fill the beats from `video.json` → `structure`: hook, brand, problem, product as hero, proof, call to action. Check each text card's hold time with the reading rule.
4. Take every spring, easing and move from the product's style `motion.json`. Keep within the bounds in `motionGraphics.timing`.
5. Plan sound off first, then sound on. Caption all speech.
6. Run the safety checks: no flashes, a reduced-motion version, pause control on the web.
7. Score the finished piece with the scorecard in [`research.md`](research.md) section 12. Over footage, also use the text-on-media scorecard (`media-research.md` section 9). Always use the style's own scorecard too.

For a type-only opener, end card or story frame, use [`templates/video/title-card.mjs`](../../templates/video/title-card.mjs).

## Findings in short

| Id | Finding | Strength |
|---|---|---|
| `zap-dispersion` | Viewers zap when attention scatters; brief brand pulses keep them | moderate |
| `joy-surprise` | Surprise and rising joy hold viewers | moderate |
| `entertain-after-brand` | Entertainment helps after the brand appears, not before | moderate |
| `abcd` | Attention, Branding, Connection, Direction (Google/Ipsos) | moderate (practitioner) |
| `short-exposure-lift` | Even views under 3 s can lift recall (platform-commissioned) | emerging |
| `skip-choice` | Skippable ads were as effective per impression; viewers prefer them | moderate |
| `ad-length-position` | Longer in-stream ads were recognised better | moderate |
| `dramatic-form` | Ads with a full five-act story rated higher | moderate |
| `transportation` | Stories persuade by absorbing viewers | moderate |
| `peak-end` | Peak and final moments weigh most (partly replicated) | contested |
| `emotional-long-term` | Emotional campaigns build more long-term effect | moderate (practitioner) |
| `shot-rhythm` | Film shots got shorter and more rhythmically varied | moderate |
| `edit-rate` | More edits within a scene raise arousal and memory | moderate |
| `capacity-overload` | Pace, arousal and information share a limited budget; words drop first | moderate |
| `change-at-cut` | Changes across a cut go unnoticed | strong |
| `inattentional-blindness` | People miss what they aren't looking for | strong |
| `animation-congruence` | Animation helps only when it matches the idea and can be followed | strong |
| `cartoon-motion` | Slow in and out, arcs and settling make motion easy to follow | moderate (practitioner) |
| `kinetic-type` | Moving type can carry tone | emerging |
| `ui-motion-timing` | Interface motion lives between about 100 ms and 1 s | moderate (practitioner) |
| `photosensitivity` | Three or more flashes a second, red flashes and stripes can trigger seizures | strong |
| `vestibular` | Zooms, spins, parallax and large moves can make people ill | moderate (practitioner) |
| `multimedia-principles` | Coherence, signalling, redundancy, contiguity, segmenting, personalisation | strong |
| `short-segments` | Shorter, informal videos hold viewers longer | moderate |
| `presenter-face` | A presenter's face is liked; learning gains are mixed | contested |
| `music-fit` | Music that fits the ad and brand works better | moderate |
| `sonic-logo` | A short, simple sound logo can carry value | emerging |
| `vertical-mobile` | On phones, vertical video is processed more easily | moderate |
| `ugc-persuasion` | Customer-made posts persuade more than ads | moderate |

The myths (`goldfish-attention`, `three-second-rule`, `faster-is-better`, `more-animation`, `brand-reveal`, `vertical-always`, `one-right-length`, `reduced-motion-none`) are in `video.json` → `myths` and in `research.md` section 11.

## Beats for short video

Seconds are [start, end] per cut. These are rules of thumb; the ordering is evidenced. Each beat lists the playbook principles it serves.

| Beat | % of length | 6 s | 15 s | 30 s | 60 s | Principles |
|---|---|---|---|---|---|---|
| Hook and first frame | 0–10 | 0–1.5 | 0–2 | 0–3 | 0–5 | O2, W1, S8 |
| Brand in (then pulse it) | by 15 | 0–1.5 | 0–3 | 0–5 | 0–8 | O4, O11 |
| The customer's problem | 10–30 | — | 2–5 | 3–9 | 5–18 | S1, S2, S3 |
| Product as hero | 30–65 | 1.5–4 | 5–10 | 9–20 | 18–40 | W8, W2, W5, S7 |
| Proof | 65–83 | — | 10–12 | 20–25 | 40–50 | S4, O5 |
| CTA and end card | 83–100 | 4–6 | 12–15 | 25–30 | 50–60 | S6, O4 |

The end card holds at least max(1.5 s, 0.375 s × words + 0.5 s). A four-word CTA needs 2 s.

## Motion timing bounds

All are rules of thumb from practitioner sources (`ui-motion-timing`). The style's `motion.json` picks values inside them.

| Kind | ms | Use |
|---|---|---|
| Micro | 100–200 | Hover, press, toggle |
| Standard | 200–400 | Cards, panels, state changes |
| Entrance | 250–500, or a spring settling within about 1,200 | Text and objects arriving |
| Exit | 150–300 | Leaving: shorter than entrances, accelerating away |
| Emphasis | 300–600 | One pulse on one thing, once |
| Scene | 500–1,000 | Full-screen change (a cut is often better) |

## Shot lengths by content type

Rules of thumb, in seconds. Any shot that carries words is held at least its reading time.

| Type | Shot length | Note |
|---|---|---|
| Brand film | 2–5 | Vary in runs; let the peak shot breathe |
| Product demo | 2–4 | Hold until the action completes |
| How-to | 3–8 | One step per shot or segment |
| UGC and testimonial | 3–8 | Longer takes stay believable |
| Explainer | 3–8 | One idea per scene, end on a still |
| Motion graphic | 1.5–3 | One change per beat |

## Safety in one table

| Check | Rule | Standard |
|---|---|---|
| Flashes | Three a second at most; no red flashes; no strobing stripes | WCAG 2.3.1; ITU-R BT.1702; Ofcom 2.13 |
| Reduced motion | Final frames; cuts or short fades instead of zooms, spins and parallax; loops stop | `prefers-reduced-motion`; WCAG 2.3.3 |
| Pause | Anything moving for more than 5 s on the web can be paused, or stops by itself | WCAG 2.2.2 |
| Audio | Autoplay audio over 3 s can be paused or muted | WCAG 1.4.2 |
| Captions | All speech captioned, inside the safe area | WCAG 1.2.2 |
| Description | Key visual-only information said in the voice-over or described | WCAG 1.2.3, 1.2.5 |

## Rules

- Earn the first seconds: a surprise, mid-action or a close-up, and a first frame that works as a still.
- Brand in the first seconds, pulse it through the piece, and close on it. Never only at the end.
- One message per piece and one focal point per shot.
- Tell a story with a turn when there is time; the product resolves it.
- Vary the pace; slow down whenever words, offers or steps must be read.
- Never stack fast cutting, intense content and dense information.
- One thing moves at a time; each move means something; each sequence ends on a readable still.
- Text stays still, in a still zone, inside the safe area, for its reading time.
- Use the style's springs and timings; keep UI motion within 100–500 ms and scene changes under 1 s.
- Design for sound off, then make sound on better. Caption everything.
- Never flash. Honour reduced motion. Let people pause anything that moves for more than 5 s.
- Use real people and real results. Never invent customers or numbers.
- Make a family of cuts, each with a job, and reframe for every format's safe area.

## Files

| File | Contents |
|---|---|
| `research.md` | The dossier: first seconds, story and feeling, pacing and editing, people on screen, sound, motion graphics, accessibility and safety, formats, content types, myths, scorecard, sources |
| `video.json` | Data: `findings`, `myths`, `structure`, `pacing`, `motionGraphics`, `sound`, `accessibility`, `formats`, `contentTypes`, `rules` |
| `../../templates/video/storyboard.md` | Storyboard and brief template for a video or motion piece |
| `../../templates/video/title-card.mjs` | Zero-dependency animated SVG title card (`titleCard`, `timeline`, `readingMs`, `springEasing`, `safeBox`) |
