// Lesson 10 (short stop): "come and see," passed from one ordinary person to the next. Up the road, a far figure from behind walks on; three
// ordinary men strung out behind him. Each stops, turns back and holds out a hand to the one behind, one per beat, nearest last: that one is
// holding it out to you. Then they go on, far to near, and you fall in behind the nearest. One detail: the nearest man's offered hand.
// The nearest man, when he turns, is in three-quarter view looking back at you with a quiet face; the others and the far figure stay from behind.
export default async function (P) {
  await P.loadArt();
  const Z = P.Z, L = P.beats(1), SP = 0.55, H = 3.3;
  const key = P.ev('key', 1, 1), turns = P.evs('turns back', 0, 3, 2, 1), goes = P.evs('goes on', 1, 2, 3, 1); turns.push(key);
  const FEET = { walk1: 0.533, turn1: 0.357, walk2: 0.524, turn2: 0.638, walk3: 0.534, turn3: 0.371 };   // where the feet sit in each drawing, so the two poses share one spot
  const men = [[3, 18, -1.55], [2, 11, 1.6], [1, 5, -1.05]].map(([n, d, off], i) => { const zs = Z - d, opt = { fadeNear: false, turn: false, sil: 0.5, gain: 1.6 };
    return { off, zs, stop: turns[i], back: goes[i], near: i === 2, walk: P.walker('walk' + n, 0, zs, false, H, opt), turn: P.walker('turn' + n, 0, zs, false, H, opt), kw: FEET['walk' + n], kt: FEET['turn' + n] }; });
  const HZ = Z - 27, he = P.walker('he', P.pathX(HZ), HZ, false, 3.1, { gain: 1.5 }), heLight = P.glow(P.pathX(HZ), 1.8, HZ - 0.2, 8, 0);
  const place = (A, kx, x, z) => { A.mesh.position.set(x + (0.5 - kx) * A.wU, A.hU / 2, z); };
  const near = men[2]; place(near.turn, near.kt, P.pathX(near.zs) + near.off, near.zs);
  P.keep(near.turn, { h: 4 });
  return { update(t) {
    const inK = seg(t, P.T.start, P.T.start + L * 2), out = 1 - seg(t, P.T.leave, P.T.leave + L * 2), camZ = P.camera.position.z;
    for (const m of men) { const moving = t < m.stop || t >= m.back + L;
      // walk until he stops, stand with the hand out, then go on. The nearest keeps your pace once you set off: you are in line behind him.
      const z = m.near && t >= P.T.leave ? camZ - (Z - 0.6 - m.zs) : m.zs + SP * Math.max(m.stop - t, 0) - SP * Math.max(t - m.back - L, 0), x = P.pathX(z) + m.off;
      const k = seg(t, m.stop - L * 0.25, m.stop + L * 0.35) * (1 - seg(t, m.back, m.back + L * 0.4));
      place(m.walk, m.kw, x, z); place(m.turn, m.kt, x, z - 0.01); P.gait(m.walk, moving, t); P.gait(m.turn, false, t);
      m.walk.u.uA.value = inK * out * (1 - k); m.turn.u.uA.value = inK * out * k; }
    const hz = HZ - SP * (t - key); he.mesh.position.set(P.pathX(hz), he.hU / 2, hz); P.gait(he, true, t); he.u.uA.value = inK * out * 0.9;
    heLight.position.set(P.pathX(hz), 1.8, hz - 0.2); heLight.material.opacity = inK * out * (0.16 + 0.05 * P.listen('keys', t));
  } };
}
