// Cinematic films drawn frame by frame on a canvas (continuous camera moves, depth, light, particles,
// letter-by-letter type), rendered deterministically to MP4. For films the SVG timeline (film.mjs) can't do.
//
//   npm run cinema -- <product> <campaign> [--aspect 16:9|9:16|all] [--from s --to s --preview]
//
// Reads products/<id>/campaigns/<campaign>/cinema.json:
//   { "id", "scene": "scene.js", "seconds", "combination", "mode", "pairing", "aspects": ["16:9","9:16"] }
// The scene script (in the campaign folder) defines window.setupFilm(cfg) (async) and window.drawFrame(t, ctx)
// with t in seconds; it must be a pure function of t so every frame renders the same way twice.
// cfg gives the canvas size, the Wada colours (by id and by role), the pairing's families and the brand's
// mark as a data URI, so colours and type always come from the guide.
// The guide's video rules still apply to the scene: reading-time holds (media.json), no more than three
// flashes a second (video.json), the brand early, an end card that works as a still.

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { loadBrand } from '../../scripts/products.mjs';
import { loadTokens, dataUri, campaignType } from './engine.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const json = (f) => JSON.parse(readFileSync(f, 'utf8'));
const SIZES = { '16:9': [1920, 1080], '9:16': [1080, 1920], '1:1': [1080, 1080], '4:5': [1080, 1350] };

export async function renderCinema(productId, campaign, { aspects = null, from = 0, to = null, fps = 30, stills = null, scale = 1, log = console.log } = {}) {
  const brand = loadBrand(ROOT, productId);
  const tokens = loadTokens(brand);
  const dir = join(brand.dir, 'campaigns', campaign);
  const cfgFile = json(join(dir, 'cinema.json'));
  const combo = tokens.colors.combinations.find((c) => c.id === cfgFile.combination);
  if (!combo) throw new Error(`cinema.json: unknown Wada combination ${cfgFile.combination}`);
  const byId = Object.fromEntries(tokens.colors.colors.map((c) => [c.id, c]));
  const roles = combo.roles[cfgFile.mode || 'dark'];
  const typo = campaignType(tokens.typography, cfgFile.pairing || tokens.typography.pairing.id, null);
  const identity = existsSync(join(brand.dir, 'identity.json')) ? json(join(brand.dir, 'identity.json')) : {};
  const markFile = cfgFile.mark || (identity.marks?.files || []).find((f) => f.kind)?.file;
  const scene = readFileSync(join(dir, cfgFile.scene || 'scene.js'), 'utf8');
  const seconds = cfgFile.seconds;
  const end = to ?? seconds;
  const req = createRequire(import.meta.url);
  let pw; try { pw = req('playwright'); } catch { pw = req(join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright')); }
  const browser = await pw.chromium.launch(existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {});
  const outDir = join(dir, 'designs');
  mkdirSync(outDir, { recursive: true });
  const outs = [];
  for (const aspect of aspects || cfgFile.aspects || ['16:9']) {
    const [W, H] = SIZES[aspect];
    const cfg = {
      W, H, aspect, fps, seconds,
      colors: Object.fromEntries(combo.colors.map((id) => [id, byId[id].hex])),
      roles: { ground: byId[roles.bg].hex, text: byId[roles.text].hex, ink: byId[roles.ink].hex, accent: byId[roles.accent].hex, support: (roles.support || []).map((id) => byId[id].hex) },
      black: byId.black.hex, white: byId.white.hex,
      fonts: { display: typo.pairing.display.family, body: typo.pairing.body.family, mono: typo.pairing.mono.family, displayItalic: !!typo.pairing.display.italic },
      mark: markFile ? dataUri(join(brand.dir, markFile)) : null,
      brand: brand.config.name,
    };
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
    await page.setContent(`<!doctype html><html><head><link rel="stylesheet" href="${typo.googleFontsUrl}"></head><body style="margin:0;background:#000;overflow:hidden"><canvas id="c" width="${W}" height="${H}" style="display:block"></canvas><script>window.FILM=${JSON.stringify(cfg)};</script><script>${scene}</script></body></html>`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { await document.fonts.ready; await window.setupFilm(window.FILM, document.getElementById('c')); });
    // --stills t1,t2,...: just those frames as PNGs (to check a cut before rendering the film).
    if (stills) {
      for (const t of stills) { await page.evaluate((t) => window.drawFrame(t), t); const f = join(outDir, `${cfgFile.id}-${W}x${H}-t${t}.png`); writeFileSync(f, await page.screenshot({ type: 'png' })); outs.push(f); }
      await page.close(); continue;
    }
    const out = join(outDir, `${cfgFile.id}-${W}x${H}${from || to ? `-${from}-${end}` : ''}.mp4`);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'slow', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round((end - from) * fps);
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const t = from + i / fps;
      await page.evaluate((t) => window.drawFrame(t), t);
      const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (i % (fps * 5) === 0) log(`  ${aspect} ${t.toFixed(1)} s (${((Date.now() - t0) / 1000).toFixed(0)} s elapsed)`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
    // The last frame as a still (poster, thumbnail, reduced-motion stand-in).
    await page.evaluate((t) => window.drawFrame(t), end - 1 / fps);
    writeFileSync(out.replace(/\.mp4$/, '.png'), await page.screenshot({ type: 'png' }));
    await page.close();
    outs.push(out);
    log(`  ${out.replace(ROOT + '/', '')}`);
  }
  await browser.close();
  return outs;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : null; };
  const aspect = opt('--aspect'), from = +(opt('--from') || 0), to = opt('--to'), stills = opt('--stills');
  const [product, campaign] = args.filter((a) => !a.startsWith('--'));
  if (!product || !campaign) { console.error('usage: npm run cinema -- <product> <campaign> [--aspect 16:9|9:16|all] [--from s --to s]'); process.exit(1); }
  await renderCinema(product, campaign, { aspects: aspect && aspect !== 'all' ? [aspect] : null, from, to: to ? +to : null, stills: stills ? stills.split(',').map(Number) : null, scale: stills ? 0.5 : 1 });
}
