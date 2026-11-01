// Render the recap: node render.mjs stills t1,t2,...   -> out/still-<t>.png
//                   node render.mjs video [fps] [audio.mp3] [from] [to] -> out/recap.mp4
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'out'); mkdirSync(out, { recursive: true });
const [mode = 'stills', a1, a2, a3, a4] = process.argv.slice(2);

// PAGE=walk.html renders the portrait 3D walk; default is the flat landscape version.
const PAGE = process.env.PAGE || 'index.html';
const WALK = PAGE.startsWith('walk');
const [VW, VH, CANVAS] = WALK ? [1080, 1920, 'out'] : [1920, 1080, 'c'];
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  try { const f = path.join(here, decodeURIComponent(req.url.split('?')[0])); const body = readFileSync(f); res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
}).listen(0, '127.0.0.1');
await new Promise(r => server.once('listening', r));
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true, args: ['--force-device-scale-factor=1', '--enable-webgl', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage();
await page.setViewport({ width: VW, height: VH });
page.on('pageerror', e => console.error('PAGE ERROR', e.message));
page.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) console.error('PAGE', m.text()); });
await page.goto(`http://127.0.0.1:${server.address().port}/${PAGE}${PAGE.includes('?') ? '&' : '?'}nobar`, { waitUntil: 'load' });
if (WALK) await page.waitForFunction('window.READY === true', { timeout: 30000 });
const DURATION = await page.evaluate(() => window.DURATION);
const grab = (t, type = 'image/png', q) => page.evaluate((t, type, q, id) => { window.renderAt(t); return document.getElementById(id).toDataURL(type, q).split(',')[1]; }, t, type, q, CANVAS);

if (mode === 'stills') {
  const { writeFileSync } = await import('node:fs');
  // walk page: 'L14' = end of lesson 14's hold, 'N3' = lesson 3's note fully up, 'E-2' = 2 s before the end
  const when = async v => { if (v.startsWith('E')) return DURATION + Number(v.slice(1)); if (!/^[LNWAM]/.test(v)) return Number(v);
    const L = await page.evaluate(n => window.lessonAt(n), Number(v.slice(1))); return v[0] === 'N' ? L.note + 1.5 : v[0] === 'W' ? (L.start + L.arrive) / 2 : v[0] === 'A' ? L.arrive + 0.2 : v[0] === 'M' ? (L.arrive + L.end) / 2 : L.end - 0.3; };
  for (const t of await Promise.all((a1 || '1').split(',').map(when))) {
    writeFileSync(path.join(out, `${process.env.STILLPREFIX || (WALK ? 'walk-' : '')}still-${t.toFixed(2)}.png`), Buffer.from(await grab(t), 'base64'));
  }
  console.log('duration', DURATION.toFixed(2));
} else {
  const fps = Number(a1 || 30), from = Number(a3 || 0), to = Math.min(Number(a4 || DURATION), DURATION);
  const args = ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-'];
  if (a2 && a2 !== '-') args.push('-ss', String(from), '-i', a2, '-af', `afade=t=out:st=${Math.max(0, to - from - 3)}:d=3`, '-shortest');
  args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart');
  if (a2 && a2 !== '-') args.push('-c:a', 'aac', '-b:a', '192k');
  args.push(path.join(out, process.env.OUTNAME || (WALK ? 'walk-' : '') + (a2 && a2 !== '-' ? 'recap.mp4' : `recap-silent-${from}-${to}.mp4`)));
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'ignore', 'inherit'] });
  const n = Math.round((to - from) * fps);
  for (let i = 0; i < n; i++) {
    const buf = Buffer.from(await grab(from + i / fps, 'image/jpeg', 0.93), 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) process.stdout.write(`frame ${i}/${n}\n`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('done', n, 'frames');
}
await browser.close();
server.close();
