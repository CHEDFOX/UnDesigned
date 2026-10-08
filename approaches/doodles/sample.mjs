// Doodles: sample poster. One pen weight, wobbly hand marks, colour fills slapped on
// slightly off the line, a doodle wall with a clearing for the one focal idea, and a
// hand-lettered headline over set body type. Pure and deterministic (seeded random).
//
//   samplePoster({ ground, ink, paper, accent, support: [hex, hex] }, { headline, subhead, brand })
//   -> '<svg viewBox="0 0 400 566">...</svg>'

export function samplePoster(palette, copy) {
  const { ground, ink, paper, accent } = palette;
  const support = (palette.support && palette.support.length ? palette.support : [paper]).slice(0, 2);
  const W = 400, H = 566;
  const PEN = 2.6;          // one pen weight for every mark (art.json line.width, fineliner)
  const WOB = 1.5;          // wobble amplitude in units
  const OFF = [3.5, 3];     // fill offset: colour printed off the line, same direction everywhere
  const r1 = (n) => Math.round(n * 10) / 10;
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Seeded random (mulberry32), so the same copy always draws the same poster.
  let seed = 7;
  for (const ch of `${copy.headline}|${copy.brand}`) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = (() => { let a = seed; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
  const rr = (a, b) => a + rand() * (b - a);

  // Smooth curve through points (Catmull-Rom as cubic Bezier).
  function smooth(pts, closed) {
    const p = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
    let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
    for (let i = 1; i < p.length - 2; i++) {
      const [x0, y0] = p[i - 1], [x1, y1] = p[i], [x2, y2] = p[i + 1], [x3, y3] = p[i + 2];
      d += `C${r1(x1 + (x2 - x0) / 6)} ${r1(y1 + (y2 - y0) / 6)} ${r1(x2 - (x3 - x1) / 6)} ${r1(y2 - (y3 - y1) / 6)} ${r1(x2)} ${r1(y2)}`;
    }
    return closed ? d + 'Z' : d;
  }
  // Resample into short segments and nudge each point: the hand wobble.
  function wobble(pts, amp = WOB, seg = 8) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / seg));
      for (let k = 0; k < n; k++) out.push([ax + (bx - ax) * k / n + rr(-amp, amp), ay + (by - ay) * k / n + rr(-amp, amp)]);
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  // A hand never closes a loop exactly: closed shapes overshoot their start by a few units.
  const loop = (pts) => [...pts, pts[0], [pts[1][0] + rr(-2, 2), pts[1][1] + rr(-2, 2)]];
  const place = (pts, x, y, s = 1, rot = 0) => { const c = Math.cos(rot), sn = Math.sin(rot); return pts.map(([px, py]) => [x + (px * c - py * sn) * s, y + (px * sn + py * c) * s]); };
  const ring = (rx, ry, n = 14, k = 0) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; const b = 1 + (k ? Math.abs(Math.sin(a * k)) * 0.22 : 0); return [Math.cos(a) * rx * b, Math.sin(a) * ry * b]; });

  // Mark vocabulary (art.json vocabulary.marks), drawn around 0,0 at about 16 units radius.
  const MARKS = {
    star: () => ({ outline: Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 7 : 17; return [Math.cos(a) * r, Math.sin(a) * r]; }), fill: true }),
    heart: () => ({ outline: Array.from({ length: 16 }, (_, i) => { const t = (i / 16) * Math.PI * 2; return [Math.pow(Math.sin(t), 3) * 15, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 1.1]; }), fill: true }),
    cloud: () => ({ outline: ring(17, 11, 24, 3), fill: true }),
    face: () => ({ outline: ring(14, 14, 12), fill: true, extra: [[[-5, -3], [-4.6, -2]], [[5, -3], [5.4, -2]], [[-7, 4], [-3, 8], [3, 8], [7, 4]]] }),
    flower: () => ({ outline: ring(16, 16, 30, 2.5), fill: true, extra: [ring(4, 4, 7)] }),
    sun: () => ({ outline: ring(9, 9, 10), fill: true, extra: Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return [[Math.cos(a) * 13, Math.sin(a) * 13], [Math.cos(a) * 19, Math.sin(a) * 19]]; }) }),
    spiral: () => ({ open: Array.from({ length: 26 }, (_, i) => { const a = i * 0.55; return [Math.cos(a) * a * 1.15, Math.sin(a) * a * 1.15]; }) }),
    squiggle: () => ({ open: Array.from({ length: 9 }, (_, i) => [-18 + i * 4.5, Math.sin(i * 1.6) * 6]) }),
    coil: () => ({ open: Array.from({ length: 30 }, (_, i) => { const t = i * 0.62; return [-18 + t * 1.9 + Math.cos(t) * -5, Math.sin(t) * 7]; }) }),
    zigzag: () => ({ open: Array.from({ length: 7 }, (_, i) => [-16 + i * 5.5, i % 2 ? -7 : 7]) }),
    sparkle: () => ({ lines: [[[-14, 0], [14, 0]], [[0, -14], [0, 14]], [[-8, -8], [8, 8]], [[-8, 8], [8, -8]]] }),
    eye: () => ({ outline: [[-17, 0], [-8, -8], [0, -10], [8, -8], [17, 0], [8, 8], [0, 10], [-8, 8]], fill: true, extra: [ring(4, 4, 7)] }),
    tiny: () => ({ outline: ring(5, 5, 7) }),
    dots: () => ({ lines: [[[-8, -6], [-7.4, -5.6]], [[6, -8], [6.6, -7.6]], [[0, 4], [0.6, 4.4]], [[-10, 9], [-9.4, 9.4]], [[10, 7], [10.6, 7.4]]] }),
  };
  const KINDS = Object.keys(MARKS).filter((k) => k !== 'tiny' && k !== 'dots');

  const fills = [], inks = [];
  const fillOf = (pts, color) => fills.push(`<path d="${smooth(pts.map(([x, y]) => [x + OFF[0], y + OFF[1]]), true)}" fill="${color}"/>`);
  const line = (pts, closed) => inks.push(`<path d="${smooth(wobble(closed ? loop(pts) : pts), false)}"/>`);
  function mark(kind, x, y, s, rot, color) {
    const m = MARKS[kind]();
    if (m.outline) { const pts = place(m.outline, x, y, s, rot); if (color) fillOf(pts, color); line(pts, true); }
    if (m.open) line(place(m.open, x, y, s, rot));
    for (const l of m.lines || []) line(place(l, x, y, s, rot));
    for (const e of m.extra || []) line(place(e, x, y, s, rot), e.length > 4);
  }

  // Composition: wall of marks over the top 60%, a clearing for the focal idea, text below.
  const WALL = 338, CL = { x: 200, y: 172, rx: 118, ry: 102 };
  const inClearing = (x, y, pad) => ((x - CL.x) / (CL.rx + pad)) ** 2 + ((y - CL.y) / (CL.ry + pad)) ** 2 < 1;
  const fillColors = [support[0], support[1] || support[0], paper];
  const cell = 38;
  for (let gy = 0; gy * cell < WALL + 10; gy++) {
    for (let gx = 0; gx * cell < W + 20; gx++) {
      const x = gx * cell + (gy % 2 ? cell / 2 : 4) + rr(-5, 5), y = gy * cell + 14 + rr(-5, 5);
      if (y > WALL - 14 || inClearing(x, y, 18)) continue;
      const kind = KINDS[Math.floor(rand() * KINDS.length)];
      const color = MARKS[kind]().fill && rand() < 0.4 ? fillColors[Math.floor(rand() * fillColors.length)] : null;
      mark(kind, x, y, rr(0.8, 1.05), rr(-0.45, 0.45), color);
      // Small filler marks in the gaps keep the wall even: gaps of 1-3 pen widths, no holes.
      const fx = x + cell / 2 + rr(-3, 3), fy = y + cell / 2 + rr(-3, 3);
      if (!inClearing(fx, fy, 8) && fy < WALL - 10) mark(rand() < 0.6 ? 'dots' : 'tiny', fx, fy, 0.55, rr(0, 3));
    }
  }
  const wallFills = fills.splice(0), wallInks = inks.splice(0);

  // The clearing: a hand-drawn paper cloud holding the one focal idea (a pen whose line loops into a star).
  const clearing = ring(CL.rx, CL.ry, 34, 5).map(([x, y]) => [CL.x + x * 0.86, CL.y + y * 0.86]);
  fills.push(`<path d="${smooth(clearing, true)}" fill="${paper}"/>`);
  line(clearing, true);
  const pen = place([[-62, -9], [44, -9], [64, 0], [44, 9], [-62, 9]], 152, 222, 1, -0.62);
  fillOf(pen, support[0]);
  line(pen, true);
  line(place([[-44, -9], [-44, 9]], 152, 222, 1, -0.62));
  line(place([[44, -9], [44, 9]], 152, 222, 1, -0.62));
  for (let i = 0; i < 7; i++) line(place([[-38 + i * 5.5, 9], [-31 + i * 5.5, -9]], 152, 222, 1, -0.62)); // hatching on the barrel
  const nib = place([[64, 0]], 152, 222, 1, -0.62)[0];
  const sx = nib[0] + 60, sy = nib[1] - 84; // where the star sits
  const trail = Array.from({ length: 64 }, (_, i) => { const t = i / 63, a = t * Math.PI * 6, k = 14 * (1 - t * 0.4); return [nib[0] + (sx - nib[0] - 22) * t - Math.sin(a) * k, nib[1] + (sy - nib[1] + 22) * t + (1 - Math.cos(a)) * k * 0.9]; });
  inks.push(`<path d="${smooth(trail.map(([x, y]) => [x + rr(-0.6, 0.6), y + rr(-0.6, 0.6)]), false)}"/>`); // loops get a lighter wobble
  const star = place(MARKS.star().outline, sx, sy, 1.7, 0.15);
  fillOf(star, accent);
  line(star, true);
  for (const a of [-2.2, -1.5, -0.8, 0]) line([[sx + Math.cos(a) * 36, sy + Math.sin(a) * 36], [sx + Math.cos(a) * 46, sy + Math.sin(a) * 46]]); // emphasis ticks

  // The wall stops on a wobbly hand-drawn edge.
  const edge = Array.from({ length: 21 }, (_, i) => [i * 20, WALL + Math.sin(i * 1.3) * 4]);
  const groundCut = smooth([...edge, [W + 10, H + 10], [-10, H + 10]], true);

  // Text: hand-lettered headline (display face), set subhead (body face), brand next to the headline.
  // Hand lettering stays short: the headline shrinks (38 -> 26 units) to fit three lines at most.
  let HS = 38, lines = [];
  for (HS = 38; ; HS -= 4) {
    const maxChars = Math.floor(330 / (HS * 0.52));
    lines = [];
    for (const w of String(copy.headline || '').split(/\s+/)) {
      const last = lines[lines.length - 1];
      if (last && (last + ' ' + w).length <= maxChars) lines[lines.length - 1] = last + ' ' + w; else lines.push(w);
    }
    if (lines.length <= 3 || HS <= 26) break;
  }
  const hy = 420;
  const head = lines.slice(0, 3).map((l, i) => `<tspan x="30" y="${hy + i * HS * 1.02}">${esc(l)}</tspan>`).join('');
  const ly = hy + (Math.min(lines.length, 3) - 1) * HS * 1.02;
  const underW = Math.min(330, lines[Math.min(lines.length, 3) - 1].length * HS * 0.52);
  line(Array.from({ length: 12 }, (_, i) => [30 + (i * underW) / 11, ly + 12 + Math.sin(i * 1.9) * 2.5]));
  // A curly arrow from the words up into the clearing: the marks point at the message.
  const ex = 30 + underW; // a curly arrow points back at the last word of the headline
  if (ex + 110 < W - 20) {
    line([[ex + 100, ly + 12], [ex + 90, ly - 14], [ex + 66, ly - 28], [ex + 40, ly - 26], [ex + 16, ly - 12]]);
    line([[ex + 16, ly - 12], [ex + 30, ly - 9]]);
    line([[ex + 16, ly - 12], [ex + 22, ly - 25]]);
  }

  const fontD = `'Shantell Sans', 'Gochi Hand', system-ui, sans-serif`;
  const fontB = `Figtree, 'Alegreya Sans', system-ui, sans-serif`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(copy.headline)}">
<rect width="${W}" height="${H}" fill="${ground}"/>
<g>${wallFills.join('')}</g>
<g fill="none" stroke="${ink}" stroke-width="${PEN}" stroke-linecap="round" stroke-linejoin="round">${wallInks.join('')}</g>
<path d="${groundCut}" fill="${ground}"/>
<path d="${smooth(wobble(edge, 1), false)}" fill="none" stroke="${ink}" stroke-width="${PEN}" stroke-linecap="round"/>
<g>${fills.join('')}</g>
<g fill="none" stroke="${ink}" stroke-width="${PEN}" stroke-linecap="round" stroke-linejoin="round">${inks.join('')}</g>
<text font-family="${fontD}" font-size="${HS}" font-weight="700" fill="${ink}" letter-spacing="-0.5" transform="rotate(-1.5 30 ${hy})">${head}</text>
<text x="30" y="${ly + 46}" font-family="${fontB}" font-size="15" fill="${ink}">${esc(copy.subhead)}</text>
<text x="30" y="${hy - 44}" font-family="${fontB}" font-size="11" font-weight="700" letter-spacing="1.2" fill="${ink}">${esc(String(copy.brand || '').toUpperCase())}</text>
</svg>`;
}
