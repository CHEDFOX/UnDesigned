// Rye & Rise "Quiet mornings": three Negative Space posters (approaches/negative-space).
// Colours come from the product's palette 344 (dist/sample-bakery/tokens/colors.json), type from its
// pairing (young-onest), copy from the .copy.json files beside this script.
//   node products/sample-bakery/campaigns/quiet-mornings/posters.mjs
// writes posters/<name>.svg, and posters/<name>.png plus contact-sheet.png when Playwright is installed.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../../../..');
const OUT = join(HERE, 'posters');
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));

const colors = json(join(ROOT, 'dist/sample-bakery/tokens/colors.json'));
const type = json(join(ROOT, 'dist/sample-bakery/tokens/typography.json'));
const hex = Object.fromEntries(colors.colors.map((c) => [c.id, c.hex]));
const roles = colors.brand.find((p) => p.name === 'primary').roles;
const C = { ground: hex[roles.bg], ink: hex[roles.ink], accent: hex[roles.accent] };
const SERIF = `'${type.pairing.display.family}', Georgia, serif`;
const SANS = `'${type.pairing.body.family}', system-ui, sans-serif`;
const FONTS = `https://fonts.googleapis.com/css2?family=${type.pairing.display.family.replace(/ /g, '+')}&family=${type.pairing.body.family.replace(/ /g, '+')}:wght@400;500;700&display=swap`;

// A3 proportions in a 1000-unit-wide artboard. Margin: 10% of the short side (Negative Space).
const W = 1000, H = 1414, M = 100;
// Headline cap height about 3.2% of the height (style range 2.5-4.5%); Young Serif caps are about 0.7 em.
const HEAD = 64, LEAD = 76, SMALL = 24, BRAND = 24;

const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function wrap(text, max) {
  const lines = [];
  for (const w of String(text).split(/\s+/)) {
    const last = lines[lines.length - 1];
    if (last && (last + ' ' + w).length <= max) lines[lines.length - 1] = last + ' ' + w;
    else lines.push(w);
  }
  return lines;
}

// Even lines: the fewest lines that fit, then shorten the measure so lines are about equal.
function balance(text, max) {
  const n = wrap(text, max).length;
  let m = max;
  while (m > 8 && wrap(text, m - 1).length === n) m--;
  return wrap(text, m);
}

// Text group: headline, brand under it (O4), then optional detail lines and the call to action.
// Returns svg and its bounding box, so empty ground can be measured.
const headChars = (units) => Math.floor(units / (HEAD * 0.5));
const smallChars = (units) => Math.floor(units / (SMALL * 0.52));
function headBlock(x, y, copy, { width = W - M - x } = {}) {
  const lines = balance(copy.headline, headChars(width));
  let svg = lines.map((l, i) => `<text x="${x}" y="${y + HEAD * 0.72 + i * LEAD}" font-family="${SERIF}" font-size="${HEAD}" letter-spacing="-0.6" fill="${C.ink}">${esc(l)}</text>`).join('');
  const by = y + HEAD * 0.72 + (lines.length - 1) * LEAD + 52;
  svg += `<text x="${x}" y="${by}" font-family="${SANS}" font-size="${BRAND}" font-weight="700" letter-spacing="0.3" fill="${C.ink}">Rye &amp; Rise</text>`;
  const longest = Math.max(...lines.map((l) => l.length));
  return { svg, box: { x, y, w: longest * HEAD * 0.5, h: by - y + 8 }, bottom: by };
}
function footBlock(x, bottom, lines, cta, { width = W - M - x } = {}) {
  const all = [...lines.flatMap((l) => balance(l, smallChars(width))), null, cta];
  const step = 36;
  const y0 = bottom - (all.length - 1) * step;
  const svg = all.map((l, i) => l === null ? '' : `<text x="${x}" y="${y0 + i * step}" font-family="${SANS}" font-size="${SMALL}" font-weight="${l === cta ? 700 : 400}" fill="${C.ink}">${esc(l)}${l === cta ? ' →' : ''}</text>`).join('');
  const longest = Math.max(...all.filter(Boolean).map((l) => l.length));
  return { svg, box: { x, y: y0 - SMALL, w: longest * SMALL * 0.52, h: (all.length - 1) * step + SMALL + 6 }, top: y0 - SMALL };
}

// The one object: a small sourdough batard as a flat ink silhouette, scored with three cuts
// that show the ground through them; one cut opens in the accent (NS6: accent on one small part).
// The cuts lean left, so the loaf "faces" left.
function loaf(cx, base, w, h, { face = -1 } = {}) {
  const f = face; // -1 faces left, 1 faces right
  const x = (k) => (cx + f * k * w).toFixed(1);
  const body = `M${x(-0.47)} ${base} C${x(-0.6)} ${(base - h * 0.2).toFixed(1)} ${x(-0.46)} ${(base - h * 1.02).toFixed(1)} ${x(0.02)} ${(base - h).toFixed(1)} ` +
    `C${x(0.42)} ${(base - h * 0.98).toFixed(1)} ${x(0.6)} ${(base - h * 0.3).toFixed(1)} ${x(0.48)} ${base} Z`;
  const cut = (k, len, fill) => {
    const ccx = cx + f * k * w, ccy = base - h * 0.74 + Math.abs(k) * h * 0.18;
    const a = -f * 24;
    return `<ellipse cx="${ccx.toFixed(1)}" cy="${ccy.toFixed(1)}" rx="${(len * w).toFixed(1)}" ry="${(h * 0.075).toFixed(1)}" transform="rotate(${a} ${ccx.toFixed(1)} ${ccy.toFixed(1)})" fill="${fill}"/>`;
  };
  return {
    svg: `<path d="${body}" fill="${C.ink}"/>` + cut(-0.24, 0.12, C.ground) + cut(0, 0.13, C.accent) + cut(0.24, 0.11, C.ground),
    box: { x: cx - w * 0.55, y: base - h, w: w * 1.1, h },
  };
}

const svgDoc = (label, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label)}">` +
  `<style>@import url("${FONTS}");</style><rect width="${W}" height="${H}" fill="${C.ground}"/>${inner}</svg>\n`;

// Empty ground: 100% minus the union of all mark boxes (sampled on a 4-unit grid).
function emptyPct(boxes) {
  let used = 0, n = 0;
  for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x += 4) {
    n++;
    if (boxes.some((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h)) used++;
  }
  return Math.round((1 - used / n) * 100);
}

const copy = (n) => json(join(HERE, `poster-${n}.copy.json`));
const posters = [];

// 1. Time: a small loaf far off on a long horizon, lower right; it faces left into the open field.
{
  const c = copy('time');
  const hy = 1004; // horizon at 71% of the height
  const head = headBlock(M, M, c);
  const l = loaf(700, hy, 170, 76);
  const foot = footBlock(M, H - M, [c.subhead, c.body], c.cta);
  const horizon = `<path d="M${M} ${hy} L${W - M} ${hy}" stroke="${C.ink}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>`;
  posters.push({ name: 'poster-time', label: c.headline, svg: svgDoc(c.headline, head.svg + horizon + l.svg + foot.svg), boxes: [head.box, l.box, foot.box, { x: M, y: hy - 1, w: W - 2 * M, h: 2 }] });
}

// 2. Reserved: one loaf on a short shelf above the optical centre, a small blue name tag hanging
// from the shelf; all words gathered at the foot.
{
  const c = copy('reserved');
  const sy = 600;
  const l = loaf(470, sy - 2, 190, 84, { face: 1 });
  const shelf = `<path d="M372 ${sy} L652 ${sy}" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`;
  const tx = 612, ty = sy + 34;
  const tag = `<path d="M${tx} ${sy + 2} L${tx} ${ty}" stroke="${C.ink}" stroke-width="1.6"/>` +
    `<path d="M${tx - 20} ${ty + 12} Q${tx - 20} ${ty} ${tx - 8} ${ty} L${tx + 8} ${ty} Q${tx + 20} ${ty} ${tx + 20} ${ty + 12} L${tx + 20} ${ty + 50} Q${tx + 20} ${ty + 58} ${tx + 12} ${ty + 58} L${tx - 12} ${ty + 58} Q${tx - 20} ${ty + 58} ${tx - 20} ${ty + 50} Z" fill="${C.accent}"/>` +
    `<circle cx="${tx}" cy="${ty + 11}" r="4" fill="${C.ground}"/>`;
  const foot = footBlock(M, H - M, [c.subhead], c.cta, { width: 560 });
  const probe = headBlock(M, 0, c, { width: 560 });
  const head = headBlock(M, foot.top - 56 - probe.bottom, c, { width: 560 });
  posters.push({ name: 'poster-reserved', label: c.headline, svg: svgDoc(c.headline, l.svg + shelf + tag + head.svg + foot.svg), boxes: [l.box, { x: 370, y: sy - 3, w: 284, h: 6 }, { x: tx - 20, y: sy, w: 40, h: 94 }, head.box, foot.box] });
}

// 3. Night: a small loaf on the left margin near the foot; one thin line of steam rises through the
// empty page towards the words at the top right.
{
  const c = copy('night');
  const base = 1150;
  const l = loaf(M + 85, base, 170, 76, { face: 1 });
  // Steam: one soft line with an even, slowing sway, rising from the crust and drifting right.
  const sx = M + 92, sy = base - 82, top = 470;
  let d = `M${sx} ${sy}`, y = sy, amp = 26, dir = 1, x = sx;
  while (y > top) { const step = 120 + (sy - y) * 0.08, nx = x + 22; d += ` C${x + dir * amp} ${y - step * 0.33} ${nx + dir * amp} ${y - step * 0.66} ${nx} ${y - step}`; x = nx; y -= step; dir = -dir; amp *= 1.12; }
  const steam = `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round" opacity=".6"/>`;
  const head = headBlock(520, M, c);
  const foot = footBlock(520, H - M, [c.subhead], c.cta);
  posters.push({ name: 'poster-night', label: c.headline, svg: svgDoc(c.headline, l.svg + steam + head.svg + foot.svg), boxes: [l.box, { x: sx - 40, y: top - 120, w: 200, h: sy - top + 120 }, head.box, foot.box] });
}

mkdirSync(OUT, { recursive: true });
for (const p of posters) {
  writeFileSync(join(OUT, `${p.name}.svg`), p.svg);
  console.log(`${p.name}.svg  "${p.label}"  empty ground ${emptyPct(p.boxes)}%`);
}

// PNG previews and a contact sheet (optional: needs Playwright and Chromium).
let chromium;
try { chromium = createRequire(import.meta.url)(join(process.env.NODE_PATH || '', 'playwright')).chromium; } catch { try { ({ chromium } = await import('playwright')); } catch { chromium = null; } }
if (chromium) {
  const exe = '/opt/pw-browsers/chromium';
  const browser = await chromium.launch(readFileSync ? { executablePath: exe } : {}).catch(() => chromium.launch());
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  for (const p of posters) {
    await page.setContent(`<html><body style="margin:0">${p.svg}</body></html>`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(OUT, `${p.name}.png`) });
  }
  const sheet = `<html><body style="margin:0;background:#e9e6df;display:flex;gap:40px;padding:40px">${posters.map((p) => `<div style="width:600px;box-shadow:0 2px 14px rgba(0,0,0,.12)">${p.svg.replace(/width="1000" height="1414"/, 'width="600" height="848"')}</div>`).join('')}</body></html>`;
  await page.setViewportSize({ width: 3 * 600 + 4 * 40, height: 848 + 80 });
  await page.setContent(sheet, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(OUT, 'contact-sheet.png') });
  await browser.close();
  console.log('PNG previews and contact-sheet.png written');
}
