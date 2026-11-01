// Prints "start end" in seconds for a place in the full walk: node places/when.mjs 18  (or open, close)
import { readFileSync } from 'node:fs';
const here = new URL('..', import.meta.url).pathname, { places } = JSON.parse(readFileSync(here + 'places/timeline.json')), { beats, dur } = JSON.parse(readFileSync(here + 'beats-pulse.json'));
let b = 0; for (const p of places) { if (p.id === process.argv[2]) { console.log(beats[b * 4], p.id === 'close' ? dur : beats[(b + p.bars) * 4]); process.exit(0); } b += p.bars; }
process.exit(1);
