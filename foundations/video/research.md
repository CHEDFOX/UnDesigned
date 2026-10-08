# Video, content and motion graphics: research dossier

This dossier covers pieces that move: short video ads, social stories and reels, product demos, how-tos, testimonials, brand films, explainers, animated title cards and interface motion. It covers what holds attention in the first seconds, how story and feeling work, how fast to cut, what sound adds, when animation helps, and how to keep moving work safe for everyone. The data version is [`video.json`](video.json). The storyboard template is [`templates/video/storyboard.md`](../../templates/video/storyboard.md) and the title-card generator is [`templates/video/title-card.mjs`](../../templates/video/title-card.mjs).

It builds on two dossiers and does not repeat them:
- `foundations/layout/media-research.md` and `media.json` cover text over video. They cover motion pulling the eye (`motion-onset`, `motion-gaze`), on-screen reading time (`on-screen-reading`), missed cuts (`edit-blindness`), sound-off viewing (`sound-off`) and faces (`faces-first`, `gaze-cue`).
- `foundations/layout/research.md` covers first impressions, safe areas, repetition and distinctive assets.

Styles still decide how motion feels. Springs, easings, moves and choreography live in `approaches/<id>/motion.json`. This foundation gives the evidence and the rules that hold in every style. Where a style's `motion.json` sets a number, the style wins.

How to read it:
- Each finding names its source (author, year, venue). The full list is in section 13.
- **Strong** means a peer-reviewed result that has held up, or a review of many studies. **Moderate** means one good study, or practitioner research with a clear method. **Emerging** means new, platform-reported or vendor-reported. **Contested** means the evidence is mixed or weak.
- **Practitioner** marks guidance from platforms, agencies or design systems.
- Anything that is a convention rather than a finding is marked **rule of thumb**.
- Where we could not verify a source or a number, we say so and do not lean on it.

## 1. Definition

A video or motion piece is a sequence that unfolds in time. The viewer does not see it whole, as with a poster. They meet it one moment at a time and can leave at any moment. That changes three things:

| Still piece | Moving piece |
|---|---|
| Seen whole in a glance, then read | Seen in order; each moment must earn the next |
| One composition | A first frame, a sequence and a last frame, each of which may be the only one seen |
| Silent | Sound may be on or off |

Video fails in two directions:

| Too slow | Clear and alive | Too busy |
|---|---|---|
| A long neutral set-up, a logo only at the end, text that never changes | A hook, the brand early, one message, a story with a turn, a still end card with a call to action | Cuts, effects, music and text all competing; nothing can be read; flashing |

A **motion graphic** is a piece built from type, shapes and colour rather than footage: title cards, end cards, kinetic type and animated illustrations. The same rules apply. Motion graphics also follow the style's `motion.json` most closely.

## 2. The first seconds

### 2.1 Viewers leave when attention scatters

| Finding | Source | What it means |
|---|---|---|
| In data from nearly 2,000 viewers of 31 commercials, the more viewers' gaze spread over the screen, the more likely they were to zap. Showing the brand in brief pulses, with the same total brand time, lowered avoidance. Central brand positions (not brand size) increased avoidance. | Teixeira, Wedel & Pieters (2010), *Marketing Science* 29(5), 783–804 | Keep one focal point per shot. Brand early and in pulses, worked into the action. Don't park a big logo in the centre. |
| Surprise and joy both concentrated attention and kept viewers. Surprise worked through its level and joy through how fast it rose. Rising joy gained more than falling joy lost. | Teixeira, Wedel & Pieters (2012), *Journal of Marketing Research* 49(2), 144–159 | Open on something unexpected; build feeling upwards. |
| In 82 ads and 178 viewers, entertainment had an inverted-U link with purchase intent. Entertainment after the brand appeared helped; entertainment before it did not. | Teixeira, Picard & el Kaliouby (2014), *Marketing Science* 33(6), 809–827 | Brand first, then the story or joke. Moderate entertainment beats maximum. |

**Moderate** (three well-designed studies from one research team, consistent with each other).

### 2.2 Platform guidance

Google and Ipsos coded the creative of about 17,000 YouTube ads and set out the ABCDs: earn **Attention** early, **Brand** early and often, **Connect** through story, and give **Direction**. Google reports sales and brand lifts for ads that follow them. **Practitioner, moderate.** The data and method are not public, and the platform sells the media. We use the ABCDs as a checklist, not as evidence.

A Facebook-commissioned Nielsen analysis of 173 studies (2016) found lifts in ad recall even among people who watched less than three seconds, and larger lifts with longer viewing. It included only campaigns with positive lift. **Emerging.** The often-quoted line "47% of the value comes in the first three seconds" appears in secondary write-ups. We could not trace it to the report, so we don't use it.

### 2.3 Skipping and length

| Finding | Source | Strength |
|---|---|---|
| Skippable YouTube ads (skip after five seconds) were about as effective per impression as non-skippable ones, and viewers preferred them. | Pashkevich, Dorai-Raj, Kellar & Zigmond (2012), *Journal of Advertising Research* 52, 65–71 (Google's listing names Kellar and Zigmond; check the full author list) | Moderate |
| Longer in-stream ads were recognised better; mid-roll beat pre-roll and post-roll for recognition. | Li & Lo (2015), *Journal of Advertising* 44(3), 208–218 | Moderate |

What we take:
- In skippable placements, the hook, the brand and the one message must fit in the first five seconds.
- Shorter is not automatically better. Make a family of cuts (6, 15, 30, 60 s), each with a job.
- **Peer-reviewed work on "hooks" as such:** we found none beyond the zapping studies above. Advice like "start mid-action" or "open on a close-up" is practitioner guidance (ABCD).

## 3. Story and feeling

| Finding | Source | Strength |
|---|---|---|
| In 108 Super Bowl ads, those with a five-act dramatic form (exposition, rising action, climax, falling action, denouement) were rated higher; more acts went with higher ratings. | Quesenberry & Coolsen (2014), *Journal of Marketing Theory and Practice* 22(4), 437–454 | Moderate (correlational; one event) |
| Ads that lead people to imagine themselves with the product persuade through narrative transportation: absorbed viewers feel more and argue less. Transported viewers were not put off by weak arguments. | Escalas (2004), *Journal of Advertising* 33(2), 37–48; Escalas (2007), *Journal of Consumer Research* 33(4), 421–429 | Moderate |
| Overall judgements of ads leaned towards the peak moment, the final moment and improving feelings. A later facial-EMG study found average, peak and end feelings all mattered, without a clear peak-and-end advantage. | Baumgartner, Sujan & Padgett (1997), *Journal of Marketing Research* 34(2), 219–232 | Contested |
| In 996 IPA effectiveness-award campaigns, emotional campaigns produced more long-term brand and business effects than rational ones. | Binet & Field (2013), *The Long and the Short of It*, IPA | Moderate, practitioner (award entries are a selected sample) |

What we take:
- From 30 s up, tell a story with a turn: the customer and their problem, rising tension, the product resolves it, a short after-moment.
- In 6–15 s, keep at least problem to resolution.
- Let feeling rise towards the product, and end on a strong, still frame, not a weak logo slate after the best moment has passed.
- This matches the playbook: the customer is the hero (S1), name the problem (S3), paint the success (S7), make the product the hero of the idea (W8).

## 4. Pacing and editing

### 4.1 Shot length

Cutting, DeLong and Nothelfer (2010, *Psychological Science* 21, 440–447) analysed 150 Hollywood films from 1935 to 2005. Over time, shot lengths became more correlated with their neighbours, approaching a 1/f pattern that also describes fluctuations in human attention. A follow-up on 160 films (Cutting, Brunick, DeLong, Iricinschi & Candan, 2011, *i-Perception* 2(6), 569–576) confirmed that shots got shorter. Summaries put average shot length at over 10 s in the 1930s and about 4 s by the 2000s; we did not check those figures against the full text. **Moderate** (descriptive, not an experiment on viewers).

- Vary shot length in runs (a few short shots, then a longer one) rather than cutting on a fixed beat.
- Films got faster, but that is a trend, not proof that faster is better.

### 4.2 Edits, arousal and overload

| Finding | Source | Strength |
|---|---|---|
| As the rate of edits within a scene rose from slow to very fast, arousal and memory increased without a significant rise in cognitive load. | Lang, Zhou, Schwartz, Bolls & Potter (2000), *Journal of Broadcasting & Electronic Media* 44(1), 94–109 | Moderate |
| The limited capacity model: pacing and arousing content raise attention and encoding up to a point, then overload, and memory falls. | Lang (2000), *Journal of Communication* 50(1), 46–70 | Moderate (large research programme) |
| With faster pacing and arousing content, verbal recognition fell while visual recognition held. | Lang, Potter & Bolls (1999), *Media Psychology* 1(2), 145–163 | Moderate |
| Pacing and arousing content in television messages. | Lang, Bolls, Potter & Kawahara (1999), *Journal of Broadcasting & Electronic Media* 43(4), 451–475 | Not used for a claim: we could not retrieve the abstract |
| Cuts between related and unrelated content affected attention differently. | Geiger & Reeves (1993), *Communication Research* 20(2), 155–175 | Moderate (from the abstract; we did not check the title) |

What we take:
- Cutting to a new angle on the same subject keeps energy up cheaply. Cutting to unrelated content costs more.
- Pick one source of intensity at a time: fast cutting, intense content or dense information. Never all three.
- Words go first when capacity runs out. When the offer, the CTA or a how-to step must be read, slow the cutting and hold the shot.

### 4.3 What viewers miss

| Finding | Source | Strength |
|---|---|---|
| When the only actor in a film was swapped at a cut, about two thirds of viewers did not notice. | Levin & Simons (1997), *Psychonomic Bulletin & Review* 4, 501–506; review: Simons & Levin (1997), *Trends in Cognitive Sciences* 1(7), 261–267 | Strong |
| While counting basketball passes, about half of viewers missed a person in a gorilla suit. | Simons & Chabris (1999), *Perception* 28, 1059–1074 | Strong |

This extends `edit-blindness` in `media.json` (viewers miss many cuts).
- Don't let a change at a cut carry the message. Show the change happening in shot.
- Put the brand and the offer where attention already is: on the subject, in the path of the motion, on the beat. A logo in a corner while the story plays in the centre may never be seen.

## 5. People on screen

Faces get the first look and people follow gaze (`faces-first`, `gaze-cue`, `motion-gaze` in `media.json`). For presenters and talking heads:

| Finding | Source | Strength |
|---|---|---|
| In 6.9 million edX viewing sessions, shorter videos were much more engaging; informal talking heads beat studio recordings; talking heads intercut with slides beat slides alone. Summaries put the drop-off at about six minutes. | Guo, Kim & Rubin (2014), *Proceedings of Learning @ Scale '14*, 41–50 | Moderate (observational; six-minute figure from summaries) |
| Viewers preferred lecture videos with the instructor's face, rated them more educational and looked at the face a lot. | Kizilcec, Papadopoulos & Sritanyaratana (2014), *Proceedings of CHI '14*, 2095–2102 (we read summaries in later papers) | Moderate |
| Adding the speaker's image does not by itself improve learning (image principle). | Mayer (2009), *Multimedia Learning*, 2nd ed. | Moderate |
| Customer-made brand posts led to higher purchase intention than disclosed ads or brand posts, because they did not trigger persuasion knowledge. | Mayrhofer, Matthes, Einwiller & Naderer (2020), *International Journal of Advertising* 39(1), 166–186 | Moderate (one experiment, young adults, posts not video) |

Overall **contested** for learning, **moderate** for liking and trust.
- Show a real person to build trust: testimonials, founders, how-tos.
- Cut to the product or the step when the viewer needs to look at it.
- Direct address to camera suits testimonials and founder pieces. When the product should get the look, the person looks at the product (`gaze-cue`).
- Use real customers in their own words. Never script fake customers, and label paid partnerships.

## 6. Sound

| Finding | Source | Strength |
|---|---|---|
| Results on music in ads become consistent once sorted by congruity: music that fits the mood, genre, imagery and brand helps; music that clashes hurts. | Oakes (2007), *Journal of Advertising Research* 47(1), 38–50 | Moderate (review) |
| Experiments on how well music and voice "fit" an ad. | North, McKenzie, Law & Hargreaves (2004), *Journal of Applied Social Psychology* 34(8), 1675–1708 | Moderate (we saw the record, not the abstract) |
| A six-tone sonic logo was valued more than three- or nine-tone versions, through ease of processing. | Krishnan, Kellaris & Aurand (2012), *Journal of Product & Brand Management* 21(4), 275–284 | Emerging (one experiment) |
| Narration plus pictures beats pictures plus the same words on screen (redundancy), with exceptions; conversational narration helps (personalisation). | Mayer (2009) | Strong |

Practitioner claims about audio branding go much further than this evidence; we don't repeat them.

What we take:
- Sound off first (`sound-off` in `media.json`): the one message works as picture plus on-screen text, and speech is captioned.
- Then make sound on better: music that fits, a plain conversational voice, effects that support the action.
- Voice-over says what the picture can't. On-screen text carries key words only, not the narration (captions are separate).
- A sonic logo, if the brand has one, is short, simple and used the same way every time. It is a distinctive asset (`distinctive-assets`), never the only branding.
- Cutting on the musical beat and letting the music resolve with the end card is **rule of thumb**.

## 7. Motion graphics

### 7.1 When animation helps

Tversky, Morrison and Bétrancourt (2002, *International Journal of Human-Computer Studies* 57, 247–262) reviewed comparisons of animated and static graphics. They found little evidence that animation beats a good static graphic. Where animation seemed better, it usually showed more information or allowed interaction. Two principles explain this:
- **Congruence:** animation suits ideas that are about change over time.
- **Apprehension:** animation is often too fast or complex to perceive, and people think of many processes as discrete steps.

**Strong.** Rules:
- Animate only what changes in the idea (arrive, transform, connect, leave).
- Break processes into steps that each end on a readable still.
- Slow down; never animate for decoration.

### 7.2 Making motion easy to follow

Chang and Ungar (1993, *Proceedings of UIST '93*, 45–55) brought cartoon animation principles into a user interface: solidity, exaggeration and reinforcement (slow in and slow out, arcs, follow-through, motion blur). Users could follow objects that moved and appeared without being startled. The craft source is Thomas and Johnston's *Disney Animation: The Illusion of Life* (Abbeville Press, 1981), with its twelve principles. **Moderate, practitioner** (a design paper and a craft book, not controlled tests).

- Nothing starts or stops dead. Ease or spring every move, and let it settle.
- Travelling objects move along arcs.
- Springs are physical: stiffness, damping and mass. The build turns them into CSS `linear()` easings (`approaches/build.mjs` → `springEasing`). Each style picks its own springs. Humanist Minimal's `gentle` spring settles in about 660 ms with almost no overshoot; Negative Space's `settle` takes about 1.2 s.

### 7.3 Timing

| Source | What it says | Strength |
|---|---|---|
| Nielsen (1993), *Usability Engineering* | About 0.1 s feels instant; about 1 s is the limit for keeping a train of thought. | Practitioner, widely used |
| Material Design 3 motion tokens | Durations from 50 to 1,000 ms (short 50–200, medium 250–400, long 450–600, extra-long 700–1,000); longer for larger moves and bigger screens, shorter for exits. We read the values in Flutter's reference and Material pages. | Practitioner |
| Nielsen Norman Group, "Executing UX animations: duration and motion characteristics" | Commonly summarised as 100–500 ms for most UI animation. We could not open the article, so we don't attribute that range to it. | Unverified |

Our bounds (**rule of thumb**, `video.json` → `motionGraphics.timing`):

| Kind | ms |
|---|---|
| Micro (hover, press, toggle) | 100–200 |
| Standard (cards, panels) | 200–400 |
| Entrance | 250–500, or a spring that settles within about 1,200 ms |
| Exit | 150–300 (shorter than entrances) |
| Emphasis (one pulse on one thing) | 300–600 |
| Scene change | 500–1,000 (a cut is often better) |

The style's `motion.json` picks values inside these bounds and wins where it sets its own.

### 7.4 Kinetic type

Ford, Forlizzi and Ishizaki (1997, *CHI '97 Extended Abstracts*, 269–270) set out the issues in time-based text. Lee, Forlizzi and Hudson (2002, *Proceedings of UIST '02*, 81–90) built the kinetic typography engine. The group argued that the timing and motion of words can add tone, voice and emphasis, and later small studies found people could match some effects to emotions. **Emerging.** There is little evidence on comprehension or persuasion.

- A line arrives once, as whole words or a whole line, then stays still for its reading time. The reading rule is in `media.json` (`on-screen-reading`): max(1.5 s, 0.375 s × words + 0.5 s).
- Animate letters only for a one- or two-word display line whose meaning is the motion.
- Stress at most one word per line.
- Every new move pulls the eye (`motion-onset`), so nothing else moves while words are being read.

### 7.5 Loops and repetition

We found no research on ideal loop length. Loop lengths come from the styles: 2–4 s in Humanist Minimal, and 6–12 s (rarely) in Negative Space. Repetition builds liking only up to a point (`repetition`, `wear-out` in `layout.json`). On the web, anything that moves for more than 5 s next to other content needs a pause control (section 8).

## 8. Accessibility and safety

### 8.1 Flashes

| Finding | Source | Strength |
|---|---|---|
| Photosensitivity affects about 0.3–3% of people; light-provoked seizures about 1 in 4,000 aged 5–24. Flicker at 15–25 Hz is most provocative; seizures occur from 1 to 65 Hz. Red and light-dark borders matter. | Fisher, Harding, Erba, Barkley & Wilkins (2005), *Epilepsia* 46(9), 1426–1441 | Strong |
| Consensus: a flash is a potential hazard at 3 or more per second, at least 20 cd/m², over about 25% of the screen at normal viewing distance. Transitions to or from saturated red are a risk. Patterns with more than five light-dark stripe pairs can provoke seizures. | Harding, Wilkins, Erba, Barkley & Fisher (2005), *Epilepsia* 46(9), 1423–1425 | Strong (expert consensus) |
| Web: nothing flashes more than three times in any one second, unless below the general and red flash thresholds. | W3C WCAG 2.2, SC 2.3.1 (A); 2.3.2 (AAA) bans flashes above three per second outright | Standard |
| Broadcast: ITU-R BT.1702 (current edition BT.1702-3, 2023) and, in the UK, Ofcom Broadcasting Code rule 2.13. The UK advertising regulator expects ads to pass a Harding Flash and Pattern Analyser test or equivalent, and Ofcom notes that passing the test does not guarantee compliance. | ITU; Ofcom; ASA | Practice (we did not open BT.1702 itself) |

Never flash, never strobe, never cut rapidly between light and dark, no red flashes, no moving high-contrast stripes. Test paid and broadcast video with an analyser.

### 8.2 Vestibular disorders and reduced motion

Some people get dizzy or sick from scaling, zooming, spinning, large pans and parallax. Since 2017, browsers let pages read the operating system's reduced-motion setting through the `prefers-reduced-motion` media query (Craig, 2017, "Responsive design for motion", WebKit blog; MDN). WCAG 2.2 SC 2.3.3 (AAA) asks that motion triggered by interaction can be switched off. **Moderate, practitioner.**

- Under reduced motion, show final frames, swap zooms, spins and large moves for cuts or short fades, and stop loops.
- Content must still be complete: the final frame carries the whole message. `title-card.mjs` does this.

### 8.3 Pause, captions, description

| Need | Standard | Rule |
|---|---|---|
| Moving content | WCAG 2.2 SC 2.2.2 Pause, Stop, Hide (A) | Anything that starts by itself, moves for more than 5 s and sits alongside other content needs a pause, stop or hide control, or stops within 5 s. |
| Autoplay audio | SC 1.4.2 Audio Control (A) | Audio that plays by itself for more than 3 s needs a pause or volume control. |
| Captions | SC 1.2.2 (A); BBC Subtitle Guidelines (practice) | Caption all speech, synchronised, inside the safe area. |
| Audio description | SC 1.2.3 (A), 1.2.5 (AA) | If key information is only visual, say it in the voice-over or describe it. |

## 9. Formats and platforms

| Finding | Source | Strength |
|---|---|---|
| A large field study and two experiments found vertical video ads raised interest and engagement on phones, because full-screen vertical viewing took less effort. The effect was stronger for younger viewers. | Mulier, Slabbinck & Vermeir (2021), *Journal of Interactive Marketing* 55, 1–15 | Moderate (one paper) |
| YouTube spec: bumper ads up to 6 s; non-skippable 7–15 s (16–30 s on connected TV); skippable ads can be skipped after 5 s. | Google Ads Help; Pashkevich et al. (2012) | Platform spec |

- Phone feeds: 9:16 full screen, with the subject and text inside `layout.json` → `safeAreas.story` (top 14%, bottom 35%, sides 6%).
- TV, desktop and the YouTube player: 16:9.
- We found no peer-reviewed "optimal length". Our cuts (6, 15, 30, 60 s) are a **rule of thumb**. Platform maximums change, so check the current spec.
- First frame and thumbnail: covered in `media.json` (`first-frame`) and in `layout.json` → `safeAreas.thumbnail`.

Per-format details: `video.json` → `formats`.

## 10. Content types

| Type | Job | Evidence it leans on |
|---|---|---|
| Product demo | Show what it does and how it feels | `animation-congruence`, `multimedia-principles`, `capacity-overload` |
| How-to | Teach a task; build trust and an owned audience | `multimedia-principles`, `short-segments` |
| UGC and testimonial | A real customer's words as proof | `ugc-persuasion`, `presenter-face`, `transportation` |
| Brand film | Long-term memory and feeling | `dramatic-form`, `transportation`, `emotional-long-term`, `peak-end` |
| Explainer | Make an idea or process clear | `multimedia-principles` (Mayer, 2009; Brame, 2016), `animation-congruence` |
| Title card and kinetic type | Openers, end cards, announcements | `kinetic-type`, `on-screen-reading`, `photosensitivity` |

For explainers and how-tos, Mayer's principles (2009, *Multimedia Learning*, 2nd ed., Cambridge University Press), summarised for video by Brame (2016, *CBE—Life Sciences Education* 15(4), es6), are the strongest evidence in this dossier:
- **Coherence:** cut extras.
- **Signalling:** cue the key point.
- **Redundancy:** don't put the full narration on screen as well.
- **Temporal contiguity:** show it while you say it.
- **Segmenting:** short parts.
- **Personalisation:** conversational words.

Each principle has stated limits. Beats per type: `video.json` → `contentTypes`.

## 11. Myths

| Myth | Reality | Use instead |
|---|---|---|
| People have an eight-second attention span, shorter than a goldfish. | The figure came from a 2015 Microsoft Canada marketing report that credited "Statistic Brain". A BBC investigation (Maybin, 2017) found no research behind it, and attention researchers say attention depends on the task and has not been shown to shrink. | Design for competition, not a fixed span: earn the first seconds, then keep earning. |
| Nobody watches past three seconds. | Short views can lift recall, but lifts grew with longer viewing. Skippable ads stayed effective per impression, and longer in-stream ads were recognised better (section 2). "Three seconds" is also how some platforms count a view. | First seconds carry brand and hook; the rest rewards those who stay. |
| Faster cutting is always more engaging. | Edits within a scene raised arousal and memory, but pace, intensity and information share limited capacity, and words drop first (section 4). | Vary pace; slow down for words. |
| More animation is more engaging and clearer. | Animation helps mainly when it carries the change itself and can be followed (Tversky et al., 2002); every move pulls the eye. | One meaningful move at a time, ending on a still. |
| Hold the brand back for a reveal at the end. | Brand pulses reduced zapping, and entertainment helped only after the brand appeared (Teixeira et al., 2010, 2014). | Brand early, pulse it, close on it. |
| Vertical always beats horizontal. | The evidence is for mobile feeds (Mulier et al., 2021). | Master for the main placement; reframe per format. |
| There is one optimal video length. | No peer-reviewed optimum found; it depends on placement and job. | A family of cuts, each with a job. |
| Reduced motion means no animation at all. | The setting targets vestibular triggers (zoom, scale, parallax, large moves). | Final frames, cuts or short fades, no loops. |
| 85% of video is watched without sound. | Already covered: `media.json` → myths → `eighty-five-percent-silent`. | Design for sound off; caption everything. |

## 12. Scorecard for a video or motion piece

Score 0 (no), 1 (partly), 2 (yes). **16 or more out of 20 passes.** Use it with the text-on-media scorecard (`media-research.md` section 9) when there is text over footage, and with the style's own scorecard.

1. **First frame.** It works as a still: subject, the one message and the brand are readable without motion or sound.
2. **Hook.** The first seconds earn attention with a surprise, mid-action or a close-up, not a slow neutral set-up.
3. **Brand early.** The brand appears in the first seconds (inside 5 s in skippable placements), recurs, and sits next to the headline when text is on screen.
4. **One message, one focus.** The piece makes one point, and each shot has one focal point.
5. **Story.** There is a problem and a resolution in which the product is the hero; from 30 s up, a turn or peak; real people and real facts only.
6. **Pace.** Shot lengths vary. Fast cutting, intense content and dense information are never stacked. Words, offers and steps get slow, held shots.
7. **Text on screen.** Still, in a still zone, inside the safe area, held max(1.5 s, 0.375 s × words + 0.5 s), changed on a cut.
8. **Motion.** One thing moves at a time; each move means something; springs and timings come from the style's `motion.json`; each sequence ends on a still.
9. **Sound.** It works with sound off (captions, message on screen) and better with sound on (fitting music, plain voice, sonic logo used consistently if the brand has one).
10. **Safe for everyone.** No more than three flashes a second, no red flashes or strobing stripes; a reduced-motion version shows the final frames; content over 5 s on the web can be paused; there is audio description or a descriptive voice-over where key information is only visual.

## 13. Sources

- Baumgartner, H., Sujan, M., & Padgett, D. (1997). Patterns of affective reactions to advertisements: The integration of moment-to-moment responses into overall judgments. *Journal of Marketing Research*, 34(2), 219–232.
- Binet, L., & Field, P. (2013). *The Long and the Short of It: Balancing Short and Long-Term Marketing Strategies*. IPA. (Practitioner.)
- Brame, C. J. (2016). Effective educational videos: Principles and guidelines for maximizing student learning from video content. *CBE—Life Sciences Education*, 15(4), es6. https://doi.org/10.1187/cbe.16-03-0125
- Chang, B.-W., & Ungar, D. (1993). Animation: From cartoons to the user interface. *Proceedings of UIST '93*, 45–55. ACM.
- Craig, J. (2017). Responsive design for motion. *WebKit blog*. https://webkit.org/blog/7551/responsive-design-for-motion/
- Cutting, J. E., DeLong, J. E., & Nothelfer, C. E. (2010). Attention and the evolution of Hollywood film. *Psychological Science*, 21, 440–447. https://doi.org/10.1177/0956797610361679 (page range as cited by the authors' later paper; check against the issue.)
- Cutting, J. E., Brunick, K. L., DeLong, J. E., Iricinschi, C., & Candan, A. (2011). Quicker, faster, darker: Changes in Hollywood film over 75 years. *i-Perception*, 2(6), 569–576. https://doi.org/10.1068/i0441aap
- Escalas, J. E. (2004). Imagine yourself in the product: Mental simulation, narrative transportation, and persuasion. *Journal of Advertising*, 33(2), 37–48. https://doi.org/10.1080/00913367.2004.10639163
- Escalas, J. E. (2007). Self-referencing and persuasion: Narrative transportation versus analytical elaboration. *Journal of Consumer Research*, 33(4), 421–429.
- Fisher, R. S., Harding, G., Erba, G., Barkley, G. L., & Wilkins, A. (2005). Photic- and pattern-induced seizures: A review for the Epilepsy Foundation of America Working Group. *Epilepsia*, 46(9), 1426–1441.
- Ford, S., Forlizzi, J., & Ishizaki, S. (1997). Kinetic typography: Issues in time-based presentation of text. *CHI '97 Extended Abstracts*, 269–270. https://doi.org/10.1145/1120212.1120387
- Geiger, S., & Reeves, B. (1993). [Related and unrelated cuts and attention to television]. *Communication Research*, 20(2), 155–175. (Title not checked; findings from the abstract.)
- Google. The ABCDs of effective creative (YouTube video ad creative guidance, with Ipsos). Think with Google. https://business.google.com/us/think/future-of-marketing/youtube-video-ad-creative/ (Practitioner.)
- Google Ads Help. Non-skippable in-stream ads. https://support.google.com/google-ads/answer/11462260 (Platform spec.)
- Google. Material Design 3: Motion, easing and duration. https://m3.material.io/styles/motion (Practice; values read in Flutter's `Durations` and `Easing` reference.)
- Guo, P. J., Kim, J., & Rubin, R. (2014). How video production affects student engagement: An empirical study of MOOC videos. *Proceedings of Learning @ Scale '14*, 41–50. https://doi.org/10.1145/2556325.2566239
- Harding, G., Wilkins, A. J., Erba, G., Barkley, G. L., & Fisher, R. S. (2005). Photic- and pattern-induced seizures: Expert consensus of the Epilepsy Foundation of America Working Group. *Epilepsia*, 46(9), 1423–1425.
- ITU-R. Recommendation BT.1702-3 (2023). Guidance for the reduction of photosensitive epileptic seizures caused by television. https://www.itu.int/rec/R-REC-BT.1702 (Content not opened.)
- Kizilcec, R. F., Papadopoulos, K., & Sritanyaratana, L. (2014). Showing face in video instruction: Effects on information retention, visual attention, and affect. *Proceedings of CHI '14*, 2095–2102. (Findings from summaries in later papers.)
- Krishnan, V., Kellaris, J. J., & Aurand, T. W. (2012). Sonic logos: Can sound influence willingness to pay? *Journal of Product & Brand Management*, 21(4), 275–284. https://doi.org/10.1108/10610421211246685
- Lang, A. (2000). The limited capacity model of mediated message processing. *Journal of Communication*, 50(1), 46–70. https://doi.org/10.1111/j.1460-2466.2000.tb02833.x
- Lang, A., Bolls, P., Potter, R. F., & Kawahara, K. (1999). The effects of production pacing and arousing content on the information processing of television messages. *Journal of Broadcasting & Electronic Media*, 43(4), 451–475. (Abstract not retrieved; end page also given as 457.)
- Lang, A., Potter, R. F., & Bolls, P. D. (1999). Something for nothing: Is visual encoding automatic? *Media Psychology*, 1(2), 145–163 (also given as 145–164).
- Lang, A., Zhou, S., Schwartz, N., Bolls, P. D., & Potter, R. F. (2000). The effects of edits on arousal, attention, and memory for television messages: When an edit is an edit can an edit be too much? *Journal of Broadcasting & Electronic Media*, 44(1), 94–109.
- Lee, J. C., Forlizzi, J., & Hudson, S. E. (2002). The kinetic typography engine: An extensible system for animating expressive text. *Proceedings of UIST '02*, 81–90. ACM.
- Levin, D. T., & Simons, D. J. (1997). Failure to detect changes to attended objects in motion pictures. *Psychonomic Bulletin & Review*, 4, 501–506. https://doi.org/10.3758/BF03214339
- Li, H., & Lo, H.-Y. (2015). Do you recognize its brand? The effectiveness of online in-stream video advertisements. *Journal of Advertising*, 44(3), 208–218.
- Maybin, S. (2017). Busting the attention span myth. *BBC News*. https://www.bbc.com/news/health-38896790
- Mayer, R. E. (2009). *Multimedia Learning* (2nd ed.). Cambridge University Press. ISBN 978-0-521-73535-3.
- Mayrhofer, M., Matthes, J., Einwiller, S., & Naderer, B. (2020). User generated content presenting brands on social media increases young adults' purchase intention. *International Journal of Advertising*, 39(1), 166–186. https://doi.org/10.1080/02650487.2019.1596447
- MDN Web Docs. prefers-reduced-motion. https://developer.mozilla.org/docs/Web/CSS/@media/prefers-reduced-motion
- Mulier, L., Slabbinck, H., & Vermeir, I. (2021). This way up: The effectiveness of mobile vertical video marketing. *Journal of Interactive Marketing*, 55, 1–15. https://doi.org/10.1016/j.intmar.2020.12.002
- Nielsen, J. (1993). *Usability Engineering*. Academic Press. (Response-time limits.)
- Nielsen for Facebook (2016). Brand-effect analysis of 173 video campaigns, as reported by Marketing Dive and MarTech. (Commissioned; original not retrieved.)
- Nielsen Norman Group. Executing UX animations: Duration and motion characteristics. https://www.nngroup.com/articles/animation-duration/ (Not opened.)
- North, A. C., McKenzie, L. C., Law, R., & Hargreaves, D. J. (2004). The effects of musical and voice "fit" on responses to advertisements. *Journal of Applied Social Psychology*, 34(8), 1675–1708.
- Oakes, S. (2007). Evaluating empirical research into music in advertising: A congruity perspective. *Journal of Advertising Research*, 47(1), 38–50.
- Ofcom. Broadcasting Code, rule 2.13, and guidance on flashing images and regular patterns in television. (Practice.)
- Pashkevich, M., Dorai-Raj, S., Kellar, M., & Zigmond, D. (2012). Empowering online advertisements by empowering viewers with the right to choose: The relative effectiveness of skippable video advertisements on YouTube. *Journal of Advertising Research*, 52, 65–71. (Google Research lists Kellar and Zigmond on the paper page.)
- Quesenberry, K. A., & Coolsen, M. K. (2014). What makes a Super Bowl ad super? Five-act dramatic form affects consumer Super Bowl advertising ratings. *Journal of Marketing Theory and Practice*, 22(4), 437–454. https://doi.org/10.2753/MTP1069-6679220406
- Simons, D. J., & Chabris, C. F. (1999). Gorillas in our midst: Sustained inattentional blindness for dynamic events. *Perception*, 28, 1059–1074.
- Simons, D. J., & Levin, D. T. (1997). Change blindness. *Trends in Cognitive Sciences*, 1(7), 261–267. https://doi.org/10.1016/S1364-6613(97)01080-2
- Teixeira, T., Picard, R., & el Kaliouby, R. (2014). Why, when, and how much to entertain consumers in advertisements? A web-based facial tracking field study. *Marketing Science*, 33(6), 809–827. https://doi.org/10.1287/mksc.2014.0854
- Teixeira, T., Wedel, M., & Pieters, R. (2010). Moment-to-moment optimal branding in TV commercials: Preventing avoidance by pulsing. *Marketing Science*, 29(5), 783–804. https://doi.org/10.1287/mksc.1100.0567
- Teixeira, T., Wedel, M., & Pieters, R. (2012). Emotion-induced engagement in internet video advertisements. *Journal of Marketing Research*, 49(2), 144–159. https://doi.org/10.1509/jmr.10.0207
- Thomas, F., & Johnston, O. (1981). *Disney Animation: The Illusion of Life*. Abbeville Press. (Craft practice.)
- Tversky, B., Morrison, J. B., & Bétrancourt, M. (2002). Animation: Can it facilitate? *International Journal of Human-Computer Studies*, 57, 247–262.
- W3C (2023). Web Content Accessibility Guidelines (WCAG) 2.2: SC 1.2.2, 1.2.3, 1.2.5, 1.4.2, 2.2.2, 2.3.1, 2.3.2, 2.3.3, and the Understanding documents. https://www.w3.org/TR/WCAG22/
