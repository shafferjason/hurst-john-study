// Lesson 5 (short stop): the eternal Word, who is God, became flesh.
// One detail: under a whole sky (no one star), a newborn's hand around an adult finger. No stable, no animals, no manger.
export default async function (P) {
  await P.loadArt();
  const D = 5, Z = P.Z - D, cam = P.camera, L = P.beats(1), SKYD = 64;
  const key = P.ev('key', 1, 1), lit = P.evs('stars', 0, 1, 3, 1);          // the sky fills on the walk in, one beat at a time
  const sky = lit.map((t0, n) => ({ t0, A: P.thing(0, 0, 66, 48, 32, c => { const W = c.canvas.width, H = c.canvas.height;   // no star stands out
    for (let k = 0; k < 1800; k++) { const i = n * 5000 + k, x = hash(i + 0.31) * W, u = Math.pow(hash(i + 0.57), 0.8), band = Math.abs((u - 0.55) - (x / W - 0.5) * 0.7);
      if (hash(i + 0.83) > 0.35 + 0.65 * Math.exp(-band * band * 40)) continue;    // thicker along a faint diagonal band
      c.globalAlpha = (0.4 + 0.6 * hash(i + 0.11)) * clamp(u / 0.1); c.fillStyle = hash(i + 0.93) < 0.7 ? '#f0d4a8' : '#fff4e0'; c.beginPath(); c.arc(x, H * (1 - u), 1.5 + 1.7 * hash(i + 0.71), 0, 6.3); c.fill(); } }, { far: 1e6, near: 0, fog: false, turn: false }) }));
  sky.forEach(s => { s.A.mesh.renderOrder = -9; s.A.mesh.material.opacity = 0; });
  const x = P.X + (P.pathX(P.Z - 12) - P.X) * D / 12;                        // square in the middle of the view from where you stop
  const hold = P.artAt('hold', x + 0.25, Z, 2.75, key, 2, { y0: -0.1, gain: 1.5, sil: 0.92, fadeNear: false });
  const warm = P.glow(x - 0.1, 1.45, Z - 0.1, 5.5, 0);
  P.keep(hold, { h: 2.2 });
  return { update(t) {
    const out = 1 - seg(t, P.T.leave, P.T.leave + L), dirX = (P.pathX(cam.position.z - 12) - cam.position.x) / 12;
    sky.forEach(s => { s.A.mesh.position.set(cam.position.x + dirX * SKYD, 24, cam.position.z - SKYD); s.A.mesh.material.opacity = seg(t, s.t0, s.t0 + L * 0.7) * out * (0.86 + 0.14 * P.listen('swell', t)); });
    hold.u.uA.value = out; warm.material.opacity = seg(t, key, key + L * 2) * out * (0.16 + 0.05 * P.listen('keys', t));
  } };
}
