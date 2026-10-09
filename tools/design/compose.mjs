// The composer: picks a product's whole visual combination at once (style, Wada palette, type pairing,
// hand face, how much motion) from the combination rules in foundations/combinations/combinations.json,
// which come from the research in foundations/research/combinations.json.
//
//   npm run compose -- <product> [campaign] [--goal launch|trust|care|calm|celebrate|explain] [--style <id>] [--write] [--top 5]
//
// The target comes from identity.json (core.character, signals.colours) plus the goal. Every style x palette
// (348 combinations x light/dark) x pairing the style allows is scored; the best is explained rule by rule.
// --write saves it as campaigns/<campaign>/campaign.json, which the design engine then follows.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const json = (f) => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));
const AX = ['roundness', 'activity', 'potency', 'warmth', 'hand'];
const R = json('foundations/combinations/combinations.json');
const rule = (id) => R.rules.find((r) => r.id === id);
const clamp = (v, a = -1, b = 1) => Math.max(a, Math.min(b, v));
const r2 = (n) => Math.round(n * 100) / 100;
const QW = R.colour.qualityWeight ?? 0.2; // how much colour quality counts against fit

// ------------------------------------------------------------------ colour
function hexToLab(hex) {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const X = (v[0] * 0.4124 + v[1] * 0.3576 + v[2] * 0.1805) / 0.95047, Y = v[0] * 0.2126 + v[1] * 0.7152 + v[2] * 0.0722, Z = (v[0] * 0.0193 + v[1] * 0.1192 + v[2] * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
const dE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const hueOf = ([, a, b]) => ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
const chromaOf = ([, a, b]) => Math.hypot(a, b);
const hueDiff = (x, y) => { const d = Math.abs(hueOf(x) - hueOf(y)) % 360; return d > 180 ? 360 - d : d; };

function colourModel(colors) {
  const Ls = colors.map((c) => c.lab[0]), Cs = colors.map((c) => chromaOf(c.lab));
  const stat = (xs) => { const m = xs.reduce((a, b) => a + b, 0) / xs.length; const s = Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length); return [m, s]; };
  const [mL, sL] = stat(Ls), [mC, sC] = stat(Cs);
  const out = {};
  for (const c of colors) {
    const B = (c.lab[0] - mL) / sL, S = (chromaOf(c.lab) - mC) / sC;
    out[c.id] = {
      lab: c.lab, hex: c.hex, name: c.name,
      activity: clamp((-0.31 * B + 0.6 * S) / 2), // Valdez & Mehrabian (1994): arousal
      potency: clamp((-0.76 * B + 0.32 * S) / 2), // dominance
      warmth: clamp((chromaOf(c.lab) / 60) * Math.cos(((hueOf(c.lab) - 50) * Math.PI) / 180)), // direction of colour heat
    };
  }
  return out;
}

function paletteProfile(roles, M) {
  const A = R.colour.areas;
  const parts = [[roles.bg, A.ground], [roles.text, A.text], [roles.accent, A.accent], ...(roles.support || []).map((s) => [s, A.support / Math.max(1, roles.support.length)])];
  if (!(roles.support || []).length) parts[0][1] += A.support;
  const p = { activity: 0, potency: 0, warmth: 0 };
  let w = 0;
  for (const [id, a] of parts) { const c = M[id]; if (!c) continue; for (const k of Object.keys(p)) p[k] += c[k] * a; w += a; }
  for (const k of Object.keys(p)) p[k] = p[k] / w;
  return p;
}

function paletteQuality(roles, M, brandLabs) {
  const Q = R.colour.quality, notes = [];
  const g = M[roles.bg], t = M[roles.text], a = M[roles.accent];
  const c = roles.contrast.textOnBg;
  if (c < 4.5) return null;
  const legible = c >= Q.legibility.aaa ? Q.legibility.scoreAaa : Q.legibility.scoreAa;
  // Hue similarity needs two hues: a neutral ground or text counts as medium (Schloss & Palmer measured chromatic pairs).
  const sim = chromaOf(g.lab) < 10 || chromaOf(t.lab) < 10 ? 0.6 : 1 - hueDiff(g.lab, t.lab) / 180;
  const fig = a && roles.accent !== roles.bg && chromaOf(a.lab) >= 10 ? hueDiff(a.lab, g.lab) / 180 : 0.3;
  let q = legible * 0.3 + Q.groundTextHueSimilarity.weight * sim * 0.5 + Q.accentHueContrast.weight * fig * 0.5;
  // Ecological valence: the average dislike of olive / dark-yellow / brown grounds, unless the brand owns it.
  const D = Q.dislikedGround;
  const disliked = dE(g.lab, D.lab) < D.radius || (hueOf(g.lab) > 50 && hueOf(g.lab) < 110 && g.lab[0] < 55 && chromaOf(g.lab) > 12);
  const owned = brandLabs.some((b) => dE(b, g.lab) < D.unlessBrandWithin);
  if (disliked && !owned) { q -= D.penalty; notes.push(`C5: ${g.name} ground is in the range people dislike on average (Palmer & Schloss 2010)`); }
  let close = 0;
  if (brandLabs.length) {
    const near = (lab) => Math.min(...brandLabs.map((b) => dE(b, lab)));
    const s = (lab) => clamp(1 - near(lab) / R.colour.quality.brandCloseness.deltaEZero, 0, 1);
    close = (s(g.lab) * 0.6 + (a ? s(a.lab) : 0) * 0.4);
    q += close * 0.3;
  }
  return { q, contrast: c, sim, fig, close, notes };
}

// ------------------------------------------------------------------ type
function typeProfile(pairing) {
  const words = `${pairing.display.classification || ''} ${pairing.display.style || ''}`.toLowerCase();
  const sums = {}, n = {};
  for (const cue of R.typefaces.cues) {
    if (!new RegExp(cue.match).test(words)) continue;
    for (const k of AX) if (cue[k] !== undefined) { sums[k] = (sums[k] || 0) + cue[k]; n[k] = (n[k] || 0) + 1; }
  }
  // Type carries shape, energy, weight and hand, not temperature (warmth comes from colour and style).
  const p = {};
  for (const k of AX) if (k !== 'warmth') p[k] = n[k] ? sums[k] / n[k] : 0;
  const maxW = Math.max(...(pairing.display.weights || [400]));
  const W = R.typefaces.weight;
  if (maxW >= W.heavyFrom) p.potency = clamp(p.potency + W.heavy.potency);
  if (maxW <= W.lightTo && !/heavy|display/.test(words)) p.potency = clamp(p.potency + W.light.potency);
  return p;
}

// ------------------------------------------------------------------ target
function target(identity, goal) {
  const words = [].concat(identity.core?.character?.filter(Boolean).length ? identity.core.character : identity.voice?.is || []).join(' ').toLowerCase().split(/[^a-z-]+/).filter(Boolean);
  const sums = {}, n = {}, used = [], unknown = [];
  for (const w of words) {
    const e = R.lexicon[w] || R.lexicon[w.replace(/s$/, '')];
    if (!e) { if (!['not', 'and', 'the', 'a', 'of'].includes(w)) unknown.push(w); continue; }
    if (!Object.keys(e).length) continue;
    used.push(w);
    for (const k of AX) if (e[k] !== undefined) { sums[k] = (sums[k] || 0) + e[k]; n[k] = (n[k] || 0) + 1; }
  }
  const t = {};
  for (const k of AX) t[k] = n[k] ? sums[k] / n[k] : 0;
  if (goal) { const g = R.goals[goal]; if (!g) throw new Error(`Unknown goal "${goal}". Goals: ${Object.keys(R.goals).filter((k) => k !== '$comment').join(', ')}`); for (const k of AX) if (g[k] !== undefined) t[k] = clamp(t[k] + g[k]); }
  return { t, used, unknown };
}

// ------------------------------------------------------------------ scoring
// Axes the brand states strongly weigh more (salience): 0.5 + |target| per axis, times any rule weight.
let SAL = {};
const dist = (p, t, keys, wts = {}) => { const w = (k) => (wts[k] ?? 1) * (SAL[k] ?? 1); return keys.reduce((a, k) => a + w(k) * (p[k] - t[k]) ** 2, 0) / keys.reduce((a, k) => a + w(k), 0); };

export function compose(productId, { goal = null, style = null, top = 5 } = {}) {
  // The brand's core (identity.json); products without one fall back to their voice words (messaging.json).
  const identity = existsSync(join(ROOT, `products/${productId}/identity.json`)) ? json(`products/${productId}/identity.json`) : { voice: json(`products/${productId}/messaging.json`).voice };
  const brand = json(`products/${productId}/brand.json`);
  const tokensFile = `dist/${productId}/tokens/colors.json`;
  if (!existsSync(join(ROOT, tokensFile))) throw new Error(`Run npm run build -- ${productId} first.`);
  const tokens = json(tokensFile);
  const colors = Array.isArray(tokens.colors) ? tokens.colors : Object.values(tokens.colors);
  const M = colourModel(colors);
  const brandLabs = (identity.signals?.colours || []).flatMap((c) => String(c.hex || '').match(/#[0-9a-f]{6}/gi) || []).map(hexToLab);
  const { t: T, used, unknown } = target(identity, goal);
  SAL = Object.fromEntries(AX.map((k) => [k, 0.5 + Math.abs(T[k])]));
  const pairings = json('foundations/typography/source/pairings.json').pairings;
  const C1 = rule('C1').weight, C2 = rule('C2').axisWeights, C7 = rule('C7'), C11 = rule('C11').bonus;

  // Palettes once (they don't depend on the style except for its recommendations).
  const pals = [];
  for (const combo of tokens.combinations) for (const mode of ['light', 'dark']) {
    const roles = combo.roles[mode];
    if (!roles || roles.inkUse !== 'body') continue;
    const quality = paletteQuality(roles, M, brandLabs);
    if (!quality) continue;
    const prof = paletteProfile(roles, M);
    pals.push({ id: combo.id, mode, roles, prof, quality, fit: dist(prof, T, ['activity', 'potency', 'warmth']) });
  }

  const results = [];
  const styles = Object.keys(R.styles).filter((k) => k !== '$comment' && (!style || k === style));
  for (const s of styles) {
    const S = R.styles[s];
    const art = existsSync(join(ROOT, `approaches/${s}/art.json`)) ? json(`approaches/${s}/art.json`) : {};
    const typo = existsSync(join(ROOT, `approaches/${s}/typography.json`)) ? json(`approaches/${s}/typography.json`) : {};
    const rec = new Set((art.palette?.recommendedCombinations || []).map((r) => +(typeof r === 'object' ? r.combination ?? r.id : r)));
    const fits = typo.fit || {};
    const typeOptions = pairings.filter((p) => ['core', 'good'].includes(fits[p.id]?.fit));
    const styleFit = dist(S, T, AX);
    for (const p of typeOptions) {
      const tp = typeProfile(p);
      const typeFit = dist(tp, T, AX.filter((k) => tp[k] !== undefined), C2);
      // The best few palettes for this style and type.
      for (const pal of pals) {
        const composite = {};
        for (const k of AX) {
          const vals = [[S[k], C1.style]];
          if (tp[k] !== undefined) vals.push([tp[k], C1.type]);
          if (pal.prof[k] !== undefined) vals.push([pal.prof[k], C1.palette]);
          composite[k] = vals.reduce((a, [v, w]) => a + v * w, 0) / vals.reduce((a, [, w]) => a + w, 0);
        }
        // C1 disagreement between the three components on shared axes.
        let dis = 0, dn = 0;
        for (const k of AX) { const v = [S[k], tp[k], pal.prof[k]].filter((x) => x !== undefined); for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) { dis += (v[i] - v[j]) ** 2; dn++; } }
        dis /= dn;
        // C7: one moderate tension at most.
        const devs = AX.map((k) => [k, composite[k] - T[k]]);
        const big = devs.filter(([, d]) => Math.abs(d) >= C7.moderate[0]);
        let tension = null, tScore = 0;
        // The one surprise may only sit on an axis the brand barely defines; missing a stated trait is never a tension.
        const free = (k) => Math.abs(T[k]) < C7.onlyWhereTargetBelow;
        if (big.length === 1 && Math.abs(big[0][1]) <= C7.moderate[1] && free(big[0][0])) { tension = big[0]; tScore = 0.04; }
        else if (big.some(([k]) => !free(k))) tScore = -0.12 * big.filter(([k]) => !free(k)).length;
        else if (big.length > 1 || big.some(([, d]) => Math.abs(d) > C7.extreme)) tScore = -0.08 * (big.length - 1) - (big.some(([, d]) => Math.abs(d) > C7.extreme) ? 0.15 : 0);
        const bonus = (rec.has(pal.id) ? C11.recommendedPalette : 0) + (fits[p.id]?.fit === 'core' ? C11.corePairing : C11.goodPairing);
        const score = -(C1.style * styleFit + C1.palette * pal.fit + C1.type * typeFit) - C1.disagreement * dis + QW * pal.quality.q + tScore + bonus;
        results.push({ score, style: s, pairing: p.id, pal, tp, styleFit, typeFit, dis, tension, composite, bonus, rec: rec.has(pal.id), fitLabel: fits[p.id]?.fit });
      }
    }
  }
  results.sort((a, b) => b.score - a.score);

  // Hand face (C10) and motion (C9) for the winner.
  const best = results[0];
  const typo = json(`approaches/${best.style}/typography.json`);
  const handUse = typo.handwritten?.use || 'none';
  // C10: a hand face when the style allows one and either the brand already owns one (its known signal wins over
  // the average) or the target is clearly human.
  const ownHand = brand.typography?.hand || null;
  const hand = handUse === 'none' ? null : ownHand ? ownHand : T.hand >= R.hand.useFrom ? (typo.handwritten.fonts || [])[0] || null : null;
  const motion = R.motion.byActivity.find((m) => T.activity < m.below).plan;
  const alternatives = [];
  for (const r of results.slice(1)) { if (alternatives.length >= top - 1) break; if (!alternatives.some((x) => x.style === r.style) && r.style !== best.style) alternatives.push(r); }
  return { product: productId, goal, target: T, words: used, unknown, best, hand, motion, alternatives, colours: M };
}

// ------------------------------------------------------------------ explain
function explain(res) {
  const { best: b, target: T, colours: M } = res;
  const name = (id) => M[id]?.name || id;
  const roles = b.pal.roles;
  const L = [];
  L.push(`Target from "${res.words.join(', ')}"${res.goal ? ` + goal ${res.goal}` : ''}: ` + AX.map((k) => `${k} ${r2(T[k])}`).join(', '));
  if (res.unknown.length) L.push(`  (words not in the lexicon yet: ${res.unknown.join(', ')}; add them to foundations/combinations/combinations.json -> lexicon)`);
  L.push('');
  L.push(`Style     ${b.style}  (distance ${r2(b.styleFit)}): ${R.styles[b.style].why}`);
  L.push(`Palette   Wada ${b.pal.id} ${b.pal.mode}: ${name(roles.bg)} ground, ${name(roles.text)} text ${roles.contrast.textOnBg}:1, ${name(roles.accent)} accent${b.rec ? ' (on the style\'s list)' : ''}`);
  L.push(`          activity ${r2(b.pal.prof.activity)}, potency ${r2(b.pal.prof.potency)}, warmth ${r2(b.pal.prof.warmth)}; ground/text hue similarity ${r2(b.pal.quality.sim)}, accent hue contrast ${r2(b.pal.quality.fig)}${b.pal.quality.close ? `, closeness to the brand's colours ${r2(b.pal.quality.close)}` : ''}`);
  for (const n of b.pal.quality.notes) L.push(`          ${n}`);
  L.push(`Type      ${b.pairing} (${b.fitLabel} for ${b.style}): ` + AX.filter((k) => b.tp[k] !== undefined).map((k) => `${k} ${r2(b.tp[k])}`).join(', '));
  L.push(`Hand      ${res.hand || 'none'}${res.hand ? ' (C10: the style allows one note; the brand owns this face or its target is clearly human)' : ''}`);
  L.push(`Motion    ${res.motion} (C9)`);
  L.push(`Together  ` + AX.map((k) => `${k} ${r2(b.composite[k])}`).join(', ') + `; disagreement ${r2(b.dis)}`);
  L.push(`Tension   ${b.tension ? `${b.tension[0]} ${b.tension[1] > 0 ? 'above' : 'below'} the target by ${r2(Math.abs(b.tension[1]))}: the one moderate surprise (C7)` : 'none'}`);
  L.push('');
  L.push('Next best, in other styles:');
  for (const a of res.alternatives) L.push(`  ${a.style.padEnd(22)} Wada ${a.pal.id} ${a.pal.mode}, ${a.pairing}  (score ${r2(a.score)} vs ${r2(b.score)})`);
  return L.join('\n');
}

// ------------------------------------------------------------------ CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : null; };
  const flag = (k) => { const i = args.indexOf(k); if (i >= 0) { args.splice(i, 1); return true; } return false; };
  const goal = opt('--goal'), style = opt('--style'), top = +(opt('--top') || 5), write = flag('--write');
  const [product, campaign] = args;
  if (!product) { console.error('usage: npm run compose -- <product> [campaign] [--goal <id>] [--style <id>] [--write]'); process.exit(1); }
  const res = compose(product, { goal, style, top });
  console.log(explain(res));
  if (write) {
    if (!campaign) { console.error('\n--write needs a campaign name.'); process.exit(1); }
    const dir = join(ROOT, 'products', product, 'campaigns', campaign);
    mkdirSync(dir, { recursive: true });
    const b = res.best;
    const cfg = {
      $comment: `Composed by npm run compose (foundations/combinations/combinations.json) from "${res.words.join(', ')}"${goal ? ` + goal ${goal}` : ''}. Style ${b.style}; Wada ${b.pal.id} ${b.pal.mode}; ${b.pairing}; hand ${res.hand || 'none'}. Motion: ${res.motion}${b.tension ? ` Tension: ${b.tension[0]}.` : ''}`,
      approach: b.style, combination: b.pal.id, mode: b.pal.mode, pairing: b.pairing, hand: res.hand,
    };
    writeFileSync(join(dir, 'campaign.json'), JSON.stringify(cfg, null, 2) + '\n');
    console.log(`\nWrote products/${product}/campaigns/${campaign}/campaign.json`);
  }
}
