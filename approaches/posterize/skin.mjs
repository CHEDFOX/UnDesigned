// Posterize skin for the design engine (tools/design/engine.mjs).
// A photograph printed in a few flat colours, as in screen printing: the image is softened, cut into
// 3 or 4 tonal levels and each level prints as one flat Wada colour (ink darkest, accent middle, ground or
// paper lightest). One print sign: the ink plate sits slightly out of register, with a few worn voids,
// and a halftone fade on the colour block. Type is bold and plain, on flat colour only, never across the image.
// Photos are posterized with SVG filters (the engine has no pixel access); without a photo the skin
// posterizes a procedurally lit grayscale subject (a face, a loaf, a cup) the same way (sample.mjs).
// Rules: approach.json, art.json (posterize, crop, composition, palette.roles), typography.json.

import { productMotif, artFile } from '../../tools/design/skins/base.mjs';
import { subjects } from './subjects.mjs';

const r1 = (n) => Math.round(n * 10) / 10;
const rgb = (h) => [1, 3, 5].map((i) => +(parseInt(String(h).slice(i, i + 2), 16) / 255).toFixed(4));
const lum = (h) => { const [r, g, b] = rgb(h).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const BINS = 48;
const TEXT = ['headline', 'subhead', 'body', 'note', 'brand', 'cta'];
const inter = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** The plates for this piece (art.json → posterize.roleMapping), sorted dark → light so tone never inverts. */
function plates(ctx) {
  const { pal, contrast } = ctx;
  const combo = [pal.ink, ...pal.support, pal.accent].filter(Boolean);
  // Ink: Wada Black, or the combination's own darkest colour when it is dark enough (L* < 35 ≈ Y < 0.085).
  const darkest = [...combo].sort((a, b) => lum(a) - lum(b))[0];
  const ink = darkest && lum(darkest) < 0.085 && darkest !== pal.ground ? darkest : pal.black;
  const accent = pal.accent !== ink && pal.accent !== pal.ground ? pal.accent : (pal.support.find((c) => c !== ink && c !== pal.ground) || pal.ink);
  const light = lum(pal.ground) > 0.45 ? pal.ground : pal.white;
  // Fourth level: the ground between the accent and paper, when it is distinct from both (≥ 15 L*, roughly).
  const four = lum(pal.ground) > lum(accent) && contrast(pal.ground, pal.white) >= 1.18 && contrast(pal.ground, accent) >= 1.5;
  let levels = four ? [ink, accent, pal.ground, pal.white] : [ink, accent, light === accent ? pal.white : light];
  levels = levels.sort((a, b) => lum(a) - lum(b));
  levels[0] = ink;
  // The image block behind the subject: the combination's support colour, else paper.
  const block = pal.support.find((c) => c !== accent && c !== ink && contrast(c, pal.ground) >= 1.15) || (contrast(pal.white, pal.ground) >= 1.08 ? pal.white : accent);
  return { ink, accent, levels, block, cuts: levels.length === 4 ? [0.24, 0.5, 0.76] : [0.3, 0.64] };
}

// Discrete transfer table: BINS steps over 0-1 luminance; each step takes the channel value of its level.
function table(cuts, colours, ch) {
  const out = [];
  for (let i = 0; i < BINS; i++) {
    const v = (i + 0.5) / BINS;
    let k = 0;
    while (k < cuts.length && v >= cuts[k]) k++;
    out.push(rgb(colours[k])[ch]);
  }
  return out.join(' ');
}

const LUMA = '0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0';

/** Two filters: the colour plate (ink zone printed in the accent as a trap) and the offset ink plate.
 *  region = filter region in the user space of the filtered element; blur in those units. */
function plateFilters(id, pz, region, { blur, offset, lift = 1, seed = 3 }) {
  const { x, y, w, h } = region;
  const cuts = pz.cuts;
  const plate = [pz.levels[1], ...pz.levels.slice(1)];
  const inkCut = cuts[0];
  const inkA = Array.from({ length: BINS }, (_, i) => ((i + 0.5) / BINS > 1 - inkCut ? 1 : 0)).join(' ');
  const [ir, ig, ib] = rgb(pz.ink);
  const reg = `filterUnits="userSpaceOnUse" x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" color-interpolation-filters="sRGB"`;
  // Soften, nudge with low-frequency noise so cut edges wander like a real photo; optional midtone lift.
  const soften = `<feGaussianBlur stdDeviation="${r1(blur)}" result="b0"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="${(0.03 * 400 / Math.max(w, h)).toFixed(4)}" numOctaves="2" seed="${seed}" result="t"/>` +
    `<feComposite in="b0" in2="t" operator="arithmetic" k2="1" k3="0.14" k4="-0.07" result="b1"/>` +
    `<feComposite in="b1" in2="b0" operator="in" result="b2"/>` +
    `<feComponentTransfer in="b2" result="b"><feFuncR type="gamma" exponent="${lift}"/><feFuncG type="gamma" exponent="${lift}"/><feFuncB type="gamma" exponent="${lift}"/></feComponentTransfer>`;
  return `<filter id="${id}p" ${reg}>${soften}` +
    `<feColorMatrix in="b" type="matrix" values="${LUMA}"/>` +
    `<feComponentTransfer><feFuncR type="discrete" tableValues="${table(cuts, plate, 0)}"/><feFuncG type="discrete" tableValues="${table(cuts, plate, 1)}"/><feFuncB type="discrete" tableValues="${table(cuts, plate, 2)}"/><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer>` +
    `</filter>` +
    `<filter id="${id}k" ${reg}>${soften}` +
    `<feComponentTransfer in="b" result="mask"><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer>` +
    `<feColorMatrix in="b" type="matrix" values="0 0 0 0 ${ir}  0 0 0 0 ${ig}  0 0 0 0 ${ib}  -0.2126 -0.7152 -0.0722 0 1" result="dark"/>` +
    `<feComponentTransfer in="dark" result="cut"><feFuncA type="discrete" tableValues="${inkA}"/></feComponentTransfer>` +
    `<feComposite in="cut" in2="mask" operator="in" result="plate"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="${(0.9 * 400 / Math.max(w, h)).toFixed(4)}" numOctaves="1" seed="7" result="n"/>` +
    `<feComponentTransfer in="n" result="voids"><feFuncA type="discrete" tableValues="1 1 1 1 1 1 1 1 1 0"/></feComponentTransfer>` +
    `<feComposite in="plate" in2="voids" operator="in"/>` +
    `<feOffset dx="${r1(offset)}" dy="${r1(offset * 0.6)}"/>` +
    `</filter>`;
}

/** Halftone fade: accent dots on a 45° screen growing toward one corner of a block (≤ 25 % of its area). */
function halftone(b, fill, cell, corner = 'bl') {
  let s = '';
  const fx = corner.includes('l') ? b.x : b.x + b.w, fy = corner.includes('b') ? b.y + b.h : b.y;
  const reach = Math.min(b.w, b.h) * 0.62;
  for (let row = 0; row * cell * 0.5 <= reach * 1.05; row++) {
    for (let col = 0; col * cell <= reach * 1.1; col++) {
      const dx = col * cell + (row % 2 ? cell / 2 : 0), dy = row * cell * 0.5;
      const t = 1 - Math.hypot(dx, dy) / reach;
      if (t <= 0.06) continue;
      const r = 0.5 * cell * 0.95 * Math.sqrt(Math.min(0.9, t));
      if (r < cell * 0.12) continue;
      const x = corner.includes('l') ? fx + dx : fx - dx, y = corner.includes('b') ? fy - dy : fy + dy;
      s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}"/>`;
    }
  }
  return `<g fill="${fill}">${s}</g>`;
}

/** Layout: the flat text field (an edge-to-edge band) and the image block. Cached on ctx. */
function info(ctx) {
  if (ctx.__pz) return ctx.__pz;
  const { W, H } = ctx;
  const texts = ctx.layout.slots.filter((s) => TEXT.includes(s.role)).map((s) => ctx.px(s.box));
  let band = null;
  if (ctx.media && ctx.layout.media && ctx.layout.media.textZone) {
    const z = ctx.px(ctx.layout.media.textZone);
    const pad = Math.min(W, H) * 0.05;
    if (z.w >= W * 0.5 && z.h <= H * 0.6) band = z.y + z.h / 2 > H / 2 ? { x: 0, y: z.y - pad, w: W, h: H - z.y + pad, side: 'bottom' } : { x: 0, y: 0, w: W, h: z.y + z.h + pad, side: 'top' };
    else band = z.x + z.w / 2 < W / 2 ? { x: 0, y: 0, w: z.x + z.w + pad, h: H, side: 'left' } : { x: z.x - pad, y: 0, w: W - z.x + pad, h: H, side: 'right' };
  }
  ctx.__pz = { texts, band };
  return ctx.__pz;
}

function region(ctx, b) {
  const { texts } = info(ctx);
  const oy = (o) => o.y < b.y + b.h && o.y + o.h > b.y, ox = (o) => o.x < b.x + b.w && o.x + o.w > b.x;
  const free = {
    left: !texts.some((o) => oy(o) && o.x + o.w <= b.x + 1),
    right: !texts.some((o) => oy(o) && o.x >= b.x + b.w - 1),
    top: !texts.some((o) => ox(o) && o.y + o.h <= b.y + 1),
    bottom: !texts.some((o) => ox(o) && o.y >= b.y + b.h - 1) && !ctx.piece.series,
  };
  // The image may bleed off at most two edges (art.json → composition.rules): keep the two widest.
  const x0 = free.left ? 0 : b.x, x1 = free.right ? ctx.W : b.x + b.w;
  const y0 = free.top ? 0 : b.y, y1 = free.bottom ? ctx.H : b.y + b.h;
  return { R: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, free };
}

// ---------------------------------------------------------------- the skin
export default {
  compositions: ['single-focal', 'full-bleed-band', 'split', 'stacked', 'type-led', 'grid-of-n'],
  type: {
    headline: { family: 'display', weight: 900, tracking: -0.01 },
    subhead: { family: 'body', weight: 500 },
    body: { family: 'body', weight: 400 },
    note: { family: 'body', weight: 700, upper: true, tracking: 0.08 },
    cta: { family: 'body', weight: 700 },
    brand: { family: 'body', weight: 700, tracking: 0.01 },
  },
  headlineMax: 0.115,

  ground: (ctx) => `<rect width="${ctx.W}" height="${ctx.H}" fill="${ctx.pal.ground}"/>`,

  art(ctx, b, { n }) {
    const pz = plates(ctx);
    const own = productMotif(ctx, b, { plates: pz, plateFilters, halftone }) || artFile(ctx, b);
    if (own) return own;
    const grid = ctx.layout.composition === 'grid-of-n';
    const { R, free } = grid ? { R: b, free: {} } : region(ctx, b);
    const id = `${ctx.P}z${n}`;
    const m = Math.min(ctx.W, ctx.H);
    const names = Object.keys(subjects);
    const want = ctx.piece.art && ctx.piece.art.motif;
    const name = names.includes(want) ? want : names[(ctx.index + n) % names.length];
    const subj = subjects[name];
    // Fit the subject's frame (fw x fh) to fill 50-80 % of the image block, standing on its lower edge.
    const [fw, fh] = subj.frame;
    const k = Math.min((R.h * 0.96) / fh, (R.w * 0.94) / fw, (Math.max(b.w, b.h) * 1.05) / Math.min(fw, fh));
    const sx = b.x + b.w / 2 - (fw * k) / 2;
    const sy = R.y + R.h - fh * k;
    const blockFill = grid ? [pz.block, pz.accent, pz.levels[pz.levels.length - 1], pz.block][n % 4] : pz.block;
    // In a grid the plates cycle through the cells (art.json → composition.placements: grid), tone order kept.
    const local = { x: 0, y: 0, w: fw, h: fh };
    const filters = plateFilters(id, pz, { x: -10, y: -10, w: fw + 20, h: fh + 20 }, { blur: fh * 0.006, offset: (m * 0.008) / k, seed: 3 + n });
    const photoA = subj.draw(`${id}a`), photoB = subj.draw(`${id}b`);
    const cell = Math.max(6, m * 0.018);
    const htCorner = (free.left ? 'b' + 'l' : 'b' + 'r');
    const clip = `${id}c`;
    // Ink rule along the image block's edge that faces the text (art.json → line.rules: 1-1.5 % bars).
    const ruleW = m * 0.012;
    const rule = !grid && !free.bottom && R.y + R.h < ctx.H - 1 ? `<rect x="${r1(R.x)}" y="${r1(R.y + R.h - ruleW / 2)}" width="${r1(R.w)}" height="${r1(ruleW)}" fill="${pz.ink}"/>` : '';
    return `<defs>${filters}<clipPath id="${clip}"><rect x="${r1(R.x)}" y="${r1(R.y)}" width="${r1(R.w)}" height="${r1(R.h)}"/></clipPath></defs>` +
      `<rect x="${r1(R.x)}" y="${r1(R.y)}" width="${r1(R.w)}" height="${r1(R.h)}" fill="${blockFill}"/>` +
      `<g clip-path="url(#${clip})">` + halftone(R, blockFill === pz.accent ? pz.levels[pz.levels.length - 1] : pz.accent, cell, htCorner) +
      `<g transform="translate(${r1(sx)} ${r1(sy)}) scale(${k.toFixed(4)})"><g filter="url(#${id}p)">${photoA}</g><g filter="url(#${id}k)">${photoB}</g></g></g>` + rule;
  },

  defs(ctx) {
    if (!ctx.media) return '';
    const pz = plates(ctx);
    const m = Math.min(ctx.W, ctx.H);
    // Cuts: the piece's own thresholds (art.thresholds, 0-1 or 0-100), else the percentile defaults of
    // art.json (posterize.thresholds.byLevels) when the engine supplies the photo's luminance percentiles
    // (ctx.mediaStats.percentiles[0..100]), else fixed cuts after a gentle midtone lift (art.lift, gamma).
    const art = ctx.piece.art || {};
    const t = art.thresholds;
    const pct = ctx.mediaStats && ctx.mediaStats.percentiles;
    const byLevels = (ctx.approach.art && ctx.approach.art.posterize && ctx.approach.art.posterize.thresholds.byLevels) || { 3: [28, 66], 4: [22, 52, 80] };
    const cuts = Array.isArray(t) && t.length === pz.cuts.length ? t.map((v) => (v > 1 ? v / 100 : v))
      : pct ? byLevels[pz.levels.length].map((q) => pct[q] > 1 ? pct[q] / 255 : pct[q]) : pz.cuts;
    const lift = art.lift ? +art.lift : pct || t ? 1 : 0.8;
    const p = { ...pz, cuts };
    return plateFilters(`${ctx.P}ph`, p, { x: 0, y: 0, w: ctx.W, h: ctx.H }, { blur: m * 0.004, offset: m * 0.008, lift });
  },

  // The photo posterized into the plates (ink offset out of register); the words sit on a flat band.
  media(ctx) {
    const { W, H, media, dataUri, pal } = ctx;
    const pz = plates(ctx);
    const { band } = info(ctx);
    const img = (f) => `<image href="${dataUri(media)}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" filter="url(#${ctx.P}ph${f})"/>`;
    let s = `<rect width="${W}" height="${H}" fill="${pz.levels[pz.levels.length - 1]}"/>` + img('p') + img('k');
    if (band) {
      const m = Math.min(W, H);
      s += `<rect x="${r1(band.x)}" y="${r1(band.y)}" width="${r1(band.w)}" height="${r1(band.h)}" fill="${pal.ground}"/>`;
      const rw = m * 0.012;
      const e = band.side === 'bottom' ? [0, band.y - rw / 2, W, rw] : band.side === 'top' ? [0, band.h - rw / 2, W, rw] : band.side === 'left' ? [band.w - rw / 2, 0, rw, H] : [band.x - rw / 2, 0, rw, H];
      s += `<rect x="${r1(e[0])}" y="${r1(e[1])}" width="${r1(e[2])}" height="${r1(e[3])}" fill="${pz.ink}"/>`;
    }
    return s;
  },

  // Headline in ink (or the text role) on flat ground, never in the accent (it would read as part of the image).
  textOn(ctx) {
    const { pal, contrast } = ctx;
    const pz = plates(ctx);
    return contrast(pz.ink, pal.ground) >= 4.5 ? pz.ink : pal.onGround;
  },

  // A flat block: the CTA as a solid ink plate with small square-ish corners (art.json → corners: sm).
  cta(ctx, b, label, f) {
    const { esc, fit, contrast, pal } = ctx;
    const pz = plates(ctx);
    const ft = fit(label, b.w * 0.8, b.h * 0.46, f, { max: Math.min(ctx.W, ctx.H) * 0.034, min: 12, maxLines: 1 });
    const fill = contrast(pz.ink, pal.ground) >= 3 ? pz.ink : pal.onGround;
    const tc = [pal.ground, pal.white, pal.black].find((c) => contrast(c, fill) >= 4.5) || pal.white;
    const bw = Math.min(b.w, ft.width + ft.size * 2), bh = ft.size * 2.3;
    const y = b.y + (b.h - bh) / 2;
    const rad = Math.min(6, bh * 0.08);
    return `<rect x="${r1(b.x)}" y="${r1(y)}" width="${r1(bw)}" height="${r1(bh)}" rx="${r1(rad)}" fill="${fill}"/>` +
      `<text x="${r1(b.x + bw / 2)}" y="${r1(y + bh / 2 + ft.size * 0.36)}" text-anchor="middle" font-family="'${esc(f.family)}', sans-serif" font-weight="${f.weight}" font-size="${r1(ft.size)}" fill="${tc}">${esc(label)}</text>`;
  },

  // Carousel: a flat accent strip runs edge to edge along the foot of every slide; a solid ink block
  // travels along it (one step per slide), with the count in the display face.
  series(ctx, s) {
    const { pal } = ctx;
    const pz = plates(ctx);
    const m = Math.min(ctx.W, ctx.H);
    const h = m * 0.03, y = ctx.H - h;
    const seg = ctx.W / s.of;
    const tc = ctx.contrast(pz.ink, pal.ground) >= 4.5 ? pz.ink : pal.onGround;
    return `<rect x="0" y="${r1(y)}" width="${ctx.W}" height="${r1(h)}" fill="${pz.accent}"/>` +
      `<rect x="${r1(seg * (s.index - 1))}" y="${r1(y)}" width="${r1(seg)}" height="${r1(h)}" fill="${pz.ink}"/>` +
      `<text x="${r1(ctx.W * 0.92)}" y="${r1(y - m * 0.02)}" text-anchor="end" font-family="'${ctx.esc(ctx.fam.display)}', sans-serif" font-size="${r1(m * 0.03)}" fill="${tc}">${s.index}/${s.of}</text>`;
  },
};
