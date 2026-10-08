// Design system hub: one self-contained page showing the whole guide, applied to
// each product. Runs after the foundations, reading their tokens from dist/<product>/tokens/.
//   dist/hub/index.html             every product, with a switcher
//   dist/<product>/brand-hub/index.html   one product only (to share with a client or designer)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadMessaging } from '../../foundations/messaging/context.mjs';
import { loadPairings, loadHandwritten, googleFontsUrl } from '../../foundations/typography/build.mjs';
import { copyFiles } from '../../scripts/products.mjs';
import { listApproaches, loadApproach, renderSample, samplePalette, springEasing } from '../../approaches/build.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

export function buildHub({ root, brands }) {
  if (!brands.length) return ['hub: no built products'];
  const tok = (id, name) => JSON.parse(readFileSync(join(root, 'dist', id, 'tokens', name), 'utf8'));
  const first = tok(brands[0].id, 'colors.json');
  const firstMsg = tok(brands[0].id, 'messaging.json');
  const pairings = loadPairings();
  const handwritten = loadHandwritten();

  const approaches = {};
  const items = brands.map((brand) => {
    const color = tok(brand.id, 'colors.json');
    const msg = tok(brand.id, 'messaging.json');
    const approach = tok(brand.id, 'approach.json');
    const type = tok(brand.id, 'typography.json');
    const { ctx } = loadMessaging(root, brand);
    if (!approaches[approach.id]) {
      const { palettes, springsCss, ...data } = approach;
      const researchFile = join(root, 'approaches', approach.id, 'research.md');
      approaches[approach.id] = {
        data,
        springsCss,
        images: refImages(root, approach.id, approach.references),
        research: existsSync(researchFile) ? mdToHtml(readFileSync(researchFile, 'utf8')) : '',
      };
    }
    const { filled, total } = msg.fill;
    const campaigns = copyFiles(join(brand.dir, 'campaigns')).flatMap((f) => {
      const d = JSON.parse(readFileSync(f, 'utf8'));
      const pieces = Array.isArray(d) ? d : d.pieces || [d];
      return pieces.map((piece, i) => {
        const { $comment, $expect, ...clean } = piece;
        return { path: relative(brand.dir, f) + (pieces.length > 1 ? ` #${i + 1}` : ''), piece: clean };
      });
    });
    const status = brand.config.color.status;
    return {
      id: brand.id,
      name: brand.config.name,
      prefix: brand.config.prefix,
      approach: approach.id,
      sample: /SAMPLE/.test(brand.config.$comment || ''),
      colorStatus: status,
      palettes: color.brand,
      illPalettes: approach.palettes,
      message: msg.message,
      fill: msg.fill,
      ctx,
      campaigns,
      typography: { pairing: type.pairing.id, hand: type.hand ? type.hand.id : null, ratio: type.ratio, sizes: type.sizes },
      layers: [
        { name: 'Approach', state: 'done', detail: `${approach.name}: ${approach.principles.length} principles, research dossier, art, motion and type data, rules for ${approach.layers.length} layers.` },
        { name: 'Colour', state: status === 'chosen' ? 'done' : 'part', detail: `${color.brand.length} palette(s) from ${first.combinations.length} Wada combinations${status === 'chosen' ? '' : ' (stand-in, not chosen yet)'}.` },
        { name: 'Typography', state: 'done', detail: `${type.pairing.name}: ${type.pairing.display.family} + ${type.pairing.body.family}${type.hand ? `, hand accent ${type.hand.family}` : ''}, scale ${type.ratio}.` },
        { name: 'Messaging', state: filled === total ? 'done' : 'part', detail: `Playbook and checker ready. Message ${filled} of ${total} fields filled in; ${campaigns.length} campaign piece(s).` },
        { name: 'Layout', state: 'done', detail: 'Grids, margins, safe areas, hierarchy and compositions per format, from 17 sourced findings (foundations/layout).' },
        { name: 'Templates', state: 'part', detail: 'Layout templates for every format (templates/layouts), rendered in this product\'s colours and copy. Finished poster and social designs per campaign come next.' },
      ],
    };
  });

  // Style library: every approach, with research, data and sample posters.
  const hexOf = Object.fromEntries(first.colors.map((c) => [c.id, c.hex]));
  const byHex = (id) => hexOf[id];
  const comboById = Object.fromEntries(first.combinations.map((c) => [c.id, c]));
  const recNum = (r) => +(r.combination ?? r.id ?? r.number ?? r.code);
  const styles = [];
  for (const id of listApproaches()) {
    let a;
    try { a = loadApproach(id); } catch (e) { console.warn(`hub: skipped approach ${id}: ${e.message}`); continue; }
    const recs = ((a.art && a.art.palette && a.art.palette.recommendedCombinations) || []).filter((r) => comboById[recNum(r)]);
    const own = recs.length ? comboById[recNum(recs[0])] : first.combinations[0];
    const firstSentence = (t) => { const f = String(t || '').split(/(?<=[.:;])\s/)[0].replace(/[.:;]$/, ''); return f.length > 80 ? f.slice(0, f.lastIndexOf(' ', 78)) : f; };
    const copy = { headline: a.name, subhead: firstSentence(a.summary), brand: 'UnDesigned' };
    const samples = { own: renderSample(id, samplePalette(own, own.roles.light, byHex), copy, a) };
    for (const item of items) {
      const p = item.palettes.find((x) => x.name === 'primary') || item.palettes[0];
      if (p) samples[item.id] = renderSample(id, samplePalette(comboById[p.combination], p.roles, byHex), { headline: item.message.oneLiner && item.message.oneLiner.result ? item.message.oneLiner.result : a.name, subhead: firstSentence(a.summary), brand: item.name }, a);
    }
    const researchFile = join(root, 'approaches', id, 'research.md');
    const springs = Object.fromEntries(Object.entries((a.motion && a.motion.springs) || {}).map(([k, sp]) => [k, springEasing(sp)]));
    styles.push({
      id, name: a.name, summary: a.summary, status: a.status, principles: a.principles || [], layers: a.layers || [], evidence: a.evidence || null,
      palette: a.art ? a.art.palette : null, art: a.art || {}, motion: a.motion || {}, springsCss: springs, typography: a.typography || {},
      ownCombination: own.id, recommended: recs.map((r) => ({ ...r, combination: recNum(r) })),
      research: existsSync(researchFile) ? mdToHtml(readFileSync(researchFile, 'utf8')) : '',
      samples, usedBy: items.filter((it) => it.approach === id).map((it) => it.id),
    });
  }
  // Brain research: built styles' own evidence replaces our earlier estimates.
  const research = JSON.parse(readFileSync(join(root, 'foundations/research/visual-preference.json'), 'utf8'));
  const built = styles.filter((st) => st.evidence && st.evidence.scores);
  const covered = new Set([...built.map((st) => st.id), 'mid-century', 'maximalist']);
  research.styles.list = [
    ...built.map((st) => ({ id: st.id, name: st.name, status: st.id === 'humanist-minimal' ? 'ours' : 'built', scores: st.evidence.scores, summary: st.summary, watch: st.evidence.watch || (st.evidence.beyondPreference ? 'Wins beyond liking: ' + winLabels(st.evidence.beyondPreference).join('; ') : '') })),
    ...research.styles.list.filter((st) => !covered.has(st.id)),
  ];

  const shared = {
    builtAt: new Date().toISOString().slice(0, 10),
    colors: first.colors,
    families: first.families,
    chapters: first.chapters,
    combinations: first.combinations,
    messaging: { books: firstMsg.books, stages: firstMsg.stages, principles: firstMsg.principles, formats: firstMsg.formats },
    approaches,
    pairings: pairings.pairings,
    typeRules: pairings.rules,
    handwritten,
    layout: JSON.parse(readFileSync(join(root, 'foundations/layout/layout.json'), 'utf8')),
    media: JSON.parse(readFileSync(join(root, 'foundations/layout/media.json'), 'utf8')),
    layouts: [
      ...JSON.parse(readFileSync(join(root, 'templates/layouts/layouts.json'), 'utf8')).layouts,
      ...listApproaches().flatMap((id) => {
        const f = join(root, 'approaches', id, 'layouts.json');
        if (!existsSync(f)) return [];
        const d = JSON.parse(readFileSync(f, 'utf8'));
        return (d.layouts || d).map((l) => ({ ...l, approach: id }));
      }),
    ],
    handResearch: JSON.parse(readFileSync(join(root, 'foundations/research/handwriting.json'), 'utf8')),
    research,
    styles,
  };
  const lint = readFileSync(join(root, 'foundations/messaging/lint.mjs'), 'utf8').replace(/^export /gm, '') +
    '\nconst renderLayout = (() => {\n' + readFileSync(join(root, 'templates/layouts/render.mjs'), 'utf8').replace(/^export default .*$/m, '').replace(/^export /gm, '') + '\nreturn renderLayout;\n})();\n' +
    'const Overlay = (() => {\n' + readFileSync(join(root, 'templates/layouts/overlay.mjs'), 'utf8').replace(/^export default .*$/m, '').replace(/^export /gm, '') + '\nreturn { analyseRegion, recommendTreatment, findCalmRegion, gridCandidates, contrastRatio };\n})();\n';
  const libs = Object.keys(approaches)
    .map((id) => `${JSON.stringify(id)}: (() => {\n${readFileSync(join(root, 'approaches', id, 'illustration.mjs'), 'utf8').replace(/^export /gm, '')}\nreturn createIllustrator;\n})()`)
    .join(',\n');
  const fonts = googleFontsUrl([...pairings.pairings.flatMap((p) => [p.display, p.body, p.mono]), ...handwritten.fonts]);
  const tpl = readFileSync(join(HERE, 'template.html'), 'utf8');

  const page = (list) =>
    tpl
      .replace('<!--__PAIRING_FONTS__-->', `<link rel="stylesheet" href="${fonts}">`)
      .replace('/*__DATA__*/null', () => JSON.stringify({ ...shared, brands: list }))
      .replace('/*__LINT__*/', () => lint)
      .replace('/*__ILLUSTRATION__*/', () => `const APPROACH_LIBS = {\n${libs}\n};`);
  const doc = (body) => `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
  const out = (p, body) => {
    mkdirSync(dirname(join(root, p)), { recursive: true });
    writeFileSync(join(root, p), doc(body));
  };

  out('dist/hub/index.html', page(items));
  for (const item of items) out(`dist/${item.id}/brand-hub/index.html`, page([item]));
  return [`\nhub: dist/hub/index.html (${items.length} products) and dist/<product>/brand-hub/index.html`];
}

// Reference images (stills and frame strips) embedded as data URIs so the page is self-contained.
function refImages(root, approachId, refs) {
  const out = {};
  const dir = join(root, 'approaches', approachId, 'references');
  for (const r of refs || []) {
    for (const f of [r.frames, r.file.endsWith('.jpg') ? r.file : null]) {
      if (f && existsSync(join(dir, f))) out[f] = 'data:image/jpeg;base64,' + readFileSync(join(dir, f)).toString('base64');
    }
  }
  return out;
}

// Small Markdown-to-HTML converter for the research dossiers (headings, paragraphs,
// lists, tables, bold, italic, code, links). Input is our own repository text.
function mdToHtml(md) {
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (t) =>
    esc(t)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>')
      .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/(^|[\s(])(https?:\/\/[^\s)<]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (/^# /.test(l)) { i++; continue; }
    const h = l.match(/^(#{2,3}) (.*)/);
    if (h) { out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
    if (/^\|/.test(l)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const body = rows.filter((r, k) => k !== 1 || !/^\|[\s:|-]+\|$/.test(r));
      const [head, ...rest] = body;
      out.push(`<div class="rwrap"><table><thead><tr>${cells(head).map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rest.map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (/^(- |\d+\. )/.test(l)) {
      const ordered = /^\d+\. /.test(l);
      const items = [];
      while (i < lines.length && /^(- |\d+\. |  +\S)/.test(lines[i])) {
        if (/^(- |\d+\. )/.test(lines[i])) items.push(lines[i].replace(/^(- |\d+\. )/, ''));
        else items[items.length - 1] += ' ' + lines[i].trim();
        i++;
      }
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }
    if (!l.trim()) { i++; continue; }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#|\||- |\d+\. )/.test(lines[i])) para.push(lines[i++]);
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return out.join('\n');
}

// Short labels for an evidence.beyondPreference value (string, or list of objects with varying keys).
function winLabels(b) {
  if (typeof b === 'string') return [b];
  return [].concat(b).map((x) => (typeof x === 'string' ? x : x.wins || x.win || x.effect || x.what || x.title || Object.values(x).find((v) => typeof v === 'string') || ''));
}
