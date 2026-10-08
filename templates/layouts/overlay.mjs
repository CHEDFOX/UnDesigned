// Text over photos and video: measure the area behind the text and pick the lightest treatment that makes it readable.
// Plain ESM, zero dependencies, Node 18+ or browser. Rules and evidence: foundations/layout/media.json.
//
// img: { width, height, data }  where data is RGBA (Uint8ClampedArray, Buffer or a plain array), as from
//      canvas getImageData() or any decoder. box: { x, y, w, h } in percent of the image, from the top left.
//
// analyseRegion(img, box, opts?)            -> luminance percentiles, busyness, contrast helpers
// recommendTreatment(img, box, opts)        -> { text, treatment, opacity, fill, achievedContrast, reason, ... }
// findCalmRegion(img, candidates, opts?)    -> candidates sorted best first, each with its analysis and score
// analyseFrames(frames, box, opts?)         -> worst case across video frames (same shape as analyseRegion)
// gridCandidates(cols, rows, w, h, inset?)  -> candidate boxes for findCalmRegion
// contrastRatio(a, b), relativeLuminance(hex), hexToRgb(hex)
//
// Contrast follows WCAG 2.x (relative luminance, (L1 + 0.05) / (L2 + 0.05)). It is measured against the
// worst-case pixels behind the text (default 10th or 90th percentile), never the mean. Overlays are blended
// the way browsers and SVG composite them: per channel, in gamma-encoded sRGB.

const DEFAULTS = {
  percentile: 10,      // worst-case cut: p10 for dark text, p90 for light text (rule of thumb)
  sampleMax: 40000,    // pixels sampled per box (stride sampling keeps big images fast)
  gridLong: 64,        // busyness is measured on a block-averaged grid this many cells on the long side
  calmMax: 0.2,        // busyness at or below this counts as calm (rule of thumb, see media.json)
  textureMax: 0.35,    // above calmMax and up to this, texture is tolerated only at high contrast
  highContrast: 7,     // Scharff, Hill & Ahumada (2000): texture matters little when text contrast is high
  scrimMax: 0.85,      // above this a scrim is a band in disguise: use solid-band
  tintMax: 0.6,        // above this the whole photo goes muddy
};

// Least intrusive first. Each step hides more of the photo or adds more style.
export const TREATMENT_ORDER = ['calm-region', 'blur', 'scrim-gradient', 'tint', 'halftone-fade', 'plate', 'solid-band', 'duotone', 'text-shadow'];

export function hexToRgb(hex) {
  let h = String(hex).trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Not a hex colour: ${hex}`);
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
}

const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const LIN = Array.from({ length: 256 }, (_, i) => lin(i));
const lumRgb = (r, g, b) => 0.2126 * LIN[r] + 0.7152 * LIN[g] + 0.0722 * LIN[b];
const lumFloat = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

export function relativeLuminance(colour) {
  const [r, g, b] = Array.isArray(colour) ? colour : hexToRgb(colour);
  return lumFloat(r, g, b);
}

const ratio = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

export function contrastRatio(a, b) {
  const la = typeof a === 'number' ? a : relativeLuminance(a);
  const lb = typeof b === 'number' ? b : relativeLuminance(b);
  return ratio(la, lb);
}

function pixelBox(img, box) {
  const x0 = Math.max(0, Math.floor((box.x / 100) * img.width));
  const y0 = Math.max(0, Math.floor((box.y / 100) * img.height));
  const x1 = Math.min(img.width, Math.max(x0 + 1, Math.ceil(((box.x + box.w) / 100) * img.width)));
  const y1 = Math.min(img.height, Math.max(y0 + 1, Math.ceil(((box.y + box.h) / 100) * img.height)));
  return { x0, y0, x1, y1 };
}

// Sampled RGB triples from the box.
function samplePixels(img, box, sampleMax) {
  const { x0, y0, x1, y1 } = pixelBox(img, box);
  const n = (x1 - x0) * (y1 - y0);
  const stride = Math.max(1, Math.floor(Math.sqrt(n / sampleMax)));
  const px = [];
  for (let y = y0; y < y1; y += stride) {
    for (let x = x0; x < x1; x += stride) {
      const i = (y * img.width + x) * 4;
      px.push([img.data[i], img.data[i + 1], img.data[i + 2]]);
    }
  }
  return px;
}

function percentileOf(sorted, p) {
  if (!sorted.length) return 0;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))));
  return sorted[i];
}

// Busyness 0-1: block-average the box to a coarse grid (so it does not depend on resolution). Coarse clutter is
// mean gradient of encoded luma plus edge density (share of cells whose gradient passes a threshold); fine texture
// is the mean standard deviation inside each cell. Busyness is the larger of the two.
// Edge density is one of the clutter measures in Rosenholtz, Li & Nakano (2007); this is a cheap proxy, not their model.
function busynessOf(img, box, gridLong) {
  const { x0, y0, x1, y1 } = pixelBox(img, box);
  const bw = x1 - x0, bh = y1 - y0;
  const scale = Math.max(bw, bh) / gridLong;
  const gw = Math.max(2, Math.round(bw / Math.max(1, scale)));
  const gh = Math.max(2, Math.round(bh / Math.max(1, scale)));
  const grid = new Float64Array(gw * gh);
  let fineSum = 0; // mean within-cell standard deviation: texture finer than the grid (grain, foliage, small print)
  for (let gy = 0; gy < gh; gy++) {
    const ya = y0 + Math.floor((gy * bh) / gh), yb = Math.max(ya + 1, y0 + Math.floor(((gy + 1) * bh) / gh));
    for (let gx = 0; gx < gw; gx++) {
      const xa = x0 + Math.floor((gx * bw) / gw), xb = Math.max(xa + 1, x0 + Math.floor(((gx + 1) * bw) / gw));
      let s = 0, s2 = 0, c = 0;
      const step = Math.max(1, Math.floor(Math.sqrt(((xb - xa) * (yb - ya)) / 16)));
      for (let y = ya; y < yb; y += step) for (let x = xa; x < xb; x += step) {
        const i = (y * img.width + x) * 4;
        const v = (0.2126 * img.data[i] + 0.7152 * img.data[i + 1] + 0.0722 * img.data[i + 2]) / 255;
        s += v; s2 += v * v; c++;
      }
      grid[gy * gw + gx] = s / c;
      fineSum += Math.sqrt(Math.max(0, s2 / c - (s / c) ** 2));
    }
  }
  let sum = 0, edges = 0, cnt = 0;
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    const v = grid[y * gw + x];
    const dx = x + 1 < gw ? Math.abs(grid[y * gw + x + 1] - v) : 0;
    const dy = y + 1 < gh ? Math.abs(grid[(y + 1) * gw + x] - v) : 0;
    const g = Math.hypot(dx, dy);
    sum += g; if (g > 0.08) edges++; cnt++;
  }
  const meanGrad = sum / cnt;
  const edgeDensity = edges / cnt;
  const fineTexture = fineSum / (gw * gh);
  const coarse = 0.5 * edgeDensity + 0.5 * Math.min(1, meanGrad / 0.2);
  const fine = Math.min(1, fineTexture / 0.15);
  return { busyness: Math.min(1, Math.max(coarse, fine)), edgeDensity, meanGradient: meanGrad, fineTexture };
}

export function analyseRegion(img, box, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const px = samplePixels(img, box, o.sampleMax);
  const lums = px.map(([r, g, b]) => lumRgb(r, g, b)).sort((a, b) => a - b);
  const mean = lums.reduce((s, v) => s + v, 0) / (lums.length || 1);
  const pLow = percentileOf(lums, o.percentile), pHigh = percentileOf(lums, 100 - o.percentile);
  const busy = busynessOf(img, box, o.gridLong);
  return {
    meanLuminance: mean,
    p10Luminance: pLow,                 // named p10/p90 for the default; follows opts.percentile
    p90Luminance: pHigh,
    minLuminance: lums[0] ?? 0,
    maxLuminance: lums[lums.length - 1] ?? 0,
    busyness: busy.busyness,
    edgeDensity: busy.edgeDensity,
    meanGradient: busy.meanGradient,
    fineTexture: busy.fineTexture,
    samples: lums.length,
    // Worst case for a colour: against whichever percentile is closer to it in luminance.
    contrastWithInk: hex => worstContrast(relativeLuminance(hex), pLow, pHigh),
    contrastWithPaper: hex => worstContrast(relativeLuminance(hex), pLow, pHigh),
    contrastWith: hex => worstContrast(relativeLuminance(hex), pLow, pHigh),
  };
}

// Internal: analysis plus the sampled pixels (kept off the public result so it stays small to log or serialise).
function analyseWithPixels(img, box, o) {
  return { a: analyseRegion(img, box, o), px: samplePixels(img, box, o.sampleMax) };
}

function worstContrast(lText, pLow, pHigh) {
  return Math.min(ratio(lText, pLow), ratio(lText, pHigh));
}

// Worst-case contrast of text over the pixels after blending `overlay` at `alpha` (sRGB, per channel).
function blendedWorst(px, textLum, overlayRgb, alpha, percentile) {
  const ls = new Float64Array(px.length);
  for (let i = 0; i < px.length; i++) {
    const [r, g, b] = px[i];
    ls[i] = lumFloat(
      overlayRgb[0] * alpha + r * (1 - alpha),
      overlayRgb[1] * alpha + g * (1 - alpha),
      overlayRgb[2] * alpha + b * (1 - alpha));
  }
  ls.sort();
  return worstContrast(textLum, percentileOf(ls, percentile), percentileOf(ls, 100 - percentile));
}

// Smallest alpha in [0, max] at which the blended worst case reaches target; null if it never does.
// Contrast rises monotonically with alpha when the overlay itself passes against the text, so bisection is exact.
function solveAlpha(px, textLum, overlayRgb, target, max, percentile) {
  if (blendedWorst(px, textLum, overlayRgb, max, percentile) < target) return null;
  if (blendedWorst(px, textLum, overlayRgb, 0, percentile) >= target) return 0;
  let lo = 0, hi = max;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (blendedWorst(px, textLum, overlayRgb, mid, percentile) >= target) hi = mid; else lo = mid;
  }
  return Math.ceil(hi * 100) / 100;
}

// Blur estimate: a blur large enough to dissolve texture pulls each pixel toward the local mean.
// We model it as a 60% pull toward the box mean colour. It is an estimate, flagged as such.
function blurredWorst(px, textLum, percentile) {
  const m = [0, 1, 2].map(k => px.reduce((s, p) => s + p[k], 0) / (px.length || 1));
  return blendedWorst(px, textLum, m, 0.6, percentile);
}

export function recommendTreatment(img, box, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const ink = o.ink || '#000000', paper = o.paper || '#ffffff';
  const minContrast = o.minContrast ?? 4.5;
  const allowed = new Set(o.allowed || TREATMENT_ORDER);
  const fills = o.fills || [paper, ink];           // palette colours a band or plate may use
  const { a, px: all } = analyseWithPixels(img, box, o);
  const thin = Math.max(1, Math.floor(all.length / 12000)); // blending is solved on at most ~12k pixels
  const px = thin > 1 ? all.filter((_, i) => i % thin === 0) : all;
  const texts = [{ role: 'ink', hex: ink }, { role: 'paper', hex: paper }];
  const base = texts.map(t => ({ ...t, lum: relativeLuminance(t.hex), contrast: a.contrastWith(t.hex) }))
    .sort((p, q) => q.contrast - p.contrast);
  const best = base[0];
  const out = (fields) => ({ busyness: round(a.busyness), worstCaseNoTreatment: round(best.contrast), ...fields });

  // 1. No treatment: calm and readable as it is.
  if (allowed.has('calm-region')) {
    if (best.contrast >= minContrast && a.busyness <= o.calmMax) {
      return out({ text: best.role, treatment: 'calm-region', opacity: 0, fill: null, achievedContrast: round(best.contrast),
        reason: `Worst-case contrast ${fmt(best.contrast)}:1 already passes ${minContrast}:1 and the area is calm (busyness ${fmt(a.busyness)}).` });
    }
    if (best.contrast >= Math.max(minContrast, o.highContrast) && a.busyness <= o.textureMax) {
      return out({ text: best.role, treatment: 'calm-region', opacity: 0, fill: null, achievedContrast: round(best.contrast),
        reason: `Some texture (busyness ${fmt(a.busyness)}), but worst-case contrast is ${fmt(best.contrast)}:1; texture costs little at high contrast (Scharff, Hill & Ahumada, 2000).` });
    }
  }

  const tried = [];
  for (const id of TREATMENT_ORDER) {
    if (id === 'calm-region' || !allowed.has(id)) continue;

    if (id === 'blur') {
      // Blur removes texture, not tone. Only worth it when tone already passes but the area is busy.
      for (const t of base) {
        const c = blurredWorst(px, t.lum, o.percentile);
        if (c >= minContrast) {
          return out({ text: t.role, treatment: 'blur', opacity: 0, fill: null, achievedContrast: round(c), estimated: true,
            reason: `Tone is close enough but the area is busy (busyness ${fmt(a.busyness)}). Blurring the text zone (1-3% of the short side) should reach about ${fmt(c)}:1; this is an estimate, so measure the blurred file.` });
        }
      }
      tried.push('blur: tone too close even after blur');
      continue;
    }

    if (id === 'scrim-gradient' || id === 'tint') {
      const max = id === 'scrim-gradient' ? o.scrimMax : o.tintMax;
      let pick = null;
      for (const t of texts) {
        const overlay = t.role === 'paper' ? ink : paper; // darken under light text, lighten under dark text
        const alpha = solveAlpha(px, relativeLuminance(t.hex), hexToRgb(overlay), minContrast, max, o.percentile);
        if (alpha != null && (!pick || alpha < pick.alpha)) pick = { t, overlay, alpha };
      }
      if (pick) {
        const c = blendedWorst(px, relativeLuminance(pick.t.hex), hexToRgb(pick.overlay), pick.alpha, o.percentile);
        const where = id === 'scrim-gradient' ? 'at the text end of the gradient, fading to 0 over at least 1.5 times the text block' : 'over the whole image';
        return out({ text: pick.t.role, treatment: id, opacity: pick.alpha, fill: pick.overlay, achievedContrast: round(c),
          reason: `${pick.t.role === 'paper' ? 'Darken' : 'Lighten'} with ${pick.overlay} at ${Math.round(pick.alpha * 100)}% ${where}: the least opacity that lifts the worst case to ${minContrast}:1.` });
      }
      tried.push(`${id}: would need more than ${Math.round(max * 100)}% opacity`);
      continue;
    }

    if (id === 'halftone-fade' || id === 'plate' || id === 'solid-band') {
      // Opaque: the text sits on a flat palette colour, so contrast is text vs fill.
      let pick = null;
      for (const f of fills) for (const t of texts) {
        const c = contrastRatio(t.hex, f);
        if (c >= minContrast && (!pick || c > pick.c)) pick = { t, f, c };
      }
      if (pick) {
        const why = { 'halftone-fade': 'Text on a solid zone of the ground colour whose edge dissolves into the photo through dots.',
          plate: 'A plate behind the text only; the rest of the photo stays untouched.',
          'solid-band': 'A solid band holds the words; the photo keeps the rest of the frame.' }[id];
        return out({ text: pick.t.role, treatment: id, opacity: 1, fill: pick.f, achievedContrast: round(pick.c), reason: `${why} ${pick.t.hex} on ${pick.f} is ${fmt(pick.c)}:1.` });
      }
      tried.push(`${id}: no allowed fill passes with ink or paper`);
      continue;
    }

    if (id === 'duotone') {
      if (o.duotone && o.duotone.dark && o.duotone.light) {
        const d = hexToRgb(o.duotone.dark), l = hexToRgb(o.duotone.light);
        const mapped = px.map(([r, g, b]) => { const y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; return [0, 1, 2].map(k => d[k] + (l[k] - d[k]) * y); });
        for (const t of base) {
          const c = blendedWorst(mapped, t.lum, [0, 0, 0], 0, o.percentile);
          if (c >= minContrast) return out({ text: t.role, treatment: 'duotone', opacity: 0, fill: null, achievedContrast: round(c),
            reason: `Mapping the photo to ${o.duotone.dark} and ${o.duotone.light} compresses its tones enough for ${t.role} text at ${fmt(c)}:1.` });
        }
        tried.push('duotone: the mapped tones still clash with the text');
      } else tried.push('duotone: pass opts.duotone { dark, light } to evaluate it');
      continue;
    }

    if (id === 'text-shadow') {
      // Last resort. WCAG has no method that credits a shadow; we report the contrast of text against its own shadow colour.
      const t = best, sh = t.role === 'paper' ? ink : paper;
      const c = contrastRatio(t.hex, sh);
      return out({ text: t.role, treatment: 'text-shadow', opacity: 1, fill: sh, achievedContrast: round(best.contrast), shadowContrast: round(c), lastResort: true,
        reason: `Nothing else allowed reaches ${minContrast}:1. A hard, unblurred shadow in ${sh} helps letter edges, but the measured worst case stays ${fmt(best.contrast)}:1. Move the text or change the image instead.` });
    }
  }

  return out({ text: best.role, treatment: null, opacity: null, fill: null, achievedContrast: round(best.contrast),
    reason: `No allowed treatment reaches ${minContrast}:1${tried.length ? ` (${tried.join('; ')})` : ' and the area is not calm enough to leave untreated'}. Move the text to a calmer area, choose another image or allow a band.` });
}

export function findCalmRegion(img, candidates, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const ink = o.ink || '#000000', paper = o.paper || '#ffffff';
  const minContrast = o.minContrast ?? 4.5;
  const avoid = o.avoid || []; // boxes to keep text off, e.g. faces and the product (percent boxes)
  return candidates.map(box => {
    const a = analyseRegion(img, box, o);
    const ci = a.contrastWith(ink), cp = a.contrastWith(paper);
    const contrast = Math.max(ci, cp);
    const overlap = avoid.reduce((m, z) => Math.max(m, overlapShare(box, z)), 0);
    // Lower is better: busyness, plus a penalty for each unit of contrast short of target, plus overlap with faces.
    const deficit = Math.max(0, minContrast - contrast) / minContrast;
    const score = round(a.busyness + deficit + overlap * 2);
    return { box, score, busyness: round(a.busyness), contrast: round(contrast), text: ci >= cp ? 'ink' : 'paper',
      passes: contrast >= minContrast && a.busyness <= o.calmMax && overlap === 0, overlapsAvoid: overlap > 0 };
  }).sort((p, q) => p.score - q.score);
}

// Video: the text must pass on every frame it is shown over. Returns the worst frame's numbers.
export function analyseFrames(frames, box, opts = {}) {
  const rs = frames.map(f => analyseRegion(f, box, opts));
  const pLow = Math.min(...rs.map(r => r.p10Luminance)), pHigh = Math.max(...rs.map(r => r.p90Luminance));
  return {
    frames: rs.length,
    meanLuminance: rs.reduce((s, r) => s + r.meanLuminance, 0) / rs.length,
    p10Luminance: pLow, p90Luminance: pHigh,
    busyness: Math.max(...rs.map(r => r.busyness)),
    contrastWithInk: hex => worstContrast(relativeLuminance(hex), pLow, pHigh),
    contrastWithPaper: hex => worstContrast(relativeLuminance(hex), pLow, pHigh),
    contrastWith: hex => worstContrast(relativeLuminance(hex), pLow, pHigh),
  };
}

export function gridCandidates(cols, rows, w, h, inset = 0) {
  const out = [];
  const cw = (100 - 2 * inset) / cols, ch = (100 - 2 * inset) / rows;
  for (let r = 0; r + h <= rows; r++) for (let c = 0; c + w <= cols; c++) {
    out.push({ x: round(inset + c * cw), y: round(inset + r * ch), w: round(w * cw), h: round(h * ch) });
  }
  return out;
}

function overlapShare(a, b) {
  const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return (ix * iy) / (a.w * a.h || 1);
}

const round = n => Math.round(n * 1000) / 1000;
const fmt = n => (Math.round(n * 100) / 100).toString();

export default { analyseRegion, recommendTreatment, findCalmRegion, analyseFrames, gridCandidates, contrastRatio, relativeLuminance, hexToRgb, TREATMENT_ORDER };
