// Commercial Modernism: sample poster.
// samplePoster(palette, copy) -> a complete SVG string (viewBox 0 0 400 566).
// The hero object (an ocean-liner bow, seen from a low viewpoint) looms over a
// low horizon, modelled with airbrush gradients built only between palette
// colours. Lettering sits in a solid band, as in 1930s travel posters.
// Pure and deterministic: no imports, no randomness, no external images.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Break text into at most two balanced lines (no single-word orphan when avoidable).
function wrap(text, max) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const all = words.join(' ');
  if (all.length <= max || words.length < 2) return [all];
  let best = [all], score = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
    const s = Math.max(a.length, b.length) + (a.length < b.length ? 0.5 : 0);
    if (s < score) { score = s; best = [a, b]; }
  }
  return best;
}

// A linear gradient between two palette colours (the airbrush rule: two stops, one combination).
const lin = (id, a, b, x1, y1, x2, y2) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

export function samplePoster(palette = {}, copy = {}) {
  const ground = palette.ground ?? '#f5ecc2';
  const ink = palette.ink ?? '#111314';
  const paper = palette.paper ?? '#ffffff';
  const accent = palette.accent ?? ink;
  const support = palette.support ?? [];
  const sun = support[0] ?? paper;
  const deep = support[1] ?? ink;

  const W = 400, H = 566;
  const horizon = 404;          // low horizon: 71% down, so the bow looms
  const band = 424;             // lettering band starts here (bottom 25%)
  const keel = { x: 200, y: 402 };
  const deckL = { x: 58, y: 156 }, deckR = { x: 342, y: 156 }, stem = { x: 200, y: 132 };

  const font = "Jost, Futura, 'Century Gothic', 'Avenir Next', sans-serif";
  const display = "Limelight, Jost, Futura, 'Century Gothic', sans-serif";

  // Speed lines: parallel, tapering away from the hull, equal spacing.
  const speed = [];
  for (let i = 0; i < 6; i++) {
    const y = 214 + i * 16;
    const len = 118 - i * 15;
    const w = 3.2 - i * 0.4;
    speed.push(`<rect x="${12 + i * 3}" y="${y}" width="${len}" height="${w}" rx="${w / 2}" fill="${paper}"/>`);
    speed.push(`<rect x="${W - 12 - i * 3 - len}" y="${y}" width="${len}" height="${w}" rx="${w / 2}" fill="${paper}"/>`);
  }

  // Wake: horizontal streaks on the sea.
  const wake = [];
  const streaks = [[22, 372, 90], [270, 368, 108], [60, 386, 70], [300, 392, 70], [16, 398, 44], [338, 382, 50]];
  for (const [x, y, len] of streaks) wake.push(`<rect x="${x}" y="${y}" width="${len}" height="1.8" rx="0.9" fill="${paper}"/>`);

  // Gulls: three flat silhouettes, decreasing in size along the diagonal.
  const gull = (x, y, s) =>
    `<path d="M${x - 10 * s},${y} Q${x - 5 * s},${y - 6 * s} ${x},${y} Q${x + 5 * s},${y - 6 * s} ${x + 10 * s},${y} Q${x + 5 * s},${y - 3 * s} ${x},${y + 1.5 * s} Q${x - 5 * s},${y - 3 * s} ${x - 10 * s},${y} Z" fill="${ink}"/>`;

  // Funnels: tapered, accent body (the one accent object), ink cap, shaded with an accent-to-ink airbrush.
  const funnel = (cx, top, bottom, wTop, wBot) => {
    const cap = top + (bottom - top) * 0.2;
    const lerp = (t) => wTop + (wBot - wTop) * t;
    return `<path d="M${cx - wBot / 2},${bottom} L${cx - wTop / 2},${top + 4} Q${cx},${top - 3} ${cx + wTop / 2},${top + 4} L${cx + wBot / 2},${bottom} Z" fill="url(#cm-funnel)"/>` +
      `<path d="M${cx - lerp(0.2) / 2},${cap} L${cx - wTop / 2},${top + 4} Q${cx},${top - 3} ${cx + wTop / 2},${top + 4} L${cx + lerp(0.2) / 2},${cap} Z" fill="${ink}"/>`;
  };

  // Bridge windows: a row of small ink slots on the superstructure.
  const windows = [];
  for (let i = 0; i < 9; i++) windows.push(`<rect x="${137 + i * 14}" y="121" width="8" height="5" rx="1.5" fill="${ink}"/>`);

  // Lettering: brand label, headline (two lines max), subhead. Left-aligned on one edge.
  const head = wrap(copy.headline ?? 'Travel by morning light', 17).slice(0, 2);
  const longest = Math.max(...head.map((l) => l.length), 1);
  const headSize = Math.round(Math.min(31, (31 * 17) / longest) * 10) / 10;
  const headY0 = band + 64;
  const headText = head.map((l, i) => `<tspan x="28" y="${headY0 + i * headSize * 1.02}">${esc(l)}</tspan>`).join('');
  const subY = headY0 + (head.length - 1) * headSize * 1.02 + 26;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
${lin('cm-sky', sun, ground, 0, 0, 0, 1)}
<radialGradient id="cm-sun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${paper}"/><stop offset="1" stop-color="${sun}"/></radialGradient>
${lin('cm-sea', deep, ink, 0, 0, 0, 1)}
${lin('cm-hullL', deep, ink, 0, 0, 1, 0)}
${lin('cm-hullR', ink, deep, 0, 0, 1, 0)}
${lin('cm-deck', paper, ground, 0, 0, 0, 1)}
${lin('cm-funnel', accent, ink, 0.35, 0, 1.25, 0)}
</defs>
<rect width="${W}" height="${H}" fill="url(#cm-sky)"/>
<circle cx="200" cy="232" r="150" fill="url(#cm-sun)"/>
${speed.join('')}
${gull(66, 74, 1.3)}${gull(102, 96, 0.95)}${gull(126, 60, 0.7)}
<rect y="${horizon - 50}" width="${W}" height="${band - horizon + 50}" fill="url(#cm-sea)"/>
${wake.join('')}
${funnel(132, 64, 116, 30, 34)}${funnel(268, 64, 116, 30, 34)}${funnel(200, 34, 112, 42, 48)}
<path d="M104,142 L114,108 L286,108 L296,142 Z" fill="url(#cm-deck)"/>
<rect x="124" y="98" width="152" height="12" rx="2" fill="${paper}"/>
${windows.join('')}
<path d="M${keel.x},${keel.y} Q${keel.x - 92},${keel.y - 90} ${deckL.x},${deckL.y} Q${(deckL.x + stem.x) / 2},${stem.y + 4} ${stem.x},${stem.y} Z" fill="url(#cm-hullL)"/>
<path d="M${keel.x},${keel.y} Q${keel.x + 92},${keel.y - 90} ${deckR.x},${deckR.y} Q${(deckR.x + stem.x) / 2},${stem.y + 4} ${stem.x},${stem.y} Z" fill="url(#cm-hullR)"/>
<path d="M${stem.x},${stem.y} L${keel.x},${keel.y}" stroke="${paper}" stroke-width="1.6"/>
<path d="M${deckL.x},${deckL.y} Q${(deckL.x + stem.x) / 2},${stem.y + 4} ${stem.x},${stem.y} Q${(deckR.x + stem.x) / 2},${stem.y + 4} ${deckR.x},${deckR.y}" fill="none" stroke="${paper}" stroke-width="3"/>
<ellipse cx="162" cy="176" rx="7" ry="5" fill="${paper}"/><ellipse cx="162" cy="177" rx="4" ry="2.6" fill="${ink}"/>
<ellipse cx="238" cy="176" rx="7" ry="5" fill="${paper}"/><ellipse cx="238" cy="177" rx="4" ry="2.6" fill="${ink}"/>
<path d="M${keel.x - 3},${keel.y - 14} Q${keel.x - 30},${keel.y - 2} ${keel.x - 78},${keel.y + 6} Q${keel.x - 30},${keel.y + 4} ${keel.x},${keel.y + 9} Q${keel.x + 30},${keel.y + 4} ${keel.x + 78},${keel.y + 6} Q${keel.x + 30},${keel.y - 2} ${keel.x + 3},${keel.y - 14} Z" fill="${paper}"/>
<rect y="${band}" width="${W}" height="${H - band}" fill="${ink}"/>
<rect x="28" y="${band + 22}" width="44" height="3" fill="${accent}"/>
<text x="80" y="${band + 28}" font-family="${display}" font-size="15" letter-spacing="3" fill="${paper}">${esc(String(copy.brand ?? 'UnDesigned').toUpperCase())}</text>
<text font-family="${font}" font-weight="700" font-size="${headSize}" letter-spacing="-0.4" fill="${paper}">${headText}</text>
<text x="28" y="${subY}" font-family="${font}" font-weight="400" font-size="11.5" letter-spacing="0.3" fill="${sun}">${esc(copy.subhead ?? '')}</text>
</svg>`;
}
