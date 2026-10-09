# Combinations

How the guide's components go together for a human brain, decided once and followed by every product.

The brain doesn't judge a colour, a typeface and a drawing separately; it judges whether they belong together. People rate shapes, colours, type and motion on the same few dimensions (Osgood's evaluation, potency, activity; Ou's colour activity, weight and heat), expect certain features to go together (Spence's crossmodal correspondences: round with soft, angular with hard), and choose a brand about twice as often when its font fits (Doyle & Bottomley). So the guide places every component on the same five axes and combines the ones that agree.

| Axis | Low | High |
|---|---|---|
| roundness | angular, mechanical | rounded, organic |
| activity | calm, sparse, still | energetic, busy, moving |
| potency | light, delicate | heavy, strong |
| warmth | cool, technical | warm, close |
| hand | precise, machine-made | made by hand, personal |

## Files

| File | What it holds |
|---|---|
| `foundations/research/combinations.json` | The findings and their sources (checked against the published abstracts) |
| `combinations.json` | The axes; profiles for the 10 styles; cues that profile the 28 pairings; the colour model for the 159 Wada colours; the brand-word lexicon; campaign goals; rules C1-C11 |
| `tools/design/compose.mjs` | The composer that applies them |

## How a product gets its combination

```sh
npm run compose -- <product> [campaign] [--goal launch|trust|care|calm|celebrate|explain] [--write]
```

1. **Target.** The brand's character words (`identity.json` → `core.character`, or the voice words in `messaging.json`) are looked up in the lexicon and averaged per axis; a campaign goal is added.
2. **Profiles.**
   - Styles: profiled here, each with its reason.
   - Pairings: profiled from their own classification (Henderson, Giese & Cote's typeface dimensions).
   - Colours: computed from CIELAB. Arousal and dominance follow Valdez & Mehrabian's brightness and saturation equations; warmth follows the direction of the colour-heat factor.
   - Palettes: area-weighted mixes of their colours.
3. **Rules.**
   - C1: everything agrees, with stated traits weighing more.
   - C2: type is matched on potency and activity.
   - C3: ground and text have similar hues and strong lightness contrast.
   - C4: the accent contrasts in hue.
   - C5: no olive, dark-yellow or brown grounds unless the brand owns them.
   - C6: palettes close to the brand's known colours score up.
   - C7: one moderate tension at most, never on a stated trait.
   - C8–C9: complexity and motion follow activity.
   - C10: a hand face only when the brand owns one or is clearly human.
   - C11: the style's own lists come first.
4. **Result.** The composer prints the winning style, palette, pairing, hand face and motion plan, explains each against the rules, and lists the next best combination in other styles. `--write` saves it as the campaign's `campaign.json`, which `npm run design` follows.

## When a person disagrees

Change the rule, not the piece: add the missing word to the lexicon, correct a style's profile, or adjust a weight here, with the reason. Every product follows from then on.

## The recipe library (no product needed)

`recipes.json` holds the most likable complete combinations for 12 general moods, three per mood, so anyone (a person or a chat) can pick one and create directly.

| Mood | Use it for |
|---|---|
| calm-warm | Food, care, wellbeing, home, small kind brands |
| calm-clear | Health information, explainers, public services, finance help |
| quiet-premium | Luxury, culture, architecture, galleries, fine goods |
| precise-tech | Software, engineering, data, developer tools |
| bold-confident | Launches, statements, sport, campaigns that must stop the scroll |
| playful-bright | Kids and family, snacks, games, fun apps |
| festive-rich | Festivals, celebrations, weddings, food fairs |
| human-handmade | Makers, community, notes, personal brands |
| fresh-light | Spring, drinks, clean beauty, travel |
| earthy-grounded | Coffee, outdoors, craft, sustainability |
| retro-optimistic | Nostalgia, consumer launches, hospitality, events |
| warm-tech | Consumer apps, fintech for people, AI tools for everyone |

Each recipe gives:

- the style
- the Wada combination and mode, with named colours and their contrast
- the type pairing
- a hand face, if any
- the motion plan
- its position on the five axes, and its one tension
- a **likability** score (0-100) with the reasons

**Likability** is general human liking, built from:

- **unity:** the parts agree; unity is the dominant factor (Post, Blijlevens & Hekkert 2016)
- **variety:** one controlled contrast
- **fluency:** figure-ground contrast (Reber, Winkielman & Schwarz 1998)
- **colour pleasure:** Valdez & Mehrabian (1994)
- **colour harmony:** Schloss & Palmer (2011)
- **curvature:** Bar & Neta (2006); Gómez-Puerto, Munar & Nadal (2016)
- **blue:** Hurlbert & Ling (2007)
- **typicality:** "most advanced, yet acceptable" (Hekkert et al. 2003)
- **a penalty for olive, dark-yellow and brown grounds:** Palmer & Schloss (2010)

How the library is built:

- Culture-specific styles (Desi Maximalism) are kept out of the general library; use them when the audience calls for them.
- Styles and palettes are spread across the library, so it offers range rather than one favourite repeated.

To use a recipe: put `{ "recipe": "calm-warm-1" }` in a campaign's `campaign.json`. The engine expands it, and any field you add next to it (for example `"text": "white"`) wins.

To rebuild after changing the rules: `npm run recipes` (add `-- --render` for a sample poster of each, in `tools/design/recipes/`).
