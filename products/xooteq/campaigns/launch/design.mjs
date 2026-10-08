// XOOTEQ "launch" campaign: every piece as SVG, in Humanist Minimal (approaches/humanist-minimal).
// Colours come from the product's palettes (dist/xooteq/tokens/colors.json: combination 207, light
// "primary" and dark "night"), type from its pairing (dist/xooteq/tokens/typography.json:
// Bricolage Grotesque + Figtree), words from the .copy.json files beside this script, and the
// drawings from the product's illustration primitives (dist/xooteq/web/js/illustration.mjs).
//
//   npm run build -- xooteq
//   node products/xooteq/campaigns/launch/design.mjs            # SVGs only
//   node products/xooteq/campaigns/launch/design.mjs --render   # + PNG previews, QA and contact sheet (needs Playwright)
//
// Zero dependencies. Every SVG has a viewBox, width and height, and only prefixed ids/classes
// (xq-<piece>-...) so the brand hub can inline many of them on one page.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../../../..');
const DIST = join(ROOT, 'dist/xooteq');
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));

// ------------------------------------------------------------------ tokens
const colors = json(join(DIST, 'tokens/colors.json'));
const type = json(join(DIST, 'tokens/typography.json'));
const approach = json(join(DIST, 'tokens/approach.json'));
const hex = Object.fromEntries(colors.colors.map((c) => [c.id, c.hex]));
const brandPal = (name) => colors.brand.find((p) => p.name === name).roles;
const BLACK = hex.black, WHITE = hex.white;

// Roles per palette. "line" is the colour of ink over the ground; ink over paper is always Wada Black.
// On the night ground (Wada Black) a black line would vanish, so lines that leave the paper are
// drawn in paper white, as the engine's own molecule motif does with its paper-coloured arms.
const PAL = {
  primary: (() => { const r = brandPal('primary'); return { name: 'primary', ground: hex[r.bg], text: hex[r.text], ink: BLACK, line: BLACK, paper: WHITE, accent: hex[r.accent], btn: BLACK, btnText: WHITE }; })(),
  night: (() => { const r = brandPal('night'); return { name: 'night', ground: hex[r.bg], text: hex[r.text], ink: BLACK, line: WHITE, paper: WHITE, accent: hex[r.accent], btn: hex[r.text], btnText: BLACK }; })(),
};

const DISPLAY = type.pairing.display.family; // Bricolage Grotesque
const BODY = type.pairing.body.family; // Figtree
const FONT_URL = `https://fonts.googleapis.com/css2?family=${DISPLAY.replace(/ /g, '+')}:opsz,wght@12..96,700;12..96,800&family=${BODY.replace(/ /g, '+')}:wght@400;600;700&display=swap`;
const FD = `'${DISPLAY}', system-ui, sans-serif`;
const FB = `'${BODY}', system-ui, sans-serif`;

const { illustrator: ill } = await import(pathToFileURL(join(DIST, 'web/js/illustration.mjs')).href);
const LINE = approach.art?.line || { width: 9, wobble: 1.4 };

// ------------------------------------------------------------------ text metrics and setting
const METRICS = json(join(HERE, 'font-metrics.json'));
const CAP = { display: 0.66, body: 0.71 };
const TRACK = { display: -0.02, brand: 0.1 };
const fontKey = (fam, w) => (fam === 'display' ? (w >= 800 ? 'd800' : 'd700') : w >= 700 ? 'b700' : w >= 600 ? 'b600' : 'b400');
function measure(str, size, fam = 'display', weight = 800, track = fam === 'display' ? TRACK.display : 0) {
  const t = METRICS[fontKey(fam, weight)];
  let w = 0;
  for (const ch of str) w += t[ch] ?? 0.56;
  // 3% safety: optical sizes below 96 px set slightly wider than the 100 px measurement.
  return (w * size + track * size * Math.max(0, [...str].length - 1)) * 1.03;
}
function wrap(text, maxW, size, fam, weight) {
  const lines = [];
  for (const word of String(text).trim().split(/\s+/)) {
    const last = lines[lines.length - 1];
    if (last && measure(`${last} ${word}`, size, fam, weight) <= maxW) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}
// Fewest lines; then the narrowest measure that keeps that count (no lone last word). If the text has
// two or more sentences and each fits on its own line count, break between sentences instead.
function setLines(text, maxW, size, fam = 'display', weight = 800) {
  const base = wrap(text, maxW, size, fam, weight);
  const sentences = String(text).match(/[^.?!]+[.?!]+|[^.?!]+$/g).map((s) => s.trim());
  if (sentences.length > 1) {
    const bySentence = sentences.flatMap((s) => balance(s, maxW, size, fam, weight));
    if (bySentence.length <= base.length) return bySentence;
  }
  return balance(text, maxW, size, fam, weight);
}
function balance(text, maxW, size, fam, weight) {
  const base = wrap(text, maxW, size, fam, weight);
  if (base.length < 2) return base;
  let best = base;
  for (let w = maxW - size * 0.3; w > maxW * 0.45; w -= size * 0.3) {
    const next = wrap(text, w, size, fam, weight);
    if (next.length !== base.length) break;
    best = next;
  }
  return best;
}
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const r1 = (n) => Math.round(n * 10) / 10;

// A block of text: returns { svg, w, h } with y = top of the block (cap top of the first line).
function textBlock(text, { x, y, maxW, size, fam = 'display', weight = 800, lead, fill, track, anchor = 'start', lines: given }) {
  const lines = given || (fam === 'display' ? setLines(text, maxW, size, fam, weight) : balance(text, maxW, size, fam, weight));
  const cap = CAP[fam === 'display' ? 'display' : 'body'] * size;
  const L = lead ?? (fam === 'display' ? 1.02 : 1.38) * size;
  const ls = track ?? (fam === 'display' ? TRACK.display : 0);
  const family = fam === 'display' ? FD : FB;
  const svg = `<text font-family="${esc(family)}" font-size="${size}" font-weight="${weight}" letter-spacing="${r1(ls * size)}" fill="${fill}" text-anchor="${anchor}">` +
    lines.map((l, i) => `<tspan x="${r1(x)}" y="${r1(y + cap + i * L)}">${esc(l)}</tspan>`).join('') + '</text>';
  const w = Math.max(...lines.map((l) => measure(l, size, fam === 'display' ? 'display' : 'body', weight, ls)));
  // h: from cap top to the last baseline plus descender room (0.22 em).
  return { svg, w, h: cap + (lines.length - 1) * L + size * 0.22, lines };
}

// The XOOTEQ mark: a static redraw of the site's LogoMark (circle, X inside, tail on the lower-right
// arm; source: xooteq-web src/components/LogoMark.tsx) next to the name set in the display face.
function markSvg(x, y, h, color) {
  const s = h / 74; // drawn extent of the mark, in the component's units (17 ... 89)
  return `<g transform="translate(${r1(x - 16 * s)} ${r1(y - 16 * s)}) scale(${(s).toFixed(4)})" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">` +
    '<circle cx="45" cy="45" r="28"/><line x1="34" y1="34" x2="56" y2="56"/><line x1="56" y1="34" x2="34" y2="56"/><line x1="56" y1="56" x2="87.4" y2="87.4"/></g>';
}
function brand(x, y, size, color) {
  const cap = CAP.display * size;
  const mh = cap * 1.55;
  const gap = size * 0.42;
  const tx = x + mh + gap;
  const word = `<text x="${r1(tx)}" y="${r1(y + (mh + cap) / 2)}" font-family="${esc(FD)}" font-size="${size}" font-weight="700" letter-spacing="${r1(TRACK.brand * size)}" fill="${color}">XOOTEQ</text>`;
  const w = mh + gap + measure('XOOTEQ', size, 'display', 700, TRACK.brand);
  return { svg: `<g aria-label="XOOTEQ">${markSvg(x, y, mh, color)}${word}</g>`, w, h: mh };
}
// Call to action as a pill button (art.json corners: button = pill).
function pill(text, { x, y, size, pal, anchor = 'start' }) {
  const tw = measure(text, size, 'body', 700, 0);
  const padX = size * 0.95, h = size * 2.3, w = tw + padX * 2;
  const x0 = anchor === 'end' ? x - w : x;
  return {
    svg: `<rect x="${r1(x0)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${r1(h / 2)}" fill="${pal.btn}"/>` +
      `<text x="${r1(x0 + padX)}" y="${r1(y + h / 2 + CAP.body * size / 2)}" font-family="${esc(FB)}" font-size="${size}" font-weight="700" fill="${pal.btnText}">${esc(text)}</text>`,
    w, h,
  };
}

// ------------------------------------------------------------------ drawing kit (400 x 400 local artboard)
// Catmull-Rom samples through control points, so ink lines can follow real curves.
function cr(pts, k = 10) {
  if (pts.length < 3) return pts;
  const p = [pts[0], ...pts, pts[pts.length - 1]];
  const out = [];
  for (let i = 1; i < p.length - 2; i++) {
    const [x0, y0] = p[i - 1], [x1, y1] = p[i], [x2, y2] = p[i + 1], [x3, y3] = p[i + 2];
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * x1 + (-x0 + x2) * t + (2 * x0 - 5 * x1 + 4 * x2 - x3) * t2 + (-x0 + 3 * x1 - 3 * x2 + x3) * t3),
        0.5 * (2 * y1 + (-y0 + y2) * t + (2 * y0 - 5 * y1 + 4 * y2 - y3) * t2 + (-y0 + 3 * y1 - 3 * y2 + y3) * t3),
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
// Resample a dense polyline to even steps, so the hand wobble is applied at the stroke's own scale
// (jittering every dense sample makes the edge look beaded).
function resample(pts, step) {
  const out = [pts[0]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    acc += Math.hypot(bx - ax, by - ay);
    if (acc >= step) { out.push(pts[i]); acc = 0; }
  }
  const last = pts[pts.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}
const rot = ([x, y], [cx, cy], deg) => { const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]; };

function kit(pal, lw) {
  const MIS = [4, 3]; // paper sits slightly off the ink (art.json misregistration), same direction everywhere
  const k = {
    lw,
    // Ink line. on: 'paper' -> always black ink; otherwise the palette's line colour (over the ground).
    line(pts, { w = lw, seed = 1, wobble = 0.9, segment = 20, on, color, curve = true, closed = false } = {}) {
      const c = color || (on === 'paper' ? pal.ink : pal.line);
      const d = ill.inkLine(curve ? resample(cr(pts), segment * 0.9) : pts, { seed, wobble, segment, closed });
      return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${r1(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    },
    dot(x, y, r, { color, on, seed = 3 } = {}) {
      const c = color || (on === 'paper' ? pal.ink : pal.line);
      return `<path d="${ill.blob(x, y, r, r, { points: 6, irregularity: 0.06, seed })}" fill="${c}"/>`;
    },
    // Organic paper shape through points (hand-cut), offset by the misregistration.
    cut(pts, { fill = pal.paper, seed = 5, wobble = 0.8 } = {}) {
      const d = ill.inkLine(pts, { closed: true, wobble, segment: 1e4, seed });
      return `<path d="${d}" fill="${fill}" transform="translate(${MIS[0]} ${MIS[1]})"/>`;
    },
    blob(cx, cy, rx, ry, { fill = pal.paper, seed = 5, points = 8, irregularity = 0.08 } = {}) {
      return `<path d="${ill.blob(cx, cy, rx, ry, { points, irregularity, seed })}" fill="${fill}" transform="translate(${MIS[0]} ${MIS[1]})"/>`;
    },
    rect(x, y, w, h, { fill = pal.paper, radius = 14, seed = 7, jitter = 2.5, angle = 0 } = {}) {
      const c = [x + w / 2, y + h / 2];
      const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map((p) => rot(p, c, angle));
      return `<path d="${ill.paperPolygon(pts, { jitter, radius, seed })}" fill="${fill}" transform="translate(${MIS[0]} ${MIS[1]})"/>`;
    },
    // A leaf: almond shape from base to tip (the tip keeps a small natural point).
    leaf(base, tip, width, { fill = pal.paper, seed = 9 } = {}) {
      const [bx, by] = base, [tx, ty] = tip, dx = tx - bx, dy = ty - by, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
      const N = 9, pts = [];
      for (let i = 0; i <= N; i++) { const t = i / N, w = (width / 2) * Math.sin(Math.PI * Math.pow(t, 0.75)); pts.push([bx + dx * t + nx * w, by + dy * t + ny * w]); }
      for (let i = N - 1; i >= 1; i--) { const t = i / N, w = (width / 2) * 0.86 * Math.sin(Math.PI * Math.pow(t, 0.75)); pts.push([bx + dx * t - nx * w, by + dy * t - ny * w]); }
      return k.cut(pts, { fill, seed, wobble: 0.6 });
    },
    // A leaf with its midrib in ink, the rib running a little past the base (ink crossing a paper edge).
    leafRib(base, tip, width, { seed = 9, fill, outline = false } = {}) {
      const [bx, by] = base, [tx, ty] = tip;
      if (outline) {
        const dx = tx - bx, dy = ty - by, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len, pts = [];
        for (let i = 0; i <= 8; i++) { const t = i / 8, w = (width / 2) * Math.sin(Math.PI * Math.pow(t, 0.75)); pts.push([bx + dx * t + nx * w, by + dy * t + ny * w]); }
        for (let i = 7; i >= 1; i--) { const t = i / 8, w = (width / 2) * 0.86 * Math.sin(Math.PI * Math.pow(t, 0.75)); pts.push([bx + dx * t - nx * w, by + dy * t - ny * w]); }
        return k.leaf(base, tip, width, { seed, fill }) + `<path d="${ill.inkLine(pts, { closed: true, wobble: 0.6, segment: 1e4, seed: seed + 2 })}" fill="none" stroke="${pal.ink}" stroke-width="${r1(lw * 0.62)}" stroke-linejoin="round"/>` + k.line([[bx, by], [bx + dx * 0.78, by + dy * 0.78]], { w: lw * 0.55, seed: seed + 1, on: 'paper' });
      }
      const rib = [[bx - (tx - bx) * 0.06, by - (ty - by) * 0.06], [bx + (tx - bx) * 0.5, by + (ty - by) * 0.5 - 3], [bx + (tx - bx) * 0.82, by + (ty - by) * 0.82]];
      return k.leaf(base, tip, width, { seed, fill }) + k.line(rib, { w: lw * 0.62, seed: seed + 1, on: 'paper', segment: 12 });
    },
  };
  return k;
}

// Places a motif drawn on the 400-unit artboard at (cx, cy) with a given size; keeps the ink line at
// lwPx on the final canvas (art.json: line weight is fixed per artboard, never scaled with objects).
function place(motif, pal, { cx, cy, size, lwPx, flip = false }) {
  const s = size / 400;
  const k = kit(pal, lwPx / s);
  const body = MOTIFS[motif](k, pal);
  const t = `translate(${r1(cx - size / 2 + (flip ? size : 0))} ${r1(cy - size / 2)}) scale(${(flip ? -s : s).toFixed(4)} ${s.toFixed(4)})`;
  return { svg: `<g class="xq-art" data-motif="${motif}" transform="${t}">${body}</g>`, box: { x: cx - size / 2, y: cy - size / 2, w: size, h: size } };
}

// ------------------------------------------------------------------ motifs (each: one idea, two plain symbols)
const MOTIFS = {
  // Code braces + sprout: technology that grows something real. Paper braces with ink on top, a soil clod in the accent.
  'bracket-sprout'(k, pal) {
    const brace = (m) => [[128, 64], [100, 76], [96, 118], [97, 164], [86, 190], [62, 201], [86, 212], [97, 238], [96, 284], [100, 326], [128, 338]].map(([x, y]) => [m ? 400 - x : x, y]);
    const paperBrace = (m, seed) => `<path d="${ill.inkLine(resample(cr(brace(m)), 16), { seed, wobble: 0.9, segment: 18 })}" fill="none" stroke="${pal.paper}" stroke-width="${r1(k.lw * 2.4)}" stroke-linecap="round" stroke-linejoin="round" transform="translate(5 4)"/>`;
    let s = paperBrace(false, 31) + paperBrace(true, 37);
    // Leaves sit behind the braces' ink, so the braces' lines cross the paper.
    s += k.leafRib([198, 236], [96, 170], 74, { seed: 41 });
    s += k.leafRib([202, 196], [310, 120], 78, { seed: 47 });
    s += k.line(brace(false), { seed: 11, segment: 12 }) + k.line(brace(true), { seed: 13, segment: 12 });
    s += k.blob(200, 322, 52, 22, { fill: pal.accent, seed: 23, points: 7, irregularity: 0.09 });
    s += k.line([[200, 316], [197, 270], [202, 222], [199, 176], [204, 128], [214, 104]], { seed: 17 });
    s += k.dot(214, 102, k.lw * 0.75);
    return s;
  },

  // A hand under a ball of soil with a sprout: planting, by hand (after the globe-and-hands reference).
  'hand-soil'(k, pal) {
    // A young tree with its root ball: a tall stem with four leaves over a wide, lumpy mound of soil.
    let s = k.cut([[132, 262], [150, 226], [190, 206], [236, 200], [284, 208], [322, 228], [338, 262], [304, 282], [236, 290], [168, 284]], { fill: pal.accent, seed: 61, wobble: 1.6 });
    s += k.line([[236, 230], [234, 180], [238, 130], [234, 80], [238, 30]], { seed: 69 });
    s += k.leafRib([235, 170], [160, 132], 52, { seed: 63 });
    s += k.leafRib([237, 140], [316, 104], 54, { seed: 67 });
    s += k.leafRib([235, 96], [176, 56], 44, { seed: 64 });
    s += k.leafRib([237, 70], [292, 30], 44, { seed: 66 });
    s += k.dot(238, 28, k.lw * 0.7);
    // Fingers: a run of arches (n n n n) rising onto the soil, then the side of the hand down to the edge.
    // Fingers curl up around the left of the soil (n n n n), then the side of the hand runs off the edge.
    const pts = [[86, 392], [88, 340], [92, 310]];
    const fingers = [[96, 252], [134, 238], [172, 240], [210, 256]];
    fingers.forEach(([x, top], i) => {
      pts.push([x, top + 30], [x + 6, top + 7], [x + 16, top], [x + 26, top + 7], [x + 32, top + 32], [x + 34, 318 - i * 3]);
    });
    pts.push([252, 314], [270, 334], [272, 366], [264, 392]);
    s += `<path d="${ill.inkLine(resample(cr(pts, 8), 12), { seed: 71, wobble: 0.8, segment: 14 })}" fill="none" stroke="${pal.line}" stroke-width="${r1(k.lw)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    return s;
  },

  // A work table and one chair pulled out: a seat at the table. The chair's seat is the accent.
  'table-chair'(k, pal) {
    let s = k.cut([[28, 176], [236, 172], [274, 214], [64, 218]], { seed: 81 });
    s += k.line([[60, 218], [282, 214]], { seed: 82 });
    s += k.line([[74, 218], [72, 350]], { seed: 83 }) + k.line([[262, 216], [266, 350]], { seed: 84 }) + k.line([[36, 182], [34, 306]], { seed: 85, w: k.lw * 0.8 });
    // A laptop on the table: screen tilted back, keyboard edge.
    s += k.line([[104, 186], [96, 128], [168, 122], [182, 182]], { seed: 86, on: 'paper', curve: false });
    s += k.line([[94, 190], [196, 186]], { seed: 87, on: 'paper' });
    // The pulled-out chair, angled away from the table.
    s += k.cut([[300, 266], [362, 262], [374, 286], [310, 290]], { fill: pal.accent, seed: 88 });
    s += k.line([[358, 268], [370, 170]], { seed: 89 }) + k.line([[352, 172], [392, 178]], { seed: 90 });
    s += k.line([[312, 290], [304, 356]], { seed: 91 }) + k.line([[370, 286], [378, 356]], { seed: 92 }) + k.line([[340, 282], [344, 340]], { seed: 93, w: k.lw * 0.8 });
    s += k.dot(304, 358, k.lw * 0.62) + k.dot(378, 358, k.lw * 0.62);
    return s;
  },

  // A question mark whose curve is a growing stem; its dot is a seed. "Does it matter?"
  'question-sprout'(k, pal) {
    let s = k.blob(200, 182, 140, 136, { seed: 101, points: 9, irregularity: 0.06 });
    s += k.leafRib([138, 122], [84, 186], 54, { seed: 103, outline: true });
    s += k.leafRib([264, 146], [344, 104], 50, { seed: 107, outline: true });
    s += k.line([[134, 124], [142, 96], [168, 74], [204, 66], [240, 76], [264, 104], [268, 142], [252, 176], [222, 202], [204, 230], [201, 268], [201, 300]], { seed: 109, on: 'paper' });
    s += k.blob(201, 352, 22, 20, { fill: pal.accent, seed: 111, points: 7, irregularity: 0.07 });
    return s;
  },

  // A keyboard key that shines: fun is fuel.
  'key-sun'(k, pal) {
    let s = '';
    const rays = 18;
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2 + 0.1;
      const r0 = 142 + (i % 2) * 8, r1x = 186 - (i % 2) * 16;
      s += k.line([[200 + Math.cos(a) * r0, 200 + Math.sin(a) * r0], [200 + Math.cos(a) * r1x, 200 + Math.sin(a) * r1x]], { seed: 120 + i, segment: 30, curve: false, w: k.lw * 0.85 });
    }
    s += k.rect(98, 98, 204, 204, { radius: 40, seed: 141, jitter: 3 });
    s += k.line([[134, 134], [262, 128], [266, 252], [138, 258]], { seed: 143, on: 'paper', curve: false, closed: true, w: k.lw * 0.7 });
    s += k.blob(200, 192, 40, 38, { fill: pal.accent, seed: 145, points: 7, irregularity: 0.08 });
    return s;
  },

  // A crescent moon with one eye wide open: the idea that won't let you sleep. The iris is the accent.
  'moon-eye'(k, pal) {
    const O = [200, 206], RO = 150, I = [272, 152], RI = 128;
    const outer = [], inner = [];
    for (let i = 0; i < 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      const p = [O[0] + Math.cos(a) * RO, O[1] + Math.sin(a) * RO];
      if (Math.hypot(p[0] - I[0], p[1] - I[1]) > RI) outer.push({ a, p });
      const q = [I[0] + Math.cos(a) * RI, I[1] + Math.sin(a) * RI];
      if (Math.hypot(q[0] - O[0], q[1] - O[1]) < RO) inner.push({ a, p: q });
    }
    // Order the outer arc as one run (it wraps around angle 0), then return along the inner arc.
    const run = (arr) => { let cut = 0; for (let i = 1; i < arr.length; i++) if (arr[i].a - arr[i - 1].a > 0.2) cut = i; return [...arr.slice(cut), ...arr.slice(0, cut)].map((o) => o.p); };
    const o = run(outer), n = run(inner).reverse();
    const pts = [...o, ...n].filter((_, i) => i % 3 === 0);
    let s = k.cut(pts, { seed: 151, wobble: 0.9 });
    // The eye, on the thick part of the crescent, tilted with it.
    const c = [112, 262], tilt = -28;
    const P = (x, y) => rot([c[0] + x, c[1] + y], c, tilt);
    const upper = [[-46, 4], [-26, -20], [0, -27], [26, -20], [46, 2]].map(([x, y]) => P(x, y));
    const lower = [[-46, 4], [-22, 22], [4, 26], [28, 18], [46, 2]].map(([x, y]) => P(x, y));
    s += `<path d="${ill.blob(c[0] + 2, c[1] + 1, 17, 17, { points: 7, irregularity: 0.05, seed: 153 })}" fill="${pal.accent}"/>`;
    s += k.dot(c[0] + 3, c[1] + 1, 7.5, { on: 'paper', seed: 155 });
    s += k.line(upper, { seed: 157, on: 'paper', w: k.lw * 0.8 }) + k.line(lower, { seed: 159, on: 'paper', w: k.lw * 0.8 });
    [[-24, -24, -32, -38], [0, -30, 0, -46], [24, -24, 32, -38]].forEach(([x1, y1, x2, y2], i) => { s += k.line([P(x1, y1), P(x2, y2)], { seed: 161 + i, on: 'paper', curve: false, w: k.lw * 0.6 }); });
    // Two small paper stars on the night ground.
    s += k.blob(352, 70, 7, 7, { seed: 171, points: 6, irregularity: 0.05 }) + k.blob(316, 330, 5, 5, { seed: 173, points: 6, irregularity: 0.05 });
    return s;
  },

  // A calendar page with a sprout growing out of it: every quarter, new trees.
  'calendar-sprout'(k, pal) {
    let s = '';
    s += k.leafRib([200, 108], [126, 60], 58, { seed: 181 });
    s += k.leafRib([202, 86], [286, 40], 62, { seed: 183 });
    s += k.rect(86, 150, 228, 226, { radius: 26, seed: 185, angle: -3 });
    const page = (x, y) => rot([x, y], [200, 263], -3);
    s += k.line([page(108, 204), page(292, 204)], { seed: 187, on: 'paper' });
    [132, 268].forEach((x, i) => { s += k.line([page(x - 8, 172), page(x - 9, 140), page(x, 128), page(x + 9, 140), page(x + 8, 172)], { seed: 189 + i, w: k.lw * 0.8 }); });
    const cols = [132, 178, 224, 270], rows = [244, 290, 336];
    s += (() => { const [x, y] = page(224, 290); return k.blob(x, y, 24, 22, { fill: pal.accent, seed: 193, points: 7, irregularity: 0.07 }); })();
    rows.forEach((y, ri) => cols.forEach((x, ci) => { const [px, py] = page(x, y); s += k.dot(px, py, k.lw * 0.5, { on: 'paper', seed: 200 + ri * 4 + ci }); }));
    s += k.line([page(200, 170), page(198, 140), page(201, 110), page(204, 74)], { seed: 195 });
    s += k.dot(...page(204, 72), k.lw * 0.75);
    return s;
  },

  // A tree growing from a microchip, its roots drawn as circuit traces: engineer the organic tomorrow.
  'chip-tree'(k, pal) {
    // Crown: one cut-paper cloud of overlapping lobes, so it reads as foliage, not a disc.
    const lobes = [[200, 92, 74], [132, 140, 62], [268, 138, 64], [168, 178, 58], [236, 180, 58], [200, 140, 70]];
    const crown = [];
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      let best = 0;
      for (const [x, y, r] of lobes) { const dx = x - 200, dy = y - 140, b = dx * Math.cos(a) + dy * Math.sin(a), c = dx * dx + dy * dy - r * r, t = b + Math.sqrt(Math.max(0, b * b - c)); best = Math.max(best, t); }
      if (i % 2 === 0) crown.push([200 + Math.cos(a) * best, 140 + Math.sin(a) * best]);
    }
    let s = k.cut(crown, { seed: 211, wobble: 1.2 });
    // Trunk and a few short branches inside the crown, ending in ink dots.
    s += k.line([[200, 300], [199, 250], [201, 205], [200, 170]], { seed: 213 });
    s += k.line([[200, 214], [176, 186], [156, 162]], { seed: 215, w: k.lw * 0.8 });
    s += k.line([[201, 200], [226, 176], [246, 156]], { seed: 217, w: k.lw * 0.8 });
    s += k.dot(200, 168, k.lw * 0.75, { on: 'paper' }) + k.dot(156, 160, k.lw * 0.7, { on: 'paper' }) + k.dot(246, 154, k.lw * 0.7, { on: 'paper' });
    // Roots: traces with soft bends, ending in solder dots.
    const traces = [
      [[160, 310], [118, 310], [100, 326], [54, 326]],
      [[160, 330], [132, 330], [116, 348], [84, 350]],
      [[240, 310], [282, 310], [300, 326], [346, 326]],
      [[240, 330], [268, 330], [284, 348], [316, 350]],
      [[188, 346], [188, 382]],
      [[212, 346], [214, 372]],
    ];
    traces.forEach((t, i) => {
      s += k.line(t, { seed: 221 + i, w: k.lw * 0.78, segment: 10 });
      const e = t[t.length - 1];
      s += k.dot(e[0], e[1], k.lw * 0.72, { seed: 231 + i });
    });
    s += k.rect(158, 292, 84, 56, { fill: pal.accent, radius: 10, seed: 241, jitter: 2 });
    s += k.line([[200, 300], [200, 274]], { seed: 243 });
    return s;
  },

  // A hand setting the last block on a stack: degrees don't build things, people do.
  'hand-blocks'(k, pal) {
    let s = k.rect(96, 304, 208, 76, { radius: 14, seed: 251, angle: 1 });
    s += k.rect(120, 230, 164, 66, { radius: 14, seed: 253, angle: -2 });
    s += k.rect(146, 150, 116, 58, { fill: pal.accent, radius: 12, seed: 255, angle: -5 });
    // Hand from above: wrist off the top edge, fingers (u u u u) gripping the top block.
    const pts = [[150, -260], [152, 60], [150, 112]];
    const fingers = [[150, 170], [182, 180], [214, 180], [246, 170]];
    fingers.forEach(([x, bottom], i) => { pts.push([x + 2, bottom - 36], [x + 4, bottom - 8], [x + 13, bottom], [x + 22, bottom - 8], [x + 24, bottom - 36], [x + 28, 118 + (i % 2) * 4]); });
    pts.push([276, 112], [286, 86], [282, 40], [276, -260]);
    s += `<path d="${ill.inkLine(resample(cr(pts, 8), 12), { seed: 257, wobble: 0.8, segment: 14 })}" fill="none" stroke="${pal.line}" stroke-width="${r1(k.lw)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    return s;
  },
};

// ------------------------------------------------------------------ document
function doc({ id, W, H, pal, label, safe, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label)}" class="xq-${id}" data-safe="${safe.map(r1).join(' ')}">` +
    `<style>@import url("${FONT_URL}");</style>` +
    `<rect width="${W}" height="${H}" fill="${pal.ground}"/>${body}</svg>\n`;
}

// Empty ground: share of the canvas not covered by any mark box (sampled on a grid).
function emptyPct(W, H, boxes) {
  let used = 0, n = 0;
  const st = Math.max(4, Math.round(Math.min(W, H) / 200));
  for (let y = 0; y < H; y += st) for (let x = 0; x < W; x += st) { n++; if (boxes.some((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h)) used++; }
  return Math.round((1 - used / n) * 100);
}

const copy = (n) => json(join(HERE, `${n}.copy.json`));
const pieces = [];

// ---- Feed post template (4:5 and 1:1): art above, one text group anchored to the bottom margin.
// Text order (layout.json hierarchy): headline, brand right under it (O4), subhead, call to action.
function feedPost({ id, file, c, motif, W = 1080, H = 1350, sizes, artTweak = {}, counter }) {
  const pal = PAL[c.palette || 'primary'];
  const M = Math.round(Math.min(W, H) * 0.08);
  const maxW = W - 2 * M;
  const { head, body, small } = sizes;
  // Measure bottom-up.
  const h = textBlock(c.headline, { x: M, y: 0, maxW, size: head, fill: pal.text });
  const sub = c.subhead ? textBlock(c.subhead, { x: M, y: 0, maxW: Math.min(maxW, body * 26), size: body, fam: 'body', weight: 400, fill: pal.text }) : null;
  const bod = c.body ? textBlock(c.body, { x: M, y: 0, maxW: Math.min(maxW, body * 26), size: body, fam: 'body', weight: 400, fill: pal.text }) : null;
  const ctaH = c.cta ? body * 2.3 : 0;
  const gHB = head * 0.3, gBS = head * 0.48, gSC = body * 0.9;
  const bh = brand(0, 0, small, pal.text).h;
  const total = h.h + gHB + bh + (sub ? gBS + sub.h : 0) + (bod ? body * 0.5 + bod.h : 0) + (c.cta ? (sub || bod ? gSC : gBS) + ctaH : 0);
  let y = H - M - total;
  const top = y;
  let out = '';
  const boxes = [];
  const hb = textBlock(c.headline, { x: M, y, maxW, size: head, fill: pal.text, lines: h.lines });
  out += hb.svg; boxes.push({ x: M, y, w: hb.w, h: hb.h });
  y += hb.h + gHB;
  const b = brand(M, y, small, pal.text); out += b.svg; boxes.push({ x: M, y, w: b.w, h: b.h });
  y += b.h;
  if (sub) { y += gBS; const t = textBlock(c.subhead, { x: M, y, maxW, size: body, fam: 'body', weight: 400, fill: pal.text, lines: sub.lines }); out += t.svg; boxes.push({ x: M, y, w: t.w, h: t.h }); y += t.h; }
  if (bod) { y += body * 0.5; const t = textBlock(c.body, { x: M, y, maxW, size: body, fam: 'body', weight: 400, fill: pal.text, lines: bod.lines }); out += t.svg; boxes.push({ x: M, y, w: t.w, h: t.h }); y += t.h; }
  if (c.cta) { y += sub || bod ? gSC : gBS; const p = pill(c.cta, { x: M, y, size: body, pal }); out += p.svg; boxes.push({ x: M, y, w: p.w, h: p.h }); }
  // Art: centred in the space above the text, at least one margin away from it (art.json composition).
  const artTop = artTweak.bleedTop ? 0 : M;
  const avail = top - M * 0.9 - artTop;
  const size = Math.min(avail * (artTweak.scale || 1), maxW * 0.86);
  const cx = W / 2 + (artTweak.dx || 0) * W, cy = artTop + avail / 2 + (artTweak.dy || 0) * size;
  const art = place(motif, pal, { cx, cy, size, lwPx: Math.min(W, H) * 0.019 * (artTweak.lw || 1), flip: artTweak.flip });
  let extra = '';
  if (counter) {
    const t = `${counter[0]} / ${counter[1]}`;
    extra = `<text x="${W - M}" y="${M + CAP.body * small}" text-anchor="end" font-family="${esc(FB)}" font-size="${small}" font-weight="600" fill="${pal.text}">${t}</text>`;
    boxes.push({ x: W - M - small * 2.5, y: M, w: small * 2.5, h: small });
  }
  const svg = doc({ id, W, H, pal, label: [c.headline, c.subhead, c.cta].filter(Boolean).join(' '), safe: [W * 0.063, 0, W * 0.937, H], body: art.svg + out + extra });
  pieces.push({ id, file, W, H, svg, label: c.headline, motif, empty: emptyPct(W, H, [...boxes, shrink(art.box)]), sizes: [head, body, small], format: c.format, pal: pal.name });
}
// The motif fills about 80% of its 400 box; measure that, not the box.
const shrink = (b, f = 0.82) => ({ x: b.x + (b.w * (1 - f)) / 2, y: b.y + (b.h * (1 - f)) / 2, w: b.w * f, h: b.h * f });

// ---- Story template (9:16): headline and brand at the top of the safe area, art in the middle,
// subhead and call to action at the bottom of the safe area (top 14%, bottom 35%, sides 6%; grid margin 8%).
function story({ id, file, c, motif, sizes, artTweak = {} }) {
  const W = 1080, H = 1920, pal = PAL[c.palette || 'primary'];
  const M = Math.round(W * 0.08), top = H * 0.14, bottom = H * 0.65, maxW = W - 2 * M;
  const { head, body, small } = sizes;
  const boxes = [];
  // All words in the safe band (stacked composition): headline, brand beside it (O4), subhead, CTA.
  let out = '', y = top + head * 0.3; // room for the ascenders above the cap height
  const hb = textBlock(c.headline, { x: M, y, maxW, size: head, fill: pal.text }); out += hb.svg; boxes.push({ x: M, y, w: hb.w, h: hb.h });
  y += hb.h + head * 0.3;
  const b = brand(M, y, small, pal.text); out += b.svg; boxes.push({ x: M, y, w: b.w, h: b.h });
  y += b.h + head * 0.45;
  if (c.subhead) { const t = textBlock(c.subhead, { x: M, y, maxW: maxW * 0.9, size: body, fam: 'body', weight: 400, fill: pal.text }); out += t.svg; boxes.push({ x: M, y, w: t.w, h: t.h }); y += t.h + body * 0.9; }
  const p = pill(c.cta, { x: M, y, size: body, pal }); out += p.svg; boxes.push({ x: M, y, w: p.w, h: p.h });
  y += p.h;
  if (y > bottom) throw new Error(`${id}: words run past the story safe area`);
  // Art: large, centred below the words; it may run into the lower overlay band (art may bleed, text may not).
  const artTop = y + M * 0.6, artBottom = H * 0.9;
  const size = Math.min((artBottom - artTop) * (artTweak.scale || 1), maxW * 1.02);
  const art = place(motif, pal, { cx: W / 2 + (artTweak.dx || 0) * W, cy: artTop + (artBottom - artTop) / 2 + (artTweak.dy || 0) * size, size, lwPx: W * 0.019 });
  const svg = doc({ id, W, H, pal, label: [c.headline, c.subhead, c.cta].filter(Boolean).join(' '), safe: [W * 0.06, top, W * 0.94, bottom], body: art.svg + out });
  pieces.push({ id, file, W, H, svg, label: c.headline, motif, empty: emptyPct(W, H, [...boxes, shrink(art.box)]), sizes: [head, body, small], format: 'story', pal: pal.name });
}

// ------------------------------------------------------------------ the pieces
// Sizes from approaches/humanist-minimal/typography.json -> sizes.byFormat (headline cap height as a
// share of the canvas height; Bricolage caps are 0.66 em) and body minimums.
const IG = { head: 104, body: 38, small: 32 }; // cap 68.6 px = 5.1% of 1350; body >= 32
const CAR = { head: 92, body: 34, small: 30 }; // cap 60.7 px = 4.5% of 1350; body >= 30
const STORY = { head: 112, body: 42, small: 36 }; // cap 73.9 px = 3.85% of 1920; body >= 36
const SQ = { head: 88, body: 36, small: 30 }; // cap 58 px = 5.4% of 1080; body >= 32

feedPost({ id: 'post-launch', file: 'social/post-launch.svg', c: copy('post-launch'), motif: 'bracket-sprout', sizes: IG });
feedPost({ id: 'post-green', file: 'social/post-green.svg', c: copy('post-green'), motif: 'hand-soil', sizes: IG, artTweak: { dx: -0.02 } });
feedPost({ id: 'post-build', file: 'social/post-build.svg', c: copy('post-build'), motif: 'table-chair', sizes: IG, artTweak: { scale: 1.05, dy: 0.02 } });

const car = copy('carousel-filter');
const carMotifs = ['question-sprout', 'bracket-sprout', 'key-sun', 'table-chair'];
car.forEach((c, i) => feedPost({ id: `carousel-${i + 1}`, file: `social/carousel-${i + 1}.svg`, c, motif: carMotifs[i], sizes: CAR, counter: [i + 1, car.length] }));

story({ id: 'story-night', file: 'social/story-night.svg', c: copy('story-night'), motif: 'moon-eye', sizes: STORY });
story({ id: 'story-green', file: 'social/story-green.svg', c: copy('story-green'), motif: 'calendar-sprout', sizes: STORY });

feedPost({ id: 'linkedin-people', file: 'social/linkedin-people.svg', c: copy('linkedin-people'), motif: 'hand-blocks', W: 1080, H: 1080, sizes: SQ, artTweak: { bleedTop: true, scale: 1.1, dy: 0.04 } });

// ---- Web banner 970 x 250: brand | headline | art | button, on one row (banner-strip).
{
  const c = copy('banner-build');
  const W = 970, H = 250, pal = PAL.primary, M = 25; // margin 10% of the short side
  const head = 46, small = 22, cta = 20; // headline cap 30.4 px = 12.2% of 250
  const b = brand(M, H / 2 - 22 * 0.66 * 1.55 / 2, small, pal.text);
  const hx = M + b.w + 34;
  const p0 = pill(c.cta, { x: 0, y: 0, size: cta, pal });
  const px = W - M - p0.w;
  const artSize = 210, ax = px - 34 - artSize * 0.5;
  const maxW = ax - artSize * 0.42 - 24 - hx;
  const h = textBlock(c.headline, { x: hx, y: 0, maxW, size: head, fill: pal.text });
  const hb = textBlock(c.headline, { x: hx, y: (H - h.h) / 2 + head * 0.06, maxW, size: head, fill: pal.text, lines: h.lines });
  const p = pill(c.cta, { x: px, y: (H - p0.h) / 2, size: cta, pal });
  const art = place('bracket-sprout', pal, { cx: ax, cy: H / 2, size: artSize, lwPx: 6 });
  const svg = doc({ id: 'banner-build', W, H, pal, label: `${c.headline} ${c.cta}`, safe: [M, 25, W - M, H - 25], body: art.svg + b.svg + hb.svg + p.svg });
  pieces.push({ id: 'banner-build', file: 'web/banner-build.svg', W, H, svg, label: c.headline, motif: 'bracket-sprout', empty: emptyPct(W, H, [{ x: M, y: 90, w: b.w, h: 40 }, { x: hx, y: (H - h.h) / 2, w: h.w, h: h.h }, shrink(art.box), { x: px, y: (H - p0.h) / 2, w: p0.w, h: p0.h }]), sizes: [head, cta, small], format: 'web-banner', pal: 'primary' });
}

// ---- YouTube thumbnail 1280 x 720: headline left (split), the tree on the right; bottom-right corner kept clear.
{
  const c = copy('thumbnail-builds');
  const W = 1280, H = 720, pal = PAL.primary, M = Math.round(H * 0.08);
  const head = 136; // cap 89.8 px = 12.5% of 720
  const maxW = W * 0.5;
  const lines = ['What', 'XOOTEQ', 'actually', 'builds'];
  const h0 = textBlock(c.headline, { x: 0, y: 0, maxW, size: head, fill: pal.text, lines, lead: head * 0.98 });
  const hb = textBlock(c.headline, { x: W * 0.045 + 10, y: (H - h0.h) / 2 + 8, maxW, size: head, fill: pal.text, lines, lead: head * 0.98 });
  const size = 640;
  const art = place('chip-tree', pal, { cx: W * 0.735, cy: H * 0.47, size, lwPx: H * 0.02 });
  const svg = doc({ id: 'thumbnail-builds', W, H, pal, label: c.headline, safe: [W * 0.045, M, W * 0.8, H - M], body: art.svg + hb.svg });
  pieces.push({ id: 'thumbnail-builds', file: 'social/thumbnail-builds.svg', W, H, svg, label: c.headline, motif: 'chip-tree', empty: emptyPct(W, H, [{ x: W * 0.045, y: (H - h0.h) / 2, w: h0.w, h: h0.h }, shrink(art.box)]), sizes: [head], format: 'thumbnail', pal: 'primary' });
}

// ---- Poster (A-series, 1190 x 1684 units = 0.25 mm at A3): poster-single-focal.
{
  const c = copy('poster-organic');
  feedPost({ id: 'poster-organic', file: 'print/poster-organic.svg', c, motif: 'chip-tree', W: 1190, H: 1684, sizes: { head: 128, body: 36, small: 30 }, artTweak: { scale: 1.02 } });
  pieces[pieces.length - 1].format = 'poster';
}

// ---- Website hero 1440 x 810: split, words on the reading-start side, the tree on the right.
{
  const c = copy('hero-organic');
  const W = 1440, H = 810, pal = PAL.primary, M = Math.round(H * 0.08), X = Math.round(W * 0.045);
  const head = 84, body = 23, small = 18; // headline 84 px (40-88), body >= 18
  const boxes = [];
  let out = '';
  const nav = brand(X, M + 6, 26, pal.text); out += nav.svg; boxes.push({ x: X, y: M + 6, w: nav.w, h: nav.h });
  const maxW = W * 0.47;
  const h = textBlock(c.headline, { x: X, y: 0, maxW, size: head, fill: pal.text });
  const sub = textBlock(c.subhead, { x: X, y: 0, maxW: Math.min(maxW, body * 27), size: body, fam: 'body', weight: 400, fill: pal.text });
  const ctaH = body * 2.3;
  const total = h.h + head * 0.42 + sub.h + body * 1.6 + ctaH;
  let y = (H - total) / 2 + M * 0.4;
  const hb = textBlock(c.headline, { x: X, y, maxW, size: head, fill: pal.text, lines: h.lines }); out += hb.svg; boxes.push({ x: X, y, w: hb.w, h: hb.h });
  y += hb.h + head * 0.42;
  const sb = textBlock(c.subhead, { x: X, y, maxW, size: body, fam: 'body', weight: 400, fill: pal.text, lines: sub.lines }); out += sb.svg; boxes.push({ x: X, y, w: sb.w, h: sb.h });
  y += sb.h + body * 1.6;
  const p = pill(c.cta, { x: X, y, size: body, pal }); out += p.svg; boxes.push({ x: X, y, w: p.w, h: p.h });
  const dx = X + p.w + body * 1.2;
  out += `<text x="${r1(dx)}" y="${r1(y + ctaH / 2 + CAP.body * small / 2)}" font-family="${esc(FB)}" font-size="${small}" font-weight="600" fill="${pal.text}" text-decoration="underline">${esc(c.details)}</text>`;
  boxes.push({ x: dx, y: y + ctaH / 2 - small, w: measure(c.details, small, 'body', 600, 0), h: small * 1.4 });
  const art = place('chip-tree', pal, { cx: W * 0.765, cy: H * 0.52, size: 660, lwPx: H * 0.019 });
  const svg = doc({ id: 'hero-organic', W, H, pal, label: `${c.headline} ${c.subhead}`, safe: [X, M, W - X, H - M], body: art.svg + out });
  pieces.push({ id: 'hero-organic', file: 'web/hero-organic.svg', W, H, svg, label: c.headline, motif: 'chip-tree', empty: emptyPct(W, H, [...boxes, shrink(art.box)]), sizes: [head, body, small], format: 'landing-hero', pal: 'primary' });
}

// ------------------------------------------------------------------ contrast (WCAG) for every text colour used
const lum = (h) => { const v = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
for (const p of Object.values(PAL)) {
  const r = { text: ratio(p.text, p.ground), button: ratio(p.btnText, p.btn) };
  if (r.text < 4.5 || r.button < 4.5) throw new Error(`Contrast below 4.5:1 in palette ${p.name}`);
  console.log(`palette ${p.name}: text ${r.text.toFixed(2)}:1, button label ${r.button.toFixed(2)}:1`);
}
// Every colour in every SVG must come from the palettes (plus Wada Black and White).
const allowed = new Set(Object.values(PAL).flatMap((p) => [p.ground, p.text, p.ink, p.line, p.paper, p.accent, p.btn, p.btnText]).map((h) => h.toLowerCase()));
for (const p of pieces) {
  const used = [...p.svg.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0].toLowerCase());
  const bad = used.filter((h) => !allowed.has(h));
  if (bad.length) throw new Error(`${p.id}: colours outside the palette: ${[...new Set(bad)].join(', ')}`);
}

// ------------------------------------------------------------------ write
for (const p of pieces) {
  const out = join(HERE, p.file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, p.svg);
  console.log(`${p.file.padEnd(30)} ${String(p.W + 'x' + p.H).padEnd(10)} ${p.pal.padEnd(8)} empty ground ${p.empty}%  "${p.label}"`);
}

// ------------------------------------------------------------------ video: animated story title card
{
  const { titleCard } = await import(pathToFileURL(join(ROOT, 'templates/video/title-card.mjs')).href);
  const c = copy('story-title-card');
  const pal = PAL.night;
  const motion = json(join(ROOT, 'approaches/humanist-minimal/motion.json'));
  let svg = titleCard({
    palette: { ground: pal.ground, ink: pal.text, accent: pal.accent, paper: pal.paper },
    copy: { headline: c.headline, brand: 'XOOTEQ', cta: c.cta },
    fonts: { display: DISPLAY, body: BODY, displayWeight: 800 },
    motion,
    duration: 6000,
    aspect: [9, 16],
  });
  svg = svg.replace(/tc-/g, 'xq-tc-');
  // Load the pairing's fonts inside the file, so it renders the same wherever it is opened.
  svg = svg.replace(/(<svg[^>]*>)/, `$1\n<style>@import url("${FONT_URL}");</style>`);
  const out = join(HERE, 'video/story-title-card.svg');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, svg);
  pieces.push({ id: 'story-title-card', file: 'video/story-title-card.svg', W: 1080, H: 1920, svg, label: c.headline, video: true });
  console.log(`video/story-title-card.svg       1080x1920  night    animated title card, ends on a still`);
}

// ------------------------------------------------------------------ PNG previews, QA and contact sheet
if (process.argv.includes('--render')) {
  let chromium = null;
  try { const g = execSync('npm root -g').toString().trim(); chromium = createRequire(import.meta.url)(join(g, 'playwright')).chromium; } catch { chromium = null; }
  if (!chromium) { console.log('Playwright not found: skipped PNG previews.'); process.exit(0); }
  const exe = '/opt/pw-browsers/chromium';
  const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});
  const page = await browser.newPage();
  const PREV = join(HERE, 'previews');
  mkdirSync(PREV, { recursive: true });
  let problems = 0;
  for (const p of pieces) {
    await page.setViewportSize({ width: p.W, height: p.H });
    // Video: show the final frame (reduced motion) for the preview.
    if (p.video) await page.emulateMedia({ reducedMotion: 'reduce' }); else await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setContent(`<html><body style="margin:0">${p.svg}</body></html>`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(150);
    // QA: every text box inside the safe rectangle; no text over the art or over other text.
    const qa = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      const safe = (svg.dataset.safe || '').split(' ').map(Number);
      const texts = [...svg.querySelectorAll('text')].map((t) => { const b = t.getBBox(); return { s: t.textContent.slice(0, 30), x: b.x, y: b.y, w: b.width, h: b.height }; });
      const arts = [...svg.querySelectorAll('.xq-art')].map((g) => { const r = g.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
      const out = [];
      const ov = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;
      if (safe.length === 4) for (const t of texts) if (t.x < safe[0] - 1 || t.y < safe[1] - 1 || t.x + t.w > safe[2] + 1 || t.y + t.h > safe[3] + 1) out.push(`outside safe area: "${t.s}" [${Math.round(t.x)},${Math.round(t.y)},${Math.round(t.x + t.w)},${Math.round(t.y + t.h)}]`);
      texts.forEach((a, i) => texts.slice(i + 1).forEach((b) => { if (ov(a, b, -2)) out.push(`text overlaps text: "${a.s}" / "${b.s}"`); }));
      return { out, texts, arts };
    });
    // Text vs art: compare against the art's real painted pixels, not its box (sample the PNG).
    const png = await page.screenshot({ path: join(PREV, `${p.id}.png`) });
    if (qa.out.length) { problems += qa.out.length; console.log(`QA ${p.id}:\n  ${qa.out.join('\n  ')}`); }
    p.png = png;
  }
  // Contact sheet: every piece scaled into a grid on a neutral ground.
  const cell = (p) => { const s = Math.min(460 / p.W, 560 / p.H); return { w: Math.round(p.W * s), h: Math.round(p.H * s) }; };
  const items = pieces.map((p) => { const d = cell(p); return `<figure style="margin:0;display:flex;flex-direction:column;gap:10px;align-items:flex-start"><img src="data:image/png;base64,${p.png.toString('base64')}" width="${d.w}" height="${d.h}" style="display:block;box-shadow:0 1px 8px rgba(0,0,0,.18)"><figcaption style="font:600 15px Figtree,system-ui;color:#111314">${p.file}</figcaption></figure>`; }).join('');
  await page.setViewportSize({ width: 2000, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setContent(`<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@600;700&display=swap"></head><body style="margin:0;background:#ffffff;padding:48px;width:1904px"><h1 style="font:700 30px Figtree,system-ui;color:#111314;margin:0 0 32px">XOOTEQ, launch campaign (Humanist Minimal, Wada 207, Bricolage Grotesque + Figtree)</h1><div style="display:flex;flex-wrap:wrap;gap:40px 36px;align-items:flex-end">${items}</div></body></html>`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.screenshot({ path: join(HERE, 'contact-sheet.png'), fullPage: true });
  await browser.close();
  console.log(`PNG previews in previews/, contact-sheet.png written. QA problems: ${problems}`);
}
