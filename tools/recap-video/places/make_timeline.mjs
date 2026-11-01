// One shared bar list for the page. Run: node places/make_timeline.mjs  -> places/timeline.json
// The song plays whole (6:00, 104 bars of 3.44 s), so these bars are spent on purpose. See the music map at the bottom.
// Sentences are final (from the reviewed list). Refs/chapters come from the lesson data already in scenes*.js.
import { readFileSync, writeFileSync } from 'node:fs';
const here = new URL('..', import.meta.url).pathname;
// every short stop is walk 1 bar + stand. 3 bars for 17+ word sentences, 2 otherwise. Full moments named here: [bars, walkIn, walkOn]
const FULL = { 11: [6, 2, 1], 15: [5, 2, 0], 24: [5, 2, 0], 28: [6, 2, 1], 29: [3, 1, 0], 30: [7, 3, 1], 31: [5, 2, 0] };
const LONG = new Set([11, 15, 24, 28, 30, 31]);
const scn = readFileSync(here + 'scenes.js', 'utf8') + readFileSync(here + 'scenes2.js', 'utf8');
const refs = {};
for (const m of scn.matchAll(/lesson:\s*(\d+),\s*station:\s*(\d+),[^\n]*?ref:\s*(['"])(.*?)\3\s*,/g)) refs[+m[1]] = { station: +m[2], ref: m[4] };
const says = {};
for (const l of readFileSync(here + 'heart/main-points.md', 'utf8').split('\n')) { const m = l.match(/^(\d+)\|(.+)$/); if (m) says[+m[1]] = m[2].trim(); }
const places = [{ id: 'open', kind: 'open', bars: 3, walkIn: 0, walkOn: 0 }];
for (let n = 1; n <= 31; n++) {
  if (!refs[n] || !says[n]) throw new Error('missing data for lesson ' + n);
  const words = says[n].split(/\s+/).length, [bars, walkIn, walkOn] = FULL[n] || [words >= 17 ? 3 : 2, 1, 0];
  places.push({ id: String(n), lesson: n, station: refs[n].station, ref: refs[n].ref, say: says[n], words, long: LONG.has(n), bars, walkIn, walkOn });
}
places.push({ id: 'close', kind: 'close', station: 9, bars: 6, walkIn: 1, walkOn: 0 });
writeFileSync(here + 'places/timeline.json', JSON.stringify({ places }, null, 1));
let beats = null; try { beats = JSON.parse(readFileSync(here + 'beats-pulse.json', 'utf8')).beats; } catch {}
const clockAt = b => { const s = beats ? beats[b * 4] : b * 3.436; return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; };
let b = 0; const rows = places.map(p => { const r = `${p.id.padStart(5)}  ${String(p.bars).padStart(2)} bars  starts ${clockAt(b)}  arrives ${clockAt(b + p.walkIn)}${p.words ? `  ${p.words} words` : ''}`; b += p.bars; return r; });
console.log(rows.join('\n')); console.log('total bars', b, 'song end at 6:00');
