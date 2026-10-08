// Brand hub: one self-contained page showing every foundation. Runs after the
// foundations, reading their generated tokens from dist/tokens/.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadMessaging } from '../../foundations/messaging/context.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

export function buildHub({ root, dist, config }) {
  const tokens = (name) => JSON.parse(readFileSync(join(dist, 'tokens', name), 'utf8'));
  const color = tokens('colors.json');
  const msg = tokens('messaging.json');
  const { ctx } = loadMessaging(root, config);

  const { filled, total } = msg.fill;

  const palettes = color.brand.length;
  const layers = [
    { id: 'colour', name: 'Colour', state: 'done', detail: `Done. ${color.colors.length} colours in ${color.families.length} families, ${color.combinations.length} combinations, ${palettes} brand palette (stand-in until chosen).` },
    { id: 'messaging', name: 'Messaging', state: filled ? (filled === total ? 'done' : 'part') : 'part', detail: `Playbook (${msg.principles.length} rules) and copy checker done. Brand message ${filled} of ${total} fields filled in.` },
    { id: 'typography', name: 'Typography', state: 'todo', detail: 'Next. Typefaces, type scale, weights.' },
    { id: 'layout', name: 'Layout', state: 'todo', detail: 'Planned. Grids, margins and safe areas per format.' },
    { id: 'templates', name: 'Templates', state: 'todo', detail: 'Planned. Posters, social and print, built on the foundations.' },
  ];

  const data = {
    prefix: color.meta.prefix,
    builtAt: new Date().toISOString().slice(0, 10),
    layers,
    colors: color.colors,
    families: color.families,
    chapters: color.chapters,
    combinations: color.combinations,
    brand: color.brand,
    messaging: { books: msg.books, stages: msg.stages, principles: msg.principles, formats: msg.formats, message: msg.message },
    ctx,
  };
  const lint = readFileSync(join(root, 'foundations/messaging/lint.mjs'), 'utf8').replace(/^export /gm, '');
  const body = readFileSync(join(HERE, 'template.html'), 'utf8')
    .replace('/*__DATA__*/null', () => JSON.stringify(data))
    .replace('/*__LINT__*/', () => lint);

  const out = join(dist, 'brand-hub/index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(
    out,
    `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n${body}\n</body>\n</html>\n`,
  );
  return [`brand hub: dist/brand-hub/index.html (${layers.filter((l) => l.state !== 'todo').length} of ${layers.length} layers shown)`];
}
