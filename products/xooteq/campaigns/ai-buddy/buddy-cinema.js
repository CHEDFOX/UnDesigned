// XOOTEQ: your AI buddy. "The noise and the light" (storyboard-buddy-cinema.md).
// Drawn by tools/design/cinema.mjs: window.setupFilm(cfg, canvas) once, then window.drawFrame(t) per frame.
// Every frame is a pure function of t (seeded randomness), so the film renders the same way twice.
// Colours: Wada 325 (Deep Slate Green night, Naples Yellow light, Yellow Ocher glow, Eugenia Red warmth) + Black.
// Type: Instrument Serif (italic for the one emphasised word) and IBM Plex Mono.
(() => {
  // ------------------------------------------------------------------ helpers
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const ease = { out: (u) => 1 - (1 - u) ** 3, inOut: (u) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2), quint: (u) => 1 - (1 - u) ** 5, in: (u) => u * u * u };
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  function rng(seed) { let s = seed >>> 0; return () => { s += 0x6d2b79f5; let r = Math.imul(s ^ (s >>> 15), 1 | s); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  const mix = (h1, h2, u) => { const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16); const c = (s) => Math.round(lerp((a >> s) & 255, (b >> s) & 255, u)); return `rgb(${c(16)},${c(8)},${c(0)})`; };
  const READ = (words) => Math.max(1.5, 0.375 * words + 0.5); // media.json reading rule (s)

  let F, cv, ctx, W, H, S, wide, G, L, O, R, K, FD, FM;
  let cards = [], parts = [], sprites = {}, dot, grain = [], mark = null, camTable = [], hiPts = [];
  const D = 4200, NEAR = 70, FOCAL = 0.95;
  const LABELS = ['Reply to Sam', '3 missed calls', 'Meeting moved', 'Invoice due', 'Remember the milk', 'Flight check-in', 'Rent is due', 'Call the dentist', 'New message', 'Reminder', 'Pay the card', 'Mom: call me', 'Renew licence', 'Weekend plans?'];
  const RUSH = [['Reply.', 1.0], ['Remember.', 2.0], ['Reschedule.', 2.95], ['Pay.', 3.85], ['Don’t forget.', 4.7]];

  // ------------------------------------------------------------------ timeline (seconds)
  const T = {};
  T.freeze = 6.55; T.stop = 6.95;
  T.q1 = 7.15; T.q2 = 7.9; T.qOut = T.q2 + 0.6 + READ(7); // "What if it was / already handled?"
  T.lightIn = T.qOut + 0.15; T.lightEnd = T.lightIn + 5.6;
  T.before = T.lightEnd + 0.15; T.beforeOut = T.before + 0.6 + READ(4);
  T.rhythm = T.beforeOut + 0.1; T.rhythmText = T.rhythm + 1.7; T.rhythmOut = T.rhythmText + 0.6 + READ(4);
  T.people = T.rhythmOut + 0.1; T.peopleText = T.people + 1.7; T.peopleOut = T.peopleText + 0.6 + READ(4);
  T.quiet = T.peopleOut + 0.1; T.quietText = T.quiet + 1.5; T.quietOut = T.quietText + 0.6 + READ(6) + 0.4;
  T.hi = T.quietOut + 0.2; T.hiHeld = T.hi + 2.0; T.meet = T.hiHeld + 0.9; T.meetOut = T.meet + 0.6 + READ(4) + 0.3;
  T.collapse = T.meetOut; T.end = T.collapse + 1.3; T.final = T.end + 0.9 + READ(3) + 1.6;
  window.FILM_TIMES = T;

  // ------------------------------------------------------------------ setup
  window.setupFilm = async (cfg, canvas) => {
    F = cfg; cv = canvas; ctx = cv.getContext('2d');
    W = F.W; H = F.H; S = Math.min(W, H); wide = W > H;
    G = F.roles.ground; L = F.roles.text; O = F.roles.accent; R = F.roles.support[0]; K = F.black;
    FD = F.fonts.display; FM = F.fonts.mono;
    await Promise.all([`400 100px "${FD}"`, `italic 400 100px "${FD}"`, `400 40px "${FM}"`, `500 40px "${FM}"`].map((f) => document.fonts.load(f)));
    const rand = rng(325);

    // Notification cards as sprites, each at four depth-of-field blurs.
    const cw = 420, ch = 112;
    for (const [i, label] of LABELS.entries()) {
      sprites[i] = [0, 2.5, 6, 12].map((b) => {
        const c = document.createElement('canvas'); const pad = 40; c.width = cw + pad * 2; c.height = ch + pad * 2;
        const g = c.getContext('2d'); g.filter = b ? `blur(${b}px)` : 'none'; g.translate(pad, pad);
        g.fillStyle = rgba(L, 0.09); g.strokeStyle = rgba(L, 0.42); g.lineWidth = 2;
        g.beginPath(); g.roundRect(0, 0, cw, ch, 26); g.fill(); g.stroke();
        g.fillStyle = i % 3 === 0 ? R : O; g.beginPath(); g.arc(46, ch / 2, 13, 0, Math.PI * 2); g.fill();
        g.fillStyle = rgba(L, 0.95); g.font = `500 30px "${FM}"`; g.textBaseline = 'middle'; g.fillText(label, 80, ch / 2 - 13);
        g.fillStyle = rgba(L, 0.28); g.beginPath(); g.roundRect(80, ch / 2 + 14, 150 + (i * 37) % 130, 10, 5); g.fill();
        return c;
      });
    }
    // Glow dot sprite for particles and light.
    dot = document.createElement('canvas'); dot.width = dot.height = 64;
    { const g = dot.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, rgba(L, 1)); gr.addColorStop(0.18, rgba(L, 0.95)); gr.addColorStop(0.42, rgba(O, 0.45)); gr.addColorStop(1, rgba(O, 0)); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }
    // Film grain (static frames, cycled slowly: no flicker).
    for (let k = 0; k < 4; k++) { const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d'); const im = g.createImageData(512, 512); for (let p = 0; p < im.data.length; p += 4) { const v = rand() * 255; im.data[p] = im.data[p + 1] = im.data[p + 2] = v; im.data[p + 3] = 255; } g.putImageData(im, 0, 0); grain.push(c); }
    if (F.mark) { mark = new Image(); mark.src = F.mark; await mark.decode(); }

    // The tunnel: cards around the axis, centre kept clear for the words.
    for (let i = 0; i < 170; i++) {
      const a = rand() * Math.PI * 2, r = S * (0.5 + rand() * 0.75);
      cards.push({ x: Math.cos(a) * r * (wide ? 1.25 : 0.8), y: Math.sin(a) * r * (wide ? 0.75 : 1.2), z: rand() * D, rot: (rand() - 0.5) * 0.5, label: i % LABELS.length, sc: 0.8 + rand() * 0.5 });
    }
    // Camera: accelerating flight, then a hard (but eased) stop: the freeze.
    let z = 0; const dt = 1 / 240;
    for (let t = 0; t <= 60; t += dt) { camTable.push(z); z += speed(t) * dt; }

    // Particles: one per card (the card becomes a firefly) + fireflies the light leaves behind.
    const ps = 1100;
    for (let i = 0; i < ps; i++) parts.push({ i, card: i < cards.length ? i : -1, emit: T.lightIn + 0.4 + rand() * (T.lightEnd - T.lightIn - 0.6), orbR: S * (0.05 + rand() ** 0.7 * 0.32), orbA: rand() * Math.PI * 2, orbW: 0.35 + rand() * 0.5, ph: rand() * 6.28, sz: 0.5 + rand() * 0.9, d: rand() });
    hiPts = sampleText('hi', rand);
    for (const p of parts) { p.hi = hiPts[Math.floor(p.d * hiPts.length) % hiPts.length]; p.quiet = [rand() * W, (wide ? 0.13 : 0.06) * H + rand() * H * (wide ? 0.74 : 0.6)]; }
    shapes(rand);
    // When the light passes each card (the card is handled).
    const zf = camAt(T.stop);
    for (const c of cards) { c.zf = mod(c.z - zf, D); c.th = handledAt(c.zf); }
  };

  function speed(t) { if (t < T.freeze) return 260 + 1450 * (t / T.freeze) ** 2.2; if (t < T.stop) return (260 + 1450) * (1 - ease.out(seg(t, T.freeze, T.stop))); return 0; }
  const camAt = (t) => camTable[Math.min(camTable.length - 1, Math.max(0, Math.round(t * 240)))];
  const mod = (a, n) => ((a % n) + n) % n;
  const lightZ = (t) => lerp(D * 0.98, 300, ease.inOut(seg(t, T.lightIn, T.lightEnd))); // relative to the frozen camera
  function handledAt(zrel) { if (zrel <= 300) return T.lightEnd + 0.1 + (300 - zrel) / 1500; for (let t = T.lightIn; t <= T.lightEnd; t += 1 / 120) if (lightZ(t) <= zrel) return t; return T.lightEnd; }
  const proj = (x, y, zrel) => { const k = (S * FOCAL) / Math.max(zrel, 1); return [W / 2 + x * k, H / 2 + y * k, k]; };

  function sampleText(txt, rand) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const size = wide ? H * 0.5 : W * 0.56;
    g.font = `italic 400 ${size}px "${FD}"`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = '#fff';
    g.fillText(txt, W / 2, H * 0.48 + size * 0.25);
    const d = g.getImageData(0, 0, W, H).data, pts = [];
    const step = Math.max(3, Math.round(S / 260));
    for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (d[(y * W + x) * 4 + 3] > 128) pts.push([x + (rand() - 0.5) * step, y + (rand() - 0.5) * step]);
    for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
    return pts;
  }

  // Shapes the fireflies form: a heartbeat line (rhythm), a constellation (people).
  let ecg = [], nodes = [], edges = [];
  function shapes(rand) {
    const y0 = H * 0.48, x0 = W * 0.08, x1 = W * 0.92, a = S * 0.17;
    const beat = [[0, 0], [0.05, -0.12], [0.1, 0], [0.16, 0], [0.19, 0.18], [0.23, -1], [0.27, 0.42], [0.31, 0], [0.38, -0.2], [0.44, 0], [1, 0]];
    for (let k = 0; k < 3; k++) for (const [u, v] of beat) ecg.push([x0 + ((k + u) / 3) * (x1 - x0), y0 + v * a]);
    const cx = W / 2, cy = H * 0.48, rx = wide ? W * 0.33 : W * 0.38, ry = wide ? H * 0.27 : H * 0.17;
    nodes.push([cx, cy]);
    for (let k = 0; k < 8; k++) { const ang = (k / 8) * Math.PI * 2 + 0.3; nodes.push([cx + Math.cos(ang) * rx * (0.82 + (k % 3) * 0.09), cy + Math.sin(ang) * ry * (0.82 + ((k + 1) % 3) * 0.09)]); }
    for (let k = 1; k <= 8; k++) { edges.push([0, k]); edges.push([k, (k % 8) + 1]); }
    const lens = ecg.slice(1).map((p, i) => Math.hypot(p[0] - ecg[i][0], p[1] - ecg[i][1])), total = lens.reduce((x, y) => x + y, 0);
    for (const p of parts) {
      // rhythm: evenly along the line
      let s = ((p.i + 0.5) / parts.length) * total, k = 0; while (k < lens.length - 1 && s > lens[k]) { s -= lens[k]; k++; }
      const u = s / lens[k]; p.ecg = [lerp(ecg[k][0], ecg[k + 1][0], u), lerp(ecg[k][1], ecg[k + 1][1], u)];
      // people: 25% gathered at nodes, the rest along the links
      if (p.d < 0.25) { const n = nodes[p.i % nodes.length]; const r = (p.i % 9 === 0 ? 26 : 14) * (S / 1080); p.ppl = [n[0] + Math.cos(p.ph) * r * p.sz, n[1] + Math.sin(p.ph) * r * p.sz]; }
      else { const e = edges[p.i % edges.length], u2 = (p.d - 0.25) / 0.75; p.ppl = [lerp(nodes[e[0]][0], nodes[e[1]][0], u2), lerp(nodes[e[0]][1], nodes[e[1]][1], u2)]; }
    }
  }

  // ------------------------------------------------------------------ firefly position over the film
  function orbit(p, t) { const [lx, ly] = lightScreen(t); const a = p.orbA + p.orbW * t; const k = clamp(seg(t, T.lightIn, T.lightEnd) * 1.4, 0.25, 1); return [lx + Math.cos(a) * p.orbR * k, ly + Math.sin(a) * p.orbR * k * (wide ? 0.42 : 0.6)]; }
  function lightScreen(t) { const [x, y, k] = proj(0, 0, lightZ(t)); return [x, y, k]; }
  function spawn(p) {
    if (p.card >= 0) { const c = cards[p.card]; const [x, y] = proj(c.x, c.y, c.zf); return { t: c.th + 0.25, x, y }; }
    const [x, y] = lightScreen(p.emit); return { t: p.emit, x, y };
  }
  const PH = () => [
    ['ecg', T.rhythm, 1.5], ['ppl', T.people, 1.5], ['quiet', T.quiet, 1.3], ['hi', T.hi, 1.8], ['centre', T.collapse, 1.0],
  ];
  function target(p, key) { if (key === 'centre') return [W / 2, H * 0.5]; return p[key]; }
  function partPos(p, t) {
    const sp = spawn(p);
    if (t < sp.t) return null;
    let pos = (() => { const u = ease.out(seg(t, sp.t, sp.t + 1.3)); const o = orbit(p, t); return [lerp(sp.x, o[0], u), lerp(sp.y, o[1], u)]; })();
    let from = null;
    for (const [key, t0, dur] of PH()) {
      const delay = (p.i % 97) / 97 * 0.55;
      const a = t0 + delay;
      if (t < a) break;
      const start = from ? target(p, from) : orbit(p, a);
      const u = ease.inOut(seg(t, a, a + dur));
      pos = [lerp(start[0], target(p, key)[0], u), lerp(start[1], target(p, key)[1], u)];
      from = key;
    }
    // A slow drift keeps the fireflies alive without competing with the words.
    const amp = (t > T.rhythm ? 2.2 : 0) * (S / 1080);
    return [pos[0] + Math.sin(t * 0.9 + p.ph) * amp, pos[1] + Math.cos(t * 0.7 + p.ph * 1.3) * amp];
  }

  // ------------------------------------------------------------------ type: letter by letter, cut out on a fade
  function line(text, t, tIn, tOut, { y, size, accent = [], italic = [], color = L, align = 'center', x = W / 2 }) {
    if (t < tIn || t > tOut + 0.4) return;
    const out = ease.in(seg(t, tOut, tOut + 0.35));
    const words = text.split(' ');
    const fontFor = (w) => `${italic.includes(w.replace(/[^\w’']/g, '')) ? 'italic ' : ''}400 ${size}px "${FD}"`;
    ctx.save(); ctx.textBaseline = 'alphabetic';
    let total = 0; const parts = words.map((w, k) => { ctx.font = fontFor(w); const wd = ctx.measureText(w + (k < words.length - 1 ? ' ' : '')).width; total += wd; return { w, wd }; });
    let cx = align === 'center' ? x - total / 2 : x, ci = 0;
    for (const { w } of parts) {
      ctx.font = fontFor(w);
      const col = accent.includes(w.replace(/[^\w’']/g, '')) ? O : color;
      for (let k = 0; k < w.length; k++) {
        const u = ease.quint(seg(t, tIn + ci * 0.028, tIn + ci * 0.028 + 0.5));
        const pre = ctx.measureText(w.slice(0, k)).width;
        ctx.globalAlpha = u * (1 - out);
        ctx.fillStyle = col;
        ctx.fillText(w[k], cx + pre, y + (1 - u) * size * 0.28 - out * size * 0.12);
        ci++;
      }
      cx += ctx.measureText(w + ' ').width; ci++;
    }
    ctx.restore();
  }
  function scrim(t, a) { // a soft dark band under the lower-third words (readability over the fireflies)
    if (a <= 0) return;
    const y0 = H * (wide ? 0.62 : 0.6), g = ctx.createLinearGradient(0, y0, 0, H);
    g.addColorStop(0, rgba(G, 0)); g.addColorStop(0.45, rgba(G, 0.75 * a)); g.addColorStop(1, rgba(G, 0.85 * a));
    ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0);
  }

  // ------------------------------------------------------------------ frame
  window.drawFrame = (t) => {
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none';
    // Ground: the night, lit a little from the centre (two-stop airbrush, Commercial Modernism).
    const bg = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, Math.hypot(W, H) * 0.62);
    bg.addColorStop(0, G); bg.addColorStop(1, K);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    const cam = camAt(t);
    const roll = t < T.stop ? 0.06 * Math.sin(t * 0.9) * seg(t, 0, 2) * (1 - ease.out(seg(t, T.freeze, T.stop))) : 0;
    const dim = 1 - 0.6 * ease.out(seg(t, T.stop, T.stop + 0.5));

    // Cards (far to near), handled ones fold into fireflies as the light passes.
    if (t < T.lightEnd + 2) {
      const list = cards.map((c) => ({ c, zr: t < T.stop ? mod(c.z - cam, D) : c.zf })).filter((o) => o.zr > NEAR).sort((a, b) => b.zr - a.zr);
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(roll); ctx.translate(-W / 2, -H / 2);
      for (const { c, zr } of list) {
        const fold = t >= c.th ? ease.in(seg(t, c.th, c.th + 0.4)) : 0;
        if (fold >= 1) continue;
        const [x, y, k] = proj(c.x, c.y, zr);
        const sw = 420 * k * c.sc * (1 - fold * 0.85), sh = 112 * k * c.sc * (1 - fold * 0.85);
        if (x + sw < -200 || x - sw > W + 200 || y + sh < -200 || y - sh > H + 200) continue;
        const fogFar = 1 - seg(zr, D * 0.7, D), near = seg(zr, NEAR, NEAR + 160);
        const df = Math.abs(zr - 900) / 900; const lvl = df < 0.35 ? 0 : df < 0.9 ? 1 : df < 1.8 ? 2 : 3;
        ctx.globalAlpha = fogFar * near * dim * (1 - fold);
        ctx.save(); ctx.translate(x, y); ctx.rotate(c.rot + fold * 1.2);
        const sp = sprites[c.label][lvl], scale = sw / 420;
        ctx.drawImage(sp, -sp.width * scale / 2, -sp.height * scale / 2, sp.width * scale, sp.height * scale);
        ctx.restore();
      }
      ctx.restore(); ctx.globalAlpha = 1;
    }

    // The rush of words in the noise: one at a time, flying past.
    for (const [w, t0] of RUSH) {
      const u = seg(t, t0, t0 + 1.25); if (u <= 0 || u >= 1 || t > T.stop) continue;
      const zr = lerp(2400, 140, ease.in(u)), [x, y, k] = proj(0, 0, zr);
      ctx.globalAlpha = seg(u, 0, 0.25) * (1 - seg(u, 0.8, 1));
      ctx.fillStyle = L; ctx.font = `italic 400 ${180 * k}px "${FD}"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(w, x, y); ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }

    // The light: the buddy. Arrives from the depth, then stays as the warm centre.
    if (t >= T.lightIn - 0.2 && t < T.end + 0.9) {
      let [lx, ly, k] = lightScreen(t);
      let size = clamp(k * 200, S * 0.022, S * 0.06);
      let a = ease.out(seg(t, T.lightIn - 0.2, T.lightIn + 0.6));
      if (t > T.rhythm) a *= lerp(1, 0.28, ease.inOut(seg(t, T.rhythm, T.rhythm + 1.2)));
      if (t > T.collapse) { a = lerp(0.28, 1.15, ease.inOut(seg(t, T.collapse + 0.3, T.end))); [lx, ly] = [W / 2, H * 0.5]; }
      if (t > T.end) { a *= 1 - ease.inOut(seg(t, T.end, T.end + 0.9)); }
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = a;
      ctx.drawImage(dot, lx - size * 2.2, ly - size * 2.2, size * 4.4, size * 4.4);
      ctx.globalAlpha = a * 0.3; ctx.drawImage(dot, lx - size * 5, ly - size * 5, size * 10, size * 10);
      // Anamorphic streak.
      const st = ctx.createLinearGradient(lx - W * 0.4, 0, lx + W * 0.4, 0);
      st.addColorStop(0, rgba(O, 0)); st.addColorStop(0.5, rgba(L, 0.4 * a)); st.addColorStop(1, rgba(O, 0));
      ctx.globalAlpha = 1; ctx.fillStyle = st; ctx.fillRect(lx - W * 0.4, ly - size * 0.06, W * 0.8, size * 0.12);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }

    // Fireflies.
    if (t >= T.lightIn) {
      ctx.globalCompositeOperation = 'lighter';
      const pulseX = W * (0.04 + ((t - T.rhythmText) / 1.6) % 1 * 0.96);
      for (const p of parts) {
        const pos = partPos(p, t); if (!pos) continue;
        const born = seg(t, spawn(p).t, spawn(p).t + 0.3);
        let a = born * (0.45 + 0.45 * Math.sin(t * 2 + p.ph) ** 2), s = S * 0.0095 * p.sz;
        if (t < T.rhythm + 1.2) a *= lerp(0.42, 1, ease.inOut(seg(t, T.rhythm, T.rhythm + 1.2))); // a swarm in additive light: keep it from burning out
        if (t > T.rhythmText && t < T.rhythmOut + 0.3 && Math.abs(pos[0] - pulseX) < S * 0.05) { a = 1; s *= 1.9; } // the beat runs along the line
        if (t > T.peopleText && t < T.peopleOut + 0.3 && p.d < 0.25) { const n = p.i % nodes.length; const on = seg(t, T.peopleText + n * 0.18, T.peopleText + n * 0.18 + 0.3); s *= 1 + on * 0.7; }
        if (t > T.quiet && t < T.hi + 0.9) a *= lerp(1, 0.32, ease.inOut(seg(t, T.quiet, T.quiet + 1.0))) + (t > T.hi ? lerp(0, 0.68, ease.inOut(seg(t, T.hi, T.hi + 0.9))) : 0);
        if (t > T.hi && t < T.collapse + 0.6) s *= lerp(1, 1.25, seg(t, T.hi, T.hiHeld));
        if (t > T.end) a *= 1 - ease.inOut(seg(t, T.end, T.end + 0.6));
        ctx.globalAlpha = clamp(a);
        ctx.drawImage(dot, pos[0] - s, pos[1] - s, s * 2, s * 2);
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }

    // Words.
    const big = S * (wide ? 0.105 : 0.095), mid = S * (wide ? 0.072 : 0.075);
    const lowY = H * (wide ? 0.8 : 0.76);
    scrim(t, Math.max(seg(t, T.before - 0.3, T.before) * (1 - seg(t, T.beforeOut, T.beforeOut + 0.4)), t > T.rhythmText - 0.3 && t < T.meetOut + 0.4 ? 1 : 0));
    { const qa = seg(t, T.stop, T.q1) * (1 - seg(t, T.qOut, T.qOut + 0.4)); if (qa > 0) { const g = ctx.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, S * 0.75); g.addColorStop(0, rgba(G, 0.82 * qa)); g.addColorStop(1, rgba(G, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); } }
    line('What if it was', t, T.q1, T.qOut, { y: H * 0.47, size: big });
    line('already handled?', t, T.q2, T.qOut, { y: H * 0.47 + big * 1.05, size: big, accent: ['handled'], italic: ['handled'] });
    line('Before you even asked.', t, T.before, T.beforeOut, { y: lowY, size: mid, accent: ['asked'], italic: ['asked'] });
    line('It learns your rhythm.', t, T.rhythmText, T.rhythmOut, { y: lowY, size: mid, accent: ['rhythm'], italic: ['rhythm'] });
    line('It knows your people.', t, T.peopleText, T.peopleOut, { y: lowY, size: mid, accent: ['people'], italic: ['people'] });
    line('It knows when to stay quiet.', t, T.quietText, T.quietOut, { y: lowY, size: mid, accent: ['quiet'], italic: ['quiet'] });
    line('Meet your AI buddy.', t, T.meet, T.meetOut, { y: H * (wide ? 0.8 : 0.8), size: mid, accent: ['buddy'], italic: ['buddy'] });

    // Brand: in from the first seconds (video.json: brand early), out before the end card.
    const bugA = 0.85 * seg(t, 1.0, 1.6) * (1 - seg(t, T.collapse, T.collapse + 0.5));
    if (bugA > 0) {
      const bs = S * 0.036, bx = S * 0.05, by = (wide ? H * 0.128 + S * 0.03 : S * 0.06);
      ctx.globalAlpha = bugA;
      if (mark) { ctx.globalCompositeOperation = 'screen'; ctx.drawImage(mark, bx, by, bs * mark.width / mark.height, bs); ctx.globalCompositeOperation = 'source-over'; }
      ctx.fillStyle = L; ctx.font = `500 ${bs * 0.4}px "${FM}"`; ctx.textBaseline = 'middle';
      ctx.fillText(F.brand.toUpperCase().split('').join(' '), bx + bs * (mark ? mark.width / mark.height : 0) + bs * 0.2, by + bs / 2);
      ctx.globalAlpha = 1;
    }

    // End card: the still that stays (poster, thumbnail, reduced motion).
    if (t >= T.end) {
      const u = ease.out(seg(t, T.end + 0.2, T.end + 1.1));
      const ms = S * (wide ? 0.2 : 0.22), cy = H * (wide ? 0.4 : 0.4);
      ctx.globalAlpha = u;
      if (mark) { ctx.globalCompositeOperation = 'screen'; const mw = ms * mark.width / mark.height; ctx.drawImage(mark, W / 2 - mw / 2, cy - ms * 0.62, mw, ms); ctx.globalCompositeOperation = 'source-over'; }
      ctx.globalAlpha = 1;
      line('Your AI buddy is coming soon.', t, T.end + 0.6, 1e9, { y: cy + ms * 0.62 + mid * 0.6, size: mid * 0.95, accent: ['soon'], italic: ['soon'] });
      const u2 = ease.out(seg(t, T.end + 1.6, T.end + 2.3));
      ctx.globalAlpha = u2; ctx.fillStyle = O; ctx.font = `500 ${S * 0.03}px "${FM}"`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('xooteq.com', W / 2, cy + ms * 0.62 + mid * 1.75); ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }

    // Grain (static frames, changed four times a second: texture, not flicker) and the cinema bars.
    ctx.globalAlpha = 0.045; ctx.globalCompositeOperation = 'overlay';
    const gi = grain[Math.floor(t * 4) % grain.length];
    for (let y = 0; y < H; y += 512) for (let x = 0; x < W; x += 512) ctx.drawImage(gi, x, y);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (wide) { const bar = (H - W / 2.39) / 2; ctx.fillStyle = K; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar); }
  };
})();
