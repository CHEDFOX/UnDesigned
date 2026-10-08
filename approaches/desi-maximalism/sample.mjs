// Desi Maximalism: sample poster.
// samplePoster(palette, copy) -> a complete <svg viewBox="0 0 400 566"> string.
// Pure and deterministic: the only randomness is a seeded generator keyed on the copy.
// palette = { ground, ink, paper, accent, support: [hex, ...] }; copy = { headline, subhead, brand }.
// Structure (art.json): nested border bands -> toran -> block-print field -> radial medallion
// -> headline cartouche -> brand plate. Bilateral symmetry about x = 200 throughout.

const W = 400, H = 566, CX = 200;

function rng(seedText) {
  let h = 2166136261;
  for (const ch of String(seedText)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const f = (n) => Math.round(n * 100) / 100;
const polar = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];

// A ring of n copies of an element, rotated about (cx, cy): radial symmetry.
function ring(n, cx, cy, make, offset = 0) {
  let out = '';
  for (let i = 0; i < n; i++) out += `<g transform="rotate(${f(offset + (360 / n) * i)} ${cx} ${cy})">${make(i)}</g>`;
  return out;
}

// A petal pointing up from (cx, cy - r0) to (cx, cy - r1), half-width w.
function petal(cx, cy, r0, r1, w) {
  const y0 = cy - r0, y1 = cy - r1, ym = (y0 + y1) / 2;
  return `M${f(cx)} ${f(y0)} C${f(cx + w)} ${f(ym + (y0 - ym) * 0.4)} ${f(cx + w * 0.7)} ${f(y1 + (ym - y1) * 0.3)} ${f(cx)} ${f(y1)} C${f(cx - w * 0.7)} ${f(y1 + (ym - y1) * 0.3)} ${f(cx - w)} ${f(ym + (y0 - ym) * 0.4)} ${f(cx)} ${f(y0)}Z`;
}

// A mirror (shisha) disc: paper disc, ink ring, small stitched spokes and a glint.
function mirror(x, y, r, c) {
  const stitches = ring(8, x, y, () => `<line x1="${f(x)}" y1="${f(y - r)}" x2="${f(x)}" y2="${f(y - r - r * 0.45)}" stroke="${c.ink}" stroke-width="${f(r * 0.22)}" stroke-linecap="round"/>`);
  return `${stitches}<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c.paper}" stroke="${c.ink}" stroke-width="${f(r * 0.28)}"/>` +
    `<path d="M${f(x - r * 0.35)} ${f(y - r * 0.05)} l${f(r * 0.12)} ${f(-r * 0.1)} l${f(r * 0.1)} ${f(r * 0.12)}" fill="none" stroke="${c.support2}" stroke-width="${f(r * 0.18)}" stroke-linecap="round"/>`;
}

// A frame band from inset a to inset b (even-odd ring), optionally with a bead chain.
function band(a, b, fill) {
  return `<path fill-rule="evenodd" fill="${fill}" d="M${a} ${a}H${W - a}V${H - a}H${a}Z M${b} ${b}H${W - b}V${H - b}H${b}Z"/>`;
}

function beadsAlong(inset, step, draw) {
  let out = '';
  const x0 = inset, x1 = W - inset, y0 = inset, y1 = H - inset;
  const nx = Math.round((x1 - x0) / step), ny = Math.round((y1 - y0) / step);
  for (let i = 0; i <= nx; i++) { const x = x0 + ((x1 - x0) * i) / nx; out += draw(x, y0, i) + draw(x, y1, i); }
  for (let j = 1; j < ny; j++) { const y = y0 + ((y1 - y0) * j) / ny; out += draw(x0, y, j) + draw(x1, y, j); }
  return out;
}

function wrap(text, max) {
  const words = String(text).split(/\s+/).filter(Boolean), lines = [''];
  for (const w of words) {
    const cur = lines[lines.length - 1];
    if (cur && (cur + ' ' + w).length > max) lines.push(w); else lines[lines.length - 1] = cur ? cur + ' ' + w : w;
  }
  return lines;
}

export function samplePoster(palette = {}, copy = {}) {
  const sup = palette.support || [];
  const c = {
    ground: palette.ground || '#f5ecc2', ink: palette.ink || '#111314', paper: palette.paper || '#ffffff',
    accent: palette.accent || '#e31f26', support1: sup[0] || palette.accent || '#e31f26', support2: sup[1] || palette.ink || '#111314',
  };
  // On a dark ground, ink lines that sit directly on the ground switch to a support colour.
  const lum = (hex) => { const n = parseInt(String(hex).replace('#', '').padEnd(6, '0').slice(0, 6), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
  const onGround = lum(c.ground) < 0.35 ? c.support1 : c.ink;
  const plate = lum(c.ground) < 0.35 ? c.accent : c.ink;
  const rand = rng(`${copy.headline}|${copy.brand}`);
  const DISPLAY = `'Rozha One', 'Yatra One', Georgia, serif`;
  const BODY = `'Mukta', 'Baloo 2', 'Poppins', sans-serif`;
  let s = `<rect width="${W}" height="${H}" fill="${c.ground}"/>`;

  // Layout first, so pattern keeps clear of the message (hierarchy guard). The headline sets
  // its size to fit; the medallion shrinks (never the type) when a headline needs more room.
  const subLines = wrap(copy.subhead || '', 44).slice(0, 2);
  const px = 56, pw = W - 112, by = H - 76, panelBottom = by - 32;
  let size = 46, lines = [], panelH = 0, panelTop = 0;
  for (; size >= 26; size -= 2) {
    lines = wrap(copy.headline || 'More is more', Math.floor(276 / (size * 0.46)));
    panelH = 30 + lines.length * size * 0.98 + subLines.length * 17;
    panelTop = panelBottom - panelH;
    if (lines.length <= 3 && panelTop >= 236) break;
  }
  size = Math.max(size, 26);
  const lineH = size * 0.98;
  const k = Math.max(0.4, Math.min(1, (panelTop - 112) / 236)), MY = 94 + 118 * k;
  const brand = esc(copy.brand || '');
  const bw = Math.max(110, brand.length * 9.5 + 40);
  const rosettes = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy]) => [CX + dx * 122 * k, MY + dy * 104 * k]);
  const clear = (x, y) => Math.hypot(x - CX, y - MY) < 128 * k || rosettes.some(([rx, ry]) => Math.hypot(x - rx, y - ry) < 20) || y < 92 ||
    (y > panelTop - 26 && y < panelTop + panelH + 30) || (y > by - 22 && Math.abs(x - CX) < bw / 2 + 52);

  // 1. Block-print field (Sanganer-style buti on a half-drop grid), ink at low weight.
  const flower = (x, y, r, rot) => `<g transform="rotate(${f(rot)} ${f(x)} ${f(y)})">${ring(5, x, y, () => `<ellipse cx="${f(x)}" cy="${f(y - r)}" rx="${f(r * 0.45)}" ry="${f(r * 0.8)}" fill="${c.support2}"/>`)}<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.45)}" fill="${c.accent}"/></g>`;
  for (let row = 0; row < 15; row++) for (let col = -1; col < 8; col++) {
    const x = 74 + col * 42 + (row % 2) * 21, y = 86 + row * 30;
    if (x > 50 && x < W - 50 && y < H - 50 && !clear(x, y)) s += flower(x, y, 3.2, rand() * 24 - 12);
  }

  // 2. Nested border: scallops -> accent band with paper beads -> ink line -> support band -> ink line.
  s += beadsAlong(26, 13, (x, y) => `<circle cx="${f(x)}" cy="${f(y)}" r="6.2" fill="${c.support1}" stroke="${c.ink}" stroke-width="1.4"/>`);
  s += band(0, 26, c.accent);
  s += beadsAlong(13, 13, (x, y, i) => i % 2 ? `<circle cx="${f(x)}" cy="${f(y)}" r="2.6" fill="${c.paper}"/>` : `<path d="M${f(x)} ${f(y - 5)}L${f(x + 4)} ${f(y)}L${f(x)} ${f(y + 5)}L${f(x - 4)} ${f(y)}Z" fill="${c.support1}"/>`);
  s += band(5, 7.5, c.ink) + band(24, 26.5, c.ink);
  s += `<rect x="38" y="38" width="${W - 76}" height="${H - 76}" fill="none" stroke="${onGround}" stroke-width="2"/>`;
  s += `<rect x="42" y="42" width="${W - 84}" height="${H - 84}" fill="none" stroke="${c.support2}" stroke-width="1.2" stroke-dasharray="1 4" stroke-linecap="round"/>`;
  // Corner rosettes sit over the frame joins.
  for (const [x, y] of [[26, 26], [W - 26, 26], [26, H - 26], [W - 26, H - 26]]) {
    s += ring(8, x, y, () => `<path d="${petal(x, y, 3, 15, 5.5)}" fill="${c.support2}" stroke="${c.ink}" stroke-width="1.2"/>`, 22.5);
    s += ring(8, x, y, () => `<path d="${petal(x, y, 2, 11, 4)}" fill="${c.accent}" stroke="${c.ink}" stroke-width="1.2"/>`);
    s += mirror(x, y, 4.2, c);
  }

  // 3. Toran (garland of leaves and marigolds) across the top, sagging slightly.
  s += `<path d="M44 52 Q${CX} 66 ${W - 44} 52" fill="none" stroke="${onGround}" stroke-width="2.2"/>`;
  for (let i = 0; i <= 14; i++) {
    const x = 50 + i * 21.4, t = (x - 44) / (W - 88), y = 52 + 4 * 14 * t * (1 - t) * 0.5 * 2;
    const leafFill = i % 2 ? c.support2 : c.accent;
    s += `<path d="M${f(x)} ${f(y)} C${f(x + 7)} ${f(y + 8)} ${f(x + 4)} ${f(y + 18)} ${f(x)} ${f(y + 24)} C${f(x - 4)} ${f(y + 18)} ${f(x - 7)} ${f(y + 8)} ${f(x)} ${f(y)}Z" fill="${leafFill}" stroke="${c.ink}" stroke-width="1.3"/>`;
    s += `<line x1="${f(x)}" y1="${f(y + 3)}" x2="${f(x)}" y2="${f(y + 19)}" stroke="${c.paper}" stroke-width="1"/>`;
    if (i < 14) { const mx = x + 10.7; s += `<circle cx="${f(mx)}" cy="${f(y + 2)}" r="5" fill="${c.support1}" stroke="${c.ink}" stroke-width="1.3"/><circle cx="${f(mx)}" cy="${f(y + 2)}" r="1.6" fill="${c.ink}"/>`; }
  }

  // 4. The medallion: rangoli-like radial layers, mirror ring, still core. Drawn at full size
  // around (CX, 212), then scaled from its top edge to fit above the headline.
  { const MY = 212; s += `<g transform="translate(${CX} 94) scale(${f(k)}) translate(${-CX} -94)">`;
  s += `<circle cx="${CX}" cy="${MY}" r="118" fill="${c.ground}"/>`;
  s += ring(32, CX, MY, (i) => `<path d="${petal(CX, MY, 92, 116, 9)}" fill="${i % 2 ? c.support2 : c.accent}" stroke="${c.ink}" stroke-width="1.5"/>`);
  s += ring(32, CX, MY, () => `<circle cx="${CX}" cy="${MY - 98}" r="10" fill="${c.paper}" stroke="${c.ink}" stroke-width="1.5"/>`, 5.625);
  s += `<circle cx="${CX}" cy="${MY}" r="92" fill="${c.support2}" stroke="${c.ink}" stroke-width="2.5"/>`;
  s += ring(16, CX, MY, () => mirror(CX, MY - 78, 6.5, c));
  s += `<circle cx="${CX}" cy="${MY}" r="66" fill="${c.accent}" stroke="${c.ink}" stroke-width="2.5"/>`;
  s += ring(12, CX, MY, () => `<path d="${petal(CX, MY, 14, 62, 15)}" fill="${c.support1}" stroke="${c.ink}" stroke-width="2"/>`);
  s += ring(12, CX, MY, () => `<path d="${petal(CX, MY, 14, 44, 7)}" fill="${c.paper}" stroke="${c.ink}" stroke-width="1.5"/>`, 15);
  s += `<circle cx="${CX}" cy="${MY}" r="17" fill="${c.support2}" stroke="${c.ink}" stroke-width="2.5"/>`;
  s += mirror(CX, MY, 8, c);
  // Four small rosettes on the diagonals echo the corners (pattern repeats at a second scale).
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const x = CX + dx * 122, y = MY + dy * 104;
    s += ring(8, x, y, (i) => `<path d="${petal(x, y, 2, 11, 4.5)}" fill="${i % 2 ? c.accent : c.support2}" stroke="${c.ink}" stroke-width="1.2"/>`, 22.5);
    s += `<circle cx="${x}" cy="${y}" r="3.2" fill="${c.support1}" stroke="${c.ink}" stroke-width="1.2"/>`;
  }
  s += '</g>'; }

  // 5. Headline cartouche: a calm paper panel so the message reads first.
  // Jhalar: a hanging fringe of small flags under the panel, as on truck bumpers.
  for (let i = 0; i < 19; i++) {
    const x = px + 12 + i * ((pw - 24) / 18), y = panelTop + panelH;
    s += `<path d="M${f(x - 5)} ${f(y)}L${f(x + 5)} ${f(y)}L${f(x)} ${f(y + 13)}Z" fill="${i % 2 ? c.support2 : c.accent}" stroke="${c.ink}" stroke-width="1.1" stroke-linejoin="round"/><circle cx="${f(x)}" cy="${f(y + 16.5)}" r="2.2" fill="${c.support1}" stroke="${c.ink}" stroke-width="0.9"/>`;
  }
  s += `<path d="M${px} ${panelTop + 10} Q${px} ${panelTop} ${px + 10} ${panelTop} H${CX - 26} Q${CX} ${panelTop - 22} ${CX + 26} ${panelTop} H${px + pw - 10} Q${px + pw} ${panelTop} ${px + pw} ${panelTop + 10} V${panelTop + panelH - 10} Q${px + pw} ${panelTop + panelH} ${px + pw - 10} ${panelTop + panelH} H${px + 10} Q${px} ${panelTop + panelH} ${px} ${panelTop + panelH - 10}Z" fill="${c.paper}" stroke="${c.ink}" stroke-width="3"/>`;
  s += `<rect x="${px + 6}" y="${panelTop + 6}" width="${pw - 12}" height="${panelH - 12}" rx="5" fill="none" stroke="${c.accent}" stroke-width="1.5"/>`;
  s += mirror(CX, panelTop - 6, 5, c);
  lines.forEach((ln, i) => {
    const y = f(panelTop + 12 + size * 0.8 + i * lineH), t = `text-anchor="middle" font-family="${DISPLAY}" font-size="${f(size)}" letter-spacing="-0.5" stroke-width="${f(size / 40)}" stroke-linejoin="round"`;
    // Signboard drop line: a flat, offset copy in ink (a painter's outline, not a soft shadow).
    s += `<text x="${f(CX + size / 32)}" y="${f(y + size / 32)}" ${t} fill="${c.ink}" stroke="${c.ink}">${esc(ln)}</text>`;
    s += `<text x="${CX}" y="${y}" ${t} fill="${c.accent}" stroke="${c.accent}">${esc(ln)}</text>`;
  });
  subLines.forEach((ln, i) => {
    s += `<text x="${CX}" y="${f(panelTop + 18 + lines.length * lineH + 10 + i * 17)}" text-anchor="middle" font-family="${BODY}" font-size="13" fill="${c.ink}">${esc(ln)}</text>`;
  });

  // 6. Brand plate (ink, or accent on a dark ground), flanked by paisleys (bilateral pair).
  // Paisley (boteh / ambi): a teardrop whose tip curls over; mirrored for the pair.
  const paisley = (x, y, dir) => {
    const P = (pts) => pts.map(([a, b]) => `${f(x + dir * a)} ${f(y + b)}`);
    const [p0, p1, p2, p3, p4, p5, p6, p7, p8] = P([[0, 13], [-12, 13], [-14, 0], [-8, -7], [-3, -12], [5, -14], [10, -20], [6, -12], [10, -4]]);
    const [q0, q1, q2, q3] = P([[10, 6], [8, 12], [4, 13], [0, 13]]);
    return `<path d="M${p0}C${p1} ${p2} ${p3}C${p4} ${p5} ${p6}C${p7} ${p8} ${q0}C${q1} ${q2} ${q3}Z" fill="${c.support2}" stroke="${c.ink}" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<circle cx="${f(x - dir * 2)}" cy="${f(y + 3)}" r="5" fill="${c.paper}" stroke="${c.ink}" stroke-width="1.2"/><circle cx="${f(x - dir * 2)}" cy="${f(y + 3)}" r="2" fill="${c.accent}"/>`;
  };
  s += `<rect x="${f(CX - bw / 2)}" y="${by - 2}" width="${f(bw)}" height="28" rx="14" fill="${plate}" stroke="${c.ink}" stroke-width="2"/>`;
  s += `<text x="${CX}" y="${by + 17}" text-anchor="middle" font-family="${BODY}" font-size="13" font-weight="700" letter-spacing="1.2" fill="${c.paper}">${brand}</text>`;
  s += paisley(CX - bw / 2 - 22, by + 10, -1) + paisley(CX + bw / 2 + 22, by + 10, 1);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(copy.headline)}">${s}</svg>`;
}
