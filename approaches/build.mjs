// Approaches (art directions): builds a product's chosen approach (brand.json -> approach):
// its data (approach, art, motion, typography), motion CSS, a sample poster and, for
// approaches with a drawing engine, the illustration library and example SVGs.
// Runs after the colour foundation, whose tokens give the palettes.
// Every approach lives in approaches/<id>/ and follows approaches/STYLE-SPEC.md.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as humanistMinimal from './humanist-minimal/illustration.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA_FILES = ['art', 'motion', 'typography'];

// Drawing engines (createIllustrator). Approaches without one are "profile" approaches:
// full data and a sample poster, but no illustration library yet.
export const ENGINES = { 'humanist-minimal': humanistMinimal };
export const springEasing = humanistMinimal.springEasing;

/** Every approach folder (has approach.json; folders starting with "_" are skipped). */
export function listApproaches() {
  return readdirSync(HERE, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_') && existsSync(join(HERE, d.name, 'approach.json')))
    .map((d) => d.name)
    .sort((a, b) => (a === 'humanist-minimal' ? -1 : b === 'humanist-minimal' ? 1 : a.localeCompare(b)));
}

// Sample poster generators (sample.mjs), loaded once.
const SAMPLES = {};
for (const id of listApproaches()) {
  const f = join(HERE, id, 'sample.mjs');
  if (existsSync(f)) {
    try {
      SAMPLES[id] = (await import(pathToFileURL(f).href)).samplePoster;
    } catch (e) {
      console.warn(`approaches/${id}/sample.mjs failed to load: ${e.message}`);
    }
  }
}

/** Loads an approach: approach.json merged with art.json, motion.json and typography.json. */
export function loadApproach(id) {
  const dir = join(HERE, id);
  const read = (f) => JSON.parse(readFileSync(join(dir, f), 'utf8'));
  const strip = (o) => JSON.parse(JSON.stringify(o, (k, v) => (k === '$comment' ? undefined : v)));
  const approach = { id, ...strip(read('approach.json')) };
  for (const f of DATA_FILES) if (existsSync(join(dir, `${f}.json`))) approach[f] = strip(read(`${f}.json`));
  approach.status = ENGINES[id] ? 'complete' : approach.status || 'profile';
  return approach;
}

/** Illustration palette for a combination's roles: ground and accent from Wada, ink Black, paper White. */
export function illustrationPalette(roles, byHex) {
  return { ground: byHex(roles.bg), accent: byHex(roles.accent), ink: byHex('black'), paper: byHex('white') };
}

/** Palette passed to sample posters: illustration palette plus the combination's other colours. */
export function samplePalette(combo, roles, byHex) {
  const base = illustrationPalette(roles, byHex);
  const support = combo.colors.filter((c) => c !== roles.bg && c !== roles.accent).map(byHex);
  return { ...base, support: support.length ? support : [base.accent] };
}

/** Renders an approach's sample poster (SVG string) or null. */
export function renderSample(id, palette, copy, approach) {
  const fn = SAMPLES[id];
  if (!fn) return null;
  try {
    return fn(palette, copy, approach || loadApproach(id));
  } catch (e) {
    console.warn(`approaches/${id}/sample.mjs failed: ${e.message}`);
    return null;
  }
}

/** Motion CSS (variables for every spring, easing and timed move, plus the classes the moves support). */
function motionCss(approach, springs, banner) {
  const M = approach.motion || {};
  const mv = M.moves || {};
  const corners = (approach.art && approach.art.corners && approach.art.corners.scale) || {};
  const ms = (v) => (typeof v === 'number' ? `${v}ms` : v);
  const vars = [
    ...Object.entries(springs).map(([k, s]) => `  --ud-spring-${k}: ${s.easing};\n  --ud-spring-${k}-duration: ${s.duration}ms;`),
    ...Object.entries(M.easings || {}).map(([k, e]) => `  --ud-ease-${k}: ${e.css};`),
    ...Object.entries(mv).filter(([, m]) => typeof m.duration === 'number').map(([k, m]) => `  --ud-motion-${k}: ${ms(m.duration)};`),
    M.choreography && M.choreography.stagger != null ? `  --ud-motion-stagger: ${ms(M.choreography.stagger)};` : '',
    ...Object.entries(corners).map(([k, v]) => `  --ud-radius-${k}: ${v}px;`),
  ].filter(Boolean);
  const springName = (move, fallback) => (mv[move] && mv[move].spring && springs[mv[move].spring] ? mv[move].spring : springs[fallback] ? fallback : Object.keys(springs)[0]);
  const easeName = (move) => (mv[move] && mv[move].easing && (M.easings || {})[mv[move].easing] ? `var(--ud-ease-${mv[move].easing})` : 'cubic-bezier(0.65, 0, 0.35, 1)');
  let css = `${banner}\n/* Springs are simulated into linear() easings. */\n:root {\n${vars.join('\n')}\n}\n`;
  if (mv.draw) css += `\n/* Line draws itself on. Put pathLength="1" on the SVG path. */\n.ud-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: ud-draw var(--ud-motion-draw, 600ms) ${easeName('draw')} both; }\n@keyframes ud-draw { to { stroke-dashoffset: 0; } }\n`;
  const pop = springName('pop', 'lively');
  if (pop) css += `\n/* Shape or element pops in on a spring. */\n.ud-pop { transform-box: fill-box; transform-origin: center; animation: ud-pop var(--ud-spring-${pop}-duration) cubic-bezier(0.34, 1.56, 0.64, 1) both; animation-timing-function: var(--ud-spring-${pop}); }\n@keyframes ud-pop { from { transform: scale(0); } to { transform: scale(1); } }\n`;
  const rise = springName('rise', 'gentle');
  if (rise) css += `\n/* Text or block rises in. */\n.ud-rise { animation: ud-rise var(--ud-spring-${rise}-duration) cubic-bezier(0.22, 1, 0.36, 1) both; animation-timing-function: var(--ud-spring-${rise}); }\n@keyframes ud-rise { from { transform: translateY(0.4em); opacity: 0; } to { transform: none; opacity: 1; } }\n`;
  if (mv.breathe && mv.breathe.scale) css += `\n.ud-breathe { transform-box: fill-box; transform-origin: center; animation: ud-breathe var(--ud-motion-breathe) ${easeName('breathe')} infinite alternate; }\n@keyframes ud-breathe { from { transform: scale(${mv.breathe.scale[0]}); } to { transform: scale(${mv.breathe.scale[1]}); } }\n`;
  if (mv.float) css += `\n.ud-float { animation: ud-float var(--ud-motion-float) ${easeName('float')} infinite alternate; }\n@keyframes ud-float { from { transform: translateY(0); } to { transform: translateY(-${mv.float.distancePct || 1}%); } }\n`;
  const soft = springs.soft ? 'soft' : Object.keys(springs)[0];
  if (soft) css += `\n/* Spring transitions for interactive UI (hover, open, toggle). */\n.ud-spring { transition-property: transform, opacity, background-color, border-radius; transition-duration: var(--ud-spring-${soft}-duration); transition-timing-function: var(--ud-spring-${soft}); }\n`;
  css += `\n/* Stagger children: style="--i: 0", "--i: 1" ... */\n.ud-stagger > * { animation-delay: calc(var(--i, 0) * var(--ud-motion-stagger, 50ms)); }\n\n@media (prefers-reduced-motion: reduce) {\n  .ud-draw, .ud-pop, .ud-rise, .ud-breathe, .ud-float { animation: none; stroke-dashoffset: 0; }\n  .ud-spring { transition: none; }\n}\n`;
  return css;
}

export function buildApproach({ dist, brand }) {
  const id = brand.config.approach;
  if (!listApproaches().includes(id)) throw new Error(`products/${brand.id}/brand.json: unknown approach "${id}". Available: ${listApproaches().join(', ')}`);
  const engine = ENGINES[id];
  const P = brand.config.prefix;
  const write = (p, data) => {
    const full = join(dist, p);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, data);
  };
  const approach = loadApproach(id);
  const color = JSON.parse(readFileSync(join(dist, 'tokens/colors.json'), 'utf8'));
  const hexOf = Object.fromEntries(color.colors.map((c) => [c.id, c.hex]));
  const hex = (h) => hexOf[h];
  const comboById = Object.fromEntries(color.combinations.map((c) => [c.id, c]));

  const primaryPalette = color.brand.find((b) => b.name === 'primary') || color.brand[0];
  const palettes = Object.fromEntries(color.brand.map((b) => [b.name, illustrationPalette(b.roles, hex)]));
  const primary = primaryPalette ? palettes[primaryPalette.name] : { ground: hex('white'), accent: hex('black'), ink: hex('black'), paper: hex('white') };
  const springs = Object.fromEntries(Object.entries((approach.motion && approach.motion.springs) || {}).map(([k, s]) => [k, springEasing(s)]));
  const banner = `/* ${brand.config.name}: ${approach.name} approach (UnDesigned). Generated by approaches/build.mjs; do not edit by hand. */\n`;

  write('tokens/approach.json', JSON.stringify({ ...approach, springsCss: springs, palettes }, null, 2) + '\n');
  const prefixed = (s) => s.replace(/--ud-/g, `--${P}-`).replace(/\.ud-/g, `.${P}-`).replace(/@keyframes ud-/g, `@keyframes ${P}-`).replace(/animation: ud-/g, `animation: ${P}-`);
  write('web/css/motion.css', prefixed(motionCss(approach, springs, banner)));

  // Sample poster in the product's primary palette
  if (primaryPalette) {
    const msg = JSON.parse(readFileSync(join(brand.dir, 'messaging.json'), 'utf8'));
    const svg = renderSample(id, samplePalette(comboById[primaryPalette.combination], primaryPalette.roles, hex), {
      headline: (msg.oneLiner && msg.oneLiner.result) || approach.name,
      subhead: approach.summary,
      brand: brand.config.name,
    }, approach);
    if (svg) write('illustration/sample-poster.svg', svg + '\n');
  }

  let motifs = [];
  if (engine) {
    const ill = engine.createIllustrator(approach, primary);
    motifs = ill.motifs;
    const lib = readFileSync(join(HERE, id, 'illustration.mjs'), 'utf8').replace(/^export /gm, '');
    const combos = Object.fromEntries(color.combinations.map((c) => [c.id, { light: c.roles.light, dark: c.roles.dark }]));
    write(
      'web/js/illustration.mjs',
      `${banner}${lib}
const approach = ${JSON.stringify(approach)};
const palettes = ${JSON.stringify(palettes)};
const hexOf = ${JSON.stringify(hexOf)};
const combos = ${JSON.stringify(combos)};
/** Illustration palette for any Wada combination (1-348). */
function paletteFor(n, mode = 'light') {
  const r = combos[n] && combos[n][mode === 'dark' ? 'dark' : 'light'];
  if (!r) throw new Error('Unknown combination ' + n);
  return { ground: hexOf[r.bg], accent: hexOf[r.accent], ink: hexOf.black, paper: hexOf.white };
}
const illustrator = createIllustrator(approach, palettes.primary || Object.values(palettes)[0]);
/** scene({ motif, palette, animate }) -> SVG string. motifs: ${ill.motifs.join(', ')} */
const scene = illustrator.scene;
export { approach, palettes, paletteFor, illustrator, scene, createIllustrator, springEasing };
`,
    );
    for (const motif of ill.motifs) {
      write(`illustration/svg/${motif}.svg`, ill.scene({ motif, animate: false, uid: motif.replace(/-/g, '') }) + '\n');
      write(`illustration/svg/${motif}-animated.svg`, ill.scene({ motif, animate: true, uid: motif.replace(/-/g, '') }) + '\n');
    }
  }

  return [
    `approach: ${approach.name} (${approach.status}), ${approach.principles.length} principles, ${approach.layers.length} layer rules, ${motifs.length} motifs, ${Object.keys(springs).length} springs`,
    `  palette "${primaryPalette ? primaryPalette.name : 'none'}" (combination ${primaryPalette ? primaryPalette.combination : '-'})${SAMPLES[id] ? ', sample poster' : ''}`,
  ];
}
