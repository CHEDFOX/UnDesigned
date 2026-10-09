// Plutto's own motifs for the design engine (tools/design/engine.mjs). The brand's signature elements,
// drawn precisely: the orb (as app/globals.css builds it; a recorded brand exception, identity.json),
// natal wheel, the five traditions' charts, the voice wave, the planet photo and the app icon.
// The style (Negative Space) decides placement and scale; these only draw the object into a box.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
const typo = json(join(HERE, '../../dist/plutto/tokens/typography.json'));
let C = { ground: '#111314', text: '#ffffff', ink: '#ffffff', accent: '#cab356' };
const SERIF = typo.pairing.display.family; // Instrument Serif
const SANS = typo.pairing.body.family;     // Instrument Sans
const MONO = 'IBM Plex Mono';              // the pairing's mono (dist/plutto/web/css/typography.css)
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&amp;family=Instrument+Sans:wght@400;500;600&amp;family=IBM+Plex+Mono&amp;family=Noto+Sans+Symbols&amp;family=Cormorant+Garamond:wght@500&amp;family=Inter:wght@400&amp;display=swap';
const FAMILY = {
  serif: `font-family="'${SERIF}', Georgia, serif"`,
  serifItalic: `font-family="'${SERIF}', Georgia, serif" font-style="italic"`,
  sans: `font-family="'${SANS}', system-ui, sans-serif"`,
  sansMedium: `font-family="'${SANS}', system-ui, sans-serif" font-weight="500"`,
  sansBold: `font-family="'${SANS}', system-ui, sans-serif" font-weight="600"`,
  mono: `font-family="'${MONO}', ui-monospace, monospace"`,
  symbols: `font-family="'Noto Sans Symbols', sans-serif"`,
};
const METRICS = json(join(HERE, 'assets/font-metrics.json'));

// The brand's own orb colours (app/globals.css). A brand element, allowed despite the style's no-gradient
// default (identity.json -> signals.signatureElements.orb). Gold appears nowhere else.
const ORB = {
  body: [['0', '#f4d98a'], ['0.22', '#d9ac4a'], ['0.46', '#a87a26'], ['0.70', '#5a3f12'], ['0.90', '#1a1006'], ['1', '#060401']],
  gold: '#D4AF37',
};

// ------------------------------------------------------------------ original marks (unchanged)

const WORDMARK_SRC = readFileSync(join(HERE, 'assets/logos/plutto-wordmark.svg'), 'utf8');
const WORDMARK_TEXT = WORDMARK_SRC.match(/<text[\s\S]*?<\/text>/g).join('');
const WORDMARK_VB = WORDMARK_SRC.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number); // 0 0 154 39
const ICON_SRC = readFileSync(join(HERE, 'assets/logos/plutto-app-icon.svg'), 'utf8');
const ICON_INNER = ICON_SRC.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();

// The site's lockup, scaled as one unit. h = rendered height; returns svg and box.
function wordmark(x, y, h) {
  const s = h / WORDMARK_VB[3];
  const w = WORDMARK_VB[2] * s;
  return { svg: `<svg x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" viewBox="${WORDMARK_VB.join(' ')}" overflow="visible" aria-label="Plutto, an astrology oracle">${WORDMARK_TEXT}</svg>`, box: { x, y, w, h } };
}
function appIcon(x, y, size) {
  return { svg: `<svg x="${r1(x)}" y="${r1(y)}" width="${r1(size)}" height="${r1(size)}" viewBox="0 0 64 64" aria-label="Plutto app icon">${ICON_INNER}</svg>`, box: { x, y, w: size, h: size } };
}

// ------------------------------------------------------------------ text

const r1 = (n) => Math.round(n * 10) / 10;
const esc = (s) => String(s ?? '').replace(/(\w)'(\w)/g, '$1’$2').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const VS = '︎'; // text presentation: astrological signs never fall back to colour emoji

function textWidth(s, face, size, track = 0) {
  const adv = METRICS[face].adv;
  let w = 0;
  for (const ch of s) w += adv[ch] ?? (METRICS[face].adv.n ?? 0.5);
  return w * size + track * [...s].length;
}
function wrap(text, face, size, maxW, track = 0) {
  const lines = [];
  for (const w of String(text).trim().split(/\s+/)) {
    const last = lines[lines.length - 1];
    if (last !== undefined && textWidth(`${last} ${w}`, face, size, track) <= maxW) lines[lines.length - 1] = `${last} ${w}`;
    else lines.push(w);
  }
  return lines;
}
// Fewest lines, then the narrowest measure that keeps that count: even lines, no lone last word.
function balance(text, face, size, maxW, track = 0) {
  const n = wrap(text, face, size, maxW, track).length;
  if (n === 1) return [String(text).trim()];
  let w = maxW, best = wrap(text, face, size, maxW, track);
  while (w > maxW * 0.4) {
    w -= size * 0.25;
    const t = wrap(text, face, size, w, track);
    if (t.length !== n) break;
    best = t;
  }
  return best;
}
// Lines at sentence ends when every sentence fits.
function sentenceLines(text, face, size, maxW) {
  const parts = String(text).match(/[^.:?]+[.:?]?/g).map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1 && parts.every((p) => textWidth(p, face, size) <= maxW)) return parts;
  return balance(text, face, size, maxW);
}

// A block of text. y is the top of the capitals of the first line. Returns svg, box, last baseline, bottom.
function text(lines, { x, y, size, face = 'sans', lead = 1.3, fill = C.text, opacity = 1, anchor = 'start', track = 0, cls = '' }) {
  if (typeof lines === 'string') lines = [lines];
  const cap = METRICS[face].capHeight * size;
  const base0 = y + cap;
  const L = size * lead;
  const svg = lines.map((l, i) => `<text x="${r1(x)}" y="${r1(base0 + i * L)}" ${FAMILY[face]} font-size="${r1(size)}"${track ? ` letter-spacing="${r1(track)}"` : ''}${anchor !== 'start' ? ` text-anchor="${anchor}"` : ''} fill="${fill}"${opacity < 1 ? ` fill-opacity="${opacity}"` : ''}>${esc(l)}</text>`).join('');
  const w = Math.max(...lines.map((l) => textWidth(l, face, size, track)));
  const bx = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
  const last = base0 + (lines.length - 1) * L;
  const box = { x: bx, y, w, h: last - y + size * 0.22 };
  const g = cls ? `<g class="${cls}">${svg}</g>` : svg;
  return { svg: g, box, last, bottom: last + size * 0.22, lines };
}
// Small spaced capitals, the brand's label voice (0.32em; identity.json -> signatureElements.spaced-caps).
const caps = (s, o) => text(String(s).toUpperCase(), { face: 'sansMedium', track: o.size * 0.32, ...o });

// A pill button outlined in ink (art.json corners.use.button).
function pill(label, { x, y, size, h, anchor = 'start', cls = '' }) {
  const tw = textWidth(label, 'sansMedium', size, size * 0.04);
  const w = tw + h * 1.1;
  const x0 = anchor === 'end' ? x - w : x;
  const capH = METRICS.sansMedium.capHeight * size;
  const svg = `<g${cls ? ` class="${cls}"` : ''}><rect x="${r1(x0)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${r1(h / 2)}" fill="none" stroke="${C.ink}" stroke-width="${r1(Math.max(1.5, h / 30))}"/><text x="${r1(x0 + w / 2)}" y="${r1(y + h / 2 + capH / 2)}" ${FAMILY.sansMedium} font-size="${r1(size)}" letter-spacing="${r1(size * 0.04)}" text-anchor="middle" fill="${C.text}">${esc(label)}</text></g>`;
  return { svg, box: { x: x0, y, w, h } };
}

// ------------------------------------------------------------------ the orb (app/globals.css, faithfully)

// Five layers as the site builds them: halo (blurred bloom, 1.6x), body (radial stops at 50% 52%, farthest
// corner, two inset shadows and an outer glow), specular (34% 28%, screen), rim (conic highlight masked to a
// hairline ring at 49.6-50% of the farthest-corner radius) and shimmer (70% 60%, screen). Shadow sizes are
// relative to the site's small orb (260 px). opts.cls / bodyCls let motion pieces animate halo and body.
function orb(id, cx, cy, r, { halo = true, haloCls = '', bodyCls = '', groupCls = '', label = '' } = {}) {
  const D = 2 * r, k = D / 260, x0 = cx - r, y0 = cy - r;
  const stops = (list) => list.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a < 1 ? ` stop-opacity="${a}"` : ''}/>`).join('');
  const defs = `<defs>
<radialGradient id="${id}-halo" cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(0.8 * D)}" gradientUnits="userSpaceOnUse">${stops([['0', ORB.gold, 0.22], ['0.65', ORB.gold, 0]])}</radialGradient>
<filter id="${id}-blur" x="${r1(cx - 1.4 * D)}" y="${r1(cy - 1.4 * D)}" width="${r1(2.8 * D)}" height="${r1(2.8 * D)}" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="${r1(28 * k)}"/></filter>
<radialGradient id="${id}-body" cx="${r1(cx)}" cy="${r1(y0 + 0.52 * D)}" r="${r1(0.7214 * D)}" gradientUnits="userSpaceOnUse">${stops(ORB.body)}</radialGradient>
<filter id="${id}-shade" x="${r1(cx - 1.2 * D)}" y="${r1(cy - 1.2 * D)}" width="${r1(2.4 * D)}" height="${r1(2.4 * D)}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feComponentTransfer in="SourceAlpha" result="inv"><feFuncA type="table" tableValues="1 0"/></feComponentTransfer>
<feOffset in="inv" dx="${r1(-28 * k)}" dy="${r1(-52 * k)}" result="o1"/><feGaussianBlur in="o1" stdDeviation="${r1(39 * k)}" result="b1"/>
<feFlood flood-color="#000000" flood-opacity="0.6"/><feComposite in2="b1" operator="in"/><feComposite in2="SourceAlpha" operator="in" result="s1"/>
<feOffset in="inv" dx="${r1(18 * k)}" dy="${r1(22 * k)}" result="o2"/><feGaussianBlur in="o2" stdDeviation="${r1(30 * k)}" result="b2"/>
<feFlood flood-color="rgb(255,232,178)" flood-opacity="0.18"/><feComposite in2="b2" operator="in"/><feComposite in2="SourceAlpha" operator="in" result="s2"/>
<feGaussianBlur in="SourceAlpha" stdDeviation="${r1(30 * k)}" result="g"/><feFlood flood-color="${ORB.gold}" flood-opacity="0.18"/><feComposite in2="g" operator="in" result="glow"/>
<feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/><feMergeNode in="s1"/><feMergeNode in="s2"/></feMerge></filter>
<radialGradient id="${id}-spec" cx="${r1(x0 + 0.34 * D)}" cy="${r1(y0 + 0.28 * D)}" r="${r1(0.977 * D)}" gradientUnits="userSpaceOnUse">${stops([['0', '#fffadc', 0.55], ['0.14', '#fffadc', 0.18], ['0.38', '#fffadc', 0]])}</radialGradient>
<radialGradient id="${id}-shim" cx="${r1(x0 + 0.7 * D)}" cy="${r1(y0 + 0.6 * D)}" r="${r1(0.922 * D)}" gradientUnits="userSpaceOnUse">${stops([['0', '#ffdc96', 0.16], ['0.35', '#ffdc96', 0]])}</radialGradient>
</defs>`;
  // Rim: conic from 220deg (clockwise from up): 0 -> 0.35 at +80deg -> 0 at +180deg; ring radius 0.704 r.
  const R = 0.7071 * (D + 1) * 0.498, sw = Math.max(0.6, 0.0028 * D);
  let rim = '';
  for (let a = 0; a < 180; a += 3) {
    const mid = a + 1.5, al = mid <= 80 ? 0.35 * mid / 80 : 0.35 * (180 - mid) / 100;
    const t1 = (220 + a) * Math.PI / 180, t2 = (220 + a + 3.2) * Math.PI / 180;
    rim += `<path d="M${r1(cx + R * Math.sin(t1))} ${r1(cy - R * Math.cos(t1))}A${r1(R)} ${r1(R)} 0 0 1 ${r1(cx + R * Math.sin(t2))} ${r1(cy - R * Math.cos(t2))}" stroke="#fff0c8" stroke-opacity="${al.toFixed(3)}" stroke-width="${r1(sw * 10) / 10}" fill="none"/>`;
  }
  const svg = `${defs}<g${groupCls ? ` class="${groupCls}"` : ''}${label ? ` role="img" aria-label="${esc(label)}"` : ' aria-hidden="true"'}>
${halo ? `<circle${haloCls ? ` class="${haloCls}"` : ''} cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(0.8 * D)}" fill="url(#${id}-halo)" filter="url(#${id}-blur)"/>` : ''}
<g${bodyCls ? ` class="${bodyCls}"` : ''}><circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="url(#${id}-body)" filter="url(#${id}-shade)"/>
<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="url(#${id}-spec)" style="mix-blend-mode:screen"/>
<g>${rim}</g>
<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="url(#${id}-shim)" style="mix-blend-mode:screen"/></g></g>`;
  return { svg, box: { x: cx - r, y: cy - r, w: D, h: D }, haloR: 0.8 * D };
}

// ------------------------------------------------------------------ chart drawings (white hairlines)

const ZODIAC = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const rad = (d) => (d * Math.PI) / 180;
const W = (o) => `stroke="${C.ink}" stroke-opacity="${o}"`;

// Natal wheel, after the site's NatalWheel.js (rings 198/168/110/70), made precise: degree ticks (1, 5, 10),
// sign glyphs, houses from the ascendant (equal or given cusps, anticlockwise from 9 o'clock), ASC-DSC axis,
// optional planets. Longitude l is drawn at screen angle 180 + (l - asc), anticlockwise.
function natalWheel(cx, cy, R, { asc = 0, cusps = null, planets = [], faint = false, ringCls = '', showHouseNums = true, ascLabel = true, signOpacity } = {}) {
  const rZ = R * 168 / 198, rH = R * 110 / 198, rI = R * 70 / 198;
  const om = faint ? 0.2 : 0.55, of = faint ? 0.1 : 0.28, og = signOpacity ?? (faint ? 0.32 : 0.85), oh = faint ? 0.22 : 0.6;
  const P = (l, r) => { const a = rad(180 + (l - asc)); return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; };
  const sw = Math.max(0.6, R / 330);
  let ring = '';
  // zodiac boundaries, ticks, glyphs (the ring that turns in motion-wheel)
  for (let d = 0; d < 360; d++) {
    const len = d % 30 === 0 ? R - rZ : d % 10 === 0 ? R * 0.06 : d % 5 === 0 ? R * 0.042 : R * 0.022;
    const o = d % 30 === 0 ? of * 1.3 : d % 5 === 0 ? of * 1.2 : of;
    const [x1, y1] = P(d, rZ), [x2, y2] = P(d, rZ + len);
    ring += `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" ${W(o)} stroke-width="${r1(d % 30 === 0 ? sw : sw * 0.8)}"/>`;
  }
  const gs = R * 0.078;
  for (let i = 0; i < 12; i++) {
    const [x, y] = P(15 + i * 30, rZ + (R - rZ) * 0.6);
    ring += `<text x="${r1(x)}" y="${r1(y)}" ${FAMILY.symbols} font-size="${r1(gs)}" text-anchor="middle" dominant-baseline="central" fill="${C.text}" fill-opacity="${og}">${ZODIAC[i]}${VS}</text>`;
  }
  ring = `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(R)}" fill="none" ${W(om)} stroke-width="${r1(sw * 1.2)}"/><circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(rZ)}" fill="none" ${W(of * 1.4)} stroke-width="${r1(sw)}"/>${ring}`;
  // houses
  const cs = cusps || Array.from({ length: 12 }, (_, i) => asc + i * 30);
  let houses = `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(rH)}" fill="none" ${W(of * 1.4)} stroke-width="${r1(sw)}"/><circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(rI)}" fill="none" ${W(of * 1.4)} stroke-width="${r1(sw)}"/>`;
  cs.forEach((c, i) => {
    const axis = i === 0 || i === 6 || i === 3 || i === 9;
    const [x1, y1] = P(c, axis ? rI * 0.0 + rI : rI), [x2, y2] = P(c, axis ? rZ : rH);
    houses += `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" ${W(axis ? om : of * 1.3)} stroke-width="${r1(axis ? sw * 1.3 : sw)}"/>`;
    if (showHouseNums) {
      const next = cs[(i + 1) % 12] + (i === 11 ? 360 : 0);
      const [x, y] = P((c + next) / 2, (rH + rI) / 2);
      houses += `<text x="${r1(x)}" y="${r1(y)}" ${FAMILY.sans} font-size="${r1(R * 0.052)}" text-anchor="middle" dominant-baseline="central" fill="${C.text}" fill-opacity="${oh}">${i + 1}</text>`;
    }
  });
  if (ascLabel) {
    const [x, y] = P(asc, R + R * 0.05);
    houses += `<text x="${r1(x)}" y="${r1(y)}" ${FAMILY.mono} font-size="${r1(Math.max(12, R * 0.045))}" letter-spacing="1" text-anchor="end" dominant-baseline="central" fill="${C.text}" fill-opacity="0.7">ASC</text>`;
  }
  // planets: glyph in the planet band, tick on the zodiac ring, degree in mono
  let pl = '';
  for (const p of planets) {
    const [tx1, ty1] = P(p.l, rZ), [tx2, ty2] = P(p.l, rZ - R * 0.035);
    const [gx, gy] = P(p.l + (p.nudge || 0), rZ - R * 0.12);
    const [dx, dy] = P(p.l + (p.nudge || 0), rZ - R * 0.215);
    const deg = Math.floor(p.l % 30), min = Math.round(((p.l % 30) - deg) * 60);
    pl += `<line x1="${r1(tx1)}" y1="${r1(ty1)}" x2="${r1(tx2)}" y2="${r1(ty2)}" ${W(0.8)} stroke-width="${r1(sw * 1.2)}"/>`
      + `<text x="${r1(gx)}" y="${r1(gy)}" ${FAMILY.symbols} font-size="${r1(R * 0.07)}" text-anchor="middle" dominant-baseline="central" fill="${C.text}" fill-opacity="0.9">${p.g}${VS}</text>`
      + `<text x="${r1(dx)}" y="${r1(dy)}" ${FAMILY.mono} font-size="${r1(R * 0.036)}" text-anchor="middle" dominant-baseline="central" fill="${C.text}" fill-opacity="0.6">${deg}°${String(min).padStart(2, '0')}′</text>`;
  }
  return `<g aria-hidden="true"><g${ringCls ? ` class="${ringCls}"` : ''}>${ring}</g>${houses}${pl}</g>`;
}

// North Indian (Vedic) chart: a square, its diagonals and the inner diamond make 12 houses; house 1 (the
// lagna) is the top diamond, houses run anticlockwise. Sign numbers sit in each house.
function vedicChart(x0, y0, S, { lagnaSign = 5 } = {}) {
  const L = (a, b, c, d, o = 0.55) => `<line x1="${r1(x0 + a)}" y1="${r1(y0 + b)}" x2="${r1(x0 + c)}" y2="${r1(y0 + d)}" ${W(o)} stroke-width="1.4"/>`;
  let s = `<rect x="${r1(x0)}" y="${r1(y0)}" width="${r1(S)}" height="${r1(S)}" fill="none" ${W(0.55)} stroke-width="1.4"/>`;
  s += L(0, 0, S, S) + L(S, 0, 0, S) + L(S / 2, 0, S, S / 2) + L(S, S / 2, S / 2, S) + L(S / 2, S, 0, S / 2) + L(0, S / 2, S / 2, 0);
  const c = [[.5, .25], [.25, 1 / 12], [1 / 12, .25], [.25, .5], [1 / 12, .75], [.25, 11 / 12], [.5, .75], [.75, 11 / 12], [11 / 12, .75], [.75, .5], [11 / 12, .25], [.75, 1 / 12]];
  // sign number near the inner point of each house (the traditional place), house 1 holds the orb
  const numPos = [[.5, .43], [.25, .165], [.165, .25], [.43, .5], [.165, .75], [.25, .835], [.5, .57], [.75, .835], [.835, .75], [.57, .5], [.835, .25], [.75, .165]];
  numPos.forEach(([u, v], i) => {
    const sign = ((lagnaSign - 1 + i) % 12) + 1;
    s += `<text x="${r1(x0 + u * S)}" y="${r1(y0 + v * S)}" ${FAMILY.mono} font-size="${r1(S * 0.036)}" text-anchor="middle" dominant-baseline="central" fill="${C.text}" fill-opacity="0.7">${sign}</text>`;
  });
  c.forEach(([u, v], i) => {
    if (i === 0) return;
    s += `<text x="${r1(x0 + u * S)}" y="${r1(y0 + v * S + (v < 0.5 ? -0 : 0))}" ${FAMILY.sans} font-size="${r1(S * 0.03)}" text-anchor="middle" dominant-baseline="central" fill="${C.text}" fill-opacity="0.42">${['', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][i]}</text>`;
  });
  return { svg: `<g aria-hidden="true">${s}</g>`, house1: [x0 + 0.5 * S, y0 + 0.25 * S] };
}

// The five elements (wu xing): generating cycle on the circle (clockwise: wood, fire, earth, metal, water),
// controlling cycle as the inner star (dashed).
function fiveElements(cx, cy, rho, id) {
  const names = ['Fire', 'Earth', 'Metal', 'Water', 'Wood'];
  const ang = [90, 18, -54, -126, 162];
  const pt = (a, r = rho) => [cx + r * Math.cos(rad(a)), cy - r * Math.sin(rad(a))];
  const nodeR = rho * 0.055;
  let s = `<defs><marker id="${id}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="${r1(rho / 28)}" markerHeight="${r1(rho / 28)}" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0 1 L9 5 L0 9" fill="none" stroke="${C.ink}" stroke-opacity="0.7" stroke-width="1.2"/></marker></defs>`;
  // generating arcs between consecutive nodes (clockwise on screen = decreasing angle)
  const gap = 10; // degrees kept clear around each node
  for (let i = 0; i < 5; i++) {
    const a1 = ang[(i + 4) % 5] , a2 = ang[i]; // wood->fire, fire->earth ... (from previous to this)
    let from = a1 - gap, to = a2 + gap;
    if (to > from) to -= 360;
    const [x1, y1] = pt(from), [x2, y2] = pt(to);
    s += `<path d="M${r1(x1)} ${r1(y1)}A${r1(rho)} ${r1(rho)} 0 0 1 ${r1(x2)} ${r1(y2)}" fill="none" ${W(0.6)} stroke-width="1.5" marker-end="url(#${id}-arrow)"/>`;
  }
  // controlling star: wood->earth, earth->water, water->fire, fire->metal, metal->wood
  const ctrl = [[4, 1], [1, 3], [3, 0], [0, 2], [2, 4]];
  for (const [a, b] of ctrl) {
    const [x1, y1] = pt(ang[a]), [x2, y2] = pt(ang[b]);
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), u = (nodeR * 2.4) / len;
    s += `<line x1="${r1(x1 + dx * u)}" y1="${r1(y1 + dy * u)}" x2="${r1(x2 - dx * u)}" y2="${r1(y2 - dy * u)}" ${W(0.32)} stroke-width="1.1" stroke-dasharray="5 7" marker-end="url(#${id}-arrow)"/>`;
  }
  names.forEach((n, i) => {
    const [x, y] = pt(ang[i]);
    s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(nodeR)}" fill="${C.ground}" ${W(0.85)} stroke-width="1.5"/>`;
    const side = Math.cos(rad(ang[i]));
    const anchor = side > 0.5 ? 'start' : side < -0.5 ? 'end' : 'middle';
    const off = anchor === 'middle' ? rho * 0.15 : nodeR + rho * 0.07;
    const [lx, ly] = anchor === 'middle' ? pt(ang[i], rho + off) : [x + Math.sign(side) * off, y];
    s += `<text x="${r1(lx)}" y="${r1(ly)}" ${FAMILY.sansMedium} font-size="${r1(rho * 0.085)}" letter-spacing="${r1(rho * 0.085 * 0.2)}" text-anchor="${anchor}" dominant-baseline="central" fill="${C.text}" fill-opacity="0.85">${n.toUpperCase()}</text>`;
  });
  return `<g aria-hidden="true">${s}</g>`;
}

// KP: 27 nakshatras of 13°20′, each split into nine sub-lords in Vimshottari proportions (7, 20, 6, 10, 7,
// 18, 16, 19, 17 of 120), starting from the nakshatra's own lord. Sign boundaries marked outside.
const VIM = [['Ke', 7], ['Ve', 20], ['Su', 6], ['Mo', 10], ['Ma', 7], ['Ra', 18], ['Ju', 16], ['Sa', 19], ['Me', 17]];
function kpRing(cx, cy, R, { asc = 0 } = {}) {
  const rIn = R * 0.8, rMid = R * 0.9;
  const P = (l, r) => { const a = rad(180 + (l - asc)); return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; };
  let s = `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(R)}" fill="none" ${W(0.5)} stroke-width="1.3"/><circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(rIn)}" fill="none" ${W(0.5)} stroke-width="1.3"/>`;
  const nak = 360 / 27;
  for (let n = 0; n < 27; n++) {
    const start = n * nak;
    const [x1, y1] = P(start, rIn), [x2, y2] = P(start, R);
    s += `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" ${W(0.6)} stroke-width="1.3"/>`;
    let acc = 0;
    for (let j = 1; j < 9; j++) {
      acc += VIM[(n + j - 1) % 9][1];
      const l = start + nak * acc / 120;
      const [a1, b1] = P(l, rMid), [a2, b2] = P(l, R);
      s += `<line x1="${r1(a1)}" y1="${r1(b1)}" x2="${r1(a2)}" y2="${r1(b2)}" ${W(0.34)} stroke-width="1"/>`;
    }
    const [tx, ty] = P(start + nak / 2, (rIn + rMid) / 2 - R * 0.005);
    s += `<text x="${r1(tx)}" y="${r1(ty)}" ${FAMILY.mono} font-size="${r1(R * 0.04)}" text-anchor="middle" dominant-baseline="central" fill="${C.text}" fill-opacity="0.62">${n + 1}</text>`;
  }
  for (let i = 0; i < 12; i++) {
    const [x1, y1] = P(i * 30, R + R * 0.015), [x2, y2] = P(i * 30, R + R * 0.06);
    s += `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" ${W(0.5)} stroke-width="1.1"/>`;
    const [gx, gy] = P(i * 30 + 15, R + R * 0.075);
    s += `<text x="${r1(gx)}" y="${r1(gy)}" ${FAMILY.symbols} font-size="${r1(R * 0.065)}" text-anchor="middle" dominant-baseline="central" fill="${C.text}" fill-opacity="0.55">${ZODIAC[i]}${VS}</text>`;
  }
  // one nakshatra's nine sub-lords, labelled (Ashwini: Ketu first)
  return `<g aria-hidden="true">${s}</g>`;
}

// A spoken voice, drawn: an envelope of three summed sines (the answer) leaving the orb.
function voiceWave(x1, x2, y, amp, { seed = 1, opacity = 0.6, width = 1.6, decay = true } = {}) {
  let d = '';
  const n = Math.round((x2 - x1) / 2);
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x1 + (x2 - x1) * t;
    const env = (decay ? Math.pow(1 - t, 1.1) : 1) * Math.sin((Math.PI / 2) * Math.min(1, t * 8)) * (0.55 + 0.45 * Math.abs(Math.sin(t * 9.5 + seed)));
    const v = Math.sin(t * 61 + seed) * 0.55 + Math.sin(t * 23.3 + seed * 2) * 0.3 + Math.sin(t * 131 + seed * 3) * 0.15;
    d += `${i ? 'L' : 'M'}${r1(x)} ${r1(y + amp * env * v)}`;
  }
  return `<path d="${d}" fill="none" ${W(opacity)} stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
}
// A recorded question: thin bars like a voice memo.
function voiceBars(x, y, w, h, { seed = 2, opacity = 0.55 } = {}) {
  let s = '';
  const step = 9, n = Math.floor(w / step);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const v = 0.15 + 0.85 * Math.abs(Math.sin(i * 0.9 + seed) * 0.6 + Math.sin(i * 0.37 + seed * 2) * 0.4) * Math.sin(Math.PI * t) ** 0.5;
    const bh = Math.max(4, h * v);
    s += `<rect x="${r1(x + i * step)}" y="${r1(y - bh / 2)}" width="3" height="${r1(bh)}" rx="1.5" fill="${C.ink}" fill-opacity="${opacity}"/>`;
  }
  return s;
}

// ------------------------------------------------------------------ photo (the brand's own image)

const PHOTO = join(HERE, 'assets/images/floating-planet.jpg'); // public/floating-logo.png as JPEG 86%, 1024 px
const PHOTO_URI = `data:image/jpeg;base64,${readFileSync(PHOTO).toString('base64')}`;
// Treatment: the photo is composited with mix-blend-mode lighten over the Wada Black ground, so its pure
// black space becomes the palette's Black and the frame is seamless; the blue rim and stars are untouched.
function photo(id, x, y, size) {
  return `<g aria-label="A dark planet edged with a thin blue rim, in black space" role="img"><rect x="${r1(x)}" y="${r1(y)}" width="${r1(size)}" height="${r1(size)}" fill="${C.ground}"/><image href="${PHOTO_URI}" x="${r1(x)}" y="${r1(y)}" width="${r1(size)}" height="${r1(size)}" preserveAspectRatio="xMidYMid slice" style="mix-blend-mode:lighten"/></g>`;
}

// ------------------------------------------------------------------ svg shell
const SAMPLE = { asc: 137.4, planets: [{ g: '☉', l: 268.2 }, { g: '☽', l: 41.7, nudge: -5 }, { g: '☿', l: 252.9, nudge: -2 }, { g: '♀', l: 301.5 }, { g: '♂', l: 189.3 }, { g: '♃', l: 97.8 }, { g: '♄', l: 352.6 }] };

function use(ctx) {
  const on = ctx.pal.onGround;
  C = { ground: ctx.pal.ground, text: on, ink: on, accent: ctx.pal.accent };
}
const centre = (b) => [b.x + b.w / 2, b.y + b.h / 2, Math.min(b.w, b.h)];
const symDefs = '<style>@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Symbols&amp;family=IBM+Plex+Mono&amp;display=swap");</style>';

export default {
  orb(ctx, b) { use(ctx); const [cx, cy, s] = centre(b); return orb(ctx.P + 'orb', cx, cy, s * 0.2).svg; },
  voice(ctx, b) {
    use(ctx); const [cx, cy, s] = centre(b); const r = s * 0.16;
    return orb(ctx.P + 'orb', b.x + r * 1.6, cy, r).svg + voiceWave(b.x + r * 3, b.x + b.w, cy, r * 0.5, { seed: 3 });
  },
  'natal-wheel'(ctx, b) { use(ctx); const [cx, cy, s] = centre(b); const R = s * 0.46; return symDefs + natalWheel(cx, cy, R, { asc: SAMPLE.asc, planets: SAMPLE.planets }) + orb(ctx.P + 'orb', cx, cy, R * 0.18).svg; },
  western(ctx, b) { use(ctx); const [cx, cy, s] = centre(b); const R = s * 0.46; return symDefs + natalWheel(cx, cy, R, { asc: SAMPLE.asc }) + orb(ctx.P + 'orb', cx, cy, R * 0.16).svg; },
  vedic(ctx, b) { use(ctx); const [cx, cy, s] = centre(b); const S = s * 0.86; return vedicChart(cx - S / 2, cy - S / 2, S) + orb(ctx.P + 'orb', cx, cy - S * 0.25, S * 0.06).svg; },
  elements(ctx, b) { use(ctx); const [cx, cy, s] = centre(b); return fiveElements(cx, cy, s * 0.36, ctx.P + 'el') + orb(ctx.P + 'orb', cx, cy, s * 0.07).svg; },
  kp(ctx, b) { use(ctx); const [cx, cy, s] = centre(b); return symDefs + kpRing(cx, cy, s * 0.44) + orb(ctx.P + 'orb', cx, cy, s * 0.07).svg; },
  planet(ctx, b) { use(ctx); const [cx, cy, s] = centre(b); return photo(ctx.P + 'ph', cx - s / 2, cy - s / 2, s); },
  'app-icon'(ctx, b) { use(ctx); const [cx, cy, s] = centre(b); const z = s * 0.4; return appIcon(cx - z / 2, cy - z / 2, z).svg ?? appIcon(cx - z / 2, cy - z / 2, z); },
};
