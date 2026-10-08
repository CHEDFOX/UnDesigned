# Messaging playbook

The words side of the UnDesigned system, built from four books. Each one has a job in the process:

| Book | Author | Job in our process |
|---|---|---|
| *Perennial Seller* (2017) | Ryan Holiday | **Strategy.** Know who it's for and what it does. Build for the long term. |
| *Building a StoryBrand* (2017) | Donald Miller | **Message.** The customer is the hero, we are the guide. Be clear in seconds. |
| *Hey, Whipple, Squeeze This* (1998) | Luke Sullivan | **Creative.** One simple, true idea. Show it, don't explain it. No cliches. |
| *Ogilvy on Advertising* (1983) | David Ogilvy | **Proof and craft.** Research, a big idea, benefit headlines, specific facts, readable layouts. |

The rules below paraphrase the books. Each has an id (P = Perennial, S = StoryBrand, O = Ogilvy, W = Whipple). The copy checker cites them, and you can use them in feedback: "fails W1, two messages".

## Folder

```
foundations/messaging/
├── source/principles.json   the 33 rules, grouped by book and by stage
├── source/formats.json      word limits for 12 formats in 4 groups
├── source/cliches.json      cliches, dated slang, weak calls to action
├── lint.mjs                 the copy checker (works in Node and the browser)
├── context.mjs              loads sources and config
├── build.mjs                builds dist/ files
└── examples/                one passing and one failing piece of copy
config/messaging.json        YOUR brand message: positioning, one-liner, BrandScript, voice, proof
templates/briefs/            creative brief template
```

## The process

Every campaign goes through these six stages in order. The questions come from `principles.json`.

| Stage | Question | Main rules |
|---|---|---|
| 1. Strategy | Who is this for, and what does it do for them? | P1, P2, O1, O11 |
| 2. Message | What story do we tell, with the customer as the hero? | S1–S5, S7, S9 |
| 3. Big idea | What single, simple idea will make people stop? | O2, W1, W2, W3, W8 |
| 4. Copy | Do the words sell clearly, specifically and briefly? | O3–O7, S6, S8, W4, W6, W7 |
| 5. Layout | Can people read it, fast? | O8, O9, W5 |
| 6. Launch and test | How will we learn what works and keep it working? | P4, P5, O10 |

Stages 1 and 2 are done once for the brand, in `config/messaging.json`, and refreshed when the business changes. Stages 3 to 6 happen for every campaign, using the [creative brief](../../templates/briefs/creative-brief.md).

## Rules by book

### Perennial Seller: strategy

- **P1** Define the work in one sentence, one paragraph and one page before writing any marketing.
- **P2** Name exactly who it is for. Something for everyone is for no one.
- **P3** Aim for timeless over trendy. Avoid slang and references that date the work. *(checked)*
- **P4** Build a platform you own (email list, community, site), so every campaign grows a lasting audience.
- **P5** Marketing is never finished. Keep promoting work that sells; word of mouth compounds.

### Building a StoryBrand: message

- **S1** The customer is the hero; the brand is the guide. Say "you" more than "we". *(checked)*
- **S2** Lead with one clear, specific thing the customer wants.
- **S3** Name the problem on three levels: external, internal (how it feels) and philosophical (why it's wrong). People buy solutions to internal problems.
- **S4** Show you're the right guide: empathy ("we understand") plus authority (results, testimonials, numbers).
- **S5** Give a simple plan of about three steps.
- **S6** Always call to action: a direct one (buy, book) and a transitional one (download, join). *(checked)*
- **S7** Show the stakes (what failure costs) and paint the success.
- **S8** Pass the grunt test: in seconds, people know what you offer, how it helps and what to do next.
- **S9** Have a one-liner: problem, solution, result.

The seven parts, in order: **a character** who wants something **has a problem** and **meets a guide** who **gives them a plan** and **calls them to action**, which helps them **avoid failure** and **ends in success**.

### Hey, Whipple, Squeeze This: creative

- **W1** Say one thing. A single-minded message beats a list of benefits.
- **W2** Find the dramatic truth: the honest fact about the product that makes it matter.
- **W3** Write many headlines (20 or more), then choose. First ideas are everyone's first ideas.
- **W4** Cut cliches. If a competitor could sign the line, it isn't good enough. *(checked)*
- **W5** Words and picture work together. Don't say what the image already shows.
- **W6** Posters and outdoor are read in seconds: one idea, one image, very few words. *(checked: word limits)*
- **W7** Never be boring and never shout. No exclamation marks in headlines. *(checked)*
- **W8** Make the product the hero of the idea, so people remember the brand and not just the joke.

### Ogilvy on Advertising: proof and craft

- **O1** Do your homework: product, customer, competition.
- **O2** Without a big idea, a campaign passes unnoticed.
- **O3** The headline does most of the work. Make it promise a benefit. *(checked: required)*
- **O4** Put the brand name in the headline, or the logo right beside it. *(checked)*
- **O5** Be specific. Facts and numbers persuade; superlatives don't. *(checked: tip)*
- **O6** News sells. If something is new, say so.
- **O7** Short sentences, short paragraphs, plain words. *(checked: body sentences over 25 words)*
- **O8** Make it easy to read: no long passages in all capitals or in light-on-dark type, no tiny type. *(checked)*
- **O9** Photographs outsell drawings, and captions are widely read. Caption every image in long layouts.
- **O10** Test headlines, offers and images. Repeat what works.
- **O11** Every piece builds the brand image. Keep one consistent personality.

## Copy limits by format

From `source/formats.json`. The numbers are the most words allowed in each part (0 = leave it out).

| Group | Format | Headline | Subhead | Body | CTA |
|---|---|---|---|---|---|
| Outdoor and posters | Billboard | 7 | 0 | 0 | 4 |
| | Poster | 10 | 18 | 40 | 6 |
| | Event poster | 8 | 15 | 30 | 6 |
| Social | Instagram / LinkedIn post | 8 | 12 | 25 | 5 |
| | Story / Reel cover | 8 | 10 | 15 | 4 |
| | Carousel slide | 10 | 15 | 40 | 5 |
| | YouTube thumbnail | 5 | 0 | 0 | 0 |
| Web and email | Display banner | 6 | 8 | 0 | 3 |
| | Website hero | 10 | 25 | 50 | 4 |
| | Email header | 9 | 15 | 80 | 4 |
| Print | Flyer | 12 | 20 | 150 | 8 |
| | Long-copy print ad | 16 | 25 | 600 | 10 |

These are rules of thumb. Change them in `formats.json` if a format needs more room.

## Checking copy

Write the copy for each piece in a `.copy.json` file next to its template:

```json
{
  "format": "poster",
  "headline": "Your launch poster, ready in 48 hours",
  "subhead": "Pick a palette, send your words, get print-ready files.",
  "body": "Three steps. One flat price of $90. Unlimited small changes until you love it.",
  "cta": "Book your slot online",
  "logo": true,
  "palette": "primary"
}
```

- `logo: true` means the layout shows the logo (this satisfies O4).
- `palette` is a brand palette name or `{ "combination": 42, "mode": "dark" }`. It's used to warn about long copy on a dark background (O8).
- A file can also hold a list of pieces, e.g. every slide of a carousel.

```sh
npm run check:copy                 # every *.copy.json under templates/
npm run check:copy -- my.copy.json # one file
npm run check:copy:examples        # see the checker on a good and a bad example
```

Results are **ERROR** (breaks a hard rule, exit code 1), **WARN** (should fix) or **TIP** (worth considering). Each one cites its rule and book.

The checker catches mechanical problems. It can't judge whether the idea is good (W1, W2, O2); that's what the brief and a second pair of eyes are for.

## Using it in code

```js
import { check, formats, principles, message } from './dist/web/js/messaging.mjs';

check({ format: 'story', headline: 'Ready in 48 hours', cta: 'Book now' });
// [{ level: 'warn', check: 'brand-name', principle: 'O4', message: '...' }, ...]
formats.poster.limits.headline;   // 10
principles.W1.rule;               // 'Say one thing. ...'
message.oneLiner;                 // from config/messaging.json
```

## Generated files

| File | Contents |
|---|---|
| `dist/brand-guide/message-sheet.md` | Your filled-in message on one page, for the team and freelancers |
| `dist/web/js/messaging.mjs` | Formats, rules, your message and `check()` for templates and tools |
| `dist/tokens/messaging.json` | Everything as JSON |
