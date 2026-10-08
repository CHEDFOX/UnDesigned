#!/usr/bin/env node
// Builds every foundation of the UnDesigned design system into dist/.
//   node scripts/build.mjs           all foundations
//   node scripts/build.mjs color     one foundation
// Zero dependencies (Node 18+).

import { readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildColor } from '../foundations/color/build.mjs';
import { buildMessaging } from '../foundations/messaging/build.mjs';
import { buildApproach } from '../foundations/approach/build.mjs';
import { buildHub } from '../tools/brand-hub/build.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const config = JSON.parse(readFileSync(join(root, 'config/brand.config.json'), 'utf8'));

// Add new foundations here as they are built (typography, layout ...).
// Order matters: approach reads the colour tokens.
const FOUNDATIONS = { color: buildColor, approach: buildApproach, messaging: buildMessaging };

const only = process.argv[2];
if (only && !FOUNDATIONS[only]) {
  console.error(`Unknown foundation "${only}". Available: ${Object.keys(FOUNDATIONS).join(', ')}`);
  process.exit(1);
}
if (!only) rmSync(dist, { recursive: true, force: true });

for (const [name, build] of Object.entries(FOUNDATIONS)) {
  if (only && name !== only) continue;
  for (const line of build({ root, dist, config })) console.log(line);
}
// The brand hub shows every foundation, so it is rebuilt after any of them.
for (const line of buildHub({ root, dist, config })) console.log(line);
console.log('Done -> dist/');
