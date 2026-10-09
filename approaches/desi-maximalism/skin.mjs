// Desi Maximalism skin for the design engine (tools/design/engine.mjs).
// More is more, in order (README: DM1-DM8; art.json). Three zones: border, field, centre.
// - ground: flat Wada ground, a half-drop block-print field (buti) that stops short of every text
//   slot, the art and the frame (pattern never under text), and the brand plate under the brand slot.
// - art: a radial medallion framed by rings (rosette, lotus, paisley pair, marigold), alternating
//   colours, mirror discs; wide boxes add a mirrored paisley pair (bilateral symmetry).
// - media: the photo, unfiltered, inside a decorated panel (beaded band, keylines, round arch when tall).
// - type: painted-signboard headline in a framed, pattern-free paper cartouche with a centre crest
//   and a flat ink drop line; sentence case; subhead and body on clear ground.
// - cta: a pill inside a one-band frame. finish: the nested border (3-5 bands, corner rosettes).
// - series: a toran (garland) inside the top of the frame at the same height on every slide, and a
//   count plate at the foot.
// Colours: the base combination, the product's other palette as the bridge when it shares a colour,
// Wada Black ink and Wada White paper. Flat colour only; no gradients, glows or metallics.
// Ornament comes from the non-sacred vocabulary only (flowers, leaves, paisley, mirrors, garlands).

import { productMotif, artFile } from '../../tools/design/skins/base.mjs';
import { inks, textZoneBand, freeRect } from './skin-helpers.mjs';

const r1 = (n) => Math.round(n * 100) / 100;
const TAU = Math.PI * 2;

// ------------------------------------------------------------------ colour
export function colours(ctx) {
  const { pal, contrast } = ctx;
  const base = inks(ctx);
  // Bridge: the product's other palette, if it shares at least one colour with this combination.
  const t = ctx.tokens.colors;
  let bridge = [];
  for (const p of t.brand || []) {
    if (p.combination === pal.combination) continue;
    const combo = (t.combinations || []).find((c) => c.id === p.combination);
    const hexes = combo ? combo.colors.map((id) => ctx.tokens.colorsById[id]) : [];
    if (hexes.some((h) => base.includes(h))) { bridge = hexes.filter((h) => !base.includes(h)); break; }
  }
  const skip = [pal.ground, pal.accent, pal.black, pal.white];
  const pool = [...new Set([...pal.support, ...base, pal.ink, ...bridge])].filter((h) => h && !skip.includes(h));
  const support1 = pool[0] || pal.ink;
  const support2 = pool[1] || (pal.ink !== support1 ? pal.ink : pal.black);
  const dark = contrast(pal.ground, pal.black) < 5;
  const headFill = [pal.accent, support1, support2, pal.ink, pal.black].find((h) => h && contrast(h, pal.white) >= 4.5) || pal.black;
  return {
    ground: pal.ground, ink: pal.black, paper: pal.white, accent: pal.accent, support1, support2, headFill,
    // Lines that sit directly on a dark ground switch to paper (art.json line.rules).
    onGroundLine: dark ? pal.white : pal.black,
  };
}

// ------------------------------------------------------------------ geometry kit
const petal = (cx, cy, r0, r1_, w) => {
  const y0 = cy - r0, y1 = cy - r1_, ym = (y0 + y1) / 2;
  return `M${r1(cx)} ${r1(y0)} C${r1(cx + w)} ${r1(ym + (y0 - ym) * 0.4)} ${r1(cx + w * 0.7)} ${r1(y1 + (ym - y1) * 0.3)} ${r1(cx)} ${r1(y1)} C${r1(cx - w * 0.7)} ${r1(y1 + (ym - y1) * 0.3)} ${r1(cx - w)} ${r1(ym + (y0 - ym) * 0.4)} ${r1(cx)} ${r1(y0)}Z`;
};
const ring = (n, cx, cy, make, offset = 0) => {
  let out = '';
  for (let i = 0; i < n; i++) out += `<g transform="rotate(${r1(offset + (360 / n) * i)} ${r1(cx)} ${r1(cy)})">${make(i)}</g>`;
  return out;
};
function mirror(x, y, r, c, lw) {
  return ring(8, x, y, () => `<line x1="${r1(x)}" y1="${r1(y - r)}" x2="${r1(x)}" y2="${r1(y - r * 1.45)}" stroke="${c.ink}" stroke-width="${r1(r * 0.22)}" stroke-linecap="round"/>`) +
    `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${c.paper}" stroke="${c.ink}" stroke-width="${r1(lw ?? r * 0.28)}"/>` +
    `<path d="M${r1(x - r * 0.38)} ${r1(y - r * 0.02)} l${r1(r * 0.13)} ${r1(-r * 0.12)} l${r1(r * 0.12)} ${r1(r * 0.13)}" fill="none" stroke="${c.support2}" stroke-width="${r1(r * 0.2)}" stroke-linecap="round"/>`;
}
function rosette(x, y, r, c, lw, colA = c.accent, colB = c.support2) {
  return ring(8, x, y, () => `<path d="${petal(x, y, r * 0.2, r, r * 0.36)}" fill="${colB}" stroke="${c.ink}" stroke-width="${r1(lw)}"/>`, 22.5) +
    ring(8, x, y, () => `<path d="${petal(x, y, r * 0.15, r * 0.72, r * 0.27)}" fill="${colA}" stroke="${c.ink}" stroke-width="${r1(lw)}"/>`) +
    mirror(x, y, r * 0.28, c, lw);
}
/** Paisley (boteh): a teardrop whose tip curls over; dir = 1 faces right, -1 is its mirror. */
function paisley(x, y, s, dir, c, lw) {
  const P = (pts) => pts.map(([a, b]) => `${r1(x + dir * a * s)} ${r1(y + b * s)}`);
  const [p0, p1, p2, p3, p4, p5, p6, p7, p8] = P([[0, 13], [-12, 13], [-14, 0], [-8, -7], [-3, -12], [5, -14], [10, -20], [6, -12], [10, -4]]);
  const [q0, q1, q2, q3] = P([[10, 6], [8, 12], [4, 13], [0, 13]]);
  return `<path d="M${p0}C${p1} ${p2} ${p3}C${p4} ${p5} ${p6}C${p7} ${p8} ${q0}C${q1} ${q2} ${q3}Z" fill="${c.support1}" stroke="${c.ink}" stroke-width="${r1(lw)}" stroke-linejoin="round"/>` +
    `<circle cx="${r1(x - dir * 2 * s)}" cy="${r1(y + 3 * s)}" r="${r1(5 * s)}" fill="${c.paper}" stroke="${c.ink}" stroke-width="${r1(lw * 0.8)}"/><circle cx="${r1(x - dir * 2 * s)}" cy="${r1(y + 3 * s)}" r="${r1(2 * s)}" fill="${c.accent}"/>`;
}

// ------------------------------------------------------------------ medallions (400 artboard, centre 200 200)
const MEDALLIONS = {
  rosette(c, L) {
    const C = 200;
    let s = ring(32, C, C, (i) => `<path d="${petal(C, C, 150, 190, 13)}" fill="${i % 2 ? c.support2 : c.accent}" stroke="${c.ink}" stroke-width="${L}"/>`);
    s += ring(32, C, C, () => `<circle cx="${C}" cy="${C - 160}" r="14" fill="${c.paper}" stroke="${c.ink}" stroke-width="${L}"/>`, 5.625);
    s += `<circle cx="${C}" cy="${C}" r="150" fill="${c.support2}" stroke="${c.ink}" stroke-width="${L * 1.6}"/>`;
    s += ring(16, C, C, () => mirror(C, C - 127, 10, c, L));
    s += `<circle cx="${C}" cy="${C}" r="108" fill="${c.accent}" stroke="${c.ink}" stroke-width="${L * 1.6}"/>`;
    s += ring(12, C, C, () => `<path d="${petal(C, C, 22, 102, 24)}" fill="${c.support1}" stroke="${c.ink}" stroke-width="${L * 1.3}"/>`);
    s += ring(12, C, C, () => `<path d="${petal(C, C, 22, 72, 11)}" fill="${c.paper}" stroke="${c.ink}" stroke-width="${L}"/>`, 15);
    s += `<circle cx="${C}" cy="${C}" r="28" fill="${c.support2}" stroke="${c.ink}" stroke-width="${L * 1.6}"/>`;
    return s + mirror(C, C, 13, c, L);
  },
  lotus(c, L) {
    const C = 200;
    let s = `<circle cx="${C}" cy="${C}" r="188" fill="${c.accent}" stroke="${c.ink}" stroke-width="${L * 1.6}"/>`;
    s += ring(36, C, C, (i) => i % 2 ? `<circle cx="${C}" cy="${C - 172}" r="6" fill="${c.paper}"/>` : `<path d="M${C} ${C - 182} l7 10 l-7 10 l-7 -10z" fill="${c.support1}"/>`);
    s += `<circle cx="${C}" cy="${C}" r="156" fill="${c.ground}" stroke="${c.ink}" stroke-width="${L * 1.6}"/>`;
    s += ring(24, C, C, () => `<path d="M${C - 19} ${C - 156} A 19 19 0 0 0 ${C + 19} ${C - 156} Z" fill="${c.support1}" stroke="${c.ink}" stroke-width="${L}"/>`);
    s += `<circle cx="${C}" cy="${C}" r="118" fill="${c.support2}" stroke="${c.ink}" stroke-width="${L * 1.3}"/>`;
    // Lotus: a fan of petals mirrored about the vertical axis, botanical only.
    const base = [C, C + 62];
    const fan = [[-64, 92, c.accent], [-36, 104, c.support1], [0, 112, c.accent], [36, 104, c.support1], [64, 92, c.accent]];
    s += fan.map(([a, len, col]) => `<g transform="rotate(${a} ${base[0]} ${base[1]})"><path d="${petal(base[0], base[1], 0, len, len * 0.28)}" fill="${col}" stroke="${c.ink}" stroke-width="${L * 1.2}"/><path d="${petal(base[0], base[1], 14, len * 0.72, len * 0.11)}" fill="${c.paper}" stroke="${c.ink}" stroke-width="${L * 0.8}"/></g>`).join('');
    s += `<path d="M${C - 88} ${C + 70} C ${C - 50} ${C + 92}, ${C + 50} ${C + 92}, ${C + 88} ${C + 70} C ${C + 50} ${C + 104}, ${C - 50} ${C + 104}, ${C - 88} ${C + 70} Z" fill="${c.support1}" stroke="${c.ink}" stroke-width="${L * 1.2}"/>`;
    s += mirror(C, C + 62, 13, c, L);
    s += [-1, 1].map((d) => mirror(C + d * 86, C - 50, 9, c, L) + mirror(C + d * 58, C - 92, 7, c, L)).join('') + mirror(C, C - 104, 8, c, L);
    return s;
  },
  paisley(c, L) {
    const C = 200;
    let s = ring(16, C, C, (i) => `<path d="${petal(C, C, 140, 190, 30)}" fill="${i % 2 ? c.support1 : c.accent}" stroke="${c.ink}" stroke-width="${L * 1.2}"/>`);
    s += ring(16, C, C, () => mirror(C, C - 172, 7, c, L), 11.25);
    s += `<circle cx="${C}" cy="${C}" r="142" fill="${c.paper}" stroke="${c.ink}" stroke-width="${L * 1.6}"/>`;
    s += `<circle cx="${C}" cy="${C}" r="130" fill="${c.accent}" stroke="${c.ink}" stroke-width="${L}"/>`;
    s += ring(48, C, C, () => `<circle cx="${C}" cy="${C - 120}" r="3.4" fill="${c.paper}"/>`);
    // Four paisleys turning round the centre (radial, 4-fold), tips chasing each other.
    s += ring(4, C, C, () => `<g transform="translate(${C + 6} ${C - 66}) rotate(-90)">${paisley(0, 0, 3.4, 1, { ...c, support1: c.support2 }, L * 1.8)}</g>`, 45);
    s += `<circle cx="${C}" cy="${C}" r="30" fill="${c.support1}" stroke="${c.ink}" stroke-width="${L * 1.4}"/>`;
    return s + mirror(C, C, 13, c, L);
  },
  marigold(c, L) {
    const C = 200;
    let s = ring(12, C, C, (i) => `<path d="${petal(C, C, 120, 192, 22)}" fill="${c.support1}" stroke="${c.ink}" stroke-width="${L * 1.2}"/><path d="M${C} ${C - 128} V ${C - 182}" stroke="${c.paper}" stroke-width="${L}"/>`, 15);
    s += `<circle cx="${C}" cy="${C}" r="130" fill="${c.support2}" stroke="${c.ink}" stroke-width="${L * 1.6}"/>`;
    s += ring(24, C, C, (i) => `<circle cx="${C}" cy="${C - 112}" r="17" fill="${i % 2 ? c.accent : c.paper}" stroke="${c.ink}" stroke-width="${L}"/>`);
    s += ring(18, C, C, (i) => `<circle cx="${C}" cy="${C - 80}" r="16" fill="${i % 2 ? c.paper : c.accent}" stroke="${c.ink}" stroke-width="${L}"/>`, 10);
    s += ring(12, C, C, (i) => `<circle cx="${C}" cy="${C - 50}" r="15" fill="${i % 2 ? c.accent : c.support1}" stroke="${c.ink}" stroke-width="${L}"/>`);
    s += `<circle cx="${C}" cy="${C}" r="34" fill="${c.accent}" stroke="${c.ink}" stroke-width="${L * 1.6}"/>`;
    return s + mirror(C, C, 15, c, L);
  },
};
const MEDALLION_IDS = Object.keys(MEDALLIONS);

function medallion(ctx, cx, cy, d, id) {
  const c = colours(ctx);
  const S = Math.min(ctx.W, ctx.H);
  const u = d / 400;
  const L = Math.max(0.8, S * 0.0028) / u;
  return `<g transform="translate(${r1(cx - d / 2)} ${r1(cy - d / 2)}) scale(${u.toFixed(4)})">${MEDALLIONS[id](c, r1(L))}</g>`;
}

export function medallionInBox(ctx, b, n = 0, want = null) {
  const id = MEDALLIONS[want] ? want : MEDALLION_IDS[(ctx.index + n) % MEDALLION_IDS.length];
  const c = colours(ctx);
  const S = Math.min(ctx.W, ctx.H), lw = Math.max(0.8, S * 0.0028);
  const d = Math.min(b.w, b.h);
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  let s = medallion(ctx, cx, cy, d, id);
  const side = (b.w - d) / 2;
  if (side > d * 0.18) {
    // Bilateral: a paisley pair facing the medallion, a rosette above and below each.
    const k = Math.min(side * 0.6, d * 0.42) / 30;
    for (const dir of [-1, 1]) {
      const px = cx + dir * (d / 2 + side / 2);
      s += paisley(px, cy - k * 2, k, -dir, c, lw * 1.2);
      if (b.h > k * 60) s += rosette(px, cy - k * 26, k * 6.5, c, lw) + rosette(px, cy + k * 22, k * 6.5, c, lw);
    }
  }
  return s;
}

// ------------------------------------------------------------------ frame
/** The nested border: thickness and band count from the layout's frame, else fitted to its margins. */
function frame(ctx) {
  const { W, H } = ctx;
  const S = Math.min(W, H);
  const fr = ctx.layout.frame;
  if (fr) return { T: (fr.bandPctShortSide / 100) * S, bands: S < 400 ? Math.min(2, fr.bands) : fr.bands };
  const boxes = (ctx.layout.slots || []).map((s) => ctx.px(s.box));
  const edge = Math.min(...boxes.map((b) => Math.min(b.x, b.y, W - b.x - b.w, H - b.y - b.h)).filter((v) => v > 1), S * 0.12);
  const T = Math.max(S * 0.035, Math.min(S * 0.09, edge * 0.62));
  return { T, bands: S < 400 || T < S * 0.05 ? 2 : 4 };
}

function scallopsAlong(x0, y0, x1, y1, r, side, fill, c, lw) {
  // Half-discs on the inner edge, pointing inward. side: top | bottom | left | right.
  const horizontal = side === 'top' || side === 'bottom';
  const len = horizontal ? x1 - x0 : y1 - y0;
  const n = Math.max(1, Math.round(len / (2 * r)));
  const rr = len / n / 2;
  const sweep = side === 'top' || side === 'right' ? 0 : 1;
  let s = '';
  for (let i = 0; i < n; i++) {
    if (horizontal) { const x = x0 + rr * (2 * i + 1); s += `<path d="M${r1(x - rr)} ${r1(y0)} A ${r1(rr)} ${r1(rr)} 0 0 ${sweep} ${r1(x + rr)} ${r1(y0)} Z"/>`; }
    else { const y = y0 + rr * (2 * i + 1); s += `<path d="M${r1(x0)} ${r1(y - rr)} A ${r1(rr)} ${r1(rr)} 0 0 ${sweep === 0 ? 1 : 0} ${r1(x0)} ${r1(y + rr)} Z"/>`; }
  }
  return `<g fill="${fill}" stroke="${c.ink}" stroke-width="${r1(lw)}">${s}</g>`;
}

function border(ctx) {
  const { W, H } = ctx;
  const S = Math.min(W, H);
  const c = colours(ctx);
  const { T, bands } = frame(ctx);
  const lw = Math.max(0.8, S * 0.0028);
  const ringPath = (a, b) => `M0 0H${W}V${H}H0Z M${r1(a)} ${r1(a)}H${r1(W - a)}V${r1(H - a)}H${r1(a)}Z M${r1(b)} ${r1(b)}H${r1(W - b)}V${r1(H - b)}H${r1(b)}Z`;
  const band = (a, b, fill) => `<path fill-rule="evenodd" fill="${fill}" d="M${r1(a)} ${r1(a)}H${r1(W - a)}V${r1(H - a)}H${r1(a)}Z M${r1(b)} ${r1(b)}H${r1(W - b)}V${r1(H - b)}H${r1(b)}Z"/>`;
  void ringPath;
  const outer = bands >= 3 ? T * 0.52 : T * 0.78;
  let s = band(0, outer, c.accent);
  // Bead chain along the outer band: paper dots and support diamonds, alternating.
  const m = outer / 2, step = Math.max(outer * 0.95, 10);
  const nx = Math.max(2, Math.round((W - 2 * m) / step)), ny = Math.max(2, Math.round((H - 2 * m) / step));
  const bead = (x, y, i) => i % 2 ? `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(outer * 0.14)}" fill="${c.paper}"/>` : `<path d="M${r1(x)} ${r1(y - outer * 0.26)}L${r1(x + outer * 0.2)} ${r1(y)}L${r1(x)} ${r1(y + outer * 0.26)}L${r1(x - outer * 0.2)} ${r1(y)}Z" fill="${c.support1}" stroke="${c.ink}" stroke-width="${r1(lw * 0.6)}"/>`;
  let beads = '';
  for (let i = 1; i < nx; i++) { const x = m + ((W - 2 * m) * i) / nx; beads += bead(x, m, i) + bead(x, H - m, i); }
  for (let j = 1; j < ny; j++) { const y = m + ((H - 2 * m) * j) / ny; beads += bead(m, y, j) + bead(W - m, y, j); }
  s += beads;
  s += band(0, Math.max(lw * 1.4, T * 0.03), c.ink);
  const k1 = outer + Math.max(lw * 1.6, T * 0.06);
  s += band(outer, k1, c.ink);
  if (bands >= 3) {
    const r = T * 0.13;
    const inset = k1 + r * 0.2;
    s += scallopsAlong(inset + r * 2, k1, W - inset - r * 2, 0, r, 'top', c.support1, c, lw) +
      scallopsAlong(inset + r * 2, H - k1, W - inset - r * 2, 0, r, 'bottom', c.support1, c, lw) +
      scallopsAlong(k1, inset + r * 2, 0, H - inset - r * 2, r, 'left', c.support1, c, lw) +
      scallopsAlong(W - k1, inset + r * 2, 0, H - inset - r * 2, r, 'right', c.support1, c, lw);
  }
  if (bands >= 4) {
    const ir = T * 0.88;
    s += `<rect x="${r1(ir)}" y="${r1(ir)}" width="${r1(W - 2 * ir)}" height="${r1(H - 2 * ir)}" fill="none" stroke="${c.onGroundLine}" stroke-width="${r1(lw * 1.2)}"/>`;
    s += `<rect x="${r1(T * 0.96)}" y="${r1(T * 0.96)}" width="${r1(W - 2 * T * 0.96)}" height="${r1(H - 2 * T * 0.96)}" fill="none" stroke="${c.support2}" stroke-width="${r1(lw * 1.4)}" stroke-dasharray="0.1 ${r1(lw * 4)}" stroke-linecap="round"/>`;
  }
  // Corner rosettes cover the joins.
  const cr = outer * (bands >= 3 ? 0.95 : 0.7);
  for (const [x, y] of [[m, m], [W - m, m], [m, H - m], [W - m, H - m]]) s += rosette(x, y, cr, c, lw);
  return s;
}

// ------------------------------------------------------------------ field
function field(ctx, extraAvoid = []) {
  const { W, H, px } = ctx;
  const S = Math.min(W, H);
  const c = colours(ctx);
  const { T } = frame(ctx);
  const cell = S * 0.085, r = S * 0.015;
  // Avoid what was actually placed (fitted text, cartouche, medallion), plus the brand and CTA slots.
  const slots = (ctx.layout.slots || []).filter((s) => s.role === 'brand' || s.role === 'cta' || s.role === 'image').map((s) => {
    const b = px(s.box), g = S * 0.03;
    return { x: b.x - g, y: b.y - g, w: b.w + 2 * g, h: b.h + 2 * g };
  }).concat(placed(ctx).filter((p) => !p.circle), extraAvoid);
  const circles = placed(ctx).filter((p) => p.circle);
  const lo = T + S * 0.03;
  let s = '';
  const flower = (x, y, row) => ring(5, x, y, () => `<ellipse cx="${r1(x)}" cy="${r1(y - r)}" rx="${r1(r * 0.45)}" ry="${r1(r * 0.8)}" fill="${row % 2 ? c.support1 : c.support2}"/>`) +
    `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r * 0.45)}" fill="${c.accent}"/>`;
  const rows = Math.ceil(H / (cell * 0.75));
  for (let row = 0; row < rows; row++) {
    for (let col = -1; col * cell < W + cell; col++) {
      const x = W / 2 + (col - Math.floor(W / cell / 2)) * cell + (row % 2) * cell / 2;
      const y = cell * 0.5 + row * cell * 0.75;
      if (x < lo || x > W - lo || y < lo || y > H - lo) continue;
      if (slots.some((b) => x > b.x - r && x < b.x + b.w + r && y > b.y - r && y < b.y + b.h + r)) continue;
      if (circles.some((q) => Math.hypot(x - q.cx, y - q.cy) < q.r + r)) continue;
      s += flower(x, y, row);
    }
  }
  return s;
}

/** The brand plate under the engine's brand slot (sized as the engine sets the name), with a paisley pair. */
function brandPlate(ctx) {
  const slot = (ctx.layout.slots || []).find((s) => s.role === 'brand');
  if (!slot) return '';
  const b = ctx.px(slot.box);
  const S = Math.min(ctx.W, ctx.H);
  const f = ctx.face('brand');
  // Mirrors the engine's drawBrand sizing (tools/design/engine.mjs); see the report's engine notes.
  const h = ctx.W / ctx.H > 2.5 ? Math.max(24, Math.min(b.h * 0.8, ctx.H * 0.16)) : Math.max(Math.min(b.h, S * 0.07), S * 0.045, 24);
  const ft = ctx.fit(ctx.brand.config.name, b.w, h, { ...f, tracking: 0 }, { max: h, min: 12, maxLines: 1 });
  const c = colours(ctx);
  const lw = Math.max(0.8, S * 0.0028);
  const padX = ft.size * 0.6, padY = ft.size * 0.3;
  const x = b.x - padX, y = b.y + ft.size * 0.12 - padY, w = ft.width + padX * 2, hh = ft.size * 1.0 + padY * 2;
  return `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(hh)}" rx="${r1(hh / 2)}" fill="${c.ink}" stroke="${c.ink}" stroke-width="${r1(lw * 2)}"/>` +
    `<rect x="${r1(x + lw * 2.5)}" y="${r1(y + lw * 2.5)}" width="${r1(w - lw * 5)}" height="${r1(hh - lw * 5)}" rx="${r1(hh / 2 - lw * 2.5)}" fill="none" stroke="${c.accent === c.ground ? c.support1 : c.accent}" stroke-width="${r1(lw)}"/>`;
}

// What this render placed (fitted text, medallions, panel), so the field can fill the rest.
const PLACED = new WeakMap();
const placed = (ctx) => { if (!PLACED.has(ctx)) PLACED.set(ctx, []); return PLACED.get(ctx); };

// ------------------------------------------------------------------ the skin
export default {
  compositions: ['single-focal', 'type-led', 'split', 'stacked', 'full-bleed-band', 'grid-of-n'],
  type: {
    headline: { family: 'display', weight: 900, tracking: -0.01 },
    subhead: { family: 'body', weight: 600 },
    body: { family: 'body', weight: 400 },
    note: { family: 'body', weight: 600 },
    cta: { family: 'body', weight: 700, tracking: 0.02 },
    brand: { family: 'body', weight: 700, tracking: 0 },
  },
  headlineMax: 0.095,

  ground(ctx) {
    const { W, H, pal } = ctx;
    return `<rect width="${W}" height="${H}" fill="${pal.ground}"/>` + border(ctx) + brandPlate(ctx);
  },

  art(ctx, b, { n }) {
    const own = productMotif(ctx, b, { medallionInBox: (box, id) => medallionInBox(ctx, box, n, id), colours: colours(ctx), rosette, paisley, mirror }) || artFile(ctx, b);
    if (own) { placed(ctx).push({ x: b.x, y: b.y, w: b.w, h: b.h }); return own; }
    const S = Math.min(ctx.W, ctx.H), d = Math.min(b.w, b.h), g = S * 0.02;
    placed(ctx).push({ circle: true, cx: b.x + b.w / 2, cy: b.y + b.h / 2, r: d / 2 + g });
    if ((b.w - d) / 2 > d * 0.18) placed(ctx).push({ x: b.x - g, y: b.y - g, w: b.w + 2 * g, h: b.h + 2 * g });
    return medallionInBox(ctx, b, n, ctx.piece.art && ctx.piece.art.motif);
  },

  // The photo, unfiltered (no tint over skin), inside a decorated panel in the part of the canvas
  // the text does not use; the field pattern fills the rest, clear of text and panel.
  media(ctx, layout) {
    const { W, H, P, dataUri, media } = ctx;
    const S = Math.min(W, H);
    const c = colours(ctx);
    const { T } = frame(ctx);
    const band = textZoneBand(ctx, layout, { padPct: 1 });
    const f = freeRect(ctx, band);
    const g = T + S * 0.05;
    const x0 = Math.max(f.x, 0) + (f.x <= 1 ? g : S * 0.03), y0 = Math.max(f.y, 0) + (f.y <= 1 ? g : S * 0.03);
    const x1 = f.x + f.w - (f.x + f.w >= W - 1 ? g : S * 0.03), y1 = f.y + f.h - (f.y + f.h >= H - 1 ? g : S * 0.03);
    const w = Math.max(10, x1 - x0), h = Math.max(10, y1 - y0);
    const bw = S * 0.028, lw = Math.max(0.8, S * 0.0028);
    const arch = h > w * 1.05;
    const shape = (x, y, ww, hh) => arch
      ? `M${r1(x)} ${r1(y + hh)} V${r1(y + ww / 2)} A ${r1(ww / 2)} ${r1(ww / 2)} 0 0 1 ${r1(x + ww)} ${r1(y + ww / 2)} V${r1(y + hh)} Z`
      : `M${r1(x)} ${r1(y)} H${r1(x + ww)} V${r1(y + hh)} H${r1(x)} Z`;
    const outerD = shape(x0 - bw, y0 - bw, w + 2 * bw, h + 2 * bw);
    let beads = '';
    const per = 2 * (w + h), nb = Math.round(per / (bw * 1.3));
    const pathId = `${P}pf`;
    void pathId;
    // Beads along the band's centre line (rectangle approximation is fine for the arch's straight sides).
    if (!arch) for (let i = 0; i < nb; i++) {
      let t = (i / nb) * per, x, y;
      const ww = w + bw, hh = h + bw, X = x0 - bw / 2, Y = y0 - bw / 2;
      if (t < ww) { x = X + t; y = Y; } else if ((t -= ww) < hh) { x = X + ww; y = Y + t; } else if ((t -= hh) < ww) { x = X + ww - t; y = Y + hh; } else { t -= ww; x = X; y = Y + hh - t; }
      beads += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(bw * 0.17)}" fill="${c.paper}"/>`;
    }
    const corners = arch ? [[x0 - bw / 2, y0 + h + bw / 2], [x0 + w + bw / 2, y0 + h + bw / 2]] : [[x0 - bw / 2, y0 - bw / 2], [x0 + w + bw / 2, y0 - bw / 2], [x0 - bw / 2, y0 + h + bw / 2], [x0 + w + bw / 2, y0 + h + bw / 2]];
    const panel = `<path d="${outerD}" fill="${c.accent}" stroke="${c.ink}" stroke-width="${r1(lw * 2)}"/>` + beads +
      `<clipPath id="${P}pc"><path d="${shape(x0, y0, w, h)}"/></clipPath>` +
      `<image href="${dataUri(media)}" x="${r1(x0)}" y="${r1(y0)}" width="${r1(w)}" height="${r1(h)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${P}pc)"/>` +
      `<path d="${shape(x0, y0, w, h)}" fill="none" stroke="${c.ink}" stroke-width="${r1(lw * 2)}"/>` +
      `<path d="${shape(x0 + lw * 4, y0 + lw * 4, w - lw * 8, h - lw * 8)}" fill="none" stroke="${c.paper}" stroke-width="${r1(lw)}" stroke-dasharray="${r1(lw * 3)} ${r1(lw * 3)}"/>` +
      corners.map(([x, y]) => rosette(x, y, bw * 1.1, c, lw)).join('');
    placed(ctx).push({ x: x0 - bw * 2, y: y0 - bw * 2, w: w + bw * 4, h: h + bw * 4 });
    return brandPlate(ctx) + panel;
  },

  textOn(ctx, slot) {
    const c = colours(ctx);
    if (slot.role === 'headline') return c.headFill;
    if (slot.role === 'brand') return ctx.pal.white;
    return ctx.pal.onGround;
  },

  // The cartouche: a paper panel behind the headline, ink keyline, inner accent rule, a raised centre
  // crest carrying a mirror disc, and a jhalar fringe under it when there is room.
  decorate(ctx, slot, blk) {
    const S = Math.min(ctx.W, ctx.H);
    if (slot.role !== 'headline') {
      const bx = slot.align === 'center' ? blk.box.x + (blk.box.w - blk.width) / 2 : slot.align === 'right' ? blk.box.x + blk.box.w - blk.width : blk.box.x;
      const g = S * 0.03;
      placed(ctx).push({ x: bx - g, y: blk.box.y - g, w: blk.width + 2 * g, h: blk.height + 2 * g });
      return '';
    }
    const c = colours(ctx);
    const lw = Math.max(0.8, S * 0.0028);
    const padX = blk.size * 0.55;
    const cx = slot.align === 'center' ? blk.box.x + blk.box.w / 2 : slot.align === 'right' ? blk.box.x + blk.box.w - blk.width / 2 : blk.box.x + blk.width / 2;
    const tTop = blk.box.y + blk.size * 0.12, tBot = blk.box.y + blk.size * 0.86 + (blk.lines.length - 1) * blk.size * blk.lead + blk.size * 0.24;
    // Vertical padding shrinks when another slot sits close above or below (the panel never covers it).
    const others = (ctx.layout.slots || []).filter((o) => o !== slot && o.role !== 'art').map((o) => ctx.px(o.box)).filter((b) => b.x < cx + blk.width / 2 + padX && b.x + b.w > cx - blk.width / 2 - padX);
    const gapBelow = Math.min(...others.filter((b) => b.y >= tBot - 1).map((b) => b.y - tBot), Infinity);
    const gapAbove = Math.min(...others.filter((b) => b.y + b.h <= tTop + 1).map((b) => tTop - b.y - b.h), Infinity);
    const padY = Math.max(blk.size * 0.14, Math.min(blk.size * 0.38, gapBelow * 0.6, gapAbove * 0.6));
    // The panel stays inside the frame, a hair clear of its inner rule.
    const { T } = frame(ctx);
    const lim = T + lw * 4;
    const x0 = Math.max(lim, cx - blk.width / 2 - padX), x1 = Math.min(ctx.W - lim, cx + blk.width / 2 + padX);
    const y0 = Math.max(lim + blk.size * 0.25, tTop - padY);
    const y1 = Math.min(ctx.H - lim, tBot + padY);
    const rr = Math.min(blk.size * 0.25, S * 0.02), crest = Math.min(blk.size * 0.42, S * 0.04), cw = crest * 1.6;
    const d = `M${r1(x0)} ${r1(y0 + rr)} Q${r1(x0)} ${r1(y0)} ${r1(x0 + rr)} ${r1(y0)} H${r1(cx - cw)} Q${r1(cx)} ${r1(y0 - crest * 1.6)} ${r1(cx + cw)} ${r1(y0)} H${r1(x1 - rr)} Q${r1(x1)} ${r1(y0)} ${r1(x1)} ${r1(y0 + rr)} V${r1(y1 - rr)} Q${r1(x1)} ${r1(y1)} ${r1(x1 - rr)} ${r1(y1)} H${r1(x0 + rr)} Q${r1(x0)} ${r1(y1)} ${r1(x0)} ${r1(y1 - rr)} Z`;
    // Jhalar: small pennants hanging from the panel, only if no other slot sits right below.
    const fh = Math.min(S * 0.03, blk.size * 0.4);
    const below = (ctx.layout.slots || []).filter((s) => s !== slot && s.role !== 'art').map((s) => ctx.px(s.box)).some((b) => b.y < y1 + fh * 1.6 && b.y + b.h > y1 && b.x < x1 && b.x + b.w > x0);
    let fringe = '';
    if (!below) {
      const n = Math.max(5, Math.round((x1 - x0) / (fh * 0.9)));
      for (let i = 0; i < n; i++) {
        const x = x0 + rr + ((x1 - x0 - 2 * rr) * (i + 0.5)) / n;
        fringe += `<path d="M${r1(x - fh * 0.32)} ${r1(y1)}L${r1(x + fh * 0.32)} ${r1(y1)}L${r1(x)} ${r1(y1 + fh * 0.8)}Z" fill="${i % 2 ? c.support2 : c.accent}" stroke="${c.ink}" stroke-width="${r1(lw * 0.8)}" stroke-linejoin="round"/><circle cx="${r1(x)}" cy="${r1(y1 + fh * 1.02)}" r="${r1(fh * 0.17)}" fill="${c.support1}" stroke="${c.ink}" stroke-width="${r1(lw * 0.6)}"/>`;
      }
    }
    const inset = Math.max(lw * 3, blk.size * 0.09);
    const g = S * 0.035;
    placed(ctx).push({ x: x0 - g, y: y0 - crest * 1.6 - g, w: x1 - x0 + 2 * g, h: y1 - y0 + crest * 1.6 + (fringe ? fh * 1.3 : 0) + 2 * g });
    return fringe + `<path d="${d}" fill="${c.paper}" stroke="${c.ink}" stroke-width="${r1(lw * 2.2)}" stroke-linejoin="round"/>` +
      `<rect x="${r1(x0 + inset)}" y="${r1(y0 + inset)}" width="${r1(x1 - x0 - 2 * inset)}" height="${r1(y1 - y0 - 2 * inset)}" rx="${r1(Math.max(1, rr - inset / 2))}" fill="none" stroke="${c.accent === c.headFill ? c.support1 : c.accent}" stroke-width="${r1(lw * 1.2)}"/>` +
      mirror(cx, y0 - crest * 0.32, Math.max(3, crest * 0.4), c, lw);
  },

  // Signboard lettering: a flat ink drop line under the headline (down-right, ~3.5% of the size).
  text(ctx, slot, blk) {
    if (slot.role !== 'headline') return blk.svg;
    const off = Math.max(1.5, blk.size * 0.035);
    const drop = blk.svg.replace(`fill="${blk.fill}"`, `fill="${ctx.pal.black}" transform="translate(${r1(off)} ${r1(off)})"`);
    return drop + blk.svg;
  },

  // A pill inside a one-band frame; fill and label chosen for 4.5:1.
  cta(ctx, b, label, f, slot) {
    const { esc, fit, contrast, pal } = ctx;
    const c = colours(ctx);
    const S = Math.min(ctx.W, ctx.H);
    const lw = Math.max(0.8, S * 0.0028);
    const ft = fit(label, b.w * 0.78, b.h * 0.5, f, { max: S * 0.032, min: 12, maxLines: 1 });
    const bw = Math.min(b.w, ft.width + ft.size * 2.4), bh = ft.size * 2.3;
    const right = slot && slot.align === 'right', center = slot && slot.align === 'center';
    const x = right ? b.x + b.w - bw : center ? b.x + (b.w - bw) / 2 : b.x, y = b.y + (b.h - bh) / 2;
    const fill = [c.accent, c.support1, c.support2, pal.black].find((h) => h !== pal.ground && Math.max(contrast(h, pal.black), contrast(h, pal.white)) >= 4.5) || pal.black;
    const tc = ctx.readableOn(fill, [pal.black, pal.white]);
    const g = lw * 3;
    return `<rect x="${r1(x - g)}" y="${r1(y - g)}" width="${r1(bw + 2 * g)}" height="${r1(bh + 2 * g)}" rx="${r1(bh / 2 + g)}" fill="${c.paper}" stroke="${c.ink}" stroke-width="${r1(lw * 1.6)}"/>` +
      `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(bw)}" height="${r1(bh)}" rx="${r1(bh / 2)}" fill="${fill}" stroke="${c.ink}" stroke-width="${r1(lw * 1.6)}"/>` +
      `<text x="${r1(x + bw / 2)}" y="${r1(y + bh / 2 + ft.size * 0.36)}" text-anchor="middle" font-family="'${esc(f.family)}', sans-serif" font-weight="${f.weight}" font-size="${r1(ft.size)}" letter-spacing="${r1(f.tracking * ft.size)}" fill="${tc}">${esc(ft.lines.join(' '))}</text>`;
  },

  // Carousel: a toran hangs inside the top of the frame at the same height on every slide (its rope
  // enters and leaves at one y, so the slides join into one garland); a count plate sits at the foot.
  series(ctx, s) {
    const { W, H, esc } = ctx;
    const S = Math.min(W, H);
    const c = colours(ctx);
    const { T } = frame(ctx);
    const lw = Math.max(0.8, S * 0.0028);
    const y = T + S * 0.012, leaf = S * 0.038, step = S * 0.05;
    let t = `<path d="M0 ${r1(y)} H${W}" stroke="${c.onGroundLine}" stroke-width="${r1(lw * 1.6)}"/>`;
    const n = Math.ceil(W / step);
    for (let i = 0; i <= n; i++) {
      const x = i * step + step / 2;
      if (x < T || x > W - T) continue;
      t += `<path d="M${r1(x)} ${r1(y)} C${r1(x + leaf * 0.3)} ${r1(y + leaf * 0.33)} ${r1(x + leaf * 0.17)} ${r1(y + leaf * 0.75)} ${r1(x)} ${r1(y + leaf)} C${r1(x - leaf * 0.17)} ${r1(y + leaf * 0.75)} ${r1(x - leaf * 0.3)} ${r1(y + leaf * 0.33)} ${r1(x)} ${r1(y)}Z" fill="${i % 2 ? c.support2 : c.accent}" stroke="${c.ink}" stroke-width="${r1(lw)}"/>`;
      t += `<circle cx="${r1(x + step / 2)}" cy="${r1(y + leaf * 0.12)}" r="${r1(leaf * 0.2)}" fill="${c.support1}" stroke="${c.ink}" stroke-width="${r1(lw)}"/>`;
    }
    const label = `${s.index} / ${s.of}`, fs = S * 0.026;
    const lwid = ctx.textWidth(label, { family: ctx.fam.body, weight: 700, size: fs }) + fs * 2;
    const py = H - T - S * 0.05;
    placed(ctx).push({ x: W / 2 - lwid / 2 - S * 0.03, y: py - fs - S * 0.03, w: lwid + S * 0.06, h: fs * 2 + S * 0.06 });
    t += `<rect x="${r1(W / 2 - lwid / 2)}" y="${r1(py - fs * 0.95)}" width="${r1(lwid)}" height="${r1(fs * 1.9)}" rx="${r1(fs * 0.95)}" fill="${c.paper}" stroke="${c.ink}" stroke-width="${r1(lw * 1.6)}"/>` +
      `<text x="${r1(W / 2)}" y="${r1(py + fs * 0.35)}" text-anchor="middle" font-family="'${esc(ctx.fam.body)}', sans-serif" font-weight="700" font-size="${r1(fs)}" fill="${ctx.pal.black}">${esc(label)}</text>`;
    return t;
  },

  // The frame arrives with the ground (outside in, motion.json); the field is drawn last, only where
  // nothing was placed (it needs the fitted text and medallion positions recorded above).
  finish: (ctx) => field(ctx),
};
