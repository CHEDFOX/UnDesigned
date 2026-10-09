// Tailzu mark, redrawn in Humanist Minimal at the owner's request: the three keycaps only (no lines),
// as hand-cut paper keys in the original constellation, with much more empty ground.
// Run: node products/tailzu/logo/humanist-logo.mjs  ->  products/tailzu/assets/logos/humanist/*.svg
// Built with the style's own primitives (approaches/humanist-minimal/illustration.mjs); colours from Tailzu's Wada palette.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createIllustrator } from '../../../approaches/humanist-minimal/illustration.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../../..');
const OUT = join(HERE, '../assets/logos/humanist');
const json = (f) => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));
const approach = { art: json('approaches/humanist-minimal/art.json'), motion: json('approaches/humanist-minimal/motion.json') };
const tokens = json('dist/tailzu/tokens/colors.json');
const list = Array.isArray(tokens.colors) ? tokens.colors : Object.values(tokens.colors);
const hex = (id) => list.find((c) => (c.id || c.slug) === id).hex;
const C = { black: hex('black'), white: hex('white'), amber: hex('yellow-ocher'), blue: hex('deep-lyons-blue'), buff: hex('ivory-buff') };

const r1 = (n) => Math.round(n * 10) / 10;
const S = 1000;
// The original constellation (favicon.svg, keys of 132 in a 680 x 512 field), kept; centred and scaled
// with more air: the original draws the group 65% of the tile wide with keys of 17%; here the group is 54%
// wide and each key 12%, so the keys sit further apart for their size and most of the tile is ground.
const KEYS = [
  { x: 308, y: 269, turn: -4, seed: 3 },
  { x: 558, y: 478, turn: 3, seed: 7, live: true }, // the live key: amber, "alive, right now"
  { x: 178, y: 598, turn: -2, seed: 11 },
];
const spread = 1.12, key = 120;
const gx = (244 + 624) / 2, gy = (335 + 664) / 2; // centre of the three key centres
const place = (k) => ({ cx: S / 2 + ((k.x + 66) - gx) * spread, cy: S / 2 + ((k.y + 66) - gy) * spread, s: key });

function keys({ ground, paper, ink, accent, outline }) {
  const ill = createIllustrator(approach, { ground, paper, ink, accent });
  let out = '';
  for (const k of KEYS) {
    const { cx, cy, s } = place(k);
    const h = s / 2;
    const sq = [[-h, -h], [h, -h], [h, h], [-h, h]];
    // Hand-cut paper: a soft square (radius 26%) with a little irregularity, set down at a slight angle.
    const shape = ill.paperPolygon(sq.map(([x, y]) => [cx + x, cy + y]), { jitter: s * 0.018, radius: s * 0.26, seed: k.seed });
    let g = `<path d="${shape}" fill="${k.live ? accent : paper}"/>`;
    if (outline) {
      // The ink outline, drawn by hand and slightly off register (the style's signature).
      const o = s * 0.05, r = s * 0.27, pts = [];
      const corner = (x, y, a0) => { for (let i = 0; i <= 4; i++) { const a = a0 + (i / 4) * Math.PI / 2; pts.push([cx + o + x + Math.cos(a) * r, cy + o * 0.7 + y + Math.sin(a) * r]); } };
      corner(h - r, -h + r, -Math.PI / 2); corner(h - r, h - r, 0); corner(-h + r, h - r, Math.PI / 2); corner(-h + r, -h + r, Math.PI);
      g += `<path d="${ill.inkLine(pts, { seed: k.seed + 20, closed: true, wobble: s * 0.006, segment: s * 0.12 })}" fill="none" stroke="${ink}" stroke-width="${r1(s * 0.06)}" stroke-linejoin="round"/>`;
    }
    out += `<g transform="rotate(${k.turn} ${r1(cx)} ${r1(cy)})">${g}</g>`;
  }
  return out;
}

const svg = (body, { tile = null, title }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" role="img" aria-label="${title}"><title>${title}</title>` +
  (tile ? `<rect width="${S}" height="${S}" fill="${tile}"/>` : '') + body + '</svg>\n';

mkdirSync(OUT, { recursive: true });
// The owner chose the black tile (2026-10-09); the blue and light proposals are no longer made.
const files = {
  'tailzu-mark-dark.svg': svg(keys({ ground: C.black, paper: C.white, ink: C.black, accent: C.amber }), { tile: C.black, title: 'Tailzu' }),
};
for (const [f, s] of Object.entries(files)) writeFileSync(join(OUT, f), s);
console.log(Object.keys(files).map((f) => 'products/tailzu/assets/logos/humanist/' + f).join('\n'));
