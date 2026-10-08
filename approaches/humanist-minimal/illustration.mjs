// Humanist Minimal drawing engine: ink line over organic, rounded paper shapes,
// with fluid (spring) motion. Pure functions returning SVG strings, so it runs in
// Node (to export files) and in the browser (live in pages). Artboard: 400 x 400.
// Colours always come from the colour system: a palette of { ground, paper, ink, accent }
// (ground and accent from a Wada combination, ink = Wada Black, paper = Wada White).
//
//   const ill = createIllustrator(approach, palette);  // approach = { art, motion } from art.json / motion.json
//   ill.scene({ motif: 'sun' });                       // animated SVG string
//   ill.scene({ motif: 'eye', animate: false });       // still
//   ill.blob(200, 200, 80, { seed: 3 });               // organic paper shape (path data)
//   ill.roundedPolygon([[x, y], ...], 12);             // rounded-corner shape (path data)
//   ill.inkLine([[40, 200], [360, 200]]);              // wobbly ink line (path data)
//   springEasing({ stiffness: 200, damping: 17 });     // { easing: 'linear(...)', duration }

/** Simulates a damped spring from 0 to 1 and returns a CSS linear() easing and its duration (ms). */
export function springEasing({ stiffness = 170, damping = 26, mass = 1 } = {}, samples = 48) {
  const dt = 1 / 600;
  let x = 0, v = 0, t = 0;
  const pts = [];
  // Run until settled (position within 0.1% and nearly still), max 3 s.
  while (t < 3) {
    const a = (-stiffness * (x - 1) - damping * v) / mass;
    v += a * dt;
    x += v * dt;
    t += dt;
    pts.push([t, x]);
    if (Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.01) break;
  }
  const duration = Math.round(t * 1000);
  const step = Math.max(1, Math.floor(pts.length / samples));
  const values = [0];
  for (let i = step; i < pts.length; i += step) values.push(Math.round(pts[i][1] * 1000) / 1000);
  values.push(1);
  return { easing: `linear(${values.join(', ')})`, duration };
}

export function createIllustrator(approach, defaultPalette) {
  const ART = approach.art;
  const MOTION = approach.motion;
  const L = ART.line;
  let P = defaultPalette;
  const r1 = (n) => Math.round(n * 10) / 10;

  // Seeded random numbers, so the same seed always draws the same shape.
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Smooth curve through points (Catmull-Rom converted to cubic Bezier).
  function smooth(pts, closed) {
    if (pts.length < 2) return '';
    const p = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
    let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
    for (let i = 1; i < p.length - 2; i++) {
      const [x0, y0] = p[i - 1], [x1, y1] = p[i], [x2, y2] = p[i + 1], [x3, y3] = p[i + 2];
      d += `C${r1(x1 + (x2 - x0) / 6)} ${r1(y1 + (y2 - y0) / 6)} ${r1(x2 - (x3 - x1) / 6)} ${r1(y2 - (y3 - y1) / 6)} ${r1(x2)} ${r1(y2)}`;
    }
    return closed ? d + 'Z' : d;
  }

  // Resample a polyline into short segments and nudge each point: the hand-drawn wobble.
  function wobblePoints(pts, { wobble = L.wobble, segment = L.segment, seed = 1, closed = false } = {}) {
    const rand = rng(seed);
    const src = closed ? [...pts, pts[0]] : pts;
    const out = [];
    for (let i = 0; i < src.length - 1; i++) {
      const [ax, ay] = src[i], [bx, by] = src[i + 1];
      const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / segment));
      for (let k = 0; k < n; k++) {
        const t = k / n;
        const j = k === 0 && i === 0 && !closed ? 0 : wobble;
        out.push([ax + (bx - ax) * t + (rand() - 0.5) * 2 * j, ay + (by - ay) * t + (rand() - 0.5) * 2 * j]);
      }
    }
    if (!closed) out.push(src[src.length - 1]);
    return out;
  }

  /** Path data for an ink line through points. */
  function inkLine(pts, opts = {}) {
    return smooth(wobblePoints(pts, opts), !!opts.closed);
  }

  /** Points around an ellipse, for ink outlines of round things. */
  function ellipsePoints(cx, cy, rx, ry, n = 28, start = 0) {
    return Array.from({ length: n }, (_, i) => {
      const a = start + (i / n) * Math.PI * 2;
      return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
    });
  }

  /** Control points of an organic shape (shared by blob() and morphs). */
  function blobPoints(cx, cy, rx, ry = rx, { points = 7, irregularity = ART.shape.blob.irregularity.paperDisc[1], seed = 2, rotation } = {}) {
    const rand = rng(seed);
    const rot = rotation ?? rand() * Math.PI * 2;
    return Array.from({ length: points }, (_, i) => {
      const a = rot + (i / points) * Math.PI * 2 + (rand() - 0.5) * (Math.PI / points) * 0.5;
      const k = 1 + (rand() - 0.5) * 2 * irregularity;
      return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
    });
  }

  /** Path data for an organic paper shape: smooth, slightly irregular, clear silhouette. */
  function blob(cx, cy, rx, ry = rx, opts = {}) {
    return smooth(blobPoints(cx, cy, rx, ry, opts), true);
  }

  /** Path data for a polygon with rounded corners. radius: number, or one per corner (0 keeps a natural point). */
  function roundedPolygon(pts, radius = 10) {
    const n = pts.length;
    let d = '';
    for (let i = 0; i < n; i++) {
      const prev = pts[(i - 1 + n) % n], cur = pts[i], next = pts[(i + 1) % n];
      const r = Array.isArray(radius) ? radius[i] : radius;
      const lp = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
      const ln = Math.hypot(next[0] - cur[0], next[1] - cur[1]);
      const rr = Math.min(r, lp / 2, ln / 2);
      const a = [cur[0] + ((prev[0] - cur[0]) / lp) * rr, cur[1] + ((prev[1] - cur[1]) / lp) * rr];
      const b = [cur[0] + ((next[0] - cur[0]) / ln) * rr, cur[1] + ((next[1] - cur[1]) / ln) * rr];
      d += `${i === 0 ? 'M' : 'L'}${r1(a[0])} ${r1(a[1])}Q${r1(cur[0])} ${r1(cur[1])} ${r1(b[0])} ${r1(b[1])}`;
    }
    return d + 'Z';
  }

  /** Rounded polygon with a little hand-cut irregularity. */
  function paperPolygon(pts, { jitter = 3, radius = 12, seed = 3 } = {}) {
    const rand = rng(seed);
    return roundedPolygon(pts.map(([x, y]) => [x + (rand() - 0.5) * 2 * jitter, y + (rand() - 0.5) * 2 * jitter]), radius);
  }

  // Back-compatible names from the first version.
  const cutPaper = (cx, cy, rx, ry = rx, opts = {}) => blob(cx, cy, rx, ry, opts);
  const cutPaperPolygon = paperPolygon;

  // ------------------------------------------------------------ motion helpers
  const springs = Object.fromEntries(Object.entries(MOTION.springs).map(([k, s]) => [k, springEasing(s)]));
  const ease = (name) => (MOTION.easings[name] ? MOTION.easings[name].css : name);
  let animate = true;

  /** SMIL morph between organic shapes with the same number of points (fluid, looping). */
  function morph(cx, cy, rx, ry, opts, seeds) {
    if (!animate) return '';
    const m = MOTION.moves.morph;
    const vals = [...seeds, seeds[0]].map((s) => blob(cx, cy, rx, ry, { ...opts, seed: s }));
    const n = vals.length - 1;
    const spline = '0.37 0 0.63 1';
    return `<animate attributeName="d" dur="${m.duration}ms" repeatCount="indefinite" calcMode="spline" values="${vals.join(';')}" keyTimes="${vals.map((_, i) => r1(i / n)).join(';')}" keySplines="${Array(n).fill(spline).join(';')}"/>`;
  }

  // ------------------------------------------------------------ motifs
  const ink = () => P.ink;
  const paper = () => P.paper;
  const accent = () => P.accent;
  const lw = L.width;
  const stroke = (cls = 'ud-draw', w = lw, extra = '') => `class="${cls}" fill="none" stroke="${ink()}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" pathLength="1"${extra}`;
  const delay = (ms) => ` style="animation-delay:${ms}ms"`;
  const stagger = MOTION.choreography.stagger;

  const motifs = {
    // Sun: organic paper disc, ink rays growing from dots and travelling outward (motion-sun-rays).
    sun({ seed = 7 } = {}) {
      const rays = 22;
      const shape = { points: 8, irregularity: 0.07, seed };
      let body = `<g class="ud-breathe"><path class="ud-pop" fill="${paper()}" d="${blob(200, 200, 66, 66, shape)}">${morph(200, 200, 66, 66, shape, [seed, seed + 11, seed + 23])}</path></g>`;
      body += '<g class="ud-rays">';
      for (let i = 0; i < rays; i++) {
        const a = (i / rays) * Math.PI * 2 + 0.06;
        const p0 = [200 + Math.cos(a) * 90, 200 + Math.sin(a) * 90];
        const p1 = [200 + Math.cos(a) * 196, 200 + Math.sin(a) * 196];
        body += `<path ${stroke('ud-ray', lw * 0.85)} d="${inkLine([p0, p1], { seed: seed + i, wobble: 1.1, segment: 30 })}"/>`;
      }
      body += '</g>';
      return { body, loops: ['radiate', 'breathe'] };
    },

    // Sound bubble: rounded paper speech bubble with a hand-drawn sound wave (still-sound-bubble).
    'sound-bubble'({ seed = 11 } = {}) {
      const bubble = [[110, 118], [196, 74], [296, 86], [340, 152], [338, 238], [298, 288], [322, 334], [258, 298], [178, 302], [98, 268], [72, 192]];
      const radius = [26, 40, 40, 30, 30, 22, 2, 14, 30, 34, 30];
      const pts = [[92, 210], [120, 210]];
      for (let x = 122; x <= 290; x += 2.2) {
        const t = (x - 206) / 62;
        const amp = 70 * Math.exp(-t * t) + 8;
        pts.push([x, 206 - Math.sin((x - 122) / 7.2) * amp]);
      }
      pts.push([300, 212], [326, 212]);
      let body = `<path class="ud-pop" fill="${paper()}" d="${(() => { const r = rng(seed); return roundedPolygon(bubble.map(([x, y]) => [x + (r() - 0.5) * 5, y + (r() - 0.5) * 5]), radius); })()}"/>`;
      body += `<g class="ud-talk"><path ${stroke('ud-draw', lw)}${delay(220)} d="${inkLine(pts, { seed, wobble: 0.8, segment: 3 })}"/></g>`;
      return { body, loops: ['talk'] };
    },

    // Eye: organic paper disc, ink outline, a blinking eye and a halftone beam (motion-eye-telescope).
    eye({ seed = 5, uid = 'e' } = {}) {
      const cx = 140, cy = 200;
      const H = ART.texture.halftone;
      let body = `<defs>
        <pattern id="ud-ht-${uid}" width="${H.cell}" height="${H.cell}" patternUnits="userSpaceOnUse"><circle cx="${H.cell / 2}" cy="${H.cell / 2}" r="${H.dot}" fill="${ink()}"/></pattern>
        <linearGradient id="ud-fade-${uid}" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity=".25"/></linearGradient>
        <mask id="ud-mask-${uid}"><rect width="400" height="400" fill="url(#ud-fade-${uid})"/></mask>
      </defs>`;
      body += `<path class="ud-pop" fill="url(#ud-ht-${uid})" mask="url(#ud-mask-${uid})" d="${paperPolygon([[cx + 20, cy - 66], [330, cy - 14], [330, cy + 14], [cx + 20, cy + 66]], { jitter: 2, radius: [4, 10, 10, 4], seed })}"${delay(260)}/>`;
      body += `<path class="ud-pop" fill="${paper()}" d="${blob(cx, cy, 72, 72, { points: 9, irregularity: 0.04, seed })}"/>`;
      body += `<path ${stroke()} d="${inkLine(ellipsePoints(cx, cy, 70, 70, 26, -1.2), { seed, closed: true, wobble: 1 })}"/>`;
      body += `<path class="ud-pop" fill="${paper()}" stroke="${ink()}" stroke-width="${lw * 0.8}" d="${blob(338, cy, 11, 11, { points: 6, irregularity: 0.06, seed: seed + 3 })}"${delay(300)}/>`;
      const lid = [[cx - 42, cy], [cx - 20, cy - 19], [cx + 20, cy - 19], [cx + 42, cy], [cx + 20, cy + 19], [cx - 20, cy + 19]];
      body += `<g class="ud-blink"><path ${stroke('ud-draw', lw * 0.85)}${delay(240)} d="${inkLine(lid, { seed: seed + 1, closed: true, wobble: 0.6, segment: 9 })}"/>`;
      body += `<path class="ud-pop" fill="${ink()}" d="${blob(cx, cy, 15, 15, { points: 7, irregularity: 0.05, seed: seed + 2 })}"${delay(420)}/></g>`;
      return { body, loops: ['blink'] };
    },

    // Apple on a book: learning. The one accent-coloured object (motion-apple-book).
    'apple-book'({ seed = 17 } = {}) {
      const apple = [[200, 152], [232, 132], [266, 142], [280, 176], [270, 222], [246, 250], [218, 250], [200, 240], [182, 250], [154, 250], [130, 222], [120, 176], [134, 142], [168, 132]];
      let body = `<g class="ud-float"><path class="ud-pop" fill="${accent()}" d="${paperPolygon(apple, { jitter: 2, radius: 18, seed })}"/>`;
      body += `<path ${stroke()}${delay(260)} d="${inkLine([[186, 94], [196, 114], [202, 148]], { seed: seed + 1, wobble: 0.8, segment: 10 })}"/>`;
      body += `<path class="ud-pop" fill="${paper()}" stroke="${ink()}" stroke-width="${lw * 0.8}" stroke-linejoin="round"${delay(340)} d="${roundedPolygon([[206, 140], [220, 110], [252, 94], [246, 124]], [6, 10, 2, 10])}"/></g>`;
      const y = 266;
      body += `<path ${stroke()}${delay(120)} d="${inkLine([[300, y], [138, y], [114, y + 10], [104, y + 30], [114, y + 50], [138, y + 58], [300, y + 58]], { seed: seed + 3, wobble: 1, segment: 12 })}"/>`;
      body += `<path ${stroke()}${delay(200)} d="${inkLine([[300, y - 6], [300, y + 64]], { seed: seed + 4 })}"/>`;
      body += `<path ${stroke('ud-draw', lw * 0.7)}${delay(280)} d="${inkLine([[150, y + 22], [262, y + 22]], { seed: seed + 5 })}"/>`;
      body += `<path ${stroke('ud-draw', lw * 0.7)}${delay(320)} d="${inkLine([[150, y + 38], [244, y + 38]], { seed: seed + 6 })}"/>`;
      return { body, loops: ['float'] };
    },

    // Molecule on a column: science with classical roots (still-molecule-column).
    'molecule-column'({ seed = 13 } = {}) {
      const c = [200, 150];
      const arms = [[-1.05, 82], [-2.1, 80], [-0.25, 74], [2.6, 76], [1.15, 86], [1.95, 84]];
      let body = `<g class="ud-float">`;
      const core = { points: 7, irregularity: 0.08, seed };
      body += `<path class="ud-pop" fill="${paper()}" d="${blob(c[0], c[1], 25, 25, core)}">${morph(c[0], c[1], 25, 25, core, [seed, seed + 5, seed + 9])}</path>`;
      arms.forEach(([a, len], i) => {
        const end = [c[0] + Math.cos(a) * len, c[1] + Math.sin(a) * len];
        body += `<path class="ud-draw" fill="none" stroke="${paper()}" stroke-width="${lw * 0.9}" stroke-linecap="round" pathLength="1"${delay(120 + i * stagger)} d="${inkLine([c, end], { seed: seed + i, wobble: 1.6, segment: 18 })}"/>`;
        body += `<path class="ud-pop" fill="${paper()}"${delay(380 + i * stagger)} d="${blob(end[0], end[1], 14, 13, { points: 6, irregularity: 0.1, seed: seed + 20 + i })}"/>`;
      });
      body += '</g>';
      const top = 236;
      body += `<path ${stroke()}${delay(200)} d="${inkLine([[118, top], [282, top]], { seed: seed + 30 })}"/>`;
      body += `<path ${stroke()}${delay(260)} d="${inkLine([[122, top + 2], [104, top + 22], [108, top + 44], [128, top + 52], [146, top + 42], [142, top + 24], [126, top + 24], [124, top + 36]], { seed: seed + 31, wobble: 0.9, segment: 8 })}"/>`;
      body += `<path ${stroke()}${delay(260)} d="${inkLine([[278, top + 2], [296, top + 22], [292, top + 44], [272, top + 52], [254, top + 42], [258, top + 24], [274, top + 24], [276, top + 36]], { seed: seed + 32, wobble: 0.9, segment: 8 })}"/>`;
      body += `<path ${stroke()}${delay(320)} d="${inkLine([[146, top + 30], [254, top + 30]], { seed: seed + 33 })}"/>`;
      [124, 162, 200, 238, 276].forEach((x, i) => {
        body += `<path ${stroke()}${delay(380 + i * stagger)} d="${inkLine([[x, top + (i % 4 === 0 ? 62 : 52)], [x, top + 108]], { seed: seed + 40 + i, segment: 18 })}"/>`;
      });
      return { body, loops: ['float'] };
    },

    // Organic shapes: three soft paper forms slowly changing outline (a pure shape study).
    'organic-shapes'({ seed = 21 } = {}) {
      const a = { points: 7, irregularity: 0.2, seed };
      const b = { points: 6, irregularity: 0.18, seed: seed + 40 };
      let body = `<path class="ud-pop" fill="${paper()}" d="${blob(170, 210, 110, 96, a)}">${morph(170, 210, 110, 96, a, [seed, seed + 3, seed + 8])}</path>`;
      body += `<path class="ud-pop" fill="${accent()}"${delay(140)} d="${blob(282, 132, 52, 48, b)}">${morph(282, 132, 52, 48, b, [seed + 40, seed + 44, seed + 47])}</path>`;
      body += `<path ${stroke()}${delay(260)} d="${inkLine([[92, 300], [150, 268], [214, 290], [270, 250], [326, 268]], { seed: seed + 2, wobble: 1.2, segment: 12 })}"/>`;
      body += `<path class="ud-pop" fill="${ink()}"${delay(520)} d="${blob(326, 268, 9, 9, { points: 6, irregularity: 0.05, seed: seed + 9 })}"/>`;
      return { body, loops: [] };
    },
  };

  // ------------------------------------------------------------ animation CSS
  function css(loops, uid) {
    const M = MOTION.moves;
    const pop = springs[M.pop.spring];
    const sel = `.ud-ill-${uid}`;
    let c = `
${sel} .ud-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:ud-draw-${uid} ${M.draw.duration}ms ${ease(M.draw.easing)} both}
${sel} .ud-pop{transform-box:fill-box;transform-origin:center;animation:ud-pop-${uid} ${pop.duration}ms ${pop.easing} both}
@keyframes ud-draw-${uid}{to{stroke-dashoffset:0}}
@keyframes ud-pop-${uid}{from{transform:scale(0)}to{transform:scale(1)}}`;
    if (loops.includes('radiate')) {
      c += `
${sel} .ud-ray{animation:ud-radiate-${uid} ${M.radiate.duration}ms ${ease(M.radiate.easing)} 200ms infinite both}
@keyframes ud-radiate-${uid}{0%{stroke-dasharray:.001 1;stroke-dashoffset:0}55%{stroke-dasharray:.42 1;stroke-dashoffset:-.08}85%{stroke-dasharray:.5 1;stroke-dashoffset:-.5}100%{stroke-dasharray:.001 1;stroke-dashoffset:-1}}`;
    }
    if (loops.includes('breathe')) {
      const b = M.breathe;
      c += `
${sel} .ud-breathe{transform-box:fill-box;transform-origin:center;animation:ud-breathe-${uid} ${b.duration}ms ${ease(b.easing)} ${pop.duration}ms infinite alternate}
@keyframes ud-breathe-${uid}{from{transform:scale(${b.scale[0]})}to{transform:scale(${b.scale[1]})}}`;
    }
    if (loops.includes('float')) {
      const f = M.float;
      c += `
${sel} .ud-float{animation:ud-float-${uid} ${f.duration}ms ${ease(f.easing)} ${pop.duration + 400}ms infinite alternate}
@keyframes ud-float-${uid}{from{transform:translateY(0)}to{transform:translateY(${-4 * f.distancePct}px)}}`;
    }
    if (loops.includes('blink')) {
      const cycle = M.blink.every;
      const a = ((cycle - M.blink.duration) / cycle) * 100;
      c += `
${sel} .ud-blink{transform-box:fill-box;transform-origin:center;animation:ud-blink-${uid} ${cycle}ms ${M.draw.duration + 400}ms infinite}
@keyframes ud-blink-${uid}{0%,${a.toFixed(1)}%,100%{transform:scaleY(1)}${(a + (100 - a) / 2).toFixed(1)}%{transform:scaleY(.08)}}`;
    }
    if (loops.includes('talk')) {
      c += `
${sel} .ud-talk{transform-box:fill-box;transform-origin:center;animation:ud-talk-${uid} ${M.talk.duration}ms ${ease(M.talk.easing)} ${M.draw.duration + 300}ms infinite alternate}
@keyframes ud-talk-${uid}{from{transform:scaleY(1)}to{transform:scaleY(.72)}}`;
    }
    c += `
@media (prefers-reduced-motion:reduce){${sel} *{animation:none!important}${sel} .ud-draw{stroke-dashoffset:0}}`;
    return c;
  }

  /** Full SVG for a motif. palette: { ground, paper, ink, accent } (defaults to the one given at creation). */
  function scene({ motif = 'sun', palette, animate: anim = true, size, seed, uid, title } = {}) {
    const make = motifs[motif];
    if (!make) throw new Error(`Unknown motif "${motif}". Available: ${Object.keys(motifs).join(', ')}`);
    const id = uid || `${motif.replace(/[^a-z]/g, '')}${Math.floor(Math.random() * 1e6)}`;
    const keepP = P;
    const keepA = animate;
    P = { ...P, ...(palette || {}) };
    // Shape morphs (SMIL) are skipped for stills and for people who prefer reduced motion.
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    animate = anim && !reduced;
    const fill = P.ground;
    const { body, loops } = make({ ...(seed ? { seed } : {}), uid: id });
    P = keepP;
    animate = keepA;
    const dims = size ? ` width="${size}" height="${size}"` : '';
    const label = title || `${motif.replace(/-/g, ' ')} illustration`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"${dims} class="ud-ill ud-ill-${id}" role="img" aria-label="${label}">` +
      (anim ? `<style>${css(loops, id)}</style>` : '') +
      `<rect width="400" height="400" fill="${fill}"/>${body}</svg>`;
  }

  return { scene, motifs: Object.keys(motifs), inkLine, blob, blobPoints, roundedPolygon, paperPolygon, cutPaper, cutPaperPolygon, ellipsePoints, springs, rng };
}
