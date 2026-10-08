# Research: what the brain likes

Evidence from empirical aesthetics that every approach builds on. The data is in [visual-preference.json](visual-preference.json); the hub shows it with live demos on the **Brain research** tab.

## Findings

| Finding | Strength | Design rule | Source |
|---|---|---|---|
| Curves over sharp angles | Strong | Default to organic shapes and rounded corners | Bar & Neta 2006; meta-analysis Chuquichambi et al. 2022 (g = 0.39) |
| Low visual complexity | Strong | One focal point, few elements, space | Tuch et al. 2012 (judged within 17–50 ms) |
| Easy to process feels good | Strong | Contrast, clear silhouettes, symmetry, familiar structure | Reber, Schwarz & Winkielman 2004 |
| The 50 ms first impression | Strong | Silhouette, colour and focal point must work before reading | Lindgaard et al. 2006 |
| Familiar, with a twist (MAYA) | Moderate | Recognisable format, surprise in one place | Hekkert, Snelders & van Wieringen 2003 |
| Nature's mid-range complexity | Moderate | Organic detail moderately rough (fractal D 1.3–1.5) | Spehar et al. 2003; Street et al. 2016 |
| Handmade signals care | Moderate | Visible, deliberate human marks | Fuchs, Schreier & van Osselaer 2015 |
| Handwritten type adds a person | Moderate | One short hand accent for warm, safe products; never for data, steps or prices | Schroll, Schnurr & Grewal 2018; Liu, Choi & Mattila 2019; Song & Schwarz 2008 |
| Colours borrow feelings from things | Moderate | Choose grounds by their everyday associations | Palmer & Schloss 2010 |
| Beautiful looks easier to use | Moderate | Polish raises trust in clarity | Kurosu & Kashimura 1995 |

## Handwriting

[handwriting.json](handwriting.json) collects the evidence on handwritten type: when it helps (human presence, care, touch, love), what it costs (reading effort, credibility) and what the brain does (motor areas respond to handwritten letters). Each finding has use-when and avoid-when lists; the rules feed `foundations/typography/source/handwritten.json`.

| Finding | Strength | Source |
|---|---|---|
| Handwritten type feels like a person was there; reverses for functional products | Moderate | Schroll, Schnurr & Grewal 2018, Journal of Consumer Research 45(3) |
| It signals care, only for health-focused brands | Moderate | Liu, Choi & Mattila 2019, Journal of Business Research 98 |
| It invites touch, for safe products only | Moderate | Izadi & Patrick 2020, Psychology & Marketing |
| Handmade means love | Moderate | Fuchs, Schreier & van Osselaer 2015, Journal of Marketing 79(2) |
| The brain reads handwriting with the hand (motor areas) | Moderate | Longcamp et al. 2003, NeuroImage; Longcamp, Hlushchuk & Hari 2011, Human Brain Mapping |
| Familiar hands feel friendlier and more trustworthy | Emerging | Mangas Afonso et al. 2024, Journal of Writing Research |
| Hard to read feels hard to do | Strong | Song & Schwarz 2008, Psychological Science 19(10) |
| Hand-drawn type lowers trust in data | Moderate | Song, Cho, Bearfield & Stasko 2025, IEEE VIS |
| Round letters taste sweet and read easier | Moderate | Velasco, Woods, Hyndman & Spence 2015, i-Perception 6(4) |
| Readable is liked better | Moderate | Gao, Dera, Nijhof & Willems 2019, PLOS ONE |

Myths: hard-to-read fonts don't improve memory or thinking (Meyer et al. 2015 pooled 17 experiments, no effect); hand type isn't always more human or premium; the sticky-note study is about real notes, not fonts.

## Myths

- **The golden ratio.** No reliable preference has been found; any effect is weak and depends on the person and the task.
- **Fixed colour meanings.** Colour feelings come mostly from learned associations, so they change with culture and product.

## Style families, scored

Each style is scored 0–2 against seven evidence-backed features; built styles carry their own scores and reasons in `approaches/<id>/approach.json` → `evidence` (curves, low complexity, familiar + fresh, natural detail, handmade, liked colours, 50 ms clarity). The scores are **our synthesis, not a published ranking**.

| Style | Score /14 | Status |
|---|---|---|
| Humanist Minimal | 12 | Our first art direction |
| Mid-century Modernism | 11 | In the style library |
| Posterize | 10 | In the style library |
| Soft Modern UI | 10 | Reference (not built) |
| Biophilic Organic | 10 | Reference (not built) |
| Doodles | 9 | In the style library |
| Commercial Modernism | 8 | In the style library |
| Scrapbook | 8 | In the style library |
| Bauhaus | 7 | In the style library |
| Desi Maximalism | 7 | In the style library |
| Rad Dog / Neon Surf | 7 | In the style library |
| Modern Clarity (Swiss) | 7 | Reference (not built) |
| Editorial Classic | 6 | Reference (not built) |
| Brutalist | 2 | Reference (not built) |

Liking isn't the only goal. Polarising styles (maximalist, brutalist) can win attention and memorability for the right product.
