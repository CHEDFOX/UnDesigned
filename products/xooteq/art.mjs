// XOOTEQ's own motifs for the design engine, drawn with the style's primitives
// (helpers: { ill, palette } — Humanist Minimal's ink line and cut paper, ink that reads on the ground).

const r1 = (n) => Math.round(n * 10) / 10;
const TOKENS = '{ }   </>   ( )   =>   ;   [ ]   &&   //   :=   #   ';


// The ways languages say a line out loud: each one a different word for the same act.
const SAYS = ['print()', 'echo', 'puts', 'console.log()', 'printf()', 'fmt.Println()', 'println!()', 'cout <<', 'System.out.println()', 'Console.WriteLine()', 'say', 'IO.puts', 'writeln()', 'NSLog()', 'print_r()', 'Write-Host', 'putStrLn', 'disp()', 'cat()', 'alert()'];

/** "Code is the international language": a globe whose surface is made of the ways programming languages
 *  print a line. It turns in 3D (one mover): snippets swing round, grow and sharpen at the front, fade
 *  behind. Ink on a white paper disc, outline slightly off register; one snippet in the accent. CSS
 *  keyframes per snippet; reduced motion shows the first frame. */
function sayGlobe(ctx, b, h) {
  const { ill, palette } = h;
  const P = ctx.P + 'sg-';
  const s = Math.min(b.w, b.h);
  // art.size (0.3–1): share of the art box the globe fills; a small globe leaves more empty ground.
  const scale = Math.min(1, Math.max(0.3, (ctx.piece.art && ctx.piece.art.size) || 1));
  const R = s * 0.42 * scale, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  // The snippets and outline sit on white paper, so they are always Wada Black ink, whatever the ground.
  const ink = ctx.pal.black || palette.ink, paper = palette.paper;
  // The accent snippet sits on white paper: if the accent is too pale to read there, use the ground colour instead.
  const accent = ctx.contrast(palette.accent, paper) >= 3 ? palette.accent : (ctx.contrast(ctx.pal.ground, paper) >= 3 ? ctx.pal.ground : ink);
  const sw = r1(s * 0.014 * Math.sqrt(scale));
  const N = scale < 0.8 ? 20 : 34, F = 72, DUR = 24, TILT = -0.38;
  const animate = !(ctx.piece.art && ctx.piece.art.motion === false);
  // Points on a sphere (Fibonacci), each with a snippet; the sphere is tilted towards the viewer.
  const pts = Array.from({ length: N }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - y * y), th = i * Math.PI * (3 - Math.sqrt(5));
    return { x: Math.cos(th) * r, y, z: Math.sin(th) * r, say: SAYS[i % SAYS.length] };
  });
  const project = (p, a) => {
    const x1 = p.x * Math.cos(a) + p.z * Math.sin(a), z1 = -p.x * Math.sin(a) + p.z * Math.cos(a);
    const y2 = p.y * Math.cos(TILT) - z1 * Math.sin(TILT), z2 = p.y * Math.sin(TILT) + z1 * Math.cos(TILT);
    const depth = (z2 + 1) / 2; // 0 back, 1 front
    return { X: cx + x1 * R * 0.92, Y: cy + y2 * R * 0.92, k: 0.5 + 0.65 * depth, o: depth < 0.35 ? 0 : ((depth - 0.35) / 0.65) ** 1.3 };
  };
  const size = s * 0.036 * Math.sqrt(scale);
  const mono = ctx.fam.mono;
  let glyphs = '', css = '';
  pts.forEach((p, i) => {
    const id = `${P}p${i}`;
    const f0 = project(p, 0);
    const fill = i === 7 ? accent : ink;
    glyphs += `<g class="${id}" transform="translate(${r1(f0.X)} ${r1(f0.Y)}) scale(${f0.k.toFixed(3)})" opacity="${f0.o.toFixed(3)}"><text text-anchor="middle" y="${r1(size * 0.35)}" font-family="'${ctx.esc(mono)}', monospace" font-size="${r1(size)}" font-weight="${i === 7 ? 700 : 400}" fill="${fill}">${ctx.esc(p.say)}</text></g>`;
    if (animate) {
      let kf = '';
      for (let f = 0; f <= F; f++) {
        const q = project(p, (f / F) * Math.PI * 2);
        kf += `${r1((f / F) * 100)}%{transform:translate(${r1(q.X)}px,${r1(q.Y)}px) scale(${q.k.toFixed(3)});opacity:${q.o.toFixed(3)}}`;
      }
      css += `@keyframes ${id}k{${kf}}.${id}{animation:${id}k ${DUR}s linear infinite}`;
    }
  });
  // Paper disc and an ink outline slightly off register; a faint equator and meridian that stay still.
  const off = s * 0.012 * scale;
  const disc = ill.blob(cx, cy, R * 1.12, R * 1.1, { points: 10, irregularity: 0.03, seed: 4 });
  const outline = ill.inkLine(ill.ellipsePoints(cx + off, cy + off * 0.7, R * 1.1, R * 1.08, 44, 0.2), { seed: 12, closed: true });
  const equator = ill.inkLine(ill.ellipsePoints(cx, cy, R * 1.04, R * 0.38, 36, 0), { seed: 14, closed: true });
  const style = animate ? `<style>${css}.${P}p0{}@media (prefers-reduced-motion: reduce){[class^="${P}p"]{animation:none!important}}</style>` : '';
  return style + `<path d="${disc}" fill="${paper}"/>` +
    `<path d="${equator}" fill="none" stroke="${ink}" stroke-width="${r1(sw * 0.5)}" opacity="0.18"/>` +
    `<defs><clipPath id="${P}clip"><ellipse cx="${r1(cx + off)}" cy="${r1(cy + off * 0.7)}" rx="${r1(R * 1.04)}" ry="${r1(R * 1.02)}"/></clipPath></defs>` +
    `<g clip-path="url(#${P}clip)">${glyphs}</g>` +
    `<path d="${outline}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

export default {
  'say-globe': sayGlobe,
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
