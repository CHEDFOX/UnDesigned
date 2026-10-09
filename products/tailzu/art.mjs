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

export default exports_;
