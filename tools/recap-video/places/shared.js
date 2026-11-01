// Shared kit for every place in the walk. Lessons never touch this file; they use the handle P that main.js passes them.
// Everything that happens at a moment is scheduled in BARS AND BEATS from arrival (P.ev), on the real beat grid of the music.
import * as THREE from 'three';

export const OW = 1080, OH = 1920, VFOV = 72, EYE = 2.6;
export const RED = '#c8453c';
export const smooth = t => t * t * (3 - 2 * t);
// a gentle S-curve with a long slow bend, so the whole trail reads as winding from above
export const pathX = z => 1.2 * Math.sin(z * 0.05) + 5 * Math.sin(z * 0.013);

export const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gl'), antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(OW, OH, false); renderer.outputColorSpace = THREE.SRGBColorSpace;
export const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0c0a08); scene.fog = new THREE.Fog(0x0c0a08, 16, 72);
export const camera = new THREE.PerspectiveCamera(VFOV, OW / OH, 0.1, 300);

// ---------- the beat grid: one clock for everything ----------
export const clock = { beats: [], energy: [], camAt: () => 0, stems: null };
// what each instrument is doing right now, 0-1. level = its loudness, as a slow breath. hit = its attacks, quick up, soft down.
const stemAt = (kind, name, t) => { const S = clock.stems; if (!S) return 0; const A = S[kind][name]; if (!A) throw new Error('no instrument "' + name + '" (drums, bass, guitar, keys, swell)'); const f = Math.max(t, 0) * S.rate, i = Math.floor(f), a = A[i] ?? 0, b = A[i + 1] ?? a; return (a + (b - a) * (f - i)) / 99; };
export const listen = (name, t) => stemAt('level', name, t), hit = (name, t) => stemAt('hit', name, t);
export const beatAt = i => { const B = clock.beats; if (i < B.length) return B[Math.max(i, 0)]; const n = B.length, k = Math.min(32, n - 1), st = (B[n - 1] - B[n - 1 - k]) / k; return B[n - 1] + (i - n + 1) * st; };
export const barAt = n => beatAt(Math.round(n * 4));
export const barLen = () => { const B = clock.beats; return (B[B.length - 1] - B[0]) / (B.length - 1) * 4; };
export function beatIndex(t) { const B = clock.beats; let a = 0, b = B.length - 1; if (t >= B[b]) return b; while (b - a > 1) { const m = (a + b) >> 1; if (B[m] <= t) a = m; else b = m; } return a; }
// 0 right on a beat, climbing to 1 just before the next
export function beatPhase(t) { const i = beatIndex(t), a = beatAt(i), b = beatAt(i + 1); return clamp((t - a) / Math.max(b - a, 1e-3)); }
// a short bump right after each beat: 1 at the beat, gone by the middle of it. Downbeats are stronger.
export function pulse(t) { const i = beatIndex(t); return Math.exp(-(t - beatAt(i)) * 7) * (i % 4 === 0 ? 1 : 0.55); }
// how far a beat's "surge" has got: most of the change happens just after the beat, then it rests until the next
export const surge = ph => { const u = clamp(ph / 0.55); return 1 - (1 - u) * (1 - u) * (1 - u); };

// ---------- light and lines ----------
function glowTex(r, g, b) { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const gr = x.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, `rgba(${r},${g},${b},0.6)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
export const GLOW = glowTex(240, 212, 168);
export function pool(x, z, w, d, op) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: GLOW, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: op })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.01, z); m.renderOrder = -6; scene.add(m); return m; }
export function glow(x, y, z, size, op) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: op, fog: false })); s.scale.set(size, size, 1); s.position.set(x, y, z); scene.add(s); return s; }
// a line on the ground that can change every frame; stays crisp at any distance
export function ribbon(color, opacity, n) {
  const g = new THREE.BufferGeometry(), pos = new Float32Array((n + 1) * 6), idx = [];
  for (let k = 0; k < n; k++) { const a = k * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  m.frustumCulled = false; m.renderOrder = -4; scene.add(m);
  return { m, n, set(fn) { for (let k = 0; k <= n; k++) { const [ax, az, bx, bz] = fn(k / n); pos.set([ax, 0.02, az, bx, 0.02, bz], k * 6); } g.attributes.position.needsUpdate = true; } };
}
export function line(pts, w, color = 0xf0d4a8, op = 0.8) { const r = ribbon(color, op, pts.length - 1);
  r.set(u => { const k = Math.round(u * (pts.length - 1)), p = pts[k], a = pts[Math.max(k - 1, 0)], b = pts[Math.min(k + 1, pts.length - 1)]; const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, sx = -dz / L * w / 2, sz = dx / L * w / 2; return [p[0] - sx, p[1] - sz, p[0] + sx, p[1] + sz]; }); return r; }

// ---------- how complete a thing is: closer = more formed, in surges on the beat, not a smooth slide ----------
function distP(A, t) { const c = clock.camAt(t), d = Math.hypot(A.mesh.position.x - c.x, A.mesh.position.z - c.z); return clamp((A.far - d) / (A.far - A.near)); }
function pacedP(A, t) {
  if (A.owner?.done) return 1;
  if (A.revealAt != null) { const n = A.revealBeats; if (t <= A.revealAt) return 0; const i0 = beatIndex(A.revealAt), i = beatIndex(t), k = i - i0; if (k >= n) return 1; return (k + surge(beatPhase(t))) / n; }
  const i = beatIndex(t), a = beatAt(i), b = beatAt(i + 1), p0 = distP(A, a), p1 = distP(A, b); return lerp(p0, p1, surge(beatPhase(t)));
}

// ---------- upright canvas sheets, for things painted by code ----------
export const THINGS = [];
export function thing(x, z, wU, hU, pxPerU, paint, o = {}) {
  const c = document.createElement('canvas'); c.width = Math.round(wU * pxPerU); c.height = Math.round(hU * pxPerU);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wU, hU), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: o.fog !== false }));
  mesh.position.set(x, (o.y0 || 0) + hU / 2, z); scene.add(mesh);
  const T = { c, cx: c.getContext('2d'), tex, mesh, paint, far: o.far ?? 22, near: o.near ?? 8, live: !!o.live, last: -1, turn: o.turn !== false, owner: o.owner };
  THINGS.push(T); return T;
}
export function updateThings(time) { const cz = camera.position.z, cx = camera.position.x;
  for (const T of THINGS) { const p = pacedP(T, time); T.mesh.visible = p > 0 && cz > T.mesh.position.z - 0.2;
    if (T.mesh.visible && T.turn) T.mesh.rotation.y = Math.atan2(cx - T.mesh.position.x, cz - T.mesh.position.z);
    if (T.mesh.visible && (T.live || Math.abs(p - T.last) > 0.004)) { T.cx.clearRect(0, 0, T.c.width, T.c.height); T.paint(T.cx, p, time); T.tex.needsUpdate = true; T.last = p; } } }

// ---------- generated line art: R = line, G = draw order, B = silhouette. Revealed by a threshold, so it draws itself. ----------
export const META = {}, TX = {};
const loader = new THREE.TextureLoader();
export async function loadArtDir(dir, prefix) { const r = await fetch(`${dir}/art.json`); if (!r.ok) return []; const m = await r.json();
  await Promise.all(Object.keys(m).map(async n => { const t = await loader.loadAsync(`${dir}/${n}.png`); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8; TX[prefix + n] = t; META[prefix + n] = m[n]; })); return Object.keys(m); }
const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
const FS = `varying vec2 vUv; uniform sampler2D map, map2; uniform float uP, uA, uN, uFog, uSil, uMix, uGain, uFill, uThin;
const vec3 NIGHTC = vec3(12.,10.,8.)/255., GOLDC = vec3(240.,212.,168.)/255., REDC = vec3(200.,69.,60.)/255.;
vec2 lineOf(vec4 t){ float v = 1.0 - smoothstep(uP - 0.006, uP + 0.002, t.g); if (uP >= 1.0) v = 1.0; float tip = uP < 1.0 ? smoothstep(uP - 0.05, uP, t.g) * v : 0.0; float r = mix(t.r, smoothstep(0.5, 0.98, t.r), uThin); return vec2(r * v, r * tip); }
void main(){ vec4 a = texture2D(map, vUv), b = texture2D(map2, vUv); vec2 la = lineOf(a), lb = lineOf(b);
  float line = clamp(mix(la.x, lb.x, uMix) * uGain, 0.0, 1.0), tip = mix(la.y, lb.y, uMix), sil = mix(a.b, b.b, uMix) * uSil * clamp(uP * 3.0, 0.0, 1.0);
  float al = max(line, sil); if (al < 0.004) discard;
  vec3 col = mix(NIGHTC, GOLDC + tip * 0.25, clamp(line / max(al, 0.001), 0.0, 1.0));
  if (uFill > 0.0 && vUv.y < uFill && vUv.y > 0.05 && abs(vUv.x - 0.5) < 0.36 + vUv.y * 0.1 && line < 0.5) { col = REDC; al = 0.92; }
  gl_FragColor = vec4(col, al * uA * uN * (1.0 - uFog)); }`;
export const ARTS = [];
export function art(key, x, z, hU, o = {}) {
  if (!META[key]) throw new Error('no such art: ' + key);
  const wU = hU * META[key].aspect;
  const mat = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
    uniforms: { map: { value: TX[key] }, map2: { value: TX[o.map2 || key] }, uP: { value: 0 }, uA: { value: 1 }, uN: { value: 1 }, uFog: { value: 0 }, uSil: { value: o.sil ?? 0.9 }, uMix: { value: 0 }, uGain: { value: o.gain ?? 1.15 }, uFill: { value: 0 }, uThin: { value: 0 } } });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wU, hU), mat); if (o.flip) mesh.scale.x = -1;
  mesh.position.set(x, (o.y0 || 0) + hU / 2, z); scene.add(mesh);
  const A = { mesh, mat, u: mat.uniforms, hU, wU, gain: o.gain ?? 1.15, far: o.far ?? 22, near: o.near ?? 8, fixed: o.drawn === true, turn: o.turn !== false, fog: o.fog !== false, fadeNear: o.fadeNear !== false, owner: o.owner, revealAt: o.revealAt, revealBeats: o.revealBeats ?? 4, show: true };
  ARTS.push(A); return A;
}
export function updateArts(time) { const cz = camera.position.z, cx = camera.position.x, fg = scene.fog, pl = pulse(time), gtr = hit('guitar', time);
  for (const A of ARTS) { const m = A.mesh, zz = m.position.z, xx = m.position.x, d = Math.hypot(xx - cx, zz - cz), p = A.fixed ? 1 : pacedP(A, time);
    A.u.uP.value = p; const n = A.fadeNear ? clamp((d - A.hU * 0.9) / (A.hU * 0.7 + 0.6)) : 1; A.u.uN.value = n;
    m.visible = p > 0 && cz > zz + 0.2 && A.u.uA.value > 0.003 && n > 0.003 && A.show !== false;
    if (!m.visible) continue;
    if (A.turn) m.rotation.y = Math.atan2(cx - xx, cz - zz);
    A.u.uFog.value = A.fog ? clamp((d - fg.near) / (fg.far - fg.near)) : 0;
    A.u.uThin.value = clamp((A.hU / Math.max(d, 0.5) * 1321 / A.u.map.value.image.height - 0.28) / 0.45);
    A.u.uGain.value = A.gain * (1 + (p < 1 ? 0.28 : 0.06) * pl + (p < 1 ? 0.55 : 0.1) * gtr); } }   // the line breathes on the beat, more while it is still forming

// ---------- people: a footfall on every beat, never a free-running sway ----------
export const bodyScale = (key, target) => target / META[key].bodyH;
export function gait(A, moving, t) { const ph = beatPhase(t), i = beatIndex(t), s = i % 2 ? 1 : -1, lift = Math.sin(ph * Math.PI); A.mesh.position.y = A.hU / 2 + (moving ? lift * 0.05 : 0); A.mesh.rotation.z = moving ? s * lift * 0.014 : 0; }

// ---------- hash-based ground stones, repeatable ----------
export const seedAt = n => { _seed = n; };
