# Scrapbook: research dossier

## 1. Definition

**Scrapbook** is collage made from things people keep. A piece is assembled, not drawn:
- bordered photos, ticket stubs, labels, stamps, stickers and scraps of torn or ruled paper
- held down with tape, stickers or photo corners
- each piece slightly rotated and overlapping its neighbours
- one short human mark: an arrow, a circle, a handwritten note

Its aim is to feel **personal and real**: a page someone made by hand to remember something, with one thing on it that matters most.

It sits between two failure modes:

| Too tidy | Scrapbook | Too messy |
|---|---|---|
| A grid of straight photos with a "paper texture" filter; stock scrapbook-kit stickers; everything at 0 degrees | One hero item, 4–7 kept things, small rotations and overlaps, flat colour, a clear reading path | Every corner filled, ransom-note body copy, text on top of photos, ten fonts, fake coffee stains |

## 2. Lineage

Scrapbook design combines five traditions. Knowing them helps you judge new work.

### 2.1 Domestic albums: keeping and arranging

| Who / what | When | What we take |
|---|---|---|
| **Victorian scrapbooks** and "scraps" | 19th century | Chromolithography (from 1837) made cheap colour prints; printers embossed them, coated them in gelatine and gum, and die-cut them into sheets of "scraps" joined by small tabs. Adults and children cut them out and stuck them into albums, onto screens and cards to record daily life and events (V&A; Garden Museum). Source of **die-cut stickers**, the **album page** and the idea that **ordinary people compose**. |
| Family photo albums | 20th century | White-bordered prints, photo corners, handwritten captions. Source of the **bordered photo** and the **caption note**. |

### 2.2 Art: collage, papier collé and photomontage

| Who / what | When | What we take |
|---|---|---|
| **Pablo Picasso**, *Still Life with Chair Caning* | May 1912 | Oilcloth printed with chair caning, framed with real rope: usually called the first modern collage. Real material on the picture surface. |
| **Georges Braque**, *Fruit Dish and Glass* | September 1912 | Wallpaper pasted in place of paint: the first **papier collé** (pasted paper). Source of **paper standing in for things**. |
| **Hannah Höch**, *Cut with the Kitchen Knife Dada through the Last Weimar Beer-Belly Cultural Epoch in Germany* (Nationalgalerie, Berlin) | 1919–20 | Photomontage cut from the *Berliner Illustrirte Zeitung* and other magazines, shown at the First International Dada Fair (1920). Source of **cut-out photos and words, scale jumps, and a clear sweep through the chaos**. |
| **Kurt Schwitters**, *Merz* pictures (e.g. *Picture with Light Center*, 1919, MoMA) | from 1919 | Collages of tickets, wrappers and printed scraps found in the street. "Merz" is a fragment cut from "Kommerz" (Commerz- und Privatbank). Source of **everyday ephemera as material** and of **careful, balanced composition** inside found mess. |

### 2.3 Punk and zines: DIY, cut-out type, photocopy

| Who / what | When | What we take |
|---|---|---|
| ***Sniffin' Glue***, Mark Perry | July 1976 – 1977 | A photocopied punk fanzine: first run about 50 copies, 12 issues; it urged readers to make their own. Source of **DIY honesty** and **typewriter text**. |
| **Jamie Reid**, Sex Pistols artwork, e.g. *God Save the Queen* | 1977 | Letters cut from newspaper headlines in the style of a ransom note, over a found portrait. Source of **ransom-note lettering** (as a spice; see rules). |
| **Riot grrrl zines**, e.g. *Bikini Kill* (Kathleen Hanna, Tobi Vail, Kathi Wilcox) | 1991 onwards | Feminist punk zines from Olympia and Washington, D.C.: handwritten, typed, collaged and photocopied, now archived at NYU's Fales Library. Source of **handwriting as a personal voice** and **collage as speaking for yourself**. |

These are living subcultures with named makers. We take their *methods* (cut, paste, copy, write by hand), not their slogans, symbols or political images (see section 5).

### 2.4 Contemporary collage and journaling

- **Junk journaling and scrapbook-style social posts.** Publishers describe junk journaling (journals built from found images, stickers and ephemera) as a craft that has grown since the 2020 lockdowns and is popular with Gen Z. This is publisher marketing, not research; treat it as a signal only.
- **Pinterest collages.** Pinterest launched the collage app Shuffles in 2022 and later folded collages into Pinterest. On its Q1 2024 earnings call the company said Gen Z made up nearly 70% of collage creators and that collage Pins were saved about three times as often as other Pins (company figures, not independently audited).

### 2.5 Motion: cut-out and stop-motion animation

| Who / what | When | What we take |
|---|---|---|
| **Lotte Reiniger**, *The Adventures of Prince Achmed* | 1923–26 | Cut-out silhouettes moved under a camera, frame by frame; the oldest surviving animated feature. Source of **paper moved by hand**. |
| **Terry Gilliam**, Monty Python animations | 1969–1974 | Cut-out animation from magazine images, pushed in front of a camera. Source of **pieces dropping in and moving in jumps**. |
| Animating "on twos" | convention | Each pose held for two frames at 24 fps: 12 poses a second. Source of our **steps(12) easing**. |

## 3. Why it works: evidence

The shared findings are in `foundations/research/visual-preference.json`. Scrapbook goes *with* some and *against* others.

| Finding (id) | Direction | What it means for us |
|---|---|---|
| **Handmade signals care** (`handmade`) | With | Products described as handmade were seen as more attractive, mainly because they are felt to carry love (Fuchs, Schreier & van Osselaer, 2015). Cutting, taping, stamping and writing make the making visible. |
| **Familiar, with a twist** (`maya`) | With | Typicality and novelty jointly predict preference (Hekkert, Snelders & van Wieringen, 2003). Albums, tickets and photos are familiar to almost everyone; the twist is the arrangement and the one idea. |
| **Nature's mid-range complexity** (`fractals`) | Partly with | People preferred moderately rough fractal edges (D ≈ 1.3–1.5) over smooth or very rough ones (Spehar et al., 2003). Torn fibre edges and hand marks give that roughness, as long as they stay small (`art.json` → `shape.edges.torn`). |
| **Low visual complexity** (`simplicity`) | **Against** | Websites with low visual complexity were rated most appealing, judged within 17–50 ms (Tuch et al., 2012). Collage is complex by nature. **Guard:** at most 7 items plus tape, one hero at 30–45% of the canvas, at least 25% visible ground. |
| **The 50 ms first impression** (`first-impression`) | **Partly against** | Visual appeal is judged in 50 ms (Lindgaard et al., 2006). **Guard:** the hero and the headline must read as the two largest, highest-contrast things; everything else is smaller and quieter. |
| **Curves over sharp angles** (`curvature`) | **Against** | People prefer curved contours (Bar & Neta, 2006; meta-analysis g = 0.39, Chuquichambi et al., 2022). Paper is rectangular and torn edges are jagged. **Guard:** keep rotations small, use round stickers and stamps as counterpoints, and never add sharp decorative shapes (stars, bursts). |
| **Colours borrow feelings** (`colour-valence`) | Neutral | Brown and dark yellow are among the least liked colours on average (Palmer & Schloss, 2010). Kraft grounds are brown-ish, so recommended combinations favour cream, buff, yellow and grey, and keep browns for products where they mean something good (bread, coffee, craft). |

### Why it can still be right: what preference scores miss

| Gain | Evidence |
|---|---|
| **Memorability** | In 2,070 real-world charts, colour and human-recognisable objects made a visualisation more memorable; unusual types beat common ones (Borkin et al., 2013). Embellished charts were interpreted as accurately as plain ones and recalled significantly better two to three weeks later (Bateman et al., 2010). Ephemera are recognisable objects. |
| **Distinctiveness** | An item that differs from its neighbours is remembered better (von Restorff, 1933; see Hunt, 1995, for what she actually showed). In a feed of flat, clean layouts a collage stands out; inside the collage, the single hero and the single accent are the distinct items. |
| **Warmth and authenticity** | The handmade effect above; the making shows. |
| **Participation** | People make collages themselves (albums, zines, junk journals, Pinterest collages), so the style invites them in. Company data only; see 2.4. |

Rule of thumb, not a finding: memorable is not the same as liked or understood. Borkin et al. say so explicitly. The guard rails exist so the piece is memorable *and* readable.

## 4. What it is and isn't

| It is | It isn't |
|---|---|
| One hero item and 3–6 supporting kept things | A pile of everything the brand owns |
| Rotations of −8 to +8 degrees; text strips −2 to +2 | Random angles, upside-down text |
| Overlaps of 5–25%, nothing covering words | Items covering the headline or faces |
| Torn, cut and die-cut edges; tape, corners, stickers | Floating items with no fixing; blurred drop shadows |
| Flat colour from one Wada combination, flat offset shadows | Gradients, glows, photo-real paper textures |
| Heavy headline on paper strips, ransom letters on one word | Ransom-note body copy, ten fonts |
| One handwritten note of six words or fewer | Handwriting fonts for headlines or calls to action |
| Stop-motion drops and settles, one item at a time | Smooth floating, parallax, everything jittering |
| Real facts on tickets and labels | Invented dates, numbers or testimonials presented as real |

## 5. Risks and how we guard against them

| Risk | Guard |
|---|---|
| Too complex to read at a glance | 4–7 items plus tape; one hero at 30–45%; 25% visible ground; reading path headline → hero → message → brand (`art.json` → `composition`) |
| Text illegible on texture | All text sits on paper strips, labels or notes; text on ground uses the combination's text role (AA) |
| Ransom note reads as a threat or as noise | Ransom letters on one headline word only, max 10 letters, every tile at 4.5:1 contrast; never on body, calls to action or threatening words (`typography.json` → `ransomNote`) |
| Looks like a stock template | No scrapbook-kit textures or clip-art stickers; items come from the product's own world (`art.json` → `vocabulary`) |
| Fake nostalgia | No faked wear (coffee rings, burns, sepia filters); age comes from the colour combination and real objects |
| Cultural borrowing from punk and riot grrrl | Take methods (cutting, copying, handwriting), not slogans, symbols or political images. Don't use real protest imagery, flags or defaced portraits of real people. Credit makers when a piece is explicitly a homage. Riot grrrl was made by young women about their own lives; don't use its look to sell things that contradict it. |
| Misleading ephemera | Tickets, receipts and stamps show real facts or obviously decorative ones; never fake proof (a fake sold-out stamp, a fake award) |
| Too much motion | Steps animation, one moving item at a time, sequences under 3 s, reduced-motion users see the finished collage (`motion.json`) |

## 6. Scorecard

Score each piece 0 (no), 1 (partly) or 2 (yes). 16 or more out of 20 is ready.

1. Says one thing; the hero and headline read in 2 seconds.
2. One hero item (30–45% of the canvas), every other item at most half its size.
3. 4–7 items plus tape, 3–5 layers, at least 25% of the ground visible.
4. A clear reading path: headline (top 35%) → hero → message → brand and call to action.
5. Rotations within −8 to +8 degrees (text strips −2 to +2); overlaps 5–25%; nothing covers words or the hero's focal point.
6. Materials are honest: at least two edge types, every item fixed, flat offset shadows in one direction, tape the only translucent material.
7. One Wada combination; accent on two small items at most; text passes AA.
8. Type: the pairing in sentence case, three sizes, all text on paper; ransom letters on one word at most; one handwritten note of six words or fewer.
9. Items come from the product's world and add facts the headline does not say (words and image add to each other).
10. Motion (if any) is stop-motion, one item at a time, under 3 s, ending on a still frame, with a reduced-motion fallback.

## 7. Sources

Evidence
- Fuchs, C., Schreier, M., & van Osselaer, S. M. J. (2015). The Handmade Effect: What's Love Got to Do with It? *Journal of Marketing*, 79(2), 98–110. https://doi.org/10.1509/jm.14.0018
- Hekkert, P., Snelders, D., & van Wieringen, P. C. W. (2003). 'Most advanced, yet acceptable': Typicality and novelty as joint predictors of aesthetic preference in industrial design. *British Journal of Psychology*, 94, 111–124.
- Spehar, B., Clifford, C. W. G., Newell, B. R., & Taylor, R. P. (2003). Universal aesthetic of fractals. *Computers & Graphics*, 27, 813–820.
- Tuch, A. N., Presslaber, E. E., Stöcklin, M., Opwis, K., & Bargas-Avila, J. A. (2012). The role of visual complexity and prototypicality regarding first impression of websites. *International Journal of Human-Computer Studies*, 70(11), 794–811.
- Lindgaard, G., Fernandes, G., Dudek, C., & Brown, J. (2006). Attention web designers: You have 50 milliseconds to make a good first impression! *Behaviour & Information Technology*, 25(2), 115–126.
- Bar, M., & Neta, M. (2006). Humans Prefer Curved Visual Objects. *Psychological Science*, 17(8), 645–648.
- Chuquichambi, E. G., et al. (2022). How universal is preference for visual curvature? *Annals of the New York Academy of Sciences*, 1518, 151–165. https://doi.org/10.1111/nyas.14919
- Palmer, S. E., & Schloss, K. B. (2010). An ecological valence theory of human color preference. *PNAS*, 107(19), 8877–8882.
- Borkin, M. A., Vo, A. A., Bylinskii, Z., Isola, P., Sunkavalli, S., Oliva, A., & Pfister, H. (2013). What Makes a Visualization Memorable? *IEEE Transactions on Visualization and Computer Graphics*, 19(12), 2306–2315. https://vcg.seas.harvard.edu/publications/20130101-what-makes-a-visualization-memorable
- Bateman, S., Mandryk, R. L., Gutwin, C., Genest, A., McDine, D., & Brooks, C. (2010). Useful Junk? The Effects of Visual Embellishment on Comprehension and Memorability of Charts. *CHI 2010*, 2573–2582. https://vis.csail.mit.edu/classes/6.859/readings/pdfs/Bateman-UsefulJunk.pdf
- von Restorff, H. (1933). Über die Wirkung von Bereichsbildungen im Spurenfeld. *Psychologische Forschung*, 18, 299–342. https://doi.org/10.1007/BF02409636
- Hunt, R. R. (1995). The subtlety of distinctiveness: What von Restorff really did. *Psychonomic Bulletin & Review*, 2(1), 105–112.

Lineage
- Victoria and Albert Museum, scrap (object O1110904): manufacture and use of chromolithographed scraps. https://collections.vam.ac.uk/item/O1110904/
- Garden Museum, "Garden Scraps" (Google Arts & Culture): chromolithography from 1837, albums and journals. https://artsandculture.google.com/story/QAVhJqasMsskKw
- Smarthistory, Synthetic Cubism (Picasso, *Still Life with Chair Caning*; Braque, *Fruit Dish and Glass*). https://human.libretexts.org/Bookshelves/Art/Art_History_and_Theory/SmartHistory_of_Art_2e/SmartHistory_of_Art_IXa_-_Modernisms_1900_to_1945/04%3A_Cubism__early_abstraction/4.04%3A_Beginner's_Guide_to_Cubism/4.4.04%3A_Synthetic_Cubism_Part_I
- Smarthistory, Hannah Höch, *Cut with the Kitchen Knife…*. https://smarthistory.org/?p=50607
- MoMA, *The Photomontages of Hannah Höch* (exhibition catalogue, 1997). https://www.moma.org/documents/moma_catalogue_241_300015683.pdf
- MoMA, "In Search of Lost Art: Kurt Schwitters's Merzbau" (on *Picture with Light Center*, 1919). https://www.moma.org/explore/inside_out/2012/07/09/in-search-of-lost-art-kurt-schwitterss-merzbau/
- MoMA, Kurt Schwitters, *Merz Picture 32 A. The Cherry Picture* (1921). https://www.moma.org/collection/works/33356
- MoMA press release on Schwitters (1985), origin of "Merz". https://www.moma.org/docs/press_archives/6175/releases/MOMA_1985_0029_29.pdf
- *Sniffin' Glue* (Mark Perry, 1976–77). https://en.wikipedia.org/wiki/Sniffin%27_Glue
- Royal Collection Trust, Jamie Reid, *God Save the Queen* for the Sex Pistols (1977). https://col.rct.uk/collection/2119608/queen-elizabeth-ii-god-save-the-queen-for-the-sex-pistols
- Artsy, Jamie Reid (ransom-note lettering cut from newspaper headlines). https://www.artsy.net/artist/jamie-reid
- ZineWiki, *Bikini Kill* zine (1991). https://zinewiki.com/wiki/Bikini_Kill
- NYU Fales Library, Riot Grrrl Publicity Collection (MSS.316). https://findingaids.library.nyu.edu/fales/mss_316
- Darms, L. (ed.) (2013). *The Riot Grrrl Collection*. The Feminist Press. https://zinewiki.com/wiki/The_Riot_Grrrl_Collection
- Close-Up Film Centre, Lotte Reiniger, *The Adventures of Prince Achmed*. https://www.closeupfilmcentre.com/library/films/the-adventures-of-prince-achmed-lotte-reiniger/13033
- Open Culture, Terry Gilliam explains his cut-out animation (1974). https://www.openculture.com/2014/07/terry-gilliam-reveals-the-secrets-of-monty-python-animations.html
- iD Tech, What does animating on ones, twos and threes mean? https://www.idtech.com/blog/what-does-animating-on-ones-twos-and-threes-mean

Contemporary
- Pinterest Q1 2024 earnings call transcript (collages, Gen Z share of creators, save rate). https://www.fool.com/earnings/call-transcripts/2024/05/01/pinterest-pins-q1-2024-earnings-call-transcript/
- Junk journaling as a Gen Z craft (publisher's description; marketing, not research). https://scorpiobooks.co.nz/?p=538810

Typefaces (credits from the Google Fonts repository metadata)
- Archivo, Archivo Black: Omnibus-Type. https://github.com/google/fonts/tree/main/ofl/archivo
- Courier Prime: Alan Dague-Greene. https://github.com/google/fonts/tree/main/ofl/courierprime
- Anton: Vernon Adams. https://github.com/google/fonts/tree/main/ofl/anton
- Work Sans: Wei Huang. https://github.com/google/fonts/tree/main/ofl/worksans
- Special Elite: Astigmatic (Apache 2.0). https://github.com/google/fonts/tree/main/apache/specialelite
- DM Serif Display, DM Sans, DM Mono: Colophon Foundry. https://github.com/google/fonts/tree/main/ofl/dmserifdisplay
- Caveat: Impallari Type. https://github.com/google/fonts/tree/main/ofl/caveat
- Permanent Marker: Font Diner (Apache 2.0). https://github.com/google/fonts/tree/main/apache/permanentmarker
- Bringhurst, R. *The Elements of Typographic Style* (line length).
