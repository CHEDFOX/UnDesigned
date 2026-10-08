# Text on photos and video: research dossier

This dossier covers what happens when the background is a photo or a video and the words sit on top of it: where to put the headline, brand and call to action, how to keep them readable, and what each overlay treatment costs. It extends the layout dossier ([`research.md`](research.md)) and sits beside `foundations/research/visual-preference.json`. The data version is [`media.json`](media.json); the measuring tool is [`templates/layouts/overlay.mjs`](../../templates/layouts/overlay.mjs); the templates are the entries in `templates/layouts/layouts.json` that have a `media` object.

How to read it:
- Each finding names its source (author, year, venue). The full list is in section 10.
- **Strong** means a peer-reviewed result that has held up. **Moderate** means one good study, or practitioner research with a clear method. **Emerging** means new or industry-reported. **Contested** means the evidence is weak, mixed or missing.
- Anything that is a convention rather than a finding is marked **rule of thumb**.
- Where we could not verify a source, we say so and do not lean on it.

## 1. Definition

Text on media is any piece where a photo or a video fills the frame (or most of it) and the words share that space instead of sitting on flat ground. Posters with a full-bleed photo, social posts, stories and reels, web heroes with background video, billboards and thumbnails all do this.

It is harder than text on flat colour for three reasons:

| Problem | Why it matters |
|---|---|
| The ground is not one colour | Contrast changes from letter to letter, so one eyedropper sample says little. |
| The photo has its own focal point | A face or a bright object competes with the headline for the first look. |
| Video moves and changes | Contrast changes from frame to frame, and motion pulls the eye away from the words. |

A **treatment** is anything added to the image to make text readable: a band, a plate, a gradient scrim, a tint, a blur, a duotone, a halftone fade or a shadow. The best treatment is often none: a photo chosen or cropped so the words land on a calm area.

## 2. What the eye does with a photo

### 2.1 Faces first

| Finding | Source | What it means |
|---|---|---|
| In free viewing of photos with people, viewers fixated a face with over 80% probability within the first two fixations. A saliency model plus a face detector predicted fixations clearly better than low-level saliency alone. | Cerf, Harel, Einhäuser & Koch (2007, published 2008), *Advances in Neural Information Processing Systems 20* (NIPS 2007) | If there is a face, it wins the first look. Don't fight it: put the headline where the eye goes next. |
| Saccades towards faces can start about 100 ms after an image appears, faster than towards other object categories. | Crouzet, Kirchner & Thorpe (2010), *Journal of Vision* 10(4):16 | The face pull is fast and largely automatic. Text over a face is both hard to read and a waste of the face. |

**Strong.** Rule: never put text, logos or a call to action over a face.

### 2.2 People look where the model looks

| Finding | Source |
|---|---|
| In print ads, viewers looked longer at the product when the model looked at the product rather than at the viewer. | Hutton & Nolte (2011), *Applied Cognitive Psychology* 25(6), 887–892. We could not open the full text; the summary comes from later papers that cite it. |
| In web banner ads, a face with averted gaze (looking at the text and product) drew more attention to the banner, its text and its product, and improved memory for the brand and message. Direct gaze held attention on the face itself. | Sajjacholapunt & Ball (2014), *Frontiers in Psychology* 5:166 |
| In print ads, a face looking at the product beat no face and direct gaze on attention, memory, ad and brand evaluation and purchase intention. 67% of 118 advertising professionals had predicted the opposite. | Adil, Lacoste-Badie & Droulers (2018), *Journal of Advertising Research* 58(4), 443–455 |

**Moderate** (three studies, consistent direction, mostly lab or student samples). Rule: point the gaze at the headline or the product and put them on that side. Use direct eye contact only when the face is itself the message.

### 2.3 Saliency: what stands out gets looked at

Bottom-up attention follows local contrast in colour, intensity and orientation, combined into one saliency map (Itti, Koch & Niebur, 1998, *IEEE Transactions on Pattern Analysis and Machine Intelligence* 20(11); see also `pop-out` in `layout.json`). For designs specifically, Bylinskii et al. (2017, *UIST '17*) trained networks on human importance data and found text and faces rated important; their predictions helped retarget and thumbnail designs. O'Donovan, Agarwala & Hertzmann (2014, *IEEE TVCG* 20(8)) built layouts by optimising predicted importance and alignment and rated about as well as novice designers. **Strong** for saliency in general; **moderate** for the design tools.

What we take:
- Let the subject keep its salient area. Put the words in a low-saliency area next to it, so the order is subject, headline, brand.
- Pictures capture attention at any size (`picture-captures` in `layout.json`, Pieters & Wedel, 2004). The photo will get its look; the text needs its own clear space to get the next one.
- Real people and products are looked at; feel-good stock filler is skipped (NN/g, "Not all images are the same", Nielsen 2010; practitioner eye-tracking, **moderate**). Use a real photo of the product's world.

### 2.4 Clutter

Rosenholtz, Li & Nakano (2007, *Journal of Vision* 7(2)) measured visual clutter from the image itself in three ways: feature congestion, subband entropy and edge density. All three predicted search times reasonably well. **Moderate.**

- Measure the area behind the text instead of judging it by eye. `overlay.mjs` gives a busyness score from 0 to 1, built from edge density and fine texture on a coarse grid (a cheap proxy, not the published model).
- **Rule of thumb:** busyness up to 0.2 is calm; up to 0.35 is tolerable only with high contrast (2.6).

### 2.5 Depth of field

Kosara, Miksch & Hauser (2001, *IEEE InfoVis*; 2002, *IEEE Computer Graphics and Applications* 22(1)) blurred the less relevant parts of information displays and kept the relevant ones sharp ("semantic depth of field"). A user study found it guided attention quickly and was perceived pre-attentively (Schrammel et al., 2003, *INTERACT 2003*). **Moderate**, and tested on displays, not photos: we apply it by analogy with photographic depth of field. We could not verify an often-cited paper on blur in photographs by Enns and MacDonald, so we do not use it.

- A shallow depth of field at the shoot gives a soft, receding area for the words and keeps the sharp subject as the focal point.
- Digital blur added later is a treatment with style limits (section 5).

### 2.6 Texture behind letters

| Finding | Source | What it means |
|---|---|---|
| Background texture slowed reading only when text contrast was low; the texture's spatial frequency mattered. | Scharff, Hill & Ahumada (2000), *Optics Express* 6(4), 81–91 | High contrast buys tolerance for some texture. Over a busy area, aim well above the minimum (about 7:1, **rule of thumb**). |
| Higher-contrast text-background combinations were rated easier to read; preferred colours raised aesthetic ratings and purchase intention but not retention. | Hall & Hanna (2004), *Behaviour & Information Technology* 23(3), 183–195 | Choose ink or paper text by measured contrast first. |
| Recognition is limited by spacing: contours too close to a letter jumble its features (crowding). Critical spacing follows Bouma's law; the effect is weaker between dissimilar objects. | Pelli & Tillman (2008), *Nature Neuroscience* 11(10), 1129–1135 | Keep strong edges (horizon lines, branches, railings, other type) out of the text block and its margin. |

**Moderate** (Scharff; Hall & Hanna) to **strong** (crowding).

### 2.7 Words and picture together

McQuarrie & Mick (1999, *Journal of Consumer Research* 26(1), 37–54) found that visual figures in ads (rhyme, antithesis, metaphor, pun) drew more elaboration and better attitudes without being harder to understand, but visual metaphors and puns lost their effect for people without the cultural knowledge to read them. **Moderate.**

- The photo and the headline should complete each other (playbook W5). A headline that describes the photo wastes both.
- Test visual metaphors with the real audience.

## 3. Video

### 3.1 Motion pulls the eye

| Finding | Source |
|---|---|
| The onset of motion captured attention even when it was irrelevant; steady motion by itself did not. | Abrams & Christ (2003), *Psychological Science* 14(5), 427–432 |
| Looming (growing) objects captured attention; simulated receding motion did not. Abrams and Christ later argued that receding motion onset also captures. | Franconeri & Simons (2003), *Perception & Psychophysics* 65(7), 999–1010 |
| In free viewing of video, motion was the strongest predictor of where people looked, and moments when all viewers looked at the same spot were predicted by motion. | Mital, Smith, Hill & Henderson (2011; online 2010), *Cognitive Computation* 3(1), 5–24 |

**Strong** for capture by motion onset; **moderate** for gaze following motion in video.

What we take:
- Moving footage competes with the words over it, most of all at each new movement, zoom or push-in.
- Keep text still. Only one thing moves at a time: the footage or the text arriving (style `motion.json`), never text sliding over moving footage.
- Put the words in a still part of the frame, next to the action, not across it.

### 3.2 People read on-screen text if it stays long enough

| Finding | Source |
|---|---|
| Viewers read subtitles largely automatically, even when they understood the soundtrack. | d'Ydewalle, Praet, Verfaillie & Van Rensbergen (1991), *Communication Research* 18(5), 650–666 (summary from later reviews) |
| 74 viewers kept up with subtitles at 12, 16 and 20 characters per second while still following the images; slow subtitles caused rereading and less enjoyment. | Szarkowska & Gerber-Morón (2018), *PLOS ONE* 13(6): e0199331 |
| Broadcast practice: about 160–180 words per minute, about 0.33–0.375 s per word. | BBC Subtitle Guidelines (practice; we read the figures in secondary summaries, so check the current version) |

**Moderate.** Subtitle speeds assume viewers know where the words will be. Text in an ad or a story does not get that, so we add time to find it.

- **Rule of thumb:** hold each text card for at least max(1.5 s, 0.375 s × words + 0.5 s). A six-word headline: 2.75 s.

### 3.3 Cuts

Smith & Henderson (2008, *Journal of Eye Movement Research* 2(2)) found viewers missed about a quarter of cuts between two views of the same scene, and about a third when the cut coincided with a sudden onset of motion, mostly because attention was on the story. **Moderate.**

- Change or remove text on a cut, where the change disturbs least, not mid-shot.
- Hold the same text across continuity cuts if people are still reading it.
- Check contrast on every frame the text sits over. The worst frame decides (`overlay.mjs` → `analyseFrames`).

### 3.4 Sound off

A Digiday article ("85 percent of Facebook video is watched without sound", commonly dated 2016; byline and date not confirmed) quoted publishers' own Facebook figures: LittleThings and Mic said 85% of views were silent, PopSugar said 50–80%. No method was given. Facebook said in February 2016 that captions raised view time by an average of 12% in some internal tests (company-reported, as covered by Business Insider and AdExchanger). **Emerging.**

- Design every video piece to work with the sound off: the one message on screen as text, speech captioned.
- Don't quote "85%" as a fact about all video (section 8).
- The first frame and the thumbnail or poster frame must work as a still, since autoplay is usually muted and some people never press play.

## 4. Contrast over images

### 4.1 The standard

WCAG 2.x asks for 4.5:1 for normal text and 3:1 for large text (at least 18 pt, or 14 pt bold) under success criterion 1.4.3; 7:1 under 1.4.6 (AAA); and 3:1 for the visual boundaries of interface components such as a CTA button under 1.4.11. Logos and brand names are exempt. Text over images, gradients and semi-transparent layers must still meet the ratio, but WCAG gives no method for measuring it; WebAIM recommends testing the area of lowest contrast. We could not open the W3C pages during this research and took the wording from WebAIM's summary; the thresholds themselves are long-standing.

APCA (Accessible Perceptual Contrast Algorithm) is the candidate contrast method for WCAG 3, which is still a draft. Its author's guidance gives Lc 75 as the minimum for body text and Lc 90 as preferred. **Emerging.** Use WCAG 2.x ratios as the requirement and APCA as a second opinion.

### 4.2 How we measure over a photo

**Rule of thumb**, built on the standard and on 2.6:

1. Take the text box (every line of the block) and grow it by half the cap height on each side.
2. Convert each pixel to WCAG relative luminance.
3. Worst case for dark text: the 10th percentile luminance. For light text: the 90th. (Use the 5th and 95th for small text or very detailed photos.) Never the mean, never one eyedropper sample.
4. With a treatment, blend first (per channel, in sRGB, as browsers and SVG composite), then measure.
5. For video, repeat for every frame the text is shown over; the worst frame decides.
6. Re-measure at every size and crop.

`overlay.mjs` does all of this: `analyseRegion` measures, `recommendTreatment` picks the least intrusive allowed treatment and solves the scrim or tint opacity, `findCalmRegion` ranks candidate areas, `analyseFrames` handles video.

## 5. Treatments and what they cost

From least to most intrusive. Numbers are **rules of thumb**.

| Id | What | Cost | Numbers |
|---|---|---|---|
| `calm-region` | No treatment; text on a flat, readable area of the photo | Needs the right photo or crop; can break at other sizes or frames | busyness ≤ 0.2 (≤ 0.35 at 7:1) |
| `blur` | Soften the area behind the text (best done optically at the shoot) | Removes texture, not tone; a digital patch can look like a mistake | radius 1–3% of the short side; flagged as an estimate |
| `scrim-gradient` | Palette colour at the needed opacity under the text, fading to clear | Darkens part of the photo; edge shows if short; banned in most styles | opacity solved, typically 0.3–0.85; length ≥ 1.5 × text block; over 0.85 use a band |
| `tint` | Palette colour at partial opacity over the whole photo | Whole photo goes flat; faces lose life | 0.2–0.6 |
| `halftone-fade` | Solid zone under the text whose edge dissolves into the photo through dots | Adds texture; text must sit on the solid part | fade 5–10% of the short side; dot cell from the style |
| `plate` | Flat shape just behind the text block | Reads as a box or label | padding 0.6–1 × cap height; at most 2 per piece |
| `solid-band` | Flat band across one edge holds all the words | Covers part of the photo; a top band on the web can look like an ad | 25–40% of the frame; padding 4–8% of the short side |
| `duotone` | Photo mapped to two or a few palette colours | Changes the photo's character; busy areas stay busy | 2–5 levels; `approaches/posterize/posterize.mjs` |
| `text-shadow` | Shadow or outline on the letters | Doesn't change measured background contrast; dated; banned in most styles | blur 0; last resort, headline only |

### 5.1 Which styles allow which treatment

Read from each style's `approach.json` → `layers` and `art.json` rules. "Ask" means the style says nothing; check with the user.

| Treatment | Allowed | Avoid | Notes |
|---|---|---|---|
| `calm-region` | humanist-minimal, bauhaus, commercial-modernism, mid-century-modernism, scrapbook, neon-surf, doodles | posterize, desi-maximalism | Posterize never sets text over the image; Desi Maximalism uses a framed cartouche. Commercial Modernism plans its bands (top 10–18%, bottom 18–28%). |
| `solid-band` | all nine | none | Bauhaus: a colour block splitting the sheet about 1:2. Posterize: image block and text block. |
| `plate` | humanist-minimal, desi-maximalism, doodles, scrapbook, neon-surf | bauhaus, commercial-modernism, mid-century-modernism, posterize | Rounded plate, cartouche, paper clearing, taped paper strip, die-cut sticker. |
| `scrim-gradient` | commercial-modernism | all others | Only as a two-stop airbrush fade into the combination's ground or Black. Neon Surf allows one fade, on the sun or sky only. |
| `tint` | none | all nine | Every style bans transparency, tints or colour filters over faces. |
| `blur` | humanist-minimal, desi-maximalism, scrapbook, doodles, neon-surf | bauhaus, commercial-modernism, posterize, mid-century-modernism | As optical depth of field only. |
| `duotone` | bauhaus, commercial-modernism, mid-century-modernism, posterize | humanist-minimal, desi-maximalism, neon-surf | Scrapbook and Doodles: ask. |
| `halftone-fade` | humanist-minimal, bauhaus, mid-century-modernism, posterize, neon-surf, scrapbook | desi-maximalism, doodles | Humanist Minimal: halftone is its only shading. Neon Surf: spray stipple. |
| `text-shadow` | neon-surf, desi-maximalism | all others | Neon Surf's hard ink block shadow; Desi Maximalism's flat offset drop line. |

In short: in most of our styles the honest choices are a calm region, a solid band, a plate or a halftone fade. That is a feature: they keep colour flat and the photo honest.

## 6. Placement, in order

1. **Faces.** No text, logo or CTA over a face, eyes or hands doing something (2.1).
2. **Gaze.** Words on the side the person looks towards (2.2).
3. **Subject.** Subject keeps its salient area; text next to it (2.3).
4. **Calm.** The calmest nearby area that passes contrast on its worst-case pixels; if none, the least intrusive allowed treatment (2.4, 2.6, section 5).
5. **Edges.** No strong edge through the text block or its margin; no horizon through a line of type (2.6).
6. **Safe areas.** Text, logos and CTAs inside the format's safe area (`layout.json` → `safeAreas`). The photo may bleed into platform overlays; the words may not. Recheck after every crop.
7. **Logo.** Brand beside the headline on the same calm or treated area (playbook O4). Exempt from WCAG, but aim for 3:1 (**rule of thumb**).
8. **CTA.** On a flat area or the band, never over the subject; text 4.5:1, button edge or fill 3:1 (WCAG 1.4.11).

Plan for this at the shoot: leave empty space on the side the subject looks towards, use a shallow depth of field, and shoot a few crops for the formats you need.

## 7. Templates

The media templates in `templates/layouts/layouts.json` each carry a `media` object (`kind`, `fill`, `treatment`, `text`, `textZone`, `subject`, `gaze`, `overlay`, `avoid`):

| Id | Format | Treatment | Notes |
|---|---|---|---|
| `poster-photo-calm-region` | poster | calm-region | Empty top third; subject low, looking up at the headline |
| `post-4x5-photo-scrim` | instagram-post 4:5 | scrim-gradient | Alternatives for most styles: solid-band, halftone-fade |
| `square-photo-plate` | instagram-post 1:1 | plate | One plate, bottom left, person looking at it |
| `story-video-overlay` | story 9:16 | plate | Everything in the central band; static text |
| `hero-video-split-scrim` | landing-hero 16:9 | scrim-gradient | Words on the reading-start side, motion on the other |
| `thumbnail-photo-gaze` | thumbnail 16:9 | calm-region | Big face looking at a short headline; clear of the length stamp |
| `billboard-photo-band` | billboard | solid-band | Seven words at most; works in every style |

## 8. Myths

| Myth | Reality | Use instead |
|---|---|---|
| People will read text wherever it sits over a video. | They do read on-screen text (d'Ydewalle et al., 1991), but motion onsets and moving subjects pull the eye away (Abrams & Christ, 2003; Mital et al., 2011), and contrast changes frame by frame. | Static text in a still zone, checked on the worst frame, held long enough. |
| A drop shadow or glow makes text readable on any image. | A shadow only darkens letter edges; WCAG gives no method that credits it; edges near letters still crowd them (Pelli & Tillman, 2008). | Calm region, band, plate or (where allowed) scrim. Shadows only where the style already has a hard one. |
| 85% of video is watched without sound. | A 2016 Digiday article quoting individual publishers' Facebook figures (LittleThings, Mic; PopSugar said 50–80%), with no method. Not a measure of all video, all platforms or today. | Design for sound off because many people watch that way. Caption everything. |
| Check contrast against the photo's average colour. | The mean hides the darkest and lightest patches behind the letters. | Worst case: 10th or 90th percentile of the pixels behind the text. |
| A semi-transparent dark box always fixes it. | The opacity needed depends on the brightest pixels; fixed 30–50% boxes often fail over light areas (NN/g, "Text over images"). | Compute the opacity; above about 85%, use a solid band. |
| A model looking straight at you sells best. | Direct gaze holds attention on the face; gaze towards the product moves it to the product and text (2.2). | Point the gaze at the headline or product. |
| Subject on one thirds line, text on another. | The rule of thirds barely predicts liking (`layout.json` → `rule-of-thirds`). | Place by calm areas, gaze and the safe area. |

## 9. Scorecard for text on media

Score 0 (no), 1 (partly), 2 (yes). 16 or more out of 20 passes. Use it with the layout scorecard (`research.md` section 10) and the style's own.

1. No text, logo or CTA over a face, eyes or the product.
2. The person (if any) looks towards the headline or product, and the words are on that side.
3. The photo's subject stays clear and leads; the headline is next to it, not on it.
4. Worst-case contrast (10th/90th percentile) passes: 4.5:1 for body, 3:1 for large text and the CTA edge; about 7:1 if the area is not calm.
5. The area behind the text is calm (busyness ≤ 0.2), or a treatment makes it so.
6. The treatment is the least intrusive one the style allows, and it uses palette colours only.
7. No strong edge or horizon runs through the text block or its margin.
8. All text, logos and CTAs are inside the safe area, at every crop and size used.
9. Video only: text is still, sits in a still zone, passes on the worst frame, is held at least max(1.5 s, 0.375 s × words + 0.5 s) and changes on a cut. Still pieces: score 2 if the photo is real and specific (not filler stock).
10. It works with the sound off and as a still (first frame, thumbnail, poster frame); the photo and the headline add to each other.

## 10. Sources

- Abrams, R. A., & Christ, S. E. (2003). Motion onset captures attention. *Psychological Science*, 14(5), 427–432. https://doi.org/10.1111/1467-9280.01458
- Adil, S., Lacoste-Badie, S., & Droulers, O. (2018). Face presence and gaze direction in print advertisements: How they influence consumer responses—An eye-tracking study. *Journal of Advertising Research*, 58(4), 443–455. https://doi.org/10.2501/JAR-2018-004
- BBC. Subtitle Guidelines (practice document, revised regularly). Figures read in secondary summaries; check the current version.
- Bylinskii, Z., Kim, N. W., O'Donovan, P., Alsheikh, S., Madan, S., Pfister, H., Durand, F., Russell, B., & Hertzmann, A. (2017). Learning visual importance for graphic designs and data visualizations. *Proceedings of UIST '17*. https://doi.org/10.1145/3126594.3126653
- Cerf, M., Harel, J., Einhäuser, W., & Koch, C. (2008). Predicting human gaze using low-level saliency combined with face detection. *Advances in Neural Information Processing Systems 20* (NIPS 2007).
- Crouzet, S. M., Kirchner, H., & Thorpe, S. J. (2010). Fast saccades toward faces: Face detection in just 100 ms. *Journal of Vision*, 10(4):16, 1–17.
- d'Ydewalle, G., Praet, C., Verfaillie, K., & Van Rensbergen, J. (1991). Watching subtitled television: Automatic reading behavior. *Communication Research*, 18(5), 650–666. (Summary from later reviews.)
- Digiday. 85 percent of Facebook video is watched without sound. (Commonly dated 2016; byline and date not confirmed; figures reported by publishers.) https://digiday.com/media/silent-world-facebook-video/
- Facebook (February 2016). Announcement of automated captions for video ads, including the 12% view-time figure from internal tests, as reported by Business Insider and AdExchanger.
- Franconeri, S. L., & Simons, D. J. (2003). Moving and looming stimuli capture attention. *Perception & Psychophysics*, 65(7), 999–1010.
- Hall, R. H., & Hanna, P. (2004). The impact of web page text-background colour combinations on readability, retention, aesthetics and behavioural intention. *Behaviour & Information Technology*, 23(3), 183–195. https://doi.org/10.1080/01449290410001669932
- Hutton, S. B., & Nolte, S. (2011). The effect of gaze cues on attention to print advertisements. *Applied Cognitive Psychology*, 25(6), 887–892. https://doi.org/10.1002/acp.1763 (Full text not opened.)
- Itti, L., Koch, C., & Niebur, E. (1998). A model of saliency-based visual attention for rapid scene analysis. *IEEE Transactions on Pattern Analysis and Machine Intelligence*, 20(11), 1254–1259.
- Kosara, R., Miksch, S., & Hauser, H. (2001). Semantic depth of field. *Proceedings of IEEE InfoVis 2001*, 97–104. https://doi.org/10.1109/INFVIS.2001.963286
- Kosara, R., Miksch, S., & Hauser, H. (2002). Focus+context taken literally. *IEEE Computer Graphics and Applications*, 22(1), 22–29. https://doi.org/10.1109/38.974515
- McQuarrie, E. F., & Mick, D. G. (1999). Visual rhetoric in advertising: Text-interpretive, experimental, and reader-response analyses. *Journal of Consumer Research*, 26(1), 37–54. https://doi.org/10.1086/209549
- Mital, P. K., Smith, T. J., Hill, R. L., & Henderson, J. M. (2011). Clustering of gaze during dynamic scene viewing is predicted by motion. *Cognitive Computation*, 3(1), 5–24. (Online 2010.)
- Myndex. APCA introduction. https://github.com/Myndex/apca-introduction
- Nielsen, J. (2010). Photos as web content (now "Not all images are the same"). Nielsen Norman Group. https://www.nngroup.com/articles/photos-as-web-content/
- Nielsen Norman Group. Text over images. https://www.nngroup.com/articles/text-over-images/ (Read in excerpts.)
- O'Donovan, P., Agarwala, A., & Hertzmann, A. (2014). Learning layouts for single-page graphic designs. *IEEE Transactions on Visualization and Computer Graphics*, 20(8), 1200–1213.
- Pelli, D. G., & Tillman, K. A. (2008). The uncrowded window of object recognition. *Nature Neuroscience*, 11(10), 1129–1135. https://doi.org/10.1038/nn.2187
- Pieters, R., & Wedel, M. (2004). Attention capture and transfer in advertising. *Journal of Marketing*, 68(2), 36–50. (Finding `picture-captures` in `layout.json`.)
- Rosenholtz, R., Li, Y., & Nakano, L. (2007). Measuring visual clutter. *Journal of Vision*, 7(2), 1–22.
- Sajjacholapunt, P., & Ball, L. J. (2014). The influence of banner advertisements on attention and memory: Human faces with averted gaze can enhance advertising effectiveness. *Frontiers in Psychology*, 5:166. https://doi.org/10.3389/fpsyg.2014.00166
- Scharff, L. V., Hill, A. L., & Ahumada, A. J. (2000). Discriminability measures for predicting readability of text on textured backgrounds. *Optics Express*, 6(4), 81–91.
- Schrammel, J., Giller, V., Tscheligi, M., Kosara, R., Miksch, S., & Hauser, H. (2003). Experimental evaluation of semantic depth of field, a preattentive method for focus+context visualization. *Proceedings of INTERACT 2003*, 888–891.
- Smith, T. J., & Henderson, J. M. (2008). Edit blindness: The relationship between attention and global change blindness in dynamic scenes. *Journal of Eye Movement Research*, 2(2):6, 1–17. https://doi.org/10.16910/jemr.2.2.6
- Szarkowska, A., & Gerber-Morón, O. (2018). Viewers can keep up with fast subtitles: Evidence from eye movements. *PLOS ONE*, 13(6): e0199331. https://doi.org/10.1371/journal.pone.0199331
- W3C (2023). Web Content Accessibility Guidelines (WCAG) 2.2, success criteria 1.4.3, 1.4.6 and 1.4.11. W3C Recommendation. (Wording checked via WebAIM; w3.org could not be opened during research.)
- WebAIM. Contrast and color accessibility. https://webaim.org/articles/contrast/
