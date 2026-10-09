// Scrapbook skin for the design engine (tools/design/engine.mjs).
// A page made from things people keep: a kraft/cream page with ink grain, a torn back sheet,
// one hero instant photo taped at two corners, a ticket stub and a worn rubber stamp around it,
// one hand-drawn arrow; every word on paper (headline on torn newsprint strips, the first word
// sometimes as ransom tiles, the subhead typed on a label, the brand on a label, the CTA a die-cut
// sticker). Flat offset shadows in one direction; tape is the only translucent material.
// Rules: approaches/scrapbook/art.json, typography.json, approach.json. Drawing ideas: sample.mjs.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { productMotif, artFile } from '../../tools/design/skins/base.mjs';
import { createIllustrator } from '../humanist-minimal/illustration.mjs';

const TYPO = JSON.parse(readFileSync(new URL('./typography.json', import.meta.url), 'utf8'));
const r1 = (n) => Math.round(n * 10) / 10;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ------------------------------------------------------------------ per-piece state
// The engine reads skin.headlineMax as a number; the style's sizes differ per format
// (typography.json -> sizes.byFormat), so ground() records the piece's value first.
let HEAD_MAX = 0.1;
function headMaxFor(ctx) {
  const f = TYPO.sizes.byFormat[ctx.piece.format] || TYPO.sizes.byFormat[ctx.piece.format === 'carousel-slide' ? 'instagram-post' : 'poster'];
  const short = Math.min(ctx.W, ctx.H);
  if (f && f.headlinePct) return ((f.headlinePct[0] + f.headlinePct[1]) / 2 / 100) * ctx.H / 0.7 / short;
  if (f && f.headlinePx) return (f.headlinePx[1] * (ctx.W / (ctx.piece.format === 'email-header' ? 600 : 1440))) / short;
  return 0.1;
}

// ------------------------------------------------------------------ colours
function colours(ctx) {
  const { pal, contrast, readableOn } = ctx;
  const paper = pal.white;
  const onPaper = readableOn(paper, [pal.black, pal.ink]);
  const ink = contrast(pal.ground, pal.black) >= 3 ? pal.black : readableOn(pal.ground, [pal.ink, pal.white]);
  const sup = pal.support || [];
  return {
    paper, onPaper, ink,
    tape: sup[0] || pal.ground,               // washi in a support colour, or kraft masking tape
    ticket: sup[0] || paper,
    sky: sup[1] || sup[0] || pal.ground,       // the "photo" content stays in the combination
    sun: sup[0] && sup[0] !== pal.ground ? sup[0] : paper,
    accent: pal.accent,
  };
}

// ------------------------------------------------------------------ paper primitives
/** A torn edge between two points: fibre jitter every 3-6 units (art.json shape.edges.torn). */
function tear(rand, x1, y1, x2, y2, amp, u, start) {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
  const pts = start ? [[x1, y1]] : [];
  for (let d = (3 + rand() * 3) * u; d < len - 2 * u; d += (3 + rand() * 3) * u) {
    const t = d / len, o = (rand() * 2 - 1) * amp + (rand() < 0.12 ? amp * 1.4 : 0);
    pts.push([x1 + (x2 - x1) * t + nx * o, y1 + (y2 - y1) * t + ny * o]);
  }
  pts.push([x2, y2]);
  return pts;
}
/** A paper scrap: a rectangle with chosen sides torn ('t','r','b','l'); the rest cut straight. */
function scrap(rand, x, y, w, h, torn, amp, u) {
  const c = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], key = 'trbl';
  let pts = [];
  for (let i = 0; i < 4; i++) {
    const [a, b] = [c[i], c[(i + 1) % 4]];
    pts = pts.concat(torn.includes(key[i]) ? tear(rand, a[0], a[1], b[0], b[1], amp, u, i === 0) : (i === 0 ? [a, b] : [b]));
  }
  return 'M' + pts.map((p) => r1(p[0]) + ' ' + r1(p[1])).join('L') + 'Z';
}
const rect = (x, y, w, h) => `M${r1(x)} ${r1(y)}H${r1(x + w)}V${r1(y + h)}H${r1(x)}Z`;
/** Flat offset shadow (no blur), same direction for every item, then the piece. */
const piece = (ctx, d, fill, u) => `<path d="${d}" fill="${colours(ctx).ink}" opacity="0.16" transform="translate(${r1(2.5 * u)} ${r1(3 * u)})"/><path d="${d}" fill="${fill}"/>`;
/** Tape: translucent strip with zigzag ends (texture.tape). */
function tape(cx, cy, w, h, rot, fill) {
  const p = [], z = Math.min(h * 0.16, w * 0.08);
  for (let i = 0; i <= 4; i++) p.push([-w / 2 + (i % 2 ? z : 0), -h / 2 + (h * i) / 4]);
  for (let i = 4; i >= 0; i--) p.push([w / 2 - (i % 2 ? z : 0), -h / 2 + (h * i) / 4]);
  return `<path d="M${p.map((q) => r1(q[0]) + ' ' + r1(q[1])).join('L')}Z" fill="${fill}" opacity="0.74" transform="translate(${r1(cx)} ${r1(cy)}) rotate(${r1(rot)})"/>`;
}
const rot = (deg, cx, cy, inner) => `<g transform="rotate(${r1(deg)} ${r1(cx)} ${r1(cy)})">${inner}</g>`;
const sgnRand = (rand, lo, hi) => (rand() < 0.5 ? -1 : 1) * (lo + rand() * (hi - lo));

/** One hand mark: a marker arrow in a single gesture, plus a two-stroke head (art.json line). */
function arrow(ctx, from, to, u, bend = 1) {
  const c = colours(ctx);
  const [x1, y1] = from, [x2, y2] = to;
  const mx = (x1 + x2) / 2 - (y2 - y1) * 0.35 * bend, my = (y1 + y2) / 2 + (x2 - x1) * 0.35 * bend;
  const a = Math.atan2(y2 - my, x2 - mx), L = 9 * u;
  const h1 = [x2 - Math.cos(a - 0.5) * L, y2 - Math.sin(a - 0.5) * L], h2 = [x2 - Math.cos(a + 0.5) * L, y2 - Math.sin(a + 0.5) * L];
  const sw = r1(Math.max(1.6, 2.4 * u));
  return `<g fill="none" stroke="${c.ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M${r1(x1)} ${r1(y1)}Q${r1(mx)} ${r1(my)} ${r1(x2)} ${r1(y2)}"/><path d="M${r1(h1[0])} ${r1(h1[1])}L${r1(x2)} ${r1(y2)}L${r1(h2[0])} ${r1(h2[1])}"/></g>`;
}

/** Product motifs get the house primitives (Humanist Minimal's illustrator) and the palette. */
let HM = null;
function motifHelpers(ctx) {
  if (!HM) {
    const d = new URL('../humanist-minimal/', import.meta.url);
    const j = (f) => JSON.parse(readFileSync(new URL(f, d), 'utf8'));
    HM = { ...j('approach.json'), art: j('art.json'), motion: j('motion.json') };
  }
  const c = colours(ctx);
  const palette = { ground: c.sky, paper: c.paper, ink: c.ink, accent: ctx.pal.accent };
  return { ill: createIllustrator(HM, palette), palette };
}

// ------------------------------------------------------------------ the instant photo (hero)
/** The photo's content: the product's own motif or art file if the piece names one, else a
 *  printed-looking landscape (sky, sun, halftone, hills) from the combination's colours. */
function photoContent(ctx, x, y, w, h, n) {
  const c = colours(ctx);
  const box = { x, y, w, h };
  const own = (ctx.piece.art && ctx.piece.art.motif && productMotif(ctx, box, motifHelpers(ctx))) || artFile(ctx, box);
  const id = `${ctx.P}ph${n}`;
  let s = `<clipPath id="${id}"><rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}"/></clipPath><g clip-path="url(#${id})">`;
  if (own) return s + `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${c.sky}"/>${own}</g>`;
  s += `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${c.sky}"/>`;
  const sea = (ctx.seed + n) % 2 === 1;
  // Halftone: dots shrink down the sky, like a photo cut from a magazine (texture.halftone).
  const cell = Math.max(5, Math.min(w, h) / 26);
  let dots = '';
  for (let yy = y + cell / 2, row = 0; yy < y + h * 0.62; yy += cell, row++) {
    const rr = cell * (0.3 - ((yy - y) / (h * 0.62)) * 0.22);
    if (rr <= cell * 0.05) continue;
    for (let xx = x + cell / 2 + (row % 2) * cell / 2; xx < x + w; xx += cell) dots += `<circle cx="${r1(xx)}" cy="${r1(yy)}" r="${r1(rr)}"/>`;
  }
  s += `<g fill="${c.ink}" opacity="0.28">${dots}</g>`;
  s += `<circle cx="${r1(x + w * 0.66)}" cy="${r1(y + h * (sea ? 0.42 : 0.36))}" r="${r1(Math.min(w, h) * 0.17)}" fill="${c.sun === c.sky ? c.paper : c.sun}"/>`;
  if (sea) {
    s += `<rect x="${r1(x)}" y="${r1(y + h * 0.7)}" width="${r1(w)}" height="${r1(h * 0.32)}" fill="${c.ink}"/>`;
    for (let k = 0; k < 4; k++) {
      const yy = y + h * (0.77 + k * 0.055), x0 = x + w * (0.12 + ((k * 37) % 30) / 100);
      s += `<path d="M${r1(x0)} ${r1(yy)}h${r1(w * (0.28 - k * 0.04))}" stroke="${c.paper}" stroke-width="${r1(Math.max(1.5, h * 0.012))}" stroke-linecap="round" opacity="0.8"/>`;
    }
    s += `<path d="M${r1(x + w * 0.22)} ${r1(y + h * 0.68)}h${r1(w * 0.16)}l${r1(-w * 0.03)} ${r1(h * 0.045)}h${r1(-w * 0.1)}Z" fill="${c.paper}"/>`;
  } else {
    s += `<path d="M${r1(x - 2)} ${r1(y + h * 0.7)}Q${r1(x + w * 0.3)} ${r1(y + h * 0.5)} ${r1(x + w * 0.55)} ${r1(y + h * 0.66)}T${r1(x + w + 2)} ${r1(y + h * 0.6)}V${r1(y + h + 2)}H${r1(x - 2)}Z" fill="${c.sky === c.paper ? ctx.pal.ground : c.paper}"/>`;
    s += `<path d="M${r1(x - 2)} ${r1(y + h * 0.86)}Q${r1(x + w * 0.45)} ${r1(y + h * 0.7)} ${r1(x + w + 2)} ${r1(y + h * 0.82)}V${r1(y + h + 2)}H${r1(x - 2)}Z" fill="${c.ink}"/>`;
  }
  return s + '</g>';
}

/** A bordered print (instant photo when portrait), with its content and two pieces of tape. */
function print(ctx, cx, cy, pw, ph, deg, u, n, contentFn) {
  const c = colours(ctx);
  const side = Math.min(pw, ph);
  const bd = side * 0.06, bottom = ph >= pw * 0.98 ? side * 0.2 : bd;
  const x = cx - pw / 2, y = cy - ph / 2;
  let s = piece(ctx, rect(x, y, pw, ph), c.paper, u);
  s += contentFn(x + bd, y + bd, pw - bd * 2, ph - bd - bottom);
  const tw = clamp(side * 0.36, 20 * u, 70 * u), th = clamp(side * 0.1, 8 * u, 20 * u);
  s += tape(x + tw * 0.12, y + tw * 0.08, tw, th, -40 - ctx.rand() * 8, c.tape);
  s += tape(x + pw - tw * 0.12, y + ph - tw * 0.08, tw, th, -40 - ctx.rand() * 8, c.tape);
  return rot(deg, cx, cy, s);
}

/** Ticket stub: a support-colour card with notches and a perforation; typed words only, no invented numbers. */
function ticket(ctx, cx, cy, w, deg, u) {
  const c = colours(ctx);
  const h = w * 0.46, x = cx - w / 2, y = cy - h / 2, nr = h * 0.14;
  const d = `M${r1(x)} ${r1(y)}H${r1(x + w)}V${r1(y + h / 2 - nr)}A${r1(nr)} ${r1(nr)} 0 0 0 ${r1(x + w)} ${r1(y + h / 2 + nr)}V${r1(y + h)}H${r1(x)}V${r1(y + h / 2 + nr)}A${r1(nr)} ${r1(nr)} 0 0 0 ${r1(x)} ${r1(y + h / 2 - nr)}Z`;
  const fg = ctx.readableOn(c.ticket, [ctx.pal.black, ctx.pal.white]);
  const fs = h * 0.2;
  const mono = ctx.fam.mono;
  return rot(deg, cx, cy, piece(ctx, d, c.ticket, u) +
    `<path d="M${r1(x + w * 0.74)} ${r1(y + h * 0.1)}V${r1(y + h * 0.9)}" stroke="${fg}" stroke-width="${r1(Math.max(1, 1.2 * u))}" stroke-dasharray="${r1(2 * u)} ${r1(3 * u)}"/>` +
    `<text x="${r1(x + w * 0.09)}" y="${r1(y + h * 0.44)}" font-family="'${ctx.esc(mono)}', monospace" font-size="${r1(fs)}" letter-spacing="${r1(fs * 0.1)}" fill="${fg}">ADMIT</text>` +
    `<text x="${r1(x + w * 0.09)}" y="${r1(y + h * 0.72)}" font-family="'${ctx.esc(mono)}', monospace" font-size="${r1(fs)}" letter-spacing="${r1(fs * 0.1)}" fill="${fg}">ONE</text>`);
}

/** Worn rubber stamp: a double ring with gaps, the brand name round it, postmark waves (texture.stamp). */
function stamp(ctx, cx, cy, r, deg, u, n) {
  const c = colours(ctx);
  const id = `${ctx.P}ring${n}`;
  const name = String(ctx.brand.config.name || '').toUpperCase();
  const fs = clamp((r * 2.4) / Math.max(6, name.length), r * 0.16, r * 0.3);
  const sw = Math.max(1.4, r * 0.06);
  let s = `<g fill="none" stroke="${c.ink}"><circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" stroke-width="${r1(sw)}" stroke-dasharray="${r1(r * 1.6)} ${r1(r * 0.08)} ${r1(r * 2.4)} ${r1(r * 0.12)}"/><circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r * 0.62)}" stroke-width="${r1(sw * 0.5)}"/></g>`;
  s += `<path id="${id}" d="M${r1(cx - r * 0.81)} ${r1(cy)}A${r1(r * 0.81)} ${r1(r * 0.81)} 0 1 1 ${r1(cx + r * 0.81)} ${r1(cy)}" fill="none"/>`;
  s += `<text font-family="'${ctx.esc(ctx.fam.mono)}', monospace" font-size="${r1(fs)}" letter-spacing="${r1(fs * 0.12)}" fill="${c.ink}"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${ctx.esc(name)}</textPath></text>`;
  const wv = r * 0.42;
  let waves = '';
  for (let k = -1; k <= 1; k++) waves += `M${r1(cx + r * 0.75)} ${r1(cy + k * r * 0.3)}q${r1(wv / 2)} ${r1(-wv * 0.3)} ${r1(wv)} 0t${r1(wv)} 0t${r1(wv)} 0`;
  s += `<path d="${waves}" fill="none" stroke="${c.ink}" stroke-width="${r1(sw * 0.8)}"/>`;
  s += `<path d="M${r1(cx - r * 0.3)} ${r1(cy + r * 0.05)}l${r1(r * 0.2)} ${r1(r * 0.2)}l${r1(r * 0.42)} ${r1(-r * 0.42)}" fill="none" stroke="${c.ink}" stroke-width="${r1(sw * 1.2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<g opacity="0.8">${rot(deg, cx, cy, s)}</g>`;
}

/** A torn back sheet: lined or grid paper (texture.paperGrain.lined). */
function sheet(ctx, x, y, w, h, deg, u, n, grid) {
  const c = colours(ctx);
  const d = scrap(ctx.rand, x, y, w, h, n % 2 ? 'tl' : 'tr', 2.2 * u, u);
  const id = `${ctx.P}sh${n}`;
  const step = clamp(Math.min(w, h) / 14, 8 * u, 14 * u);
  let lines = '';
  for (let yy = y + step; yy < y + h; yy += step) lines += `M${r1(x)} ${r1(yy)}H${r1(x + w)}`;
  if (grid) for (let xx = x + step; xx < x + w; xx += step) lines += `M${r1(xx)} ${r1(y)}V${r1(y + h)}`;
  const lc = (ctx.pal.support || [])[0] || ctx.pal.accent;
  return rot(deg, x + w / 2, y + h / 2, piece(ctx, d, c.paper, u) +
    `<clipPath id="${id}"><path d="${d}"/></clipPath><path clip-path="url(#${id})" d="${lines}" stroke="${grid ? lc : c.ink}" stroke-width="${r1(Math.max(0.8, 0.7 * u))}" opacity="${grid ? 0.35 : 0.22}" fill="none"/>`);
}

// ------------------------------------------------------------------ text on paper
/** Paper behind every word: a strip per headline line (torn top and bottom), the first word
 *  sometimes cut into ransom tiles, a typed label for the subhead, a note card for the body. */
function onPaper(ctx, slot, blk) {
  const c = colours(ctx);
  const { size, lines, lead, x, y0, anchor, face } = blk;
  const u = Math.min(ctx.W, ctx.H) / 400;
  const fam = `'${ctx.esc(face.family)}', sans-serif`;
  const tw = (s, f = face, z = size) => ctx.textWidth(s, { ...f, size: z });
  const leftOf = (w) => (anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x);
  const textAttrs = `font-family="${fam}" font-weight="${face.weight}" font-size="${r1(size)}" letter-spacing="${r1(face.tracking * size)}" fill="${c.onPaper}"`;
  const role = slot.role;

  if (role === 'headline') {
    let out = '';
    let sign = ctx.seed % 2 ? 1 : -1;
    const strip = ctx.W / ctx.H > 2.5 || ctx.piece.format === 'thumbnail';
    lines.forEach((ln, k) => {
      const yb = y0 + k * size * lead;
      const top = yb - size * 0.9, hh = size * 1.22;
      let rest = ln, tiles = '', tilesW = 0;
      // Ransom tiles: one headline word at most (typography.json ransomNote), never on small or strip formats.
      const first = ln.split(' ')[0];
      if (k === 0 && !strip && anchor === 'start' && ctx.seed % 3 !== 1 && /^[A-Za-z]{2,8}$/.test(first)) {
        const faces = [{ ...face }, { family: ctx.fam.body, weight: 700, italic: false, tracking: 0 }, { family: ctx.fam.mono, weight: 400, italic: false, tracking: 0 }];
        const fills = [[c.paper], [ctx.pal.black], [ctx.pal.accent], [((ctx.pal.support || [])[0]) || c.paper], [c.paper]];
        const gap = size * 0.06, z = size * 0.96;
        let tx = leftOf(0);
        const parts = [...first].map((ch, i) => {
          const f = faces[i % faces.length];
          const w = tw(ch, f, z) + size * 0.2;
          const bg = fills[i % fills.length][0];
          const fg = ctx.readableOn(bg, [ctx.pal.black, ctx.pal.white]);
          const p = { ch, f, w, bg, fg, x: tx };
          tx += w + gap;
          return p;
        });
        const total = tx - leftOf(0);
        const restTxt = ln.slice(first.length).trim();
        const fitsW = total + (restTxt ? tw(' ' + restTxt) + size * 0.3 : 0) <= blk.box.w + size * 0.25;
        const contrastOk = parts.every((p) => ctx.contrast(p.bg, p.fg) >= 4.5);
        if (fitsW && contrastOk) {
          tilesW = total;
          rest = restTxt;
          for (const [i, p] of parts.entries()) {
            const d = scrap(ctx.rand, p.x, top + size * 0.04, p.w, hh * 0.96, 'trbl', 0.9 * u, u);
            const deg = (i % 2 ? 1 : -1) * (2 + ctx.rand() * 4);
            tiles += rot(deg, p.x + p.w / 2, top + hh / 2, piece(ctx, d, p.bg, u) +
              `<text x="${r1(p.x + p.w / 2)}" y="${r1(yb)}" text-anchor="middle" font-family="'${ctx.esc(p.f.family)}', sans-serif" font-weight="${p.f.weight}" font-size="${r1(z)}" fill="${p.fg}">${ctx.esc(p.ch)}</text>`);
          }
        }
      }
      if (rest) {
        const w = tw(rest);
        const lx = tilesW ? leftOf(0) + tilesW + size * 0.18 : leftOf(w);
        const pad = size * 0.3;
        const d = scrap(ctx.rand, lx - pad, top, w + pad * 2, hh, 'tb', 1.4 * u, u);
        const deg = sign * (0.6 + ctx.rand() * 1.2);
        sign = -sign;
        out += rot(deg, lx + w / 2, top + hh / 2, piece(ctx, d, c.paper, u) + `<text x="${r1(lx)}" y="${r1(yb)}" ${textAttrs}>${ctx.esc(rest)}</text>`);
      }
      out += tiles;
    });
    // Keep the strips inside the slot: scale the whole block down from its anchor when needed.
    const need = (lines.length - 1) * size * lead + size * 1.3;
    const k = Math.min(1, blk.box.h / need);
    return k < 0.999 ? `<g transform="translate(${r1(x)} ${r1(blk.box.y)}) scale(${k.toFixed(3)}) translate(${r1(-x)} ${r1(-blk.box.y)})">${out}</g>` : out;
  }

  if (role === 'note') {
    // One handwritten note, straight on the page, tilted like a quick pen line.
    return rot(-3, x, y0, blk.svg);
  }

  // Subhead: a typed label; body: a note card. Both cut paper with one piece of tape.
  const widths = lines.map((l) => tw(l));
  const w = Math.max(...widths);
  const padX = size * 0.6, padY = size * 0.45;
  const lx = leftOf(w) - padX, ly = y0 - size * 0.86 - padY;
  const lw = w + padX * 2, lh = size * (1 + (lines.length - 1) * lead) + size * 0.25 + padY * 2;
  const deg = (ctx.seed % 2 ? 1 : -1) * (0.8 + ctx.rand() * 0.8);
  const d = role === 'subhead' ? scrap(ctx.rand, lx, ly, lw, lh, 'lr', 1.2 * u, u) : rect(lx, ly, lw, lh);
  const tp = role === 'subhead'
    ? tape(lx + size * 0.2, ly + size * 0.1, clamp(lh * 1.1, 20 * u, 60 * u), clamp(lh * 0.3, 8 * u, 16 * u), -14, c.tape)
    : tape(lx + lw / 2, ly, clamp(lw * 0.22, 24 * u, 70 * u), clamp(size * 0.7, 9 * u, 18 * u), 3, c.tape);
  const body = lines.map((l, k) => `<tspan x="${r1(x)}" y="${r1(y0 + k * size * lead)}">${ctx.esc(l)}</tspan>`).join('');
  return rot(deg, lx + lw / 2, ly + lh / 2, piece(ctx, d, c.paper, u) + `<text text-anchor="${anchor}" ${textAttrs}>${body}</text>` + tp);
}

/** A typed label under the brand (the engine draws the brand itself on top). Skipped when the
 *  product has its own marks: the original mark is placed as it is, without a label. */
function brandLabel(ctx) {
  const slot = ctx.layout.slots.find((s) => s.role === 'brand');
  if (!slot || hasMarks(ctx)) return '';
  const b = ctx.px(slot.box);
  const f = ctx.face('brand');
  const h = Math.min(b.h, Math.max(28, Math.min(ctx.W, ctx.H) * 0.05));
  const ft = ctx.fit(ctx.brand.config.name, b.w, h, f, { max: h, min: 12, maxLines: 1 });
  const u = Math.min(ctx.W, ctx.H) / 400;
  const pad = ft.size * 0.4;
  const x = b.x - pad, y = b.y - ft.size * 0.2, w = ft.width + pad * 2, hh = ft.size * 1.45;
  const c = colours(ctx);
  return rot(-1.5, x + w / 2, y + hh / 2, piece(ctx, scrap(ctx.rand, x, y, w, hh, 'r', 1.2 * u, u), c.paper, u) +
    tape(x + w, y + hh * 0.2, clamp(hh * 1.3, 18 * u, 50 * u), clamp(hh * 0.35, 7 * u, 14 * u), 50, c.tape));
}
function hasMarks(ctx) {
  const f = join(ctx.brand.dir, 'identity.json');
  if (!existsSync(f)) return false;
  try {
    const id = JSON.parse(readFileSync(f, 'utf8'));
    return ((id.marks && id.marks.files) || []).some((m) => (typeof m === 'string' ? m : m.path));
  } catch { return false; }
}

/** The part of the canvas free of text: the largest rectangle above, below, left or right of the text slots. */
function freeRegion(ctx, within) {
  const { W, H } = ctx;
  const T = ctx.layout.slots.filter((s) => !['art', 'image'].includes(s.role)).map((s) => ctx.px(s.box));
  const area = within || { x: 0, y: 0, w: W, h: H };
  if (!T.length) return area;
  const u = { x0: Math.min(...T.map((b) => b.x)), y0: Math.min(...T.map((b) => b.y)), x1: Math.max(...T.map((b) => b.x + b.w)), y1: Math.max(...T.map((b) => b.y + b.h)) };
  const g = Math.min(W, H) * 0.03;
  const cands = [
    { x: area.x, y: area.y, w: area.w, h: u.y0 - g - area.y },
    { x: area.x, y: u.y1 + g, w: area.w, h: area.y + area.h - u.y1 - g },
    { x: area.x, y: area.y, w: u.x0 - g - area.x, h: area.h },
    { x: u.x1 + g, y: area.y, w: area.x + area.w - u.x1 - g, h: area.h },
  ].filter((r) => r.w > 0 && r.h > 0);
  return cands.sort((a, b) => b.w * b.h - a.w * a.h)[0] || area;
}

// ------------------------------------------------------------------ the skin
export default {
  compositions: ['single-focal', 'split', 'stacked', 'type-led', 'full-bleed-band', 'grid-of-n'],
  type: {
    headline: { family: 'display' },
    subhead: { family: 'mono' },
    body: { family: 'body' },
    note: { family: 'hand' },
    cta: { family: 'body', weight: 700 },
    brand: { family: 'body', weight: 700 },
  },
  get headlineMax() { return HEAD_MAX; },

  // The album page: the combination's bg, with 100-160 tiny ink specks (texture.paperGrain).
  ground(ctx) {
    HEAD_MAX = headMaxFor(ctx);
    const { W, H } = ctx;
    const u = Math.min(W, H) / 400;
    const n = Math.round(clamp((W * H) / (u * u) / 1150, 100, 200));
    let g = '';
    for (let i = 0; i < n; i++) g += `<circle cx="${r1(ctx.rand() * W)}" cy="${r1(ctx.rand() * H)}" r="${r1((0.4 + ctx.rand() * 0.6) * u)}"/>`;
    let fib = '';
    for (let i = 0; i < n / 5; i++) { const x = ctx.rand() * W, y = ctx.rand() * H, a = ctx.rand() * Math.PI, l = (3 + ctx.rand() * 5) * u; fib += `M${r1(x)} ${r1(y)}l${r1(Math.cos(a) * l)} ${r1(Math.sin(a) * l)}`; }
    return `<rect width="${W}" height="${H}" fill="${ctx.pal.ground}"/><g fill="${colours(ctx).ink}" opacity="0.1">${g}</g><path d="${fib}" stroke="${colours(ctx).ink}" stroke-width="${r1(0.5 * u)}" opacity="0.08" fill="none"/>` + brandLabel(ctx);
  },

  // The collage in any box: back sheet, hero photo, ticket, stamp, one arrow (art.json composition).
  art(ctx, b, { n, slot }) {
    const { W, H } = ctx;
    const u = Math.min(W, H) / 400;
    const pad = Math.min(b.w, b.h) * 0.06;
    // Full-bleed image slots (no photo given): keep the collage off the canvas edges.
    const m = Math.min(W, H) * 0.06;
    const bx = { x: Math.max(b.x + pad, m), y: Math.max(b.y + pad, m), w: 0, h: 0 };
    bx.w = Math.min(b.x + b.w - pad, W - m) - bx.x;
    bx.h = Math.min(b.y + b.h - pad, H - m) - bx.y;
    const area = bx.w * bx.h, small = area < W * H * 0.06 || Math.min(bx.w, bx.h) < 90 * u * 0.6;
    const side = (ctx.seed + n) % 2 ? 1 : -1;
    const ar = bx.w / bx.h;
    // Hero: portrait instant photo in tall or square boxes, a landscape print in wide ones.
    let pw, ph;
    if (ar < 1.25) { ph = Math.min(bx.h * (small ? 0.86 : 0.8), bx.w * (small ? 0.95 : 0.74) / 0.84); pw = ph * 0.84; }
    else { pw = Math.min(bx.w * (small ? 0.9 : 0.56), bx.h * (small ? 0.86 : 0.78) * 1.3); ph = pw / 1.3; }
    const cx = bx.x + bx.w / 2 + side * (small ? 0 : bx.w * 0.06), cy = bx.y + bx.h / 2 - (small ? 0 : bx.h * 0.03);
    const heroDeg = side * (1.5 + ctx.rand() * 3);
    let s = '';
    if (!small) {
      const sw = Math.min(pw * 1.25, bx.w * 0.9), sh = Math.min(ph * 0.72, bx.h * 0.62);
      const sx = clamp(cx - side * pw * 0.38 - sw / 2, bx.x, bx.x + bx.w - sw), sy = clamp(cy + ph * 0.08, bx.y, bx.y + bx.h - sh);
      s += sheet(ctx, sx, sy, sw, sh, -side * (1.5 + ctx.rand() * 2), u, n, (ctx.seed + n) % 3 === 0);
    }
    s += print(ctx, cx, cy, pw, ph, heroDeg, u, n, (x, y, w, h) => photoContent(ctx, x, y, w, h, n));
    if (!small) {
      const tw = Math.min(pw * 0.62, bx.w * 0.4);
      const tx = clamp(cx + side * pw * 0.42, bx.x + tw * 0.55, bx.x + bx.w - tw * 0.55);
      const ty = clamp(cy + ph * 0.44, bx.y + tw * 0.3, bx.y + bx.h - tw * 0.3);
      s += ticket(ctx, tx, ty, tw, side * (3 + ctx.rand() * 4), u);
      const sr = Math.min(pw * 0.22, bx.w * 0.14);
      const stx = clamp(cx - side * pw * 0.5, bx.x + sr * 1.1, bx.x + bx.w - sr * 2.2), sty = clamp(cy - ph * 0.4, bx.y + sr * 1.1, bx.y + bx.h - sr * 1.1);
      s += stamp(ctx, stx, sty, sr, -side * (6 + ctx.rand() * 6), u, n);
      // One hand mark: an arrow from the free side toward the photo.
      const ax = clamp(cx - side * pw * 0.75, bx.x + 10 * u, bx.x + bx.w - 10 * u), ay = clamp(cy + ph * 0.5, bx.y, bx.y + bx.h - 6 * u);
      const ex = cx - side * pw * 0.52, ey = cy + ph * 0.24;
      if (Math.hypot(ex - ax, ey - ay) > 18 * u) s += arrow(ctx, [ax, ay], [ex, ey], u, side);
    } else if (Math.min(bx.w, bx.h) > 60 * u) {
      const sr = Math.min(pw, ph) * 0.2;
      s += stamp(ctx, cx + side * pw * 0.45, cy + ph * 0.38, sr, side * 8, u, n);
    }
    return s;
  },

  // A real photo as a taped print with a white border, placed where no words are.
  media(ctx, layout) {
    const { W, H } = ctx;
    const u = Math.min(W, H) / 400;
    const imgSlot = layout.slots.find((s) => s.role === 'image');
    let r = imgSlot ? freeRegion(ctx, ctx.px(imgSlot.box)) : freeRegion(ctx);
    const m = Math.min(W, H) * 0.07;
    r = { x: Math.max(r.x, m), y: Math.max(r.y, m), w: 0, h: 0, x1: Math.min(r.x + r.w, W - m), y1: Math.min(r.y + r.h, H - m) };
    r.w = r.x1 - r.x; r.h = r.y1 - r.y;
    const [iw, ih] = ctx.imageSize(ctx.media);
    const ar = clamp(iw / ih, 0.75, 1.5);
    let pw = Math.min(r.w * 0.94, r.h * 0.94 * ar), ph = pw / ar;
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    const deg = (ctx.seed % 2 ? 1 : -1) * (1.5 + ctx.rand() * 2);
    const href = ctx.dataUri(ctx.media), id = `${ctx.P}photo`;
    const s = print(ctx, cx, cy, pw, ph, deg, u, 9, (x, y, w, h) =>
      `<clipPath id="${id}"><rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}"/></clipPath><image clip-path="url(#${id})" href="${href}" x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" preserveAspectRatio="xMidYMid slice"/>`);
    const sr = Math.min(pw, ph) * 0.13;
    return s + stamp(ctx, cx + pw * 0.44, cy + ph * 0.44, sr, 10, u, 9);
  },

  // Every text block sits on paper, so its colour is the paper's ink (Wada Black).
  textOn(ctx, slot) {
    if (['headline', 'subhead', 'body'].includes(slot.role)) return colours(ctx).onPaper;
    if (slot.role === 'brand' && !hasMarks(ctx)) return colours(ctx).onPaper;
    if (ctx.media) return colours(ctx).onPaper === ctx.pal.black && ctx.contrast(ctx.pal.ground, ctx.pal.black) >= 4.5 ? ctx.pal.black : null;
    return null;
  },
  text: (ctx, slot, blk) => onPaper(ctx, slot, blk),

  // The call to action is a die-cut sticker: accent pill with a white rim (corners.use.button).
  cta(ctx, b, label, f, slot) {
    const { pal, esc, fit } = ctx;
    const u = Math.min(ctx.W, ctx.H) / 400;
    const ft = fit(label, b.w * 0.8, b.h * 0.55, f, { max: ctx.W / ctx.H > 2.5 ? b.h * 0.4 : Math.min(ctx.W, ctx.H) * 0.034, min: 12, maxLines: 1 });
    const bh = ft.size * 2.2, bw = Math.min(b.w - ft.size * 0.3, ft.width + ft.size * 2.2);
    const rim = Math.max(2, bh * 0.08);
    const x = b.x + (slot && slot.align === 'right' ? b.w - bw - rim * 2 : 0) + rim, y = b.y + (b.h - bh) / 2;
    let fill = pal.accent, tc = ctx.readableOn(fill, [pal.black, pal.white]);
    if (ctx.contrast(fill, tc) < 4.5) { fill = pal.black; tc = pal.white; }
    const c = colours(ctx);
    const outer = `<rect x="${r1(x - rim)}" y="${r1(y - rim)}" width="${r1(bw + rim * 2)}" height="${r1(bh + rim * 2)}" rx="${r1(bh / 2 + rim)}"`;
    const s = `${outer} fill="${c.ink}" opacity="0.16" transform="translate(${r1(2.5 * u)} ${r1(3 * u)})"/>${outer} fill="${c.paper}"/>` +
      `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(bw)}" height="${r1(bh)}" rx="${r1(bh / 2)}" fill="${fill}"/>` +
      `<text x="${r1(x + bw / 2)}" y="${r1(y + bh / 2 + ft.size * 0.36)}" text-anchor="middle" font-family="'${esc(f.family)}', sans-serif" font-weight="${f.weight}" font-size="${r1(ft.size)}" fill="${tc}">${esc(label)}</text>`;
    return rot(-2.5, x + bw / 2, y + bh / 2, s);
  },

  // Carousel: one strip of masking tape runs across every slide at the same height, entering and
  // leaving at the edges, with a hand arrow on it (swipe), and a typed page label.
  series(ctx, s) {
    const { W, H } = ctx;
    const u = Math.min(W, H) / 400;
    const c = colours(ctx);
    const y = H * 0.955, th = Math.min(W, H) * 0.034;
    const x0 = s.index === 1 ? W * 0.5 : -th, x1 = s.index === s.of ? W * 0.5 : W + th;
    const fill = (ctx.pal.support || [])[0] || c.paper;
    const ends = (x) => tear(ctx.rand, x, y - th / 2, x, y + th / 2, 1.4 * u, u, true);
    const top = [[x0, y - th / 2], [x1, y - th / 2]], bot = [[x1, y + th / 2], [x0, y + th / 2]];
    const pts = [...top, ...(s.index === s.of ? ends(x1).slice(1) : []), ...bot, ...(s.index === 1 ? ends(x0).reverse().slice(1) : [])];
    let out = `<path d="M${pts.map((p) => r1(p[0]) + ' ' + r1(p[1])).join('L')}Z" fill="${fill}" opacity="0.8"/>`;
    if (s.index < s.of) out += arrow(ctx, [W * 0.7, y + th * 0.1], [W * 0.9, y - th * 0.05], u, 0.15);
    const lab = `${s.index} / ${s.of}`;
    const fs = Math.max(13, Math.min(W, H) * 0.024), lw = ctx.textWidth(lab, { family: ctx.fam.mono, weight: 400, size: fs }) + fs * 1.2;
    const lx = W * 0.92 - lw, ly = H * 0.025;
    out += rot(2, lx + lw / 2, ly + fs, piece(ctx, rect(lx, ly, lw, fs * 1.8), c.paper, u) +
      `<text x="${r1(lx + lw / 2)}" y="${r1(ly + fs * 1.25)}" text-anchor="middle" font-family="'${ctx.esc(ctx.fam.mono)}', monospace" font-size="${r1(fs)}" fill="${c.onPaper}">${ctx.esc(lab)}</text>`);
    return out;
  },
};
