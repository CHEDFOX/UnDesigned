// Colour foundation: builds every colour output from Sanzo Wada's
// "A Dictionary of Color Combinations" (source/) and a brand's products/<id>/brand.json.
// Run through `npm run build` (scripts/build.mjs).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

const CHAPTERS = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const MIN_TEXT_CONTRAST = 4.5; // WCAG AA, body text
const MIN_LARGE_CONTRAST = 3; // WCAG AA, large display type
const SIZE_NAMES = { 2: 'pairs', 3: 'trios', 4: 'quartets' };

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

export function buildColor({ dist, brand }) {
  const config = brand.config;
  const readJSON = (p) => JSON.parse(readFileSync(join(HERE, p), 'utf8'));
  const write = (p, data) => {
    const full = join(dist, p);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, data);
  };

  const source = readJSON('source/wada-colors.json');
  const familySource = readJSON('source/families.json').families;
  const P = config.prefix || 'ud';
  const colorConfig = config.color || {};

  // -------------------------------------------------------------- colours

  const familyOf = {};
  for (const f of familySource) for (const id of f.colors) {
    if (familyOf[id]) throw new Error(`families.json: "${id}" is in both ${familyOf[id]} and ${f.id}`);
    familyOf[id] = f.id;
  }

  const colors = source.map((c, index) => {
    const id = slugify(c.name);
    if (!familyOf[id]) throw new Error(`families.json: "${id}" (${c.name}) is not in any family`);
    return {
      id,
      index: index + 1,
      name: c.name,
      family: familyOf[id],
      chapter: CHAPTERS[c.swatch],
      hex: c.hex.toLowerCase(),
      rgb: c.rgb,
      cmyk: c.cmyk,
      lab: c.lab.map((v) => Math.round(v * 100) / 100),
      chroma: Math.round(Math.hypot(c.lab[1], c.lab[2]) * 100) / 100,
      combinations: c.combinations,
    };
  });
  const byId = Object.fromEntries(colors.map((c) => [c.id, c]));
  for (const id of Object.keys(familyOf)) if (!byId[id]) throw new Error(`families.json: unknown colour "${id}"`);

  const families = familySource.map((f) => ({ id: f.id, name: f.name, colors: f.colors }));
  const chapters = CHAPTERS.map((ch) => ({ id: ch, name: `Chapter ${ch}`, colors: colors.filter((c) => c.chapter === ch).map((c) => c.id) }));
  const familyOrder = colors.slice().sort(
    (a, b) => families.findIndex((f) => f.id === a.family) - families.findIndex((f) => f.id === b.family) ||
      families.find((f) => f.id === a.family).colors.indexOf(a.id) - families.find((f) => f.id === b.family).colors.indexOf(b.id),
  );

  // Darkest and lightest colours in the book: used as text colour when a
  // palette has no pair with enough contrast.
  const BOOK_DARK = colors.reduce((a, b) => (b.lab[0] < a.lab[0] ? b : a));
  const BOOK_LIGHT = colors.reduce((a, b) => (b.lab[0] > a.lab[0] ? b : a));

  // --------------------------------------------------------- combinations

  const comboMap = new Map();
  for (const c of colors) for (const n of c.combinations) {
    if (!comboMap.has(n)) comboMap.set(n, []);
    comboMap.get(n).push(c);
  }

  // Poster roles: background, ink (headlines), accent, support, text.
  function assignRoles(members, mode) {
    const sorted = [...members].sort((a, b) => b.lab[0] - a.lab[0]);
    const bg = mode === 'dark' ? sorted[sorted.length - 1] : sorted[0];
    const rest = members.filter((c) => c !== bg);
    const ink = rest.reduce((a, b) => (contrast(bg, b) > contrast(bg, a) ? b : a));
    const inkContrast = contrast(bg, ink);
    const others = rest.filter((c) => c !== ink);
    const accent = others.length ? others.reduce((a, b) => (b.chroma > a.chroma ? b : a)) : ink;
    const support = others.filter((c) => c !== accent);
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
      contrast: { inkOnBg: inkContrast, accentOnBg: contrast(bg, accent), textOnBg: contrast(bg, text) },
      inkUse: inkContrast >= MIN_TEXT_CONTRAST ? 'body' : inkContrast >= MIN_LARGE_CONTRAST ? 'display' : 'decorative',
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
        group: SIZE_NAMES[members.length],
        colors: members.map((c) => c.id),
        roles: { light: assignRoles(members, 'light'), dark: assignRoles(members, 'dark') },
      };
    });
  const comboById = Object.fromEntries(combinations.map((c) => [c.id, c]));
  const comboGroups = [2, 3, 4].map((size) => ({
    id: SIZE_NAMES[size],
    name: `${size}-colour ${SIZE_NAMES[size]}`,
    size,
    combinations: combinations.filter((c) => c.size === size).map((c) => c.id),
  }));

  // ---------------------------------------------------------------- brand

  const palettes = Object.entries(colorConfig.palettes || {}).map(([name, p]) => {
    const combo = comboById[p.combination];
    if (!combo) throw new Error(`products/${brand.id}/brand.json: palette "${name}" uses unknown combination ${p.combination} (valid: 1-348)`);
    const mode = p.mode === 'dark' ? 'dark' : 'light';
    const roles = { ...combo.roles[mode] };
    for (const [role, id] of Object.entries(p.roles || {})) {
      for (const s of [].concat(id)) if (!byId[s]) throw new Error(`products/${brand.id}/brand.json: unknown colour "${s}" for role ${role}`);
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
  const familyName = (id) => families.find((f) => f.id === id).name;

  const banner = (c = '/*', e = ' */', mid = '   ') =>
    `${c} ${config.name} colour system (UnDesigned). Generated by foundations/color/build.mjs; do not edit by hand.\n` +
    `${mid}Colours: Sanzo Wada, A Dictionary of Color Combinations (Seigensha). Data: MIT, see foundations/color/source.${e}\n`;

  // =============================================================== tokens

  write(
    'tokens/colors.json',
    JSON.stringify(
      {
        meta: { source: 'Sanzo Wada, A Dictionary of Color Combinations', colorCount: colors.length, combinationCount: combinations.length, prefix: P },
        families,
        chapters,
        combinationGroups: comboGroups,
        colors,
        combinations,
        brand: palettes,
      },
      null,
      2,
    ) + '\n',
  );

  // ================================================================== web

  // CSS
  {
    let css = banner();
    css += `\n/* All ${colors.length} colours, grouped by family: var(--${P}-wada-<name>) */\n:root {\n`;
    for (const f of families) {
      css += `  /* ${f.name} */\n`;
      for (const id of f.colors) css += `  --${P}-wada-${id}: ${hex(id)};\n`;
    }
    css += '}\n';
    if (palettes.length) {
      const primary = palettes.find((p) => p.name === 'primary') || palettes[0];
      css += `\n/* Brand palettes (products/${brand.id}/brand.json). "${primary.name}" is the default. */\n:root {\n`;
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
    write('web/css/colors.css', css);

    let combos = banner();
    combos += `\n/* Every combination as a class. <div class="${P}-combo-042"> (lightest background) or\n   <div class="${P}-combo-042 ${P}-dark"> sets --${P}-bg, --${P}-ink, --${P}-accent,\n   --${P}-text, --${P}-support-N and --${P}-c1..c4 for everything inside. */\n`;
    for (const g of comboGroups) {
      combos += `\n/* ============ ${g.name} (${g.combinations.length}) ============ */\n`;
      for (const id of g.combinations) {
        const c = comboById[id];
        const sel = `.${P}-combo-${c.code}`;
        combos += `${sel} {\n`;
        c.colors.forEach((cid, i) => (combos += `  --${P}-c${i + 1}: ${hex(cid)};\n`));
        for (const [k, v] of roleEntries(c.roles.light)) combos += `  --${P}-${k}: ${hex(v)};\n`;
        combos += `}\n${sel}.${P}-dark {\n`;
        for (const [k, v] of roleEntries(c.roles.dark)) combos += `  --${P}-${k}: ${hex(v)};\n`;
        combos += '}\n';
      }
    }
    write('web/css/combinations.css', combos);
  }

  // SCSS
  {
    let s = banner('//', '', '// ');
    for (const f of families) {
      s += `\n// ${f.name}\n`;
      for (const id of f.colors) s += `$${P}-wada-${id}: ${hex(id)};\n`;
    }
    s += `\n// Every colour by family: map-get(map-get($${P}-families, 'blues'), 'deep-indigo')\n$${P}-families: (\n`;
    for (const f of families) s += `  '${f.id}': (\n${f.colors.map((id) => `    '${id}': ${hex(id)},`).join('\n')}\n  ),\n`;
    s += ');\n';
    s += `\n// Flat map of all colours\n$${P}-wada: (\n${colors.map((c) => `  '${c.id}': ${c.hex},`).join('\n')}\n);\n`;
    s += `\n// Combinations: map-get($${P}-combinations, 232)\n$${P}-combinations: (\n`;
    for (const g of comboGroups) {
      s += `  // ${g.name}\n`;
      for (const id of g.combinations) s += `  ${id}: (${comboById[id].colors.map(hex).join(', ')}),\n`;
    }
    s += ');\n';
    for (const p of palettes) {
      s += `\n// Brand ${p.name}: combination ${pad(p.combination)} (${p.mode})\n$${P}-${p.name}: (\n`;
      for (const [k, v] of roleEntries(p.roles)) s += `  '${k}': ${hex(v)},\n`;
      s += ');\n';
    }
    write('web/scss/_colors.scss', s);
  }

  // JavaScript (ESM + CommonJS + types)
  {
    const data = JSON.stringify({ colors, families, combinations, combinationGroups: comboGroups, brand: palettes });
    const helpers = `
const colorById = Object.fromEntries(data.colors.map((c) => [c.id, c]));
const comboById = Object.fromEntries(data.combinations.map((c) => [c.id, c]));
const colors = data.colors;
const combinations = data.combinations;
const families = Object.fromEntries(data.families.map((f) => [f.id, { name: f.name, colors: f.colors.map((id) => colorById[id]) }]));
const combinationGroups = Object.fromEntries(data.combinationGroups.map((g) => [g.id, g.combinations.map((id) => comboById[id])]));
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
    const names = 'colors, families, combinations, combinationGroups, brand, color, palette, combinationsWith';
    write('web/js/colors.mjs', `${banner()}const data = ${data};\n${helpers}\nexport { ${names} };\n`);
    write('web/js/colors.cjs', `${banner()}const data = ${data};\n${helpers}\nmodule.exports = { ${names} };\n`);
    write(
      'web/js/colors.d.ts',
      `${banner()}export type FamilyId = ${families.map((f) => `'${f.id}'`).join(' | ')};
export interface WadaColor { id: string; index: number; name: string; family: FamilyId; chapter: string; hex: string; rgb: [number, number, number]; cmyk: [number, number, number, number]; lab: [number, number, number]; chroma: number; combinations: number[] }
export interface Roles { bg: string; ink: string; accent: string; text: string; support: string[]; contrast: { inkOnBg: number; accentOnBg: number; textOnBg: number }; inkUse: 'body' | 'display' | 'decorative' }
export interface Combination { id: number; code: string; size: 2 | 3 | 4; group: 'pairs' | 'trios' | 'quartets'; colors: string[]; roles: { light: Roles; dark: Roles } }
export interface Palette { bg: string; ink: string; accent: string; text: string; support: string[]; all: string[]; contrast: Roles['contrast'] }
export declare const colors: WadaColor[];
export declare const families: Record<FamilyId, { name: string; colors: WadaColor[] }>;
export declare const combinations: Combination[];
export declare const combinationGroups: Record<'pairs' | 'trios' | 'quartets', Combination[]>;
export declare const brand: Record<string, Palette>;
export declare function color(id: string): WadaColor | undefined;
export declare function palette(n: number, mode?: 'light' | 'dark'): Palette & { id: number; code: string };
export declare function combinationsWith(...ids: string[]): Combination[];
`,
    );
  }

  // Tailwind (v3 preset + v4 theme)
  {
    const wada = Object.fromEntries(familyOrder.map((c) => [c.id, c.hex]));
    const brandTw = {};
    for (const p of palettes) {
      const target = p.name === 'primary' ? brandTw : (brandTw[p.name] = {});
      for (const [k, v] of roleEntries(p.roles)) target[k] = hex(v);
    }
    write(
      'web/tailwind/preset.cjs',
      `${banner()}// tailwind.config.js -> presets: [require('./dist/${brand.id}/web/tailwind/preset.cjs')]\n// Classes: bg-wada-burnt-sienna, text-brand-ink, bg-brand-accent ...\nmodule.exports = { theme: { extend: { colors: ${JSON.stringify({ wada, brand: brandTw }, null, 2)} } } };\n`,
    );
    let v4 = `${banner()}/* Tailwind v4: @import "./dist/web/tailwind/theme.css"; */\n@theme {\n`;
    for (const f of families) {
      v4 += `  /* ${f.name} */\n`;
      for (const id of f.colors) v4 += `  --color-wada-${id}: ${hex(id)};\n`;
    }
    v4 += '  /* Brand */\n';
    for (const p of palettes) {
      const base = p.name === 'primary' ? 'brand' : `brand-${p.name}`;
      for (const [k, v] of roleEntries(p.roles)) v4 += `  --color-${base}-${k}: ${hex(v)};\n`;
    }
    write('web/tailwind/theme.css', v4 + '}\n');
  }

  // ========================================================== design apps

  // Figma (Tokens Studio / W3C design tokens), grouped by family and size
  {
    const t = { wada: {}, combinations: {}, brand: {} };
    for (const f of families) {
      t.wada[f.id] = {};
      for (const id of f.colors) {
        const c = byId[id];
        t.wada[f.id][id] = { $type: 'color', $value: c.hex, $description: `${c.name} · CMYK ${c.cmyk.join('/')} · Chapter ${c.chapter}` };
      }
    }
    const ref = (id) => `{wada.${byId[id].family}.${id}}`;
    for (const g of comboGroups) {
      t.combinations[g.id] = {};
      for (const id of g.combinations) {
        const c = comboById[id];
        t.combinations[g.id][c.code] = {};
        c.colors.forEach((cid, i) => (t.combinations[g.id][c.code][`c${i + 1}`] = { $type: 'color', $value: ref(cid) }));
      }
    }
    for (const p of palettes) {
      t.brand[p.name] = {};
      for (const [k, v] of roleEntries(p.roles)) t.brand[p.name][k] = { $type: 'color', $value: ref(v) };
    }
    write('design-apps/figma/colors.tokens.json', JSON.stringify(t, null, 2) + '\n');
  }

  // Adobe Swatch Exchange (.ase): Illustrator, InDesign, Photoshop, Affinity
  {
    const asGroup = (name, ids, label) => ({ name, colors: ids.map((id) => ({ ...byId[id], label: label ? label(id) : byId[id].name })) });
    const byFamily = families.map((f) => asGroup(`Wada · ${f.name}`, f.colors));
    const byChapter = chapters.map((ch) => asGroup(`Wada · ${ch.name}`, ch.colors));
    const brandGroups = palettes.map((p) => ({
      name: `Brand · ${p.name}`,
      colors: roleEntries(p.roles).map(([k, v]) => ({ ...byId[v], label: `${k} · ${byId[v].name}` })),
    }));
    for (const [folder, model] of [['print-cmyk', 'CMYK'], ['screen-rgb', 'RGB']]) {
      const base = `design-apps/adobe/${folder}`;
      if (brandGroups.length) write(`${base}/brand.ase`, ase(brandGroups, model));
      write(`${base}/wada-by-family.ase`, ase(byFamily, model));
      write(`${base}/wada-by-chapter.ase`, ase(byChapter, model));
      for (const g of comboGroups) {
        write(
          `${base}/combinations-${g.size}-colour.ase`,
          ase(g.combinations.map((id) => asGroup(`Wada ${comboById[id].code}`, comboById[id].colors)), model),
        );
      }
    }
  }

  // Canva brand kit (hex list) and GIMP / Inkscape / Krita (.gpl)
  {
    let txt = 'Paste these hex codes into Canva > Brand Kit > Colours.\n\n';
    for (const p of palettes) {
      txt += `${p.name} (combination ${pad(p.combination)}, ${p.mode})\n`;
      for (const [k, v] of roleEntries(p.roles)) txt += `  ${k.padEnd(10)} ${hex(v)}  ${byId[v].name}\n`;
      txt += '\n';
    }
    write('design-apps/canva/brand-colors.txt', txt);

    const row = (c) => `${c.rgb.map((v) => String(v).padStart(3)).join(' ')}\t${c.name}\n`;
    let all = 'GIMP Palette\nName: Wada - All colours by family\nColumns: 8\n#\n';
    for (const f of families) {
      all += `# ${f.name}\n`;
      for (const id of f.colors) all += row(byId[id]);
    }
    write('design-apps/gimp-inkscape-krita/wada-by-family.gpl', all);
    for (const p of palettes) {
      let g = `GIMP Palette\nName: ${config.name} - ${p.name}\nColumns: 4\n#\n`;
      for (const [k, v] of roleEntries(p.roles)) g += row({ ...byId[v], name: `${k} - ${byId[v].name}` });
      write(`design-apps/gimp-inkscape-krita/brand-${p.name}.gpl`, g);
    }
  }

  // -------------------------------------------------------------- summary
  const low = combinations.filter((c) => c.roles.light.inkUse !== 'body').length;
  const lines = [
    `colour: ${colors.length} colours in ${families.length} families, ${combinations.length} combinations, ${palettes.length} brand palette(s)`,
    `  ${low} combinations use the fallback text colour in light mode (ink contrast < ${MIN_TEXT_CONTRAST}:1)`,
  ];
  for (const p of palettes) {
    const r = p.roles;
    lines.push(`  brand ${p.name}: #${pad(p.combination)} bg ${r.bg}, ink ${r.ink} (${r.contrast.inkOnBg}:1), accent ${r.accent}`);
  }
  return lines;
}

// Adobe Swatch Exchange writer. groups: [{ name, colors: [{ name|label, rgb, cmyk }] }]
function ase(groups, model) {
  const chunks = [];
  const str = (s) => {
    const b = Buffer.alloc(2 + (s.length + 1) * 2);
    b.writeUInt16BE(s.length + 1, 0);
    for (let i = 0; i < s.length; i++) b.writeUInt16BE(s.charCodeAt(i), 2 + i * 2);
    return b;
  };
  let count = 0;
  const block = (type, body) => {
    const h = Buffer.alloc(6);
    h.writeUInt16BE(type, 0);
    h.writeUInt32BE(body.length, 2);
    chunks.push(h, body);
    count++;
  };
  for (const g of groups) {
    block(0xc001, str(g.name));
    for (const c of g.colors) {
      const vals = model === 'CMYK' ? c.cmyk.map((v) => v / 100) : c.rgb.map((v) => v / 255);
      const body = Buffer.alloc(4 + vals.length * 4 + 2);
      body.write(model === 'CMYK' ? 'CMYK' : 'RGB ', 0, 'ascii');
      vals.forEach((v, i) => body.writeFloatBE(v, 4 + i * 4));
      body.writeUInt16BE(2, 4 + vals.length * 4); // normal (process) colour
      block(0x0001, Buffer.concat([str(c.label || c.name), body]));
    }
    block(0xc002, Buffer.alloc(0));
  }
  const head = Buffer.alloc(12);
  head.write('ASEF', 0, 'ascii');
  head.writeUInt16BE(1, 4);
  head.writeUInt16BE(0, 6);
  head.writeUInt32BE(count, 8);
  return Buffer.concat([head, ...chunks]);
}
