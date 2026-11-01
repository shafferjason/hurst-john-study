// Lesson 31 (full moment, last before the close): suffering isn't a scoreboard; stop asking who sinned, ask what you'll do with it.
// One detail: the man who was sitting, washed and seeing, reaches down to someone else. Before that: hands point, Jesus stands beside him, they lower. No red.
export default async function (P) {
  await P.loadArt();
  const X = P.X, Z = P.Z, cam = P.camera, L = P.beats(1), lean = (P.pathX(Z - 12) - X) / 12, cx = d => X + lean * d, zd = d => Z - d, sq = (x, z) => x * x + z * z;
  const onL = P.ev('hand points', 0, 1), onR = P.ev('hand points', 0, 2), heStops = P.ev('he stands beside him', 0, 4), dnL = P.ev('hand lowers', 1, 1), dnR = P.ev('hand lowers', 1, 2);
  const rise = P.ev('he gets up', 1, 3), kneel = P.ev('he kneels', 2, 1), wet = P.evs('water', 2, 1, 2, 1), sees = P.ev('he sees', 2, 3), key = P.ev('key', 3, 1);
  // beside the road: the man sitting; Jesus comes up the road ahead of you, from behind, and stops beside him
  const SD = 10, SX = cx(SD) + 2.0, SZ = zd(SD), HX = SX + 1.35, HZ = SZ - 0.25, H0X = P.pathX(Z - 3), H0Z = Z - 3;
  const KD = 5.9, KX = cx(KD) + 0.35, KZ = zd(KD);
  const O = { fadeNear: false, sil: 0.9, gain: 1.4 };
  const sit = P.walker('sit', SX, SZ, false, 1.95, O), walk = P.walker('walk', SX, SZ, false, 3.35, O), wash = P.walker('wash', KX, KZ, false, 2.15, O), see = P.walker('see', KX, KZ, false, 2.6, O), reach = P.walker('reach', KX, KZ, false, 3.2, O);
  const other = P.walker('other', KX - 1.75, KZ + 0.02, false, 1.8, { ...O, gain: 1.3 });
  const he = P.walker('he', H0X, H0Z, false, 3.1, { fog: false, fadeNear: false }), heGlow = P.glow(HX, 1.8, HZ - 0.2, 6, 0);
  // the pool: a thin stone rim on the ground, a ring of water, nothing filled
  const PX = cx(5.05) - 0.1, PZ = zd(5.05), ring = (R, r, u, w) => { const a = u * 6.283, k = 1 + 0.035 * Math.sin(a * 3 + 1) + 0.02 * Math.sin(a * 7), x = PX + Math.cos(a) * R * k, z = PZ + Math.sin(a) * r * k, m = w / 2; return [x - Math.cos(a) * m, z - Math.sin(a) * m, x + Math.cos(a) * m, z + Math.sin(a) * m]; };
  const rim = P.ribbon(0xf0d4a8, 0, 120), water = P.ribbon(0xd4a574, 0, 120); rim.set(u => ring(1.65, 0.72, u, 0.026)); water.set(u => ring(1.38, 0.56, u, 0.016));
  const rocks = [[1.15, 0.72], [1.72, 0.2], [-1.75, 0.12]].map(([dx, dz], i) => P.art(['s1', 's2', 's3'][i % 3], PX + dx, PZ - dz, 0.24 + hash(i + 61) * 0.1, { far: 30, near: 14, sil: 0.7, gain: 1.15, flip: i % 2 === 1 }));
  const ripples = wet.map(t0 => ({ t0, r: P.ribbon(0xf0d4a8, 0, 80) })), lightUp = P.glow(KX - 0.2, 1.9, KZ - 0.1, 4.5, 0), lightDown = P.pool(KX - 0.8, KZ + 0.6, 6, 3.4, 0);
  // the disciples: ordinary arms from beyond the frame, either side of you; they stay with you as you walk
  const ARM = [['armL', -0.78, 1.58, -0.38, onL, dnL], ['armR', 1.4, 1.25, 0, onR, dnR]].map(([n, off, y, rot, up, dn]) => { const a = P.art(n, X, Z, 1.35, { drawn: true, fog: false, fadeNear: false, sil: 0.72, gain: 1.45 }); a.mesh.renderOrder = 8; return { a, off, y, rot, up, dn }; });
  P.keep(reach, { h: 5.0 }); P.keep(other, { h: 5.0 * other.hU / reach.hU });
  return { say: [0, 3], update(t) { const cz = cam.position.z, leaveK = 1 - seg(t, P.T.leave, P.T.leave + L), near = clamp((Z + 34 - cz) / 12) * leaveK, dirX = (P.pathX(cz - 12) - cam.position.x) / 12;
    // he walks up the road, then stands
    const hu = clamp((t - (heStops - L * 7)) / (L * 7)); he.mesh.position.x = lerp(H0X, HX, P.smooth(hu)); he.mesh.position.z = lerp(H0Z, HZ, P.smooth(hu)); P.gait(he, hu > 0 && hu < 1, t); he.u.uA.value = near * clamp((cz - he.mesh.position.z - 1) / 2); heGlow.material.opacity = (0.09 + 0.09 * seg(t, heStops, heStops + L * 2) + 0.03 * P.listen('keys', t)) * near;
    // the man: sits, gets up, walks to the water feeling his way, kneels, washes, lifts his head, stands stooping toward the other
    const up = seg(t, rise, rise + L * 0.7), kn = seg(t, kneel - L * 0.35, kneel + L * 0.35), lift = seg(t, sees, sees + L), st = seg(t, key, key + L * 1.4), wu = clamp((t - rise - L * 0.25) / (kneel - rise - L * 0.5));
    sit.u.uA.value = near * (1 - up); walk.u.uA.value = near * up * (1 - kn); wash.u.uA.value = near * kn * (1 - lift); see.u.uA.value = near * lift * (1 - st); reach.u.uA.value = near * st;
    walk.mesh.position.x = lerp(SX, KX, wu); walk.mesh.position.z = lerp(SZ, KZ, wu); P.gait(walk, wu > 0 && wu < 1, t);
    other.gain = 0.8 + 0.5 * lift; other.u.uA.value = near * (0.6 + 0.4 * lift);
    const lit = lift * leaveK; lightUp.material.opacity = lit * (0.13 + 0.05 * st + 0.03 * P.listen('swell', t)); lightDown.material.opacity = lit * (0.1 + 0.03 * st);
    const groundK = clamp((Z + 22 - cz) / 10) * leaveK; rim.m.material.opacity = 0.5 * groundK; water.m.material.opacity = (0.26 + 0.08 * P.listen('bass', t)) * groundK; rocks.forEach(r => { r.u.uA.value = leaveK; });
    ripples.forEach(({ t0, r }) => { const age = (t - t0) / (L * 3), R = 0.08 + age * 0.55; r.m.material.opacity = t < t0 || age > 1 ? 0 : 0.6 * (1 - age) * leaveK; if (r.m.material.opacity > 0) r.set(u => { const a = u * 6.283, x = KX - 0.75 + Math.cos(a) * R, z = KZ + 0.6 + Math.sin(a) * R * 0.62; return [x - Math.cos(a) * 0.012, z - Math.sin(a) * 0.012, x + Math.cos(a) * 0.012, z + Math.sin(a) * 0.012]; }); });
    // the hands: rise from below, hold, lower. They stay at your side, like the men they belong to
    for (const A of ARM) { const u = 1 - Math.pow(1 - clamp((t - A.up) / (L * 1.3)), 3), d = P.smooth(clamp((t - A.dn) / (L * 1.9))), f = u * (1 - d), D = 3.4; A.a.show = t > A.up && d < 1; A.a.mesh.position.set(cam.position.x + dirX * D + A.off, A.y - 1.9 * (1 - f) + 0.012 * Math.sin(t * 1.3 + A.off) , cz - D); A.a.mesh.rotation.z = A.rot + (A.off < 0 ? -1 : 1) * 0.32 * (1 - f); A.a.u.uA.value = clamp(f * 2.4); }
  } };
}
