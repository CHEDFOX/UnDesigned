// Small helpers for this style's skin (skin.mjs). Palette and layout reading only; no drawing.

/** Every colour of the piece's Wada combination (hex, from the product's generated palette),
 *  including the combination's ink colour, which ctx.pal folds into the text role. */
export function inks(ctx) {
  const t = ctx.tokens && ctx.tokens.colors;
  const combo = t && t.combinations && t.combinations.find((c) => c.id === ctx.pal.combination);
  const ids = combo ? combo.colors : [];
  return [...new Set(ids.map((id) => ctx.tokens.colorsById[id]).filter(Boolean))];
}

/** The text zone of a photo layout as a px rect, stretched to any canvas edge it is near
 *  (so it reads as a band or a corner block, not a floating box), with a little padding. */
export function textZoneBand(ctx, layout, { near = 16, padPct = 2.5 } = {}) {
  const { W, H } = ctx;
  let z = layout.media && layout.media.textZone;
  if (!z) {
    const t = (layout.slots || []).filter((s) => !['art', 'image'].includes(s.role)).map((s) => s.box);
    if (!t.length) return null;
    const x = Math.min(...t.map((b) => b.x)), y = Math.min(...t.map((b) => b.y));
    z = { x, y, w: Math.max(...t.map((b) => b.x + b.w)) - x, h: Math.max(...t.map((b) => b.y + b.h)) - y };
  }
  const pad = (Math.min(W, H) * padPct) / 100;
  let x0 = (z.x / 100) * W - pad, y0 = (z.y / 100) * H - pad, x1 = ((z.x + z.w) / 100) * W + pad, y1 = ((z.y + z.h) / 100) * H + pad;
  if (z.x < near) x0 = 0;
  if (z.y < near) y0 = 0;
  if (100 - z.x - z.w < near) x1 = W;
  if (100 - z.y - z.h < near) y1 = H;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** The largest rectangle of the canvas left free by the band (above, below, left or right of it). */
export function freeRect(ctx, band) {
  const { W, H } = ctx;
  if (!band) return { x: 0, y: 0, w: W, h: H };
  const c = [
    { x: 0, y: 0, w: W, h: band.y },
    { x: 0, y: band.y + band.h, w: W, h: H - band.y - band.h },
    { x: 0, y: 0, w: band.x, h: H },
    { x: band.x + band.w, y: 0, w: W - band.x - band.w, h: H },
  ];
  return c.sort((a, b) => Math.min(b.w, b.h) * Math.max(b.w, b.h) ** 0.5 - Math.min(a.w, a.h) * Math.max(a.w, a.h) ** 0.5)[0];
}
