// Rad Dog / Neon Surf: sample poster. Pure function, no imports, deterministic.
// samplePoster(palette, copy) -> '<svg viewBox="0 0 400 566">...</svg>'
// palette = { ground, ink, paper, accent, support: [hex...] }; copy = { headline, subhead, brand }

const W = 400, H = 566, LINE = 6; // outline = 1.5% of the 400 artboard
const FONT = "'Titan One', 'Lilita One', 'Arial Black', 'Helvetica Neue', sans-serif";
const BODY = "'Rubik', 'Helvetica Neue', Arial, sans-serif";

function rng(seedText) {
  let h = 2166136261;
  for (const ch of String(seedText)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const f = (n) => Math.round(n * 10) / 10;

// Closed Catmull-Rom blob through points.
function blob(pts) {
  const n = pts.length; let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}

// Paint splatter: a lumpy core, droplets and two drips.
function splat(r, cx, cy, size, color) {
  const pts = [];
  for (let i = 0; i < 11; i++) { const a = (i / 11) * Math.PI * 2, k = size * (i % 2 ? 0.55 + r() * 0.25 : 0.9 + r() * 0.5); pts.push([cx + Math.cos(a) * k, cy + Math.sin(a) * k]); }
  let s = `<path d="${blob(pts)}" fill="${color}"/>`;
  for (let i = 0; i < 9; i++) { const a = r() * Math.PI * 2, d = size * (1.5 + r() * 1.4); s += `<circle cx="${f(cx + Math.cos(a) * d)}" cy="${f(cy + Math.sin(a) * d)}" r="${f(size * (0.08 + r() * 0.2))}" fill="${color}"/>`; }
  for (let i = 0; i < 2; i++) { const x = cx + (r() - 0.5) * size, len = size * (1 + r() * 1.2); s += `<path d="M${f(x)} ${f(cy)}V${f(cy + len)}" stroke="${color}" stroke-width="${f(size * 0.22)}" stroke-linecap="round"/>`; }
  return s;
}

// Text with a thick ink outline and a hard ink block shadow: sticker lettering.
function stickerText(str, x, y, size, fill, ink, extra = '') {
  const t = (dx, dy, attrs) => `<text x="${x + dx}" y="${y + dy}" font-family="${FONT}" font-size="${size}" font-weight="900" ${attrs} ${extra}>${esc(str)}</text>`;
  return t(4, 5, `fill="${ink}" stroke="${ink}" stroke-width="${LINE * 1.6}" stroke-linejoin="round"`) +
    t(0, 0, `fill="${fill}" stroke="${ink}" stroke-width="${LINE * 1.6}" stroke-linejoin="round" paint-order="stroke"`);
}

function wrap(text, max) {
  const words = String(text).split(/\s+/).filter(Boolean), lines = [];
  for (const w of words) { const last = lines[lines.length - 1]; if (last && (last + ' ' + w).length <= max) lines[lines.length - 1] = last + ' ' + w; else lines.push(w); }
  return lines;
}

export function samplePoster(palette, copy = {}) {
  const { ground, ink, paper, accent } = palette;
  const support = palette.support && palette.support.length ? palette.support : [accent];
  const sea = support[0], hot = support[1] || accent;
  const r = rng((copy.headline || '') + (copy.brand || ''));
  const o = [];

  o.push(`<rect width="${W}" height="${H}" fill="${ground}"/>`);

  // Sunset sun, striped with ground-coloured cuts in its lower half.
  o.push(`<defs><clipPath id="ns-sun"><circle cx="268" cy="250" r="104"/></clipPath>
  <linearGradient id="ns-air" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${accent}"/><stop offset="1" stop-color="${hot}"/></linearGradient></defs>`);
  o.push(`<circle cx="268" cy="250" r="104" fill="url(#ns-air)" stroke="${ink}" stroke-width="${LINE}"/>`);
  let stripes = '';
  for (let i = 0, y = 262; i < 6; i++) { const h = 3 + i * 2.2; stripes += `<rect x="150" y="${f(y)}" width="240" height="${f(h)}" fill="${ground}"/>`; y += h + 9 - i * 0.6; }
  o.push(`<g clip-path="url(#ns-sun)">${stripes}</g>`);

  // Spray stipple around the sun (airbrush done with dots, so it prints in one ink).
  for (let i = 0; i < 160; i++) { const a = r() * Math.PI * 2, d = 112 + Math.pow(r(), 1.8) * 42; o.push(`<circle cx="${f(268 + Math.cos(a) * d)}" cy="${f(250 + Math.sin(a) * d)}" r="${f(0.6 + r() * 1.2)}" fill="${hot}"/>`); }

  // Checkerboard band on a 12-degree diagonal.
  let checks = '';
  for (let i = -2; i < 30; i++) for (let j = 0; j < 2; j++) checks += `<rect x="${i * 17}" y="${j * 17}" width="17" height="17" fill="${(i + j) % 2 ? paper : ink}"/>`;
  o.push(`<g transform="translate(-20 330) rotate(-12)"><rect x="-34" y="0" width="560" height="34" fill="${paper}"/>${checks}<rect x="-34" y="0" width="560" height="34" fill="none" stroke="${ink}" stroke-width="${LINE}"/></g>`);

  // The wave: body, curl and foam, with fat ink outlines.
  const wave = 'M-10 576 L-10 372 C 20 318, 92 290, 146 306 C 186 318, 200 352, 178 370 C 160 384, 134 372, 142 352 C 166 382, 200 408, 256 414 C 320 420, 380 412, 410 406 L410 576Z';
  o.push(`<path d="${wave}" fill="${sea}" stroke="${ink}" stroke-width="${LINE}" stroke-linejoin="round"/>`);
  for (let k = 0; k < 2; k++) o.push(`<path d="M${30 + k * 26} ${420 + k * 30} C ${70 + k * 24} ${404 + k * 26}, ${110 + k * 24} ${424 + k * 22}, ${140 + k * 20} ${452 + k * 20}" stroke="${ink}" stroke-width="${LINE * 0.6}" fill="none" stroke-linecap="round"/>`);
  const foam = [];
  for (let i = 0; i <= 9; i++) { const t = i / 9; foam.push([-6 + t * 150 + (r() - 0.5) * 4, 360 - Math.sin(t * Math.PI * 0.85) * 52 + t * 4, 9 + r() * 6]); }
  o.push(foam.map(([x, y, rr]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr + LINE / 2)}" fill="${ink}"/>`).join(''));
  o.push(foam.map(([x, y, rr]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr - 0.5)}" fill="${paper}"/>`).join(''));

  // Wake behind the board.
  o.push(`<path d="M150 470 C 170 452, 190 446, 206 448 M168 490 C 190 474, 212 468, 232 470" stroke="${paper}" stroke-width="5" fill="none" stroke-linecap="round"/>`);

  // Rad dog on a board: one bold outlined character with shades.
  const dog = [
    `<g transform="translate(268 396) rotate(-14)">`,
    `<ellipse cx="0" cy="34" rx="78" ry="14" fill="${hot}" stroke="${ink}" stroke-width="${LINE}"/>`,
    `<path d="M-70 34 H70" stroke="${paper}" stroke-width="4" stroke-linecap="round"/>`,
    `<path d="M-38 6 C -60 0, -70 -14, -62 -24" stroke="${ink}" stroke-width="${LINE}" fill="none" stroke-linecap="round"/>`,
    // body + legs (ink layer then paper layer = one fused outline)
    ...[LINE, 0].map((s) => { const fill = s ? ink : paper, g = (v) => v + s / 2; return `<g fill="${fill}"><ellipse cx="-12" cy="2" rx="${g(34)}" ry="${g(22)}"/><ellipse cx="-34" cy="24" rx="${g(12)}" ry="${g(8)}"/><ellipse cx="14" cy="24" rx="${g(12)}" ry="${g(8)}"/><circle cx="20" cy="-36" r="${g(28)}"/><ellipse cx="46" cy="-28" rx="${g(20)}" ry="${g(14)}"/></g>`; }),
    `<circle cx="-22" cy="-6" r="9" fill="${accent}"/>`,
    `<path d="M2 -60 C -26 -66, -40 -44, -30 -22 C -22 -34, -12 -44, 6 -46Z" fill="${ink}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>`,
    `<circle cx="64" cy="-34" r="7" fill="${ink}"/>`,
    `<path d="M40 -18 C 48 -12, 58 -14, 62 -20" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    `<path d="M50 -16 C 50 -4, 60 -4, 59 -17Z" fill="${accent}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>`,
    `<path d="M6 -44 H52" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`,
    `<rect x="6" y="-46" width="22" height="15" rx="6" fill="${ink}"/><rect x="32" y="-46" width="22" height="15" rx="6" fill="${ink}"/>`,
    `<path d="M11 -42 L17 -42 M37 -42 L43 -42" stroke="${paper}" stroke-width="3" stroke-linecap="round"/>`,
    `</g>`,
  ];
  o.push(dog.join(''));

  // Splatter and Memphis confetti, kept off the headline and the dog.
  o.push(splat(r, 352, 520, 13, hot));
  o.push(splat(r, 58, 252, 9, accent));
  o.push(`<path d="M232 44 l12 -10 l12 10 l12 -10 l12 10 l12 -10" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  o.push(`<path d="M60 488 l16 28 h-32z" fill="${accent}" stroke="${ink}" stroke-width="4" stroke-linejoin="round"/>`);
  o.push(`<path d="M120 524 c 8 -10, 16 10, 24 0 s 16 10, 24 0" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`);
  o.push(`<circle cx="318" cy="70" r="5" fill="${ink}"/><circle cx="96" cy="276" r="4" fill="${ink}"/>`);

  // Brand sticker, next to the headline.
  const brand = esc(copy.brand || 'Brand');
  const bw = Math.max(70, brand.length * 9.5 + 26);
  o.push(`<g transform="translate(30 36) rotate(-5)"><rect x="3" y="4" width="${f(bw)}" height="28" rx="14" fill="${ink}"/><rect width="${f(bw)}" height="28" rx="14" fill="${paper}" stroke="${ink}" stroke-width="4"/><text x="${f(bw / 2)}" y="19.5" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="14" letter-spacing="1" fill="${ink}">${brand}</text></g>`);

  // Headline: sticker lettering on a -6 degree tilt.
  const head = copy.headline || 'Ride the good waves';
  let max = 10;
  while (wrap(head, max).length > 3 || wrap(head, max).join('').length < head.replace(/\s+/g, '').length) max++;
  const lines = wrap(head, max);
  const longest = Math.max(...lines.map((l) => l.length));
  const size = Math.min(54, Math.floor(330 / (longest * 0.6)));
  o.push(`<g transform="translate(34 ${f(84 + size * 0.9)}) rotate(-6)">` + lines.map((l, i) => stickerText(l, 0, i * size * 1.02, size, paper, ink)).join('') + `</g>`);

  // Subhead on an ink ribbon under the headline.
  const sub = esc(copy.subhead || '');
  if (sub) {
    const sy = 84 + size * 0.9 + (lines.length - 1) * size * 1.02 + 30;
    const sw = Math.min(330, sub.length * 6.6 + 28);
    o.push(`<g transform="translate(40 ${f(sy)}) rotate(-6)"><path d="M0 0 H${f(sw)} l-8 13 l8 13 H0 l8 -13Z" fill="${ink}"/><text x="18" y="17.5" font-family="${BODY}" font-weight="600" font-size="12" fill="${paper}">${sub}</text></g>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${o.join('')}</svg>`;
}
