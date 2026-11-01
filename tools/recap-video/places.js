// "Places, not signs" prototype: three lessons you walk through in first person.
// Lesson 11 = something on the ground reaches you. Lesson 15 = people walk past you. Lesson 30 = things at your feet rise around you.
import * as THREE from 'three';

const OW = 1080, OH = 1920, VFOV = 72, EYE = 2.6;
const NIGHT = '#0c0a08', RED = '#c8453c';
const { beats } = await (await fetch('beats.json')).json();
const bar = n => beats[Math.round(n * 4)] ?? beats[beats.length - 1];
const barLen = bar(1) - bar(0);

// ---------- timeline (bars): walk in 3, stand, walk on ----------
const P = {
  a: { lesson: 11, S: 0, arrive: 3, leave: 8, ref: 'John 2  ·  The First Sign', say: 'Water meant for ritual washing becomes the best wine, and far more than anyone needed.' },
  b: { lesson: 15, S: -40, arrive: 11, leave: 17, ref: 'John 3  ·  He Must Decrease', say: 'Told the crowds were going to Jesus, John the Baptist kept baptizing and called his joy complete.' },
  c: { lesson: 30, S: -80, arrive: 20, leave: 26, ref: 'John 8  ·  Before Abraham Was, I Am', say: '“Before Abraham was, I am.” The men who heard him understood, and picked up stones.' },
};
const END_BAR = 29, DURATION = bar(END_BAR);
const pathX = z => 1.2 * Math.sin(z * 0.05);
const smooth = t => t * t * (3 - 2 * t);

// ---------- world ----------
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gl'), antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(OW, OH, false); renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0c0a08); scene.fog = new THREE.Fog(0x0c0a08, 16, 72);
const camera = new THREE.PerspectiveCamera(VFOV, OW / OH, 0.1, 300);

function glowTex(r, g, b) { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const gr = x.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, `rgba(${r},${g},${b},0.6)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const GLOW = glowTex(240, 212, 168);
function pool(x, z, w, d, op) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: GLOW, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: op })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.01, z); m.renderOrder = -6; scene.add(m); return m; }

// a line on the ground that can change every frame (ripples, river, the path): stays crisp at any distance
function ribbon(color, opacity, n) {
  const g = new THREE.BufferGeometry(), pos = new Float32Array((n + 1) * 6), idx = [];
  for (let k = 0; k < n; k++) { const a = k * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  m.frustumCulled = false; m.renderOrder = -4; scene.add(m);
  return { m, n, set(fn) { for (let k = 0; k <= n; k++) { const [ax, az, bx, bz] = fn(k / n); pos.set([ax, 0.02, az, bx, 0.02, bz], k * 6); } g.attributes.position.needsUpdate = true; } };
}
function line(pts, w) { // static ribbon from a list of [x,z] points
  const r = ribbon(0xf0d4a8, 0.8, pts.length - 1);
  r.set(u => { const k = Math.round(u * (pts.length - 1)), p = pts[k], a = pts[Math.max(k - 1, 0)], b = pts[Math.min(k + 1, pts.length - 1)]; const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, sx = -dz / L * w / 2, sz = dx / L * w / 2; return [p[0] - sx, p[1] - sz, p[0] + sx, p[1] + sz]; });
  return r;
}
{ const pts = []; for (let z = 50; z > -135; z -= 0.5) pts.push([pathX(z), z]); line(pts, 0.05); const wide = line(pts, 0.5); wide.m.material.opacity = 0.05; wide.m.material.color.set(0xd4a574); }
{ // dotted ground and gold dust
  const pos = []; for (let gx = -40; gx <= 40; gx += 1.5) for (let gz = 50; gz > -150; gz -= 1.5) { const j = hash(gx * 31 + gz); if (j < 0.5) pos.push(gx + (j - 0.25), 0, gz + (hash(gz) - 0.5)); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9a7650, size: 0.045, transparent: true, opacity: 0.7, depthWrite: false })));
  const N = 900, dp = new Float32Array(N * 3); for (let k = 0; k < N; k++) { dp[k * 3] = (hash(k) - 0.5) * 50; dp[k * 3 + 1] = hash(k + 7) * 9; dp[k * 3 + 2] = 50 - hash(k + 13) * 200; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  scene.add(new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xf0d4a8, size: 0.04, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false })));
}

// ---------- things standing in the world: each is its own upright sheet at its own depth, turning to face you ----------
const THINGS = [];
function thing(x, z, wU, hU, pxPerU, paint, o = {}) {
  const c = document.createElement('canvas'); c.width = Math.round(wU * pxPerU); c.height = Math.round(hU * pxPerU);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wU, hU), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: o.fog !== false }));
  mesh.position.set(x, (o.y0 || 0) + hU / 2, z); scene.add(mesh);
  const t = { c, cx: c.getContext('2d'), tex, mesh, paint, far: o.far ?? 26, near: o.near ?? 8, live: !!o.live, p: 0, last: -1, x, z, wU, hU, turn: o.turn !== false };
  THINGS.push(t); return t;
}
function updateThings(time) {
  const cz = camera.position.z, cx = camera.position.x;
  for (const t of THINGS) {
    const d = t.z - cz > 0 ? 99 : Math.hypot(t.x - cx, t.z - cz);          // behind you: stays as it was
    if (cz > t.z) t.p = Math.max(t.p, clamp((t.far - d) / (t.far - t.near)));
    t.mesh.visible = t.p > 0 && cz > t.z - 0.2;
    if (t.mesh.visible && t.turn) t.mesh.rotation.y = Math.atan2(cx - t.x, cz - t.z);
    if (t.mesh.visible && (t.live || Math.abs(t.p - t.last) > 0.004)) { t.cx.clearRect(0, 0, t.c.width, t.c.height); t.paint(t.cx, t.p, time); t.tex.needsUpdate = true; t.last = t.p; }
  }
}
const seedAt = n => { _seed = n; };

// ---------- simple people, seen from behind (no one's face but John's is ever drawn) ----------
function personShapes(v, pose, step) {
  seedAt(100 + v * 37 + (pose === 'walk' ? 0 : pose === 'bend' ? 300 : 600) + (step > 0 ? 11 : 0));
  const dy = 120, wd = 1 + (v % 3 - 1) * 0.12, X = x => 150 + (x - 150) * wd, s = step;
  if (pose === 'bend') {
    const body = [[X(108), 340 + dy], [X(84), 470 + dy], [X(76), 590 + dy], [X(224), 590 + dy], [X(214), 460 + dy], [X(210), 330 + dy], [150, 285 + dy]];
    return { body, lines: [S.circle(190, 275 + dy, 40), S.poly(body, true), S.bez([X(205), 345 + dy], [240, 430 + dy], [262, 500 + dy], [255, 575 + dy])] };
  }
  const body = [[X(128), 128 + dy], [X(102), 152 + dy], [X(96), 240 + dy], [X(104), 340 + dy], [X(84), 470 + dy], [X(66), 582 + dy], [X(234), 582 + dy], [X(216), 470 + dy], [X(196), 340 + dy], [X(204), 240 + dy], [X(198), 152 + dy], [X(172), 128 + dy], [150, 122 + dy]];
  const lines = [S.circle(150, 92 + dy, 32), S.poly(body, true), S.bez([X(130), 200 + dy], [X(126 + s * 6), 320 + dy], [X(112 + s * 8), 430 + dy], [X(112 + s * 10), 582 + dy]), S.bez([X(172), 230 + dy], [X(178 - s * 4), 330 + dy], [X(186 - s * 6), 460 + dy], [X(192 - s * 8), 582 + dy]), S.line(X(112), 582 + dy, X(108 + s * 9), 597 + dy, 3), S.line(X(188), 582 + dy, X(192 - s * 9), 597 + dy, 3), S.bez([X(104), 160 + dy], [X(84), 240 + dy], [X(82), 300 + dy], [X(92 + s * 10), 362 + dy])];
  if (v % 2) lines.push(S.bez([X(120), 96 + dy], [X(112), 48 + dy], [X(188), 48 + dy], [X(180), 96 + dy]), S.bez([X(120), 96 + dy], [X(114), 112 + dy], [X(116), 130 + dy], [X(110), 150 + dy]), S.bez([X(180), 96 + dy], [X(186), 112 + dy], [X(184), 130 + dy], [X(190), 150 + dy]));
  if (pose === 'raised') lines.push(S.bez([X(196), 160 + dy], [X(232), 110 + dy], [X(236), 60 + dy], [X(232), 22 + dy]));
  else lines.push(S.bez([X(196), 160 + dy], [X(216), 240 + dy], [X(218), 300 + dy], [X(208 - s * 10), 362 + dy]));
  return { body, lines };
}
function personTex(v, pose, step) {
  const c = document.createElement('canvas'); c.width = 300; c.height = 720; const x = c.getContext('2d');
  const { body, lines } = personShapes(v, pose, step);
  fillPoly(x, body, NIGHT); x.save(); x.fillStyle = NIGHT; const hy = pose === 'bend' ? 395 : 212, hx = pose === 'bend' ? 190 : 150; x.beginPath(); x.arc(hx, hy, 32, 0, 7); x.fill(); x.restore();
  draw(x, lines, 1, { width: 4.2, blur: 8 });
  if (pose === 'raised') { const fx = 236, fy = 110; x.save(); x.fillStyle = NIGHT; x.beginPath(); x.arc(fx, fy, 30, 0, 7); x.fill(); x.restore(); draw(x, [S.poly([[fx - 30, fy + 8], [fx - 24, fy - 22], [fx + 6, fy - 34], [fx + 30, fy - 12], [fx + 26, fy + 18], [fx - 6, fy + 28]], true)], 1, { width: 5, color: RED, blur: 12 }); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const TEX = { walk: [], bend: [], raised: [] };
for (let v = 0; v < 4; v++) { TEX.walk.push([personTex(v, 'walk', 1), personTex(v, 'walk', -1)]); TEX.bend.push(personTex(v, 'bend', 1)); TEX.raised.push(personTex(v, 'raised', 1)); }
const PW = 1.56, PH = 3.75;
function person(x, z, v, scale = 1) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: TEX.walk[v][0], transparent: true, depthWrite: false }));
  m.scale.setScalar(scale); m.position.set(x, PH * scale / 2, z); scene.add(m); return m;
}
const face = m => { m.rotation.y = Math.atan2(camera.position.x - m.position.x, camera.position.z - m.position.z); };
const nearFade = m => clamp((camera.position.z - m.position.z - 0.6) / 1.0);

// ---------- far background layers: barely move as you walk, which is what makes the near things feel near ----------
const sky = thing(0, 0, 90, 8, 24, (c, p) => { seedAt(3); const pts = []; for (let k = 0; k <= 80; k++) pts.push([k / 80 * 90 * 24, 8 * 24 - 34 - 74 * Math.abs(Math.sin(k * 0.21 + 3)) - 34 * hash(k + 3)]); draw(c, [S.poly(pts)], 1, { width: 1.8, color: DIM, glow: false }); }, { far: 1e4, near: 0, fog: false, turn: false });
sky.mesh.renderOrder = -8;

// ================= LESSON 11: the water reaches you =================
const X11 = pathX(P.a.S), Z11 = P.a.S;
function jarShapes() { seedAt(40);
  const L = [[170, 44], [120, 120], [84, 260], [100, 450], [150, 640]], R = L.map(([x, y]) => [480 - x, y]);
  return { body: [...L, ...[...R].reverse()], lines: [S.poly(L), S.poly(R), S.arc(240, 44, 72, 16), S.arc(240, 640, 92, 14, 0, Math.PI, 24), S.arc(240, 170, 134, 22, 0, Math.PI, 40), S.arc(240, 480, 124, 20, 0, Math.PI, 40), S.line(170, 300, 182, 370, 6), S.line(300, 240, 292, 300, 6), S.line(232, 520, 244, 575, 5)] }; }
const JAR = jarShapes();
const paintJar = (c, p) => { fillPoly(c, JAR.body, NIGHT, clamp(p * 3)); draw(c, JAR.lines, p, { width: 5.5, blur: 10 }); };
const ST = { a: bar(P.a.arrive), tip: bar(2.4), pour: bar(3.4), turn: bar(3.9), over: bar(4.2), others: bar(5) };
// five jars standing in depth along both sides of the path
[[-2.1, -6], [2.5, -8.5], [-2.9, -10], [3.1, -12], [-3.5, -13.5]].forEach(([dx, dz]) => { const j = thing(X11 + dx, Z11 + dz, 1.68, 2.31, 286, paintJar, { far: 30, near: 9 }); });
// the sixth jar, in a cradle, tipping toward the one small cup
const CUPX = X11 + 0.28, CUPY = 0.98, CUPZ = Z11 - 5;
thing(X11 + 1.35, CUPZ - 0.1, 2, 1.5, 286, (c, p) => { seedAt(61); draw(c, [S.line(120, 425, 320, 90, 10), S.line(460, 425, 260, 90, 10), S.line(170, 340, 410, 340, 8)], p, { width: 5, blur: 8 }); }, { far: 30, near: 9, turn: false });
const pourJar = thing(X11 + 1.28, CUPZ, 1.68, 2.31, 286, paintJar, { y0: 0.75, far: 30, near: 9, turn: false });
const spoutAt = th => { const r = 1.0, cx = pourJar.mesh.position.x, cy = pourJar.mesh.position.y; return [cx - Math.sin(th) * r, cy + Math.cos(th) * r]; };
thing(CUPX, CUPZ + 0.05, 0.9, 0.9, 286, (c, p) => { seedAt(66); const b = [[80, 256], [70, 30], [186, 30], [176, 256]]; fillPoly(c, b, NIGHT, clamp(p * 3)); draw(c, [S.poly(b, true), S.line(40, 256, 216, 256, 6)], p, { width: 5, blur: 8 }); }, { far: 26, near: 9, turn: false });
const cup = thing(CUPX, CUPZ + 0.08, 0.9, 1.1, 286, (c, p, t) => { seedAt(70); const W = c.canvas.width, Hh = c.canvas.height, cx = 128, by = Hh - 2;
  const k = seg(t, ST.turn + 0.2, ST.over, x => x); const top = by - 96, base = by; const liq = lerp(base - 8, top + 12, k);
  if (k > 0) { fillPoly(c, [[cx - 40 + 4 * (1 - k), base - 6], [cx + 40 - 4 * (1 - k), base - 6], [cx + 50, liq], [cx - 50, liq]], RED, 0.9); }
  fillPoly(c, [[cx - 40, base], [cx + 40, base], [cx + 52, top], [cx - 52, top]], 'rgba(0,0,0,0)', 0);
  draw(c, [S.poly([[cx - 52, top], [cx - 40, base], [cx + 40, base], [cx + 52, top]]), S.arc(cx, top, 52, 12)], p, { width: 5, blur: 10, color: GOLD_HI });
}, { y0: CUPY - 0.18, far: 26, near: 8, live: true, turn: false });
// the stream: gold where it leaves the jar, wine by the time it reaches the cup, and it does not stop
const STW = 2, STH = 2.6;
thing(CUPX + 0.3, CUPZ + 0.12, STW, STH, 300, (c, p, t) => { if (t < ST.pour) return;
  const toC = (x, y) => [(x - (CUPX + 0.3) + STW / 2) * 300, (STH - (y - 0.45)) * 300];
  const th = lerp(0.3, 0.95, seg(t, ST.tip, ST.pour)), [sx, sy] = spoutAt(th), a = toC(sx, sy), b = toC(CUPX, CUPY + 0.05);
  const u = seg(t, ST.pour, ST.pour + 0.45, x => x), turn = seg(t, ST.turn - 0.2, ST.turn + 0.4);
  const pt = v => { const x = lerp(a[0], b[0], Math.pow(v, 1.7)), y = lerp(a[1], b[1], v * v * 0.3 + v * 0.7); return [x + Math.sin(v * 14 + t * 18) * 2.2, y]; };
  const seg1 = [], seg2 = []; const split = lerp(1.01, 0.42, turn);
  for (let k = 0; k <= 40; k++) { const v = k / 40 * u; (v < split ? seg1 : seg2).push(pt(v)); if (v >= split && !seg1.done) { seg1.push(pt(v)); seg1.done = true; } }
  c.save(); c.lineCap = 'round'; c.lineWidth = 9; c.shadowBlur = 18; c.shadowColor = 'rgba(240,212,168,0.7)';
  c.strokeStyle = GOLD_HI; c.beginPath(); seg1.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke();
  if (seg2.length) { c.shadowColor = 'rgba(200,69,60,0.7)'; c.strokeStyle = RED; c.lineWidth = 11; c.beginPath(); seg2.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke(); }
  // gold running over the brim and down to the ground
  const ov = seg(t, ST.over, ST.over + 0.5, x => x); if (ov > 0) { const ax = toC(CUPX - 0.17, CUPY + 0.02), bx = toC(CUPX + 0.17, CUPY + 0.02), g = toC(CUPX, 0.47)[1]; c.shadowColor = 'rgba(240,212,168,0.7)'; c.strokeStyle = GOLD_HI; c.lineWidth = 4; [[ax, -1], [bx, 1]].forEach(([q, s]) => { c.beginPath(); c.moveTo(q[0], q[1]); c.lineTo(q[0] + s * 14, lerp(q[1], g, ov)); c.stroke(); }); }
  c.restore();
}, { y0: 0.45, far: 26, near: 8, live: true, turn: false });
// wedding table behind, another depth layer: small cups in a long row
thing(X11 - 0.4, Z11 - 19, 9, 2, 120, (c, p) => { seedAt(77); const sh = [S.line(30, 110, 1050, 110, 40), S.line(70, 110, 70, 235, 8), S.line(1010, 110, 1010, 235, 8)]; for (let k = 0; k < 11; k++) sh.push(S.rect(110 + k * 80, 70, 26, 40)); draw(c, sh, p, { width: 3, color: GOLD }); }, { far: 36, near: 14, turn: false });
// ripples: gold rings spreading across the ground, past you and under your feet
const RINGS = [];
const srcs = [[CUPX, CUPZ, ST.over, 30, 0.42], ...[[-2.1, -6], [2.5, -8.5], [-2.9, -10], [3.1, -12], [-3.5, -13.5]].map(([dx, dz], i) => [X11 + dx, Z11 + dz, ST.others + i * 0.35, 5, 1.4])];
srcs.forEach(([x, z, t0, n, gap], si) => { for (let i = 0; i < n; i++) RINGS.push({ x, z, t0: t0 + i * gap, ph: hash(si * 9 + i) * 6.28, ph2: hash(si * 5 + i + 3) * 6.28, r: ribbon(si ? 0xd4a574 : 0xf0d4a8, 0, 120), sp: si ? 2.2 : 3.1, maxR: si ? 10 : 30 }); });
function updateRings(t) { for (const R of RINGS) { const age = t - R.t0; if (age <= 0) { R.r.m.visible = false; continue; } R.r.m.visible = true;
    const rad = Math.min(R.maxR, 0.12 + R.sp * age * (1 - 0.012 * age)), w = 0.03 + rad * 0.0045, wob1 = 0.014, A = rad / R.maxR;
    R.r.m.material.opacity = (1 - A) * 0.72 + 0.08;
    R.r.set(u => { const a = u * Math.PI * 2, k = 1 + wob1 * Math.sin(3 * a + R.ph) + 0.007 * Math.sin(7 * a + R.ph2 + age), r1 = rad * k, r2 = (rad + w) * k; return [R.x + Math.cos(a) * r1, R.z + Math.sin(a) * r1, R.x + Math.cos(a) * r2, R.z + Math.sin(a) * r2]; }); } }
const wash = pool(CUPX, CUPZ, 44, 44, 0);

// ================= LESSON 15: they walk past you =================
const X15 = pathX(P.b.S), Z15 = P.b.S;
const glad = t => seg(t, bar(P.b.arrive + 1.3), bar(P.b.arrive + 4.2));
// the river, flowing beside the path
const RIVER = []; for (let i = 0; i < 16; i++) RIVER.push({ r: ribbon(0xd4a574, 0.34 + 0.28 * hash(i), 90), x: X15 - 0.75 - i * 0.62 - hash(i + 2) * 0.3, ph: hash(i + 5) * 6.28 });
function updateRiver(t) { RIVER.forEach(R => R.r.set(u => { const z = Z15 + 22 - u * 62, x = R.x + 0.08 * Math.sin(z * 0.9 + R.ph + t * 1.6) + 0.04 * Math.sin(z * 2.3 + t * 2.2); return [x - 0.015, z, x + 0.015, z]; })); }
// John, waist deep, with the next person kneeling in the water
const JW = 3.4, JH = 3.3, JX = X15 - 1.15, JZ = Z15 - 5.5, JP = 240;
seedAt(201); const J = (() => { const cx = 540, gy = JH * JP - 6; return {
  torso: [[cx - 78, 500], [cx - 100, gy], [cx + 100, gy], [cx + 78, 500], [cx, 470]],
  still: [S.poly([[cx - 78, 500], [cx - 100, gy]]), S.poly([[cx + 78, 500], [cx + 100, gy]]), S.poly([[cx - 78, 500], [cx, 472], [cx + 78, 500]]), S.line(cx - 30, 560, cx + 34, 590, 6), S.line(cx - 40, 640, cx + 22, 665, 6), S.wave(cx - 180, cx + 180, gy - 6, 6, 5), S.wave(cx - 300, cx + 240, gy - 34, 4, 5)],
  kneel: [S.circle(cx - 322, 586, 46), S.poly([[cx - 372, 640], [cx - 322, 628], [cx - 272, 640], [cx - 262, gy], [cx - 384, gy]], true)],
  hair: [S.bez([cx - 66, 372], [cx - 78, 318], [cx - 44, 300], [cx - 14, 314]), S.bez([cx - 30, 306], [cx, 286], [cx + 50, 296], [cx + 66, 356]), S.bez([cx - 68, 366], [cx - 96, 400], [cx - 92, 450], [cx - 104, 492]), S.bez([cx + 68, 366], [cx + 94, 404], [cx + 88, 450], [cx + 102, 490]), S.bez([cx - 52, 330], [cx - 70, 360], [cx - 70, 400], [cx - 80, 440]), S.bez([cx + 54, 330], [cx + 72, 362], [cx + 72, 402], [cx + 82, 440])],
  beard: [S.poly([[cx - 62, 416], [cx - 52, 470], [cx - 26, 508], [cx, 528], [cx + 26, 508], [cx + 52, 470], [cx + 62, 416]]), S.line(cx - 18, 470, cx - 14, 508, 4), S.line(cx + 16, 470, cx + 12, 508, 4)],
}; })();
thing(JX, JZ, JW, JH, JP, (c, p, t) => { const cx = 540, q = glad(t), lift = 12 * q, H = 392 - lift;
  seedAt(230);
  fillPoly(c, J.torso, NIGHT, clamp(p * 3)); fillPoly(c, [[cx - 372, 640], [cx - 322, 628], [cx - 272, 640], [cx - 262, JH * JP - 6], [cx - 384, JH * JP - 6]], NIGHT, clamp(p * 3));
  c.save(); c.fillStyle = NIGHT; c.globalAlpha = clamp(p * 3); c.beginPath(); c.arc(cx - 322, 586, 46, 0, 7); c.fill(); c.beginPath(); c.arc(cx, H, 68, 0, 7); c.fill(); c.restore();
  draw(c, [...J.still, ...J.kneel], p, { width: 5.5, blur: 9 });
  const fp = seg(p, 0.45, 1); if (fp <= 0) return;
  c.save(); c.translate(0, -lift); draw(c, [S.circle(cx, 392, 66), ...J.hair, ...J.beard], fp, { width: 5, blur: 8 }); c.restore();
  // face: a flat, level look that opens into a huge smile with crescent eyes
  const smile = q; c.save(); c.lineCap = 'round'; c.strokeStyle = GOLD_HI; c.shadowColor = 'rgba(240,212,168,0.7)'; c.shadowBlur = 10; c.globalAlpha = fp; c.lineWidth = 7;
  [-1, 1].forEach(s => { const ex = cx + s * 27, ey = H - 8; c.lineWidth = 5; c.beginPath(); if (smile < 0.45) { c.moveTo(ex - 9, ey); c.lineTo(ex + 9, ey); c.stroke(); } else { c.arc(ex, ey + 7, 11, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); } });
  const mw = lerp(14, 36, smile), md = lerp(0, 24, smile), my = H + 20; c.lineWidth = 6; c.beginPath(); c.moveTo(cx - mw, my); c.quadraticCurveTo(cx, my + md, cx + mw, my); c.stroke();
  c.restore();
  // pouring arm keeps working the whole time
  const hb = Math.sin(t * Math.PI / barLen) * 10, hx = cx - 248, hy = 452 + hb;
  draw(c, [S.bez([cx - 76, 508], [cx - 140, 540], [cx - 190, 520], [hx, hy])], fp, { width: 7, blur: 8 });
  draw(c, [S.arc(hx - 4, hy + 2, 28, 15, 0, Math.PI, 14)], fp, { width: 5, blur: 8, color: GOLD_HI });
  c.save(); c.strokeStyle = GOLD_HI; c.lineWidth = 4; c.lineCap = 'round'; c.shadowColor = 'rgba(240,212,168,.7)'; c.shadowBlur = 9; c.globalAlpha = fp;
  for (let k = 0; k < 5; k++) { const v = ((t * 1.3 + k * 0.2) % 1), y0 = hy + 18 + v * 110, x0 = hx - 16 - v * 44; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 - 3, y0 + 18); c.stroke(); } c.restore();
  // the free arm rises as he gets gladder
  const ax = lerp(cx + 110, cx + 196, q), ay = lerp(690, 300, q); draw(c, [S.bez([cx + 76, 508], [cx + 130, lerp(600, 480, q)], [lerp(cx + 124, cx + 180, q), lerp(650, 400, q)], [ax, ay])], fp, { width: 7, blur: 8 });
  if (q > 0.2) { const k = clamp((q - 0.2) * 2); [-0.7, -0.25, 0.2, 0.65].forEach(a => draw(c, [S.line(ax, ay, ax + Math.sin(a) * 40 * k, ay - Math.cos(a) * 40 * k, 3)], 1, { width: 5, blur: 7 })); }
}, { far: 32, near: 10, live: true });
// the one they are all going to, far along, seen from behind
const HEX = pathX(Z15 - 26) + 2.7, HEZ = Z15 - 26;
const heGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.3, fog: false })); heGlow.scale.set(11, 11, 1); heGlow.position.set(HEX, 2, HEZ - 0.2); scene.add(heGlow);
const he = person(HEX, HEZ, 0, 1.06); he.material.fog = false;
const paced = [];
for (let i = 0; i < 34; i++) { const s = i % 2 ? 1 : -1, off = 1.25 + hash(i + 1) * 2.4, v = i % 4;
  const m = person(0, 0, v, 0.92 + hash(i + 9) * 0.16), t0 = bar(9) + i * 0.46;
  const ang = hash(i + 44) * 6.28, gr = 1.6 + hash(i + 2) * 3;
  paced.push({ m, s, off, v, t0, sp: 3.2 + hash(i + 3) * 0.9, z0: Z15 + 12 + hash(i + 5) * 3, gx: HEX + Math.cos(ang) * gr * 1.1, gz: HEZ + 2 + Math.abs(Math.sin(ang)) * gr }); }
// those already standing at the river with John, who peel away one at a time
const peel = []; [[0.0, -7.7], [0.9, -8.4], [1.9, -7.2], [-0.8, -9.3], [2.6, -9.1], [-0.2, -10]].forEach(([dx, dz], i) => { const m = person(X15 + dx, Z15 + dz, (i * 3 + 1) % 4, 0.96), t0 = bar(P.b.arrive + 0.4) + i * 0.95; peel.push({ m, v: (i * 3 + 1) % 4, x0: X15 + dx, z0: Z15 + dz, t0, sp: 3.1, gx: HEX + (i - 2.5) * 0.9 - 0.4, gz: HEZ + 3 + (i % 3) }); });
function updateCrowd(t) {
  for (const P1 of paced) { const age = t - P1.t0, m = P1.m; m.visible = age > 0; if (!m.visible) continue;
    const z = Math.max(P1.gz, P1.z0 - age * P1.sp), u = clamp((P1.z0 - z) / (P1.z0 - P1.gz)), bx = pathX(z) + P1.s * P1.off, x = lerp(bx, P1.gx, smooth(clamp((u - 0.45) / 0.55)));
    m.position.x = x; m.position.z = z; const moving = z > P1.gz + 0.01; m.material.map = TEX.walk[P1.v][moving && Math.floor((t + P1.t0) / (barLen / 4)) % 2 ? 1 : 0]; m.position.y = PH * m.scale.y / 2 + (moving ? Math.abs(Math.sin((t + P1.t0) * Math.PI / (barLen / 4))) * 0.05 : 0);
    face(m); m.material.opacity = nearFade(m); m.visible = m.position.z < camera.position.z - 0.3; }
  for (const P1 of peel) { const m = P1.m, age = Math.max(0, t - P1.t0); const L = Math.hypot(P1.gx - P1.x0, P1.gz - P1.z0), u = clamp(age * P1.sp / L); m.position.x = lerp(P1.x0, P1.gx, u); m.position.z = lerp(P1.z0, P1.gz, u); const moving = u > 0 && u < 1; m.material.map = TEX.walk[P1.v][moving && Math.floor(t / (barLen / 4)) % 2 ? 1 : 0]; face(m); m.material.opacity = nearFade(m) * clamp((camera.position.z < Z15 + 28) ? (Z15 + 28 - camera.position.z) / 10 : 0); m.visible = m.position.z < camera.position.z - 0.3 && m.material.opacity > 0; }
  face(he); he.material.opacity = clamp((Z15 + 34 - camera.position.z) / 12); he.visible = camera.position.z > HEZ - 0.2; heGlow.visible = camera.position.z > HEZ - 8; heGlow.material.opacity = 0.3 * he.material.opacity;
}

// ================= LESSON 30: the stones at your feet rise =================
const X30 = pathX(P.c.S), Z30 = P.c.S;
const T30 = { a: bar(P.c.arrive), reach: bar(P.c.arrive + 0.3), grab: bar(P.c.arrive + 0.8), up: bar(P.c.arrive + 1.05), wave: bar(P.c.arrive + 1.5), gone: bar(P.c.leave - 1.0) };
// rocks drawn in stages so they can sketch themselves as you approach
function rockTex(k, level) { seedAt(500 + k * 5); const c = document.createElement('canvas'); c.width = 240; c.height = 160; const x = c.getContext('2d'), pts = []; for (let a = 0; a < 9; a++) { const an = a / 9 * 6.28; const yy = Math.sin(an); pts.push([120 + Math.cos(an) * (84 + 24 * hash(k * 3 + a)), 100 + (yy > 0 ? yy * 34 : yy * (58 + 22 * hash(k * 5 + a)))]); }
  fillPoly(x, pts, NIGHT, level); draw(x, [S.poly(pts, true), S.bez([96, 64], [112, 78], [116, 92], [138, 104])], level, { width: 5, blur: 6 }); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
const ROCK = [0, 1, 2].map(k => [0.3, 0.55, 0.8, 1].map(l => rockTex(k, l)));
const rocks = []; for (let i = 0; i < 110; i++) { const s = i % 2 ? 1 : -1, z = Z30 + 9 - hash(i + 200) * 34, off = 0.55 + Math.pow(hash(i + 300), 1.4) * 6.5, sz = 0.28 + hash(i + 400) * 0.62, k = i % 3, m = new THREE.Mesh(new THREE.PlaneGeometry(sz * 1.5, sz), new THREE.MeshBasicMaterial({ map: ROCK[k][0], transparent: true, depthWrite: false, opacity: 0 })); const x = pathX(z) + s * off; m.position.set(x, sz * 0.46, z); scene.add(m); rocks.push({ m, k, x, z }); }
const pickedRock = (() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.48), new THREE.MeshBasicMaterial({ map: ROCK[1][3], transparent: true, depthWrite: false })); m.position.set(X30 + 0.15, 0.25, Z30 - 3.4); scene.add(m); return m; })();
function updateRocks(t) { const cz = camera.position.z; for (const R of rocks) { const d = cz - R.z; R.m.visible = d > 0.3 && d < 34; if (!R.m.visible) continue; const l = clamp((32 - d) / 22); R.m.material.map = ROCK[R.k][Math.min(3, Math.floor(l * 4))]; R.m.material.opacity = clamp(l * 2.5); face(R.m); } }
// men around you, each standing, then bending, then with a stone raised
const men = []; { const spots = []; for (let i = 0; i < 40; i++) { const s = i % 2 ? 1 : -1, z = Z30 - 3.2 - i * 0.66 - hash(i + 7) * 0.8, off = (Math.abs(Z30 - 3.2 - i * 0.66 - (Z30 - 21)) < 5 ? 3.0 : 1.55) + hash(i + 70) * 3.4; spots.push({ s, z, off, i }); }
  spots.forEach(({ s, z, off, i }) => { const v = i % 4, m = person(pathX(z) + s * off, z, v, 0.94 + hash(i + 31) * 0.14), t0 = T30.wave + (i * 0.11 + hash(i + 8) * 0.7) * (bar(P.c.arrive + 4.2) - T30.wave) / 4.4; men.push({ m, v, t0, d: 1.0 }); }); }
function updateMen(t) { const cz = camera.position.z; for (const M of men) { const m = M.m, d = cz - m.position.z; const a = clamp((26 - d) / 10) * nearFade(m); m.material.opacity = a; m.visible = a > 0 && d > 0.3; if (!m.visible) continue; const age = t - M.t0, pose = age < 0 ? 'walk' : age < 0.42 ? 'bend' : 'raised'; m.material.map = pose === 'walk' ? TEX.walk[M.v][0] : TEX[pose][M.v]; face(m); } }
// the first hand: comes down into the frame, closes on a stone at your feet, and lifts it
const heroTex = {}; for (const pose of ['open', 'closed']) { const c = document.createElement('canvas'); c.width = 660; c.height = 800; const x = c.getContext('2d'); seedAt(pose === 'open' ? 600 : 620); const wx = 280, wy = 500;
  const forearm = [[640, 16], [wx + 34, wy - 18], [wx - 34, wy + 26], [560, 0]]; fillPoly(x, [[660, 0], [wx + 40, wy - 22], [wx - 40, wy + 30], [540, 0]], NIGHT);
  draw(x, [S.poly([[660, 20], [wx + 44, wy - 22]]), S.poly([[532, 0], [wx - 36, wy + 28]]), S.line(590, 8, wx + 8, wy, 16)], 1, { width: 7, blur: 10 });
  if (pose === 'open') { fillPoly(x, [[wx - 50, wy + 14], [wx - 90, wy + 110], [wx, wy + 160], [wx + 72, wy + 40], [wx + 40, wy - 22]], NIGHT); draw(x, [S.poly([[wx - 40, wy + 28], [wx - 90, wy + 110]]), S.poly([[wx + 44, wy - 22], [wx + 80, wy + 40]]), ...[0, 1, 2, 3].map(k => S.line(wx - 90 + k * 50, wy + 106 - k * 22, wx - 110 + k * 60, wy + 220 - k * 18, 6)), S.line(wx + 76, wy + 34, wx + 118, wy + 112, 6)], 1, { width: 7, blur: 10 }); }
  else { const fx = wx - 30, fy = wy + 96, rock = [[fx - 112, fy + 14], [fx - 84, fy - 62], [fx - 10, fy - 92], [fx + 76, fy - 66], [fx + 112, fy + 6], [fx + 78, fy + 76], [fx - 26, fy + 92], [fx - 92, fy + 66]]; fillPoly(x, rock, NIGHT); draw(x, [S.poly(rock, true)], 1, { width: 8, color: RED, blur: 16 });
    [-1.5, -0.5, 0.5, 1.5].forEach(k => { const cx0 = fx + k * 44 + 8, f = [[cx0 - 22, fy - 58], [cx0 - 20, fy + 34], [cx0 + 20, fy + 34], [cx0 + 22, fy - 58]]; fillPoly(x, f, NIGHT); draw(x, [S.poly([f[0], f[1]]), S.arc(cx0, fy + 34, 20, 16, Math.PI, 0, 14), S.poly([f[2], f[3]]), S.line(cx0 - 14, fy - 8, cx0 + 14, fy - 8, 4)], 1, { width: 6, blur: 8 }); });
    draw(x, [S.bez([fx + 70, fy - 62], [fx + 66, fy - 96], [fx + 40, wy - 8], [wx + 44, wy - 22])], 1, { width: 7, blur: 8 }); }
  const tt = new THREE.CanvasTexture(x.canvas); tt.colorSpace = THREE.SRGBColorSpace; tt.anisotropy = 8; heroTex[pose] = tt; }
const hero = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 2.12), new THREE.MeshBasicMaterial({ map: heroTex.open, transparent: true, depthWrite: false })); hero.renderOrder = 8; scene.add(hero);
function updateHero(t) { const hx = X30 + 0.3, hz = Z30 - 3.3; hero.visible = t > T30.reach - 0.2 && camera.position.z > hz; const offPos = [hx + 1.8, 5.6], downPos = [hx + 0.2, 0.98], upPos = [hx + 0.8, 3.05];
  let u; if (t < T30.grab) { u = smooth(clamp((t - T30.reach) / (T30.grab - T30.reach))); hero.position.set(lerp(offPos[0], downPos[0], u), lerp(offPos[1], downPos[1], u), hz); hero.material.map = heroTex.open; pickedRock.visible = camera.position.z > hz; }
  else { u = smooth(clamp((t - T30.up) / (T30.wave - T30.up + 0.6))); hero.position.set(lerp(downPos[0], upPos[0], u), lerp(downPos[1], upPos[1], u), hz); hero.material.map = heroTex.closed; pickedRock.visible = false; }
  hero.rotation.y = Math.atan2(camera.position.x - hx, camera.position.z - hz); }
// the calm one ahead, from behind, in a gap the crowd leaves open
const CX = pathX(Z30 - 21), CZ = Z30 - 21;
const calmGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.45, fog: false })); calmGlow.scale.set(9, 9, 1); calmGlow.position.set(CX, 2, CZ - 0.2); scene.add(calmGlow);
const calm = person(CX, CZ, 2, 1.04); calm.material.fog = false;
function updateCalm(t) { const k = 1 - seg(t, T30.gone, T30.gone + barLen * 0.5), inn = clamp((Z30 + 26 - camera.position.z) / 14); calm.material.opacity = inn * k; calmGlow.material.opacity = 0.45 * inn * k; face(calm); calm.visible = calmGlow.visible = calm.material.opacity > 0.01; }
// temple court: a long colonnade far behind, a slow depth layer
thing(X30, Z30 - 50, 52, 9, 34, (c, p) => { seedAt(801); const sh = []; for (let k = 0; k < 15; k++) { const x = 40 + k * 118; sh.push(S.line(x, 300, x, 170, 6), S.arc(x + 59, 170, 59, 44, Math.PI, Math.PI * 2, 18)); } sh.push(S.line(0, 300, 1768, 300, 40)); draw(c, sh, p, { width: 2.4, color: DIM, glow: false }); }, { far: 76, near: 44, fog: false, turn: false });

// ---------- walking ----------
const LEGS = [[0, P.a.arrive, 34, P.a.S], [P.a.leave, P.b.arrive, P.a.S - 0.5, P.b.S], [P.b.leave, P.c.arrive, P.b.S - 0.5, P.c.S], [P.c.leave, END_BAR, P.c.S - 0.5, Z30 - 15]];
function camZ(t) { for (const [a, b, z0, z1] of LEGS) { const ta = bar(a), tb = bar(b); if (t < ta) return z0 === 34 ? 34 : z0 + 0.5; if (t <= tb) return lerp(z0, z1, smooth((t - ta) / (tb - ta))); const nx = LEGS[LEGS.indexOf(LEGS.find(l => l[0] === a)) + 1]; if (nx && t < bar(nx[0])) return lerp(z1, nx[2], smooth((t - tb) / (bar(nx[0]) - tb))); } return LEGS.at(-1)[3]; }
function placeCamera(t) { const z = camZ(t), dz = Math.abs(camZ(t + 0.05) - z) / 0.05, phase = t * Math.PI * 2 / (barLen / 2);
  camera.position.set(pathX(z) + Math.sin(phase / 2) * 0.012 * dz, EYE + Math.abs(Math.sin(phase)) * 0.008 * dz, z);
  const ahead = z - 12; camera.lookAt(pathX(ahead), 1.95, ahead); }

// ---------- overlay ----------
const out = document.getElementById('out').getContext('2d');
function wrap(ctx, s, size, maxW) { ctx.font = font(size); const ws = s.split(' '), ls = []; let cur = ''; for (const w of ws) { const n = cur ? cur + ' ' + w : w; if (ctx.measureText(n).width > maxW && cur) { ls.push(cur); cur = w; } else cur = n; } ls.push(cur); return ls; }
function overlay(t) { for (const k of ['a', 'b', 'c']) { const Q = P[k]; const a = bar(Q.arrive), l = bar(Q.leave), al = seg(t, a - barLen * 0.3, a + 0.2) * (1 - seg(t, l - 0.1, l + barLen * 0.3)); if (al <= 0) continue;
    txt(out, 'LESSON ' + Q.lesson, 70, 112, 40, { align: 'left', color: GOLD_HI, spacing: 5, alpha: al }); txt(out, Q.ref, 70, 164, 34, { align: 'left', italic: true, color: INK, alpha: al * 0.8 });
    const sa = seg(t, a + barLen * 0.45, a + barLen * 1.1) * (1 - seg(t, l - 0.3, l + barLen * 0.3)); if (sa <= 0) continue;
    out.save(); out.globalAlpha = sa; const g = out.createRadialGradient(540, 400, 60, 540, 400, 640); g.addColorStop(0, 'rgba(12,10,8,0.9)'); g.addColorStop(1, 'rgba(12,10,8,0)'); out.fillStyle = g; out.translate(0, 400); out.scale(1, 0.32); out.translate(0, -400); out.fillRect(0, -700, 1080, 2100); out.restore();
    const ls = wrap(out, Q.say, 62, 930), ly = 78, y0 = 400 - (ls.length - 1) * ly / 2; ls.forEach((L, i) => txt(out, L, 540, y0 + i * ly, 62, { color: GOLD_HI, alpha: sa, glow: 10 })); }
  const fade = 1 - seg(t, 0, 1.2) * (1 - seg(t, DURATION - 2.2, DURATION - 0.4)); if (fade > 0) { out.fillStyle = `rgba(0,0,0,${fade})`; out.fillRect(0, 0, OW, OH); } }

function renderAt(t) { t = clamp(t, 0, DURATION - 1e-3);
  placeCamera(t); camera.updateMatrixWorld(); sky.x = sky.mesh.position.x = camera.position.x * 0.9; sky.z = sky.mesh.position.z = camera.position.z - 62;
  updateThings(t); updateRings(t); updateRiver(t); updateCrowd(t); updateRocks(t); updateMen(t); updateHero(t); updateCalm(t);
  pourJar.mesh.rotation.z = lerp(0.3, 0.95, seg(t, ST.tip, ST.pour));
  wash.material.opacity = 0.2 * seg(t, ST.over, ST.over + 6);
  renderer.render(scene, camera); out.drawImage(renderer.domElement, 0, 0); overlay(t); }
window.renderAt = renderAt; window.DURATION = DURATION;
window.READY = true; renderAt(0);
