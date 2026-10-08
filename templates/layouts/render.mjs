// Tiny, zero-dependency layout renderer.
// renderLayout(layout, options) -> SVG string. Plain ESM, Node 18+ or browser.
//
// layout:  one entry from templates/layouts/layouts.json
// options: {
//   palette: { ground, ink, accent, paper },   // hex values from the product's Wada combination
//   copy:    { headline, subhead, body, cta, brand, note },
//   fonts:   { display, body },                 // CSS font-family names from the product's pairing
//   art?:    svgString,                         // optional; placed in every art/image slot
//   width?:  number,                            // viewBox width, default 1000
//   mirror?: boolean,                           // flip horizontally for right-to-left scripts
//   guides?: boolean                            // draw live area and slot outlines (for checking)
// }
//
// Text is wrapped greedily with an estimated glyph width, then shrunk until it fits its box.
// The estimate is deliberately generous so real fonts rarely overflow; check the final piece by eye.

const CHAR_W = { display: 0.56, body: 0.54 }; // average advance as a share of font size (rule of thumb)
const LEADING = { headline: 1.05, subhead: 1.25, body: 1.45, note: 1.35, brand: 1.1, cta: 1.1 };
const MAX_LINES = { headline: 4, subhead: 3, brand: 1, cta: 1, note: 3 };

export function escapeXml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
}

function wrap(text, size, maxW, charW) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length * size * charW <= maxW || !line) line = next;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

// Find the largest size (up to maxSize) at which text fits a w x h box.
export function fitText(text, w, h, { role = 'body', family = 'body', maxSize, minSize = 4 } = {}) {
  const charW = CHAR_W[family] ?? 0.55;
  const lead = LEADING[role] ?? 1.3;
  const maxLines = MAX_LINES[role] ?? Infinity;
  let size = Math.min(maxSize ?? h, h);
  for (; size >= minSize; size *= 0.95) {
    const lines = wrap(text, size, w, charW);
    const widest = Math.max(0, ...lines.map(l => l.length * size * charW));
    const height = size + (lines.length - 1) * size * lead;
    if (lines.length <= maxLines && widest <= w && height <= h) {
      return { size, lines, lead, width: widest, height, fits: true };
    }
  }
  const lines = wrap(text, minSize, w, charW);
  return { size: minSize, lines, lead, width: Math.max(0, ...lines.map(l => l.length * minSize * charW)), height: minSize * (1 + (lines.length - 1) * lead), fits: false };
}

// Deterministic soft blob for the placeholder art (organic, rounded, no sharp corners).
function blob(cx, cy, r) {
  const n = 8, wob = [1, 0.9, 1.06, 0.94, 1.03, 0.88, 1.08, 0.95];
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * r * wob[i], cy + Math.sin(a) * r * wob[i]];
  });
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let d = `M${mid(pts[n - 1], pts[0]).map(v => v.toFixed(1)).join(' ')}`;
  for (let i = 0; i < n; i++) {
    const m = mid(pts[i], pts[(i + 1) % n]);
    d += ` Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return d + 'Z';
}

function placeArt(svg, x, y, w, h) {
  const open = svg.match(/<svg\b[^>]*>/i);
  if (!open) return `<g transform="translate(${x} ${y})">${svg}</g>`;
  const tag = open[0]
    .replace(/\s(x|y|width|height|preserveAspectRatio)="[^"]*"/gi, '')
    .replace(/^<svg/i, `<svg x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"`);
  return svg.replace(open[0], tag);
}

const COPY_KEY = { headline: 'headline', subhead: 'subhead', body: 'body', cta: 'cta', brand: 'brand', note: 'note' };

export function textForSlot(slot, copy = {}) {
  if (slot.continues) return ''; // second column of a split body: filled by the first column's overflow
  return copy[slot.name] ?? copy[COPY_KEY[slot.role]] ?? '';
}

export function slotPixels(slot, W, H, mirror = false) {
  let { x, y, w, h } = slot.box;
  if (mirror) x = 100 - x - w;
  const r2 = n => Math.round(n * 100) / 100;
  return { x: r2((x / 100) * W), y: r2((y / 100) * H), w: r2((w / 100) * W), h: r2((h / 100) * H) };
}

export function renderLayout(layout, options = {}) {
  const { palette = {}, copy = {}, fonts = {}, art, width = 1000, mirror = false, guides = false } = options;
  const pal = { ground: '#f2ece0', ink: '#1a1a1a', accent: '#c8553d', paper: '#ffffff', ...palette };
  const display = fonts.display || 'sans-serif';
  const bodyFont = fonts.body || 'sans-serif';
  const [aw, ah] = layout.aspect;
  const W = width, H = Math.round((width * ah) / aw * 100) / 100;
  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escapeXml(copy.headline || layout.name)}">`);
  out.push(`<rect width="${W}" height="${H}" fill="${pal.ground}"/>`);

  for (const p of layout.panels || []) {
    const b = slotPixels({ box: p.box }, W, H, mirror);
    out.push(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${pal[p.fill] || pal.ground}"/>`);
  }

  // Body overflow carries into a slot that "continues" it.
  const carry = {};

  for (const slot of layout.slots) {
    const b = slotPixels(slot, W, H, mirror);
    let align = slot.align || 'left';
    if (mirror && align !== 'center') align = align === 'left' ? 'right' : 'left';
    const anchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start';
    const tx = align === 'center' ? b.x + b.w / 2 : align === 'right' ? b.x + b.w : b.x;

    if (slot.role === 'art' || slot.role === 'image') {
      if (art) { out.push(placeArt(art, b.x, b.y, b.w, b.h)); continue; }
      if (slot.role === 'image') {
        out.push(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${pal.paper}"/>`);
        out.push(`<path d="M${b.x} ${b.y + b.h} L${b.x + b.w * 0.35} ${b.y + b.h * 0.55} L${b.x + b.w * 0.55} ${b.y + b.h * 0.75} L${b.x + b.w * 0.75} ${b.y + b.h * 0.45} L${b.x + b.w} ${b.y + b.h}Z" fill="${pal.accent}" opacity="0.85"/>`);
      } else {
        const r = Math.min(b.w, b.h) * 0.42;
        out.push(`<path d="${blob(b.x + b.w / 2, b.y + b.h / 2, r)}" fill="${pal.accent}" stroke="${pal.ink}" stroke-width="${Math.max(1.5, r * 0.03).toFixed(1)}" stroke-linejoin="round"/>`);
      }
      continue;
    }

    const text = slot.continues ? (carry[slot.continues]?.text || '') : textForSlot(slot, copy);
    if (!text) continue;
    const family = slot.role === 'headline' ? 'display' : 'body';
    const fontFamily = family === 'display' ? display : bodyFont;
    const weight = ['headline', 'brand', 'cta'].includes(slot.role) ? 700 : 400;
    const cap = { subhead: 0.06, body: 0.03, note: 0.025, brand: 0.035, cta: 0.04 }[slot.role];
    const maxSize = cap ? Math.max(cap * Math.min(W, H) * 1.6, 8) : undefined;

    let fit;
    if (slot.role === 'cta') {
      // Button: text fits 80% of the slot width and a height that leaves room for the pill.
      fit = fitText(text, b.w * 0.8, b.h / 1.9, { role: 'cta', family, maxSize });
      const bw = Math.min(b.w, fit.width + b.w * 0.2), bh = fit.size * 1.9;
      const bx = align === 'right' ? b.x + b.w - bw : align === 'center' ? b.x + (b.w - bw) / 2 : b.x;
      const by = b.y + (b.h - bh) / 2;
      out.push(`<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="${(bh / 2).toFixed(1)}" fill="none" stroke="${pal.ink}" stroke-width="${Math.max(1, fit.size * 0.08).toFixed(1)}"/>`);
      out.push(`<text x="${(bx + bw / 2).toFixed(1)}" y="${(by + bh / 2 + fit.size * 0.35).toFixed(1)}" font-family="${escapeXml(fontFamily)}" font-size="${fit.size.toFixed(1)}" font-weight="700" fill="${pal.ink}" text-anchor="middle">${escapeXml(fit.lines.join(' '))}</text>`);
      continue;
    }
    if (slot.continues) {
      // Second column: same size as the first, holds what did not fit there.
      const c = carry[slot.continues];
      const all = wrap(text, c.size, b.w, CHAR_W.body);
      const perCol = Math.max(1, Math.floor((b.h - c.size) / (c.size * c.lead)) + 1);
      fit = { size: c.size, lead: c.lead, lines: all.slice(0, perCol) };
    } else if (slot.role === 'body' && layout.slots.some(s => s.continues === slot.name)) {
      // First of two columns: size chosen so about half the words fill one column.
      const words = text.split(/\s+/);
      const half = fitText(words.slice(0, Math.ceil(words.length / 2)).join(' '), b.w, b.h, { role: 'body', family, maxSize });
      const all = wrap(text, half.size, b.w, CHAR_W.body);
      const perCol = Math.max(1, Math.floor((b.h - half.size) / (half.size * half.lead)) + 1);
      fit = { size: half.size, lead: half.lead, lines: all.slice(0, perCol) };
      carry[slot.name] = { text: all.slice(perCol).join(' '), size: half.size, lead: half.lead };
    } else {
      fit = fitText(text, b.w, b.h, { role: slot.role, family, maxSize });
    }

    const lineH = fit.size * fit.lead;
    const ty0 = b.y + fit.size * 0.8; // first baseline (cap height approx.)
    const tspans = fit.lines.map((l, i) => `<tspan x="${tx.toFixed(1)}" y="${(ty0 + i * lineH).toFixed(1)}">${escapeXml(l)}</tspan>`).join('');
    out.push(`<text font-family="${escapeXml(fontFamily)}" font-size="${fit.size.toFixed(1)}" font-weight="${weight}" fill="${pal.ink}" text-anchor="${anchor}">${tspans}</text>`);
  }

  if (guides) {
    const la = layout.grid.liveArea;
    const g = slotPixels({ box: la }, W, H, mirror);
    out.push(`<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" fill="none" stroke="#e0218a" stroke-dasharray="6 4"/>`);
    for (const s of layout.slots) {
      const b = slotPixels(s, W, H, mirror);
      out.push(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="none" stroke="#0aa" stroke-width="1"/>`);
    }
  }

  out.push('</svg>');
  return out.join('\n');
}

export default renderLayout;
