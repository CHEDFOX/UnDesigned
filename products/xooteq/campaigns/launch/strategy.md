# XOOTEQ content strategy

From the core in `products/xooteq/identity.json`. Every series is written from the core and the playbook; the site's facts are the proof, its lines are quoted only as the brand's own (the five beliefs, "Does it matter?", "We shoot the impossible.").

**The core in one breath.** XOOTEQ builds software, AI and AI films, and proves what it believes with dirt under its nails. One filter decides everything: *does it matter?* Builders aged 18 to 35 get a table. The tension that makes it worth talking about: technology that grows life instead of extracting it.

**Style.** Commercial Modernism (`approaches/commercial-modernism/`): one hero, a bold viewpoint, one diagonal, lettering in planned bands, the brand word big in tracked capitals. It fits a cinematic, photo-led brand because its photo method (one strong image, duotone in the combination, lettering beside it, a fade into Black) is how XOOTEQ's own og cards already work, made stricter. Palette: Wada 340 in dark mode (Black ground, White headlines, Sea Green accent, Peach Red as the warm second signal). Type: Schibsted Grotesk 800/400 + JetBrains Mono.

**Rules every series shares** (distinctive assets and repetition, `layout.json` findings `distinctive-assets`, `repetition`, `wear-out`):

- The lockup (original XQ monogram tile + XOOTEQ in tracked capitals) sits next to the headline, in the same place per template.
- A JetBrains Mono label in Sea Green capitals names the series above every headline (the site's own signal).
- One glowing thing per piece: the photo's light source, a Sea Green beam, or one Peach Red object. Never two.
- Photos are the brand's own, duotoned into 340 (Black to Sea Green to White, or Black to Peach Red to White for warm light), placed with `foundations/layout/media.json` and measured with `templates/layouts/overlay.mjs`.
- Words say what the picture can't (W5). Customer as hero: "you" more than "we" (S1).

---

## 1. Does it matter? (the filter and the five beliefs)

- **Job:** say what XOOTEQ stands for, so builders self-select. Brand building (O2), community (P4).
- **Series:** a manifesto: one belief per slide or card, each followed by what it means for *you*, ending on the filter. Re-run quarterly with a new image or a new builder's answer.
- **Hook formula:** `[the belief, stated flat] + [what it changes for you, in under 15 words]`. The last frame always asks "Does it matter?"
- **Guide use:** type-led composition (`layout.json` composition `type-led`), one Sea Green diagonal beam as the continuous element (implied motion, CM3), pop-out (one bright thing). Motion: lettering wipes on (CM `wipe`), one card at a time, reading-time holds (`media.json` on-screen-time).
- **Pieces:** beliefs carousel (5 slides), manifesto type animation.

## 2. Dirt under the nails (Green Revolution)

- **Job:** prove the tension with action. Every quarter, in every city XOOTEQ works in, it plants trees and protects green spaces. Not carbon credits.
- **Series:** photo-led. A real image of growing things, a short line that joins a tech word to a soil word, and the fact.
- **Hook formula:** `[a technology noun] + [an organic verb or noun]` ("The best infrastructure has roots"), then the plain fact. No numbers until the brand gives them (trees, cities).
- **Guide use:** picture superiority (`picture-superiority`): the image carries the idea; monument composition (CM2: low horizon, the sprout or tree looms); text in a calm region or on the solid end of a fade into Black, measured on the photo's worst-case pixels. Story with a poll sticker inside the safe area (touch-centre).
- **Pieces:** seedling post, poll story, tree poster, growing-tree motion piece.

## 3. The table (Build With Us)

- **Job:** applications. The direct CTA: tell XOOTEQ what you're building at hello@xooteq.com.
- **Series:** what you get, the three steps, the promise (everyone gets a reply), the people.
- **Hook formula:** `[the builder's situation] + [what's waiting at the table]` ("The idea that keeps you up needs a table").
- **Guide use:** StoryBrand plan in three steps (S5) drawn as a rising diagonal; grid-of-n for what you get (grouping); a continuous "table edge" rule across the carousel; real photos of hands and people (`real-photos`), silhouettes' gaze toward the words (`gaze-cue`); left-lean on web formats; banner made to look like content, not an ad strip (`banner-blindness`).
- **Pieces:** Build With Us carousel (4 slides), LinkedIn post, question-sticker story, web banner, landing hero.

## 4. We shoot the impossible (DUMBORD, AI cinema)

- **Job:** show range: XOOTEQ also makes films with AI, through its studio DUMBORD (started 2025).
- **Series:** one striking frame and a line about what cinema no longer needs (sets, crews, locations).
- **Hook formula:** `No [thing films used to need].` + DUMBORD's own line as sign-off.
- **Guide use:** faces first and gaze cue (`faces-first`, `gaze-cue`): the figure looks toward the headline; split composition; thumbnail readable at 320 px, bottom-right kept clear.
- **Pieces:** DUMBORD thumbnail, DUMBORD post (the one light piece, on the daylight palette).

## 5. Made at XOOTEQ (the family and the beta)

- **Job:** connect the parent to its products; grow the beta list (transitional CTA: xooteq.com/creation).
- **Series:** each product named with its one-line description from its own page, "made at XOOTEQ", and an invitation to shape the next one. No claims beyond the product pages (no ratings, users or features not listed there).
- **Hook formula:** `[product]: [what it does, in its own words]` + "Get the next one first."
- **Guide use:** grid-of-2 split by one diagonal (CM3), type-led, grouping (each name with its line).
- **Pieces:** family post.

---

## Cadence (proposal, to confirm with the brand)

| Week | Feed | Story | Web / LinkedIn |
|---|---|---|---|
| 1 | Beliefs carousel | Poll story (green) | Landing hero |
| 2 | Seedling post | Question story (build) | LinkedIn: the desk |
| 3 | Build With Us carousel | Growing-tree motion | Banner |
| 4 | Family post, DUMBORD post | Manifesto motion | Thumbnail for the next DUMBORD film |

Measure: applications to hello@xooteq.com, beta sign-ups at xooteq.com/creation, saves and shares on the carousels (the manifesto's job is to be passed on).
