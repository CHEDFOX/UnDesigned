// Humanist Minimal skin for the design engine (tools/design/engine.mjs).
// Ink line over white cut-paper shapes on a flat Wada ground; the accent on one object only;
// sentence case, left-aligned, three sizes; the button is an ink-outlined pill so the accent stays on the art.
// Art comes from the style's drawing engine (illustration.mjs motifs) or from the product's own motifs
// (products/<id>/art.mjs), which get the same primitives.

import { createIllustrator } from './illustration.mjs';
import { productMotif, artFile, photo } from '../../tools/design/skins/base.mjs';

const r1 = (n) => Math.round(n * 10) / 10;

function illustrator(ctx) {
  const dark = ctx.contrast(ctx.pal.ground, ctx.pal.black) < 4.5;
  const palette = { ground: ctx.pal.ground, paper: ctx.pal.white, ink: dark ? ctx.pal.onGround : ctx.pal.black, accent: ctx.pal.accent };
  return { ill: createIllustrator(ctx.approach, palette), palette };
}

/** A 400 x 400 scene from the engine, placed into a box (ground removed so it sits on the piece's ground). */
function sceneInBox(ctx, b, motif) {
  const { ill, palette } = illustrator(ctx);
  const svg = ill.scene({ motif, palette, animate: !!ctx.piece.animate, uid: ctx.P + 's' })
    .replace(/<rect width="400" height="400" fill="[^"]*"\/>/, '');
  const s = Math.min(b.w, b.h);
  const x = b.x + (b.w - s) / 2, y = b.y + (b.h - s) / 2;
  return svg.replace(/^<svg[^>]*>/, `<svg x="${r1(x)}" y="${r1(y)}" width="${r1(s)}" height="${r1(s)}" viewBox="0 0 400 400" overflow="visible">`);
}

export default {
  compositions: ['single-focal', 'split', 'stacked', 'type-led', 'grid-of-n', 'full-bleed-band'],
  type: {
    headline: { family: 'display' },
    subhead: { family: 'body' },
    body: { family: 'body' },
    note: { family: 'hand' },
    cta: { family: 'body' },
    brand: { family: 'body' },
  },
  headlineMax: 0.1,

  ground: (ctx) => `<rect width="${ctx.W}" height="${ctx.H}" fill="${ctx.pal.ground}"/>`,

  art(ctx, b, { n }) {
    const { ill, palette } = illustrator(ctx);
    const own = productMotif(ctx, b, { ill, palette, sceneInBox: (box, m) => sceneInBox(ctx, box, m) }) || artFile(ctx, b);
    if (own) return own;
    const motifs = ill.motifs;
    const want = ctx.piece.art && ctx.piece.art.motif;
    const motif = motifs.includes(want) ? want : motifs[(ctx.seed + n) % motifs.length];
    return sceneInBox(ctx, b, motif);
  },

  // Photos stay natural; text sits in the calm region the layout names (media.json), never on a tint.
  media: (ctx) => photo(ctx),

  cta(ctx, b, label, f) {
    const { pal, esc, fit } = ctx;
    const ft = fit(label, b.w * 0.8, b.h * 0.5, f, { max: Math.min(ctx.W, ctx.H) * 0.03, min: 12, maxLines: 1 });
    const bw = Math.min(b.w, ft.width + ft.size * 2.4), bh = ft.size * 2.3;
    const y = b.y + (b.h - bh) / 2;
    const ink = ctx.media ? pal.white : pal.onGround;
    return `<rect x="${r1(b.x)}" y="${r1(y)}" width="${r1(bw)}" height="${r1(bh)}" rx="${r1(bh / 2)}" fill="none" stroke="${ink}" stroke-width="${r1(Math.max(2, ft.size * 0.12))}"/>` +
      `<text x="${r1(b.x + bw / 2)}" y="${r1(y + bh / 2 + ft.size * 0.36)}" text-anchor="middle" font-family="'${esc(f.family)}', sans-serif" font-weight="${f.weight}" font-size="${r1(ft.size)}" fill="${ink}">${esc(label)}</text>`;
  },

  // Carousel: one ink line runs across every slide, entering and leaving at the same height,
  // so the slides read as one strip when swiped (layout.json: grouping, carousel story).
  series(ctx, s) {
    const { ill } = illustrator(ctx);
    const y = ctx.H * 0.975;
    const pts = [[-20, y], [ctx.W * 0.3, y - ctx.H * (0.02 + 0.02 * (s.index % 2))], [ctx.W * 0.7, y + ctx.H * 0.015], [ctx.W + 20, y]];
    const ink = ctx.contrast(ctx.pal.ground, ctx.pal.black) < 4.5 ? ctx.pal.onGround : ctx.pal.black;
    const sw = Math.min(ctx.W, ctx.H) * 0.012;
    return `<path d="${ill.inkLine(pts, { seed: 11 + s.index })}" fill="none" stroke="${ink}" stroke-width="${r1(sw)}" stroke-linecap="round"/>` +
      `<text x="${r1(ctx.W * 0.92)}" y="${r1(ctx.H * 0.055)}" text-anchor="end" font-family="'${ctx.fam.mono}', monospace" font-size="${r1(ctx.H * 0.018)}" fill="${ctx.pal.onGround}">${s.index} / ${s.of}</text>`;
  },
};
