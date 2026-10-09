// XOOTEQ's own motifs for the design engine, drawn with the style's primitives
// (helpers: { ill, palette } — Humanist Minimal's ink line and cut paper, ink that reads on the ground).

const r1 = (n) => Math.round(n * 10) / 10;
const TOKENS = '{ }   </>   ( )   =>   ;   [ ]   &&   //   :=   #   ';

export default {
  // "Code is the international language": a globe that is also a speech bubble. Rows of code run
  // round it like latitudes; when animated they turn like the world once every word has arrived
  // (one mover, 3 s move + 1 s hold, ending still each loop; reduced motion shows it still). Accent: one cursor, the only coloured object.
  'code-globe'(ctx, b, h) {
    const { ill, palette } = h;
    const P = ctx.P + 'cg-';
    const s = Math.min(b.w, b.h);
    const R = s * 0.4;
    const cx = b.x + b.w / 2 + s * 0.03, cy = b.y + b.h / 2 - s * 0.02;
    const ink = palette.ink, paper = palette.paper, accent = palette.accent;
    const sw = r1(s * 0.016);
    const mono = { family: ctx.fam.mono, weight: 400 };

    // Paper: the globe and its speech tail, cut as one shape; the ink outline sits slightly off register.
    const globe = ill.blob(cx, cy, R, R * 0.98, { points: 9, irregularity: 0.035, seed: 5 });
    const tail = ill.roundedPolygon([[cx - R * 0.62, cy + R * 0.62], [cx - R * 1.12, cy + R * 1.2], [cx - R * 0.2, cy + R * 0.86]], R * 0.06);
    const off = s * 0.012;
    const outline = ill.inkLine(ill.ellipsePoints(cx + off, cy + off * 0.6, R * 0.99, R * 0.97, 40, 0.3), { seed: 7, closed: true });
    const tailInk = ill.inkLine([[cx - R * 0.66 + off, cy + R * 0.7], [cx - R * 1.1 + off, cy + R * 1.18], [cx - R * 0.24 + off, cy + R * 0.9]], { seed: 9 });

    // Latitudes: six rows of code. Rows nearer the poles are smaller, like a sphere.
    const rows = [-0.66, -0.4, -0.13, 0.14, 0.41, 0.66];
    const animate = !!ctx.piece.animate;
    let lines = '', text = '', css = '';
    rows.forEach((v, i) => {
      const y = cy + v * R;
      const k = Math.sqrt(Math.max(0.05, 1 - v * v));
      const size = s * 0.05 * (0.55 + 0.45 * k);
      const cycle = ctx.textWidth(TOKENS, { ...mono, size });
      const reps = Math.ceil((R * 2 + cycle * 2) / cycle) + 1;
      const startX = cx - R - cycle - (i % 2) * cycle * 0.37;
      const str = TOKENS.repeat(reps);
      const dir = i % 2 ? 1 : -1;
      const id = `${P}row${i}`;
      text += `<g class="${id}"><text x="${r1(startX)}" y="${r1(y + size * 0.35)}" font-family="'${ctx.esc(ctx.fam.mono)}', monospace" font-size="${r1(size)}" fill="${ink}" xml:space="preserve">${ctx.esc(str)}</text></g>`;
      if (animate) css += `@keyframes ${id}k{0%{transform:translateX(0)}75%,100%{transform:translateX(${r1(dir * cycle)}px)}}.${id}{animation:${id}k 4s cubic-bezier(.45,0,.55,1) __MOTION_END__ms infinite}`;
      if (i < rows.length - 1) {
        const ly = cy + ((v + rows[i + 1]) / 2) * R;
        const lk = Math.sqrt(Math.max(0, 1 - ((v + rows[i + 1]) / 2) ** 2));
        lines += `<path d="${ill.inkLine([[cx - R * lk, ly], [cx, ly + R * 0.03], [cx + R * lk, ly]], { seed: 20 + i })}" fill="none" stroke="${ink}" stroke-width="${r1(sw * 0.45)}" stroke-linecap="round" opacity="0.35"/>`;
      }
    });
    // A meridian, so it reads as a globe.
    lines += `<path d="${ill.inkLine(ill.ellipsePoints(cx, cy, R * 0.36, R * 0.97, 30, 0.1), { seed: 31, closed: true })}" fill="none" stroke="${ink}" stroke-width="${r1(sw * 0.45)}" opacity="0.35"/>`;

    // The one accent: a cursor on the equator, where the next line will be typed.
    const cur = `<path d="${ill.roundedPolygon([[cx + R * 0.18, cy - R * 0.2], [cx + R * 0.26, cy - R * 0.2], [cx + R * 0.26, cy + R * 0.02], [cx + R * 0.18, cy + R * 0.02]], R * 0.02)}" fill="${accent}"/>`;

    const style = animate ? `<style>${css}@media (prefers-reduced-motion: reduce){[class^="${P}row"]{animation:none!important}}</style>` : '';
    // The code is clipped just inside the ink outline, so nothing spills past the line.
    return `${style}<defs><clipPath id="${P}clip"><ellipse cx="${r1(cx + off)}" cy="${r1(cy + off * 0.6)}" rx="${r1(R * 0.94)}" ry="${r1(R * 0.92)}"/></clipPath></defs>` +
      `<path d="${tail}" fill="${paper}"/><path d="${globe}" fill="${paper}"/>` +
      `<g clip-path="url(#${P}clip)">${lines}${text}${cur}</g>` +
      `<path d="${outline}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="${tailInk}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
  },
};
