// Lesson 4 (short stop): John says why he wrote, and the whole book builds that case.
// One detail: rough roadside stones along the road, lighting one after another toward a far gate. Deliberate symbol. No count is meant.
export default async function (P) {
  await P.loadArt();
  const D = [5.6, 12, 19, 26, 31, 35, 38.5, 41.5], WAVE = [0, 1, 2, 3, 4, 4, 5, 5];   // the far ones go together, too small to count
  const lit = P.evs('milestone lights', 0, 3, 6, 1), key = P.ev('key', 2, 1), L = P.beats(1);
  const stones = D.map((d, i) => { const z = P.Z - d, x = P.pathX(z) + (i ? 1.9 : 1.45), a = P.art(i % 2 ? 'rougha' : 'roughb', x, z, i % 3 === 1 ? 1.1 : 1.3, { far: d + 24, near: d + 8, sil: i < 2 ? 0.12 : 0.7, gain: 0.5, flip: i % 3 === 2, fadeNear: false }); return { a, g: P.glow(x, 0.6, z - 0.1, i < 4 ? 2.6 : 1.8, 0), op: i < 4 ? 0.36 : 0.14, t0: lit[WAVE[i]] }; });
  const GZ = P.Z - 46, GX = P.pathX(GZ), gate = P.art('gate', GX, GZ, 13.4, { far: 84, near: 54, sil: 1, gain: 0.6, fog: false, turn: false, fadeNear: false }), arch = P.glow(GX, 2.6, GZ + 0.2, 13, 0);
  P.keep(stones[0].a, { h: 3 });
  return { update(t) { const a = seg(t, P.T.start, P.T.arrive) * (1 - seg(t, P.T.leave, P.T.leave + P.beats(1))), keys = P.listen('keys', t);
    for (const s of stones) { const k = seg(t, s.t0, s.t0 + L * 0.6); s.a.u.uA.value = a; s.a.gain = lerp(0.5, 1.6, k); s.g.material.opacity = s.op * k * a * (1 + 0.2 * keys); }
    const k = seg(t, key, key + L * 1.5); gate.u.uA.value = a; gate.gain = lerp(0.6, 1.5, k); arch.material.opacity = 0.55 * k * a * (1 + 0.2 * keys);
  } };
}
