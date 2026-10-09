// Bauhaus skin for the design engine (tools/design/engine.mjs).
// Construction, not decoration: circle, square, triangle, half and quarter circle and bars, flat, on an
// 8-column grid, with one 45° diagonal per piece. The accent fills the one focal form; bars and type are
// black (white on a dark ground). Square corners everywhere; the button is a sharp block with an arrow
// built from a bar and a triangle. Photos become high-contrast duotones (black + accent) with type on a
// solid block, never on the photo (art.json → photomontage). Rules: approach.json, art.json, typography.json.

import { productMotif, artFile } from '../../tools/design/skins/base.mjs';

const r1 = (n) => Math.round(n * 10) / 10;
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(Math.max(0, w))}" height="${r1(Math.max(0, h))}" fill="${fill}"${extra}/>`;
const circle = (cx, cy, r, fill) => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="${fill}"/>`;
const poly = (pts, fill) => `<polygon points="${pts.map(([x, y]) => `${r1(x)},${r1(y)}`).join(' ')}" fill="${fill}"/>`;

// The headline face: the pairing's display face when it is a sans; a serif, script or rounded display
// face is replaced by the pairing's own body sans (BH7: geometric or grotesque sans headlines).
// The engine reads skin.type lazily, after ground(ctx), so ground() decides for the piece.
let headSans = false;
const isSansDisplay = (d) => {
  const t = `${d.family} ${d.style || ''} ${d.classification || ''}`;
  return !/serif|slab|script|hand|rounded|deco|didone|old-style|calligraph/i.test(t) || /\bsans\b(?!.*serif)/i.test(`${d.family} ${d.classification || ''}`);
};

/** Colour roles for this piece (art.json → palette.roles). */
function roles(ctx) {
  const { pal, contrast } = ctx;
  const bar = contrast(pal.ground, pal.black) >= contrast(pal.ground, pal.white) ? pal.black : pal.white;
  const paper = bar === pal.black ? pal.white : pal.black;
  const ok = (c, min = 1.4) => c && c !== bar && contrast(c, pal.ground) >= min;
  const focal = ok(pal.accent) ? pal.accent : ok(pal.ink) ? pal.ink : ok(paper, 1.2) ? paper : bar;
  // A small secondary form: the combination's third colour, else its text colour, else paper (≤ 10%).
  const small = [...pal.support, pal.ink, paper].find((c) => c && c !== focal && c !== bar && c !== pal.ground && contrast(c, pal.ground) >= 1.25) || bar;
  // Two-colour combinations (yellow + black): forms in the same colour as the focal form are cut out of it
  // in the ground colour instead (knock-outs), so they never merge into one blob.
  return { bar, paper, focal, small, ground: pal.ground, mono: focal === bar };
}

/** Bar weights (BH6): heavy 4 %, medium 2 %, hairline 0.75 % of the short side, scaled down for small boxes. */
function weights(ctx, s = Infinity) {
  const m = Math.min(ctx.W, ctx.H);
  const k = Math.min(1, s / (m * 0.5));
  return { heavy: Math.max(4, m * 0.04 * k), medium: Math.max(3, m * 0.02 * k), hair: Math.max(2, m * 0.0075 * k) };
}

/** The box extended to the sheet's edge on every side where no text sits in between: forms may bleed there. */
function region(ctx, b) {
  const others = ctx.layout.slots.filter((s) => s.role !== 'art' && !(s.role === 'image' && !ctx.media)).map((s) => ctx.px(s.box));
  const overlapY = (o) => o.y < b.y + b.h && o.y + o.h > b.y;
  const overlapX = (o) => o.x < b.x + b.w && o.x + o.w > b.x;
  const free = {
    left: !others.some((o) => overlapY(o) && o.x + o.w <= b.x + 1),
    right: !others.some((o) => overlapY(o) && o.x >= b.x + b.w - 1),
    top: !others.some((o) => overlapX(o) && o.y + o.h <= b.y + 1),
    bottom: !others.some((o) => overlapX(o) && o.y >= b.y + b.h - 1) && !ctx.piece.series,
  };
  const x0 = free.left ? 0 : b.x, x1 = free.right ? ctx.W : b.x + b.w;
  const y0 = free.top ? 0 : b.y, y1 = free.bottom ? ctx.H : b.y + b.h;
  return { free, R: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } };
}

/** The first number in the headline (a time, a count): Bayer's large numeral as the image. */
const numeral = (ctx) => (String(ctx.piece.headline || '').match(/\d+(?:[:.]\d+)?/) || [null])[0];

// ---------------------------------------------------------------- constructions
// Each draws into box b (px), may overflow into region R (clipped there). dir = +1: focal form to the
// right, -1: mirrored. All forms are exact, flat, unoutlined; one diagonal at 45°.

function bleed(ctx, b, c, dir, w) {
  const s = Math.min(b.w, b.h);
  const r = s * 0.44;
  const cx = dir > 0 ? b.x + b.w - r * 0.62 : b.x + r * 0.62;
  const cy = b.y + (b.h > b.w * 1.15 ? r * 1.05 : b.h / 2);
  const q = r * 0.9;
  const sx = cx - dir * (r + q * 0.62) - (dir > 0 ? 0 : q);
  const sy = cy - q * 0.78;
  const t = r * 1.05;
  const tx = cx + dir * r * 0.25, ty = Math.min(b.y + b.h, cy + r * 0.95);
  const L = Math.hypot(ctx.W, ctx.H);
  return (c.mono ? '' : rect(sx, sy, q, q, c.bar)) +
    circle(cx, cy, r, c.focal) +
    poly([[tx - dir * t, ty], [tx, ty], [tx, ty - t]], c.mono ? c.ground : c.small) +
    `<rect x="${r1(c.mono ? r * 1.18 : -r * 0.4)}" y="${r1(-w.heavy / 2)}" width="${r1(L)}" height="${r1(w.heavy)}" fill="${c.bar}" transform="translate(${r1(cx)} ${r1(cy)}) rotate(${dir > 0 ? 135 : 45})"/>`;
}

function loaf(ctx, b, c, dir, w, R) {
  // Half circle (a loaf, a sunrise) standing on a heavy bar that runs to the edge; a small sun; a block below.
  const r = Math.min(b.w * 0.36, b.h * 0.62);
  const barY = b.y + Math.min(b.h * 0.78, r + b.h * 0.18);
  const cx = dir > 0 ? b.x + b.w * 0.62 : b.x + b.w * 0.38;
  const sun = r * 0.3;
  const sunX = cx - dir * (r + sun * 1.6), sunY = barY - r * 0.95;
  const blk = Math.min(r * 0.62, b.y + b.h - barY - 2);
  const bx = cx - dir * r * 0.15 - (dir > 0 ? blk : 0);
  return `<path d="M${r1(cx - r)},${r1(barY)} A${r1(r)},${r1(r)} 0 0 1 ${r1(cx + r)},${r1(barY)} Z" fill="${c.focal}"/>` +
    rect(R.x, barY, R.w, w.heavy, c.bar) +
    (blk > w.heavy * 2 ? rect(bx, barY, blk, blk, c.small) : '') +
    circle(sunX, sunY, sun, c.bar) +
    // the one diagonal: a medium bar from the sun's centre down to the bar (45°)
    `<rect x="0" y="${r1(-w.medium / 2)}" width="${r1(Math.max(0, (barY - sunY) * Math.SQRT2))}" height="${r1(w.medium)}" fill="${c.bar}" transform="translate(${r1(sunX)} ${r1(sunY)}) rotate(${dir > 0 ? 45 : 135})"/>`;
}

function steps(ctx, b, c, dir, w) {
  // A right triangle in the accent, its hypotenuse on the 45° axis; black steps climb along it; a sun at the top.
  const T = Math.min(b.w * 0.92, b.h * 0.92);
  const right = dir > 0 ? b.x + b.w : b.x;
  const bottom = b.y + b.h - (b.h - T) / 2;
  const tri = poly([[right - dir * T, bottom], [right, bottom], [right, bottom - T]], c.focal);
  const n = 4, h = Math.max(w.medium, T * 0.075), gap = h * 0.9;
  let bars = '';
  for (let k = 0; k < n; k++) {
    const y = bottom - (k + 1) * (h + gap) - T * 0.08;
    // the hypotenuse at this height (x where the triangle edge passes), minus a gap
    const edge = right - dir * (bottom - y - h);
    const len = T * (0.34 + 0.08 * k);
    const x = dir > 0 ? edge - gap - len : edge + gap;
    bars += rect(x, y, len, h, c.bar);
  }
  const sun = T * 0.13;
  return tri + bars + circle(right - dir * T * 0.18 - dir * 0, bottom - T * 0.98 + sun, sun, c.bar === c.focal ? c.small : c.bar);
}

function door(ctx, b, c, dir, w, R) {
  // A square with a quarter circle turning in its corner (a door opening), a bar to the edge, a small triangle.
  const q = Math.min(b.w * 0.8, b.h * 0.84);
  const x = dir > 0 ? b.x + b.w - q : b.x, y = b.y + (b.h - q) / 2;
  const hx = dir > 0 ? x : x + q; // hinge corner
  const quarter = dir > 0
    ? `<path d="M${r1(hx)},${r1(y + q)} L${r1(hx)},${r1(y)} A${r1(q)},${r1(q)} 0 0 1 ${r1(hx + q)},${r1(y + q)} Z" fill="${c.mono ? c.ground : c.focal}"/>`
    : `<path d="M${r1(hx)},${r1(y + q)} L${r1(hx)},${r1(y)} A${r1(q)},${r1(q)} 0 0 0 ${r1(hx - q)},${r1(y + q)} Z" fill="${c.mono ? c.ground : c.focal}"/>`;
  const barY = y + q - w.heavy;
  const t = q * 0.25;
  const tx = dir > 0 ? x - q * 0.04 : x + q * 1.04;
  return rect(x, y, q, q, c.bar) + quarter +
    (dir > 0 ? rect(R.x, barY, x - R.x, w.heavy, c.bar) : rect(x + q, barY, R.x + R.w - x - q, w.heavy, c.bar)) +
    poly([[tx, barY], [tx - dir * t, barY], [tx, barY - t]], c.small);
}

function bigNumeral(ctx, b, c, dir, w, R, num) {
  // Bayer's banknote numeral: the time or count as the image, over the focal circle.
  const f = ctx.face('headline');
  const tw = (s) => ctx.textWidth(num, { ...f, size: s, tracking: -0.04 });
  let size = b.h * 0.8;
  while (size > 10 && tw(size) > b.w * 0.86) size *= 0.95;
  const r = Math.min(b.h * 0.42, b.w * 0.3);
  const cx = dir > 0 ? b.x + b.w - r * 0.8 : b.x + r * 0.8;
  const cy = b.y + r * 1.02;
  const base = b.y + b.h * 0.5 + size * 0.36;
  const x = dir > 0 ? b.x : b.x + b.w - tw(size);
  const disc = c.mono ? (c.small !== c.bar ? c.small : null) : c.focal;
  return (disc ? circle(cx, cy, r, disc) : '') +
    rect(R.x, base + w.medium, R.w, w.heavy, c.bar) +
    `<text x="${r1(x)}" y="${r1(base)}" font-family="'${ctx.esc(f.family)}', sans-serif" font-weight="${f.weight}" font-size="${r1(size)}" letter-spacing="${r1(-0.04 * size)}" fill="${c.bar}">${ctx.esc(num)}</text>`;
}

function disc(ctx, b, c, dir, w, R) {
  // For small boxes: the focal circle bleeding off the box edge, standing on a heavy bar that meets the sheet edge.
  const r = Math.min(b.w, b.h) * 0.42;
  const cx = dir > 0 ? b.x + b.w - r * 0.8 : b.x + r * 0.8, cy = b.y + b.h * 0.46;
  const by = cy + r - w.heavy * 0.2;
  return circle(cx, cy, r, c.focal) + (dir > 0 ? rect(cx - r * 1.6, by, R.x + R.w - cx + r * 1.6, w.heavy, c.mono ? c.bar : c.bar) : rect(R.x, by, cx + r * 1.6 - R.x, w.heavy, c.bar)) +
    (c.mono ? '' : rect(cx - dir * r * 1.45 - (dir > 0 ? 0 : r * 0.55), by - r * 0.55, r * 0.55, r * 0.55, c.small));
}

function tile(ctx, b, c, n, w) {
  // Grid of elementary forms: one form per cell, the accent on the first only.
  const s = Math.min(b.w, b.h) * 0.86;
  const x = b.x + (b.w - s) / 2, y = b.y + (b.h - s) / 2;
  const k = n % 4;
  if (k === 0) return circle(x + s / 2, y + s / 2, s / 2, c.focal);
  if (k === 1) return `<path d="M${r1(x)},${r1(y)} L${r1(x + s)},${r1(y)} L${r1(x + s)},${r1(y + s)} A${r1(s)},${r1(s)} 0 0 0 ${r1(x)},${r1(y)} Z" fill="${c.bar}"/>`;
  if (k === 2) return poly([[x, y + s], [x + s, y + s], [x + s, y]], c.bar);
  return `<path d="M${r1(x)},${r1(y + s * 0.8)} A${r1(s / 2)},${r1(s / 2)} 0 0 1 ${r1(x + s)},${r1(y + s * 0.8)} Z" fill="${c.bar}"/>` + rect(x - b.w, y + s * 0.8, s + b.w * 2, w.heavy, c.bar);
}

// ---------------------------------------------------------------- photos
function duotoneFilter(ctx, id) {
  // Black-and-white, high contrast, then black → accent (art.json → photomontage: duotone, deep blacks).
  const { pal } = ctx;
  const c = roles(ctx);
  const tone = c.focal !== c.bar && ctx.contrast(c.focal, pal.black) >= 3 ? c.focal : pal.white;
  const rgb = (h) => [1, 3, 5].map((i) => (parseInt(h.slice(i, i + 2), 16) / 255).toFixed(3));
  const [d, l] = [rgb(pal.black), rgb(tone)];
  return `<filter id="${id}" color-interpolation-filters="sRGB">` +
    `<feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0"/>` +
    `<feComponentTransfer><feFuncR type="linear" slope="2.1" intercept="-0.18"/><feFuncG type="linear" slope="2.1" intercept="-0.18"/><feFuncB type="linear" slope="2.1" intercept="-0.18"/></feComponentTransfer>` +
    `<feComponentTransfer><feFuncR type="table" tableValues="${d[0]} ${l[0]}"/><feFuncG type="table" tableValues="${d[1]} ${l[1]}"/><feFuncB type="table" tableValues="${d[2]} ${l[2]}"/></feComponentTransfer>` +
    `</filter>`;
}

/** The solid block that carries type over a photo (layout.media.textZone, padded, square corners). */
function photoBlock(ctx, layout) {
  const tz = layout.media && layout.media.textZone;
  if (!tz) return null;
  const z = ctx.px(tz);
  const pad = Math.min(ctx.W, ctx.H) * 0.035;
  // Run the block to the nearest sheet edge (a bar that meets the edge, BH6).
  const x0 = z.x - pad < ctx.W * 0.12 ? 0 : z.x - pad;
  const x1 = z.x + z.w + pad > ctx.W * 0.88 ? ctx.W : z.x + z.w + pad;
  return { x: x0, y: z.y - pad, w: x1 - x0, h: z.h + pad * 2 };
}

// ---------------------------------------------------------------- the skin
export default {
  compositions: ['single-focal', 'split', 'type-led', 'full-bleed-band', 'stacked', 'grid-of-n'],
  type: {
    get headline() { return { family: headSans ? 'body' : 'display', weight: 900, tracking: -0.025 }; },
    subhead: { family: 'body', weight: 500, tracking: 0 },
    body: { family: 'body', weight: 400, tracking: 0.005 },
    note: { family: 'mono', weight: 400 },
    cta: { family: 'body', weight: 800, upper: true, tracking: 0.12 },
    brand: { family: 'body', weight: 800, tracking: 0 },
  },
  headlineMax: 0.12,

  ground(ctx) {
    headSans = !isSansDisplay(ctx.tokens.typography.pairing.display);
    return `<rect width="${ctx.W}" height="${ctx.H}" fill="${ctx.pal.ground}"/>`;
  },

  art(ctx, b, { n }) {
    const c = roles(ctx);
    const own = productMotif(ctx, b, { roles: c, weights: weights(ctx) }) || artFile(ctx, b);
    if (own) return own;
    const { R } = region(ctx, b);
    const w = weights(ctx, Math.min(b.w, b.h));
    const id = `${ctx.P}clip${n}`;
    // Focal form on the side away from the text (BH4); mirrored when the box sits left of centre.
    const dir = b.x + b.w / 2 >= ctx.W * 0.42 ? 1 : -1;
    let svg;
    if (ctx.layout.composition === 'grid-of-n') svg = tile(ctx, b, c, n, w);
    else {
      const num = numeral(ctx);
      const aspect = b.w / b.h;
      const small = Math.min(b.w, b.h) < Math.min(ctx.W, ctx.H) * 0.3;
      // Constructions rotate through the set in a fixed order (layout.json: vary compositions across a set).
      const fits = { bleed: !small, steps: !small && aspect < 1.5, loaf: !small && aspect > 0.75, door: true, numeral: !small && !!num && num.length <= 5 && aspect > 0.7, disc: small };
      const order = ['bleed', 'steps', 'loaf', 'numeral', 'door', 'disc'].filter((k) => fits[k]);
      const pick = (ctx.piece.art && ctx.piece.art.construction) || order[(ctx.index + n) % order.length];
      svg = pick === 'loaf' ? loaf(ctx, b, c, dir, w, R)
        : pick === 'steps' ? steps(ctx, b, c, dir, w)
        : pick === 'door' ? door(ctx, b, c, dir, w, R)
        : pick === 'numeral' && num ? bigNumeral(ctx, b, c, dir, w, R, num)
        : pick === 'disc' ? disc(ctx, b, c, dir, w, R)
        : bleed(ctx, b, c, dir, w);
    }
    return `<clipPath id="${id}"><rect x="${r1(R.x)}" y="${r1(R.y)}" width="${r1(R.w)}" height="${r1(R.h)}"/></clipPath><g clip-path="url(#${id})">${svg}</g>`;
  },

  defs(ctx) {
    return ctx.media ? duotoneFilter(ctx, `${ctx.P}duo`) : '';
  },

  // Typophoto: the photo as a high-contrast duotone; type sits on a solid block in the ground colour,
  // and the focal circle in the accent crosses the photo's edge... unless the accent is the duotone's light.
  media(ctx, layout) {
    const { W, H, media, dataUri, pal } = ctx;
    const c = roles(ctx);
    const img = `<image href="${dataUri(media)}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" filter="url(#${ctx.P}duo)"/>`;
    const blk = photoBlock(ctx, layout);
    const w = weights(ctx);
    let out = img;
    if (blk) {
      out += rect(blk.x, blk.y, blk.w, blk.h, pal.ground);
      // a heavy bar along the block's top edge, running to the sheet edge
      out += rect(blk.x, blk.y - w.heavy, blk.w, w.heavy, c.bar === pal.ground ? c.paper : c.bar);
    }
    return out;
  },

  textOn(ctx) {
    // Over a photo, type sits on the ground-coloured block; on plain ground, black or white (AA).
    return ctx.pal.onGround;
  },

  // A medium rule under the headline when there is room, else above it (BH6: bars link and divide).
  decorate(ctx, slot, blk) {
    if (slot.role !== 'headline') return '';
    const c = roles(ctx);
    const w = weights(ctx);
    const b = blk.box;
    const bottom = b.y + blk.height;
    const others = ctx.layout.slots.filter((s) => s !== slot && s.role !== 'art').map((s) => ctx.px(s.box));
    const below = others.filter((o) => o.y >= b.y + b.h * 0.5 && o.x < b.x + b.w && o.x + o.w > b.x).reduce((m, o) => Math.min(m, o.y), ctx.H);
    const above = others.filter((o) => o.y + o.h <= b.y + 1 && o.x < b.x + b.w && o.x + o.w > b.x).reduce((m, o) => Math.max(m, o.y + o.h), 0);
    const gap = blk.size * 0.32;
    const len = Math.min(b.w, Math.max(blk.width * 0.5, blk.size * 3));
    const fill = blk.fill || c.bar;
    if (below - bottom >= gap * 2 + w.medium) return rect(b.x, bottom + gap * 0.5, len, w.medium, fill);
    if (b.y - above >= gap * 2 + w.medium) return rect(b.x, b.y - gap - w.medium, len, w.medium, fill);
    return '';
  },

  // A sharp black block with the label in capitals and an arrow (bar + triangle: "the next step").
  cta(ctx, b, label, f) {
    const { pal, esc, fit, contrast } = ctx;
    const shown = String(label).toUpperCase();
    const ft = fit(shown, b.w * 0.7, b.h * 0.44, f, { max: Math.min(ctx.W, ctx.H) * 0.034, min: 11, maxLines: 1 });
    const behind = ctx.media && !(ctx.layout.media && ctx.layout.media.textZone) ? pal.black : pal.ground;
    const fill = contrast(behind, pal.black) >= contrast(behind, pal.white) ? pal.black : pal.white;
    const tc = fill === pal.black ? (contrast(pal.ground, pal.black) > 4.5 && pal.ground !== pal.black ? pal.ground : pal.white) : pal.black;
    const ink = contrast(tc, fill) >= 4.5 ? tc : (fill === pal.black ? pal.white : pal.black);
    const arrow = ft.size * 1.3, padX = ft.size * 1.0;
    const bw = Math.min(b.w, ft.width + arrow + padX * 2.9), bh = ft.size * 2.4;
    const y = b.y + (b.h - bh) / 2;
    const ax = b.x + padX + ft.width + padX * 0.9, ay = y + bh / 2, aw = ft.size * 0.16;
    return rect(b.x, y, bw, bh, fill) +
      `<text x="${r1(b.x + padX)}" y="${r1(y + bh / 2 + ft.size * 0.36)}" font-family="'${esc(f.family)}', sans-serif" font-weight="${f.weight}" font-size="${r1(ft.size)}" letter-spacing="${r1(f.tracking * ft.size)}" fill="${ink}">${esc(shown)}</text>` +
      rect(ax, ay - aw / 2, arrow * 0.62, aw, ink) +
      poly([[ax + arrow * 0.55, ay - ft.size * 0.36], [ax + arrow, ay], [ax + arrow * 0.55, ay + ft.size * 0.36]], ink);
  },

  // Carousel: one heavy bar runs edge to edge at the same height on every slide, so the slides join
  // into one strip; a black square travels along it to mark the step, and the count sits above it.
  series(ctx, s) {
    const c = roles(ctx);
    const w = weights(ctx);
    const y = ctx.H * 0.955;
    const m = ctx.W * 0.08;
    const q = w.heavy * 2.2;
    const x = m + ((ctx.W - 2 * m - q) * (s.index - 1)) / Math.max(1, s.of - 1);
    return rect(0, y, ctx.W, w.heavy, c.bar) + rect(x, y + w.heavy / 2 - q / 2, q, q, c.bar) +
      `<text x="${r1(ctx.W - m)}" y="${r1(y - q * 0.5)}" text-anchor="end" font-family="'${ctx.esc(ctx.fam.mono)}', monospace" font-size="${r1(Math.min(ctx.W, ctx.H) * 0.022)}" fill="${ctx.pal.onGround}">${s.index}/${s.of}</text>`;
  },
};
