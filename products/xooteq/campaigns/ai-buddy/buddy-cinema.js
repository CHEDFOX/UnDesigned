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
  let cards = [], sprites = {}, dot, grain = [], mark = null, camTable = []; // mark stays null: no mark in this film
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
    // No mark in this film (owner's call): the brand appears as its name only.

    // The tunnel: cards around the axis, centre kept clear for the words.
    for (let i = 0; i < 170; i++) {
      const a = rand() * Math.PI * 2, r = S * (0.5 + rand() * 0.75);
      cards.push({ x: Math.cos(a) * r * (wide ? 1.25 : 0.8), y: Math.sin(a) * r * (wide ? 0.75 : 1.2), z: rand() * D, rot: (rand() - 0.5) * 0.5, label: i % LABELS.length, sc: 0.8 + rand() * 0.5 });
    }
    // Camera: accelerating flight, then a hard (but eased) stop: the freeze.
    let z = 0; const dt = 1 / 240;
    for (let t = 0; t <= 60; t += dt) { camTable.push(z); z += speed(t) * dt; }

    setupHi();
    // When the light passes each card (the card is handled).
    const zf = camAt(T.stop);
    for (const c of cards) { c.zf = mod(c.z - zf, D); c.th = handledAt(c.zf); }
    // Sound events, so the score (buddy-score.py) hits exactly what we see.
    const passes = [];
    for (const c of cards) { let prev = mod(c.z - camAt(0), D); for (let t = 1 / 120; t < T.stop; t += 1 / 120) { const zr = mod(c.z - camAt(t), D); if (zr > prev + D / 2) passes.push([+t.toFixed(3), clamp(c.x / (S * 1.2), -1, 1)]); prev = zr; } }
    window.FILM_EVENTS = {
      passes: passes.sort((p, q) => p[0] - q[0]),
      absorb: cards.map((c) => [+c.th.toFixed(3), clamp(c.x / (S * 1.2), -1, 1)]).filter((e) => e[0] < T.lightEnd + 1).sort((p, q) => p[0] - q[0]),
      rush: RUSH.map(([, t0]) => t0 + 1.0),
      moments: MOMENTS.map((_, i) => T.rhythm + 1.0 + i * 0.4),
      people: PEOPLE.map((_, i) => T.people + 0.3 + i * 0.16),
      thread: T.peopleText + 0.8,
      heldIn: T.quiet + 1.0, heldBack: T.quiet + 2.5,
      penStart: T.hi + 0.4, penEnd: T.hi + 1.9, dotLand: T.hi + 2.5, sweep: T.end + 1.1,
    };
  };

  function speed(t) { if (t < T.freeze) return 260 + 1450 * (t / T.freeze) ** 2.2; if (t < T.stop) return (260 + 1450) * (1 - ease.out(seg(t, T.freeze, T.stop))); return 0; }
  const camAt = (t) => camTable[Math.min(camTable.length - 1, Math.max(0, Math.round(t * 240)))];
  const mod = (a, n) => ((a % n) + n) % n;
  const lightZ = (t) => lerp(D * 0.98, 300, ease.inOut(seg(t, T.lightIn, T.lightEnd))); // relative to the frozen camera
  function handledAt(zrel) { if (zrel <= 300) return T.lightEnd + 0.1 + (300 - zrel) / 1500; for (let t = T.lightIn; t <= T.lightEnd; t += 1 / 120) if (lightZ(t) <= zrel) return t; return T.lightEnd; }
  const proj = (x, y, zrel) => { const k = (S * FOCAL) / Math.max(zrel, 1); return [W / 2 + x * k, H / 2 + y * k, k]; };

  // ------------------------------------------------------------------ the buddy's world
  // One warm light (a glass-like orb with a gyroscope of thin rings) and the things it knows, drawn as
  // precise, specific objects: your day on a 24-hour dial, your people as initials, a message held back,
  // and a "hi" written by the light itself, which ends as the dot of the i.
  const MOMENTS = [[7.17, '07:10', 'Wake'], [8.75, '08:45', 'Coffee'], [13, '13:00', 'Lunch'], [18.5, '18:30', 'Run'], [23.33, '23:20', 'Sleep']];
  const PEOPLE = [['M', 'Mom'], ['S', 'Sam'], ['P', 'Priya'], ['D', 'Dad'], ['A', 'Alex']];
  let HI = null;
  const home = () => [W / 2, H * (wide ? 0.43 : 0.42)];
  const R0 = () => S * (wide ? 0.058 : 0.052);
  function setupHi() {
    const size = wide ? H * 0.42 : W * 0.56;
    ctx.font = `italic 400 ${size}px "${FD}"`;
    const wh = ctx.measureText('h').width, wi = ctx.measureText('ı').width, w = wh + wi;
    const x0 = W / 2 - w / 2, yb = H * (wide ? 0.62 : 0.55);
    HI = { size, w, x0, yb, dx: x0 + wh + wi * 0.5 + size * 0.11, dy: yb - size * 0.63, dotR: size * 0.052 };
  }
  const penAt = (u) => [HI.x0 + u * HI.w + HI.size * 0.06, HI.yb - HI.size * (0.3 + 0.2 * Math.sin(u * Math.PI * 4))];

  function orbState(t) {
    let x, y, r, a = 1;
    const [cx, cy] = home();
    if (t < T.lightEnd) {
      const [px, py, k] = proj(0, 0, lightZ(t));
      const u = ease.inOut(seg(t, T.lightEnd - 1.4, T.lightEnd));
      x = lerp(px, cx, u); y = lerp(py, cy, u); r = lerp(clamp(k * 160, S * 0.006, R0()), R0(), u);
      a = ease.out(seg(t, T.lightIn - 0.2, T.lightIn + 0.8));
    } else { x = cx; y = cy; r = R0(); }
    if (t > T.quiet) a *= lerp(1, 0.45, ease.inOut(seg(t, T.quiet + 0.4, T.quiet + 1.6)));
    if (t > T.hi - 0.7) {
      const p0 = penAt(0), u = seg(t, T.hi + 0.4, T.hi + 1.9);
      if (t < T.hi + 0.4) { const v = ease.inOut(seg(t, T.hi - 0.7, T.hi + 0.4)); x = lerp(cx, p0[0], v); y = lerp(cy, p0[1], v); r = lerp(R0(), HI.dotR * 0.8, v); a = lerp(a, 1, v); }
      else if (t < T.hi + 1.9) { [x, y] = penAt(u); r = HI.dotR * 0.8; a = 1; }
      else { const v = ease.inOut(seg(t, T.hi + 1.9, T.hi + 2.5)), p1 = penAt(1); x = lerp(p1[0], HI.dx, v); y = lerp(p1[1], HI.dy, v); r = lerp(HI.dotR * 0.8, HI.dotR, v); a = 1; }
    }
    if (t > T.collapse) { const v = ease.inOut(seg(t, T.collapse + 0.2, T.end)); x = lerp(x, cx, v); y = lerp(y, cy, v); r = lerp(r, R0() * 1.5, v); }
    if (t > T.end) a *= 1 - ease.inOut(seg(t, T.end, T.end + 0.8));
    const rings = (1 - 0.6 * ease.inOut(seg(t, T.quiet + 0.4, T.quiet + 1.6))) * (1 - seg(t, T.hi - 0.7, T.hi - 0.2));
    return { x, y, r, a, rings: t < T.lightEnd ? seg(t, T.lightEnd - 1.0, T.lightEnd) : rings };
  }

  function ring(x, y, rx, ry, rot, a0, a1, alpha) { ctx.strokeStyle = rgba(L, alpha); ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, a0, a1); ctx.stroke(); }
  function drawOrb(t, o) {
    const { x, y, r, a, rings } = o;
    if (a <= 0.002 || r <= 0) return;
    const rr = r * (1 + 0.03 * Math.sin((t * 2 * Math.PI) / 3.2));
    // Halo (light, added).
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    let g = ctx.createRadialGradient(x, y, rr * 0.5, x, y, rr * 6);
    g.addColorStop(0, rgba(O, 0.3 * a)); g.addColorStop(0.3, rgba(O, 0.07 * a)); g.addColorStop(1, rgba(O, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr * 6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // Rings: back halves behind the body, front halves in front (a gyroscope, slowly turning).
    const ringSpec = [[1.95, 0.3, 0.42 + t * 0.09, -1.0], [2.55, 0.26, -0.55 - t * 0.07, 1.3]];
    ctx.lineWidth = Math.max(1, S * 0.0012);
    if (rings > 0) for (const [k, e, rot] of ringSpec) ring(x, y, rr * k, rr * k * e, rot, Math.PI, Math.PI * 2, 0.32 * a * rings);
    // Body: a solid pearl of light with a crisp rim.
    ctx.globalAlpha = a;
    g = ctx.createRadialGradient(x - rr * 0.35, y - rr * 0.4, rr * 0.05, x, y, rr);
    g.addColorStop(0, F.white); g.addColorStop(0.28, L); g.addColorStop(0.72, O); g.addColorStop(1, mix(O, G, 0.55));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(L, 0.55); ctx.lineWidth = Math.max(1, S * 0.0014); ctx.stroke();
    ctx.globalAlpha = 1;
    if (rings > 0) {
      for (const [k, e, rot, sp] of ringSpec) {
        ring(x, y, rr * k, rr * k * e, rot, 0, Math.PI, 0.45 * a * rings);
        const th = t * sp, ex = Math.cos(th) * rr * k, ey = Math.sin(th) * rr * k * e;
        const bx = x + ex * Math.cos(rot) - ey * Math.sin(rot), by = y + ex * Math.sin(rot) + ey * Math.cos(rot);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * rings * (Math.sin(th) > 0 ? 1 : 0.35);
        const s = S * 0.009; ctx.drawImage(dot, bx - s, by - s, s * 2, s * 2); ctx.restore();
      }
    }
  }
  // Each card the light passes is pulled into it as a thin streak.
  function streaks(t, o) {
    if (t < T.lightIn || t > T.lightEnd + 1.2) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const c of cards) {
      const u = seg(t, c.th, c.th + 0.5); if (u <= 0 || u >= 1) continue;
      const [fx, fy] = proj(c.x, c.y, c.zf);
      const hu = ease.in(u), tu = ease.in(Math.max(0, u - 0.3));
      const hx = lerp(fx, o.x, hu), hy = lerp(fy, o.y, hu), tx = lerp(fx, o.x, tu), ty = lerp(fy, o.y, tu);
      const g = ctx.createLinearGradient(tx, ty, hx, hy); g.addColorStop(0, rgba(O, 0)); g.addColorStop(1, rgba(L, 0.85 * (1 - u * 0.4)));
      ctx.strokeStyle = g; ctx.lineWidth = S * 0.0028 * (1 - u * 0.5);
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
    }
    ctx.restore();
  }
  // Your day on a 24-hour dial: the moments it has learned light up one by one.
  function dial(t) {
    const vis = seg(t, T.rhythm, T.rhythm + 0.5) * (1 - seg(t, T.people + 0.1, T.people + 0.8));
    if (vis <= 0) return;
    const [cx, cy] = home(), Rd = wide ? H * 0.19 : W * 0.34;
    const draw = ease.inOut(seg(t, T.rhythm, T.rhythm + 1.2));
    const ang = (h) => -Math.PI / 2 + (h / 24) * Math.PI * 2;
    ctx.save(); ctx.globalAlpha = vis; ctx.lineCap = 'butt';
    ctx.strokeStyle = rgba(L, 0.22); ctx.lineWidth = Math.max(1, S * 0.0015);
    ctx.beginPath(); ctx.arc(cx, cy, Rd, -Math.PI / 2, -Math.PI / 2 + draw * Math.PI * 2); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let h = 0; h < 24; h++) {
      if (h / 24 > draw) break;
      const a = ang(h), major = h % 6 === 0, l = major ? S * 0.02 : S * 0.009;
      ctx.strokeStyle = rgba(L, major ? 0.6 : 0.28);
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (Rd - l), cy + Math.sin(a) * (Rd - l)); ctx.lineTo(cx + Math.cos(a) * Rd, cy + Math.sin(a) * Rd); ctx.stroke();
      if (major) { ctx.fillStyle = rgba(L, 0.42); ctx.font = `400 ${S * 0.015}px "${FM}"`; ctx.fillText(String(h).padStart(2, '0'), cx + Math.cos(a) * (Rd - S * 0.045), cy + Math.sin(a) * (Rd - S * 0.045)); }
    }
    MOMENTS.forEach(([h, time, word], i) => {
      const t0 = T.rhythm + 1.0 + i * 0.4, u = ease.out(seg(t, t0, t0 + 0.55));
      if (u <= 0) return;
      const a0 = ang(h);
      ctx.globalAlpha = vis; ctx.strokeStyle = O; ctx.lineWidth = S * 0.0075; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy, Rd, a0, ang(h + 0.9 * u)); ctx.stroke();
      const lr = Rd + S * 0.055, lx = cx + Math.cos(a0) * lr, ly = cy + Math.sin(a0) * lr;
      ctx.textAlign = Math.cos(a0) > 0.25 ? 'left' : Math.cos(a0) < -0.25 ? 'right' : 'center';
      ctx.globalAlpha = vis * u;
      ctx.fillStyle = rgba(L, 0.55); ctx.font = `400 ${S * 0.019}px "${FM}"`; ctx.fillText(time, lx, ly - S * 0.021);
      ctx.fillStyle = L; ctx.font = `italic 400 ${S * 0.038}px "${FD}"`; ctx.fillText(word, lx, ly + S * 0.017);
    });
    ctx.restore();
  }
  // Your people: initials around the light; the one to call back gets a thread.
  function people(t) {
    const vis = seg(t, T.people + 0.3, T.people + 1.0) * (1 - seg(t, T.quiet + 0.1, T.quiet + 1.1));
    if (vis <= 0) return;
    const [cx, cy] = home(), Rp = wide ? H * 0.25 : W * 0.34;
    ctx.save();
    PEOPLE.forEach(([ini, name], i) => {
      const t0 = T.people + 0.3 + i * 0.16, u = ease.out(seg(t, t0, t0 + 0.6));
      if (u <= 0) return;
      const an = -Math.PI / 2 + i * ((Math.PI * 2) / 5) + 0.3 + t * 0.05;
      const rad = Rp * (0.88 + (i % 2) * 0.2) * lerp(0.55, 1, u) * (1 + 0.4 * ease.in(seg(t, T.quiet + 0.1, T.quiet + 1.1)));
      const x = cx + Math.cos(an) * rad * (wide ? 1.55 : 1), y = cy + Math.sin(an) * rad * (wide ? 0.82 : 1.1);
      const ar = S * 0.042, call = i === 1 && t > T.peopleText + 0.8;
      if (i === 1) {
        const v = ease.inOut(seg(t, T.peopleText + 0.8, T.peopleText + 1.4));
        if (v > 0) { ctx.globalAlpha = vis; ctx.strokeStyle = O; ctx.lineWidth = S * 0.0022; ctx.setLineDash([S * 0.007, S * 0.009]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(lerp(cx, x, v), lerp(cy, y, v)); ctx.stroke(); ctx.setLineDash([]); }
      }
      ctx.globalAlpha = vis * u;
      ctx.fillStyle = G; ctx.beginPath(); ctx.arc(x, y, ar, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = call ? O : rgba(L, 0.5); ctx.lineWidth = S * 0.0022; ctx.stroke();
      ctx.fillStyle = call ? O : L; ctx.font = `400 ${ar * 1.05}px "${FD}"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(ini, x, y + ar * 0.07);
      ctx.fillStyle = call ? O : rgba(L, 0.62); ctx.font = `400 ${S * 0.021}px "${FM}"`; ctx.fillText(call ? 'Sam · call back' : name, x, y + ar + S * 0.034);
    });
    ctx.restore();
  }
  // Staying quiet: a message arrives and is gently held back until you are free.
  function held(t) {
    const t0 = T.quiet + 1.0;
    if (t < t0 || t > T.hi) return;
    const [cx, cy] = home();
    const inU = ease.out(seg(t, t0, t0 + 0.8)), back = ease.inOut(seg(t, t0 + 1.5, t0 + 2.6));
    const sp = sprites[8][0], sc = (S * (wide ? 0.34 : 0.5)) / 420, w = sp.width * sc, h = sp.height * sc;
    const restX = wide ? cx + S * 0.55 : cx, x = lerp(W + w, restX, inU) + back * S * 0.05, y = wide ? cy : cy + S * 0.5;
    const fade = 1 - seg(t, T.hi - 0.6, T.hi);
    ctx.save(); ctx.globalAlpha = (1 - back * 0.7) * fade; ctx.drawImage(sp, x - w / 2, y - h / 2, w, h);
    ctx.globalAlpha = back * fade; ctx.fillStyle = O; ctx.font = `400 ${S * 0.02}px "${FM}"`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('Held until you’re free', x, y + h * 0.42); ctx.restore();
  }
  // "hi", written by the light (the light becomes the pen, then the dot of the i).
  function hiWord(t) {
    if (t < T.hi + 0.35 || t > T.end + 0.3) return;
    const u = seg(t, T.hi + 0.4, T.hi + 1.9), out = ease.in(seg(t, T.collapse, T.collapse + 0.6));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, HI.x0 + u * (HI.w + HI.size * 0.3), H); ctx.clip();
    ctx.globalAlpha = 1 - out; ctx.font = `italic 400 ${HI.size}px "${FD}"`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    ctx.shadowColor = rgba(O, 0.55); ctx.shadowBlur = HI.size * 0.06; ctx.fillStyle = L; ctx.fillText('hı', HI.x0, HI.yb);
    ctx.restore();
  }
  function flare(t, o) {
    const fa = seg(t, T.collapse + 0.3, T.end) * (1 - seg(t, T.end, T.end + 0.9)) + 0.6 * seg(t, T.lightIn, T.lightIn + 0.5) * (1 - seg(t, T.lightIn + 0.5, T.lightIn + 1.6));
    if (fa <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const st = ctx.createLinearGradient(o.x - W * 0.45, 0, o.x + W * 0.45, 0);
    st.addColorStop(0, rgba(O, 0)); st.addColorStop(0.5, rgba(L, 0.75 * fa)); st.addColorStop(1, rgba(O, 0));
    ctx.fillStyle = st; ctx.fillRect(o.x - W * 0.45, o.y - S * 0.0025, W * 0.9, S * 0.005); ctx.restore();
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
  function scrim(t, a) { // a soft dark band under the lower-third words (readability)
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

    // Cards (far to near); the ones the light passes are pulled into it.
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

    // The buddy's world: streaks of handled noise, the dial, the people, the held message, the light, "hi".
    const orb = orbState(t);
    streaks(t, orb); dial(t); people(t); held(t); hiWord(t); drawOrb(t, orb); flare(t, orb);

    // Words.
    const big = S * (wide ? 0.105 : 0.095), mid = S * (wide ? 0.072 : 0.075);
    const lowY = H * (wide ? 0.845 : 0.78);
    scrim(t, Math.max(seg(t, T.before - 0.3, T.before) * (1 - seg(t, T.beforeOut, T.beforeOut + 0.4)), t > T.rhythmText - 0.3 && t < T.meetOut + 0.4 ? 1 : 0));
    { const qa = seg(t, T.stop, T.q1) * (1 - seg(t, T.qOut, T.qOut + 0.4)); if (qa > 0) { const g = ctx.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, S * 0.75); g.addColorStop(0, rgba(G, 0.82 * qa)); g.addColorStop(1, rgba(G, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); } }
    line('What if it was', t, T.q1, T.qOut, { y: H * 0.47, size: big });
    line('already handled?', t, T.q2, T.qOut, { y: H * 0.47 + big * 1.05, size: big, accent: ['handled'], italic: ['handled'] });
    line('Before you even asked.', t, T.before, T.beforeOut, { y: lowY, size: mid, accent: ['asked'], italic: ['asked'] });
    line('It learns your rhythm.', t, T.rhythmText, T.rhythmOut, { y: lowY, size: mid, accent: ['rhythm'], italic: ['rhythm'] });
    line('It knows your people.', t, T.peopleText, T.peopleOut, { y: lowY, size: mid, accent: ['people'], italic: ['people'] });
    line('It knows when to stay quiet.', t, T.quietText, T.quietOut, { y: lowY, size: mid, accent: ['quiet'], italic: ['quiet'] });
    line('Meet your AI buddy.', t, T.meet, T.meetOut, { y: lowY, size: mid, accent: ['buddy'], italic: ['buddy'] });

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

    // End card: the still that stays (poster, thumbnail, reduced motion). The name, large, in spaced
    // capitals, with a soft glow and one sweep of light across the letters; then the line and the address.
    if (t >= T.end) {
      const u = ease.out(seg(t, T.end + 0.3, T.end + 1.3));
      const cy = H * (wide ? 0.43 : 0.42), ws = S * (wide ? 0.105 : 0.1);
      const word = F.brand.toUpperCase(), track = ws * 0.32;
      ctx.save(); ctx.font = `500 ${ws}px "${FM}"`; ctx.textBaseline = 'alphabetic';
      const chars = [...word], cw = chars.map((c) => ctx.measureText(c).width), tw = cw.reduce((a, b) => a + b, 0) + track * (chars.length - 1);
      const x0 = W / 2 - tw / 2, yb = cy;
      const drawWord = (g) => { let x = x0; chars.forEach((c, i) => { g.fillText(c, x, yb); x += cw[i] + track; }); };
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.4 * u; ctx.filter = `blur(${S * 0.01}px)`; ctx.fillStyle = O; drawWord(ctx); ctx.filter = 'none';
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = u; ctx.fillStyle = L; drawWord(ctx);
      const sv = seg(t, T.end + 1.1, T.end + 2.1);
      if (sv > 0 && sv < 1) {
        const off = document.createElement('canvas'); off.width = W; off.height = H; const g = off.getContext('2d');
        g.font = ctx.font; g.textBaseline = 'alphabetic'; g.fillStyle = '#fff'; drawWord(g);
        const bx = lerp(x0 - tw * 0.3, x0 + tw * 1.3, ease.inOut(sv)), gr = g.createLinearGradient(bx - tw * 0.12, 0, bx + tw * 0.12, 0);
        gr.addColorStop(0, rgba(O, 0)); gr.addColorStop(0.5, F.white); gr.addColorStop(1, rgba(O, 0));
        g.globalCompositeOperation = 'source-in'; g.fillStyle = gr; g.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.9; ctx.drawImage(off, 0, 0);
      }
      ctx.restore();
      line('Your AI buddy is coming soon.', t, T.end + 0.7, 1e9, { y: cy + ws * 1.05, size: mid * 0.92, accent: ['soon'], italic: ['soon'] });
      const u2 = ease.out(seg(t, T.end + 1.7, T.end + 2.4));
      ctx.globalAlpha = u2; ctx.fillStyle = O; ctx.font = `500 ${S * 0.028}px "${FM}"`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('xooteq.com', W / 2, cy + ws * 1.05 + mid * 1.1); ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }

    // Grain (static frames, changed four times a second: texture, not flicker) and the cinema bars.
    ctx.globalAlpha = 0.045; ctx.globalCompositeOperation = 'overlay';
    const gi = grain[Math.floor(t * 4) % grain.length];
    for (let y = 0; y < H; y += 512) for (let x = 0; x < W; x += 512) ctx.drawImage(gi, x, y);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (wide) { const bar = (H - W / 2.39) / 2; ctx.fillStyle = K; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar); }
  };
})();
