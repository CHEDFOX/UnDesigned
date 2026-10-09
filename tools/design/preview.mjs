// Preview a style skin: renders the sample bakery's engine-test copy in any style, with that style's
// own recommended Wada combination, to tools/design/previews/<style>/.
//   node tools/design/preview.mjs <style> [--png]
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { designCampaign } from './engine.mjs';
const HERE = dirname(fileURLToPath(import.meta.url));
const style = process.argv[2];
if (!style) { console.error('Usage: node tools/design/preview.mjs <style> [--png]'); process.exit(1); }
await designCampaign({ productId: 'sample-bakery', campaign: 'engine-test', approach: style, png: process.argv.includes('--png'), outRoot: join(HERE, 'previews', style) });
