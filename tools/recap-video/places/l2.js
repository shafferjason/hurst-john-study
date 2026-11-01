// Lesson 2 (short stop): written for us, not to us. A scroll on a roadside post; you stop and read it, line by line on the beat,
// while the man it was written for is already walking on with his lambs and birds, toward a far priest. One detail: the man going.
export default async function (P) {
  await P.loadArt();
  const Z = P.Z, cam = P.camera, L = P.beats(1), SZ = Z - 4.6, SX = P.pathX(SZ) - 1.05, H = 3.6, SP = 1.1;
  const key = P.ev('key', 1, 1), lines = P.evs('line of the scroll', 1, 1, 4, 1);
  const scroll = P.art('scroll', SX, SZ, H, { turn: false, far: 26, near: 9, gain: 1.5, sil: 0.95, fadeNear: false });
  // the writing: marks in rows, not letters. Each row comes up on its beat.
  const W = scroll.wU, ink = P.thing(SX, SZ + 0.02, W, H, 320, (c, p, t) => { const cw = c.canvas.width, ch = c.canvas.height, x0 = cw * 0.3, x1 = cw * 0.76, y0 = ch * 0.395, y1 = ch * 0.655, R = 8;
    c.strokeStyle = '#f0d4a8'; c.lineCap = 'round'; c.lineWidth = 4.2;
    for (let r = 0; r < R; r++) { const a = clamp((t - lines[Math.floor(r / 2)]) / (L * 0.5)); if (a <= 0) continue; c.globalAlpha = a * 0.85; const y = y0 + (y1 - y0) * r / (R - 1); let x = x0, k = r * 40 + 3; c.beginPath();
      while (x < x1 - 8 - hash(r + 9) * 22) { const w = 6 + hash(k) * 13; c.moveTo(x, y + (hash(k + 1) - 0.5) * 4); c.quadraticCurveTo(x + w / 2, y - 7 * hash(k + 2), x + w, y + (hash(k + 3) - 0.5) * 5); x += w + (hash(k + 4) < 0.28 ? 11 : 4); k += 5; } c.stroke(); }
    c.globalAlpha = 1; }, { turn: false, live: true, far: 26, near: 9 });
  const manAt = t => Z - 3.6 - (t - P.T.start) * SP;
  const man = P.walker('man', 0, Z - 6, false, 3.3, { fadeNear: false, turn: false, gain: 1.6, sil: 0.95 });
  const PZ = Z - 18, priest = P.walker('priest', P.pathX(PZ), PZ, false, 3.2, { gain: 1.5, turn: false });
  const light = P.glow(P.pathX(PZ), 1.7, PZ - 0.1, 7, 0);
  P.keep(man, { h: 3.6 });
  return { update(t) {
    const inK = seg(t, P.T.start, P.T.arrive), outK = 1 - seg(t, P.T.leave, P.T.leave + L), z = manAt(t);
    man.mesh.position.z = z; man.mesh.position.x = P.pathX(z) + lerp(-0.2, 1.8, P.smooth(inK)); P.gait(man, true, t); man.u.uA.value = inK * outK;
    const k = inK * outK * (cam.position.z > SZ + 1 ? 1 : 0); scroll.u.uA.value = k; ink.mesh.material.opacity = k; ink.mesh.material.transparent = true;
    priest.u.uA.value = 0.9 * seg(t, P.T.start, key) * outK; light.material.opacity = (0.16 + 0.05 * P.listen('keys', t)) * seg(t, P.T.start, key) * outK;
  } };
}
