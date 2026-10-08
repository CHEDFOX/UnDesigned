# Creative brief

**Campaign:** Launch (round 2): hand in, type out
**Date / deadline:** to confirm with the owner
**Owner:** Tailzu (Xooteq Lab Private Limited)

**Status:** for approval. `brand.json` → `color.status` stays `"placeholder"` until the owner agrees the palettes. Round 1 was rejected ("copied the site stuff ... all just the solid things ... I don't see the guide implemented"); this round starts from the brand's core (`products/tailzu/identity.json`) and the content strategy (`strategy.md`), and uses the whole guide: seven compositions, four Wada combinations, a carousel that tells one story, UI moments, stories with sticker zones, and two motion pieces timed by `video.json`.

Every fact comes from the brand's own site and repo. Example sentences are either the site's (the tone lines, "Transfer 2500 rupees to Ramesh tomorrow") or new everyday sentences that only show cleaning (fillers out, punctuation and capitals in), which the site states as fact. No numbers, users, reviews or prices beyond the site.

## 0. Choices (one line each)

| Choice | Pick | Why |
|---|---|---|
| Core | `identity.json` | Belief: the way you talk is already good enough to send. Tension: people think in speech but are made to perform in type. Truth: it cleans, it never rewrites. |
| Style | Humanist Minimal (evidence 12/14) | Its method is the brand's own: the hand lives in the ink line and one short note; the type stays calm. Site README: "Hand in, type out: that contrast is the product." |
| primary | Wada 126 dark: Deep Lyons Blue ground, Ivory Buff text 6.61:1, Yellow Ocher accent 5.02:1 | og.png in Wada's colours: indigo night, cream words, one amber full stop. |
| night | Wada 232 dark: Deep Indigo ground, Pinkish Cinnamon text 10.1:1, Carmine accent | The deepest indigo in the book (nearest og.png's #17163F), with the site's rose as the one accent. Style-recommended. |
| desk | Wada 190 dark: Black ground, Ivory Buff 12.75:1, English Red accent 5.22:1 | The app's own near-black with the mark's cream line and copper tail; for desktop and code. |
| paper | Wada 151 light: Sulpher Yellow ground, Vandar Poel's Blue 7.51:1, Yellow Orange accent | The site's paper and butter sections with its saffron; long copy dark on light (O8). |
| Type | `instrument` (Instrument Serif, Instrument Sans, IBM Plex Mono), rated core | Two of three faces are the site's own; the serif is the pairing's nearest to Newsreader. |
| Hand | Caveat (the site's speech face), one note of 6 words or fewer per piece | Hand type = a person was there (`handwriting.json` → human-presence); machine type = clear and credible (fluency-cost, credibility-cost). So: said = hand, written = type, numbers never in the hand. |
| Ink line | Wada Black on light grounds; the combination's ink (Ivory Buff, Pinkish Cinnamon) on dark grounds | A black line disappears on the brand's dark grounds; the site and og.png draw in cream on dark. Deviation from scorecard item 4, noted in the scores. |
| Mark | `assets/logos/tailzu-mark.svg`, inlined unchanged | On dark: the inner mark as the site's header and og.png use it. On light: the full app tile (favicon.svg as is). Name beside it in Instrument Sans 600 (the site has no wordmark). |

## 1. Research (O1)

- **What it is:** a voice keyboard for iPhone, Android, Windows and Mac. You talk in Hindi, Hinglish, any of 22 Indian languages, English or 23 more; clean text lands where your cursor is. Filler goes, punctuation comes in, names and amounts stay. Mixed languages stay mixed; native script or English letters. Eight tones. Desktop: tap Ctrl twice, talk, text is pasted at the cursor. Audio deleted once written, not stored by default. 800 words a month free. Needs a connection.
- **What customers say:** none collected yet (open question). The question-sticker story starts collecting real sentences.
- **What competitors say:** dictation and translation. We never say "translate", "magic" or "AI-powered" (messaging.json → avoidWords).

## 2. Audience (P2, S2)

- **The one person:** someone who thinks in Hinglish, writing to family, a manager, an AI chat and a code editor in the same afternoon, usually with a phone in one hand and something else in the other.
- **What they want:** to get the message out as fast as they can say it, in their own words.

## 3. Problem (S3)

- **External:** typing Hinglish or an Indian script by thumb is slow; dictation types every "um".
- **Internal:** typing makes you perform: stiffer or sloppier than you are, or you put the message off.
- **Philosophical:** your words should arrive the way you meant them, in the language you actually speak.

## 4. The one thing (W1)

> Say it the way it comes; Tailzu sends it clean, still in your words.

## 5. Dramatic truth and proof (W2, O5, S4)

- **Truth:** it cleans, it never rewrites. Names and amounts stay; two languages stay two.
- **Proof:** the site's own examples ("Transfer 2500 rupees to Ramesh tomorrow."; the eight tone lines), 22 Indian languages, every app (it is a keyboard), audio deleted once written, 800 free words a month.

## 6. Big idea (O2, W8)

> Hand in, type out: every piece shows your words twice, once as you said them (your hand, with an editor's proof marks striking the "um") and once as Tailzu writes them (calm type), and the full stop lands last.

The full stop is a cut-paper dot in the palette's accent: the og.png amber full stop, made the one accent object of the style. Kept words are underlined in ink, never coloured (the site's rule). A looping thread of ink (talk) settles into a straight line (text).

## 7. Call to action (S6)

- **Direct:** Get Tailzu free.
- **Transitional:** Try 800 words a month, free.
- **Long term (P4):** story poll and question replies become the next said/written posts (with permission).

## 8. Stakes and success (S7)

- **If they do nothing:** the message waits until both hands are free, or goes out in rough text, or in an English they don't think in.
- **After they act:** they say it once, the way it comes, and it lands clean in WhatsApp, mail, a chat box or their editor.

## 9. Pieces

Every piece: SVG with viewBox, width and height; every class and keyframe prefixed `tz2-<piece>-`; fonts by @import in their own style element; no images; all under 30 KB. Colours: the piece's Wada combination plus Wada Black and White, and the mark's own colours inside the mark only (checked by `design.mjs`). Text inside the safe areas (`layout.json` → safeAreas). PNG beside each SVG; `contact-sheet.png` shows them all.

| # | File | Format, size | Pillar | One-line idea | Composition (layout.json) | Research finding | Palette | Copy |
|---|---|---|---|---|---|---|---|---|
| 1 | `social/sw-1-haan.svg` | instagram-post 1080×1350 | Said → Written | "haan um kal subah milte hain" in the hand, the "um" struck out with a delete mark, then "Haan, kal subah milte hain." in type with the full stop. Headline: Keep the haan. Lose the um. | type-led | pop-out (the written line differs in size and isolation); handwriting human-presence vs credibility-cost | primary 126 | `said-written.copy.json` #1 |
| 2 | `social/sw-2-names.svg` | 1080×1350 | Kept | "uh ramesh ko bata do" → "Ramesh ko bata do.", Ramesh capitalised by a proof mark and underlined in ink as kept. Headline: Your people keep their names. | type-led | credibility-cost (the name lands in type); repetition (same skeleton as #1) | night 232 | #2 |
| 3 | `social/sw-3-both.svg` | 1080×1350 | Your language | "so mummy ko call karna hai" → "Mummy ko call karna hai.": the Hinglish stays. Headline: Speak both. Send both. | type-led | wear-out (same frame, new idea and combination); familiar-hand | desk 190 | #3 |
| 4–9 | `social/tones-1…6.svg` | carousel-slide 1080×1350 ×6 | Tone | One story: the rough message (slide 1), two tones per slide in rising surprise (plain → work → theatre → drama), CTA. One ink thread crosses every slide edge at the same height and ends as the full stop of the last headline. | 1: single-focal; 2–5: grid-of-n; 6: stacked | grouping, scan-patterns; centre-bias; joy-surprise (video.json) for the order | paper 151 | `tones-carousel.copy.json` |
| 10 | `social/moment-mummy.svg` | instagram-post 1080×1080 | Moments | A drawn chat: Mummy asks "Pahunch gaye?"; the said note loops down into a clean reply bubble. Headline: Hands full. Mummy still gets her reply. | single-focal | centre-bias, picture-superiority, MAYA (a familiar chat, the surprise is it was spoken) | primary 126 | `moments.copy.json` #1 |
| 11 | `social/moment-prompt.svg` | 1080×1350 | Moments | A ramble ("so basically um like…") loops into an AI chat box as a clean prompt; the send button is the one accent. No third-party logo. | full-bleed-band | picture-captures, grouping (band ties headline, brand, CTA) | night 232 | #2 |
| 12 | `social/moment-code.svg` | 1080×1350 | Moments | A hand-drawn editor (`upload.ts`): the said note's thread comes in level to line 3, where "// Add a retry here" sits at the copper caret. Ctrl-twice fact below. | split (image top, words below) | picture-captures, left-lean; credibility-cost (code in mono) | desk 190 | #3 |
| 13 | `social/linkedin-kept.svg` | 1080×1350 | Kept | The site's own sentence on paper, "2500 rupees" and "Ramesh" underlined; a hand note points at them ("kept, exactly as you said"); headline, then the facts in plain sans. | long-copy (Ogilvy) | credibility-cost (the hand points, it is never the number); line-length; O8 dark on light | paper 151 | `linkedin-kept.copy.json` |
| 14 | `social/story-poll.svg` | story 1080×1920 | Your language | "You think in Hinglish. Why type in English?" + poll sticker zone + "be honest" note + CTA; the thread settles into a line in the lower overlay zone. | stacked | touch-centre, centre-bias | night 232 | `stories.copy.json` #1 |
| 15 | `social/story-question.svg` | story 1080×1920 | Moments / community | "Which message do you keep putting off typing?" A paper bubble stuck on "typing…" (one dot in saffron); question sticker zone; CTA. | stacked | touch-centre; handmade | paper 151 | #2 |
| 16 | `web/hero.svg` | landing-hero 1920×1080 | Said → Written | Words left; on the right, the site's river in this style: threads of ink from the top and bottom edges run level into the first letter of "Kal subah milte hain." | split | left-lean, banner-blindness (reads as content), first-glance | primary 126 | `web.copy.json` #1 |
| 17 | `web/banner.svg` | web-banner 970×250 | Your language | Mark, "Talk in Hinglish. Send it clean." with the full stop, a small loop of talk, one button. | split (strip) | banner-blindness: one headline, one brand, one button | night 232 | #2 |
| 18 | `web/thumbnail.svg` | thumbnail 1280×720 | Said → Written | "Hinglish, without the typing." left; a paper speech bubble with a struck-out "um" right; bottom-right stamp zone kept clear. | split | pop-out, first-glance; thumbnail safe zone | primary 126 | #3 |
| 19 | `print/poster-voice-leaves.svg` | poster 1414×2000 (A-series) | Kept | A paper slip "YOUR WORDS: Kal subah milte hain." stays; a looping thread ("YOUR AUDIO") rises off it and out through the top edge. Headline: Your voice leaves. Your words stay. | single-focal (anchored) | centre-bias, pop-out; art.json line.crossing (the ink leaves the paper) | primary 126 | `poster.copy.json` |
| 20 | `motion/said-to-written.svg` | instagram-post / reel 1080×1350, 11.1 s | Said → Written | The hand writes the said line, holds, the delete mark and capital mark draw on, the thread draws, WRITTEN, the type rises, the full stop pops in last, then the headline. | type-led (animated) | video.json: one-mover, on-screen-reading, end-still, reduced motion; motion.json springs | primary 126 | `motion.copy.json` #1 |
| 21 | `motion/tone-shifter.svg` | story 1080×1920, 24.8 s | Tone | The rough message holds; tone chips rise; a carmine marker hops Neutral → Shakespeare → Noir, each line rising and holding for its reading time; the headline and CTA end on a still. | stacked (animated) | joy-surprise (plain → Shakespeare → Noir), on-screen-reading, one-mover, end-still | night 232 | #2 |

Compositions used: type-led, single-focal, grid-of-n, stacked, split, full-bleed-band, long-copy (7). Combinations used: 126, 232, 190, 151.

### Sticker zones (stories)

Kept empty in the artwork, inside the story safe area (top 14%, bottom 35%, sides 6%). Review copies with the zone marked: `social/story-*.guides.png`.

| Story | Sticker | Zone (px, 1080×1920) | Options / prompt |
|---|---|---|---|
| `story-poll` | Poll | x 86–994, y 830–1020 | "I type it" / "I'd say it" |
| `story-question` | Question | x 86–994, y 908–1128 | "Your message" (placeholder in the app) |

### Motion (storyboard, video.json)

Both are one-shot CSS keyframe timelines on one shared duration. The un-animated state of every element is the final frame, so `prefers-reduced-motion`, a thumbnail or a player without CSS shows the finished poster (verified with Chromium in reduced-motion mode: no running animations, final frame shown). Nothing flashes; the ground never changes; one thing moves at a time; nothing loops; both stop well within the piece (pause rule: they end on a still). Frames: `motion/*.frame-1…5.png`.

**said-to-written (11.1 s)** — hold the opening frame (SAID label and brand already there: brand early, video.json zap-dispersion) 0.6 s → the said line is written left to right at handwriting speed (1.7 s) → hold for reading (6 words: 2.75 s) → delete mark and capital marks draw on (500 ms each, draw easing) → the thread draws (900 ms) → WRITTEN label rises → the written line rises (gentle spring) → the full stop pops (lively spring) → headline rises and holds ≥ 2.75 s. Sound: none needed (works sound-off); for a reel, a single soft room-tone and the speaker's own voice saying the line would fit; captions = the written line.

**tone-shifter (24.8 s)** — first frame is the hook: the rough message (brand top-left). Chips rise at 3.4 s → marker hops (soft spring, 450 ms) → each tone line rises (gentle spring) and holds max(1.5 s, 0.375 s × words + 0.5 s) → exits (exit easing, 250 ms) before the next one moves → Noir stays → headline rises → CTA rises → final hold. Cut: 30 s story.

## 10. Headlines (W3)

1. **Keep the haan. Lose the um.** (chosen: said/written, motion)
2. **Your people keep their names.** (chosen)
3. **Speak both. Send both.** (chosen)
4. **Hands full. Mummy still gets her reply.** (chosen)
5. **Think out loud. The prompt comes out clean.** (chosen)
6. **Say the fix. It lands at your cursor.** (chosen)
7. **Your words, minus the ums. Nothing else changes.** (chosen, LinkedIn)
8. **Your voice leaves. Your words stay.** (chosen, poster)
9. **Say it the way it comes. Send it clean.** (chosen, hero)
10. **One rough message. Eight ways to send it.** (chosen, carousel)
11. **Choose your tone once. Then just talk.**
12. **You think in Hinglish. Why type in English?**
13. **Which message do you keep putting off typing?**
14. Hinglish, without the typing.
15. Same message. Your mood.
16. Talk in Hinglish. Send it clean.
17. Half a thought in, a whole message out.
18. Your thumbs were never the point.
19. Every name kept. Every um gone.
20. Say it once, the way it comes.
21. The message you'd say in ten seconds, sent in ten seconds.
22. Talk to your manager like you talk. Send it like you mean it.

Test (O10): #1 vs #19 on the said/written series; #9 vs #20 on the hero.

## 11. Check before sign-off

- [x] Passes the grunt test: what we offer, how it helps, what to do next (S8)
- [x] One message only (W1): say it your way, it lands clean in your words
- [x] Customer is the hero, "you" more than "we" (S1); `check:copy` clean
- [x] Brand mark beside every headline (O4)
- [x] Words and image add to each other (W5): headlines promise, the said/written pair proves
- [x] Still makes sense in five years (P3): no slang, no dated references
- [x] `npm run check:copy -- products/tailzu`: 0 errors, 0 warnings
- [x] Colours from the brand palettes; long copy dark on light (O8: LinkedIn on 151 light; dark pieces keep body under 25 words)

## 12. How we'll measure it (O10, P5)

- **Success metric:** saves and shares on the carousel and said/written posts; poll votes and question replies; downloads from hero and banner.
- **What we'll test:** the headline pairs above; primary (126) vs night (232) on the same said/written post.
- **Evergreen version after launch:** the said/written series continues weekly with sentences from the question sticker (with permission).

## 13. Scores (Humanist Minimal scorecard, research.md §6; 0–2 each, 20 max, 16 = ready)

Criteria: 1 one thing in 2 s · 2 one strong symbol · 3 ≥40% empty, one focal · 4 ink line black, even, wobble, round ends · 5 organic shapes, rounded corners · 6 one combination, accent on one object · 7 pairing, sentence case, ≤3 sizes · 8 headline weight near the line · 9 motion (stills score 2 when n/a) · 10 warm, not cute.

| Piece | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|
| sw-1-haan | 2 | 2 | 2 | 1 | 1 | 2 | 2 | 1 | 2 | 2 | 17 |
| sw-2-names | 2 | 2 | 2 | 1 | 1 | 2 | 2 | 1 | 2 | 2 | 17 |
| sw-3-both | 2 | 2 | 2 | 1 | 1 | 2 | 1 | 1 | 2 | 2 | 16 |
| tones carousel | 2 | 2 | 1 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | 18 |
| moment-mummy | 2 | 2 | 2 | 1 | 2 | 2 | 1 | 1 | 2 | 2 | 17 |
| moment-prompt | 2 | 2 | 1 | 1 | 2 | 2 | 2 | 1 | 2 | 2 | 17 |
| moment-code | 2 | 2 | 1 | 1 | 2 | 2 | 1 | 1 | 2 | 2 | 16 |
| linkedin-kept | 1 | 2 | 1 | 2 | 2 | 2 | 1 | 1 | 2 | 2 | 16 |
| story-poll | 2 | 1 | 2 | 1 | 1 | 2 | 2 | 1 | 2 | 2 | 16 |
| story-question | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | 19 |
| hero | 2 | 2 | 2 | 1 | 1 | 2 | 1 | 1 | 2 | 2 | 16 |
| banner | 2 | 1 | 2 | 1 | 1 | 2 | 2 | 1 | 2 | 2 | 16 |
| thumbnail | 2 | 2 | 2 | 1 | 2 | 2 | 2 | 1 | 2 | 2 | 18 |
| poster | 2 | 2 | 2 | 1 | 2 | 2 | 2 | 1 | 2 | 2 | 18 |
| said-to-written (motion) | 2 | 2 | 2 | 1 | 1 | 2 | 2 | 1 | 2 | 2 | 17 |
| tone-shifter (motion) | 2 | 1 | 2 | 1 | 1 | 2 | 2 | 1 | 2 | 2 | 16 |

Where points are lost: item 4 on dark grounds (the line is the combination's cream, not black: a deliberate, brand-led deviation); item 8 everywhere (Instrument Serif is a light display face, finer than the marker line; the brand's own serif is light too); item 7 where a piece carries four sizes (subhead or UI text); item 3 on the denser UI and long-copy pieces.

## 14. Open questions for the owner

1. **Palettes:** approve 126 / 232 / 190 / 151 (then `color.status` → `"chosen"`)? Should the full stop always be amber (126 and 151 only), or may it take the combination's accent (carmine on 232, copper on 190) as it does now?
2. **Ink on dark grounds:** keep the cream line (brand-led) or switch dark pieces to white paper shapes with black ink only?
3. **Example sentences:** the Hinglish sentences are new everyday examples of cleaning only. Do you want real ones from users (with permission) instead? Any testimonials, user counts or ratings we may use?
4. **Third-party names:** may we name WhatsApp, ChatGPT and Cursor in captions (the site names ChatGPT and Cursor)? The artwork shows only generic UI.
5. **Typeface:** the guide has no Newsreader pairing; keep Instrument Serif, or add a Newsreader pairing to the guide (a guide change)?
6. **Devanagari:** the site falls back to Kalam for Devanagari speech. Do you want a piece in native script?
7. **Price:** Lite and Elite prices are on the site but not used. Show them anywhere?
