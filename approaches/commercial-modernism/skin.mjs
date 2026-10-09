// Commercial Modernism skin for the design engine (tools/design/engine.mjs).
// One hero object shown like a monument (Cassandre, McKnight Kauffer, Bernhard, Matter): a low horizon,
// a dominant diagonal or converging lines, smooth two-stop airbrush gradients built only from the
// combination's colours (plus Black and White) inside hard stencil edges, speed lines in paper, the
// accent on one object at the focal point, and the words in a solid lettering band that runs edge to edge.
// Rules: approach.json, art.json (airbrush, perspective, lettering, palette.roles), typography.json.

import { productMotif, artFile } from '../../tools/design/skins/base.mjs';

const r1 = (n) => Math.round(n * 10) / 10;
const lum = (hex) => {
  const v = [1, 3, 5].map((i) => parseInt(String(hex).slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
const lin = (id, a, b, x1, y1, x2, y2) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const rad = (id, a, b, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
const inter = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const TEXT = ['headline', 'subhead', 'body', 'note', 'brand', 'cta'];

/** Colour roles (art.json → palette.roles): ground, object (deep + mid), band, paper, accent. */
function roles(ctx) {
  const { pal, contrast } = ctx;
  const cols = [...new Set([pal.ink, ...pal.support, pal.accent].filter((c) => c && c !== pal.ground && c !== pal.black && c !== pal.white))];
  const byLum = [...cols].sort((a, b) => lum(a) - lum(b));
  const nonAccent = byLum.filter((c) => c !== pal.accent);
  const deep = nonAccent.find((c) => lum(c) < 0.12) || pal.black;
  // Lit faces run from a lighter colour of the combination; the shade from deep to black.
  const mid = nonAccent.filter((c) => c !== deep).sort((a, b) => lum(b) - lum(a))[0] || (lum(pal.ground) > 0.4 ? pal.ground : pal.white);
  const band = contrast(deep, pal.white) >= 7 ? deep : pal.black;
  const bandText = contrast(pal.ground, band) >= 7 ? pal.ground : pal.white;
  const light = lum(pal.ground) > 0.5 ? pal.ground : pal.white;
  // Sky: from the lightest colour at the horizon to the ground at the top, only when the two are neighbours.
  const skyLow = contrast(pal.white, pal.ground) < 1.5 ? pal.white : pal.ground;
  const accent = contrast(pal.accent, pal.ground) >= 1.3 ? pal.accent : (pal.support.find((c) => contrast(c, pal.ground) >= 1.3) || deep);
  // Object faces: lit face from the light colours, shade face from the dark ones. On a dark ground the
  // object turns light (its darkest face must still stand 3:1 off the ground, art.json → palette.method).
  const darkGround = lum(pal.ground) < 0.18;
  const litMid = darkGround ? (cols.filter((x) => x !== pal.accent).sort((a, b) => lum(b) - lum(a))[0] || pal.white) : mid;
  const shadeEnd = darkGround ? ([pal.accent, ...cols].find((x) => x !== litMid && contrast(x, pal.ground) >= 2) || litMid) : pal.black;
  const obj = darkGround ? { litA: pal.white, litB: litMid, shA: litMid, shB: shadeEnd } : { litA: lum(pal.ground) > 0.5 ? pal.ground : pal.white, litB: mid, shA: deep, shB: pal.black };
  return { ...obj, ground: pal.ground, deep, mid, band, bandText, light, skyLow, accent, paper: pal.white, black: pal.black, darkGround };
}

/** Where the words live: a solid band edge to edge (bottom or top), or none (flat ground). Cached on ctx. */
function info(ctx) {
  if (ctx.__cm) return ctx.__cm;
  const { W, H } = ctx;
  const slots = ctx.layout.slots;
  const texts = slots.filter((s) => TEXT.includes(s.role)).map((s) => ctx.px(s.box));
  const arts = slots.filter((s) => s.role === 'art' || (s.role === 'image' && !ctx.media)).map((s) => ctx.px(s.box));
  let zone = null;
  if (ctx.media && ctx.layout.media && ctx.layout.media.textZone) zone = ctx.px(ctx.layout.media.textZone);
  else if (texts.length) {
    const x0 = Math.min(...texts.map((t) => t.x)), y0 = Math.min(...texts.map((t) => t.y));
    const x1 = Math.max(...texts.map((t) => t.x + t.w)), y1 = Math.max(...texts.map((t) => t.y + t.h));
    zone = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  const pad = Math.min(W, H) * 0.045;
  let band = null;
  if (zone && (ctx.media || !arts.some((a) => inter(a, zone)))) {
    const wide = zone.w >= W * 0.5 && zone.h <= H * 0.6;
    if (wide && zone.y + zone.h / 2 > H * 0.5) band = { x: 0, y: zone.y - pad, w: W, h: H - zone.y + pad, side: 'bottom' };
    else if (wide) band = { x: 0, y: 0, w: W, h: zone.y + zone.h + pad, side: 'top' };
    else if (ctx.media && zone.x + zone.w / 2 < W * 0.5) band = { x: 0, y: 0, w: zone.x + zone.w + pad, h: H, side: 'left' };
    else if (ctx.media) band = { x: zone.x - pad, y: 0, w: W - zone.x + pad, h: H, side: 'right' };
    if (band && !ctx.media && band.h > H * 0.52) band = null;
  }
  ctx.__cm = { band, texts, arts };
  return ctx.__cm;
}

/** The art box extended to the sheet edges (and down to the band) wherever no words sit in between. */
function region(ctx, b) {
  const { band, texts } = info(ctx);
  const oy = (o) => o.y < b.y + b.h && o.y + o.h > b.y, ox = (o) => o.x < b.x + b.w && o.x + o.w > b.x;
  const free = {
    left: !texts.some((o) => oy(o) && o.x + o.w <= b.x + 1),
    right: !texts.some((o) => ox && oy(o) && o.x >= b.x + b.w - 1),
    top: !texts.some((o) => ox(o) && o.y + o.h <= b.y + 1),
    bottom: !texts.some((o) => ox(o) && o.y >= b.y + b.h - 1) && !ctx.piece.series,
  };
  let x0 = free.left ? 0 : b.x, x1 = free.right ? ctx.W : b.x + b.w;
  let y0 = free.top ? 0 : b.y, y1 = free.bottom ? ctx.H : b.y + b.h;
  if (band && band.side === 'bottom' && ox(band)) y1 = Math.max(Math.min(y1, band.y), Math.min(band.y, b.y + b.h * 1.2));
  if (band && band.side === 'top') y0 = Math.max(y0, band.y + band.h);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

const timeOf = (ctx) => {
  const m = String(ctx.piece.headline || '').match(/\b(\d{1,2})[:.](\d{2})\b/);
  return m ? [+m[1], +m[2]] : null;
};

// ---------------------------------------------------------------- scenes
// Each scene draws a sky and a horizon across region R and the hero object in box b, with gradients in
// its own <defs> (ids prefixed). One light direction: upper left.

function speedLines(x, y, len, dir, n, w, gap, fill) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const L = len * (1 - i * 0.14), t = Math.max(1, w * (1 - i * 0.12));
    const xx = dir > 0 ? x : x - L;
    s += `<rect x="${r1(xx)}" y="${r1(y + i * gap)}" width="${r1(L)}" height="${r1(t)}" rx="${r1(t / 2)}" fill="${fill}"/>`;
  }
  return s;
}

function skyAndSea(ctx, R, c, id, horizon) {
  return lin(`${id}sky`, c.ground, c.skyLow, 0, 0, 0, 1) + lin(`${id}sea`, c.deep, c.black, 0, 0, 0, 1) +
    `<rect x="${r1(R.x)}" y="${r1(R.y)}" width="${r1(R.w)}" height="${r1(horizon - R.y + 1)}" fill="url(#${id}sky)"/>` +
    `<rect x="${r1(R.x)}" y="${r1(horizon)}" width="${r1(R.w)}" height="${r1(R.y + R.h - horizon)}" fill="url(#${id}sea)"/>`;
}

/** Monument: a clock tower seen from a low viewpoint, stepped like a 1930s tower, lit face and shade face
 *  meeting at a ridge; the clock's accent ring is the focal point and its hands show the headline's time. */
function clockTower(ctx, b, R, c, id, dir) {
  const horizon = R.y + R.h * 0.84;
  const s = Math.min(b.w, b.h * 0.8);
  const cx = b.x + b.w * (dir > 0 ? 0.56 : 0.44);
  const top = b.y + b.h * 0.1;
  const wBase = s * 0.5, wTop = s * 0.36;
  const ridgeB = cx - wBase * 0.12, ridgeT = cx - wTop * 0.12;
  const faceR = wTop * 0.36;
  const faceY = top + faceR * 1.5;
  const [h, m] = timeOf(ctx) || [10, 10];
  const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
  const hand = (a, len, wd) => `<rect x="${r1(-wd / 2)}" y="${r1(-len)}" width="${r1(wd)}" height="${r1(len + wd)}" rx="${r1(wd / 2)}" fill="${c.black}" transform="translate(${r1(cx)} ${r1(faceY)}) rotate(${a})"/>`;
  const faces = (xl, xr, rt, rb, yt, yb, wt, wb) => {
    // a trapezoid block split at the ridge into a lit and a shade face
    const L = `M${r1(xl(yb))},${r1(yb)} L${r1(xl(yt))},${r1(yt)} L${r1(rt)},${r1(yt)} L${r1(rb)},${r1(yb)} Z`;
    const Rr = `M${r1(rb)},${r1(yb)} L${r1(rt)},${r1(yt)} L${r1(xr(yt))},${r1(yt)} L${r1(xr(yb))},${r1(yb)} Z`;
    return `<path d="${L}" fill="url(#${id}lit)"/><path d="${Rr}" fill="url(#${id}shade)"/>`;
  };
  const base = horizon + s * 0.03;
  const xl = (y) => cx - (wTop + (wBase - wTop) * ((y - top) / (base - top))) / 2;
  const xr = (y) => cx + (wTop + (wBase - wTop) * ((y - top) / (base - top))) / 2;
  const ridge = (y) => ridgeT + (ridgeB - ridgeT) * ((y - top) / (base - top));
  // crown: two setbacks and a mast
  const c1 = wTop * 0.66, c2 = wTop * 0.34, h1 = s * 0.07, h2 = s * 0.06;
  const crown = faces(() => cx - c1 / 2, () => cx + c1 / 2, cx - c1 * 0.12, cx - c1 * 0.12, top - h1, top, 0, 0) +
    faces(() => cx - c2 / 2, () => cx + c2 / 2, cx - c2 * 0.12, cx - c2 * 0.12, top - h1 - h2, top - h1, 0, 0) +
    `<rect x="${r1(cx - s * 0.006)}" y="${r1(top - h1 - h2 - s * 0.12)}" width="${r1(s * 0.012)}" height="${r1(s * 0.12)}" fill="${c.deep}"/>`;
  const sl = s * 0.012;
  const slots = [0.45, 0.6, 0.75].map((t) => { const y = top + (base - top) * t; return `<rect x="${r1(ridge(y) - wBase * 0.16)}" y="${r1(y)}" width="${r1(wBase * 0.05)}" height="${r1((base - top) * 0.1)}" fill="${c.deep}"/><rect x="${r1(ridge(y) + wBase * 0.1)}" y="${r1(y)}" width="${r1(wBase * 0.05)}" height="${r1((base - top) * 0.1)}" fill="${c.black}"/>`; }).join('');
  return `<defs>${lin(`${id}lit`, c.litA, c.litB, 0, 0, 1, 1)}${lin(`${id}shade`, c.shA, c.shB, 0, 0, 1, 0)}${rad(`${id}face`, c.paper, c.light, 0.35, 0.3, 0.75)}${lin(`${id}ring`, c.accent, c.deep, 0.2, 0, 1, 1)}</defs>` +
    skyAndSea(ctx, R, c, id, horizon) +
    speedLines(dir > 0 ? cx - wBase * 0.75 : cx + wBase * 0.75, faceY - faceR * 0.4, s * 0.5, -dir, 5, sl, sl * 3.2, c.paper) +
    crown + faces(xl, xr, ridgeT, ridgeB, top, base) + slots +
    `<circle cx="${r1(cx)}" cy="${r1(faceY)}" r="${r1(faceR)}" fill="url(#${id}ring)"/>` +
    `<circle cx="${r1(cx)}" cy="${r1(faceY)}" r="${r1(faceR * 0.8)}" fill="url(#${id}face)"/>` +
    [0, 90, 180, 270].map((a) => `<rect x="${r1(-faceR * 0.03)}" y="${r1(-faceR * 0.76)}" width="${r1(faceR * 0.06)}" height="${r1(faceR * 0.14)}" fill="${c.deep}" transform="translate(${r1(cx)} ${r1(faceY)}) rotate(${a})"/>`).join('') +
    hand(ha, faceR * 0.42, faceR * 0.09) + hand(ma, faceR * 0.62, faceR * 0.06) +
    `<circle cx="${r1(cx)}" cy="${r1(faceY)}" r="${r1(faceR * 0.07)}" fill="${c.black}"/>`;
}

/** Tunnel: rails converging on the accent sun at the vanishing point (Étoile du Nord). */
function tunnel(ctx, b, R, c, id) {
  const horizon = b.y + b.h * 0.5;
  const vx = b.x + b.w / 2;
  const s = Math.min(b.w, b.h);
  const sunR = s * 0.2;
  const bottom = R.y + R.h;
  const spread = Math.max(R.w, b.w) * 0.55;
  const rails = [-1, -0.36, 0.36, 1].map((k) => {
    const x = vx + k * spread;
    const wd = s * 0.016;
    return `<path d="M${r1(x - wd)},${r1(bottom)} L${r1(vx)},${r1(horizon)} L${r1(x + wd)},${r1(bottom)} Z" fill="${c.paper}"/>`;
  }).join('');
  let sleepers = '';
  for (let i = 1; i <= 7; i++) {
    const t = (i / 7) ** 2.2; // perspective: closer together near the horizon
    const y = horizon + (bottom - horizon) * t;
    const half = spread * 0.5 * t;
    sleepers += `<rect x="${r1(vx - half)}" y="${r1(y)}" width="${r1(half * 2)}" height="${r1(Math.max(1.5, s * 0.02 * t))}" fill="${c.deep}"/>`;
  }
  const sl = s * 0.011;
  return `<defs>${lin(`${id}sky`, c.ground, c.skyLow, 0, 0, 0, 1)}${lin(`${id}floor`, c.mid, c.deep, 0, 0, 0, 1)}${rad(`${id}sun`, c.paper, c.accent, 0.42, 0.38, 0.62)}</defs>` +
    `<rect x="${r1(R.x)}" y="${r1(R.y)}" width="${r1(R.w)}" height="${r1(horizon - R.y)}" fill="url(#${id}sky)"/>` +
    `<circle cx="${r1(vx)}" cy="${r1(horizon)}" r="${r1(sunR)}" fill="url(#${id}sun)"/>` +
    speedLines(vx - sunR * 1.35, horizon - sunR * 0.75, s * 0.4, -1, 5, sl, sl * 3.2, c.paper) +
    speedLines(vx + sunR * 1.35, horizon - sunR * 0.75, s * 0.4, 1, 5, sl, sl * 3.2, c.paper) +
    `<rect x="${r1(R.x)}" y="${r1(horizon)}" width="${r1(R.w)}" height="${r1(bottom - horizon)}" fill="url(#${id}floor)"/>` +
    sleepers + rails;
}

/** Diagonal: birds in formation rising on one diagonal past a low sun (Kauffer). */
function flock(ctx, b, R, c, id, dir) {
  const horizon = R.y + R.h * 0.78;
  const s = Math.min(b.w, b.h);
  const sunR = s * 0.3;
  const sx = b.x + b.w * (dir > 0 ? 0.7 : 0.3);
  const gull = (x, y, k) => `<path d="M${r1(x - 10 * k)},${r1(y)} Q${r1(x - 5 * k)},${r1(y - 6 * k)} ${r1(x)},${r1(y)} Q${r1(x + 5 * k)},${r1(y - 6 * k)} ${r1(x + 10 * k)},${r1(y)} Q${r1(x + 5 * k)},${r1(y - 3 * k)} ${r1(x)},${r1(y + 1.5 * k)} Q${r1(x - 5 * k)},${r1(y - 3 * k)} ${r1(x - 10 * k)},${r1(y)} Z" fill="url(#${id}bird)"/>`;
  // 7 birds on a 28° diagonal, rising toward the open side; nearer birds larger.
  const ang = (28 * Math.PI) / 180;
  const x0 = b.x + b.w * (dir > 0 ? 0.08 : 0.92), y0 = Math.min(b.y + b.h * 0.86, horizon - s * 0.1);
  const len = Math.min(b.w * 0.9, Math.max(0, y0 - b.y - s * 0.06) / Math.sin(ang));
  let birds = '';
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const k = (s / 400) * (3.4 - t * 2.2);
    const off = (i % 2 ? 1 : -1) * s * 0.035;
    birds += gull(x0 + dir * Math.cos(ang) * len * t, y0 - Math.sin(ang) * len * t + off, k);
  }
  const wake = [0.2, 0.45, 0.7].map((t, i) => `<rect x="${r1(R.x + R.w * t * 0.9)}" y="${r1(horizon + (R.y + R.h - horizon) * (0.25 + i * 0.22))}" width="${r1(R.w * 0.22)}" height="${r1(Math.max(1.5, s * 0.006))}" fill="${c.paper}"/>`).join('');
  return `<defs>${rad(`${id}sun`, c.paper, c.accent, 0.5, 0.5, 0.5)}${lin(`${id}bird`, c.darkGround ? c.litA : c.deep, c.darkGround ? c.litB : c.black, 0, 0, 1, 1)}</defs>` +
    lin(`${id}x`, c.ground, c.ground, 0, 0, 0, 1) +
    skyAndSea(ctx, R, c, id, horizon).replace(/<linearGradient id="[^"]*x"[^>]*>.*?<\/linearGradient>/, '') +
    `<clipPath id="${id}up"><rect x="${r1(R.x)}" y="${r1(R.y)}" width="${r1(R.w)}" height="${r1(horizon - R.y)}"/></clipPath>` +
    `<circle cx="${r1(sx)}" cy="${r1(horizon)}" r="${r1(sunR)}" fill="url(#${id}sun)" clip-path="url(#${id}up)"/>` +
    wake + birds;
}

/** Monument: the liner bow of the style's sample poster, scaled into the box (sample.mjs). */
function liner(ctx, b, R, c, id) {
  const u = Math.min(b.h / 380, b.w / 300);
  const ox = b.x + b.w / 2 - 200 * u, oy = b.y + b.h - 410 * u;
  const horizon = oy + 352 * u;
  const P = (x, y) => `${r1(x)},${r1(y)}`;
  const speed = [];
  for (let i = 0; i < 6; i++) {
    const y = 214 + i * 16, len = 118 - i * 15, w = 3.2 - i * 0.4;
    speed.push(`<rect x="${-30 + i * 3}" y="${y}" width="${len + 40}" height="${w}" rx="${w / 2}" fill="${c.paper}"/>`, `<rect x="${430 - i * 3 - len - 40}" y="${y}" width="${len + 40}" height="${w}" rx="${w / 2}" fill="${c.paper}"/>`);
  }
  const funnel = (cx, top, bottom, wT, wB) => `<path d="M${cx - wB / 2},${bottom} L${cx - wT / 2},${top + 4} Q${cx},${top - 3} ${cx + wT / 2},${top + 4} L${cx + wB / 2},${bottom} Z" fill="url(#${id}fun)"/>` +
    `<path d="M${cx - wT / 2 - 0.4},${top + (bottom - top) * 0.2} L${cx - wT / 2},${top + 4} Q${cx},${top - 3} ${cx + wT / 2},${top + 4} L${cx + wT / 2 + 0.4},${top + (bottom - top) * 0.2} Z" fill="${c.black}"/>`;
  const win = Array.from({ length: 9 }, (_, i) => `<rect x="${137 + i * 14}" y="121" width="8" height="5" rx="1.5" fill="${c.black}"/>`).join('');
  return `<defs>${c.darkGround ? lin(`${id}hl`, c.litA, c.litB, 0, 0, 1, 0) + lin(`${id}hr`, c.shB, c.shA, 0, 0, 1, 0) : lin(`${id}hl`, c.deep, c.black, 0, 0, 1, 0) + lin(`${id}hr`, c.black, c.deep, 0, 0, 1, 0)}${lin(`${id}dk`, c.paper, c.light, 0, 0, 0, 1)}${lin(`${id}fun`, c.accent, c.black, 0.35, 0, 1.25, 0)}</defs>` +
    skyAndSea(ctx, R, c, id, horizon) +
    `<g transform="translate(${P(ox, oy)}) scale(${u.toFixed(4)})">` + speed.join('') +
    funnel(132, 64, 116, 30, 34) + funnel(268, 64, 116, 30, 34) + funnel(200, 34, 112, 42, 48) +
    `<path d="M104,142 L114,108 L286,108 L296,142 Z" fill="url(#${id}dk)"/><rect x="124" y="98" width="152" height="12" rx="2" fill="${c.paper}"/>${win}` +
    `<path d="M200,402 Q108,312 58,156 Q129,136 200,132 Z" fill="url(#${id}hl)"/><path d="M200,402 Q292,312 342,156 Q271,136 200,132 Z" fill="url(#${id}hr)"/>` +
    `<path d="M200,132 L200,402" stroke="${c.paper}" stroke-width="1.6"/><path d="M58,156 Q129,136 200,132 Q271,136 342,156" fill="none" stroke="${c.paper}" stroke-width="3"/>` +
    `<path d="M197,388 Q170,400 122,408 Q170,406 200,411 Q230,406 278,408 Q230,400 203,388 Z" fill="${c.paper}"/></g>`;
}

// ---------------------------------------------------------------- photos
function toneFilter(ctx, id, c) {
  // Duotone in the combination: shadows deep, lights the light colour, contrast raised (Matter montage).
  const rgb = (h) => [1, 3, 5].map((i) => (parseInt(h.slice(i, i + 2), 16) / 255).toFixed(3));
  const [d, l] = [rgb(c.band), rgb(c.light)];
  return `<filter id="${id}" color-interpolation-filters="sRGB">` +
    `<feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0"/>` +
    `<feComponentTransfer><feFuncR type="gamma" amplitude="1.5" exponent="0.75" offset="-0.05"/><feFuncG type="gamma" amplitude="1.5" exponent="0.75" offset="-0.05"/><feFuncB type="gamma" amplitude="1.5" exponent="0.75" offset="-0.05"/></feComponentTransfer>` +
    `<feComponentTransfer><feFuncR type="table" tableValues="${d[0]} ${l[0]}"/><feFuncG type="table" tableValues="${d[1]} ${l[1]}"/><feFuncB type="table" tableValues="${d[2]} ${l[2]}"/></feComponentTransfer>` +
    `</filter>`;
}

const inBand = (ctx, slot) => {
  const { band } = info(ctx);
  if (!band) return false;
  const b = ctx.px(slot.box);
  return b.x >= band.x - 1 && b.y >= band.y - 1 && b.x + b.w <= band.x + band.w + 1 && b.y + b.h <= band.y + band.h + 1;
};

// ---------------------------------------------------------------- the skin
export default {
  compositions: ['single-focal', 'full-bleed-band', 'split', 'stacked', 'type-led', 'grid-of-n'],
  type: {
    headline: { family: 'body', weight: 700, tracking: -0.015 },
    subhead: { family: 'body', weight: 400, tracking: 0.005 },
    body: { family: 'body', weight: 400, tracking: 0 },
    note: { family: 'body', weight: 500, upper: true, tracking: 0.12 },
    cta: { family: 'body', weight: 700, upper: true, tracking: 0.1 },
    brand: { family: 'display', upper: true, tracking: 0.16 },
  },
  headlineMax: 0.1,

  ground(ctx) {
    const c = roles(ctx);
    const { band } = info(ctx);
    let s = `<rect width="${ctx.W}" height="${ctx.H}" fill="${c.ground}"/>`;
    if (band && !ctx.media) s += `<rect x="${r1(band.x)}" y="${r1(band.y)}" width="${r1(band.w)}" height="${r1(band.h)}" fill="${c.band}"/>`;
    return s;
  },

  art(ctx, b, { n }) {
    const c = roles(ctx);
    const own = productMotif(ctx, b, { roles: c, lin, rad }) || artFile(ctx, b);
    if (own) return own;
    const R = ctx.layout.composition === 'grid-of-n' ? b : region(ctx, b);
    const id = `${ctx.P}a${n}`;
    const dir = b.x + b.w / 2 >= ctx.W * 0.45 ? 1 : -1;
    const want = ctx.piece.art && ctx.piece.art.motif;
    const order = ['clock', 'tunnel', 'flock', 'liner'].filter((k) => k !== 'clock' || timeOf(ctx));
    const pick = order.includes(want) ? want : order[(ctx.index + n) % order.length];
    const svg = pick === 'clock' ? clockTower(ctx, b, R, c, id, dir)
      : pick === 'tunnel' ? tunnel(ctx, b, R, c, id)
      : pick === 'flock' ? flock(ctx, b, R, c, id, dir)
      : liner(ctx, b, R, c, id);
    return `<clipPath id="${id}clip"><rect x="${r1(R.x)}" y="${r1(R.y)}" width="${r1(R.w)}" height="${r1(R.h)}"/></clipPath><g clip-path="url(#${id}clip)">${svg}</g>`;
  },

  defs(ctx) {
    if (!ctx.media) return '';
    const c = roles(ctx);
    const { band } = info(ctx);
    const v = band && (band.side === 'left' || band.side === 'right');
    const toBand = band && (band.side === 'bottom' || band.side === 'right');
    return toneFilter(ctx, `${ctx.P}tone`, c) +
      `<linearGradient id="${ctx.P}fade" x1="0" y1="0" x2="${v ? 1 : 0}" y2="${v ? 0 : 1}"><stop offset="0" stop-color="${c.band}" stop-opacity="${toBand ? 0 : 1}"/><stop offset="1" stop-color="${c.band}" stop-opacity="${toBand ? 1 : 0}"/></linearGradient>`;
  },

  // Matter-style montage: the photo toned in the combination, fading into the solid lettering band.
  media(ctx) {
    const { W, H, media, dataUri } = ctx;
    const c = roles(ctx);
    const { band } = info(ctx);
    let s = `<image href="${dataUri(media)}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" filter="url(#${ctx.P}tone)"/>`;
    if (band) {
      const f = Math.min(W, H) * 0.22;
      const fade = band.side === 'bottom' ? { x: 0, y: band.y - f, w: W, h: f } : band.side === 'top' ? { x: 0, y: band.h, w: W, h: f } : band.side === 'left' ? { x: band.w, y: 0, w: f, h: H } : { x: band.x - f, y: 0, w: f, h: H };
      s += `<rect x="${r1(fade.x)}" y="${r1(fade.y)}" width="${r1(fade.w)}" height="${r1(fade.h)}" fill="url(#${ctx.P}fade)"/>` +
        `<rect x="${r1(band.x)}" y="${r1(band.y)}" width="${r1(band.w)}" height="${r1(band.h)}" fill="${c.band}"/>`;
    }
    return s;
  },

  textOn(ctx, slot) {
    const c = roles(ctx);
    if (inBand(ctx, slot)) return c.bandText;
    return ctx.media ? c.paper : ctx.pal.onGround;
  },

  // A short accent rule over the slogan, in the band (art.json → line.thinRules).
  decorate(ctx, slot, blk) {
    if (slot.role !== 'headline') return '';
    const c = roles(ctx);
    const others = ctx.layout.slots.filter((s) => s !== slot).map((s) => ctx.px(s.box));
    const b = blk.box;
    const above = others.filter((o) => o.y + o.h <= b.y + 1 && o.x < b.x + b.w && o.x + o.w > b.x).reduce((m, o) => Math.max(m, o.y + o.h), info(ctx).band && inBand(ctx, slot) ? info(ctx).band.y : 0);
    const h = Math.max(2, Math.min(ctx.W, ctx.H) * 0.005);
    const gap = blk.size * 0.4;
    if (b.y - above < gap + h * 2) return '';
    const fill = inBand(ctx, slot) || ctx.contrast(c.accent, ctx.pal.ground) >= 1.6 ? c.accent : blk.fill;
    return `<rect x="${r1(b.x)}" y="${r1(b.y - gap)}" width="${r1(Math.min(b.w * 0.25, blk.size * 1.6))}" height="${r1(h)}" fill="${fill}"/>`;
  },

  // Streamline pill (art.json → corners: streamline or none): light on the band, deep on light ground.
  cta(ctx, b, label, f, slot) {
    const { esc, fit, contrast, pal } = ctx;
    const c = roles(ctx);
    const shown = String(label).toUpperCase();
    const ft = fit(shown, b.w * 0.78, b.h * 0.42, f, { max: Math.min(ctx.W, ctx.H) * 0.03, min: 11, maxLines: 1 });
    const onBand = inBand(ctx, slot) || ctx.media;
    const fill = onBand ? c.bandText : (contrast(c.deep, pal.ground) >= 4.5 ? c.deep : pal.onGround);
    const tc = [c.band, pal.white, pal.black, c.deep].find((x) => contrast(x, fill) >= 4.5) || pal.black;
    const bw = Math.min(b.w, ft.width + ft.size * 2.6), bh = ft.size * 2.4;
    const y = b.y + (b.h - bh) / 2;
    return `<rect x="${r1(b.x)}" y="${r1(y)}" width="${r1(bw)}" height="${r1(bh)}" rx="${r1(bh / 2)}" fill="${fill}"/>` +
      `<text x="${r1(b.x + bw / 2)}" y="${r1(y + bh / 2 + ft.size * 0.36)}" text-anchor="middle" font-family="'${esc(f.family)}', sans-serif" font-weight="${f.weight}" font-size="${r1(ft.size)}" letter-spacing="${r1(f.tracking * ft.size)}" fill="${tc}">${esc(shown)}</text>`;
  },

  // Carousel: three speed lines run edge to edge at the same height on every slide (the band's top edge
  // when there is one), so the slides join into one streak; the accent dash marks the step.
  series(ctx, s) {
    const c = roles(ctx);
    const { band } = info(ctx);
    const m = Math.min(ctx.W, ctx.H);
    // along the band's top edge, or along the foot of the slide
    const inB = band && band.side === 'bottom';
    const w = m * 0.0045;
    const y = inB ? band.y + m * 0.008 : ctx.H * 0.955;
    const col = inB ? c.bandText : ctx.pal.onGround;
    let out = '';
    for (let i = 0; i < 3; i++) out += `<rect x="0" y="${r1(y + i * w * 2.4)}" width="${ctx.W}" height="${r1(w * (1 - i * 0.25))}" fill="${col}"/>`;
    const seg = ctx.W / s.of;
    out += `<rect x="${r1(seg * (s.index - 1))}" y="${r1(y - w)}" width="${r1(seg)}" height="${r1(w * 3)}" fill="${c.accent}"/>`;
    return out;
  },
};
