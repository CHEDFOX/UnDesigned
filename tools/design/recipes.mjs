// The recipe library: the most likable complete combinations of the guide's components for each general mood,
// composed once from the research (foundations/combinations) and saved to foundations/combinations/recipes.json.
// Any chat or designer picks a recipe by mood or use and creates directly; no product needed.
//
//   npm run recipes            build recipes.json (3 per mood)
//   npm run recipes -- --render   also render a sample poster per recipe into tools/design/recipes/ (+ catalogue sheet)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rank, colourModel } from './compose.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const json = (f) => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));
const R = json('foundations/combinations/combinations.json');
const AX = ['roundness', 'activity', 'potency', 'warmth', 'hand'];
const r2 = (n) => Math.round(n * 100) / 100;
const PER_MOOD = 3;
const dE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const tokensFile = ['undesigned', 'sample-bakery', 'tailzu'].map((p) => `dist/${p}/tokens/colors.json`).find((f) => existsSync(join(ROOT, f)));
if (!tokensFile) { console.error('Run npm run build first.'); process.exit(1); }
const tokens = json(tokensFile);
const colors = Array.isArray(tokens.colors) ? tokens.colors : Object.values(tokens.colors);
const M = colourModel(colors);
const pairings = Object.fromEntries(json('foundations/typography/source/pairings.json').pairings.map((p) => [p.id, p]));
const hands = Object.fromEntries(json('foundations/typography/source/handwritten.json').fonts.map((h) => [h.id, h]));

const recipes = [];
// Range across the library: a palette, or a style + palette pair, used by earlier recipes counts down for later ones.
const usedPal = {}, usedPair = {};
const pk = (r) => `${r.pal.id}-${r.pal.mode}`;
for (const [moodId, mood] of Object.entries(R.moods)) {
  if (moodId === '$comment') continue;
  const T = mood.axes;
  const results = rank(T, { tokens, M, liking: true }).filter((r) => R.styles[r.style].general !== false);
  // Pick one at a time. Each pick: a style not yet used in this mood (a repeat only when no other style comes within
  // 0.08, and then with a clearly different ground); palettes and style + palette pairs already used anywhere count down.
  const picked = [];
  const adj = (r) => r.score - 0.05 * (usedPal[pk(r)] || 0) - 0.1 * (usedPair[`${r.style}:${pk(r)}`] || 0);
  while (picked.length < PER_MOOD) {
    let best = null, bestNew = null;
    for (const r of results) {
      if (picked.includes(r) || picked.some((p) => pk(p) === pk(r))) continue;
      if (picked.some((p) => p.style === r.style && dE(M[p.pal.roles.bg].lab, M[r.pal.roles.bg].lab) <= 20)) continue;
      const a = adj(r);
      if (!best || a > best.a) best = { r, a };
      if (!picked.some((p) => p.style === r.style) && (!bestNew || a > bestNew.a)) bestNew = { r, a };
    }
    const take = bestNew && (!best || bestNew.a >= best.a - 0.08) ? bestNew : best;
    if (!take) break;
    take.r.adj = take.a;
    picked.push(take.r);
    usedPal[pk(take.r)] = (usedPal[pk(take.r)] || 0) + 1;
    usedPair[`${take.r.style}:${pk(take.r)}`] = (usedPair[`${take.r.style}:${pk(take.r)}`] || 0) + 1;
  }
  picked.forEach((r, i) => {
    const typo = json(`approaches/${r.style}/typography.json`);
    const handUse = typo.handwritten?.use || 'none';
    const hand = handUse !== 'none' && T.hand >= R.hand.useFrom ? (typo.handwritten.fonts || [])[0] || null : null;
    const roles = r.pal.roles;
    const c = (id) => ({ id, name: M[id].name, hex: M[id].hex });
    const art = json(`approaches/${r.style}/art.json`);
    const parts = Object.entries(r.liking.parts).sort((a, b) => (R.liking.parts[b[0]] * b[1]) - (R.liking.parts[a[0]] * a[1])).slice(0, 3).map(([k]) => k);
    recipes.push({
      id: `${moodId}-${i + 1}`,
      mood: moodId,
      name: `${mood.name} ${i + 1}`,
      useFor: mood.useFor,
      likability: Math.round(r.liking.total * 100),
      style: r.style,
      combination: r.pal.id,
      mode: r.pal.mode,
      colours: { ground: c(roles.bg), text: c(roles.text), accent: c(roles.accent), support: (roles.support || []).map(c), contrast: roles.contrast.textOnBg },
      pairing: r.pairing,
      type: { display: pairings[r.pairing].display.family, body: pairings[r.pairing].body.family },
      hand: hand ? { id: hand, family: hands[hand]?.family || hand, use: 'one short note, never body, prices, data, steps or buttons' } : null,
      motion: R.motion.byActivity.find((m) => T.activity < m.below).plan + ` How it moves: approaches/${r.style}/motion.json.`,
      compositions: (art.composition?.preferred || art.composition?.types || []).slice?.(0, 3) || [],
      axes: Object.fromEntries(AX.map((k) => [k, r2(r.composite[k])])),
      tension: r.tension ? { axis: r.tension[0], by: r2(r.tension[1]) } : null,
      why: `${R.styles[r.style].why} Liked mostly for ${parts.join(', ')} (${parts.map((k) => R.liking.why[k].split(':')[0]).join('; ')}). Ground and text ${roles.contrast.textOnBg}:1${r.rec ? '; palette from the style\'s own list' : ''}${r.fitLabel === 'core' ? '; pairing rated core by the style' : ''}.`,
    });
  });
}

const out = {
  $comment: 'Generated by npm run recipes from foundations/combinations/combinations.json and foundations/research/combinations.json; do not edit by hand (change the rules or profiles and rebuild). Each recipe is a complete, research-scored combination of the guide\'s components for a general mood. To use one: put { "recipe": "<id>" } in a campaign\'s campaign.json (the engine expands it), or read its parts. likability is general human liking on a 0-100 scale (unity, fluency, colour pleasure, harmony, variety, curvature, blue, typicality); it is not a product fit.',
  moods: Object.fromEntries(Object.entries(R.moods).filter(([k]) => k !== '$comment').map(([k, m]) => [k, { name: m.name, useFor: m.useFor, axes: m.axes, recipes: recipes.filter((r) => r.mood === k).map((r) => r.id) }])),
  recipes,
};
writeFileSync(join(ROOT, 'foundations/combinations/recipes.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`${recipes.length} recipes in foundations/combinations/recipes.json`);
for (const r of recipes) console.log(`  ${r.id.padEnd(20)} ${String(r.likability).padStart(3)}  ${r.style.padEnd(22)} Wada ${String(r.combination).padStart(3)} ${r.mode.padEnd(5)} ${r.colours.ground.name} / ${r.colours.text.name} / ${r.colours.accent.name}  ${r.pairing}${r.hand ? ' + ' + r.hand.id : ''}`);

if (process.argv.includes('--render')) {
  const { designCampaign } = await import('./engine.mjs');
  const outRoot = join(ROOT, 'tools/design/recipes');
  mkdirSync(outRoot, { recursive: true });
  for (const r of recipes) {
    const mood = R.moods[r.mood];
    const pieces = [{ id: r.id, format: 'poster', headline: mood.name, subhead: mood.useFor + '.', cta: `Recipe ${r.id}` }];
    await designCampaign({ productId: 'sample-bakery', campaign: r.id, pieces, config: { approach: r.style, combination: r.combination, mode: r.mode, pairing: r.pairing, hand: r.hand ? r.hand.id : null }, png: true, outRoot, log: () => {} });
    process.stdout.write('.');
  }
  console.log(`\nRendered into tools/design/recipes/`);
}
