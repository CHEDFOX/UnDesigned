// Preview a style skin: renders the test copy (preview-copy.json, a sample bakery) in any style, with that
// style's own recommended Wada combination, to tools/design/previews/<style>/ (+ a contact sheet with --png).
//   node tools/design/preview.mjs <style> [--png]
//   node tools/design/preview.mjs --all [--png]
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { designCampaign } from './engine.mjs';
const HERE = dirname(fileURLToPath(import.meta.url));
const pieces = JSON.parse(readFileSync(join(HERE, 'preview-copy.json'), 'utf8'));
const all = process.argv.includes('--all');
const styles = all ? readdirSync(join(HERE, '../../approaches')).filter((d) => existsSync(join(HERE, '../../approaches', d, 'skin.mjs'))) : [process.argv[2]];
if (!styles[0] || styles[0].startsWith('--')) { console.error('Usage: node tools/design/preview.mjs <style>|--all [--png]'); process.exit(1); }
for (const style of styles) {
  console.log(style);
  await designCampaign({ productId: 'sample-bakery', campaign: 'preview', pieces, approach: style, png: process.argv.includes('--png'), outRoot: join(HERE, 'previews', style), log: () => {} });
}
