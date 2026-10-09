// Motion films from a storyboard: one animated SVG timeline per aspect, then a frame-exact MP4.
//
//   npm run film -- <product> <campaign> [--mp4]
//
// Reads products/<id>/campaigns/<campaign>/film.json (see templates/video/film.example.json) and renders
// designs/<film id>-<w>x<h>.svg (plays in any browser and loops) and, with --mp4, .mp4 files.
// The rules come from the guide, not from the film:
// - Text cards hold for their reading time: max(1.5 s, 0.375 s x words + 0.5 s) (media.json -> video).
// - One mover at a time: art moves in a scene's "pre" window, then the text arrives, then everything holds.
// - Text arrives with the style's arrival easing (approaches/<style>/motion.json); text changes on a cut.
// - The brand is in from the first seconds (video.json -> structure -> brand) and on the end card.
// - The end card is the still that reduced motion, posters and thumbnails show (video.json -> end-still).
// - No flashes: cuts are opacity steps between dark grounds; nothing alternates faster than 3 per second.
// Colours: the product's palette (or the campaign's); type: its pairing; art: the product's art.mjs -> film.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { loadBrand } from '../../scripts/products.mjs';
import { loadTokens, esc, dataUri, fit, campaignType } from './engine.mjs';
import { ensureMetrics, textWidth } from './metrics.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const json = (f) => JSON.parse(readFileSync(f, 'utf8'));
const r1 = (n) => Math.round(n * 10) / 10;
const READ = (words) => Math.max(1500, 375 * words + 500);
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const ASPECTS = { '16:9': [1920, 1080], '9:16': [1080, 1920], '1:1': [1080, 1080], '4:5': [1080, 1350] };

/** Keyframes over the whole film: keys are [ms, 'css declarations', easing-for-the-segment-after]. */
export function animator(T, P) {
  let css = '';
  const pct = (ms) => `${Math.max(0, Math.min(100, (ms / T) * 100)).toFixed(3)}%`;
  return {
    css: () => css,
    add(id, keys, { ease = 'linear' } = {}) {
      const ks = [...keys].sort((a, b) => a[0] - b[0]);
      let k = `@keyframes ${P}${id}{0%{${ks[0][1]}}`;
      for (const [ms, decl, e] of ks) k += `${pct(ms)}{${decl};animation-timing-function:${e || ease}}`;
      k += `100%{${ks[ks.length - 1][1]}}}`;
      css += k + `.${P}${id}{animation:${P}${id} ${T}ms linear infinite}`;
      return `${P}${id}`;
    },
  };
}

function wipe(anim, id, t, ms, ease) {
  // A sign being revealed: a clip rect grows from the left (Commercial Modernism's lettering wipe).
  return anim.add(id, [[0, 'transform:scaleX(0)'], [t, 'transform:scaleX(0)', ease], [t + ms, 'transform:scaleX(1)']]);
}

export async function renderFilm(productId, campaign, { mp4 = false, log = console.log } = {}) {
  const brand = loadBrand(ROOT, productId);
  const tokens = loadTokens(brand);
  const dir = join(brand.dir, 'campaigns', campaign);
  const film = json(join(dir, 'film.json'));
  // A film may use a recipe from the library (foundations/combinations/recipes.json): its style, Wada
  // combination and pairing replace the product's own; the product keeps its name, marks and art.
  const recipe = film.recipe ? json(join(ROOT, 'foundations/combinations/recipes.json')).recipes.find((r) => r.id === film.recipe) : null;
  if (film.recipe && !recipe) throw new Error(`film.json: no recipe "${film.recipe}"`);
  if (recipe) tokens.typography = campaignType(tokens.typography, recipe.pairing, null);
  const style = recipe ? recipe.style : brand.config.approach;
  const motion = existsSync(join(ROOT, 'approaches', style, 'motion.json')) ? json(join(ROOT, 'approaches', style, 'motion.json')) : {};
  const arrive = motion.easings?.streamline?.css || motion.easings?.arrive?.css || 'cubic-bezier(0.22, 1, 0.36, 1)';
  const palDef = tokens.colors.brand.find((p) => p.name === (film.palette || 'primary')) || tokens.colors.brand[0];
  const hex = (id) => tokens.colorsById[id];
  const R = recipe ? tokens.colors.combinations.find((c) => c.id === recipe.combination).roles[recipe.mode] : palDef.roles;
  const pal = { ground: hex(R.bg), head: hex(R.ink), text: hex(R.text || R.ink), accent: hex(R.accent), support: (R.support || []).map(hex), black: hex('black'), white: hex('white') };
  const pair = tokens.typography.pairing;
  const display = { family: pair.display.family, weight: Math.max(...(pair.display.weights || [700])) };
  const bodyFace = { family: pair.body.family, weight: Math.max(...(pair.body.weights || [400])) };
  const mono = { family: pair.mono.family, weight: (pair.mono.weights || [400])[0] };
  await ensureMetrics([display, mono, { family: pair.body.family, weight: 400 }]);
  const identity = existsSync(join(brand.dir, 'identity.json')) ? json(join(brand.dir, 'identity.json')) : {};
  const markFile = (identity.marks?.files || []).find((f) => f.kind)?.file;
  const mark = markFile ? dataUri(join(brand.dir, markFile)) : null;
  const artFile = join(brand.dir, 'art.mjs');
  const art = existsSync(artFile) ? (await import(pathToFileURL(artFile).href)).default : {};
  const outDir = join(dir, 'designs');
  mkdirSync(outDir, { recursive: true });

  // 1. The timeline: each scene = pre (art moves) + text cards (arrive + reading hold each) + post.
  const TEXT_IN = 600;
  let t = 0;
  const scenes = film.scenes.map((s) => {
    const start = t;
    const cards = [];
    let c = start + (s.pre || 0);
    for (const line of [].concat(s.text || [])) { const hold = READ(words(line)); cards.push({ line, t0: c, t1: c + TEXT_IN + hold }); c += TEXT_IN + hold; }
    const end = Math.max(c, start + (s.min || 0)) + (s.post || 0);
    t = end;
    return { ...s, start, end, cards };
  });
  const endCard = film.end;
  const endWords = words(endCard.headline) + words(endCard.cta || '');
  const endStart = t, T = endStart + 900 + READ(endWords) + 1200;
  log(`  ${film.id}: ${(T / 1000).toFixed(1)} s, ${scenes.length} scenes + end card${recipe ? `, recipe ${recipe.id} (${style}, Wada ${recipe.combination} ${recipe.mode}, ${recipe.pairing})` : ''}`);

  const outputs = [];
  for (const aspect of film.aspects || ['16:9']) {
    const [W, H] = ASPECTS[aspect];
    const S = Math.min(W, H), wide = W > H;
    const P = `${brand.config.prefix}-${film.id}-${aspect.replace(':', 'x')}-`;
    const anim = animator(T, P);
    const ctx = { W, H, S, wide, P, T, pal, display, bodyFace, mono, esc, textWidth, anim, scenes, endStart, arrive, motion, film };
    let body = `<rect width="${W}" height="${H}" fill="${pal.ground}"/>`;

    // 2. The product's own art over the whole film (art.mjs -> film), behind the type.
    if (art.film) { const a = art.film(ctx); body += a; }

    // 3. Text cards: centred in the frame's calm band, accent word in the accent colour; cut in, cut out.
    const box = wide ? { x: W * 0.12, y: H * 0.62, w: W * 0.76, h: H * 0.26 } : { x: W * 0.08, y: H * 0.6, w: W * 0.84, h: H * 0.2 };
    let n = 0;
    for (const s of scenes) for (const card of s.cards) {
      const b = s.textBox ? { x: W * s.textBox[0], y: H * s.textBox[1], w: W * s.textBox[2], h: H * s.textBox[3] } : box;
      const ft = fit(card.line, b.w, b.h, display, { max: S * (s.big ? 0.16 : 0.085), min: 24, lead: 1.02, maxLines: 3 });
      const accent = new Set([].concat(s.accent || []).map((w) => w.toLowerCase()));
      const y0 = b.y + (b.h - ft.size * (1 + (ft.lines.length - 1) * 1.02)) / 2 + ft.size * 0.8;
      let tx = '';
      ft.lines.forEach((l, k) => {
        const spans = l.split(' ').map((w) => (accent.has(w.toLowerCase().replace(/[^a-z']/gi, '')) ? `<tspan fill="${pal.accent}">${esc(w)}</tspan>` : esc(w))).join(' ');
        tx += `<text x="${r1(W / 2)}" y="${r1(y0 + k * ft.size * 1.02)}" text-anchor="middle" font-family="'${esc(display.family)}', sans-serif" font-weight="${display.weight}" font-size="${r1(ft.size)}" letter-spacing="${r1(-0.02 * ft.size)}" fill="${pal.head}">${spans}</text>`;
      });
      const id = `c${n++}`;
      const show = anim.add(`${id}v`, [[0, 'opacity:0'], [card.t0, 'opacity:1', 'step-end'], [card.t1, 'opacity:0', 'step-end']].map(([a, b2, e]) => [a, b2, 'step-end']));
      const clip = `${P}${id}clip`;
      const wid = wipe(anim, `${id}w`, card.t0, TEXT_IN, arrive);
      body += `<defs><clipPath id="${clip}"><rect class="${wid}" style="transform-box:fill-box;transform-origin:left center" x="${r1(W / 2 - ft.width / 2 - ft.size * 0.3)}" y="${r1(y0 - ft.size)}" width="${r1(ft.width + ft.size * 0.6)}" height="${r1(ft.size * (ft.lines.length * 1.02 + 0.5))}"/></clipPath></defs>`;
      body += `<g class="${show}" opacity="0"><g clip-path="url(#${clip})">${tx}</g></g>`;
    }

    // 4. Brand bug: the mark and name, in from the first seconds until the end card (video.json -> brand early).
    const bugS = S * 0.04;
    const bugIn = film.brandIn ?? 1200;
    const bug = anim.add('bug', [[0, 'opacity:0'], [bugIn, 'opacity:0', 'ease-out'], [bugIn + 500, 'opacity:0.9', 'step-end'], [endStart, 'opacity:0']]);
    const bx = S * 0.06, by = S * 0.06;
    body += `<g class="${bug}" opacity="0">` + (mark ? `<image href="${mark}" x="${r1(bx)}" y="${r1(by)}" width="${r1(bugS)}" height="${r1(bugS)}"/>` : '') +
      `<text x="${r1(bx + (mark ? bugS * 1.25 : 0))}" y="${r1(by + bugS * 0.68)}" font-family="'${esc(mono.family)}', monospace" font-size="${r1(bugS * 0.42)}" letter-spacing="${r1(bugS * 0.08)}" fill="${pal.text}">${esc(brand.config.name.toUpperCase())}</text></g>`;

    // 5. End card: the still everything resolves to (and what reduced motion shows).
    const eh = fit(endCard.headline, W * (wide ? 0.7 : 0.84), H * 0.2, display, { max: S * 0.1, min: 24, lead: 1.04, maxLines: 3 });
    const markS = S * 0.16;
    const ey = H * (wide ? 0.38 : 0.42);
    const endIn = anim.add('end', [[0, 'opacity:0'], [endStart, 'opacity:0', arrive], [endStart + 900, 'opacity:1']]);
    let end = mark ? `<image href="${mark}" x="${r1(W / 2 - markS / 2)}" y="${r1(ey - markS * 1.15)}" width="${r1(markS)}" height="${r1(markS)}"/>` : '';
    eh.lines.forEach((l, k) => { end += `<text x="${r1(W / 2)}" y="${r1(ey + eh.size * (0.9 + k * 1.04))}" text-anchor="middle" font-family="'${esc(display.family)}', sans-serif" font-weight="${display.weight}" font-size="${r1(eh.size)}" letter-spacing="${r1(-0.02 * eh.size)}" fill="${pal.head}">${esc(l)}</text>`; });
    if (endCard.cta) end += `<text x="${r1(W / 2)}" y="${r1(ey + eh.size * (0.9 + eh.lines.length * 1.04) + S * 0.07)}" text-anchor="middle" font-family="'${esc(mono.family)}', monospace" font-size="${r1(S * 0.032)}" letter-spacing="${r1(S * 0.004)}" fill="${pal.accent}">${esc(endCard.cta)}</text>`;
    body += `<g class="${endIn}">${end}</g>`;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc([endCard.headline, brand.config.name].join(' · '))}">` +
      `<style>@import url("${tokens.typography.googleFontsUrl}");</style>` +
      `<style>${anim.css()}@media (prefers-reduced-motion: reduce){[class^="${P}"]{animation:none!important}}</style>` + body + '</svg>\n';
    const out = join(outDir, `${film.id}-${W}x${H}.svg`);
    writeFileSync(out, svg);
    outputs.push(out);
    log(`  ${out.replace(ROOT + '/', '')}`);
    if (mp4) {
      execFileSync('node', [join(ROOT, 'tools/design/video.mjs'), out, String(T / 1000)], { stdio: 'inherit' });
      outputs.push(out.replace(/\.svg$/, '.mp4'));
    }
  }
  return { T, outputs };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [product, campaign] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!product || !campaign) { console.error('usage: npm run film -- <product> <campaign> [--mp4]'); process.exit(1); }
  await renderFilm(product, campaign, { mp4: process.argv.includes('--mp4') });
}
