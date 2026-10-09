// Tailzu's own motifs for the design engine, drawn only with the style's primitives
// (Humanist Minimal: ink line over white cut-paper shapes, accent on one object).
// Each motif: (ctx, box, { ill, palette }) -> svg. The metaphors come from identity.json:
// talk is a looping thread, writing is a straight line, the keyboard is a paper keycap.

const r1 = (n) => Math.round(n * 10) / 10;

function setup(ctx, b, h) {
  const s = Math.min(b.w, b.h);
  const ink = h.palette.ink, paper = h.palette.paper, accent = h.palette.accent;
  const onPaper = ctx.readableOn(paper, [ctx.pal.black, ctx.pal.ink]);
  const sw = r1(s * 0.022);
  const paperLine = (pts, seed) => `<path d="${h.ill.inkLine(pts, { seed })}" fill="none" stroke="${onPaper}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const line = (pts, seed) => `<path d="${h.ill.inkLine(pts, { seed })}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return { s, ink, paper, accent, sw, line, paperLine, onPaper, cx: b.x + b.w / 2, cy: b.y + b.h / 2 };
}

/** Loops of a talking thread between x0 and x1 around y. */
function loops(x0, x1, y, n, r) {
  const pts = [];
  const step = (x1 - x0) / n;
  for (let i = 0; i <= n * 16; i++) {
    const t = i / 16;
    const a = t * Math.PI * 2;
    pts.push([x0 + t * step - Math.sin(a) * r * 1.25, y - (1 - Math.cos(a)) * r]);
  }
  return pts;
}


const exports_ = {
  // Talk in, text out: a looping thread runs into one paper keycap with a microphone and leaves as a straight line.
  'thread-to-line'(ctx, b, h) {
    const { s, ink, paper, accent, sw, line, cx, cy } = setup(ctx, b, h);
    const kw = s * 0.26, kh = s * 0.26;
    const kx = cx - kw / 2, ky = cy - kh / 2;
    const cap = h.ill.roundedPolygon([[kx, ky], [kx + kw, ky], [kx + kw, ky + kh], [kx, ky + kh]], kw * 0.22);
    const mic = `<rect x="${r1(cx - kw * 0.09)}" y="${r1(cy - kh * 0.26)}" width="${r1(kw * 0.18)}" height="${r1(kh * 0.34)}" rx="${r1(kw * 0.09)}" fill="${accent}"/>` +
      `<path d="M${r1(cx - kw * 0.17)} ${r1(cy - kh * 0.02)} Q${r1(cx)} ${r1(cy + kh * 0.26)} ${r1(cx + kw * 0.17)} ${r1(cy - kh * 0.02)} M${r1(cx)} ${r1(cy + kh * 0.14)} L${r1(cx)} ${r1(cy + kh * 0.26)}" fill="none" stroke="${ink}" stroke-width="${r1(sw * 0.8)}" stroke-linecap="round"/>`;
    const talk = line(loops(b.x - s * 0.05, kx, cy + s * 0.04, 3, s * 0.08), 3);
    const write = line([[kx + kw, cy], [b.x + b.w + s * 0.05, cy]], 5);
    return talk + write + `<path d="${cap}" fill="${paper}" stroke="${ink}" stroke-width="${sw}"/>` + mic;
  },

  // A said message as a scribbled paper bubble, answered by a clean one.
  'two-bubbles'(ctx, b, h) {
    const { s, ink, paper, accent, sw, line, paperLine, onPaper } = setup(ctx, b, h);
    const x1 = b.x + b.w * 0.34, y1 = b.y + b.h * 0.34, x2 = b.x + b.w * 0.62, y2 = b.y + b.h * 0.68;
    const bub1 = `<path d="${h.ill.blob(x1, y1, s * 0.26, s * 0.17, { seed: 4, points: 7 })}" fill="${paper}"/>`;
    const scrib = paperLine(loops(x1 - s * 0.14, x1 + s * 0.14, y1 + s * 0.04, 4, s * 0.025), 8);
    const bub2 = `<path d="${h.ill.blob(x2, y2, s * 0.27, s * 0.15, { seed: 9, points: 8 })}" fill="${paper}"/>`;
    const lines = [0, 1].map((k) => paperLine([[x2 - s * 0.17, y2 - s * 0.03 + k * s * 0.07], [x2 + s * (k ? 0.06 : 0.16), y2 - s * 0.03 + k * s * 0.07]], 12 + k)).join('');
    const dot = `<circle cx="${r1(x2 + s * 0.12)}" cy="${r1(y2 + s * 0.04)}" r="${r1(sw * 1.3)}" fill="${accent}"/>`;
    return bub1 + scrib + bub2 + lines + dot;
  },

  // One message, many tones: a paper dial with eight ticks; the accent pointer picks one.
  'tone-dial'(ctx, b, h) {
    const { s, ink, paper, accent, sw, cx, cy } = setup(ctx, b, h);
    const R = s * 0.3;
    const disc = `<path d="${h.ill.blob(cx, cy, R, R, { seed: 6, points: 8, irregularity: 0.04 })}" fill="${paper}" stroke="${ink}" stroke-width="${sw}"/>`;
    const ticks = Array.from({ length: 8 }, (_, i) => {
      const a = -Math.PI * 0.9 + (i / 7) * Math.PI * 0.8 + Math.PI * 0.2;
      return `<path d="${h.ill.inkLine([[cx + Math.cos(a) * R * 1.18, cy + Math.sin(a) * R * 1.18], [cx + Math.cos(a) * R * 1.36, cy + Math.sin(a) * R * 1.36]], { seed: 20 + i })}" stroke="${ink}" stroke-width="${r1(sw * 0.8)}" stroke-linecap="round" fill="none"/>`;
    }).join('');
    const a = -Math.PI * 0.35;
    const pointer = `<path d="${h.ill.roundedPolygon([[cx - R * 0.08, cy], [cx + Math.cos(a) * R * 0.78, cy + Math.sin(a) * R * 0.78], [cx + R * 0.08, cy + R * 0.02]], R * 0.05)}" fill="${accent}"/>`;
    return disc + ticks + pointer + `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(R * 0.09)}" fill="${ink}"/>`;
  },

  // Your words stay, your audio leaves: a paper slip stays put while a thread leaves through the top edge.
  'words-stay'(ctx, b, h) {
    const { s, ink, paper, accent, sw, line, paperLine, cx, cy } = setup(ctx, b, h);
    const w = s * 0.62, hh = s * 0.22;
    const slip = `<path d="${h.ill.paperPolygon([[cx - w / 2, cy - hh / 2 + s * 0.08], [cx + w / 2, cy - hh / 2 + s * 0.08], [cx + w / 2, cy + hh / 2 + s * 0.08], [cx - w / 2, cy + hh / 2 + s * 0.08]], { radius: s * 0.03, seed: 7 })}" fill="${paper}" stroke="${ink}" stroke-width="${sw}"/>`;
    const text = [0, 1].map((k) => paperLine([[cx - w * 0.38, cy + s * 0.05 + k * s * 0.07], [cx + w * (k ? 0.1 : 0.38), cy + s * 0.05 + k * s * 0.07]], 30 + k)).join('');
    const dot = `<circle cx="${r1(cx + w * 0.16)}" cy="${r1(cy + s * 0.12)}" r="${r1(sw * 1.3)}" fill="${accent}"/>`;
    const away = line(loops(cx - w * 0.1, cx + w * 0.3, cy - hh / 2, 2, s * 0.06).concat([[cx + w * 0.42, b.y - s * 0.05]]), 33);
    return away + slip + text + dot;
  },
};

// ---------------------------------------------------------------- motifs that carry the piece's own words
const FILLERS = /^(um+|uh+|umm+|like|so|basically|matlab|haan haan)$/i;

function faces(ctx) {
  return {
    hand: { family: ctx.fam.hand || ctx.fam.body, weight: 400 },
    mono: { family: ctx.fam.mono, weight: 400, upper: true, tracking: 0.12 },
    display: ctx.face('headline'),
    body: ctx.face('body'),
  };
}
function textEl(ctx, x, y, size, f, fill, str, extra = '') {
  return `<text x="${r1(x)}" y="${r1(y)}" font-family="'${ctx.esc(f.family)}', sans-serif" font-weight="${f.weight}" font-size="${r1(size)}"${f.tracking ? ` letter-spacing="${r1(f.tracking * size)}"` : ''} fill="${fill}"${extra}>${ctx.esc(f.upper ? String(str).toUpperCase() : str)}</text>`;
}
/** The said line in the hand face, fillers struck through with an ink proof mark. */
function saidLine(ctx, h, x, y, w, maxSize, said) {
  const F = faces(ctx);
  const ft = ctx.fit(said, w, maxSize * 1.4, F.hand, { max: maxSize, min: 12, maxLines: 2 });
  const ink = h.palette.ink;
  let out = '';
  ft.lines.forEach((line, k) => {
    const yy = y + ft.size * (0.9 + k * 1.15);
    out += textEl(ctx, x, yy, ft.size, F.hand, ink, line);
    let cx = x;
    for (const word of line.split(' ')) {
      const ww = ctx.textWidth(word, { ...F.hand, size: ft.size });
      if (FILLERS.test(word)) out += `<path d="${h.ill.inkLine([[cx - ft.size * 0.1, yy - ft.size * 0.28], [cx + ww + ft.size * 0.1, yy - ft.size * 0.36]], { seed: 41 })}" stroke="${h.palette.accent}" stroke-width="${r1(ft.size * 0.09)}" stroke-linecap="round" fill="none"/>`;
      cx += ww + ctx.textWidth(' ', { ...F.hand, size: ft.size });
    }
  });
  return { svg: out, height: ft.size * (1 + (ft.lines.length - 1) * 1.15) + ft.size * 0.3 };
}
function writtenLine(ctx, h, x, y, w, maxSize, written, fill) {
  const F = faces(ctx);
  const ft = ctx.fit(written, w, maxSize * 3.4, F.display, { max: maxSize, min: 16, maxLines: 3, lead: 1.08 });
  let out = '';
  ft.lines.forEach((line, k) => { out += textEl(ctx, x, y + ft.size * (0.86 + k * 1.08), ft.size, F.display, fill, line); });
  const last = ft.lines[ft.lines.length - 1];
  const lw = ctx.textWidth(last, { ...F.display, size: ft.size });
  out += `<circle cx="${r1(x + lw + ft.size * 0.13)}" cy="${r1(y + ft.size * (0.86 + (ft.lines.length - 1) * 1.08) - ft.size * 0.06)}" r="${r1(ft.size * 0.09)}" fill="${h.palette.accent}"/>`;
  return { svg: out, height: ft.size * (1 + (ft.lines.length - 1) * 1.08) + ft.size * 0.3 };
}

Object.assign(exports_, {
  // Said -> Written: the brand's own mechanic, drawn in the style (hand for speech, type for text).
  'said-written'(ctx, b, h) {
    const F = faces(ctx);
    const s = Math.min(b.w, b.h), lab = Math.max(12, s * 0.035), ink = h.palette.ink;
    let y = b.y;
    let out = textEl(ctx, b.x, y + lab, lab, F.mono, ink, 'Said');
    y += lab * 1.8;
    const said = saidLine(ctx, h, b.x, y, b.w, s * 0.075, ctx.piece.said || '');
    out += said.svg; y += said.height + s * 0.02;
    out += `<path d="${h.ill.inkLine(loops(b.x, b.x + b.w * 0.55, y + s * 0.06, 3, s * 0.045).concat([[b.x + b.w, y + s * 0.06]]), { seed: 2 })}" fill="none" stroke="${ink}" stroke-width="${r1(s * 0.012)}" stroke-linecap="round"/>`;
    y += s * 0.14;
    out += textEl(ctx, b.x, y + lab, lab, F.mono, ink, 'Written');
    y += lab * 1.9;
    out += writtenLine(ctx, h, b.x, y, b.w, s * 0.13, ctx.piece.written || '', ink).svg;
    return out;
  },

  // A chat: their message, your spoken note, the clean reply (accent full stop).
  chat(ctx, b, h) {
    const F = faces(ctx);
    const s = Math.min(b.w, b.h), ink = h.palette.ink, paper = h.palette.paper;
    const black = ctx.readableOn(paper, [ctx.pal.black, ctx.pal.ink]);
    let out = '';
    const bubble = (x, y, w, txt, size, right) => {
      const ft = ctx.fit(txt, w - size * 1.6, size * 4, F.body, { max: size, min: 12, maxLines: 3 });
      const bh = ft.height + size * 1.3, bw = Math.min(w, ft.width + size * 1.8);
      const bx = right ? x + w - bw : x;
      out += `<path d="${h.ill.roundedPolygon([[bx, y], [bx + bw, y], [bx + bw, y + bh], [bx, y + bh]], size * 0.7)}" fill="${paper}"/>`;
      ft.lines.forEach((l, k) => { out += textEl(ctx, bx + size * 0.9, y + size * 1.25 + k * ft.size * 1.15, ft.size, F.body, black, l); });
      return { h: bh, x: bx, w: bw, ft };
    };
    const a = bubble(b.x, b.y, b.w * 0.6, ctx.piece.incoming || '', s * 0.05, false);
    let y = b.y + a.h + s * 0.06;
    if (ctx.piece.note) {
      const sl = saidLine(ctx, h, b.x + b.w * 0.25, y, b.w * 0.75, s * 0.055, ctx.piece.note);
      out += sl.svg; y += sl.height + s * 0.02;
      out += `<path d="${h.ill.inkLine(loops(b.x + b.w * 0.3, b.x + b.w * 0.7, y + s * 0.04, 3, s * 0.03), { seed: 5 })}" fill="none" stroke="${ink}" stroke-width="${r1(s * 0.012)}" stroke-linecap="round"/>`;
      y += s * 0.1;
    }
    const r = bubble(b.x + b.w * 0.15, y, b.w * 0.85, ctx.piece.written || '', s * 0.055, true);
    const last = r.ft.lines[r.ft.lines.length - 1];
    out += `<circle cx="${r1(r.x + s * 0.055 * 0.9 + ctx.textWidth(last, { ...F.body, size: r.ft.size }) + r.ft.size * 0.18)}" cy="${r1(y + s * 0.055 * 1.25 + (r.ft.lines.length - 1) * r.ft.size * 1.15 - r.ft.size * 0.08)}" r="${r1(r.ft.size * 0.11)}" fill="${h.palette.accent}"/>`;
    return out;
  },

  // A typed box (an AI prompt, an editor line): the spoken note above, the clean text landing in the box.
  'typed-box'(ctx, b, h) {
    const F = faces(ctx);
    const s = Math.min(b.w, b.h), ink = h.palette.ink, paper = h.palette.paper;
    const black = ctx.readableOn(paper, [ctx.pal.black, ctx.pal.ink]);
    let out = '', y = b.y;
    if (ctx.piece.note) { const sl = saidLine(ctx, h, b.x, y, b.w, s * 0.06, ctx.piece.note); out += sl.svg; y += sl.height; }
    out += `<path d="${h.ill.inkLine(loops(b.x, b.x + b.w * 0.6, y + s * 0.07, 4, s * 0.035).concat([[b.x + b.w * 0.8, y + s * 0.07], [b.x + b.w * 0.82, y + s * 0.13]]), { seed: 9 })}" fill="none" stroke="${ink}" stroke-width="${r1(s * 0.012)}" stroke-linecap="round"/>`;
    y += s * 0.15;
    const bh = Math.max(s * 0.3, b.y + b.h - y);
    out += `<path d="${h.ill.roundedPolygon([[b.x, y], [b.x + b.w, y], [b.x + b.w, y + bh], [b.x, y + bh]], s * 0.04)}" fill="${paper}"/>`;
    out += textEl(ctx, b.x + s * 0.05, y + s * 0.08, s * 0.03, F.mono, black, ctx.piece.box || 'Ask anything');
    const ft = ctx.fit(ctx.piece.written || '', b.w - s * 0.1, bh - s * 0.2, F.body, { max: s * 0.055, min: 12, maxLines: 4 });
    ft.lines.forEach((l, k) => { out += textEl(ctx, b.x + s * 0.05, y + s * 0.16 + ft.size * 0.8 + k * ft.size * 1.2, ft.size, F.body, black, l); });
    out += `<circle cx="${r1(b.x + b.w - s * 0.07)}" cy="${r1(y + bh - s * 0.07)}" r="${r1(s * 0.035)}" fill="${h.palette.accent}"/>`;
    return out;
  },

  // Tones: the rough message (mono) or the tones for this slide, each a paper card with a mono label.
  tones(ctx, b, h) {
    const F = faces(ctx);
    const s = Math.min(b.w, b.h), paper = h.palette.paper;
    const black = ctx.readableOn(paper, [ctx.pal.black, ctx.pal.ink]);
    const cards = ctx.piece.tones || (ctx.piece.rough ? [['The message', ctx.piece.rough]] : []);
    let out = '', y = b.y;
    const gap = s * 0.05, ch = (b.h - gap * (cards.length - 1)) / Math.max(1, cards.length);
    cards.forEach(([label, txt], k) => {
      const x = b.x + (k % 2 ? b.w * 0.1 : 0), w = b.w * 0.9;
      const mono = { ...F.mono };
      const body = ctx.piece.rough && !ctx.piece.tones ? { family: ctx.fam.mono, weight: 400 } : F.display;
      const ft = ctx.fit(txt, w - s * 0.1, ch - s * 0.14, body, { max: s * 0.07, min: 12, maxLines: 4, lead: 1.15 });
      const hh = Math.min(ch, ft.height + s * 0.16);
      out += `<path d="${h.ill.roundedPolygon([[x, y], [x + w, y], [x + w, y + hh], [x, y + hh]], s * 0.035)}" fill="${paper}"/>`;
      out += textEl(ctx, x + s * 0.05, y + s * 0.06, s * 0.026, mono, black, label);
      ft.lines.forEach((l, i) => { out += textEl(ctx, x + s * 0.05, y + s * 0.1 + ft.size * (0.86 + i * 1.15), ft.size, body, black, l); });
      y += hh + gap;
    });
    return out;
  },
});

/** "Say it badly. Send it perfect." The brand's mechanic as one proof sheet, animated once per 10 s, one mover at a time:
 *  the said line is written by hand on the ground (it reveals left to right), proof marks strike the fillers,
 *  a paper message bubble pops up, the clean line lands in the serif with the kept number underlined,
 *  and the amber full stop drops in last ("alive, right now"). It then holds still. Reduced motion shows the end.
 *  Copy fields: said (hand, six words or fewer), written (the clean line, without its full stop). */
function proofSlip(ctx, b, h) {
  const F = faces(ctx);
  const P = ctx.P + 'ps-';
  const s = Math.min(b.w, b.h);
  const onGround = h.palette.ink, paper = h.palette.paper, accent = h.palette.accent;
  const black = ctx.readableOn(paper, [ctx.pal.black, ctx.pal.ink]);
  const animate = !(ctx.piece.art && ctx.piece.art.motion === false);
  const said = ctx.piece.said || '', written = ctx.piece.written || '';
  const T = 10; // seconds per cycle
  const at = (sec) => r1((sec / T) * 100) + '%';
  let css = '', out = '';

  // The group (said line, bubble) is centred in the art box; the box may be taller than it needs.
  const hs = s * 0.12, ws = s * 0.13;
  const groupH = hs * 1.85 + ws * 1.1 + ws * 1.0 + ws * 0.45;
  const top = b.y + Math.max(0, (b.h - groupH) / 2);

  // 1. The said line, by hand, on the ground. Each word is placed on its own, so the proof marks sit exactly on their words.
  const hf = { ...F.hand, size: hs };
  const space = ctx.textWidth(' ', hf) * 1.25;
  const sx = b.x + s * 0.02, sy = top + hs * 0.95;
  const words = said.split(' ');
  out += `<defs><clipPath id="${P}reveal"><rect class="${P}rv" x="${r1(sx - hs * 0.2)}" y="${r1(top - hs * 0.4)}" width="${r1(b.x + b.w - sx + hs * 0.2)}" height="${r1(hs * 1.9)}"/></clipPath></defs>`;
  let hand = '', cx = sx, k = 0;
  for (const w of words) {
    const ww = ctx.textWidth(w, hf);
    hand += textEl(ctx, cx, sy, hs, F.hand, onGround, w);
    // 2. Proof marks: one hand-drawn line through each filler.
    if (FILLERS.test(w.replace(/[.,…]+$/, ''))) {
      const y0 = sy - hs * 0.28, x0 = cx - hs * 0.02, x1 = cx + ww + hs * 0.08;
      const id = `${P}x${k}`;
      out += `<path class="${id}" pathLength="1" stroke-dasharray="1" d="${h.ill.inkLine([[x0, y0 + hs * 0.05], [(x0 + x1) / 2, y0 - hs * 0.01], [x1, y0 - hs * 0.06]], { seed: 50 + k, wobble: 0.4 })}" fill="none" stroke="${onGround}" stroke-width="${r1(hs * 0.075)}" stroke-linecap="round"/>`;
      const t0 = 1.6 + k * 0.8;
      css += `@keyframes ${id}k{0%,${at(t0)}{stroke-dashoffset:1}${at(t0 + 0.6)},100%{stroke-dashoffset:0}}.${id}{animation:${id}k ${T}s cubic-bezier(.4,0,.2,1) infinite}`;
      k++;
    }
    cx += ww + space;
  }
  out += `<g clip-path="url(#${P}reveal)">${hand}</g>`;
  const marksEnd = 1.6 + k * 0.8;

  // 3. The message bubble: white cut paper with a tail, the clean line in the serif.
  const wf = { ...F.display, size: ws };
  const tw = ctx.textWidth(written, wf);
  const dot = ws * 0.1;
  const padX = ws * 0.6, padY = ws * 0.5;
  const bw = Math.min(b.w - s * 0.1, tw + dot * 4 + padX * 2), bh = ws * 1.1 + padY * 2;
  const bx = b.x + b.w - bw - s * 0.02, by = sy + hs * 0.85;
  const bubble = h.ill.paperPolygon([[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx + bw * 0.86, by + bh], [bx + bw * 0.93, by + bh + ws * 0.45], [bx + bw * 0.72, by + bh], [bx, by + bh]], { jitter: s * 0.004, radius: [ws * 0.4, ws * 0.4, ws * 0.4, 2, 0, 2, ws * 0.4], seed: 6 });
  const tx = bx + padX, ty = by + padY + ws * 0.86;
  let line = textEl(ctx, tx, ty, ws, F.display, black, written);
  // The kept fact (a number or a name) is underlined, not coloured: a record, not a thing still in play.
  const kept = ctx.piece.kept;
  if (kept && written.includes(kept)) {
    const pre = written.slice(0, written.indexOf(kept));
    const kx = tx + ctx.textWidth(pre, wf), kw = ctx.textWidth(kept, wf);
    line += `<path d="${h.ill.inkLine([[kx - ws * 0.04, ty + ws * 0.14], [kx + kw + ws * 0.06, ty + ws * 0.12]], { seed: 61, wobble: 0.4 })}" fill="none" stroke="${black}" stroke-width="${r1(ws * 0.05)}" stroke-linecap="round"/>`;
  }
  const bubbleT = marksEnd + 0.3, lineT = bubbleT + 0.6, dotT = lineT + 0.8;
  out += `<g class="${P}bub"><path d="${bubble}" fill="${paper}"/></g>`;
  out += `<g class="${P}line">${line}</g>`;
  // 4. The amber full stop, last.
  out += `<g class="${P}dot"><circle cx="${r1(tx + tw + dot * 1.5)}" cy="${r1(ty - dot * 0.6)}" r="${r1(dot)}" fill="${accent}"/></g>`;

  if (animate) {
    const spring = 'cubic-bezier(.34,1.56,.64,1)';
    css += `@keyframes ${P}rvk{0%{transform:scaleX(0)}${at(1.3)},100%{transform:scaleX(1)}}.${P}rv{transform-box:fill-box;transform-origin:left center;animation:${P}rvk ${T}s cubic-bezier(.45,.05,.55,.95) infinite}`;
    css += `@keyframes ${P}bubk{0%,${at(bubbleT)}{transform:scale(.6);opacity:0}${at(bubbleT + 0.5)},100%{transform:scale(1);opacity:1}}.${P}bub{transform-box:fill-box;transform-origin:85% 100%;animation:${P}bubk ${T}s ${spring} infinite}`;
    css += `@keyframes ${P}linek{0%,${at(lineT)}{opacity:0;transform:translateY(${r1(ws * 0.25)}px)}${at(lineT + 0.5)},100%{opacity:1;transform:none}}.${P}line{animation:${P}linek ${T}s cubic-bezier(.2,.8,.2,1) infinite}`;
    css += `@keyframes ${P}dotk{0%,${at(dotT)}{opacity:0;transform:translateY(${r1(-ws * 1.2)}px)}${at(dotT + 0.45)},100%{opacity:1;transform:none}}.${P}dot{animation:${P}dotk ${T}s ${spring} infinite}`;
    css += `@media (prefers-reduced-motion: reduce){[class^="${P}"]{animation:none!important}}`;
    out = `<style>${css}</style>` + out;
  }
  return out;
}
exports_['proof-slip'] = proofSlip;

// The world's fillers, each exactly as Tailzu's own site shows it being dropped (tailzu-web/index.html, the
// said -> written examples). [text, language, face, width in em at weight 800, measured in Chromium].
// Latin in the pairing's grotesque; scripts it does not cover in the matching Noto Sans (see the brief).
const UMS = [
  ["um so like", 'en', 'Schibsted Grotesk', 4.93],
  ["えっと", 'ja', 'Noto Sans JP', 3],
  ["eh o sea", 'es', 'Schibsted Grotesk', 4],
  ["يعني", 'ar', 'Noto Sans Arabic', 2.16],
  ["euh ben", 'fr', 'Schibsted Grotesk', 3.94],
  ["음", 'ko', 'Noto Sans KR', 0.92],
  ["ähm also", 'de', 'Schibsted Grotesk', 4.48],
  ["那个", 'zh', 'Noto Sans SC', 2],
  ["é tipo assim", 'pt', 'Schibsted Grotesk', 5.91],
  ["ну короче", 'ru', 'Noto Sans', 5.23],
  ["cioè tipo", 'it', 'Schibsted Grotesk', 4.27],
  ["คือว่า", 'th', 'Noto Sans Thai', 2.22],
  ["yaani", 'sw', 'Schibsted Grotesk', 2.77],
  ["ε λοιπόν", 'el', 'Noto Sans', 4.33],
  ["eh gimana ya", 'id', 'Schibsted Grotesk', 6.5],
  ["אה", 'he', 'Noto Sans Hebrew', 1.36],
  ["no więc", 'pl', 'Schibsted Grotesk', 3.85],
  ["ờ thì", 'vi', 'Noto Sans', 2.38],
  ["ano eto", 'fil', 'Schibsted Grotesk', 3.66],
  ["उम", 'ne', 'Noto Sans Devanagari', 1.26],
];
const RTL = new Set(['ar', 'he']);

/** "Every language has an um." (Bauhaus.) A wall of the world's fillers set in heavy type; a bar wipes through
 *  each one in turn (right to left for Arabic and Hebrew), then the full stop stamps in as one big focal circle
 *  bleeding off the edge. One mover at a time, critically damped, 12 s cycle ending still; reduced motion shows
 *  the end. helpers: { roles } from the Bauhaus skin. */
function umWall(ctx, b, h) {
  const c = h.roles;
  const P = ctx.P + 'um-';
  const animate = !(ctx.piece.art && ctx.piece.art.motion === false);
  const face = (f) => (f === 'Schibsted Grotesk' ? ctx.fam.display : f);
  // Flow the words in rows, two sizes alternating by row (three sizes per piece with the headline and body).
  const flow = (k) => {
    const rows = []; let row = [], x = 0, i = 0;
    const size = () => k * (rows.length % 2 ? 0.72 : 1);
    for (const u of UMS) {
      if (row.length && x + u[3] * size() > b.w) { rows.push({ items: row, size: row[0].sz }); row = []; x = 0; }
      const sz = size();
      row.push({ u, sz, x, wd: u[3] * sz, i: i++ });
      x += u[3] * sz + sz * 0.42;
    }
    if (row.length) rows.push({ items: row, size: row[0].sz });
    return { rows, height: rows.reduce((a, r) => a + r.size * 1.32, 0) };
  };
  let lo = 10, hi = b.w / 4;
  for (let n = 0; n < 24; n++) { const m = (lo + hi) / 2; if (flow(m).height <= b.h * 0.94) lo = m; else hi = m; }
  const { rows } = flow(lo);

  // The full stop: one circle in the focal colour, bleeding off the right edge at the foot of the wall.
  const D = Math.min(b.h * 0.7, ctx.W * 0.56);
  const ccx = ctx.W - D * 0.3, ccy = b.y + b.h - D / 2;
  let out = `<g class="${P}dot"><circle cx="${r1(ccx)}" cy="${r1(ccy)}" r="${r1(D / 2)}" fill="${c.focal}"/></g>`;

  const T = 12, at = (sec) => r1((sec / T) * 100) + '%';
  const step = 0.27, t0 = 0.6;
  let css = '', y = b.y;
  for (const r of rows) {
    const base = y + r.size * 1.02;
    for (const it of r.items) {
      const [txt, lang, f] = it.u;
      const rtl = RTL.has(lang);
      // Right-to-left words keep their own order (the browser's bidi); only the bar wipes from the right.
      out += `<text x="${r1(b.x + it.x)}" y="${r1(base)}" font-family="'${ctx.esc(face(f))}', sans-serif" font-weight="800" font-size="${r1(it.sz)}" fill="${c.bar}" lang="${lang}">${ctx.esc(txt)}</text>`;
      const id = `${P}b${it.i}`, th = Math.max(3, it.sz * 0.12);
      out += `<rect class="${id}" x="${r1(b.x + it.x - it.sz * 0.06)}" y="${r1(base - it.sz * 0.36 - th / 2)}" width="${r1(it.wd + it.sz * 0.12)}" height="${r1(th)}" fill="${c.bar}"/>`;
      const s = t0 + it.i * step;
      css += `@keyframes ${id}k{0%,${at(s)}{transform:scaleX(0)}${at(s + 0.22)},100%{transform:scaleX(1)}}.${id}{transform-box:fill-box;transform-origin:${rtl ? 'right' : 'left'} center;animation:${id}k ${T}s cubic-bezier(.2,.8,.2,1) infinite}`;
    }
    y += r.size * 1.32;
  }
  const stamp = t0 + UMS.length * step + 0.3;
  css += `@keyframes ${P}dotk{0%,${at(stamp)}{transform:scale(0)}${at(stamp + 0.45)},100%{transform:scale(1)}}.${P}dot{transform-box:fill-box;transform-origin:center;animation:${P}dotk ${T}s cubic-bezier(.2,.9,.25,1) infinite}`;
  css += `@media (prefers-reduced-motion: reduce){[class^="${P}"]{animation:none!important}}`;
  const fams = [...new Set(UMS.map((u) => u[2]).filter((f) => f !== 'Schibsted Grotesk'))];
  const text = encodeURIComponent(UMS.filter((u) => u[2] !== 'Schibsted Grotesk').map((u) => u[0]).join(''));
  const fonts = `@import url('https://fonts.googleapis.com/css2?${fams.map((f) => `family=${f.replace(/ /g, '+')}:wght@800`).join('&amp;')}&amp;text=${text}&amp;display=block');`;
  return `<style>${fonts}${animate ? css : ''}</style>` + out;
}
exports_['um-wall'] = umWall;

export default exports_;
