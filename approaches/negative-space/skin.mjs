// Negative Space skin for the design engine (tools/design/engine.mjs).
// Most of the frame is empty, on purpose: a flat, calm ground; ONE small silhouette (8-30% of the
// short side, ideally 12-22%) placed low or to one side and facing into the open field, with at most
// one hairline horizon as a cue of distance; a small, regular-weight headline on the margin; an
// ink-outlined pill for the call to action; photos full-bleed with no overlay (calm region).
// Rules: approaches/negative-space/art.json (space, shape.focal, composition, media),
// typography.json (sizes.byFormat, handwritten: none), layouts.json. Drawing idea: sample.mjs.

import { readFileSync } from 'node:fs';
import { productMotif, artFile } from '../../tools/design/skins/base.mjs';
import { createIllustrator } from '../humanist-minimal/illustration.mjs';

const TYPO = JSON.parse(readFileSync(new URL('./typography.json', import.meta.url), 'utf8'));
const ART = JSON.parse(readFileSync(new URL('./art.json', import.meta.url), 'utf8'));
const r1 = (n) => Math.round(n * 10) / 10;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// The engine reads skin.headlineMax as a number; this style's sizes differ a lot per format
// (typography.json sizes.byFormat: poster 2.5-4.5% cap height, thumbnail 9-14%), so ground()
// records the current piece's value first.
let HEAD_MAX = 0.07;
function headMaxFor(ctx) {
  const by = TYPO.sizes.byFormat;
  const f = by[ctx.piece.format] || by.poster;
  const short = Math.min(ctx.W, ctx.H);
  if (f.headlinePct) return ((f.headlinePct[0] + f.headlinePct[1]) / 2 / 100) * ctx.H / 0.7 / short;
  if (f.headlinePx) return ((f.headlinePx[0] + f.headlinePx[1]) / 2 * (ctx.W / (ctx.piece.format === 'email-header' ? 600 : 1440))) / short;
  return 0.07;
}

function colours(ctx) {
  const { pal, readableOn, contrast } = ctx;
  // Ink: the combination's ink when it reads as body text (7:1 aimed), else Black or White.
  const ink = contrast(pal.ink, pal.ground) >= 4.5 ? pal.ink : readableOn(pal.ground, [pal.black, pal.white]);
  return { ink, accent: pal.accent, paper: pal.white, ground: pal.ground };
}

// ------------------------------------------------------------------ the one object
// Each object is drawn in a 100 x 100 box, resting on y = 100, facing right; flipped to face left.
// Silhouettes only (no outlines), 3-8 parts, the accent on one small part (palette.roles.accent).
const OBJECTS = {
  boat: { horizon: true, front: true, draw: (c) =>
    `<path d="M50 74V8Q72 40 88 74Z" fill="${c.accent}"/><path d="M46 74V18Q34 46 24 74Z" fill="${c.ink}"/>` +
    `<path d="M4 80H98Q92 92 80 98H22Q12 92 4 80Z" fill="${c.ink}"/>`,
    trail: (c) => [0, 1, 2].map((i) => `<path d="M${-6 - i * 12} 96h${-(8 - i * 2)}" stroke="${c.ink}" stroke-width="2" stroke-linecap="round" opacity="${(0.55 - i * 0.15).toFixed(2)}"/>`).join('') },
  bird: { horizon: false, front: true, draw: (c) =>
    `<path d="M8 66Q36 52 66 56Q84 52 94 60Q84 66 68 68Q38 78 8 66Z" fill="${c.ink}"/>` +
    `<path d="M40 60Q46 26 76 10Q66 36 62 58Z" fill="${c.ink}"/>` +
    `<path d="M93 58L104 60L93 63Z" fill="${c.accent}"/>` +
    `<path d="M8 66L-4 58L2 68L-4 76Z" fill="${c.ink}"/>` },
  kite: { horizon: false, front: false, draw: (c) =>
    `<path d="M62 0L86 30L62 64L38 30Z" fill="${c.accent}"/>` +
    `<path d="M62 2V62M40 30H84" stroke="${c.ink}" stroke-width="1.6" opacity="0.6"/>` +
    `<path d="M62 64Q50 82 30 86T2 100" fill="none" stroke="${c.ink}" stroke-width="1.6" stroke-linecap="round"/>` +
    `<path d="M44 80l-5 -6l3 9ZM26 88l-6 -4l4 8Z" fill="${c.ink}"/>` },
  house: { horizon: true, front: false, draw: (c) =>
    `<path d="M66 18h9v20h-9Z" fill="${c.ink}"/><path d="M10 52L50 18L90 52V100H10Z" fill="${c.ink}"/>` +
    `<path d="M38 62h16v16H38Z" fill="${c.accent}"/>` },
  chair: { horizon: true, front: true, draw: (c) =>
    `<path d="M18 4h8v96h-8Z" fill="${c.ink}"/><path d="M70 60h8v40h-8Z" fill="${c.ink}"/>` +
    `<path d="M18 54h64v8H18Z" fill="${c.ink}"/><path d="M26 47h52q4 0 4 4v3H26Z" fill="${c.accent}"/>` },
  sprout: { horizon: true, front: false, draw: (c) =>
    `<path d="M49 100V56Q49 44 54 36" fill="none" stroke="${c.ink}" stroke-width="4" stroke-linecap="round"/>` +
    `<path d="M50 62Q26 62 18 44Q40 40 50 60Z" fill="${c.ink}"/><path d="M53 40Q62 18 86 16Q84 40 54 44Z" fill="${c.accent}"/>` +
    `<path d="M30 100Q50 88 70 100Z" fill="${c.ink}"/>` },
  figure: { horizon: true, front: true, draw: (c) =>
    `<circle cx="54" cy="12" r="9" fill="${c.ink}"/>` +
    `<path d="M44 26Q54 22 64 27L66 60H44Z" fill="${c.ink}"/>` +
    `<path d="M45 26h20v7H45Z" fill="${c.accent}"/>` +
    `<path d="M46 58L36 99H44L55 66L62 99H70L64 58Z" fill="${c.ink}"/>` +
    `<path d="M64 30L76 52L71 55L60 36Z" fill="${c.ink}"/>` },
  cup: { horizon: true, front: true, draw: (c) =>
    `<path d="M22 46H78L72 92Q70 100 60 100H40Q30 100 28 92Z" fill="${c.ink}"/>` +
    `<path d="M76 54Q94 54 92 68Q90 80 72 80" fill="none" stroke="${c.ink}" stroke-width="6"/>` +
    `<ellipse cx="50" cy="46" rx="28" ry="5" fill="${c.accent}"/>` +
    `<path d="M46 34Q40 26 48 18T46 4" fill="none" stroke="${c.ink}" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>` },
};
const KINDS = ['boat', 'bird', 'kite', 'house', 'chair', 'sprout', 'cup', 'figure'];

/** Where the object goes, its size and which way it faces. Own layouts give an object-sized box;
 *  larger boxes (from the shared layouts) get the object scaled down to the style's size, placed in
 *  the low third on the side away from the text, facing into the open field (composition.placements). */
function placement(ctx, b, slot) {
  const { W, H } = ctx;
  const short = Math.min(W, H);
  const ideal = short * (ART.shape.focal.sideIdealPct[0] + ART.shape.focal.sideIdealPct[1]) / 2 / 100; // ~17%
  const facingHint = ctx.layout.focal && String(ctx.layout.focal.facing || '');
  let s, x, base;
  if (Math.min(b.w, b.h) <= short * 0.32) {
    s = Math.min(b.w, b.h);
    x = b.x + (b.w - s) / 2;
    base = b.y + b.h;
  } else {
    // A piece may ask for a bigger object (art.size, share of the short side), up to the style's maximum.
    const maxSide = short * ((ART.shape.focal.sidePct || [8, 30])[1]) / 100;
    const asked = ctx.piece.art && +ctx.piece.art.size ? short * +ctx.piece.art.size : 0;
    s = asked ? Math.min(asked, maxSide, Math.min(b.w, b.h) * 0.9) : Math.min(ideal, Math.min(b.w, b.h) * 0.6);
    const bcx = b.x + b.w / 2;
    const right = Math.abs(bcx - W / 2) < W * 0.05 ? ctx.seed % 2 === 0 : bcx > W / 2;
    x = right ? b.x + b.w * 0.72 - s / 2 : b.x + b.w * 0.28 - s / 2;
    base = b.y + b.h * 0.78;
    // Edge tension: clearly away (>= 15%) from the side edges, never 10-15%.
    x = clamp(x, W * 0.15, W * 0.85 - s);
    base = Math.min(base, H * 0.85);
  }
  let face;
  if (/^left/.test(facingHint)) face = -1;
  else if (/^right/.test(facingHint)) face = 1;
  else face = x + s / 2 > W / 2 ? -1 : 1;
  return { s, x, y: base - s, base, face };
}

/** The hairline horizon (line.horizonWidthPct, opacityForHorizon): margin to margin, only where it
 *  crosses no words; otherwise left out. */
function horizon(ctx, y, fullBleed) {
  const { W, H } = ctx;
  const c = colours(ctx);
  const m = fullBleed ? 0 : Math.min(W, H) * 0.1;
  const hits = ctx.layout.slots.some((sl) => {
    if (['art', 'image'].includes(sl.role)) return false;
    const b = ctx.px(sl.box);
    return y > b.y - H * 0.01 && y < b.y + b.h + H * 0.01;
  });
  if (hits) return '';
  const sw = Math.max(1, Math.min(W, H) * 0.0019);
  return `<path d="M${r1(m)} ${r1(y)}H${r1(W - m)}" stroke="${c.ink}" stroke-width="${r1(sw)}" stroke-linecap="round" opacity="0.55"/>`;
}

/** Product motifs get the house primitives (Humanist Minimal's illustrator) and this palette. */
let HM = null;
function motifHelpers(ctx) {
  if (!HM) {
    const d = new URL('../humanist-minimal/', import.meta.url);
    const j = (f) => JSON.parse(readFileSync(new URL(f, d), 'utf8'));
    HM = { ...j('approach.json'), art: j('art.json'), motion: j('motion.json') };
  }
  const c = colours(ctx);
  const palette = { ground: c.ground, paper: c.paper, ink: c.ink, accent: c.accent };
  return { ill: createIllustrator(HM, palette), palette };
}

// Text: the combination's ink on the ground. On a full-bleed photo, the layout's or the piece's
// statement of the calm region's tone decides (media.text / art.text: 'paper' | 'ink').
function textOn(ctx, slot) {
  const c = colours(ctx);
  if (!ctx.media) return c.ink;
  const imgSlot = ctx.layout.slots.find((s) => s.role === 'image');
  if (imgSlot) return c.ink;
  const tone = (ctx.piece.art && ctx.piece.art.text) || (ctx.layout.media && ctx.layout.media.text);
  if (tone === 'paper') return ctx.pal.white;
  if (tone === 'ink') return ctx.pal.black;
  return (ctx.piece.art && ctx.piece.art.treatment) === 'duotone' ? c.ink : null;
}

// ------------------------------------------------------------------ the skin
export default {
  // The style's own layouts come first (the engine prefers them); these order the shared ones.
  compositions: ['single-focal', 'split', 'stacked', 'type-led', 'full-bleed-band', 'grid-of-n'],
  type: {
    headline: { family: 'display', weight: 400 },   // regular weight: the object is the darkest mass
    subhead: { family: 'body', weight: 400 },
    body: { family: 'body', weight: 400 },
    note: { family: 'body', weight: 400 },          // handwritten: none
    cta: { family: 'body', weight: 500 },
    brand: { family: 'body', weight: 500 },
  },
  get headlineMax() { return HEAD_MAX; },

  // One flat, calm field. No texture, no pattern (texture.rule).
  ground(ctx) {
    HEAD_MAX = headMaxFor(ctx);
    return `<rect width="${ctx.W}" height="${ctx.H}" fill="${ctx.pal.ground}"/>`;
  },

  art(ctx, b, { n, slot }) {
    // One object per piece: a grid of slots still gets only one (shape.rules: never scattered).
    if (n > 0) return '';
    const p = placement(ctx, b, slot);
    const c = colours(ctx);
    const box = { x: p.x, y: p.y, w: p.s, h: p.s };
    const own = productMotif(ctx, box, motifHelpers(ctx)) || artFile(ctx, box);
    if (own) return own;
    const want = ctx.piece.art && ctx.piece.art.motif;
    const kind = OBJECTS[want] ? want : KINDS[ctx.seed % KINDS.length];
    const o = OBJECTS[kind];
    const k = p.s / 100;
    const flip = o.front && p.face < 0;
    const tf = flip ? `translate(${r1(p.x + p.s)} ${r1(p.y)}) scale(${-k.toFixed(4)} ${k.toFixed(4)})` : `translate(${r1(p.x)} ${r1(p.y)}) scale(${k.toFixed(4)})`;
    let s = `<g transform="${tf}">${o.draw(c)}${o.trail ? `<g transform="translate(0 0)">${o.trail(c)}</g>` : ''}</g>`;
    if (o.horizon && !ctx.piece.series) s = horizon(ctx, p.base, false) + s;
    return s;
  },

  // The photo's own calm area is the space: full-bleed, no overlay (media.treatment.default).
  // A piece may ask for the next treatments in the style's order: art.treatment 'duotone' or 'tint'.
  media(ctx, layout) {
    const { W, H } = ctx;
    const c = colours(ctx);
    const imgSlot = layout.slots.find((s) => s.role === 'image');
    const b = imgSlot ? ctx.px(imgSlot.box) : { x: 0, y: 0, w: W, h: H };
    const t = ctx.piece.art && ctx.piece.art.treatment;
    const id = `${ctx.P}duo`;
    let defs = '';
    if (t === 'duotone') {
      const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
      const [d, l] = [rgb(c.ink), rgb(c.ground)];
      defs = `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer>` +
        ['R', 'G', 'B'].map((ch, i) => `<feFunc${ch} type="table" tableValues="${d[i].toFixed(3)} ${l[i].toFixed(3)}"/>`).join('') + `</feComponentTransfer></filter>`;
    }
    let s = defs + `<image href="${ctx.dataUri(ctx.media)}" x="${r1(b.x)}" y="${r1(b.y)}" width="${r1(b.w)}" height="${r1(b.h)}" preserveAspectRatio="xMidYMid slice"${t === 'duotone' ? ` filter="url(#${id})"` : ''}/>`;
    if (t === 'tint') s += `<rect x="${r1(b.x)}" y="${r1(b.y)}" width="${r1(b.w)}" height="${r1(b.h)}" fill="${c.ground}" opacity="0.25"/>`;
    return s;
  },

  // Text: the combination's ink on the ground. On a full-bleed photo, the layout's or the piece's
  // statement of the calm region's tone decides (media.text / art.text: 'paper' | 'ink').
  textOn: (ctx, slot) => textOn(ctx, slot),

  // Nothing behind the words: no strips, plates or bands (media.treatment.avoid).
  decorate: () => '',

  // The button: a pill outlined in ink, no fill (corners.use.button), small and quiet.
  cta(ctx, b, label, f, slot) {
    const { esc, fit } = ctx;
    const ink = ctx.media && !ctx.layout.slots.some((s) => s.role === 'image') ? (textOn(ctx, slot) || colours(ctx).ink) : colours(ctx).ink;
    const max = ctx.W / ctx.H > 2.5 ? b.h * 0.34 : Math.min(ctx.W, ctx.H) * 0.024;
    const ft = fit(label, b.w * 0.8, b.h * 0.5, f, { max, min: 12, maxLines: 1 });
    const bh = ft.size * 2.3, bw = Math.min(b.w, ft.width + ft.size * 2.4);
    const sw = Math.max(1.2, ft.size * 0.07);
    const x = slot && slot.align === 'right' ? b.x + b.w - bw - sw : b.x + sw / 2, y = b.y + (b.h - bh) / 2;
    return `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(bw)}" height="${r1(bh)}" rx="${r1(bh / 2)}" fill="none" stroke="${ink}" stroke-width="${r1(sw)}"/>` +
      `<text x="${r1(x + bw / 2)}" y="${r1(y + bh / 2 + ft.size * 0.36)}" text-anchor="middle" font-family="'${esc(f.family)}', sans-serif" font-weight="${f.weight}" font-size="${r1(ft.size)}" fill="${ink}">${esc(label)}</text>`;
  },

  // Carousel: one hairline horizon runs full-bleed across every slide at the same height (the
  // object rests on it), so the slides join into one long, quiet view; a small page count.
  series(ctx, s) {
    const { W, H } = ctx;
    const c = colours(ctx);
    const art = ctx.layout.slots.find((sl) => sl.role === 'art' || sl.role === 'image');
    const y = art ? placement(ctx, ctx.px(art.box), art).base : H * 0.8;
    const fs = Math.max(13, Math.min(W, H) * 0.02);
    const m = Math.min(W, H) * 0.1;
    return horizon(ctx, y, true) +
      `<text x="${r1(W - m)}" y="${r1(Math.min(H * 0.08, m) + fs * 0.4)}" text-anchor="end" font-family="'${ctx.esc(ctx.fam.body)}', sans-serif" font-size="${r1(fs)}" letter-spacing="${r1(fs * 0.02)}" fill="${c.ink}">${s.index} / ${s.of}</text>`;
  },
};
