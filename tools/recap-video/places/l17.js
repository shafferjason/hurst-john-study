// Lesson 17 (short stop): the father walks home on Jesus's word alone, and it isn't blind: God keeps his promises.
// One detail: you follow him from behind between small clay lamps already lit along both road edges, a record of promises kept, and they end where he is.
// Ahead is only the dark road and a far lamp-lit house. On the arrival beat his servants are out on the road; you pass him as the walk resumes.
export default async function (P) {
  await P.loadArt();
  const Z = P.Z, cam = P.camera, L = P.beats(1), SP = 0.72;
  const key = P.ev('key', 1, 1);
  const lamps = [[6.5, 1.3], [5, -1.3], [3.5, 1.3], [2, -1.3], [0.5, 1.3], [-1, -1.3], [-2.5, 1.3], [-4.4, -1.45], [-4.9, 1.3], [-5.6, -1.7], [-6.1, 1.4]].map(([dz, off]) => {
    const z = Z + dz, x = P.pathX(z) + off, h = 0.3, a = P.art('lamp', x, z, h, { flip: off < 0, sil: 0.5, gain: 1.6, far: 24, near: 7, fadeNear: false, turn: false });
    return { a, g: P.glow(x, h * 0.8, z + 0.02, 0.8, 0), z };
  });
  const HZ = Z - 38, HX = P.pathX(HZ) + 5.5;
  const house = P.art('house', HX, HZ, 3.8, { gain: 1.6, sil: 0.5, fog: false, far: 70, near: 40, turn: false });
  const lamp = P.glow(HX + 0.2, 1.9, HZ + 0.1, 5, 0);
  const manZ = t => Z - 5.7 - (t - P.T.arrive) * SP, manX = z => P.pathX(z) - 0.9;
  const man = P.walker('father', 0, Z - 5.7, false, 3.05, { fadeNear: false, turn: false, gain: 1.55, sil: 0.34 });
  const servZ = t => Z - 34 + (t - key) * 3.4;
  const serv = P.artAt('servants', 0, Z - 34, 3, key, 1, { gain: 1.55, sil: 0.85, fadeNear: false, fog: false, turn: false });
  P.keep(lamps[7].a, { h: 1.2 });
  return { update(t) {
    const inK = seg(t, P.T.start, P.T.arrive), out = 1 - seg(t, P.T.leave, P.T.leave + L * 2), cz = cam.position.z;
    const breath = 0.8 + 0.2 * P.listen('keys', t);
    lamps.forEach(s => { const near = clamp((cz - s.z - 0.6) / 1.2), k = clamp(inK * 3) * out * near; s.a.u.uA.value = k; s.g.material.opacity = 0.2 * breath * k; });
    house.u.uA.value = inK * out; lamp.material.opacity = 0.3 * breath * inK * out;
    const z = manZ(t), d = cz - z; man.mesh.position.set(manX(z), man.mesh.position.y, z); P.gait(man, true, t); man.u.uA.value = inK * out * clamp((d - 1.3) / 1.2);
    const sz = servZ(t); serv.mesh.position.set(P.pathX(sz) + 1, serv.mesh.position.y, sz); P.gait(serv, t > key, t); serv.u.uA.value = (t > key ? 1 : 0) * out;
  } };
}
