// Bauhaus sample poster. Pure and deterministic: no imports, no randomness.
// samplePoster(palette, copy) -> '<svg viewBox="0 0 400 566">…</svg>'
// palette = { ground, ink, paper, accent, support: [hex…] }; copy = { headline, subhead, brand }.
// Construction (art.json): 8-column grid on a 400-wide sheet, margin 24, angles 0 / 90 / 45 only,
// circle + square + triangle + bars, accent on the focal circle, black bars, type on the grid.

const FONT = "Jost, 'League Spartan', Futura, 'Century Gothic', Arial, sans-serif";

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function lum(hex) {
  const h = String(hex || '#000000').replace('#', '');
  const v = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}

function contrast(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// Greedy word wrap by character budget; the last allowed line ends with an ellipsis if text is cut.
function wrap(text, maxChars, maxLines) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    if (!line) line = w;
    else if ((line + ' ' + w).length <= maxChars) line += ' ' + w;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/[\s,.;:]*$/, '') + '…';
    return kept;
  }
  return lines;
}

export function samplePoster(palette, copy) {
  const p = palette || {};
  const c = copy || {};
  const ground = p.ground || '#ffffff';
  const ink = p.ink || '#111314';
  const paper = p.paper || '#ffffff';
  const darkGround = contrast(ground, ink) < 4.5;
  const text = darkGround ? paper : ink; // type is black, or white on a dark ground
  const bar = darkGround ? paper : ink; // bars follow the type colour
  // Focal circle: the accent, unless it vanishes into the ground.
  const accent = p.accent && contrast(p.accent, ground) >= 1.4 ? p.accent : (darkGround ? paper : ink);
  // Secondary forms: the combination's other colours, else paper / ink.
  const support = (p.support || []).filter((h) => h && h !== accent && contrast(h, ground) >= 1.25);
  const triFill = support[0] || (darkGround ? paper : paper === ground ? ink : paper);
  const sqFill = support[1] || bar;

  // Grid: 400 wide, margin 24, 8 columns of 44 with 0 gutter (modules), baseline 8.
  const M = 24;
  const col = (n) => M + n * 44;

  // Headline: bold, left-aligned, 2-4 lines, size steps down with length.
  const head = String(c.headline || '').trim();
  const hSize = head.length <= 24 ? 50 : head.length <= 40 ? 42 : head.length <= 60 ? 34 : 28;
  const hChars = Math.floor(330 / (hSize * 0.52));
  const hLines = wrap(head, hChars, 4);
  const hLead = Math.round(hSize * 1.0);

  // Stack text from a fixed bottom edge so long copy grows upward. Brand sits beside the
  // subhead, under the headline rule (brand next to the headline).
  const sLines = wrap(c.subhead, 34, 3);
  const bottom = 566 - M - 6;
  const subTop = bottom - (sLines.length - 1) * 17;
  const ruleY = subTop - 25;
  const headLast = ruleY - 16;
  const headFirst = headLast - (hLines.length - 1) * hLead;

  const headline = hLines
    .map((l, i) => `<text x="${col(0)}" y="${headFirst + i * hLead}" font-size="${hSize}" font-weight="700" letter-spacing="${(-0.02 * hSize).toFixed(2)}">${esc(l)}</text>`)
    .join('');
  const sub = sLines
    .map((l, i) => `<text x="${col(0)}" y="${subTop + i * 17}" font-size="13" font-weight="400">${esc(l)}</text>`)
    .join('');

  // Construction zone: between the top bar and the headline. Forms scale to fit it.
  const top = M + 40;
  const zoneBottom = headFirst - hSize * 0.8 - 16;
  const H = zoneBottom - top;
  const r = Math.max(70, Math.min(140, H * 0.47));
  const cx = 400 - M - r * 0.5; // bleeds off the right edge
  const cy = top + H / 2;
  const sq = Math.round(r * 0.72);
  const sqX = Math.max(col(0), Math.round((cx - r - sq * 0.7) / 4) * 4); // 30% under the circle, on the 4-unit baseline
  const sqY = cy - sq * 0.75;
  const t = r * 1.3; // right-angle triangle, hypotenuse on the 45° axis
  const tx = Math.min(cx + r * 0.35, 400 - M);
  const ty = cy + r * 0.92;
  const k = Math.SQRT1_2;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 566" width="400" height="566" font-family="${FONT}">`,
    `<rect width="400" height="566" fill="${ground}"/>`,
    // square on the grid, behind the circle's left edge
    `<rect x="${sqX}" y="${sqY.toFixed(1)}" width="${sq}" height="${sq}" fill="${sqFill}"/>`,
    // focal circle in the accent, bleeding off the right edge
    `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${accent}"/>`,
    // right-angle triangle cut across the circle
    `<polygon points="${(tx - t).toFixed(1)},${ty.toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)} ${tx.toFixed(1)},${(ty - t).toFixed(1)}" fill="${triFill}"/>`,
    // the one diagonal: a heavy bar at -45° from the circle's edge out past the corner
    `<rect x="${(-r).toFixed(1)}" y="-7" width="${(r + 420).toFixed(1)}" height="14" fill="${bar}" transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(-45)"/>`,
    // masthead bar and hairline, on the grid
    `<rect x="${col(0)}" y="${M}" width="${col(3) - col(0)}" height="16" fill="${bar}"/>`,
    `<rect x="${col(3)}" y="${M + 13}" width="${col(8) - col(3)}" height="3" fill="${bar}"/>`,
    `<g fill="${text}">`,
    headline,
    `<rect x="${col(0)}" y="${ruleY}" width="${col(8) - col(0)}" height="4"/>`,
    sub,
    `<text x="${col(6)}" y="${subTop}" font-size="13" font-weight="700">${esc(String(c.brand || '').toLowerCase())}</text>`,
    `</g>`,
    `</svg>`,
  ].join('');
}
