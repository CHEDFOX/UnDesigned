// Tiny, zero-dependency layout renderer.
// renderLayout(layout, options) -> SVG string. Plain ESM, Node 18+ or browser.
//
// layout:  one entry from templates/layouts/layouts.json
// options: {
//   palette: { ground, ink, accent, paper },   // hex values from the product's Wada combination
//   copy:    { headline, subhead, body, cta, brand, note },
//   fonts:   { display, body },                 // CSS font-family names from the product's pairing
//   art?:    svgString,                         // optional; placed in every art/image slot
//   media?:  svgString | href,                  // optional background photo (or a video's poster frame), full-bleed under everything
//   textColour?: hex,                           // optional override for all text (default: palette role from layout.media.text, else ink)
//   width?:  number,                            // viewBox width, default 1000
//   mirror?: boolean,                           // flip horizontally for right-to-left scripts
//   guides?: boolean                            // draw live area and slot outlines (for checking)
// }
//
// Text is wrapped greedily with an estimated glyph width, then shrunk until it fits its box.
// The estimate is deliberately generous so real fonts rarely overflow; check the final piece by eye.
//
// Media layouts (layout.media, see foundations/layout/media.json): the photo fills the frame, then the layout's
// treatment is drawn from palette colours only (solid-band, plate, scrim-gradient, tint, halftone-fade, blur,
// duotone, text-shadow; calm-region draws nothing). Without options.media a placeholder photo is drawn.

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

let uid = 0; // ids for gradients and filters, unique per call so several SVGs can share one page

function placeMedia(media, W, H, id) {
  const m = String(media).trim();
  if (m.startsWith('<svg') || m.startsWith('<?xml')) {
    const open = m.match(/<svg\b[^>]*>/i);
    const tag = open[0]
      .replace(/\s(x|y|width|height|preserveAspectRatio)="[^"]*"/gi, '')
      .replace(/^<svg/i, `<svg x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"`);
    return m.replace(/^<\?xml[^>]*>\s*/, '').replace(open[0], tag);
  }
  return `<image href="${escapeXml(m)}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`;
}

// Placeholder photo in palette colours: a sky, low hills and one person whose gaze points at the text
// (media.subject, media.gaze: left, right, up, down, up-left, up-right, down-left, down-right).
// Calm-region layouts get a light, empty sky behind the words; treated layouts get a strong accent sky so the
// band, plate or scrim reads. It says "a photo goes here" without implying a real image.
function placeholderPhoto(layout, pal, W, H, mirror, textRole) {
  const m = layout.media || {};
  const calm = !m.treatment || m.treatment === 'calm-region' || m.treatment === 'blur';
  const lightSky = calm && textRole !== 'paper';
  const sky = lightSky ? pal.ground : pal.accent;
  const o = [`<rect width="${W}" height="${H}" fill="${sky}"/>`];
  const hy = H * (calm ? 0.84 : 0.8);
  if (lightSky) o.push(`<path d="M0 ${hy} C${W * 0.33} ${hy} ${W * 0.66} ${hy - H * 0.06} ${W} ${hy - H * 0.04} L${W} ${H} L0 ${H}Z" fill="${pal.accent}"/>`);
  o.push(`<path d="M0 ${H * 0.92} C${W * 0.3} ${H * 0.9} ${W * 0.7} ${H * 0.95} ${W} ${H * 0.89} L${W} ${H} L0 ${H}Z" fill="${pal.ink}"/>`);
  const sb = slotPixels({ box: m.subject || { x: 55, y: 30, w: 35, h: 60 } }, W, H, mirror);
  let gaze = m.gaze || 'left';
  if (mirror) gaze = gaze.replace(/left|right/, g => (g === 'left' ? 'right' : 'left'));
  const dx = /left/.test(gaze) ? -1 : /right/.test(gaze) ? 1 : 0;
  const dy = /up/.test(gaze) ? -1 : /down/.test(gaze) ? 1 : 0;
  const r = Math.min(sb.w * 0.3, sb.h * 0.2), cx = sb.x + sb.w / 2, cy = sb.y + r * 1.05;
  const sw = Math.max(1.5, r * 0.06).toFixed(1);
  const bodyFill = lightSky ? pal.ink : pal.ground === sky ? pal.ink : pal.ground;
  const top = cy + r * 0.9, bottom = sb.y + sb.h, half = r * 1.5;
  // body: rounded shoulders straight under the head, running to the bottom of the subject box
  o.push(`<path d="M${(cx - half).toFixed(1)} ${bottom.toFixed(1)} L${(cx - half).toFixed(1)} ${(top + r * 0.9).toFixed(1)} Q${(cx - half).toFixed(1)} ${top.toFixed(1)} ${cx.toFixed(1)} ${top.toFixed(1)} Q${(cx + half).toFixed(1)} ${top.toFixed(1)} ${(cx + half).toFixed(1)} ${(top + r * 0.9).toFixed(1)} L${(cx + half).toFixed(1)} ${bottom.toFixed(1)}Z" fill="${bodyFill}"/>`);
  // head; nose and eye turned towards the gaze
  o.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${pal.paper}" stroke="${pal.ink}" stroke-width="${sw}"/>`);
  const er = (r * 0.09).toFixed(1), ey = cy - r * 0.15 + dy * r * 0.18;
  if (dx) {
    o.push(`<path d="M${(cx + dx * r * 0.92).toFixed(1)} ${(cy - r * 0.15 + dy * r * 0.1).toFixed(1)} Q${(cx + dx * r * 1.25).toFixed(1)} ${(cy + r * 0.12 + dy * r * 0.1).toFixed(1)} ${(cx + dx * r * 0.9).toFixed(1)} ${(cy + r * 0.25 + dy * r * 0.1).toFixed(1)}" fill="${pal.paper}" stroke="${pal.ink}" stroke-width="${sw}" stroke-linecap="round"/>`);
    o.push(`<circle cx="${(cx + dx * r * 0.5).toFixed(1)}" cy="${ey.toFixed(1)}" r="${er}" fill="${pal.ink}"/>`);
  } else {
    o.push(`<circle cx="${(cx - r * 0.35).toFixed(1)}" cy="${ey.toFixed(1)}" r="${er}" fill="${pal.ink}"/><circle cx="${(cx + r * 0.35).toFixed(1)}" cy="${ey.toFixed(1)}" r="${er}" fill="${pal.ink}"/>`);
  }
  return o.join('\n');
}

// Gradient vector for a scrim whose opaque end sits at `from` (bottom, top, left, right).
function scrimVector(from, mirror) {
  if (mirror && (from === 'left' || from === 'right')) from = from === 'left' ? 'right' : 'left';
  return { bottom: [0, 1, 0, 0], top: [0, 0, 0, 1], left: [0, 0, 1, 0], right: [1, 0, 0, 0] }[from] || [0, 1, 0, 0];
}

// Draws the layout's treatment. Returns { defs, under, over, shadow } fragments.
function drawTreatment(layout, pal, W, H, mirror, mediaMarkup) {
  const m = layout.media;
  const res = { defs: [], under: [], shadow: null, mediaFilter: null };
  if (!m || !m.treatment) return res;
  const ov = m.overlay || {};
  const colour = pal[ov.colour] || ov.colour || pal.ground;
  const b = slotPixels({ box: ov.box || m.textZone || { x: 0, y: 0, w: 100, h: 100 } }, W, H, mirror);
  const short = Math.min(W, H);
  const id = `ul${++uid}`;
  switch (m.treatment) {
    case 'solid-band':
      res.under.push(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${colour}"/>`);
      break;
    case 'plate': {
      const rx = ((ov.radiusPctShortSide ?? 2) / 100) * short;
      res.under.push(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${rx.toFixed(1)}" fill="${colour}"/>`);
      break;
    }
    case 'scrim-gradient': {
      const [x1, y1, x2, y2] = scrimVector(ov.from || 'bottom', mirror);
      const a = ov.opacity ?? 0.7, hold = ov.hold ?? 0.45;
      res.defs.push(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${colour}" stop-opacity="${a}"/><stop offset="${hold}" stop-color="${colour}" stop-opacity="${a}"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></linearGradient>`);
      res.under.push(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="url(#${id})"/>`);
      break;
    }
    case 'tint':
      res.under.push(`<rect width="${W}" height="${H}" fill="${colour}" opacity="${ov.opacity ?? 0.4}"/>`);
      break;
    case 'halftone-fade': {
      // Solid zone plus a row-by-row dot fade on the side facing the photo (opposite `from`).
      res.under.push(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${colour}"/>`);
      let from = ov.from || 'bottom';
      if (mirror && (from === 'left' || from === 'right')) from = from === 'left' ? 'right' : 'left';
      const cell = ((ov.cellPctShortSide ?? 2) / 100) * short;
      const len = ((ov.fadePctShortSide ?? 8) / 100) * short;
      const rows = Math.max(2, Math.round(len / cell));
      const vertical = from === 'bottom' || from === 'top';
      const along = vertical ? b.w : b.h;
      const dots = [];
      for (let i = 0; i < rows; i++) {
        const rad = (cell / 2) * 1.15 * (1 - (i + 0.5) / rows);
        if (rad < cell * 0.05) continue;
        const off = (i + 0.5) * cell;
        for (let j = 0, n = Math.ceil(along / cell); j < n; j++) {
          const t = (j + 0.5 + (i % 2) * 0.5) * cell;
          if (t > along) continue;
          let x, y;
          if (from === 'bottom') { x = b.x + t; y = b.y - off; }
          else if (from === 'top') { x = b.x + t; y = b.y + b.h + off; }
          else if (from === 'left') { x = b.x + b.w + off; y = b.y + t; }
          else { x = b.x - off; y = b.y + t; }
          dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(2)}"/>`);
        }
      }
      res.under.push(`<g fill="${colour}">${dots.join('')}</g>`);
      break;
    }
    case 'blur': {
      const sd = ((ov.radiusPctShortSide ?? 2) / 100) * short;
      res.defs.push(`<filter id="${id}f" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="${sd.toFixed(1)}"/></filter><clipPath id="${id}c"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}"/></clipPath>`);
      res.under.push(`<g clip-path="url(#${id}c)"><g filter="url(#${id}f)">${mediaMarkup}</g></g>`);
      break;
    }
    case 'duotone': {
      const dark = hexRgb(pal[ov.dark] || ov.dark || pal.ink), light = hexRgb(pal[ov.light] || ov.light || pal.ground);
      const t = k => `${(dark[k] / 255).toFixed(3)} ${(light[k] / 255).toFixed(3)}`;
      res.defs.push(`<filter id="${id}d" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues="${t(0)}"/><feFuncG type="table" tableValues="${t(1)}"/><feFuncB type="table" tableValues="${t(2)}"/></feComponentTransfer></filter>`);
      res.mediaFilter = `${id}d`;
      break;
    }
    case 'text-shadow':
      res.shadow = pal[ov.colour] || ov.colour || pal.ink;
      break;
    default: // calm-region: nothing added
      break;
  }
  return res;
}

function hexRgb(hex) {
  let h = String(hex).replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) || 0);
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
  const { palette = {}, copy = {}, fonts = {}, art, media, textColour, width = 1000, mirror = false, guides = false } = options;
  const pal = { ground: '#f2ece0', ink: '#1a1a1a', accent: '#c8553d', paper: '#ffffff', ...palette };
  const display = fonts.display || 'sans-serif';
  const bodyFont = fonts.body || 'sans-serif';
  const [aw, ah] = layout.aspect;
  const W = width, H = Math.round((width * ah) / aw * 100) / 100;
  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escapeXml(copy.headline || layout.name)}">`);
  out.push(`<rect width="${W}" height="${H}" fill="${pal.ground}"/>`);

  // Background media (photo, or a video's poster frame), full-bleed under everything, then the treatment.
  const textRole = layout.media?.text || 'ink';
  const textFill = textColour || pal[textRole] || pal.ink;
  let shadow = null;
  if (media || layout.media) {
    const mediaMarkup = media ? placeMedia(media, W, H, `ulm${uid + 1}`) : placeholderPhoto(layout, pal, W, H, mirror, textRole);
    const t = drawTreatment(layout, pal, W, H, mirror, mediaMarkup);
    if (t.defs.length) out.push(`<defs>${t.defs.join('')}</defs>`);
    out.push(t.mediaFilter ? `<g filter="url(#${t.mediaFilter})">${mediaMarkup}</g>` : mediaMarkup);
    out.push(...t.under);
    shadow = t.shadow;
  }

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
      out.push(`<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="${(bh / 2).toFixed(1)}" fill="none" stroke="${textFill}" stroke-width="${Math.max(1, fit.size * 0.08).toFixed(1)}"/>`);
      out.push(`<text x="${(bx + bw / 2).toFixed(1)}" y="${(by + bh / 2 + fit.size * 0.35).toFixed(1)}" font-family="${escapeXml(fontFamily)}" font-size="${fit.size.toFixed(1)}" font-weight="700" fill="${textFill}" text-anchor="middle">${escapeXml(fit.lines.join(' '))}</text>`);
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
    const tspans = (dx = 0, dy = 0) => fit.lines.map((l, i) => `<tspan x="${(tx + dx).toFixed(1)}" y="${(ty0 + i * lineH + dy).toFixed(1)}">${escapeXml(l)}</tspan>`).join('');
    if (shadow && slot.role === 'headline') {
      // Last-resort treatment: a hard, unblurred offset shadow (the Neon Surf block shadow), headline only.
      const off = fit.size * 0.05;
      out.push(`<text font-family="${escapeXml(fontFamily)}" font-size="${fit.size.toFixed(1)}" font-weight="${weight}" fill="${shadow}" text-anchor="${anchor}">${tspans(off, off)}</text>`);
    }
    out.push(`<text font-family="${escapeXml(fontFamily)}" font-size="${fit.size.toFixed(1)}" font-weight="${weight}" fill="${textFill}" text-anchor="${anchor}">${tspans()}</text>`);
  }

  if (guides) {
    const la = layout.grid.liveArea;
    const g = slotPixels({ box: la }, W, H, mirror);
    out.push(`<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" fill="none" stroke="#e0218a" stroke-dasharray="6 4"/>`);
    for (const s of layout.slots) {
      const b = slotPixels(s, W, H, mirror);
      out.push(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="none" stroke="#0aa" stroke-width="1"/>`);
    }
    if (layout.media?.textZone) {
      const z = slotPixels({ box: layout.media.textZone }, W, H, mirror);
      out.push(`<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" fill="none" stroke="#f90" stroke-dasharray="2 3"/>`);
    }
  }

  out.push('</svg>');
  return out.join('\n');
}

export default renderLayout;
