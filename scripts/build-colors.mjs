#!/usr/bin/env node
// Builds the UnDesigned colour system from Sanzo Wada's "A Dictionary of Color
// Combinations" (colors/source/wada-colors.json) and brand.config.json.
// Zero dependencies: `node scripts/build-colors.mjs` (or `npm run build`).

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const write = (p, data) => {
  const full = join(DIST, p);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, data);
};

const source = JSON.parse(read('colors/source/wada-colors.json'));
const config = JSON.parse(read('brand.config.json'));
const P = config.prefix || 'ud';

const CHAPTERS = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const MIN_TEXT_CONTRAST = 4.5; // WCAG AA, body text
const MIN_LARGE_CONTRAST = 3; // WCAG AA, large display type

// ---------------------------------------------------------------- colours

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const pad = (n) => String(n).padStart(3, '0');

function luminance([r, g, b]) {
  const ch = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a.rgb), luminance(b.rgb)].sort((x, y) => y - x);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

const colors = source.map((c, index) => ({
  id: slugify(c.name),
  index: index + 1,
  name: c.name,
  hex: c.hex.toLowerCase(),
  rgb: c.rgb,
  cmyk: c.cmyk,
  lab: c.lab.map((v) => Math.round(v * 100) / 100),
  chroma: Math.round(Math.hypot(c.lab[1], c.lab[2]) * 100) / 100,
  chapter: CHAPTERS[c.swatch],
  combinations: c.combinations,
}));
const byId = Object.fromEntries(colors.map((c) => [c.id, c]));

// Darkest and lightest colours in the book: used as ink when a palette has
// no pair with enough contrast for text.
const BOOK_DARK = colors.reduce((a, b) => (b.lab[0] < a.lab[0] ? b : a));
const BOOK_LIGHT = colors.reduce((a, b) => (b.lab[0] > a.lab[0] ? b : a));

// ----------------------------------------------------------- combinations

const comboMap = new Map();
for (const c of colors) {
  for (const n of c.combinations) {
    if (!comboMap.has(n)) comboMap.set(n, []);
    comboMap.get(n).push(c);
  }
}

// Assign poster roles: background, ink (text), accent, support.
function assignRoles(members, mode) {
  const sorted = [...members].sort((a, b) => b.lab[0] - a.lab[0]);
  const bg = mode === 'dark' ? sorted[sorted.length - 1] : sorted[0];
  const rest = members.filter((c) => c !== bg);
  const ink = rest.reduce((a, b) => (contrast(bg, b) > contrast(bg, a) ? b : a));
  const inkContrast = contrast(bg, ink);
  const others = rest.filter((c) => c !== ink);
  const accent = others.length ? others.reduce((a, b) => (b.chroma > a.chroma ? b : a)) : ink;
  const support = others.filter((c) => c !== accent);

  // Text colour that always passes AA on this background.
  let text = ink;
  if (inkContrast < MIN_TEXT_CONTRAST) {
    text = contrast(bg, BOOK_DARK) >= contrast(bg, BOOK_LIGHT) ? BOOK_DARK : BOOK_LIGHT;
  }
  return {
    bg: bg.id,
    ink: ink.id,
    accent: accent.id,
    support: support.map((c) => c.id),
    text: text.id,
    contrast: {
      inkOnBg: inkContrast,
      accentOnBg: contrast(bg, accent),
      textOnBg: contrast(bg, text),
    },
    inkUse:
      inkContrast >= MIN_TEXT_CONTRAST ? 'body' : inkContrast >= MIN_LARGE_CONTRAST ? 'display' : 'decorative',
  };
}

const combinations = [...comboMap.keys()]
  .sort((a, b) => a - b)
  .map((n) => {
    const members = comboMap.get(n);
    return {
      id: n,
      code: pad(n),
      size: members.length,
      colors: members.map((c) => c.id),
      roles: { light: assignRoles(members, 'light'), dark: assignRoles(members, 'dark') },
    };
  });
const comboById = Object.fromEntries(combinations.map((c) => [c.id, c]));

// ------------------------------------------------------------------ brand

const palettes = Object.entries(config.palettes || {}).map(([name, p]) => {
  const combo = comboById[p.combination];
  if (!combo) throw new Error(`brand.config.json: palette "${name}" uses unknown combination ${p.combination} (valid: 1-348)`);
  const mode = p.mode === 'dark' ? 'dark' : 'light';
  const roles = { ...combo.roles[mode] };
  // Optional manual overrides: { "roles": { "accent": "burnt-sienna" } }
  for (const [role, id] of Object.entries(p.roles || {})) {
    if (role === 'support') {
      for (const s of id) if (!byId[s]) throw new Error(`brand.config.json: unknown colour "${s}"`);
    } else if (!byId[id]) throw new Error(`brand.config.json: unknown colour "${id}" for role ${role}`);
    roles[role] = id;
  }
  return { name: slugify(name), combination: combo.id, mode, colors: combo.colors, roles };
});

const hex = (id) => byId[id].hex;
const roleEntries = (r) => [
  ['bg', r.bg],
  ['ink', r.ink],
  ['accent', r.accent],
  ['text', r.text],
  ...r.support.map((s, i) => [`support-${i + 1}`, s]),
];

// ---------------------------------------------------------------- outputs

rmSync(DIST, { recursive: true, force: true });

const banner = (c = '/*', e = ' */') =>
  `${c} UnDesigned colour system. Generated by scripts/build-colors.mjs; do not edit by hand.\n` +
  `   Colours: Sanzo Wada, A Dictionary of Color Combinations (Seigensha). Data: MIT, see colors/source.${e}\n`;

// 1. Canonical token JSON
const tokens = {
  meta: {
    source: 'Sanzo Wada, A Dictionary of Color Combinations',
    colorCount: colors.length,
    combinationCount: combinations.length,
    prefix: P,
  },
  colors,
  combinations,
  brand: palettes,
};
write('tokens/colors.json', JSON.stringify(tokens, null, 2) + '\n');

// 2. CSS
{
  let css = banner();
  css += `\n/* All ${colors.length} colours: var(--${P}-wada-<name>) */\n:root {\n`;
  for (const c of colors) css += `  --${P}-wada-${c.id}: ${c.hex};\n`;
  css += '}\n';

  if (palettes.length) {
    css += `\n/* Brand palettes from brand.config.json. "primary" is the default. */\n`;
    const primary = palettes.find((p) => p.name === 'primary') || palettes[0];
    css += ':root {\n';
    for (const [k, v] of roleEntries(primary.roles)) css += `  --${P}-${k}: var(--${P}-wada-${v});\n`;
    css += '}\n';
    for (const p of palettes) {
      css += `\n/* ${p.name}: combination ${pad(p.combination)} (${p.mode}) */\n:root {\n`;
      for (const [k, v] of roleEntries(p.roles)) css += `  --${P}-${p.name}-${k}: var(--${P}-wada-${v});\n`;
      css += `}\n.${P}-palette-${p.name} {\n`;
      for (const [k, v] of roleEntries(p.roles)) css += `  --${P}-${k}: var(--${P}-wada-${v});\n`;
      css += '}\n';
    }
  }
  css += `\n/* Helpers: apply the current palette to any element */\n`;
  css += `.${P}-surface { background: var(--${P}-bg); color: var(--${P}-text); }\n`;
  css += `.${P}-ink { color: var(--${P}-ink); }\n.${P}-accent { color: var(--${P}-accent); }\n`;
  css += `.${P}-bg-accent { background: var(--${P}-accent); }\n.${P}-bg-ink { background: var(--${P}-ink); }\n`;
  write('css/colors.css', css);

  let combos = banner();
  combos += `\n/* Every combination as a class. <div class="${P}-combo-042"> (light) or\n   <div class="${P}-combo-042 ${P}-dark"> sets --${P}-bg, --${P}-ink, --${P}-accent,\n   --${P}-text, --${P}-support-N and --${P}-c1..c4 for everything inside. */\n`;
  for (const c of combinations) {
    const sel = `.${P}-combo-${c.code}`;
    combos += `${sel} {\n`;
    c.colors.forEach((id, i) => (combos += `  --${P}-c${i + 1}: ${hex(id)};\n`));
    for (const [k, v] of roleEntries(c.roles.light)) combos += `  --${P}-${k}: ${hex(v)};\n`;
    combos += `}\n${sel}.${P}-dark {\n`;
    for (const [k, v] of roleEntries(c.roles.dark)) combos += `  --${P}-${k}: ${hex(v)};\n`;
    combos += '}\n';
  }
  write('css/combinations.css', combos);
}

// 3. SCSS
{
  let s = banner('//', '');
  s = s.replace(/\n {3}/g, '\n// ');
  for (const c of colors) s += `$${P}-wada-${c.id}: ${c.hex};\n`;
  s += `\n$${P}-wada: (\n${colors.map((c) => `  '${c.id}': ${c.hex},`).join('\n')}\n);\n`;
  s += `\n$${P}-combinations: (\n`;
  for (const c of combinations) s += `  ${c.id}: (${c.colors.map(hex).join(', ')}),\n`;
  s += ');\n';
  for (const p of palettes) {
    s += `\n// ${p.name}: combination ${pad(p.combination)} (${p.mode})\n$${P}-${p.name}: (\n`;
    for (const [k, v] of roleEntries(p.roles)) s += `  '${k}': ${hex(v)},\n`;
    s += ');\n';
  }
  write('scss/_colors.scss', s);
}

// 4. JavaScript (ESM + CommonJS + types)
{
  const data = JSON.stringify({ colors, combinations, brand: palettes });
  const helpers = `
const colorById = Object.fromEntries(data.colors.map((c) => [c.id, c]));
const comboById = Object.fromEntries(data.combinations.map((c) => [c.id, c]));
const colors = data.colors;
const combinations = data.combinations;
const brand = Object.fromEntries(data.brand.map((p) => [p.name, resolve(p.roles, p.colors)]));
function color(id) { return colorById[id]; }
function resolve(roles, members) {
  const h = (id) => colorById[id].hex;
  return { bg: h(roles.bg), ink: h(roles.ink), accent: h(roles.accent), text: h(roles.text),
    support: roles.support.map(h), all: members.map(h), contrast: roles.contrast };
}
/** Palette for combination n (1-348). mode: 'light' | 'dark'. */
function palette(n, mode = 'light') {
  const c = comboById[n];
  if (!c) throw new Error('Unknown combination ' + n + ' (valid: 1-348)');
  return { id: c.id, code: c.code, ...resolve(c.roles[mode === 'dark' ? 'dark' : 'light'], c.colors) };
}
/** Combinations that contain every given colour id. */
function combinationsWith(...ids) {
  return data.combinations.filter((c) => ids.every((id) => c.colors.includes(id)));
}`;
  const head = banner();
  write('js/colors.mjs', `${head}const data = ${data};\n${helpers}\nexport { colors, combinations, brand, color, palette, combinationsWith };\n`);
  write('js/colors.cjs', `${head}const data = ${data};\n${helpers}\nmodule.exports = { colors, combinations, brand, color, palette, combinationsWith };\n`);
  write(
    'js/colors.d.ts',
    `${head}export interface WadaColor { id: string; index: number; name: string; hex: string; rgb: [number, number, number]; cmyk: [number, number, number, number]; lab: [number, number, number]; chroma: number; chapter: string; combinations: number[] }
export interface Roles { bg: string; ink: string; accent: string; text: string; support: string[]; contrast: { inkOnBg: number; accentOnBg: number; textOnBg: number }; inkUse: 'body' | 'display' | 'decorative' }
export interface Combination { id: number; code: string; size: 2 | 3 | 4; colors: string[]; roles: { light: Roles; dark: Roles } }
export interface Palette { bg: string; ink: string; accent: string; text: string; support: string[]; all: string[]; contrast: Roles['contrast'] }
export declare const colors: WadaColor[];
export declare const combinations: Combination[];
export declare const brand: Record<string, Palette>;
export declare function color(id: string): WadaColor | undefined;
export declare function palette(n: number, mode?: 'light' | 'dark'): Palette & { id: number; code: string };
export declare function combinationsWith(...ids: string[]): Combination[];
`,
  );
}

// 5. Tailwind (v3 preset + v4 theme)
{
  const wada = Object.fromEntries(colors.map((c) => [c.id, c.hex]));
  const brandTw = {};
  for (const p of palettes) {
    const target = p.name === 'primary' ? brandTw : (brandTw[p.name] = {});
    for (const [k, v] of roleEntries(p.roles)) target[k] = hex(v);
  }
  write(
    'tailwind/preset.cjs',
    `${banner()}// tailwind.config.js -> presets: [require('./dist/tailwind/preset.cjs')]\n// Classes: bg-wada-burnt-sienna, text-brand-ink, bg-brand-accent ...\nmodule.exports = { theme: { extend: { colors: ${JSON.stringify({ wada, brand: brandTw }, null, 2)} } } };\n`,
  );
  let v4 = `${banner()}/* Tailwind v4: @import "./dist/tailwind/theme.css"; */\n@theme {\n`;
  for (const c of colors) v4 += `  --color-wada-${c.id}: ${c.hex};\n`;
  for (const p of palettes) {
    const base = p.name === 'primary' ? 'brand' : `brand-${p.name}`;
    for (const [k, v] of roleEntries(p.roles)) v4 += `  --color-${base}-${k}: ${hex(v)};\n`;
  }
  write('tailwind/theme.css', v4 + '}\n');
}

// 6. Figma (Tokens Studio / W3C design tokens format)
{
  const t = { wada: {}, combinations: {}, brand: {} };
  for (const c of colors)
    t.wada[c.id] = { $type: 'color', $value: c.hex, $description: `${c.name} · CMYK ${c.cmyk.join('/')} · Chapter ${c.chapter}` };
  for (const c of combinations) {
    t.combinations[c.code] = {};
    c.colors.forEach((id, i) => (t.combinations[c.code][`c${i + 1}`] = { $type: 'color', $value: `{wada.${id}}` }));
  }
  for (const p of palettes) {
    t.brand[p.name] = {};
    for (const [k, v] of roleEntries(p.roles)) t.brand[p.name][k] = { $type: 'color', $value: `{wada.${v}}` };
  }
  write('figma/tokens.json', JSON.stringify(t, null, 2) + '\n');
}

// 7. Adobe Swatch Exchange (.ase): Illustrator, InDesign, Photoshop, Affinity
function ase(groups, model) {
  const chunks = [];
  const str = (s) => {
    const b = Buffer.alloc(2 + (s.length + 1) * 2);
    b.writeUInt16BE(s.length + 1, 0);
    for (let i = 0; i < s.length; i++) b.writeUInt16BE(s.charCodeAt(i), 2 + i * 2);
    return b;
  };
  const block = (type, body) => {
    const h = Buffer.alloc(6);
    h.writeUInt16BE(type, 0);
    h.writeUInt32BE(body.length, 2);
    chunks.push(h, body);
  };
  let count = 0;
  for (const g of groups) {
    block(0xc001, str(g.name));
    count++;
    for (const c of g.colors) {
      const vals = model === 'CMYK' ? c.cmyk.map((v) => v / 100) : c.rgb.map((v) => v / 255);
      const body = Buffer.alloc(4 + vals.length * 4 + 2);
      body.write(model === 'CMYK' ? 'CMYK' : 'RGB ', 0, 'ascii');
      vals.forEach((v, i) => body.writeFloatBE(v, 4 + i * 4));
      body.writeUInt16BE(2, 4 + vals.length * 4); // normal (process) colour
      block(0x0001, Buffer.concat([str(c.label || c.name), body]));
      count++;
    }
    block(0xc002, Buffer.alloc(0));
    count++;
  }
  const head = Buffer.alloc(12);
  head.write('ASEF', 0, 'ascii');
  head.writeUInt16BE(1, 4);
  head.writeUInt16BE(0, 6);
  head.writeUInt32BE(count, 8);
  return Buffer.concat([head, ...chunks]);
}
{
  const allGroups = CHAPTERS.map((ch) => ({
    name: `Wada Chapter ${ch}`,
    colors: colors.filter((c) => c.chapter === ch),
  }));
  const comboGroups = combinations.map((c) => ({
    name: `Wada ${c.code}`,
    colors: c.colors.map((id) => byId[id]),
  }));
  const brandGroups = palettes.map((p) => ({
    name: `Brand ${p.name}`,
    colors: roleEntries(p.roles).map(([k, v]) => ({ ...byId[v], label: `${k} · ${byId[v].name}` })),
  }));
  for (const model of ['CMYK', 'RGB']) {
    const m = model.toLowerCase();
    write(`adobe/wada-colors-${m}.ase`, ase(allGroups, model));
    write(`adobe/wada-combinations-${m}.ase`, ase(comboGroups, model));
    if (brandGroups.length) write(`adobe/brand-${m}.ase`, ase(brandGroups, model));
  }
}

// 8. GIMP / Inkscape / Krita palette (.gpl) and a plain hex list (Canva brand kit)
{
  let gpl = 'GIMP Palette\nName: Wada - Dictionary of Color Combinations\nColumns: 8\n#\n';
  for (const c of colors) gpl += `${c.rgb.map((v) => String(v).padStart(3)).join(' ')}\t${c.name}\n`;
  write('palettes/wada-colors.gpl', gpl);
  let txt = '';
  for (const p of palettes) {
    txt += `${p.name} (combination ${pad(p.combination)}, ${p.mode})\n`;
    for (const [k, v] of roleEntries(p.roles)) txt += `  ${k.padEnd(10)} ${hex(v)}  ${byId[v].name}\n`;
    txt += '\n';
  }
  write('palettes/brand-hex.txt', txt);
}

// 9. Explorer page (self-contained HTML)
{
  const tpl = read('explorer/template.html');
  const data = JSON.stringify({ colors, combinations, brand: palettes, prefix: P });
  const body = tpl.replace('/*__DATA__*/null', () => data);
  write('explorer/index.html', `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n${body}\n</body>\n</html>\n`);
}

// ---------------------------------------------------------------- summary
const low = combinations.filter((c) => c.roles.light.inkUse !== 'body').length;
console.log(`Built ${colors.length} colours, ${combinations.length} combinations, ${palettes.length} brand palette(s) -> dist/`);
console.log(`${low} combinations need the fallback text colour in light mode (ink contrast < ${MIN_TEXT_CONTRAST}:1).`);
for (const p of palettes) {
  const r = p.roles;
  console.log(`  ${p.name}: #${pad(p.combination)} bg ${r.bg}, ink ${r.ink} (${r.contrast.inkOnBg}:1), accent ${r.accent}`);
}
