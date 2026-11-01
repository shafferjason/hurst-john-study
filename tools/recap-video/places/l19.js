// Lesson 19 (short stop): whoever makes a thing says what it's for; healing on the Sabbath claimed the day as his.
// Two beats. The burden: a figure from behind lifts small added sacks off a bent man and sets them down (key).
// The claim: a bar later the man, upright, turns to face the figure, and dawn comes up low on the horizon directly behind the figure, who
// never moves. The day brightens from where he stands. No gesture, no halo: a wide soft glow with no outline, kept below his head.
export default async function (P) {
  await P.loadArt();
  const D = 6.5, Z = P.Z - D, cam = P.camera, L = P.beats(1), H = 5, Y0 = -0.8, SKYD = 64;
  const key = P.ev('key', 1, 1), up = P.ev('dawn behind him', 2, 1);
  const figX = P.X + (P.pathX(P.Z - 12) - P.X) * D / 12 - 0.2, x = figX + 0.875, o = { y0: Y0, gain: 1.5, sil: 0.6, fadeNear: false, turn: false };   // he stands on the road, centre screen
  const load = P.art('load', x, Z, H, { ...o, far: 26, near: 10 }), lift = P.art('lift', x, Z, H, { ...o, drawn: true }), free = P.art('free', x, Z, H, { ...o, drawn: true, sil: 0.78 });
  // two soft ellipses on the horizon, wide and low. A ray through the figure keeps them centred behind him.
  const SW = 70, SH = 24, PX = 20, dawn = P.thing(0, 0, SW, SH, PX, c => { const w = c.canvas.width, h = c.canvas.height;
    const blob = (rx, ry, a) => { c.save(); c.translate(w / 2, h / 2); c.scale(rx, ry); const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, `rgba(240,212,168,${a})`); g.addColorStop(0.45, `rgba(232,190,135,${a * 0.42})`); g.addColorStop(1, 'rgba(212,165,116,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, 6.3); c.fill(); c.restore(); };
    blob(680, 130, 0.5); blob(300, 40, 0.7); }, { far: 1e6, near: 0, fog: false, turn: false });
  dawn.mesh.renderOrder = 1; dawn.mesh.material.transparent = true; dawn.mesh.material.blending = 2;   // additive, drawn over far objects so nothing distant cuts dark marks in it, under the men
  [load, lift, free].forEach(a => { a.mesh.renderOrder = 2; });
  const lit = P.pool(figX, Z + 0.5, 18, 13, 0);
  P.keep(free, { h: 4.6, y: -0.74, x: P.X, z: Z });
  return { update(t) {
    const inK = seg(t, P.T.start, P.T.arrive), out = 1 - seg(t, P.T.leave, P.T.leave + L), a1 = seg(t, key, key + L), a2 = seg(t, up, up + L), day = P.smooth(seg(t, up, up + L * 3)), breath = 1.5 + 0.2 * P.hit('guitar', t);
    load.u.uA.value = (1 - a1) * inK * out; lift.u.uA.value = a1 * (1 - a2) * out; free.u.uA.value = a2 * out;
    load.u.uGain.value = lift.u.uGain.value = free.u.uGain.value = breath; free.u.uGain.value = breath + 0.25;
    const dist = Math.max(cam.position.z - Z, 1), sx = cam.position.x + (figX - cam.position.x) * SKYD / dist, sz = cam.position.z - SKYD;
    dawn.mesh.position.set(sx, 2.6 + day * 0.2, sz); dawn.mesh.material.opacity = (0.12 + 0.88 * day) * (0.92 + 0.08 * P.listen('swell', t)) * inK * out;
    lit.material.opacity = (0.04 + 0.3 * day + 0.04 * P.listen('keys', t)) * out;
  } };
}
