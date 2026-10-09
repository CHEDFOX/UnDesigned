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
