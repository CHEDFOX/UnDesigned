// Tailzu launch campaign (second round): every piece as SVG, in Humanist Minimal.
//
//   npm run build -- tailzu
//   node products/tailzu/campaigns/launch/design.mjs            (SVGs, PNGs, frames, contact sheet)
//   node products/tailzu/campaigns/launch/design.mjs --no-png   (SVGs only)
//
// The idea, everywhere: hand in, type out (identity.json, strategy.md). The customer's words appear
// twice: as they said them (one Caveat note with hand-drawn proof marks in the ink line) and as they
// land (Instrument Serif, calm), ending in one cut-paper full stop in the palette's accent.
//
// Sources: colours from dist/tailzu/tokens/colors.json (Wada 126 dark, 232 dark, 190 dark, 151 light,
// plus Wada Black and White); type from the instrument pairing and Caveat; ink and paper primitives from
// dist/tailzu/web/js/illustration.mjs; motion from approaches/humanist-minimal/motion.json and
// foundations/video/video.json; words from the .copy.json files beside this script; the mark from
// products/tailzu/assets/logos/tailzu-mark.svg, inlined unchanged.
//
// Every id, class and keyframe in a file starts with tz2-<piece>- so the brand hub can inline many
// SVGs on one page. Fonts load with @import in their own <style> (the hub strips that one).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const PRODUCT = join(HERE, '../..');
const ROOT = join(PRODUCT, '../..');
const DIST = join(ROOT, 'dist/tailzu');
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
if (!existsSync(join(DIST, 'tokens/colors.json'))) throw new Error('Run `npm run build -- tailzu` first.');

const { illustrator } = await import(pathToFileURL(join(DIST, 'web/js/illustration.mjs')).href);
const { inkLine, blob, paperPolygon, roundedPolygon, springs } = illustrator;
const ART = json(join(ROOT, 'approaches/humanist-minimal/art.json'));
const MOTION = json(join(ROOT, 'approaches/humanist-minimal/motion.json'));
const METRICS = json(join(HERE, 'font-metrics.json'));
const copy = (f) => json(join(HERE, f));

// ------------------------------------------------------------------ colour
const colors = json(join(DIST, 'tokens/colors.json'));
const HEX = Object.fromEntries(colors.colors.map((c) => [c.id, c.hex]));
const WHITE = HEX.white, BLACK = HEX.black;
function pal(name) {
  const p = colors.brand.find((b) => b.name === name);
  const r = p.roles;
  const dark = p.mode === 'dark';
  return {
    name, combination: p.combination, mode: p.mode,
    ground: HEX[r.bg], text: HEX[r.text], accent: HEX[r.accent],
    line: dark ? HEX[r.ink] : BLACK, // the ink line: Wada Black on light grounds, the combination's ink on dark ones
    paper: WHITE, onPaper: BLACK,
  };
}
const PAL = { primary: pal('primary'), night: pal('night'), desk: pal('desk'), paper: pal('paper') };

// The mark, unchanged, from the brand's own file.
const MARK_FILE = readFileSync(join(PRODUCT, 'assets/logos/tailzu-mark.svg'), 'utf8');
const MARK_INNER = MARK_FILE.match(/<svg x="70"[^>]*>([\s\S]*?)<\/svg>\s*<\/svg>/)[1].trim();
const MARK_TILE = MARK_FILE.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
const MARK_COLOURS = ['#0f0d0b', '#e9cba2', '#e8a23c', '#c77a3a', '#b06240', '#f4f1ea', '#1b1712'];
const ALLOWED = new Set([WHITE, BLACK, ...Object.values(PAL).flatMap((p) => [p.ground, p.text, p.accent, p.line]), ...MARK_COLOURS].map((h) => h.toLowerCase()));

// ------------------------------------------------------------------ type
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&family=Caveat:wght@500&display=swap';
const FACE = {
  serif: { family: "'Instrument Serif', Georgia, serif", weight: 400, m: 'serif' },
  sans: { family: "'Instrument Sans', system-ui, sans-serif", weight: 400, m: 'sans400' },
  sansM: { family: "'Instrument Sans', system-ui, sans-serif", weight: 500, m: 'sans500' },
  sansB: { family: "'Instrument Sans', system-ui, sans-serif", weight: 600, m: 'sans600' },
  mono: { family: "'IBM Plex Mono', ui-monospace, monospace", weight: 500, m: 'mono' },
  hand: { family: "'Caveat', cursive", weight: 500, m: 'hand' },
};
function textWidth(str, face, size, track = 0) {
  const M = METRICS[FACE[face].m];
  let w = 0;
  const chars = [...String(str)];
  for (const ch of chars) {
    const c = ch.charCodeAt(0);
    w += c >= 32 && c < 127 ? M.adv[c - 32] : M.ex[ch] ?? 600;
  }
  return (w / 1000) * size + track * size * Math.max(0, chars.length - 1);
}
function wrap(text, face, size, maxW, track = 0) {
  const lines = [];
  for (const w of String(text).trim().split(/\s+/)) {
    const last = lines[lines.length - 1];
    if (last !== undefined && textWidth(`${last} ${w}`, face, size, track) <= maxW) lines[lines.length - 1] = `${last} ${w}`;
    else lines.push(w);
  }
  return lines;
}
function balance(text, face, size, maxW, track = 0) {
  const n = wrap(text, face, size, maxW, track).length;
  if (n < 2) return wrap(text, face, size, maxW, track);
  let m = maxW;
  while (m > maxW * 0.45 && wrap(text, face, size, m - 4, track).length === n) m -= 4;
  return wrap(text, face, size, m, track);
}
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const r1 = (n) => Math.round(n * 10) / 10;
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
// A thread of talk: an ink path from a to b that loops like joined-up handwriting (a prolate cycloid along
// the way), then runs straight for the last share: speech arriving, then settling.
function loopy(a, b, { loops = 3, r = 40, tail = 0.3, side = 1, bend = 0 } = {}) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], n = [-u[1] * side, u[0] * side];
  const Lp = L * (1 - tail), A = Lp / (2 * Math.PI * loops), B = Math.min(r, A * 2.2);
  const pts = [];
  const N = loops * 26;
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * 2 * Math.PI * loops;
    const along = A * th - B * Math.sin(th);
    const off = B * (1 - Math.cos(th)) + bend * Math.sin((Math.PI * along) / L);
    pts.push([a[0] + u[0] * along + n[0] * off, a[1] + u[1] * along + n[1] * off]);
  }
  pts.push(b);
  return pts;
}
// A smooth cubic from a to b (control points c1, c2), sampled.
function cubic(a, c1, c2, b, n = 40) {
  return Array.from({ length: n + 1 }, (_, i) => { const t = i / n, s = 1 - t; return [0, 1].map((k) => s * s * s * a[k] + 3 * s * s * t * c1[k] + 3 * s * t * t * c2[k] + t * t * t * b[k]); });
}
const readingMs = (n) => Math.round(1000 * Math.max(1.5, 0.375 * n + 0.5)); // media.json -> video -> on-screen-time

// ------------------------------------------------------------------ a piece
class Piece {
  constructor({ id, dir, W, H, palette, safe, title, format, composition, finding }) {
    Object.assign(this, { id, dir, W, H, P: palette, title, format, composition, finding });
    this.S = Math.min(W, H);
    this.k = this.S / 400; // art.json lengths are on a 400-unit artboard
    this.lw = (ART.line.widthPct / 100) * this.S;
    this.lwS = (ART.line.widthSmall / 400) * this.S;
    this.safe = safe || { x: 0.063 * W, y: 0.035 * H, x2: W - 0.063 * W, y2: H - 0.035 * H };
    this.parts = [];
    this.css = [];
    this.texts = [];
    this.problems = [];
    this.seed = 1;
  }
  c(s) { return `tz2-${this.id}-${s}`; }
  add(s) { this.parts.push(s); return s; }

  // One block of lines. y is the first baseline. Returns the box.
  text(lines, { x, y, face = 'sans', size, lead = 1.25, fill, anchor = 'start', track = 0, cls = '', check = true, italic = false, raw = false }) {
    if (!Array.isArray(lines)) lines = [lines];
    const f = FACE[face];
    const ls = track ? ` letter-spacing="${r1(track * size)}"` : '';
    const ta = anchor !== 'start' ? ` text-anchor="${anchor}"` : '';
    const it = italic ? ' font-style="italic"' : '';
    const body = lines.map((l, i) => `<tspan x="${r1(x)}" y="${r1(y + i * size * lead)}">${raw ? l : esc(l)}</tspan>`).join('');
    const s = `<text${cls ? ` class="${cls}"` : ''} font-family="${esc(f.family)}" font-weight="${f.weight}" font-size="${r1(size)}"${ls}${ta}${it} fill="${fill || this.P.text}">${body}</text>`;
    const w = Math.max(...lines.map((l) => textWidth(raw ? l.replace(/<[^>]+>/g, '') : l, face, size, track)));
    const x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
    const cap = METRICS[f.m].cap;
    const box = { x: x0, y: y - cap * size, w, h: cap * size + (lines.length - 1) * size * lead + size * 0.24, lines, size, face, svg: s };
    if (check) this.texts.push(box);
    return box;
  }
  put(box) { this.add(box.svg); return box; }
  label(str, x, y, { size, fill, anchor } = {}) {
    return this.put(this.text(str.toUpperCase(), { x, y, face: 'mono', size: size || 0.022 * this.S, track: 0.14, fill, anchor }));
  }

  ink(pts, { w = this.lw, color = this.P.line, wobble = ART.line.wobble, segment = ART.line.segment, seed, cls = '', closed = false, draw = false } = {}) {
    const d = inkLine(pts, { wobble: wobble * this.k, segment: segment * this.k, seed: seed ?? this.seed++, closed });
    return this.add(`<path${cls ? ` class="${cls}"` : ''} d="${d}" fill="none" stroke="${color}" stroke-width="${r1(w)}" stroke-linecap="round" stroke-linejoin="round"${draw ? ' pathLength="1"' : ''}/>`);
  }
  // A cut-paper full stop: the one accent object.
  dot(x, y, r, { fill = this.P.accent, cls = '', seed } = {}) {
    return this.add(`<path${cls ? ` class="${cls}"` : ''} d="${blob(x, y, r, r * 0.96, { points: 7, irregularity: 0.07, seed: seed ?? this.seed++ })}" fill="${fill}"/>`);
  }
  paper(pts, { fill = this.P.paper, radius = 0.06 * this.S, jitter = 0.006 * this.S, seed, cls = '' } = {}) {
    return this.add(`<path${cls ? ` class="${cls}"` : ''} d="${paperPolygon(pts, { jitter, radius, seed: seed ?? this.seed++ })}" fill="${fill}"/>`);
  }
  rect(x, y, w, h, opts = {}) { return this.paper([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], opts); }

  // The original mark. mode: 'inner' (the site's header/og use, on dark grounds), 'light' (keycaps in the
  // site's ink #1B1712, as the site does on light grounds) or 'tile' (favicon.svg unchanged, the app icon).
  mark(x, y, h, mode = 'inner', cls = '') {
    const c = cls ? ` class="${cls}"` : '';
    if (mode === 'tile') return this.add(`<svg${c} x="${r1(x)}" y="${r1(y)}" width="${r1(h)}" height="${r1(h)}" viewBox="0 0 1000 1000" aria-hidden="true">${MARK_TILE}</svg>`);
    const w = (h * 680) / 512;
    const inner = mode === 'light' ? MARK_INNER.replace(/fill="#F4F1EA"/g, 'fill="#1B1712"') : MARK_INNER;
    this.add(`<svg${c} x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" viewBox="170 228 680 512" aria-hidden="true">${inner}</svg>`);
    return { x, y, w, h };
  }
  // Mark + name, the brand next to the headline (O4). y is the name's baseline.
  lockup(x, y, size, { mode, fill, cls = '' } = {}) {
    mode = mode || (this.P.mode === 'dark' ? 'inner' : 'tile');
    const h = mode === 'tile' ? size * 1.5 : size * 1.25;
    const g = [];
    const keep = this.parts.length;
    const m = this.mark(x, y - h * (mode === 'tile' ? 0.78 : 0.86), h, mode);
    const tx = x + (m.w || h) + size * 0.45;
    const t = this.text('Tailzu', { x: tx, y, face: 'sansB', size, fill });
    this.add(t.svg);
    const out = this.parts.splice(keep);
    this.add(`<g${cls ? ` class="${cls}"` : ''}>${out.join('')}</g>`);
    return { x, y: y - h, w: tx - x + t.w, h };
  }
  button(label, x, y, size, { fill = this.P.text, color = this.P.ground, cls = '' } = {}) {
    const t = this.text(label, { x: x + size * 1.1, y: y + size * 1.32, face: 'sansB', size, fill: color });
    const w = t.w + size * 2.2, h = size * 2.1;
    this.add(`<g${cls ? ` class="${cls}"` : ''}><rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${r1(h / 2)}" fill="${fill}"/>${t.svg}</g>`);
    return { x, y, w, h };
  }
  // Proof-reader's marks, drawn in the ink line over a hand-set word.
  strike(x0, x1, yc, h, opts = {}) {
    // A delete mark: a thin line through the word, ending in a pigtail loop above its end.
    const L = [[x0 - h * 0.1, yc + h * 0.04], [(x0 + x1) / 2, yc - h * 0.02], [x1 + h * 0.02, yc - h * 0.06], [x1 + h * 0.3, yc - h * 0.3], [x1 + h * 0.42, yc + h * 0.02], [x1 + h * 0.26, yc + h * 0.2], [x1 + h * 0.14, yc - h * 0.04], [x1 + h * 0.3, yc - h * 0.3], [x1 + h * 0.46, yc - h * 0.5]];
    return this.ink(L, { w: this.lwS * 0.55, segment: 4, wobble: 0.5, ...opts });
  }
  caret(x, base, h, opts = {}) {
    // An insert mark under the line, the comma to insert above it.
    this.ink([[x - h * 0.22, base + h * 0.5], [x, base + h * 0.12], [x + h * 0.22, base + h * 0.5]], { w: this.lwS * 0.5, segment: 4, wobble: 0.4, ...opts });
    this.dot(x + h * 0.02, base - h * 0.05, h * 0.09, { fill: opts.color || this.P.line, cls: opts.cls || '' });
    return this.ink([[x + h * 0.1, base - h * 0.05], [x + h * 0.06, base + h * 0.18], [x - h * 0.06, base + h * 0.3]], { w: this.lwS * 0.4, segment: 3, wobble: 0.2, ...opts });
  }
  capMark(x0, x1, base, h, opts = {}) {
    // Capitalise: three short lines under the letter.
    for (let i = 0; i < 3; i++) this.ink([[x0 - h * 0.05, base + h * (0.22 + i * 0.17)], [x1 + h * 0.05, base + h * (0.22 + i * 0.17)]], { w: this.lwS * 0.32, segment: 6, wobble: 0.35, ...opts });
  }
  underline(x0, x1, y, opts = {}) {
    return this.ink([[x0, y], [(x0 + x1) / 2, y + 2], [x1, y - 1]], { w: this.lwS, segment: 10, wobble: 1, ...opts });
  }

  svg() {
    const t = this.c('title');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.W} ${this.H}" width="${this.W}" height="${this.H}" class="${this.c('root')}" role="img" aria-labelledby="${t}">` +
      `<title id="${t}">${esc(this.title)}</title>` +
      `<style>@import url("${FONT_URL.replace(/&/g, '&amp;')}");</style>` +
      (this.css.length ? `<style>${this.css.join('\n')}</style>` : '') +
      `<rect width="${this.W}" height="${this.H}" fill="${this.P.ground}"/>` + this.parts.join('') + `</svg>\n`;
  }
  check() {
    const s = this.safe, out = [];
    for (const t of this.texts) if (t.x < s.x - 1 || t.y < s.y - 1 || t.x + t.w > s.x2 + 1 || t.y + t.h > s.y2 + 1) out.push(`text "${t.lines.join(' / ').slice(0, 40)}" leaves the safe area`);
    for (let i = 0; i < this.texts.length; i++) for (let j = i + 1; j < this.texts.length; j++) {
      const a = this.texts[i], b = this.texts[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h && !a.stack && !b.stack) out.push(`text "${a.lines[0]}" overlaps "${b.lines[0]}"`);
    }
    for (const h of new Set(this.svg().match(/#[0-9a-fA-F]{6}\b/g) || [])) if (!ALLOWED.has(h.toLowerCase())) out.push(`colour ${h} is not in the palette`);
    return out.concat(this.problems);
  }
}

// ------------------------------------------------------------------ motion helpers
const SPRING = Object.fromEntries(Object.entries(springs).map(([k, v]) => [k, v]));
const EASE = Object.fromEntries(Object.entries(MOTION.easings).map(([k, v]) => [k, v.css]));
// A one-shot timeline: every animated element shares one duration TOTAL and is keyed by percentages.
// The un-animated state of every element IS the final frame (title-card.mjs rule), so a player without
// CSS animation, a screenshot or prefers-reduced-motion all show the finished poster.
class Timeline {
  constructor(piece, total) { Object.assign(this, { p: piece, total, n: 0 }); }
  pct(ms) { return r1(Math.max(0, Math.min(100, (ms / this.total) * 100))); }
  // kf: [[ms, 'css declarations', 'easing to the next stop'?], ...]
  anim(cls, kf, extra = '') {
    const name = this.p.c(`k${this.n++}`);
    const stops = kf.map(([ms, decl, ease]) => `${this.pct(ms)}%{${decl}${ease ? `;animation-timing-function:${ease}` : ''}}`).join('');
    this.p.css.push(`@keyframes ${name}{${stops}}`);
    this.p.css.push(`.${this.p.c('root')} .${cls}{animation:${name} ${this.total}ms linear both;${extra}}`);
  }
  // Appear once at `at` with a rise, stay.
  rise(cls, at, { dist = 24, spring = 'gentle' } = {}) {
    const s = SPRING[spring];
    this.anim(cls, [[0, `opacity:0;transform:translateY(${dist}px)`], [at, `opacity:0;transform:translateY(${dist}px)`, s.easing], [at + s.duration, 'opacity:1;transform:none'], [this.total, 'opacity:1;transform:none']]);
    return at + s.duration;
  }
  pop(cls, at, { spring = 'lively' } = {}) {
    const s = SPRING[spring];
    this.anim(cls, [[0, 'transform:scale(0)'], [at, 'transform:scale(0)', s.easing], [at + s.duration, 'transform:scale(1)'], [this.total, 'transform:scale(1)']], 'transform-box:fill-box;transform-origin:center');
    return at + s.duration;
  }
  draw(cls, at, dur = MOTION.moves.draw.duration) {
    this.anim(cls, [[0, 'stroke-dashoffset:1'], [at, 'stroke-dashoffset:1', EASE.draw], [at + dur, 'stroke-dashoffset:0'], [this.total, 'stroke-dashoffset:0']], 'stroke-dasharray:1');
    return at + dur;
  }
  // Visible from `at` to `until` (rise in, accelerate out), hidden in the final frame.
  visit(cls, at, until, { dist = 24 } = {}) {
    const s = SPRING.gentle;
    this.p.css.push(`.${this.p.c('root')} .${cls}{opacity:0}`); // not in the final frame
    this.anim(cls, [[0, `opacity:0;transform:translateY(${dist}px)`], [at, `opacity:0;transform:translateY(${dist}px)`, s.easing], [at + s.duration, 'opacity:1;transform:none'], [until, 'opacity:1;transform:none', EASE.exit], [until + 250, `opacity:0;transform:translateY(-${dist / 2}px)`], [this.total, `opacity:0;transform:translateY(-${dist / 2}px)`]]);
  }
  finish() {
    this.p.css.push(`.${this.p.c('root')} *{animation-fill-mode:both}`);
    this.p.css.push(`@media (prefers-reduced-motion:reduce){.${this.p.c('root')} *{animation:none!important}}`);
  }
}

// ------------------------------------------------------------------ shared drawing: the said line with its proof marks
// Sets the said sentence in Caveat and draws the marks Tailzu's cleaning would make:
// delete the fillers, insert commas, capitalise the first word and names. Returns positions.
function saidLine(p, { said, x, y, size, maxW, deletes = [], commas = [], caps = [], fill, cls = {} }) {
  const lines = wrap(said, 'hand', size, maxW);
  const box = p.put(p.text(lines, { x, y, face: 'hand', size, lead: 1.18, fill, cls: cls.text || '' }));
  // Word positions, for the marks.
  const pos = [];
  lines.forEach((line, li) => {
    let cx = x;
    for (const w of line.split(' ')) {
      const ww = textWidth(w, 'hand', size);
      pos.push({ w, x0: cx, x1: cx + ww, base: y + li * size * 1.18 });
      cx += ww + textWidth(' ', 'hand', size);
    }
  });
  const h = size * 0.62; // Caveat x-height-ish
  const marks = [];
  for (const i of deletes) { const q = pos[i]; marks.push(p.strike(q.x0, q.x1, q.base - h * 0.45, h, { cls: cls.mark ? `${cls.mark} ${cls.mark}-d${i}` : '', draw: !!cls.mark })); }
  for (const i of commas) { const q = pos[i]; p.caret(q.x1 + textWidth(' ', 'hand', size) * 0.45, q.base, h, { cls: cls.mark ? `${cls.mark} ${cls.mark}-c${i}` : '', draw: !!cls.mark }); }
  for (const i of caps) { const q = pos[i]; p.capMark(q.x0, q.x0 + textWidth(q.w[0], 'hand', size), q.base, h, { cls: cls.mark ? `${cls.mark} ${cls.mark}-u${i}` : '', draw: !!cls.mark }); }
  return { box, pos, lines };
}
// The written line in the serif, its full stop as a cut-paper dot in the accent.
function writtenLine(p, { text, x, y, size, maxW, fill, cls = '', dotCls = '', underline = [], lead = 1.02, anchor = 'start' }) {
  const lines = balance(text, 'serif', size, maxW, -0.01);
  const box = p.put(p.text(lines, { x, y, face: 'serif', size, lead, fill, track: -0.01, cls }));
  const last = lines[lines.length - 1];
  const lx = x + textWidth(last, 'serif', size, -0.01);
  const ly = y + (lines.length - 1) * size * lead;
  const r = size * 0.085;
  p.dot(lx + r * 1.35, ly - r * 1.05, r, { cls: dotCls });
  // Kept words: underlined in ink, never coloured (the site's rule).
  for (const word of underline) {
    lines.forEach((line, li) => {
      const i = line.indexOf(word);
      if (i < 0) return;
      const ux = x + textWidth(line.slice(0, i), 'serif', size, -0.01);
      p.underline(ux, ux + textWidth(word, 'serif', size, -0.01), y + li * size * lead + size * 0.14, { w: p.lwS * 0.9 });
    });
  }
  return { box, lines, end: [lx + r * 2.4, ly] };
}

const pieces = [];
const make = (o) => { const p = new Piece(o); pieces.push(p); return p; };

// ================================================================== 1. Said → Written series (type-led)
// Research: type-led composition (pop-out, first-glance); handwriting human-presence (said) vs
// credibility-cost and fluency-cost (written, names, numbers).
const SW = copy('said-written.copy.json');
const SW_MARKS = {
  'sw-1-haan': { deletes: [1], commas: [], caps: [0], underline: [] },
  'sw-2-names': { deletes: [0], commas: [], caps: [1], underline: ['Ramesh'] },
  'sw-3-both': { deletes: [0], commas: [], caps: [1], underline: [] },
};
function swPost(c, { motion = false, id = c.piece, dir = 'social' } = {}) {
  const P = PAL[c.palette];
  const W = 1080, H = 1350;
  const p = make({ id, dir, W, H, palette: P, title: `Tailzu. ${c.headline} Said: ${c.said}. Written: ${c.written}.`, format: c.format, composition: 'type-led', finding: 'pop-out, first-glance; handwriting: human-presence vs credibility-cost' });
  const m = 86; // 8% grid margin
  const M = SW_MARKS[c.piece] || SW_MARKS['sw-1-haan'];
  const cl = (s) => (motion ? p.c(s) : '');
  // Labels and the said line.
  const said = 80, written = 156, head = 70, small = 24;
  p.put(p.text('SAID', { x: m, y: 168, face: 'mono', size: small, track: 0.16, cls: cl('l1') }));
  const sl = saidLine(p, { said: c.said, x: m, y: 168 + said * 1.15, size: said, maxW: W - 2 * m, ...M, fill: P.text, cls: motion ? { text: p.c('said'), mark: p.c('mk') } : {} });
  if (motion) p.add(`<rect class="${p.c('cover')}" x="${m - 10}" y="${r1(sl.box.y - said * 0.35)}" width="${r1(W - 2 * m + 60)}" height="${r1(sl.box.h + said * 0.75)}" fill="${P.ground}"/>`);
  // One line of talk loops down from the said line and settles flat under WRITTEN: hand in, type out.
  const ys = sl.box.y + sl.box.h + 40;
  const yw = 700;
  p.ink(loopy([m + 6, ys + 6], [W + 30, ys + 40], { loops: 4, r: 46, tail: 0.32, side: 1 }), { w: p.lwS * 0.8, cls: cl('thread'), draw: motion, seed: 40, segment: 3, wobble: 0.35 });
  p.put(p.text('WRITTEN', { x: m, y: yw - 170, face: 'mono', size: small, track: 0.16, cls: cl('l2') }));
  const wl = writtenLine(p, { text: c.written, x: m, y: yw, size: written, maxW: W - 2 * m, fill: P.text, cls: cl('written'), dotCls: cl('dot'), underline: M.underline });
  // Headline and brand, at the foot, on one edge (O4: brand beside the headline).
  const hl = balance(c.headline, 'serif', head, W - 2 * m - 20);
  const hy = H - m - 96 - (hl.length - 1) * head * 1.02 - (c.subhead ? 52 : 0);
  p.put(p.text(hl, { x: m, y: hy, face: 'serif', size: head, lead: 1.02, cls: cl('head') }));
  if (c.subhead) p.put(p.text(c.subhead, { x: m, y: hy + (hl.length - 1) * head * 1.02 + 56, face: 'sans', size: small * 1.25, cls: cl('sub') }));
  p.lockup(m, H - m - 6, small * 1.2, { cls: cl('brand') });
  if (motion) {
    const tl = new Timeline(p, 12600);
    let t = 600;
    t = tl.rise(p.c('l1'), t, { dist: 12 });
    // The hand writes: the cover lifts left to right at handwriting speed (one mover).
    p.css.push(`.${p.c('root')} .${p.c('cover')}{transform:scaleX(0);transform-box:fill-box;transform-origin:right center}`);
    tl.anim(p.c('cover'), [[0, 'transform:scaleX(1)'], [t, 'transform:scaleX(1)', 'cubic-bezier(0.45,0.05,0.55,0.95)'], [t + 1700, 'transform:scaleX(0)'], [tl.total, 'transform:scaleX(0)']], 'transform-box:fill-box;transform-origin:right center');
    t += 1700 + readingMs(words(c.said));
    for (const cls of [...new Set([...p.parts.join('').matchAll(new RegExp(`${p.c('mk')}-[duc]\\d+`, 'g'))].map((x) => x[0]))]) { t = tl.draw(cls, t, 500) + 120; }
    t = tl.draw(p.c('thread'), t + 100, 900) + 100;
    t = tl.rise(p.c('l2'), t, { dist: 12 });
    t = tl.rise(p.c('written'), t - 200, { dist: 36 });
    t = tl.pop(p.c('dot'), t + 150) + 300;
    t = tl.rise(p.c('head'), t);
    tl.finish();
    p.css.push(`.${p.c('mk')}{stroke-dasharray:1}`);
    p.frames = [1700, 3400, 7000, 9000, 12600];
    p.end = t;
  }
  return p;
}
for (const c of SW) swPost(c);

// ================================================================== 2. Tone carousel (one story across six slides)
// Research: grid-of-n (grouping, scan-patterns) for the tone pairs; single-focal hook; stacked CTA.
// One ink thread crosses every slide edge at the same height, so the swipe reads as one line, and ends
// as the full stop of the last headline.
const TONES = copy('tones-carousel.copy.json');
{
  const W = 1080, H = 1350, m = 86, P = PAL.paper, small = 24;
  const TY = 1150; // the thread crosses every slide edge at this height
  TONES.forEach((c, i) => {
    const p = make({ id: c.piece, dir: 'social', W, H, palette: P, title: `Tailzu carousel ${i + 1} of 6. ${c.headline}`, format: c.format, composition: i === 0 ? 'single-focal' : i === 5 ? 'stacked' : 'grid-of-n', finding: i === 0 ? 'centre-bias, pop-out' : i === 5 ? 'touch-centre, grouping' : 'grouping, scan-patterns' });
    p.label(c.label, m, H - m + 10, { size: small });
    p.lockup(W - m - 172, H - m + 10, small * 1.1);
    if (i === 0) {
      // Hook: the rough message, typed in a hurry, on a paper field. The thread of talk leaves it.
      const hl = balance(c.headline, 'serif', 104, W - 2 * m);
      p.put(p.text(hl, { x: m, y: 210, face: 'serif', size: 104, lead: 0.98 }));
      const fy = 520, fh = 330;
      p.rect(m, fy, W - 2 * m, fh, { radius: 36, seed: 3 });
      p.put(p.text('THE MESSAGE', { x: m + 48, y: fy + 72, face: 'mono', size: small, track: 0.16, fill: BLACK }));
      p.put(p.text(wrap(c.rough, 'mono', 52, W - 2 * m - 110), { x: m + 48, y: fy + 160, face: 'mono', size: 52, lead: 1.3, fill: BLACK }));
      p.ink([[m + 120, fy + fh - 6], ...cubic([m + 120, fy + fh + 10], [m + 110, TY - 40], [m + 220, TY], [m + 340, TY], 20), ...loopy([m + 360, TY], [W + 30, TY], { loops: 3, r: 80, tail: 0.15, side: -1 }).slice(1)], { seed: 70, segment: 3, wobble: 0.35 });
      p.add(`<text x="${m + 120}" y="${H - m + 10}" font-family="${FACE.mono.family}" font-weight="500" font-size="${small}" letter-spacing="3.4" fill="${P.text}">SWIPE →</text>`);
    } else if (i < 5) {
      const hl = balance(c.headline, 'serif', 76, W - 2 * m);
      p.put(p.text(hl, { x: m, y: 178, face: 'serif', size: 76, lead: 1.0 }));
      let y = 178 + (hl.length - 1) * 76 + 80;
      c.tones.forEach(([tone, line], j) => {
        const ll = balance(line, 'serif', 66, W - 2 * m - 120);
        const ch = 120 + ll.length * 70 + 20;
        const x = m + (j ? 50 : 0), w = W - 2 * m - 50;
        p.rect(x, y, w, ch, { radius: 32, seed: 10 + i * 3 + j });
        p.put(p.text(tone.toUpperCase(), { x: x + 48, y: y + 70, face: 'mono', size: small, track: 0.16, fill: BLACK }));
        p.put(p.text(ll, { x: x + 48, y: y + 150, face: 'serif', size: 66, lead: 1.06, fill: BLACK }));
        y += ch + 36;
      });
      // The same thread runs on underneath, one new loop per slide.
      p.ink(loopy([-30, TY], [W + 30, TY], { loops: i % 2 ? 4 : 5, r: 84, tail: 0.0, side: -1 }), { seed: 80 + i, segment: 3, wobble: 0.35 });
    } else {
      // CTA: the thread finally lands as the headline's full stop.
      const hl = balance(c.headline.replace(/\.$/, ''), 'serif', 112, W - 2 * m);
      const hy = 300;
      p.put(p.text(hl, { x: m, y: hy, face: 'serif', size: 112, lead: 0.98 }));
      const ly = hy + (hl.length - 1) * 110;
      const lx = m + textWidth(hl[hl.length - 1], 'serif', 112, 0);
      const dot = [lx + 22, ly - 9];
      p.put(p.text(c.body, { x: m, y: ly + 120, face: 'sans', size: 36 }));
      p.button(c.cta, m, ly + 180, 36, { fill: P.text, color: P.ground });
      p.ink([[-30, TY], ...loopy([-30, TY], [420, TY], { loops: 2, r: 80, tail: 0, side: -1 }).slice(1), ...cubic([420, TY], [860, TY], [dot[0] + 160, dot[1] + 380], [dot[0] + 30, dot[1] + 60], 30)], { seed: 95, segment: 3, wobble: 0.35 });
      p.dot(dot[0], dot[1], 15);
    }
  });
}

// ================================================================== 3. Moments (where it lands)
const MO = copy('moments.copy.json');
// 3a. Family: a drawn chat, single focal. Research: centre-bias, picture-superiority, MAYA.
{
  const c = MO[0], P = PAL[c.palette], W = 1080, H = 1080, m = 86;
  const p = make({ id: c.piece, dir: 'social', W, H, palette: P, title: `Tailzu. ${c.headline}`, format: c.format, composition: 'single-focal', finding: 'centre-bias, picture-superiority, maya' });
  const hl = balance(c.headline, 'serif', 76, 560);
  p.put(p.text(hl, { x: m, y: 160, face: 'serif', size: 76, lead: 1.02 }));
  p.lockup(m, 160 + (hl.length - 1) * 78 + 70, 26);
  // Incoming bubble (paper, left), with the contact's name in mono.
  p.put(p.text('MUMMY', { x: m + 4, y: 448, face: 'mono', size: 22, track: 0.16 }));
  const ib = { x: m, y: 474, w: 350, h: 110 };
  p.paper([[ib.x, ib.y], [ib.x + ib.w, ib.y], [ib.x + ib.w, ib.y + ib.h], [ib.x + 34, ib.y + ib.h], [ib.x - 6, ib.y + ib.h + 26]], { radius: [28, 28, 28, 14, 2], seed: 5 });
  p.put(p.text(c.incoming, { x: ib.x + 38, y: ib.y + 70, face: 'sans', size: 42, fill: BLACK }));
  // What was said: the one hand note; its thread of talk loops down into the reply.
  const nb = p.put(p.text(c.note, { x: 470, y: 616, face: 'hand', size: 58, fill: P.text }));
  // The reply (paper, right): clean Hinglish, its full stop is the accent.
  const rl = wrap(c.written, 'sans', 46, 560);
  const rb = { x: W - m - 640, y: 740, w: 640, h: 70 + rl.length * 60 + 30 };
  p.paper([[rb.x, rb.y], [rb.x + rb.w, rb.y], [rb.x + rb.w + 22, rb.y + rb.h + 20], [rb.x + rb.w - 36, rb.y + rb.h], [rb.x, rb.y + rb.h]], { radius: [30, 30, 2, 14, 30], seed: 9 });
  p.put(p.text(rl, { x: rb.x + 44, y: rb.y + 82, face: 'sans', size: 46, lead: 1.3, fill: BLACK }));
  const lx = rb.x + 44 + textWidth(rl[rl.length - 1], 'sans', 46);
  p.dot(lx + 10, rb.y + 82 + (rl.length - 1) * 60 - 5, 7.5);
  p.ink(loopy([nb.x + 10, nb.y + nb.h + 14], [rb.x + rb.w - 120, nb.y + nb.h + 30], { loops: 3, r: 34, tail: 0.1, side: 1 }).concat(cubic([rb.x + rb.w - 120, nb.y + nb.h + 30], [rb.x + rb.w - 40, nb.y + nb.h + 40], [rb.x + rb.w - 60, rb.y - 50], [rb.x + rb.w - 90, rb.y - 14], 14)), { w: p.lwS * 0.8, seed: 21, segment: 3, wobble: 0.35 });
}
// 3b. AI chat: the prompt box fills the frame, a solid band carries headline, brand and CTA.
// Research: full-bleed-band (picture-captures, grouping); credibility-cost (the prompt is in type).
{
  const c = MO[1], P = PAL[c.palette], W = 1080, H = 1350, m = 86;
  const p = make({ id: c.piece, dir: 'social', W, H, palette: P, title: `Tailzu. ${c.headline}`, format: c.format, composition: 'full-bleed-band', finding: 'picture-captures, grouping, banner-blindness' });
  // The ramble: a hand note and a tangle of ink arriving from the top edge.
  const nb = p.put(p.text(c.note, { x: m, y: 200, face: 'hand', size: 68, fill: P.text }));
  p.ink(loopy([m + 10, 262], [820, 270], { loops: 5, r: 40, tail: 0.05, side: 1 }).concat(cubic([820, 270], [960, 270], [930, 380], [880, 446], 16)), { w: p.lwS * 0.85, seed: 31, segment: 3, wobble: 0.35 });
  // The box.
  const bx = m, by = 450, bw = W - 2 * m, bh = 380;
  p.rect(bx, by, bw, bh, { radius: 40, seed: 33 });
  p.put(p.text('ASK ANYTHING', { x: bx + 48, y: by + 70, face: 'mono', size: 22, track: 0.16, fill: BLACK }));
  const pl = wrap(c.written, 'sans', 48, bw - 110);
  p.put(p.text(pl, { x: bx + 48, y: by + 150, face: 'sans', size: 48, lead: 1.3, fill: BLACK }));
  // Send button: the one accent object.
  const sx = bx + bw - 92, sy = by + bh - 92;
  p.add(`<path d="${blob(sx, sy, 44, 44, { points: 8, irregularity: 0.04, seed: 35 })}" fill="${P.accent}"/>`);
  p.ink([[sx, sy + 20], [sx, sy - 20]], { w: 7, color: WHITE, seed: 36, wobble: 0.4, segment: 6 });
  p.ink([[sx - 16, sy - 4], [sx, sy - 21], [sx + 16, sy - 4]], { w: 7, color: WHITE, seed: 37, wobble: 0.4, segment: 6 });
  // Band.
  const bandY = 940;
  p.add(`<rect x="0" y="${bandY}" width="${W}" height="${H - bandY}" fill="${P.text}"/>`);
  p.put(p.text(['Think out loud.', 'The prompt comes out clean.'], { x: m, y: bandY + 112, face: 'serif', size: 76, lead: 1.02, fill: P.ground }));
  p.lockup(m, H - m + 6, 28, { mode: 'tile', fill: P.ground });
  p.button(c.cta, W - m - 300, H - m - 40, 28, { fill: P.ground, color: P.text });
}
// 3c. Code editor: split, image top. Research: split (picture-captures), animation-congruence of the
// still (the words land where the cursor is), credibility-cost (code in mono, never in the hand).
{
  const c = MO[2], P = PAL[c.palette], W = 1080, H = 1350, m = 86;
  const p = make({ id: c.piece, dir: 'social', W, H, palette: P, title: `Tailzu. ${c.headline}`, format: c.format, composition: 'split', finding: 'split: picture-captures, left-lean; credibility-cost' });
  const ex = m, ey = 250, ew = 800, eh = 520;
  // Editor window drawn in the ink line: rounded, one tab.
  const nb = p.put(p.text(c.note, { x: m + 10, y: 160, face: 'hand', size: 64, fill: P.text }));
  p.ink([[ex + 24, ey], [ex + ew - 24, ey], [ex + ew, ey + 24], [ex + ew, ey + eh - 24], [ex + ew - 24, ey + eh], [ex + 24, ey + eh], [ex, ey + eh - 24], [ex, ey + 24], [ex + 24, ey]], { w: p.lwS * 0.7, segment: 30, wobble: 0.6, seed: 50 });
  p.ink([[ex + 2, ey + 88], [ex + ew - 2, ey + 88]], { w: p.lwS * 0.5, segment: 30, wobble: 0.4, seed: 51 });
  p.put(p.text('upload.ts', { x: ex + 40, y: ey + 60, face: 'mono', size: 26 }));
  const code = [['1', 'export async function upload(file) {'], ['2', '  const res = await send(file)'], ['3', ''], ['4', '  return res'], ['5', '}']];
  const cw = 0.6 * 26;
  code.forEach(([n, line], i) => {
    const y = ey + 160 + i * 70;
    p.put(p.text(n, { x: ex + 36, y, face: 'mono', size: 26 }));
    const ind = line.match(/^ */)[0].length;
    if (line) p.put(p.text(line.trim(), { x: ex + 90 + ind * cw, y, face: 'mono', size: 26 }));
  });
  // The said words land at the cursor on line 3, in the editor's mono; the caret is the accent.
  const y3 = ey + 160 + 2 * 70;
  const t3 = p.put(p.text(c.written, { x: ex + 90 + 2 * cw, y: y3, face: 'mono', size: 26 }));
  const cx = t3.x + t3.w + 8;
  p.add(`<rect x="${r1(cx)}" y="${r1(y3 - 26)}" width="5" height="34" rx="2" fill="${P.accent}"/>`);
  // The thread of talk loops from the note, down the gutter, and comes in level to the cursor.
  p.ink(loopy([nb.x + nb.w + 30, 150], [W - 70, 170], { loops: 3, r: 46, tail: 0.1, side: -1 }).concat(cubic([W - 70, 170], [W - 30, 300], [W - 40, y3 - 12], [W - 160, y3 - 12], 16), [[cx + 40, y3 - 12]]), { w: p.lwS * 0.8, seed: 52, segment: 3, wobble: 0.35 });
  // Words below.
  const hl = balance(c.headline, 'serif', 84, W - 2 * m - 80);
  p.put(p.text(hl, { x: m, y: 960, face: 'serif', size: 84, lead: 1.0 }));
  p.put(p.text(c.subhead, { x: m, y: 960 + (hl.length - 1) * 84 + 80, face: 'sans', size: 34 }));
  p.lockup(m, H - m - 4, 28);
}

// ================================================================== 4. LinkedIn: kept (long copy, dark on light)
// Research: long-copy (picture-captures, line-length), credibility-cost: the hand points at the number,
// it is never the number.
{
  const c = copy('linkedin-kept.copy.json'), P = PAL[c.palette], W = 1080, H = 1350, m = 86;
  const p = make({ id: c.piece, dir: 'social', W, H, palette: P, title: `Tailzu. ${c.headline}`, format: c.format, composition: 'long-copy', finding: 'long-copy: picture-captures, line-length; credibility-cost' });
  // Picture: the written sentence on paper, kept words underlined, a hand note pointing at them.
  const px = m, py = 120, pw = W - 2 * m, ph = 380;
  p.rect(px, py, pw, ph, { radius: 30, seed: 61 });
  p.put(p.text('WRITTEN', { x: px + 48, y: py + 70, face: 'mono', size: 22, track: 0.16, fill: BLACK }));
  const wl = balance(c.written, 'serif', 84, pw - 120, -0.01);
  p.put(p.text(wl, { x: px + 48, y: py + 180, face: 'serif', size: 84, lead: 1.05, track: -0.01, fill: BLACK }));
  const ul = (word, li) => { const line = wl[li]; const i = line.indexOf(word); if (i < 0) return null; const x0 = px + 48 + textWidth(line.slice(0, i), 'serif', 84, -0.01); const x1 = x0 + textWidth(word, 'serif', 84, -0.01); p.underline(x0, x1, py + 180 + li * 88 + 14, { color: BLACK, w: p.lwS }); return [x0, x1, py + 180 + li * 88 + 14]; };
  let a = null, b = null;
  wl.forEach((_, li) => { a = a || ul('2500 rupees', li); b = b || ul('Ramesh', li); });
  const last = wl[wl.length - 1];
  p.dot(px + 48 + textWidth(last, 'serif', 84, -0.01) + 12, py + 180 + (wl.length - 1) * 88 - 8, 7.5);
  // The note and its arrows (the hand points; the type is the fact).
  const nx = px + pw - 470, ny = py + ph + 90;
  p.put(p.text(c.note, { x: nx, y: ny, face: 'hand', size: 50, fill: P.text }));
  if (b) p.ink([[nx - 12, ny - 30], [b[1] - 40, ny - 70], [(b[0] + b[1]) / 2, b[2] + 24]], { w: p.lwS, seed: 63 });
  // Headline, subhead, body, CTA, brand: one edge, dark on light.
  const hy = 760;
  const hl = ['Your words, minus the ums.', 'Nothing else changes.'];
  p.put(p.text(hl, { x: m, y: hy, face: 'serif', size: 76, lead: 1.02 }));
  const sy = hy + (hl.length - 1) * 78 + 68;
  p.put(p.text(c.subhead, { x: m, y: sy, face: 'sansM', size: 32 }));
  p.put(p.text(wrap(c.body, 'sans', 32, 860), { x: m, y: sy + 56, face: 'sans', size: 32, lead: 1.42 }));
  p.lockup(m, H - m + 2, 28);
  p.button(c.cta, W - m - 330, H - m - 52, 28, { fill: P.text, color: P.ground });
}

// ================================================================== 5. Stories with a sticker zone (stacked)
// Safe area: top 14%, bottom 35%, sides 6% (layout.json -> safeAreas.story). Text and the sticker zone
// stay inside; only art bleeds into the overlay zones. Research: stacked (touch-centre, centre-bias).
const ST = copy('stories.copy.json');
const storySafe = { x: 0.06 * 1080, y: 0.14 * 1920, x2: 1080 - 0.06 * 1080, y2: 1920 - 0.35 * 1920 };
{
  const c = ST[0], P = PAL[c.palette], W = 1080, H = 1920, m = 86;
  const p = make({ id: c.piece, dir: 'social', W, H, palette: P, safe: storySafe, title: `Tailzu. ${c.headline}`, format: c.format, composition: 'stacked', finding: 'touch-centre, centre-bias; familiar-hand' });
  p.lockup(m, 332, 26);
  const hl = balance(c.headline, 'serif', 96, W - 2 * m);
  p.put(p.text(hl, { x: m, y: 470, face: 'serif', size: 96, lead: 1.0 }));
  // Poll sticker zone: x 86-994, y 820-1010 (kept empty). A hand arrow points into it.
  p.zone = { x: m, y: 830, w: W - 2 * m, h: 190, sticker: 'poll', options: c.poll };
  p.put(p.text('be honest', { x: W - m - 230, y: 760, face: 'hand', size: 56, fill: P.text }));
  p.ink([[W - m - 250, 742], [W - m - 330, 760], [W - m - 380, 812]], { w: p.lwS, seed: 71 });
  p.button(c.cta, m, 1110, 34, { fill: P.text, color: P.ground });
  // Art in the lower overlay zone: a rough thread of talk that settles into one straight line and a full stop.
  p.ink(loopy([-30, 1500], [W - m - 40, 1500], { loops: 4, r: 60, tail: 0.4, side: -1 }), { seed: 72, segment: 3, wobble: 0.35 });
  p.dot(W - m - 12, 1494, 15);
}
{
  const c = ST[1], P = PAL[c.palette], W = 1080, H = 1920, m = 86;
  const p = make({ id: c.piece, dir: 'social', W, H, palette: P, safe: storySafe, title: `Tailzu. ${c.headline}`, format: c.format, composition: 'stacked', finding: 'touch-centre, centre-bias; handmade' });
  p.lockup(m, 336, 26);
  const hl = balance(c.headline, 'serif', 92, W - 2 * m);
  p.put(p.text(hl, { x: m, y: 470, face: 'serif', size: 92, lead: 1.0 }));
  const sy = 470 + (hl.length - 1) * 92 + 76;
  p.put(p.text(c.subhead, { x: m, y: sy, face: 'sans', size: 36 }));
  // The message you keep putting off: a paper bubble that has been "typing…" for days. One dot is the accent.
  const bx = m, by = sy + 70, bw = 330, bh = 130;
  p.paper([[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx + 20, by + bh], [bx - 4, by + bh + 26], [bx + 4, by + bh - 24]], { radius: [32, 32, 32, 20, 2, 20], seed: 81 });
  [0, 1, 2].forEach((i) => p.dot(bx + 90 + i * 76, by + bh / 2, 17, { fill: i === 2 ? P.accent : BLACK, seed: 82 + i }));
  // Question sticker zone: x 86-994, y 900-1130 (kept empty).
  p.zone = { x: m, y: by + bh + 70, w: W - 2 * m, h: 220, sticker: 'question' };
  p.button(c.cta, m, 1160, 32, { fill: P.text, color: P.ground });
  p.ink(loopy([bx + bw + 40, by + bh / 2], [W + 30, by + bh / 2], { loops: 3, r: 50, tail: 0.1, side: -1 }), { w: p.lwS, seed: 84, segment: 3, wobble: 0.35 });
}

// ================================================================== 6. Web: hero, banner, thumbnail
const WEB = copy('web.copy.json');
// Hero 16:9, split: words on the reading-start side, the river on the right (left-lean, banner-blindness).
{
  const c = WEB[0], P = PAL[c.palette], W = 1920, H = 1080, m = 0.08 * 1080;
  const p = make({ id: c.piece, dir: 'web', W, H, palette: P, title: `Tailzu. ${c.headline}`, format: c.format, composition: 'split', finding: 'left-lean, banner-blindness, first-glance', safe: { x: m, y: m, x2: W - m, y2: H - m } });
  p.lockup(m, 150, 30);
  const hl = balance(c.headline, 'serif', 112, 800);
  p.put(p.text(hl, { x: m, y: 330, face: 'serif', size: 112, lead: 1.0 }));
  const sy = 330 + (hl.length - 1) * 112 + 96;
  p.put(p.text(wrap(c.subhead, 'sans', 32, 720), { x: m, y: sy, face: 'sans', size: 32, lead: 1.45 }));
  p.button(c.cta, m, 790, 32, { fill: P.text, color: P.ground });
  p.put(p.text(c.body, { x: m + 340, y: 832, face: 'sans', size: 26 }));
  // The river (the site's own picture, in this style): threads of talk arrive from the top and right
  // edges and run, level, into the first letter of the written sentence. Hand in, type out.
  const C = [1070, 600];
  const starts = [[1110, -30], [1250, -30], [1390, -30], [1120, 1110], [1280, 1110], [1440, 1110]];
  starts.forEach((s0, i) => {
    const top = s0[1] < 0;
    const c1 = [s0[0] - 90 - (i % 3) * 30, top ? 330 + (i % 3) * 30 : 860 - (i % 3) * 30];
    const c2 = [C[0] - 200 + (i % 3) * 30, C[1] + (top ? -4 : 4) * (1 + (i % 3))];
    let pts = cubic(s0, c1, c2, C, 48);
    if (i === 1 || i === 4) pts = loopy(s0, pts[14], { loops: 2, r: 36, tail: 0.05, side: i === 1 ? 1 : -1 }).concat(pts.slice(15));
    p.ink(pts, { w: p.lwS * (i % 3 === 0 ? 0.9 : 0.6), seed: 100 + i, segment: 3, wobble: 0.35 });
  });
  p.put(p.text('WRITTEN', { x: C[0] + 24, y: C[1] - 110, face: 'mono', size: 22, track: 0.16 }));
  writtenLine(p, { text: 'Kal subah milte hain', x: C[0] + 24, y: C[1] + 34, size: 104, maxW: 780, fill: P.text });
  p.put(p.text('SAID', { x: 1400, y: 190, face: 'mono', size: 22, track: 0.16 }));
  p.put(p.text('um kal subah milte hain', { x: 1400, y: 256, face: 'hand', size: 50, fill: P.text }));
}
// Banner 970x250, strip: brand, headline, button (banner-blindness: one of each).
{
  const c = WEB[1], P = PAL[c.palette], W = 970, H = 250;
  const p = make({ id: c.piece, dir: 'web', W, H, palette: P, title: `Tailzu. ${c.headline}`, format: c.format, composition: 'split', finding: 'banner-blindness, left-lean', safe: { x: 25, y: 20, x2: 945, y2: 230 } });
  p.lockup(40, 140, 26);
  const hl = ['Talk in Hinglish.', 'Send it clean'];
  p.put(p.text(hl, { x: 260, y: 112, face: 'serif', size: 52, lead: 0.98 }));
  const lx = 260 + textWidth(hl[1], 'serif', 52, 0);
  p.dot(lx + 9, 158, 6.5);
  p.ink(loopy([590, 150], [715, 150], { loops: 2, r: 22, tail: 0.15, side: -1 }), { w: p.lwS * 0.7, seed: 130, segment: 2, wobble: 0.3 });
  p.button(c.cta, 740, 100, 22, { fill: P.text, color: P.ground });
}
// Thumbnail 1280x720, split: three big words left; the struck-out "um" right; bottom-right kept clear.
{
  const c = WEB[2], P = PAL[c.palette], W = 1280, H = 720;
  const p = make({ id: c.piece, dir: 'web', W, H, palette: P, title: `Tailzu. ${c.headline}`, format: c.format, composition: 'split', finding: 'pop-out, first-glance; thumbnail safe zone', safe: { x: 58, y: 58, x2: 1222, y2: 662 } });
  p.lockup(80, 138, 30);
  p.put(p.text(['Hinglish,', 'without the', 'typing'], { x: 80, y: 290, face: 'serif', size: 138, lead: 0.92 }));
  // A paper speech bubble holds the one thing that gets removed.
  p.paper([[770, 150], [1190, 140], [1200, 470], [960, 480], [880, 560], [890, 480], [760, 470]], { radius: [40, 40, 40, 14, 2, 10, 40], seed: 171 });
  const um = p.put(p.text('um', { x: 840, y: 400, face: 'hand', size: 250, fill: BLACK }));
  p.strike(um.x + 4, um.x + um.w - 24, 340, 105, { w: p.lwS * 1.1, color: BLACK });
  p.dot(80 + textWidth('typing', 'serif', 138) + 20, 290 + 2 * 127 - 14, 15);
}

// ================================================================== 7. Poster (single focal, anchored)
// Research: single-focal (centre-bias, pop-out); the voice line leaves the frame (it is deleted), the paper
// with the words stays. Ink crosses the paper edge (art.json line.crossing).
{
  const c = copy('poster.copy.json'), P = PAL[c.palette], W = 1414, H = 2000, m = 113;
  const p = make({ id: c.piece, dir: 'print', W, H, palette: P, title: `Tailzu. ${c.headline}`, format: c.format, composition: 'single-focal', finding: 'centre-bias, pop-out, picture-superiority', safe: { x: m, y: m, x2: W - m, y2: H - m } });
  // The voice: a thread of talk that rises off the paper and leaves through the top edge (deleted).
  const sx = m, sy = 820, sw = W - 2 * m, sh = 300;
  p.ink(loopy([sx + sw - 300, sy + 20], [1240, -90], { loops: 6, r: 70, tail: 0.05, side: 1 }), { seed: 141, segment: 3, wobble: 0.4 });
  p.put(p.text('YOUR AUDIO', { x: 930, y: 470, face: 'mono', size: 28, track: 0.16, anchor: 'end' }));
  // The paper with the words, which stays.
  p.paper([[sx, sy + 10], [sx + sw, sy], [sx + sw + 6, sy + sh], [sx + 4, sy + sh + 10]], { radius: 22, seed: 142 });
  p.put(p.text('YOUR WORDS', { x: sx + 70, y: sy + 92, face: 'mono', size: 28, track: 0.16, fill: BLACK }));
  writtenLine(p, { text: c.written, x: sx + 70, y: sy + 222, size: 124, maxW: sw - 140, fill: BLACK });
  // Words.
  const hl = balance(c.headline, 'serif', 150, W - 2 * m);
  p.put(p.text(hl, { x: m, y: 1400, face: 'serif', size: 150, lead: 0.98 }));
  const by = 1400 + (hl.length - 1) * 147 + 110;
  p.put(p.text(wrap(c.body, 'sans', 38, 980), { x: m, y: by, face: 'sans', size: 38, lead: 1.4 }));
  p.lockup(m, H - m - 30, 38);
  p.put(p.text(c.cta, { x: W - m, y: H - m - 30, face: 'sansB', size: 38, anchor: 'end' }));
}

// ================================================================== 8. Motion
const MOT = copy('motion.copy.json');
// 8a. Said to written: the hand writes, the marks clean, the type lands, the full stop lands last.
swPost(MOT[0], { motion: true, id: 'said-to-written', dir: 'motion' });
// 8b. Tone shifter, story 9:16: one rough message, five tones, one mover at a time, ends on a still.
{
  const c = MOT[1], P = PAL[c.palette], W = 1080, H = 1920, m = 86;
  const p = make({ id: c.piece, dir: 'motion', W, H, palette: P, safe: storySafe, title: `Tailzu. ${c.headline} One rough message in five tones.`, format: c.format, composition: 'stacked', finding: 'video: one-mover, on-screen-reading, joy-surprise, end-still' });
  const rough = TONES[0].rough;
  const all = TONES.slice(1, 5).flatMap((s) => s.tones);
  const pick = ['Neutral', 'Shakespeare', 'Noir'];
  p.lockup(m, 330, 26);
  p.put(p.text(c.headline, { x: m, y: 470, face: 'serif', size: 92, cls: p.c('head') }));
  // The message field.
  const fy = 540, fh = 230;
  p.rect(m, fy, W - 2 * m, fh, { radius: 30, seed: 151 });
  p.put(p.text('THE MESSAGE', { x: m + 44, y: fy + 62, face: 'mono', size: 24, track: 0.16, fill: BLACK }));
  p.put(p.text(wrap(rough, 'mono', 42, W - 2 * m - 100), { x: m + 44, y: fy + 132, face: 'mono', size: 42, lead: 1.3, fill: BLACK }));
  // Tone chips: two rows, the active one carries the accent marker.
  const chips = [];
  const rows = [['Neutral', 'Casual', 'Formal', 'Excited'], ['Shakespeare', 'Pirate', 'Movie Trailer', 'Noir']];
  rows.forEach((row, ri) => {
    let x = m;
    row.forEach((t) => {
      const b = p.put(p.text(t.toUpperCase(), { x, y: 850 + ri * 70, face: 'mono', size: 26, track: 0.1, cls: p.c('chips') }));
      chips.push({ t, x: b.x, w: b.w, y: 850 + ri * 70 });
      x += b.w + 34;
    });
  });
  const chipOf = (t) => chips.find((q) => q.t === t);
  const fin = chipOf('Noir');
  p.add(`<g class="${p.c('marker')}"><path d="${blob(fin.x + fin.w / 2, fin.y + 18, fin.w / 2 + 6, 5, { points: 8, irregularity: 0.05, seed: 160 })}" fill="${P.accent}"/></g>`);
  // Tone lines.
  const lineY = 1050;
  pick.forEach((t, i) => {
    const line = all.find(([n]) => n === t)[1];
    const ll = balance(line, 'serif', 72, W - 2 * m);
    const b = p.text(ll, { x: m, y: lineY, face: 'serif', size: 72, lead: 1.04, cls: p.c(`t${i}`) });
    b.stack = true;
    p.put(b);
  });
  p.button(c.cta, m, 1180, 28, { fill: P.text, color: P.ground, cls: p.c('cta') });
  // Decoration in the lower overlay zone (no text): the thread of talk, still.
  p.ink(loopy([-30, 1560], [W + 30, 1560], { loops: 5, r: 80, tail: 0, side: -1 }), { seed: 170, segment: 3, wobble: 0.35 });
  // Timeline.
  const tl = new Timeline(p, 1);
  const plan = [];
  let t = 600 + readingMs(words(rough)) - 1500; // the field is the first frame; give it most of its reading time
  plan.push(['chips', t]); t += 700;
  pick.forEach((tone, i) => {
    const line = all.find(([n]) => n === tone)[1];
    plan.push(['mark', t, tone]); t += 450;
    plan.push(['in', t, i]); t += SPRING.gentle.duration + readingMs(words(line));
    if (i < pick.length - 1) { plan.push(['out', t, i]); t += 300; }
  });
  plan.push(['head', t]); t += SPRING.gentle.duration;
  plan.push(['cta', t]); t += SPRING.gentle.duration + readingMs(words(c.headline) + 3);
  tl.total = t;
  // Marker: hidden until the first tone, then hops chip to chip on an eased path; base = Noir.
  const mk = [[0, `opacity:0;transform:translate(${chipOf('Neutral').x - fin.x}px,${chipOf('Neutral').y - fin.y}px)`]];
  let firstMark = true;
  for (const [kind, at, tone] of plan) if (kind === 'mark') {
    const q = chipOf(tone), d = `translate(${r1(q.x - fin.x + (q.w - fin.w) / 2)}px,${q.y - fin.y}px)`;
    if (firstMark) { mk.push([at, `opacity:0;transform:${d}`, SPRING.soft.easing]); mk.push([at + 300, `opacity:1;transform:${d}`]); firstMark = false; }
    else { mk.push([at, mk[mk.length - 1][1], SPRING.soft.easing]); mk.push([at + 400, `opacity:1;transform:${d}`]); }
  }
  mk.push([tl.total, 'opacity:1;transform:translate(0px,0px)']);
  // Fix the marker's own scale origin: it moves as a whole.
  tl.anim(p.c('marker'), mk);
  const at = (k, i) => plan.find((q) => q[0] === k && (i === undefined || q[2] === i))[1];
  tl.rise(p.c('chips'), at('chips'), { dist: 12 });
  pick.forEach((_, i) => { if (i < pick.length - 1) tl.visit(p.c(`t${i}`), at('in', i), at('out', i), { dist: 28 }); else tl.rise(p.c(`t${i}`), at('in', i), { dist: 28 }); });
  tl.rise(p.c('head'), at('head'));
  tl.rise(p.c('cta'), at('cta'), { dist: 12 });
  tl.finish();
  p.frames = [400, at('in', 0) + 1500, at('in', 1) + 1500, at('in', 2) + 1500, tl.total];
  p.end = tl.total;
}

// ================================================================== write files, report
const report = [];
for (const p of pieces) {
  mkdirSync(join(HERE, p.dir), { recursive: true });
  const svg = p.svg();
  writeFileSync(join(HERE, p.dir, `${p.id}.svg`), svg);
  report.push({ p, file: `${p.dir}/${p.id}.svg`, kb: Math.round(Buffer.byteLength(svg) / 1024), problems: p.check() });
}
for (const r of report) console.log(`${r.file.padEnd(36)} ${r.p.W}x${r.p.H} ${String(r.kb).padStart(4)} KB  ${r.p.composition}${r.p.end ? `  ${(r.p.end / 1000).toFixed(1)} s` : ''}${r.problems.length ? '\n   ! ' + r.problems.join('\n   ! ') : ''}`);
writeFileSync(join(HERE, 'pieces.json'), JSON.stringify(report.map((r) => ({ file: r.file, size: [r.p.W, r.p.H], palette: `${r.p.P.name} (Wada ${r.p.P.combination} ${r.p.P.mode})`, composition: r.p.composition, finding: r.p.finding, durationMs: r.p.end || null, stickerZone: r.p.zone || null })), null, 2) + '\n');

// ------------------------------------------------------------------ PNGs, frames and the contact sheet
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
  const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
  const load = async (r) => {
    await page.setViewportSize({ width: r.p.W, height: r.p.H });
    await page.setContent(`<html><body style="margin:0">${readFileSync(join(HERE, r.file), 'utf8')}</body></html>`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { for (const f of ['400 40px "Instrument Serif"', '400 40px "Instrument Sans"', '500 40px "Instrument Sans"', '600 40px "Instrument Sans"', '500 40px Caveat', '500 40px "IBM Plex Mono"']) await document.fonts.load(f); await document.fonts.ready; });
  };
  for (const r of report) {
    if (only && !r.file.includes(only)) continue;
    await load(r);
    if (r.p.end) {
      // Frames: pause every animation at a time and capture.
      for (const [i, ms] of r.p.frames.entries()) {
        await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), ms);
        await page.screenshot({ path: join(HERE, r.file.replace(/\.svg$/, `.frame-${i + 1}.png`)) });
      }
      await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), r.p.end);
    }
    await page.screenshot({ path: join(HERE, r.file.replace(/\.svg$/, '.png')) });
    if (r.p.zone) {
      // A review copy with the sticker zone marked (the artwork itself keeps the zone empty).
      const z = r.p.zone;
      await page.evaluate((z) => { const d = document.createElement('div'); d.style.cssText = `position:absolute;left:${z.x}px;top:${z.y}px;width:${z.w}px;height:${z.h}px;border:3px dashed #888;border-radius:28px;display:flex;align-items:center;justify-content:center;font:500 26px 'IBM Plex Mono',monospace;color:#888;letter-spacing:.12em;box-sizing:border-box`; d.textContent = `${z.sticker.toUpperCase()} STICKER${z.options ? ': ' + z.options.join(' / ').toUpperCase() : ''}`; document.body.appendChild(d); }, z);
      await page.screenshot({ path: join(HERE, r.file.replace(/\.svg$/, '.guides.png')) });
    }
  }
  if (!only) {
    const img = (f, h) => `<img src="data:image/png;base64,${readFileSync(join(HERE, f)).toString('base64')}" style="height:${h}px;width:auto;display:block;box-shadow:0 1px 6px rgba(0,0,0,.25)">`;
    const cell = (r, h) => `<figure style="margin:0;display:flex;flex-direction:column;gap:8px">${img(r.file.replace(/\.svg$/, r.p.zone ? '.guides.png' : '.png'), h)}<figcaption style="font:13px/1.3 system-ui;color:#333;max-width:${Math.max(160, (h * r.p.W) / r.p.H)}px">${r.file}<br><span style="color:#777">${r.p.composition} · Wada ${r.p.P.combination}</span></figcaption></figure>`;
    const pick = (re) => report.filter((r) => re.test(r.file));
    const rows = [
      [pick(/social\/sw-|social\/moment|social\/linkedin/), 360],
      [pick(/social\/tones-/), 360],
      [pick(/social\/story-|motion\/tone-shifter/), 520],
      [pick(/web\/hero|print\//), 420],
      [pick(/web\/thumbnail|web\/banner|motion\/said-to-written/), 300],
    ];
    const frames = report.filter((r) => r.p.end).map((r) => `<div style="display:flex;gap:12px;align-items:flex-start">${r.p.frames.map((_, i) => img(r.file.replace(/\.svg$/, `.frame-${i + 1}.png`), 300)).join('')}<span style="font:13px system-ui;color:#333">${r.file}: frames</span></div>`).join('');
    const html = `<html><body style="margin:0;padding:32px;background:#e8e6e1;display:flex;flex-direction:column;gap:32px;width:max-content">${rows.map(([rs, h]) => `<div style="display:flex;gap:20px;align-items:flex-start">${rs.map((r) => cell(r, h)).join('')}</div>`).join('')}${frames}</body></html>`;
    await page.setViewportSize({ width: 2600, height: 1000 });
    await page.setContent(html, { waitUntil: 'load' });
    await page.screenshot({ path: join(HERE, 'contact-sheet.png'), fullPage: true });
  }
  await browser.close();
  console.log('PNGs, frames and contact-sheet.png written');
}
