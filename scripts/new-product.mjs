#!/usr/bin/env node
// Creates a new brand from products/_template/.
//   npm run new-product -- "Acme Coffee"
//   npm run new-product -- "Acme Coffee" --palette 42 --pairing instrument --approach humanist-minimal --id acme
// Then edit products/<id>/brand.json and messaging.json, and run `npm run build`.

import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listBrands, loadBrand } from './products.mjs';
import { loadPairings } from '../foundations/typography/build.mjs';
import { listApproaches } from '../approaches/build.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : undefined;
};
const id0 = opt('id');
const palette = opt('palette');
const pairing = opt('pairing');
const approach = opt('approach');
const name = args.join(' ').trim();
if (!name) {
  console.error('Usage: npm run new-product -- "Brand Name" [--palette 1-348] [--pairing id] [--approach id] [--id folder-name]');
  process.exit(1);
}

const id = id0 || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const dir = join(root, 'products', id);
if (existsSync(dir)) {
  console.error(`products/${id} already exists. Pick another name or pass --id.`);
  process.exit(1);
}

// Short CSS prefix from the initials, unique among existing brands.
const taken = new Set(listBrands(root).map((b) => loadBrand(root, b).config.prefix));
const words = name.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
let prefix = (words.length > 1 ? words.map((w) => w[0]).join('') : words[0].slice(0, 2)).slice(0, 3) || 'b';
if (/^\d/.test(prefix)) prefix = 'b' + prefix;
for (let n = 2; taken.has(prefix); n++) prefix = prefix.replace(/\d+$/, '') + n;

if (pairing && !loadPairings().pairings.some((p) => p.id === pairing)) {
  console.error(`Unknown pairing "${pairing}". Available: ${loadPairings().pairings.map((p) => p.id).join(', ')}`);
  process.exit(1);
}
if (approach && !listApproaches().includes(approach)) {
  console.error(`Unknown approach "${approach}". Available: ${listApproaches().join(', ')}`);
  process.exit(1);
}
if (palette && !(+palette >= 1 && +palette <= 348)) {
  console.error('--palette must be a combination number from 1 to 348.');
  process.exit(1);
}

cpSync(join(root, 'products/_template'), dir, { recursive: true });
const file = join(dir, 'brand.json');
const cfg = JSON.parse(readFileSync(file, 'utf8'));
cfg.$comment = `Brand settings for ${name}. Edit, then run \`npm run build\`.`;
cfg.name = name;
cfg.prefix = prefix;
if (approach) cfg.approach = approach;
if (palette) cfg.color.palettes.primary.combination = +palette;
if (pairing) cfg.typography.pairing = pairing;
writeFileSync(file, JSON.stringify(cfg, null, 2) + '\n');

console.log(`Created products/${id}/ for "${name}" (CSS prefix "${prefix}").

Next:
  1. Pick palettes and a type pairing in the brand hub, then set them in products/${id}/brand.json
  2. Fill in products/${id}/messaging.json (positioning, one-liner, BrandScript, voice)
  3. Add logos and images to products/${id}/assets/
  4. npm run build -- ${id}      (outputs go to dist/${id}/)`);
