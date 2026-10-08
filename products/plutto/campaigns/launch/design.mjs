// Plutto "Launch": every piece of the campaign, drawn from the brand's core (products/plutto/identity.json),
// its original marks (assets/logos/*), its real image (assets/images/floating-planet.png) and the guide:
// Negative Space (approaches/negative-space), Wada 255 dark (dist/plutto/tokens/colors.json), the instrument
// pairing (dist/plutto/tokens/typography.json), the brand's springs (dist/plutto/web/css/motion.css), the media
// rules (foundations/layout/media.json, checked with templates/layouts/overlay.mjs) and video.json for motion.
//
//   npm run build -- plutto
//   node products/plutto/campaigns/launch/design.mjs          SVGs, then PNG previews if Playwright is installed
//
// Every id, class and keyframe in a file is prefixed pl2-<piece>- so the hub can inline many SVGs in one page.
// Text widths come from font-metrics.json (measured in Chromium by measure-fonts.mjs).

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { recommendTreatment, contrastRatio } from '../../../../templates/layouts/overlay.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../../../..');
const PRODUCT = join(HERE, '../..');
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
const copy = (name) => json(join(HERE, `${name}.copy.json`));

// ------------------------------------------------------------------ tokens (generated files only)

const colors = json(join(ROOT, 'dist/plutto/tokens/colors.json'));
const typo = json(join(ROOT, 'dist/plutto/tokens/typography.json'));
const hex = Object.fromEntries(colors.colors.map((c) => [c.id, c.hex]));
const roles = colors.brand.find((p) => p.name === 'primary').roles;
const C = { ground: hex[roles.bg], text: hex[roles.text], ink: hex[roles.ink], accent: hex[roles.accent] };
const motionCss = readFileSync(join(ROOT, 'dist/plutto/web/css/motion.css'), 'utf8');
const SETTLE = motionCss.match(/--pl-spring-settle:\s*(linear\([^;]+\));/)[1];
const SETTLE_MS = +motionCss.match(/--pl-spring-settle-duration:\s*(\d+)ms/)[1];
const STILL = motionCss.match(/--pl-spring-still:\s*(linear\([^;]+\));/)[1];
const STILL_MS = +motionCss.match(/--pl-spring-still-duration:\s*(\d+)ms/)[1];
const DRIFT = motionCss.match(/--pl-ease-drift:\s*([^;]+);/)[1];
const FADE = motionCss.match(/--pl-ease-fade:\s*([^;]+);/)[1];

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
const METRICS = json(join(HERE, 'font-metrics.json'));

// The brand's own orb colours (app/globals.css). A brand element, allowed despite the style's no-gradient
// default (identity.json -> signals.signatureElements.orb). Gold appears nowhere else.
const ORB = {
  body: [['0', '#f4d98a'], ['0.22', '#d9ac4a'], ['0.46', '#a87a26'], ['0.70', '#5a3f12'], ['0.90', '#1a1006'], ['1', '#060401']],
  gold: '#D4AF37',
};

// ------------------------------------------------------------------ original marks (unchanged)

const WORDMARK_SRC = readFileSync(join(PRODUCT, 'assets/logos/plutto-wordmark.svg'), 'utf8');
const WORDMARK_TEXT = WORDMARK_SRC.match(/<text[\s\S]*?<\/text>/g).join('');
const WORDMARK_VB = WORDMARK_SRC.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number); // 0 0 154 39
const ICON_SRC = readFileSync(join(PRODUCT, 'assets/logos/plutto-app-icon.svg'), 'utf8');
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

const PHOTO = join(HERE, 'media/floating-planet.jpg'); // public/floating-logo.png as JPEG 86%, 1024 px
const PHOTO_URI = `data:image/jpeg;base64,${readFileSync(PHOTO).toString('base64')}`;
// Treatment: the photo is composited with mix-blend-mode lighten over the Wada Black ground, so its pure
// black space becomes the palette's Black and the frame is seamless; the blue rim and stars are untouched.
function photo(id, x, y, size) {
  return `<g aria-label="A dark planet edged with a thin blue rim, in black space" role="img"><rect x="${r1(x)}" y="${r1(y)}" width="${r1(size)}" height="${r1(size)}" fill="${C.ground}"/><image href="${PHOTO_URI}" x="${r1(x)}" y="${r1(y)}" width="${r1(size)}" height="${r1(size)}" preserveAspectRatio="xMidYMid slice" style="mix-blend-mode:lighten"/></g>`;
}

// ------------------------------------------------------------------ svg shell

const PIECES = [];
function svgDoc(name, w, h, body, { title, desc, css = '' } = {}) {
  const P = `pl2-${name}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="${P}-title ${P}-desc">
<title id="${P}-title">${esc(title)}</title><desc id="${P}-desc">${esc(desc)}</desc>
<style>@import url("${FONT_URL}");${css}</style>
<rect width="${w}" height="${h}" fill="${C.ground}"/>
${body}
</svg>
`;
}
function save(name, dir, w, h, body, meta) {
  const out = svgDoc(name, w, h, body, meta);
  mkdirSync(join(HERE, dir), { recursive: true });
  writeFileSync(join(HERE, dir, `${name}.svg`), out);
  PIECES.push({ name, dir, w, h, boxes: meta.boxes || [], safe: meta.safe, anim: meta.anim, photoCheck: meta.photoCheck, preview: meta.preview });
}

// ================================================================== pieces

// ---------- Ask the sky #1: the voice (4:5). Composition: dialogue, object facing in (orb low left, its voice
// travelling right). Finding: gaze/direction cue (inward bias, Palmer et al. 2008) and words + picture (W5).
{
  const name = 'post-ask-voice', c = copy(name), w = 1080, h = 1350, m = 108, P = `pl2-${name}`;
  const wm = wordmark(m, 100, 56);
  const lab = caps(c.details, { x: m, y: 268, size: 18, fill: C.text, opacity: 0.6 });
  const q = text(balance(c.headline, 'serifItalic', 78, 820), { x: m, y: lab.bottom + 30, size: 78, face: 'serifItalic', lead: 1.08 });
  const bars = voiceBars(m, q.bottom + 64, 360, 46, { seed: 3, opacity: 0.5 });
  const o = orb(`${P}-orb`, 236, 840, 66);
  const wave = voiceWave(330, 972, 840, 46, { seed: 1.2, opacity: 0.62 });
  const a = text(balance(c.subhead, 'serif', 48, 760), { x: m, y: 968, size: 48, face: 'serif', lead: 1.18 });
  const cta = text(c.cta, { x: m, y: 1214, size: 30, face: 'sansMedium', opacity: 0.85 });
  save(name, 'social', w, h, [wm.svg, lab.svg, q.svg, bars, o.svg, wave, a.svg, cta.svg].join('\n'), {
    title: 'Plutto: why do I keep starting over?', desc: 'An example question in italic with a voice-memo waveform, and the gold orb low left whose voice travels right toward the answer.',
    boxes: [wm.box, lab.box, q.box, a.box, cta.box] });
}

// ---------- Ask the sky #2: the question as the object (1:1). Composition: type-led. Finding: pop-out by
// isolation; the question is the only large mark, the orb waits on the far side (picture-captures).
{
  const name = 'post-question', c = copy(name), w = 1080, h = 1080, m = 108, P = `pl2-${name}`;
  const q = text(balance(c.headline, 'serifItalic', 96, 640), { x: m, y: 250, size: 96, face: 'serifItalic', lead: 1.04 });
  const o = orb(`${P}-orb`, 880, q.last - 30, 46);
  const sub = text(c.subhead, { x: m, y: q.bottom + 56, size: 38, face: 'serif' });
  const wm = wordmark(m, 880, 62);
  const cta = text(c.cta, { x: w - m, y: 902, size: 30, face: 'sansMedium', anchor: 'end', opacity: 0.85 });
  save(name, 'social', w, h, [q.svg, o.svg, sub.svg, wm.svg, cta.svg].join('\n'), {
    title: 'Plutto: what is this year asking of me?', desc: 'A large italic question set on the left margin; a small gold orb waits to its right.', boxes: [q.box, sub.box, wm.box, cta.box] });
}

// ---------- Not twelve boxes #1 (4:5). Composition: two masses, tension across the field (the twelve boxes
// small at the top, the orb free in the open ground). Finding: pop-out (isolation + colour), NS1 space = freedom.
{
  const name = 'post-twelve-boxes', c = copy(name), w = 1080, h = 1350, m = 108, P = `pl2-${name}`;
  let boxes = '';
  const bw = 60, gap = (w - 2 * m - 12 * bw) / 11;
  for (let i = 0; i < 12; i++) {
    const x = m + i * (bw + gap);
    boxes += `<rect x="${r1(x)}" y="120" width="${bw}" height="${bw}" fill="none" ${W(0.42)} stroke-width="1.3"/><text x="${r1(x + bw / 2)}" y="150" ${FAMILY.symbols} font-size="26" text-anchor="middle" dominant-baseline="central" fill="${C.text}" fill-opacity="0.6">${ZODIAC[i]}${VS}</text>`;
  }
  const hd = text(sentenceLines(c.headline, 'serif', 76, 700), { x: m, y: 330, size: 76, face: 'serif', lead: 1.06 });
  const wm = wordmark(m, hd.bottom + 34, 56);
  const sub = text(balance(c.subhead, 'serif', 38, 560), { x: m, y: wm.box.y + 56 + 60, size: 38, face: 'serif', lead: 1.25, opacity: 0.85 });
  const o = orb(`${P}-orb`, 812, 1010, 92);
  const cta = text(c.cta, { x: m, y: 1214, size: 30, face: 'sansMedium', opacity: 0.85 });
  save(name, 'social', w, h, [`<g aria-hidden="true">${boxes}</g>`, hd.svg, wm.svg, sub.svg, o.svg, cta.svg].join('\n'), {
    title: 'Plutto: you were never one of twelve', desc: 'Twelve small boxes with the zodiac signs in a row at the top; far below, the gold orb alone in open space.',
    boxes: [{ x: m, y: 120, w: w - 2 * m, h: 60 }, hd.box, wm.box, sub.box, cta.box] });
}

// ---------- Not twelve boxes #2: the natal wheel (1:1). Composition: single focal at the optical centre, words
// in a strip on the bottom margin (ns-poster-corner-type). Finding: centre-bias + fluency (precise, symmetric).
const SAMPLE = { asc: 137.4, planets: [{ g: '☉', l: 268.2 }, { g: '☽', l: 41.7, nudge: -5 }, { g: '☿', l: 252.9, nudge: -2 }, { g: '♀', l: 301.5 }, { g: '♂', l: 189.3 }, { g: '♃', l: 97.8 }, { g: '♄', l: 352.6 }] };
{
  const name = 'post-natal-wheel', c = copy(name), w = 1080, h = 1080, m = 108, P = `pl2-${name}`;
  const cx = 540, cy = 446, R = 318;
  const wheel = natalWheel(cx, cy, R, { asc: SAMPLE.asc, planets: SAMPLE.planets });
  const o = orb(`${P}-orb`, cx, cy, 58);
  const lab = caps(c.details, { x: cx + R, y: cy + R + 2, size: 14, anchor: 'end', opacity: 0.6 });
  const hd = text(c.headline, { x: m, y: 846, size: 52, face: 'serif' });
  const sub = text(c.subhead, { x: m, y: hd.bottom + 26, size: 32, face: 'serif', opacity: 0.85 });
  const wm = wordmark(w - m - 154 * 1.25, sub.bottom + 40, 48.75);
  const cta = text(c.cta, { x: m, y: sub.bottom + 58, size: 26, face: 'sansMedium', opacity: 0.85 });
  save(name, 'social', w, h, [wheel, o.svg, lab.svg, hd.svg, sub.svg, wm.svg, cta.svg].join('\n'), {
    title: 'Plutto: drawn for the minute you were born', desc: 'A precise sample natal wheel: zodiac glyphs, degree ticks, twelve houses from the ascendant, seven planets, the gold orb at its centre.',
    boxes: [hd.box, sub.box, wm.box, cta.box] });
}

// ---------- Coming soon #1: the app icon (1:1). Composition: optical centre, corner type. Finding:
// distinctive-assets (the brand's own icon, unchanged) + news (O6).
{
  const name = 'post-coming-soon', c = copy(name), w = 1080, h = 1080, m = 108;
  const ic = appIcon(540 - 108, 300, 216);
  const hd = text(c.headline, { x: m, y: 760, size: 58, face: 'serif' });
  const sub = text(c.subhead, { x: m, y: hd.bottom + 26, size: 34, face: 'serif', opacity: 0.85 });
  const wm = wordmark(m, 924, 48.75);
  const cta = text(c.cta, { x: w - m, y: 944, size: 26, face: 'sansMedium', anchor: 'end', opacity: 0.85 });
  save(name, 'social', w, h, [ic.svg, hd.svg, sub.svg, wm.svg, cta.svg].join('\n'), {
    title: 'Plutto: soon, your chart will talk back', desc: 'The Plutto app icon, a gold ring and dot on black, alone at the optical centre.', boxes: [hd.box, sub.box, wm.box, cta.box] });
}

// ---------- Not twelve boxes #3: photo (4:5). Composition: full-bleed photo, calm region (ns-post-4x5-photo):
// the planet small and low left, the sky holds the words. Finding: real-photos + calm-region + picture-superiority.
{
  const name = 'post-photo', c = copy(name), w = 1080, h = 1350, m = 108, P = `pl2-${name}`;
  const s = 0.56, size = 1024 * s, pcx = 330, pcy = 1336; // planet centre in the photo is about (515, 1010)
  const px = pcx - 515 * s, py = pcy - 1010 * s;
  const ph = photo(P, px, py, size);
  const hd = text(balance(c.headline, 'serif', 78, 760), { x: m, y: 128, size: 78, face: 'serif', lead: 1.06 });
  const wm = wordmark(m, hd.bottom + 32, 56);
  const sub = text(balance(c.subhead, 'serif', 36, 600), { x: m, y: wm.box.y + 56 + 56, size: 36, face: 'serif', lead: 1.25, opacity: 0.85 });
  const cta = text(c.cta, { x: w - m, y: 1214, size: 30, face: 'sansMedium', anchor: 'end', opacity: 0.85 });
  save(name, 'social', w, h, [ph, hd.svg, wm.svg, sub.svg, cta.svg].join('\n'), {
    title: 'Plutto: your birth sky, explained in plain words', desc: 'The brand photograph of a dark planet with a thin blue rim, small and low in the frame; the black sky holds the words.',
    boxes: [hd.box, wm.box, sub.box, cta.box], photoCheck: { x: px, y: py, size, zones: [hd.box, sub.box, cta.box] } });
}

// ---------- The craft #1 (LinkedIn 1:1). Composition: horizon, a full-bleed hairline (one sign's 30 degrees
// at arc-minute precision) with the orb sitting on it; words below. Finding: O5 specific facts, fluency.
{
  const name = 'linkedin-craft', c = copy(name), w = 1080, h = 1080, m = 108, P = `pl2-${name}`;
  const wm = wordmark(m, 100, 56);
  const y = 400, x0 = m, x1 = w - m, per = (x1 - x0) / 30;
  let ruler = `<line x1="0" y1="${y}" x2="${w}" y2="${y}" ${W(0.5)} stroke-width="1.2"/>`;
  for (let i = 0; i <= 180; i++) {
    const d = i / 6, x = x0 + d * per;
    const len = i % 60 === 0 ? 40 : i % 30 === 0 ? 26 : i % 6 === 0 ? 15 : 6;
    ruler += `<line x1="${r1(x)}" y1="${y}" x2="${r1(x)}" y2="${y - len}" ${W(i % 6 === 0 ? 0.6 : 0.3)} stroke-width="1"/>`;
    if (i % 30 === 0) ruler += `<text x="${r1(x)}" y="${y + 34}" ${FAMILY.mono} font-size="16" text-anchor="middle" fill="${C.text}" fill-opacity="0.65">${d}°</text>`;
  }
  ruler += `<text x="${x0 - 34}" y="${y - 30}" ${FAMILY.symbols} font-size="30" text-anchor="middle" dominant-baseline="central" fill="${C.text}" fill-opacity="0.75">${ZODIAC[4]}${VS}</text>`;
  const pos = 17 + 22 / 60, ox = x0 + pos * per;
  const o = orb(`${P}-orb`, ox, y, 30);
  const tag = text('17°22′', { x: ox - 4, y: y - 112, size: 18, face: 'mono', anchor: 'end', opacity: 0.75 });
  tag.svg += `<text x="${r1(ox + 4)}" y="${r1(y - 112 + 13)}" ${FAMILY.symbols} font-size="22" fill="${C.text}" fill-opacity="0.75">${ZODIAC[4]}${VS}</text>`;
  const hd = text(balance(c.headline, 'serif', 60, 760), { x: m, y: 540, size: 60, face: 'serif', lead: 1.08 });
  const sub = text(c.subhead, { x: m, y: hd.bottom + 28, size: 34, face: 'serif', opacity: 0.85 });
  const body = text(balance(c.body, 'sans', 32, 780), { x: m, y: sub.bottom + 40, size: 32, face: 'sans', lead: 1.45, opacity: 0.8 });
  const det = text(c.details, { x: m, y: 972 - 18 * 0.72, size: 18, face: 'mono', opacity: 0.6 });
  const cta = text(c.cta, { x: w - m, y: 972 - 26 * 0.72, size: 26, face: 'sansMedium', anchor: 'end', opacity: 0.85 });
  save(name, 'social', w, h, [wm.svg, `<g aria-hidden="true">${ruler}</g>`, o.svg, tag.svg, hd.svg, sub.svg, body.svg, det.svg, cta.svg].join('\n'), {
    title: 'Plutto: every degree computed with Swiss Ephemeris', desc: 'A hairline ruler of one zodiac sign, thirty degrees in ten-minute ticks, with the gold orb resting at a sample position of 17 degrees 22 minutes Leo.',
    boxes: [wm.box, hd.box, sub.box, body.box, det.box, cta.box] });
}

// ---------- Five lenses carousel (6 x 4:5). Composition: one story across slides: one thread crosses every
// seam and the orb travels along it into each lens. Finding: carousel story (formats.json: first slide hooks,
// last carries the CTA), picture-superiority (each tradition drawn), repetition of a fixed frame.
{
  const name = 'carousel-five-lenses', slides = copy(name), w = 1080, h = 1350, m = 108;
  const ORBS = [[360, 880, 74], [540, 472, 40], [540, 720, 54], [540, 720, 48], [540, 720, 52], [858, 900, 64]];
  const glob = ORBS.map(([x, y], i) => [i * w + x, y]);
  const pts = [[-80, 1000], ...glob, [6 * w + 80, 880]];
  // Catmull-Rom through the orbs -> cubic Bezier
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  slides.forEach((c, i) => {
    const P = `pl2-${name}-${i + 1}`, file = `${name}-${i + 1}`;
    const [ox, oy, or] = ORBS[i];
    let art = '', hole = '';
    if (i === 1) { const v = vedicChart(280, 342, 520); art = v.svg; hole = `<rect x="281" y="343" width="518" height="518" fill="#000"/>`; }
    if (i === 2) { art = natalWheel(540, 720, 292, { asc: 200, cusps: [200, 232, 260, 286, 316, 349, 20, 52, 80, 106, 136, 169], ascLabel: true }); hole = `<circle cx="540" cy="720" r="${292 * 110 / 198}" fill="#000"/>`; }
    if (i === 3) { art = fiveElements(540, 720, 236, P); hole = `<circle cx="540" cy="720" r="236" fill="#000"/>`; }
    if (i === 4) { art = kpRing(540, 720, 270); hole = `<circle cx="540" cy="720" r="${270 * 0.8}" fill="#000"/><circle cx="540" cy="720" r="${270 * 1.12}" fill="#000" fill-opacity="0"/>`; }
    if (i === 5) {
      const letters = [['P', 7], ['L', 3], ['U', 3], ['T', 2], ['T', 2], ['O', 6]];
      const step = 100, x0 = m + 36; // letter centres; P's left side sits on the margin
      letters.forEach(([L, n], j) => {
        art += `<text x="${x0 + j * step}" y="660" ${FAMILY.serif} font-size="104" text-anchor="middle" fill="${C.text}">${L}</text>`;
        art += `<text x="${x0 + j * step}" y="734" ${FAMILY.mono} font-size="28" text-anchor="middle" fill="${C.text}" fill-opacity="0.75">${n}</text>`;
      });
      art += `<line x1="${m}" y1="770" x2="${x0 + 5 * step + 36}" y2="770" ${W(0.5)} stroke-width="1.2"/>`;
      art += `<text x="${m}" y="826" ${FAMILY.mono} font-size="28" fill="${C.text}" fill-opacity="0.75">7+3+3+2+2+6 = 23</text>`;
      art += `<text x="${ox - or - 30}" y="${oy + 10}" ${FAMILY.mono} font-size="28" text-anchor="end" fill="${C.text}" fill-opacity="0.75">2+3 =</text>`;
      hole = `<rect x="${m - 20}" y="560" width="${x0 + 5 * step + 76 - m}" height="300" fill="#000"/><rect x="${ox - or - 140}" y="${oy - 30}" width="120" height="60" fill="#000"/>`;
    }
    const thread = `<defs><mask id="${P}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#fff"/>${hole}</mask></defs><g mask="url(#${P}-mask)"><path d="${d}" transform="translate(${-i * w} 0)" fill="none" ${W(0.4)} stroke-width="1.3"/></g>`;
    const o = orb(`${P}-orb`, ox, oy, or);
    let five = '';
    if (i === 5) five = `<text x="${ox}" y="${oy + 22}" ${FAMILY.serif} font-size="64" text-anchor="middle" fill="${C.ground}">5</text>`;
    const hd = text(sentenceLines(c.headline, 'serif', 64, 820), { x: m, y: 108, size: 64, face: 'serif', lead: 1.08 });
    const wm = wordmark(m, hd.bottom + 26, 46);
    const bodyText = c.body || c.subhead;
    const bt = text(balance(bodyText, 'sans', 32, 740), { x: m, y: 1098, size: 32, face: 'sans', lead: 1.42, opacity: 0.82 });
    const parts = [thread, art, o.svg, five, hd.svg, wm.svg, bt.svg];
    const boxes = [hd.box, wm.box, bt.box];
    if (c.cta) { const cta = text(c.cta, { x: m, y: bt.bottom + 34, size: 28, face: 'sansMedium', opacity: 0.9 }); parts.push(cta.svg); boxes.push(cta.box); }
    const num = text(`${i + 1} / 6`, { x: w - m, y: 1098 + 32 * 0.72 - 18 * 0.72, size: 18, face: 'mono', anchor: 'end', opacity: 0.6 });
    parts.push(num.svg);
    save(file, 'social', w, h, parts.join('\n'), {
      title: `Plutto, five lenses, slide ${i + 1} of 6: ${c.headline}`, desc: ['The gold orb enters on a thread that runs across all six slides.', 'A North Indian Vedic chart; the orb sits in the first house.', 'A Western chart wheel with unequal houses; the orb at its centre.', 'The five elements, wood, fire, earth, metal and water, with the generating circle and the controlling star; the orb at the centre.', 'A KP ring of 27 lunar mansions, each split into nine unequal sub-lords; the orb at the centre.', 'The letters of Plutto with their numbers adding to 23, and the orb carrying the final 5.'][i],
      boxes });
  });
}

// ---------- Stories with a question-sticker zone (9:16). Safe area: top 14%, bottom 35%, sides 6%.
// The sticker is placed in the app; the zone is reserved inside the live band and shown only in the preview.
function stickerGuide(P, x, y, w, h, prompt) {
  return `<g id="${P}-sticker-guide" class="${P}-sticker" display="none"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="30" fill="#ffffff"/><text x="${x + w / 2}" y="${y + 70}" ${FAMILY.sansBold} font-size="30" text-anchor="middle" fill="#111314">${esc(prompt)}</text><rect x="${x + 30}" y="${y + 110}" width="${w - 60}" height="${h - 140}" rx="18" fill="#111314" fill-opacity="0.08"/><text x="${x + w / 2}" y="${y + 110 + (h - 140) / 2 + 10}" ${FAMILY.sans} font-size="26" text-anchor="middle" fill="#111314" fill-opacity="0.5">Type something...</text></g>`;
}
// Ask the sky #3 (story). Composition: stacked in the live band (brand, question, sticker, orb).
// Finding: touch-centre (interaction in the central band), P4 (questions build an owned audience).
{
  const name = 'story-ask', c = copy(name), w = 1080, h = 1920, m = 108, P = `pl2-${name}`;
  const top = 0.14 * h, bottom = 0.65 * h;
  const ic = appIcon(m, top, 84);
  const wm = wordmark(m + 84 + 26, top + 84 / 2 - 30, 60);
  const q = text(balance(c.headline, 'serifItalic', 86, 820), { x: m, y: top + 190, size: 86, face: 'serifItalic', lead: 1.06 });
  const zone = { x: m, y: q.bottom + 90, w: 600, h: 230 };
  const cta = caps(c.cta, { x: m, y: zone.y - 40, size: 18, opacity: 0.7 });
  const o = orb(`${P}-orb`, 540, bottom - 120, 72);
  save(name, 'social', w, h, [ic.svg, wm.svg, q.svg, cta.svg, stickerGuide(P, zone.x, zone.y, zone.w, zone.h, 'Ask Plutto'), o.svg].join('\n'), {
    title: 'Plutto: what would you ask your chart first?', desc: 'Story: the app icon and wordmark, an italic question, a reserved zone for a question sticker, and the gold orb below it.',
    boxes: [ic.box, wm.box, q.box, cta.box, zone, o.box], safe: { top: 14, bottom: 35, side: 6 }, preview: `${P}-sticker-guide` });
}
// Coming soon #2 (story, photo). Composition: full-bleed photo with a low horizon (ns-story-video skeleton).
// Finding: real-photos, calm-region, first-frame.
{
  const name = 'story-planet', c = copy(name), w = 1080, h = 1920, m = 108, P = `pl2-${name}`;
  const top = 0.14 * h;
  const size = 1920, px = (w - size) / 2, py = 1360 - 698 * 1.875; // planet rim at about 71% of the height
  const ph = photo(P, px, py, size);
  const ic = appIcon(m, top, 84);
  const wm = wordmark(m + 84 + 26, top + 84 / 2 - 30, 60);
  const hd = text(balance(c.headline, 'serif', 90, 820), { x: m, y: top + 190, size: 90, face: 'serif', lead: 1.04 });
  const sub = text(c.subhead, { x: m, y: hd.bottom + 50, size: 38, face: 'serif', opacity: 0.85 });
  const zone = { x: m, y: sub.bottom + 50, w: 600, h: 230 };
  const cta = caps(c.cta, { x: m, y: zone.y + zone.h + 50, size: 18, opacity: 0.75 });
  save(name, 'social', w, h, [ph, ic.svg, wm.svg, hd.svg, sub.svg, stickerGuide(P, zone.x, zone.y, zone.w, zone.h, 'Which tradition first?'), cta.svg].join('\n'), {
    title: 'Plutto: soon, the sky answers back', desc: 'Story: the brand photograph of a dark planet with a blue rim low in the frame; above it the headline and a reserved zone for a question sticker.',
    boxes: [ic.box, wm.box, hd.box, sub.box, zone, cta.box], safe: { top: 14, bottom: 35, side: 6 }, preview: `${P}-sticker-guide`,
    photoCheck: { x: px, y: py, size, zones: [hd.box, sub.box, cta.box] } });
}

// ---------- Brand poster (photo). Composition: full-bleed photo, sky as the ground (ns-poster-photo).
// Finding: prestige of empty space (Pracejus et al.), real-photos, calm-region.
{
  const name = 'poster-photo', c = copy(name), w = 1000, h = 1414, m = 100, P = `pl2-${name}`;
  const size = 1414, px = (w - size) / 2, py = 0;
  const ph = photo(P, px, py, size);
  const hd = text(sentenceLines(c.headline, 'serif', 60, 700), { x: m, y: 100, size: 60, face: 'serif', lead: 1.08 });
  const wm = wordmark(m, hd.bottom + 26, 46);
  const sub = text(balance(c.subhead, 'serif', 30, 560), { x: m, y: wm.box.y + 46 + 50, size: 30, face: 'serif', lead: 1.3, opacity: 0.9 });
  const body = text(balance(c.body, 'sans', 20, 540), { x: m, y: sub.bottom + 26, size: 20, face: 'sans', lead: 1.5, opacity: 0.78 });
  const cta = text(c.cta, { x: m, y: body.bottom + 26, size: 20, face: 'sansMedium', opacity: 0.9 });
  save(name, 'print', w, h, [ph, hd.svg, wm.svg, sub.svg, body.svg, cta.svg].join('\n'), {
    title: 'Plutto: we have always asked the sky. Now it answers.', desc: 'Poster: the brand photograph of a dark planet with a thin blue rim at the bottom; the words sit high in the black sky.',
    boxes: [hd.box, wm.box, sub.box, body.box, cta.box], photoCheck: { x: px, y: py, size, zones: [hd.box, sub.box, body.box, cta.box] } });
}

// ---------- Thumbnail (16:9). Composition: split, words on the reading-start side, orb on the far third.
// Finding: left-lean + first-glance (one bright thing). Duration-stamp corner kept clear.
{
  const name = 'thumbnail', c = copy(name), w = 1280, h = 720, m = 72, P = `pl2-${name}`;
  const ic = appIcon(m, m, 96);
  const wm = wordmark(m + 96 + 24, m + 48 - 25, 50);
  const hd = text(balance(c.headline, 'serif', 116, 640), { x: m, y: 300, size: 116, face: 'serif', lead: 1.0 });
  const o = orb(`${P}-orb`, 980, 330, 150);
  save(name, 'web', w, h, [ic.svg, wm.svg, hd.svg, o.svg].join('\n'), {
    title: 'Plutto: talk to your birth chart', desc: 'Thumbnail: the app icon and wordmark, a large serif headline on the left and the glowing gold orb on the right.', boxes: [ic.box, wm.box, hd.box] });
}

// ---------- Web banner (970x250). Composition: strip with wide gaps (ns-banner-strip). Finding: banner-blindness
// (one headline, one brand, one button).
{
  const name = 'web-banner', c = copy(name), w = 970, h = 250, P = `pl2-${name}`;
  const hd = text(c.headline, { x: 32, y: 66, size: 40, face: 'serif' });
  const wm = wordmark(32, 134, 44);
  const o = orb(`${P}-orb`, 640, 125, 40);
  const b = pill(c.cta, { x: 938, y: 100, size: 18, h: 50, anchor: 'end' });
  save(name, 'web', w, h, [hd.svg, wm.svg, o.svg, b.svg].join('\n'), {
    title: 'Plutto: your birth chart, out loud', desc: 'Banner: headline and wordmark on the left, the gold orb in the middle of the open field, an outlined button on the right.', boxes: [hd.box, wm.box, b.box] });
}

// ---------- Landing hero (16:9). Composition: far-side split (ns-hero-wide), the site's signature: the orb in a
// faint wheel. Finding: left-lean, grunt test (S8), text-whitespace.
{
  const name = 'landing-hero', c = copy(name), w = 1440, h = 810, m = 81, P = `pl2-${name}`;
  const wm = wordmark(m, 56, 46);
  const nav = caps('iOS & Android, soon', { x: w - m, y: 72, size: 11, anchor: 'end', opacity: 0.6 });
  const hd = text(balance(c.headline, 'serif', 64, 560), { x: m, y: 250, size: 64, face: 'serif', lead: 1.06 });
  const sub = text(balance(c.subhead, 'sans', 21, 520), { x: m, y: hd.bottom + 36, size: 21, face: 'sans', lead: 1.5, opacity: 0.85 });
  const body = text(balance(c.body, 'sans', 18, 500), { x: m, y: sub.bottom + 22, size: 18, face: 'sans', lead: 1.55, opacity: 0.68 });
  const b = pill(c.cta, { x: m, y: body.bottom + 40, size: 15, h: 50 });
  const cx = 1060, cy = 430;
  const wheel = natalWheel(cx, cy, 262, { asc: 0, faint: true, ascLabel: false });
  const o = orb(`${P}-orb`, cx, cy, 120);
  save(name, 'web', w, h, [wm.svg, nav.svg, hd.svg, sub.svg, body.svg, b.svg, wheel, o.svg].join('\n'), {
    title: 'Plutto: ask your own birth chart, out loud', desc: 'Website hero: wordmark top left, headline, subhead and an outlined button on the left; on the right the gold orb inside a faint natal wheel.',
    boxes: [wm.box, nav.box, hd.box, sub.box, body.box, b.box] });
}

// ================================================================== motion (animated SVG)

// Rules (video.json motionGraphics + Negative Space motion.json): open on the empty ground, one thing moves at
// a time, the brand's settle spring for arrivals, text never moves after landing, reading-time holds
// (max(1.5 s, 0.375 s x words + 0.5 s)), no flashes, end on a still that works as a poster. With
// prefers-reduced-motion the animations are removed and the final frame shows (base styles = final state).
const hold = (words) => Math.max(1500, 375 * words + 500);
const wc = (s) => String(s).trim().split(/\s+/).length;

{
  const name = 'motion-orb-answer', c = copy(name), w = 1080, h = 1920, m = 108, P = `pl2-${name}`;
  const top = 0.14 * h;
  const tOrb = 800, tBreath = tOrb + STILL_MS, tQ = tBreath + 4500, tA = tQ + SETTLE_MS + hold(wc(c.headline)), tBrand = tA + SETTLE_MS + hold(wc(c.subhead));
  const total = tBrand + 900 + hold(wc(c.cta) + 2);
  const o = orb(`${P}-orb`, 540, top + 236, 112, { groupCls: `${P}-orbin`, bodyCls: `${P}-breath`, haloCls: `${P}-breath` });
  const q = text(balance(c.headline, 'serifItalic', 88, 700), { x: m, y: top + 450, size: 88, face: 'serifItalic', lead: 1.04 });
  const wave = voiceWave(m, w - m, q.bottom + 70, 30, { seed: 2.1, opacity: 0.6, width: 1.6 });
  const a = text(balance(c.subhead, 'serif', 56, 760), { x: m, y: q.bottom + 140, size: 56, face: 'serif', lead: 1.14 });
  q.svg = `<g class="${P}-q">${q.svg}</g>`;
  a.svg = `<g class="${P}-a">${wave}${a.svg}</g>`;
  const wm = wordmark(m, a.bottom + 70, 56);
  const cta = text(c.cta, { x: w - m, y: a.bottom + 70 + 20, size: 30, face: 'sansMedium', anchor: 'end', opacity: 0.85 });
  const css = `
.${P}-orbin{animation:${P}-fade ${STILL_MS}ms ${STILL} ${tOrb}ms both}
.${P}-breath{transform-box:fill-box;transform-origin:center;animation:${P}-breathe 4500ms ${DRIFT} ${tBreath}ms both}
.${P}-q{animation:${P}-rise ${SETTLE_MS}ms ${SETTLE} ${tQ}ms both}
.${P}-a{animation:${P}-rise ${SETTLE_MS}ms ${SETTLE} ${tA}ms both}
.${P}-end{animation:${P}-fade 900ms ${FADE} ${tBrand}ms both}
@keyframes ${P}-fade{from{opacity:0}to{opacity:1}}
@keyframes ${P}-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.018)}}
@keyframes ${P}-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@media (prefers-reduced-motion: reduce){.${P}-orbin,.${P}-breath,.${P}-q,.${P}-a,.${P}-end{animation:none}}`;
  save(name, 'motion', w, h, [o.svg, q.svg, a.svg, `<g class="${P}-end">${wm.svg}${cta.svg}</g>`].join('\n'), {
    title: 'Plutto: why does this year feel so slow? (animated)', desc: 'Animated story: the gold orb appears and breathes once, an example question rises in italic, then the answer in roman, then the wordmark and call to action. Ends on a still.',
    css, boxes: [q.box, a.box, wm.box, cta.box], safe: { top: 14, bottom: 35, side: 6 },
    anim: { total, frames: [600, tBreath + 2200, tQ + 1800, tA + 1800, total] } });
}

{
  const name = 'motion-wheel', c = copy(name), w = 1080, h = 1080, m = 108, P = `pl2-${name}`;
  const cx = 540, cy = 432, R = 318;
  const tIn = 800, tTurn = tIn + STILL_MS + 400, turn = 4000, tH = tTurn + turn + 400, tEnd = tH + SETTLE_MS + hold(wc(c.headline) + wc(c.subhead));
  const total = tEnd + 900 + hold(4);
  const wheel = natalWheel(cx, cy, R, { asc: 0, ringCls: `${P}-ring` });
  const o = orb(`${P}-orb`, cx, cy, 58);
  const hd = text(c.headline, { x: m, y: 848, size: 50, face: 'serif', cls: `${P}-h` });
  const sub = text(c.subhead, { x: m, y: hd.bottom + 26, size: 32, face: 'serif', opacity: 0.85, cls: `${P}-h` });
  const wm = wordmark(w - m - 154 * 1.2, sub.bottom + 38, 46.8);
  const cta = text(c.cta, { x: m, y: sub.bottom + 54, size: 26, face: 'sansMedium', opacity: 0.85 });
  const css = `
.${P}-in{animation:${P}-fade ${STILL_MS}ms ${STILL} ${tIn}ms both}
.${P}-ring{transform-origin:${cx}px ${cy}px;transform:rotate(-24deg);animation:${P}-turn ${turn}ms ${DRIFT} ${tTurn}ms both}
.${P}-h{animation:${P}-rise ${SETTLE_MS}ms ${SETTLE} ${tH}ms both}
.${P}-end{animation:${P}-fade 900ms ${FADE} ${tEnd}ms both}
@keyframes ${P}-fade{from{opacity:0}to{opacity:1}}
@keyframes ${P}-turn{from{transform:rotate(0deg)}to{transform:rotate(-24deg)}}
@keyframes ${P}-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@media (prefers-reduced-motion: reduce){.${P}-in,.${P}-ring,.${P}-h,.${P}-end{animation:none}}`;
  save(name, 'motion', w, h, [`<g class="${P}-in">${wheel}${o.svg}</g>`, hd.svg, sub.svg, `<g class="${P}-end">${wm.svg}${cta.svg}</g>`].join('\n'), {
    title: 'Plutto: Western to Vedic, the same sky turned 24 degrees (animated)', desc: 'Animated square: a natal wheel with the gold orb at its centre appears; its sign ring turns 24 degrees from the tropical to the sidereal zodiac; then the headline and the brand. Ends on a still.',
    css, boxes: [hd.box, sub.box, wm.box, cta.box], anim: { total, frames: [600, tTurn + 200, tTurn + turn / 2, tH + 1600, total] } });
}

// ================================================================== checks, previews, contact sheet

const report = [];
for (const p of PIECES) {
  const size = statSync(join(HERE, p.dir, `${p.name}.svg`)).size;
  const issues = [];
  if (size > 400 * 1024) issues.push(`size ${Math.round(size / 1024)} KB`);
  const sa = p.safe ? { l: p.w * p.safe.side / 100, r: p.w * (1 - p.safe.side / 100), t: p.h * p.safe.top / 100, b: p.h * (1 - p.safe.bottom / 100) } : { l: 0, r: p.w, t: 0, b: p.h };
  for (const b of p.boxes) if (b.x < sa.l - 0.5 || b.x + b.w > sa.r + 0.5 || b.y < sa.t - 0.5 || b.y + b.h > sa.b + 0.5) issues.push(`box outside safe area: ${JSON.stringify({ x: r1(b.x), y: r1(b.y), w: r1(b.w), h: r1(b.h) })}`);
  report.push(`${p.dir}/${p.name}.svg  ${Math.round(size / 1024)} KB  ${issues.length ? issues.join('; ') : 'ok'}`);
}
console.log(report.join('\n'));
console.log(`white on Wada Black: ${contrastRatio(C.text, C.ground).toFixed(2)}:1; white at 60% on Black: ${contrastRatio('#a0a1a1', C.ground).toFixed(2)}:1`);

let chromium = null;
try { ({ chromium } = createRequire(import.meta.url)(join(execSync('npm root -g').toString().trim(), 'playwright'))); } catch { chromium = null; }
if (chromium && !process.argv.includes('--no-png')) {
  const exe = '/opt/pw-browsers/chromium';
  const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});
  const page = await browser.newPage();
  const settle = async () => { await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(700); };
  for (const p of PIECES) {
    await page.setViewportSize({ width: p.w, height: p.h });
    await page.goto('file://' + join(HERE, p.dir, `${p.name}.svg`));
    await settle();
    if (p.anim) {
      // frames: pause every animation at chosen times
      for (const [i, t] of p.anim.frames.entries()) {
        await page.evaluate((ms) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; }), t);
        await page.waitForTimeout(150);
        await page.screenshot({ path: join(HERE, p.dir, `${p.name}-frame-${i + 1}-${Math.round(t)}ms.png`) });
      }
    }
    await page.screenshot({ path: join(HERE, p.dir, `${p.name}.png`) });
    if (p.preview) {
      await page.evaluate((id) => document.getElementById(id).setAttribute('display', 'inline'), p.preview);
      await page.screenshot({ path: join(HERE, p.dir, `${p.name}-sticker-preview.png`) });
    }
    if (p.photoCheck) {
      // Measure the photo behind every text block with overlay.mjs (media.json contrast method).
      const pc = p.photoCheck;
      const img = await page.evaluate(async ({ uri, w, h, x, y, size, ground }) => {
        const im = new Image(); im.src = uri; await im.decode();
        const cv = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas'); cv.width = w; cv.height = h;
        const g = cv.getContext('2d'); g.fillStyle = ground; g.fillRect(0, 0, w, h);
        g.globalCompositeOperation = 'lighten'; g.drawImage(im, x, y, size, size);
        return Array.from(g.getImageData(0, 0, w, h).data);
      }, { uri: PHOTO_URI, w: p.w, h: p.h, x: pc.x, y: pc.y, size: pc.size, ground: C.ground });
      const data = { width: p.w, height: p.h, data: img };
      for (const z of pc.zones) {
        const box = { x: (z.x / p.w) * 100, y: (z.y / p.h) * 100, w: (z.w / p.w) * 100, h: (z.h / p.h) * 100 };
        const rec = recommendTreatment(data, box, { ink: C.ground, paper: C.text, allowed: ['calm-region', 'duotone', 'tint', 'blur', 'scrim-gradient'] });
        console.log(`  overlay ${p.name} ${JSON.stringify({ x: r1(z.x), y: r1(z.y) })}: text ${rec.text}, ${rec.treatment}, ${rec.achievedContrast}:1, busyness ${rec.busyness}`);
      }
    }
  }
  // contact sheet
  const cells = PIECES.map((p) => {
    const scale = p.w / p.h > 2 ? 520 / p.w : p.h > p.w ? 380 / p.h : 340 / Math.max(p.w, p.h) * (p.w > p.h ? 1.45 : 1.1);
    return `<figure><img src="${p.dir}/${p.name}.png" style="width:${Math.round(p.w * scale)}px"><figcaption>${p.name}</figcaption></figure>`;
  }).join('');
  writeFileSync(join(HERE, '.contact.html'), `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:28px;background:#2a2b2d;font:14px system-ui;color:#ddd;width:2200px}h1{font-size:18px;margin:0 0 18px}div{display:flex;flex-wrap:wrap;gap:22px;align-items:flex-start}figure{margin:0}img{display:block;border:1px solid #444}figcaption{margin-top:6px}</style><h1>Plutto · launch · Negative Space · Wada 255 (dark) · Instrument + the brand's own marks</h1><div>${cells}</div>`);
  await page.setViewportSize({ width: 2256, height: 800 });
  await page.goto('file://' + join(HERE, '.contact.html'));
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(HERE, 'contact-sheet.png'), fullPage: true });
  execSync(`rm -f "${join(HERE, '.contact.html')}"`);
  await browser.close();
}
