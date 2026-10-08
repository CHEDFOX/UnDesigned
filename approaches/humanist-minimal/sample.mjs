// Humanist Minimal sample poster: one ink-and-paper motif on a flat ground,
// headline aligned to one edge. Uses this approach's own drawing engine.
import { createIllustrator } from './illustration.mjs';

const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function samplePoster(palette, copy = {}, approach) {
  const ill = createIllustrator(approach, palette);
  const art = ill.scene({ motif: 'sound-bubble', palette, animate: false, uid: 'hmsample' })
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>$/, '')
    .replace(/<rect width="400" height="400" fill="[^"]*"\/>/, '');
  const head = esc(copy.headline || 'Say one thing, warmly');
  const words = head.split(' ');
  const lines = [];
  for (const w of words) {
    const last = lines[lines.length - 1];
    if (last && (last + ' ' + w).length <= 16) lines[lines.length - 1] = last + ' ' + w;
    else lines.push(w);
  }
  // Subhead: at most two lines of about 52 characters, cut at a word.
  const sub = [];
  for (const w of esc(copy.subhead || '').split(' ')) {
    const last = sub[sub.length - 1];
    if (last !== undefined && (last + ' ' + w).length <= 52) sub[sub.length - 1] = last + ' ' + w;
    else if (sub.length < 2) sub.push(w);
    else break;
  }
  const display = "'Bricolage Grotesque', 'Figtree', system-ui, sans-serif";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 566" role="img" aria-label="Humanist Minimal sample poster">` +
    `<rect width="400" height="566" fill="${palette.ground}"/>` +
    `<g transform="translate(40 20) scale(0.8)">${art}</g>` +
    lines.slice(0, 3).map((l, i) => `<text x="32" y="${388 + i * 40}" font-family="${display}" font-weight="700" font-size="36" letter-spacing="-0.5" fill="${palette.ink}">${l}</text>`).join('') +
    sub.map((l, i) => `<text x="32" y="${388 + Math.min(lines.length, 3) * 40 + 10 + i * 17}" font-family="'Figtree', system-ui, sans-serif" font-size="13" fill="${palette.ink}" opacity=".85">${l}</text>`).join('') +
    `<text x="32" y="536" font-family="'Bricolage Grotesque', system-ui, sans-serif" font-weight="800" font-size="15" fill="${palette.ink}">${esc(copy.brand || 'UnDesigned')}</text>` +
    `<path d="${ill.blob(352, 530, 12, 12, { points: 6, irregularity: 0.06, seed: 4 })}" fill="${palette.accent}"/>` +
    `</svg>`;
}
