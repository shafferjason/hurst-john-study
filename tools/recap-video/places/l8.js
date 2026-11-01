// Lesson 8 (short stop): every prophet was a shadow; the promise was always heading for Jesus. (picks-final entry 8, S = symbol)
// One detail: the prophets stand solid in low light, and their long shadows run ahead and meet at one far figure. The prophets
// stay: the line is a true reading, not a wrong guess Jesus replaced. The road itself runs between the shadows, never over them.
export default async function (P) {
  await P.loadArt();
  const FD = 27, fz = P.Z - FD, fx = P.pathX(fz), L = P.beats(1);
  const key = P.ev('key', 1, 1), reach = [...P.evs('shadow reaches him', 0, 2, 4, 1), key];   // one a beat on the walk in; the two nearest land on the arrival key
  const row = [[17, -3.6, 'pr3', false, 3.5], [15, 1.58, 'pr2', true, 3.5], [8.5, -2.45, 'pr2', false, 3.6], [6, 1.72, 'pr1', false, 3.7], [-1, -2.3, 'pr3', true, 3.6]];
  const light = P.pool(P.pathX(P.Z - 11), P.Z - 11, 26, 58, 0), warm = P.pool(fx, fz, 9, 9, 0), behind = P.glow(fx, 1.1, fz - 0.2, 9, 0);
  const he = P.walker('he', fx, fz, false, 3.9, { sil: 1, gain: 1.6, fog: false, fadeNear: false });
  const prophets = row.map(([d, off, n, flip, h], i) => {
    const z = P.Z - d, x = P.pathX(z) + off, a = P.walker(n, x, z, flip, h, { drawn: false, far: 30, near: 11, sil: 1, gain: 1.4, fog: false, fadeNear: d < 0 });
    const s = P.ribbon(0x060504, 0.94, 32); s.m.material.blending = 1; s.m.renderOrder = -3;     // 1 = normal blending: a shadow darkens the lit ground
    const tx = fx + Math.sign(off) * (0.28 - i * 0.03), W = 0.95;
    const prof = u => (0.42 + 0.58 * Math.sin(Math.min(u / 0.55, 1) * 1.57)) * (u < 0.55 ? 1 : 1 - 0.9 * (u - 0.55) / 0.45);   // feet, shoulders, then a long taper
    return { a, s, g: reach[i], paint(len) { s.set(u => { const q = u * len, cx = lerp(x, tx, q), cz = lerp(z, fz, q), w = W * prof(u) * (1 - 0.55 * q) * (u > 0.97 ? (1 - u) / 0.03 : 1); return [cx - w / 2, cz, cx + w / 2, cz]; }); } };
  });
  P.keep(he, { h: 4 });
  return { update(t) {
    const on = seg(t, P.T.start, P.T.arrive) * (1 - seg(t, P.T.leave, P.T.leave + L)), k = seg(t, key, key + L * 2);
    light.material.opacity = on * (0.46 + 0.05 * P.listen('keys', t));
    warm.material.opacity = on * (0.2 + 0.65 * k); behind.material.opacity = on * (0.05 + 0.3 * k);
    he.u.uA.value = on;
    prophets.forEach(p => { p.a.u.uA.value = on; p.s.m.material.opacity = 0.94 * on; if (on > 0) p.paint(0.08 + 0.92 * P.smooth(clamp((t - p.g + P.beats(3)) / P.beats(3)))); });
  } };
}
