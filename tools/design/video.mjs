// Animated SVG -> MP4 (H.264, 30 fps), frame-exact: every CSS animation is paused and stepped to each
// frame's time, then the frames are encoded with ffmpeg. One cycle of the piece makes a seamless loop.
// Usage: node tools/design/video.mjs <piece.svg> <seconds> [out.mp4] [--fps 30]
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const [file, secs, outArg] = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && all[i - 1] !== '--fps');
const fpsI = process.argv.indexOf('--fps');
const fps = fpsI > 0 ? +process.argv[fpsI + 1] : 30;
if (!file || !secs) { console.error('usage: node tools/design/video.mjs <piece.svg> <seconds> [out.mp4] [--fps 30]'); process.exit(1); }
const out = outArg || file.replace(/\.svg$/, '.mp4');
const req = createRequire(import.meta.url);
let pw; try { pw = req('playwright'); } catch { pw = req(join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright')); }

const svg = readFileSync(file, 'utf8').replace(/^<\?xml[^>]*>\s*/, '');
const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
const W = Math.round(+vb[1] / 2) * 2, H = Math.round(+vb[2] / 2) * 2; // H.264 needs even sizes
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.setContent(`<body style="margin:0;overflow:hidden">${svg.replace('<svg ', `<svg style="display:block;width:${W}px;height:${H}px" `)}</body>`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
const dir = mkdtempSync(join(tmpdir(), 'ud-video-'));
const n = Math.round(+secs * fps);
for (let i = 0; i < n; i++) {
  await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), (i * 1000) / fps);
  await page.screenshot({ path: join(dir, `f${String(i).padStart(5, '0')}.png`) });
}
await browser.close();
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', join(dir, 'f%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', out]);
rmSync(dir, { recursive: true, force: true });
console.log(`${out}  ${W}x${H}, ${secs} s, ${fps} fps`);
