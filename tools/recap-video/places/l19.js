// Lesson 19 (short stop): whoever makes a thing says what it's for; healing on the Sabbath claimed the day as his.
// Two beats. The burden: a figure from behind lifts small added parcels off a bent man and sets them down (key).
// The claim: a bar later the man, upright, turns to face the figure, and an ordinary sun comes up directly behind the figure, who
// never moves. The day brightens from where he stands. No gesture, no halo: the disc is far wider than he is and its rim clears his head.
export default async function (P) {
  await P.loadArt();
  const D = 6.5, Z = P.Z - D, cam = P.camera, L = P.beats(1), H = 5, Y0 = -0.8, SKYD = 64;
  const key = P.ev('key', 1, 1), up = P.ev('sun up behind him', 2, 1);
  const figX = P.X + (P.pathX(P.Z - 12) - P.X) * D / 12 - 0.2, x = figX + 0.875, o = { y0: Y0, gain: 1.5, sil: 0.6, fadeNear: false, turn: false };   // he stands on the road, centre screen
  const load = P.art('load', x, Z, H, { ...o, far: 26, near: 10 }), lift = P.art('lift', x, Z, H, { ...o, drawn: true }), free = P.art('free', x, Z, H, { ...o, drawn: true });
  // canvas bottom edge sits at eye height, so the horizon cuts the disc off. It only ever rises; a ray through the figure keeps it behind him.
  const SW = 40, SH = 16, PX = 20, R = 285, rise = t => -1.02 + 1.02 * P.smooth(seg(t, up, up + L * 3));   // below the horizon until its downbeat, only its glow before that
  const sun = P.thing(0, 0, SW, SH, PX, (c, p, t) => { const w = c.canvas.width, h = c.canvas.height, cy = h - rise(t) * R;
    c.fillStyle = '#f0d4a8'; c.globalAlpha = 0.07; c.beginPath(); c.arc(w / 2, cy, R, 0, 6.3); c.fill();
    c.strokeStyle = '#f0d4a8'; c.lineWidth = 3; c.globalAlpha = 0.9; c.beginPath(); c.arc(w / 2, cy, R, 0, 6.3); c.stroke(); c.globalAlpha = 1; }, { live: true, far: 1e6, near: 0, fog: false, turn: false });
  sun.mesh.renderOrder = -9; sun.mesh.material.transparent = true;
  const dawn = P.glow(0, 0, 0, 44, 0), lit = P.pool(figX, Z + 0.5, 18, 13, 0);
  P.keep(free, { h: 4.6, y: -0.74, x: P.X, z: Z });
  return { update(t) {
    const inK = seg(t, P.T.start, P.T.arrive), out = 1 - seg(t, P.T.leave, P.T.leave + L), a1 = seg(t, key, key + L), a2 = seg(t, up, up + L), day = seg(t, up, up + L * 3), breath = 1.5 + 0.2 * P.hit('guitar', t);
    load.u.uA.value = (1 - a1) * inK * out; lift.u.uA.value = a1 * (1 - a2) * out; free.u.uA.value = a2 * out;
    load.u.uGain.value = lift.u.uGain.value = free.u.uGain.value = breath;
    const dist = Math.max(cam.position.z - Z, 1), sx = cam.position.x + (figX - cam.position.x) * SKYD / dist, sz = cam.position.z - SKYD;
    sun.mesh.position.set(sx, 2.6 + SH / 2, sz); sun.mesh.material.opacity = inK * out;
    dawn.position.set(sx, 2.6, sz + 1); dawn.material.opacity = (0.1 + 0.32 * day + 0.05 * P.listen('swell', t)) * inK * out;
    lit.material.opacity = (0.04 + 0.3 * day + 0.04 * P.listen('keys', t)) * out;
  } };
}
