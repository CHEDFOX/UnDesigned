#!/usr/bin/env node
// Checks marketing copy against the UnDesigned messaging playbook.
//   npm run check:copy                          every *.copy.json in templates/
//   npm run check:copy:examples                 the worked examples (one passes, one fails on purpose)
//   npm run check:copy -- path/to/file.copy.json
// A .copy.json file holds one piece ({ format, headline, ... }) or a list of them.
// Exits with code 1 when any piece has errors.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadMessaging } from '../foundations/messaging/context.mjs';
import { checkCopy } from '../foundations/messaging/lint.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { ctx, principles } = loadMessaging(root);
const ruleById = Object.fromEntries(principles.principles.map((p) => [p.id, p]));
const bookById = Object.fromEntries(principles.books.map((b) => [b.id, b]));

const tty = process.stdout.isTTY;
const paint = (code, s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const LEVEL = { error: paint('31', 'ERROR'), warn: paint('33', 'WARN '), tip: paint('36', 'TIP  ') };

function collect(p, out) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const f of readdirSync(p)) if (f !== 'node_modules' && !f.startsWith('.')) collect(join(p, f), out);
  } else if (p.endsWith('.copy.json')) out.push(p);
  return out;
}

const args = process.argv.slice(2);
const targets = args.length ? args : [join(root, 'templates')];
const files = targets.flatMap((t) => collect(t, []));
if (!files.length) {
  console.log('No *.copy.json files found.');
  process.exit(0);
}

let errors = 0;
let warnings = 0;
for (const file of files) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const pieces = Array.isArray(data) ? data : data.pieces || [data];
  for (const [i, piece] of pieces.entries()) {
    const results = checkCopy(piece, ctx);
    const label = `${relative(root, file)}${pieces.length > 1 ? ` #${i + 1}` : ''} (${piece.format})`;
    const e = results.filter((r) => r.level === 'error').length;
    errors += e;
    warnings += results.filter((r) => r.level === 'warn').length;
    console.log(`\n${paint('1', label)}  ${piece.headline ? `"${piece.headline}"` : ''}`);
    if (!results.length) console.log(`  ${paint('32', 'PASS ')} Meets every rule.`);
    for (const r of results) {
      const rule = r.principle && ruleById[r.principle];
      const src = rule ? paint('2', `  [${r.principle} ${bookById[rule.book].title}]`) : '';
      console.log(`  ${LEVEL[r.level]} ${r.message}${src}`);
    }
  }
}
console.log(`\n${files.length} file(s): ${errors} error(s), ${warnings} warning(s).`);
process.exit(errors ? 1 : 0);
