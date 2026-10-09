// Rad Dog / Neon Surf skin for the design engine (tools/design/engine.mjs).
// One rad hero, a fat black outline, hot colour on a tilt (README: NS1-NS8; art.json).
// - ground: the hot Wada ground, a few Memphis confetti pieces in empty corners (never near text),
//   and the brand sticker plate (NS6) under the brand slot.
// - art: a round badge (art.json placements: badge + burst) with a striped sunset sun, spray stipple,
//   a curling wave with scalloped foam and one outlined hero breaking out of the badge (a dog in
//   shades on a board, a sun in shades, or a surfboard on the curl), on a checkerboard ribbon at
//   the band angle; wide boxes add the checker band across the box. One outline weight per piece.
// - media: the photo as a die-cut sticker (fat white border, ink outline, hard block shadow) on the
//   bright ground, outside the text zone (media.json: neon surf = sticker, no filters over faces).
// - type: chunky display, sentence case, the headline as sticker lettering: paper fill, ink outline,
//   hard ink block shadow, tilted -5 degrees. The subhead rides an ink ribbon in paper.
// - cta: a pill sticker with ink outline and block shadow, slightly rotated.
// - series: a checkerboard strip along the foot that continues from slide to slide, plus a count sticker.
// Colours: ground, the coolest combination colour as the sea, the accent and the next hot colour,
// Wada Black outlines, Wada White paper. No fluorescent inks (needsApproval) and no glows.

import { productMotif, artFile } from '../../tools/design/skins/base.mjs';
import { inks, textZoneBand, freeRect } from './skin-helpers.mjs';

const r1 = (n) => Math.round(n * 10) / 10;
const HEAD_ANGLE = -5;   // art.json diagonals.headline [-8, -4]
const BAND_ANGLE = -10;  // art.json diagonals.patternBands [-15, -10]

function hsl(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}
const cool = (hex) => { const { h, s } = hsl(hex); return s > 0.15 && h > 140 && h < 290; };

/** Colour roles from the piece's combination: ground, sea (coolest), hot (accent), hot2, ink, paper. */
export function roles(ctx) {
  const { pal } = ctx;
  const ink = pal.black, paper = pal.white;
  const colours = [...new Set([...inks(ctx), pal.accent, ...pal.support])].filter((h) => h && h !== pal.ground && h !== ink && h !== paper);
  const sea = colours.find(cool) || colours.find((h) => h !== pal.accent) || pal.accent;
  const hots = colours.filter((h) => h !== sea);
  const hot = hots.includes(pal.accent) ? pal.accent : hots[0] || (sea === pal.accent ? paper : pal.accent);
  const hot2 = hots.find((h) => h !== hot) || hot;
  return { ground: pal.ground, sea, hot, hot2, ink, paper };
}

const lineW = (ctx) => Math.max(2.5, Math.min(ctx.W, ctx.H) * 0.012); // fat outline, fixed per artboard

// ------------------------------------------------------------------ drawing kit (400-unit artboard)
function blob(pts) {
  const n = pts.length; let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d + 'Z';
}
function splat(rand, cx, cy, size, color) {
  const pts = [];
  for (let i = 0; i < 11; i++) { const a = (i / 11) * Math.PI * 2, k = size * (i % 2 ? 0.55 + rand() * 0.25 : 0.9 + rand() * 0.5); pts.push([cx + Math.cos(a) * k, cy + Math.sin(a) * k]); }
  let s = `<path d="${blob(pts)}" fill="${color}"/>`;
  for (let i = 0; i < 8; i++) { const a = rand() * Math.PI * 2, d = size * (1.5 + rand() * 1.3); s += `<circle cx="${r1(cx + Math.cos(a) * d)}" cy="${r1(cy + Math.sin(a) * d)}" r="${r1(size * (0.08 + rand() * 0.18))}" fill="${color}"/>`; }
  for (let i = 0; i < 2; i++) { const x = cx + (rand() - 0.5) * size; s += `<path d="M${r1(x)} ${r1(cy)}V${r1(cy + size * (1 + rand() * 1.1))}" stroke="${color}" stroke-width="${r1(size * 0.22)}" stroke-linecap="round"/>`; }
  return s;
}
function confettiPiece(kind, x, y, s, c, sw) {
  if (kind === 0) return `<path d="M${r1(x - s)} ${r1(y + s * 0.3)} l${r1(s / 2)} ${r1(-s * 0.6)} l${r1(s / 2)} ${r1(s * 0.6)} l${r1(s / 2)} ${r1(-s * 0.6)} l${r1(s / 2)} ${r1(s * 0.6)}" stroke="${c.ink}" stroke-width="${r1(sw)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (kind === 1) return `<path d="M${r1(x)} ${r1(y - s * 0.6)} l${r1(s * 0.6)} ${r1(s)} h${r1(-s * 1.2)}z" fill="${c.hot}" stroke="${c.ink}" stroke-width="${r1(sw)}" stroke-linejoin="round"/>`;
  if (kind === 2) return `<path d="M${r1(x - s)} ${r1(y)} c${r1(s / 3)} ${r1(-s / 2)}, ${r1(s * 0.66)} ${r1(s / 2)}, ${r1(s)} 0 s${r1(s * 0.66)} ${r1(s / 2)}, ${r1(s)} 0" stroke="${c.ink}" stroke-width="${r1(sw)}" fill="none" stroke-linecap="round"/>`;
  if (kind === 3) return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(s * 0.32)}" fill="${c.ink}"/>`;
  return `<path d="M${r1(x - s * 0.6)} ${r1(y)} a${r1(s * 0.6)} ${r1(s * 0.6)} 0 0 1 ${r1(s * 1.2)} 0z" fill="${c.sea}" stroke="${c.ink}" stroke-width="${r1(sw)}" stroke-linejoin="round"/>`;
}
function checker(x, y, w, rows, cell, c, sw, phase = 0) {
  let s = `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(rows * cell)}" fill="${c.paper}"/>`;
  const i0 = Math.floor(phase / cell);
  for (let i = 0; i * cell < w + cell; i++) for (let j = 0; j < rows; j++) {
    if ((i + i0 + j) % 2) continue;
    const cx = x + i * cell - (phase % cell);
    const x0 = Math.max(x, cx), x1 = Math.min(x + w, cx + cell);
    if (x1 > x0) s += `<rect x="${r1(x0)}" y="${r1(y + j * cell)}" width="${r1(x1 - x0)}" height="${r1(cell)}" fill="${c.ink}"/>`;
  }
  return s + `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(rows * cell)}" fill="none" stroke="${c.ink}" stroke-width="${r1(sw)}"/>`;
}

// Heroes, drawn round their own origin in units (L = outline width in units).
const HEROES = {
  dog(c, L) {
    const g = (fill, s) => `<g fill="${fill}"><ellipse cx="-12" cy="2" rx="${34 + s}" ry="${22 + s}"/><ellipse cx="-34" cy="24" rx="${12 + s}" ry="${8 + s}"/><ellipse cx="14" cy="24" rx="${12 + s}" ry="${8 + s}"/><circle cx="20" cy="-36" r="${28 + s}"/><ellipse cx="46" cy="-28" rx="${20 + s}" ry="${14 + s}"/></g>`;
    return `<ellipse cx="0" cy="34" rx="80" ry="14" fill="${c.hot}" stroke="${c.ink}" stroke-width="${L}"/>` +
      `<path d="M-68 34 H68" stroke="${c.paper}" stroke-width="${L * 0.6}" stroke-linecap="round"/>` +
      `<path d="M-40 6 C -62 0, -72 -14, -64 -26" stroke="${c.ink}" stroke-width="${L}" fill="none" stroke-linecap="round"/>` +
      g(c.ink, L / 2) + g(c.paper, 0) +
      `<circle cx="-22" cy="-6" r="9" fill="${c.hot2}"/>` +
      `<path d="M2 -60 C -26 -66, -40 -44, -30 -22 C -22 -34, -12 -44, 6 -46Z" fill="${c.ink}"/>` +
      `<circle cx="64" cy="-34" r="7" fill="${c.ink}"/>` +
      `<path d="M40 -18 C 48 -12, 58 -14, 62 -20" stroke="${c.ink}" stroke-width="${L * 0.6}" fill="none" stroke-linecap="round"/>` +
      `<path d="M50 -16 C 50 -4, 60 -4, 59 -17Z" fill="${c.hot}" stroke="${c.ink}" stroke-width="${L * 0.5}" stroke-linejoin="round"/>` +
      `<path d="M6 -44 H52" stroke="${c.ink}" stroke-width="${L * 0.8}" stroke-linecap="round"/>` +
      `<rect x="6" y="-47" width="22" height="16" rx="6" fill="${c.ink}"/><rect x="32" y="-47" width="22" height="16" rx="6" fill="${c.ink}"/>` +
      `<path d="M11 -42 L17 -42 M37 -42 L43 -42" stroke="${c.paper}" stroke-width="${L * 0.5}" stroke-linecap="round"/>`;
  },
  sun(c, L) {
    let rays = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.13;
      const p = (r, da) => `${r1(Math.cos(a + da) * r)} ${r1(Math.sin(a + da) * r)}`;
      rays += `<path d="M${p(66, -0.13)} L${p(98, 0)} L${p(66, 0.13)}Z" fill="${c.hot2}" stroke="${c.ink}" stroke-width="${L * 0.8}" stroke-linejoin="round"/>`;
    }
    return rays + `<circle r="66" fill="${c.hot}" stroke="${c.ink}" stroke-width="${L}"/>` +
      `<path d="M-48 -14 H48" stroke="${c.ink}" stroke-width="${L * 0.8}" stroke-linecap="round"/>` +
      `<rect x="-46" y="-20" width="40" height="26" rx="10" fill="${c.ink}"/><rect x="6" y="-20" width="40" height="26" rx="10" fill="${c.ink}"/>` +
      `<path d="M-38 -12 L-28 -12 M14 -12 L24 -12" stroke="${c.paper}" stroke-width="${L * 0.55}" stroke-linecap="round"/>` +
      `<path d="M-26 22 C -12 40, 14 40, 28 22 Z" fill="${c.paper}" stroke="${c.ink}" stroke-width="${L * 0.8}" stroke-linejoin="round"/>` +
      `<path d="M8 34 C 10 52, 26 50, 22 30 Z" fill="${c.hot2 === c.hot ? c.paper : c.hot2}" stroke="${c.ink}" stroke-width="${L * 0.55}" stroke-linejoin="round"/>`;
  },
  board(c, L) {
    return `<g transform="rotate(-62)"><path d="M0 -110 C 34 -70, 34 70, 0 110 C -34 70, -34 -70, 0 -110 Z" fill="${c.hot}" stroke="${c.ink}" stroke-width="${L}"/>` +
      `<path d="M0 -96 V 96" stroke="${c.paper}" stroke-width="${L * 0.7}" stroke-linecap="round"/>` +
      `<path d="M-14 -20 H14 M-16 10 H16" stroke="${c.ink}" stroke-width="${L * 0.6}" stroke-linecap="round"/>` +
      `<path d="M0 98 l10 24 h-20 z" fill="${c.ink}"/></g>` +
      `<path d="M-120 60 C -96 40, -70 36, -50 40 M-110 84 C -84 66, -58 60, -36 62" stroke="${c.paper}" stroke-width="${L * 0.9}" fill="none" stroke-linecap="round"/>`;
  },
};
const HERO_IDS = Object.keys(HEROES);

/** The badge scene in a 400 square at (x, y) side s. */
function badge(ctx, x, y, s, hero, n, ribbon = true) {
  const c = roles(ctx);
  const u = s / 400;
  const L = lineW(ctx) / u;
  const rand = ctx.rand;
  const id = `${ctx.P}b${n}`;
  const CX = 200, CY = 214, R = 158;
  const sunX = hero === 'sun' ? 200 : 262, sunY = hero === 'sun' ? 170 : 168, sunR = hero === 'sun' ? 0 : 84;
  let inner = '';
  // Sunset sun with stripes cut in the ground colour (pattern 1).
  if (sunR) {
    inner += `<circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="${c.hot}" stroke="${c.ink}" stroke-width="${L}"/>`;
    let st = '';
    for (let i = 0, yy = sunY + 8; i < 5; i++) { const h = 4 + i * 2.6; st += `<rect x="${sunX - sunR - 4}" y="${r1(yy)}" width="${sunR * 2 + 8}" height="${r1(h)}" fill="${c.ground}"/>`; yy += h + 10 - i; }
    inner += `<clipPath id="${id}s"><circle cx="${sunX}" cy="${sunY}" r="${sunR - L / 2}"/></clipPath><g clip-path="url(#${id}s)">${st}</g>`;
    // Spray stipple: airbrush done with dots in one ink.
    for (let i = 0; i < 90; i++) { const a = rand() * Math.PI * 2, d = sunR + L + Math.pow(rand(), 1.8) * 34; inner += `<circle cx="${r1(sunX + Math.cos(a) * d)}" cy="${r1(sunY + Math.sin(a) * d)}" r="${r1(0.9 + rand() * 1.5)}" fill="${c.hot}"/>`; }
  }
  // The wave: sea body with a curl on the left and scalloped paper foam.
  const wave = 'M20 420 L20 280 C 40 236, 96 214, 140 228 C 176 240, 186 270, 166 284 C 150 296, 128 286, 134 268 C 156 300, 196 320, 252 324 C 316 330, 364 320, 420 312 L420 420Z';
  inner += `<path d="${wave}" fill="${c.sea}" stroke="${c.ink}" stroke-width="${L}" stroke-linejoin="round"/>`;
  inner += `<path d="M54 330 C 90 318, 120 334, 148 360 M84 366 C 120 352, 150 366, 176 388" stroke="${c.ink}" stroke-width="${L * 0.6}" fill="none" stroke-linecap="round"/>`;
  const foam = [];
  for (let i = 0; i <= 8; i++) { const t = i / 8; foam.push([24 + t * 128, 278 - Math.sin(t * Math.PI * 0.85) * 44 + t * 4, 8 + rand() * 5]); }
  inner += foam.map(([fx, fy, rr]) => `<circle cx="${r1(fx)}" cy="${r1(fy)}" r="${r1(rr + L / 2)}" fill="${c.ink}"/>`).join('');
  inner += foam.map(([fx, fy, rr]) => `<circle cx="${r1(fx)}" cy="${r1(fy)}" r="${r1(rr)}" fill="${c.paper}"/>`).join('');

  const heroAt = hero === 'dog' ? `translate(214 236) rotate(-12) scale(1.05)` : hero === 'sun' ? `translate(${sunX} ${sunY - 14}) scale(1.08)` : `translate(250 226) scale(0.95)`;
  const heroSvg = `<g transform="${heroAt}">${HEROES[hero](c, L / (hero === 'board' ? 0.95 : 1.05))}</g>`;
  // Badge: block shadow, ground disc, clipped scene, fat outline; hero breaks out of the top (burst).
  const sh = L * 1.6;
  const ribbonY = 352;
  const out =
    `<circle cx="${CX + sh}" cy="${CY + sh}" r="${R}" fill="${c.ink}"/>` +
    `<circle cx="${CX}" cy="${CY}" r="${R}" fill="${c.ground}"/>` +
    `<clipPath id="${id}c"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath><g clip-path="url(#${id}c)">${inner}</g>` +
    `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${c.ink}" stroke-width="${L * 1.2}"/>` +
    // Checkerboard ribbon on the band angle across the badge foot (pattern 2).
    (ribbon ? `<g transform="rotate(${BAND_ANGLE} 200 ${ribbonY})"><rect x="${36 + sh}" y="${ribbonY + sh - 14}" width="328" height="30" fill="${c.ink}"/>${checker(36, ribbonY - 14, 328, 2, 15, c, L * 0.9)}</g>` : '') +
    heroSvg;
  return `<g transform="translate(${r1(x)} ${r1(y)}) scale(${u.toFixed(4)})">${out}</g>`;
}

export function heroInBox(ctx, b, n = 0, want = null) {
  const hero = HEROES[want] ? want : HERO_IDS[(ctx.index + n) % HERO_IDS.length];
  const c = roles(ctx);
  const s = Math.min(b.w, b.h);
  const asp = b.w / b.h;
  let extra = '';
  if (asp > 1.6) {
    // Wide box: the checker band runs across it behind the badge, on the band angle.
    const sw = lineW(ctx), cell = Math.max(8, s * 0.07);
    const cy = b.y + b.h * 0.62;
    extra = `<g transform="rotate(${BAND_ANGLE / 2} ${r1(b.x + b.w / 2)} ${r1(cy)})"><rect x="${r1(b.x + sw)}" y="${r1(cy - cell + sw * 1.4)}" width="${r1(b.w)}" height="${r1(cell * 2)}" fill="${c.ink}"/>${checker(b.x, cy - cell, b.w, 2, cell, c, sw)}</g>`;
  }
  const x = asp > 1.6 ? b.x + b.w * (((ctx.seed + n) % 2) ? 0.62 : 0.38) - s / 2 : b.x + (b.w - s) / 2;
  return extra + badge(ctx, x, b.y + (b.h - s) / 2, s, hero, n, !extra);
}

/** Hard-shadowed sticker shape (pill or rounded rect), optionally rotated about its centre. */
function sticker(ctx, x, y, w, h, { rx, fill, rot = 0, shadow = true }) {
  const c = roles(ctx), L = lineW(ctx) * 0.8, sh = Math.min(ctx.W, ctx.H) * 0.011;
  const t = rot ? ` transform="rotate(${rot} ${r1(x + w / 2)} ${r1(y + h / 2)})"` : '';
  return `<g${t}>` + (shadow ? `<rect x="${r1(x + sh)}" y="${r1(y + sh)}" width="${r1(w)}" height="${r1(h)}" rx="${r1(rx)}" fill="${c.ink}"/>` : '') +
    `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${r1(rx)}" fill="${fill}" stroke="${c.ink}" stroke-width="${r1(L)}"/></g>`;
}

/** The brand sticker: a paper pill under the engine's brand slot (measured as the engine sets it). */
function brandPlate(ctx) {
  const slot = (ctx.layout.slots || []).find((s) => s.role === 'brand');
  if (!slot) return '';
  const b = ctx.px(slot.box);
  const f = ctx.face('brand');
  // Mirrors the engine's drawBrand sizing (tools/design/engine.mjs); see the report's engine notes.
  const S = Math.min(ctx.W, ctx.H);
  const h = ctx.W / ctx.H > 2.5 ? Math.max(24, Math.min(b.h * 0.8, ctx.H * 0.16)) : Math.max(Math.min(b.h, S * 0.07), S * 0.045, 24);
  const ft = ctx.fit(ctx.brand.config.name, b.w, h, { ...f, tracking: 0 }, { max: h, min: 12, maxLines: 1 });
  const padX = ft.size * 0.6, padY = ft.size * 0.3;
  return sticker(ctx, b.x - padX, b.y + ft.size * 0.9 - ft.size * 0.78 - padY, ft.width + padX * 2, ft.size * 1.0 + padY * 2, { rx: (ft.size + padY * 2) / 2, fill: ctx.pal.white, rot: -3 });
}

/** Memphis confetti in empty corners: never inside or near a slot (art.json pattern.memphisConfetti). */
function confetti(ctx, avoidExtra = []) {
  const { W, H, px } = ctx;
  const S = Math.min(W, H);
  const c = roles(ctx);
  const rand = ctx.rand;
  const pad = S * 0.05;
  const boxes = (ctx.layout.slots || []).map((s) => px(s.box)).concat(avoidExtra);
  let out = '', placed = 0;
  const pts = [];
  for (let tries = 0; tries < 160 && placed < 5; tries++) {
    const x = S * 0.05 + rand() * (W - S * 0.1), y = S * 0.05 + rand() * (H - S * 0.1);
    if (boxes.some((b) => x > b.x - pad && x < b.x + b.w + pad && y > b.y - pad && y < b.y + b.h + pad)) continue;
    if (pts.some(([a, bb]) => Math.hypot(a - x, bb - y) < S * 0.16)) continue;
    pts.push([x, y]);
    out += confettiPiece(placed % 5, x, y, S * (0.025 + rand() * 0.015), c, lineW(ctx) * 0.7);
    placed++;
  }
  return out;
}

/** Where an empty foot starts: when no slot reaches into the bottom quarter, the wave takes it. */
function floorTop(ctx) {
  const { H, W } = ctx;
  if (W / H > 1.2) return null;
  const bottom = Math.max(...(ctx.layout.slots || []).map((s) => ctx.px(s.box)).map((b) => b.y + b.h));
  return bottom < H * 0.75 ? bottom + Math.min(W, H) * 0.12 : null;
}

/** A curling wave along the foot of the canvas, anchored to the bottom edge (composition: ride). */
function waveFloor(ctx, top) {
  const { W, H } = ctx;
  const c = roles(ctx), L = lineW(ctx), S = Math.min(W, H);
  const h = H - top, crest = top + h * 0.12;
  const d = `M${-L} ${H + L} V${r1(top + h * 0.35)} C ${r1(W * 0.12)} ${r1(crest)}, ${r1(W * 0.32)} ${r1(top - h * 0.02)}, ${r1(W * 0.42)} ${r1(top + h * 0.12)} C ${r1(W * 0.5)} ${r1(top + h * 0.24)}, ${r1(W * 0.44)} ${r1(top + h * 0.36)}, ${r1(W * 0.38)} ${r1(top + h * 0.3)} C ${r1(W * 0.5)} ${r1(top + h * 0.5)}, ${r1(W * 0.72)} ${r1(top + h * 0.42)}, ${r1(W + L)} ${r1(top + h * 0.3)} V${H + L} Z`;
  let foam = '';
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = W * (0.02 + t * 0.4), y = top + h * (0.33 - Math.sin(t * Math.PI * 0.9) * 0.3);
    foam += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(S * 0.022 + L / 2)}" fill="${c.ink}"/>`;
  }
  let foamP = '';
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = W * (0.02 + t * 0.4), y = top + h * (0.33 - Math.sin(t * Math.PI * 0.9) * 0.3);
    foamP += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(S * 0.022)}" fill="${c.paper}"/>`;
  }
  const lines = [0.6, 0.78].map((k, i) => `<path d="M${r1(W * (0.1 + i * 0.08))} ${r1(top + h * k)} C ${r1(W * 0.3)} ${r1(top + h * (k - 0.08))}, ${r1(W * 0.5)} ${r1(top + h * (k + 0.02))}, ${r1(W * (0.66 + i * 0.1))} ${r1(top + h * (k - 0.04))}" stroke="${c.ink}" stroke-width="${r1(L * 0.6)}" fill="none" stroke-linecap="round"/>`).join('');
  return `<path d="${d}" fill="${c.sea}" stroke="${c.ink}" stroke-width="${r1(L)}" stroke-linejoin="round"/>` + lines + foam + foamP;
}

export default {
  compositions: ['single-focal', 'type-led', 'split', 'stacked', 'full-bleed-band', 'grid-of-n'],
  type: {
    headline: { family: 'display', weight: 900, tracking: 0.01 },
    subhead: { family: 'body', weight: 700 },
    body: { family: 'body', weight: 400 },
    note: { family: 'body', weight: 700 },
    cta: { family: 'display', weight: 900, tracking: 0.02 },
    brand: { family: 'body', weight: 700, tracking: 0 },
  },
  headlineMax: 0.105,

  ground(ctx) {
    const { W, H, pal } = ctx;
    const floor = ctx.media ? null : floorTop(ctx);
    return `<rect width="${W}" height="${H}" fill="${pal.ground}"/>` + (floor ? waveFloor(ctx, floor) : '') + (ctx.media ? '' : confetti(ctx, floor ? [{ x: 0, y: floor - Math.min(W, H) * 0.08, w: W, h: H }] : []) + brandPlate(ctx));
  },

  art(ctx, b, { n }) {
    const own = productMotif(ctx, b, { heroInBox: (box, id) => heroInBox(ctx, box, n, id), roles: roles(ctx), lineWidth: lineW(ctx) }) || artFile(ctx, b);
    if (own) return own;
    return heroInBox(ctx, b, n, ctx.piece.art && ctx.piece.art.motif);
  },

  // The photo as a die-cut sticker: fat white border, ink outline, hard ink block shadow, a few
  // degrees off square, in the part of the canvas the text does not use.
  media(ctx, layout) {
    const { W, H, P, dataUri, media } = ctx;
    const S = Math.min(W, H);
    const band = textZoneBand(ctx, layout, { padPct: 1 });
    const f = freeRect(ctx, band);
    const m = S * 0.07;
    const x = f.x + m, y = f.y + m, w = Math.max(10, f.w - m * 2), h = Math.max(10, f.h - m * 2);
    const rx = Math.min(w, h) * 0.08, border = S * 0.02, L = lineW(ctx), sh = S * 0.014;
    const rot = (ctx.seed % 2 ? -1 : 1) * 3;
    const c = roles(ctx);
    const t = `rotate(${rot} ${r1(x + w / 2)} ${r1(y + h / 2)})`;
    const sticker = `<g transform="${t}">` +
      `<rect x="${r1(x - border + sh)}" y="${r1(y - border + sh)}" width="${r1(w + border * 2)}" height="${r1(h + border * 2)}" rx="${r1(rx + border)}" fill="${c.ink}"/>` +
      `<rect x="${r1(x - border)}" y="${r1(y - border)}" width="${r1(w + border * 2)}" height="${r1(h + border * 2)}" rx="${r1(rx + border)}" fill="${c.paper}" stroke="${c.ink}" stroke-width="${r1(L)}"/>` +
      `<clipPath id="${P}ph"><rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${r1(rx)}"/></clipPath>` +
      `<image href="${dataUri(media)}" x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${P}ph)"/>` +
      `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${r1(rx)}" fill="none" stroke="${c.ink}" stroke-width="${r1(L * 0.5)}"/></g>`;
    // One paint splat tucked behind a corner of the sticker, opposite the text.
    const sp = splat(ctx.rand, x + w + border * 0.2, y + h - border, S * 0.035, c.hot);
    const ft = floorTop(ctx);
    const floor = ft && f.y + f.h <= ft ? waveFloor(ctx, Math.max(ft, band ? band.y + band.h + S * 0.06 : ft)) : '';
    return `<rect width="${W}" height="${H}" fill="${ctx.pal.ground}"/>` + floor + sp + sticker + confetti(ctx, [{ x: x - border * 2, y: y - border * 2, w: w + border * 4, h: h + border * 4 }].concat(floor ? [{ x: 0, y: ft - S * 0.08, w: W, h: H }] : [])) + brandPlate(ctx);
  },

  textOn(ctx, slot) {
    if (slot.role === 'brand') return ctx.pal.black;
    if (slot.role === 'subhead') return ctx.pal.white;
    return ctx.pal.onGround;
  },

  // Sticker lettering for the headline: paper fill, fused ink outline, hard ink block shadow, tilted.
  text(ctx, slot, blk) {
    if (slot.role !== 'headline') return blk.svg;
    const { esc } = ctx;
    const S = Math.min(ctx.W, ctx.H);
    const f = blk.face;
    const strip = ctx.W / ctx.H > 2.5;
    // Re-fit a little smaller: the outline and the tilt need room inside the slot.
    const sw0 = Math.min(S * 0.022, blk.size * 0.16);
    const ft = ctx.fit(blk.lines.join(' '), blk.box.w * 0.9 - sw0, blk.box.h - sw0 * 2.5, f, { max: blk.size, min: 16, lead: blk.lead, maxLines: 5 });
    const sw = Math.min(S * 0.022, ft.size * 0.16);
    const sh = Math.max(2, ft.size * 0.07);
    const x = slot.align === 'center' ? blk.box.x + blk.box.w / 2 : slot.align === 'right' ? blk.box.x + blk.box.w : blk.box.x + sw / 2;
    const y0 = blk.box.y + ft.size * 0.86 + sw / 2;
    const rot = strip ? HEAD_ANGLE * 0.5 : HEAD_ANGLE;
    const line = (dx, dy, fill) => `<text font-family="'${esc(f.family)}', sans-serif" font-weight="${f.weight}" font-size="${r1(ft.size)}" letter-spacing="${r1(f.tracking * ft.size)}" text-anchor="${blk.anchor}" fill="${fill}" stroke="${ctx.pal.black}" stroke-width="${r1(sw)}" stroke-linejoin="round" paint-order="stroke">` +
      ft.lines.map((l, k) => `<tspan x="${r1(x + dx)}" y="${r1(y0 + dy + k * ft.size * ft.lead)}">${esc(l)}</tspan>`).join('') + '</text>';
    return `<g transform="rotate(${rot} ${r1(blk.box.x)} ${r1(blk.box.y + blk.box.h / 2)})">${line(sh, sh, ctx.pal.black)}${line(0, 0, ctx.pal.white)}</g>`;
  },

  // The subhead rides a notched ink ribbon; paper text on ink (21:1).
  decorate(ctx, slot, blk) {
    if (slot.role !== 'subhead') return '';
    const padX = blk.size * 0.8, padY = blk.size * 0.45;
    const x = blk.box.x - padX * 0.6, y = blk.y - padY * 0.6;
    const w = blk.width + padX * 1.6, h = blk.size * (1 + (blk.lines.length - 1) * blk.lead) + padY * 1.6;
    const notch = Math.min(h * 0.3, blk.size * 0.6);
    return `<path d="M${r1(x)} ${r1(y)} H${r1(x + w + notch)} l${r1(-notch)} ${r1(h / 2)} l${r1(notch)} ${r1(h / 2)} H${r1(x)} Z" fill="${ctx.pal.black}"/>`;
  },

  // A pill sticker: hot fill, ink outline, hard ink block shadow, rotated a few degrees.
  cta(ctx, b, label, f) {
    const { esc, fit, contrast, pal } = ctx;
    const c = roles(ctx);
    const ft = fit(label, b.w * 0.76, b.h * 0.5, f, { max: Math.min(ctx.W, ctx.H) * 0.034, min: 12, maxLines: 1 });
    const bw = Math.min(b.w * 0.97, ft.width + ft.size * 2.2), bh = ft.size * 2.3;
    const x = b.x, y = b.y + (b.h - bh) / 2;
    // The fill: the first hot or sea colour that carries black or white text at 4.5:1.
    const fill = [c.hot, c.sea, c.hot2, pal.white].find((h) => h !== pal.ground && Math.max(contrast(h, pal.black), contrast(h, pal.white)) >= 4.5) || pal.white;
    const tc = ctx.readableOn(fill, [pal.black, pal.white]);
    const rot = -3;
    return sticker(ctx, x, y, bw, bh, { rx: bh / 2, fill, rot }) +
      `<text transform="rotate(${rot} ${r1(x + bw / 2)} ${r1(y + bh / 2)})" x="${r1(x + bw / 2)}" y="${r1(y + bh / 2 + ft.size * 0.36)}" text-anchor="middle" font-family="'${esc(f.family)}', sans-serif" font-weight="${f.weight}" font-size="${r1(ft.size)}" letter-spacing="${r1(f.tracking * ft.size)}" fill="${tc}">${esc(ft.lines.join(' '))}</text>`;
  },

  // Carousel: a checkerboard strip along the foot; its squares continue from one slide into the next
  // (the phase follows the slide index), entering and leaving at the same height. A count sticker.
  series(ctx, s) {
    const { W, H, pal, esc } = ctx;
    const S = Math.min(W, H);
    const c = roles(ctx);
    const cell = S * 0.032;
    const y = H - cell * 2 - S * 0.02;
    const L = lineW(ctx);
    const label = `${s.index}/${s.of}`;
    const fs = S * 0.034;
    const lw = ctx.textWidth(label, { family: ctx.fam.display, weight: ctx.face('cta').weight, size: fs }) + fs * 1.4;
    return `<rect x="-10" y="${r1(y + L)}" width="${W + 20}" height="${r1(cell * 2)}" fill="${c.ink}"/>` +
      checker(-L, y, W + L * 2, 2, cell, c, L * 0.8, (s.index - 1) * (W + 2 * L)) +
      sticker(ctx, W * 0.93 - lw, H * 0.035, lw, fs * 1.9, { rx: fs * 0.95, fill: c.paper, rot: 4 }) +
      `<text transform="rotate(4 ${r1(W * 0.93 - lw / 2)} ${r1(H * 0.035 + fs * 0.95)})" x="${r1(W * 0.93 - lw / 2)}" y="${r1(H * 0.035 + fs * 1.3)}" text-anchor="middle" font-family="'${esc(ctx.fam.display)}', sans-serif" font-weight="${ctx.face('cta').weight}" font-size="${r1(fs)}" fill="${pal.black}">${esc(label)}</text>`;
  },
};
