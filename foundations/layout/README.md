# Layout and grid

Where things go on the page, and why. This foundation gives every product the same grids, margins, safe areas, hierarchy rules and composition schemes, with the evidence behind each. The ready-made layouts that use it are in [`templates/layouts/`](../../templates/layouts/README.md).

The style still decides the look. How much empty ground, which placements and how dense the piece is come from `approaches/<id>/art.json` → `composition`. This foundation sets what holds in every style.

## How to use it

1. Find the format in `foundations/messaging/source/formats.json` (it sets the word limits).
2. Pick a template for that format from `templates/layouts/layouts.json`. Its composition must suit the idea (table below).
3. Keep text, brand and call to action inside the template's live area. Art may bleed.
4. Follow the reading order: focal point, headline, brand, call to action. Put the brand next to the headline.
5. Score the finished layout with the scorecard in [`research.md`](research.md) (section 10), as well as the style's own scorecard.

## Findings in short

| Id | Finding | Strength |
|---|---|---|
| `first-glance` | Layout is judged in 17–50 ms; low complexity and a typical layout win | strong |
| `preference-varies` | Preferred complexity varies by age, gender, education and country | moderate |
| `centre-bias` | Viewers start near the centre of an image | strong |
| `scan-patterns` | Text-heavy screens are scanned (F, layer-cake, spotted); flipped for RTL | moderate |
| `left-lean` | About 80% of viewing time on the left half of desktop pages | moderate |
| `pop-out` | One thing must differ (best on two dimensions) to lead | strong |
| `grouping` | Close, alike or enclosed things read as one group | strong |
| `line-length` | Moderate lines (45–75 characters) are preferred; speed findings conflict | contested |
| `text-whitespace` | Margins around text help understanding a little and are liked | moderate |
| `picture-captures` | The picture captures attention at any size; text needs room; brand fixations drive memory | moderate |
| `picture-superiority` | Pictures are remembered better than words | strong |
| `banner-blindness` | Anything that looks like an ad is skipped | moderate |
| `touch-centre` | Phones are held many ways; the centre is safest | moderate |
| `rule-of-thirds` | The rule of thirds barely predicts liking | contested |
| `repetition` | Repetition builds liking, up to a point (inverted U) | strong |
| `distinctive-assets` | Consistent assets help people find the brand | moderate (practitioner) |
| `wear-out` | Original plus familiar beats sameness | moderate |

Myths (Z-pattern, designing for the F, rule of thirds, golden ratio, white-space percentages, bigger pictures, bright banners, one-thumb use) are in `layout.json` → `myths` and in `research.md` section 9.

## Grids

All margins and gutters are percent of the artboard's **short side**, so they scale. All are rules of thumb.

| Family | Formats | Columns | Margin | Gutter |
|---|---|---|---|---|
| portrait-print | poster, event-poster, flyer | 6 | 8% | 2.5% |
| long-copy-print | print-ad | 12 | 8% | 2% |
| wide-outdoor | billboard | 12 | 10% | 3% |
| social-feed | instagram-post, carousel-slide (and 1:1) | 6 | 8% | 2.5% |
| vertical-full | story | 4 | 8% | 3% |
| wide-screen | landing-hero, thumbnail | 12 | 8% | 2.5% |
| strip | web-banner | 12 | 10% | 4% |
| email | email-header | 6 | 8% | 3% |

## Safe areas

Rules of thumb from several 2026 agency and tool guides; official platform pages could not be checked. Always check the platform's preview.

| Format | Keep text and logos out of |
|---|---|
| Story / Reel / TikTok 9:16 | top 14%, bottom 35% (20% if stories only), 6% each side |
| Instagram 4:5 post | about 6% each side (3:4 profile-grid crop) |
| YouTube thumbnail | bottom-right corner, about 20% wide × 15% high |
| Billboard | 5% top and bottom, 3% sides (check the media owner's spec) |
| Print | 3 mm bleed, 5 mm safe zone (grid margins already exceed this) |

## Compositions

| Id | When to use |
|---|---|
| `single-focal` | Posters and posts: one image near the centre, headline on one edge |
| `split` | Wide formats: words on the reading-start side, image on the other |
| `stacked` | Stories and flyers: headline, image, details and CTA in the central band |
| `full-bleed-band` | Photo-led pieces: image fills the frame, a solid band holds the words |
| `type-led` | No strong image: the headline is the focal point |
| `grid-of-n` | Carousels, ranges, menus: 2–6 equal cells under one headline |
| `long-copy` | Print ads and long flyers: image, caption, headline, body in columns, brand and CTA |

## Rules

- One focal point per piece, different from everything else on two dimensions.
- Reading order: focal, headline, brand and CTA. Brand next to the headline.
- Snap everything to the grid; use as few alignment edges as possible.
- Space between groups at least twice the space inside a group.
- Text, logos and CTAs inside the safe area; only art may bleed.
- Body lines of 45–75 characters; long copy gets subheads.
- Never shrink the headline to make the picture bigger.
- On web and email, the message must not look like an ad strip.
- Mirror templates for right-to-left scripts; give Indic scripts extra line height and test with real copy.
- Reuse a few templates per product; change the idea, image and colour combination each time.
- Don't justify a layout by the golden ratio, the rule of thirds or the Z-pattern.

Rules already set by the messaging playbook (`foundations/messaging`): one idea, one image, few words on posters and outdoor (W6); brand name or logo beside the headline (O4); long copy dark on light, never in all capitals (O8); captions under images in long-form layouts (O9); image and headline add to each other rather than repeat (W5).

## Files

| File | Contents |
|---|---|
| `research.md` | The dossier: how people look at layouts, hierarchy and grouping, text blocks, image and words, mobile and safe areas, composition claims, why templates, myths, scorecard, sources |
| `layout.json` | Data: `findings`, `myths`, `grids`, `safeAreas`, `hierarchy`, `whitespace`, `composition`, `rules` |
| `../../templates/layouts/` | Layout templates (`layouts.json`) and a zero-dependency SVG renderer (`render.mjs`) |
