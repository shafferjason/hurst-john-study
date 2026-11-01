// Lesson 15 (full moment): told the crowds were going to Jesus, John the Baptist kept baptizing and called his joy complete.
// One detail: his lifted head. People pass your shoulders toward a far figure, a few stay in the water, and he keeps pouring, gladder as they go.
// The far figure only stands there: in the Gospel his disciples do the baptizing, so nothing ahead shows him baptizing.
export default async function (P) {
  await P.loadArt();
  const X = P.X, Z = P.Z, cam = P.camera, L = P.beats(1), PEOPLE = ['p1', 'p2', 'p3', 'p4', 'p5'];
  const key = P.ev('key', P.peak(3, 3), 1);
  const glad = t => seg(t, key - P.beats(2), key + P.beats(2));
  const RIVER = []; for (let i = 0; i < 6; i++) RIVER.push({ op: 0.22 + 0.2 * hash(i), r: P.ribbon(0xd4a574, 0.22 + 0.2 * hash(i), 90), x: X - 0.5 - i * 0.95 - hash(i + 2) * 0.4, ph: hash(i + 5) * 6.28 });
  const JX = X - 1.15, JZ = Z - 6.4, JH = 3.9, view = d => X + (P.pathX(Z - 12) - X) * d / 12;
  const john = P.art('john', JX, JZ, JH, { y0: -0.28, map2: 'johng', far: 26, near: 10, gain: 1.55, sil: 0.92, fadeNear: false });
  const jGlow = P.glow(JX, 2.1, JZ - 0.3, 7, 0);
  // the few who stay: one kneeling under his hand, two waiting behind him. They never move.
  const stay = [['w1', JX + 0.92, JZ + 0.05, 1.7, -0.35], ['w2', view(14) - 1.1, Z - 14, 2.5, -0.2], ['w3', view(18) - 2.4, Z - 18, 2.4, -0.2]].map(([n, x, z, h, y0]) => P.art(n, x, z, h, { y0, far: 26, near: 10, gain: 1.0, sil: 0.9, fadeNear: false }));
  // water falls from his cupped hand the whole time: a new drop on every beat, he never stops
  const drops = P.thing(JX, JZ + 0.02, JH * P.META.john.aspect, JH, 240, (c, p, t) => { if (p < 0.8) return; const W = c.canvas.width, H = c.canvas.height, hx = W * 0.79, hy = H * 0.52, ph = P.beatPhase(t);
    c.save(); c.strokeStyle = GOLD_HI; c.lineWidth = 1.8; c.lineCap = 'round'; c.shadowColor = 'rgba(240,212,168,.6)'; c.shadowBlur = 6;
    for (let k = 0; k < 3; k++) { const v = (k + ph) / 3, y0 = hy + v * H * 0.1, x0 = hx - 3 * k + 7; c.globalAlpha = (1 - v) * 0.9; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 - 1, y0 + 12); c.stroke(); } c.restore();
  }, { y0: -0.28, far: 26, near: 10, live: true });
  const HEZ = Z - 26, HEX = P.pathX(HEZ) + 1.9;
  const heGlow = P.glow(HEX, 1.8, HEZ - 0.2, 9, 0.22), he = P.walker('he', HEX, HEZ, false, 3.1, { gain: 1.5 }); he.fog = false;
  // people pass both shoulders; each one sets out on a beat
  const CROWD = { gain: 0.8, sil: 0.7 };
  const starts = P.evs('person sets out', 0, 1, 8, 2), paced = starts.map((t0, i) => { const s = i === 1 ? -1 : 1, off = 2.0 + hash(i + 1) * 2.0, ang = hash(i + 44) * 6.28, gr = 1.8 + hash(i + 2) * 3.2; return { A: P.walker(PEOPLE[i % 5], 0, 0, hash(i + 77) < 0.5, 2.8 + hash(i + 9) * 0.35, CROWD), s, off, t0, sp: 3.0 + hash(i + 3) * 0.6, z0: Z + 8 + hash(i + 5) * 3, gx: HEX + 0.8 + Math.abs(Math.cos(ang)) * gr * 1.1, gz: HEZ + 2 + Math.abs(Math.sin(ang)) * gr }; });
  const peelT = P.evs('leaves the river', 1, 3, 4, 3), peel = [[2.0, -9.5], [3.0, -10.6], [1.2, -11.8], [3.7, -12.4]].map(([dx, dz], i) => ({ A: P.walker(PEOPLE[(i * 2 + 1) % 5], X + dx, Z + dz, i % 2 === 1, 3.0, CROWD), x0: X + dx, z0: Z + dz, t0: peelT[i], sp: 2.8, gx: HEX + 1.3 + i * 1.2, gz: HEZ + 2.4 + i * 0.5 }));
  P.keep(john, { h: 4.0 });
  return { update(t) { const cz = cam.position.z, cx = cam.position.x, leaveK = 1 - seg(t, P.T.leave - L, P.T.leave + L), inK = seg(t, P.T.start, P.T.arrive);   // all gone one beat into the walk to the next place
    RIVER.forEach(R => R.r.set(u => { const z = Z + 22 - u * 62, x = R.x + 0.09 * Math.sin(z * 0.5 + R.ph + t * 0.7) + 0.03 * Math.sin(z * 1.3 + t * 0.9); return [x - 0.012, z, x + 0.012, z]; }));
    RIVER.forEach(R => { R.r.m.material.opacity = R.op * inK * leaveK; });
    for (const Q of paced) { const age = t - Q.t0, m = Q.A.mesh; if (age <= 0) { Q.A.u.uA.value = 0; continue; }
      const z = Math.max(Q.gz, Q.z0 - age * Q.sp), u = clamp((Q.z0 - z) / (Q.z0 - Q.gz)), bx = P.pathX(z) + Q.s * Q.off, x = lerp(bx, Q.gx, P.smooth(clamp((u - 0.45) / 0.55))); m.position.x = x; m.position.z = z; P.gait(Q.A, z > Q.gz + 0.01, t); Q.A.u.uA.value = (cz > z ? 1 : 0) * leaveK; }
    for (const Q of peel) { const age = Math.max(0, t - Q.t0), Ln = Math.hypot(Q.gx - Q.x0, Q.gz - Q.z0), u = clamp(age * Q.sp / Ln); Q.A.mesh.position.x = lerp(Q.x0, Q.gx, u); Q.A.mesh.position.z = lerp(Q.z0, Q.gz, u); P.gait(Q.A, u > 0 && u < 1, t); Q.A.u.uA.value = leaveK * clamp((Z + 18 - cz) / 8); }
    john.u.uMix.value = glad(t); const d = Math.hypot(JX - cx, JZ - cz), k = clamp((d - 3.6) / 2.4) * (cz > JZ ? 1 : 0) * leaveK; john.u.uA.value = k; stay.forEach(A => { A.u.uA.value = leaveK; }); jGlow.material.opacity = (0.09 + 0.03 * P.listen('keys', t)) * inK * leaveK; drops.mesh.material.transparent = true; drops.mesh.material.opacity = k;
    he.u.uA.value = clamp((Z + 34 - cz) / 12) * leaveK; heGlow.visible = cz > HEZ; heGlow.material.opacity = 0.22 * he.u.uA.value;
  } };
}
