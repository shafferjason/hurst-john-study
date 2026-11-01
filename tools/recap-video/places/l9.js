// Lesson 9 (short stop): John didn't recognize the Messiah until the Spirit came down and stayed.
// One detail: the dove, come to rest on the shoulder of one ordinary man in the river, while the others wade off. It stays.
// He is drawn no differently from the others, on purpose. Seen only from behind.
export default async function (P) {
  await P.loadArt();
  const D = 5.4, Z = P.Z - D, L = P.beats(1), X = P.X + (P.pathX(P.Z - 12) - P.X) * D / 12, BODY = 3.6, ease = P.smooth;
  const down = P.ev('dove comes down', 0, 1), key = P.ev('key', 1, 1), go = P.evs('men wade off', 0, 3, 3, 1);
  const him = P.walker('him', X, Z, false, BODY, { fadeNear: false, turn: false, far: 26, near: 9, gain: 1.35, sil: 1 });
  const men = [['w1', true, -2.15, -2.2, 3.3, -0.5], ['w2', false, 2.0, -1.4, 3.5, 0.45], ['w3', false, -1.25, -6.5, 3.6, -0.2]].map(([n, flip, dx, dz, h, drift], i) =>
    ({ A: P.walker(n, X + dx, Z + dz, flip, h, { fadeNear: false, turn: false, far: 26, near: 9, gain: 1.15, sil: 0.8 }), x0: X + dx, z0: Z + dz, drift, t0: go[i] }));
  // one drawing throughout: slender, wings half open, and it stays that way, settled just over his shoulder.
  const DH = 0.82, SX = X + 0.54, SY = 2.47 + DH / 2, bird = P.art('settle2', SX, Z + 0.15, DH, { drawn: true, turn: false, gain: 1.45, sil: 0.8, fadeNear: false, fog: false });
  const warm = P.glow(SX, SY, Z + 0.1, 1.7, 0);
  const water = []; P.seedAt(9);
  for (let i = 0; i < 16; i++) { const z = Z - 0.4 - i * 0.8, c = P.pathX(z) + (hash(i + 0.3) - 0.5) * 12, w = 0.5 + hash(i + 0.6) * 1.1, ph = i * 2.1, pts = [];   // short wavering ripples, none nearer than him
    for (let k = 0; k <= 12; k++) { const v = k / 12; pts.push([c + (v - 0.5) * 2 * w, z + 0.05 * Math.sin(v * 9 + ph)]); } water.push(P.line(pts, 0.03, 0xd4a574, 0)); }
  P.keep(bird, { h: 1.7, x: P.X, z: Z });
  return { update(t) {
    const inK = seg(t, P.T.start, P.T.arrive), out = 1 - seg(t, P.T.leave, P.T.leave + L), a = inK * out;
    him.u.uA.value = a;
    for (const m of men) { const k = Math.max(t - m.t0, 0), moving = t > m.t0 && t < P.T.leave + L; m.A.mesh.position.z = m.z0 - k * 1.2; m.A.mesh.position.x = m.x0 + k * m.drift; P.gait(m.A, moving, t); m.A.u.uA.value = a * (1 - 0.6 * clamp(k / (L * 5))); }
    const u = clamp((t - down) / (key - down)), q = (1 - u) * (1 - u);   // slows as it comes in
    bird.mesh.position.set(SX + 3.2 * q, SY + 5.4 * q * q + 1.0 * q, Z + 0.15); bird.mesh.rotation.z = 0.18 * q;
    const b = 1 + 0.02 * P.pulse(t); bird.mesh.scale.set(1, b, 1);
    bird.u.uA.value = seg(t, down, down + L) * out;
    warm.material.opacity = seg(t, key, key + L * 2) * out * (0.07 + 0.02 * P.listen('keys', t));
    for (const w of water) w.m.material.opacity = a * (0.26 + 0.08 * P.listen('bass', t));
  } };
}
