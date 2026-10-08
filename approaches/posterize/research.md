# Posterize: research dossier

## 1. Definition

**Posterize** turns a real photograph into a print. The continuous tones of the photo are cut into a few flat levels (usually three or four) and each level is printed in one flat colour, as a screen printer would separate an image into stencils:
- dark tones become the ink plate
- middle tones become the accent colour
- light tones become the ground or the paper

The result keeps what a photo is good at (a real person, a real gesture, a real object) and drops what makes photos slow to read (texture, soft gradients, busy backgrounds). It aims to be **seen from across the street and still feel true**.

It sits between two failure modes:

| Too photographic | Posterize | Too abstract |
|---|---|---|
| 6+ levels, posterize filter left on default, banding, muddy colours, skin texture, busy background | 2-5 flat levels mapped to one Wada combination, one subject cropped close, hard edges, one print sign | 2 levels on a weak photo, features lost, a blob that only reads with the caption; or redrawn as vector geometry that no longer looks like a photo |

## 2. Lineage

### 2.1 Technique: from photo to plates

| Technique | What it is | What we take |
|---|---|---|
| **Screen printing (serigraphy)** | Ink pushed through a mesh with a stencil; one stencil and one pass per colour. Photo stencils let a photograph become a stencil. | Every level is a separate flat plate; colours do not blend. |
| **Threshold** | One cut: everything darker than a value prints, everything lighter does not. | The two-level version (the Che poster). |
| **Posterization / tonal quantisation** | Several cuts: the range of tones is divided into a few bands, each shown as one value. | 2-5 bands; cut points set by percentiles of the photo's own tones (art.json → `posterize.thresholds`). |
| **Duotone and tritone** | A greyscale image printed with two or three inks, each covering part of the tonal range. | Two- and three-colour ladders from Wada combinations; Spotify's duotone era (2.3). |
| **Colour separation** | Splitting an image into one plate per ink, printed in register. | Plates as separate layers that can move (motion.json) and can sit slightly out of register (art.json → `registration`). |
| **Halftone** | Tone simulated by dots of varying size on a screen at a fixed angle. In four-colour printing the screens are set 30 degrees apart (cyan 15, magenta 75, black 45) with yellow at 0 to limit moiré; newspapers print at about 85 lines per inch, magazines at about 133. | Dots as the only gradation; one screen at 45 degrees, or 15/45/75/0 for several. |
| **Ordered dithering** | Bayer (1973) described a threshold matrix that turns pixels on in a fixed order to suggest grey with two levels; it gives a recognisable crosshatch. | The digital version of halftone inside `posterize.mjs` (`bayer4`, `bayer8`). |

### 2.2 Art and protest

| Who / what | When | What we take |
|---|---|---|
| **Andy Warhol**, *Gold Marilyn Monroe* (MoMA) and *Marilyn Diptych* (Tate) | 1962 | Among his first photo-silkscreened canvases. The face was cropped from a publicity still for the film *Niagara* (1953), shot by Gene Kornman, and screened over flat painted colour. The *Diptych* repeats the image 50 times, 25 in colour and 25 in black. We take: a cropped face, flat colour blocks under the screen, repetition in different colours (our `grid` placement and `colourCycle`). |
| **Jim Fitzpatrick**, *Che* | 1968 | A two-tone (black on red) screen-printed poster made from Alberto Korda's photograph of Che Guevara (5 March 1960). Fitzpatrick changed the gaze and hair; he first made the image free to use, then asserted copyright in 2010 after commercial use. We take: the two-level threshold and the upward gaze; we refuse its use as a sales icon (5). |
| **Atelier Populaire**, Paris | May-June 1968 | Students and workers occupying the École des Beaux-Arts printed hundreds of posters (MACBA: more than 350 between 14 May and 27 June; V&A: an estimated 120,000 from about 300 designs), mostly by cheap home-made silkscreen in one or two colours, signed by the collective. We take: one or two colours, one image, one short line. |
| **OSPAAAL**, Havana | from 1966 | Solidarity posters folded into the *Tricontinental* magazine, printed in three or four languages; many later ones were screenprints. We take: bold flat colour and photographic portraits reduced to plates. |
| **Gig posters** | 1990s on | Frank Kozik hand-silkscreened and numbered posters for bands in Austin and San Francisco and helped revive the printed rock poster; notably he avoided photos of the band. We take: the screen print as a living, collectable medium, not only a pop-art quotation. |
| **Shepard Fairey**, *Barack Obama "Hope"* | 2008 | A stencil portrait in four flat colours (red, beige, light and dark blue) based on an April 2006 Associated Press photograph by Mannie Garcia. The National Portrait Gallery holds a hand-finished collage, stencil and acrylic version. The AP disputed the use of the photo; the case was settled. We take: four levels for a face, the upward three-quarter view. We also take the warning: own your source photograph. |

### 2.3 Brand and print practice today

| Who / what | When | What we take |
|---|---|---|
| **Spotify identity by Collins** | 2015 | The rebrand launched at SXSW 2015 moved away from green and black to a wider palette with two-colour (duotone) photography. Collins built a tool ("the Colorizer") to apply the treatment to large volumes of images. We take: a consistent, automatable treatment turns any photo into a brand asset; that is what `posterize.mjs` is for. |
| **Risograph** | from 1986 | Riso Kagaku's RISOGRAPH 007 (1986) made stencil masters by burning holes with a thermal head; each colour needs its own drum and pass. Independent publishers adopted it from the 2000s, and its spot colours and slight misregistration became a look of their own. We take: spot colours, one pass per colour, visible registration. Riso's fluorescent inks are outside the Wada palette and are not part of this style. |

## 3. Why it works: evidence

Findings referenced by id are in `foundations/research/visual-preference.json`.

| Effect | Finding | What it means for us |
|---|---|---|
| **Two tones are enough for a face** | Mooney (1957) showed that people can see faces in two-tone, thresholded photographs, filling in the missing parts (closure). Later work found that "easy", cartoon-like Mooney faces are seen the same way by everyone, while "hard" ones depend on the viewer (Canas-Bajo & Whitney, 2020). | Thresholding works, but only if the features survive. Hence PZ4: set cuts so eyes, nose shadow and mouth stay readable; reject photos that only make "hard" Mooney faces. |
| **Faces win the first look** | In eye-tracking of natural photos, viewers' first two fixations landed on a face in over 80% of cases, without being asked to look for faces (Cerf, Harel, Einhäuser & Koch, 2008). | Real people and faces earn attention; posterizing keeps the face and removes the rest. |
| **Figure-ground clarity** (`fluency`) | Clear figure-ground separation, contrast and clarity make images easier to process and so more liked (Reber, Schwarz & Winkielman, 2004). | Hard plates and a removed background give maximum figure-ground contrast. |
| **Low complexity** (`simplicity`) | Visual complexity is judged within 17-50 ms and lowers appeal (Tuch et al., 2012). | Few levels, one subject. Five levels and busy photos bring complexity back, so they are capped. |
| **The 50 ms impression** (`first-impression`) | Appeal ratings after 50 ms match those after 500 ms (Lindgaard et al., 2006). | The silhouette and the colour ladder must work before anyone reads. Test at thumbnail size. |
| **Familiar, with a twist** (`maya`) | Typicality and novelty together predict preference (Hekkert, Snelders & van Wieringen, 2003). | A photo is the most familiar image there is; the flat-colour print is the twist. |

### Where Posterize goes against the evidence

- **Curvature** (`curvature`): people prefer curved contours. Posterized contours are organic, but the cuts are hard and some tonal breaks are sharp. We accept this: the edge is what makes the print readable at distance. We smooth before cutting so edges follow forms, not noise.
- **Handmade** (`handmade`): a print process reads as made, but not as hand-made, and a default software filter reads as mechanical. Misregistration and worn ink help a little; real screen or riso prints help more for hero pieces.
- **Colour valence** (`colour-valence`): saturated pop pairs (red, yellow, black) polarise. Use them when attention matters more than calm; choose softer ladders (combinations 166, 303) for health, care or finance.
- **Natural detail** (`fractals`): posterizing removes fine natural detail by design.

Being less "liked" on average can still be right. Posterized posters are built to be **noticed, recognised and remembered**: they win attention (faces), iconicity (the most copied portraits of the last sixty years are posterized) and distinctiveness (one treatment applied to every photo becomes a brand asset; Romaniuk, 2018).

## 4. What it is and isn't

| It is | It isn't |
|---|---|
| A real photo, cut into 2-5 flat levels | A photo with a filter, or a vector drawing |
| One subject, cropped close, side lit | Group shots, scenes, busy backgrounds |
| Tone in order: ink dark, accent middle, ground or paper light | Random colour swaps on the hero piece |
| Hard, slightly wandering edges | Blurred edges, or perfect geometric curves |
| Halftone dots as the only gradation | Gradients, shadows, glows, 3D |
| One print sign (offset plate or halftone fade) | Fake grunge over everything |
| Bold condensed type on flat colour | Type over the image, outline or distressed fonts |
| Your own, licensed, consented photos | Celebrities, public figures, borrowed icons |
| Stepped, cut motion; plates sliding into register | Crossfades, zooms, flashing colour |

## 5. Risks and guards

| Risk | Guard |
|---|---|
| Features disappear (a "hard Mooney" face) | Percentile cuts with ink at 20-35% of the subject; nudge cuts up to 8 points; test at 2 levels and at 48 px (art.json → `posterize`) |
| Looks like a cheap filter | Smooth, despeckle, map to a Wada ladder, add one print sign; never use a default posterize with many levels |
| Colour order breaks (a middle colour darker than ink) | Colours sorted by luminance; adjacent levels 15 L* apart (art.json → `roleMapping`) |
| Text unreadable | Text only on flat colour; text role at 4.5:1 for body (WCAG 2.2 SC 1.4.3); ink plate 3:1 against the ground, the non-text contrast level of SC 1.4.11 |
| Flashing in motion | At most three colour changes per second; no large saturated red flashes (WCAG 2.2 SC 2.3.1); reduced motion shows the still |
| Copyright and likeness | Only photos the product owns or licenses, with model releases. The Hope dispute shows that a posterized derivative is still tied to its source photo |
| Political imagery used as decoration | No raised fists, revolutionary portraits or protest slogans for products; the Che image's sale on merchandise is the cautionary example (art.json → `vocabulary.avoid`) |
| Pastiche of famous works | No Marilyn grids of celebrities, no Hope layout; use the techniques with the product's own images |
| Unflattering portraits | Posterizing exaggerates shadows under eyes and on skin; light from the front-side, review with the person shown, and never use it to mock |

## 6. Scorecard

Score each piece 0 (no), 1 (partly) or 2 (yes). 16 or more out of 20 is ready.

1. One subject and one message, readable in 2 seconds without the words.
2. The image is a real photograph (owned or licensed, with consent), cropped close with the subject filling 50-80% of the image block.
3. 2-5 flat levels; no gradients, photo texture or soft edges remain.
4. Tone keeps its order (ink darkest, ground or paper lightest) with clear steps between levels.
5. The features survive: eyes, nose shadow and mouth (or the object's key parts) read at thumbnail size.
6. One Wada combination; areas within the art.json ranges.
7. At most one print sign, and it is restrained (offset 0.5-1.5%, halftone 25% of area or less).
8. Type is the product's pairing, bold for the headline, sentence case, three sizes at most, on flat colour only.
9. Contrast: text 4.5:1 (headline 3:1 at large size), ink plate 3:1 against the ground.
10. Motion (if any) steps and cuts, ends on the registered still, and has a reduced-motion fallback.

## 7. Sources

Technique
- Bayer, B. E. (1973). An optimum method for two-level rendition of continuous-tone pictures. *IEEE International Conference on Communications*. Summarised in: Bouman, C. A., *Halftoning* (Purdue ECE 637 notes), https://engineering.purdue.edu/~bouman/ece637/notes/pdf/Halftoning.pdf, and https://en.wikipedia.org/wiki/Ordered_dithering
- Screen angles (cyan 15, magenta 75, black 45, yellow 0) and moiré: DuPont Easybrite manual, *AM screens*, https://easybritecloud.dupont.com/manual/en/webhelp/DITA/RIP/Intro/AM%20screens.html; Adobe Community, https://community.adobe.com/t5/photoshop-ecosystem-discussions/degree-settings-in-color-halftone-dialogue-box/m-p/10124487
- Screen rulings (newspaper about 85 lpi, magazine about 133 lpi): https://en.wikipedia.org/wiki/Lines_per_inch
- Riso Kagaku and the RISOGRAPH 007 (1986): https://en.wikipedia.org/wiki/Riso_Kagaku_Corporation; Denison University, *About the RISO printer*, https://blogs.denison.edu/riso/about-the-riso-printer/

Art, protest and design
- MoMA, Andy Warhol, *Gold Marilyn Monroe* (1962): https://www.moma.org/collection/works/79737
- Tate, Andy Warhol, *Marilyn Diptych* (1962), T03093: https://www.tate.org.uk/art/artworks/warhol-marilyn-diptych-t03093 and https://en.wikipedia.org/wiki/Marilyn_Diptych
- Jim Fitzpatrick's *Che* (1968): Photo Museum Ireland timeline, https://timeline.photomuseumireland.ie/?p=6307; *History Ireland*, "Che Guevara, Jim Fitzpatrick and the making of an icon", https://www.originalsite.historyireland.com/?p=10695
- Atelier Populaire (1968): MACBA, https://www.macba.cat/en/node/73384; V&A, https://collections.vam.ac.uk/item/O120966; *Print* magazine, "Rock Versus Paper", https://www.printmag.com/editors-picks/rock-versus-paper/
- OSPAAAL: V&A, "Solidarity and design: an introduction to OSPAAAL", https://www.vam.ac.uk/articles/solidarity-and-design-an-introduction-to-ospaaal; SFU Teck Gallery, https://www.sfu.ca/galleries/teck-gallery/past1/cuban-art-posters.html
- Frank Kozik: https://en.wikipedia.org/wiki/Frank_Kozik
- Shepard Fairey, *Barack Obama* (2008), National Portrait Gallery, NPG.2008.52: https://npg.si.edu/blog/npg-acquires-shepard-fairey%E2%80%99s-portrait-barack-obama; *Smithsonian Magazine*, https://www.smithsonianmag.com/smithsonian-institution/updated-iconic-obama-portrait-at-national-portrait-gallery-34484462/; NPR *Fresh Air*, "Mannie Garcia: the photo that sparked Hope", https://freshair.com/segments/mannie-garcia-photo-sparked-hope; colours and dispute: https://en.wikipedia.org/wiki/Barack_Obama_%22Hope%22_poster
- Spotify identity by Collins (2015): *Design Week*, https://www.designweek.co.uk/spotify-undergoes-colourful-brand-refresh/; *Transform*, https://www.transformmagazine.net/articles/2015/spotify-gets-visceral/; AIGA Eye on Design, https://eyeondesign.aiga.org/inside-the-world-of-a-spotify-brand-designer/

Evidence
- Mooney, C. M. (1957). Age in the development of closure ability in children. *Canadian Journal of Psychology*, 11, 219-226 (volume and pages from secondary citations; not checked against the journal). Overview: https://en.wikipedia.org/wiki/Mooney_Face_Test
- Canas-Bajo, T., & Whitney, D. (2020). Stimulus-specific individual differences in holistic perception of Mooney faces. *Frontiers in Psychology*, 11, 585921. https://doi.org/10.3389/fpsyg.2020.585921
- Cerf, M., Harel, J., Einhäuser, W., & Koch, C. (2008). Predicting human gaze using low-level saliency combined with face detection. *Advances in Neural Information Processing Systems 20*. https://proceedings.neurips.cc/paper/2007/hash/708f3cf8100d5e71834b1db77dfa15d6-Abstract.html
- Reber, R., Schwarz, N., & Winkielman, P. (2004). Processing fluency and aesthetic pleasure. *Personality and Social Psychology Review*, 8(4), 364-382.
- Tuch, A. N., et al. (2012). The role of visual complexity and prototypicality regarding first impression of websites. *International Journal of Human-Computer Studies*, 70(11).
- Lindgaard, G., et al. (2006). Attention web designers: You have 50 milliseconds to make a good first impression! *Behaviour & Information Technology*, 25.
- Hekkert, P., Snelders, D., & van Wieringen, P. C. W. (2003). 'Most advanced, yet acceptable'. *British Journal of Psychology*, 94.
- Romaniuk, J. (2018). *Building Distinctive Brand Assets*. Oxford University Press.

Accessibility
- W3C, WCAG 2.2 Understanding SC 1.4.3 Contrast (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- W3C, WCAG 2.2 Understanding SC 1.4.11 Non-text Contrast: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- W3C, WCAG 2.2 Understanding SC 2.3.1 Three Flashes or Below Threshold: https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html

Typefaces (Google Fonts listings)
- Anton, Vernon Adams: https://fonts.google.com/specimen/Anton/about
- Archivo, Héctor Gatti and Omnibus-Type: https://fonts.google.com/specimen/Archivo/about and https://en.wikipedia.org/wiki/Archivo
- Big Shoulders Display, Patric King, for the City of Chicago: https://fonts.google.com/specimen/Big+Shoulders+Display/about; City of Chicago Design System, https://chicago.gov/city/en/depts/dti/supp_info/CDS.html
- Barlow, Jeremy Tribby: https://fonts.google.com/specimen/Barlow/about

Rules of thumb (ours, not from a source): percentile cut points, ink share 20-35%, 15 L* minimum step, registration offset 0.5-1.5%, halftone cell 1.5-2.5%, crop and eye-line percentages, motion timings.
