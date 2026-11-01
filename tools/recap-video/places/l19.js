// Lesson 19 (short stop): whoever makes a thing says what it's for; healing on the Sabbath claimed the day as his.
// One detail: on an open morning a man is bent under a heap of small added parcels. A figure from behind lifts them off and sets
// them down; the man stands up. The sun keeps rising the whole time. No bars, no gates, nothing thrown.
export default async function (P) {
  await P.loadArt();
  const D = 6.5, Z = P.Z - D, cam = P.camera, L = P.beats(1), H = 5.3, Y0 = -0.85, SKYD = 64;
  const key = P.ev('key', 1, 1), up = P.ev('he stands', 2, 1);
  const x = P.X + (P.pathX(P.Z - 12) - P.X) * D / 12 + 0.25, o = { y0: Y0, gain: 1.5, sil: 0.6, fadeNear: false, turn: false };   // nudged so the road runs in the gap between the men
  const load = P.art('load', x, Z, H, { ...o, far: 26, near: 10 }), lift = P.art('lift', x, Z, H, { ...o, drawn: true }), free = P.art('free', x, Z, H, { ...o, drawn: true, sil: 0.3 });
  // the sun comes up over the horizon: canvas bottom edge sits at eye height, so the disc is cut off by the horizon
  const SW = 40, SH = 16, PX = 20, R = 130, sun = P.thing(0, 0, SW, SH, PX, (c, p, t) => { const w = c.canvas.width, h = c.canvas.height, cx = w / 2, cy = h - lerp(-R * 0.55, R * 0.55, seg(t, P.T.start, P.T.end));
    c.strokeStyle = '#f0d4a8'; c.lineCap = 'round'; c.lineWidth = 3; c.globalAlpha = 0.95; c.beginPath(); c.arc(cx, cy, R, 0, 6.3); c.stroke();
    c.lineWidth = 2; c.globalAlpha = 0.6; for (let k = 0; k < 13; k++) { const a = Math.PI * (k + 0.5) / 13 + Math.PI, r0 = R + 26, r1 = R + 58 + 26 * (k % 2); c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); c.stroke(); }
    c.globalAlpha = 1; }, { live: true, far: 1e6, near: 0, fog: false, turn: false });
  sun.mesh.renderOrder = -9; sun.mesh.material.transparent = true;
  const dawn = P.glow(0, 0, 0, 34, 0), lit = P.pool(x, Z + 1, 16, 12, 0);
  P.keep(free, { h: 4.6, y: -0.74, x: P.X, z: Z });
  return { update(t) {
    const inK = seg(t, P.T.start, P.T.arrive), out = 1 - seg(t, P.T.leave, P.T.leave + L), a1 = seg(t, key, key + L), a2 = seg(t, up, up + L), breath = 1.5 + 0.2 * P.hit('guitar', t);
    load.u.uA.value = (1 - a1) * inK * out; lift.u.uA.value = a1 * (1 - a2) * out; free.u.uA.value = a2 * out;
    load.u.uGain.value = lift.u.uGain.value = free.u.uGain.value = breath;
    const dirX = (P.pathX(cam.position.z - 12) - cam.position.x) / 12, sx = cam.position.x + dirX * SKYD, sz = cam.position.z - SKYD, day = seg(t, P.T.start, P.T.end);
    sun.mesh.position.set(sx, 2.6 + SH / 2, sz); sun.mesh.material.opacity = inK * out;
    dawn.position.set(sx, 8, sz + 1); dawn.material.opacity = (0.12 + 0.3 * day + 0.05 * P.listen('swell', t)) * inK * out;
    lit.material.opacity = (0.05 + 0.2 * a2 + 0.04 * P.listen('keys', t)) * out;
  } };
}
