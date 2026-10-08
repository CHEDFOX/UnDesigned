// XOOTEQ "launch" campaign, redone from the brand's core (products/xooteq/identity.json) in
// Commercial Modernism (approaches/commercial-modernism/): one hero, a bold viewpoint, one diagonal,
// lettering in planned bands, the brand word in tracked capitals. Palette: Wada 340 (dark: Black ground,
// White headlines, Sea Green accent, Peach Red warm signal; light 'daylight' for one piece). Type:
// Schibsted Grotesk 800/400 + JetBrains Mono 500 (pairing 'schibsted'). Marks: the original XQ monogram
// (assets/logos/icon-512.png). Photos: the brand's own (assets/photos/), duotoned inside 340, placed by
// foundations/layout/media.json and measured with templates/layouts/overlay.mjs.
//
//   npm run build -- xooteq
//   node products/xooteq/campaigns/launch/design.mjs           # SVGs + overlay results + previews + QA + contact sheet
//   node products/xooteq/campaigns/launch/design.mjs --fast    # SVGs + overlay results only
//
// Needs Playwright (global) and Chromium at /opt/pw-browsers/chromium: Chromium decodes the photos (canvas),
// measures the fonts and renders the previews. Every SVG has a viewBox, width and height, and only ids,
// classes and keyframes prefixed xq2-<piece>- so the brand hub can inline them all on one page.

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as L from './lib.mjs';
const { C, DAY, r, esc, textBlock, label, lockup, wrap, textWidth, capHeight, fade, svgDoc } = L;

const OV = await import(pathToFileURL(join(L.ROOT, 'templates/layouts/overlay.mjs')).href);
const FAST = process.argv.includes('--fast');
const OUT = L.HERE;
const PHOTOS = join(L.PRODUCT, 'assets/photos');
const copy = (f) => L.loadJSON(join(OUT, f));

// Commercial Modernism allows these text-over-photo treatments (media.json treatments -> styles).
const CM_ALLOWED = ['calm-region', 'scrim-gradient', 'solid-band', 'duotone'];

const { chromium } = L.playwright();
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
await L.measureFonts(page);
await page.setContent('<p>x</p>');
await L.prepIcon(page);

const pieces = [];      // { id, file, W, H, svg, format, composition, finding, notes, overlay }
const overlayLog = {};  // per piece: treatment chosen by overlay.mjs on the treated pixels

// Convert a canvas box (px) to a box in percent of a placed image.
function toImgBox(b, im) {
  const x0 = Math.max(0, (b.x - im.x) / im.w * 100), y0 = Math.max(0, (b.y - im.y) / im.h * 100);
  const x1 = Math.min(100, (b.x + b.w - im.x) / im.w * 100), y1 = Math.min(100, (b.y + b.h - im.y) / im.h * 100);
  return { x: r(x0, 2), y: r(y0, 2), w: r(Math.max(0.5, x1 - x0), 2), h: r(Math.max(0.5, y1 - y0), 2) };
}
// Run overlay.mjs on the treated photo for each text zone (what treatment the pixels need before we add anything).
function measure(id, photo, place, zones, avoid = []) {
  const res = zones.map((z) => {
    const box = toImgBox(z, place);
    const rec = OV.recommendTreatment(photo.img, box, { ink: C.black, paper: C.white, allowed: CM_ALLOWED, fills: [C.black], duotone: { dark: C.black, light: C.white } });
    return { zone: z.name, imageBox: box, treatment: rec.treatment, text: rec.text, opacity: rec.opacity, worstCaseNoTreatment: rec.worstCaseNoTreatment, achieved: rec.achievedContrast, busyness: rec.busyness, reason: rec.reason };
  });
  const calm = OV.findCalmRegion(photo.img, OV.gridCandidates(6, 8, 3, 2), { ink: C.black, paper: C.white, avoid: avoid.map((a) => toImgBox(a, place)) }).slice(0, 3)
    .map((c) => ({ box: c.box, score: c.score, contrast: c.contrast, busyness: c.busyness, passes: c.passes }));
  overlayLog[id] = { photo: photo.file, ladder: photo.ladder, sizeKB: photo.kb, zones: res, bestCalmCandidates: calm };
}

async function photo(file, opts) {
  const p = await L.prepPhoto(page, join(PHOTOS, file), { ...opts, cache: join(OUT, 'media', `${opts.name}.jpg`) });
  return { ...p, file, ladder: opts.ladder };
}
const img = (id, p, x, y, w, h, extra = '') => `<image id="${id}" href="${p.uri}" x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" preserveAspectRatio="xMidYMid slice"${extra}/>`;

// CTA: a streamline pill (CM corners: button 'streamline' or none) with 800 text.
function pill(x, y, text, { size = 30, fill = C.green, ink = C.black, cls = '', h } = {}) {
  const tw = textWidth(text, size, 'd800', 0);
  const H = h || size * 2.1;
  const padX = H * 0.55;
  const cap = capHeight(size);
  return {
    svg: `<g class="${cls}"><rect x="${r(x)}" y="${r(y)}" width="${r(tw + padX * 2)}" height="${r(H)}" rx="${r(H / 2)}" fill="${fill}"/><text x="${r(x + padX)}" y="${r(y + H / 2 + cap / 2)}" font-family="${L.FAM.sans}" font-weight="800" font-size="${size}" fill="${ink}">${esc(text)}</text></g>`,
    w: tw + padX * 2, h: H,
  };
}

// Speed lines (CM line.speedLines): 3-7 parallel lines, each 12% thinner and shorter, spacing 2-4x width.
function speedLines(x1, y1, x2, y2, { n = 3, w0 = 18, fill = C.green, gapX = 2.6, cls = '', taperLen = 0.12, side = 1 } = {}) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const nx = -Math.sin(ang) * side, ny = Math.cos(ang) * side;
  let out = '', w = w0, off = 0;
  const len = Math.hypot(x2 - x1, y2 - y1);
  for (let i = 0; i < n; i++) {
    const L2 = len * (1 - taperLen * i);
    const ex = x1 + Math.cos(ang) * L2, ey = y1 + Math.sin(ang) * L2;
    out += `<line class="${cls}" x1="${r(x1 + nx * off)}" y1="${r(y1 + ny * off)}" x2="${r(ex + nx * off)}" y2="${r(ey + ny * off)}" stroke="${fill}" stroke-width="${r(w)}" stroke-linecap="butt"/>`;
    off += w * gapX; w *= 0.88;
  }
  return out;
}

function add(p) { pieces.push(p); }

// =====================================================================================================
// 1-5  Beliefs carousel (type-led). Continuous element: a Sea Green beam with two speed lines that zigzags
//      across all five slides at 16 degrees and ends in the call to action on slide 5.
// =====================================================================================================
{
  const cp = copy('carousel-beliefs.copy.json');
  const W = 1080, H = 1350, M = 72;
  const yLow = 1262, yHigh = 952; // beam centre at slide edges: 16 degrees over 1080 px (tan 16 = 0.287 -> 310 px)
  cp.forEach((c, i) => {
    const n = i + 1, P = `xq2-bel${n}-`;
    const rising = i % 2 === 0;
    const yL = rising ? yLow : yHigh, yR = rising ? yHigh : yLow;
    let body = `<rect width="${W}" height="${H}" fill="${C.black}"/>`;
    // Beam: the continuous element. On slide 5 it stops at the CTA pill.
    let xEnd = W, yEnd = yR;
    let ctaSvg = '';
    if (n === 5) {
      const pl = pill(0, 0, c.cta, { size: 30 });
      const px = W - M - pl.w;
      xEnd = px + 4; yEnd = yL + (yR - yL) * (xEnd / W);
      const pY = yEnd - pl.h / 2;
      ctaSvg = pill(px, pY, c.cta, { size: 30, cls: `${P}cta` }).svg;
    }
    body += `<g class="${P}beam">${speedLines(0, yL, xEnd, yEnd, { n: 3, w0: 22, gapX: 2.4, taperLen: n === 5 ? 0.18 : 0 })}</g>`;
    body += ctaSvg;
    // Top row: lockup left (fixed position across the series), mono label right.
    const lk = lockup(M, M, 60, { cls: `${P}brand` });
    body += lk.svg;
    body += label(W - M, M + 30 - capHeight(22, 'm500') / 2, c.label, 22, C.green, 'end', `${P}label`).svg;
    // Headline and subhead.
    const size = c.headline.split(' ').length > 7 ? 108 : 132;
    const hl = textBlock(M, 300, c.headline, { size, maxW: W - 2 * M, fill: C.white, cls: `${P}hl` });
    body += hl.svg;
    const sb = textBlock(M, hl.last + 64, c.subhead, { size: 38, style: 'b400', maxW: 760, fill: C.gray, lh: 1.35, cls: `${P}sub` });
    body += sb.svg;
    const svg = svgDoc(W, H, body, { title: { id: `${P}a11y`, text: `XOOTEQ belief ${n} of 5: ${c.headline}` }, desc: `${c.subhead}${c.cta ? ' ' + c.cta : ''}` });
    add({ id: `carousel-beliefs-${n}`, file: `social/carousel-beliefs-${n}.svg`, W, H, svg, textBottom: sb.last,
      format: 'carousel-slide 4:5', composition: 'type-led (+ continuous beam across slides)',
      finding: n === 1 ? 'pop-out and first-glance: one big headline, one bright line (layout.json); implied motion from the diagonal (CM research 3, Kourtzi & Kanwisher 2000)' : n === 5 ? 'carousel ends on the CTA (formats.json carousel-slide); the beam that ran through every slide lands on it (grouping, continuity)' : 'repetition with variation: same skeleton, new belief (layout.json repetition, wear-out)' });
  });
}

// =====================================================================================================
// 6  Seedling post (photo-led, monument: low horizon, the sprout looms). Text: top band on the solid end of a
//    fade into Black, bottom solid band.
// =====================================================================================================
{
  const c = copy('post-seedling.copy.json');
  const W = 1080, H = 1350, M = 72, P = 'xq2-seed-';
  const ph = await photo('green-seedling.jpg', { name: 'seedling', crop: [0.275, 0, 0.45, 1], out: [864, 1080], ladder: 'green', mid: 0.52, lift: 0.02 });
  const place = { x: 0, y: 170, w: 1080, h: 1350 };
  let body = `<defs>${fade(`${P}top`, 0, 0, 0, 1, 0.35)}${fade(`${P}bot`, 0, 1, 0, 0, 0.25)}</defs>`;
  body += `<rect width="${W}" height="${H}" fill="${C.black}"/>`;
  body += img(`${P}photo`, ph, place.x, place.y, place.w, place.h);
  body += `<rect x="0" y="0" width="${W}" height="520" fill="url(#${P}top)"/>`;
  const bandY = 1060;
  body += `<rect x="0" y="${bandY - 120}" width="${W}" height="140" fill="url(#${P}bot)"/><rect x="0" y="${bandY}" width="${W}" height="${H - bandY}" fill="${C.black}"/>`;
  const lk = lockup(M, M, 60, { cls: `${P}brand` });
  body += lk.svg;
  body += label(W - M, M + 30 - capHeight(22, 'm500') / 2, c.label, 22, C.green, 'end', `${P}label`).svg;
  const hl = textBlock(M, 196, c.headline, { size: 100, maxW: W - 2 * M, fill: C.white, cls: `${P}hl` });
  body += hl.svg;
  const sb = textBlock(M, bandY + 46, c.subhead, { size: 34, style: 'b400', maxW: W - 2 * M, fill: C.gray, lh: 1.3, cls: `${P}sub` });
  body += sb.svg;
  body += pill(M, sb.last + 34, c.cta, { size: 26, cls: `${P}cta` }).svg;
  measure('post-seedling', ph, place, [{ name: 'headline', x: M, y: 196, w: hl.w, h: hl.h + 20 }, { name: 'subhead+cta (band)', x: M, y: bandY + 40, w: W - 2 * M, h: 130 }], [{ x: 380, y: 520, w: 320, h: 420 }]);
  add({ id: 'post-seedling', file: 'social/post-seedling.svg', W, H, svg: svgDoc(W, H, body, { title: { id: `${P}a11y`, text: `XOOTEQ: ${c.headline}` }, desc: 'A sprout rising from soil laced with glowing circuit traces. ' + c.subhead }),
    format: 'instagram-post 4:5', composition: 'monument (low horizon, object looms) + top lettering zone + bottom band',
    finding: 'picture-superiority and photo-saliency: the sprout is the subject, text sits beside it in the calmest zone (media.json placement 3-4); word-picture figure: headline and image complete each other (W5, McQuarrie & Mick 1999)' });
}

// =====================================================================================================
// 7  Green story with a poll sticker zone (photo-led, stacked). Safe area: top 14%, bottom 35%, sides 6%.
// =====================================================================================================
{
  const c = copy('story-green.copy.json');
  const W = 1080, H = 1920, P = 'xq2-sgreen-';
  const SX = W * 0.06, ST = H * 0.14, SB = H * 0.65;
  const ph = await photo('hero-trees.jpg', { name: 'story-green', crop: [0.47, 0, 0.395, 1], out: [758, 1080], ladder: 'green', mid: 0.5, lift: 0.02 });
  const place = { x: -95, y: 700, w: 1270, h: 1810 };
  let body = `<defs>${fade(`${P}top`, 0, 0, 0, 1, 0.42)}</defs><rect width="${W}" height="${H}" fill="${C.black}"/>`;
  body += img(`${P}photo`, ph, place.x, place.y, place.w, place.h);
  body += `<rect x="0" y="${place.y}" width="${W}" height="260" fill="url(#${P}top)"/>`;
  const M = SX + 12;
  const lk = lockup(M, ST + 10, 56, { cls: `${P}brand` });
  body += lk.svg;
  const lb = label(M, ST + 110, c.label, 22, C.green, 'start', `${P}label`);
  body += lb.svg;
  const hl = textBlock(M, ST + 160, c.headline, { size: 92, maxW: W - 2 * M, fill: C.white, cls: `${P}hl` });
  body += hl.svg;
  const sb = textBlock(M, hl.last + 44, c.subhead, { size: 38, style: 'b400', maxW: W - 2 * M, fill: C.gray, lh: 1.3, cls: `${P}sub` });
  body += sb.svg;
  // Poll sticker zone (added in the app); the guide layer is hidden in the published file.
  const z = { x: 150, y: 1000, w: 780, h: 220 };
  const cta = textBlock(M, sb.last + 40, c.cta + ' ↓', { size: 36, style: 'd800', fill: C.green, cls: `${P}cta` });
  body += cta.svg;
  body += `<g class="${P}guide" style="display:none"><rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="28" fill="none" stroke="${C.white}" stroke-width="3" stroke-dasharray="14 10"/>${label(W / 2, z.y + z.h / 2 - 8, 'Poll sticker: Yes / Not yet', 22, C.white, 'middle').svg}</g>`;
  measure('story-green', ph, place, [{ name: 'headline+sub', x: M, y: ST + 160, w: W - 2 * M, h: sb.last - ST - 160 }, { name: 'sticker zone (opaque sticker over the canopy)', x: z.x, y: z.y, w: z.w, h: z.h }], [{ x: 380, y: 900, w: 600, h: 600 }]);
  add({ id: 'story-green', file: 'social/story-green.svg', W, H, svg: svgDoc(W, H, body, { title: { id: `${P}a11y`, text: `XOOTEQ story: ${c.headline}` }, desc: `Luminous trees. ${c.subhead} Poll sticker: Yes or Not yet.` }), guide: `.${P}guide`, sticker: z,
    format: 'story 9:16 (poll sticker)', composition: 'stacked: brand, headline, sticker in the central band',
    finding: 'touch-centre and safe areas: words and the poll in the central band, clear of the top 14% and bottom 35% (layout.json); an interactive sticker turns the message into a two-second action (S6)' });
}

// =====================================================================================================
// 8  Tree poster (monument, low horizon at 75%, bottom lettering band with the brand word large).
// =====================================================================================================
{
  const c = copy('poster-tree.copy.json');
  const W = 1190, H = 1684, P = 'xq2-ptree-', M = 72;
  const ph = await photo('green-tree-frames/frame-120.png', { name: 'poster-tree', crop: [0.19, 0.17, 0.62, 0.82], out: [1080, 803], ladder: 'green', mid: 0.55, lift: 0.07 });
  const place = { x: 0, y: 438, w: W, h: W * 803 / 1080 };
  const bandY = 1330;
  let body = `<defs>${fade(`${P}bot`, 0, 1, 0, 0, 0)}${fade(`${P}top`, 0, 0, 0, 1, 0)}</defs><rect width="${W}" height="${H}" fill="${C.black}"/>`;
  body += img(`${P}photo`, ph, place.x, place.y, place.w, place.h);
  body += `<rect x="0" y="${place.y - 2}" width="${W}" height="80" fill="url(#${P}top)"/>`;
  body += `<rect x="0" y="${bandY - 90}" width="${W}" height="92" fill="url(#${P}bot)"/>`;
  body += `<rect x="0" y="${bandY}" width="${W}" height="${H - bandY}" fill="${C.gray}"/>`;
  const lb = label(M, 88, c.label, 24, C.green, 'start', `${P}label`);
  body += lb.svg;
  const hl = textBlock(M, 140, c.headline, { size: 122, maxW: W - 2 * M, fill: C.white, cls: `${P}hl` });
  body += hl.svg;
  const sb = textBlock(M, hl.last + 44, c.subhead, { size: 30, style: 'b400', maxW: 820, fill: C.gray, lh: 1.35, cls: `${P}sub` });
  body += sb.svg;
  // Lettering band: tile + brand word large (CM5: 45-90% of the width), CTA in mono.
  const tile = 132;
  body += lockup(M, bandY + 58, tile, { word: false, cls: `${P}brand` }).svg;
  const bw = W - 2 * M - tile - 40;
  let bsize = 200; while (textWidth('XOOTEQ', bsize, 'd800', 0.12) > bw) bsize -= 2;
  body += `<text class="${P}brand" x="${M + tile + 40}" y="${r(bandY + 58 + tile / 2 + capHeight(bsize) / 2)}" font-family="${L.FAM.sans}" font-weight="800" font-size="${bsize}" letter-spacing="${r(bsize * 0.12, 2)}" fill="${C.black}">XOOTEQ</text>`;
  body += label(M, bandY + 58 + tile + 52, c.cta, 26, C.black, 'start', `${P}cta`).svg;
  measure('poster-tree', ph, place, [{ name: 'headline (above the image)', x: M, y: 440, w: 600, h: 60 }], [{ x: 200, y: 470, w: 800, h: 800 }]);
  add({ id: 'poster-tree', file: 'print/poster-tree.svg', W, H, svg: svgDoc(W, H, body, { title: { id: `${P}a11y`, text: `XOOTEQ poster: ${c.headline}` }, desc: `A grown tree on dark soil, lit from within. ${c.subhead} ${c.cta}` }),
    format: 'poster A-ratio (A2/A3)', composition: 'monument: low horizon (75%), tree looming, lettering band 21% with the brand word at 74% of the width',
    finding: 'first-impression (50 ms): one silhouette on black reads before any word; Pieters & Wedel 2004: one strong picture plus large lettering and a big brand name each earn attention (CM evidence)' });
}

// =====================================================================================================
// 9-12  Build With Us carousel. Continuous element: the 'table edge', a Sea Green rule at y 1180 on every slide.
// =====================================================================================================
const TABLE_Y = 1180;
{
  const cp = copy('carousel-build.copy.json');
  const W = 1080, H = 1350, M = 72;
  const tableRule = (P) => `<rect class="${P}table" x="0" y="${TABLE_Y}" width="${W}" height="6" fill="${C.green}"/>`;
  const top = (P, c, accent = C.green) => lockup(M, M, 60, { cls: `${P}brand` }).svg + label(W - M, M + 30 - capHeight(22, 'm500') / 2, c.label, 22, accent, 'end', `${P}label`).svg;

  // 1: the hook, photo of a hand drawing plans under a lamp (warm duotone), headline in the calm black beside the screen.
  {
    const c = cp[0], P = 'xq2-bld1-';
    const ph = await photo('build-hands.jpg', { name: 'build-hands-4x5', crop: [0.30, 0, 0.45, 1], out: [864, 1080], ladder: 'warm', mid: 0.5, lift: 0.03 });
    const place = { x: 0, y: 40, w: 1080, h: 1350 };
    let body = `<defs>${fade(`${P}bot`, 0, 1, 0, 0, 0)}</defs><rect width="${W}" height="${H}" fill="${C.black}"/>` + img(`${P}photo`, ph, place.x, place.y, place.w, place.h);
    body += `<rect x="0" y="${TABLE_Y - 90}" width="${W}" height="92" fill="url(#${P}bot)"/><rect x="0" y="${TABLE_Y}" width="${W}" height="${H - TABLE_Y}" fill="${C.black}"/>`;
    body += tableRule(P) + top(P, c, C.orange);
    const hl = textBlock(M, 210, c.headline, { size: 80, maxW: 500, fill: C.white, cls: `${P}hl`, balance: false });
    body += hl.svg;
    const sb = textBlock(M, TABLE_Y + 48, c.subhead, { size: 34, style: 'b400', maxW: 900, fill: C.gray, lh: 1.3, cls: `${P}sub` });
    body += sb.svg;
    measure('carousel-build-1', ph, place, [{ name: 'headline (calm region left of the screen)', x: M, y: 210, w: hl.w, h: hl.h + 10 }], [{ x: 560, y: 120, w: 520, h: 420 }, { x: 420, y: 560, w: 560, h: 420 }]);
    add({ id: 'carousel-build-1', file: 'social/carousel-build-1.svg', W, H, svg: svgDoc(W, H, body, { title: { id: `${P}a11y`, text: `XOOTEQ Build With Us 1 of 4: ${c.headline}` }, desc: `A hand drawing plans under a lamp, a screen glowing behind. ${c.subhead}` }),
      format: 'carousel-slide 4:5', composition: 'full-bleed photo + calm region + band (the table edge)',
      finding: 'real-photos: a real hand at work is looked at, filler stock is skipped (media.json); photo-saliency: the glowing screen and lit paper hold the eye, the headline sits in the calm black between them' });
  }
  // 2: what you get, grid of six.
  {
    const c = cp[1], P = 'xq2-bld2-';
    let body = `<rect width="${W}" height="${H}" fill="${C.black}"/>` + tableRule(P) + top(P, c);
    const hl = textBlock(M, 200, c.headline, { size: 84, maxW: 860, fill: C.white, cls: `${P}hl` });
    body += hl.svg;
    const items = [['01', 'Workspace'], ['02', 'Living space'], ['03', 'Hardware'], ['04', 'GPU access'], ['05', 'Dev infrastructure'], ['06', 'Peers who make you better']];
    const gx = M, gy = hl.last + 90, cw = (W - 2 * M - 30) / 2, chh = (TABLE_Y - 60 - gy) / 3;
    items.forEach(([n, t], k) => {
      const x = gx + (k % 2) * (cw + 30), y = gy + Math.floor(k / 2) * chh;
      body += `<rect class="${P}rule" x="${r(x)}" y="${r(y)}" width="${r(cw)}" height="3" fill="${C.gray}"/>`;
      body += label(x, y + 30, n, 22, C.green, 'start', `${P}n`).svg;
      body += textBlock(x, y + 76, t, { size: 40, maxW: cw - 10, fill: C.white, lh: 1.1, cls: `${P}item` }).svg;
    });
    body += textBlock(M, TABLE_Y + 48, 'Plus resources, connections and funding when it fits.', { size: 30, style: 'b400', maxW: 940, fill: C.gray, cls: `${P}foot` }).svg;
    add({ id: 'carousel-build-2', file: 'social/carousel-build-2.svg', W, H, svg: svgDoc(W, H, body, { title: { id: `${P}a11y`, text: `XOOTEQ Build With Us 2 of 4: ${c.headline}` }, desc: c.body }),
      format: 'carousel-slide 4:5', composition: 'grid-of-n (2 x 3 on the table edge)',
      finding: 'grouping (common region and proximity: number and name together, groups twice as far apart) and scan-patterns: front-loaded item names (layout.json)' });
  }
  // 3: three steps rising on a diagonal (Kauffer's 'flock rising along one diagonal'), airbrushed risers.
  {
    const c = cp[2], P = 'xq2-bld3-';
    let body = `<defs><linearGradient id="${P}riser" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.gray}"/><stop offset="1" stop-color="${C.black}"/></linearGradient><linearGradient id="${P}riserA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.green}"/><stop offset="1" stop-color="${C.black}"/></linearGradient></defs>`;
    body += `<rect width="${W}" height="${H}" fill="${C.black}"/>` + top(P, c);
    const hl = textBlock(M, 200, c.headline, { size: 96, maxW: 900, fill: C.white, cls: `${P}hl` });
    body += hl.svg;
    const steps = [['1', 'Apply', 'What you’re building, what you’ve built, what you need.'], ['2', 'Connect', 'If it fits, we talk. Everyone gets a reply.'], ['3', 'Build', 'Take your seat and ship something that matters.']];
    const sw = (W - 2 * M) / 3, rise = sw * Math.tan(24 * Math.PI / 180); // 24 degree diagonal
    steps.forEach(([n, name, txt], k) => {
      const x = M + k * sw, topY = TABLE_Y - 150 - k * rise;
      const acc = k === 2;
      body += `<rect class="${P}step" x="${r(x)}" y="${r(topY)}" width="${r(sw - 8)}" height="${r(TABLE_Y - topY)}" fill="url(#${acc ? `${P}riserA` : `${P}riser`})"/>`;
      body += `<rect x="${r(x)}" y="${r(topY)}" width="${r(sw - 8)}" height="10" fill="${acc ? C.green : C.white}"/>`;
      body += label(x, topY - 196, n, 26, acc ? C.green : C.gray, 'start', `${P}n`).svg;
      body += textBlock(x, topY - 150, name, { size: 46, fill: C.white, cls: `${P}name` }).svg;
      body += textBlock(x, topY - 88, txt, { size: 24, style: 'b400', maxW: sw - 24, fill: C.gray, lh: 1.3, cls: `${P}txt` }).svg;
    });
    body += tableRule(P);
    body += textBlock(M, TABLE_Y + 48, 'No pitch deck, no demo day. Start at hello@xooteq.com', { size: 30, style: 'b400', maxW: 940, fill: C.gray, cls: `${P}foot` }).svg;
    add({ id: 'carousel-build-3', file: 'social/carousel-build-3.svg', W, H, svg: svgDoc(W, H, body, { title: { id: `${P}a11y`, text: `XOOTEQ Build With Us 3 of 4: ${c.headline}` }, desc: c.body }),
      format: 'carousel-slide 4:5', composition: 'diagonal: three steps rising at 24 degrees to the accent (Build)',
      finding: 'the plan in three steps (StoryBrand S5) drawn as a climb: implied motion of the diagonal (Kourtzi & Kanwisher 2000); pop-out: only the last step is Sea Green' });
  }
  // 4: the promise + CTA, two silhouettes in a workshop facing each other (green duotone).
  {
    const c = cp[3], P = 'xq2-bld4-';
    const ph = await photo('builders-dreamers.jpg', { name: 'builders', crop: [0.2, 0.04, 0.64, 0.92], out: [1080, 878], ladder: 'green', mid: 0.5, lift: 0.02 });
    const place = { x: 0, y: 0, w: 1080, h: 878 };
    let body = `<defs>${fade(`${P}bot`, 0, 1, 0, 0, 0)}</defs><rect width="${W}" height="${H}" fill="${C.black}"/>` + img(`${P}photo`, ph, place.x, place.y, place.w, place.h);
    const textY = 700;
    body += `<rect x="0" y="${textY - 200}" width="${W}" height="202" fill="url(#${P}bot)"/><rect x="0" y="${textY}" width="${W}" height="${H - textY}" fill="${C.black}"/>`;
    body += lockup(M, M, 60, { cls: `${P}brand` }).svg + label(W - M, M + 30 - capHeight(22, 'm500') / 2, c.label, 22, C.green, 'end', `${P}label`).svg;
    const hl = textBlock(M, textY + 20, c.headline, { size: 84, maxW: W - 2 * M, fill: C.white, cls: `${P}hl` });
    body += hl.svg;
    const sb = textBlock(M, hl.last + 44, c.subhead, { size: 34, style: 'b400', maxW: 900, fill: C.gray, lh: 1.3, cls: `${P}sub` });
    body += sb.svg;
    body += `<rect class="${P}table" x="0" y="${TABLE_Y}" width="${W}" height="6" fill="${C.green}"/>`;
    body += pill(M, TABLE_Y + 44, c.cta, { size: 30, cls: `${P}cta` }).svg;
    measure('carousel-build-4', ph, place, [{ name: 'lockup + label (top)', x: M, y: M, w: W - 2 * M, h: 60 }, { name: 'headline', x: M, y: textY + 20, w: W - 2 * M, h: 170 }], [{ x: 280, y: 280, w: 520, h: 560 }]);
    add({ id: 'carousel-build-4', file: 'social/carousel-build-4.svg', W, H, svg: svgDoc(W, H, body, { title: { id: `${P}a11y`, text: `XOOTEQ Build With Us 4 of 4: ${c.headline}` }, desc: `Two builders talking in a misty workshop. ${c.subhead} ${c.cta}` }),
      format: 'carousel-slide 4:5', composition: 'split portrait: image top, words below on the table edge, CTA on the table',
      finding: 'gaze-cue: the two figures face each other, so the eye settles in the frame and drops to the headline below; carousel ends on the CTA (formats.json); S6 direct CTA' });
  }
}

// =====================================================================================================
// 13  LinkedIn 1:1: the empty studio desk.
// =====================================================================================================
{
  const c = copy('linkedin-desk.copy.json');
  const W = 1200, H = 1200, M = 76, P = 'xq2-lin-';
  const ph = await photo('about-studio.jpg', { name: 'linkedin-studio', crop: [0.05, 0, 0.5625, 1], out: [1080, 1080], ladder: 'green', mid: 0.5, lift: 0.04 });
  const place = { x: 0, y: 0, w: 1200, h: 1200 };
  const bandY = 990;
  let body = `<defs>${fade(`${P}bot`, 0, 1, 0, 0, 0)}</defs><rect width="${W}" height="${H}" fill="${C.black}"/>` + img(`${P}photo`, ph, place.x, place.y, place.w, place.h);
  body += `<rect x="0" y="${bandY - 70}" width="${W}" height="72" fill="url(#${P}bot)"/><rect x="0" y="${bandY}" width="${W}" height="${H - bandY}" fill="${C.black}"/>`;
  body += lockup(M, 56, 56, { cls: `${P}brand` }).svg + label(W - M, 56 + 28 - capHeight(22, 'm500') / 2, c.label, 22, C.green, 'end', `${P}label`).svg;
  const hl = textBlock(M, 250, c.headline, { size: 88, maxW: 820, fill: C.white, cls: `${P}hl` });
  body += hl.svg;
  const sb = textBlock(M, bandY + 50, c.subhead, { size: 32, style: 'b400', maxW: 600, fill: C.gray, lh: 1.3, cls: `${P}sub` });
  body += sb.svg;
  const pl = pill(0, 0, c.cta, { size: 28 });
  body += pill(W - M - pl.w, bandY + 50 + (sb.h - pl.h) / 2 + 2, c.cta, { size: 28, cls: `${P}cta` }).svg;
  measure('linkedin-desk', ph, place, [{ name: 'headline (wall)', x: M, y: 250, w: hl.w, h: hl.h + 10 }], [{ x: 0, y: 560, w: 1200, h: 640 }]);
  add({ id: 'linkedin-desk', file: 'social/linkedin-desk.svg', W, H, svg: svgDoc(W, H, body, { title: { id: `${P}a11y`, text: `XOOTEQ: ${c.headline}` }, desc: `An empty studio with desks and plants under a green light bar. ${c.subhead} ${c.cta}` }),
    format: 'instagram-post 1:1 (LinkedIn)', composition: 'full-bleed photo + calm region (the wall) + bottom band',
    finding: 'word-picture figure (W5): the empty desk is the invitation, the words name it; calm-region placement on the measured wall (media.json placement 4)' });
}

// =====================================================================================================
// 14  Build story with a question sticker at the vanishing point (tunnel).
// =====================================================================================================
{
  const c = copy('story-build.copy.json');
  const W = 1080, H = 1920, P = 'xq2-sbuild-';
  const SX = W * 0.06, ST = H * 0.14;
  const ph = await photo('green-revolution-room.jpg', { name: 'story-room', crop: [0.205, 0, 0.59, 1], out: [604, 1024], ladder: 'green', mid: 0.5, lift: 0.0 });
  const place = { x: -10, y: 0, w: 1100, h: 1920 };
  let body = `<rect width="${W}" height="${H}" fill="${C.black}"/>` + img(`${P}photo`, ph, place.x, place.y, place.w, place.h);
  const M = SX + 12;
  body += lockup(M, ST + 10, 56, { cls: `${P}brand` }).svg;
  body += label(M, ST + 110, c.label, 22, C.green, 'start', `${P}label`).svg;
  const hl = textBlock(M, ST + 160, c.headline, { size: 92, maxW: W - 2 * M, fill: C.white, cls: `${P}hl` });
  body += hl.svg;
  const sb = textBlock(M, hl.last + 44, c.subhead, { size: 38, style: 'b400', maxW: W - 2 * M, fill: C.gray, lh: 1.3, cls: `${P}sub` });
  body += sb.svg;
  const z = { x: 170, y: 930, w: 740, h: 250 };
  body += textBlock(W / 2, z.y - 66, c.cta, { size: 34, fill: C.white, anchor: 'middle', cls: `${P}cta` }).svg;
  body += `<g class="${P}guide" style="display:none"><rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="28" fill="none" stroke="${C.white}" stroke-width="3" stroke-dasharray="14 10"/>${label(W / 2, z.y + z.h / 2 - 8, 'Question sticker: I’m building…', 22, C.white, 'middle').svg}</g>`;
  measure('story-build', ph, place, [{ name: 'headline+sub', x: M, y: ST + 160, w: W - 2 * M, h: sb.last - ST - 160 }, { name: 'cta', x: 260, y: z.y - 66, w: 560, h: 36 }]);
  add({ id: 'story-build', file: 'social/story-build.svg', W, H, svg: svgDoc(W, H, body, { title: { id: `${P}a11y`, text: `XOOTEQ story: ${c.headline}` }, desc: `A dark room lined with green light columns. ${c.subhead} Question sticker.` }), guide: `.${P}guide`, sticker: z,
    format: 'story 9:16 (question sticker)', composition: 'tunnel: one-point perspective, the sticker at the vanishing point (CM placement tunnel)',
    finding: 'converging lines lead the eye to the vanishing point (CM perspective rule: put the focal element there), where the answer box sits; touch-centre: the sticker in the central band' });
}

// =====================================================================================================
// 15  Web banner 970 x 250 (split: words left, photo right with a fade).
// =====================================================================================================
{
  const c = copy('banner-build.copy.json');
  const W = 970, H = 250, P = 'xq2-ban-', M = 30;
  const ph = await photo('build-hands.jpg', { name: 'banner-hands', crop: [0.3, 0.36, 0.62, 0.55], out: [1080, 539], ladder: 'warm', mid: 0.5, lift: 0.03 });
  const place = { x: 420, y: -5, w: 550, h: 275 };
  let body = `<defs>${fade(`${P}l`, 0, 0, 1, 0, 0)}</defs><rect width="${W}" height="${H}" fill="${C.black}"/>` + img(`${P}photo`, ph, place.x, place.y, place.w, place.h);
  body += `<rect x="${place.x - 1}" y="0" width="190" height="${H}" fill="url(#${P}l)"/>`;
  body += lockup(M, 24, 34, { cls: `${P}brand` }).svg;
  const hl = textBlock(M, 84, c.headline, { size: 44, lines: ['Bring your idea.', 'Find GPUs here.'], fill: C.white, lh: 1.05, cls: `${P}hl` });
  body += hl.svg;
  body += textBlock(M, 202, c.subhead, { size: 18, style: 'b400', fill: C.gray, cls: `${P}sub` }).svg;
  body += pill(318, 182, c.cta, { size: 18, h: 44, cls: `${P}cta` }).svg;
  measure('banner-build', ph, place, [{ name: 'photo side (no text)', x: 700, y: 30, w: 200, h: 60 }]);
  add({ id: 'banner-build', file: 'web/banner-build.svg', W, H, svg: svgDoc(W, H, body, { title: { id: `${P}a11y`, text: `XOOTEQ: ${c.headline}` }, desc: `${c.subhead} ${c.cta}. A hand drawing plans under a lamp.` }),
    format: 'web-banner 970x250', composition: 'split: words on the reading-start side, photo right',
    finding: 'left-lean: headline, brand and CTA on the reading-start side (layout.json); banner-blindness: one headline, one brand, one button, a real photo rather than an ad strip' });
}

// =====================================================================================================
// 16  Landing hero 16:9 (split + fade into Black, trees on the right, light streaks as speed lines).
// =====================================================================================================
{
  const c = copy('hero-landing.copy.json');
  const W = 1920, H = 1080, P = 'xq2-hero-', M = 120;
  const ph = await photo('hero-trees.jpg', { name: 'hero-trees', crop: [0.36, 0, 0.64, 1], out: [1080, 950], ladder: 'green', mid: 0.5, lift: 0.02 });
  const place = { x: 692, y: 0, w: 1228, h: 1080 };
  let body = `<defs>${fade(`${P}l`, 0, 0, 1, 0, 0)}</defs><rect width="${W}" height="${H}" fill="${C.black}"/>` + img(`${P}photo`, ph, place.x, place.y, place.w, place.h);
  body += `<rect x="${place.x - 1}" y="0" width="360" height="${H}" fill="url(#${P}l)"/>`;
  body += lockup(M, 90, 60, { cls: `${P}brand` }).svg;
  body += label(M, 300, c.label, 24, C.green, 'start', `${P}label`).svg;
  const hl = textBlock(M, 350, c.headline, { size: 96, maxW: 820, fill: C.white, cls: `${P}hl` });
  body += hl.svg;
  const sb = textBlock(M, hl.last + 54, c.subhead, { size: 28, style: 'b400', maxW: 700, fill: C.gray, lh: 1.45, cls: `${P}sub` });
  body += sb.svg;
  body += pill(M, sb.last + 64, c.cta, { size: 28, cls: `${P}cta` }).svg;
  measure('hero-landing', ph, place, [{ name: 'text column (left of photo)', x: 700, y: 350, w: 260, h: 300 }], [{ x: 1180, y: 0, w: 740, h: 700 }]);
  add({ id: 'hero-landing', file: 'web/hero-landing.svg', W, H, svg: svgDoc(W, H, body, { title: { id: `${P}a11y`, text: `XOOTEQ: ${c.headline}` }, desc: `Luminous trees with light streaking through them. ${c.subhead}` }),
    format: 'landing-hero 16:9', composition: 'split: words left on flat Black, photo right fading in (hero-video-split-scrim layout)',
    finding: 'left-lean and picture-captures: headline, brand and button on the reading-start side, picture on its own slot; the light streaks act as speed lines pointing at the words (CM3)' });
}

// =====================================================================================================
// 17  DUMBORD thumbnail 16:9: the figure looks up and right, toward the headline (gaze cue).
// =====================================================================================================
{
  const c = copy('thumbnail-dumbord.copy.json');
  const W = 1280, H = 720, P = 'xq2-thumb-', M = 64;
  const ph = await photo('creation-vr.png', { name: 'thumb-vr', crop: [0.04, 0.17, 0.96, 0.63], out: [707, 824], ladder: 'warm', mid: 0.48, lift: 0.04 });
  const place = { x: 0, y: -4, w: 618, h: 720 };
  let body = `<defs>${fade(`${P}r`, 1, 0, 0, 0, 0)}</defs><rect width="${W}" height="${H}" fill="${C.black}"/>` + img(`${P}photo`, ph, place.x, place.y, place.w, place.h);
  body += `<rect x="${place.x + place.w - 120}" y="0" width="121" height="${H}" fill="url(#${P}r)"/>`;
  const tx = 640;
  body += label(tx, 96, c.label, 24, C.orange, 'start', `${P}label`).svg;
  let size = 150; while (textWidth('No crew.', size, 'd800', -0.025) > W - tx - M) size -= 2;
  const hl = textBlock(tx, 150, c.headline, { size, lines: ['No set.', 'No crew.'], fill: C.white, lh: 1.0, cls: `${P}hl` });
  body += hl.svg;
  body += lockup(tx, hl.last + 70, 56, { cls: `${P}brand` }).svg;
  measure('thumbnail-dumbord', ph, place, [{ name: 'photo side', x: 420, y: 520, w: 150, h: 120 }], [{ x: 120, y: 60, w: 420, h: 400 }]);
  add({ id: 'thumbnail-dumbord', file: 'social/thumbnail-dumbord.svg', W, H, svg: svgDoc(W, H, body, { title: { id: `${P}a11y`, text: `DUMBORD by XOOTEQ: ${c.headline}` }, desc: 'A figure in a VR headset outlined in orange light, looking up toward the words.' }), stamp: { x: 1024, y: 612, w: 256, h: 108 },
    format: 'thumbnail 16:9', composition: 'split: face left, gaze right to the headline (thumbnail-photo-gaze layout)',
    finding: 'faces-first and gaze-cue: the face wins the first fixation and its gaze hands the eye to the headline (Cerf et al. 2008; Sajjacholapunt & Ball 2014); readable at 320 px; bottom-right duration stamp kept clear' });
}

// =====================================================================================================
// 18  DUMBORD post on the daylight palette (Sachplakat object: a chrome wave; Black band with the words).
// =====================================================================================================
{
  const c = copy('post-dumbord.copy.json');
  const W = 1080, H = 1350, P = 'xq2-dum-', M = 72;
  // mid set to the ground's tone so the photo's pale backdrop becomes Neutral Gray (the ground).
  const ph = await photo('xo-studio.jpg', { name: 'dumbord-chrome', crop: [0, 0.2, 1, 0.76], out: [1080, 821], ladder: 'neutral', mid: 0.86, gamma: 1.0 });
  const place = { x: 0, y: 430, w: 1080, h: 821 };
  const bandY = 1110;
  let body = `<rect width="${W}" height="${H}" fill="${DAY.ground}"/>` + img(`${P}photo`, ph, place.x, place.y, place.w, place.h);
  body += `<rect x="0" y="${bandY}" width="${W}" height="${H - bandY}" fill="${C.black}"/>`;
  body += lockup(M, M, 60, { fill: DAY.ink, cls: `${P}brand` }).svg;
  body += label(W - M, M + 30 - capHeight(22, 'm500') / 2, c.label, 22, DAY.ink, 'end', `${P}label`).svg;
  const hl = textBlock(M, 196, c.headline, { size: 100, maxW: 900, fill: DAY.ink, cls: `${P}hl` });
  body += hl.svg;
  const sb = textBlock(M, bandY + 56, c.subhead, { size: 32, style: 'b400', maxW: 560, fill: C.gray, lh: 1.3, cls: `${P}sub` });
  body += sb.svg;
  const pl = pill(0, 0, c.cta, { size: 26, fill: DAY.accent });
  body += pill(W - M - pl.w, bandY + 56 + (sb.h - pl.h) / 2 + 2, c.cta, { size: 26, fill: DAY.accent, ink: C.black, cls: `${P}cta` }).svg;
  measure('post-dumbord', ph, place, [{ name: 'headline (flat ground above the object)', x: M, y: 330, w: 900, h: 60 }]);
  add({ id: 'post-dumbord', file: 'social/post-dumbord.svg', W, H, svg: svgDoc(W, H, body, { title: { id: `${P}a11y`, text: `DUMBORD by XOOTEQ: ${c.headline}` }, desc: `A liquid chrome wave. ${c.subhead} ${c.cta}` }),
    format: 'instagram-post 4:5 (daylight palette)', composition: 'object (Sachplakat): one object on flat ground, words above, band below',
    finding: 'MAYA: a familiar poster skeleton with one surprise (a liquid set that is not a set); wear-out: a light piece in a dark series keeps the feed from repeating itself (layout.json)' });
}

// =====================================================================================================
// 19  Family post: Plutto and Tailzu, grid of two split by one diagonal.
// =====================================================================================================
{
  const c = copy('post-family.copy.json');
  const W = 1080, H = 1350, P = 'xq2-fam-', M = 72;
  let body = `<rect width="${W}" height="${H}" fill="${C.black}"/>`;
  body += lockup(M, M, 60, { cls: `${P}brand` }).svg + label(W - M, M + 30 - capHeight(22, 'm500') / 2, c.label, 22, C.green, 'end', `${P}label`).svg;
  const hl = textBlock(M, 196, c.headline, { size: 84, maxW: 760, fill: C.white, cls: `${P}hl` });
  body += hl.svg;
  // Diagonal bar from lower left to upper right (26 degrees), dividing the two cells.
  const y0 = 1150, y1 = y0 - W * Math.tan(26 * Math.PI / 180);
  body += `<g class="${P}bar">${speedLines(-20, y0 + 10, W + 20, y1 + 10, { n: 1, w0: 16 })}</g>`;
  const name = (x, y, n, txt, anchor) => textBlock(x, y, n, { size: 150, fill: C.white, anchor, cls: `${P}name` }).svg + textBlock(x, y + 150, txt, { size: 32, style: 'b400', maxW: 470, fill: C.gray, lh: 1.3, anchor, cls: `${P}line`, lines: wrap(txt, 32, 470, 'b400') }).svg;
  body += name(M, 470, 'Plutto', 'Astrology across every tradition, read from your own chart.', 'start');
  body += name(W - M, 880, 'Tailzu', 'A keyboard that writes what you mean.', 'end');
  body += pill(M, 1210, c.cta, { size: 28, cls: `${P}cta` }).svg;
  add({ id: 'post-family', file: 'social/post-family.svg', W, H, svg: svgDoc(W, H, body, { title: { id: `${P}a11y`, text: `XOOTEQ: ${c.headline}` }, desc: 'Plutto: astrology across every tradition, read from your own chart. Tailzu: a keyboard that writes what you mean. Join the beta at xooteq.com/creation.' }),
    format: 'instagram-post 4:5', composition: 'grid-of-2 on a diagonal (type-led)',
    finding: 'grouping: each product name sits with its own line, the two groups held apart by the diagonal (layout.json); brand beside the headline (O4) ties the family to the parent' });
}

// =====================================================================================================
// 20  Motion: growing tree (story 9:16, about 11 s). Frames from green-tree-frames, crossfaded (no flashes).
// =====================================================================================================
{
  const c = copy('motion-tree.copy.json');
  const W = 1080, H = 1920, P = 'xq2-mtree-', M = W * 0.06 + 12, ST = H * 0.14;
  const ids = ['001', '012', '022', '032', '042', '052', '064', '078', '095', '120'];
  const frames = [];
  for (const id of ids) frames.push(await photo(`green-tree-frames/frame-${id}.png`, { name: `tree-${id}`, crop: [0.2, 0.12, 0.6, 0.86], out: [540, 435], ladder: 'green', mid: 0.55, lift: 0.07, quality: 0.74 }));
  const place = { x: -30, y: 780, w: 1140, h: 1140 * 435 / 540 };
  // Timeline (ms). Holds from media.json on-screen-time: max(1.5 s, 0.375 s x words + 0.5 s).
  const T = 11600;
  const t = { growStart: 2600, step: 500, xfade: 300, cardOff: 7600, wipe: [7700, 8300], endIn: [10200, 10700] };
  const pct = (ms) => r((ms / T) * 100, 3);
  let css = '';
  // Frame k (k>=1) fades in over the previous one: opacity 0 until its time, then 1 (previous stays below: no dip in light).
  frames.forEach((f, k) => {
    if (k === 0) return;
    const s = t.growStart + (k - 1) * t.step;
    css += `@keyframes ${P}f${k}{0%,${pct(s)}%{opacity:0}${pct(s + t.xfade)}%,100%{opacity:1}}.${P}f${k}{animation:${P}f${k} ${T}ms linear 1 both}`;
  });
  // Card 1 (first frame, static while the tree grows), hard cut off at cardOff.
  css += `@keyframes ${P}c1{0%,${pct(t.cardOff)}%{opacity:1}${pct(t.cardOff + 1)}%,100%{opacity:0}}.${P}c1{animation:${P}c1 ${T}ms linear 1 both}`;
  // 'Does it matter?' wipes on (CM 'wipe': hard-edged mask left to right, 600 ms, cruise easing).
  css += `@keyframes ${P}w{0%,${pct(t.wipe[0])}%{clip-path:inset(0 100% 0 0)}${pct(t.wipe[1])}%,100%{clip-path:inset(0 0 0 0)}}.${P}wipe{animation:${P}w ${T}ms cubic-bezier(0.65,0,0.35,1) 1 both}`;
  // End line + CTA: band slides up (CM 'bandSlide' 500 ms, streamline easing) after the filter has been read.
  css += `@keyframes ${P}e{0%,${pct(t.endIn[0])}%{opacity:0;transform:translateY(24px)}${pct(t.endIn[1])}%,100%{opacity:1;transform:translateY(0)}}.${P}end{animation:${P}e ${T}ms cubic-bezier(0.22,1,0.36,1) 1 both}`;
  css += `@media (prefers-reduced-motion: reduce){[class^="${P}"],[class*=" ${P}"]{animation:none !important}}`;
  let body = `<defs>${fade(`${P}top`, 0, 0, 0, 1, 0)}${fade(`${P}bot`, 0, 1, 0, 0, 0)}</defs><rect width="${W}" height="${H}" fill="${C.black}"/>`;
  body += `<g>${frames.map((f, k) => img(`${P}frame${k}`, f, place.x, place.y, place.w, place.h, k ? ` class="${P}f${k}"` : '')).join('')}</g>`;
  body += `<rect x="0" y="${place.y - 2}" width="${W}" height="40" fill="url(#${P}top)"/><rect x="0" y="${r(place.y + place.h - 120)}" width="${W}" height="122" fill="url(#${P}bot)"/>`;
  // Brand early (zap-dispersion): lockup and label on screen from the first frame.
  body += lockup(M, ST + 10, 56).svg + label(M, ST + 110, c.label, 22, C.green).svg;
  // Card 1. Base state is hidden (opacity 0) so the reduced-motion and final frame show the end card.
  const c1 = textBlock(M, ST + 160, c.headline, { size: 92, maxW: W - 2 * M, fill: C.white });
  body += `<g class="${P}c1" style="opacity:0">${c1.svg}</g>`;
  const q = textBlock(M, ST + 160, 'Does it matter?', { size: 112, maxW: W - 2 * M, fill: C.white });
  body += `<g class="${P}wipe">${q.svg}</g>`;
  const endY = q.last + 60;
  const e1 = textBlock(M, endY, 'Then plant it.', { size: 44, style: 'd800', fill: C.green });
  const e2 = label(M, endY + 80, c.cta, 24, C.gray);
  body += `<g class="${P}end">${e1.svg}${e2.svg}</g>`;
  const svg = svgDoc(W, H, body, { title: { id: `${P}a11y`, text: 'XOOTEQ: It starts in the dirt. Does it matter? Then plant it.' }, desc: 'A seed in dark soil grows into a full tree in about five seconds, then the question Does it matter? and the line Then plant it, with xooteq.com/green-revolution. Reduced motion shows the final frame.', css });
  // Text over the moving frames: check the worst frame (media.json worst-frame) for the card zone.
  const zone = toImgBox({ x: M, y: ST + 160, w: W - 2 * M, h: q.h }, place);
  const worst = OV.analyseFrames(frames.map((f) => f.img), zone);
  overlayLog['motion-tree'] = { photo: 'green-tree-frames (10 frames)', ladder: 'green', sizeKB: frames.reduce((s, f) => s + f.kb, 0), zones: [{ zone: 'text cards (above the frames)', imageBox: zone, note: 'the cards sit above the image block on flat Black; analyseFrames on the overlap', worstFrameWhiteContrast: r(worst.contrastWith(C.white), 2) }] };
  add({ id: 'motion-tree', file: 'video/motion-tree.svg', W, H, svg, motion: { T, shots: [0, 1800, 4600, 7000, 8400, 11600] },
    format: 'story 9:16, animated SVG, 11.6 s', composition: 'monument (the tree grows on a low horizon) + stacked cards in the safe area',
    finding: 'brand early and still (video.json zap-dispersion, first-frame); one mover at a time (motion-onset); text static over moving frames in a still zone (media.json static-text); holds by on-screen-time; crossfades only brighten (no flash, video.json photosensitivity)' });
}

// =====================================================================================================
// 21  Motion: manifesto (4:5, about 24 s). One belief at a time wipes on, held for its reading time.
// =====================================================================================================
{
  const c = copy('motion-manifesto.copy.json');
  const beliefs = copy('carousel-beliefs.copy.json').map((b) => b.headline);
  const W = 1080, H = 1350, P = 'xq2-mman-', M = 72;
  const wipe = 600, gap = 250;
  const hold = (s) => Math.max(1500, 375 * s.split(/\s+/).length + 500) + 500; // reading time + 0.5 s margin
  let t0 = 600; const cards = [];
  for (const b of beliefs) { cards.push({ text: b, s: t0, e: t0 + wipe + hold(b) }); t0 = t0 + wipe + hold(b) + gap; }
  const endS = t0, T = endS + wipe + 3200;
  const pct = (ms) => r((ms / T) * 100, 3);
  let css = '';
  cards.forEach((cd, k) => {
    css += `@keyframes ${P}k${k}{0%,${pct(cd.s)}%{opacity:1;clip-path:inset(0 100% 0 0)}${pct(cd.s + wipe)}%{clip-path:inset(0 0 0 0);opacity:1}${pct(cd.e)}%{opacity:1;clip-path:inset(0 0 0 0)}${pct(cd.e + 1)}%,100%{opacity:0;clip-path:inset(0 0 0 0)}}.${P}k${k}{animation:${P}k${k} ${T}ms cubic-bezier(0.65,0,0.35,1) 1 both}`;
  });
  css += `@keyframes ${P}end{0%,${pct(endS)}%{clip-path:inset(0 100% 0 0)}${pct(endS + wipe)}%,100%{clip-path:inset(0 0 0 0)}}.${P}end{animation:${P}end ${T}ms cubic-bezier(0.65,0,0.35,1) 1 both}`;
  css += `@keyframes ${P}cta{0%,${pct(endS + wipe + 900)}%{opacity:0;transform:translateY(20px)}${pct(endS + wipe + 1400)}%,100%{opacity:1;transform:translateY(0)}}.${P}cta{animation:${P}cta ${T}ms cubic-bezier(0.22,1,0.36,1) 1 both}`;
  css += `@media (prefers-reduced-motion: reduce){[class^="${P}"],[class*=" ${P}"]{animation:none !important}}`;
  let body = `<rect width="${W}" height="${H}" fill="${C.black}"/>`;
  body += `<g>${speedLines(0, 1262, W, 952, { n: 3, w0: 22, gapX: 2.4 })}</g>`; // the beliefs carousel's beam, still
  body += lockup(M, M, 60).svg + label(W - M, M + 30 - capHeight(22, 'm500') / 2, c.label, 22, C.green, 'end').svg;
  cards.forEach((cd, k) => {
    const hl = textBlock(M, 300, cd.text, { size: cd.text.split(' ').length > 7 ? 96 : 112, maxW: W - 2 * M, fill: C.white });
    body += `<g class="${P}k${k}" style="opacity:0">${label(M, 240, `${k + 1}/5`, 22, C.gray).svg}${hl.svg}</g>`;
  });
  const q = textBlock(M, 300, c.headline, { size: 132, maxW: W - 2 * M, fill: C.white });
  body += `<g class="${P}end">${q.svg}</g>`;
  const sb = textBlock(M, q.last + 60, c.subhead, { size: 38, style: 'b400', maxW: 760, fill: C.gray, lh: 1.35 });
  body += `<g class="${P}cta">${sb.svg}${pill(M, sb.last + 50, c.cta, { size: 30 }).svg}</g>`;
  const svg = svgDoc(W, H, body, { title: { id: `${P}a11y`, text: 'XOOTEQ: five beliefs, one question. Does it matter?' }, desc: `Five beliefs appear one at a time: ${beliefs.join(' ')} Then: Does it matter? ${c.subhead} ${c.cta}. Reduced motion shows the final frame.`, css });
  add({ id: 'motion-manifesto', file: 'video/motion-manifesto.svg', W, H, svg, motion: { T, shots: [...cards.map((cd) => cd.s + wipe + 400), endS + wipe + 300, T] }, cards,
    format: 'instagram-post 4:5, animated SVG, ' + r(T / 1000, 1) + ' s', composition: 'type-led sequence (one card at a time) on the carousel beam',
    finding: 'on-screen-reading: each card held max(1.5 s, 0.375 s x words + 0.5 s) plus 0.5 s; one mover at a time (the wipe); text changes on a cut; ends on a still with brand and CTA (video.json end-still)' });
}

// =====================================================================================================
// Write SVGs, overlay results; render previews, QA and contact sheet.
// =====================================================================================================
for (const d of ['social', 'web', 'print', 'video']) rmSync(join(OUT, d), { recursive: true, force: true });
const report = [];
for (const p of pieces) {
  mkdirSync(join(OUT, p.file, '..'), { recursive: true });
  writeFileSync(join(OUT, p.file), p.svg);
  // Colour audit: every hex used must be in the palette (photos are embedded JPEGs, not hex values).
  const hexes = [...new Set((p.svg.replace(/href="data:[^"]+"/g, '').match(/#[0-9a-fA-F]{6}\b/g) || []).map((h) => h.toLowerCase()))];
  const stray = hexes.filter((h) => !L.ALLOWED_HEX.has(h));
  const ids = [...p.svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  const badIds = ids.filter((i) => !i.startsWith('xq2-'));
  const kb = Math.round(Buffer.byteLength(p.svg) / 1024);
  report.push({ id: p.id, file: p.file, kb, stray, badIds });
  console.log(`${p.file.padEnd(36)} ${String(kb).padStart(4)} KB${stray.length ? '  STRAY ' + stray : ''}${badIds.length ? '  UNPREFIXED ' + badIds : ''}${kb > 450 ? '  OVER 450 KB' : ''}`);
}
writeFileSync(join(OUT, 'overlay-results.json'), JSON.stringify(overlayLog, null, 2) + '\n');

if (!FAST) {
  rmSync(join(OUT, 'previews'), { recursive: true, force: true });
  mkdirSync(join(OUT, 'previews'), { recursive: true });
  const qa = {};
  for (const p of pieces) {
    const pg = await browser.newPage({ viewport: { width: p.W, height: p.H } });
    await pg.setContent(`<!doctype html><html><body style="margin:0;background:#000">${p.svg}</body></html>`);
    await pg.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode?.())); });
    await pg.waitForTimeout(300);
    const settle = async (ms) => {
      await pg.evaluate((ms) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; }), ms);
      await pg.waitForTimeout(60);
    };
    const shot = (path) => pg.locator('svg').first().screenshot({ path });
    if (p.motion) {
      await settle(p.motion.T);
      await shot(join(OUT, 'previews', `${p.id}.png`));
      for (const [k, ms] of p.motion.shots.entries()) { await settle(Math.min(ms, p.motion.T)); await shot(join(OUT, 'previews', `${p.id}-frame-${k + 1}.png`)); }
      await settle(p.motion.T);
    } else await shot(join(OUT, 'previews', `${p.id}.png`));
    if (p.guide) {
      await pg.evaluate((sel) => document.querySelectorAll(sel).forEach((e) => (e.style.display = 'inline')), p.guide);
      await shot(join(OUT, 'previews', `${p.id}-sticker-zone.png`));
      await pg.evaluate((sel) => document.querySelectorAll(sel).forEach((e) => (e.style.display = 'none')), p.guide);
    }
    // QA: each text element's colour against the worst-case pixels behind it (text hidden, final frame).
    const boxes = await pg.evaluate(() => [...document.querySelectorAll('svg text')].filter((t) => getComputedStyle(t).display !== 'none' && t.closest('[style*="display:none"]') === null && parseFloat(getComputedStyle(t.closest('g') || t).opacity || 1) > 0).map((t) => {
      const b = t.getBoundingClientRect(); const s = t.closest('svg').getBoundingClientRect();
      return { text: t.textContent.slice(0, 40), fill: t.getAttribute('fill') || getComputedStyle(t).fill, size: parseFloat(t.getAttribute('font-size')), x: b.x - s.x, y: b.y - s.y, w: b.width, h: b.height, W: s.width, H: s.height };
    }));
    await pg.addStyleTag({ content: 'svg text{visibility:hidden !important}' });
    const buf = await pg.locator('svg').first().screenshot();
    const px = await pg.evaluate(async (b64) => {
      const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
      const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
      const g = c.getContext('2d'); g.drawImage(im, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data; let s = ''; for (let i = 0; i < d.length; i += 0x8000) s += String.fromCharCode.apply(null, d.subarray(i, i + 0x8000));
      return { w: c.width, h: c.height, b: btoa(s) };
    }, buf.toString('base64'));
    const shotImg = { width: px.w, height: px.h, data: Buffer.from(px.b, 'base64') };
    const rgbHex = (f) => { const m = /rgb\((\d+), (\d+), (\d+)\)/.exec(f); return m ? '#' + m.slice(1).map((v) => (+v).toString(16).padStart(2, '0')).join('') : f; };
    qa[p.id] = boxes.filter((b) => b.w > 2).map((b) => {
      const box = { x: b.x / b.W * 100, y: b.y / b.H * 100, w: b.w / b.W * 100, h: b.h / b.H * 100 };
      const a = OV.analyseRegion(shotImg, box);
      const col = rgbHex(b.fill);
      const cr = a.contrastWith(col);
      return { text: b.text, colour: col, sizePx: b.size, worstCase: r(cr, 2), passes: cr >= (b.size >= 24 ? 3 : 4.5) && cr >= 4.5 ? 'AA' : cr >= 3 && b.size >= 24 ? 'AA large' : 'FAIL' };
    });
    await pg.close();
  }
  writeFileSync(join(OUT, 'qa-contrast.json'), JSON.stringify(qa, null, 2) + '\n');
  for (const [id, rows] of Object.entries(qa)) {
    const min = Math.min(...rows.map((x) => x.worstCase));
    const fails = rows.filter((x) => x.passes === 'FAIL');
    console.log(`QA ${id.padEnd(22)} min worst-case contrast ${min}:1${fails.length ? '  FAIL: ' + fails.map((f) => `"${f.text}" ${f.worstCase}`).join('; ') : ''}`);
  }
  // Contact sheet.
  const order = pieces.map((p) => p.id);
  const cells = order.map((id) => {
    const p = pieces.find((x) => x.id === id);
    const b64 = readFileSync(join(OUT, 'previews', `${id}.png`)).toString('base64');
    return `<figure><img src="data:image/png;base64,${b64}" style="aspect-ratio:${p.W}/${p.H}"><figcaption>${esc(id)}</figcaption></figure>`;
  }).join('');
  const sheet = await browser.newPage({ viewport: { width: 2400, height: 1000 } });
  await sheet.setContent(`<!doctype html><html><head><style>body{margin:0;background:${C.black};font:16px 'JetBrains Mono',monospace;color:${C.gray};padding:40px}
  .g{display:flex;flex-wrap:wrap;gap:28px;align-items:flex-end}figure{margin:0}img{height:440px;display:block;outline:1px solid #2a2d2e}figcaption{margin-top:8px}</style></head><body><div class="g">${cells}</div></body></html>`);
  await sheet.waitForTimeout(400);
  await sheet.screenshot({ path: join(OUT, 'contact-sheet.png'), fullPage: true });
  await sheet.close();
}
writeFileSync(join(OUT, 'pieces.json'), JSON.stringify(pieces.map(({ svg, ...p }) => ({ ...p, cards: undefined })), null, 2) + '\n');
await browser.close();
console.log(`${pieces.length} pieces.`);
