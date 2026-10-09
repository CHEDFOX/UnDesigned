// Doodles skin for the design engine (tools/design/engine.mjs).
// Thinking out loud with one pen: a focal doodle with 5-15 marks around it (margin mode), or a
// wall of marks with a clearing on full-bleed image slots (wall mode); one pen weight, round ends,
// visible wobble, loops that overshoot; flat colour slapped on off the line, offset down-right;
// accent on the one focal object; a hand-lettered headline (the product's hand face) tilted a little
// with a wavy underline under one word; set type for everything you read or press; a solid pill CTA.
// Rules: approaches/doodles/art.json, typography.json, approach.json. Drawing ideas: sample.mjs.

import { readFileSync } from 'node:fs';
import { productMotif, artFile } from '../../tools/design/skins/base.mjs';
import { createIllustrator } from '../humanist-minimal/illustration.mjs';

const TYPO = JSON.parse(readFileSync(new URL('./typography.json', import.meta.url), 'utf8'));
const r1 = (n) => Math.round(n * 10) / 10;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// The engine reads skin.headlineMax as a number; sizes differ per format (typography.json
// sizes.byFormat), so ground() records the current piece's value first.
let HEAD_MAX = 0.11;
function headMaxFor(ctx) {
  const by = TYPO.sizes.byFormat;
  const f = by[ctx.piece.format] || by.poster;
  const short = Math.min(ctx.W, ctx.H);
  if (f.headlinePct) return ((f.headlinePct[0] + f.headlinePct[1]) / 2 / 100) * ctx.H / 0.52 / short;
  if (f.headlinePx) return (f.headlinePx[1] * (ctx.W / (ctx.piece.format === 'email-header' ? 600 : 1440))) / short;
  return 0.11;
}

// ------------------------------------------------------------------ the pen
function pen(ctx) {
  const { pal, contrast } = ctx;
  const chalk = contrast(pal.ground, pal.black) < 4.5;            // chalk mode on dark grounds
  const ink = chalk ? pal.white : pal.black;
  const sup = (pal.support || []).filter((c) => c !== pal.ground);
  const short = Math.min(ctx.W, ctx.H);
  const w = Math.max(2.2, short * 0.0085);                         // one pen per piece (line.pens)
  return {
    ink, chalk, w,
    fills: [sup[0] || pal.white, sup[1] || sup[0] || pal.white, pal.white],
    accent: pal.accent,
    off: [w * 1.3, w * 1.1],                                       // colour printed off the line, down-right
  };
}

function smooth(pts, closed) {
  if (pts.length < 2) return '';
  const p = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [x0, y0] = p[i - 1], [x1, y1] = p[i], [x2, y2] = p[i + 1], [x3, y3] = p[i + 2];
    d += `C${r1(x1 + (x2 - x0) / 6)} ${r1(y1 + (y2 - y0) / 6)} ${r1(x2 - (x3 - x1) / 6)} ${r1(y2 - (y3 - y1) / 6)} ${r1(x2)} ${r1(y2)}`;
  }
  return closed ? d + 'Z' : d;
}
/** Resample into short segments and nudge each point: the hand wobble (line.wobble, line.segment). */
function wobble(rand, pts, amp, seg) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / seg));
    for (let k = 0; k < n; k++) out.push([ax + (bx - ax) * k / n + (rand() * 2 - 1) * amp, ay + (by - ay) * k / n + (rand() * 2 - 1) * amp]);
  }
  out.push(pts[pts.length - 1]);
  return out;
}
const place = (pts, x, y, s = 1, rot = 0) => { const c = Math.cos(rot), sn = Math.sin(rot); return pts.map(([px, py]) => [x + (px * c - py * sn) * s, y + (px * sn + py * c) * s]); };
const ring = (rx, ry, n = 14, k = 0) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; const b = 1 + (k ? Math.abs(Math.sin(a * k)) * 0.22 : 0); return [Math.cos(a) * rx * b, Math.sin(a) * ry * b]; });
const starPts = (ro, ri) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? ri : ro; return [Math.cos(a) * r, Math.sin(a) * r]; });
const heartPts = (s) => Array.from({ length: 18 }, (_, i) => { const t = (i / 18) * Math.PI * 2; return [Math.pow(Math.sin(t), 3) * 15 * s, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 1.1 * s]; });

/** A drawing surface: collects offset fills and ink lines, then renders fills under ink. */
function sketch(ctx, unit) {
  const P = pen(ctx), rand = ctx.rand;
  const fills = [], inks = [];
  const amp = clamp(unit * 1.5, 0.8, P.w * 0.9), seg = Math.max(4, unit * 8);
  const S = {
    P, rand, unit,
    fill(pts, color) { if (color) fills.push(`<path d="${smooth(pts.map(([x, y]) => [x + P.off[0], y + P.off[1]]), true)}" fill="${color}"/>`); },
    // A hand never closes a loop exactly: closed shapes overshoot their start (line.overshoot).
    line(pts, closed, a = amp) {
      const src = closed ? [...pts, pts[0], [pts[1][0] + (rand() * 2 - 1) * unit * 3, pts[1][1] + (rand() * 2 - 1) * unit * 3]] : pts;
      inks.push(`<path d="${smooth(wobble(rand, src, a, seg), false)}"/>`);
    },
    dot(x, y) { inks.push(`<path d="M${r1(x)} ${r1(y)}l0.1 0.1"/>`); },
    raw(d) { inks.push(`<path d="${d}"/>`); },
    shape(pts, color) { S.fill(pts, color); S.line(pts, true); },
    render(extra = '') {
      return `<g>${fills.join('')}</g><g fill="none" stroke="${P.ink}" stroke-width="${r1(P.w)}" stroke-linecap="round" stroke-linejoin="round">${inks.join('')}</g>${extra}`;
    },
  };
  return S;
}

// ------------------------------------------------------------------ marks (art.json vocabulary.marks)
/** Small marks around 0,0 at about 16 units radius, scaled by k (px per unit). */
function mark(S, kind, x, y, k, rot, color) {
  const pl = (pts) => place(pts, x, y, k, rot);
  switch (kind) {
    case 'star': S.shape(pl(starPts(17, 7)), color); break;
    case 'heart': S.shape(pl(heartPts(1)), color); break;
    case 'circle': S.shape(pl(ring(9, 9, 9)), color); break;
    case 'cloud': S.shape(pl(ring(17, 11, 24, 3)), color); break;
    case 'face': S.shape(pl(ring(14, 14, 12)), color); for (const e of [[-5, -3], [5, -3]]) { const [p] = pl([e]); S.dot(p[0], p[1]); } S.line(pl([[-7, 4], [-3, 8], [3, 8], [7, 4]])); break;
    case 'flower': S.shape(pl(ring(16, 16, 30, 2.5)), color); S.line(pl(ring(4, 4, 7)), true); break;
    case 'sun': S.shape(pl(ring(9, 9, 10)), color); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; S.line(pl([[Math.cos(a) * 13, Math.sin(a) * 13], [Math.cos(a) * 19, Math.sin(a) * 19]])); } break;
    case 'spiral': S.line(pl(Array.from({ length: 26 }, (_, i) => { const a = i * 0.55; return [Math.cos(a) * a * 1.15, Math.sin(a) * a * 1.15]; }))); break;
    case 'squiggle': S.line(pl(Array.from({ length: 9 }, (_, i) => [-18 + i * 4.5, Math.sin(i * 1.6) * 6]))); break;
    case 'coil': S.line(pl(Array.from({ length: 30 }, (_, i) => { const t = i * 0.62; return [-18 + t * 1.9 - Math.cos(t) * 5, Math.sin(t) * 7]; }))); break;
    case 'zigzag': S.line(pl(Array.from({ length: 7 }, (_, i) => [-16 + i * 5.5, i % 2 ? -7 : 7]))); break;
    case 'sparkle': for (const l of [[[-14, 0], [14, 0]], [[0, -14], [0, 14]], [[-7, -7], [7, 7]], [[-7, 7], [7, -7]]]) S.line(pl(l)); break;
    case 'dots': for (const [px, py] of [[-8, -6], [6, -8], [0, 4], [-10, 9], [10, 7]]) { const [p] = pl([[px, py]]); S.dot(p[0], p[1]); } break;
    case 'check': S.line(pl([[-10, 0], [-3, 8], [12, -10]])); break;
    default: break;
  }
}
const FILLABLE = ['star', 'heart', 'circle', 'cloud', 'face', 'flower', 'sun'];
const SMALL = ['star', 'sparkle', 'spiral', 'squiggle', 'heart', 'dots', 'circle', 'zigzag', 'coil', 'face', 'sun', 'flower', 'check'];

/** An arrow with a curved shaft and an open two-stroke head, pointing at (x2, y2). */
function arrowTo(S, x1, y1, x2, y2, bend) {
  const mx = (x1 + x2) / 2 - (y2 - y1) * 0.3 * bend, my = (y1 + y2) / 2 + (x2 - x1) * 0.3 * bend;
  const shaft = Array.from({ length: 9 }, (_, i) => { const t = i / 8; return [(1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t * t * x2, (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t * t * y2]; });
  S.line(shaft);
  const a = Math.atan2(y2 - my, x2 - mx), L = Math.max(S.P.w * 4, S.unit * 10);
  S.line([[x2 - Math.cos(a - 0.55) * L, y2 - Math.sin(a - 0.55) * L], [x2, y2], [x2 - Math.cos(a + 0.55) * L, y2 - Math.sin(a + 0.55) * L]]);
}

// ------------------------------------------------------------------ focal doodles (radius R around cx, cy)
const FOCALS = {
  star(S, cx, cy, R) {
    S.shape(place(starPts(R, R * 0.44), cx, cy, 1, -0.12), S.P.accent);
    for (const a of [-2.3, -1.75, -1.2]) S.line([[cx + Math.cos(a) * R * 1.15, cy + Math.sin(a) * R * 1.15], [cx + Math.cos(a) * R * 1.4, cy + Math.sin(a) * R * 1.4]]);
  },
  sunny(S, cx, cy, R) {
    const r = R * 0.62;
    S.shape(place(ring(r, r, 18), cx, cy), S.P.accent);
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + 0.2; S.line([[cx + Math.cos(a) * r * 1.22, cy + Math.sin(a) * r * 1.22], [cx + Math.cos(a) * R * 1.05, cy + Math.sin(a) * R * 1.05]]); }
    S.dot(cx - r * 0.3, cy - r * 0.15); S.dot(cx + r * 0.3, cy - r * 0.15);
    S.line([[cx - r * 0.38, cy + r * 0.22], [cx - r * 0.12, cy + r * 0.45], [cx + r * 0.16, cy + r * 0.45], [cx + r * 0.4, cy + r * 0.2]]);
  },
  cup(S, cx, cy, R) {
    const w = R * 1.1, h = R * 0.95, top = cy - h * 0.3;
    const body = [[cx - w / 2, top], [cx + w / 2, top], [cx + w * 0.4, top + h * 0.7], [cx + w * 0.22, top + h], [cx - w * 0.22, top + h], [cx - w * 0.4, top + h * 0.7]];
    S.shape(body, S.P.accent);
    S.line(Array.from({ length: 12 }, (_, i) => { const a = -Math.PI / 2 + (i / 11) * Math.PI; return [cx + w * 0.45 + Math.cos(a) * w * 0.24, top + h * 0.35 + Math.sin(a) * h * 0.24]; }));
    S.line([[cx - w * 0.8, top + h + R * 0.06], [cx + w * 0.8, top + h + R * 0.06]]);
    for (let k = -1; k <= 1; k++) S.line(Array.from({ length: 8 }, (_, i) => [cx + k * w * 0.26 + Math.sin(i * 1.1) * R * 0.07, top - R * 0.12 - i * R * 0.08]));
  },
  heart(S, cx, cy, R) {
    S.shape(place(heartPts(R / 16), cx, cy + R * 0.05, 1, 0.08), S.P.accent);
    for (const a of [-2.5, -0.65]) S.line([[cx + Math.cos(a) * R * 1.1, cy + Math.sin(a) * R * 1.1], [cx + Math.cos(a) * R * 1.35, cy + Math.sin(a) * R * 1.35]]);
    S.line([[cx - R * 1.25, cy + R * 0.2], [cx - R * 1.45, cy + R * 0.3]]);
  },
  idea(S, cx, cy, R) {
    const cloud = place(ring(R, R * 0.7, 30, 4), cx, cy - R * 0.1);
    S.shape(cloud, S.P.fills[2]);
    S.shape(place(starPts(R * 0.36, R * 0.16), cx, cy - R * 0.1, 1, 0.2), S.P.accent);
    for (const [dx, dy, r] of [[-0.75, 0.85, 0.12], [-1.0, 1.08, 0.07]]) S.line(place(ring(R * r, R * r, 8), cx + dx * R, cy + dy * R), true);
  },
  flower(S, cx, cy, R) {
    S.line([[cx, cy + R * 0.3], [cx + R * 0.05, cy + R * 0.8], [cx - R * 0.05, cy + R * 1.2]]);
    S.shape(place([[0, 0], [R * 0.3, -R * 0.15], [R * 0.45, R * 0.05], [R * 0.2, R * 0.12]], cx, cy + R * 0.85), S.P.fills[0]);
    S.shape(place(ring(R * 0.6, R * 0.6, 32, 2.5), cx, cy - R * 0.1), S.P.accent);
    S.shape(place(ring(R * 0.17, R * 0.17, 9), cx, cy - R * 0.1), S.P.fills[2]);
  },
};
const FOCAL_KINDS = Object.keys(FOCALS);

/** Product motifs get the house primitives (Humanist Minimal's illustrator) and this palette. */
let HM = null;
function motifHelpers(ctx) {
  if (!HM) {
    const d = new URL('../humanist-minimal/', import.meta.url);
    const j = (f) => JSON.parse(readFileSync(new URL(f, d), 'utf8'));
    HM = { ...j('approach.json'), art: j('art.json'), motion: j('motion.json') };
  }
  const P = pen(ctx);
  const palette = { ground: ctx.pal.ground, paper: ctx.pal.white, ink: P.ink, accent: ctx.pal.accent };
  return { ill: createIllustrator(HM, palette), palette };
}

// ------------------------------------------------------------------ compositions
/** Margin mode: a focal doodle with 5-15 marks clustered on two of its sides (composition.modes.margin). */
function marginArt(ctx, b, n, focalDraw) {
  const short = Math.min(ctx.W, ctx.H);
  const s = Math.min(b.w, b.h);
  const S = sketch(ctx, short / 400);
  const R = s * 0.27;
  const sideX = (ctx.seed + n) % 2 ? 1 : -1;
  const cx = b.x + b.w / 2 - sideX * Math.min(b.w * 0.06, R * 0.3), cy = b.y + b.h / 2 + s * 0.03;
  const kind = (ctx.piece.art && FOCALS[ctx.piece.art.motif]) ? ctx.piece.art.motif : FOCAL_KINDS[(ctx.seed + n) % FOCAL_KINDS.length];
  if (!focalDraw) FOCALS[kind](S, cx, cy, R);
  // Marks: about 16 units of radius each, at most a third of the focal (focalToMarkRatioMin 3).
  const k = Math.max(0.35, (R * 0.3) / 16);
  const count = clamp(Math.round((b.w * b.h) / (s * s) * 4 + 5), 6, 12);
  const sides = sideX > 0 ? [[-Math.PI * 0.95, -Math.PI * 0.05], [Math.PI * 0.15, Math.PI * 0.55]] : [[-Math.PI * 0.95, -Math.PI * 0.05], [Math.PI * 0.45, Math.PI * 0.85]];
  const placed = [];
  let fillsUsed = 0;
  for (let i = 0; i < count * 3 && placed.length < count; i++) {
    const [a0, a1] = sides[i % 2];
    const a = a0 + S.rand() * (a1 - a0);
    const rx = R * 1.45 + S.rand() * Math.max(R * 0.35, (b.w / 2 - R * 1.6)), ry = R * 1.35 + S.rand() * R * 0.4;
    const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
    const m = 16 * k * 1.1;
    if (x < b.x + m || x > b.x + b.w - m || y < b.y + m || y > b.y + b.h - m) continue;
    if (placed.some(([px, py]) => Math.hypot(px - x, py - y) < m * 2.1)) continue;
    placed.push([x, y]);
    const kindM = SMALL[Math.floor(S.rand() * SMALL.length)];
    const fill = FILLABLE.includes(kindM) && fillsUsed < 3 && S.rand() < 0.5 ? S.P.fills[fillsUsed++ % 2] : null;
    mark(S, kindM, x, y, k * (0.85 + S.rand() * 0.3), (S.rand() * 2 - 1) * 0.45, fill);
  }
  // One arrow that points in at the focal (marks point inwards, DD2).
  const aa = sideX > 0 ? Math.PI * 0.82 : Math.PI * 0.18;
  const ax = cx + Math.cos(aa) * R * 2.0, ay = cy + Math.sin(aa) * R * 1.55;
  if (ax > b.x && ax < b.x + b.w && ay < b.y + b.h) arrowTo(S, ax, ay, cx + Math.cos(aa) * R * 1.15, cy + Math.sin(aa) * R * 1.0, sideX * 0.6);
  return { svg: S.render(focalDraw ? focalDraw({ x: cx - R * 1.1, y: cy - R * 1.1, w: R * 2.2, h: R * 2.2 }) : ''), S };
}

/** Wall mode: marks over the whole box with a hand-drawn paper clearing for the focal (composition.modes.wall). */
function wallArt(ctx, b, n) {
  const short = Math.min(ctx.W, ctx.H);
  const S = sketch(ctx, short / 400);
  const clipId = `${ctx.P}wall${n}`;
  const cell = clamp(Math.min(b.w, b.h) / 7.5, short * 0.06, short * 0.12);
  const k = cell / 38;
  const CL = { x: b.x + b.w * 0.5, y: b.y + b.h * 0.5, rx: Math.min(b.w * 0.3, b.h * 0.42), ry: b.h * 0.34 };
  const inCl = (x, y, pad) => ((x - CL.x) / (CL.rx + pad)) ** 2 + ((y - CL.y) / (CL.ry + pad)) ** 2 < 1;
  const fillCols = S.P.fills;
  for (let gy = 0; gy * cell < b.h + cell; gy++) {
    for (let gx = 0; gx * cell < b.w + cell; gx++) {
      const x = b.x + gx * cell + (gy % 2 ? cell / 2 : 0) + (S.rand() * 2 - 1) * cell * 0.12, y = b.y + gy * cell + cell * 0.4 + (S.rand() * 2 - 1) * cell * 0.12;
      if (inCl(x, y, cell * 0.45)) continue;
      const kind = SMALL[Math.floor(S.rand() * SMALL.length)];
      const fill = FILLABLE.includes(kind) && S.rand() < 0.4 ? fillCols[Math.floor(S.rand() * 2)] : null;
      mark(S, kind, x, y, k * (0.8 + S.rand() * 0.25), (S.rand() * 2 - 1) * 0.45, fill);
      const fx = x + cell / 2, fy = y + cell / 2;
      if (!inCl(fx, fy, cell * 0.2)) mark(S, S.rand() < 0.6 ? 'dots' : 'circle', fx, fy, k * 0.45, S.rand() * 3, null);
    }
  }
  const wall = S.render();
  const C = sketch(ctx, short / 400);
  const cloud = ring(CL.rx, CL.ry, 36, 5).map(([x, y]) => [CL.x + x * 0.88, CL.y + y * 0.88]);
  C.fill(cloud.map(([x, y]) => [x - C.P.off[0], y - C.P.off[1]]), ctx.pal.white);
  C.line(cloud, true);
  const kind = FOCAL_KINDS[(ctx.seed + n) % FOCAL_KINDS.length];
  FOCALS[kind](C, CL.x, CL.y, Math.min(CL.rx, CL.ry) * 0.55);
  return `<clipPath id="${clipId}"><rect x="${r1(b.x)}" y="${r1(b.y)}" width="${r1(b.w)}" height="${r1(b.h)}"/></clipPath><g clip-path="url(#${clipId})">${wall}</g>` +
    // The wall stops on a drawn edge, never a fade.
    `<path d="M${r1(b.x)} ${r1(b.y + b.h)}H${r1(b.x + b.w)}" stroke="${S.P.ink}" stroke-width="${r1(S.P.w)}" stroke-linecap="round"/>` + C.render();
}

/** The part of the canvas free of words: the largest rectangle beside the text slots. */
function freeRegion(ctx, within) {
  const { W, H } = ctx;
  const T = ctx.layout.slots.filter((s) => !['art', 'image'].includes(s.role)).map((s) => ctx.px(s.box));
  const area = within || { x: 0, y: 0, w: W, h: H };
  if (!T.length) return area;
  const u = { x0: Math.min(...T.map((b) => b.x)), y0: Math.min(...T.map((b) => b.y)), x1: Math.max(...T.map((b) => b.x + b.w)), y1: Math.max(...T.map((b) => b.y + b.h)) };
  const g = Math.min(W, H) * 0.07;
  const c = [
    { x: area.x, y: area.y, w: area.w, h: u.y0 - g - area.y },
    { x: area.x, y: u.y1 + g, w: area.w, h: area.y + area.h - u.y1 - g },
    { x: area.x, y: area.y, w: u.x0 - g - area.x, h: area.h },
    { x: u.x1 + g, y: area.y, w: area.x + area.w - u.x1 - g, h: area.h },
  ].filter((r) => r.w > 0 && r.h > 0);
  return c.sort((a, b) => b.w * b.h - a.w * a.h)[0] || area;
}

// ------------------------------------------------------------------ the skin
export default {
  compositions: ['single-focal', 'stacked', 'split', 'type-led', 'full-bleed-band', 'grid-of-n'],
  type: {
    headline: { family: 'hand', weight: 700 },   // hand lettering for up to 8 words (handwritten.use: core)
    subhead: { family: 'body' },
    body: { family: 'body' },
    note: { family: 'hand' },
    cta: { family: 'body', weight: 700 },
    brand: { family: 'body', weight: 700 },
  },
  get headlineMax() { return HEAD_MAX; },

  ground(ctx) {
    HEAD_MAX = headMaxFor(ctx);
    return `<rect width="${ctx.W}" height="${ctx.H}" fill="${ctx.pal.ground}"/>`;
  },

  art(ctx, b, { n, slot }) {
    const want = ctx.piece.art && ctx.piece.art.motif;
    const own = (want && ctx.productArt && ctx.productArt[want]) || (ctx.piece.art && ctx.piece.art.file);
    if (own) {
      // The product's own drawing is the focal; the marks gather round it.
      return marginArt(ctx, b, n, (box) => productMotif(ctx, box, motifHelpers(ctx)) || artFile(ctx, box) || '').svg;
    }
    // A full-bleed image slot with no photo becomes a doodle wall (at most one piece in three).
    if (slot.role === 'image' && b.w * b.h > ctx.W * ctx.H * 0.3) return wallArt(ctx, b, n);
    return marginArt(ctx, b, n).svg;
  },

  // Photos annotated in ink: the photo in a rounded box where no words are, a sketch frame
  // overshooting one corner, and a few marks on its edges (never over the middle, where faces are).
  media(ctx, layout) {
    const { W, H } = ctx;
    const imgSlot = layout.slots.find((s) => s.role === 'image');
    const m = Math.min(W, H) * 0.07;
    let r = imgSlot ? freeRegion(ctx, ctx.px(imgSlot.box)) : freeRegion(ctx);
    const x0 = Math.max(r.x, m), y0 = Math.max(r.y, m), x1 = Math.min(r.x + r.w, W - m), y1 = Math.min(r.y + r.h, H - m);
    r = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    const S = sketch(ctx, Math.min(W, H) / 400);
    const rad = Math.min(r.w, r.h) * 0.03;
    const id = `${ctx.P}photo`;
    let s = `<clipPath id="${id}"><rect x="${r1(r.x)}" y="${r1(r.y)}" width="${r1(r.w)}" height="${r1(r.h)}" rx="${r1(rad)}"/></clipPath>` +
      `<image clip-path="url(#${id})" href="${ctx.dataUri(ctx.media)}" x="${r1(r.x)}" y="${r1(r.y)}" width="${r1(r.w)}" height="${r1(r.h)}" preserveAspectRatio="xMidYMid slice"/>`;
    const o = Math.min(W, H) * 0.012;
    S.line([[r.x - o, r.y - o * 0.5], [r.x + r.w + o * 0.6, r.y - o], [r.x + r.w + o, r.y + r.h + o * 0.4], [r.x - o * 0.4, r.y + r.h + o], [r.x - o * 1.2, r.y - o * 2.4]]);
    const k = Math.min(r.w, r.h) * 0.06 / 16;
    mark(S, 'star', r.x + r.w - o * 0.5, r.y + o * 0.5, k * 1.1, 0.2, S.P.accent);
    mark(S, 'sparkle', r.x + r.w - 16 * k * 2.2, r.y + 16 * k * 2.4, k * 0.6, 0, null);
    mark(S, 'squiggle', r.x + r.w * 0.22, r.y + o * 2.4, k, 0, null);
    mark(S, 'dots', r.x + o * 0.5, r.y + r.h - o * 0.5, k, 0, null);
    return s + S.render();
  },

  // Hand lettering tilts a little (handLettering.tiltDeg) and gets a wavy underline under one word.
  text(ctx, slot, blk) {
    if (slot.role === 'note') return `<g transform="rotate(-3 ${r1(blk.x)} ${r1(blk.y0)})">${blk.svg}</g>`;
    if (slot.role !== 'headline') return blk.svg;
    const { size, lines, lead, x, y0, anchor, face } = blk;
    const S = sketch(ctx, Math.min(ctx.W, ctx.H) / 400);
    const k = lines.length - 1, ln = lines[k];
    const words = ln.split(' ');
    let best = 0;
    words.forEach((w, i) => { if (w.replace(/[^\w]/g, '').length >= words[best].replace(/[^\w]/g, '').length) best = i; });
    const tw = (s) => ctx.textWidth(s, { ...face, size });
    const lw = tw(ln), left = anchor === 'middle' ? x - lw / 2 : anchor === 'end' ? x - lw : x;
    const before = words.slice(0, best).join(' ');
    const wx = left + (before ? tw(before + ' ') : 0), ww = tw(words[best].replace(/[,.;:]$/, ''));
    const uy = y0 + k * size * lead + size * 0.2;
    const amp = Math.max(S.P.w * 0.8, size * 0.035);
    S.line(Array.from({ length: 14 }, (_, i) => [wx + (i * ww) / 13, uy + Math.sin(i * 1.7) * amp]), false, 0.4);
    // Three short ticks celebrate the first line (marks may touch the headline only to point at it).
    if (ctx.seed % 2 === 0 && anchor === 'start') {
      const fx = left + tw(lines[0]) + size * 0.25, fy = y0 - size * 0.55;
      if (fx + size * 0.6 < blk.box.x + blk.box.w + size * 0.6) for (const a of [-1.5, -0.9, -0.3]) S.line([[fx + Math.cos(a) * size * 0.12, fy + Math.sin(a) * size * 0.12], [fx + Math.cos(a) * size * 0.4, fy + Math.sin(a) * size * 0.4]]);
    }
    return `<g transform="rotate(-1.5 ${r1(x)} ${r1(y0)})">${blk.svg}${S.render()}</g>`;
  },

  // A solid ink pill with set type (corners.use.button: it must look pressable); its colour
  // shadow is printed off-register, like the fills.
  cta(ctx, b, label, f, slot) {
    const { esc, fit } = ctx;
    const P = pen(ctx);
    const ft = fit(label, b.w * 0.82, b.h * 0.55, f, { max: ctx.W / ctx.H > 2.5 ? b.h * 0.4 : Math.min(ctx.W, ctx.H) * 0.034, min: 12, maxLines: 1 });
    const bh = ft.size * 2.3, bw = Math.min(b.w - P.off[0], ft.width + ft.size * 2.4);
    const x = b.x + (slot && slot.align === 'right' ? b.w - bw - P.off[0] : 0), y = b.y + (b.h - bh) / 2;
    const tc = ctx.readableOn(P.ink, [ctx.pal.black, ctx.pal.white]);
    const under = P.fills[0] !== ctx.pal.white || P.chalk ? P.fills[0] : ctx.pal.accent;
    return `<rect x="${r1(x + P.off[0] * 1.4)}" y="${r1(y + P.off[1] * 1.4)}" width="${r1(bw)}" height="${r1(bh)}" rx="${r1(bh / 2)}" fill="${under}"/>` +
      `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(bw)}" height="${r1(bh)}" rx="${r1(bh / 2)}" fill="${P.ink}"/>` +
      `<text x="${r1(x + bw / 2)}" y="${r1(y + bh / 2 + ft.size * 0.36)}" text-anchor="middle" font-family="'${esc(f.family)}', sans-serif" font-weight="${f.weight}" font-size="${r1(ft.size)}" fill="${tc}">${esc(label)}</text>`;
  },

  // Carousel: one loop-de-loop line runs through every slide at the same height, entering and
  // leaving at the edges (the "link" mark), and the slide number sits in a hand-drawn circle.
  series(ctx, s) {
    const { W, H } = ctx;
    const S = sketch(ctx, Math.min(W, H) / 400);
    const y = H * 0.95, R = H * 0.016;
    const x0 = s.index === 1 ? W * 0.55 : -S.P.w * 2, x1 = s.index === s.of ? W * 0.45 : W + S.P.w * 2;
    const loops = Math.max(1, Math.round((x1 - x0) / (W * 0.33)));
    const pts = [];
    for (let i = 0; i <= loops * 24; i++) {
      const t = i / (loops * 24), a = t * loops * Math.PI * 2;
      pts.push([x0 + (x1 - x0) * t - Math.sin(a) * R * 1.3, y - (1 - Math.cos(a)) * R]);
    }
    pts[0] = [x0, y]; pts[pts.length - 1] = [x1, y];
    S.line(pts, false, 0.3);
    if (s.index === 1) S.shape(place(ring(R * 0.5, R * 0.5, 8), x0, y), S.P.ink);
    if (s.index === s.of) S.shape(place(starPts(R * 1.4, R * 0.6), x1 + R * 1.2, y, 1, 0.1), S.P.fills[0]);
    const fs = Math.max(13, Math.min(W, H) * 0.028), cx = W * 0.9, cy = H * 0.055;
    S.line(place(ring(fs * 1.05, fs * 0.95, 12), cx, cy - fs * 0.35), true);
    return S.render(`<text x="${r1(cx)}" y="${r1(cy)}" text-anchor="middle" font-family="'${ctx.esc(ctx.fam.body)}', sans-serif" font-weight="700" font-size="${r1(fs)}" fill="${pen(ctx).ink}">${s.index}</text>`);
  },
};
