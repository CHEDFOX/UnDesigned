// Copy checker for the UnDesigned messaging playbook. Pure function, no I/O,
// so it runs in Node (scripts/check-copy.mjs) and in the browser (dist/web/js/messaging.mjs).
//
// checkCopy(piece, ctx) -> [{ level: 'error'|'warn'|'tip', check, principle, message }]
//   piece: { format, headline, subhead, body, cta, details, logo, palette: 'primary' | { combination, mode } }
//   ctx:   { formats: { [id]: format }, cliches, dated, weakCtas, brandNames, avoidWords, paletteModes }

export function checkCopy(piece, ctx) {
  const out = [];
  const add = (level, check, principle, message) => out.push({ level, check, principle, message });
  const fields = ['headline', 'subhead', 'body', 'cta', 'details'];
  const text = (f) => (typeof piece[f] === 'string' ? piece[f].trim() : '');
  const words = (s) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’&.-]*/gu) || []).length;
  const all = fields.map(text).filter(Boolean).join('\n');
  const lower = all.toLowerCase();
  const has = (phrase, hay = lower) => new RegExp(`(^|[^\\p{L}\\p{N}])${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}\\p{N}])`, 'u').test(hay);

  const format = ctx.formats[piece.format];
  if (!format) {
    add('error', 'format', null, `Unknown format "${piece.format}". Use one of: ${Object.keys(ctx.formats).join(', ')}.`);
    return out;
  }

  // Required parts (O3, S6, S8)
  for (const req of format.requires) {
    if (req === 'brand') continue;
    if (!text(req)) {
      const why = { headline: 'O3: the headline carries the message', cta: 'S6: always give the next step', subhead: 'S8: say how life gets better', details: 'add date, time and place' }[req];
      add('error', 'required', req === 'cta' ? 'S6' : req === 'headline' ? 'O3' : 'S8', `${format.name} needs a ${req} (${why}).`);
    }
  }

  // Word limits (W6)
  for (const f of ['headline', 'subhead', 'body', 'cta']) {
    const n = words(text(f));
    const max = format.limits[f];
    if (max === undefined || !n) continue;
    if (max === 0) add('error', 'word-limits', 'W6', `${format.name} should have no ${f}; found ${n} words.`);
    else if (n > max) add('error', 'word-limits', 'W6', `${cap(f)} is ${n} words; ${format.name} allows ${max}. Cut ${n - max}.`);
  }

  // Brand name (O4)
  const names = ctx.brandNames.map((n) => n.toLowerCase());
  const inHeadline = names.some((n) => has(n, text('headline').toLowerCase()));
  const anywhere = names.some((n) => has(n));
  if (!inHeadline && !anywhere && !piece.logo) {
    add(format.requires.includes('brand') ? 'error' : 'warn', 'brand-name', 'O4', 'Brand name is missing and no logo is set ("logo": true). Skimmers will not know who it is from.');
  } else if (!inHeadline && !piece.logo) {
    add('tip', 'brand-name', 'O4', 'Brand name is not in the headline. Put it there, or place the logo beside the headline.');
  }

  // CTA quality (S6)
  const cta = text('cta').toLowerCase().replace(/[.!→>]+$/u, '').trim();
  if (cta && ctx.weakCtas.includes(cta)) add('warn', 'cta', 'S6', `"${text('cta')}" is a weak call to action. Say exactly what happens: "Book a free call", "Get the guide".`);

  // Customer as hero (S1)
  const you = (lower.match(/\b(you|your|yours|you're|you’re|yourself)\b/g) || []).length;
  const we = (lower.match(/\b(we|our|ours|us|we're|we’re|ourselves)\b/g) || []).length;
  if (we > you) add('warn', 'you-vs-we', 'S1', `Copy talks about us (${we}) more than the customer (${you}). Make the customer the hero.`);

  // Cliches and dated language (W4, P3), plus the brand's own banned words
  const found = (list) => {
    const hits = [...new Set(list.filter((p) => has(p)))];
    return hits.filter((h) => !hits.some((o) => o !== h && o.includes(h))); // keep the longest match only
  };
  for (const c of found(ctx.cliches)) add('warn', 'cliches', 'W4', `Cliche: "${c}". Replace it with something only ${ctx.brandNames[0]} could say.`);
  for (const d of found(ctx.dated)) add('warn', 'dated-language', 'P3', `"${d}" will date quickly. Prefer timeless wording.`);
  for (const a of found(ctx.avoidWords || [])) add('warn', 'voice', 'O11', `"${a}" is on this product's avoid list (messaging.json, voice.avoidWords).`);

  // Shouting (W7)
  if (text('headline').includes('!')) add('warn', 'exclamations', 'W7', 'Exclamation mark in the headline. Let the idea do the shouting.');
  else if ((all.match(/!/g) || []).length > 1) add('warn', 'exclamations', 'W7', 'More than one exclamation mark. Cut them.');

  // Readability (O7, O8)
  const isCaps = (s) => /\p{L}/u.test(s) && s === s.toUpperCase();
  if (words(text('body')) >= 4 && isCaps(text('body'))) add('warn', 'all-caps', 'O8', 'Body copy is in all capitals, which slows reading. Use sentence case.');
  if (words(text('headline')) > 6 && isCaps(text('headline'))) add('tip', 'all-caps', 'O8', 'Long all-caps headline. Consider sentence case for faster reading.');
  for (const s of text('body').split(/(?<=[.!?])\s+/)) {
    const n = words(s);
    if (n > 25) add('warn', 'long-sentences', 'O7', `Sentence of ${n} words in the body: "${s.slice(0, 50)}...". Split it.`);
  }
  const mode = typeof piece.palette === 'string' ? (ctx.paletteModes || {})[piece.palette] : piece.palette && piece.palette.mode;
  if (mode === 'dark' && words(text('body')) > 25) {
    add('warn', 'reverse-type', 'O8', 'Long body copy reversed out (dark palette). Keep long copy dark on light, or shorten it.');
  }

  // Specifics (O5)
  if (!/\d/.test([text('headline'), text('subhead'), text('body')].join(' '))) {
    add('tip', 'specifics', 'O5', 'No numbers or facts. A specific figure (time, price, result) usually persuades more.');
  }

  return out;
}

function cap(s) {
  return s[0].toUpperCase() + s.slice(1);
}

// Flattens formats.json groups into { id: format }.
export function formatIndex(groups) {
  const idx = {};
  for (const g of groups) for (const f of g.formats) idx[f.id] = { ...f, group: g.id };
  return idx;
}
