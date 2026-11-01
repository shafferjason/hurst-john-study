// Lesson 24 (full moment): many of his own followers walk away over a hard teaching. Jesus doesn't panic; he knew from the beginning.
// One detail: the still man with his open hand. He's ahead of you, so the ones leaving come toward you and past your shoulders, three-quarter, heads down, one a beat. A few stay, from behind, facing him.
// Leavers are one pose each from first sight to last, solid so they cover whoever's behind, in outer lanes so they never cross the ones who stay. They fade as they leave the frame, before they swell.
export default async function (P) {
  await P.loadArt();
  const Z = P.Z, cam = P.camera, L = P.beats(1), GOES = ['go1', 'go2', 'go3'], B = 2;   // bar 2, not the loudest: the point is the long quiet hold after the last one goes
  const key = P.ev('key', B, 1), turns = P.evs('turns back', B - 2, 1, 9, 1), on = P.ev('he walks on', 4, 1);
  const HZ = Z - 8.6, HX = P.pathX(HZ) + 0.6, HH = 3.7;
  const he = P.walker('still', HX, HZ, false, HH, { fadeNear: false, sil: 0.92, gain: 1.6, fog: false, turn: false }), light = P.pool(HX, HZ + 0.4, 5, 3.2, 0);
  // the few who stay: close to him, shoulders tight, backs to us, looking where he is
  const stay = [['stay1', -1.5, 0.4], ['stay2', 1.4, 0.3], ['stay3', -2.45, -0.5]].map(([a, dx, dz]) => ({ A: P.walker(a, HX + dx, HZ + dz, false, 3.15, { fadeNear: false, sil: 0.8, gain: 1.3, turn: false }), z: HZ + dz }));
  // the many: each comes away from around him, alternating sides, and leaves past one of your shoulders. Drawn stepping to screen-right, so the left side flips.
  const crowd = turns.map((t0, i) => { const s = i % 2 ? 1 : -1, h = 2.95 + hash(i + 3) * 0.25, o = { fadeNear: false, sil: 1, turn: false, gain: 1.3 };
    return { go: P.walker(GOES[i % 3], 0, HZ, s < 0, h, o), z0: HZ + 0.2 + hash(i + 11) * 0.8, t0, sp: 1.5 + hash(i + 8) * 0.15, s, w: hash(i + 5) * 24 }; });
  P.keep(he, { h: 4 });
  return { update(t) { const cz = cam.position.z, inK = seg(t, P.T.start, P.T.start + L * 3), outK = 1 - seg(t, on, on + L * 2), walk = Math.max(0, t - on) * 2.6, k = inK * outK;
    he.mesh.position.z = HZ - walk; P.gait(he, walk > 0, t); he.u.uA.value = k;
    light.position.z = HZ + 0.4 - walk; light.material.opacity = (0.14 + 0.05 * P.listen('keys', t)) * k;
    for (const S of stay) { S.A.mesh.position.z = S.z - walk; P.gait(S.A, walk > 0, t); S.A.u.uA.value = k; }
    for (const C of crowd) { const age = t - C.t0, z = C.z0 + Math.max(0, age) * C.sp, d = cz - z, gone = clamp((d - 3.0) / 1.0) * (d > 0 ? 1 : 0), px = (d > 7 ? 430 : d > 4.6 ? lerp(380, 430, (d - 4.6) / 2.4) : lerp(640, 380, clamp((d - 3) / 1.6))) + C.w, x = P.pathX(z) + C.s * px * Math.min(d, 9) / 1283;   // lane set in screen pixels so the face stays in frame until the last moment
     
      C.go.mesh.position.x = x; C.go.mesh.position.z = z; P.gait(C.go, age > 0, t);
      C.go.u.uA.value = seg(age, 0, L) * gone * outK; }
  } };
}
