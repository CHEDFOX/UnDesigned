// Plutto "Launch": every social, web and print piece in the Negative Space style (approaches/negative-space).
// Colours come from the product's palette (dist/plutto/tokens/colors.json: combination 255, dark, with
// Wada White for type and Pyrite Yellow as the one gold accent), type from its pairing
// (dist/plutto/tokens/typography.json: Instrument Serif + Instrument Sans), words from the .copy.json files
// beside this script. Zero dependencies.
//
//   npm run build -- plutto
//   node products/plutto/campaigns/launch/design.mjs
//
// Writes social/*.svg, web/*.svg, print/*.svg and, when Playwright is installed, a PNG preview next to each
// SVG, contact-sheet.png and a text-bounds report (every line of text inside the grid margins / safe area).
// Every id in a file is prefixed per piece (pl-<piece>-) so the brand hub can inline many SVGs in one page.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../../../..');
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));

// ------------------------------------------------------------------ tokens

const colors = json(join(ROOT, 'dist/plutto/tokens/colors.json'));
const type = json(join(ROOT, 'dist/plutto/tokens/typography.json'));
const hex = Object.fromEntries(colors.colors.map((c) => [c.id, c.hex]));
const roles = colors.brand.find((p) => p.name === 'primary').roles;
// Ground: Wada Black. Ink and text: Wada White. Accent: Pyrite Yellow, only on one small part of the object.
const C = { ground: hex[roles.bg], ink: hex[roles.ink], text: hex[roles.text], gold: hex[roles.accent] };
const SERIF_NAME = type.pairing.display.family;
const SANS_NAME = type.pairing.body.family;
const SERIF = `'${SERIF_NAME}', Georgia, serif`;
const SANS = `'${SANS_NAME}', system-ui, sans-serif`;
const FONTS = `https://fonts.googleapis.com/css2?family=${SERIF_NAME.replace(/ /g, '+')}:ital@0;1&family=${SANS_NAME.replace(/ /g, '+')}:wght@400;600&display=swap`;

// Average advance per em, measured in Chromium on the copy (Instrument Serif 0.33, Instrument Sans 0.43 /
// 0.45 semibold), rounded up so lines never run longer than estimated.
const ADV = { serif: 0.35, sans: 0.46, sansBold: 0.48 };
const CAP = 0.72; // cap height / em for both families (measured)

// ------------------------------------------------------------------ text

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const r1 = (n) => Math.round(n * 10) / 10;

function wrap(text, size, maxW, adv) {
  const lines = [];
  for (const w of String(text).trim().split(/\s+/)) {
    const last = lines[lines.length - 1];
    if (last !== undefined && (last + ' ' + w).length * size * adv <= maxW) lines[lines.length - 1] = last + ' ' + w;
    else lines.push(w);
  }
  return lines;
}
// Fewest lines that fit, then the narrowest measure that keeps that count (even lines, no lone last word).
function balance(text, size, maxW, adv) {
  const n = wrap(text, size, maxW, adv).length;
  let w = maxW;
  while (w > maxW * 0.45 && wrap(text, size, w - size * adv, adv).length === n) w -= size * adv;
  return wrap(text, size, w, adv);
}
// Line breaks at sentence ends first: "Not twelve boxes. / Your own chart."
function sentences(text, size, maxW, adv) {
  const parts = String(text).match(/[^.]+\.?/g).map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1 && parts.every((p) => p.length * size * adv <= maxW)) return parts;
  return balance(text, size, maxW, adv);
}

// A block of lines. y is the top of the first line's capitals. Returns svg, box and the last baseline.
function lines(list, { x, y, size, lead, font = 'sans', weight = 400, fill = C.text, anchor = 'start', track = 0, italic = false }) {
  const fam = font === 'serif' ? SERIF : SANS;
  const adv = font === 'serif' ? ADV.serif : weight >= 600 ? ADV.sansBold : ADV.sans;
  const base0 = y + size * CAP;
  const svg = list.map((l, i) => `<text x="${r1(x)}" y="${r1(base0 + i * lead)}" font-family="${esc(fam)}" font-size="${size}"${weight !== 400 ? ` font-weight="${weight}"` : ''}${italic ? ' font-style="italic"' : ''}${track ? ` letter-spacing="${track}"` : ''}${anchor !== 'start' ? ` text-anchor="${anchor}"` : ''} fill="${fill}">${esc(l)}</text>`).join('');
  const w = Math.max(...list.map((l) => l.length * size * adv));
  const bx = anchor === 'end' ? x - w : x;
  const last = base0 + (list.length - 1) * lead;
  return { svg, box: { x: bx, y, w, h: last - y + size * 0.25 }, last, bottom: last + size * 0.25 };
}

// Brand lockup: the Plutto mark (ring and dot, from the site's icon.svg, here in white so the only gold
// in a piece is on the object) and the name, set in the pairing's sans. y is the top of the capitals.
function brand(x, y, size, { anchor = 'start' } = {}) {
  const rr = size * 0.42, gap = size * 0.38, nameW = 6 * size * ADV.sansBold;
  const total = rr * 2 + gap + nameW;
  const x0 = anchor === 'end' ? x - total : x;
  const cy = y + size * CAP / 2, cx = x0 + rr;
  const svg = `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(rr - size * 0.04)}" fill="none" stroke="${C.ink}" stroke-width="${r1(size * 0.075)}"/>` +
    `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(size * 0.1)}" fill="${C.ink}"/>` +
    `<text x="${r1(x0 + rr * 2 + gap)}" y="${r1(y + size * CAP)}" font-family="${esc(SANS)}" font-size="${size}" font-weight="600" letter-spacing="${r1(size * 0.02)}" fill="${C.text}">Plutto</text>`;
  return { svg, box: { x: x0, y: cy - rr, w: total, h: rr * 2 }, bottom: y + size * CAP };
}

// Text call to action with a thin arrow, for social and print.
function ctaText(x, y, size, text, { anchor = 'start' } = {}) {
  const t = lines([`${text} →`], { x, y, size, lead: size, weight: 600, anchor });
  return t;
}
// Outlined pill button, for web (art.json corners.use.button: pill, outlined in ink, no fill).
function ctaPill(x, y, size, text, { anchor = 'start' } = {}) {
  const tw = text.length * size * ADV.sansBold, padX = size * 1.3, h = size * 2.6;
  const w = tw + padX * 2;
  const x0 = anchor === 'end' ? x - w : x;
  const svg = `<rect x="${r1(x0)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${r1(h / 2)}" fill="none" stroke="${C.ink}" stroke-width="${r1(Math.max(1.5, size * 0.09))}"/>` +
    `<text x="${r1(x0 + w / 2)}" y="${r1(y + h / 2 + size * CAP / 2)}" text-anchor="middle" font-family="${esc(SANS)}" font-size="${size}" font-weight="600" fill="${C.text}">${esc(text)}</text>`;
  return { svg, box: { x: x0, y, w, h }, bottom: y + h };
}

// ------------------------------------------------------------------ the one object

const rad = (d) => (d * Math.PI) / 180;
const pt = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];

// The Oracle: one flat gold disc. On the site it is "the single sacred place where gold lives"; here it is
// the only gold in every piece (NS6: accent on one small part of the one object).
const orb = (cx, cy, r) => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="${C.gold}"/>`;

// The voice: three hairline arcs travelling from the orb into the open field, each lighter than the last
// (a second mark that belongs to the object, like a wake behind a boat). dir: degrees (0 = right, -90 = up).
function voice(cx, cy, r, dir, { span = 64, steps = [1.5, 1.95, 2.4], width } = {}) {
  const sw = width || Math.max(2, r * 0.045);
  const op = [0.9, 0.6, 0.32];
  const svg = steps.map((k, i) => {
    const R = r * k;
    const [x1, y1] = pt(cx, cy, R, dir - span / 2), [x2, y2] = pt(cx, cy, R, dir + span / 2);
    return `<path d="M${r1(x1)} ${r1(y1)} A${r1(R)} ${r1(R)} 0 0 1 ${r1(x2)} ${r1(y2)}" fill="none" stroke="${C.ink}" stroke-width="${r1(sw)}" stroke-linecap="round" opacity="${op[i]}"/>`;
  }).join('');
  const R = r * steps[steps.length - 1];
  const xs = [-span / 2, 0, span / 2].map((d) => pt(cx, cy, R, dir + d));
  const box = { x: Math.min(cx - r, ...xs.map((p) => p[0])), y: Math.min(cy - r, ...xs.map((p) => p[1])), x2: Math.max(cx + r, ...xs.map((p) => p[0])), y2: Math.max(cy + r, ...xs.map((p) => p[1])) };
  return { svg, box: { x: box.x, y: box.y, w: box.x2 - box.x, h: box.y2 - box.y } };
}

// A chart wheel cut from white paper: twelve segments with the ground showing between them, and the gold
// orb where the person is. (The site's own NatalWheel, reduced to one flat silhouette.)
function wheel(cx, cy, R) {
  const inner = R * 0.76, gap = 1.6;
  let segs = '';
  for (let i = 0; i < 12; i++) {
    const a0 = i * 30 - 90 + gap, a1 = (i + 1) * 30 - 90 - gap;
    const [ox0, oy0] = pt(cx, cy, R, a0), [ox1, oy1] = pt(cx, cy, R, a1);
    const [ix1, iy1] = pt(cx, cy, inner, a1), [ix0, iy0] = pt(cx, cy, inner, a0);
    segs += `M${r1(ox0)} ${r1(oy0)} A${r1(R)} ${r1(R)} 0 0 1 ${r1(ox1)} ${r1(oy1)} L${r1(ix1)} ${r1(iy1)} A${r1(inner)} ${r1(inner)} 0 0 0 ${r1(ix0)} ${r1(iy0)} Z `;
  }
  return { svg: `<path d="${segs.trim()}" fill="${C.ink}"/>` + orb(cx, cy, R * 0.3), box: { x: cx - R, y: cy - R, w: 2 * R, h: 2 * R } };
}

// One disc cut in two: the left half white paper, the right half gold and dropped a little, as if the lens
// changed in the middle of a sentence.
function splitDisc(cx, cy, r) {
  const g = r * 0.07, dy = r * 0.16;
  const left = `<path d="M${r1(cx - g)} ${r1(cy - r)} A${r1(r)} ${r1(r)} 0 0 0 ${r1(cx - g)} ${r1(cy + r)} Z" fill="${C.ink}"/>`;
  const right = `<path d="M${r1(cx + g)} ${r1(cy + dy - r)} A${r1(r)} ${r1(r)} 0 0 1 ${r1(cx + g)} ${r1(cy + dy + r)} Z" fill="${C.gold}"/>`;
  return { svg: left + right, box: { x: cx - r - g, y: cy - r, w: 2 * (r + g), h: 2 * r + dy } };
}

// The orb inside one tilted hairline orbit (an orrery reduced to two marks): the back half of the orbit
// passes behind the orb, the front half in front of it.
function orrery(cx, cy, r, { rx = r * 2.5, ry = r * 0.62, tilt = -16 } = {}) {
  const sw = Math.max(1.6, r * 0.04);
  const half = (sweep) => {
    const [x1, y1] = pt(cx, cy, 0, 0);
    // endpoints of the ellipse's major axis, rotated by tilt
    const ax = rx * Math.cos(rad(tilt)), ay = rx * Math.sin(rad(tilt));
    return `<path d="M${r1(cx - ax)} ${r1(cy - ay)} A${r1(rx)} ${r1(ry)} ${tilt} 0 ${sweep} ${r1(cx + ax)} ${r1(cy + ay)}" fill="none" stroke="${C.ink}" stroke-width="${r1(sw)}" stroke-linecap="round" opacity="0.8"/>`;
  };
  // sweep 1 = upper half (behind), sweep 0 = lower half (in front)
  const svg = half(1) + orb(cx, cy, r) + half(0);
  return { svg, box: { x: cx - rx, y: cy - Math.max(r, rx * 0.35), w: 2 * rx, h: 2 * Math.max(r, rx * 0.35) } };
}

// The orb half-risen: a gold dome cut by a hairline horizon (straight, or the curved edge of a planet).
function risingOrb(cx, hy, r, W, M, { curve = null } = {}) {
  const sw = Math.max(1.6, W * 0.0019);
  if (!curve) {
    const dome = `<path d="M${r1(cx - r)} ${r1(hy)} A${r1(r)} ${r1(r)} 0 0 1 ${r1(cx + r)} ${r1(hy)} Z" fill="${C.gold}"/>`;
    const line = `<path d="M${r1(M)} ${r1(hy)} L${r1(W - M)} ${r1(hy)}" stroke="${C.ink}" stroke-width="${r1(sw)}" stroke-linecap="round" opacity="0.6"/>`;
    return { svg: dome + line, box: { x: cx - r, y: hy - r, w: 2 * r, h: r } };
  }
  // curve: { cx, cy, R } a planet, ground-coloured, whose edge hides the lower part of the orb.
  const { cx: px, cy: py, R } = curve;
  const svg = orb(cx, hy, r) +
    `<circle cx="${r1(px)}" cy="${r1(py)}" r="${r1(R)}" fill="${C.ground}" stroke="${C.ink}" stroke-width="${r1(sw)}" stroke-opacity="0.6"/>`;
  return { svg, box: { x: cx - r, y: hy - r, w: 2 * r, h: r * 1.2 } };
}

// ------------------------------------------------------------------ documents

const pieces = [];
function doc(p) {
  const { name, w, h, label, inner, boxes, dir, live } = p;
  const id = `pl-${name}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="${id}-title">` +
    `<title id="${id}-title">${esc(label)}</title>` +
    `<style>@import url("${esc(FONTS)}");</style>` +
    `<rect width="${w}" height="${h}" fill="${C.ground}"/>${inner}</svg>\n`;
  pieces.push({ ...p, id, svg, empty: emptyPct(boxes, w, h), file: join(dir, `${name}.svg`), live });
}

// Empty ground: 100% minus the union of all mark boxes (sampled on a grid), as art.json -> space.measure.
function emptyPct(boxes, W, H) {
  let used = 0, n = 0;
  const s = Math.max(2, Math.round(Math.min(W, H) / 250));
  for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) {
    n++;
    if (boxes.some((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h)) used++;
  }
  return Math.round((1 - used / n) * 100);
}

const copy = (f) => json(join(HERE, f));

// ================================================================== social: Instagram 4:5 (1080 x 1350)
// Margins 10% of the short side (108). Headline 92 px (cap 66 = 4.9% of the height; style range 3.5-5.5%),
// body 38 px (min 32), small 30 px. Profile-grid side crop (6.3%) is inside the margin.
{
  const W = 1080, H = 1350, M = 108, HS = 92, HL = 98, BS = 38, SS = 30;
  const live = { x: M, y: M, x2: W - M, y2: H - M };

  // Post 1, ns-post-4x5-gaze: the orb low on the left, its voice travelling right into the open field;
  // headline high on the left; details and CTA wait at the far end of the voice, bottom right.
  {
    const c = copy('post-1-out-loud.copy.json');
    const hd = lines(['Ask your birth chart,', 'out loud.'], { x: M, y: M, size: HS, lead: HL, font: 'serif' });
    const br = brand(M, hd.bottom + 40, SS);
    const ox = 262, oy = 960, or = 82;
    const v = voice(ox, oy, or, -8, { span: 62 });
    const TX = 612; // one left edge for details and CTA, at the far end of the voice
    const subL = balance(c.subhead, BS, W - M - TX, ADV.sans);
    const subY = H - M - SS * CAP - 46 - ((subL.length - 1) * BS * 1.35 + BS * CAP);
    const subB = lines(subL, { x: TX, y: subY, size: BS, lead: BS * 1.35 });
    const cta = ctaText(TX, H - M - SS * CAP, SS, c.cta);
    doc({ name: 'post-1-out-loud', dir: 'social', w: W, h: H, label: `${c.headline} Plutto. ${c.subhead} ${c.cta}`, live,
      inner: hd.svg + br.svg + orb(ox, oy, or) + v.svg + subB.svg + cta.svg, boxes: [hd.box, br.box, v.box, subB.box, cta.box], obj: v.box });
  }

  // Post 2, optical centre: the twelve-part wheel a little above the middle, the gold orb at its heart;
  // all the words in one quiet group on the bottom margin.
  {
    const c = copy('post-2-twelve-boxes.copy.json');
    const cta = ctaText(M, H - M - SS * CAP, SS, c.cta);
    const subL = balance(c.subhead, BS, 640, ADV.sans);
    const subH = (subL.length - 1) * BS * 1.35 + BS * CAP;
    const subY = H - M - SS * CAP - 46 - subH;
    const sub = lines(subL, { x: M, y: subY, size: BS, lead: BS * 1.35 });
    const brY = subY - 40 - SS * CAP;
    const headL = ['Not twelve boxes.', 'Your own chart.'];
    const hdY = brY - 40 - (HS * CAP + HL);
    const hd = lines(headL, { x: M, y: hdY, size: HS, lead: HL, font: 'serif' });
    const br = brand(M, brY, SS);
    const wh = wheel(W / 2, 400, 150);
    doc({ name: 'post-2-twelve-boxes', dir: 'social', w: W, h: H, label: `${c.headline} Plutto. ${c.subhead} ${c.cta}`, live,
      inner: wh.svg + hd.svg + br.svg + sub.svg + cta.svg, boxes: [wh.box, hd.box, br.box, sub.box, cta.box], obj: wh.box });
  }

  // Post 3, ns-poster-object-low: headline and brand high on the left, the split disc low on the right,
  // details and CTA on the bottom-left margin.
  {
    const c = copy('post-3-mid-sentence.copy.json');
    const hd = lines(['Switch traditions', 'mid-sentence.'], { x: M, y: M, size: HS, lead: HL, font: 'serif' });
    const br = brand(M, hd.bottom + 40, SS);
    const sd = splitDisc(800, 800, 106);
    const cta = ctaText(M, H - M - SS * CAP, SS, c.cta);
    const subL = balance(c.subhead, BS, 440, ADV.sans);
    const subY = H - M - SS * CAP - 46 - ((subL.length - 1) * BS * 1.35 + BS * CAP);
    const sub = lines(subL, { x: M, y: subY, size: BS, lead: BS * 1.35 });
    doc({ name: 'post-3-mid-sentence', dir: 'social', w: W, h: H, label: `${c.headline} Plutto. ${c.subhead} ${c.cta}`, live,
      inner: hd.svg + br.svg + sd.svg + sub.svg + cta.svg, boxes: [hd.box, br.box, sd.box, sub.box, cta.box], obj: sd.box });
  }

  // Carousel, four 4:5 slides. One hairline orbit runs across all four (the ecliptic: an arch that rises
  // out of slide 1 and sets into slide 4); the gold orb travels along it as you swipe. Text sits high on the
  // left of every slide, the orbit stays in the lower half, so the line never crosses the words.
  {
    const slides = copy('carousel.copy.json');
    const CHS = 80, CHL = 86, CBS = 36, CSS = 28; // headline cap 58 = 4.3% (range 3-4.5%); body min 30
    const E = { cx: 2 * W, cy: 1.62 * H, rx: 2.55 * W, ry: 0.86 * H };
    const yOn = (gx) => E.cy - E.ry * Math.sqrt(Math.max(0, 1 - ((gx - E.cx) / E.rx) ** 2));
    const orbX = [0.56, 0.52, 0.48, 0.38]; // orb position on each slide (share of slide width)
    const or = 70;
    slides.forEach((c, i) => {
      const name = `carousel-${i + 1}`;
      const pid = `pl-${name}`;
      const off = i * W;
      // orbit: the whole ellipse, shifted so this slide shows its own part of it
      const orbit = `<ellipse cx="${r1(E.cx - off)}" cy="${r1(E.cy)}" rx="${r1(E.rx)}" ry="${r1(E.ry)}" fill="none" stroke="${C.ink}" stroke-width="2" opacity="0.55"/>`;
      const gx = off + orbX[i] * W;
      const ox = orbX[i] * W, oy = yOn(gx);
      const headL = c.headline.length * CHS * ADV.serif > 760 ? sentences(c.headline, CHS, 760, ADV.serif) : [c.headline];
      const hd = lines(headL.length === 1 && c.headline.length * CHS * ADV.serif > 760 ? balance(c.headline, CHS, 760, ADV.serif) : headL, { x: M, y: M, size: CHS, lead: CHL, font: 'serif' });
      const br = brand(M, hd.bottom + 36, CSS);
      let y = br.bottom + 64, extra = '', boxes = [hd.box, br.box];
      for (const f of ['subhead', 'body']) {
        if (!c[f]) continue;
        const b = lines(balance(c[f], CBS, 640, ADV.sans), { x: M, y, size: CBS, lead: CBS * 1.4 });
        extra += b.svg; boxes.push(b.box); y = b.bottom + 40;
      }
      if (c.cta) { const ct = ctaText(M, y + 8, CSS, c.cta); extra += ct.svg; boxes.push(ct.box); }
      // slide count, small, bottom right: tells people to swipe (1/4 ... 4/4)
      const count = lines([`${i + 1} / ${slides.length}`], { x: W - M, y: H - M - CSS * CAP, size: CSS, lead: CSS, anchor: 'end' });
      boxes.push(count.box, { x: ox - or, y: oy - or, w: 2 * or, h: 2 * or });
      doc({ name, dir: 'social', w: W, h: H, label: [c.headline, 'Plutto.', c.subhead, c.body, c.cta].filter(Boolean).join(' '), live,
        inner: orbit + orb(ox, oy, or) + hd.svg + br.svg + extra + count.svg, boxes, obj: { x: ox - or, y: oy - or, w: 2 * or, h: 2 * or }, group: 'carousel', pid });
    });
  }
}

// ================================================================== social: LinkedIn square 1:1 (1080 x 1080)
// instagram-post sizes: headline 80 px (cap 58 = 5.3%), body 34 px (min 32), small 27 px.
{
  const W = 1080, H = 1080, M = 108, HS = 80, HL = 86, BS = 34, SS = 27;
  const c = copy('linkedin-square.copy.json');
  const hd = lines(['Every reading. Every system.', 'One voice.'], { x: M, y: M, size: HS, lead: HL, font: 'serif' });
  const br = brand(M, hd.bottom + 36, SS);
  const sub = lines(balance(c.subhead, BS, 560, ADV.sans), { x: M, y: br.bottom + 60, size: BS, lead: BS * 1.4 });
  const cta = ctaText(M, H - M - SS * CAP, SS, c.cta);
  const bodyL = balance(c.body, SS, 420, ADV.sans);
  const body = lines(bodyL, { x: M, y: H - M - SS * CAP - 40 - ((bodyL.length - 1) * SS * 1.4 + SS * CAP), size: SS, lead: SS * 1.4 });
  const or = orrery(780, 790, 58);
  doc({ name: 'linkedin-square', dir: 'social', w: W, h: H, label: `${c.headline} Plutto. ${c.subhead} ${c.body} ${c.cta}`, live: { x: M, y: M, x2: W - M, y2: H - M },
    inner: hd.svg + br.svg + sub.svg + or.svg + body.svg + cta.svg, boxes: [hd.box, br.box, sub.box, or.box, body.box, cta.box], obj: or.box });
}

// ================================================================== social: stories 9:16 (1080 x 1920)
// Live band: top 14% (269), bottom 35% (from 1248), sides 10% margin (108, wider than the 6% safe area).
// Headline 84 px (cap 60 = 3.2%; range 2.5-3.5%), body 40 px (min 36), small 32 px.
{
  const W = 1080, H = 1920, M = 108, TOP = 0.14 * H, BOT = H - 0.35 * H, HS = 84, HL = 92, BS = 40, SS = 32;
  const live = { x: M, y: TOP, x2: W - M, y2: BOT };

  // Story 1, ns-story-float: headline high, the orb low in the live band on the right, its voice rising
  // up and to the left toward the words; CTA on the left margin at the foot of the live band.
  {
    const c = copy('story-1-talks-back.copy.json');
    const hd = lines(['Talk to your chart.', 'It talks back.'], { x: M, y: TOP, size: HS, lead: HL, font: 'serif' });
    const br = brand(M, hd.bottom + 40, SS);
    const ox = 700, oy = 950, or = 92;
    const v = voice(ox, oy, or, -128, { span: 58 });
    const cta = ctaText(M, BOT - BS * CAP, BS, c.cta);
    doc({ name: 'story-1-talks-back', dir: 'social', w: W, h: H, label: `${c.headline} Plutto. ${c.cta}`, live,
      inner: hd.svg + br.svg + orb(ox, oy, or) + v.svg + cta.svg, boxes: [hd.box, br.box, v.box, cta.box], obj: v.box });
  }

  // Story 2: the orb rising over the curved edge of a planet (the planet is the ground itself, drawn only
  // by its hairline rim, as in the site's floating-planet image). Words high in the live band.
  {
    const c = copy('story-2-languages.copy.json');
    const hd = lines(['Ask in any of', '89 languages.'], { x: M, y: TOP, size: HS, lead: HL, font: 'serif' });
    const br = brand(M, hd.bottom + 40, SS);
    const sub = lines([c.subhead], { x: M, y: br.bottom + 64, size: BS, lead: BS * 1.4 });
    const cta = ctaText(M, sub.bottom + 44, BS, c.cta);
    const P = { cx: 540, cy: 1170 + 1500, R: 1500, id: 'pl-story-2-languages-clip' };
    const hy = 1170 - 18, or = 96;
    const ro = risingOrb(560, hy + 40, or, W, M, { curve: P });
    doc({ name: 'story-2-languages', dir: 'social', w: W, h: H, label: `${c.headline} Plutto. ${c.subhead} ${c.cta}`, live,
      inner: hd.svg + br.svg + sub.svg + cta.svg + ro.svg, boxes: [hd.box, br.box, sub.box, cta.box, ro.box, { x: 0, y: 1150, w: W, h: 10 }], obj: ro.box });
  }
}

// ================================================================== web: display banner 970 x 250
// Headline 42 px (cap 30 = 12% of the height; range 9-14%), button 18 px, brand 15 px.
{
  const W = 970, H = 250, MX = 30, c = copy('web-banner.copy.json');
  const hd = lines([c.headline], { x: MX, y: 62, size: 42, lead: 46, font: 'serif' });
  const br = brand(MX, hd.bottom + 26, 16);
  const ox = 606, oy = 112, or = 26;
  const v = voice(ox, oy, or, 180, { span: 60, steps: [1.55, 2.05, 2.55], width: 1.6 });
  const pill = ctaPill(W - MX, 125 - 18 * 1.3, 18, c.cta, { anchor: 'end' });
  doc({ name: 'web-banner', dir: 'web', w: W, h: H, label: `${c.headline} Plutto. ${c.cta}`, live: { x: MX, y: 30, x2: W - MX, y2: H - 30 },
    inner: hd.svg + br.svg + orb(ox, oy, or) + v.svg + pill.svg, boxes: [hd.box, br.box, v.box, pill.box], obj: v.box });
}

// ================================================================== web: landing hero 16:9 (1440 x 810)
// ns-hero-wide: brand top left, words on the reading-start side, the orb far right facing back toward them.
// Headline 62 px (range 32-64), body 21 px (min 18), small 17 px.
{
  const W = 1440, H = 810, MX = 81, MY = 81, c = copy('landing-hero.copy.json');
  const br = brand(MX, MY, 20);
  const hd = lines(balance(c.headline, 62, 520, ADV.serif), { x: MX, y: 0.32 * H, size: 62, lead: 68, font: 'serif' });
  const sub = lines(balance(c.subhead, 21, 470, ADV.sans), { x: MX, y: hd.bottom + 34, size: 21, lead: 21 * 1.55 });
  const pill = ctaPill(MX, sub.bottom + 44, 17, c.cta);
  const ox = 1100, oy = 470, or = 64;
  const v = voice(ox, oy, or, 180, { span: 60 });
  doc({ name: 'landing-hero', dir: 'web', w: W, h: H, label: `Plutto. ${c.headline} ${c.subhead} ${c.cta}`, live: { x: MX, y: MY, x2: W - MX, y2: H - MY },
    inner: br.svg + hd.svg + sub.svg + pill.svg + orb(ox, oy, or) + v.svg, boxes: [br.box, hd.box, sub.box, pill.box, v.box], obj: v.box });
}

// ================================================================== web: YouTube thumbnail 16:9 (1280 x 720)
// Headline 132 px (cap 95 = 13.2%; range 9-14%), brand 34 px. Bottom-right duration stamp kept clear.
{
  const W = 1280, H = 720, M = 72, c = copy('thumbnail.copy.json');
  const hd = lines(['An oracle that', 'speaks back'], { x: M, y: 150, size: 132, lead: 136, font: 'serif' });
  const br = brand(M, hd.bottom + 46, 34);
  const ox = 1010, oy = 300, or = 104;
  const v = voice(ox, oy, or, 180, { span: 56, steps: [1.4, 1.75, 2.1], width: 4 });
  doc({ name: 'thumbnail', dir: 'web', w: W, h: H, label: `${c.headline}. Plutto.`, live: { x: M, y: M, x2: W - M, y2: H - M },
    inner: hd.svg + br.svg + orb(ox, oy, or) + v.svg, boxes: [hd.box, br.box, v.box], obj: v.box });
}

// ================================================================== print: poster A2 / A3 (1000 x 1414)
// ns-poster-object-low: headline small at the top-left margin, brand under it; the gold orb half-risen on a
// hairline horizon in the lower right third; details and CTA on the foot margin.
// Headline 66 (cap 47.5 = 3.4%; range 2.5-4.5%), body 25, small 20 (A2: 20 units = 8.4 mm, 24 pt).
{
  const W = 1000, H = 1414, M = 100, c = copy('poster.copy.json');
  const hd = lines(['Thousands of years', 'of observation.', 'Now you can ask.'], { x: M, y: M, size: 66, lead: 72, font: 'serif' });
  const br = brand(M, hd.bottom + 34, 21);
  const hy = 960;
  const ro = risingOrb(690, hy, 82, W, M);
  const cta = ctaText(M, H - M - 20 * CAP, 20, c.cta);
  const bodyL = balance(c.body, 20, 520, ADV.sans);
  const bodyY = H - M - 20 * CAP - 36 - ((bodyL.length - 1) * 20 * 1.45 + 20 * CAP);
  const body = lines(bodyL, { x: M, y: bodyY, size: 20, lead: 20 * 1.45 });
  const subL = balance(c.subhead, 25, 560, ADV.sans);
  const subY = bodyY - 30 - ((subL.length - 1) * 25 * 1.45 + 25 * CAP);
  const sub = lines(subL, { x: M, y: subY, size: 25, lead: 25 * 1.45 });
  doc({ name: 'poster', dir: 'print', w: W, h: H, label: `${c.headline} Plutto. ${c.subhead} ${c.body} ${c.cta}`, live: { x: M, y: M, x2: W - M, y2: H - M },
    inner: hd.svg + br.svg + ro.svg + sub.svg + body.svg + cta.svg, boxes: [hd.box, br.box, ro.box, { x: M, y: hy - 1, w: W - 2 * M, h: 2 }, sub.box, body.box, cta.box], obj: ro.box });
}

// ------------------------------------------------------------------ write

for (const p of pieces) {
  mkdirSync(join(HERE, p.dir), { recursive: true });
  writeFileSync(join(HERE, p.file), p.svg);
  console.log(`${p.file.padEnd(32)} ${String(p.w + 'x' + p.h).padEnd(10)} empty ground ${p.empty}%`);
}

// ------------------------------------------------------------------ video: animated story title card
// templates/video/title-card.mjs with the product palette, story-1 copy, the pairing and Negative Space's
// motion.json. The style's choreography opens on the ground, then the object, then the words: the opening
// hold is lengthened so the gold orb can fade in alone first (one thing moves at a time), then the template
// brings in headline, brand and CTA. Every "tc-" id is re-prefixed so the hub can inline it.
{
  const { titleCard, timeline } = await import(join(ROOT, 'templates/video/title-card.mjs'));
  const motion = { ...json(join(ROOT, 'approaches/negative-space/motion.json')), openMs: 1800, holdMs: 2000 };
  const c = copy('story-1-talks-back.copy.json');
  const args = { palette: { ground: C.ground, ink: C.ink, accent: C.ink, paper: C.ink }, copy: { headline: c.headline, brand: 'Plutto', cta: c.cta },
    fonts: { display: SERIF_NAME, body: SANS_NAME, displayWeight: 400 }, motion, duration: 10000, aspect: [9, 16] };
  const T = timeline(args);
  let svg = titleCard(args);
  // The one object: the gold orb high on the right of the live band, above the words (the template centres the text group), fading in during
  // the opening hold, then still.
  const orbSvg = `<g id="tc-orb" class="tc-el">${orb(870, 340, 66)}</g>`;
  svg = svg.replace(/(<rect id="tc-ground"[^>]*\/>)/, `$1\n${orbSvg}`)
    .replace('<style>', `<style>@import url("${esc(FONTS)}");\n#tc-orb{animation:tc-fade 1100ms cubic-bezier(0.33,0,0.2,1) 300ms both;}`)
    .replace(/tc-/g, 'pl-tcs-').replace('back.. Plutto', 'back. Plutto');
  mkdirSync(join(HERE, 'video'), { recursive: true });
  writeFileSync(join(HERE, 'video/story-title-card.svg'), svg + '\n');
  console.log(`video/story-title-card.svg       1080x1920  ${T.duration} ms; beats ${T.beats.map((b) => `${b.id} ${b.start}-${b.end}`).join(', ')}${T.warnings.length ? '; ' + T.warnings.join(' ') : ''}`);
  pieces.video = { svg, name: 'story-title-card' };
}

// ------------------------------------------------------------------ previews (optional: Playwright)

let chromium = null;
try {
  const req = createRequire(import.meta.url);
  const globalRoot = execSync('npm root -g', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  ({ chromium } = req(join(globalRoot, 'playwright')));
} catch { chromium = null; }

if (chromium) {
  const exe = '/opt/pw-browsers/chromium';
  const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});
  const page = await browser.newPage();
  const report = [];
  for (const p of pieces) {
    await page.setViewportSize({ width: p.w, height: p.h });
    await page.setContent(`<html><body style="margin:0;background:#000">${p.svg}</body></html>`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(HERE, p.dir, `${p.name}.png`) });
    // Text bounds: every <text> inside the live area (margins / safe area), measured with real fonts.
    const out = await page.evaluate((live) => [...document.querySelectorAll('text')].map((t) => {
      const b = t.getBBox();
      return { t: t.textContent, x: b.x, y: b.y, x2: b.x + b.width, y2: b.y + b.height, bad: b.x < live.x - 3 || b.x + b.width > live.x2 + 3 || b.y < live.y - 0.42 * +t.getAttribute('font-size') || b.y + b.height > live.y2 + 0.35 * +t.getAttribute('font-size') };
    }), p.live);
    const bad = out.filter((o) => o.bad);
    const texts = out.map((o) => ({ x: o.x, y: o.y, w: o.x2 - o.x, h: o.y2 - o.y }));
    const o = p.obj, gap = Math.min(...texts.map((t) => Math.max(t.x - (o.x + o.w), o.x - (t.x + t.w), t.y - (o.y + o.h), o.y - (t.y + t.h))));
    report.push(`${p.name}: ${bad.length ? 'OUTSIDE live area: ' + bad.map((b) => `"${b.t}" [${b.x | 0},${b.y | 0}-${b.x2 | 0},${b.y2 | 0}]`).join('; ') : 'all text inside the live area'}; nearest text to object ${Math.round(gap)} px (${Math.round((100 * gap) / Math.min(p.w, p.h))}% of short side)`);
  }
  if (pieces.video) {
    await page.setViewportSize({ width: 1080, height: 1920 });
    await page.setContent(`<html><body style="margin:0;background:#000">${pieces.video.svg}</body></html>`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(10500);
    await page.screenshot({ path: join(HERE, 'video/story-title-card.png') });
    await page.setContent(`<html><body style="margin:0;background:#000">${pieces.video.svg}</body></html>`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(HERE, 'video/story-title-card-1200ms.png') });
  }
  // Contact sheet: every piece at a common height per row, on a mid-grey sheet.
  const card = (p, hgt) => `<figure style="margin:0"><div style="height:${hgt}px;width:${Math.round((hgt * p.w) / p.h)}px">${p.svg.replace(/ width="\d+" height="\d+"/, ` width="${Math.round((hgt * p.w) / p.h)}" height="${hgt}"`)}</div><figcaption style="font:13px system-ui;color:#333;margin-top:6px">${p.name}</figcaption></figure>`;
  const row = (list, hgt) => `<div style="display:flex;gap:28px;align-items:flex-start;margin-bottom:28px">${list.map((p) => card(p, hgt)).join('')}</div>`;
  const by = (n) => pieces.filter((p) => n.includes(p.name));
  const sheet = `<html><body style="margin:0;padding:36px;background:#cfcfcf;width:max-content">` +
    `<h1 style="font:600 20px system-ui;margin:0 0 20px">Plutto · launch · Negative Space · Wada 255 (dark) · Instrument</h1>` +
    row(by(['post-1-out-loud', 'post-2-twelve-boxes', 'post-3-mid-sentence', 'linkedin-square']), 420) +
    row(pieces.filter((p) => p.group === 'carousel'), 420) +
    `<div style="display:flex;gap:28px;align-items:flex-start">${by(['story-1-talks-back', 'story-2-languages', 'poster']).map((p) => card(p, 620)).join('')}` +
    `<div style="display:flex;flex-direction:column;gap:28px">${by(['landing-hero', 'thumbnail', 'web-banner']).map((p) => card(p, p.name === 'web-banner' ? 160 : 290)).join('')}</div></div>` +
    `</body></html>`;
  await page.setViewportSize({ width: 2200, height: 1200 });
  await page.setContent(sheet, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(HERE, 'contact-sheet.png'), fullPage: true });
  await browser.close();
  console.log('\n' + report.join('\n'));
  console.log('\nPNG previews and contact-sheet.png written');
}
