// Base skin: the fallback every style skin can extend. Flat ground, the product's art (or a soft
// shape), the engine's text and a pill button. A style's own approaches/<id>/skin.mjs replaces any part.
//
// Skin API (all optional except ground and art):
//   compositions: ['single-focal', 'split', ...]   preferred order; the engine varies layouts across a set
//   type: { headline: { family: 'display'|'body'|'mono'|'hand', weight, upper, italic, tracking }, subhead, body, cta, brand, note }
//   headlineMax: 0.11                               largest headline size as a share of the short side
//   ground(ctx) -> svg                              background
//   art(ctx, box, { n, slot }) -> svg               the style's illustration in a box (px)
//   media(ctx, layout) -> svg                       a photo (ctx.media) with the style's treatment
//   textOn(ctx, slot) -> hex | null                 text colour for a slot (default: readable on the ground)
//   decorate(ctx, slot, block) -> svg               drawn under a text block (bars, strips, stickers)
//   text(ctx, slot, block) -> svg                   replaces a text block (block.svg is the default)
//   cta(ctx, box, label, face, slot) -> svg         the button
//   series(ctx, { index, of, name }) -> svg         marks that run across carousel slides
//   finish(ctx) -> svg                              drawn last (texture, frame)
//   defs(ctx) -> svg                                gradients, filters, patterns (ids must start with ctx.P)
// ctx: W, H, P (id prefix), pal { ground, ink, accent, support[], black, white, onGround, onAccent, all[] },
//      fam, face(role), piece, layout, rand(), seed, media, dataUri(), imageSize(), fit(), textWidth(),
//      contrast(), readableOn(), esc(), productArt (motifs from products/<id>/art.mjs), approach (style data).

/** Helpers every product motif receives in any style: Humanist Minimal's primitives with a palette
 *  whose ink reads on the ground (light ink on dark grounds). */
import { createIllustrator } from '../../../approaches/humanist-minimal/illustration.mjs';
import { readFileSync } from 'node:fs';
const HM = (() => { const d = (f) => JSON.parse(readFileSync(new URL(`../../../approaches/humanist-minimal/${f}`, import.meta.url), 'utf8')); return { art: d('art.json'), motion: d('motion.json') }; })();
export function motifHelpers(ctx) {
  const dark = ctx.contrast(ctx.pal.ground, ctx.pal.black) < 4.5;
  const palette = { ground: ctx.pal.ground, paper: ctx.pal.white, ink: dark ? ctx.pal.onGround : ctx.pal.black, accent: ctx.pal.accent };
  return { ill: createIllustrator(ctx.approach.art && ctx.approach.art.line ? ctx.approach : HM, palette), palette };
}

export function productMotif(ctx, box, helpers = {}) {
  const want = ctx.piece.art && ctx.piece.art.motif;
  const fn = want && ctx.productArt && ctx.productArt[want];
  return fn ? fn(ctx, box, { ...motifHelpers(ctx), ...helpers }) : null;
}

export function artFile(ctx, box) {
  const f = ctx.piece.art && ctx.piece.art.file;
  if (!f) return null;
  const abs = ctx.brand.dir + '/' + f;
  return `<image href="${ctx.dataUri(abs)}" x="${box.x.toFixed(1)}" y="${box.y.toFixed(1)}" width="${box.w.toFixed(1)}" height="${box.h.toFixed(1)}" preserveAspectRatio="xMidYMid meet"/>`;
}

export function photo(ctx, opts = {}) {
  const { W, H, media, dataUri } = ctx;
  return `<image href="${dataUri(media)}" width="${W}" height="${H}" preserveAspectRatio="${opts.align || 'xMidYMid'} slice"${opts.filter ? ` filter="url(#${opts.filter})"` : ''}/>`;
}

export default {
  compositions: ['single-focal', 'split', 'type-led', 'stacked', 'full-bleed-band', 'grid-of-n'],
  ground: (ctx) => `<rect width="${ctx.W}" height="${ctx.H}" fill="${ctx.pal.ground}"/>`,
  art(ctx, b) {
    const own = productMotif(ctx, b) || artFile(ctx, b);
    if (own) return own;
    const r = Math.min(b.w, b.h) * 0.36;
    return `<circle cx="${(b.x + b.w / 2).toFixed(1)}" cy="${(b.y + b.h / 2).toFixed(1)}" r="${r.toFixed(1)}" fill="${ctx.pal.accent}"/>`;
  },
  media: (ctx) => photo(ctx),
};
