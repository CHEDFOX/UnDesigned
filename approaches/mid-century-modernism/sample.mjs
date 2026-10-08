// Mid-century Modernism: sample poster.
// samplePoster(palette, copy) -> '<svg viewBox="0 0 400 566">...</svg>'
// Pure and deterministic: all randomness comes from a seed made from the copy.
// palette = { ground, ink, paper, accent, support: [hex, ...] }
// copy    = { headline, subhead, brand }
//
// What it shows (see art.json):
// - flat ground with a light paper speckle (printed-on-cheap-stock grain)
// - one large kidney shape in a support colour, dry-brush streaks on one edge
// - a Charley Harper-style bird built from arcs and triangles, in the accent
// - colour fills misregistered against the ink layer by a fixed offset
// - a starburst sun, a branch with angular leaves
// - geometric sans headline, old-style italic subhead, letter-spaced brand label

export function samplePoster(palette = {}, copy = {}) {
  const ground = palette.ground || '#e2b540';
  const ink = palette.ink || '#111314';
  const paper = palette.paper || '#ffffff';
  const accent = palette.accent || '#cc1236';
  const support = palette.support && palette.support.length ? palette.support : [paper];
  const shapeA = support[0];
  const shapeB = support[1] || paper;

  const headline = String(copy.headline || 'Good things, made simply');
  const subhead = String(copy.subhead || '');
  const brand = String(copy.brand || '');

  // Seeded random (mulberry32) from the copy, so the same input gives the same poster.
  let seed = 7;
  for (const ch of headline + brand) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r1 = (n) => Math.round(n * 10) / 10;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Misregistration: every colour plate is shifted by the same small offset from the ink plate.
  const MX = 3.5, MY = 2.5;

  // Word wrap by an average glyph width (geometric sans bold is about 0.56 em).
  const wrap = (text, size, width, em = 0.56) => {
    const max = Math.max(4, Math.floor(width / (size * em)));
    const lines = [];
    let line = '';
    for (const w of text.split(/\s+/)) {
      const next = line ? line + ' ' + w : w;
      if (next.length > max && line) { lines.push(line); line = w; } else line = next;
    }
    if (line) lines.push(line);
    return lines;
  };

  // --- Ground speckle (paper grain): tiny solid paper dots, about 0.2% of the area.
  let grain = '';
  for (let i = 0; i < 200; i++) {
    grain += `<circle cx="${r1(rand() * 400)}" cy="${r1(rand() * 566)}" r="${r1(0.35 + rand() * 0.5)}"/>`;
  }

  // --- Kidney shape (biomorphic, off the right edge).
  const kidney = 'M 214 214 C 300 168, 436 196, 430 306 C 424 404, 338 492, 252 468 ' +
    'C 196 452, 232 392, 196 352 C 160 314, 150 246, 214 214 Z';

  // Dry-brush streaks: short gaps of ground colour where the brush ran dry on the kidney's
  // left edge, clipped to the shape so they read as skips in the paint, not as stripes.
  let brush = '';
  for (let i = 0; i < 34; i++) {
    const y = 214 + i * 7.5 + rand() * 4;
    const x = 150 + rand() * 50;
    const len = 6 + rand() * 30;
    brush += `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(len)}" height="${r1(0.8 + rand() * 1.6)}" rx="0.8"/>`;
  }

  // --- Starburst sun: 16 points, alternating radii (an atomic-age star).
  const star = (cx, cy, ro, ri, n, rot = 0) => {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = rot + (Math.PI * i) / n;
      const r = i % 2 ? ri : ro;
      d += (i ? 'L' : 'M') + r1(cx + r * Math.cos(a)) + ' ' + r1(cy + r * Math.sin(a)) + ' ';
    }
    return d + 'Z';
  };

  // --- Charley Harper-style bird, facing left, perched on the branch.
  // Built from one arc-and-line body, a triangle tail, a triangle crest and a circle eye.
  const bx = 250, by = 330;
  const body = `M ${bx - 52} ${by - 18} C ${bx - 48} ${by - 70}, ${bx + 14} ${by - 86}, ${bx + 40} ${by - 30} ` +
    `L ${bx + 104} ${by + 58} L ${bx + 62} ${by + 50} C ${bx + 30} ${by + 70}, ${bx - 40} ${by + 46}, ${bx - 52} ${by - 18} Z`;
  const crest = `M ${bx - 36} ${by - 58} L ${bx - 6} ${by - 104} L ${bx + 2} ${by - 60} Z`;
  const wing = `M ${bx - 6} ${by - 10} C ${bx + 20} ${by - 40}, ${bx + 60} ${by - 10}, ${bx + 80} ${by + 36} ` +
    `C ${bx + 40} ${by + 30}, ${bx + 6} ${by + 24}, ${bx - 6} ${by - 10} Z`;
  const mask = `M ${bx - 52} ${by - 18} L ${bx - 30} ${by - 46} L ${bx - 14} ${by - 8} Z`;
  const beak = `M ${bx - 50} ${by - 30} L ${bx - 78} ${by - 16} L ${bx - 50} ${by - 6} Z`;

  // Branch: one long ink stroke with angular leaves.
  const leaf = (x, y, len, ang, fill) => {
    const a = (ang * Math.PI) / 180, w = len * 0.32;
    const tx = x + len * Math.cos(a), ty = y + len * Math.sin(a);
    const nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
    const mx = (x + tx) / 2, my = (y + ty) / 2;
    return `<path d="M ${r1(x)} ${r1(y)} Q ${r1(mx + nx)} ${r1(my + ny)} ${r1(tx)} ${r1(ty)} Q ${r1(mx - nx)} ${r1(my - ny)} ${r1(x)} ${r1(y)} Z" fill="${fill}"/>`;
  };

  // --- Type.
  const M = 32; // 8% margin
  const hSize = headline.length <= 26 ? 42 : headline.length <= 44 ? 34 : 28;
  const hLines = wrap(headline, hSize, 290, 0.52);
  const hText = hLines.map((l, i) => `<tspan x="${M}" dy="${i ? r1(hSize * 0.98) : 0}">${esc(l)}</tspan>`).join('');
  const subY = 70 + hSize * 0.8 + (hLines.length - 1) * hSize * 0.98 + 30;
  const sLines = subhead ? wrap(subhead, 15, 210, 0.44) : [];
  // Push the art down when the text block runs long, so text and art never touch.
  const textBottom = subY + Math.max(0, sLines.length - 1) * 20;
  const shift = r1(Math.min(46, Math.max(0, textBottom - 176)));
  const sText = sLines.map((l, i) => `<tspan x="${M}" dy="${i ? 20 : 0}">${esc(l)}</tspan>`).join('');

  // Boomerang: two tapering arms meeting at a soft elbow (atomic-age vocabulary).
  // Drawn round (0,0), then placed with a transform; the left arm is longer, as on the 1950s laminates.
  const boomerang = 'M -64 22 C -50 2, -24 -16, 0 -26 C 20 -18, 42 -4, 58 8 C 63 12, 58 19, 52 16 ' +
    'C 36 8, 16 -2, 2 -6 C -14 2, -34 18, -50 32 C -56 37, -68 30, -64 22 Z';
  const boomerangAt = 'translate(112 462) rotate(-10)';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 566" width="400" height="566" role="img" aria-label="${esc(headline)}">
<rect width="400" height="566" fill="${ground}"/>
<g fill="${paper}">${grain}</g>
<path d="${star(350, 112, 36, 20, 16, 0.1)}" fill="${paper}"/>
<g transform="translate(0 ${shift})">
<defs><clipPath id="mcm-k"><path d="${kidney}"/></clipPath></defs>
<g transform="translate(${MX} ${MY})">
  <path d="${kidney}" fill="${shapeA}"/>
  <g fill="${ground}" clip-path="url(#mcm-k)">${brush}</g>
  <path d="${body}" fill="${accent}"/>
  <path d="${crest}" fill="${accent}"/>
</g>
<g fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round">
  <path d="${kidney}" stroke-width="1.6" transform="translate(-2 -1)"/>
  <path d="M -4 414 C 120 400, 250 398, 404 372" stroke-width="5"/>
  <path d="M 70 408 L 46 388" stroke-width="3"/>
  <path d="M ${bx + 62} ${by + 50} L ${bx + 96} ${by + 52}" stroke-width="2"/>
</g>
${leaf(46, 388, 34, -150, ink)}
<g transform="translate(${MX} ${MY})">${leaf(46, 388, 30, -100, shapeB)}</g>
<path d="${wing}" fill="${ink}"/>
<path d="${mask}" fill="${ink}"/>
<path d="${beak}" fill="${shapeB}" stroke="${ink}" stroke-width="1.6" stroke-linejoin="round"/>
<circle cx="${bx - 30}" cy="${by - 30}" r="7" fill="${paper}"/>
<circle cx="${bx - 31}" cy="${by - 30}" r="3" fill="${ink}"/>
<g stroke="${ink}" stroke-width="2.4" stroke-linecap="round">
  <path d="M ${bx + 6} ${by + 52} L ${bx} ${by + 74}"/>
  <path d="M ${bx + 26} ${by + 54} L ${bx + 24} ${by + 72}"/>
</g>
<path d="${star(352, 476, 6, 1.8, 4)}" fill="${paper}"/>
</g>
<path d="${boomerang}" fill="${paper}" transform="translate(${MX} ${MY}) ${boomerangAt}"/>
<path d="${boomerang}" fill="none" stroke="${ink}" stroke-width="1.6" stroke-linejoin="round" transform="translate(-2 -1) ${boomerangAt}"/>
<text x="${M}" y="70" font-family="'League Spartan', Futura, 'Century Gothic', sans-serif" font-weight="800" font-size="${hSize}" letter-spacing="-0.8" fill="${ink}">${hText}</text>
${subhead ? `<text x="${M}" y="${r1(subY)}" font-family="'Libre Caslon Text', Caslon, Georgia, serif" font-style="italic" font-size="15" fill="${ink}">${sText}</text>` : ''}
${brand ? `<path d="${star(M + 6, 530, 8, 2.2, 4)}" fill="${ink}"/>
<text x="${M + 22}" y="534.5" font-family="'League Spartan', Futura, sans-serif" font-weight="700" font-size="12" letter-spacing="2.4" fill="${ink}">${esc(brand.toUpperCase())}</text>` : ''}
</svg>`;
}
