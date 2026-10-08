#!/usr/bin/env node
// Builds the design system for every brand in products/ (or one), into dist/<brand>/,
// plus the system hub at dist/hub/index.html.
//   node scripts/build.mjs                 all brands
//   node scripts/build.mjs sample-bakery   one brand (the system hub still lists all built brands)
// Zero dependencies (Node 18+).

import { rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listBrands, loadBrand } from './products.mjs';
import { buildColor } from '../foundations/color/build.mjs';
import { buildTypography } from '../foundations/typography/build.mjs';
import { buildApproach } from '../approaches/build.mjs';
import { buildMessaging } from '../foundations/messaging/build.mjs';
import { buildHub } from '../tools/brand-hub/build.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const all = listBrands(root);
const only = process.argv[2];
if (only && !all.includes(only)) {
  console.error(`Unknown brand "${only}". Brands: ${all.join(', ')}`);
  process.exit(1);
}

// Order matters: approach reads the colour tokens.
const STEPS = [buildColor, buildTypography, buildApproach, buildMessaging];

if (!only) rmSync(join(root, 'dist'), { recursive: true, force: true });
for (const id of only ? [only] : all) {
  const brand = loadBrand(root, id);
  const dist = join(root, 'dist', id);
  rmSync(dist, { recursive: true, force: true });
  console.log(`\n${brand.config.name} (products/${id}) -> dist/${id}/`);
  for (const step of STEPS) for (const line of step({ root, dist, brand })) console.log('  ' + line);
}

// Hubs: one per brand, plus the system hub with a brand switcher.
const built = all.filter((id) => existsSync(join(root, 'dist', id, 'tokens', 'messaging.json')));
for (const line of buildHub({ root, brands: built.map((id) => loadBrand(root, id)) })) console.log(line);
console.log('Done.');
