// Posterize engine: reduce an image to a few flat tonal levels and map each level
// to one palette colour, as in screen printing.
//
// Pure JavaScript, no imports, deterministic (no randomness). Works on a browser
// ImageData (from canvas.getContext('2d').getImageData) or on any object shaped
// like one: { data: Uint8ClampedArray|number[] (RGBA, 4 per pixel), width, height }.
// The pixels are changed in place; the function also returns a short report.
//
//   import { posterizeImageData } from './posterize.mjs';
//   const img = ctx.getImageData(0, 0, w, h);
//   posterizeImageData(img, { ink, accent, ground, paper }, { levels: 4 });
//   ctx.putImageData(img, 0, 0);
//
// How it works (rules from art.json -> posterize):
//   1. Luminance per pixel: Rec. 709 weights on the 0-255 sRGB values (a luma).
//   2. Optional smoothing (box blur of the luminance, `smooth` px) removes speckle
//      before thresholding, like a softened stencil.
//   3. Thresholds: given in `thresholds` (0-255 or 0-1), or found from luminance
//      percentiles of the visible pixels, so every photo gets a balanced split
//      (default percentiles in DEFAULT_PERCENTILES, e.g. 4 levels at 22/52/80).
//   4. Each pixel takes the colour of its level: darkest level -> first colour
//      (ink), lightest -> last colour (paper or ground).
//   5. Optional dither near each threshold: 'bayer4' / 'bayer8' (ordered dither,
//      Bayer 1973) or 'halftone' (round dots on a screen rotated by `angle`).
//      `spread` (0-1) sets how wide the dotted transition is; 0 = hard edges.
//
// palette: either an array of colours ordered dark -> light (hex '#rrggbb' or
// [r,g,b]), or the UnDesigned role object { ink, accent, ground, paper, support:[] }.
// A role object is turned into `levels` colours with roleColours() and sorted by
// luminance so tone always runs dark -> light.

export const DEFAULT_PERCENTILES = {
  2: [45],
  3: [28, 66],
  4: [22, 52, 80],
  5: [16, 36, 60, 84],
};

const LUMA = [0.2126, 0.7152, 0.0722];

export function hexToRgb(c) {
  if (Array.isArray(c)) return c.slice(0, 3).map(Number);
  let h = String(c).trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  const n = parseInt(h, 16);
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`posterize: not a colour: ${c}`);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function luma(rgb) {
  return LUMA[0] * rgb[0] + LUMA[1] * rgb[1] + LUMA[2] * rgb[2];
}

// Which roles fill which level (dark -> light). Ink is always the darkest plate,
// the accent sits in the middle tones, ground and paper take the light end.
export function roleColours(p, levels) {
  const s = p.support || [];
  const pick = {
    2: [p.ink, p.ground ?? p.paper],
    3: [p.ink, p.accent, p.ground ?? p.paper],
    4: [p.ink, p.accent, p.ground, p.paper],
    5: [p.ink, p.accent, s[0] ?? p.ground, p.ground, p.paper],
  }[levels];
  if (!pick || pick.some((c) => c == null)) {
    throw new Error(`posterize: palette lacks the roles needed for ${levels} levels`);
  }
  return pick;
}

function paletteList(palette, levels) {
  const list = Array.isArray(palette) ? palette : roleColours(palette, levels);
  const rgb = list.map(hexToRgb);
  if (rgb.length < levels) throw new Error(`posterize: need ${levels} colours, got ${rgb.length}`);
  const used = rgb.slice(0, levels);
  // Role objects are sorted by luminance; arrays are trusted as given.
  if (!Array.isArray(palette)) used.sort((a, b) => luma(a) - luma(b));
  return used;
}

function bayer(n) {
  // Recursive Bayer index matrix, normalised to thresholds in (0, 1).
  let m = [[0]];
  while (m.length < n) {
    const s = m.length;
    const next = [];
    for (let y = 0; y < s * 2; y++) {
      next.push([]);
      for (let x = 0; x < s * 2; x++) {
        const base = m[y % s][x % s] * 4;
        const q = [[0, 2], [3, 1]][y < s ? 0 : 1][x < s ? 0 : 1];
        next[y].push(base + q);
      }
    }
    m = next;
  }
  const n2 = n * n;
  return m.map((row) => row.map((v) => (v + 0.5) / n2));
}

function halftoneMap(cell, angleDeg) {
  // Round-dot screen: returns T(x, y) in (0, 1). A pixel takes the lighter
  // colour when its fraction f > T, so dark dots shrink as tone gets lighter.
  const a = (angleDeg * Math.PI) / 180;
  const ca = Math.cos(a), sa = Math.sin(a);
  return (x, y) => {
    const u = (x * ca + y * sa) / cell;
    const v = (-x * sa + y * ca) / cell;
    const du = u - Math.floor(u) - 0.5;
    const dv = v - Math.floor(v) - 0.5;
    const d = Math.sqrt(du * du + dv * dv); // 0 at dot centre, 0.707 at corner
    // Share of the cell inside radius d (disc area, then the merged corners).
    const area = d <= 0.5 ? Math.PI * d * d : Math.PI / 4 + ((d - 0.5) / (Math.SQRT1_2 - 0.5)) * (1 - Math.PI / 4);
    return Math.min(0.999, Math.max(0.001, 1 - area));
  };
}

function boxBlur(lum, w, h, r) {
  if (r < 1) return lum;
  const tmp = new Float32Array(lum.length);
  const out = new Float32Array(lum.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0, n = 0;
      for (let k = -r; k <= r; k++) {
        const xx = x + k;
        if (xx >= 0 && xx < w) { s += lum[y * w + xx]; n++; }
      }
      tmp[y * w + x] = s / n;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0, n = 0;
      for (let k = -r; k <= r; k++) {
        const yy = y + k;
        if (yy >= 0 && yy < h) { s += tmp[yy * w + x]; n++; }
      }
      out[y * w + x] = s / n;
    }
  }
  return out;
}

// Luminance thresholds at the given percentiles of the visible pixels.
export function percentileThresholds(lum, alphaOk, percentiles) {
  const hist = new Uint32Array(256);
  let total = 0;
  for (let i = 0; i < lum.length; i++) {
    if (!alphaOk[i]) continue;
    hist[Math.max(0, Math.min(255, Math.round(lum[i])))]++;
    total++;
  }
  return percentiles.map((p) => {
    const target = (p / 100) * total;
    let acc = 0;
    for (let v = 0; v < 256; v++) {
      acc += hist[v];
      if (acc >= target) return v + 0.5;
    }
    return 255;
  });
}

/**
 * Posterize an ImageData (or {data, width, height}) in place.
 * @param {ImageData|{data:ArrayLike<number>,width:number,height:number}} imageData
 * @param {string[]|number[][]|{ink,accent,ground,paper,support?}} palette
 * @param {object} [opts]
 * @param {number} [opts.levels=4]        2-5 tonal levels
 * @param {number[]} [opts.thresholds]    levels-1 ascending cut points, 0-255 (or 0-1)
 * @param {number[]} [opts.percentiles]   used when thresholds are not given
 * @param {number} [opts.smooth=0]        box-blur radius in px before thresholding
 * @param {null|'bayer4'|'bayer8'|'halftone'} [opts.dither=null]
 * @param {number} [opts.spread=0.35]     width of the dithered zone, 0-1 of the gap to the next threshold
 * @param {number} [opts.cell=8]          halftone cell size in px
 * @param {number} [opts.angle=45]        halftone screen angle in degrees
 * @returns {{levels:number, thresholds:number[], shares:number[], colours:number[][]}}
 */
export function posterizeImageData(imageData, palette, opts = {}) {
  const { levels = 4, smooth = 0, dither = null, spread = 0.35, cell = 8, angle = 45 } = opts;
  if (!Number.isInteger(levels) || levels < 2 || levels > 5) throw new Error('posterize: levels must be 2-5');
  const { data, width: w, height: h } = imageData;
  const colours = paletteList(palette, levels);

  const n = w * h;
  let lum = new Float32Array(n);
  const visible = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    lum[i] = LUMA[0] * data[o] + LUMA[1] * data[o + 1] + LUMA[2] * data[o + 2];
    visible[i] = data[o + 3] > 0 ? 1 : 0;
  }
  lum = boxBlur(lum, w, h, Math.round(smooth));

  let t = opts.thresholds;
  if (t) {
    if (t.length !== levels - 1) throw new Error(`posterize: need ${levels - 1} thresholds`);
    if (t.every((v) => v <= 1)) t = t.map((v) => v * 255);
  } else {
    t = percentileThresholds(lum, visible, opts.percentiles || DEFAULT_PERCENTILES[levels]);
  }
  t = t.slice().sort((a, b) => a - b);

  // Dither zone half-widths: a share of the gap to the neighbouring threshold.
  const edges = [0, ...t, 255];
  const half = t.map((v, k) => (spread * Math.min(v - edges[k], edges[k + 2] - v)) / 2);

  let map = null;
  if (dither === 'bayer4' || dither === 'bayer8') {
    const m = bayer(dither === 'bayer4' ? 4 : 8);
    const s = m.length;
    map = (x, y) => m[y % s][x % s];
  } else if (dither === 'halftone') {
    map = halftoneMap(cell, angle);
  } else if (dither) {
    throw new Error(`posterize: unknown dither ${dither}`);
  }

  const counts = new Array(levels).fill(0);
  let seen = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!visible[i]) continue;
      const L = lum[i];
      let k = 0;
      while (k < t.length && L >= t[k]) k++;
      if (map && half.length) {
        // Inside a dither zone, choose between the two neighbouring levels.
        for (let j = 0; j < t.length; j++) {
          if (half[j] > 0 && Math.abs(L - t[j]) < half[j]) {
            const f = (L - (t[j] - half[j])) / (2 * half[j]); // 0 = dark side, 1 = light side
            k = f > map(x, y) ? j + 1 : j;
            break;
          }
        }
      }
      const c = colours[k];
      const o = i * 4;
      data[o] = c[0];
      data[o + 1] = c[1];
      data[o + 2] = c[2];
      counts[k]++;
      seen++;
    }
  }
  return {
    levels,
    thresholds: t.map((v) => Math.round(v * 10) / 10),
    shares: counts.map((c) => (seen ? Math.round((c / seen) * 1000) / 10 : 0)),
    colours,
  };
}
