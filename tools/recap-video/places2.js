// "Places, not signs" prototype v2: same walk as places.js, drawn with generated single-line art (art/, gen.py + prep.py).
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


// ---------- generated line art: R = line, G = draw order, B = silhouette (prep.py). Revealed by a threshold, so it draws itself. ----------
const META = await (await fetch('art/art.json')).json();
const loader = new THREE.TextureLoader();
const TX = Object.fromEntries(await Promise.all(Object.keys(META).map(async n => { const t = await loader.loadAsync(`art/${n}.png`); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8; return [n, t]; })));
const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
const FS = `varying vec2 vUv; uniform sampler2D map, map2; uniform float uP, uA, uFog, uSil, uMix, uGain, uFill, uThin;
const vec3 NIGHTC = vec3(12.,10.,8.)/255., GOLDC = vec3(240.,212.,168.)/255., REDC = vec3(200.,69.,60.)/255.;
vec2 lineOf(vec4 t){ float v = 1.0 - smoothstep(uP - 0.006, uP + 0.002, t.g); if (uP >= 1.0) v = 1.0; float tip = uP < 1.0 ? smoothstep(uP - 0.05, uP, t.g) * v : 0.0; float r = mix(t.r, smoothstep(0.5, 0.98, t.r), uThin); return vec2(r * v, r * tip); }
void main(){ vec4 a = texture2D(map, vUv), b = texture2D(map2, vUv); vec2 la = lineOf(a), lb = lineOf(b);
  float line = clamp(mix(la.x, lb.x, uMix) * uGain, 0.0, 1.0), tip = mix(la.y, lb.y, uMix), sil = mix(a.b, b.b, uMix) * uSil * clamp(uP * 3.0, 0.0, 1.0);
  float al = max(line, sil); if (al < 0.004) discard;
  vec3 col = mix(NIGHTC, GOLDC + tip * 0.25, clamp(line / max(al, 0.001), 0.0, 1.0));
  if (uFill > 0.0 && vUv.y < uFill && vUv.y > 0.05 && abs(vUv.x - 0.5) < 0.36 + vUv.y * 0.1 && line < 0.5) { col = REDC; al = 0.92; }
  gl_FragColor = vec4(col, al * uA * (1.0 - uFog)); }`;
const ARTS = [];
function art(name, x, z, hU, o = {}) {
  const asp = META[name].aspect, wU = hU * asp;
  const mat = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
    uniforms: { map: { value: TX[name] }, map2: { value: TX[o.map2 || name] }, uP: { value: o.p ?? 0 }, uA: { value: 1 }, uFog: { value: 0 }, uSil: { value: o.sil ?? 0.9 }, uMix: { value: 0 }, uGain: { value: o.gain ?? 1.15 }, uFill: { value: 0 }, uThin: { value: 0 } } });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wU, hU), mat); if (o.flip) mesh.scale.x = -1;
  mesh.position.set(x, (o.y0 || 0) + hU / 2, z); scene.add(mesh);
  const A = { mesh, mat, u: mat.uniforms, x, z, hU, wU, far: o.far ?? 26, near: o.near ?? 8, p: o.p ?? 0, fixed: o.p != null, turn: o.turn !== false, fog: o.fog !== false };
  ARTS.push(A); return A;
}
function updateArts() {
  const cz = camera.position.z, cx = camera.position.x, fg = scene.fog;
  for (const A of ARTS) { const m = A.mesh, zz = m.position.z, xx = m.position.x, d = Math.hypot(xx - cx, zz - cz);
    if (!A.fixed && cz > zz) A.p = Math.max(A.p, clamp((A.far - d) / (A.far - A.near)));
    A.u.uP.value = A.fixed ? 1 : A.p;
    m.visible = (A.fixed || A.p > 0) && cz > zz + 0.2 && A.u.uA.value > 0.003 && A.show !== false;
    if (m.visible && A.turn) m.rotation.y = Math.atan2(cx - xx, cz - zz);
    A.u.uFog.value = A.fog ? clamp((d - fg.near) / (fg.far - fg.near)) : 0;
    A.u.uThin.value = clamp((A.hU / Math.max(d, 0.5) * 1321 / A.mat.uniforms.map.value.image.height - 0.28) / 0.45); }
}
const nearFade = d => clamp((d - 1.8) / 2.6);
const PEOPLE = ['p1', 'p2', 'p3', 'p4', 'p5'];
const bodyScale = (name, target) => target / META[name].bodyH;   // mesh height that makes the drawn body this tall
function walker(name, x, z, flip, target = 3.0) { return art(name, x, z, bodyScale(name, target), { p: 1, flip, sil: 0.85, gain: 1.35 }); }

// ---------- far background layers: barely move as you walk, which is what makes the near things feel near ----------
const sky = thing(0, 0, 90, 8, 24, (c, p) => { seedAt(3); const pts = []; for (let k = 0; k <= 80; k++) pts.push([k / 80 * 90 * 24, 8 * 24 - 34 - 74 * Math.abs(Math.sin(k * 0.21 + 3)) - 34 * hash(k + 3)]); draw(c, [S.poly(pts)], 1, { width: 1.8, color: DIM, glow: false }); }, { far: 1e4, near: 0, fog: false, turn: false });
sky.mesh.renderOrder = -8;

// ================= LESSON 11: the water reaches you =================
const X11 = pathX(P.a.S), Z11 = P.a.S;
const ST = { a: bar(P.a.arrive), tip: bar(2.4), pour: bar(3.4), turn: bar(3.9), over: bar(4.2) };
// five stone jars standing in depth along both sides of the path
[[-2.1, -7, 'jar2', 2.0, false], [-3.1, -10.5, 'jar1', 2.9, false], [-1.0, -14, 'jar2', 2.1, true], [4.6, -15, 'jar1', 2.9, true], [-3.9, -16, 'jar2', 2.2, false]].forEach(([dx, dz, n, h, flip]) => art(n, X11 + dx, Z11 + dz, h, { far: 30, near: 9, flip }));
// the sixth, tipping from a heavy block toward the one small cup on its stone
const CUPX = X11 + 0.5, CUPZ = Z11 - 8, CUPH = 0.46, CUPB = 0.62, CUPY = CUPB + CUPH;
art('s1', CUPX, CUPZ + 0.02, 0.72, { far: 26, near: 8, sil: 0.95 });
const cup = art('cup', CUPX, CUPZ + 0.06, CUPH, { y0: CUPB, far: 26, near: 8, gain: 1.4, turn: false, sil: 0.95 });
art('s3', X11 + 2.55, CUPZ - 0.2, 1.3, { far: 30, near: 9, turn: false, sil: 0.95 });
const JH0 = 2.25, pourJar = art('jar1', X11 + 1.8, CUPZ - 0.1, JH0, { y0: 0.86, far: 30, near: 9, turn: false, sil: 0.95 });
const spoutAt = th => { const r = JH0 * 0.5, cx = pourJar.mesh.position.x, cy = pourJar.mesh.position.y; return [cx - Math.sin(th) * r, cy + Math.cos(th) * r]; };
// the stream: gold where it leaves the jar, wine before it reaches the cup, and it does not stop
const STW = 2.6, STH = 3.4, STX = CUPX + 0.6;
thing(STX, CUPZ + 0.1, STW, STH, 300, (c, p, t) => { if (t < ST.pour) return;
  const toC = (x, y) => [(x - STX + STW / 2) * 300, (STH - y + 0.0) * 300];
  const th = lerp(0.3, 0.95, seg(t, ST.tip, ST.pour)), [sx, sy] = spoutAt(th), a = toC(sx, sy), b = toC(CUPX, CUPY - 0.02);
  const u = seg(t, ST.pour, ST.pour + 0.45, x => x), turn = seg(t, ST.turn - 0.2, ST.turn + 0.4);
  const pt = v => [lerp(a[0], b[0], Math.pow(v, 1.5)) + Math.sin(v * 11 + t * 9) * 1.6, lerp(a[1], b[1], v)];
  const seg1 = [], seg2 = [], split = lerp(1.01, 0.4, turn);
  for (let k = 0; k <= 40; k++) { const v = k / 40 * u; if (v <= split) seg1.push(pt(v)); if (v >= split) seg2.push(pt(v)); }
  c.save(); c.lineCap = 'round'; c.lineWidth = 3.4; c.shadowBlur = 9; c.shadowColor = 'rgba(240,212,168,0.6)';
  c.strokeStyle = GOLD_HI; c.beginPath(); seg1.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke();
  if (seg2.length > 1) { c.shadowColor = 'rgba(200,69,60,0.6)'; c.strokeStyle = RED; c.lineWidth = 4.2; c.beginPath(); seg2.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke(); }
  // thin gold threads over the brim, down the stone, to the ground: it does not stop
  const ov = seg(t, ST.over, ST.over + 0.8, x => x); if (ov > 0) { c.shadowColor = 'rgba(240,212,168,0.6)'; c.strokeStyle = GOLD_HI; c.lineWidth = 1.8; [[-0.09, -1], [0.1, 1]].forEach(([dx, s]) => { const x0 = toC(CUPX + dx, CUPY)[0], y0 = toC(0, CUPY - 0.04)[1], y1 = lerp(y0, toC(0, 0.03)[1], ov); c.beginPath(); c.moveTo(x0, y0); c.bezierCurveTo(x0 + s * 6, y0 + 30, x0 + s * 8, y1 - 30, x0 + s * 10, y1); c.stroke(); }); }
  c.restore();
}, { y0: 0, far: 26, near: 8, live: true, turn: false });
// a few thin, slow ripple lines crossing the ground, past you and under your feet
const RINGS = []; for (let i = 0; i < 7; i++) RINGS.push({ x: CUPX, z: CUPZ, t0: ST.over + i * 1.5, ph: hash(i * 9) * 6.28, ph2: hash(i + 3) * 6.28, r: ribbon(0xf0d4a8, 0, 140), sp: 1.35, maxR: 15 });
function updateRings(t) { for (const R of RINGS) { const age = t - R.t0; if (age <= 0 || t > bar(P.a.leave + 2)) { R.r.m.visible = false; continue; } R.r.m.visible = true;
    const rad = Math.min(R.maxR, 0.5 + R.sp * age), w = 0.018, A = rad / R.maxR; R.r.m.material.opacity = (1 - A) * 0.5 * clamp(age / 0.6);
    R.r.set(u => { const a = u * Math.PI * 2, k = 1 + 0.012 * Math.sin(3 * a + R.ph) + 0.006 * Math.sin(7 * a + R.ph2 + age * 0.4), r1 = rad * k, r2 = (rad + w) * k; return [R.x + Math.cos(a) * r1, R.z + Math.sin(a) * r1, R.x + Math.cos(a) * r2, R.z + Math.sin(a) * r2]; }); } }
const wash = pool(CUPX, CUPZ, 30, 30, 0); wash.material.fog = false;


// ================= LESSON 15: they walk past you =================
const X15 = pathX(P.b.S), Z15 = P.b.S;
const glad = t => seg(t, bar(P.b.arrive + 1.8), bar(P.b.arrive + 3.4));
// the river beside the path: a few slow lines
const RIVER = []; for (let i = 0; i < 6; i++) RIVER.push({ r: ribbon(0xd4a574, 0.22 + 0.2 * hash(i), 90), x: X15 - 0.5 - i * 0.95 - hash(i + 2) * 0.4, ph: hash(i + 5) * 6.28 });
function updateRiver(t) { RIVER.forEach(R => R.r.set(u => { const z = Z15 + 22 - u * 62, x = R.x + 0.09 * Math.sin(z * 0.5 + R.ph + t * 0.7) + 0.03 * Math.sin(z * 1.3 + t * 0.9); return [x - 0.012, z, x + 0.012, z]; })); }
// John, waist deep, still pouring. The only change in him is his posture: same man, head lifting, arm rising.
const JX = X15 - 1.0, JZ = Z15 - 6.4, JH = 3.5;
const john = art('john', JX, JZ, JH, { y0: -0.28, map2: 'johng', far: 32, near: 11, gain: 1.3, sil: 0.92 });
// water falling from his cupped hand, the whole time
const johnDrops = thing(JX, JZ + 0.02, JH * META.john.aspect, JH, 240, (c, p, t) => { if (p < 0.8) return; const W = c.canvas.width, H = c.canvas.height, hx = W * 0.79, hy = H * 0.52, q = glad(t);
  c.save(); c.strokeStyle = GOLD_HI; c.lineWidth = 1.6; c.lineCap = 'round'; c.shadowColor = 'rgba(240,212,168,.6)'; c.shadowBlur = 6;
  for (let k = 0; k < 6; k++) { const v = (t * 0.9 + k / 6) % 1, y0 = hy + v * H * 0.33, x0 = hx - 3 * k + 7; c.globalAlpha = (1 - v) * 0.85; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 - 1, y0 + 16); c.stroke(); } c.restore();
}, { y0: -0.28, far: 32, near: 11, live: true });
// the one they are all going to, far along, seen from behind
const HEX = pathX(Z15 - 26) + 1.9, HEZ = Z15 - 26;
const heGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.22, fog: false })); heGlow.scale.set(9, 9, 1); heGlow.position.set(HEX, 1.8, HEZ - 0.2); scene.add(heGlow);
const he = walker('he', HEX, HEZ, false, 3.1); he.fog = false;
const paced = []; for (let i = 0; i < 14; i++) { const s = i % 2 ? 1 : -1, off = 1.8 + hash(i + 1) * 2.0, n = PEOPLE[i % 5], A = walker(n, 0, 0, hash(i + 77) < 0.5, 2.8 + hash(i + 9) * 0.35);
  const ang = hash(i + 44) * 6.28, gr = 1.8 + hash(i + 2) * 3.2; paced.push({ A, s, off, t0: bar(9) + i * 1.15, sp: 2.9 + hash(i + 3) * 0.7, z0: Z15 + 11 + hash(i + 5) * 3, gx: HEX + 0.8 + Math.abs(Math.cos(ang)) * gr * (i % 3 ? 1.1 : -0.15), gz: HEZ + 2 + Math.abs(Math.sin(ang)) * gr, ph: hash(i + 91) * 6 }); }
// those already at the river, who peel away one at a time
const peel = []; [[1.0, -9.5], [2.3, -10.6], [-0.3, -11.8], [3.0, -12.4]].forEach(([dx, dz], i) => { const A = walker(PEOPLE[(i * 2 + 1) % 5], X15 + dx, Z15 + dz, i % 2 === 1, 3.0); peel.push({ A, x0: X15 + dx, z0: Z15 + dz, t0: bar(P.b.arrive + 0.6) + i * 1.3, sp: 2.1, gx: HEX + 0.8 + i * 1.2, gz: HEZ + 2.4 + i * 0.5, ph: i * 1.3 }); });
const gait = (A, moving, t, ph) => { A.mesh.position.y = A.hU / 2 + (moving ? Math.abs(Math.sin((t + ph) * 3.3)) * 0.035 : 0); A.mesh.rotation.z = moving ? Math.sin((t + ph) * 3.3) * 0.012 : 0; };
function updateCrowd(t) { const cz = camera.position.z, leaveK = 1 - seg(t, bar(P.b.leave - 0.3), bar(P.b.leave + 0.9));
  for (const Q of paced) { const age = t - Q.t0, m = Q.A.mesh; if (age <= 0) { Q.A.u.uA.value = 0; continue; }
    const z = Math.max(Q.gz, Q.z0 - age * Q.sp), u = clamp((Q.z0 - z) / (Q.z0 - Q.gz)), bx = pathX(z) + Q.s * Q.off, x = lerp(bx, Q.gx, smooth(clamp((u - 0.45) / 0.55)));
    m.position.x = x; m.position.z = z; gait(Q.A, z > Q.gz + 0.01, t, Q.ph); const d = Math.hypot(x - camera.position.x, z - cz); Q.A.u.uA.value = (cz > z ? nearFade(d) : 0) * leaveK; }
  for (const Q of peel) { const m = Q.A.mesh, age = Math.max(0, t - Q.t0), L = Math.hypot(Q.gx - Q.x0, Q.gz - Q.z0), u = clamp(age * Q.sp / L); m.position.x = lerp(Q.x0, Q.gx, u); m.position.z = lerp(Q.z0, Q.gz, u); gait(Q.A, u > 0 && u < 1, t, Q.ph); Q.A.u.uA.value = leaveK; }
  john.u.uMix.value = glad(t); { const d = Math.hypot(JX - camera.position.x, JZ - cz), k = clamp((d - 3.6) / 2.4) * (cz > JZ ? 1 : 0); john.u.uA.value = k; johnDrops.mesh.material.opacity = k; }
  he.u.uA.value = clamp((Z15 + 34 - cz) / 12) * leaveK; heGlow.visible = cz > HEZ; heGlow.material.opacity = 0.22 * he.u.uA.value;
}


// ================= LESSON 30: the stones at your feet rise =================
const X30 = pathX(P.c.S), Z30 = P.c.S;
const T30 = { a: bar(P.c.arrive), reach: bar(P.c.arrive + 0.3), grab: bar(P.c.arrive + 0.9), up: bar(P.c.arrive + 1.1), wave: bar(P.c.arrive + 1.6), gone: bar(P.c.leave - 1.0) };
// loose stones you approach through, no two quite alike
for (let i = 0; i < 46; i++) { const s = i % 2 ? 1 : -1, z = Z30 + 8 - hash(i + 200) * 30, off = 0.9 + Math.pow(hash(i + 300), 1.2) * 6, sz = 0.2 + hash(i + 400) * 0.34; art(['s1', 's2', 's3'][i % 3], pathX(z) + s * off, z, sz, { far: 30, near: 12, flip: hash(i + 500) < 0.5, sil: 0.9, gain: 1.25 }); }
// the men, each standing, then bending, then with a stone raised (three drawings, crossfaded)
const men = []; for (let i = 0; i < 13; i++) { const s = i % 2 ? 1 : -1, z = Z30 - 6.2 - i * 1.3 - hash(i + 7) * 0.7, near = Math.abs(z - (Z30 - 21)) < 5, off = (near ? 2.8 : 2.1) + hash(i + 70) * 2.6, x = pathX(z) + s * off, flip = hash(i + 33) < 0.5;
  const stand = walker(PEOPLE[i % 5 === 1 || i % 5 === 4 ? 0 : i % 5], x, z, flip, 2.9), bend = art('b1', x, z, bodyScale('b1', 2.2), { p: 1, flip, gain: 1.35, sil: 0.85 }), up = art(i % 2 ? 'm1' : 'm2', x, z, bodyScale('m1', 3.55), { p: 1, flip, gain: 1.35, sil: 0.85 });
  men.push({ stand, bend, up, t0: T30.wave + (i * 0.17 + hash(i + 8) * 0.8) * 1.15 }); }
function updateMen(t) { const cz = camera.position.z; for (const M of men) { const d = cz - M.stand.mesh.position.z, a = clamp((30 - d) / 10) * nearFade(Math.hypot(M.stand.mesh.position.x - camera.position.x, d)), age = t - M.t0;
    const b = seg(age, 0, 0.35), r = seg(age, 0.75, 1.15); M.stand.u.uA.value = a * (1 - b); M.bend.u.uA.value = a * b * (1 - r); M.up.u.uA.value = a * r; } }
// the one hand: comes down into the frame, closes on a stone, and lifts it
const HX = X30 + 0.42, HZ = Z30 - 4.4, HH = 1.75;
const picked = art('s1', HX - 0.34, HZ + 0.02, 0.42, { y0: 0.02, far: 26, near: 8, gain: 1.3, sil: 0.95 });
const hero = art('h1', HX, HZ, HH, { p: 1, map2: 'h2', turn: true, fog: false, gain: 1.35, sil: 0.9 }); hero.mesh.renderOrder = 8;
function updateHero(t) { hero.show = t > T30.reach - 0.2; hero.u.uA.value = 1 - seg(t, T30.wave + barLen * 0.1, T30.wave + barLen * 0.8); const off = [HX + 1.5, 4.9], down = [HX, HH / 2 - 0.14], upP = [HX + 0.3, 1.45];
  if (t < T30.grab) { const u = smooth(clamp((t - T30.reach) / (T30.grab - T30.reach))); hero.mesh.position.set(lerp(off[0], down[0], u), lerp(off[1], down[1], u), HZ); hero.u.uMix.value = 0; picked.show = true; }
  else { const u = smooth(clamp((t - T30.up) / (T30.wave - T30.up + 0.6))); hero.mesh.position.set(lerp(down[0], upP[0], u), lerp(down[1], upP[1], u), HZ); const k = seg(t, T30.grab, T30.grab + 0.22); hero.u.uMix.value = k; picked.show = k < 0.5; } }
// the calm one ahead, from behind, in a gap the crowd leaves open
const CX = pathX(Z30 - 21), CZ = Z30 - 21;
const calmGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35, fog: false })); calmGlow.scale.set(8, 8, 1); calmGlow.position.set(CX, 1.8, CZ - 0.2); scene.add(calmGlow);
const calm = walker('he', CX, CZ, true, 3.1); calm.fog = false;
function updateCalm(t) { const k = 1 - seg(t, T30.gone, T30.gone + barLen * 0.5), inn = clamp((Z30 + 26 - camera.position.z) / 14); calm.u.uA.value = inn * k; calmGlow.material.opacity = 0.35 * inn * k; calmGlow.visible = camera.position.z > CZ; }
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
  updateThings(t); updateRings(t); updateRiver(t); updateCrowd(t); updateMen(t); updateHero(t); updateCalm(t); updateArts();
  pourJar.mesh.rotation.z = lerp(0.3, 0.95, seg(t, ST.tip, ST.pour)); cup.u.uFill.value = 0.1 + 0.72 * seg(t, ST.turn + 0.2, ST.over, x => x) ; if (t < ST.turn + 0.2) cup.u.uFill.value = 0;
  wash.material.opacity = 0.12 * seg(t, ST.over, ST.over + 8);
  renderer.render(scene, camera); out.drawImage(renderer.domElement, 0, 0); overlay(t); }
window.renderAt = renderAt; window.DURATION = DURATION;
window.READY = true; renderAt(0);
