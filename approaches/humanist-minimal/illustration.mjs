// UnDesigned illustration library: draws the Humanist Minimal ink-line and
// cut-paper style as SVG. Pure functions returning strings, so it runs in Node
// (to export SVG files) and in the browser (live in pages). Artboard: 400 x 400.
// Colours always come from the colour system: pass a palette of
// { ground, paper, ink, accent } hex values (ground and accent from a Wada
// combination, ink = Wada Black, paper = Wada White).
//
//   const ill = createIllustrator(approach, palette); // approach = source/approach.json
//   ill.scene({ motif: 'sun' });                      // full <svg> string, animated
//   ill.scene({ motif: 'eye', animate: false });      // still version
//   ill.scene({ motif: 'sun', palette: other });      // another palette
//   ill.inkLine([[40, 200], [360, 200]]);           // path data for a wobbly ink line
//   ill.cutPaper(200, 200, 80, 80);                 // path data for a faceted paper disc

export function createIllustrator(approach, defaultPalette) {
  const S = { ...approach.illustration, motion: approach.motion };
  let P = defaultPalette;
  const r1 = (n) => Math.round(n * 10) / 10;

  // Seeded random numbers, so the same seed always draws the same wobble.
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
  function wobblePoints(pts, { wobble = S.line.wobble, segment = S.line.segment, seed = 1, closed = false } = {}) {
    const rand = rng(seed);
    const src = closed ? [...pts, pts[0]] : pts;
    const out = [];
    for (let i = 0; i < src.length - 1; i++) {
      const [ax, ay] = src[i], [bx, by] = src[i + 1];
      const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / segment));
      for (let k = 0; k < n; k++) {
        const t = k / n;
        const keep = k === 0 && (i === 0 && !closed);
        const j = keep ? 0 : wobble;
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

  /** Points of an ellipse, for ink outlines of round things. */
  function ellipsePoints(cx, cy, rx, ry, n = 28, start = 0) {
    return Array.from({ length: n }, (_, i) => {
      const a = start + (i / n) * Math.PI * 2;
      return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
    });
  }

  /** Path data for a scissor-cut paper disc: straight facets, slightly irregular. */
  function cutPaper(cx, cy, rx, ry = rx, { facets = S.cutPaper.facets, jitter = S.cutPaper.jitter, seed = 2, rotation } = {}) {
    const rand = rng(seed);
    const rot = rotation ?? rand() * Math.PI;
    const pts = Array.from({ length: facets }, (_, i) => {
      const a = rot + (i / facets) * Math.PI * 2 + (rand() - 0.5) * (Math.PI / facets) * 0.6;
      const k = 1 + (rand() - 0.5) * 2 * jitter;
      return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
    });
    return polygon(pts);
  }

  /** Path data for any cut-paper polygon (straight edges), with optional jitter. */
  function cutPaperPolygon(pts, { jitter = 4, seed = 3 } = {}) {
    const rand = rng(seed);
    return polygon(pts.map(([x, y]) => [x + (rand() - 0.5) * 2 * jitter, y + (rand() - 0.5) * 2 * jitter]));
  }
  const polygon = (pts) => 'M' + pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L') + 'Z';

  // ------------------------------------------------------------ motifs
  // Each returns { body, css } in 400 x 400 units. Classes: ud-draw (line draws on),
  // ud-pop (shape pops in), plus motif-specific loops.

  const ink = () => P.ink;
  const paper = () => P.paper;
  const accent = () => P.accent;
  const lw = S.line.width;
  const stroke = (cls = 'ud-draw', w = lw, extra = '') => `class="${cls}" fill="none" stroke="${ink()}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" pathLength="1"${extra}`;
  const delay = (ms) => ` style="animation-delay:${ms}ms"`;

  const motifs = {
    // Sun: paper disc with ink rays that grow from dots and travel outward (motion-sun-rays).
    sun({ seed = 7 } = {}) {
      const rays = 24;
      let body = `<path class="ud-pop" fill="${paper()}" d="${cutPaper(200, 200, 66, 66, { facets: 11, seed })}"/>`;
      body += '<g class="ud-rays">';
      for (let i = 0; i < rays; i++) {
        const a = (i / rays) * Math.PI * 2 + 0.06;
        const p0 = [200 + Math.cos(a) * 88, 200 + Math.sin(a) * 88];
        const p1 = [200 + Math.cos(a) * 196, 200 + Math.sin(a) * 196];
        body += `<path ${stroke('ud-ray', lw * 0.85)} d="${inkLine([p0, p1], { seed: seed + i, wobble: 1.1, segment: 30 })}"/>`;
      }
      body += '</g>';
      return { body, loops: ['radiate'] };
    },

    // Sound bubble: cut-paper speech bubble with a hand-drawn sound wave (still-sound-bubble).
    'sound-bubble'({ seed = 11 } = {}) {
      const bubble = [[118, 120], [196, 76], [292, 84], [338, 150], [340, 236], [300, 290], [318, 330], [262, 298], [180, 302], [100, 270], [74, 196]];
      const pts = [[92, 210], [120, 210]];
      for (let x = 122; x <= 290; x += 2.2) {
        const t = (x - 206) / 62;
        const amp = 70 * Math.exp(-t * t) + 8;
        pts.push([x, 206 - Math.sin((x - 122) / 7.2) * amp]);
      }
      pts.push([300, 212], [326, 212]);
      let body = `<path class="ud-pop" fill="${paper()}" d="${cutPaperPolygon(bubble, { jitter: 3, seed })}"/>`;
      body += `<g class="ud-talk"><path ${stroke('ud-draw', lw)}${delay(220)} d="${inkLine(pts, { seed, wobble: 0.8, segment: 3 })}"/></g>`;
      return { body, loops: ['talk'] };
    },

    // Eye: paper disc, ink outline and a blinking eye, with a halftone beam (motion-eye-telescope).
    eye({ seed = 5, uid = 'e' } = {}) {
      const cx = 140, cy = 200;
      let body = `<defs>
        <pattern id="ud-ht-${uid}" width="${S.halftone.cell}" height="${S.halftone.cell}" patternUnits="userSpaceOnUse"><circle cx="${S.halftone.cell / 2}" cy="${S.halftone.cell / 2}" r="${S.halftone.dot}" fill="${ink()}"/></pattern>
        <linearGradient id="ud-fade-${uid}" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity=".25"/></linearGradient>
        <mask id="ud-mask-${uid}"><rect width="400" height="400" fill="url(#ud-fade-${uid})"/></mask>
      </defs>`;
      body += `<path class="ud-pop" fill="url(#ud-ht-${uid})" mask="url(#ud-mask-${uid})" d="${cutPaperPolygon([[cx + 20, cy - 66], [330, cy - 14], [330, cy + 14], [cx + 20, cy + 66]], { jitter: 2, seed })}"${delay(260)}/>`;
      body += `<path class="ud-pop" fill="${paper()}" d="${cutPaper(cx, cy, 70, 70, { facets: 13, jitter: 0.03, seed })}"/>`;
      body += `<path ${stroke()} d="${inkLine(ellipsePoints(cx, cy, 70, 70, 26, -1.2), { seed, closed: true, wobble: 1 })}"/>`;
      body += `<path class="ud-pop" fill="${paper()}" stroke="${ink()}" stroke-width="${lw * 0.8}" d="${cutPaper(338, cy, 11, 11, { facets: 8, jitter: 0.04, seed: seed + 3 })}"${delay(300)}/>`;
      const lid = [[cx - 42, cy], [cx - 20, cy - 19], [cx + 20, cy - 19], [cx + 42, cy], [cx + 20, cy + 19], [cx - 20, cy + 19]];
      body += `<g class="ud-blink"><path ${stroke('ud-draw', lw * 0.85)}${delay(240)} d="${inkLine(lid, { seed: seed + 1, closed: true, wobble: 0.6, segment: 9 })}"/>`;
      body += `<path class="ud-pop" fill="${ink()}" d="${cutPaper(cx, cy, 15, 15, { facets: 9, seed: seed + 2 })}"${delay(420)}/></g>`;
      return { body, loops: ['blink'] };
    },

    // Apple on a book: learning. The one accent-coloured object (motion-apple-book).
    'apple-book'({ seed = 17 } = {}) {
      const apple = [[200, 150], [226, 132], [258, 138], [276, 166], [274, 206], [258, 238], [236, 252], [214, 246], [200, 236], [186, 246], [164, 252], [142, 238], [126, 206], [124, 166], [142, 138], [174, 132]];
      let body = `<path class="ud-pop" fill="${accent()}" d="${cutPaperPolygon(apple, { jitter: 2.5, seed })}"/>`;
      body += `<path ${stroke()}${delay(260)} d="${inkLine([[186, 92], [196, 112], [204, 148]], { seed: seed + 1, wobble: 0.8, segment: 10 })}"/>`;
      body += `<path class="ud-pop" fill="${paper()}" stroke="${ink()}" stroke-width="${lw * 0.8}" stroke-linejoin="round"${delay(340)} d="${cutPaperPolygon([[206, 140], [222, 108], [252, 94], [244, 124]], { jitter: 1.5, seed: seed + 2 })}"/>`;
      const y = 262;
      body += `<path ${stroke()}${delay(120)} d="${inkLine([[300, y], [138, y], [116, y + 10], [106, y + 30], [116, y + 50], [138, y + 58], [300, y + 58]], { seed: seed + 3, wobble: 1, segment: 12 })}"/>`;
      body += `<path ${stroke()}${delay(200)} d="${inkLine([[300, y - 6], [300, y + 64]], { seed: seed + 4 })}"/>`;
      body += `<path ${stroke('ud-draw', lw * 0.7)}${delay(280)} d="${inkLine([[150, y + 22], [262, y + 22]], { seed: seed + 5 })}"/>`;
      body += `<path ${stroke('ud-draw', lw * 0.7)}${delay(320)} d="${inkLine([[150, y + 38], [244, y + 38]], { seed: seed + 6 })}"/>`;
      return { body, loops: [] };
    },

    // Molecule on a column: science with classical roots (still-molecule-column).
    'molecule-column'({ seed = 13 } = {}) {
      const c = [200, 150];
      const arms = [[-1.05, 82], [-2.1, 80], [-0.25, 74], [2.6, 76], [1.15, 86], [1.95, 84]];
      let body = `<path class="ud-pop" fill="${paper()}" d="${cutPaper(c[0], c[1], 24, 24, { facets: 10, seed })}"/>`;
      arms.forEach(([a, len], i) => {
        const end = [c[0] + Math.cos(a) * len, c[1] + Math.sin(a) * len];
        body += `<path class="ud-draw" fill="none" stroke="${paper()}" stroke-width="${lw * 0.9}" stroke-linecap="round" pathLength="1"${delay(120 + i * S.motion.stagger)} d="${inkLine([c, end], { seed: seed + i, wobble: 1.6, segment: 18 })}"/>`;
        body += `<path class="ud-pop" fill="${paper()}"${delay(380 + i * S.motion.stagger)} d="${cutPaper(end[0], end[1], 14, 13, { facets: 9, seed: seed + 20 + i })}"/>`;
      });
      const top = 236;
      body += `<path ${stroke()}${delay(200)} d="${inkLine([[118, top], [282, top]], { seed: seed + 30 })}"/>`;
      body += `<path ${stroke()}${delay(260)} d="${inkLine([[122, top + 2], [104, top + 22], [108, top + 44], [128, top + 52], [146, top + 42], [142, top + 24], [126, top + 24], [124, top + 36]], { seed: seed + 31, wobble: 0.9, segment: 8 })}"/>`;
      body += `<path ${stroke()}${delay(260)} d="${inkLine([[278, top + 2], [296, top + 22], [292, top + 44], [272, top + 52], [254, top + 42], [258, top + 24], [274, top + 24], [276, top + 36]], { seed: seed + 32, wobble: 0.9, segment: 8 })}"/>`;
      body += `<path ${stroke()}${delay(320)} d="${inkLine([[146, top + 30], [254, top + 30]], { seed: seed + 33 })}"/>`;
      [124, 162, 200, 238, 276].forEach((x, i) => {
        body += `<path ${stroke()}${delay(380 + i * S.motion.stagger)} d="${inkLine([[x, top + (i % 4 === 0 ? 62 : 52)], [x, top + 108]], { seed: seed + 40 + i, segment: 18 })}"/>`;
      });
      return { body, loops: [] };
    },
  };

  // ------------------------------------------------------------ animation CSS
  function css(loops, uid) {
    const M = S.motion;
    const sel = `.ud-ill-${uid}`;
    let c = `
${sel} .ud-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:ud-draw-${uid} ${M.draw.duration}ms ${M.draw.easing} both}
${sel} .ud-pop{transform-box:fill-box;transform-origin:center;animation:ud-pop-${uid} ${M.pop.duration}ms ${M.pop.easing} both}
@keyframes ud-draw-${uid}{to{stroke-dashoffset:0}}
@keyframes ud-pop-${uid}{from{transform:scale(0)}to{transform:scale(1)}}`;
    if (loops.includes('radiate')) {
      c += `
${sel} .ud-ray{animation:ud-radiate-${uid} ${M.radiate.duration}ms ${M.radiate.easing} 200ms infinite both}
@keyframes ud-radiate-${uid}{0%{stroke-dasharray:.001 1;stroke-dashoffset:0}55%{stroke-dasharray:.42 1;stroke-dashoffset:-.08}85%{stroke-dasharray:.5 1;stroke-dashoffset:-.5}100%{stroke-dasharray:.001 1;stroke-dashoffset:-1}}`;
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
${sel} .ud-talk{transform-box:fill-box;transform-origin:center;animation:ud-talk-${uid} ${M.talk.duration}ms ${M.talk.easing} ${M.draw.duration + 300}ms infinite alternate}
@keyframes ud-talk-${uid}{from{transform:scaleY(1)}to{transform:scaleY(.72)}}`;
    }
    c += `
@media (prefers-reduced-motion:reduce){${sel} *{animation:none!important}${sel} .ud-draw{stroke-dashoffset:0}}`;
    return c;
  }

  /** Full SVG for a motif. palette: { ground, paper, ink, accent } (defaults to the one given at creation). */
  function scene({ motif = 'sun', palette, animate = true, size, seed, uid, title } = {}) {
    const make = motifs[motif];
    if (!make) throw new Error(`Unknown motif "${motif}". Available: ${Object.keys(motifs).join(', ')}`);
    const id = uid || `${motif.replace(/[^a-z]/g, '')}${Math.floor(Math.random() * 1e6)}`;
    const keep = P;
    P = { ...P, ...(palette || {}) };
    const fill = P.ground;
    const { body, loops } = make({ ...(seed ? { seed } : {}), uid: id });
    P = keep;
    const dims = size ? ` width="${size}" height="${size}"` : '';
    const label = title || `${motif.replace(/-/g, ' ')} illustration`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"${dims} class="ud-ill ud-ill-${id}" role="img" aria-label="${label}">` +
      (animate ? `<style>${css(loops, id)}</style>` : '') +
      `<rect width="400" height="400" fill="${fill}"/>${body}</svg>`;
  }

  return { scene, motifs: Object.keys(motifs), inkLine, cutPaper, cutPaperPolygon, ellipsePoints, rng };
}
