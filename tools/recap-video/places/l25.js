// Lesson 25 (short stop): even his brothers told him to go prove himself; he went on his own clock, without a show.
// Two brothers point at the festival crowd, which streams on up the road, and they go with it. On the empty road, later,
// one figure from behind passes your shoulder and walks on, unhurried. One detail: him, alone on the road, in plain view.
export default async function (P) {
  await P.loadArt();
  const Z = P.Z, L = P.beats(1), BZ = Z - 6;
  const key = P.ev('key', 2, 1), going = P.ev('crowd and brothers go', 1, 2), he0 = P.ev('he comes past your shoulder', 1, 4);
  const crowd = P.art('pilgrims', 0, Z - 13, 4.2, { drawn: true, turn: false, gain: 1.35, sil: 0.8, fadeNear: false });
  const brothers = P.art('brothers', P.pathX(BZ) + 1.15, BZ, 3.3, { far: 24, near: 10, turn: false, gain: 1.45, sil: 0.7, fadeNear: false });
  const he = P.walker('he', 0, Z - 3, false, 3.1, { turn: false, gain: 1.6, sil: 0.75, fog: false, fadeNear: false });
  const light = P.glow(P.X, 1.7, Z - 5, 7, 0);
  const heZ = t => Z - 3.4 - (t - key) * 1.05;
  P.keep(he, { h: 4, x: P.X, z: Z - 6 });
  return { update(t) {
    const inK = seg(t, P.T.start, P.T.arrive), out = 1 - seg(t, P.T.leave, P.T.leave + L), gone = 1 - seg(t, going, going + L * 3);
    const cz = Z - 13 - (t - P.T.start) * 1.5;   // they keep walking the whole time, so they shrink up the road
    crowd.mesh.position.set(P.pathX(cz) - 1.6, crowd.hU / 2 + 0.03 * Math.abs(Math.sin(P.beatPhase(t) * Math.PI)), cz); crowd.u.uA.value = inK * gone * 0.95;
    brothers.u.uA.value = gone;
    const z = heZ(t), k = seg(t, he0, key + L * 2);
    he.mesh.position.z = z; he.mesh.position.x = P.pathX(z) + lerp(-1.75, -0.1, P.smooth(k)); P.gait(he, true, t);
    he.u.uA.value = seg(t, he0, he0 + L) * out;
    light.position.set(he.mesh.position.x, 1.7, z - 0.1); light.material.opacity = seg(t, key, key + L * 2) * out * (0.16 + 0.05 * P.listen('keys', t));
  } };
}
