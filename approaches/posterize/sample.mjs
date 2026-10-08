// Posterize sample poster. Pure, deterministic, no imports, no external images.
//
// The subject is a procedurally built grayscale "photograph" (a side-lit face
// looking up and to the left). The SVG renderer then posterizes it the way a
// printer separates a photo: soften it into a stencil, read luminance, cut it into
// flat levels (feComponentTransfer type="discrete") and print each level as one
// flat colour. The ink plate is a separate pass laid slightly out of register,
// with a few worn voids; a halftone fade on the colour block is the only shading.
//
// samplePoster(palette, copy) -> '<svg viewBox="0 0 400 566">...</svg>'
// palette = { ground, ink, paper, accent, support: [hex...] }
// copy    = { headline, subhead, brand }

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rgb = (h) => { const n = parseInt(String(h).replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => +(v / 255).toFixed(4)); };
const lum = (h) => { const [r, g, b] = rgb(h).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const BINS = 40;
// Discrete transfer table: BINS steps over 0-1 luminance; each step takes the
// channel value of the colour whose band contains it.
function table(cuts, colours, ch) {
  const out = [];
  for (let i = 0; i < BINS; i++) {
    const v = (i + 0.5) / BINS;
    let k = 0;
    while (k < cuts.length && v >= cuts[k]) k++;
    out.push(rgb(colours[k])[ch]);
  }
  return out.join(' ');
}

// Break the headline into lines of at most `max` characters.
function wrap(text, max) {
  const lines = [];
  let line = '';
  for (const w of String(text).split(/\s+/).filter(Boolean)) {
    if (line && (line + ' ' + w).length > max) { lines.push(line); line = w; } else line = line ? line + ' ' + w : w;
  }
  if (line) lines.push(line);
  return lines;
}

// The "photograph": grayscale shapes that read as a side-lit head and shoulders.
// Key light from the upper left; 0 = black, 1 = white. Fits the 400 x 360 panel.
function photo(id) {
  const g = (v) => { const c = Math.round(v * 255).toString(16).padStart(2, '0'); return `#${c}${c}${c}`; };
  return `
  <defs>
    <radialGradient id="${id}-skin" cx="0.22" cy="0.36" r="0.95">
      <stop offset="0" stop-color="${g(1)}"/><stop offset="0.38" stop-color="${g(0.8)}"/>
      <stop offset="0.6" stop-color="${g(0.5)}"/><stop offset="1" stop-color="${g(0.12)}"/>
    </radialGradient>
    <linearGradient id="${id}-neck" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0" stop-color="${g(0.62)}"/><stop offset="0.5" stop-color="${g(0.3)}"/><stop offset="1" stop-color="${g(0.1)}"/>
    </linearGradient>
  </defs>
  <path d="M40 360 C60 300 120 282 168 276 L262 280 C320 290 372 318 400 352 L400 360 Z" fill="${g(0.1)}"/>
  <path d="M86 360 C100 318 140 300 172 296 L188 330 Z" fill="${g(0.55)}"/>
  <path d="M168 230 C166 262 160 290 150 304 C190 320 240 318 266 300 C258 276 254 250 256 222 Z" fill="url(#${id}-neck)"/>
  <path d="M170 262 C200 280 236 276 258 254 L258 236 C232 262 200 262 170 246 Z" fill="${g(0.06)}"/>
  <g transform="rotate(-14 214 160)">
    <ellipse cx="214" cy="158" rx="86" ry="112" fill="url(#${id}-skin)"/>
    <path d="M126 112 C116 40 176 6 238 14 C296 22 320 76 304 150 C298 120 286 96 262 84 C226 72 170 82 132 118 Z" fill="${g(0.07)}"/>
    <path d="M146 96 C170 64 214 52 252 58 C214 66 180 80 156 104 Z" fill="${g(0.4)}"/>
    <ellipse cx="298" cy="170" rx="14" ry="26" fill="${g(0.28)}"/>
    <ellipse cx="176" cy="138" rx="28" ry="17" fill="${g(0.56)}"/>
    <path d="M150 124 C166 114 186 114 198 122" stroke="${g(0.14)}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M226 124 C240 116 260 118 272 128" stroke="${g(0.05)}" stroke-width="9" fill="none" stroke-linecap="round"/>
    <ellipse cx="174" cy="140" rx="14" ry="7" fill="${g(0.2)}"/>
    <ellipse cx="248" cy="142" rx="16" ry="9" fill="${g(0.06)}"/>
    <path d="M206 136 C204 158 198 176 192 190 C202 196 214 196 222 190 C218 172 214 152 214 136 Z" fill="${g(0.92)}"/>
    <path d="M214 140 C222 160 230 180 228 194 C222 200 212 200 204 198 C214 194 220 190 222 186 Z" fill="${g(0.08)}"/>
    <path d="M262 150 C276 180 280 214 268 240 C272 210 268 180 262 150 Z" fill="${g(0.22)}"/>
    <path d="M150 182 C160 200 176 214 196 218 C178 222 158 208 150 182 Z" fill="${g(0.55)}"/>
    <path d="M180 224 C196 214 222 214 238 222 C224 230 200 232 180 224 Z" fill="${g(0.1)}"/>
    <path d="M188 230 C202 240 222 240 232 230 C220 236 200 236 188 230 Z" fill="${g(0.72)}"/>
    <ellipse cx="206" cy="252" rx="22" ry="10" fill="${g(0.7)}"/>
    <path d="M150 248 C176 266 222 268 256 246 C246 262 220 272 200 272 C180 272 160 262 150 248 Z" fill="${g(0.26)}"/>
  </g>`;
}

// Shared first steps of both plate filters: soften the photo, then nudge its
// luminance with low-frequency noise so the cut edges wander like a real photo.
const SOFTEN = `<feGaussianBlur stdDeviation="2.4" result="b0"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" result="t"/>
      <feComposite in="b0" in2="t" operator="arithmetic" k2="1" k3="0.16" k4="-0.08" result="b1"/>
      <feComposite in="b1" in2="b0" operator="in" result="b"/>`;

export function samplePoster(palette, copy) {
  const { ground, ink, paper, accent } = palette;
  const support = (palette.support || [])[0] || paper;
  const font = "Anton, 'Big Shoulders Display', 'Archivo Narrow', 'Arial Narrow', Impact, sans-serif";
  const body = "Archivo, Barlow, 'Helvetica Neue', Arial, sans-serif";
  const text = contrast(ink, ground) >= 4.5 ? ink : paper;

  // Three tonal levels cut on luminance: below 0.30 ink, 0.30-0.66 accent, above
  // 0.66 paper. The colour plate prints the ink zone in accent as well (a trap),
  // so the out-of-register ink plate shows a sliver of accent, as in a real pull.
  const cuts = [0.3, 0.66];
  const plate = [accent, accent, paper];
  const inkA = Array.from({ length: BINS }, (_, i) => ((i + 0.5) / BINS > 1 - cuts[0] ? 1 : 0)).join(' ');
  const [ir, ig, ib] = rgb(ink);

  // Halftone fade: accent dots on a 45-degree screen, growing toward the lower
  // left corner of the colour block.
  const dots = [];
  const cell = 8;
  for (let row = 0; row < 60; row++) {
    for (let col = 0; col < 52; col++) {
      const x = col * cell + (row % 2 ? cell / 2 : 0);
      const y = 362 - row * (cell / 2);
      const t = 1 - Math.hypot(x / 300, (362 - y) / 230);
      const r = 0.5 * cell * 0.95 * Math.sqrt(Math.max(0, t));
      if (r > 0.45) dots.push(`<circle cx="${x}" cy="${y}" r="${r.toFixed(2)}"/>`);
    }
  }

  // Fit the headline: largest size (56 down to 24) whose lines fit 344 x 118.
  // Width is estimated at 0.5 em per character so wider fallback fonts still fit.
  let size = 56, lines = [];
  for (; size >= 24; size -= 2) {
    lines = wrap(copy.headline, Math.floor(344 / (size * 0.5)));
    if (lines.length * size * 1.02 <= 118) break;
  }
  const top = 396 + size * 0.86;
  const head = lines.map((l, i) => `<tspan x="28" y="${(top + i * size * 1.02).toFixed(1)}">${esc(l)}</tspan>`).join('');
  const afterHead = top + (lines.length - 1) * size * 1.02;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 566" width="400" height="566" role="img" aria-label="${esc(copy.headline)}">
  <title>${esc(copy.headline)}</title>
  <defs>
    <clipPath id="pz-panel"><rect x="0" y="0" width="400" height="360"/></clipPath>
    <filter id="pz-plate" filterUnits="userSpaceOnUse" x="0" y="0" width="400" height="360" color-interpolation-filters="sRGB">
      ${SOFTEN}
      <feColorMatrix in="b" type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"/>
      <feComponentTransfer>
        <feFuncR type="discrete" tableValues="${table(cuts, plate, 0)}"/>
        <feFuncG type="discrete" tableValues="${table(cuts, plate, 1)}"/>
        <feFuncB type="discrete" tableValues="${table(cuts, plate, 2)}"/>
        <feFuncA type="discrete" tableValues="0 1"/>
      </feComponentTransfer>
    </filter>
    <filter id="pz-ink" filterUnits="userSpaceOnUse" x="0" y="0" width="400" height="360" color-interpolation-filters="sRGB">
      ${SOFTEN}
      <feComponentTransfer in="b" result="mask"><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer>
      <feColorMatrix in="b" type="matrix" values="0 0 0 0 ${ir}  0 0 0 0 ${ig}  0 0 0 0 ${ib}  -0.2126 -0.7152 -0.0722 0 1" result="dark"/>
      <feComponentTransfer in="dark" result="cut"><feFuncA type="discrete" tableValues="${inkA}"/></feComponentTransfer>
      <feComposite in="cut" in2="mask" operator="in" result="plate"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="7" result="n"/>
      <feComponentTransfer in="n" result="voids"><feFuncA type="discrete" tableValues="1 1 1 1 1 1 1 1 1 0"/></feComponentTransfer>
      <feComposite in="plate" in2="voids" operator="in"/>
      <feOffset dx="2.5" dy="1.5"/>
    </filter>
  </defs>
  <rect width="400" height="566" fill="${ground}"/>
  <rect width="400" height="360" fill="${support}"/>
  <g fill="${accent}" clip-path="url(#pz-panel)">${dots.join('')}</g>
  <g clip-path="url(#pz-panel)">
    <g filter="url(#pz-plate)">${photo('pzc')}</g>
    <g filter="url(#pz-ink)">${photo('pzk')}</g>
  </g>
  <rect x="0" y="358" width="400" height="5" fill="${ink}"/>
  <text x="28" y="390" font-family="${body}" font-size="12" font-weight="700" fill="${text}" letter-spacing="0.4">${esc(copy.brand)}</text>
  <text font-family="${font}" font-size="${size}" font-weight="400" fill="${text}" letter-spacing="-0.5">${head}</text>
  <text x="28" y="${(afterHead + 34).toFixed(1)}" font-family="${body}" font-size="15" fill="${text}">${esc(copy.subhead)}</text>
  <g transform="translate(300 540)">${[...new Set([ink, accent, support, paper])].map((c, i) => `<rect x="${i * 18}" width="18" height="10" fill="${c}"/>`).join('')}</g>
</svg>`;
}
