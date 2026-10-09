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
