// Posterize subjects: procedurally lit grayscale "photographs" for pieces without a photo.
// Each is side-lit from the upper left (art.json → crop.light) on a transparent background (the
// background is removed, crop.background), so the skin's SVG filters can cut it into flat plates.
// draw(id) returns SVG in a local frame of frame[0] x frame[1] units; 0 = black, 1 = white.

const g = (v) => { const c = Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0'); return `#${c}${c}${c}`; };

// A side-lit head and shoulders looking up and to the left (sample.mjs).
function face(id) {
  return `<defs>
    <radialGradient id="${id}-skin" cx="0.22" cy="0.36" r="0.95"><stop offset="0" stop-color="${g(1)}"/><stop offset="0.38" stop-color="${g(0.8)}"/><stop offset="0.6" stop-color="${g(0.5)}"/><stop offset="1" stop-color="${g(0.12)}"/></radialGradient>
    <linearGradient id="${id}-neck" x1="0" y1="0" x2="1" y2="0.6"><stop offset="0" stop-color="${g(0.62)}"/><stop offset="0.5" stop-color="${g(0.3)}"/><stop offset="1" stop-color="${g(0.1)}"/></linearGradient>
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

// A scored sourdough-style loaf on a board, seen from the side (art.json → vocabulary: loaf).
function loaf(id) {
  const slash = (x, y, a) => `<g transform="rotate(${a} ${x} ${y})"><path d="M${x - 46} ${y} C${x - 20} ${y - 16} ${x + 20} ${y - 16} ${x + 46} ${y} C${x + 20} ${y - 6} ${x - 20} ${y - 6} ${x - 46} ${y} Z" fill="${g(0.08)}"/>` +
    `<path d="M${x - 44} ${y - 3} C${x - 20} ${y - 20} ${x + 20} ${y - 20} ${x + 44} ${y - 3} C${x + 20} ${y - 13} ${x - 20} ${y - 13} ${x - 44} ${y - 3} Z" fill="${g(0.97)}"/></g>`;
  return `<defs>
    <radialGradient id="${id}-crust" cx="0.28" cy="0.18" r="0.95"><stop offset="0" stop-color="${g(0.92)}"/><stop offset="0.22" stop-color="${g(0.7)}"/><stop offset="0.6" stop-color="${g(0.42)}"/><stop offset="1" stop-color="${g(0.06)}"/></radialGradient>
    <linearGradient id="${id}-board" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${g(0.62)}"/><stop offset="1" stop-color="${g(0.18)}"/></linearGradient>
  </defs>
  <path d="M0 262 L400 262 L400 300 L0 300 Z" fill="${g(0.1)}"/>
  <path d="M0 250 L400 250 L400 264 L0 264 Z" fill="url(#${id}-board)"/>
  <ellipse cx="208" cy="250" rx="176" ry="14" fill="${g(0.04)}"/>
  <path d="M28 244 C22 150 100 70 204 66 C306 62 384 140 376 244 C300 256 110 256 28 244 Z" fill="url(#${id}-crust)"/>
  <path d="M40 232 C120 246 290 246 368 230 C360 246 300 252 204 252 C110 252 50 248 40 232 Z" fill="${g(0.14)}"/>
  ${slash(128, 124, -24)}${slash(200, 102, -8)}${slash(276, 116, 12)}
  <path d="M62 150 C82 110 120 86 160 78 C120 96 92 120 76 160 Z" fill="${g(0.98)}"/><path d="M28 244 C22 150 100 70 204 66 C130 80 50 140 44 244 Z" fill="${g(0.5)}"/>`;
}

// A cup on a saucer from the side, steam rising (art.json → vocabulary: cup, a real break).
function cup(id) {
  return `<defs>
    <linearGradient id="${id}-body" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${g(0.46)}"/><stop offset="0.24" stop-color="${g(0.95)}"/><stop offset="0.5" stop-color="${g(0.56)}"/><stop offset="1" stop-color="${g(0.08)}"/></linearGradient>
    <linearGradient id="${id}-saucer" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stop-color="${g(0.9)}"/><stop offset="0.6" stop-color="${g(0.5)}"/><stop offset="1" stop-color="${g(0.1)}"/></linearGradient>
  </defs>
  <path d="M120 112 C100 84 140 66 120 36 C108 18 126 6 132 0" stroke="${g(0.86)}" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M176 104 C160 74 198 60 180 28" stroke="${g(0.9)}" stroke-width="10" fill="none" stroke-linecap="round"/>
  <ellipse cx="180" cy="322" rx="170" ry="30" fill="url(#${id}-saucer)"/>
  <ellipse cx="180" cy="316" rx="96" ry="12" fill="${g(0.06)}"/>
  <path d="M276 160 C346 150 350 250 268 262 L262 236 C310 230 312 182 272 186 Z" fill="${g(0.16)}"/>
  <path d="M60 130 L300 130 C300 230 270 312 180 312 C90 312 60 230 60 130 Z" fill="url(#${id}-body)"/>
  <ellipse cx="180" cy="130" rx="120" ry="20" fill="${g(0.6)}"/>
  <ellipse cx="180" cy="133" rx="106" ry="14" fill="${g(0.07)}"/>`;
}

export const subjects = {
  loaf: { frame: [400, 300], draw: loaf },
  face: { frame: [400, 360], draw: face },
  cup: { frame: [360, 360], draw: cup },
};
