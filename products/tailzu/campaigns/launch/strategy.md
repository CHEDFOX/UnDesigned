# Tailzu: content strategy

Built from `products/tailzu/identity.json` (the core) and `messaging.json` (the message), using the messaging playbook (`foundations/messaging`) and Humanist Minimal (`approaches/humanist-minimal`). The launch campaign in this folder is the first run of every series below.

## The core in four lines

1. **Belief:** the way you talk is already good enough to send; only the mess should go.
2. **Change:** you say it as it comes (half-formed, Hinglish, full of "um") and a clean message in your own words lands in whatever app you were in.
3. **Character:** plain, exact, warm.
4. **Tension:** people think in speech but are made to perform in type. Tailzu keeps your voice and drops only the noise: it cleans, it never rewrites.

## The one visual idea: hand in, type out

The brand already says it (site README: "Speech is a person, and a person writes by hand ... Hand in, type out: that contrast is the product"). Humanist Minimal is built the same way: the hand lives in the ink line and one short note, and the type stays calm. So every piece shows the customer's words twice:

| Layer | Said (the person) | Written (Tailzu) |
|---|---|---|
| Type | Caveat, one note of six words or fewer, under a mono `SAID` label | Instrument Serif under a mono `WRITTEN` label |
| Mark | Hand-drawn ink: a wobbling line, a loop that strikes out the "um", a caret where a comma goes | Nothing: the clean line needs no drawing |
| Accent | none | One cut-paper full stop in the palette's accent, landing last (the site's amber full stop on og.png) |
| Proof | — | A kept name or amount is underlined in ink, never coloured (site README: "a fact that survived is a record") |

**Why it works (research):** handwriting makes people feel a person was there (`handwriting.json` → `human-presence`, Schroll et al. 2018), which is exactly what the said line is: you. Machine type reads as clearer and more credible (`fluency-cost`, Song & Schwarz 2008; `credibility-cost`, Song et al. 2025), which is what the written line must be. The research also says never to set numbers, steps or CTAs in a hand face, so names and amounts always land in type, and a hand note may point at a number but never be one. The proof marks borrow the site's own editor's-proof gesture ("key" struck through on the hero).

## Pillars and series

Each pillar is a repeatable series: a fixed hook formula, a fixed layout skeleton (repetition and distinctive-assets findings: the frame becomes familiar), and a new idea, sentence and Wada combination each time (wear-out finding: original plus familiar beats sameness).

### 1. Said → Written (the whole product in one pair)

- **Job:** show the idea in two seconds. Dramatic truth (W2): it cleans, it never rewrites.
- **Hook formula:** `Keep the <word you'd keep>. Lose the <filler>.` / `Your <people/numbers/languages> keep their <thing>.` A short promise; the image is the proof (W5).
- **Skeleton:** type-led feed post. `SAID` label, Caveat line with ink proof marks, `WRITTEN` label, the serif line large with the full stop, headline and mark at the foot. One combination per post, rotating primary → night → desk.
- **Research:** `type-led` composition (pop-out, first-glance), handwriting `human-presence` vs `credibility-cost`.
- **Feed rhythm:** one a week; each post uses a new real-life sentence in the audience's own mix of languages.

### 2. Same words, your tone (play)

- **Job:** a reason to share. Proof straight from the product: the eight tones the site shows for "hey can u send the file tonight its kinda urgent".
- **Hook formula:** `One rough message. <N> ways to send it.` then one tone per beat, ending on the CTA.
- **Skeleton:** carousel. Slide 1 is the hook (single focal: the rough message), slides 2–5 are a grid of two tones each (grid-of-n), slide 6 is the CTA (stacked). One ink thread runs across every slide edge so the set reads as one story. Motion cut: the tone-shifter story.
- **Research:** carousel `grid-of-n` (grouping, scan-patterns); `joy-surprise` in video.json (surprise and rising joy keep viewers: Shakespeare and Noir are the surprise).

### 3. Where it lands (the customer's moments)

- **Job:** put the customer in a real moment and show the words landing where they were going: a reply to family with full hands, a prompt to an AI chat, a change in a code editor, a note to work.
- **Hook formula:** `<Situation that makes typing impossible or tiresome>. <Who still gets the message>.` (S1: the customer is the hero; S7: the success).
- **Skeleton:** the moment's UI drawn in the style (cut-paper bubbles and boxes with rounded corners, plain ink, no third-party logos), one said note above it, the clean text inside it.
- **Research:** `single-focal` (centre-bias), `split` and `full-bleed-band` compositions; `picture-superiority` (the picture carries the idea); MAYA (a familiar interface with one surprise: it was spoken).

### 4. Kept (trust and proof)

- **Job:** answer the fear that a machine will change your words or keep your voice. Facts only: names and amounts stay, two languages stay two, audio is deleted once it is written and not stored by default, 800 words a month are free, it needs a connection.
- **Hook formula:** `Your <voice/words/names>, <what happens to them>.`
- **Skeleton:** long-copy or poster: the typed sentence with ink proof marks pointing at what stayed, then plain facts in the sans, dark on light where the copy is longer (O8).
- **Research:** `credibility-cost` (proof in machine type; the hand only points), `long-copy` composition (picture-captures, line-length), O5 (specifics).

### 5. Your language (Hinglish native, 22 Indian languages)

- **Job:** the audience's identity. You never switch languages to type.
- **Hook formula:** `Speak <both/your language>. Send <both/your language>.` / `You think in <language>. Why type in <other>?`
- **Skeleton:** stories with a poll or question sticker (community and owned audience, P4), and the said/written pair in mixed-language sentences.
- **Research:** `stacked` composition in the story safe area (touch-centre), `familiar-hand` (plain Caveat letterforms), `preference-varies` (the audience's own mix of languages, never translated).

## How each series uses the guide

| Need | Where it comes from |
|---|---|
| Composition per format | `foundations/layout/layout.json` → `composition`; slots from `templates/layouts/layouts.json` (post-4x5-single-focal, carousel-grid-of-4, story-stacked, hero-split, thumbnail-split, banner-strip, poster-single-focal, print-ad-long-copy) |
| Safe areas | `layout.json` → `safeAreas` (story: top 14%, bottom 35%, sides 6%; thumbnail: bottom-right stamp; posts: 6.3% sides) |
| Colour | One Wada combination per piece (126 dark, 232 dark, 190 dark, 151 light), ink and paper; the mark's own colours only inside the mark |
| Type | Instrument pairing, three sizes per piece, sentence case; Caveat for the one said note |
| Art | `dist/tailzu/web/js/illustration.mjs` primitives (`inkLine`, `blob`, `paperPolygon`, `roundedPolygon`) |
| Motion | `approaches/humanist-minimal/motion.json` springs and `foundations/video/video.json` (one mover, reading holds, still end frame, reduced motion) |
| Copy | `npm run check:copy -- products/tailzu` |

## Calendar for the launch fortnight (suggested)

| Day | Pillar | Piece |
|---|---|---|
| 1 | Said → Written | `social/sw-1-haan.svg` + `motion/said-to-written.svg` as a reel |
| 2 | Your language | `social/story-poll.svg` |
| 3 | Tone | `social/tones-1.svg` … `tones-6.svg` (carousel) |
| 4 | Moments | `social/moment-mummy.svg` |
| 5 | Kept | `social/linkedin-kept.svg` |
| 6 | Tone | `motion/tone-shifter.svg` (story) |
| 8 | Said → Written | `social/sw-2-names.svg` |
| 9 | Moments | `social/moment-prompt.svg` |
| 10 | Your language | `social/story-question.svg` (collect the messages people put off; they become the next said/written posts) |
| 11 | Moments | `social/moment-code.svg` |
| 12 | Said → Written | `social/sw-3-both.svg` |
| Always on | — | `web/hero.svg`, `web/banner.svg`, `web/thumbnail.svg`, `print/poster-voice-leaves.svg` |

## What we measure (O10, P5)

Saves and shares on the carousel and the said/written posts (do people send them to someone who types slowly?), poll and question replies (the next posts' sentences come from them, with permission), and downloads from the hero and banner. Test two headlines per series: the first-choice line against the runner-up in the brief.
