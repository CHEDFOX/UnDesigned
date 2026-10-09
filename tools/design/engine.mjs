// The UnDesigned design engine. A product brings its facts, copy, original logo and (optionally)
// photos; the guide brings everything else: format sizes, layouts, the style's skin (ground, art,
// type treatment, buttons, photo treatment), the Wada palette, the pairing, motion from the style's
// springs and reading-time holds from foundations/video/video.json.
//
//   npm run design -- <product> [campaign] [--png] [--only <piece>]
//
// Input: products/<id>/campaigns/<campaign>/*.copy.json. Each piece may add, beside its copy:
//   "id"       file-safe name (default: the file name, plus #n for lists)
//   "layout"   a layout id (default: chosen per format, rotating compositions the style prefers)
//   "palette"  a palette name from brand.json (default: primary)
//   "art"      { "motif": "<name>" } | { "file": "art/x.svg" } | { "image": "assets/photos/x.jpg", "subject": box, "gaze": dir }
//   "animate"  true for a motion version (CSS keyframes; one thing moves at a time; ends on a still)
//   "series"   { "index": 1, "of": 5 } for carousel slides
// Output: products/<id>/campaigns/<campaign>/designs/<piece>.svg (+ .png and contact-sheet.png with --png).

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, extname, basename, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadBrand, copyFiles } from '../../scripts/products.mjs';
import { ensureMetrics, textWidth, ensureTones, toneUnder, photoStats } from './metrics.mjs';
import { springEasing } from '../../approaches/humanist-minimal/illustration.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../..');
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------------------------------------------------------------- colour helpers
export function lum(hex) {
  const h = String(hex).replace('#', '');
  const v = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
export function contrast(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
/** The palette colour (from candidates) that reads best on a ground. */
export function readableOn(ground, candidates) {
  return [...candidates].filter(Boolean).sort((a, b) => contrast(b, ground) - contrast(a, ground))[0];
}
export function rng(seed) {
  let a = (seed >>> 0) || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s) => [...String(s)].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7) >>> 0;

// ---------------------------------------------------------------- formats and layouts
const FORMATS = Object.fromEntries(json(join(ROOT, 'foundations/messaging/source/formats.json')).groups.flatMap((g) => g.formats).map((f) => [f.id, f]));
const BASE_LAYOUTS = json(join(ROOT, 'templates/layouts/layouts.json')).layouts;
const SIZE = { 'web-banner': [970, 250], 'email-header': [1200, 600] };

function canvasFor(format) {
  if (SIZE[format]) return SIZE[format];
  const [a, b] = FORMATS[format]?.aspect || [4, 5];
  const W = a >= b ? 1920 : 1080;
  return [W, Math.round((W * b) / a)];
}

function layoutsFor(approach) {
  const own = join(ROOT, 'approaches', approach, 'layouts.json');
  const extra = existsSync(own) ? (json(own).layouts || json(own)).map((l) => ({ ...l, own: true })) : [];
  return [...extra, ...BASE_LAYOUTS];
}

/** Pick a layout: the piece's own choice, else the style's preferred compositions in turn, varied across a set. */
function chooseLayout(piece, skin, approach, used) {
  const all = layoutsFor(approach);
  if (piece.layout) {
    const l = all.find((x) => x.id === piece.layout);
    if (!l) throw new Error(`Unknown layout "${piece.layout}". Available for ${piece.format}: ${all.filter((x) => x.format === piece.format).map((x) => x.id).join(', ')}`);
    return l;
  }
  const wantsMedia = !!(piece.art && piece.art.image);
  const sameAspect = (l) => { const f = FORMATS[piece.format]?.aspect; return f && l.aspect && Math.abs(l.aspect[0] / l.aspect[1] - f[0] / f[1]) < 0.02; };
  // Carousel slides use the 4:5 post layouts (one idea per slide); grids only when asked for.
  const fmt = piece.format === 'carousel-slide' ? 'instagram-post' : piece.format;
  let pool = all.filter((l) => l.format === fmt && !!l.media === wantsMedia && l.aspect && Math.abs(l.aspect[0] / l.aspect[1] - (FORMATS[piece.format]?.aspect[0] / FORMATS[piece.format]?.aspect[1])) < 0.02);
  if (!pool.length) pool = all.filter((l) => l.format === fmt && !!l.media === wantsMedia);
  if (!pool.length) pool = all.filter((l) => sameAspect(l) && !!l.media === wantsMedia);
  if (!pool.length) pool = all.filter((l) => l.format === piece.format || sameAspect(l));
  if (!pool.length) throw new Error(`No layout for format "${piece.format}"`);
  // A carousel keeps one layout across its slides so the story reads as one.
  if (piece.series && used.series[piece.series.name]) return used.series[piece.series.name];
  const pref = skin.compositions || [];
  const score = (l) => (l.own ? -3 : 0) + (pref.includes(l.composition) ? pref.indexOf(l.composition) - pref.length : 0) + (used.count[l.id] || 0) * 4 + (used.comp[l.composition] || 0) * 2;
  const pick = [...pool].sort((a, b) => score(a) - score(b) || a.id.localeCompare(b.id))[0];
  if (piece.series) used.series[piece.series.name] = pick;
  return pick;
}

// ---------------------------------------------------------------- text
function wrapLines(text, maxW, face, size) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (!line || textWidth(next, { ...face, size }) <= maxW) line = next;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}
/** Balanced lines: the fewest lines that fit, then the narrowest measure with the same count (no widows). */
function balance(text, maxW, face, size) {
  const n = wrapLines(text, maxW, face, size).length;
  if (n < 2) return wrapLines(text, maxW, face, size);
  let lo = maxW * 0.5, hi = maxW;
  for (let i = 0; i < 12; i++) { const mid = (lo + hi) / 2; if (wrapLines(text, mid, face, size).length > n) lo = mid; else hi = mid; }
  return wrapLines(text, hi, face, size);
}
/** Largest size up to max that fits text into w x h with the face's leading and the role's line cap. */
export function fit(text, w, h, face, { max, min = 10, lead = 1.15, maxLines = 6 } = {}) {
  let size = Math.min(max ?? h, h);
  for (; size >= min; size *= 0.96) {
    const lines = balance(text, w, face, size);
    const width = Math.max(...lines.map((l) => textWidth(l, { ...face, size })));
    const height = size * (1 + (lines.length - 1) * lead) + size * 0.25;
    if (lines.length <= maxLines && width <= w + 0.5 && height <= h) return { size, lines, lead, width, height, fits: true };
  }
  const lines = balance(text, w, face, min);
  return { size: min, lines, lead, width: Math.max(...lines.map((l) => textWidth(l, { ...face, size: min }))), height: min * (1 + (lines.length - 1) * lead), fits: false };
}

// ---------------------------------------------------------------- images and marks
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif' };
export function dataUri(file) {
  const buf = readFileSync(file);
  return `data:${MIME[extname(file).toLowerCase()] || 'application/octet-stream'};base64,${buf.toString('base64')}`;
}
/** Original marks from identity.json. Each entry: { path, kind: icon|wordmark|lockup, on: dark|light|any }. */
function loadMarks(brand) {
  const f = join(brand.dir, 'identity.json');
  if (!existsSync(f)) return [];
  const id = json(f);
  const files = (id.marks && id.marks.files) || [];
  return files.map((m) => (typeof m === 'string' ? { path: m } : { ...m, path: m.path || m.file }))
    .filter((m) => m.path && m.kind && m.use !== false && !/not used|retired/i.test(m.note || ''))
    .map((m) => ({ ...m, abs: join(brand.dir, m.path.replace(/^products\/[^/]+\//, '')) }))
    .filter((m) => existsSync(m.abs));
}
function pickMark(marks, ground) {
  const dark = lum(ground) < 0.2;
  const ok = marks.filter((m) => !m.on || m.on === 'any' || (dark ? m.on === 'dark' : m.on === 'light'));
  const pool = ok.length ? ok : marks;
  return pool.find((m) => m.kind === 'lockup') || pool.find((m) => m.kind === 'wordmark') || pool.find((m) => m.kind === 'icon') || pool[0] || null;
}
function svgSize(file) {
  const s = readFileSync(file, 'utf8');
  const vb = s.match(/viewBox="([\d.\-\s]+)"/);
  if (vb) { const [, , w, h] = vb[1].trim().split(/\s+/).map(Number); return [w, h]; }
  return [1, 1];
}
function pngSize(file) {
  const b = readFileSync(file);
  if (b.slice(1, 4).toString() === 'PNG') return [b.readUInt32BE(16), b.readUInt32BE(20)];
  // JPEG: scan for SOF marker
  for (let i = 2; i < b.length - 9;) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xc3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    i += 2 + b.readUInt16BE(i + 2);
  }
  return [1, 1];
}
export function imageSize(file) { return extname(file).toLowerCase() === '.svg' ? svgSize(file) : pngSize(file); }

// ---------------------------------------------------------------- the piece
const ROLE_ORDER = ['ground', 'art', 'image', 'headline', 'subhead', 'body', 'note', 'brand', 'cta', 'finish'];

export async function renderPiece({ brand, tokens, skin, piece, layout, marks, index = 0 }) {
  const [W, H] = canvasFor(piece.format);
  const P = `${brand.config.prefix}-${String(piece.id).replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-`;
  const palettes = Object.fromEntries(tokens.colors.brand.map((p) => [p.name, p]));
  const palDef = palettes[piece.palette || 'primary'] || tokens.colors.brand[0];
  const hex = (id) => tokens.colorsById[id];
  const r = palDef.roles;
  const pal = {
    name: palDef.name, combination: palDef.combination, mode: palDef.mode,
    ground: hex(r.bg), ink: hex(r.text || r.ink), accent: hex(r.accent), support: (r.support || []).map(hex),
    inkColour: hex(r.ink), black: hex('black'), white: hex('white'), paper: hex('white'),
  };
  pal.all = [...new Set([pal.ground, pal.ink, pal.inkColour, pal.accent, ...pal.support, pal.black, pal.white].filter(Boolean))];
  // Text on the ground uses the combination's own text colour when it passes AA (4.5:1); otherwise black or white.
  pal.onGround = pal.ink && contrast(pal.ink, pal.ground) >= 4.5 ? pal.ink : readableOn(pal.ground, [pal.ink, pal.black, pal.white]);
  pal.onAccent = readableOn(pal.accent, [pal.black, pal.white, pal.ink]);

  const pair = tokens.typography.pairing;
  const fam = { display: pair.display.family, body: pair.body.family, mono: pair.mono.family, hand: tokens.typography.hand ? tokens.typography.hand.family : null };
  let T = {};
  const face = (role) => {
    const t = T[role] || {};
    const family = t.family === 'mono' ? fam.mono : t.family === 'hand' && fam.hand ? fam.hand : t.family === 'display' ? fam.display : t.family === 'body' ? fam.body : role === 'headline' ? fam.display : fam.body;
    const avail = family === fam.display ? pair.display.weights : family === fam.body ? pair.body.weights : family === fam.mono ? pair.mono.weights : tokens.typography.hand?.weights || [400];
    const want = t.weight ?? (role === 'headline' ? avail[avail.length > 1 ? avail.length - 1 : 0] : role === 'cta' || role === 'brand' ? avail[avail.length - 1] : avail[0]);
    const weight = avail.reduce((b, w) => (Math.abs(w - want) < Math.abs(b - want) ? w : b), avail[0]);
    const hasItalic = family === fam.display ? !!pair.display.italic : family === fam.body ? !!pair.body.italic : false;
    return { family, weight, italic: !!t.italic && hasItalic, hasItalic, tracking: t.tracking ?? (role === 'headline' ? (pair.display.tracking || 0) : 0), upper: !!t.upper };
  };

  const media = piece.art && piece.art.image ? join(brand.dir, piece.art.image) : null;
  const ctx = {
    W, H, P, pal, fam, face, brand, piece, layout, index, tokens, esc, contrast, readableOn, fit, textWidth,
    rand: rng(hash(piece.id) + index), seed: hash(piece.id), media, dataUri, imageSize,
    productArt: tokens.productArt, approach: tokens.approach,
    px: (b) => ({ x: (b.x / 100) * W, y: (b.y / 100) * H, w: (b.w / 100) * W, h: (b.h / 100) * H }),
  };

  // Layout slots in px. A layout made for a different format (same aspect) is fine; slots are relative.
  const slots = layout.slots.map((s, i) => ({ ...s, i, px: ctx.px(s.box) }));
  const parts = { ground: skin.ground(ctx), media: '', art: [], text: [], after: '' };
  if (media) parts.media = skin.media ? skin.media(ctx, layout) : `<image href="${dataUri(media)}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`;

  // Text colour per slot: readable on what is behind it (the skin may override with textOn()). Over a photo,
  // the photo's measured worst-case pixels behind the slot decide (media.json contrast rule).
  ctx.mediaStats = media ? photoStats(media) : null;
  T = (typeof skin.type === 'function' ? skin.type(ctx) : skin.type) || {};
  ctx.mediaTone = (box) => (media ? toneUnder(media, box, W, H) : null);
  ctx.textOnPhoto = (box) => {
    const t = ctx.mediaTone(box);
    if (!t) return layout.media?.text === 'ink' ? pal.black : pal.white;
    const cw = (1.05) / (t.hi + 0.05), cb = (t.lo + 0.05) / 0.05;
    return cw >= cb ? pal.white : pal.black;
  };
  const textFill = (slot) => (skin.textOn ? skin.textOn(ctx, slot) : null) || (media && layout.media ? ctx.textOnPhoto(slot.px) : pal.onGround);

  let artN = 0;
  const texts = { headline: piece.headline, subhead: piece.subhead, body: piece.body, cta: piece.cta, note: piece.note, brand: brand.config.name };
  const used = new Set();
  for (const slot of slots) {
    const b = slot.px;
    if (slot.role === 'art' || (slot.role === 'image' && !media)) {
      // A photo slot without a photo becomes art, kept inside the live area (art never touches the edge).
      let box = b;
      if (slot.role === 'image' && layout.grid && layout.grid.liveArea) {
        const la = ctx.px(layout.grid.liveArea);
        const x0 = Math.max(b.x, la.x), y0 = Math.max(b.y, la.y), x1 = Math.min(b.x + b.w, la.x + la.w), y1 = Math.min(b.y + b.h, la.y + la.h);
        box = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
      }
      parts.art.push({ slot, svg: skin.art(ctx, box, { n: artN++, slot }) });
      continue;
    }
    if (slot.role === 'image') continue;
    if (slot.role === 'brand') {
      if (ctx.piece.brand === false) continue; // the copy asked for no logo or name on this piece
      const fill = textFill(slot);
      const drawn = drawBrand(ctx, b, slot, marks, fill);
      // Skins may draw behind the brand (a plate, a sticker) from its real size: decorate(ctx, slot, { brand: true, size, width, box, fill, face }).
      const bdeco = skin.decorate ? skin.decorate(ctx, slot, { brand: true, box: b, drawnBox: drawn.box, size: drawn.size, width: drawn.box.w, fill, face: face('brand'), hasMark: drawn.hasMark }) : '';
      parts.text.push({ slot, svg: drawn.svg, deco: bdeco });
      continue;
    }
    // Two body slots: the second continues the first (long copy).
    let text = texts[slot.role];
    if (slot.role === 'body' && used.has('body')) continue;
    if (!text) continue;
    used.add(slot.role);
    const f = face(slot.role);
    const lead = slot.role === 'headline' ? (pair.display.leading || 1.0) + 0.06 : slot.role === 'body' ? 1.42 : 1.22;
    const strip = W / H > 2.5;
    const hm = typeof skin.headlineMax === 'function' ? skin.headlineMax(ctx) : skin.headlineMax;
    const caps = { headline: strip ? b.h * 0.9 : Math.min(H, W) * (hm || 0.11), subhead: Math.min(H, W) * 0.045, body: Math.min(H, W) * 0.032, note: Math.min(H, W) * 0.03, cta: Math.min(H, W) * 0.034 };
    const mins = { headline: 18, subhead: 13, body: 12, note: 11, cta: 12 };
    if (slot.role === 'cta') {
      parts.text.push({ slot, svg: (skin.cta || defaultCta)(ctx, b, text, f, slot) });
      continue;
    }
    const shown = f.upper ? String(text).toUpperCase() : text;
    const ft = fit(shown, b.w, b.h, f, { max: caps[slot.role], min: mins[slot.role], lead, maxLines: slot.role === 'headline' ? 5 : 8 });
    const fill = textFill(slot);
    const anchor = slot.align === 'center' ? 'middle' : slot.align === 'right' ? 'end' : 'start';
    const x = slot.align === 'center' ? b.x + b.w / 2 : slot.align === 'right' ? b.x + b.w : b.x;
    const y0 = b.y + ft.size * 0.86;
    const deco = skin.decorate ? skin.decorate(ctx, slot, { ...ft, x: b.x, y: b.y, box: b, fill, face: f }) : '';
    const body = `<text font-family="'${esc(f.family)}', sans-serif" font-weight="${f.weight}"${f.italic ? ' font-style="italic"' : ''} font-size="${ft.size.toFixed(1)}" letter-spacing="${(f.tracking * ft.size).toFixed(2)}" fill="${fill}" text-anchor="${anchor}">` +
      ft.lines.map((l, k) => `<tspan x="${x.toFixed(1)}" y="${(y0 + k * ft.size * lead).toFixed(1)}">${esc(l)}</tspan>`).join('') + '</text>';
    parts.text.push({ slot, svg: (skin.text ? skin.text(ctx, slot, { ...ft, x, y0, anchor, fill, face: f, box: b, svg: body }) : body), deco, fit: ft });
  }
  if (piece.series && skin.series) parts.after += skin.series(ctx, piece.series);
  if (skin.finish) parts.after += skin.finish(ctx);

  // Assemble, wrapping each element so motion can address it.
  const groups = [];
  groups.push({ role: 'ground', svg: parts.ground + parts.media });
  for (const a of parts.art) groups.push({ role: 'art', svg: a.svg });
  for (const t of parts.text) groups.push({ role: t.slot.role, svg: (t.deco || '') + t.svg });
  if (parts.after) groups.push({ role: 'finish', svg: parts.after });
  groups.sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role) || 0);

  const fontsUrl = tokens.typography.googleFontsUrl;
  const motion = piece.animate ? choreograph(ctx, groups, skin) : { css: '', classes: () => '' };
  const label = [piece.headline, brand.config.name].filter(Boolean).join(' · ');
  // Art that loops (a motif's own motion) starts when the last element has arrived: __MOTION_END__ in its CSS.
  const end = piece.animate ? Math.round(motion.total + 200) : 0;
  return (`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label)}">` +
    `<style>@import url("${fontsUrl}");</style>` +
    (motion.css ? `<style>${motion.css}</style>` : '') +
    (skin.defs ? `<defs>${skin.defs(ctx)}</defs>` : '') +
    groups.map((g, k) => `<g class="${P}el ${P}${g.role}${motion.classes(g, k)}">${g.svg}</g>`).join('') +
    `</svg>\n`).replace(/__MOTION_END__/g, String(end));
}

function defaultCta(ctx, b, text, f) {
  const { pal, esc, fit } = ctx;
  const ft = fit(text, b.w * 0.82, b.h * 0.5, f, { max: Math.min(ctx.W, ctx.H) * 0.032, min: 12, maxLines: 1 });
  const bw = Math.min(b.w, ft.width + ft.size * 2.2), bh = ft.size * 2.3;
  const x = b.x, y = b.y + (b.h - bh) / 2;
  const fill = pal.accent && contrast(pal.accent, pal.ground) >= 1.6 ? pal.accent : pal.onGround;
  const tc = readableOn(fill, [pal.black, pal.white, pal.ink]);
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="${(bh / 2).toFixed(1)}" fill="${fill}"/>` +
    `<text x="${(x + bw / 2).toFixed(1)}" y="${(y + bh / 2 + ft.size * 0.36).toFixed(1)}" text-anchor="middle" font-family="'${esc(f.family)}', sans-serif" font-weight="${f.weight}" font-size="${ft.size.toFixed(1)}" fill="${tc}">${esc(ft.lines.join(' '))}</text>`;
}

/** The brand: the original mark, scaled into the slot; an icon-only mark gets the name set beside it. */
/** An original mark placed as is: SVG files are inlined (so their own fonts load), others embedded. */
function placeMark(ctx, mark, x, y, w, h) {
  if (extname(mark.abs).toLowerCase() === '.svg') {
    const src = readFileSync(mark.abs, 'utf8').replace(/<\?xml[^>]*>\s*/, '');
    const pre = ctx.P + 'mk-';
    const prefixed = src.replace(/\bid="([^"]+)"/g, `id="${pre}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${pre}$1)`).replace(/href="#([^"]+)"/g, `href="#${pre}$1"`);
    return prefixed.replace(/<svg\b([^>]*)>/, (m, attrs) => `<svg${attrs.replace(/\s(x|y|width|height)="[^"]*"/g, '')} x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" overflow="visible">`);
  }
  return `<image href="${dataUri(mark.abs)}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"/>`;
}

function drawBrand(ctx, b, slot, marks, fill) {
  const { esc, face, brand } = ctx;
  // The mark version follows what is behind it: if the text there is light, the ground is dark.
  const behind = lum(fill) > 0.4 ? '#000000' : '#ffffff';
  const mark = pickMark(marks, behind);
  const f = face('brand');
  const h = ctx.W / ctx.H > 2.5 ? Math.max(24, Math.min(b.h * 0.8, ctx.H * 0.16)) : Math.max(Math.min(b.h, Math.min(ctx.W, ctx.H) * 0.07), Math.min(ctx.W, ctx.H) * 0.045, 24);
  const label = f.upper ? brand.config.name.toUpperCase() : brand.config.name;
  // Width first, then x from the slot's alignment (left, center, right).
  const at = (w) => (slot.align === 'center' ? b.x + (b.w - w) / 2 : slot.align === 'right' ? b.x + b.w - w : b.x);
  const txt = (x, y, ft) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="'${esc(f.family)}', sans-serif" font-weight="${f.weight}" font-size="${ft.size.toFixed(1)}" letter-spacing="${(f.tracking * ft.size).toFixed(2)}" fill="${fill}">${esc(label)}</text>`;
  if (!mark) {
    const ft = fit(label, b.w, h, f, { max: h, min: 12, maxLines: 1 });
    const x = at(ft.width);
    return { svg: txt(x, b.y + ft.size * 0.9, ft), box: { x, y: b.y, w: ft.width, h: ft.size * 1.15 }, size: ft.size, hasMark: false };
  }
  const [iw, ih] = imageSize(mark.abs);
  if (mark.kind === 'icon' || !mark.kind) {
    const s = h, iwPx = s * (iw / ih);
    const ft = ctx.fit(label, Math.max(10, b.w - iwPx - s * 0.32), h * 0.62, f, { max: h * 0.62, min: 11, maxLines: 1 });
    const w = iwPx + s * 0.32 + ft.width, x = at(w);
    return { svg: placeMark(ctx, mark, x, b.y, iwPx, s) + txt(x + iwPx + s * 0.32, b.y + s / 2 + ft.size * 0.36, ft), box: { x, y: b.y, w, h: s }, size: s, hasMark: true };
  }
  const wPx = Math.min(b.w, h * (iw / ih) * 1.4), hPx = wPx * (ih / iw), x = at(wPx);
  return { svg: placeMark(ctx, mark, x, b.y, wPx, hPx), box: { x, y: b.y, w: wPx, h: hPx }, size: hPx, hasMark: true };
}

/** Motion: one element at a time, the style's arrival spring, the headline held for its reading time
 *  (media.json: max(1.5 s, 0.375 s x words + 0.5 s)), ending on a still; reduced motion shows the end frame. */
function choreograph(ctx, groups, skin) {
  const mo = ctx.approach.motion || {};
  const springs = mo.springs || {};
  const name = (mo.moves && (mo.moves.rise?.spring || mo.moves.arrive?.spring || mo.moves.glide?.spring)) || Object.keys(springs).find((k) => k !== '$comment');
  const sp = springEasing(springs[name] || { stiffness: 170, damping: 26 });
  const dur = Math.min(Math.max(sp.duration, 500), 1400);
  const P = ctx.P;
  let t = 300;
  const timing = [];
  const words = (s) => String(s || '').split(/\s+/).filter(Boolean).length;
  for (const g of groups) {
    if (g.role === 'ground') { timing.push(0); continue; }
    timing.push(t);
    // Words stay on screen, so only the headline is held for its reading time before more arrives.
    const hold = g.role === 'headline' ? Math.max(1500, 375 * words(ctx.piece.headline) + 500) : g.role === 'subhead' || g.role === 'body' ? 700 : 300;
    t += dur * 0.6 + hold;
  }
  const rise = Math.round(Math.min(ctx.W, ctx.H) * 0.03);
  const css = `.${P}el{transform-box:view-box}` +
    `@keyframes ${P}in{from{opacity:0;transform:translateY(${rise}px)}to{opacity:1;transform:none}}` +
    `@keyframes ${P}fade{from{opacity:0}to{opacity:1}}` +
    groups.map((g, k) => g.role === 'ground' ? '' : `.${P}t${k}{animation:${P}${g.role === 'art' || g.role === 'finish' ? 'fade' : 'in'} ${dur}ms ${sp.easing} ${timing[k]}ms both}`).join('') +
    `@media (prefers-reduced-motion: reduce){.${P}el{animation:none!important;opacity:1!important;transform:none!important}}`;
  return { css, classes: (g, k) => (g.role === 'ground' ? '' : ` ${P}t${k}`), total: t };
}

// ---------------------------------------------------------------- products and campaigns
export function loadTokens(brand) {
  const d = join(ROOT, 'dist', brand.id, 'tokens');
  if (!existsSync(join(d, 'colors.json'))) throw new Error(`Build ${brand.id} first: npm run build -- ${brand.id}`);
  const colors = json(join(d, 'colors.json'));
  const colorsById = Object.fromEntries(colors.colors.map((c) => [c.id, c.hex]));
  const typography = json(join(d, 'typography.json'));
  const approach = json(join(d, 'approach.json'));
  return { colors, colorsById, typography, approach };
}

export async function loadSkin(approachId) {
  const own = join(ROOT, 'approaches', approachId, 'skin.mjs');
  const mod = await import(pathToFileURL(existsSync(own) ? own : join(HERE, 'skins/base.mjs')).href);
  return mod.default;
}

function readPieces(dir) {
  const out = [];
  for (const f of copyFiles(dir).sort()) {
    const d = json(f);
    if (d.$expect === 'errors') continue;
    const list = Array.isArray(d) ? d : d.pieces || [d];
    list.forEach((p, i) => out.push({ ...p, id: p.id || p.piece || basename(f, '.copy.json') + (list.length > 1 ? `-${i + 1}` : ''), file: f }));
  }
  return out;
}

export async function designCampaign({ productId, campaign, png = false, only = null, log = console.log, approach = null, outDirName = 'designs', outRoot = null, pieces: givenPieces = null }) {
  const brand = loadBrand(ROOT, productId);
  const tokens = loadTokens(brand);
  if (approach) applyStyle(brand, tokens, approach);
  const baseConfig = brand.config, baseTokens = { ...tokens };
  const artFile = join(brand.dir, 'art.mjs');
  tokens.productArt = existsSync(artFile) ? (await import(pathToFileURL(artFile).href)).default : {};
  const marks = loadMarks(brand);
  const campaigns = givenPieces ? [campaign || 'preview'] : campaign ? [campaign] : readdirSync(join(brand.dir, 'campaigns')).filter((c) => existsSync(join(brand.dir, 'campaigns', c)) && !c.includes('.'));
  const pair = tokens.typography.pairing;
  const faces = [];
  for (const f of [pair.display, pair.body, pair.mono, tokens.typography.hand].filter(Boolean)) for (const w of f.weights || [400]) faces.push({ family: f.family, weight: w, italic: false }, ...(f.italic ? [{ family: f.family, weight: w, italic: true }] : []));
  const measured = await ensureMetrics(faces);
  const photoFiles = [];
  for (const c of campaigns) for (const p of (givenPieces || readPieces(join(brand.dir, 'campaigns', c)))) if (p.art && p.art.image) photoFiles.push(join(brand.dir, p.art.image));
  await ensureTones(photoFiles);
  if (!measured) log('  (no browser: text is fitted with estimated widths; check by eye)');
  const written = [];
  for (const c of campaigns) {
    const dir = join(brand.dir, 'campaigns', c);
    // A campaign may use another style or palette (campaign.json: { "approach", "combination", "mode", "text" }).
    // "text": "white" or "black" sets the text colour on the ground (Wada White and Black go with every combination).
    // "combination" may be a list: the first is the base, the others are bridges (styles that use them, e.g. desi-maximalism).
    brand.config = baseConfig; Object.assign(tokens, baseTokens);
    const cfgFile = join(dir, 'campaign.json');
    if (!givenPieces && existsSync(cfgFile)) {
      const cfg = json(cfgFile);
      applyStyle(brand, tokens, cfg.approach || brand.config.approach, cfg.combination ? [].concat(cfg.combination) : null, cfg.mode, cfg.text);
      // "pairing" (an id in pairings.json) and "hand" (an id in handwritten.json, or null) set the campaign's type.
      if (cfg.pairing || cfg.hand !== undefined) {
        tokens.typography = campaignType(tokens.typography, cfg.pairing, cfg.hand);
        const f = [tokens.typography.pairing.display, tokens.typography.pairing.body, tokens.typography.pairing.mono, tokens.typography.hand].filter(Boolean);
        await ensureMetrics(f.flatMap((x) => (x.weights || [400]).map((w) => ({ family: x.family, weight: w, italic: false }))));
      }
    }
    const skin = await loadSkin(brand.config.approach);
    const pieces = (givenPieces || readPieces(dir)).filter((p) => !only || p.id === only);
    if (!pieces.length) continue;
    const outDir = outRoot ? join(outRoot, c) : join(dir, outDirName);
    mkdirSync(outDir, { recursive: true });
    const used = { count: {}, comp: {}, series: {} };
    for (const [i, piece] of pieces.entries()) {
      if (!piece.format) { log(`  skip ${piece.id}: no format`); continue; }
      const layout = chooseLayout(piece, skin, brand.config.approach, used);
      used.count[layout.id] = (used.count[layout.id] || 0) + 1;
      used.comp[layout.composition] = (used.comp[layout.composition] || 0) + 1;
      const svg = await renderPiece({ brand, tokens, skin, piece, layout, marks, index: i });
      const out = join(outDir, `${piece.id}.svg`);
      writeFileSync(out, svg);
      written.push({ file: out, piece, layout });
      log(`  ${relative(ROOT, out)}  ${piece.format} · ${layout.id} (${layout.composition})${piece.animate ? ' · animated' : ''}`);
    }
    if (png) await renderPngs(written.filter((w) => w.file.startsWith(outDir)), outRoot ? join(outDir, '..', `${c}-contact-sheet.png`) : join(dir, 'contact-sheet.png'), `${brand.config.name} · ${c} · ${brand.config.approach}`);
  }
  return written;
}

async function renderPngs(items, sheetPath, title) {
  const { createRequire } = await import('node:module');
  const { execSync } = await import('node:child_process');
  const req = createRequire(import.meta.url);
  let pw;
  try { pw = req('playwright'); } catch { try { pw = req(join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright')); } catch { return; } }
  const browser = await pw.chromium.launch(existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {});
  // Stills show the end frame: motion pieces honour reduced motion, which holds them on their last, complete state.
  const page = await browser.newPage({ reducedMotion: "reduce" });
  for (const it of items) {
    const svg = readFileSync(it.file, 'utf8');
    const [W, H] = svg.match(/viewBox="0 0 (\d+) (\d+)"/).slice(1).map(Number);
    await page.setViewportSize({ width: W, height: H });
    const tmp = it.file.replace(/\.svg$/, '.preview.html');
    writeFileSync(tmp, `<!doctype html><html><body style="margin:0">${svg}</body></html>`);
    await page.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    if (it.piece.animate) await page.waitForTimeout(12000);
    await page.screenshot({ path: it.file.replace(/\.svg$/, '.png') });
    (await import('node:fs')).unlinkSync(tmp);
  }
  const cells = items.map((it) => `<figure style="margin:0;display:grid;gap:6px;align-content:start"><img src="${basename(dirname(it.file))}/${basename(it.file).replace(/\.svg$/, '.png')}" style="width:100%;display:block;box-shadow:0 2px 10px rgba(0,0,0,.15)"><figcaption style="font:12px monospace;color:#555">${esc(it.piece.id)} · ${esc(it.layout.composition)}</figcaption></figure>`).join('');
  await page.setViewportSize({ width: 2200, height: 1000 });
  const sheetHtml = sheetPath.replace(/\.png$/, '.html');
  writeFileSync(sheetHtml, `<!doctype html><html><body style="margin:0;padding:32px;background:#ecebe6;font-family:system-ui"><h1 style="font-size:22px;margin:0 0 20px">${esc(title)}</h1><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:24px;align-items:start">${cells}</div></body></html>`);
  await page.goto(pathToFileURL(sheetHtml).href, { waitUntil: 'load' });
  await page.screenshot({ path: sheetPath, fullPage: true });
  (await import('node:fs')).unlinkSync(sheetHtml);
  await browser.close();
}

/** Use another style (and optionally specific Wada combinations) for a preview or a campaign. Without
 *  combinations, the style's own recommended ones are used. */
/** The campaign's type: another pairing from pairings.json and/or another hand face (or none), with its Google Fonts URL. */
function campaignType(typo, pairingId, handId) {
  const src = (f) => json(join(ROOT, 'foundations', 'typography', 'source', f));
  const all = (d, key) => [].concat(d[key] || [], d.newPairings || [], Array.isArray(d) ? d : []);
  const pairing = pairingId ? all(src('pairings.json'), 'pairings').find((p) => p.id === pairingId) : typo.pairing;
  if (!pairing) throw new Error(`campaign.json: no pairing "${pairingId}" in pairings.json`);
  const hands = src('handwritten.json');
  const hand = handId === null ? null : handId ? [].concat(hands.fonts || hands.faces || hands).find((h) => h.id === handId) : typo.hand;
  if (handId && !hand) throw new Error(`campaign.json: no hand face "${handId}" in handwritten.json`);
  const fam = (f) => `family=${f.family.replace(/ /g, '+')}:${f.italic ? `ital,wght@${[0, 1].flatMap((i) => (f.weights || [400]).map((w) => `${i},${w}`)).join(';')}` : `wght@${(f.weights || [400]).join(';')}`}`;
  const faces = [pairing.display, pairing.body, pairing.mono, hand].filter(Boolean).filter((f, i, a) => a.findIndex((g) => g.family === f.family) === i);
  return { ...typo, pairing, hand, googleFontsUrl: `https://fonts.googleapis.com/css2?${faces.map(fam).join('&')}&display=swap` };
}

function applyStyle(brand, tokens, approach, combinations = null, mode = 'light', text = null) {
  brand.config = { ...brand.config, approach };
  const read = (f) => (existsSync(join(ROOT, 'approaches', approach, f)) ? json(join(ROOT, 'approaches', approach, f)) : {});
  const art = read('art.json');
  tokens.approach = { ...read('approach.json'), art, motion: read('motion.json') };
  const recs = (art.palette && art.palette.recommendedCombinations) || [];
  const num = (r) => +(typeof r === 'object' ? (r.combination ?? r.id ?? r.number) : r);
  const ids = combinations || recs.map(num).slice(0, 2);
  const combos = ids.map((n) => tokens.colors.combinations.find((c) => c.id === +n)).filter(Boolean);
  if (combos.length) tokens.colors = { ...tokens.colors, brand: combos.map((c, i) => ({ name: i ? 'seasonal' : 'primary', combination: c.id, mode, roles: { ...(c.roles[mode] || c.roles.light), ...(text === 'white' || text === 'black' ? { text } : {}) } })) };
}
