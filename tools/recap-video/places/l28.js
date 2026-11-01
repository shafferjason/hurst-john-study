// Lesson 28 (full moment): Jesus neither condemns the woman nor excuses her.
// One detail: he stays stooped, marks in the dust, so the men can go unwatched. One at a time each sets his stone down and leaves. Only when they're gone does he stand and speak; only then she walks on.
export default async function (P) {
  await P.loadArt();
  const X = P.X, Z = P.Z, cam = P.camera, L = P.beats(1), FINGER = 0.32, STONE = 0.88;
  const key = P.ev('key', 3, 1), goes = P.ev('she walks on', 3, 3);
  const set = P.evs('stone set down', 0, 3, 4, 2), marks = P.evs('mark in the dust', 0, 2, 6, 2);
  // he stoops low and left; she stands just beyond him. Filled enough that the stones behind don't show through them.
  const HX = X - 1.05, HZ = Z - 5.4, stoop = P.art('stoop', HX, HZ, 2.3, { far: 32, near: 15, fadeNear: false, sil: 0.92, gain: 1.5 });
  const stand = P.walker('he', HX, HZ, false, 3.5, { fadeNear: false, sil: 0.92, gain: 1.5 });
  const WX = X + 0.75, WZ = Z - 6.2, woman = P.art('woman', WX, WZ, 3.2 / P.META[P.keyOf('woman')].bodyH, { far: 32, near: 15, fadeNear: false, sil: 0.92, gain: 1.45 });
  const walkW = P.walker('womanw', WX, WZ, false, 3.2, { fadeNear: false, sil: 0.92, gain: 1.45 });
  const warm = P.glow((HX + WX) / 2, 1.8, HZ - 0.4, 6, 0);
  // unreadable marks: thin separate scratches that never cross or make a letter, one every other beat, spreading from his finger
  const FX = HX + FINGER * 2.3 * P.META[P.keyOf('stoop')].aspect, FZ = HZ + 0.2;
  const SCR = [[0, 0.1], [-0.42, 0.2], [0.12, 0.42], [-0.8, 0.14], [-0.36, 0.56], [-1.1, 0.4]];
  const scratch = marks.map((t0, i) => { const [dx, dz] = SCR[i], ln = 0.26 + hash(i + 21) * 0.14, tilt = (hash(i + 11) - 0.5) * 1.6, bow = (hash(i + 31) - 0.5) * 0.03, pts = []; for (let k = 0; k < 7; k++) { const u = k / 6 - 0.5; pts.push([FX + dx + u * ln, FZ + dz + u * ln * tilt + bow * Math.sin(u * 6.28)]); } const r = P.line(pts, 0.016, 0xf0d4a8, 0.6); r.m.visible = false; return { r, t0 }; });
  // four men, two each side, turned away from us. Far ones go first. Each bends on his outer side, so his stone stays in view.
  const SPOT = [[-3.2, 12], [3.3, 12.5], [-2.5, 9], [2.35, 9]];
  const men = SPOT.map(([dx, d], i) => { const z = Z - d, x = X + dx, s = Math.sign(dx), flip = s < 0, h = 3.15;
    const hold = P.walker('mhold', x, z, s > 0, h, { sil: 0.5 }), bend = P.walker('mset', x, z, flip, h * 0.79, { sil: 0.5 }), go = P.walker('mgo', x, z, s < 0, h, { sil: 0.5 });
    const sx = x + s * (STONE - 0.5) * bend.hU * P.META[P.keyOf('mset')].aspect, stone = P.art(['s1', 's2', 's3'][i % 3], sx, z + 0.05, 0.4, { drawn: true, sil: 0.7, gain: 1.4, y0: 0.02 });
    return { hold, bend, go, stone, x, z, s, t0: set[i] }; });
  P.keep(stoop, { h: 3.6 });
  return { update(t) { const cz = cam.position.z, come = seg(t, P.T.start, P.T.arrive), out = 1 - seg(t, P.T.leave, P.T.end), near = a => clamp((cz - a - 2.4) / 2.6);
    const up = seg(t, key - L * 1.5, key); stoop.u.uA.value = come * (1 - up); stand.u.uA.value = come * up * clamp(out * 1.4) * near(HZ);
    const w = seg(t, goes - L * 0.5, goes + L * 0.5), wz = WZ - Math.max(0, t - goes) * 1.35, wx = lerp(WX, P.pathX(wz), clamp((WZ - wz) / 6));
    woman.u.uA.value = come * (1 - w) * near(WZ); walkW.mesh.position.x = wx; walkW.mesh.position.z = wz; P.gait(walkW, t > goes, t); walkW.u.uA.value = w * near(wz) * clamp(out * 3);
    warm.material.opacity = seg(t, key - L, key + L * 2) * out * (0.15 + 0.05 * P.listen('keys', t)); warm.visible = cz > HZ;
    for (const S of scratch) { S.r.m.visible = t > S.t0 && cz > FZ - 0.5; S.r.m.material.opacity = 0.6 * seg(t, S.t0, S.t0 + L * 0.3) * out; }
    for (const M of men) { const a0 = t - M.t0, b = seg(a0, -L * 1.5, -L * 0.75), g = seg(a0, L * 0.25, L * 0.75), age = Math.max(0, a0 - L * 0.25), gz = M.z + age * 0.75, gx = M.x + M.s * age * 2.3;
      M.hold.u.uA.value = come * (1 - b); M.bend.u.uA.value = come * b * (1 - g); M.go.mesh.position.x = gx; M.go.mesh.position.z = gz; P.gait(M.go, a0 > L * 0.25, t); M.go.u.uA.value = g * (1 - seg(age, L * 3, L * 4)) * near(gz);
      M.stone.u.uA.value = (a0 >= 0 ? 1 : 0) * near(M.z) * clamp(out * 1.3); }
  } };
}
