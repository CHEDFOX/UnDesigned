# Layout and templates: research dossier

This dossier covers where things go on the page and why, and why a product should reuse a small set of layouts. It sits beside `foundations/research/visual-preference.json` (what people like) and the messaging playbook (what we say). The data version is `layout.json`; the reusable layouts are in `templates/layouts/`.

How to read it:
- Each finding names its source (author, year, venue). The full list is in section 9.
- **Strong** means a peer-reviewed result that has held up. **Moderate** means one good study, or practitioner research with a clear method. **Contested** means the evidence is weak, mixed or missing.
- Anything that is a convention rather than a finding is marked **rule of thumb**.
- Where we could not verify a source, we say so and do not lean on it.

## 1. Definition

Layout is the order in which a viewer meets the parts of a piece: what they see first, what they read next, what they group together and what they skip. A good layout makes that order obvious without the viewer noticing.

It sits between two failure modes:

| Too loose | Clear layout | Too rigid |
|---|---|---|
| Elements float; no clear first thing; even spacing everywhere | One focal point, a visible reading order, related things grouped, space used on purpose | Every piece a filled grid; equal-weight boxes; nothing leads |

A **template** is a layout saved as data: the format, the composition, the slot for each element (headline, image, brand, call to action) and the margins. A template fixes the skeleton so each new piece only changes the idea, the image and the words.

## 2. How people look at a layout

### 2.1 The first glance decides the frame

| Finding | Source | What it means for layout |
|---|---|---|
| People rate the visual appeal of a web page consistently after 50 ms; ratings at 50 ms track ratings at 500 ms. | Lindgaard, Fernandes, Dudek & Brown (2006), *Behaviour & Information Technology* 25(2), 115–126 | The silhouette of the layout (where the mass is, where the space is, where the one bright thing is) does its work before any word is read. |
| Visual complexity and prototypicality both shape first impressions of websites, even at 17 ms. Complexity acts first; prototypicality catches up with longer viewing. Low complexity and high prototypicality were rated most appealing. | Tuch, Presslaber, Stöcklin, Opwis & Bargas-Avila (2012), *International Journal of Human-Computer Studies* 70(11), 794–811 | Fewer elements and a layout that looks like its category (a poster that looks like a poster, a hero that looks like a hero) win the first second. Novelty belongs in the idea, not in where the button is. |
| The preferred level of colourfulness and complexity differs by age, gender, education and country. | Reinecke & Gajos (2014), *CHI '14*, 11–20 | "Simple" is not one fixed number. Use our defaults, but expect some audiences (and styles such as Desi Maximalism) to want more. |

### 2.2 Viewers start in the middle

In free viewing of images, people's first fixations land near the centre of the frame, whatever the content. Tatler showed this central bias holds even when the start marker is moved and when image features are controlled for (Tatler, 2007, *Journal of Vision* 7(14):4).

- Use it: put the focal object or the headline where the eye lands first, at or near the optical centre of the live area.
- Limit: this is for pictures and posters seen whole. Text-heavy web pages are scanned differently (2.3).

### 2.3 How people scan text-heavy screens

| Pattern | What happens | Source | Strength |
|---|---|---|---|
| **F-pattern** | On pages with unformatted text, eyes read the first lines, then a shorter line lower down, then run down the left edge. | Nielsen Norman Group eye-tracking, first reported 2006; revisited by Pernice (2017, NN/g), who found it on desktop and mobile and called it a sign of poorly formatted content, not a goal | Moderate (large practitioner eye-tracking studies, not peer-reviewed) |
| **Layer-cake** | Eyes jump from heading to heading, skipping body text, leaving horizontal bands. | Pernice (2019, NN/g), *Text scanning patterns: eyetracking evidence* | Moderate |
| **Spotted** | Eyes skip chunks and hunt for something specific: a number, a link, a word with a distinctive shape. | Same | Moderate |
| **Left-side lean** | On desktop web pages, about 80% of viewing time fell on the left half of the page (2010: 69%). | NN/g, *Horizontal attention leans left* (Nielsen 2010, updated) | Moderate |
| **Flipped F** | Readers of right-to-left languages such as Arabic scan in a mirrored F. | NN/g F-pattern article (updated) | Moderate |

What we take:
- Give long pages strong subheads so people can layer-cake instead of F-scan (this matches the playbook's subheads rule).
- Put the most important words at the start of lines and headings; on left-to-right pages, keep key content and navigation on the left.
- None of this applies to a poster with eight words. Posters are seen as a whole, then read.

### 2.4 Z-pattern and Gutenberg diagram

Design blogs often say viewers' eyes move in a Z across a poster or landing page, or diagonally from top left to a "terminal area" at bottom right (the Gutenberg diagram, usually credited to newspaper designer Edmund Arnold). We could not find peer-reviewed eye-tracking that tests either model, and we could not verify the diagram's origin. **Contested.** Treat them as rules of thumb for sparse layouts in left-to-right languages, not as evidence. The one useful part, "end on the call to action", is better justified by plain reading order.

## 3. Hierarchy and grouping

### 3.1 One thing must win

A target that differs from its neighbours on one basic feature (for example colour) is found almost instantly, however many distractors there are; targets defined by combinations of features need slow, one-by-one search (Treisman & Gelade, 1980, *Cognitive Psychology* 12, 97–136). Bottom-up salience depends on contrast with the surroundings, not on the feature alone (Itti & Koch, 2001, *Nature Reviews Neuroscience* 2, 194–203).

- One focal point per piece, made different from everything else on one or two clear dimensions (size, colour, or being the only image).
- If two things are equally big and bright, neither leads.
- Size as a "pop-out" feature is less certain in the lab than colour, so pair size contrast with a second difference (accent colour or isolation in space). **Rule of thumb:** headline at least about twice the body size; three type sizes per piece (already in `foundations/typography`).

### 3.2 Things that are close, alike or boxed together read as one

The Gestalt grouping principles (proximity, similarity, common fate, good continuation, closure, symmetry) and newer ones such as **common region** and connectedness are reviewed in Wagemans et al. (2012), *Psychological Bulletin* 138(6), 1172–1217. Common region was introduced by Palmer (1992), *Cognitive Psychology* 24, 433–447: elements inside one bounded area are grouped.

- Space between groups must be clearly larger than space inside a group. **Rule of thumb:** at least 2:1.
- Use a band, panel or shape (common region) to tie a call to action to the brand, or a caption to its picture.
- Align elements to a few shared edges; good continuation makes aligned items read as one column.

### 3.3 Grids are practice, not evidence

Josef Müller-Brockmann's *Grid Systems in Graphic Design* (Niggli, 1981) is the standard manual for modular grids (8 to 32 fields). It is a craft method, not an experiment. We use grids because they make alignment (3.2) and consistency (section 6) easy, not because a study showed a 12-column grid is better than a 6-column one. All column counts in `layout.json` are **rules of thumb**.

## 4. Text blocks

### 4.1 Line length

| Study | Finding |
|---|---|
| Dyson & Haselgrove (2001), *International Journal of Human-Computer Studies* 54, 585–612 | Line length affects reading from screen; very short and very long lines disrupt reading; summaries cite about 55 characters per line as a good balance of speed and comprehension. |
| Ling & van Schaik (2006), *International Journal of Human-Computer Studies* 64(5), 395–404 | Longer lines helped visual scanning; shorter lines were rated better. Font type made little difference. |
| Shaikh & Chaparro (2005), *Proceedings of the HFES 49th Annual Meeting* | 95 characters per line was read fastest; no effect on comprehension; people liked or disliked the extremes. |

**Contested** in detail, consistent in direction: long lines can be read fast but are disliked; people prefer moderate lengths. We keep the typographic convention of 45–75 characters (Bringhurst, *The Elements of Typographic Style*), about 60 as the target, as a **rule of thumb**, and set text-box widths in templates to fit it at body size.

### 4.2 White space around text

Chaparro, Baker, Shaikh, Hull & Brady (2004, *Usability News* 6(2), Wichita State SURL) compared four layouts. Text with margins was read more slowly but understood better, and people were more satisfied with it; line spacing changed preference, not performance. Earlier SURL work (Bernard, Chaparro & Thomasson, 2000) found no change in search time with more white space, but people preferred enough space to separate units of information. **Moderate.** Popular claims such as "white space improves comprehension by 20%" have no traceable source; we do not use them.

- Give body text real margins and keep groups apart with space.
- The 40% empty-ground minimum belongs to the Humanist Minimal style (`approaches/humanist-minimal/art.json` → `composition.emptyGroundMinPct`), not to every layout. It follows from low complexity (2.1) but other styles set their own amount.

## 5. Image and words

| Finding | Source | What it means |
|---|---|---|
| In 1,363 print ads seen by 3,600+ consumers, the picture captured attention whatever its size; text drew more attention the more space it had; enlarging the picture or the brand did not raise attention to the ad as a whole. | Pieters & Wedel (2004), *Journal of Marketing* 68(2), 36–50 | The picture earns the first look at any size, so do not oversize it at the cost of the headline. Give text enough room to be read. Later studies did not always replicate the size interactions, so treat the details as moderate. |
| Fixations on the brand element drive later brand memory; fixations on picture and text help through the brand. | Wedel & Pieters (2000), *Marketing Science* 19(4), 297–312 | The brand must sit where the eye already goes: beside the headline (playbook O4), not lost in a corner. |
| Ads with pictures were remembered better than words alone, especially after a delay. | Childers & Houston (1984), *Journal of Consumer Research* 11(2), 643–654 | Every format that can carry an image should, and the image should carry the idea. |
| Ads that were both original and familiar drew most attention to the brand and improved brand memory. | Pieters, Warlop & Wedel (2002), *Management Science* 48(6), 765–781 | Keep the frame familiar (template, brand position) and make the idea new. This is the template argument in one line (section 6). |

### 5.1 Banner blindness

In Benway and Lane's 1998 study at Rice University, people looking for information found it far less often when it sat in a bright banner than in a plain menu; things styled like ads, and banners at the top away from other links, were skipped. Benway named it "banner blindness". NN/g has reported the same pattern in its own eye-tracking studies, and a 2018 eye-tracking short paper at an ACM conference ("The invisible gorilla revisited") found that 75% of people fixated a moving banner but only 33% recalled anything from it. **Moderate to strong.** We could not verify the venue of the 1998 paper, so we cite it as a Rice University study.

- In a web hero or email, the main message must not look like an ad: no boxed, flashing promo band at the very top.
- For display banners that are ads, assume a glance at best: one headline, one brand, one button.

### 5.2 Reading direction and scripts

- Scanning mirrors with reading direction (flipped F for Arabic, 2.3). For right-to-left products, mirror every template horizontally: brand and headline start at the right edge, the image leads from the right. `render.mjs` has a `mirror` option.
- W3C keeps layout requirements for Arabic and Persian (`alreq`) and for Devanagari and other Indic scripts (`ilreq`, now the Devanagari Script Resources note). We could not open them during this research, so we make no claim about their contents. **Rule of thumb** from type practice: Indic scripts carry vowel signs above and below the line and need more line height than Latin; allow about 1.2 to 1.3 times the Latin leading in templates, and test with real copy.

## 6. Mobile and screens

- Hoober (2013, *UXmatters*, "How do users really hold mobile devices?") recorded 1,333 observations of people using phones in public and found many grips, not only one thumb. His later series (2017, *UXmatters*, "Design for fingers, touch, and people") argues that people look at and touch the centre of the screen most and are less accurate at the edges. **Moderate, observational.** The popular "thumb zone" heat-map is a simplification.
- For our formats: put headline and call to action in the central band of a story or post, never in the corners.

### 6.1 Safe areas on social platforms

Platform interfaces cover parts of stories, reels and thumbnails. Official numbers move and we could not open Meta's or TikTok's own help pages, so all figures below are **rules of thumb** collected from several agency and tool guides in 2026, rounded to the cautious side:

| Format | Keep text and logos out of | Notes |
|---|---|---|
| Story / Reel 9:16 | top 14%, bottom 20% (stories) to 35% (reels and TikTok), 6% each side | Profile name sits at the top; reply bar, caption and buttons at the bottom; TikTok also has an action column on the right. Our story template uses the reel-safe bottom (35%) so one file works everywhere. |
| Instagram 4:5 post | the outer ~6% of each side | Since 2025 the profile grid crops posts to 3:4, trimming the sides of a 4:5 post (1080 x 1350 shows as about 1012 x 1350). |
| YouTube thumbnail 16:9 | bottom-right corner (about 20% wide, 15% high) | The video length stamp sits there. |

Always check with the platform's own preview before publishing.

## 7. Composition rules people quote

| Claim | Evidence | Verdict |
|---|---|---|
| Put the subject on a third line (rule of thirds). | Amirshahi, Hayn-Leichsenring, Denzler & Redies (2014, *Art & Perception* 2, 163–182): aesthetic ratings of photographs correlated only weakly with how well they follow the rule; highly rated photos and paintings followed it no more than photos that break it. | Contested. A useful way to avoid a dead-centre default, not a law. |
| Use the golden ratio. | See `foundations/research/visual-preference.json` → myths → `golden-ratio`. | Myth. |
| Eyes follow a Z (or the Gutenberg diagram). | Not found in peer-reviewed eye-tracking (2.4). | Contested. |
| Users don't scroll / everything above the fold. | NN/g's own work shows people do scroll, but attention drops below the fold. We have not re-verified the figures here, so we don't cite numbers. | Use instead: put the one message first; let the rest follow. |

## 8. Why templates

### 8.1 Repetition builds liking and recognition

- **Mere exposure.** Repeated exposure to a stimulus increases liking (Zajonc, 1968, *Journal of Personality and Social Psychology Monograph Supplement* 9(2, Pt 2), 1–27). A meta-analysis of studies from 1968–1987 confirmed it (Bornstein, 1989, *Psychological Bulletin* 106, 265–289). **Strong.**
- **But it bends.** A newer meta-analysis of 268 curves from 81 articles found an inverted U: liking rises with exposure, then levels off or falls (Montoya, Horton, Vevea, Citkowicz & Lauber, 2017, *Psychological Bulletin* 143(5), 459–498). **Strong.**
- **Fluency.** Familiar layouts are easier to process, and ease feels good (Reber, Schwarz & Winkielman, 2004; finding `fluency` in `visual-preference.json`). Prototypical layouts win first impressions (Tuch et al., 2012).
- **Distinctive brand assets.** Romaniuk (2018, *Building Distinctive Brand Assets*, Oxford University Press) argues that brands need consistent, recognisable elements (colours, shapes, characters, layouts, taglines) used the same way over time so people link them to the brand. **Practitioner evidence** from the Ehrenberg-Bass Institute, not a controlled trial.

### 8.2 Sameness wears out

- Repeating the same commercials lowered viewers' evaluations of the ads and the products, and attention-raising tricks did not stop it (Calder & Sternthal, 1980, *Journal of Marketing Research* 17(2), 173–186). **Moderate.**
- Pechmann & Stewart (1990, Marketing Science Institute report 90-106) reviewed wear-in and wear-out and argued that many apparently conflicting results fit together once you separate what is measured. (Often cited as 1988; we could only verify the 1990 MSI report.)
- Original and familiar together beat either alone (Pieters, Warlop & Wedel, 2002).

### 8.3 What templates should fix and what they should leave free

| Fix (template) | Free (each piece) |
|---|---|
| Format, margins, grid, safe areas | The idea and the image |
| Where brand and call to action sit | The headline wording |
| Type sizes and hierarchy | Which Wada combination (within the product's set) |
| Composition family (a few per product) | Crop, scale and position of the art within its slot |

Rotate the idea and the combination; keep the skeleton. That keeps fluency and recognition while slowing wear-out.

## 9. Myths

| Myth | Reality | Use instead |
|---|---|---|
| Eyes always move in a Z or along the Gutenberg diagram. | No peer-reviewed eye-tracking found; posters are first seen whole, starting near the centre (Tatler, 2007). | Make one focal point and a clear order: focal, headline, brand, call to action. |
| The F-pattern is how pages should be designed. | NN/g says the F is a symptom of unformatted text and good design prevents it (Pernice, 2017). | Use subheads, short paragraphs and front-loaded words. |
| The rule of thirds makes images better. | Weak link to aesthetic ratings (Amirshahi et al., 2014). | Place by meaning and balance; thirds is one option. |
| Golden ratio layouts are preferred. | See existing myth `golden-ratio`. | Use the format's own proportions and the grid. |
| More white space always improves comprehension by X%. | No traceable source for the numbers; the measured effects are modest and mixed (Chaparro et al., 2004). | Enough space to separate groups and frame text; amount set by the style. |
| A bigger picture gets the ad more attention. | Pictures capture attention at any size; bigger pictures did not raise attention to the whole ad (Pieters & Wedel, 2004). | Size the picture for impact, but protect the headline's space. |
| Bright banners get noticed. | Things that look like ads get skipped (Benway & Lane, 1998). | Make the message look like content. |
| Everyone uses their phone with one thumb. | Many grips observed (Hoober, 2013). | Keep key content and actions central. |

## 10. Scorecard for a layout

Score 0 (no), 1 (partly), 2 (yes). 16 or more out of 20 passes.

1. One focal point that wins on at least two differences (size, colour, isolation).
2. The order is obvious: focal, headline, then brand and call to action.
3. Brand sits next to the headline.
4. Related items grouped; space between groups at least twice the space inside them.
5. Everything aligned to the grid's edges; no near-misses.
6. Body text lines 45–75 characters; nothing in all capitals for long copy.
7. All text and logos inside the format's safe area.
8. Picture and headline both have enough room; neither is starved.
9. The layout looks like its category (a poster reads as a poster) and uses one of the product's templates.
10. The idea and image are fresh, even though the skeleton is familiar.

## 11. Sources

- Amirshahi, S. A., Hayn-Leichsenring, G. U., Denzler, J., & Redies, C. (2014). Evaluating the rule of thirds in photographs and paintings. *Art & Perception*, 2, 163–182.
- Benway, J. P., & Lane, D. M. (1998). Banner blindness: Web searchers often miss "obvious" links. Rice University. (Venue not verified.)
- Bornstein, R. F. (1989). Exposure and affect: Overview and meta-analysis of research, 1968–1987. *Psychological Bulletin*, 106, 265–289.
- Bringhurst, R. *The Elements of Typographic Style*. Hartley & Marks. (Convention of 45–75 characters per line.)
- Calder, B. J., & Sternthal, B. (1980). Television commercial wearout: An information processing view. *Journal of Marketing Research*, 17(2), 173–186.
- Chaparro, B. S., Baker, J. R., Shaikh, A. D., Hull, S., & Brady, L. (2004). Reading online text: A comparison of four white space layouts. *Usability News*, 6(2). Wichita State University, Software Usability Research Laboratory.
- Childers, T. L., & Houston, M. J. (1984). Conditions for a picture-superiority effect on consumer memory. *Journal of Consumer Research*, 11(2), 643–654.
- Dyson, M. C., & Haselgrove, M. (2001). The influence of reading speed and line length on the effectiveness of reading from screen. *International Journal of Human-Computer Studies*, 54, 585–612.
- Hoober, S. (2013, February 18). How do users really hold mobile devices? *UXmatters*. https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php
- Hoober, S. (2017). Design for fingers, touch, and people, Parts 1–3. *UXmatters*.
- Itti, L., & Koch, C. (2001). Computational modelling of visual attention. *Nature Reviews Neuroscience*, 2, 194–203.
- Lindgaard, G., Fernandes, G., Dudek, C., & Brown, J. (2006). Attention web designers: You have 50 milliseconds to make a good first impression! *Behaviour & Information Technology*, 25(2), 115–126. https://doi.org/10.1080/01449290500330448
- Ling, J., & van Schaik, P. (2006). The influence of font type and line length on visual search and information retrieval in web pages. *International Journal of Human-Computer Studies*, 64(5), 395–404. https://doi.org/10.1016/j.ijhcs.2005.08.015
- Montoya, R. M., Horton, R. S., Vevea, J. L., Citkowicz, M., & Lauber, E. A. (2017). A re-examination of the mere exposure effect. *Psychological Bulletin*, 143(5), 459–498.
- Müller-Brockmann, J. (1981). *Grid Systems in Graphic Design*. Niggli. ISBN 978-3-7212-0145-1.
- Nielsen Norman Group. F-shaped pattern for reading web content (2006, updated). https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
- Nielsen Norman Group. Horizontal attention leans left (2010, updated). https://www.nngroup.com/articles/horizontal-attention-leans-left/
- Palmer, S. E. (1992). Common region: A new principle of perceptual grouping. *Cognitive Psychology*, 24, 433–447.
- Pechmann, C., & Stewart, D. W. (1990). Advertising repetition: A critical review of wear-in and wear-out. Marketing Science Institute Report 90-106. https://www.msi.org/working-papers/advertising-repetition-a-critical-review-of-wearin-and-wearout/
- Pernice, K. (2017). F-shaped pattern of reading on the web: Misunderstood, but still relevant (even on mobile). Nielsen Norman Group.
- Pernice, K. (2019). Text scanning patterns: Eyetracking evidence. Nielsen Norman Group.
- Pieters, R., & Wedel, M. (2004). Attention capture and transfer in advertising: Brand, pictorial, and text-size effects. *Journal of Marketing*, 68(2), 36–50.
- Pieters, R., Warlop, L., & Wedel, M. (2002). Breaking through the clutter: Benefits of advertisement originality and familiarity for brand attention and memory. *Management Science*, 48(6), 765–781.
- Reber, R., Schwarz, N., & Winkielman, P. (2004). Processing fluency and aesthetic pleasure. *Personality and Social Psychology Review*, 8(4), 364–382.
- Reinecke, K., & Gajos, K. Z. (2014). Quantifying visual preferences around the world. *Proceedings of CHI '14*, 11–20.
- Romaniuk, J. (2018). *Building Distinctive Brand Assets*. Oxford University Press. ISBN 9780190311506.
- Shaikh, A. D., & Chaparro, B. S. (2005). The effects of line length on reading online news. *Proceedings of the Human Factors and Ergonomics Society 49th Annual Meeting*.
- Tatler, B. W. (2007). The central fixation bias in scene viewing: Selecting an optimal viewing position independently of motor biases and image feature distributions. *Journal of Vision*, 7(14):4. https://doi.org/10.1167/7.14.4
- Treisman, A. M., & Gelade, G. (1980). A feature-integration theory of attention. *Cognitive Psychology*, 12, 97–136.
- Tuch, A. N., Presslaber, E. E., Stöcklin, M., Opwis, K., & Bargas-Avila, J. A. (2012). The role of visual complexity and prototypicality regarding first impression of websites. *International Journal of Human-Computer Studies*, 70(11), 794–811.
- Wagemans, J., Elder, J. H., Kubovy, M., Palmer, S. E., Peterson, M. A., Singh, M., & von der Heydt, R. (2012). A century of Gestalt psychology in visual perception: I. Perceptual grouping and figure-ground organization. *Psychological Bulletin*, 138(6), 1172–1217. https://doi.org/10.1037/a0029333
- Wedel, M., & Pieters, R. (2000). Eye fixations on advertisements and memory for brands: A model and findings. *Marketing Science*, 19(4), 297–312.
- Zajonc, R. B. (1968). Attitudinal effects of mere exposure. *Journal of Personality and Social Psychology Monograph Supplement*, 9(2, Pt. 2), 1–27. https://doi.org/10.1037/h0025848
