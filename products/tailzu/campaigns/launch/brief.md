# Creative brief

**Campaign:** Launch: Talk. It writes. (social, web, print and a story title card)
**Date / deadline:** to confirm with the user
**Owner:** Tailzu (Xooteq Lab Private Limited)

**Status:** first draft for approval. `brand.json` → `color.status` stays `"placeholder"` until the user approves the palette.

All facts come from the product's website source (tailzu.space: page copy, structured data, FAQ, README). Nothing is invented: no numbers, users, ratings, testimonials or clients.

## 0. Choices (one line each)

| Choice | Pick | Why |
|---|---|---|
| Style | Humanist Minimal (`approaches/humanist-minimal`) | The product is "hand in, type out": the site draws speech as handwriting that one set word swallows. A wobbling ink line becoming calm type is that idea in this style, which also has the best evidence (12/14) and a drawing engine. |
| Primary palette | Wada 344, light: Cinnamon Buff ground, Black ink and text (11.95:1), Deep Lyons Blue accent (6.2:1), inkUse `body` | It keeps the warm amber and near-black of the app and site, and the indigo of its link card becomes the one accent object (the mic key: "alive, right now", as amber means on the site). |
| Alt palette | Wada 343, light: Ivory Buff ground, Vandar Poel's Blue text (6.11:1), Burnt Sienna accent, inkUse `body` | The site's pale cream with an amber-brown accent; a quieter ground for the professional LinkedIn post. |
| Type | `instrument` (Instrument Serif + Instrument Sans + IBM Plex Mono), rated core | The site already sets its words in Instrument Sans and IBM Plex Mono; the calm editorial serif replaces its Newsreader. |
| Hand | Caveat, one note of six words or fewer per piece | It is the face the site uses for spoken words. Here it only carries what was said (`um… so like…`), never headlines, body, CTAs or numbers. |
| Logo | The site's mark (`assets/logos/tailzu-mark.svg`), redrawn in one colour (ink) from its own geometry, with the name in Instrument Sans 600 | The original mark's creams and ambers are outside the Wada palette, so pieces use the single-colour version. Needs the user's OK. |

## 1. Research (O1)

- What the product is and how it actually works: Tailzu is an AI voice keyboard for iPhone, Android, Windows and Mac. You talk in Hindi, Hinglish, any of India's 22 scheduled languages, English or 23 more, and clean, ready-to-send text lands in any app: filler gone, punctuation in, names, numbers and amounts kept exactly. Hinglish stays Hinglish, in the native script or English letters. On a computer: tap Ctrl twice, talk, and the text is pasted at the cursor. 800 words a month free; Lite USD 9.99 a month, Elite USD 59.99 a year (7 days free in the app). Audio is deleted once written; it needs a connection.
- What customers say about it, in their own words: none on the site yet (question for the user).
- What competitors say (and so what we must not say): ordinary dictation types every "um" and one language at a time; translators change your words. We never say "translate", "magic", "revolutionary" or "AI-powered".

## 2. Audience (P2, S2)

- The one person this is for: someone who writes messages, mails, notes and prompts all day and thinks in Hindi, Hinglish or another Indian language, typing on a phone keyboard that is slower than their mouth.
- What they want, specifically: to say a message once, roughly, and send it clean, in their own words and mix of languages.

## 3. Problem (S3)

- External: typing Hinglish or an Indian script is slow, and rough speech comes out as rough text.
- Internal: unknown; we didn't guess how it feels (question for the user).
- Philosophical: your words should arrive the way you meant them, in the language you actually speak.

## 4. The one thing (W1)

> Say it the way you talk, and Tailzu writes it clean in any app.

## 5. Dramatic truth and proof (W2, O5, S4)

- The honest fact: people talk in loops ("um so like can we push the call to four"), and Tailzu keeps every word that matters and drops only the loops. It cleans; it never rewrites.
- Proof (site facts only): 22 Indian languages, Hinglish and English, plus 23 more; keeps names, numbers and amounts; works as a keyboard in every app; Ctrl twice on Mac and Windows; 800 words a month free. The site's own said-to-written pairs are used as the typed lines.

## 6. Big idea (O2, W8)

> Tangled talk in, one clean line out: a looping ink thread (how we really speak) runs into a single keyboard key with a microphone on it, and leaves as one calm line that the clean sentence sits on.

Two plain symbols joined (art.json → metaphor): **thread** (speech, continuity) + **keyboard key** (typing). It reads in two seconds with no words, and the product is the hero: the key is the only coloured object, the moment where it happens. On the carousel, one thread runs across all four slides.

## 7. Call to action (S6)

- Direct: Download Tailzu free / Download free / Get the desktop app / Try Tailzu free
- Transitional: Say one yourself at tailzu.space (the live demo; only if it is switched on)
- What it builds long term (P4): installs and the free tier (800 words a month) as the way in.

## 8. Stakes and success (S7)

- If they do nothing: typing long Hinglish messages by thumb, or sending speech as rough text.
- After they act: say it once, rough, and a clean message lands in WhatsApp, mail or the chat box, with Hinglish still Hinglish and Ramesh still Ramesh.

## 9. Formats and deliverables

All artwork is generated by `design.mjs` (`node products/tailzu/campaigns/launch/design.mjs`, after `npm run build -- tailzu`), which also writes the PNG previews and `contact-sheet.png`.

| Format (formats.json) | Size | Layout template | Palette | Copy file | Artwork |
|---|---|---|---|---|---|
| instagram-post 4:5 | 1080 × 1350 | post-4x5-single-focal | primary 344 | `post-say-it-badly.copy.json` | `social/post-say-it-badly.svg` |
| instagram-post 4:5 | 1080 × 1350 | post-4x5-single-focal, headline on top | primary 344 | `post-ramesh.copy.json` | `social/post-ramesh.svg` |
| instagram-post 4:5 | 1080 × 1350 | post-4x5-single-focal | primary 344 | `post-hinglish.copy.json` | `social/post-hinglish.svg` |
| carousel-slide ×4 | 1080 × 1350 | post-4x5 per slide, one thread across all four | primary 344 | `carousel-talk-it-writes.copy.json` | `social/carousel-1.svg` … `carousel-4.svg` |
| story | 1080 × 1920 | story-stacked (art first) | primary 344 | `story-say-it-rough.copy.json` | `social/story-say-it-rough.svg` |
| story | 1080 × 1920 | story-stacked (art first) | primary 344 | `story-desktop.copy.json` | `social/story-desktop.svg` |
| instagram-post 1:1 (LinkedIn) | 1080 × 1080 | square-single-focal | alt 343 | `linkedin-talk-to-the-machine.copy.json` | `social/linkedin-talk-to-the-machine.svg` |
| web-banner | 970 × 250 | banner-strip | primary 344 | `banner-say-it-rough.copy.json` | `web/banner-say-it-rough.svg` |
| thumbnail | 1280 × 720 | thumbnail-split | primary 344 | `thumbnail-talk-it-writes.copy.json` | `web/thumbnail-talk-it-writes.svg` |
| landing-hero | 1440 × 810 | hero-split | primary 344 | `landing-hero.copy.json` | `web/landing-hero.svg` |
| poster | A3/A2 (1000 × 1414) | poster-single-focal | primary 344 | `poster-talk-it-writes.copy.json` | `print/poster-talk-it-writes.svg` |
| story title card (video) | 1080 × 1920, 7 s | templates/video/title-card.mjs | primary 344 | `story-title-card.copy.json` | `video/story-title-card.svg`, storyboard `video/storyboard.md` |

Text stays inside the grid margins (8%) and, on stories, inside the live area (top 14%, bottom 35%, sides 6%); only the ink thread runs into the overlay zones or off the edge. `design.mjs` checks every text box against the safe area, against other text and against the art, and checks every hex against the palette; the last run reports no problems.

## 10. Headlines (W3)

1. **Say it badly. Send it perfect.** (the site's link-card line; post 1)
2. **Talk. It writes.** (the site's line; carousel, thumbnail, poster, hero, title card)
3. **Ramesh stays Ramesh. 2500 stays 2500.** (post 2)
4. **Hinglish in. Hinglish out.** (post 3)
5. **Say it rough. Send it clean.** (story 1, banner)
6. **Touch Ctrl. Take control.** (the site's line; desktop story)
7. **Talk to the machine.** (the site's line; LinkedIn)
8. It cleans. It never rewrites.
9. Two languages stay two.
10. Your words, spelled the way you type.
11. Speak in loops. Send a straight line.
12. 22 Indian languages, one keyboard.
13. Talk in every app you type in.
14. Mix your languages. Keep the mix.
15. Say it once. It's written.
16. Your voice, minus the ums.
17. Talk to your editor.
18. Free to start. 800 words a month.
19. Speak Hindi. Send Hindi.
20. Less thumb, more talk.

Test 1 against 5 (O10): the same post layout, two headlines.

## 11. Check before sign-off

- [x] Passes the grunt test: a voice keyboard, clean text in any app, download free (S8)
- [x] One message only (W1); every piece is a proof of it (ums, names and amounts, Hinglish, AI chats, desktop)
- [x] Customer is the hero, "you" more than "we" (S1)
- [x] Brand mark and name directly under or beside the headline (O4)
- [x] Words and image add to each other (W5): the picture shows the mess and the clean line; the headline makes the promise
- [x] Still makes sense in five years (P3)
- [x] `npm run check:copy -- products/tailzu`: 12 files, 0 errors, 0 warnings (TIPs about numbers on some pieces; their typed lines carry the specifics)
- [x] Colours from palettes 344 and 343 plus Wada Black and White only; dark text on light grounds (O8)

### Scorecard (approaches/humanist-minimal/research.md §6; 16 of 20 is ready)

| Piece | 1 one thing | 2 two symbols | 3 space | 4 line | 5 shapes | 6 colour | 7 type | 8 weight | 9 motion | 10 warm | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|
| post-say-it-badly | 2 | 2 | 2 (76%) | 2 | 2 | 2 | 2 | 1 | 2 (still) | 2 | 19 |
| post-ramesh | 2 | 2 | 2 (72%) | 2 | 2 | 2 | 2 | 1 | 2 (still) | 2 | 19 |
| post-hinglish | 2 | 2 | 2 (64%) | 2 | 2 | 2 | 2 | 1 | 2 (still) | 2 | 19 |
| carousel 1-4 | 2 | 2 | 2 (76-88%) | 2 | 2 | 2 | 1 (mono labels make a 4th size) | 1 | 2 (still) | 2 | 18 |
| story-say-it-rough | 2 | 2 | 2 (81%) | 2 | 2 | 2 | 2 | 1 | 2 (still) | 2 | 19 |
| story-desktop | 2 | 2 | 2 (79%) | 2 | 2 | 2 (accent on the second key only) | 1 (key labels in the mono) | 1 | 2 (still) | 2 | 18 |
| linkedin (343) | 2 | 2 | 2 (77%) | 2 | 2 | 2 | 2 | 1 | 2 (still) | 2 | 19 |
| banner | 2 | 2 | 2 (79%) | 2 | 2 | 2 | 2 | 1 | 2 (still) | 2 | 19 |
| thumbnail | 2 | 2 | 2 (72%) | 2 | 2 | 2 | 2 | 1 | 2 (still) | 2 | 19 |
| landing-hero | 2 | 2 | 2 (77%) | 2 | 2 | 2 | 2 | 1 | 2 (still) | 2 | 19 |
| poster | 2 | 2 | 2 (74%) | 2 | 2 | 2 | 2 | 1 | 2 (still) | 2 | 19 |
| story title card | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | 19 |

Item 8 scores 1 everywhere: Instrument Serif comes in one light weight, so its stems are thinner than the 2.25% marker line. If that matters more than keeping the site's editorial serif, switch to `bricolage-figtree` (also rated core), whose heavier display weights match the line. The hand note adds a size of its own on pieces that have one; it is treated as part of the art.

## 12. How we'll measure it (O10, P5)

- Success metric: installs from each piece (store links with campaign tags) and free-tier sign-ups.
- What we'll test: "Say it badly. Send it perfect." against "Say it rough. Send it clean." on the same post layout.
- Evergreen version after launch: the poster and landing hero ("Talk. It writes."), refreshed with new said-to-written pairs from the site.

## Open questions for the user

1. Approve palette 344 (with 343 for LinkedIn), the instrument pairing, Caveat for the notes, and the one-colour mark? Then set `color.status` to `"chosen"`.
2. Is this a launch (new product, a date), or a campaign for an existing app? If new, give the date so we can say so (O6).
3. Any real reviews, store ratings, user numbers or named customers we may quote (S4)? None are used now.
4. How does the problem feel to your users (internal problem, S3) and how do you say "we understand" (guide empathy)? Both are empty in `messaging.json`.
5. Which prices are shown in India (the site's structured data gives USD 9.99 a month and USD 59.99 a year)? Pieces only say "800 words a month, free".
6. Is the live mic demo on (for "Say one yourself at tailzu.space")?
7. Should we design Hindi-script versions? That needs a Devanagari face (Kalam, as on the site, or a Devanagari pairing), which the guide's pairings don't cover yet.
