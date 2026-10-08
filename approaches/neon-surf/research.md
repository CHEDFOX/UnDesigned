# Rad Dog / Neon Surf: research dossier

## 1. Definition

**Rad Dog / Neon Surf** is the graphic look of late-1980s and early-1990s surf and skate culture as it reached teenagers through T-shirts, decks, stickers, board shorts and Saturday-morning TV:
- one bold, black-outlined cartoon character with attitude (often an animal, often in sunglasses)
- hot, near-fluorescent colour on flat grounds, with airbrush fades and paint splatter
- a small kit of devices: curling waves, sunset suns, palms, checkerboards, Memphis-style confetti
- chunky sticker lettering on a tilt

**Where the name comes from.** "Rad Dog / Neon Surf" is the name of an entry in the Consumer Aesthetics Research Institute (CARI), an online archive that names and catalogues commercial visual styles. The entry's page (cari.institute/aesthetics/rad-dog-neon-surf) was blocked from our research environment, so we could not read it directly. Search-engine summaries of it describe neon paint splatters, hypercolor effects, "tribal" motifs and "radical" surf and skate imagery, and say the name plays on **Rude Dog**, the white cartoon dog in sunglasses that began on Sun Sportswear's surf and skate clothing and got a 1989 CBS cartoon (see 2.1). The same summaries say many of the entry's images came from a Facebook group, "Neon Ooze/Surf Shack", run by Karl Kraft; CARI's separate "Neon Ooze" entry credits that group. Treat these details as second-hand until someone checks the page. We found no brand, artist or product actually called "Rad Dog". The term names a style, not a company.

Its aim here: **loud and fun, but still clear.** It sits between two failure modes:

| Too tame | Rad Dog / Neon Surf | Too much |
|---|---|---|
| A neon colour on an otherwise corporate layout; a stock "retro" font and nothing else | One outlined hero, one diagonal, two patterns, hot Wada colour, sticker type | Pattern on pattern, five characters, glitch everywhere, fake slang, caricatured "tropical" culture |

## 2. Lineage

### 2.1 Surf and skate graphics

| Who / what | When | What we take |
|---|---|---|
| **Hang Ten** (Duke Boyd and Doris Moore, Seal Beach, California) | founded 1960 | Surf as a clothing brand with a simple graphic mark (two bare feet). The idea that a surf graphic is merch. |
| **Body Glove** (Bill and Bob Meistrell, Redondo Beach) | founded 1953; neoprene wetsuits | Wetsuits and swimwear that, by the 1980s, came in loud colour blocking. Colour as performance gear. |
| **Ocean Pacific (OP)** (apparel from 1972 under Jim Jenks) | 1970s-80s; OP Pro contest from 1982 | Surfwear as mass fashion; contest posters and logo-heavy tees. |
| **Jim Phillips**, art director for Santa Cruz Skateboards / NHS Inc. | 1970s-80s; **Screaming Hand** 1985 | Fat black ink outlines, bright flat fills, sight gags (shark fins, a hand coming out of a wave). One iconic character carrying a brand for 40 years. |
| **Rude Dog** (Brad McMahon for Sun Sportswear) | drawn from 1985; *Rude Dog and the Dweebs*, CBS, 1989 | The "rad dog": a white cartoon dog in shades, mascot first, cartoon second. Our signature hero. McMahon cites New Wave and 2 Tone ska as influences. |
| **Mambo** (Dare Jennings and Andrew Rich, Sydney) | founded 1984; Reg Mombassa from 1986 | Australian surfwear as art: funny, satirical, hand-drawn, artist-led. Wit lives in the picture. |
| **Vans** checkerboard slip-on | slip-on 1977; checkerboard early 1980s; *Fast Times at Ridgemont High*, 1982 | The checkerboard as surf-skate shorthand. It reportedly began with customers drawing checks on their shoes. |
| **Generra Hypercolor** | launched January 1991; bankrupt 1992 | Heat-sensitive colour-changing tees: the peak of the neon-surf fad, and a reminder of how fast it burned out. |

### 2.2 Neighbouring design movements

| Who / what | When | What we take |
|---|---|---|
| **Memphis Group** (Ettore Sottsass, Nathalie Du Pasquier and others, Milan) | first show September 1981; active to about 1987 | Squiggles, zigzags, terrazzo, "Bacterio" dots and loud laminate colour. Our confetti vocabulary. |
| **Day-Glo** (Bob and Joe Switzer) | daylight fluorescent pigments from the 1940s; Day-Glo Color Corp. from 1969 | The physical source of "neon" colour. It cannot be printed in CMYK or shown on screen (see 2.3). |
| **Airbrush illustration** | 1970s-80s | Smooth fades on suns, skies and chrome. We allow one fade, or spray stipple instead. |

### 2.3 Neon colour: what it is physically

Fluorescent pigments absorb ultraviolet light and give it back as visible light, so they look brighter than any ordinary ink. Two practical consequences:
- **Print:** fluorescent colours need spot inks. Pantone's fluorescent basics are 801-807. Pantone's own colour finder classes 801 C as blue and 806 C as red/pink. Ink makers' sheets give 802 green, 803 yellow and 804 orange; they disagree on 805-807 (red, pink, magenta, violet). Some wide-format printers swap magenta and yellow for fluorescent pink and yellow, but then they cannot print deep reds.
- **Screen:** an RGB display cannot show fluorescence. Bright sRGB colours are only stand-ins.

So this approach works by default in Wada's brightest colours. Real fluorescent ink is an extension that needs approval (`art.json` → `palette.extensions`).

### 2.4 The contemporary revival

Retro surf and skate graphics are back in merch and fashion. Brands have reissued their 1980s work: Vans' Fast Times slip-on, Maui and Sons with Madrid skateboards, a 2022 announcement of an adult *Rude Dog* reboot. Skate style also returned to fashion around 2021, when skateboarding first appeared at the Tokyo Olympics. Lyst reported a 46% rise in "skater" searches at that time. The look is nostalgic for people who grew up with it and simply "fun" for younger audiences. Use the attitude; don't copy the old characters.

### 2.5 Respect: whose wave is it?

Surfing (*heʻe nalu*, "wave sliding") is a Native Hawaiian practice with a history of more than a thousand years. Missionaries discouraged it in the 1800s, and Duke Kahanamoku (1890-1968) and others revived it in Waikīkī in the early 1900s. Museums now tell this history from a Kānaka Maoli perspective (Heard Museum, *Heʻe Nalu*, 2023; Bishop Museum). 1980s-90s surfwear often borrowed faux-Polynesian "tribal" patterns, tiki idols and hula caricatures as decoration. This approach does not (see 5 and `art.json` → `vocabulary.avoid`).

## 3. Why it works, and where it goes against the evidence

The findings below are from `foundations/research/visual-preference.json`, referenced by id.

| Finding (id) | What the evidence says | How this style does | What we do about it |
|---|---|---|---|
| `curvature` | Curves are preferred to sharp angles (meta-analysis, g = 0.39). | Partly: cartoon shapes, waves and blobs are round, but checkerboards and confetti are angular. | Characters and objects are always rounded (`art.json` → `shape`); points only on confetti and starbursts. |
| `simplicity` | Low visual complexity is rated more appealing, and complexity is judged within 17-50 ms. | **Against.** The genre is busy. | One hero (30-45%), at most two patterns, at least 25% calm ground (`art.json` → `composition`). |
| `fluency` | Contrast and clear figure-ground make things easier to process, and so more liked. | **For.** Fat black outlines separate every shape, even on loud colour. | One outline weight for everything (`art.json` → `line`). |
| `first-impression` | Appeal is judged in 50 ms. | Mixed: the silhouette and colour hit at once, but pattern can blur the focal point. | The hero must read as a silhouette; test it at thumbnail size. |
| `maya` | Typicality and novelty together predict preference. | **For.** A very familiar genre; the novelty goes into the one gag. | `art.json` → `method`: a new sight gag each time. |
| `fractals` | People prefer mid-range natural complexity. | Partly: wave foam and spray stipple are natural-ish, but flat. | Spray stipple and scalloped foam add texture. |
| `handmade` | Handmade signals care. | Partly: inked outlines, splatter and airbrush look made by hand. | Slight screen-print misregistration on print (`art.json` → `texture`). |
| `colour-valence` | Colour preference follows objects: clear blues are liked, dark yellows and olives disliked. | Mixed: sea blues and teals are liked; full-strength hot yellows polarise. | Bright clean yellows only, never olive or ochre grounds; always a cool sea colour (`art.json` → `palette`). |

**Why going against the evidence can still be right.** The preference findings measure average *liking*. This style is built for other goals:

- **Arousal and attention.** Saturation is the strongest colour driver of arousal (Valdez & Mehrabian, 1994; Wilms & Oberfeld, 2018). Berlyne's arousal theory predicts that medium arousal is liked best (an inverted U). A test with scenes, cartoons and paintings found complexity and arousal almost the same thing (r > 0.85), and found that complexity related to beauty as an inverted U, to pleasantness negatively and to liking positively (Marin, Lampatz, Wandl & Leder, 2016). So more complexity can raise liking and interest while lowering calm. Our caps aim for "high but not maximum".
- **Nostalgia.** Across six experiments, nostalgic participants valued money less and were willing to pay more for products. Social connectedness partly explained the effect (Lasaleta, Sedikides & Vohs, 2014). Tastes formed in youth tend to stay preferred: Holbrook & Schindler (1989) found a peak at about age 24 for popular music, and replications put it nearer 14-17. For people born roughly 1970-1990, this genre *is* that formative look. That is an inference from the music studies, not tested on graphics.
- **Distinctiveness.** A consistent mascot and set of devices can become distinctive brand assets (Romaniuk, 2018). Items that stand out from their surroundings are remembered better (the isolation or von Restorff effect; Hunt, 1995). Rude Dog and the Screaming Hand are examples of single characters that carried brands for decades.

**Fit:** consumer brands that want energy, youth, summer or play (drinks, snacks, apparel, events, surf and skate, games, kids' products for nostalgic parents). **Poor fit:** health, finance, legal, grief, luxury calm, or any product that needs to look careful and quiet.

## 4. What it is and isn't

| It is | It isn't |
|---|---|
| One outlined cartoon hero with attitude | A crowd of characters, or no character at all |
| One fat ink outline weight on everything | Thin, sketchy or coloured lines |
| Hot Wada colour plus a cool sea colour, black and white | Muddy, olive or pastel-only palettes; fluorescent ink without approval |
| One diagonal, sticker type on a tilt | Several competing angles; straight, centred corporate type |
| Two patterns at most, 25% calm ground | Pattern in every corner |
| Hard block shadows, one airbrush fade, spray stipple | Blurred drop shadows, glows, chrome on body text |
| Bouncy springs, squash and stretch, one short VHS jitter | Constant glitch, strobing, endless spinning |
| Visual wit, plain copy | Fake slang, exclamation marks, hype |
| Respect for surfing's Hawaiian roots | Tiki idols, faux-tribal patterns, hula caricatures |

## 5. Risks and guards

| Risk | Guard |
|---|---|
| Too busy to read | One hero at 30-45%, at most two patterns, at least 25% calm ground; test at thumbnail size (`art.json` → `composition`) |
| Looks like cheap pastiche | A new sight gag each piece; no copied mascots or slang; real typefaces, not "retro" effect fonts (NS7) |
| Childish for adult products | Grown-up copy with specific facts; the joke is on the situation; Shrikhand only for short words |
| Low contrast on hot colours | Ink text on light grounds, paper text with ink outline elsewhere; prefer combinations with AA text contrast (`art.json` → `palette.recommendedCombinations`) |
| Cultural appropriation | No tiki, faux-tribal or hula imagery; credit surfing's Hawaiian origin where history is told (research.md 2.5) |
| Trademark trouble | Never use or imitate Screaming Hand, Rude Dog or other existing mascots |
| Motion fatigue or seizures | One moving thing; no flashing more than 3 times a second (WCAG 2.3.1); reduced-motion shows the final frame |
| Neon that cannot be produced | Wada-only by default; fluorescent spots only as an approved extension with a physical proof |
| Dated quickly (Hypercolor burned out within about 18 months) | Use as a campaign or sub-brand style, or keep the core identity calm and let this be the "summer" voice |

## 6. Scorecard

Score each piece 0 (no), 1 (partly) or 2 (yes). 15 or more out of 20 is ready.

1. One hero, readable as a silhouette in 2 seconds without the words.
2. The hero acts out the benefit with one sight gag.
3. Every shape has the same fat ink outline; type has outline and block shadow.
4. One dominant diagonal; no more than two angles.
5. At most two patterns, and at least 25% calm ground.
6. One Wada combination from the bright set, plus ink and paper; at most one airbrush fade; no glows or blurred shadows.
7. Type is the product's pairing, chunky and in sentence case, with at most three sizes; text sits on calm ground or a sticker.
8. Brand sticker next to the headline; CTA on a sticker where the format needs one.
9. Motion (if any) is springy, moves one thing at a time, ends on a still frame and has a reduced-motion fallback.
10. Funny, not dumb: plain copy, no fake slang, no caricature, no copied mascots.

## 7. Sources

**The term**
- Consumer Aesthetics Research Institute, "Rad Dog / Neon Surf" entry (page not reachable from our environment; described via search-engine summaries): https://cari.institute/aesthetics/rad-dog-neon-surf
- CARI, "Neon Ooze" entry (credits the Facebook group "Neon Ooze/Surf Shack", run by Karl Kraft): https://cari.institute/aesthetics/neon-ooze
- Consumer Aesthetics Research Institute (overview): https://en.wikipedia.org/wiki/Consumer_Aesthetics_Research_Institute ; It's Nice That feature: https://www.itsnicethat.com/features/the-consumer-aesthetics-research-institute-spotlight-creative-industry-121125
- Rude Dog and the Dweebs: https://en.wikipedia.org/wiki/Rude_Dog_and_the_Dweebs ; Rude Dog (Brad McMahon, Sun Sportswear): https://dbpedia.org/page/Rude_Dog ; reboot announcement: https://animationmagazine.net/2022/05/80s-mascot-rude-dog-returns-to-animation-in-adult-comedy

**Surf and skate lineage**
- Jim Phillips (illustrator): https://en.wikipedia.org/wiki/Jim_Phillips_(illustrator) ; Screaming Hand story: https://www.surfertoday.com/skateboarding/the-story-of-jim-phillips-screaming-hand ; Santa Cruz: https://santacruzskateboards.com/screaming-hand
- Mambo Graphics: https://en.wikipedia.org/wiki/Mambo_Graphics ; Reg Mombassa, Australian National Maritime Museum: https://collections.sea.museum/en/people/14650/reg-mombassa
- Body Glove: https://en.wikipedia.org/wiki/Body_Glove
- Hang Ten: https://www.brandlandusa.com/2007/12/06/hang-ten-is-back/
- Ocean Pacific and Jim Jenks: https://shop-eat-surf-outdoor.com/news/ocean-pacific-apparel-founder-jim-jenks-dies-helped-birth-modern-surf-industry/526509/
- Vans checkerboard and *Fast Times*: https://sneakerbardetroit.com/vans-checkerboard-slip-on-fast-times-release-date/
- Hypercolor: https://en.wikipedia.org/wiki/Hypercolor ; https://www.smithsonianmag.com/arts-culture/why-hypercolor-t-shirts-were-just-a-one-hit-wonder-3353436/
- Memphis Group: https://designmuseum.org/discover-design/all-stories/memphis-group-awful-or-awesome ; https://www.vitra.com/en-cn/campus/news/details/memphis-40-years-of-kitsch-and-elegance
- Revival: https://www.refinery29.com/en-us/2021/08/10632854/skater-fashion-90s-trend ; https://www.ridingboards.com/awesome-madrid-x-maui-and-sons-re-issue-collection/

**Neon colour**
- Day-Glo Color Corp.: https://en.wikipedia.org/wiki/Day-Glo_Color_Corp. ; American Chemical Society landmark: https://www.acs.org/education/whatischemistry/landmarks/dayglo.html
- Pantone 801 C and 806 C (colour finder): https://www.pantone.com/color-finder/801-c ; https://www.pantone.com/color-finder/806-c
- Fluorescent ink datasheet (801-807 monopigmented; 808-814 mixtures): https://shop.igepa.be/media/6b/3c/61/1696202941/31-1050-0054_NewV-set-Dayglow.pdf
- Fluorescent channels replacing magenta and yellow: https://graphics-pro.com/feature/how-to-sublimate-fluorescent-colors/ ; https://blog.spgprints.com/how-to-make-optimal-use-of-fluorescent-colors-as-part-of-your-sublimation-print-process

**Hawaiian surfing history**
- Heard Museum, *Heʻe Nalu: The Art and Legacy of Hawaiian Surfing*: https://heard.org/exhibition/hee-nalu-the-art-and-legacy-of-hawaiian-surfing/
- Bishop Museum exhibition coverage (NPR / KUNC): https://www.kunc.org/2021-01-24/museum-exhibition-explores-the-history-of-surfing-in-hawaii

**Evidence**
- Valdez, P., & Mehrabian, A. (1994). Effects of color on emotions. *Journal of Experimental Psychology: General*, 123(4), 394-409.
- Wilms, L., & Oberfeld, D. (2018). Color and emotion: effects of hue, saturation, and brightness. *Psychological Research*, 82. https://link.springer.com/article/10.1007/s00426-017-0880-8
- Berlyne, D. E. (1971). *Aesthetics and Psychobiology*. Appleton-Century-Crofts.
- Marin, M. M., Lampatz, A., Wandl, M., & Leder, H. (2016). Berlyne Revisited: Evidence for the Multifaceted Nature of Hedonic Tone in the Appreciation of Paintings and Music. *Frontiers in Human Neuroscience*, 10, 536. https://www.frontiersin.org/articles/10.3389/fnhum.2016.00536/full
- Lasaleta, J. D., Sedikides, C., & Vohs, K. D. (2014). Nostalgia Weakens the Desire for Money. *Journal of Consumer Research*, 41(3), 713-729. https://doi.org/10.1086/677227
- Holbrook, M. B., & Schindler, R. M. (1989). Some Exploratory Findings on the Development of Musical Tastes. *Journal of Consumer Research*, 16(1), 119-124. https://ideas.repec.org/a/oup/jconrs/v16y1989i1p119-24.html ; replication summary: https://link.springer.com/article/10.1007/s11002-022-09626-7
- Romaniuk, J. (2018). *Building Distinctive Brand Assets*. Oxford University Press.
- Hunt, R. R. (1995). The subtlety of distinctiveness: What von Restorff really did. *Psychonomic Bulletin & Review*, 2(1), 105-112. https://doi.org/10.3758/BF03214414
- Palmer, S. E., & Schloss, K. B. (2010). An ecological valence theory of human color preference. *PNAS*, 107, 8877-8882.
- W3C, WCAG 2.2, Success Criterion 2.3.1 Three Flashes or Below Threshold: https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold
- Shared findings: `foundations/research/visual-preference.json`.

**Typefaces** (credits from the google/fonts repository metadata)
- Titan One (Rodrigo Fuenzalida): https://github.com/google/fonts/tree/main/ofl/titanone
- Shrikhand (Jonny Pinhorn): https://github.com/google/fonts/tree/main/ofl/shrikhand
- Lilita One (Juan Montoreano): https://github.com/google/fonts/tree/main/ofl/lilitaone
- Rubik (Hubert and Fischer, Meir Sadan, Cyreal, Daniel Grumer, Omaima Dajani): https://github.com/google/fonts/tree/main/ofl/rubik
- Nunito Sans: https://github.com/google/fonts/tree/main/ofl/nunitosans ; Space Mono (Colophon Foundry): https://github.com/google/fonts/tree/main/ofl/spacemono
