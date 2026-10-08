// Negative Space sample poster: one small object low on a wide, calm ground,
// a short headline set small at the top-left margin, the brand beside it and
// a quiet line of detail at the foot. About 85% of the artboard stays empty.
// Pure function, no imports, deterministic.

const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Balanced wrap by an estimated character count (no single-word last line); cut after maxLines.
function wrap(text, maxChars, maxLines) {
  const t = String(text || '').trim();
  const n = Math.max(1, Math.ceil(t.length / maxChars));
  if (n > 1) maxChars = Math.min(maxChars, Math.ceil(t.length / n) + 6);
  const lines = [];
  for (const w of String(text || '').split(/\s+/).filter(Boolean)) {
    const last = lines[lines.length - 1];
    if (last !== undefined && (last + ' ' + w).length <= maxChars) lines[lines.length - 1] = last + ' ' + w;
    else if (lines.length < maxLines) lines.push(w);
    else break;
  }
  return lines;
}

export function samplePoster(palette, copy = {}) {
  const W = 400, H = 566;
  const m = 40; // margin: 10% of the short side
  const ground = palette.ground, ink = palette.ink, accent = palette.accent;
  const serif = "'Instrument Serif', 'Source Serif 4', Georgia, serif";
  const sans = "'Instrument Sans', 'Source Sans 3', system-ui, sans-serif";

  // Headline: small and quiet, cap height about 2.6% of the height (sizes.byFormat.poster).
  const head = wrap(copy.headline || 'Room to breathe', 24, 3);
  const hs = 22, hl = 24;
  const headSvg = head.map((l, i) => `<text x="${m}" y="${m + 18 + i * hl}" font-family="${serif}" font-size="${hs}" letter-spacing="-0.2" fill="${ink}">${esc(l)}</text>`).join('');
  const brandY = m + 18 + (head.length - 1) * hl + 22;
  const brand = `<text x="${m}" y="${brandY}" font-family="${sans}" font-size="9.5" font-weight="600" letter-spacing="0.4" fill="${ink}">${esc(copy.brand || 'UnDesigned')}</text>`;

  // Detail line at the foot, on the same left margin: at most two short lines.
  const sub = wrap(copy.subhead || '', 58, 2);
  const subSvg = sub.map((l, i) => `<text x="${m}" y="${H - m - 6 - (sub.length - 1 - i) * 12}" font-family="${sans}" font-size="8.5" fill="${ink}">${esc(l)}</text>`).join('');

  // The one object: a small boat on a hairline horizon, in the lower right third,
  // heading left into the open ground (inward bias: it faces the larger empty side).
  const hy = 404;               // horizon: about 71% down, lower region reads as ground
  const bx = 286, by = hy - 1;  // boat waterline
  const hull = `M${bx - 23} ${by - 9} L${bx + 25} ${by - 9} Q${bx + 21} ${by - 1} ${bx + 15} ${by + 1} L${bx - 13} ${by + 1} Q${bx - 19} ${by - 2} ${bx - 23} ${by - 9} Z`;
  const mastX = bx + 3;
  const sail = `M${mastX - 2} ${by - 13} L${mastX - 2} ${by - 52} Q${mastX - 15} ${by - 33} ${mastX - 24} ${by - 13} Z`;
  const jib = `M${mastX + 2} ${by - 13} L${mastX + 2} ${by - 44} Q${mastX + 10} ${by - 28} ${mastX + 15} ${by - 13} Z`;
  const boat =
    `<path d="${sail}" fill="${accent}"/>` +
    `<path d="${jib}" fill="${ink}" opacity=".9"/>` +
    `<path d="${hull}" fill="${ink}" stroke="${ink}" stroke-width="1.2" stroke-linejoin="round"/>`;
  // Horizon: a hairline that stops short of both edges, so the ground stays one field.
  const horizon = `<path d="M${m} ${hy} L${W - m} ${hy}" stroke="${ink}" stroke-width="0.75" stroke-linecap="round" opacity=".55"/>`;
  // A faint wake trailing behind (to the right): the direction of travel, in three short dashes.
  const wake = [0, 1, 2].map((i) => `<path d="M${bx + 30 + i * 13} ${hy + 6} l${8 - i * 2} 0" stroke="${ink}" stroke-width="0.9" stroke-linecap="round" opacity="${(0.5 - i * 0.14).toFixed(2)}"/>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Negative Space sample poster">` +
    `<rect width="${W}" height="${H}" fill="${ground}"/>` +
    headSvg + brand + horizon + boat + wake + subSvg +
    `</svg>`;
}
