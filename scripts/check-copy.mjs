#!/usr/bin/env node
// Checks marketing copy against the messaging playbook, using each file's brand
// (from its folder, products/<id>/...) for the brand name, palettes and avoid-words.
//   npm run check:copy                              every *.copy.json under products/
//   npm run check:copy -- products/sample-bakery      one brand or folder
//   npm run check:copy -- my.copy.json --brand undesigned   a file outside products/
// A .copy.json file holds one piece ({ format, headline, ... }) or a list of them.
// Exits with code 1 when any piece has errors.

import { readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadMessaging } from '../foundations/messaging/context.mjs';
import { checkCopy } from '../foundations/messaging/lint.mjs';
import { listBrands, loadBrand, brandOfPath, copyFiles } from './products.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = args.indexOf('--brand');
const forced = flag >= 0 ? args.splice(flag, 2)[1] : null;
const targets = args.length ? args.map((a) => resolve(a)) : [join(root, 'products')];
const files = targets.flatMap((t) => copyFiles(t)).filter((f) => !relative(root, f).split(/[\\/]/)[1]?.startsWith('_'));
if (!files.length) {
  console.log('No *.copy.json files found.');
  process.exit(0);
}

const cache = {};
const contextFor = (id) => (cache[id] ||= loadMessaging(root, loadBrand(root, id)));

const tty = process.stdout.isTTY;
const paint = (code, s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const LEVEL = { error: paint('31', 'ERROR'), warn: paint('33', 'WARN '), tip: paint('36', 'TIP  ') };

let errors = 0;
let warnings = 0;
for (const file of files) {
  const id = brandOfPath(root, file) || forced;
  if (!id) {
    console.log(`\n${relative(root, file)}: not inside products/<id>/; pass --brand <id> (${listBrands(root).join(', ')}).`);
    errors++;
    continue;
  }
  const { ctx, principles } = contextFor(id);
  const ruleById = Object.fromEntries(principles.principles.map((p) => [p.id, p]));
  const bookById = Object.fromEntries(principles.books.map((b) => [b.id, b]));
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const pieces = Array.isArray(data) ? data : data.pieces || [data];
  // "$expect": "errors" marks a deliberately weak example: shown, but not counted.
  const demo = data.$expect === 'errors';
  for (const [i, piece] of pieces.entries()) {
    const results = checkCopy(piece, ctx);
    if (!demo) {
      errors += results.filter((r) => r.level === 'error').length;
      warnings += results.filter((r) => r.level === 'warn').length;
    }
    console.log(`\n${paint('1', `${relative(root, file)}${pieces.length > 1 ? ` #${i + 1}` : ''} (${piece.format})`)}  ${piece.headline ? `"${piece.headline}"` : ''}${demo ? paint('2', '  (weak example: findings expected, not counted)') : ''}`);
    if (!results.length) console.log(`  ${paint('32', 'PASS ')} Meets every rule.`);
    for (const r of results) {
      const rule = r.principle && ruleById[r.principle];
      console.log(`  ${LEVEL[r.level]} ${r.message}${rule ? paint('2', `  [${r.principle} ${bookById[rule.book].title}]`) : ''}`);
    }
  }
}
console.log(`\n${files.length} file(s): ${errors} error(s), ${warnings} warning(s).`);
process.exit(errors ? 1 : 0);
