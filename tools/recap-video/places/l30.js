// Lesson 30 (full moment): "Before Abraham was, I am." The men who heard him understood, and picked up stones.
// One detail: one hand closing on one stone. Then fists holding stones rise on both sides of you, one a beat. Nothing is thrown. He is gone.
export default async function (P) {
  await P.loadArt();
  const X = P.X, Z = P.Z, cam = P.camera, L = P.beats(1), PEOPLE = ['p1', 'p3', 'p4'];
  const reach = P.ev('hand reaches', 1, 2), grab = P.ev('hand closes', 1, 4), up = P.ev('key', P.peak(2, 2), 1), gone = P.ev('he is gone', 3, 3);
  // loose stones you approach through
  for (let i = 0; i < 30; i++) { const s = i % 2 ? 1 : -1, z = Z + 6 - hash(i + 200) * 26, off = 0.9 + Math.pow(hash(i + 300), 1.2) * 6, sz = 0.22 + hash(i + 400) * 0.34; P.art(['s1', 's2', 's3'][i % 3], P.pathX(z) + s * off, z, sz, { far: 26, near: 12, flip: hash(i + 500) < 0.5, sil: 0.9, gain: 1.25 }); }
  // a few men far back: stand, bend, stone up, in time
  const mt = P.evs('man raises', 2, 2, 7, 1), men = mt.map((t0, i) => { const s = i % 2 ? 1 : -1, z = Z - 12 - i * 1.3 - hash(i + 7) * 0.7, off = 3.2 + hash(i + 70) * 2.4, x = P.pathX(z) + s * off, flip = hash(i + 33) < 0.5; return { stand: P.walker(PEOPLE[i % 3], x, z, flip, 2.9), bend: P.walker('b1', x, z, flip, 2.2), up: P.walker(i % 2 ? 'm1' : 'm2', x, z, flip, 3.55), t0 }; });
  // the fists: rising from below the frame, close, on both sides of you, leaving the middle open toward him
  const FIST = [[-1, 1.95, 5.6, 'fist1', 3.9, 6.4], [1, 2.1, 6.1, 'fist1', 3.75, 6.4], [-1, 1.8, 3.4, 'fist2', 2.7, 4], [1, 1.9, 3.9, 'fist2', 2.85, 4]];
  const ft = P.evs('fist rises', 2, 1, FIST.length, 1);
  const fists = FIST.map(([s, off, d, n, top, hU], i) => { const z = Z - d - 0.5, a = P.art(n, P.pathX(z) + s * off, z, hU, { drawn: true, flip: s > 0, fadeNear: false, fog: false, sil: 1, gain: 1.35, turn: false }); return { a, t0: ft[i], top, hU }; });
  // the one hand
  const HX = X + 0.42, HZ = Z - 4.4, HH = 1.75, picked = P.art('s1', HX - 0.34, HZ + 0.02, 0.42, { y0: 0.02, far: 24, near: 8, gain: 1.3, sil: 0.95 });
  const hero = P.art('h1', HX, HZ, HH, { drawn: true, map2: 'h2', fog: false, gain: 1.35, sil: 0.9, fadeNear: false }); hero.mesh.renderOrder = 8;
  // the calm one ahead, from behind, in the gap
  const CZ = Z - 21, CX = P.pathX(CZ), calmGlow = P.glow(CX, 1.8, CZ - 0.2, 8, 0.35), calm = P.walker('he', CX, CZ, true, 3.1); calm.fog = false;
  P.keep(fists[2].a, { h: 3.6 });
  return { update(t) { const cz = cam.position.z, leaveK = 1 - seg(t, P.T.leave, P.T.end);
    for (const M of men) { const d = cz - M.stand.mesh.position.z, a = clamp((30 - d) / 10) * (d > 0 ? 1 : 0) * leaveK, age = t - M.t0, b = seg(age, -L * 2, -L), r = seg(age, -L * 0.25, L * 0.25); M.stand.u.uA.value = a * (1 - b); M.bend.u.uA.value = a * b * (1 - r); M.up.u.uA.value = a * r; }
    for (const F of fists) { const u = clamp((t - F.t0) / (L * 1.6)), e = 1 - (1 - u) * (1 - u) * (1 - u), bob = 0.02 * P.pulse(t), y = lerp(-F.hU - 1.2, F.top - F.hU, e) + bob; F.a.mesh.position.y = y + F.hU / 2; F.a.u.uA.value = (t < F.t0 ? 0 : 1) * clamp((cz - F.a.mesh.position.z - 1.6) / 1.4); }
    hero.show = t > reach - L && t < up + L * 5; hero.u.uA.value = 1 - seg(t, up + L, up + L * 3); const off = [HX + 1.5, 4.9], down = [HX, HH / 2 - 0.14], upP = [HX + 0.3, 1.45];
    if (t < grab) { const u = P.smooth(clamp((t - reach) / (grab - reach))); hero.mesh.position.set(lerp(off[0], down[0], u), lerp(off[1], down[1], u), HZ); hero.u.uMix.value = 0; picked.show = true; }
    else { const u = P.smooth(clamp((t - up) / (L * 3))); hero.mesh.position.set(lerp(down[0], upP[0], u), lerp(down[1], upP[1], u), HZ); const k = seg(t, grab, grab + L * 0.4); hero.u.uMix.value = k; picked.show = k < 0.5; }
    const k = 1 - seg(t, gone, gone + L * 2), inn = clamp((Z + 26 - cz) / 14); calm.u.uA.value = inn * k; calmGlow.material.opacity = 0.35 * inn * k; calmGlow.visible = cz > CZ;
  } };
}
