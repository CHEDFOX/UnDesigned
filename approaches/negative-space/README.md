# Design approach: Negative Space

> Full data lives beside this file: [research.md](research.md) (the dossier and sources), [art.json](art.json) (empty-ground rules, object size, placement, edge tension, palette ratios, photo and video rules), [motion.json](motion.json) (slow springs, long holds), [typography.json](typography.json) (quiet type, fit for every pairing, sizes per format), [layouts.json](layouts.json) (12 templates with measured empty ground) and [sample.mjs](sample.mjs) (a sample poster). The structure every approach follows is in [../STYLE-SPEC.md](../STYLE-SPEC.md).

**Most of the frame is empty, on purpose.** One small object on a calm, flat ground, a short headline set small on a margin, and nothing else. The space is the message: time, calm, distance, scale, quiet, quality.

Lineage: the Japanese idea of *ma* (Isozaki's *Ma: Space-Time in Japan*, 1978–79), Kenya Hara's "emptiness" for MUJI (the 2003 "Horizon" posters), the Swiss asymmetric layout, and DDB's "Think Small" for Volkswagen (1959). A product chooses it in `products/<product>/brand.json` (`"approach": "negative-space"`). Status: **profile** (full data, layouts and a sample poster, no drawing engine yet).

## When to use it

- Layouts and posters that need calm, focus and a feeling of quality: design, architecture, hotels and travel, wellness, premium food and drink, fashion and beauty, culture, considered tech products.
- Launches and brand pieces with one strong idea that can be shown with one object.
- Photo or video pieces with a small subject in a big calm scene (sky, sea, snow, a wall).
- Cluttered placements (feeds, street, magazines) where one isolated object will differ from everything around it, provided the idea is strong.

## When not to

- Price-led, discount, sale or urgent messages: white space reads as prestige and quality (research.md 3.1), which works against "cheap and now".
- Pieces that must carry a lot of information (menus, timetables, long offers): use a template with more density.
- Products that must feel warm and handmade first: Humanist Minimal scores higher on those criteria.
- When there is no idea yet: empty space without an idea looks unfinished and is scrolled past (research.md 3.5).

## Principles

| | Principle | Rule |
|---|---|---|
| NS1 | The ground is the subject | At least 60% empty ground (ideal 70–90%), in one connected field. Say what the space stands for. |
| NS2 | One small thing | One object, 8–30% of the short side, readable as a silhouette. Size follows meaning. |
| NS3 | Face into the space | The object faces or moves into the larger empty area (ahead at least twice behind); the words wait there. |
| NS4 | Quiet type | Small headline (poster cap height 2.5–4.5% of the height), regular weight, on a margin line, brand beside it. Body minimums unchanged. |
| NS5 | Deliberate edges | Object at least 15% from an edge, or on the margin, or cropped by 25%+. Never 10–15%. |
| NS6 | Mostly ground colour | Ground 85–97%, ink 2–8%, accent 0.2–2% on one small part of the object. |
| NS7 | Earn the emptiness | The relation of object and space must make a specific idea. No price-led messages. |
| NS8 | Slow and still | Open on empty ground, at most three slow moves, long hold. Video locked off, text still. |

## Across every layer

| Layer | Do | Don't |
|---|---|---|
| Colour | Calm, light Wada ground, ink at 7:1, accent on one small part of the object. | Saturated or dark grounds by default, textures, gradients, accent on type. |
| Typography | Core pairings (instrument, source, schibsted, jost); small headline, three sizes, two weights, on a margin. | Big bold headlines, all caps, handwriting, body below minimums. |
| Layout | 10% margins, one object, one text group, 60%+ empty ground in one field. | Corners filled, boxes, bands, scattered small elements. |
| Illustration | One silhouette or flat cut shape, 3–8 parts, at most one hairline horizon. | Scenes, icons, outlines, decorative marks in the ground. |
| Motion | Open on ground, one slow arrival or drift, text rises once, hold 2 s+. | Bounces, loops that never rest, parallax, moving text. |
| Photography | One small subject (0.5–6% of the frame), calm sky, wall, floor or water holding the words, no overlay when contrast passes. | Busy backgrounds behind text, solid bands, plates, text shadows. |
| Copy | 3–8 words that gain meaning from the image and the space. | Discounts, feature lists, exclamation marks, copy explaining the picture. |

## Colour

Recommended Wada combinations (details in `art.json` → `palette.recommendedCombinations`; all have light-mode `inkUse` "body"):

| # | Colours | Use |
|---|---|---|
| 190 | Ivory Buff, English Red, Black | Linen ground, black ink 12.75:1, one red detail. The default. |
| 268 | Nile Blue, Deep Slate Olive, Raw Sienna | Pale sky for horizons and open air. |
| 221 | Neutral Gray, Black, Carmine Red | Stone grey, gallery-like. |
| 340 | Neutral Gray, Black, Peach Red | Grey with a warmer accent. |
| 207 | Glaucous Green, Black, Sudan Brown | Soft sage, natural. |
| 139 | Neutral Gray, Deep Indigo, Salvia Blue | Near-monochrome, the quietest. |
| 229 | Neutral Gray, Deep Slate Olive, Golden Yellow | One lit thing on grey. |
| 151 | Sulpher Yellow, Vandar Poel's Blue, Yellow Orange | Cream with blue ink and a small orange. |
| 84 | Seashell Pink, Deep Slate Green | Two colours, no accent. |
| 52 | Sulpher Yellow, Black | Two colours: cream paper and black. |

Area shares: ground 85–97%, ink 2–8%, accent 0.2–2%, support only as a second calm field below a horizon.

## Construction in seven steps

1. Write the one message (W1) and say what the space should stand for.
2. Pick one small object from the product's world whose relation to that space makes the point.
3. Choose a layout from `layouts.json` (poster, square, 4:5, story, hero, billboard, banner, or a media layout).
4. Decide which way the object faces; put the open field and the words on that side.
5. Set the headline small on a margin, brand beside it, details and CTA in one quiet group.
6. Measure: empty ground 60%+ (layouts.json gives `emptyPct`), edges 15%+ or on the margin, text contrast 4.5:1+ (aim 7:1).
7. Score it with the scorecard in research.md (16/20 to ship).

## Photos and video

The photo's own calm area is the negative space (`art.json` → `media`). Shoot or crop so the subject covers 0.5–6% of the frame, faces into the calm area, and the words sit there with **no overlay** when contrast passes. If it fails, use the least visible fix, in this order: re-crop (`calm-region`), `duotone`, `tint`, `blur`, then a long soft `scrim-gradient`. Never `solid-band`, `plate` or `text-shadow` (ids from `foundations/layout/media.json`). Video: locked-off camera or a drift of at most 2% per 10 s, one slow natural movement, text appears once after the first hold and never moves; pause control for motion over 5 s.

## Layout templates

`layouts.json` uses the schema of `templates/layouts/layouts.json` (render them with `templates/layouts/render.mjs`) and adds `emptyPct`, `focal` and, for media layouts, `media`:

| id | Format | Empty ground |
|---|---|---|
| `ns-poster-object-low` | poster | 90% |
| `ns-poster-corner-type` | poster | 93% |
| `ns-square-headline-high` | instagram-post 1:1 | 91% |
| `ns-post-4x5-gaze` | instagram-post 4:5 | 91% |
| `ns-story-float` | story | 91% |
| `ns-hero-wide` | landing-hero | 91% |
| `ns-billboard-tiny` | billboard | 84% |
| `ns-banner-strip` | web-banner | 84% |
| `ns-poster-photo` | poster, photo | 91% |
| `ns-post-4x5-photo` | instagram-post 4:5, photo | 92% |
| `ns-story-video` | story, video | 92% |
| `ns-hero-video` | landing-hero, video | 91% |

## Evidence in short

Scores 8/14 on the shared preference criteria (curves 1, simplicity 2, familiar + fresh 1, nature 1, handmade 0, colour 1, glance 2): top on clarity, low on warmth. Its strengths are mostly beyond liking: white space reads as prestige, trust and quality (Pracejus, Olsen & O'Guinn 2006; 2013), lower clutter helps attention to the brand (Pieters, Wedel & Batra 2010), and quiet design suits audiences who read restraint as status (Han, Nunes & Drèze 2010). The main risks are looking unfinished, being scrolled past without a strong idea, and small type. Details and sources in [research.md](research.md).
