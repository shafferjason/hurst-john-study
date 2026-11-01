// Lesson 30 (full moment): "Before Abraham was, I am." The men who heard him understood, and picked up stones.
// Temple court, building stone lying about. He is there first, far off. One arm reaches down and takes up a stone; then raised arms on both
// sides of you and the men ahead, one a beat, all facing him. Nothing is thrown. He walks out through the crowd, and the raised stones are left around an empty place.
export default async function (P) {
  await P.loadArt();
  const X = P.X, Z = P.Z, cam = P.camera, L = P.beats(1), PEOPLE = ['p1', 'p3', 'p4'];
  const reach = P.ev('hand reaches', 1, 2), grab = P.ev('hand closes', 1, 4), up = P.ev('key', 2, 1), slip = P.ev('he slips out', 3, 1), gone = P.ev('he is gone', 4, 1);
  const inFar = t => seg(t, P.T.start, P.T.arrive), outK = t => 1 - seg(t, P.T.end - L, P.T.end);
  // the court: a colonnade far off, rough stone and a few squared blocks lying about
  const COLZ = Z - 42, COLH = 9, cols = [0].map(() => { const a = P.art('colonnade', P.pathX(COLZ), COLZ, COLH, { drawn: true, fog: false, sil: 1, gain: 0.85, fadeNear: false, turn: false }); a.mesh.renderOrder = -4; return a; });
  for (let i = 0; i < 20; i++) { const s = i % 2 ? 1 : -1, z = Z + 6 - hash(i + 200) * 22, off = 1.1 + Math.pow(hash(i + 300), 1.2) * 5.5, sz = 0.22 + hash(i + 400) * 0.3; P.art(['s1', 's2', 's3'][i % 3], P.pathX(z) + s * off, z, sz, { far: 26, near: 12, flip: hash(i + 500) < 0.5, sil: 0.9, gain: 1.25 }); }
  [[-1, 2.7, 1], [1, 3.4, 5], [-1, 4.4, 8], [1, 2.6, 10], [-1, 2.9, 16], [1, 4.6, -2]].forEach(([s, off, d], i) => { const z = Z - d; P.art('block1', P.pathX(z) + s * off, z, 0.62 + hash(i + 40) * 0.24, { far: 28, near: 11, flip: s > 0, sil: 1, gain: 1.15 }); });
  // the men ahead, backs to you, a gap down the middle toward him; two more stand behind him, and he leaves behind one of them
  const MEN = [[-2.5, 12.5], [2.3, 13], [-1.75, 15.5], [1.8, 16], [-3.9, 17], [3.8, 16.5], [-2.4, 24.5], [2.5, 25]];
  const mt = P.evs('man raises', 2, 2, MEN.length, 1), men = MEN.map(([o, d], i) => { const z = Z - d, x = P.pathX(z) + o, flip = o > 0; return { stand: P.walker(PEOPLE[i % 3], x, z, flip, 2.9), bend: P.walker('b1', x, z, flip, 2.2), up: P.walker(i % 2 ? 'm1' : 'man2', x, z, flip, 3.55), t0: mt[i], d }; });
  // raised arms, close, both sides of you, coming up from below the frame: the sleeve runs off the bottom. The middle stays open.
  const FIST = [[-1, 1.72, 5.9, 'arm1', 3.93, 6.6], [1, 1.9, 6.2, 'arm1', 3.72, 6.4], [-1, 1.37, 3.9, 'arm2', 1.52, 2.62], [1, 1.42, 4.0, 'arm2', 1.76, 2.88]];
  const ft = P.evs('arm rises', 2, 2, FIST.length, 1);
  const fists = FIST.map(([s, off, d, n, top, hU], i) => { const z = Z - d - 0.5, a = P.art(n, P.pathX(z) + s * off, z, hU, { drawn: true, flip: s > 0 === (n === 'arm1'), fadeNear: false, fog: false, sil: 1, gain: 1.35, turn: false }); return { a, t0: ft[i], top, hU }; });
  // the one arm: comes in from the right edge, closes on a stone on the ground, carries it up and out of frame
  const HZ = Z - 4.4, S = 2.4, SX = X + 1.05, RX = SX + 0.13 * S, RY = 0.38 * S;
  const picked = P.art('s1', SX, HZ + 0.02, 0.5, { y0: 0.01, far: 24, near: 8, gain: 1.3, sil: 0.95, fadeNear: false });
  const hero = P.art('reach1', RX, HZ, S, { drawn: true, map2: 'reach2', fog: false, gain: 1.4, sil: 0.95, fadeNear: false, turn: false }); hero.mesh.renderOrder = 8;
  // he, from behind, in the gap
  const CZ = Z - 20, CX = P.pathX(CZ), EZ = Z - 28, EX = P.pathX(Z - 24.5) - 2.4 + (P.pathX(Z - 24.5) - 2.4 - X) * 3.5 / 24.5;
  const calm = P.walker('he', CX, CZ, true, 3.1, { fadeNear: false }), calmGlow = P.glow(CX, 1.7, CZ - 0.2, 6, 0.26); calm.fog = false;
  P.keep(fists[2].a, { h: 3.6 });
  return { update(t) { const cz = cam.position.z, oK = outK(t);
    cols.forEach(a => a.u.uA.value = inFar(t) * oK * 0.75);
    for (const M of men) { const d = cz - M.stand.mesh.position.z, a = clamp((30 - d) / 10) * (d > 0 ? 1 : 0) * oK, age = t - M.t0, b = seg(age, -L * 1.5, -L * 0.6), r = seg(age, -L * 0.25, L * 0.25); M.stand.u.uA.value = a * (1 - b); M.bend.u.uA.value = a * b * (1 - r); M.up.u.uA.value = a * r; }
    for (const F of fists) { const u = clamp((t - F.t0) / (L * 1.6)), e = 1 - (1 - u) * (1 - u) * (1 - u), y = lerp(-F.hU - 1.2, F.top - F.hU, e) + 0.02 * P.pulse(t); F.a.mesh.position.y = y + F.hU / 2; F.a.u.uA.value = (t < F.t0 ? 0 : 1) * clamp((cz - F.a.mesh.position.z - 1.6) / 1.4); }
    hero.show = t > reach - L && t < up + L * 4; const k = seg(t, grab - L * 0.1, grab + L * 0.3); hero.u.uMix.value = k; picked.show = t < grab + L; picked.u.uA.value = 1 - k;
    const inU = 1 - P.smooth(clamp((t - reach) / (grab - reach))), upU = P.smooth(clamp((t - up) / (L * 3))); hero.mesh.position.set(RX + 1.3 * inU + 1.7 * upU, RY + 1.0 * inU + 1.1 * upU, HZ);
    const w = clamp((t - slip) / (gone - slip)), hz = lerp(CZ, EZ, w), hx = lerp(CX, EX, w), inn = clamp((Z + 30 - cz) / 12), k2 = 1 - seg(t, gone - L * 0.7, gone); calm.mesh.position.x = hx; calm.mesh.position.z = hz; P.gait(calm, t > slip && t < gone, t); calm.u.uA.value = inn * k2; calm.show = t < gone;
    calmGlow.position.set(hx, 1.7, hz - 0.2); calmGlow.material.opacity = 0.26 * inn * (1 - seg(t, slip, gone)); calmGlow.visible = cz > CZ && t < gone;
  } };
}
