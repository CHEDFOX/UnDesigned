// Scrapbook design: sample poster.
// samplePoster(palette, copy) -> '<svg viewBox="0 0 400 566">...</svg>'
// Pure and deterministic: every "random" choice comes from a seeded generator,
// so the same palette and copy always give the same collage.
// palette = { ground, ink, paper, accent, support: [hex...] }
// copy    = { headline, subhead, brand }

const DISPLAY = "Archivo, 'Archivo Black', 'Arial Black', Impact, sans-serif";
const SERIF = "'DM Serif Display', Georgia, 'Times New Roman', serif";
const TYPE = "'Courier Prime', 'Courier New', Courier, monospace";
const HAND = "Caveat, 'Comic Neue', cursive";

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const f = (n) => Math.round(n * 10) / 10;

export function samplePoster(palette, copy) {
  const { ground, ink, paper, accent } = palette;
  const sup = palette.support || [];
  const s1 = sup[0] || paper; // tape, sun, ticket
  const s2 = sup.length > 1 ? sup[1] : ink; // photo sky, grid lines
  const tapeFill = sup[0] || ground; // kraft tape when there is no support colour
  const headline = copy.headline || '';
  const subhead = copy.subhead || '';
  const brand = copy.brand || '';
  const r = rng(hash(headline + '|' + brand));
  const j = (a) => (r() * 2 - 1) * a; // jitter in [-a, a]
  const out = [];

  // A torn edge between two points: small fibre jitter, every 3-6 units.
  function tear(x1, y1, x2, y2, amp, start) {
    const len = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
    const pts = start ? [[x1, y1]] : [];
    for (let d = 3 + r() * 3; d < len - 2; d += 3 + r() * 3) {
      const t = d / len, o = j(amp) + (r() < 0.12 ? amp * 1.4 : 0);
      pts.push([x1 + (x2 - x1) * t + nx * o, y1 + (y2 - y1) * t + ny * o]);
    }
    pts.push([x2, y2]);
    return pts;
  }
  // A paper scrap: rectangle with chosen sides torn ('t','r','b','l').
  function scrap(x, y, w, h, torn, amp = 1.8) {
    const c = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], key = 'trbl';
    let pts = [];
    for (let i = 0; i < 4; i++) {
      const [a, b] = [c[i], c[(i + 1) % 4]];
      pts = pts.concat(torn.includes(key[i]) ? tear(a[0], a[1], b[0], b[1], amp, i === 0) : (i === 0 ? [a, b] : [b]));
    }
    return 'M' + pts.map((p) => f(p[0]) + ' ' + f(p[1])).join('L') + 'Z';
  }
  // Flat offset shadow (no blur), then the piece.
  const piece = (d, fill, extra = '') =>
    `<path d="${d}" fill="${ink}" opacity="0.16" transform="translate(2.5 3)"/><path d="${d}" fill="${fill}" ${extra}/>`;
  // Tape: translucent strip with zigzag cut ends.
  function tape(cx, cy, w, h, rot, fill) {
    const p = [];
    for (let i = 0; i <= 4; i++) p.push([-w / 2 + (i % 2 ? 2.5 : 0), -h / 2 + (h * i) / 4]);
    for (let i = 4; i >= 0; i--) p.push([w / 2 - (i % 2 ? 2.5 : 0), -h / 2 + (h * i) / 4]);
    return `<path d="M${p.map((q) => f(q[0]) + ' ' + f(q[1])).join('L')}Z" fill="${fill}" opacity="0.72" transform="translate(${f(cx)} ${f(cy)}) rotate(${f(rot)})"/>`;
  }
  const g = (rot, cx, cy, inner) => `<g transform="rotate(${f(rot)} ${f(cx)} ${f(cy)})">${inner}</g>`;

  // 1. Ground and paper grain (tiny ink specks).
  out.push(`<rect width="400" height="566" fill="${ground}"/>`);
  let grain = '';
  for (let i = 0; i < 140; i++) grain += `<circle cx="${f(r() * 400)}" cy="${f(r() * 566)}" r="${f(0.4 + r() * 0.6)}"/>`;
  out.push(`<g fill="${ink}" opacity="0.10">${grain}</g>`);

  // 2. Back layer: torn grid-paper sheet, lower half.
  const sheet = scrap(46, 318, 318, 210, 'tl', 2.2);
  let grid = '';
  for (let x = 54; x < 364; x += 12) grid += `<path d="M${x} 322V524"/>`;
  for (let y = 326; y < 526; y += 12) grid += `<path d="M48 ${y}H362"/>`;
  out.push(g(2.5, 205, 420, piece(sheet, paper) +
    `<clipPath id="sb-sheet"><path d="${sheet}"/></clipPath><g clip-path="url(#sb-sheet)" stroke="${s2}" stroke-width="0.6" opacity="0.35">${grid}</g>`));

  // Headline layout first (drawn later, on top): up to 3 strips, size shrinks to fit.
  const words = headline.split(/\s+/).filter(Boolean);
  const first = words.shift() || '';
  let lines = [], max = 11;
  do {
    lines = [];
    for (const w of words) {
      const last = lines[lines.length - 1];
      if (last && (last + ' ' + w).length <= max) lines[lines.length - 1] = last + ' ' + w; else lines.push(w);
    }
    max++;
  } while (lines.length > 3);
  const longest = Math.max(1, ...lines.map((l) => l.length));
  const hs = Math.min(34, 290 / (longest * 0.6)), step = hs * 1.42;
  const hBottom = 96 + lines.length * step;

  // 3. Hero: instant photo with a white border, taped at two corners.
  const py = Math.min(Math.max(150, hBottom - 40), 196), px = 132, pw = 214, ph = 246 - (py - 150) * 0.6;
  let photo = `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${ink}" opacity="0.16" transform="translate(3 4)"/>`;
  photo += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${paper}"/>`;
  const ix = px + 12, iy = py + 12, iw = pw - 24, ih = ph - 58;
  photo += `<clipPath id="sb-photo"><rect x="${ix}" y="${iy}" width="${iw}" height="${ih}"/></clipPath><g clip-path="url(#sb-photo)">`;
  photo += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="${s2}"/>`;
  photo += `<circle cx="${ix + iw * 0.66}" cy="${iy + ih * 0.38}" r="${iw * 0.2}" fill="${s1}"/>`;
  let dots = '';
  for (let y = iy + 4; y < iy + ih * 0.6; y += 7) for (let x = ix + 4 + ((y / 7) % 2) * 3.5; x < ix + iw; x += 7) dots += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.6 - (y - iy) / (ih * 0.6) * 1.3)}"/>`;
  photo += `<g fill="${paper}" opacity="0.5">${dots}</g>`;
  photo += `<path d="M${ix - 2} ${iy + ih * 0.7}Q${ix + iw * 0.3} ${iy + ih * 0.5} ${ix + iw * 0.55} ${iy + ih * 0.66}T${ix + iw + 2} ${iy + ih * 0.6}V${iy + ih + 2}H${ix - 2}Z" fill="${ground}"/>`;
  photo += `<path d="M${ix - 2} ${iy + ih * 0.86}Q${ix + iw * 0.45} ${iy + ih * 0.7} ${ix + iw + 2} ${iy + ih * 0.82}V${iy + ih + 2}H${ix - 2}Z" fill="${ink}"/>`;
  photo += `</g>`;
  out.push(g(4 + j(1.5), px + pw / 2, py + ph / 2, photo + tape(px + 6, py + ph - 8, 64, 18, 42 + j(4), tapeFill) + tape(px + pw - 8, py + 6, 64, 18, 40 + j(4), tapeFill)));

  // 4. Headline: first word as ransom-note cut-outs, the rest on torn newsprint strips.
  const fills = [[paper, ink, SERIF], [s1, ink, DISPLAY], [ink, paper, TYPE], [accent, paper, DISPLAY], [paper, ink, DISPLAY]];
  let hx = 30;
  [...first].forEach((ch, i) => {
    const [bg, fg, fam] = fills[i % fills.length], w = /[,.;:'’]/.test(ch) ? 16 : Math.min(34, 250 / first.length), cx = hx + w / 2, cy = 66;
    out.push(g(j(7), cx, cy, piece(scrap(hx, 42, w, 46, 'trbl', 1), bg) +
      `<text x="${f(cx)}" y="80" text-anchor="middle" font-family="${fam}" font-weight="800" font-size="${f(Math.min(36, w * 1.06))}" fill="${fg}">${esc(ch)}</text>`));
    hx += w + 3;
  });
  lines.forEach((ln, i) => {
    const y = 96 + i * step, w = ln.length * hs * 0.58 + 22;
    out.push(g(j(1.8), 30 + w / 2, y + hs * 0.65, piece(scrap(28, y, w, hs * 1.3, 'tb', 1.6), paper) +
      `<text x="38" y="${f(y + hs * 0.97)}" font-family="${DISPLAY}" font-weight="900" font-size="${f(hs)}" letter-spacing="-0.8" fill="${ink}">${esc(ln)}</text>`));
  });

  // 5. Brand sticker beside the headline: die-cut circle with a white rim.
  const bx = 330, by = 74, br = 40;
  out.push(g(-8, bx, by, `<circle cx="${bx + 2}" cy="${by + 3}" r="${br}" fill="${ink}" opacity="0.16"/><circle cx="${bx}" cy="${by}" r="${br}" fill="${paper}"/><circle cx="${bx}" cy="${by}" r="${br - 5}" fill="${accent}"/>` +
    `<text x="${bx}" y="${by + 5}" text-anchor="middle" font-family="${DISPLAY}" font-weight="800" font-size="${f(Math.min(15, 58 / Math.max(brand.length * 0.6, 1)))}" fill="${paper}">${esc(brand)}</text>`));

  // 6. Subhead: typed label strip with one piece of tape.
  const sw = Math.min(subhead.length * 7.9 + 24, 300);
  out.push(g(-1.4 + j(0.5), 60 + sw / 2, 432, piece(scrap(60, 418, sw, 28, 'lr', 1.4), paper) +
    `<text x="72" y="437" font-family="${TYPE}" font-size="13" fill="${ink}">${esc(subhead)}</text>` + tape(64, 418, 34, 13, -12, tapeFill)));

  // 7. Ticket stub: support-colour card with notches and a perforation.
  const tk = `<path d="M0 0H118V22A8 8 0 0 0 118 38V60H0V38A8 8 0 0 0 0 22Z" fill="${ink}" opacity="0.16" transform="translate(2.5 3)"/>` +
    `<path d="M0 0H118V22A8 8 0 0 0 118 38V60H0V38A8 8 0 0 0 0 22Z" fill="${s1}"/>` +
    `<path d="M88 4V56" stroke="${ink}" stroke-width="1.4" stroke-dasharray="2 3"/>` +
    `<text x="10" y="26" font-family="${TYPE}" font-size="11" fill="${ink}">ADMIT ONE</text>` +
    `<text x="10" y="46" font-family="${TYPE}" font-size="11" fill="${ink}">No. ${1000 + Math.floor(r() * 9000)}</text>`;
  out.push(`<g transform="translate(36 474) rotate(${f(-6 + j(2))} 59 30)">${tk}</g>`);

  // 8. Rubber stamp: worn ink ring with the brand, bottom right.
  const sx = 296, sy = 494;
  out.push(g(8, sx, sy, `<g fill="none" stroke="${ink}" opacity="0.78"><circle cx="${sx}" cy="${sy}" r="38" stroke-width="2.4" stroke-dasharray="${f(18 + r() * 10)} 2 ${f(30 + r() * 10)} 3"/><circle cx="${sx}" cy="${sy}" r="27" stroke-width="1.2"/></g>` +
    `<path id="sb-ring" d="M${sx - 32} ${sy}A32 32 0 1 1 ${sx + 32} ${sy}" fill="none"/>` +
    `<text font-family="${TYPE}" font-size="8.5" letter-spacing="1.6" fill="${ink}" opacity="0.78"><textPath href="#sb-ring" startOffset="50%" text-anchor="middle">${esc(brand.toUpperCase())}</textPath></text>` +
    `<path d="M${sx + 30} ${sy - 12}q8 -5 16 0t16 0t16 0M${sx + 32} ${sy}q8 -5 16 0t16 0t16 0M${sx + 30} ${sy + 12}q8 -5 16 0t16 0t16 0" fill="none" stroke="${ink}" stroke-width="2" opacity="0.78"/>` +
    `<text x="${sx}" y="${sy + 4}" text-anchor="middle" font-family="${TYPE}" font-size="11" font-weight="700" fill="${ink}" opacity="0.78">${1 + Math.floor(r() * 28)} ${['JAN', 'MAR', 'MAY', 'SEP', 'OCT'][Math.floor(r() * 5)]}</text>`));

  // 9. A hand-drawn arrow from the label to the photo.
  out.push(`<path d="M${f(108 + j(2))} 410C96 380 98 350 ${f(128 + j(2))} 334" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>` +
    `<path d="M118 328L130 333L124 345" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 566" width="400" height="566" role="img" aria-label="${esc(headline)}">${out.join('')}</svg>`;
}
