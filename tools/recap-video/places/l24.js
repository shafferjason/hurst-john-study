// Lesson 24 (full moment): many of his own followers walk away over a hard teaching. Jesus doesn't panic; he knew from the beginning.
// One detail: the still man with his open hand. You come up behind a crowd following him. One a beat they turn back and pass you. A few stay.
export default async function (P) {
  await P.loadArt();
  const Z = P.Z, cam = P.camera, L = P.beats(1), BACKS = ['p1', 'p3', 'p4', 'p2'], GOES = ['go1', 'go2'], B = 2;   // bar 2, not the loudest: the point is the long quiet hold after the last one goes
  const key = P.ev('key', B, 1), turns = P.evs('turns back', B - 2, 1, 9, 1), on = P.ev('he walks on', 4, 1);
  const HZ = Z - 6.6, HX = P.pathX(HZ) + 0.6, HH = 3.5;
  const he = P.walker('still', HX, HZ, false, HH, { fadeNear: false, sil: 0.8, gain: 1.6, fog: false, turn: false }), light = P.pool(HX, HZ + 0.4, 5, 3.2, 0);
  // the few who stay: close to him, shoulders tight, same road, same direction
  const stay = [['stay1', -1.5, 0.4, false], ['stay2', 1.45, 1.3, false], ['p1', -3.3, -1.5, true]].map(([a, dx, dz, flip]) => ({ A: P.walker(a, HX + dx, HZ + dz, flip, 3.15, { fadeNear: false, sil: 0.8, gain: 1.3, turn: false }), z: HZ + dz }));
  // the many: nearest turn first, so the road opens toward him. The last one, at his shoulder, turns on the key.
  const crowd = turns.map((t0, i) => { const s = i % 2 ? 1 : -1, z = Z - 1.2 - i / 8 * 4.8, off = i === 8 ? 0.9 : 1.5 + hash(i + 11) * 2.2, h = 2.9 + hash(i + 3) * 0.35, sp = 1.5 + hash(i + 8) * 0.2, o = { fadeNear: false, sil: 0.8, turn: false, gain: 1.25 };
    return { back: P.walker(BACKS[i % 4], 0, z, hash(i + 21) < 0.5, h, o), go: P.walker(GOES[i % 2], 0, z, s > 0, h, o), z, t0, sp, s, off }; });
  P.keep(he, { h: 4 });
  return { update(t) { const cz = cam.position.z, inK = seg(t, P.T.start, P.T.start + L * 3), outK = 1 - seg(t, on, on + L * 2), walk = Math.max(0, t - on) * 2.6, k = inK * outK;
    he.mesh.position.z = HZ - walk; P.gait(he, walk > 0, t); he.u.uA.value = k;
    light.position.z = HZ + 0.4 - walk; light.material.opacity = (0.14 + 0.05 * P.listen('keys', t)) * k;
    for (const S of stay) { S.A.mesh.position.z = S.z - walk; P.gait(S.A, walk > 0, t); S.A.u.uA.value = k; }
    for (const C of crowd) { const age = t - C.t0, r = seg(age, -L * 0.5, L * 0.5), z = C.z + Math.max(0, age) * C.sp, d = cz - z, x = P.pathX(z) + C.s * (C.off + 0.25 * P.smooth(clamp(age / (L * 6)))), near = clamp((d - 2.7) / 2.2) * (d > 0 ? 1 : 0);
      for (const A of [C.back, C.go]) { A.mesh.position.x = x; A.mesh.position.z = z; } P.gait(C.go, age > 0, t);
      C.back.u.uA.value = inK * near * (1 - r) * outK; C.go.u.uA.value = inK * near * r * outK; }
  } };
}
