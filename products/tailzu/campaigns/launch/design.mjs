// Tailzu launch campaign: every piece as SVG, in Humanist Minimal (approaches/humanist-minimal).
//
//   node products/tailzu/campaigns/launch/design.mjs          (run `npm run build -- tailzu` first)
//
// Zero dependencies. Colours come from dist/tailzu/tokens/colors.json (Wada 344 primary, 343 alt,
// plus Wada Black and White), type from dist/tailzu/tokens/typography.json (Instrument Serif,
// Instrument Sans, IBM Plex Mono, Caveat for the one hand note), words from the .copy.json files
// beside this script, and the ink-and-paper primitives from dist/tailzu/web/js/illustration.mjs.
// Writes social/, web/, print/ and video/ SVGs; with Playwright installed (global npm root) it also
// writes a PNG beside each SVG and contact-sheet.png.
//
// The big idea, drawn the same way everywhere: talk arrives as a tangled, looping ink thread (how
// people actually speak), runs into one keyboard key with a microphone on it (Tailzu, the one
// accent object), and leaves as a single calm line that the clean, typed sentence sits on.
// Hand in, type out.
//
// Every id and class in a file is prefixed (tz-<piece>-) so the brand hub can inline many SVGs
// on one page.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../../../..');
const DIST = join(ROOT, 'dist/tailzu');
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
if (!existsSync(join(DIST, 'tokens/colors.json'))) throw new Error('Run `npm run build -- tailzu` first.');

const { illustrator } = await import(pathToFileURL(join(DIST, 'web/js/illustration.mjs')).href);
const { inkLine, paperPolygon, blob, rng } = illustrator;
const { titleCard, springEasing } = await import(pathToFileURL(join(ROOT, 'templates/video/title-card.mjs')).href);

// ------------------------------------------------------------------ tokens
const colors = json(join(DIST, 'tokens/colors.json'));
const type = json(join(DIST, 'tokens/typography.json'));
const approach = json(join(DIST, 'tokens/approach.json'));
const motionJson = json(join(ROOT, 'approaches/humanist-minimal/motion.json'));
const hex = Object.fromEntries(colors.colors.map((c) => [c.id, c.hex]));
const paletteOf = (name) => {
  const r = colors.brand.find((p) => p.name === name).roles;
  return { name, ground: hex[r.bg], ink: hex.black, paper: hex.white, accent: hex[r.accent], text: hex[r.text], combination: colors.brand.find((p) => p.name === name).combination };
};
const PAL = { primary: paletteOf('primary'), alt: paletteOf('alt') };
const ALLOWED = new Set(Object.values(PAL).flatMap((p) => [p.ground, p.ink, p.paper, p.accent, p.text]));

const FAM = {
  serif: type.pairing.display.family, // Instrument Serif
  sans: type.pairing.body.family, // Instrument Sans
  mono: type.pairing.mono.family, // IBM Plex Mono
  hand: type.hand.family, // Caveat
};
const FONT_URL = `https://fonts.googleapis.com/css2?family=${FAM.serif.replace(/ /g, '+')}&family=${FAM.sans.replace(/ /g, '+')}:wght@400;500;600&family=${FAM.mono.replace(/ /g, '+')}:wght@500&family=${FAM.hand.replace(/ /g, '+')}:wght@400;700&display=swap`;
const STACK = {
  serif: `'${FAM.serif}', Georgia, serif`,
  sans: `'${FAM.sans}', system-ui, sans-serif`,
  mono: `'${FAM.mono}', ui-monospace, monospace`,
  hand: `'${FAM.hand}', cursive`,
};

// Advance widths (per 1000 em) measured once in Chromium with the fonts loaded, ASCII 32-126.
// Used to wrap and place text exactly, so nothing overflows its grid.
const ADV = {
  serif: [170,237,371,635,417,590,579,233,340,340,444,531,217,430,213,258,460,249,404,371,393,382,404,364,433,402,213,217,531,531,531,317,660,457,478,480,530,453,408,521,546,249,249,496,413,665,540,540,466,540,513,407,461,536,457,651,546,477,427,325,258,325,433,376,354,399,443,339,457,355,288,402,470,223,215,451,220,704,470,408,444,442,318,308,259,454,393,597,385,401,353,318,252,318,531],
  sans500: [197,284,417,721,623,786,761,244,423,423,419,538,265,499,265,444,671,389,551,577,607,578,607,546,590,615,265,265,538,538,538,574,860,731,640,744,753,634,598,764,731,254,441,702,589,902,731,790,661,796,660,623,656,708,731,1088,697,688,627,423,444,423,538,446,354,546,613,543,613,567,362,613,606,250,250,546,250,931,606,591,613,613,383,483,392,596,530,783,569,530,505,423,238,423,538],
  sans600: [193,295,449,727,637,786,768,256,439,439,430,544,275,493,275,444,677,387,557,579,615,581,615,561,598,619,275,275,544,544,544,580,867,733,645,747,755,630,594,764,725,254,427,712,589,898,725,794,667,806,664,637,664,704,733,1087,707,700,631,439,444,439,544,466,354,558,621,552,621,571,370,621,612,260,260,558,260,941,612,597,621,621,390,494,406,604,536,800,587,536,513,439,234,439,544],
  hand: [242,210,237,559,450,600,564,117,330,330,363,446,198,326,198,330,450,450,450,450,450,450,450,450,450,450,198,198,446,446,446,374,643,502,520,472,578,529,454,487,563,400,306,498,426,720,599,496,464,502,537,486,458,482,490,720,524,504,522,330,330,330,446,446,353,437,435,355,393,325,291,355,464,187,204,365,169,560,450,353,378,377,360,341,331,370,331,517,343,341,315,330,330,330,446],
  mono: Array(95).fill(600),
};
const ADV_EX = { serif: { '…': 533, '’': 166 }, sans500: { '…': 692, '’': 265 }, sans600: { '…': 728, '’': 275 }, hand: { '…': 594, '’': 117 }, mono: {} };
const CAP = { serif: 0.734, sans500: 0.734, sans600: 0.734, hand: 0.62, mono: 0.7 };
const FACE = {
  serif: { family: STACK.serif, weight: 400, track: -0.01 },
  sans500: { family: STACK.sans, weight: 500, track: 0 },
  sans600: { family: STACK.sans, weight: 600, track: 0 },
  hand: { family: STACK.hand, weight: 400, track: 0 },
  mono: { family: STACK.mono, weight: 500, track: 0 },
};

function textWidth(str, face, size) {
  let w = 0;
  for (const ch of String(str)) {
    const c = ch.charCodeAt(0);
    w += c >= 32 && c < 127 ? ADV[face][c - 32] : ADV_EX[face][ch] ?? 600;
  }
  return (w / 1000) * size + FACE[face].track * size * Math.max(0, [...String(str)].length - 1);
}

function wrap(text, face, size, maxW) {
  const lines = [];
  for (const w of String(text).trim().split(/\s+/)) {
    const last = lines[lines.length - 1];
    if (last !== undefined && textWidth(`${last} ${w}`, face, size) <= maxW) lines[lines.length - 1] = `${last} ${w}`;
    else lines.push(w);
  }
  return lines;
}
// Fewest lines, then the narrowest measure that keeps that count: even lines, no lone last word.
function balance(text, face, size, maxW) {
  const n = wrap(text, face, size, maxW).length;
  if (n < 2) return wrap(text, face, size, maxW);
  let m = maxW;
  while (m > maxW * 0.5 && wrap(text, face, size, m - 4).length === n) m -= 4;
  return wrap(text, face, size, m);
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const r1 = (n) => Math.round(n * 10) / 10;

// ------------------------------------------------------------------ a piece (artboard + bookkeeping)
class Piece {
  constructor({ id, name, dir, W, H, palette, safe, label, format }) {
    Object.assign(this, { id, name, dir, W, H, P: palette, label, format });
    this.S = Math.min(W, H);
    this.k = this.S / 400; // art.json lengths are on a 400-unit artboard
    this.lw = (approach.art.line.widthPct / 100) * this.S; // ink line: 2.25% of the short side
    this.lwSmall = (approach.art.line.widthSmall / 400) * this.S;
    this.safe = safe; // { x, y, x2, y2 } text must stay inside
    this.parts = [];
    this.texts = []; // boxes of text, for overflow and collision checks
    this.marks = []; // boxes of art, for empty-ground estimate
    this.notes = [];
  }
  add(svg) { this.parts.push(svg); }
  pid(s) { return `tz-${this.id}-${s}`; }

  // Text lines; returns the block's box. anchor is the first baseline.
  text(lines, { x, y, face = 'sans500', size, lead = 1.3, fill, rotate = 0, role = 'text', anchor = 'start' }) {
    const f = FACE[face];
    const ls = f.track ? ` letter-spacing="${r1(f.track * size)}"` : '';
    const tr = rotate ? ` transform="rotate(${rotate} ${r1(x)} ${r1(y)})"` : '';
    const ta = anchor !== 'start' ? ` text-anchor="${anchor}"` : '';
    const body = lines.map((l, i) => `<tspan x="${r1(x)}" y="${r1(y + i * size * lead)}">${esc(l)}</tspan>`).join('');
    this.add(`<text font-family="${esc(f.family)}" font-weight="${f.weight}" font-size="${r1(size)}"${ls}${ta} fill="${fill || this.P.text}"${tr}>${body}</text>`);
    const w = Math.max(...lines.map((l) => textWidth(l, face, size)));
    const x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
    const box = { role, x: x0, y: y - CAP[face] * size, w, h: CAP[face] * size + (lines.length - 1) * size * lead + size * 0.22, lines, size, face };
    this.texts.push(box);
    return box;
  }

  ink(d, { w = this.lw, color = this.P.ink, extra = '' } = {}) {
    this.add(`<path d="${d}" fill="none" stroke="${color}" stroke-width="${r1(w)}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`);
  }
  dot(x, y, { r = this.lw * 0.6, seed = 9, color = this.P.ink } = {}) {
    this.add(`<path d="${blob(x, y, r, r, { points: 6, irregularity: 0.06, seed })}" fill="${color}"/>`);
  }
  mark(box) { this.marks.push(box); }

  svg() {
    const titleId = this.pid('title');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.W} ${this.H}" width="${this.W}" height="${this.H}" role="img" aria-labelledby="${titleId}">` +
      `<title id="${titleId}">${esc(this.label)}</title>` +
      `<style><![CDATA[@import url("${FONT_URL}");]]></style>` +
      `<rect width="${this.W}" height="${this.H}" fill="${this.P.ground}"/>` +
      this.parts.join('') + `</svg>\n`;
  }

  // Overflow, collision and colour checks; returns a list of problems.
  check() {
    const out = [];
    const s = this.safe;
    for (const t of this.texts) {
      if (t.x < s.x - 0.5 || t.y < s.y - 0.5 || t.x + t.w > s.x2 + 0.5 || t.y + t.h > s.y2 + 0.5) out.push(`text "${t.lines.join(' / ')}" leaves the safe area (${r1(t.x)},${r1(t.y)} ${r1(t.w)}x${r1(t.h)})`);
    }
    for (let i = 0; i < this.texts.length; i++) for (let j = i + 1; j < this.texts.length; j++) {
      const a = this.texts[i], b = this.texts[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) out.push(`text "${a.lines[0]}" overlaps "${b.lines[0]}"`);
    }
    for (const t of this.texts) for (const m of this.marks) {
      if (t.x < m.x + m.w && m.x < t.x + t.w && t.y < m.y + m.h && m.y < t.y + t.h && !m.allowText) out.push(`text "${t.lines[0]}" collides with art "${m.role}"`);
    }
    const used = this.svg().match(/#[0-9a-fA-F]{6}\b/g) || [];
    for (const h of new Set(used)) if (!ALLOWED.has(h.toLowerCase())) out.push(`colour ${h} is not in the palette`);
    return out;
  }

  // Share of the artboard not covered by any text or art box (4-unit grid).
  emptyPct() {
    const boxes = [...this.texts, ...this.marks];
    let used = 0, n = 0;
    const st = Math.max(4, Math.round(this.S / 200));
    for (let y = 0; y < this.H; y += st) for (let x = 0; x < this.W; x += st) {
      n++;
      if (boxes.some((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h)) used++;
    }
    return Math.round((1 - used / n) * 100);
  }
}

// ------------------------------------------------------------------ the motif: thread, key, line

// Resample a dense polyline to points `step` apart (arc length).
function resample(pts, step) {
  const out = [pts[0]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    let seg = Math.hypot(bx - ax, by - ay);
    let t0 = 0;
    while (acc + seg * (1 - t0) >= step) {
      const t = t0 + (step - acc) / seg;
      out.push([ax + (bx - ax) * t, ay + (by - ay) * t]);
      t0 = t;
      acc = 0;
    }
    acc += seg * (1 - t0);
  }
  const last = pts[pts.length - 1];
  const tail = out[out.length - 1];
  if (Math.hypot(last[0] - tail[0], last[1] - tail[1]) > step * 0.35) out.push(last);
  else out[out.length - 1] = last;
  return out;
}

// The said thread: looping like quick handwriting (a prolate cycloid with irregular loops) that
// calms down and arrives level at E. side flips the loops to the other side of the path.
function tanglePoints(S, E, { loops = 3, big = 2.7, r0, calm = 0.55, seed = 3, side = 1, wander = 0.6, bow = 0 } = {}) {
  const L = Math.hypot(E[0] - S[0], E[1] - S[1]);
  const u = [(E[0] - S[0]) / L, (E[1] - S[1]) / L];
  const nrm = [u[1] * side, -u[0] * side];
  const a = L / (2 * Math.PI * loops);
  if (r0) big = r0 / a;
  const rand = rng(seed);
  const rf = Array.from({ length: loops + 2 }, () => 0.72 + rand() * 0.56);
  const ph = rand() * Math.PI * 2;
  const M = loops * 90;
  const pts = [];
  for (let i = 0; i <= M; i++) {
    const s = i / M;
    const th = 2 * Math.PI * loops * s;
    const fi = s * loops, i0 = Math.floor(fi), f = fi - i0;
    const r = rf[i0] * (1 - f) + rf[Math.min(i0 + 1, rf.length - 1)] * f;
    const b = a * (big + (calm - big) * Math.pow(s, 1.15)) * (s > 0.85 ? 1 : r);
    const along = L * s - b * Math.sin(th);
    let across = b * (1 - Math.cos(th));
    across += a * wander * Math.sin(Math.PI * s) * Math.sin(2.3 * Math.PI * s + ph) * (1 - s);
    across += bow * Math.sin(Math.PI * s) * (1 - s);
    pts.push([S[0] + u[0] * along + nrm[0] * across, S[1] + u[1] * along + nrm[1] * across]);
  }
  return pts;
}

function thread(pc, S, E, opts = {}) {
  const k = pc.k;
  const pts = resample(tanglePoints(S, E, opts), 12 * k);
  const d = inkLine(pts, { wobble: 0.9 * k, segment: 1e6, seed: opts.seed || 3 });
  pc.ink(d, { extra: opts.cls ? ` class="${opts.cls}" pathLength="1"` : '' });
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  pc.mark({ role: 'thread', x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) });
  return pts;
}

// A calm, nearly straight hand line through points, ending in an ink dot.
function calmLine(pc, pts, { seed = 21, dot = true, cls = '' } = {}) {
  const d = inkLine(pts, { wobble: 0.7 * pc.k, segment: 16 * pc.k, seed });
  pc.ink(d, { extra: cls ? ` class="${cls}" pathLength="1"` : '' });
  if (dot) { const e = pts[pts.length - 1]; pc.dot(e[0], e[1], { seed: seed + 1 }); }
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  pc.mark({ role: 'line', allowText: true, x: Math.min(...xs) - pc.lw, y: Math.min(...ys) - pc.lw, w: Math.max(...xs) - Math.min(...xs) + 2 * pc.lw, h: Math.max(...ys) - Math.min(...ys) + 2 * pc.lw });
}

// Rounded-square outline points with a little hand irregularity.
function roundRectPoints(cx, cy, w, h, r, n = 6) {
  const pts = [];
  const corners = [[cx + w / 2 - r, cy - h / 2 + r, -Math.PI / 2], [cx + w / 2 - r, cy + h / 2 - r, 0], [cx - w / 2 + r, cy + h / 2 - r, Math.PI / 2], [cx - w / 2 + r, cy - h / 2 + r, Math.PI]];
  for (const [x, y, a0] of corners) for (let i = 0; i <= n; i++) {
    const a = a0 + (i / n) * (Math.PI / 2);
    pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
  }
  return pts;
}

// The key: a cut-paper rounded square (accent or paper), an ink outline sitting slightly off
// register, and a glyph: a microphone drawn in paper line, or a word set in the mono.
function key(pc, cx, cy, size, { fill = pc.P.accent, glyph = 'mic', label = 'Ctrl', seed = 5, cls = '', outline = true } = {}) {
  const k = pc.k, r = size * 0.24, h = size / 2;
  const mis = pc.S * 0.008; // misregistration, same direction in every piece: paper sits up-left
  const sq = [[cx - h, cy - h], [cx + h, cy - h], [cx + h, cy + h], [cx - h, cy + h]].map(([x, y]) => [x - mis, y - mis]);
  const c = cls ? ` class="${cls}"` : '';
  let g = `<g${c}>`;
  g += `<path d="${paperPolygon(sq, { jitter: 1.6 * k, radius: r, seed })}" fill="${fill}"/>`;
  if (outline) g += `<path d="${inkLine(roundRectPoints(cx, cy, size, size, r), { closed: true, wobble: 0.8 * k, segment: 13 * k, seed: seed + 1 })}" fill="none" stroke="${pc.P.ink}" stroke-width="${r1(pc.lw * 0.8)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (glyph === 'mic') {
    const gc = fill === pc.P.paper ? pc.P.ink : pc.P.paper;
    const gw = r1(Math.max(pc.lwSmall * 0.6, size * 0.055));
    const st = `fill="none" stroke="${gc}" stroke-width="${gw}" stroke-linecap="round" stroke-linejoin="round"`;
    const mx = cx, my = cy - size * 0.1, cw = size * 0.085, ch = size * 0.16;
    const cap = [];
    for (let i = 0; i <= 10; i++) { const a = Math.PI + (i / 10) * Math.PI; cap.push([mx + Math.cos(a) * cw, my - ch + cw + Math.sin(a) * cw]); }
    for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI; cap.push([mx + Math.cos(a) * cw, my + ch - cw + Math.sin(a) * cw]); }
    g += `<path d="${inkLine(cap, { closed: true, wobble: 0.4 * k, segment: 8 * k, seed: seed + 2 })}" ${st}/>`;
    const hr = size * 0.19, hy = cy - size * 0.05;
    const u = [];
    for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; u.push([mx + Math.cos(a) * hr, hy + Math.sin(a) * hr * 0.95]); }
    g += `<path d="${inkLine(u.reverse(), { wobble: 0.4 * k, segment: 8 * k, seed: seed + 3 })}" ${st}/>`;
    g += `<path d="${inkLine([[mx, hy + hr * 0.95], [mx, cy + size * 0.27]], { wobble: 0.3 * k, segment: 20 * k, seed: seed + 4 })}" ${st}/>`;
    g += `<path d="${inkLine([[mx - size * 0.1, cy + size * 0.27], [mx + size * 0.1, cy + size * 0.27]], { wobble: 0.3 * k, segment: 20 * k, seed: seed + 5 })}" ${st}/>`;
  } else if (glyph === 'word') {
    const fs = size * 0.22;
    g += `<text x="${r1(cx)}" y="${r1(cy + fs * 0.35)}" text-anchor="middle" font-family="${esc(STACK.mono)}" font-weight="500" font-size="${r1(fs)}" fill="${fill === pc.P.paper ? pc.P.ink : pc.P.paper}">${esc(label)}</text>`;
  }
  g += '</g>';
  pc.add(g);
  pc.mark({ role: 'key', x: cx - h - mis, y: cy - h - mis, w: size + mis, h: size + mis });
}

// The Tailzu mark, one colour (from the site's favicon.svg geometry: three keys, two links, the
// hatched link and the dot), followed by the name. Returns the box.
function logo(pc, x, top, h, { color = pc.P.text, word = true, size } = {}) {
  const s = h / 512; // the mark's inner viewBox is 680 x 512
  let g = `<g transform="translate(${r1(x)} ${r1(top)}) scale(${(s).toFixed(5)}) translate(-170 -228)">`;
  const sw = Math.max(9, 1.4 / s); // keep the thin links visible at small sizes
  g += `<line x1="346" y1="402" x2="270" y2="598" stroke="${color}" stroke-width="${r1(sw)}" stroke-linecap="round"/>`;
  g += `<line x1="444" y1="394" x2="554" y2="486" stroke="${color}" stroke-width="30" stroke-dasharray="9 11"/>`;
  g += `<line x1="668" y1="478" x2="828" y2="243" stroke="${color}" stroke-width="${r1(sw)}" stroke-linecap="round"/>`;
  g += `<circle cx="828" cy="243" r="${r1(Math.max(11, sw * 1.3))}" fill="${color}"/>`;
  for (const [rx, ry] of [[308, 269], [558, 478], [178, 598]]) g += `<rect x="${rx}" y="${ry}" width="132" height="132" rx="28" fill="${color}"/>`;
  g += '</g>';
  pc.add(g);
  const mw = 680 * s;
  let w = mw;
  if (word) {
    const fs = size || h * 0.78;
    const tx = x + mw + h * 0.28;
    const base = top + h * 0.5 + fs * CAP.sans600 * 0.5;
    pc.text(['Tailzu'], { x: tx, y: base, face: 'sans600', size: fs, fill: color, role: 'brand' });
    w = tx + textWidth('Tailzu', 'sans600', fs) - x;
  }
  pc.mark({ role: 'logo-mark', x, y: top, w: mw, h, allowText: true });
  return { x, y: top, w, h };
}

// Call to action as a link: words in the sans and a short hand underline.
function ctaLink(pc, text, x, y, size, { anchor = 'start' } = {}) {
  const b = pc.text([text], { x, y, face: 'sans600', size, fill: pc.P.text, role: 'cta', anchor });
  const uy = y + size * 0.32;
  pc.ink(inkLine([[b.x, uy], [b.x + b.w, uy + size * 0.04]], { wobble: 0.35 * pc.k, segment: 18 * pc.k, seed: 77 }), { w: Math.max(2, size * 0.09) });
  return b;
}

// Call to action as a button: an ink pill with the words in the ground colour (11.95:1).
function ctaButton(pc, text, x, y, size, { anchor = 'start' } = {}) {
  const tw = textWidth(text, 'sans600', size);
  const padX = size * 1.1, hgt = size * 2.4;
  const w = tw + padX * 2;
  const x0 = anchor === 'end' ? x - w : x;
  pc.add(`<rect x="${r1(x0)}" y="${r1(y)}" width="${r1(w)}" height="${r1(hgt)}" rx="${r1(hgt / 2)}" fill="${pc.P.ink}"/>`);
  const t = pc.text([text], { x: x0 + padX, y: y + hgt / 2 + size * CAP.sans600 * 0.5, face: 'sans600', size, fill: pc.P.ground, role: 'cta' });
  t.x = x0; t.w = w; t.y = y; t.h = hgt;
  return { x: x0, y, w, h: hgt };
}

// Headline (serif), then the brand directly under it (O4). Returns the bottom.
function headBlock(pc, text, { x, top, size, maxW, logoH, gap, lines: given }) {
  const lines = given || balance(text, 'serif', size, maxW);
  const lead = 1.0;
  const base = top + CAP.serif * size;
  const hb = pc.text(lines, { x, y: base, face: 'serif', size, lead, fill: pc.P.text, role: 'headline' });
  const lastBase = base + (lines.length - 1) * size * lead;
  const lg = logo(pc, x, lastBase + (gap ?? size * 0.42), logoH);
  return { head: hb, logo: lg, bottom: lg.y + lg.h };
}

const copy = (n) => json(join(HERE, `${n}.copy.json`));
const pieces = [];
const safeGrid = (W, H, m) => ({ x: m, y: m, x2: W - m, y2: H - m });

// ------------------------------------------------------------------ social: Instagram 4:5 (1080 x 1350)
// Layout: templates/layouts post-4x5-single-focal (art top 52%, headline 63%, brand + CTA 83%).
// Sizes (typography.json -> instagram-post): headline cap 5-8% of height; body >= 32 px.
const IG = { W: 1080, H: 1350, M: 86 };
const IGT = { head: 132, body: 40, small: 32, logo: 46 };

{ // 1. Say it badly. Send it perfect.
  const c = copy('post-say-it-badly');
  const pc = new Piece({ id: 'post1', name: 'post-say-it-badly', dir: 'social', W: IG.W, H: IG.H, palette: PAL.primary, safe: safeGrid(IG.W, IG.H, IG.M), label: `${c.headline} Tailzu.`, format: c.format });
  const ay = 470, kx = 480, ks = 180;
  pc.text([c.note], { x: IG.M + 4, y: 190, face: 'hand', size: 68, fill: pc.P.ink, rotate: -4, role: 'note' });
  thread(pc, [-40, ay], [kx - ks * 0.2, ay], { loops: 3, r0: 100, seed: 11 });
  key(pc, kx, ay, ks, { seed: 7 });
  const tx = kx + ks / 2 + 36;
  const tl = balance(c.typed, 'sans500', IGT.body, IG.W - IG.M - tx);
  calmLine(pc, [[kx + ks * 0.3, ay], [IG.W - IG.M - 8, ay + 2]], { seed: 31 });
  pc.text(tl, { x: tx, y: ay - 26 - (tl.length - 1) * IGT.body * 1.3, face: 'sans500', size: IGT.body, lead: 1.3, fill: pc.P.text, role: 'typed' });
  const hb = headBlock(pc, c.headline, { x: IG.M, top: 820, size: IGT.head, maxW: 860, logoH: IGT.logo });
  ctaLink(pc, c.cta, IG.W - IG.M, hb.logo.y + IGT.logo * 0.5 + IGT.small * CAP.sans600 * 0.5, IGT.small, { anchor: 'end' });
  pieces.push(pc);
}

{ // 2. Ramesh stays Ramesh. 2500 stays 2500.  Headline on top, art below (mirror of post 1).
  const c = copy('post-ramesh');
  const pc = new Piece({ id: 'post2', name: 'post-ramesh', dir: 'social', W: IG.W, H: IG.H, palette: PAL.primary, safe: safeGrid(IG.W, IG.H, IG.M), label: `${c.headline} Tailzu.`, format: c.format });
  const hl = ['Ramesh stays Ramesh.', '2500 stays 2500.'];
  const hs = Math.min(IGT.head, IGT.head * (IG.W - 2 * IG.M) / Math.max(...hl.map((l) => textWidth(l, 'serif', IGT.head))));
  const hb = headBlock(pc, c.headline, { x: IG.M, top: IG.M + 10, size: hs, lines: hl, logoH: IGT.logo });
  pc.text([c.subhead], { x: IG.M, y: hb.bottom + 78, face: 'sans500', size: IGT.body, role: 'subhead' });
  const ay = 930, kx = 450, ks = 168;
  pc.text([c.note], { x: IG.M + 4, y: ay - 190, face: 'hand', size: 62, fill: pc.P.ink, rotate: -3, role: 'note' });
  thread(pc, [-40, ay], [kx - ks * 0.2, ay], { loops: 3, r0: 82, seed: 23 });
  key(pc, kx, ay, ks, { seed: 9 });
  const tx = kx + ks / 2 + 36;
  const lines = balance(c.typed, 'sans500', IGT.body, IG.W - IG.M - tx);
  calmLine(pc, [[kx + ks * 0.3, ay], [IG.W - IG.M - 8, ay + 2]], { seed: 33 });
  pc.text(lines, { x: tx, y: ay - 26 - (lines.length - 1) * IGT.body * 1.3, face: 'sans500', size: IGT.body, lead: 1.3, role: 'typed' });
  ctaLink(pc, c.cta, IG.M, IG.H - IG.M - 20, IGT.small);
  pieces.push(pc);
}

{ // 3. Hinglish in. Hinglish out.  Two threads (two languages) go into one key; one line comes out.
  const c = copy('post-hinglish');
  const pc = new Piece({ id: 'post3', name: 'post-hinglish', dir: 'social', W: IG.W, H: IG.H, palette: PAL.primary, safe: safeGrid(IG.W, IG.H, IG.M), label: `${c.headline} Tailzu.`, format: c.format });
  const ay = 420, kx = 420, ks = 176;
  thread(pc, [-40, ay - 230], [kx - ks * 0.25, ay - 18], { loops: 3, r0: 70, seed: 41, side: 1 });
  thread(pc, [-40, ay + 230], [kx - ks * 0.25, ay + 18], { loops: 3, r0: 70, seed: 52, side: -1 });
  key(pc, kx, ay, ks, { seed: 13 });
  const tx = kx + ks / 2 + 36;
  const lines = balance(c.typed, 'sans500', IGT.body, IG.W - IG.M - tx);
  calmLine(pc, [[kx + ks * 0.3, ay], [IG.W - IG.M - 8, ay + 2]], { seed: 35 });
  pc.text(lines, { x: tx, y: ay - 26 - (lines.length - 1) * IGT.body * 1.3, face: 'sans500', size: IGT.body, lead: 1.3, role: 'typed' });
  const hb = headBlock(pc, c.headline, { x: IG.M, top: 770, size: IGT.head, maxW: 860, logoH: IGT.logo });
  pc.text(balance(c.subhead, 'sans500', IGT.body, 860), { x: IG.M, y: hb.bottom + 80, face: 'sans500', size: IGT.body, lead: 1.3, role: 'subhead' });
  ctaLink(pc, c.cta, IG.W - IG.M, hb.logo.y + IGT.logo * 0.5 + IGT.small * CAP.sans600 * 0.5, IGT.small, { anchor: 'end' });
  pieces.push(pc);
}

// ------------------------------------------------------------------ social: carousel, 4 slides 4:5
// One thread runs across all four slides (drawn once on a 4320 x 1350 strip, cut by viewBox).
{
  const slides = copy('carousel-talk-it-writes');
  const W = IG.W, H = IG.H, M = IG.M, N = slides.length;
  const T = { head: 116, body: 38, small: 30, logo: 42 };
  const ay = 900;
  // Art across the strip: calm start on slide 1, loops on slide 2, the key on slide 3, the line on 4.
  const kx = W * 2 + 540, ks = 200;
  const part = (s) => { const p = new Piece({ id: `car${s + 1}`, name: `carousel-${s + 1}`, dir: 'social', W, H, palette: PAL.primary, safe: safeGrid(W, H, M), label: `${slides[s].headline} Tailzu.`, format: 'carousel-slide' }); p.ox = s * W; return p; };
  const slidesP = slides.map((_, s) => part(s));
  // Draw the shared art into a scratch piece, then copy it into each slide shifted.
  const art = new Piece({ id: 'car', name: 'art', dir: 'social', W: W * N, H, palette: PAL.primary, safe: { x: 0, y: 0, x2: W * N, y2: H }, label: '' });
  art.k = IG.W / 400; art.S = IG.W; art.lw = (approach.art.line.widthPct / 100) * IG.W; art.lwSmall = (approach.art.line.widthSmall / 400) * IG.W;
  const pre = [[M, ay], [W * 0.45, ay - 4], [W * 0.55, ay]];
  calmLine(art, pre, { seed: 61, dot: false });
  thread(art, [W * 0.55, ay], [kx - ks * 0.25, ay], { loops: 7, r0: 120, calm: 0.5, seed: 63, wander: 0.8 });
  key(art, kx, ay, ks, { seed: 17 });
  calmLine(art, [[kx + ks * 0.3, ay], [W * 4 - M - 8, ay + 2]], { seed: 65 });
  art.text([slides[1].note], { x: W + M + 10, y: ay - 300, face: 'hand', size: 66, fill: art.P.ink, rotate: -4, role: 'note' });
  const typedSize = T.body * 1.3;
  art.text([slides[3].typed], { x: W * 3 + M, y: ay - 28, face: 'sans500', size: typedSize, role: 'typed' });
  slidesP.forEach((p, s) => {
    p.add(`<g transform="translate(${-s * W} 0)">${art.parts.join('')}</g>`);
    for (const m of art.marks) p.mark({ ...m, x: m.x - s * W });
    for (const t of art.texts) if (t.x - s * W < W && t.x + t.w - s * W > 0) p.texts.push({ ...t, x: t.x - s * W });
    const c = slides[s];
    // Small label top left (mono), then the headline and the words, all above the thread.
    p.text([c.label], { x: M, y: M + T.small * 0.75, face: 'mono', size: T.small * 0.9, role: 'label' });
    const top = M + 90;
    const lines = balance(c.headline, 'serif', T.head, W - 2 * M);
    p.text(lines, { x: M, y: top + CAP.serif * T.head, face: 'serif', size: T.head, lead: 1.0, role: 'headline' });
    let y = top + CAP.serif * T.head + (lines.length - 1) * T.head + 70;
    for (const f of ['subhead', 'body']) {
      if (!c[f] || (s === 3 && f === 'body')) continue;
      const ls = balance(c[f], 'sans500', T.body, W - 2 * M - 80);
      p.text(ls, { x: M, y, face: 'sans500', size: T.body, lead: 1.4, role: f });
      y += (ls.length - 1) * T.body * 1.4 + T.body * 1.9;
    }
    logo(p, M, H - M - T.logo, T.logo);
    if (s === 3) {
      ctaLink(p, c.cta, W - M, H - M - T.logo * 0.5 + T.small * CAP.sans600 * 0.5, T.small, { anchor: 'end' });
      p.text([c.body], { x: M, y: ay + 150, face: 'sans500', size: T.small, role: 'detail' });
    }
    pieces.push(p);
  });
}

// ------------------------------------------------------------------ social: stories 9:16 (1080 x 1920)
// Layout: story-stacked. Text inside the live area: top 14%, bottom 35%, sides 6% (and the 8% grid).
// The thread may run into the overlay zones as decoration only.
const ST = { W: 1080, H: 1920 };
const stSafe = { x: 86, y: 0.14 * 1920, x2: 1080 - 86, y2: 0.65 * 1920 };
const STT = { head: 124, body: 42, small: 34, logo: 50 };

{ // Story 1: Say it rough. Send it clean.
  const c = copy('story-say-it-rough');
  const pc = new Piece({ id: 'story1', name: 'story-say-it-rough', dir: 'social', W: ST.W, H: ST.H, palette: PAL.primary, safe: stSafe, label: `${c.headline} Tailzu.`, format: c.format });
  const kx = 230, ky = 560, ks = 184;
  thread(pc, [kx + 10, -60], [kx, ky - ks * 0.22], { loops: 4, r0: 85, seed: 71, side: -1 });
  key(pc, kx, ky, ks, { seed: 19 });
  const tx = kx + ks / 2 + 36;
  const lines = balance(c.typed, 'sans500', STT.body, stSafe.x2 - tx);
  calmLine(pc, [[kx + ks * 0.3, ky], [stSafe.x2 - 8, ky + 2]], { seed: 73 });
  pc.text(lines, { x: tx, y: ky - 28 - (lines.length - 1) * STT.body * 1.3, face: 'sans500', size: STT.body, lead: 1.3, role: 'typed' });
  const hb = headBlock(pc, c.headline, { x: stSafe.x, top: 700, size: STT.head, maxW: 860, logoH: STT.logo });
  pc.text([c.subhead], { x: stSafe.x, y: hb.bottom + 78, face: 'sans500', size: STT.body, role: 'subhead' });
  ctaButton(pc, c.cta, stSafe.x, hb.bottom + 122, STT.small);
  pieces.push(pc);
}

{ // Story 2: Touch Ctrl. Take control.  Two Ctrl keys (the double tap); the second is the live one.
  const c = copy('story-desktop');
  const pc = new Piece({ id: 'story2', name: 'story-desktop', dir: 'social', W: ST.W, H: ST.H, palette: PAL.primary, safe: stSafe, label: `${c.headline} Tailzu.`, format: c.format });
  const ky = 500, ks = 160, k1 = 190, k2 = 390;
  // Two taps: short ink strokes above each key.
  for (const [i, kx] of [[0, k1], [1, k2]]) {
    for (const dx of [-0.28, 0, 0.28]) {
      const x = kx + dx * ks, y0 = ky - ks / 2 - 34, y1 = y0 - 44 + Math.abs(dx) * 30;
      pc.ink(inkLine([[x + dx * 20, y0], [x + dx * 60, y1]], { wobble: 0.4 * pc.k, segment: 30 * pc.k, seed: 80 + i * 3 + dx * 10 }), { w: pc.lwSmall });
    }
  }
  pc.mark({ role: 'taps', x: k1 - ks * 0.5, y: ky - ks / 2 - 90, w: k2 - k1 + ks, h: 60 });
  key(pc, k1, ky, ks, { fill: pc.P.paper, glyph: 'word', label: 'Ctrl', seed: 23 });
  key(pc, k2, ky, ks, { fill: pc.P.accent, glyph: 'word', label: 'Ctrl', seed: 29 });
  // The thread comes down from the top and goes into the live key.
  thread(pc, [k2 + 160, -60], [k2 + ks * 0.25, ky - ks * 0.5 - 100], { loops: 3, r0: 75, seed: 83, side: 1 });
  const tx = k2 + ks / 2 + 36;
  const lines = balance(c.typed, 'sans500', STT.body, stSafe.x2 - tx);
  calmLine(pc, [[k2 + ks * 0.3, ky], [stSafe.x2 - 8, ky + 2]], { seed: 87 });
  pc.text(lines, { x: tx, y: ky - 28 - (lines.length - 1) * STT.body * 1.3, face: 'sans500', size: STT.body, lead: 1.3, role: 'typed' });
  const hb = headBlock(pc, c.headline, { x: stSafe.x, top: 650, size: STT.head, maxW: 860, logoH: STT.logo });
  const sl = balance(c.subhead, 'sans500', STT.body, 820);
  pc.text(sl, { x: stSafe.x, y: hb.bottom + 80, face: 'sans500', size: STT.body, lead: 1.3, role: 'subhead' });
  ctaButton(pc, c.cta, stSafe.x, hb.bottom + 80 + (sl.length - 1) * STT.body * 1.3 + 44, STT.small);
  pieces.push(pc);
}

// ------------------------------------------------------------------ social: square LinkedIn post (1080 x 1080), alt palette
{
  const c = copy('linkedin-talk-to-the-machine');
  const W = 1080, H = 1080, M = 86;
  const pc = new Piece({ id: 'li', name: 'linkedin-talk-to-the-machine', dir: 'social', W, H, palette: PAL.alt, safe: safeGrid(W, H, M), label: `${c.headline} Tailzu.`, format: c.format });
  const T = { head: 104, body: 34, small: 28, logo: 40 };
  const ay = 330, kx = 250, ks = 150;
  thread(pc, [-40, ay], [kx - ks * 0.2, ay], { loops: 2, r0: 75, seed: 91 });
  key(pc, kx, ay, ks, { seed: 31 });
  // The chat box: a paper card; the line runs into it and the clean prompt sits inside.
  const bx = kx + ks / 2 + 70, bw = W - M - bx + 30, pad = 30;
  const lines = wrap(c.typed, 'sans500', T.body * 0.9, bw - 2 * pad);
  const bh = pad * 2 + lines.length * T.body * 0.9 * 1.4;
  const by = ay - bh / 2;
  calmLine(pc, [[kx + ks * 0.3, ay], [bx + 10, ay + 1]], { seed: 93, dot: false });
  pc.add(`<path d="${paperPolygon([[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]], { jitter: 1.5 * pc.k, radius: 24, seed: 95 })}" fill="${pc.P.paper}"/>`);
  pc.mark({ role: 'box', x: bx, y: by, w: bw, h: bh, allowText: true });
  pc.text(lines, { x: bx + pad, y: by + pad + T.body * 0.9 * CAP.sans500 + 4, face: 'sans500', size: T.body * 0.9, lead: 1.4, fill: pc.P.ink, role: 'typed' });
  const hb = headBlock(pc, c.headline, { x: M, top: 640, size: T.head, maxW: 860, logoH: T.logo });
  pc.text([c.subhead], { x: M, y: hb.bottom + 64, face: 'sans500', size: T.body * 0.9, role: 'subhead' });
  ctaLink(pc, c.cta, W - M, hb.logo.y + T.logo * 0.5 + T.small * CAP.sans600 * 0.5, T.small, { anchor: 'end' });
  pieces.push(pc);
}

// ------------------------------------------------------------------ web: display banner 970 x 250
// Layout: banner-strip (brand, headline, art, button in one line). Headline cap 12-20% of height.
{
  const c = copy('banner-say-it-rough');
  const W = 970, H = 250, M = 25;
  const pc = new Piece({ id: 'banner', name: 'banner-say-it-rough', dir: 'web', W, H, palette: PAL.primary, safe: { x: M, y: M, x2: W - M, y2: H - M }, label: `${c.headline} Tailzu.`, format: c.format });
  const lg = logo(pc, M + 6, H / 2 - 20, 40, { size: 30 });
  const hs = 54;
  const lines = balance(c.headline, 'serif', hs, 330);
  const hx = 210;
  const lh = hs * 1.0;
  pc.text(lines, { x: hx, y: H / 2 - (lines.length - 1) * lh / 2 + CAP.serif * hs / 2, face: 'serif', size: hs, lead: 1.0, role: 'headline' });
  const ay = H / 2, kx = 690, ks = 64;
  thread(pc, [500, ay], [kx - ks * 0.2, ay], { loops: 3, r0: 30, seed: 101 });
  key(pc, kx, ay, ks, { seed: 37 });
  const btn = ctaButton(pc, c.cta, W - M - 6, ay - 22, 18, { anchor: 'end' });
  calmLine(pc, [[kx + ks * 0.3, ay], [btn.x - 6, ay + 1]], { seed: 103, dot: false });
  pieces.push(pc);
}

// ------------------------------------------------------------------ web: landing hero 1440 x 810
// Layout: hero-split (words left, art right). Headline 40-88 px, body >= 18 px.
{
  const c = copy('landing-hero');
  const W = 1440, H = 810;
  const L = 0.045 * W, T = 0.08 * H;
  const pc = new Piece({ id: 'hero', name: 'landing-hero', dir: 'web', W, H, palette: PAL.primary, safe: { x: L, y: T, x2: W - L, y2: H - T }, label: `${c.headline} Tailzu.`, format: c.format });
  const S = { head: 88, body: 22, small: 18 };
  logo(pc, L, T, 34, { size: 26 });
  const colW = 0.40 * W;
  const hy = 0.27 * H;
  const hl = balance(c.headline, 'serif', S.head, colW);
  pc.text(hl, { x: L, y: hy + CAP.serif * S.head, face: 'serif', size: S.head, lead: 1.0, role: 'headline' });
  let y = hy + CAP.serif * S.head + (hl.length - 1) * S.head + 64;
  const sl = balance(c.subhead, 'sans500', S.body, colW - 20);
  pc.text(sl, { x: L, y, face: 'sans500', size: S.body, lead: 1.5, role: 'subhead' });
  y += (sl.length - 1) * S.body * 1.5 + 44;
  const bl = wrap(c.body, 'sans500', S.small, colW - 20);
  pc.text(bl, { x: L, y, face: 'sans500', size: S.small, lead: 1.55, role: 'body' });
  y += (bl.length - 1) * S.small * 1.55 + 40;
  ctaButton(pc, c.cta, L, y, S.small);
  // Art on the right: the thread falls from the top edge into the key, the line turns and runs
  // under the typed sentence.
  const kx = 0.66 * W, ky = 0.44 * H, ks = 150;
  thread(pc, [kx + 30, -60], [kx, ky - ks * 0.22], { loops: 3, r0: 70, seed: 111, side: -1 });
  key(pc, kx, ky, ks, { seed: 41 });
  const ly = ky + 190;
  calmLine(pc, [[kx, ky + ks * 0.3], [kx + 4, ly - 36], [kx + 40, ly], [W - L - 6, ly + 2]], { seed: 113 });
  const ts = 28;
  pc.text([c.typed], { x: kx + 46, y: ly - 24, face: 'sans500', size: ts, role: 'typed' });
  pieces.push(pc);
}

// ------------------------------------------------------------------ web: YouTube thumbnail 1280 x 720
// Layout: thumbnail-split. Three big words left; art top right, clear of the duration stamp.
{
  const c = copy('thumbnail-talk-it-writes');
  const W = 1280, H = 720, M = 58;
  const pc = new Piece({ id: 'thumb', name: 'thumbnail-talk-it-writes', dir: 'web', W, H, palette: PAL.primary, safe: { x: M, y: M, x2: W - M, y2: H - M }, label: `${c.headline} Tailzu.`, format: c.format });
  const hs = 168;
  const lines = ['Talk.', 'It writes.'];
  pc.text(lines, { x: M, y: 150 + CAP.serif * hs, face: 'serif', size: hs, lead: 0.98, role: 'headline' });
  logo(pc, M, 150 + CAP.serif * hs + hs * 0.98 + 56, 56, { size: 44 });
  const kx = 930, ky = 360, ks = 190;
  thread(pc, [kx + 40, -60], [kx, ky - ks * 0.22], { loops: 3, r0: 75, seed: 121, side: 1 });
  key(pc, kx, ky, ks, { seed: 43 });
  calmLine(pc, [[kx + ks * 0.3, ky], [W - M - 10, ky + 2]], { seed: 123 });
  pieces.push(pc);
}

// ------------------------------------------------------------------ print: poster A3/A2 (1000 x 1414)
// Layout: poster-single-focal (art top half, headline 59%, brand under it, details, CTA at the foot).
{
  const c = copy('poster-talk-it-writes');
  const W = 1000, H = 1414, M = 80;
  const pc = new Piece({ id: 'poster', name: 'poster-talk-it-writes', dir: 'print', W, H, palette: PAL.primary, safe: safeGrid(W, H, M), label: `${c.headline} Tailzu.`, format: c.format });
  const S = { head: 132, body: 30, small: 24, logo: 46 };
  const kx = 300, ky = 560, ks = 180;
  pc.text([c.note], { x: kx + 120, y: 300, face: 'hand', size: 60, fill: pc.P.ink, rotate: -4, role: 'note' });
  thread(pc, [kx - 20, -60], [kx, ky - ks * 0.22], { loops: 4, r0: 80, seed: 131, side: -1 });
  key(pc, kx, ky, ks, { seed: 47 });
  const tx = kx + ks / 2 + 34;
  const lines = balance(c.typed, 'sans500', S.body, W - M - tx);
  calmLine(pc, [[kx + ks * 0.3, ky], [W - M - 8, ky + 2]], { seed: 133 });
  pc.text(lines, { x: tx, y: ky - 24 - (lines.length - 1) * S.body * 1.3, face: 'sans500', size: S.body, lead: 1.3, role: 'typed' });
  const hb = headBlock(pc, c.headline, { x: M, top: 830, size: S.head, maxW: 840, logoH: S.logo });
  let y = hb.bottom + 70;
  const sl = balance(c.subhead, 'sans500', S.body, 700);
  pc.text(sl, { x: M, y, face: 'sans500', size: S.body, lead: 1.35, role: 'subhead' });
  y += (sl.length - 1) * S.body * 1.35 + 52;
  const bl = balance(c.body, 'sans500', S.small, 700);
  pc.text(bl, { x: M, y, face: 'sans500', size: S.small, lead: 1.45, role: 'body' });
  ctaLink(pc, c.cta, M, H - M - 10, S.body);
  pieces.push(pc);
}

// ------------------------------------------------------------------ video: animated story title card
// templates/video/title-card.mjs with the product's palette, copy, fonts and the style's motion.
// The thread draws on (100-800 ms), the key pops, then the line draws, all during the 2.3 s opening hold, then the title card's own
// beats run (headline, brand, CTA rise one at a time) and it ends on a still poster.
let titleSvg = '';
{
  const c = copy('story-title-card');
  const P = PAL.primary;
  const motion = { ...motionJson, openMs: 2300 };
  let svg = titleCard({
    palette: { ground: P.ground, ink: P.text, accent: P.ink, paper: P.paper }, // CTA bar in ink: the key is the one accent object
    copy: { headline: c.headline, brand: 'Tailzu', cta: c.cta },
    fonts: { display: FAM.serif, body: FAM.sans, displayWeight: 400 },
    motion, duration: 7000, aspect: [9, 16],
  });
  // Art above the text group: drawn with the same primitives into a scratch piece.
  const firstY = Math.min(...[...svg.matchAll(/<tspan x="[\d.]+" y="([\d.]+)"/g)].map((m) => +m[1]));
  const art = new Piece({ id: 'tcard', name: 'art', dir: 'video', W: 1080, H: 1920, palette: P, safe: stSafe, label: '' });
  const ky = Math.min(firstY - 260, 520), kx = 200, ks = 170;
  thread(art, [kx + 10, -60], [kx, ky - ks * 0.22], { loops: 4, r0: 80, seed: 141, side: -1, cls: 'tz-tcard-draw' });
  key(art, kx, ky, ks, { seed: 53, cls: 'tz-tcard-pop' });
  calmLine(art, [[kx + ks * 0.3, ky], [1080 - 86 - 8, ky + 2]], { seed: 143, cls: 'tz-tcard-line' });
  const draw = motionJson.moves.draw, ez = motionJson.easings[draw.easing].css;
  const pop = springEasing(motionJson.springs[motionJson.moves.pop.spring]);
  const css = `<style>
.tz-tcard-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:tz-tcard-draw 700ms ${ez} 100ms both}
.tz-tcard-pop{transform-box:fill-box;transform-origin:center;animation:tz-tcard-pop ${pop.duration}ms ${pop.easing} 820ms both}
.tz-tcard-line{stroke-dasharray:1;stroke-dashoffset:1;animation:tz-tcard-draw ${draw.duration}ms ${ez} ${840 + pop.duration}ms both}
@keyframes tz-tcard-draw{to{stroke-dashoffset:0}}
@keyframes tz-tcard-pop{from{transform:scale(0)}to{transform:scale(1)}}
@media (prefers-reduced-motion: reduce){.tz-tcard-draw,.tz-tcard-line,.tz-tcard-pop{animation:none!important;stroke-dashoffset:0!important;transform:none!important}}
</style>`;
  svg = svg.replace(/<rect id="tc-ground"([^>]*)\/>/, (m) => `${m}${css}<g id="tc-art">${art.parts.join('')}</g>`);
  svg = svg.replace(/<svg /, `<svg `).replace(/\btc-/g, 'tz-tcard-tc-');
  svg = svg.replace(/<title /, `<style><![CDATA[@import url("${FONT_URL}");]]></style><title `);
  // The template wraps by an average glyph width; Instrument Serif is condensed, so set the
  // headline's natural break (after the first sentence) instead of a split mid-sentence.
  const tsp = [...svg.matchAll(/(<g id="tz-tcard-tc-headline"[^>]*><text[^>]*>)((?:<tspan[^>]*>[^<]*<\/tspan>)+)/g)][0];
  if (tsp) {
    const ys = [...tsp[2].matchAll(/<tspan x="([\d.]+)" y="([\d.]+)">/g)];
    const parts = c.headline.split(/(?<=\.)\s+/);
    if (ys.length >= parts.length) svg = svg.replace(tsp[2], parts.map((t, i) => `<tspan x="${ys[i][1]}" y="${ys[i][2]}">${esc(t)}</tspan>`).join(''));
  }
  titleSvg = svg;
}

// ------------------------------------------------------------------ write
const report = [];
for (const p of pieces) {
  const dir = join(HERE, p.dir);
  mkdirSync(dir, { recursive: true });
  const svg = p.svg();
  writeFileSync(join(dir, `${p.name}.svg`), svg);
  const problems = p.check();
  report.push({ file: `${p.dir}/${p.name}.svg`, W: p.W, H: p.H, empty: p.emptyPct(), problems });
}
mkdirSync(join(HERE, 'video'), { recursive: true });
writeFileSync(join(HERE, 'video/story-title-card.svg'), titleSvg + '\n');
report.push({ file: 'video/story-title-card.svg', W: 1080, H: 1920, empty: null, problems: [] });
for (const r of report) console.log(`${r.file.padEnd(44)} ${r.W}x${r.H}  empty ${r.empty ?? '-'}%${r.problems.length ? '\n   ! ' + r.problems.join('\n   ! ') : ''}`);

// ------------------------------------------------------------------ PNG previews + contact sheet (optional)
let chromium = null;
try {
  const root = execSync('npm root -g', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  chromium = createRequire(import.meta.url)(join(root, 'playwright')).chromium;
} catch { chromium = null; }
if (chromium && !process.argv.includes('--no-png')) {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const exe = existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
  const browser = await chromium.launch({ executablePath: exe, proxy, args: ['--ignore-certificate-errors'] });
  const page = await browser.newPage();
  const files = report.map((r) => ({ ...r, path: join(HERE, r.file) }));
  for (const f of files) {
    await page.setViewportSize({ width: f.W, height: f.H });
    const svg = readFileSync(f.path, 'utf8');
    await page.setContent(`<html><body style="margin:0">${svg}</body></html>`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { await document.fonts.ready; for (const f of ['400 40px "Instrument Serif"', '500 40px "Instrument Sans"', '600 40px "Instrument Sans"', '400 40px Caveat', '500 40px "IBM Plex Mono"']) await document.fonts.load(f); });
    if (f.file.startsWith('video/')) await page.waitForTimeout(7600); // the final still
    await page.screenshot({ path: f.path.replace(/\.svg$/, '.png') });
  }
  // Contact sheet: every piece scaled into rows.
  const cell = (f, h) => `<figure style="margin:0;display:flex;flex-direction:column;gap:8px"><img src="data:image/png;base64,${readFileSync(f.path.replace(/\.svg$/, '.png')).toString('base64')}" style="height:${h}px;width:auto;display:block;box-shadow:0 1px 6px rgba(0,0,0,.18)"><figcaption style="font:13px/1.3 system-ui;color:#333">${f.file}</figcaption></figure>`;
  const rows = [
    files.filter((f) => /social\/post|social\/linkedin/.test(f.file)),
    files.filter((f) => /carousel/.test(f.file)),
    files.filter((f) => /story/.test(f.file)),
    files.filter((f) => /print\//.test(f.file) || /thumbnail/.test(f.file)),
    files.filter((f) => /hero|banner/.test(f.file)),
  ];
  const H = [420, 420, 560, 420, 300];
  const html = `<html><body style="margin:0;padding:32px;background:#e8e6e1;display:flex;flex-direction:column;gap:32px">${rows.map((r, i) => `<div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:nowrap">${r.map((f) => cell(f, f.file.includes('banner') ? 130 : H[i])).join('')}</div>`).join('')}</body></html>`;
  await page.setViewportSize({ width: 2400, height: 1000 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: join(HERE, 'contact-sheet.png'), fullPage: true });
  await browser.close();
  console.log('PNG previews and contact-sheet.png written');
}
