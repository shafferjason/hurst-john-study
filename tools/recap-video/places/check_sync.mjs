// Sync check: lists every scheduled event in the walk with its offset from the nearest real beat of the music bed,
// and fails on anything over 40 ms, a downbeat event not on a downbeat, a built place with no key event, or a lesson
// that does its own arithmetic on start/arrive/leave times instead of asking for bars and beats.
// Usage: node places/check_sync.mjs "walk-full.html?only=open,11,18,23,15,30,close&beats=beats-sample.json" beats-sample.json
//        node places/check_sync.mjs                        (the full walk against the real grid of the song)
import puppeteer from 'puppeteer-core'; import http from 'node:http'; import path from 'node:path'; import { readFileSync, existsSync } from 'node:fs'; import { fileURLToPath } from 'node:url';
const here = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = process.argv[2] || 'walk-full.html', GRID = process.argv[3] || 'beats-pulse.json', LIMIT = 0.04;
const gridFile = JSON.parse(readFileSync(path.join(here, GRID))), beats = gridFile.beats, soft = gridFile.soft;
{ const n = beats.length, k = Math.min(32, n - 1), st = (beats[n - 1] - beats[n - 1 - k]) / k; for (let i = 1; i <= 8; i++) beats.push(beats[n - 1] + i * st); }   // the last downbeat can fall just past the end of a short test bed
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((q, r) => { try { const f = path.join(here, decodeURIComponent(q.url.split('?')[0])), b = readFileSync(f); r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(q.method === 'HEAD' ? undefined : b); } catch { r.writeHead(404); r.end(); } }).listen(0, '127.0.0.1');
await new Promise(r => server.once('listening', r));
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--enable-webgl', '--ignore-gpu-blocklist'] });
const page = await browser.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); });
await page.goto(`http://127.0.0.1:${server.address().port}/${PAGE}`); await page.waitForFunction('window.READY===true', { timeout: 120000 });
const { ev, built } = await page.evaluate(() => ({ ev: window.SYNC_EVENTS, built: window.BUILT })); await browser.close(); server.close();
const near = t => { let a = 0, b = beats.length - 1; while (b - a > 1) { const m = (a + b) >> 1; if (beats[m] <= t) a = m; else b = m; } return Math.abs(beats[a] - t) <= Math.abs(beats[b] - t) ? a : b; };
const fails = []; const by = {}; let worst = 0;
for (const e of ev) { const i = near(e.time), off = (e.time - beats[i]) * 1000; worst = Math.max(worst, Math.abs(off)); (by[e.place] ||= []).push({ ...e, i, off });
  if (Math.abs(off) > LIMIT * 1000) fails.push(`${e.place} "${e.name}" is ${off.toFixed(0)} ms off the nearest beat`);
  if (e.need === 'downbeat' && i % 4 !== 0) fails.push(`${e.place} "${e.name}" should be on a downbeat but is on beat ${i % 4 + 1}`); }
for (const [p, list] of Object.entries(by)) { console.log('\n' + p); for (const e of list.sort((a, b) => a.time - b.time)) console.log(`  ${e.time.toFixed(3).padStart(8)} s  bar ${String((e.i >> 2) + 1).padStart(3)} beat ${e.i % 4 + 1}  off ${e.off.toFixed(1).padStart(6)} ms  ${e.name}${e.need === 'downbeat' ? ' [downbeat]' : ''}`); }
for (const b of built) { const id = 'L' + b.lesson; if (b.built && !by[id]?.some(e => e.name === 'key')) fails.push(`${id} is built but has no key event`);
  if (b.built && !b.kept) fails.push(`${id} keeps nothing for the closing look-back (call P.keep on its one detail)`);
  const file = path.join(here, 'places', `l${b.lesson}.js`); if (b.built && existsSync(file)) { const src = readFileSync(file, 'utf8'); for (const m of src.matchAll(/P\.T\.\w+\s*[+\-]\s*(?!P\.beats|bl\b|L\b)[^\s,;)]+/g)) fails.push(`${id} does its own timing: ${m[0]}`); for (const m of src.matchAll(/\bbarAt\(|beatAt\(/g)) fails.push(`${id} reads the beat grid directly`); } }
for (const e of errs) fails.push('page error: ' + e);
if (soft) { const n = ev.filter(e => e.time >= soft[0] && e.time <= soft[1]).length; console.log(`\n${n} events fall in the drumless stretch (${soft[0]}-${soft[1]} s), where the grid is a steady pulse carried across, not drum hits you can hear.`); }
console.log(`\n${ev.length} events; worst offset ${worst.toFixed(1)} ms. Built: ${built.filter(b => b.built).map(b => b.lesson).join(', ') || 'none'}. Stand-ins: ${built.filter(b => !b.built).length}.`);
if (fails.length) { console.log('\nFAIL\n- ' + fails.join('\n- ')); process.exit(1); } console.log('PASS: everything scheduled lands within 40 ms of a real beat.');
