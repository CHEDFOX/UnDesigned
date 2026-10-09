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

const exports_ = {
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

// ------------------------------------------------------------------ film (npm run film)
// The AI buddy launch film. The buddy is one living Sea Green orb (one focal point); your day is a swarm of
// small task chips in the mono face; the turn is the orb pulling each chip into a column and checking it off,
// one at a time (closing open loops). Everything is keyed to the storyboard's scene ids and times (film.json).
const TASKS = ['Reply to Mom', 'Move the 3 pm call', 'Pay the electricity bill', 'Book a table for Friday', 'Renew the passport', 'Order groceries', 'Send the invoice', 'Find a gift for Sam', 'Plan the weekend'];

function film(ctx) {
  const { W, H, S, wide, pal, mono, esc, anim, scenes, endStart, arrive, textWidth } = ctx;
  const sc = Object.fromEntries(scenes.map((s) => [s.id, s]));
  const glide = arrive;
  // The buddy is the accent colour; chips use the support colour (or text); the one spark is the headline colour.
  const green = pal.accent, grey = pal.support[1] || pal.support[0] || pal.text, warm = pal.head;
  let out = `<defs><radialGradient id="${ctx.P}halo"><stop offset="0" stop-color="${green}" stop-opacity="0.55"/><stop offset="1" stop-color="${green}" stop-opacity="0"/></radialGradient></defs>`;

  // The orb: positions and sizes per beat.
  const home = wide ? [W / 2, H * 0.36] : [W / 2, H * 0.3];
  const side = wide ? [W * 0.3, H * 0.36] : [W / 2, H * 0.2];
  const r0 = S * 0.035;
  const T = (id, k = 'start') => sc[id][k];
  const at = (x, y, s) => `transform:translate(${r1(x)}px,${r1(y)}px) scale(${s})`;
  const orbKeys = [
    [0, at(...home, 0)],
    [T('hook') + 500, at(...home, 0), glide],
    [T('hook') + 1300, at(...home, 1)],
    [T('day') + 0, at(...home, 1), glide],
    [T('day') + 500, at(...home, 0.6)],
    [T('turn') + 0, at(...home, 0.6), glide],
    [T('turn') + 900, at(...side, 1.7)],
    [T('knows1') + 0, at(...side, 1.7), glide],
    [T('knows1') + 500, at(...home, 1.2)],
    [T('peak') + 0, at(...home, 1.2), glide],
    [T('peak') + 1000, at(...home, 4.2)],
    [endStart - 500, at(...home, 4.2), 'ease-in'],
    [endStart, at(...home, 0)],
  ];
  const orb = anim.add('orb', orbKeys);
  out += `<g class="${orb}" style="transform-box:view-box;transform-origin:0 0"><circle r="${r1(r0 * 3.2)}" fill="url(#${ctx.P}halo)"/><circle r="${r1(r0)}" fill="${green}"/><circle r="${r1(r0 * 0.38)}" cx="${r1(-r0 * 0.25)}" cy="${r1(-r0 * 0.25)}" fill="${pal.white}" opacity="0.85"/></g>`;

  // One listening ring per "knows" beat, before its line arrives (one mover at a time).
  ['knows1', 'knows2', 'knows3'].forEach((id, i) => {
    const t0 = T(id) + (i === 0 ? 560 : 20); // the first waits for the orb to settle (one mover)
    const ring = anim.add(`ring${i}`, [[0, 'opacity:0;transform:scale(1)'], [t0 - 1, 'opacity:0;transform:scale(1)', 'step-end'], [t0, 'opacity:0.9;transform:scale(1)', 'ease-out'], [t0 + 480, 'opacity:0;transform:scale(2.6)']]);
    out += `<g transform="translate(${r1(home[0])} ${r1(home[1])})"><circle class="${ring}" style="transform-box:fill-box;transform-origin:center" r="${r1(r0 * 1.2 * 1.2)}" fill="none" stroke="${green}" stroke-width="${r1(S * 0.004)}" opacity="0"/></g>`;
  });

  // Task chips.
  const fs = S * (wide ? 0.022 : 0.026), ch = fs * 2.3;
  const chipW = (t) => textWidth(t, { ...mono, size: fs }) + fs * 3.2;
  const swarm = wide
    ? [[0.06, 0.1], [0.62, 0.08], [0.34, 0.18], [0.72, 0.26], [0.1, 0.36], [0.58, 0.44], [0.26, 0.5], [0.74, 0.5], [0.05, 0.22]]
    : [[0.06, 0.08], [0.5, 0.11], [0.12, 0.2], [0.52, 0.25], [0.06, 0.34], [0.46, 0.39], [0.1, 0.48], [0.5, 0.52], [0.24, 0.445]];
  const colX = wide ? W * 0.47 : W / 2 - chipW(TASKS[2]) / 2, colY = wide ? H * 0.08 : H * 0.29, step = ch * 1.22;
  TASKS.forEach((task, i) => {
    const w = chipW(task);
    const [sx, sy] = [swarm[i][0] * W, swarm[i][1] * H];
    const [cx, cy] = [colX, colY + i * step];
    const pop = T('day') + 600 + i * 170;
    const pull = T('turn') + 1000 + i * 270;
    const keys = [
      [0, `opacity:0;${at(sx, sy, 0.9)}`],
      [pop, `opacity:0;${at(sx, sy, 0.9)}`, glide],
      [pop + 260, `opacity:1;${at(sx, sy, 1)}`],
      [pull, `opacity:1;${at(sx, sy, 1)}`, glide],
      [pull + 240, `opacity:1;${at(cx, cy, 1)}`],
      [T('knows1') - 400, `opacity:1;${at(cx, cy, 1)}`, 'ease-in'],
      [T('knows1') - 100, `opacity:0;${at(cx, cy, 1)}`],
    ];
    // "Reply to Mom" is the one that is already done in the reveal beat.
    if (i === 0) keys.splice(1, 0, [T('done') + 200, `opacity:0;${at(W / 2 - w / 2, H * (wide ? 0.47 : 0.4), 0.9)}`, glide], [T('done') + 460, `opacity:1;${at(W / 2 - w / 2, H * (wide ? 0.47 : 0.4), 1)}`], [T('day'), `opacity:1;${at(W / 2 - w / 2, H * (wide ? 0.47 : 0.4), 1)}`, glide], [T('day') + 500, `opacity:1;${at(sx, sy, 1)}`]);
    const g = anim.add(`chip${i}`, keys.sort((a, b) => a[0] - b[0]));
    const checkAt = i === 0 ? T('done') + 200 : pull + 240;
    const uncheck = i === 0 ? [[T('day'), 'opacity:1', 'step-end'], [T('day') + 1, 'opacity:0'], [pull + 240, 'opacity:0', 'step-end'], [pull + 241, 'opacity:1']] : [];
    const chk = anim.add(`chk${i}`, [[0, 'opacity:0'], [checkAt, 'opacity:0', 'step-end'], [checkAt + 1, 'opacity:1'], ...uncheck].sort((a, b) => a[0] - b[0]));
    out += `<g class="${g}" opacity="0" style="transform-box:view-box;transform-origin:0 0">` +
      `<rect width="${r1(w)}" height="${r1(ch)}" rx="${r1(ch / 2)}" fill="${pal.ground}" stroke="${grey}" stroke-width="${r1(S * 0.0018)}"/>` +
      `<text x="${r1(fs * 2.3)}" y="${r1(ch / 2 + fs * 0.36)}" font-family="'${esc(mono.family)}', monospace" font-size="${r1(fs)}" fill="${grey}">${esc(task)}</text>` +
      `<g class="${chk}" opacity="0"><circle cx="${r1(fs * 1.1)}" cy="${r1(ch / 2)}" r="${r1(fs * 0.62)}" fill="${green}"/><path d="M${r1(fs * 0.8)} ${r1(ch / 2)} l${r1(fs * 0.22)} ${r1(fs * 0.22)} l${r1(fs * 0.42)} ${r1(-fs * 0.44)}" fill="none" stroke="${pal.ground}" stroke-width="${r1(fs * 0.16)}" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<line x1="${r1(fs * 2.2)}" x2="${r1(w - fs * 0.9)}" y1="${r1(ch / 2)}" y2="${r1(ch / 2)}" stroke="${green}" stroke-width="${r1(fs * 0.1)}"/></g></g>`;
  });
  // A warm spark: the one Peach Red moment, at the peak (the second signal colour, used once).
  const spark = anim.add('spark', [[0, 'opacity:0'], [T('peak') + 1000, 'opacity:0', glide], [T('peak') + 1500, 'opacity:1'], [endStart - 500, 'opacity:1', 'ease-in'], [endStart, 'opacity:0']]);
  out += `<circle class="${spark}" opacity="0" cx="${r1(home[0] + r0 * 2.6)}" cy="${r1(home[1] - r0 * 2.6)}" r="${r1(r0 * 0.45)}" fill="${warm}"/>`;
  return out;
}
exports_.film = film;
export default exports_;
