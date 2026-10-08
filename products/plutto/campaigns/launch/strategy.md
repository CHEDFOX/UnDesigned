# Plutto: content strategy for the launch

Source of truth: `products/plutto/identity.json` (core, marks, signals) and `products/plutto/messaging.json` (message, voice, proof). Every fact below is from the plutto.space source or the brief; nothing is invented. Copy is new, written from the core with the messaging playbook; site lines are used only as proof.

## The core in four lines

1. **Belief:** people have looked up for answers for thousands of years; the sky should be able to answer one person back.
2. **Change:** instead of a sun-sign paragraph written for a twelfth of the world, you ask your own birth chart out loud and hear it in plain words, in the tradition you choose, from a voice that remembers you.
3. **Character:** calm, exact, literary.
4. **Tension:** the oldest way of asking (watching the sky) meets the newest way of answering (a voice you can interrupt).

**Honesty rule for every pillar.** Plutto never predicts outcomes. Copy talks about patterns, periods, time, choice and self ("let's look at", "what it asks of you"), never "will happen". Example questions are labelled as examples; there are no testimonials, users or numbers beyond the site's own proof.

## How the guide shapes every series

| Guide part | What it does here |
|---|---|
| Negative Space (NS1–NS8) | The black ground is the night sky and the silence before an answer. One object per piece: the orb, a chart, the planet or the app icon. |
| Brand exception | The orb is drawn as the site draws it (five radial-gradient layers, `app/globals.css`); gold lives only on the orb and the app icon. |
| Wada 255 dark + instrument | Wada Black ground, Wada White type (18.6:1), Instrument Serif headlines with a true italic for spoken questions, Instrument Sans for proof, IBM Plex Mono for degrees and numbers. |
| Marks | The original wordmark lockup sits beside every headline; the original app icon where an icon belongs. |
| Layout + media | At least six compositions across the set (`foundations/layout/layout.json` → composition); the brand photo placed by `media.json` and measured with `overlay.mjs`. |
| Video | Motion follows `video.json` (one mover, reading-time holds, end on a still, reduced motion shows the final frame) and the style's slow springs. |

## Pillars and series

### 1. Ask the sky (the customer's moment)

- **Job:** show the real kinds of questions people bring to astrology, and how Plutto begins an answer: by looking at their own chart.
- **Hook formula:** *[a question a person really asks, in their words, in italic]* + *[the first plain sentence of an answer, in roman, that points to the chart, never to an outcome]*.
- **Example prompts** (labelled "an example question"): Why do I keep starting over? What is this year asking of me? Why does this year feel so slow? What would you ask your chart first?
- **Guide:** dialogue composition: italic = the person's voice, roman = Plutto's voice, a waveform for each (`post-ask-voice`); type-led when the question is the object (`post-question`). Findings: words and picture complete each other (W5); inward bias and gaze cue (the voice travels toward the words; Palmer et al. 2008, Hutton & Nolte 2011).
- **Repeatable:** questions collected through the story question sticker become the next posts (P4: an owned audience).

### 2. Five lenses (education)

- **Job:** teach what each tradition is for, using the site's own descriptions as the spine: Vedic for exactness, Western for psychology, Chinese for the elements, KP for finer divisions, numerology for a name.
- **Hook formula:** *[Tradition], for [what it is for].* + one sentence on how it reads a birth, drawn as the tradition's own chart.
- **Guide:** a carousel that tells one story (formats.json: first slide hooks, last carries the call to action). One thread crosses every seam and the orb travels along it into each lens. Each lens is drawn precisely: a North Indian square chart, a Western wheel with unequal houses, the five-element cycles, the 249 KP sub-divisions, a name's letters and numbers. Findings: picture superiority (pictures recalled better than words), repetition of one frame (repetition, distinctive-assets).
- **Repeatable:** one lens per week as a single post (the same drawing, a new question), and the 24° Western-to-Vedic turn as motion.

### 3. The craft (proof)

- **Job:** earn trust with specific facts (O5, S4): charts computed with Swiss Ephemeris, "the same source observatories use"; 300+ classical yogas; 19 divisional charts; 7 dasha systems; 89 languages; voice on OpenAI Realtime; built by xooteq Lab.
- **Hook formula:** *[one precise fact]* shown at the precision it claims (a degree ruler, a tick per ten arc-minutes), with the other facts as quiet proof underneath.
- **Guide:** horizon composition (one full-bleed hairline is the only line Negative Space allows outside the object). Findings: prestige and trust of white space (Pracejus, Olsen & O'Guinn 2006, 2013); fluency (clarity and precision increase liking).
- **Repeatable:** one fact per post: 19 divisional charts drawn as 19 nested rings, 7 dasha systems as 7 timelines, 89 languages as one question in many scripts.

### 4. Not twelve boxes (the dramatic truth)

- **Job:** say the one thing competitors cannot: a sun sign is a twelfth of the sky; a birth chart is yours.
- **Hook formula:** *[the myth, stated plainly]* → *[the chart that replaces it]*: twelve boxes vs one open field; a sun sign vs the minute you were born.
- **Guide:** two-mass tension (twelve small boxes at the top, the orb alone in the open field); a precise natal wheel at the optical centre; the brand photo with the sky as the ground. Findings: pop-out by isolation and colour; centre bias for symmetric objects; real photos over stock (media.json real-photos).
- **Repeatable:** "Not twelve boxes" myth-and-chart pairs (sun sign vs rising sign, daily horoscope vs your current period).

### 5. Coming soon (news)

- **Job:** O6: news sells. Plutto for iOS and Android, soon. No date until the team gives one.
- **Hook formula:** *Soon, [the sky / your chart] [answers back / talks back].* + the app icon, unchanged.
- **Guide:** the app icon alone at the optical centre; a story with the planet photo low and a question sticker in the live band. Findings: distinctive assets used the same way every time; touch-centre for interaction.
- **Repeatable:** countdown stickers once a date exists; "first questions" from the sticker answered on launch day.

## Cadence (proposal)

| Week | Feed | Stories | Web |
|---|---|---|---|
| 1 | Ask the sky #1, Five lenses carousel | Ask the sky sticker | Landing hero, banner |
| 2 | Not twelve boxes #1, The craft (LinkedIn too) | Coming soon sticker | Thumbnail for the first video |
| 3 | Not twelve boxes #2 (wheel), Motion: the 24° turn | Motion: the orb answers | |
| 4 | Ask the sky #2, Not twelve boxes #3 (photo), Coming soon post | Answers to sticker questions | Poster for print |
