// Lesson 22 (short stop): he did claim to be God, in two words from the burning bush. One detail: the line between them.
// The bush burns and every branch stays whole. A man stands from behind. On arrival a slow gold line (deliberate symbol) leaves the fire
// and comes to rest on the ground beside him. Nothing strikes him. No stones: Lesson 30 owns those.
export default async function (P) {
  await P.loadArt();
  const Z = P.Z, cam = P.camera, L = P.beats(1), cx = d => P.X + (P.pathX(Z - 12) - P.X) * d / 12;
  const key = P.ev('key', 1, 1), rest = P.ev('line settles', 1, 4);
  const BD = 9, BX = cx(BD) - 1.75, BZ = Z - BD, BH = 6.9;     // the frame is taller than the bush: its roots sit a fifth of the way up, so it goes below ground
  const bush = P.art('bush', BX, BZ, BH, { y0: -BH * 0.2, map2: 'bush2', far: 26, near: 11, gain: 1.5, sil: 0, fadeNear: false });
  const fire = P.glow(BX, 3.1, BZ - 0.1, 7.5, 0);
  const MD = 5, MZ = Z - MD, MX = cx(MD) + 1.1, man = P.walker('he', MX, MZ, false, 3.3, { fadeNear: false, sil: 0.4, gain: 1.5 });
  // the line, painted on a sheet at his depth from the fire's heart to the ground at his side
  const SW = 4.4, SH = 4.6, PX = 200, RX = cx(MD) + 0.24, sheet = P.thing(cx(MD), MZ + 0.05, SW, SH, PX, (c, p, t) => {
    const u = clamp((t - key) / (rest - key)); if (u <= 0) return;
    const sx = v => (v - cx(MD) + SW / 2) * PX, sy = y => (SH - y) * PX, A = [sx(BX * MD / BD + cx(MD) * (1 - MD / BD)), sy(2.45)], B = [sx(BX + 1.9), sy(3.0)], C = [sx(RX - 0.25), sy(1.7)], E = [sx(RX), sy(0.03)];
    const at = v => { const w = 1 - v; return [0, 1].map(i => w * w * w * A[i] + 3 * w * w * v * B[i] + 3 * w * v * v * C[i] + v * v * v * E[i]); }, N = 120, h = Math.max(1, Math.ceil(N * u));
    c.lineCap = 'round'; c.strokeStyle = '#f4d596'; c.shadowColor = '#e8b860'; c.shadowBlur = 16;
    for (let i = 0; i < h; i++) { const a = at(i / N * Math.min(1, u * N / h)), b = at((i + 1) / N * Math.min(1, u * N / h)), f = (i + 1) / h; c.globalAlpha = 0.45 + 0.55 * f; c.lineWidth = 2.5 + 3.5 * f; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
  }, { live: true, far: 1e6, near: 0, fog: false });
  sheet.mesh.material.opacity = 0;
  // where it rests: light on the ground and one thin ring
  const rest1 = P.pool(RX, MZ, 2.6, 2.6, 0), ring = P.ribbon(0xf4d596, 0, 48);
  ring.set(u => { const a = u * 6.283, r0 = 0.21, r1 = 0.228; return [RX + Math.cos(a) * r0, MZ + Math.sin(a) * r0, RX + Math.cos(a) * r1, MZ + Math.sin(a) * r1]; });
  P.keep(bush, { h: 5.2 });
  return { update(t) {
    const inK = seg(t, P.T.start, P.T.arrive), out = 1 - seg(t, P.T.leave, P.T.leave + L), k = inK * out, set = seg(t, rest, rest + L);
    bush.u.uA.value = k; bush.u.uMix.value = 0.5 - 0.5 * Math.cos(P.beatPhase(t) * 6.283);    // the flames move, the branches never do
    fire.material.opacity = k * (0.2 + 0.07 * P.listen('keys', t));
    man.u.uA.value = k; sheet.mesh.material.opacity = out * (1 - 0.45 * set);
    rest1.material.opacity = out * set * (0.34 + 0.08 * P.listen('keys', t)); ring.m.material.opacity = out * set * 0.5;
  } };
}
