// Lesson 12 (short stop): he took time to braid the whip; he deliberately reclaimed the one place outsiders could pray.
// Up close, calm hands finish a braid on the walk in. Then the aftermath ahead: tables over, coins on the floor, no one's face.
// One detail: in the cleared open floor, one outsider kneels. Nothing is thrown, nothing moves: it has already happened.
export default async function (P) {
  await P.loadArt();
  const Z = P.Z, cam = P.camera, L = P.beats(1), at = d => P.pathX(Z - d);
  const key = P.ev('key', 1, 1), wake = P.ev('aftermath', 0, 3), tugs = P.evs('braid tug', 0, 1, 4, 1);
  const hands = P.art('hands', 0, 0, 2.5, { drawn: true, turn: false, fog: false, fadeNear: false, gain: 1.6, sil: 0.5 });   // whole from the start: never hands without arms
  const OPT = { turn: false, fadeNear: false, gain: 1.45, sil: 0.92 };
  const portico = P.artAt('colonnade', at(26), Z - 26, 8.2, P.T.start, 4, { turn: false, fog: false, fadeNear: false, gain: 1.1, sil: 0.9 });
  const t1 = P.artAt('table', at(6) - 1.6, Z - 6, 1.75, wake, 2, { ...OPT, y0: -0.05 });
  const t2 = P.artAt('table2', at(7.6) + 2.15, Z - 7.6, 1.9, wake, 2, { ...OPT, y0: -0.05 });
  const KD = 7.4, KH = 3.7, kneeler = P.artAt('kneeler', at(KD), Z - KD, KH, key, 2, { ...OPT, gain: 1.6, sil: 0.95, y0: -0.04 });
  const warm = P.glow(at(KD), 1.5, Z - KD - 0.1, 5, 0), floor = P.pool(at(KD), Z - KD, 5, 3, 0);
  // coins lie where they fell, around the tables, never in the open floor where he kneels
  const coins = [], placed = []; for (let i = 0; i < 40 && coins.length < 16; i++) { const s = i % 3 === 2 ? 1 : -1, d = 3.8 + hash(i + 3.1) * 6, cx = at(d) + s * (0.9 + hash(i + 7.7) * 1.9), cz = Z - d, r = 0.05 + hash(i + 9.3) * 0.012;
    if (Math.abs(d - KD) < 1.4 && Math.abs(cx - at(KD)) < 1.3) continue;
    if (placed.some(([a, b]) => Math.hypot(a - cx, (b - cz) * 0.4) < 0.45)) continue; placed.push([cx, cz]);
    const pts = []; for (let k = 0; k <= 12; k++) { const a = k / 12 * 6.2832; pts.push([cx + r * 0.5 * Math.cos(a), cz + r * 0.5 * Math.sin(a)]); }
    coins.push(P.line(pts, r * 1.05, 0xf0d4a8, 0)); }
  P.keep(kneeler, { h: 4 });
  return { update(t) {
    const inK = seg(t, P.T.start, P.T.start + L), out = 1 - seg(t, P.T.leave, P.T.leave + L), wk = seg(t, wake, wake + L * 2);
    // the hands travel with you, off to the left edge; each beat a small pull on the braid; on the key they lower out of view
    const dirX = (P.pathX(cam.position.z - 12) - cam.position.x) / 12, D = 3, low = P.smooth(seg(t, key, key + L * 1.5));
    let tug = 0; for (const b of tugs) if (t >= b) tug = P.surge(clamp((t - b) / L)) - 1;
    hands.mesh.position.set(cam.position.x + dirX * D - 0.14, 1.62 - tug * 0.07 - low * 2.2, cam.position.z - D); hands.mesh.rotation.z = tug * 0.018;
    hands.u.uA.value = inK * (1 - seg(t, key + L * 0.7, key + L * 1.5));
    portico.u.uA.value = 0.5 * out; t1.u.uA.value = t2.u.uA.value = out;
    kneeler.u.uA.value = out; const k = seg(t, key, key + L * 2) * out;
    warm.material.opacity = k * (0.16 + 0.05 * P.listen('keys', t)); floor.material.opacity = k * 0.16;
    for (const c of coins) c.m.material.opacity = wk * out * 0.85;
  } };
}
