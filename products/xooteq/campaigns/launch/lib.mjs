// Shared helpers for the XOOTEQ launch campaign (design.mjs): tokens, type metrics and setting,
// the original XQ lockup, photo treatment (duotone in Wada 340) and overlay measurement.
// Colours come only from dist/xooteq/tokens/colors.json (combination 340 plus Wada Black and White);
// type only from the product's pairing (Schibsted Grotesk + JetBrains Mono).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

export const HERE = dirname(fileURLToPath(import.meta.url));
export const PRODUCT = join(HERE, '../..');
export const ROOT = join(PRODUCT, '../..');
export const DIST = join(ROOT, 'dist/xooteq');
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));

// ------------------------------------------------------------------ colour tokens
const colors = json(join(DIST, 'tokens/colors.json'));
const hexOf = Object.fromEntries(colors.colors.map((c) => [c.id, c.hex]));
const combo340 = colors.combinations.find((c) => c.id === 340);
const primary = colors.brand.find((p) => p.name === 'primary').roles;
const daylight = colors.brand.find((p) => p.name === 'daylight').roles;
if (!combo340.colors.includes('sea-green') || !combo340.colors.includes('peach-red')) throw new Error('combination 340 changed');

export const C = {
  black: hexOf.black,          // ground (primary bg)
  white: hexOf.white,          // headlines (primary ink)
  green: hexOf[primary.accent],// Sea Green: the one accent
  orange: hexOf['peach-red'],  // Peach Red: the warm second signal
  gray: hexOf[primary.text],   // Neutral Gray: body text
};
export const DAY = { ground: hexOf[daylight.bg], ink: hexOf[daylight.ink], accent: hexOf[daylight.accent] };
export const ALLOWED_HEX = new Set([...combo340.colors.map((id) => hexOf[id]), hexOf.black, hexOf.white].map((h) => h.toLowerCase()));

// ------------------------------------------------------------------ type
const type = json(join(DIST, 'tokens/typography.json'));
export const FONT = {
  sans: type.pairing?.display?.family || 'Schibsted Grotesk',
  mono: type.pairing?.mono?.family || 'JetBrains Mono',
};
export const FONT_URL = 'https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;800&family=JetBrains+Mono:wght@500&display=swap';
export const FAM = { sans: `'${FONT.sans}', system-ui, sans-serif`, mono: `'${FONT.mono}', ui-monospace, monospace` };

// Per-character advance widths at 100 px, measured in Chromium (see measureFonts). Kerning is ignored,
// so every measurement carries a 3% safety margin.
let METRICS = null;
const METRICS_FILE = join(HERE, 'font-metrics.json');
export const STYLES = { d800: ['sans', 800], b400: ['sans', 400], m500: ['mono', 500] };
const CHARS = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('') + '’‘“”–—·…→';

export async function measureFonts(page, force = false) {
  if (!force && existsSync(METRICS_FILE)) return (METRICS = json(METRICS_FILE));
  await page.setContent(`<style>@import url("${FONT_URL}");</style><p style="font-family:'${FONT.sans}'">a</p>`);
  METRICS = await page.evaluate(async ({ STYLES, CHARS, FONT }) => {
    const out = {};
    for (const [k, [fam, w]] of Object.entries(STYLES)) {
      const f = `${w} 100px "${FONT[fam]}"`;
      await document.fonts.load(f, CHARS);
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.font = f;
      const t = {};
      for (const ch of CHARS) t[ch] = ctx.measureText(ch).width / 100;
      const m = ctx.measureText('H');
      t.$cap = m.actualBoundingBoxAscent / 100;
      t.$x = ctx.measureText('x').actualBoundingBoxAscent / 100;
      t.$ok = document.fonts.check(f);
      out[k] = t;
    }
    return out;
  }, { STYLES, CHARS, FONT });
  for (const [k, t] of Object.entries(METRICS)) if (!t.$ok) throw new Error(`Font not loaded: ${k}`);
  writeFileSync(METRICS_FILE, JSON.stringify(METRICS));
  return METRICS;
}

export function textWidth(str, size, style = 'd800', track = 0) {
  const t = METRICS[style];
  let w = 0;
  for (const ch of str) w += t[ch] ?? 0.6;
  return (w * size + track * size * Math.max(0, [...str].length - 1)) * 1.03;
}
export const capHeight = (size, style = 'd800') => METRICS[style].$cap * size;

// Greedy wrap, then balance: the narrowest width that keeps the same number of lines (text-wrap: balance).
export function wrap(text, size, maxW, style = 'd800', track = 0, balance = true) {
  const words = text.split(/\s+/).filter(Boolean);
  const greedy = (w) => {
    const lines = [];
    let cur = '';
    for (const word of words) {
      const next = cur ? `${cur} ${word}` : word;
      if (cur && textWidth(next, size, style, track) > w) { lines.push(cur); cur = word; } else cur = next;
    }
    if (cur) lines.push(cur);
    return lines;
  };
  let lines = greedy(maxW);
  if (balance && lines.length > 1) {
    let lo = maxW * 0.5, hi = maxW;
    for (let i = 0; i < 18; i++) { const mid = (lo + hi) / 2; if (greedy(mid).length > lines.length) lo = mid; else hi = mid; }
    lines = greedy(hi);
  }
  return lines;
}

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// A block of text whose TOP (cap line of the first line) is at y. Returns { svg, h, w, lines, baseline }.
// opts: { size, style, fill, lh, track, maxW, anchor, lines, cls, spans }  spans: [{ word, fill }] colour single words.
export function textBlock(x, y, text, o = {}) {
  const style = o.style || 'd800';
  const size = o.size;
  const track = o.track ?? (style === 'd800' ? -0.025 : style === 'm500' ? 0.12 : 0);
  const lh = o.lh ?? (style === 'd800' ? 1.0 : 1.4);
  const lines = o.lines || (o.maxW ? wrap(text, size, o.maxW, style, track, o.balance ?? true) : [text]);
  const cap = capHeight(size, style);
  const fam = STYLES[style][0] === 'mono' ? FAM.mono : FAM.sans;
  const weight = STYLES[style][1];
  const anchor = o.anchor || 'start';
  const colourWords = o.colourWords || {}; // { word: fill }
  const tspans = lines.map((ln, i) => {
    const parts = ln.split(/(\s+)/).map((w) => {
      const key = w.replace(/[.,:;?!]$/, '');
      return colourWords[key] ? `<tspan fill="${colourWords[key]}">${esc(w)}</tspan>` : esc(w);
    }).join('');
    return `<tspan x="${r(x)}" y="${r(y + cap + i * size * lh)}">${parts}</tspan>`;
  }).join('');
  const w = Math.max(...lines.map((l) => textWidth(l, size, style, track)));
  const svg = `<text class="${o.cls || ''}" font-family="${fam}" font-weight="${weight}" font-size="${r(size)}" letter-spacing="${r(track * size, 2)}" fill="${o.fill}" text-anchor="${anchor}"${o.attrs ? ' ' + o.attrs : ''}>${tspans}</text>`;
  return { svg, w, h: cap + (lines.length - 1) * size * lh, lines, last: y + cap + (lines.length - 1) * size * lh };
}
export const r = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

// Mono label in Sea Green capitals (the site's own signal).
export function label(x, y, text, size, fill = C.green, anchor = 'start', cls = '') {
  return textBlock(x, y, text.toUpperCase(), { size, style: 'm500', fill, track: 0.12, anchor, cls });
}

// ------------------------------------------------------------------ the original XQ monogram
const ICON = readFileSync(join(PRODUCT, 'assets/logos/icon-512.png'));
let ICON_URI = null;
export async function prepIcon(page) {
  // Downscale the original PNG (pixels untouched otherwise) so each SVG stays small.
  ICON_URI = await page.evaluate(async (src) => {
    const img = new Image(); img.src = src; await img.decode();
    const c = document.createElement('canvas'); c.width = c.height = 192;
    const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, 192, 192);
    return c.toDataURL('image/png');
  }, `data:image/png;base64,${ICON.toString('base64')}`);
  return ICON_URI;
}

// Lockup: the monogram tile (original file, its own white square) + XOOTEQ in tracked capitals.
// s = tile size. Returns { svg, w, h }.
export function lockup(x, y, s, { fill = C.white, word = true, cls = '' } = {}) {
  const tile = `<image class="${cls}" href="${ICON_URI}" x="${r(x)}" y="${r(y)}" width="${r(s)}" height="${r(s)}"/>`;
  if (!word) return { svg: tile, w: s, h: s };
  const size = s * 0.5;
  const cap = capHeight(size);
  const tx = x + s * 0.34 + s;
  const wm = `<text class="${cls}" x="${r(tx)}" y="${r(y + s / 2 + cap / 2)}" font-family="${FAM.sans}" font-weight="800" font-size="${r(size)}" letter-spacing="${r(size * 0.14, 2)}" fill="${fill}">XOOTEQ</text>`;
  return { svg: tile + wm, w: s * 1.34 + textWidth('XOOTEQ', size, 'd800', 0.14), h: s };
}

// ------------------------------------------------------------------ photos
// Duotone ladders inside combination 340 (media.json treatment 'duotone'; CM layer rule 'Photography').
export const LADDERS = {
  green: [C.black, C.green, C.white],
  warm: [C.black, C.orange, C.white],
  neutral: [C.black, C.gray, C.white],
};

// Crop (fractions of the source), resize to out, map luminance through a ladder, return a JPEG data URI
// and the treated pixels (for overlay.mjs). Runs in Chromium: canvas decodes JPEG and PNG.
export async function prepPhoto(page, file, { crop = [0, 0, 1, 1], out, ladder = 'green', mid = 0.5, lift = 0, gamma = 1, quality = 0.78, cache }) {
  const buf = readFileSync(file);
  const mime = file.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const res = await page.evaluate(async ({ src, crop, out, stops, mid, lift, gamma, quality }) => {
    const img = new Image(); img.src = src; await img.decode();
    const [cx, cy, cw, ch] = crop;
    const c = document.createElement('canvas'); c.width = out[0]; c.height = out[1];
    const g = c.getContext('2d', { willReadFrequently: true }); g.imageSmoothingQuality = 'high';
    g.drawImage(img, cx * img.naturalWidth, cy * img.naturalHeight, cw * img.naturalWidth, ch * img.naturalHeight, 0, 0, out[0], out[1]);
    const d = g.getImageData(0, 0, out[0], out[1]);
    const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [A, B, W] = stops.map(hex);
    for (let i = 0; i < d.data.length; i += 4) {
      let t = (0.2126 * d.data[i] + 0.7152 * d.data[i + 1] + 0.0722 * d.data[i + 2]) / 255;
      t = Math.min(1, Math.max(0, (t - lift) / (1 - lift)));
      t = Math.pow(t, gamma);
      let p, q, u;
      if (t < mid) { p = A; q = B; u = t / mid; } else { p = B; q = W; u = (t - mid) / (1 - mid); }
      d.data[i] = p[0] + (q[0] - p[0]) * u; d.data[i + 1] = p[1] + (q[1] - p[1]) * u; d.data[i + 2] = p[2] + (q[2] - p[2]) * u;
    }
    g.putImageData(d, 0, 0);
    const uri = c.toDataURL('image/jpeg', quality);
    // Re-read the JPEG so overlay measurements see exactly what the SVG will show.
    const back = new Image(); back.src = uri; await back.decode();
    g.drawImage(back, 0, 0);
    const px = g.getImageData(0, 0, out[0], out[1]).data;
    let bin = ''; const chunk = 0x8000;
    for (let i = 0; i < px.length; i += chunk) bin += String.fromCharCode.apply(null, px.subarray(i, i + chunk));
    return { uri, px: btoa(bin) };
  }, { src: `data:${mime};base64,${buf.toString('base64')}`, crop, out, stops: LADDERS[ladder], mid, lift, gamma, quality });
  if (cache) {
    mkdirSync(dirname(cache), { recursive: true });
    writeFileSync(cache, Buffer.from(res.uri.split(',')[1], 'base64'));
  }
  return { uri: res.uri, img: { width: out[0], height: out[1], data: Buffer.from(res.px, 'base64') }, kb: Math.round((res.uri.length * 3) / 4 / 1024) };
}

// ------------------------------------------------------------------ SVG shell
// Fonts are imported in their own <style> (the hub strips that element); the piece's CSS is separate.
export function svgDoc(W, H, body, { title, desc, css = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${title.id}-t ${title.id}-d">
<title id="${title.id}-t">${esc(title.text)}</title>
<desc id="${title.id}-d">${esc(desc)}</desc>
<style>@import url("${FONT_URL.replace(/&/g, '&amp;')}");</style>
${css ? `<style>${css}</style>` : ''}
${body}
</svg>
`;
}

// Two-stop fade into Black (media.json 'scrim-gradient' as Commercial Modernism allows it: a fade into the
// combination's Black, solid under the text, transparent toward the subject).
export function fade(id, x1, y1, x2, y2, solidTo = 0) {
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="${solidTo}" stop-color="${C.black}" stop-opacity="1"/><stop offset="1" stop-color="${C.black}" stop-opacity="0"/></linearGradient>`;
}

export function loadJSON(p) { return json(p); }
export function playwright() {
  const require = createRequire(import.meta.url);
  const root = execSync('npm root -g').toString().trim();
  return require(join(root, 'playwright'));
}
