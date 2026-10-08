// Loads the messaging sources and a brand's messaging.json into one object.
// Shared by build.mjs and scripts/check-copy.mjs.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatIndex } from './lint.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const readJSON = (p) => JSON.parse(readFileSync(p, 'utf8'));

export function loadMessaging(root, brand) {
  const principles = readJSON(join(HERE, 'source/principles.json'));
  const formats = readJSON(join(HERE, 'source/formats.json')).groups;
  const words = readJSON(join(HERE, 'source/cliches.json'));
  const message = { brandName: brand.config.name, ...readJSON(join(brand.dir, 'messaging.json')) };
  const config = brand.config;

  const paletteModes = {};
  for (const [name, p] of Object.entries((config.color || {}).palettes || {})) paletteModes[name] = p.mode === 'dark' ? 'dark' : 'light';

  const ctx = {
    formats: formatIndex(formats),
    cliches: words.cliches,
    dated: words.dated,
    weakCtas: words.weakCtas,
    brandNames: [config.name, ...(config.nameVariants || [])].filter(Boolean),
    avoidWords: ((message.voice || {}).avoidWords || []).map((w) => w.toLowerCase()),
    paletteModes,
  };
  return { principles, formats, words, message, ctx };
}
