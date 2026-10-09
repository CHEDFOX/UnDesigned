// Font metrics for the design engine: per-character advance widths (as a share of the font size)
// for every family and weight the engine uses, measured once in Chromium with the real Google Font
// and cached in tools/design/font-metrics.json. Without a browser, a generous estimate is used.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const CACHE = join(HERE, 'font-metrics.json');
const CHARS = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('') + '’‘“”–—…₹€£·•→←↑↓×';

let cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {};
const key = (family, weight, italic) => `${family}|${weight}|${italic ? 'i' : 'n'}`;

function findPlaywright() {
  const req = createRequire(import.meta.url);
  try { return req('playwright'); } catch {}
  try { return req(join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright')); } catch {}
  return null;
}

/** Make sure every { family, weight, italic } face has measured widths. Returns true if all are measured. */
export async function ensureMetrics(faces) {
  const missing = faces.filter((f) => !cache[key(f.family, f.weight, f.italic)]);
  if (!missing.length) return true;
  const pw = findPlaywright();
  if (!pw) return false;
  const exe = existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {};
  const browser = await pw.chromium.launch(exe);
  try {
    const page = await browser.newPage();
    const fams = [...new Set(missing.map((f) => f.family))];
    const url = `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${f.replace(/ /g, '+')}:ital,wght@0,100..900;1,100..900`).join('&')}&display=block`;
    const urlFallback = `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${f.replace(/ /g, '+')}`).join('&')}&display=block`;
    await page.setContent(`<html><head><link rel="stylesheet" href="${url}"><link rel="stylesheet" href="${urlFallback}"></head><body></body></html>`, { waitUntil: 'networkidle' }).catch(() => {});
    for (const f of missing) {
      const widths = await page.evaluate(async ({ family, weight, italic, chars }) => {
        const spec = `${italic ? 'italic ' : ''}${weight} 100px "${family}"`;
        try { await document.fonts.load(spec, chars); } catch {}
        const loaded = document.fonts.check(spec, 'A');
        const c = document.createElement('canvas').getContext('2d');
        c.font = spec;
        const out = {};
        for (const ch of chars) out[ch] = Math.round(c.measureText(ch).width * 10) / 1000;
        return { loaded, widths: out };
      }, { ...f, chars: CHARS });
      cache[key(f.family, f.weight, f.italic)] = { loaded: widths.loaded, w: widths.widths };
    }
    writeFileSync(CACHE, JSON.stringify(cache, null, 0) + '\n');
  } finally {
    await browser.close();
  }
  return true;
}

/** Width of a string in px for a face at a size; letter-spacing in em. */
export function textWidth(text, { family, weight = 400, italic = false, size, tracking = 0, upper = false }) {
  const m = cache[key(family, weight, italic)] || cache[key(family, 400, italic)] || cache[key(family, 400, false)];
  const s = upper ? String(text).toUpperCase() : String(text);
  let w = 0;
  for (const ch of s) w += m ? (m.w[ch] ?? 0.6) : (/[A-Z0-9]/.test(ch) ? 0.66 : ch === ' ' ? 0.28 : 0.56);
  return (w + tracking * Math.max(0, s.length - 1)) * size;
}

// ---------------------------------------------------------------- photo tones
// A coarse luminance grid (32 x 32 cells, each the worst-case p10/p90 of its pixels) per image, measured
// in Chromium once and cached, so the engine can pick readable text over a photo (media.json contrast rule).
const TONES = join(HERE, 'photo-tones.json');
let tones = existsSync(TONES) ? JSON.parse(readFileSync(TONES, 'utf8')) : {};
import { statSync } from 'node:fs';
const toneKey = (file) => `${file}|${statSync(file).size}`;

export async function ensureTones(files) {
  const missing = [...new Set(files)].filter((f) => f && !(tones[toneKey(f)] && tones[toneKey(f)].pct));
  if (!missing.length) return true;
  const pw = findPlaywright();
  if (!pw) return false;
  const exe = existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {};
  const browser = await pw.chromium.launch(exe);
  try {
    const page = await browser.newPage();
    for (const f of missing) {
      const ext = f.split('.').pop().toLowerCase();
      const mime = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
      const uri = `data:${mime};base64,${readFileSync(f).toString('base64')}`;
      tones[toneKey(f)] = await page.evaluate(async (src) => {
        const img = new Image(); img.src = src; await img.decode();
        const N = 32, c = document.createElement('canvas'); c.width = 256; c.height = 256;
        const g = c.getContext('2d'); g.drawImage(img, 0, 0, 256, 256);
        const d = g.getImageData(0, 0, 256, 256).data;
        const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        const out = { w: img.naturalWidth, h: img.naturalHeight, lo: [], hi: [], pct: [] };
        const hist = new Array(256).fill(0);
        for (let i = 0; i < d.length; i += 4) hist[Math.round(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2])]++;
        let acc = 0, k = 0; const total = d.length / 4;
        for (let v = 0; v < 256; v++) { acc += hist[v]; while (k <= 100 && acc >= (k / 100) * total) { out.pct.push(v); k++; } }
        while (out.pct.length < 101) out.pct.push(255);
        for (let cy = 0; cy < N; cy++) for (let cx = 0; cx < N; cx++) {
          const L = [];
          for (let y = cy * 8; y < cy * 8 + 8; y++) for (let x = cx * 8; x < cx * 8 + 8; x++) { const i = (y * 256 + x) * 4; L.push(0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2])); }
          L.sort((a, b) => a - b);
          out.lo.push(Math.round(L[6] * 1000) / 1000); out.hi.push(Math.round(L[57] * 1000) / 1000);
        }
        return out;
      }, uri);
    }
    writeFileSync(TONES, JSON.stringify(tones) + '\n');
  } finally { await browser.close(); }
  return true;
}

/** Darkest and brightest luminance behind a box (px) on a W x H canvas where the photo is drawn with
 *  preserveAspectRatio "xMidYMid slice". Returns null if the photo wasn't measured. */
export function toneUnder(file, box, W, H) {
  const t = file && tones[toneKey(file)];
  if (!t) return null;
  const s = Math.max(W / t.w, H / t.h), dw = t.w * s, dh = t.h * s, ox = (W - dw) / 2, oy = (H - dh) / 2;
  const N = 32;
  const cx0 = Math.max(0, Math.floor(((box.x - ox) / dw) * N)), cx1 = Math.min(N - 1, Math.floor(((box.x + box.w - ox) / dw) * N));
  const cy0 = Math.max(0, Math.floor(((box.y - oy) / dh) * N)), cy1 = Math.min(N - 1, Math.floor(((box.y + box.h - oy) / dh) * N));
  let lo = 1, hi = 0;
  for (let y = cy0; y <= cy1; y++) for (let x = cx0; x <= cx1; x++) { lo = Math.min(lo, t.lo[y * N + x]); hi = Math.max(hi, t.hi[y * N + x]); }
  return { lo, hi };
}

/** Luminance percentiles (0-255, 101 values) of a measured photo, or null. */
export function photoStats(file) {
  const t = file && tones[toneKey(file)];
  return t && t.pct ? { percentiles: t.pct } : null;
}
