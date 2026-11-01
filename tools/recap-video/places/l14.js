// Lesson 14 (short stop, S): the cross stands on its own. A man braces it with short stakes, one per beat; they slide off one per beat
// and it never moves. Then, in the pool in front, someone comes up glad, and the pool stays: being baptized still matters, it just isn't holding up the cross.
export default async function (P) {
  await P.loadArt();
  const L = P.beats(1), cam = P.camera, CD = 10, WD = 5.2, CZ = P.Z - CD, WZ = P.Z - WD;
  const mid = d => P.X + (P.pathX(P.Z - 12) - P.X) * d / 12, CX = mid(CD) - 0.25, WX = mid(WD) + 0.35, RX = WX + 0.55;
  const sets = P.evs('stake set', 0, 2, 3, 1), key = P.ev('key', 1, 1), rest = P.evs('stake slides', 1, 2, 2, 1), up = P.ev('comes up', 2, 1);
  const falls = [key, ...rest];
  const cross = P.art('cross', CX, CZ, 4.8, { turn: false, far: 34, near: 13, gain: 1.6, sil: 0.3, fadeNear: false });
  const water = P.art('water', WX, WZ, 1.85, { y0: -0.54, turn: false, far: 26, near: 9, gain: 1.7, sil: 0, fadeNear: false });
  const setter = P.walker('setter', CX - 1.6, CZ + 0.1, false, 3, { turn: false, gain: 1.6, sil: 0.5, fadeNear: false });
  const riser = P.artAt('riser', RX, WZ - 0.05, 1.5 / P.META['l14/riser'].bodyH, up, 2, { y0: 0.3, turn: false, gain: 1.6, sil: 0.65, fadeNear: false });
  // shortest slides first, the longest last. Foot on the ground, top against the post, so it can only go one way.
  const stakes = [[1.4, 36], [1.8, 30], [2.2, 24]].map(([len, th], i) => { const A = P.art('prop', CX, CZ + 0.2 - i * 0.02, len, { drawn: true, turn: false, gain: 1.7, sil: 0.7, fadeNear: false }); A.mesh.scale.x = 0.6; return { A, len, th, set: sets[i], fall: falls[i], t: A.wU * 0.3 }; });
  const base = riser.mesh.position.y;
  P.keep(cross, { h: 3.6 });
  return { update(t) {
    const inK = seg(t, P.T.start, P.T.start + L * 2), out = 1 - seg(t, P.T.leave, P.T.leave + L), k = inK * out, top = CX - 0.28;
    cross.u.uA.value = k; water.u.uA.value = k;
    stakes.forEach(s => { const u = seg(t, s.fall, s.fall + L * 1.7), lean = s.th + (88 - s.th) * u * u + 9 * (1 - P.smooth(seg(t, s.set, s.set + L * 0.5))), a = lean * Math.PI / 180;
      s.A.mesh.rotation.z = -a; s.A.mesh.position.x = top - s.len * Math.sin(a) / 2; s.A.mesh.position.y = s.len * Math.cos(a) / 2 + s.t * Math.sin(a) / 2; s.A.u.uA.value = seg(t, s.set, s.set + L * 0.5) * out; });
    // he steps back once the first stake goes, and the eye moves on from him
    const back = P.smooth(seg(t, key, key + L * 2)); setter.mesh.position.x = CX - 1.6 - back * 0.7; P.gait(setter, t > key && t < key + L * 2, t); setter.u.uA.value = k * (1 - 0.35 * seg(t, up, up + L * 2));
    riser.mesh.position.y = base - 0.5 * (1 - P.smooth(seg(t, up, up + L * 2.5))); riser.u.uA.value = out;
  } };
}
