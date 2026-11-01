// The walk: timeline from the one bar list, the camera, the world, the words. Lessons plug in as places/l<N>.js.
import * as THREE from 'three';
import * as K from './shared.js';
// Round, soft specks: bare points are squares, and a near one reads as a floating box.
let _softDot; function softDot() { if (_softDot) return _softDot; const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return (_softDot = new THREE.CanvasTexture(c)); }
const { OW, OH, EYE, scene, camera, renderer, clock, barAt, beatAt, barLen, pathX, smooth, pool, glow, line, thing, art, updateArts, updateThings, gait, bodyScale, pulse, beatPhase, beatIndex, surge, ribbon, seedAt, META } = K;
const q = new URLSearchParams(location.search), only = q.get('only')?.split(',');
const TL = await (await fetch('places/timeline.json')).json();
const wanted = only ? only.map(id => TL.places.find(p => p.id === id)) : TL.places;
const beatsFile = q.get('beats') || 'beats-pulse.json';
let songEnd = null;
if (beatsFile) { const b = await (await fetch(beatsFile)).json(); clock.beats = b.beats; clock.energy = b.energy || []; songEnd = b.dur; clock.stems = await fetch('stems-pulse.json').then(r => r.json()).catch(() => null); }
else { const n = wanted.reduce((a, p) => a + p.bars, 0) * 4 + 8; clock.beats = Array.from({ length: n }, (_, i) => i * 0.5575); clock.energy = []; }

// ---------- schedule: bars and beats only. Every place's events go in this list, which the sync check reads. ----------
export const EVENTS = []; window.SYNC_EVENTS = EVENTS;
function logEv(place, name, beatI, need) { const time = beatAt(beatI); EVENTS.push({ place, name, beat: beatI, time, need }); return time; }

// ---------- layout ----------
let bar = 0, z = 34, prevOut = 34 + 20;
const GAP_IN = 20, GAP_LONG = 38, GAP_ON = 20;
const places = wanted.map(s => {
  const o = { ...s, startBar: bar, arriveBar: bar + s.walkIn, leaveBar: bar + s.bars - s.walkOn, endBar: bar + s.bars };
  o.S = s.kind === 'open' ? z : prevOut - (s.walkIn >= 2 ? GAP_LONG : GAP_IN); o.from = prevOut;
  o.drift = o.S - 0.6; o.out = o.drift - s.walkOn * GAP_ON; prevOut = o.out; bar = o.endBar;
  o.X = pathX(o.S); o.done = false;
  o.T = { start: barAt(o.startBar), arrive: barAt(o.arriveBar), leave: barAt(o.leaveBar), end: barAt(o.endBar) };
  return o;
});
const DURATION = only ? barAt(bar) : (songEnd ?? barAt(bar)), LAST = places.at(-1), ZEND = LAST.S, ZSTART = places[0].S;
const logPlace = o => { const id = o.lesson ? 'L' + o.lesson : o.id; logEv(id, 'arrive', o.arriveBar * 4, 'downbeat'); if (o.kind !== 'close') logEv(id, 'leave', o.leaveBar * 4, 'downbeat'); };
places.forEach(logPlace);

// camera path, as a plain function of time so paced drawing can look ahead to the next beat
const walkE = u => smooth(u);
function camAt(t) { let p = places[0]; for (const o of places) if (t >= o.T.start) p = o;
  let zz; if (t < p.T.arrive) zz = lerp(p.from, p.S, walkE((t - p.T.start) / Math.max(p.T.arrive - p.T.start, 1e-3)));
  else if (t < p.T.leave) zz = lerp(p.S, p.drift, (t - p.T.arrive) / Math.max(p.T.leave - p.T.arrive, 1e-3));
  else zz = lerp(p.drift, p.out, walkE((t - p.T.leave) / Math.max(p.T.end - p.T.leave, 1e-3)));
  return { x: pathX(zz), z: zz }; }
clock.camAt = camAt;

// ---------- world ----------
const WORLD = {};
{ const pts = []; for (let zz = ZSTART + 60; zz > ZEND - 160; zz -= 0.5) pts.push([pathX(zz), zz]); WORLD.path = line(pts, 0.05); WORLD.wide = line(pts, 0.5, 0xd4a574, 0.05); }
{ const pos = [], L = ZSTART + 60 - (ZEND - 170); for (let gz = ZSTART + 60; gz > ZEND - 170; gz -= 1.5) { const cx = pathX(gz); for (let gx = -40; gx <= 40; gx += 1.5) { const j = hash(gx * 31 + gz); if (j < 0.5) pos.push(cx + gx + (j - 0.25), 0, gz + (hash(gz) - 0.5)); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ map: softDot(), alphaTest: 0.01, color: 0x9a7650, size: 0.045, transparent: true, opacity: 0.7, depthWrite: false })));
  const N = Math.round(L * 4.5), dp = new Float32Array(N * 3); for (let k = 0; k < N; k++) { const zz = ZSTART + 60 - hash(k + 13) * L; dp[k * 3] = pathX(zz) + (hash(k) - 0.5) * 50; dp[k * 3 + 1] = hash(k + 7) * 9; dp[k * 3 + 2] = zz; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  WORLD.dust = new THREE.Points(dg, new THREE.PointsMaterial({ map: softDot(), alphaTest: 0.01, color: 0xf0d4a8, size: 0.04, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(WORLD.dust); }
// faint rings on the ground that go with the bass
WORLD.rings = [0, 1, 2].map(() => ribbon(0xd4a574, 0, 90));
const sky = thing(0, 0, 90, 8, 24, (c) => { seedAt(3); const pts = []; for (let k = 0; k <= 80; k++) pts.push([k / 80 * 90 * 24, 8 * 24 - 34 - 74 * Math.abs(Math.sin(k * 0.21 + 3)) - 34 * hash(k + 3)]); draw(c, [S.poly(pts)], 1, { width: 1.8, color: DIM, glow: false }); }, { far: 1e6, near: 0, fog: false, turn: false });
sky.mesh.renderOrder = -8;

// ---------- the handle each lesson gets ----------
await K.loadArtDir('art', '');
function handle(o) {
  const id = 'L' + o.lesson, prefix = `l${o.lesson}/`, own = new Set(); o.objs = []; o.kept = [];
  const trk = r => { o.objs.push(r); return r; };
  const key = n => own.has(n) ? prefix + n : n;
  const P = {
    lesson: o.lesson, X: o.X, Z: o.S, pathX, T: o.T, say: o.say,
    loadArt: async () => { (await K.loadArtDir(`art/l${o.lesson}`, prefix)).forEach(n => own.add(n)); },
    // ---- time: the ONLY way to name a moment. bar 1 beat 1 = the arrival downbeat; bar 0 = the bar before arrival. Whole beats only.
    ev(name, b, beat = 1) { if (!Number.isInteger(b) || !Number.isInteger(beat) || beat < 1 || beat > 4) throw new Error(`${id} event "${name}": bar and beat must be whole numbers, beat 1-4 (got ${b}, ${beat})`);
      if (name === 'key' && beat !== 1) throw new Error(`${id}: the key event must land on a downbeat (beat 1)`);
      return logEv(id, name, (o.arriveBar + b - 1) * 4 + beat - 1, name === 'key' ? 'downbeat' : 'beat'); },
    // a run of events on beats: P.evs('stone', 2, 1, 6, 1) = six stones, one a beat, starting bar 2 beat 1
    evs(name, b, beat, count, every = 1) { if (!Number.isInteger(every) || every < 1) throw new Error(`${id} evs "${name}": every must be a whole number of beats`); const i0 = (o.arriveBar + b - 1) * 4 + beat - 1, out = []; for (let k = 0; k < count; k++) out.push(logEv(id, name, i0 + k * every, 'beat')); return out; },
    beats: n => n * barLen() / 4,                     // a LENGTH (a fade, a slide), never a start
    peak(b0, b1) { let best = b0, e = -1; for (let b = b0; b <= b1; b++) { const v = clock.energy[o.arriveBar + b - 1] ?? 0; if (v > e) { e = v; best = b; } } return best; },   // the loudest bar in a range
    pulse, beatPhase, surge, smooth, gait, listen: K.listen, hit: K.hit,
    // ---- things in the world
    art: (n, x, z, h, a = {}) => trk(art(key(n), x, z, h, { ...a, owner: o, map2: a.map2 ? key(a.map2) : undefined })),
    // a drawing that forms over N beats from an event instead of as you approach
    artAt: (n, x, z, h, when, beatsN, a = {}) => trk(art(key(n), x, z, h, { ...a, owner: o, revealAt: when, revealBeats: beatsN, map2: a.map2 ? key(a.map2) : undefined })),
    walker: (n, x, z, flip, target = 3, opts = {}) => trk(art(key(n), x, z, bodyScale(key(n), target), { drawn: true, flip, sil: 0.85, gain: 1.35, owner: o, ...opts })),
    thing: (x, zz, w, h, px, paint, a = {}) => trk(thing(x, zz, w, h, px, paint, { ...a, owner: o })),
    pool: (...a) => trk(pool(...a)), glow: (...a) => trk(glow(...a)), ribbon: (...a) => trk(ribbon(...a)), line: (...a) => trk(line(...a)), seedAt, camera, META, keyOf: key,
    // the place's one detail stays lit on the trail in the closing look-back. h = its height up there (big enough to read from high up).
    keep(a, { h, x, z, y = 0 } = {}) { o.kept.push({ a, h: h ?? a.hU * 1.6, x: x ?? a.mesh.position.x, z: z ?? a.mesh.position.z, y }); return a; },
  };
  return P;
}
// ---------- load every lesson; a missing file is the stand-in (path, soft light, sentence) ----------
const UPDATES = [];
await Promise.all(places.filter(o => o.lesson).map(async o => {
  const file = `places/l${o.lesson}.js`; let mod = null;
  const has = await fetch(file, { method: 'HEAD' }).then(r => r.ok).catch(() => false);
  if (has) { try { mod = await import(`./l${o.lesson}.js`); } catch (e) { console.error(`L${o.lesson} failed to load, using stand-in:`, e.message); } }
  o.built = false;
  if (mod) { try { const r = (await mod.default(handle(o))) || {}; o.built = true; o.sayAt = r.say; if (r.update) UPDATES.push(r.update); } catch (e) { console.error(`L${o.lesson} failed to build, using stand-in:`, e.message); } }
  const defaultSay = o.long ? [1, 1] : [0, 3];   // short stops start the sentence two beats before arrival: reading time matters more
  const [sb, sbeat] = o.sayAt || defaultSay; o.sayBeat = (o.arriveBar + sb - 1) * 4 + sbeat - 1;
  o.lines = null;
}));
window.BUILT = places.filter(o => o.lesson).map(o => ({ lesson: o.lesson, built: o.built, kept: o.kept?.length || 0 }));
// the soft light of each place: faint ahead, warm under you, all of them up for the look back
places.forEach(o => { if (!o.lesson) return; o.pool = pool(o.X, o.S - 6, 12, 12, 0.08); o.beacon = glow(o.X, 1.6, o.S - 8, 11, 0.02); o.bead = glow(o.X, 0.6, o.S - 6, 3, 0); });
// the look-back: the trail lights from the first lesson to the last, one group per beat, starting as the camera rises
const LIT = places.filter(o => o.lesson), SWEEP = 8, SWEEP_START = (LAST.startBar + 2) * 4 + 2;
LIT.forEach((o, i) => { o.litBeat = SWEEP_START + Math.floor(i / Math.max(LIT.length, 1) * SWEEP); }); new Set(LIT.map(o => o.litBeat)).forEach(b => { if (LAST.kind === 'close') logEv('close', 'trail lights', b, 'beat'); });
const litK = (o, t) => seg(t, beatAt(o.litBeat), beatAt(o.litBeat) + 0.35);
const HK = 2.0, SX = 1.7, SZ = Math.min(1, 130 / Math.max(ZSTART - ZEND, 1)), MIDX = LIT.reduce((a, o) => a + o.X, 0) / Math.max(LIT.length, 1);

// ---------- camera ----------
const RISE0 = LAST.startBar + 2, RISE1 = LAST.startBar + 3.5, openK = t => LAST.kind === 'close' ? easeInOut(clamp((t - barAt(RISE0)) / (barAt(RISE1) - barAt(RISE0)))) : 0;
function placeCamera(t) { const c = camAt(t), dz = Math.abs(camAt(t + 0.05).z - c.z) / 0.05, i = beatIndex(t), ph = beatPhase(t), step = Math.sin(ph * Math.PI);
  const foot = 1 + 0.5 * K.hit('drums', t), px = c.x + (i % 2 ? 1 : -1) * step * 0.008 * dz * foot, py = EYE + step * 0.012 * dz * foot, ahead = c.z - 12; const u = openK(t);
  if (u <= 0) { camera.position.set(px, py, c.z); camera.lookAt(pathX(ahead), 2.4, ahead); }
  else { const hold = clamp((t - barAt(RISE1)) / (DURATION - barAt(RISE1))), sx = lerp(1, SX, u), sz = lerp(1, SZ, u), to = new THREE.Vector3(MIDX * SX, 70 + 3 * hold, ZSTART * SZ + 24), p = new THREE.Vector3(px * sx, py, c.z * sz).lerp(to, u);
    p.y += Math.sin(u * Math.PI) * 10; camera.position.copy(p); const mid = lerp(ZSTART, ZEND, 0.5) * SZ, a = new THREE.Vector3(pathX(ahead) * sx, 2.4, ahead * sz).lerp(new THREE.Vector3(MIDX * SX, 0, mid), u); camera.lookAt(a); } }

// ---------- words on top ----------
const out = document.getElementById('out').getContext('2d');
function wrap(ctx, s, size, maxW) { ctx.font = font(size); const ws = s.split(' '), ls = []; let cur = ''; for (const w of ws) { const n = cur ? cur + ' ' + w : w; if (ctx.measureText(n).width > maxW && cur) { ls.push(cur); cur = w; } else cur = n; } ls.push(cur); return ls; }
const SAY_SIZE = 62, SAY_LEAD = 78, SAY_Y = 500;
places.forEach(o => { if (!o.say) return; o.lines = wrap(out, o.say, SAY_SIZE, 930); o.lines.forEach((L, i) => logEv('L' + o.lesson, 'sentence line ' + (i + 1), o.sayBeat + i, 'beat')); });
function backing(a, y = SAY_Y) { out.save(); out.globalAlpha = a; const g = out.createRadialGradient(540, y, 60, 540, y, 640); g.addColorStop(0, 'rgba(12,10,8,0.9)'); g.addColorStop(1, 'rgba(12,10,8,0)'); out.fillStyle = g; out.translate(0, y); out.scale(1, 0.32); out.translate(0, -y); out.fillRect(0, -700, 1080, 2100); out.restore(); }
function hud(cur, a) { const x0 = 80, x1 = OW - 80, y = OH - 120, sx = k => lerp(x0, x1, k / 21), lit = cur.lesson || cur.kind === 'close' ? cur.station : -1;
  if (a <= 0) return; out.save(); out.globalAlpha = a;
  out.strokeStyle = DIM; out.lineWidth = 2; out.beginPath(); out.moveTo(x0, y); out.lineTo(x1, y); out.stroke();
  if (lit >= 0) { out.strokeStyle = GOLD; out.lineWidth = 3; out.beginPath(); out.moveTo(x0, y); out.lineTo(sx(lit), y); out.stroke(); }
  for (let k = 0; k <= 21; k++) { out.fillStyle = k <= lit ? GOLD : DIM; out.beginPath(); out.arc(sx(k), y, 3, 0, 6.3); out.fill(); }
  [0, 5, 10, 15, 21].forEach(k => txt(out, k === 0 ? 'intro' : 'John ' + k, sx(k), y + 38, 26, { color: k <= lit ? GOLD : DIM, italic: true }));
  if (lit >= 0) { const p = pulse(renderTime); out.fillStyle = GOLD_HI; out.shadowColor = GOLD_HI; out.shadowBlur = 16 + 20 * p; out.beginPath(); out.arc(sx(lit), y, 8 + 4 * p, 0, 6.3); out.fill(); }
  out.restore(); }
let renderTime = 0;
function overlay(t) { let cur = places[0]; for (const o of places) if (t >= o.T.start) cur = o; const bl = barLen();
  for (const Q of places) { if (!Q.lesson) continue; const a0 = Q.T.arrive, l0 = Q.T.leave, al = seg(t, a0 - bl * 0.75, a0 - bl * 0.5) * (1 - seg(t, l0 - bl / 8, l0 + bl / 8));
    if (al > 0) { txt(out, 'LESSON ' + Q.lesson, 70, 112, 40, { align: 'left', color: GOLD_HI, spacing: 5, alpha: al });
      txt(out, (Q.station === 0 ? 'Foundations' : 'John ' + Q.station) + '  ·  ' + Q.ref, 70, 164, 34, { align: 'left', italic: true, color: INK, alpha: al * 0.8 }); }
    const s0 = beatAt(Q.sayBeat), so = 1 - seg(t, l0 - bl / 8, l0 + bl / 8); if (t < s0 || so <= 0) continue;
    backing(seg(t, s0, s0 + 0.3) * so); const ls = Q.lines, y0 = SAY_Y - (ls.length - 1) * SAY_LEAD / 2;
    ls.forEach((L, i) => { const ti = beatAt(Q.sayBeat + i), a = seg(t, ti, ti + 0.22) * so; if (a > 0) txt(out, L, 540, y0 + i * SAY_LEAD, SAY_SIZE, { color: GOLD_HI, alpha: a, glow: 10 }); }); }
  // the opening title, one beat-paced line at a time; the only credit in the film
  if (places[0].kind === 'open') { const o = places[0], b = i => beatAt(o.startBar * 4 + i), so = 1 - seg(t, o.T.end - bl / 2, o.T.end);
    [['A Walk Through John', 300, 92, { color: GOLD_HI, glow: 18 }, 2], ['so far', 410, 54, { italic: true, color: GOLD }, 4], ['taught by Ben', 500, 36, { color: INK, spacing: 3 }, 6], ['31 lessons', 570, 30, { italic: true, color: GOLD }, 8]].forEach(([s, y, sz, st, bi]) => { const a = seg(t, b(bi), b(bi) + 0.4) * so; if (a > 0) txt(out, s, 540, y, sz, { ...st, alpha: a }); }); }
  if (LAST.kind === 'close') { const c = LAST, b0 = c.arriveBar * 4, s0 = beatAt(b0), so = 1 - openK(t) * 2.2; if (t >= s0 && so > 0) { backing(seg(t, s0, s0 + 0.3) * so, 420);
      txt(out, 'To be continued.', 540, 400, 88, { italic: true, color: GOLD_HI, glow: 16, alpha: seg(t, s0, s0 + 0.4) * so }); const s1 = beatAt(b0 + 4); txt(out, 'John 10 – 21 still ahead', 540, 492, 36, { color: GOLD, spacing: 2, alpha: seg(t, s1, s1 + 0.4) * so * 0.85 }); }
  }
  hud(cur, 1 - openK(t));
  const fade = (places[0].kind === 'open' ? 1 - seg(t, 0, 1.2) : 0) + (only && !places.some(o => o.kind === 'close') ? 0 : seg(t, DURATION - 2.2, DURATION - 0.4)); if (fade > 0) { out.fillStyle = `rgba(0,0,0,${Math.min(fade, 1)})`; out.fillRect(0, 0, OW, OH); } }

function renderAt(t) { t = clamp(t, 0, DURATION - 1e-3); renderTime = t;
  places.forEach(o => { o.done = t >= o.T.end; });
  const u = openK(t), L = ZSTART - ZEND; scene.fog.near = lerp(16, 120, u); scene.fog.far = lerp(72, L * 1.3 + 200, u); camera.far = lerp(300, L * 2 + 400, u); camera.updateProjectionMatrix();
  placeCamera(t); camera.updateMatrixWorld();
  sky.mesh.position.x = camera.position.x * 0.9; sky.mesh.position.z = camera.position.z - 62; sky.mesh.visible = u < 0.2;
  for (const f of UPDATES) f(t);
  updateThings(t); if (u >= 0.2) sky.mesh.visible = false; updateArts(t);
  const pl = pulse(t); places.forEach(o => { if (!o.beacon) return; const nextUp = t < o.T.start && t > o.T.start - barLen() * 4, here = t >= o.T.start && t < o.T.end; const lit = u > 0 ? litK(o, t) : 0; const kk = K.listen('keys', t); o.beacon.material.opacity = lerp(here ? 0.05 + 0.03 * pl + 0.22 * kk : nextUp ? 0.06 + 0.025 * pl : t >= o.T.end ? 0.03 : 0.012, 0.03 + 0.34 * lit, u); o.pool.material.opacity = lerp(here ? 0.07 + 0.24 * kk : 0.08, 0.05 + 0.3 * lit, u); o.bead.material.opacity = u * lit * (0.75 + 0.25 * pl); const bs = lerp(1, 0.5, u); o.beacon.scale.set(bs, bs, bs); { const ls = here && u === 0 ? 1 + 0.9 * kk : 1; o.beacon.scale.set(bs * ls, bs * ls, bs); o.pool.scale.set(bs * ls, bs * ls, 1); } });
  scene.scale.set(lerp(1, SX, u), 1, lerp(1, SZ, u));
  // the instruments in the world: a breath, never a flash
  { const dr = K.hit('drums', t), sw = K.listen('swell', t), bs = K.listen('bass', t); WORLD.wide.m.material.opacity = 0.04 + 0.3 * dr; WORLD.path.m.material.opacity = 0.5 + 0.5 * dr; WORLD.dust.material.opacity = 0.25 + 0.75 * sw; WORLD.dust.material.size = 0.035 + 0.075 * sw; { const w = K.windAt(t); WORLD.dust.position.x = 12 * Math.sin(w * 0.1); WORLD.dust.position.y = Math.sin(w * 0.07) * 0.6; }
    let cur = places[0]; for (const o of places) if (t >= o.T.start) cur = o; const bi = beatIndex(t), bp = beatPhase(t);
    WORLD.rings.forEach((R, k) => { const age = ((bi + k * 4) % 12 + bp) / 12, r = 1.2 + age * 9, cx = cur.X, cz = (cur.S ?? 0) - 6, op = 0.32 * bs * Math.sin(Math.PI * Math.min(age * 1.05, 1)) * (1 - u); R.m.visible = op > 0.004; if (!R.m.visible) return; R.m.material.opacity = op; R.set(v => { const a = v * Math.PI * 2, r1 = r * (1 + 0.012 * Math.sin(3 * a + k + t * 0.7) + 0.008 * Math.sin(7 * a - k * 2 - t * 1.1)), r2 = r1 + 0.05 * (1 - age * 0.6); return [cx + Math.cos(a) * r1, cz + Math.sin(a) * r1, cx + Math.cos(a) * r2, cz + Math.sin(a) * r2]; }); }); }
  if (u > 0) LIT.forEach(o => { const lit = litK(o, t), kept = new Set((o.kept || []).map(k => k.a));
    for (const q of o.objs || []) { if (kept.has(q)) continue; const m = q.mesh || q.m || q; if (q.u?.uA) q.u.uA.value *= clamp(1 - u / 0.35); if (u >= 0.35) m.visible = false; }
    const sx = lerp(1, SX, u), sz = lerp(1, SZ, u), side = LIT.indexOf(o) % 2 ? 1 : -1;
    (o.kept || []).forEach((k, i) => { const m = k.a.mesh, h = k.h * HK, K = h / k.a.hU, wz = (o.S - 6 + i * 0.4) * sz, th = Math.atan2(camera.position.y - h / 2, camera.position.z - wz), tp = Math.atan2(Math.tan(th), sz), lenY = Math.hypot(Math.cos(tp), sz * Math.sin(tp)); // stand the drawing square to the high camera, through the flattened world
      m.visible = lit > 0; m.rotation.set(-tp, 0, 0); m.position.set(o.X + (side * (1.2 + k.a.wU * K / 2) + (k.x - (o.kept[0].x))) / sx, h / 2 * Math.cos(th), o.S - 6 + i * 0.4); m.scale.set(Math.sign(m.scale.x || 1) * K / sx, K / lenY, 1); const U = k.a.u; U.uP.value = 1; U.uA.value = lit; U.uN.value = 1; U.uFog.value = 0; U.uThin.value = 0; U.uGain.value = k.a.gain * (1.6 + 0.3 * pl); }); });
  renderer.render(scene, camera); out.drawImage(renderer.domElement, 0, 0); overlay(t); }
window.renderAt = renderAt; window.DURATION = DURATION;
window.lessonAt = n => { const o = places.find(x => x.lesson === n); return o ? { start: o.T.start, arrive: o.T.arrive, end: o.T.leave, note: null } : null; };
window.READY = true; renderAt(0);
