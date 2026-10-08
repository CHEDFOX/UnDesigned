// Loads the messaging sources and config/messaging.json into one object.
// Shared by build.mjs and scripts/check-copy.mjs.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatIndex } from './lint.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const readJSON = (p) => JSON.parse(readFileSync(p, 'utf8'));

export function loadMessaging(root, brandConfig) {
  const principles = readJSON(join(HERE, 'source/principles.json'));
  const formats = readJSON(join(HERE, 'source/formats.json')).groups;
  const words = readJSON(join(HERE, 'source/cliches.json'));
  const message = readJSON(join(root, 'config/messaging.json'));
  const config = brandConfig || readJSON(join(root, 'config/brand.config.json'));

  const paletteModes = {};
  for (const [name, p] of Object.entries((config.color || {}).palettes || {})) paletteModes[name] = p.mode === 'dark' ? 'dark' : 'light';

  const ctx = {
    formats: formatIndex(formats),
    cliches: words.cliches,
    dated: words.dated,
    weakCtas: words.weakCtas,
    brandNames: [message.brandName, ...(message.brandNameVariants || [])].filter(Boolean),
    avoidWords: ((message.voice || {}).avoidWords || []).map((w) => w.toLowerCase()),
    paletteModes,
  };
  return { principles, formats, words, message, ctx };
}
