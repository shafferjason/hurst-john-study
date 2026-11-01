// Render the recap: node render.mjs stills t1,t2,...   -> out/still-<t>.png
//                   node render.mjs video [fps] [audio.mp3] [from] [to] -> out/recap.mp4
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'out'); mkdirSync(out, { recursive: true });
const [mode = 'stills', a1, a2, a3, a4] = process.argv.slice(2);

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true, args: ['--force-device-scale-factor=1'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
await page.goto('file://' + path.join(here, 'index.html') + '?nobar', { waitUntil: 'load' });
const DURATION = await page.evaluate(() => window.DURATION);
const grab = (t, type = 'image/png', q) => page.evaluate((t, type, q) => { window.renderAt(t); return document.getElementById('c').toDataURL(type, q).split(',')[1]; }, t, type, q);

if (mode === 'stills') {
  const { writeFileSync } = await import('node:fs');
  for (const t of (a1 || '1').split(',').map(Number)) {
    writeFileSync(path.join(out, `still-${t.toFixed(2)}.png`), Buffer.from(await grab(t), 'base64'));
  }
  console.log('duration', DURATION.toFixed(2));
} else {
  const fps = Number(a1 || 30), from = Number(a3 || 0), to = Math.min(Number(a4 || DURATION), DURATION);
  const args = ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-'];
  if (a2 && a2 !== '-') args.push('-ss', String(from), '-i', a2, '-af', `afade=t=out:st=${Math.max(0, to - from - 3)}:d=3`, '-shortest');
  args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart');
  if (a2 && a2 !== '-') args.push('-c:a', 'aac', '-b:a', '192k');
  args.push(path.join(out, a2 && a2 !== '-' ? 'recap.mp4' : `recap-silent-${from}-${to}.mp4`));
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
