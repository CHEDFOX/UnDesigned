# Doodles: research dossier

## 1. Definition

**Doodles** is the look of someone thinking with a pen: quick monoline marks (arrows, stars, spirals, squiggles, loops, faces, clouds) drawn around a message, or covering a whole surface. It keeps three things from real notebook doodling:
- one pen, used fast, with lines that wobble and loops that don't quite close
- marks that react to the content (pointing, circling, counting, celebrating)
- a sense of play and of work in progress

The style turns that into rules: one line weight, a fixed mark vocabulary, three density modes, flat Wada colour slapped on slightly off the line, and hand lettering for a few words only.

It sits between two failure modes:

| Too tidy | Doodles | Too messy |
|---|---|---|
| Clip-art "doodle" icon packs, perfect vector strokes, one sticker-like squiggle as decoration | One pen, marks with jobs, a chosen density, one focal idea, set body type | Random scribbles everywhere, no focal point, lettering for everything, many colours, unreadable text |

### The boundary with Humanist Minimal

Both styles use a human ink line, so the line between them must be clear:

| | Humanist Minimal | Doodles |
|---|---|---|
| Number of marks | 1-3 objects | 5-15 marks (margin), 3-7 clusters (page), hundreds (wall) |
| Empty ground | at least 40% | at least 45% (margin), 30% (page), a 25-40% clearing (wall) |
| Line | thick marker (2.25% of the artboard), small steady wobble | one thinner pen (0.65% fineliner or 1.1% marker), about twice the wobble, overshooting loops |
| Colour | paper shapes cut from Wada White, accent on one object | ink-led; flat fills from one or two Wada colours, offset from the line |
| Idea | one metaphor from two symbols | one focal idea plus marks that annotate it |
| Type | no handwriting fonts | a hand-lettered display for up to 8 words; set body |
| Motion | springs, smooth draw-on | frame-by-frame: boil, stepped draw-on, wiggles |

If a piece has three marks or fewer and lots of space, it is Humanist Minimal; if the marks talk to the message or fill the surface, it is Doodles.

## 2. Lineage

### 2.1 Art: the line that thinks out loud

| Who / what | When | What we take |
|---|---|---|
| **Paul Klee**, *Pädagogisches Skizzenbuch* (Pedagogical Sketchbook), Bauhaus Book 2 | 1925 | The book opens with a line that goes for a walk, for its own sake. The doodle's premise: a line can wander and still mean something. Source of **loops and wandering lines**. |
| **Saul Steinberg**, *The Line* (ink on paper, about 18 x 404 in., for the Children's Labyrinth at the 10th Milan Triennale) | 1954 | One continuous line that turns into a horizon, a washing line, a railway, a table edge. Steinberg described drawing as a way of reasoning on paper. Source of **marks that think** and **wit from the line itself** (shared with Humanist Minimal, used here at higher density). |
| **Keith Haring**, subway drawings: white chalk on the black paper that covered expired advertising panels in New York stations | 1980-1985 | Fast, unbroken, confident lines drawn in public, a vocabulary of simple symbols (crawling babies, barking dogs, dancing figures), and short lines radiating from figures to show energy. Haring was not a doodler in the notebook sense; he was a public artist with a strict graphic system. What we take is the **speed, the one-weight line and the radiating marks**, not his figures. His exposure to Pierre Alechinsky's retrospective at the 1977 Carnegie International (Pittsburgh) shows the link back to CoBrA's spontaneous drawing. |
| **Mr Doodle** (Sam Cox, born 1994, Kent) | 2010s- | All-over black-and-white "graffiti spaghetti": interlocking characters and marks that cover every surface, most famously his house in Tenterden, Kent (finished 2022; reported as 900 litres of white paint, 401 cans of black spray and 2,296 pen nibs). Source of the **wall mode**: even density, no holes, one pen. |
| **Jon Burgerman** (British, born 1979, based in New York; *Pens Are My Friends*, IDN, 2008) | 2000s- | Wobbly, colourful doodle characters and murals, with flat colour sitting loosely inside thick outlines (our reading of the work). Source of **offset flat fills** and **playfulness without polish**. His work is in the V&A and Science Museum collections. |
| **Shantell Martin** (born 1980, London; based in New York) | 2000s- | Live, stream-of-consciousness black line drawing over walls, objects and clothing; artist in residence at the MIT Media Lab (2015). Her handwriting became the font Shantell Sans (2023). Source of **one-pen walls with words in them** and of our hand-lettered display. |

### 2.2 Design and practice: doodles that explain

| Who / what | What we take |
|---|---|
| **Sketchnoting**, Mike Rohde, *The Sketchnote Handbook* (Peachpit, 2012) | Visual note taking for people who can't draw: a small vocabulary of containers, arrows, bullets, simple faces and hand lettering arranged along a path. Source of the **page mode**, of **marks with jobs** and of the rule that lettering is short. |
| **Google Doodles**, starting with the Burning Man logo of 30 August 1998 | The name "doodle" for a playful, temporary mark on a brand; the logo is changed for a day without losing recognition. Source of **the brand as a page you can draw on** (not of the visual style, which varies). |
| **Rough.js** (Preet Shihn, MIT licence) and **Excalidraw** | Code that draws sketchy, hand-drawn-looking shapes and hachure fills; Excalidraw made the sketchy look normal for diagrams. Shows that a hand look can be **systematic and generated**, as in our `sample.mjs`. |

### 2.3 Colour: printed off the line

Doodle colour is usually added afterwards: highlighter over a notebook, a second print pass, a sticker. Burgerman's flat colours that don't fill their outlines exactly, and risograph-style misregistration, are the model. That is why fills here are offset from the line in one direction and only some shapes get one. Colours come from one Wada combination, as everywhere in the guide.

### 2.4 Motion: line boil and hand animation

| Who / what | When | What we take |
|---|---|---|
| **Squigglevision**, Tom Snyder Productions (*Dr. Katz, Professional Therapist*, 1995) | 1995-2000s | Outlines drawn five slightly different times and looped, so lines never stop trembling; it gave life to scenes with little movement. Source of **line boil**. |
| **Animating on twos** (24 fps film with each drawing held for two frames, 12 drawings a second) | traditional practice (rule of thumb) | Stepped, held timing reads as hand-made. Source of our **8-12 fps** artwork motion and `steps()` easing. |

## 3. Why it works: evidence

| Effect | Finding | What it means for us |
|---|---|---|
| **The handmade effect** (`handmade`) | Products described as handmade were seen as more attractive, mainly because they are felt to symbolically contain love (Fuchs, Schreier & van Osselaer, 2015). | Doodles are visibly made by a hand; keep the wobble and overshoot. This is the style's strongest evidence. |
| **Preference for curves** (`curvature`) | People prefer curved contours to sharp angles; meta-analysis g = 0.39 (Bar & Neta, 2006; Chuquichambi et al., 2022). | Loops, spirals and clouds are the core marks. Stars, arrows and zigzags add points, so tips are rounded by the round cap and pointy marks stay a minority. |
| **Low visual complexity** (`simplicity`) and **the 50 ms first impression** (`first-impression`) | Complexity is judged within 17-50 ms and high complexity lowers appeal (Tuch et al., 2012); appeal is judged consistently at 50 ms (Lindgaard et al., 2006). | **This is where Doodles goes against the evidence**, especially the wall mode. Guards: three explicit modes, mark counts, a focal at least 3x any mark, a 25-40% clearing for walls, and a mark-free band around body text. |
| **Familiar with a twist** (`maya`) | People like novelty that does not cost typicality (Hekkert, Snelders & van Wieringen, 2003). | Doodles are the most familiar marks there are; the twist is using them as a brand's main voice. Keep formats recognisable. |
| **Mid-range natural roughness** (`fractals`) | Preference peaks at moderate fractal roughness, D = 1.3-1.5 (Spehar et al., 2003); individual differences exist. | A wobbling hand line is moderately rough, between ruler-smooth and noisy; our wobble range (1-2.5 units) aims there. This is our reading, not a measurement. |
| **Drawing helps memory** | Drawing a word's meaning led to better free recall than writing it, across seven experiments, and beat imagery, describing and viewing pictures (Wammes, Meade & Fernandes, 2016). | Supports sketchnote (page) layouts that draw the key ideas. The effect is for the person drawing, so for viewers it is suggestive only. |
| **Doodling while listening** | 40 participants who shaded shapes while listening to a dull phone message recalled more names and places than those who only listened (Andrade, 2010; secondary summaries report about 29% more). Later studies are mixed: unstructured doodling did worse than structured doodling and note-taking, and no better than listening (Boggs, Cohen & Marchand, 2017). | We do not claim doodles make viewers remember more. We use the study only as cultural background: doodling is linked with attention, not distraction. |
| **Sketchy invites participation** | Clearly sketchy visualisations may increase engagement and willingness to annotate, but sketchiness lowers precision of area judgements (Wood et al., 2012). Architects responded to sketch renderings differently from CAD images, and sketches suited early discussion (Schumann et al., 1996). | Doodles read as open and unfinished: good for launches, workshops, feedback and community. Don't doodle over data people must read precisely; keep charts clean and annotate them. |

## 4. What it is and isn't

| It is | It isn't |
|---|---|
| One pen weight, round ends, a visible wobble, loops that overshoot | Calligraphic swell, two pens, perfect vector strokes, scratchy sketch lines |
| Marks that point, count, circle, celebrate or react | Random decoration, clip-art doodle packs |
| A chosen density: margin, page or wall | Half-full layouts that are neither |
| One focal idea, at least 3x the other marks, in a clearing on walls | A wall with no place for the eye to rest |
| Black ink on a light Wada ground, one or two flat fills offset from the line | Coloured ink, gradients, every shape filled, many colours |
| Hand lettering for up to 8 headline words, set type for body and CTA | Hand fonts for paragraphs, buttons or prices |
| Simple faces (two dots and a line) and own characters | Mascots, copies of Haring's or Mr Doodle's characters, graffiti tags |
| Boiling, stepped, hand-animated motion that settles | Smooth tweens, morphs, endless jitter |

## 5. Risks and how we guard against them

| Risk | Guard |
|---|---|
| Visual noise hides the message | Three density modes with counts; focal at least 3x any mark; clearing of 25-40% in walls; mark-free band around text (`art.json` → `composition`) |
| Looks childish | Faces stay minimal; no mascots; wit comes from what marks say about the message (DD7); clear body type; Nunito-style round type rated only "good" |
| Looks like a stock doodle pack | One pen, own marks drawn per product; packs and emoji banned (`art.json` → `vocabulary.avoid`) |
| Copying named artists | Never use Haring's, Mr Doodle's, Burgerman's or Martin's characters or signature motifs; they are living artists or managed estates. Take the principle (line, density, play), not the drawings |
| Appropriating graffiti culture | No fake tags, throw-ups or wildstyle letters; graffiti is a living subculture with its own codes. Commission writers if a brief truly needs it |
| Hand lettering hurts reading | Hand faces for up to 8 words; size 10-15% larger; body, CTA, prices and legal text always set (DD6) |
| Motion becomes tiring | Boil only the focal or headline; boil stops after 10 s; reduced-motion users see the still frame; boil moves lines by 1-3 units and never flashes colour (`motion.json`) |
| Low contrast | Light grounds only (L* 80 or more) with black ink; all recommended combinations give 9:1 or more |

## 6. Scorecard

Score each piece 0 (no), 1 (partly) or 2 (yes). 16 or more out of 20 is ready.

1. Says one thing; the focal idea reads in 2 seconds, even in wall mode.
2. The density mode is clear (margin, page or wall) and its counts and empty-ground minimum are respected.
3. One pen: a single line weight with round ends, a visible wobble and overshooting loops.
4. Every mark near the message has a job (point, count, circle, celebrate, react, link).
5. The focal element is at least 3x any other mark; in walls it sits in a 25-40% clearing.
6. One Wada combination: black ink on its light ground, at most two fill colours offset in one direction, the accent on one object.
7. Hand lettering is used for at most 8 words; body, CTA and prices are set type with a mark-free band around them.
8. Type is the product's pairing, in sentence case, with at most three sizes.
9. Motion (if any) is frame-stepped (8-12 fps), settles on a still frame, and has a reduced-motion fallback.
10. Playful, not childish: no mascots, no copied artist characters, no drawn exclamation marks.

## 7. Sources

Evidence (also in `foundations/research/visual-preference.json`):
- Fuchs, C., Schreier, M., & van Osselaer, S. M. J. (2015). The Handmade Effect: What's Love Got to Do with It? *Journal of Marketing*, 79(2), 98–110. https://doi.org/10.1509/jm.14.0018
- Bar, M., & Neta, M. (2006). Humans Prefer Curved Visual Objects. *Psychological Science*, 17(8), 645–648.
- Chuquichambi, E. G., et al. (2022). How universal is preference for visual curvature? *Annals of the New York Academy of Sciences*, 1518, 151–165. https://doi.org/10.1111/nyas.14919
- Tuch, A. N., et al. (2012). The role of visual complexity and prototypicality regarding first impression of websites. *International Journal of Human-Computer Studies*, 70(11).
- Lindgaard, G., et al. (2006). Attention web designers: You have 50 milliseconds to make a good first impression! *Behaviour & Information Technology*, 25.
- Hekkert, P., Snelders, D., & van Wieringen, P. C. W. (2003). 'Most advanced, yet acceptable'. *British Journal of Psychology*, 94.
- Spehar, B., Clifford, C. W. G., Newell, B. R., & Taylor, R. P. (2003). Universal aesthetic of fractals. *Computers & Graphics*, 27.

Doodling, drawing and sketchiness:
- Andrade, J. (2010). What does doodling do? *Applied Cognitive Psychology*, 24(1), 100–106. https://doi.org/10.1002/acp.1561 (the "29% more" figure is from secondary summaries, e.g. https://www.simplypsychology.org/andrade-doodling.html; we could not read the full paper).
- Boggs, J. B., Cohen, J. L., & Marchand, G. C. (2017). The effects of doodling on recall ability. *Psychological Thought*. https://www.psycharchives.org/en/item/0434d3bd-3923-475f-950b-9b4fe5e0777e and https://digitalscholarship.unlv.edu/edpsych_fac_articles/164
- Wammes, J. D., Meade, M. E., & Fernandes, M. A. (2016). The drawing effect: Evidence for reliable and robust memory benefits in free recall. *Quarterly Journal of Experimental Psychology*, 69(9). https://doi.org/10.1080/17470218.2015.1094494 ; summary: https://uwaterloo.ca/news/news/need-remember-something-better-draw-it-study-finds
- Wood, J., Isenberg, P., Isenberg, T., Dykes, J., Boukhelifa, N., & Slingsby, A. (2012). Sketchy Rendering for Information Visualization. *IEEE TVCG*, 18(12), 2749–2758. https://doi.org/10.1109/TVCG.2012.262 ; https://openaccess.city.ac.uk/id/eprint/1274/
- Schumann, J., Strothotte, T., Raab, A., & Laser, S. (1996). Assessing the effect of non-photorealistic rendered images in CAD. *CHI '96*. https://doi.org/10.1145/238386.238398

Lineage:
- Klee, P. (1925). *Pädagogisches Skizzenbuch*. Bauhausbücher 2. English: *Pedagogical Sketchbook*, trans. Sibyl Moholy-Nagy (1953). https://www.librarything.com/work/569102
- Saul Steinberg Foundation, *The Line*, 1954: https://saulsteinbergfoundation.org/artwork/the-line-1954/ ; foundation site (tagline "a way of reasoning on paper"): https://saulsteinbergfoundation.org/
- Keith Haring, subway drawings: https://en.wikipedia.org/wiki/Keith_Haring ; Haring Foundation on Alechinsky: https://foundationblog.haring.com/?p=686 ; *Conversation with Keith Haring*: https://www.haring.com/!/selected_writing/conversation-with-keith-haring
- Mr Doodle's house: Colossal (2022) https://www.thisiscolossal.com/2022/10/mr-doodle-house/ ; ITV News (2022) https://www.itv.com/news/meridian/2022-10-03/british-artist-mr-doodle-transforms-kent-mansion-with-his-hand-drawn-sketches ; biography: https://ocula.com/artists/mr-doodle/
- Jon Burgerman: https://en.wikipedia.org/wiki/Jon_Burgerman ; https://penguinrandomhouse.com/authors/2144993/jon-burgerman
- Shantell Martin: https://en.wikipedia.org/wiki/Shantell_Martin
- Rohde, M. (2012). *The Sketchnote Handbook*. Peachpit Press. https://www.peachpit.com/authors/bio/dea1d1c4-bf7e-4e48-adf0-aff6f188a739
- Google Doodles, Burning Man Festival, 30 August 1998: https://doodles.google/doodle/burning-man-festival/ ; https://doodles.google/about/
- Rough.js: https://github.com/rough-stuff/rough ; Excalidraw: https://excalidraw.com
- Squigglevision: https://en.wikipedia.org/wiki/Squigglevision

Typefaces (credits from Google Fonts metadata, https://github.com/google/fonts):
- Shantell Sans: Shantell Martin (concept and direction), Arrow Type / Stephen Nixon (type design), Anya Danilova (Cyrillic). https://github.com/arrowtype/shantell-sans ; Google Fonts since 17 January 2023.
- Gochi Hand: Juan Pablo del Peral for Huerta Tipográfica (HT Fonts). https://github.com/google/fonts/tree/main/ofl/gochihand
- Alegreya Sans: Juan Pablo del Peral, HT Fonts. https://github.com/google/fonts/tree/main/ofl/alegreyasans
- Figtree: Erik Kennedy. https://github.com/erikdkennedy/figtree
- Bringhurst, R. *The Elements of Typographic Style* (line length, used in typography.json).
