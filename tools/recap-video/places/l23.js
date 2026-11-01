// Lesson 23 (short stop): not a bread of life. THE bread of life. Stalls of bread on both sides fall away, one a beat,
// until one loaf is left, and hands reach for it from every edge. One detail: the single loaf.
export default async function (P) {
  await P.loadArt();
  const stalls = [[-2.3, 7, 'stall2', 4.0, false], [2.5, 7.5, 'stall1', 4.6, true], [-3.3, 11, 'stall1', 5.0, false], [3.5, 11.5, 'stall2', 4.6, true], ];
  const gone = P.evs('stall gone', 1, 1, stalls.length, 1);   // farthest stalls first, one per beat, through bar 1
  const key = P.ev('key', 2, 1);                        // bar 2 beat 1: the last two go and the one loaf stands alone
  const L = P.beats(1), order = [2, 3, 0, 1];
  const A = stalls.map(([dx, d, n, h, flip]) => P.art(n, P.pathX(P.Z - d) + dx, P.Z - d, h, { flip, far: 24, near: 10, sil: 0.9 }));
  const lz = P.Z - 5.6, lx = P.pathX(lz), loaf = P.art('loaf', lx, lz, 0.95, { y0: 1.1, far: 22, near: 8, gain: 1.5, sil: 0.95, turn: false });
  const rock = P.art('s3', lx, lz + 0.02, 1.2, { far: 22, near: 8, sil: 0.95, turn: false });
  const light = P.glow(lx, 1.7, lz - 0.1, 7, 0);
  // hands from every edge, on beats after the key
  const H = [[-1, 1.75, 0.0], [1, 1.45, 0.0], [-1, 1.05, 0.28], [1, 2.1, -0.22]];
  const when = P.evs('hand', 2, 1, H.length, 1);
  const hands = H.map(([s, y, tilt], i) => { const a = P.art('reach', 0, lz + 0.2 + i * 0.03, 0.72, { drawn: true, flip: s > 0, gain: 1.4, sil: 0.9, turn: false, fadeNear: false }); a.mesh.rotation.z = s * tilt * -1 + (s > 0 ? 0 : 0); return { a, s, y, t0: when[i] }; });
  P.keep(loaf, { h: 2.6 });
  return { update(t) {
    A.forEach((a, i) => { const o = order.indexOf(i), g = gone[o]; a.u.uA.value = 1 - seg(t, g, g + L * 1.5); });
    light.material.opacity = 0.42 * seg(t, key, key + L * 3) * (1 + 0.15 * P.pulse(t));
    hands.forEach(({ a, s, y, t0 }) => { const u = P.smooth(clamp((t - t0) / (L * 3))); a.u.uA.value = clamp((t - t0) / (L * 1.5)); const w = a.mesh.geometry.parameters.width; a.mesh.position.set(lx + s * (lerp(2.5, 0.55, u) + w / 2), y, lz + 0.2); });
  } };
}
