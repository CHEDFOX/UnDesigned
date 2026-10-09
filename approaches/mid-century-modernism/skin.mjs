// Mid-century Modernism skin for the design engine (tools/design/engine.mjs).
// One emblem, cut from paper, printed in a few inks (README: MC1-MC8; art.json).
// - ground: flat Wada ground with a light paper speckle (printing trace), kept off the text
// - art: a cut-paper emblem in a 400-unit artboard (bird, sun, cup, fish, sprig, clock, house) on a
//   field shape (kidney or circle) with dry-brush skips, colour plates offset from the key line
//   (misregistration, one direction), plus one piece of atomic-age punctuation (starburst, sparkle,
//   boomerang). The accent goes on the emblem only.
// - media: the photo as a one-ink coarse halftone (key ink on the ground), and a solid ground zone
//   under the text whose edge dissolves into the photo through halftone dots (media.json halftone-fade).
// - type: heavy display, tight; letter-spaced labels; never misregistered.
// - cta: a slanted parallelogram bar in the key colour (art.json shape.parallelogram).
// - series: a structural key line along the foot of every slide with a sparkle that travels.

import { productMotif, artFile, photo } from '../../tools/design/skins/base.mjs';
import { inks, textZoneBand, freeRect } from './skin-helpers.mjs';

const r1 = (n) => Math.round(n * 10) / 10;

/** A starburst (or sparkle with n = 4) path. */
export function star(cx, cy, ro, ri, n, rot = 0) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (Math.PI * i) / n, r = i % 2 ? ri : ro;
    d += (i ? 'L' : 'M') + r1(cx + r * Math.cos(a)) + ' ' + r1(cy + r * Math.sin(a));
  }
  return d + 'Z';
}
// Boomerang drawn round (0,0), about 130 x 60 units; placed with a transform.
const BOOMERANG = 'M -64 22 C -50 2, -24 -16, 0 -26 C 20 -18, 42 -4, 58 8 C 63 12, 58 19, 52 16 C 36 8, 16 -2, 2 -6 C -14 2, -34 18, -50 32 C -56 37, -68 30, -64 22 Z';
// Kidney field shape in the 400 artboard: one concave side, no sharp corners.
const KIDNEY = 'M 128 74 C 226 28, 372 72, 364 190 C 358 300, 272 378, 176 352 C 112 334, 146 268, 104 230 C 62 192, 52 112, 128 74 Z';
const leafPath = (x, y, len, ang) => {
  const a = (ang * Math.PI) / 180, w = len * 0.34;
  const tx = x + len * Math.cos(a), ty = y + len * Math.sin(a);
  const nx = -Math.sin(a) * w, ny = Math.cos(a) * w, mx = (x + tx) / 2, my = (y + ty) / 2;
  return `M ${r1(x)} ${r1(y)} Q ${r1(mx + nx)} ${r1(my + ny)} ${r1(tx)} ${r1(ty)} Q ${r1(mx - nx)} ${r1(my - ny)} ${r1(x)} ${r1(y)} Z`;
};

/**
 * The emblems. Each returns { field, plates, key, paper } in the 400 artboard:
 * field = the big support shape ('kidney' | 'circle'), plates = colour fills (misregistered),
 * key = key-line work (stays put), top = fills drawn over the key line (eyes, highlights).
 * c = { shape, accent, key, paper, ground }; w = { line, struct } stroke widths in units.
 */
const EMBLEMS = {
  bird(c, w) {
    const bx = 196, by = 196;
    const body = `M ${bx - 52} ${by - 18} C ${bx - 48} ${by - 70}, ${bx + 14} ${by - 86}, ${bx + 40} ${by - 30} L ${bx + 104} ${by + 58} L ${bx + 62} ${by + 50} C ${bx + 30} ${by + 70}, ${bx - 40} ${by + 46}, ${bx - 52} ${by - 18} Z`;
    const crest = `M ${bx - 36} ${by - 58} L ${bx - 6} ${by - 104} L ${bx + 2} ${by - 60} Z`;
    const wing = `M ${bx - 6} ${by - 10} C ${bx + 20} ${by - 40}, ${bx + 60} ${by - 10}, ${bx + 80} ${by + 36} C ${bx + 40} ${by + 30}, ${bx + 6} ${by + 24}, ${bx - 6} ${by - 10} Z`;
    const mask = `M ${bx - 52} ${by - 18} L ${bx - 30} ${by - 46} L ${bx - 14} ${by - 8} Z`;
    const beak = `M ${bx - 50} ${by - 30} L ${bx - 80} ${by - 16} L ${bx - 50} ${by - 6} Z`;
    return {
      field: 'kidney',
      plates: `<path d="${body}" fill="${c.accent}"/><path d="${crest}" fill="${c.accent}"/><path d="${leafPath(64, 286, 34, -100)}" fill="${c.paper}"/>`,
      key: `<path d="M 6 300 C 120 290, 250 286, 394 262" fill="none" stroke="${c.key}" stroke-width="${w.struct}" stroke-linecap="round"/>` +
        `<path d="M 86 292 L 62 270" stroke="${c.key}" stroke-width="${w.struct * 0.6}" stroke-linecap="round"/>` +
        `<path d="${leafPath(62, 270, 36, -150)}" fill="${c.key}"/>` +
        `<path d="${wing}" fill="${c.key}"/><path d="${mask}" fill="${c.key}"/>` +
        `<path d="${beak}" fill="${c.paper}" stroke="${c.key}" stroke-width="${w.line}" stroke-linejoin="round"/>` +
        `<g stroke="${c.key}" stroke-width="${w.struct * 0.5}" stroke-linecap="round"><path d="M ${bx + 6} ${by + 52} L ${bx} ${by + 92}"/><path d="M ${bx + 26} ${by + 54} L ${bx + 24} ${by + 90}"/></g>`,
      top: `<circle cx="${bx - 30}" cy="${by - 30}" r="8" fill="${c.paper}"/><circle cx="${bx - 32}" cy="${by - 30}" r="3.4" fill="${c.key}"/>`,
      punct: [[342, 78, 'star'], [70, 360, 'boomerang']],
    };
  },
  sun(c, w) {
    let rays = '';
    for (let i = 0; i < 3; i++) rays += `<path d="M ${70 + i * 18} ${330 + i * 16} H ${330 - i * 18}" stroke="${c.key}" stroke-width="${w.struct * (1 - i * 0.25)}" stroke-linecap="round"/>`;
    return {
      field: 'circle',
      plates: `<path d="${star(200, 196, 128, 84, 16, 0.1)}" fill="${c.pop}"/><circle cx="200" cy="196" r="66" fill="${c.accent}"/>`,
      key: `<circle cx="196" cy="193" r="66" fill="none" stroke="${c.key}" stroke-width="${w.line}" stroke-dasharray="300 115"/>` + rays,
      top: '',
      punct: [[346, 70, 'sparkle'], [62, 92, 'sparkle']],
    };
  },
  cup(c, w) {
    const cup = 'M 116 176 H 268 C 268 262, 240 306, 192 306 C 144 306, 116 262, 116 176 Z';
    return {
      field: 'kidney',
      plates: `<path d="${cup}" fill="${c.accent}"/>` +
        `<g fill="none" stroke="${c.pop}" stroke-width="${w.struct * 1.5}" stroke-linecap="round"><path d="M 168 150 C 148 124, 188 104, 166 66"/><path d="M 222 150 C 202 124, 242 104, 220 66"/></g>`,
      key: `<path d="M 268 196 C 312 196, 314 252, 262 256" fill="none" stroke="${c.key}" stroke-width="${w.struct}" stroke-linecap="round"/>` +
        `<path d="M 84 318 C 140 334, 250 334, 306 316" fill="none" stroke="${c.key}" stroke-width="${w.struct * 1.4}" stroke-linecap="round"/>` +
        `<path d="M 192 150 C 172 124, 212 104, 190 66" fill="none" stroke="${c.key}" stroke-width="${w.line}" stroke-linecap="round"/>` +
        `<path d="M 112 174 H 272" stroke="${c.key}" stroke-width="${w.line}" stroke-linecap="round"/>`,
      top: `<path d="M 142 196 C 142 240, 156 270, 176 284" fill="none" stroke="${c.paper}" stroke-width="${w.struct * 0.8}" stroke-linecap="round"/>`,
      punct: [[338, 92, 'star']],
    };
  },
  fish(c, w) {
    const body = 'M 84 200 C 140 120, 250 112, 300 200 C 250 288, 140 280, 84 200 Z';
    const tail = 'M 290 200 L 360 146 C 350 182, 350 218, 360 254 Z';
    const fin = 'M 170 140 L 214 92 L 236 150 Z';
    return {
      field: 'circle',
      plates: `<path d="${fin}" fill="${c.paper}"/><path d="${body}" fill="${c.accent}"/><path d="${tail}" fill="${c.accent}"/>`,
      key: `<path d="M 150 156 C 172 186, 172 216, 150 246" fill="none" stroke="${c.key}" stroke-width="${w.struct * 0.7}" stroke-linecap="round"/>` +
        `<path d="M 196 230 L 228 266 L 240 226 Z" fill="${c.key}"/>` +
        `<g fill="none" stroke="${c.key}" stroke-width="${w.line}"><circle cx="66" cy="150" r="9"/><circle cx="52" cy="112" r="6"/><circle cx="70" cy="82" r="4"/></g>` +
        `<path d="M 60 330 C 130 312, 200 348, 270 330 S 340 316, 360 326" fill="none" stroke="${c.key}" stroke-width="${w.struct}" stroke-linecap="round"/>`,
      top: `<circle cx="122" cy="190" r="10" fill="${c.paper}"/><circle cx="118" cy="190" r="4.4" fill="${c.key}"/>`,
      punct: [[332, 76, 'sparkle']],
    };
  },
  sprig(c, w) {
    const pts = [[150, 300, 60, -150], [176, 248, 64, -30], [196, 208, 62, -160], [222, 160, 60, -20], [236, 120, 56, -110]];
    return {
      field: 'kidney',
      plates: pts.map(([x, y, l, a]) => `<path d="${leafPath(x, y, l, a)}" fill="${c.accent}"/>`).join(''),
      key: `<path d="M 120 360 C 170 280, 210 200, 240 110" fill="none" stroke="${c.key}" stroke-width="${w.struct}" stroke-linecap="round"/>` +
        pts.map(([x, y, l, a]) => { const t = (a * Math.PI) / 180; return `<path d="M ${x} ${y} L ${r1(x + l * 0.8 * Math.cos(t))} ${r1(y + l * 0.8 * Math.sin(t))}" stroke="${c.key}" stroke-width="${w.line}" stroke-linecap="round"/>`; }).join(''),
      top: '',
      punct: [[330, 84, 'star'], [80, 120, 'sparkle']],
    };
  },
  clock(c, w) {
    let ticks = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, r0 = i % 3 ? 82 : 74;
      ticks += `<path d="M ${r1(200 + r0 * Math.cos(a))} ${r1(200 + r0 * Math.sin(a))} L ${r1(200 + 92 * Math.cos(a))} ${r1(200 + 92 * Math.sin(a))}" stroke="${c.key}" stroke-width="${i % 3 ? w.line : w.struct * 0.7}" stroke-linecap="round"/>`;
    }
    return {
      field: 'kidney',
      plates: `<path d="${star(200, 200, 150, 116, 20, 0.05)}" fill="${c.accent}"/><circle cx="200" cy="200" r="104" fill="${c.paper}"/>`,
      key: `<circle cx="198" cy="198" r="104" fill="none" stroke="${c.key}" stroke-width="${w.line}"/>` + ticks +
        `<path d="M 200 200 L 150 158 M 200 200 L 262 150" stroke="${c.key}" stroke-width="${w.struct}" stroke-linecap="round"/><circle cx="200" cy="200" r="9" fill="${c.key}"/>`,
      top: '',
      punct: [[60, 340, 'boomerang']],
    };
  },
  house(c, w) {
    return {
      field: 'circle',
      plates: `<rect x="120" y="190" width="160" height="126" rx="4" fill="${c.paper}"/><path d="M 96 200 L 206 92 L 312 200 Z" fill="${c.accent}"/><rect x="246" y="96" width="26" height="62" fill="${c.paper}"/>`,
      key: `<path d="M 90 202 L 206 88 L 318 202" fill="none" stroke="${c.key}" stroke-width="${w.line}" stroke-linejoin="round"/>` +
        `<rect x="140" y="236" width="44" height="80" fill="${c.key}"/>` +
        `<g fill="none" stroke="${c.key}" stroke-width="${w.line}"><rect x="210" y="226" width="48" height="44"/><path d="M 234 226 V 270 M 210 248 H 258"/></g>` +
        `<path d="M 40 318 H 360" stroke="${c.key}" stroke-width="${w.struct}" stroke-linecap="round"/>`,
      top: `<circle cx="176" cy="278" r="4" fill="${c.paper}"/>`,
      punct: [[330, 70, 'sparkle'], [80, 96, 'sparkle']],
    };
  },
};
const EMBLEM_IDS = Object.keys(EMBLEMS);

/** The colour plates of the print job: ground, shape, accent (emblem), key, paper. */
export function plates(ctx) {
  const { pal, contrast } = ctx;
  const all = inks(ctx);
  const key = contrast(pal.ink, pal.ground) >= 4.5 ? pal.ink : ctx.readableOn(pal.ground, [pal.black, pal.white]);
  const accent = pal.accent;
  // The shape plate: a combination colour that is not ground, key or accent; else unprinted paper.
  const shape = [...pal.support, ...all].find((h) => h && ![pal.ground, key, accent, pal.black, pal.white].includes(h)) || pal.white;
  return { ground: pal.ground, key, accent, shape, paper: pal.white };
}

/** Draw one emblem into a square of side s at (x, y) in px. */
function emblem(ctx, x, y, s, id, n, opts = {}) {
  const c = plates(ctx);
  const S = Math.min(ctx.W, ctx.H);
  const u = s / 400; // px per unit
  const w = { line: Math.max(1.2, S * 0.0042) / u, struct: Math.max(2.4, S * 0.0115) / u };
  const fieldFill = c.shape === c.accent ? c.paper : c.shape;
  c.pop = fieldFill === c.paper ? c.ground : c.paper;
  const e = EMBLEMS[id](c, w);
  const off = (S * 0.009) / u; // misregistration in units, down-right, every colour plate the same
  const rand = ctx.rand;
  const P = ctx.P;
  const clipId = `${P}fld${n}`;
  const fieldPath = e.field === 'kidney' ? KIDNEY : 'M 50 200 A 150 150 0 1 0 350 200 A 150 150 0 1 0 50 200 Z';
  // Dry brush: skips of ground colour along one edge of the field shape.
  let brush = '';
  const edgeX = e.field === 'kidney' ? 92 : 50;
  for (let i = 0; i < 30; i++) {
    const yy = 60 + i * 10 + rand() * 4, xx = edgeX - 6 + rand() * 46;
    brush += `<rect x="${r1(xx)}" y="${r1(yy)}" width="${r1(6 + rand() * 30)}" height="${r1(1 + rand() * 1.8)}" rx="0.9"/>`;
  }
  // Punctuation: starburst, sparkle or boomerang, the soft and sharp partners (MC6).
  const punct = (opts.punct === false ? [] : e.punct).map(([px, py, kind]) => {
    if (kind === 'star') return { plate: `<path d="${star(px, py, 34, 20, 14, 0.12)}" fill="${c.pop}"/>`, key: '' };
    if (kind === 'sparkle') return { plate: '', key: `<path d="${star(px, py, 16, 4.4, 4)}" fill="${c.key}"/>` };
    const t = `translate(${px} ${py}) rotate(-12) scale(0.7)`;
    return { plate: `<path d="${BOOMERANG}" fill="${c.paper}" transform="${t}"/>`, key: `<path d="${BOOMERANG}" fill="none" stroke="${c.key}" stroke-width="${r1(w.line / 0.7)}" stroke-linejoin="round" transform="translate(${-off * 0.6} ${-off * 0.4}) ${t}"/>` };
  });
  const flip = opts.flip ? ` translate(400 0) scale(-1 1)` : '';
  return `<g transform="translate(${r1(x)} ${r1(y)}) scale(${u.toFixed(4)})${flip}">` +
    `<defs><clipPath id="${clipId}"><path d="${fieldPath}"/></clipPath></defs>` +
    `<g transform="translate(${r1(off)} ${r1(off * 0.75)})">` +
    `<path d="${fieldPath}" fill="${fieldFill}"/><g fill="${c.ground}" clip-path="url(#${clipId})">${brush}</g>` +
    punct.map((p) => p.plate).join('') + e.plates + '</g>' +
    `<path d="${fieldPath}" fill="none" stroke="${c.key}" stroke-width="${r1(w.line)}" stroke-dasharray="${e.field === 'kidney' ? '620 260' : '560 400'}" stroke-linecap="round"/>` +
    e.key + punct.map((p) => p.key).join('') + e.top + '</g>';
}

export function emblemInBox(ctx, b, n = 0, want = null) {
  const id = EMBLEMS[want] ? want : EMBLEM_IDS[(ctx.index * 2 + n * 3) % EMBLEM_IDS.length];
  const asp = b.w / b.h;
  // Wide boxes: emblem to one side (asymmetric balance), the other side gets one floating form.
  if (asp > 1.5) {
    const s = Math.min(b.h, b.w * 0.62);
    const right = (ctx.seed + n) % 2 === 0;
    const x = right ? b.x + b.w - s : b.x;
    const S = Math.min(ctx.W, ctx.H);
    const fx = right ? b.x + (b.w - s) * 0.45 : b.x + s + (b.w - s) * 0.55, fy = b.y + b.h * 0.62;
    const c = plates(ctx);
    const k = Math.min(b.h * 0.0035, (b.w - s) / 180);
    const hasBoomerang = EMBLEMS[id](plates(ctx), { line: 1, struct: 1 }).punct.some((p) => p[2] === 'boomerang');
    const extra = k > 0.15 && !hasBoomerang ? `<g transform="translate(${r1(fx)} ${r1(fy)}) rotate(-14) scale(${k.toFixed(3)})"><path d="${BOOMERANG}" fill="${c.shape === c.accent ? c.paper : c.shape}" transform="translate(${r1((S * 0.009) / k)} ${r1((S * 0.007) / k)})"/><path d="${BOOMERANG}" fill="none" stroke="${c.key}" stroke-width="${r1(Math.max(1.2, S * 0.0042) / k)}"/></g>` +
      `<path d="${star(fx + (right ? -1 : 1) * b.h * 0.18, b.y + b.h * 0.2, S * 0.022, S * 0.006, 4)}" fill="${c.key}"/>` : '';
    return emblem(ctx, x, b.y + (b.h - s) / 2, s, id, n, { flip: !right && id === 'bird' }) + extra;
  }
  const s = Math.min(b.w, b.h);
  return emblem(ctx, b.x + (b.w - s) / 2, b.y + (b.h - s) / 2, s, id, n);
}

// One-ink halftone screen for photos (art.json texture.halftone: coarse cells, palette colours only).
function halftoneDefs(ctx) {
  const { W, H, P } = ctx;
  const S = Math.min(W, H);
  const cell = Math.max(6, Math.round(S * 0.013));
  const c = plates(ctx);
  const rgb = (h) => [1, 3, 5].map((i) => (parseInt(h.slice(i, i + 2), 16) / 255).toFixed(3));
  const [ink, paper] = [rgb(c.key), rgb(c.ground)];
  const screen = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="g" cx=".5" cy=".5" r=".71"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient><pattern id="p" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="${cell}" height="${cell}" fill="url(#g)"/></pattern></defs><rect width="${W}" height="${H}" fill="url(#p)"/></svg>`;
  const uri = 'data:image/svg+xml;base64,' + Buffer.from(screen).toString('base64');
  return `<filter id="${P}ht" x="0" y="0" width="${W}" height="${H}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">` +
    `<feColorMatrix in="SourceGraphic" type="matrix" values="0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0" result="L0"/>` +
    `<feComponentTransfer in="L0" result="L"><feFuncR type="linear" slope="1.25" intercept="0.06"/><feFuncG type="linear" slope="1.25" intercept="0.06"/><feFuncB type="linear" slope="1.25" intercept="0.06"/></feComponentTransfer>` +
    `<feImage href="${uri}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" result="S"/>` +
    `<feComposite in="L" in2="S" operator="arithmetic" k1="0" k2="1" k3="-1" k4="0.5" result="D"/>` +
    `<feComponentTransfer in="D" result="T"><feFuncR type="discrete" tableValues="0 1"/><feFuncG type="discrete" tableValues="0 1"/><feFuncB type="discrete" tableValues="0 1"/><feFuncA type="discrete" tableValues="1 1"/></feComponentTransfer>` +
    `<feComponentTransfer in="T"><feFuncR type="table" tableValues="${ink[0]} ${paper[0]}"/><feFuncG type="table" tableValues="${ink[1]} ${paper[1]}"/><feFuncB type="table" tableValues="${ink[2]} ${paper[2]}"/></feComponentTransfer>` +
    `</filter>`;
}

/** The ground zone under the text, its inner edges dissolving into the photo through halftone dots. */
function halftoneFade(ctx, band) {
  const { W, H, pal } = ctx;
  const S = Math.min(W, H);
  const cell = Math.max(8, S * 0.02);
  let s = `<rect x="${r1(band.x)}" y="${r1(band.y)}" width="${r1(band.w)}" height="${r1(band.h)}" fill="${pal.ground}"/>`;
  const rows = 4;
  const edge = (horizontal, pos, dir, from, to) => {
    for (let k = 0; k < rows; k++) {
      const rr = cell * 0.62 * (1 - k / rows);
      const d = pos + dir * (k + 0.4) * cell;
      for (let t = from + (k % 2 ? cell / 2 : 0); t <= to; t += cell) s += horizontal ? `<circle cx="${r1(t)}" cy="${r1(d)}" r="${r1(rr)}"/>` : `<circle cx="${r1(d)}" cy="${r1(t)}" r="${r1(rr)}"/>`;
    }
  };
  s += `<g fill="${pal.ground}">`;
  if (band.y > 1) edge(true, band.y, -1, band.x, band.x + band.w);
  if (band.y + band.h < H - 1) edge(true, band.y + band.h, 1, band.x, band.x + band.w);
  if (band.x > 1) edge(false, band.x, -1, band.y, band.y + band.h);
  if (band.x + band.w < W - 1) edge(false, band.x + band.w, 1, band.y, band.y + band.h);
  return s + '</g>';
}

/** One cut-paper starburst in the accent on the photo, away from the subject and the text zone. */
function photoStar(ctx, layout, band) {
  const { W, H } = ctx;
  const f = freeRect(ctx, band);
  const S = Math.min(W, H);
  const r = Math.min(S * 0.085, Math.min(f.w, f.h) * 0.3);
  if (r < S * 0.03) return '';
  const sub = layout.media && layout.media.subject ? ctx.px(layout.media.subject) : { x: W / 2, y: H / 2, w: 0, h: 0 };
  const sc = [sub.x + sub.w / 2, sub.y + sub.h / 2];
  const m = r * 1.5;
  const corners = [[f.x + m, f.y + m], [f.x + f.w - m, f.y + m], [f.x + m, f.y + f.h - m], [f.x + f.w - m, f.y + f.h - m]];
  const [cx, cy] = corners.sort((a, b) => Math.hypot(b[0] - sc[0], b[1] - sc[1]) - Math.hypot(a[0] - sc[0], a[1] - sc[1]))[0];
  const c = plates(ctx);
  const off = S * 0.009;
  return `<path d="${star(cx + off, cy + off * 0.75, r, r * 0.62, 16, 0.1)}" fill="${c.accent}"/>` +
    `<path d="${star(cx, cy, r, r * 0.62, 16, 0.1)}" fill="none" stroke="${c.ground}" stroke-width="${r1(Math.max(1.5, S * 0.0042))}" stroke-linejoin="round"/>` +
    `<path d="${star(cx + off, cy + off * 0.75, r * 0.42, r * 0.12, 4)}" fill="${c.paper}"/>`;
}

export default {
  compositions: ['single-focal', 'split', 'type-led', 'stacked', 'full-bleed-band', 'grid-of-n'],
  type: {
    headline: { family: 'display', weight: 900, tracking: -0.02 },
    subhead: { family: 'body', weight: 400 },
    body: { family: 'body', weight: 400 },
    note: { family: 'body', weight: 400 },
    cta: { family: 'display', weight: 700, tracking: 0.02 },
    brand: { family: 'display', weight: 700, tracking: 0.16, upper: true },
  },
  headlineMax: 0.105,

  // Flat ground plus a paper speckle (0.1-0.4% coverage, solid dots), kept clear of text slots.
  ground(ctx) {
    const { W, H, pal, layout, px } = ctx;
    const S = Math.min(W, H);
    const avoid = (layout.slots || []).filter((s) => s.role !== 'art' && s.role !== 'image').map((s) => px(s.box));
    const rand = ctx.rand;
    let dots = '';
    const n = Math.round((W * H) / (S * S) * 320);
    for (let i = 0; i < n; i++) {
      const x = rand() * W, y = rand() * H, r = S * (0.0009 + rand() * 0.0012);
      if (avoid.some((b) => x > b.x - 8 && x < b.x + b.w + 8 && y > b.y - 8 && y < b.y + b.h + 8)) continue;
      dots += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}"/>`;
    }
    const speck = pal.ground === pal.white ? plates(ctx).shape : pal.white;
    return `<rect width="${W}" height="${H}" fill="${pal.ground}"/><g fill="${speck}">${dots}</g>`;
  },

  art(ctx, b, { n }) {
    const own = productMotif(ctx, b, { emblemInBox: (box, id) => emblemInBox(ctx, box, n, id), plates: plates(ctx), star }) || artFile(ctx, b);
    if (own) return own;
    return emblemInBox(ctx, b, n, ctx.piece.art && ctx.piece.art.motif);
  },

  defs: (ctx) => (ctx.media ? halftoneDefs(ctx) : ''),

  // One-ink coarse halftone (key ink on the ground colour), then a solid ground zone under the text.
  media(ctx, layout) {
    const img = photo(ctx, { filter: `${ctx.P}ht` });
    const band = textZoneBand(ctx, layout);
    return img + (band ? halftoneFade(ctx, band) + photoStar(ctx, layout, band) : '');
  },

  textOn(ctx) {
    return ctx.media ? ctx.pal.onGround : null;
  },

  // A short structural key-line rule under the headline, ending in a sparkle (the one playful break).
  decorate(ctx, slot, blk) {
    if (slot.role !== 'headline') return '';
    const S = Math.min(ctx.W, ctx.H);
    const bottom = blk.y + blk.size * 0.86 + (blk.lines.length - 1) * blk.size * blk.lead;
    const y = bottom + blk.size * 0.42;
    const sw = Math.max(2, S * 0.0075);
    if (y + sw + S * 0.012 > blk.box.y + blk.box.h + S * 0.01) return '';
    const len = Math.min(blk.width * 0.28, S * 0.14);
    const x0 = slot.align === 'center' ? blk.box.x + blk.box.w / 2 - len / 2 : blk.box.x;
    return `<path d="M ${r1(x0)} ${r1(y)} H ${r1(x0 + len)}" stroke="${blk.fill}" stroke-width="${r1(sw)}" stroke-linecap="round"/>` +
      `<path d="${star(x0 + len + S * 0.026, y, S * 0.014, S * 0.004, 4)}" fill="${blk.fill}"/>`;
  },

  // A slanted parallelogram bar in the key colour (art.json shape.parallelogram), label in paper/ground.
  cta(ctx, b, label, f) {
    const { pal, esc, fit, contrast } = ctx;
    const ink = ctx.media ? pal.onGround : plates(ctx).key;
    const ft = fit(label, b.w * 0.78, b.h * 0.5, f, { max: Math.min(ctx.W, ctx.H) * 0.032, min: 12, maxLines: 1 });
    const bh = ft.size * 2.2, slant = bh * 0.27;
    const bw = Math.min(b.w, ft.width + ft.size * 2.2 + slant);
    const x = b.x, y = b.y + (b.h - bh) / 2, rr = Math.max(1.5, bh * 0.06);
    const tc = ctx.readableOn(ink, [pal.ground, pal.white, pal.black].filter((h) => contrast(h, ink) >= 4.5).concat([pal.white, pal.black]));
    return `<path d="M ${r1(x + slant)} ${r1(y)} H ${r1(x + bw)} L ${r1(x + bw - slant)} ${r1(y + bh)} H ${r1(x)} Z" fill="${ink}" stroke="${ink}" stroke-width="${r1(rr * 2)}" stroke-linejoin="round"/>` +
      `<text x="${r1(x + bw / 2)}" y="${r1(y + bh / 2 + ft.size * 0.35)}" text-anchor="middle" font-family="'${esc(f.family)}', sans-serif" font-weight="${f.weight}" font-size="${r1(ft.size)}" letter-spacing="${r1(f.tracking * ft.size)}" fill="${tc}">${esc(ft.lines.join(' '))}</text>`;
  },

  // Carousel: one structural key line runs along the foot of every slide at the same height, entering
  // and leaving at the edges; a sparkle travels along it to show progress, a label counts the slides.
  series(ctx, s) {
    const { W, H, pal } = ctx;
    const S = Math.min(W, H);
    const key = ctx.media ? pal.onGround : plates(ctx).key;
    const y = H * 0.955;
    const t = s.of > 1 ? (s.index - 1) / (s.of - 1) : 0;
    const sx = W * (0.12 + 0.76 * t);
    return `<path d="M -10 ${r1(y)} H ${r1(W + 10)}" stroke="${key}" stroke-width="${r1(Math.max(2, S * 0.007))}"/>` +
      `<path d="${star(sx, y, S * 0.03, S * 0.008, 4)}" fill="${key}"/>` +
      `<text x="${r1(W * 0.92)}" y="${r1(H * 0.06)}" text-anchor="end" font-family="'${ctx.fam.display}', sans-serif" font-weight="700" font-size="${r1(S * 0.022)}" letter-spacing="${r1(S * 0.022 * 0.18)}" fill="${pal.onGround}">${s.index} / ${s.of}</text>`;
  },
};
