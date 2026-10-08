# Templates

Ready-made layouts that use the foundations (colour, typography, layout). Each renders to PNG or PDF.

| Folder | For |
|---|---|
| `briefs/` | Creative brief to copy and fill in for each campaign |
| `layouts/` | 15 layout templates as data (slots in % of the artboard, grid, safe area, evidence) and `render.mjs` to draw them as SVG |
| `posters/` | Print and digital posters (A4, A3, A2, 18x24 in) |
| `social/` | Instagram posts and stories, LinkedIn, X, YouTube thumbnails |
| `print/` | Flyers, cards, stickers and other print collateral |

Each design will have a `.copy.json` beside it, checked with `npm run check:copy`.

Finished poster, social and print designs are not started yet; they will be built on `layouts/`.
