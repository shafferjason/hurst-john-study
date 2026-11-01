// Lesson 18 (short stop): a man walks after 38 years, and all the leaders can see is the mat.
// One detail: the mat, swelled in a lens while the walking man fades. He is still walking when the lens leaves.
export default async function (P) {
  await P.loadArt();
  const D = 6, Z = P.Z - D, cam = P.camera;
  const key = P.ev('key', 1, 1), off = P.ev('lens leaves', 2, 3), L = P.beats(1);
  const man = P.walker('man', 0, Z, false, 3.6, { fadeNear: false });
  const lens = P.art('lens', 0, Z + 0.15, 3.2, { drawn: true, turn: false, gain: 1.4, sil: 0.0, fadeNear: false });
  const mat = P.art('mat', 0, Z + 0.1, 0.52, { drawn: true, turn: false, gain: 1.5, sil: 0.9, fadeNear: false });
  const manX = t => P.X - 0.9 + (t - P.T.arrive) * 0.3;
  P.keep(mat, { h: 2.4, x: P.X, z: Z });
  return { update(t) {
    const x = manX(t), inK = seg(t, key, key + L * 2), outK = seg(t, off, off + L * 2), k = inK * (1 - outK);
    man.mesh.position.x = x; P.gait(man, t < P.T.end, t); const d = cam.position.z - Z; man.u.uA.value = (1 - 0.86 * k) * seg(t, P.T.start, P.T.arrive) * (1 - seg(t, P.T.leave, P.T.leave + L)) * clamp((d - 1.8) / 1.6);
    const lx = x - 0.5, ly = 3.54;   // the lens stays on the mat as he walks
    lens.mesh.position.set(lx + 0.25 + (1 - k) * 2.6, ly - 1.09 - (1 - k) * 3.2, Z + 0.15); lens.u.uA.value = k;
    mat.mesh.position.set(lx, ly + 0.02, Z + 0.1); mat.u.uA.value = k * k; const s = 1 + 0.06 * P.pulse(t) * k; mat.mesh.scale.set(s, s, 1);
  } };
}
