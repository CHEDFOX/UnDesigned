// npm run design -- <product> [campaign] [--png] [--only <piece-id>]
// Renders every piece in a product's campaign(s) from its copy files, in its style. See tools/design/engine.mjs.
import { designCampaign } from '../tools/design/engine.mjs';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const onlyAt = args.indexOf('--only');
const only = onlyAt >= 0 ? args[onlyAt + 1] : null;
const pos = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--only');
if (!pos[0]) { console.error('Usage: npm run design -- <product> [campaign] [--png] [--only <piece>]'); process.exit(1); }
const out = await designCampaign({ productId: pos[0], campaign: pos[1], png: flags.has('--png'), only });
console.log(`${out.length} piece(s) designed.`);
