// Animated title card: an SVG that plays a short sequence with CSS keyframes and ends on a
// still frame that works as a complete poster. Plain ESM, zero dependencies, Node 18+ or a browser.
//
//   import { titleCard, timeline } from './templates/video/title-card.mjs';
//   const svg = titleCard({
//     palette: { ground, ink, accent, paper },          // one Wada combination; text is ink, the CTA bar is accent (paper is accepted, unused)
//     copy: { headline, brand, cta },
//     fonts: { display: 'Young Serif', body: 'Onest' }, // the product's pairing
//     motion: { springs, moves },                       // optional: the style's motion.json (springs win)
//     duration: 6000, aspect: [9, 16], reducedMotion: false,
//   });
//
// Rules it follows (foundations/video/video.json and foundations/layout/media.json):
// - Opens on the empty ground; then one element moves at a time: headline, brand, call to action.
// - The headline holds for max(1.5 s, 0.375 s x words + 0.5 s) before the next element moves
//   (media.json -> video -> on-screen-time).
// - Ends on a still frame that is a complete poster: the un-animated state of every element IS the
//   final frame, so a player without CSS animation, a thumbnail or a screenshot shows the poster.
// - Never flashes: each element fades in once, the ground never changes, nothing loops.
// - prefers-reduced-motion (or reducedMotion: true) shows the final frame with no animation.
// - Text stays inside the safe area (layout.json -> safeAreas.story for 9:16; grid margins otherwise).

/** On-screen reading time, from foundations/layout/media.json -> video -> on-screen-time (rule of thumb). */
export const READING = { secondsPerWord: 0.375, findSeconds: 0.5, minSeconds: 1.5 };

/** Default timings (ms), rules of thumb from foundations/video/video.json -> motionGraphics. */
export const DEFAULTS = {
  openMs: 600, // empty ground before the first move
  holdMs: 1000, // minimum still hold after the last move
  minOpenMs: 300,
  fadeShare: 0.45, // opacity reaches 1 within this share of an arrival
  rise: 0.35, // rise distance in em of the element's own size
  spring: { stiffness: 120, damping: 20, mass: 1 }, // used only when no style spring is given
};

const ASPECTS = {
  '9:16': { w: 1080, h: 1920, safe: { top: 14, bottom: 35, left: 6, right: 6 }, textWidth: 1, ref: 'layout.json -> safeAreas.story' },
  '1:1': { w: 1080, h: 1080, safe: { top: 8, bottom: 8, left: 8, right: 8 }, textWidth: 1, ref: 'layout.json -> grids.social-feed (8% margin)' },
  '16:9': { w: 1920, h: 1080, safe: { top: 8, bottom: 8, left: 4.5, right: 4.5 }, textWidth: 0.62, ref: 'layout.json -> grids.wide-screen (8% of the short side); right side kept clear of the thumbnail duration stamp' },
};

const words = (s) => (String(s || '').trim() ? String(s).trim().split(/\s+/).length : 0);

/** Reading hold in ms for a text card of n words: max(1.5 s, 0.375 s x n + 0.5 s). */
export function readingMs(n) {
  return Math.round(1000 * Math.max(READING.minSeconds, READING.secondsPerWord * n + READING.findSeconds));
}

/** Simulates a damped spring from 0 to 1; returns a CSS linear() easing and its settle time (ms). */
export function springEasing({ stiffness = 170, damping = 26, mass = 1 } = {}, samples = 48) {
  const dt = 1 / 600;
  let x = 0, v = 0, t = 0;
  const pts = [];
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

/** Picks the style's text-arrival spring: moves.rise.spring, then 'gentle', 'settle', the first spring, then the default. */
function pickSpring(motion = {}) {
  const springs = motion.springs || {};
  const named = motion.moves && motion.moves.rise && motion.moves.rise.spring;
  const key = [named, 'gentle', 'settle', ...Object.keys(springs).filter((k) => k !== '$comment')].find((k) => k && springs[k] && springs[k].stiffness);
  return { name: key || 'default', ...(key ? springs[key] : DEFAULTS.spring) };
}

function aspectKey(aspect) {
  const [a, b] = aspect || [9, 16];
  const r = a / b;
  if (Math.abs(r - 9 / 16) < 0.02) return '9:16';
  if (Math.abs(r - 1) < 0.02) return '1:1';
  if (Math.abs(r - 16 / 9) < 0.02) return '16:9';
  throw new Error(`titleCard: aspect ${a}:${b} not supported; use [9,16], [1,1] or [16,9]`);
}

/**
 * Computes the beats. Each beat: { id, start, end } in ms. Moving beats also carry arriveEnd (spring
 * settled) and readUntil (when the reading hold ends). Only one element moves at a time.
 * Returns { duration, requested, minDuration, fits, spring, beats, warnings }.
 */
export function timeline({ copy = {}, motion = {}, duration = 6000, reducedMotion = false } = {}) {
  const spring = pickSpring(motion);
  const arrive = springEasing(spring).duration;
  const openMs = motion.openMs != null ? motion.openMs : DEFAULTS.openMs;
  const holdMs = motion.holdMs != null ? motion.holdMs : DEFAULTS.holdMs;
  const warnings = [];
  const n = { headline: words(copy.headline), brand: words(copy.brand), cta: words(copy.cta) };

  const plan = (open) => {
    const beats = [{ id: 'ground', role: 'open', start: 0, end: open }];
    let t = open;
    const add = (id) => {
      if (!n[id]) return null;
      const b = { id, role: 'arrive', start: t, arriveEnd: t + arrive, readUntil: t + readingMs(n[id]), words: n[id] };
      beats.push(b);
      return b;
    };
    const h = add('headline');
    // The next element moves only after the headline has arrived AND been read.
    if (h) t = Math.max(h.arriveEnd, h.readUntil);
    const br = add('brand');
    if (br) t = br.arriveEnd;
    const c = add('cta');
    if (c) t = c.arriveEnd;
    const moving = beats.filter((b) => b.role === 'arrive');
    // The still must hold until the last move has settled plus holdMs, and until brand and CTA are read.
    const stillStart = moving.length ? moving[moving.length - 1].arriveEnd : open;
    const need = Math.max(stillStart + holdMs, ...moving.filter((b) => b.id !== 'headline').map((b) => b.readUntil), open);
    return { beats, stillStart, need };
  };

  let p = plan(openMs);
  if (p.need > duration && openMs > DEFAULTS.minOpenMs) {
    p = plan(DEFAULTS.minOpenMs);
    warnings.push(`Opening hold shortened to ${DEFAULTS.minOpenMs} ms to fit ${duration} ms.`);
  }
  const minDuration = p.need;
  const total = Math.max(duration, minDuration);
  if (minDuration > duration) warnings.push(`Copy needs at least ${minDuration} ms with this spring (${spring.name}, ${arrive} ms per arrival); the card runs ${total} ms. Cut words or use a longer cut.`);
  if (n.headline > 8) warnings.push(`Headline has ${n.headline} words; formats.json allows 8 for a story or reel cover.`);
  if (n.cta > 4) warnings.push(`CTA has ${n.cta} words; formats.json allows 4 for a story.`);

  const beats = p.beats.map((b) => ({ ...b, end: b.role === 'arrive' ? b.arriveEnd : b.end }));
  beats.push({ id: 'still', role: 'hold', start: p.stillStart, end: total });
  if (reducedMotion) {
    return { duration: total, requested: duration, minDuration, fits: minDuration <= duration, spring: { ...spring, durationMs: arrive }, reducedMotion: true, beats: [{ id: 'still', role: 'hold', start: 0, end: total }], warnings };
  }
  return { duration: total, requested: duration, minDuration, fits: minDuration <= duration, spring: { ...spring, durationMs: arrive }, beats, warnings };
}

// ------------------------------------------------------------------ layout

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Greedy word wrap by an average glyph width (em). Conservative so text stays inside its box. */
function wrap(text, size, width, em = 0.56) {
  const max = Math.max(4, Math.floor(width / (size * em)));
  const lines = [];
  let line = '';
  for (const w of String(text).trim().split(/\s+/)) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > max && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Wraps, then narrows the measure while the line count stays the same, so lines are balanced (no lone last word). */
function balancedWrap(text, size, width, em = 0.56) {
  const base = wrap(text, size, width, em);
  if (base.length < 2) return base;
  let best = base;
  for (let w = width - size * em; w > width * 0.5; w -= size * em) {
    const next = wrap(text, size, w, em);
    if (next.length !== base.length) break;
    best = next;
  }
  return best;
}

function layout(copy, key) {
  const A = ASPECTS[key];
  const S = Math.min(A.w, A.h);
  const box = {
    x: (A.safe.left / 100) * A.w,
    y: (A.safe.top / 100) * A.h,
    w: ((100 - A.safe.left - A.safe.right) / 100) * A.w * A.textWidth,
    h: ((100 - A.safe.top - A.safe.bottom) / 100) * A.h,
  };
  // Three sizes per piece: headline, body (CTA), small (brand).
  const body = Math.round(S * 0.05);
  const small = Math.round(S * 0.04);
  const gapBrand = Math.round(S * 0.03);
  const gapCta = Math.round(S * 0.07);
  let size = Math.round(S * 0.12);
  let head;
  const blockH = (lines, s) => lines.length * s * 1.08;
  const rest = () => (copy.brand ? gapBrand + small * 1.2 : 0) + (copy.cta ? gapCta + body * 1.6 : 0);
  for (; size > body * 1.6; size -= 2) {
    head = balancedWrap(copy.headline || '', size, box.w, 0.56);
    if (head.length <= 4 && blockH(head, size) + rest() <= box.h) break;
  }
  const total = blockH(head, size) + rest();
  // Centre the group in the live area's height (stacked composition), left-aligned.
  let y = box.y + Math.max(0, (box.h - total) / 2);
  const out = { A, S, box, sizes: { headline: size, body, small } };
  out.headline = { x: box.x, y, lines: head, size, lead: size * 1.08 };
  y += blockH(head, size);
  if (copy.brand) {
    y += gapBrand;
    out.brand = { x: box.x, y, size: small };
    y += small * 1.2;
  }
  if (copy.cta) {
    y += gapCta;
    const ctaLines = wrap(copy.cta, body, box.w, 0.58);
    const ctaW = Math.min(box.w, Math.max(...ctaLines.map((l) => l.length)) * body * 0.56);
    out.cta = { x: box.x, y, size: body, lines: ctaLines, barW: ctaW };
  }
  return out;
}

// ------------------------------------------------------------------ render

/** Returns the animated SVG string. */
export function titleCard({ palette = {}, copy = {}, fonts = {}, motion = {}, duration = 6000, aspect = [9, 16], reducedMotion = false } = {}) {
  const P = { ground: '#ffffff', ink: '#000000', accent: '#000000', paper: '#ffffff', ...palette };
  const key = aspectKey(aspect);
  const L = layout(copy, key);
  const T = timeline({ copy, motion, duration, reducedMotion });
  const spring = springEasing(T.spring);
  const display = `'${fonts.display || 'sans-serif'}', sans-serif`;
  const bodyFont = `'${fonts.body || fonts.display || 'sans-serif'}', sans-serif`;
  // fonts: family names only ({ display, body }), plus optional displayWeight (a weight the display face has).
  const beat = (id) => T.beats.find((b) => b.id === id && b.role === 'arrive');

  const anim = (id, size) => {
    const b = beat(id);
    if (!b || reducedMotion) return '';
    const fade = Math.round(T.spring.durationMs * DEFAULTS.fadeShare);
    return `#tc-${id}{--rise:${(DEFAULTS.rise * size).toFixed(1)}px;animation:tc-fade ${fade}ms cubic-bezier(0.33,0,0.2,1) ${b.start}ms both,tc-rise ${T.spring.durationMs}ms ${spring.easing} ${b.start}ms both;}`;
  };

  const h = L.headline;
  const headline = `<g id="tc-headline" class="tc-el"><text font-family="${esc(display)}" font-size="${h.size}" font-weight="${fonts.displayWeight || 700}" fill="${P.ink}" letter-spacing="-0.01em">${h.lines
    .map((line, i) => `<tspan x="${h.x.toFixed(1)}" y="${(h.y + h.size * 0.92 + i * h.lead).toFixed(1)}">${esc(line)}</tspan>`)
    .join('')}</text></g>`;
  const brand = L.brand
    ? `<g id="tc-brand" class="tc-el"><text x="${L.brand.x.toFixed(1)}" y="${(L.brand.y + L.brand.size * 0.95).toFixed(1)}" font-family="${esc(bodyFont)}" font-size="${L.brand.size}" font-weight="700" fill="${P.ink}">${esc(copy.brand)}</text></g>`
    : '';
  let cta = '';
  if (L.cta) {
    const c = L.cta;
    const lineH = c.size * 1.25;
    const lastBase = c.y + c.size * 0.95 + (c.lines.length - 1) * lineH;
    const barH = Math.max(6, Math.round(c.size * 0.14));
    cta = `<g id="tc-cta" class="tc-el"><text font-family="${esc(bodyFont)}" font-size="${c.size}" font-weight="600" fill="${P.ink}">${c.lines
      .map((line, i) => `<tspan x="${c.x.toFixed(1)}" y="${(c.y + c.size * 0.95 + i * lineH).toFixed(1)}">${esc(line)}</tspan>`)
      .join('')}</text><rect x="${c.x.toFixed(1)}" y="${(lastBase + c.size * 0.28).toFixed(1)}" width="${c.barW.toFixed(1)}" height="${barH}" rx="${barH / 2}" fill="${P.accent}"/></g>`;
  }

  const label = [copy.headline, copy.brand, copy.cta].filter(Boolean).join('. ');
  const css = reducedMotion
    ? ''
    : `<style>
.tc-el{transform-box:view-box;}
${anim('headline', h.size)}
${L.brand ? anim('brand', L.brand.size) : ''}
${L.cta ? anim('cta', L.cta.size) : ''}
@keyframes tc-fade{from{opacity:0}to{opacity:1}}
@keyframes tc-rise{from{transform:translateY(var(--rise))}to{transform:none}}
@media (prefers-reduced-motion: reduce){.tc-el{animation:none !important;opacity:1 !important;transform:none !important;}}
</style>`;

  const meta = JSON.stringify({ aspect: key, duration: T.duration, beats: T.beats.map(({ id, start, end }) => ({ id, start, end })) });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L.A.w} ${L.A.h}" width="${L.A.w}" height="${L.A.h}" role="img" aria-labelledby="tc-title" data-timeline='${esc(meta)}'>
<title id="tc-title">${esc(label)}</title>
${css}
<rect id="tc-ground" width="${L.A.w}" height="${L.A.h}" fill="${P.ground}"/>
${headline}
${brand}
${cta}
</svg>`;
}

/** The safe-area box (in SVG units) for an aspect, so tests can check text bounds. */
export function safeBox(aspect = [9, 16]) {
  const A = ASPECTS[aspectKey(aspect)];
  return { x: (A.safe.left / 100) * A.w, y: (A.safe.top / 100) * A.h, x2: A.w - (A.safe.right / 100) * A.w, y2: A.h - (A.safe.bottom / 100) * A.h, width: A.w, height: A.h, ref: A.ref };
}
