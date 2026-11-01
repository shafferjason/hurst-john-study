// Lesson 29 (short stop): the light is for everyone, so no one inherits it; you have to walk in it.
// Dawn spreads across the whole road. Two men, drawn alike, wake on the ground. One pulls the blanket over his head; the other gets up and walks into it, up your road.
export default async function (P) {
  await P.loadArt();
  const Z = P.Z, cam = P.camera, L = P.beats(1), SKYD = 64, view = d => P.X + (P.pathX(Z - 12) - P.X) * d / 12;   // the centre of the view at distance d
  const dawn = P.evs('dawn widens', 0, 1, 4, 1), key = P.ev('key', 1, 1), stands = P.ev('he stands', 1, 3), goes = P.ev('he walks', 1, 4);
  // the dawn: four sheets at the horizon, each wider than the last. No sun; it's the whole sky along the ground.
  const W = 70, H = 14, sky = dawn.map((t0, n) => { const half = [0.16, 0.3, 0.46, 0.7][n], A = P.thing(0, 0, W, H, 32, c => { const w = c.canvas.width, h = c.canvas.height, cx = w / 2, R = half * w;
      c.save(); c.translate(cx, h); c.scale(1, (0.5 + 0.13 * n) * h / R); const g = c.createRadialGradient(0, 0, 0, 0, 0, R); g.addColorStop(0, 'rgba(240,212,168,0.2)'); g.addColorStop(0.55, 'rgba(240,212,168,0.08)'); g.addColorStop(1, 'rgba(240,212,168,0)'); c.fillStyle = g; c.fillRect(-R, -R, 2 * R, R); c.restore();
      c.lineCap = 'round'; c.strokeStyle = '#f0d4a8'; c.lineWidth = 2.2;                      // thin strata of cloud, closer together low down
      for (let k = 0; k < 8; k++) { const i = n * 40 + k, u = Math.pow((k + hash(i + 0.3)) / 8, 1.7), y = h * (1 - 0.03 - 0.62 * u), run = R * (0.3 + 0.55 * hash(i + 0.5)) * (1 - 0.55 * u), x0 = cx + (hash(i + 0.7) - 0.5) * 1.5 * (R - run);
        c.globalAlpha = 0.6 * (1 - 0.65 * u); c.beginPath(); c.moveTo(x0 - run, y); c.bezierCurveTo(x0 - run * 0.4, y - 6 * hash(i + 0.2), x0 + run * 0.4, y + 6 * hash(i + 0.9), x0 + run, y); c.stroke(); }
      c.globalAlpha = 1; }, { far: 1e6, near: 0, fog: false, turn: false }); A.mesh.material.blending = 2; A.mesh.renderOrder = -9; A.mesh.material.opacity = 0; return { t0, A }; });
  const road = P.pool(view(16), Z - 16, 34, 44, 0), haze = P.glow(0, 2.6, 0, 1, 0);                // the same light on the ground, and a haze so the horizon isn't a hard cut
  haze.scale.set(120, 15, 1); haze.renderOrder = -8;
  // the two men. Same drawing, one nearer on the left, one farther on the right.
  const DN = 5, DF = 7.6, ZN = Z - DN, ZF = Z - DF, XN = view(DN) - 1.42, XF = view(DF) + 1.68, BH = 1.62;
  const lieN = P.art('lie', XN, ZN, BH, { flip: true, turn: false, y0: -0.42, far: 26, near: 9, gain: 1.45, sil: 0.8, fadeNear: false });
  const under = P.art('under', XN, ZN, BH, { flip: true, turn: false, y0: -0.42, drawn: true, gain: 1.45, sil: 0.8, fadeNear: false });
  const lieF = P.art('lie', XF, ZF, BH, { turn: false, y0: -0.42, far: 26, near: 9, gain: 1.6, sil: 0.8, fadeNear: false });
  const sit = P.art('sit', XF, ZF, BH, { turn: false, y0: -0.16, drawn: true, gain: 1.6, sil: 0.8, fadeNear: false });
  const cast = P.art('cast', XF + 0.2, ZF - 0.02, 0.62, { turn: false, drawn: true, gain: 1.45, sil: 0.5, fadeNear: false });
  const X0 = XF - 0.37, walkZ = t => ZF - Math.max(0, t - goes) * 1.55, man = P.walker('walk', X0, ZF, false, 3.3, { fadeNear: false, turn: false, drawn: true, gain: 1.6, sil: 0.75 });
  P.keep(man, { h: 4, x: P.pathX(ZF), z: ZF });
  return { update(t) {
    const inK = seg(t, P.T.start, P.T.arrive), out = 1 - seg(t, P.T.leave, P.T.leave + L), pull = seg(t, key, key + L * 2), rise = seg(t, key, key + L * 2), up = seg(t, stands, stands + L * 1.5);
    const dirX = (P.pathX(cam.position.z - 12) - cam.position.x) / 12;
    sky.forEach(s => { s.A.mesh.position.set(cam.position.x + dirX * SKYD, 2.6 + H / 2, cam.position.z - SKYD); s.A.mesh.material.opacity = seg(t, s.t0, s.t0 + L * 1.5) * out * (0.9 + 0.1 * P.listen('swell', t)); });
    road.material.opacity = 0.3 * seg(t, dawn[0], key) * out; haze.position.set(cam.position.x + dirX * SKYD, 2.6, cam.position.z - SKYD); haze.material.opacity = 0.34 * seg(t, dawn[1], key) * out;
    lieN.u.uA.value = inK * (1 - pull); under.u.uA.value = pull * out;
    lieF.u.uA.value = inK * (1 - rise); sit.u.uA.value = rise * (1 - up); cast.u.uA.value = up * out;
    const z = walkZ(t), far = seg(ZF - z, 0, 6.5); man.mesh.position.z = z; man.mesh.position.x = lerp(X0, P.pathX(z), P.smooth(far)); P.gait(man, t >= goes, t); man.u.uA.value = up * out;
  } };
}
