// Lesson 11 (full moment): water meant for ritual washing becomes the best wine, and far more than anyone needed.
// Six massive stone jars stand level, full, never moved. A servant dips a small ladle in the near one and fills the small cup in his other
// hand: a thin red arc, the only red. Others carry full cups away along the road; the jars stay full. Thin gold ripples on dry ground.
export default async function (P) {
  await P.loadArt();
  const RED = '#c8453c', X = P.X, Z = P.Z, L = P.beats(1), cam = P.camera;
  const lifts = P.ev('ladle lifts', 1, 1), over = P.ev('over the cup', 1, 3), pour = P.ev('pours', 1, 4), key = P.ev('key', 2, 1), stops = P.ev('stream ends', 2, 4), full = P.ev('cup full', 3, 1);
  const goes = P.evs('servant carries a cup away', 2, 2, 2, 3), ripples = P.evs('ripple', 2, 1, 6, 2);
  // positions as the stopped viewer sees them: side = right of the line of sight, d = distance ahead
  const n = Math.hypot(P.pathX(Z - 12) - X, 12), fx = (P.pathX(Z - 12) - X) / n, fz = -12 / n, at = (side, d) => ({ x: X + fx * d - fz * side, z: Z + fz * d + fx * side });
  // six jars: the near one with the servant, four receding down the far side of the road, one more across it, so every jar can be counted
  const near = at(0.62, 5.6), road = (dx, d) => ({ x: P.pathX(Z - d) + dx, z: Z - d }), J = [[near, 'jarb', 2.05], [at(-1.6, 5.8), 'jard', 2.1], [road(-1.6, 8.2), 'jarb', 2.0], [road(-1.5, 11.5), 'jard', 2.1], [road(-1.2, 16.5), 'jarb', 2.05], [road(1.1, 18), 'jard', 2.1]].map(([p, name, h], i) => {
    const a = P.art(name, p.x, p.z, h, { far: 32, near: 10, flip: i % 2 === 0 && i > 0, turn: false, sil: 0.97, gain: 1.4 }), w = h * P.META[P.keyOf(name)].aspect, oh = h * 0.166;
    // full to the brim: a faint still surface inside the lip
    const water = P.thing(p.x, p.z + 0.01, w * 0.77, oh, 160, (c, q) => { const W = c.canvas.width, H = c.canvas.height; c.globalAlpha = seg(q, 0.7, 1) * 0.14; c.fillStyle = '#f0d4a8'; c.beginPath(); c.ellipse(W / 2, H / 2, W / 2 - 3, H / 2 - 3, 0, 0, 7); c.fill(); }, { y0: h * 0.89 - oh / 2, far: 32, near: 10, turn: false });
    water.mesh.material.transparent = true; return { p, h, a, water };
  });
  // the servant: two registered drawings of one man, ladle in the jar and ladle over the cup. His plane is just behind the near jar, so the bowl is inside it; the jar's dark fill hides the road, and the bit of handle crossing the mouth is painted back on in front.
  const SH = 3.6 / P.META[P.keyOf('dip2')].bodyH, SW = SH * P.META[P.keyOf('dip2')].aspect, SY = -(1 - 0.9267) * SH, SX = near.x + (0.5 - 0.175) * SW, SZ = near.z - 0.12;
  const man = P.art('dip2', SX, SZ, SH, { map2: 'pour3', y0: SY, far: 32, near: 11, turn: false, fadeNear: false, sil: 0.85, gain: 1.35 });
  const HB = 0.4, handle = P.thing(near.x, near.z + 0.02, 0.14, HB, 300, c => { const W = c.canvas.width, H = c.canvas.height; c.strokeStyle = '#f0d4a8'; c.lineWidth = 3; for (const o of [-5, 5]) { c.beginPath(); c.moveTo(W / 2 + o, 0); c.lineTo(W / 2 + o + 1, H); c.stroke(); } }, { y0: 1.655, far: 32, near: 11, turn: false });
  handle.mesh.material.transparent = true;
  // wine, painted over the pouring drawing. Coordinates are fractions of that drawing, read off it.
  const U0 = 0.13, U1 = 0.28, V0 = 0.21, V1 = 0.4, PX = 340, lipU = 0.197, lipV = 0.262, cupU = 0.231, cupV = 0.352;
  const wine = P.thing(SX + ((U0 + U1) / 2 - 0.5) * SW, SZ + 0.02, (U1 - U0) * SW, (V1 - V0) * SH, PX, (c, p, t) => { if (t < over) return;
    const W = c.canvas.width, H = c.canvas.height, sx = u => (u - U0) / (U1 - U0) * W, sy = v => (v - V0) / (V1 - V0) * H; c.save(); c.fillStyle = c.strokeStyle = RED; c.lineCap = 'round';
    // a little in the ladle's bowl
    const inB = seg(t, over, pour) * (1 - seg(t, stops - L * 0.5, stops)); if (inB > 0) { c.globalAlpha = inB * 0.92; c.beginPath(); c.ellipse(sx(0.174), sy(0.246), 30 * W / 160 * 0.42, 8 * W / 160 * 0.42, 0.62, 0, 7); c.fill(); }
    // the stream: leaves the lip sideways and falls in a thin curve, then thins from the top when the ladle is empty
    const head = seg(t, pour, key, x => x), tail = seg(t, stops - L * 0.5, stops + L * 0.25, x => x); if (head > tail) { c.globalAlpha = 0.95; c.lineWidth = 3.8; c.beginPath();
      for (let k = 0; k <= 24; k++) { const s = lerp(tail, head, k / 24), u = lipU + (cupU - lipU) * (1.6 * Math.sqrt(s) - 0.6 * s), v = lipV + (cupV - lipV) * s; k ? c.lineTo(sx(u), sy(v)) : c.moveTo(sx(u), sy(v)); } c.stroke(); }
    // the cup fills
    const lvl = seg(t, key - L * 0.5, full, x => x); if (lvl > 0) { const v0 = 0.379, v = lerp(v0, 0.356, lvl), hw = q => lerp(0.0255, 0.03, (v0 - q) / (v0 - 0.356)); c.globalAlpha = 0.95; c.beginPath(); c.moveTo(sx(cupU - hw(v0)), sy(v0)); c.lineTo(sx(cupU + hw(v0)), sy(v0)); c.lineTo(sx(cupU + hw(v)), sy(v)); c.lineTo(sx(cupU - hw(v)), sy(v)); c.closePath(); c.fill(); c.beginPath(); c.ellipse(sx(cupU), sy(v), (U1 > 0 ? hw(v) : 0) / (U1 - U0) * W, 5, 0, 0, 7); c.fill(); }
    c.restore(); }, { y0: SY + (1 - V1) * SH, far: 32, near: 11, live: true, turn: false });
  wine.mesh.material.transparent = true;
  // other servants come out from behind him and carry full cups away along the road, from behind, each with a touch of red
  const BH = 3.3, SPEED = 1.6, starts = [0.35, 0.45], lane = [0.45, -0.3];
  const bearers = goes.map((t0, i) => { const b = P.walker('bearer', 0, Z - 9, true, BH, { turn: false, gain: 1.4, sil: 0.8, fadeNear: false }), s0 = at(starts[i], 7.9), w = b.wU * 0.1, h = w * 0.62;
    const dab = P.thing(0, 0, w, h, 90, c => { const W = c.canvas.width, H = c.canvas.height; c.fillStyle = RED; c.globalAlpha = 0.95; c.beginPath(); c.moveTo(W * 0.1, H * 0.25); c.lineTo(W * 0.9, H * 0.25); c.lineTo(W * 0.78, H * 0.95); c.lineTo(W * 0.22, H * 0.95); c.closePath(); c.fill(); c.beginPath(); c.ellipse(W / 2, H * 0.25, W * 0.4, H * 0.18, 0, 0, 7); c.fill(); }, { far: 1e6, near: 0, turn: false });
    dab.mesh.material.transparent = true; return { i, t0, b, s0, dab, h }; });
  const rings = ripples.map((t0, i) => ({ t0, r: P.ribbon(0xf0d4a8, 0, 120), ph: i * 1.7 })), RS = 1.9, lastT = P.T.end + P.beats(2);
  P.keep(J[0].a, { h: 3.2 });
  return { update(t) {
    const outK = 1 - seg(t, P.T.leave, P.T.leave + L), cx = cam.position.x, cz = cam.position.z;
    man.u.uMix.value = seg(t, lifts, over); man.u.uA.value = outK; handle.mesh.material.opacity = (1 - seg(t, lifts, lifts + L * 0.8)) * outK; wine.mesh.material.opacity = outK;
    for (const j of J) { const d = Math.hypot(j.p.x - cx, j.p.z - cz); j.water.mesh.material.opacity = clamp((d - 2.2) / 1.4) * (0.85 + 0.15 * P.listen('keys', t)); }
    for (const B of bearers) { const a0 = t - B.t0, on = a0 > 0 ? clamp(a0 / L) : 0, go = Math.max(a0, 0) * SPEED, k = P.smooth(clamp(go / 8)), z = B.s0.z - go, x = lerp(B.s0.x, P.pathX(z) + lane[B.i], k), al = on * outK;
      B.b.mesh.position.x = x; B.b.mesh.position.z = z; P.gait(B.b, a0 > 0, t); B.b.u.uA.value = al;
      B.dab.mesh.position.set(x - (0.925 - 0.5) * B.b.wU, B.b.mesh.position.y - B.b.hU / 2 + (1 - 0.288) * B.b.hU, z + 0.01); B.dab.mesh.material.opacity = al; B.dab.mesh.visible = al > 0.003 && B.dab.mesh.visible; }
    for (const R of rings) { const a0 = t - R.t0, m = R.r.m; if (a0 <= 0 || t > lastT) { m.visible = false; continue; } const rad = 0.9 + RS * a0, op = 0.38 * clamp(a0 / 0.5) * clamp((8.5 - rad) / 3.5); m.visible = op > 0.004; if (!m.visible) continue; m.material.opacity = op * (0.85 + 0.15 * P.listen('bass', t));
      R.r.set(v => { const a = v * Math.PI * 2, k = 1 + 0.012 * Math.sin(3 * a + R.ph), r1 = rad * k, r2 = (rad + 0.02) * k; return [near.x + Math.cos(a) * r1, near.z + Math.sin(a) * r1, near.x + Math.cos(a) * r2, near.z + Math.sin(a) * r2]; }); }
  } };
}
