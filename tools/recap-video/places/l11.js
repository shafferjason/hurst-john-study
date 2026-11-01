// Lesson 11 (full moment): water meant for ritual washing becomes the best wine, and far more than anyone needed.
// Nothing tips. Six stone jars stand still, full to the brim, too heavy for anyone to lift. A servant's hand dips a small ladle and fills
// one small cup; the water turns on the way, red only in the stream and cup. The excess: the jars stay full, and quiet gold rings rise off
// their brims and spread across the ground past you. One detail: one small cup against six full jars.
export default async function (P) {
  await P.loadArt();
  const RED = '#c8453c', GOLD = '#f0d4a8', X = P.X, Z = P.Z, L = P.beats(1), ease = P.smooth;
  const comes = P.ev('hand comes', 0, 1), dips = P.ev('ladle dips', 0, 3), lifts = P.ev('ladle lifts', 1, 1), over = P.ev('over the cup', 1, 3), pour = P.ev('pours', 1, 4), key = P.ev('key', 2, 1), full = P.ev('cup full', 3, 1), leaves = P.ev('hand leaves', 3, 3);
  const when = P.evs('ring', 2, 3, 15, 1);
  // [side offset, distance, drawing, height]. Real jars: chest high, set on the ground, never moved.
  const J = [[1.55, 5.4, 'jar1', 2.35], [-1.9, 6, 'jar1', 2.35], [1.75, 8, 'jar2', 2.25], [-1.35, 8.6, 'jar2', 2.2], [1.2, 10.8, 'jar1', 2.3], [-0.95, 11.2, 'jar1', 2.3]].map(([dx, d, n, h], i) => {
    const z = Z - d, x = P.pathX(z) + dx, a = P.art(n, x, z, h, { far: 30, near: 9, flip: i % 2 === 1, turn: false, sil: 0.95 }), w = h * P.META[n].aspect * 0.62;
    // full to the brim: a still gold surface in the mouth of the jar
    P.thing(x, z + 0.02, w, 0.3, 200, (c, p) => { if (p < 0.75) return; const W = c.canvas.width, H = c.canvas.height; c.save(); c.globalAlpha = seg(p, 0.75, 1); c.fillStyle = 'rgba(240,212,168,0.55)'; c.shadowColor = 'rgba(240,212,168,0.8)'; c.shadowBlur = 8; c.beginPath(); c.ellipse(W / 2, H / 2, W / 2 - 6, H / 2 - 6, 0, 0, 7); c.fill(); c.restore(); }, { y0: h * 0.945 - 0.15, far: 30, near: 9, turn: false, live: true });
    return { x, z, h, r: w * 0.46, a };
  });
  const D = J[0], CX = P.pathX(Z - 4.6) - 0.42, CZ = Z - 4.6, CB = 0.6, CH = 0.36, CT = CB + CH;
  P.art('s1', CX, CZ + 0.02, 0.62, { far: 24, near: 8, sil: 0.95, turn: false });
  const cup = P.art('cup', CX, CZ + 0.06, CH, { y0: CB, far: 24, near: 8, gain: 1.5, turn: false, sil: 0.95 });
  // the ladle: its plane sits just behind the near jar's front, so the bowl really goes down inside the jar
  const LH = 0.95, LW = LH * P.META[P.keyOf('ladle')].aspect, BOWL = [-0.442 * LW, -0.3 * LH], LIP = [-0.5 * LW, -0.18 * LH], LZ = D.z - 0.05;
  const lad = P.art('ladle', 0, LZ, LH, { drawn: true, turn: false, gain: 1.35, sil: 0.92, fadeNear: false, y0: 0 });
  const POSES = [[comes, D.x + 1.9, 3.5], [dips, D.x + 0.05, D.h + 0.45], [dips + P.beats(1), D.x + 0.05, D.h - 0.42], [lifts, D.x + 0.05, D.h + 0.45], [over, CX + 0.16, 1.62], [leaves - P.beats(2), CX + 0.16, 1.62], [leaves, D.x + 1.9, 3.3]];
  const bowlAt = t => { let i = 0; while (i < POSES.length - 2 && t >= POSES[i + 1][0]) i++; const [a, x0, y0] = POSES[i], [b, x1, y1] = POSES[i + 1], u = ease(clamp((t - a) / Math.max(b - a, 1e-3))); return [lerp(x0, x1, u), lerp(y0, y1, u)]; };
  const tilt = t => 0.42 * seg(t, pour, pour + L) * (1 - seg(t, full, full + L));
  const lipAt = t => { const [bx, by] = bowlAt(t), th = tilt(t), c = Math.cos(th), s = Math.sin(th), rot = ([u, v]) => [u * c - v * s, u * s + v * c], b = rot(BOWL), l = rot(LIP), cx = bx - b[0], cy = by - b[1]; return { cx, cy, th, lip: [cx + l[0], cy + l[1]] }; };
  // the stream: water while it's in the ladle's hands, wine by the time it reaches the cup
  const SW = 1.6, SH = 2.2, SX = CX + 0.1, PX = 320;
  P.thing(SX, CZ + 0.1, SW, SH, PX, (c, p, t) => { if (t < pour || t > full) return; const toC = (x, y) => [(x - SX + SW / 2) * PX, (SH - y) * PX], a = toC(...lipAt(t).lip), b = toC(CX, CT - 0.04), ends = seg(t, full - L * 0.5, full), u = seg(t, pour, pour + L * 0.5, x => x), tk = seg(t, key - L, key);
    const pt = v => [lerp(a[0], b[0], Math.pow(v, 1.6)) + Math.sin(v * 9 + t * 8) * 1.4, lerp(a[1], b[1], v)], s1 = [], s2 = [], split = lerp(1.01, 0.12, tk); for (let k = 0; k <= 30; k++) { const v = lerp(ends, 1, k / 30) * u; if (v <= split) s1.push(pt(v)); if (v >= split) s2.push(pt(v)); }
    const w = 15 + 3 * P.hit('guitar', t); c.save(); c.lineCap = 'round'; c.lineWidth = w; c.shadowBlur = 10; c.shadowColor = 'rgba(240,212,168,0.6)'; c.strokeStyle = GOLD; c.beginPath(); s1.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke();
    if (s2.length > 1) { c.shadowColor = 'rgba(200,69,60,0.7)'; c.strokeStyle = RED; c.beginPath(); s2.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke(); } c.restore();
  }, { far: 24, near: 8, live: true, turn: false });
  // far more than needed: rings lift off the brims, one jar a beat, settle to the ground, and go on past you. Not a spill, a quiet excess.
  const SPEED = 1.9, rings = when.map((t0, i) => ({ t0, j: J[i % 6], r: P.ribbon(0xf0d4a8, 0, 120), ph: i * 1.7 })), lastT = P.T.end + P.beats(4);
  P.keep(J[0].a, { h: 3.2 }); P.keep(cup, { h: 1.5, x: J[0].x - 1.2, z: J[0].z + 0.5 });
  return { update(t) {
    const q = lipAt(t); lad.mesh.position.set(q.cx, q.cy, LZ); lad.mesh.rotation.z = q.th; lad.u.uA.value = seg(t, comes, comes + L) * (1 - seg(t, leaves - L, leaves));
    cup.u.uFill.value = t < key - L * 0.5 ? 0 : 0.82 * seg(t, key - L * 0.5, full, x => x);
    for (const R of rings) { const a0 = t - R.t0, m = R.r.m; if (a0 <= 0 || t > lastT) { m.visible = false; continue; } const rad = R.j.r + SPEED * a0, y = lerp(R.j.h * 0.945, 0.03, ease(clamp(a0 / (L * 2.2)))), op = 0.42 * clamp(a0 / 0.4) * clamp(1.1 - rad / 20); m.visible = op > 0.004; if (!m.visible) continue; m.position.y = y; m.material.opacity = op * (0.85 + 0.15 * P.listen('keys', t));
      R.r.set(v => { const a = v * Math.PI * 2, k = 1 + 0.012 * Math.sin(3 * a + R.ph), r1 = rad * k, r2 = (rad + 0.03) * k; return [R.j.x + Math.cos(a) * r1, R.j.z + Math.sin(a) * r1, R.j.x + Math.cos(a) * r2, R.j.z + Math.sin(a) * r2]; }); }
  } };
}
