// Lesson 1 (short stop): four writers, four audiences, one empty tomb. Four sketches of one tomb stand at different depths, each with its own
// hillside. Sized so they coincide only from where you arrive, so your own walking lines them up. On the key their doorways become one rough
// opening with the stone rolled aside. Then you walk through it. One detail: the one opening.
export default async function (P) {
  await P.loadArt();
  const cam = P.camera, EYE = 2.6, Z0 = P.Z - 0.2, Ex = P.pathX(Z0), dirx = (P.pathX(Z0 - 12) - Ex) / 12, d0 = 5.3, SPAN = 1.98, GY = 0.57, f = v => (v / 600 - 0.03) / 0.94;
  const rayAt = d => [Ex + dirx * d, EYE + (GY - EYE) * d / d0];   // the door-and-stone centre at this depth, on one line from your eye
  // [drawing, depth, door-and-stone centre x, y and span in the 600px sketch, sideways and upward offset in screen px early in the walk]
  const S = [['t2', 14, 369, 436, 222, 250, 170], ['t1', 10.5, 332, 375, 225, -250, 170], ['t4', 7.5, 369, 395, 202, 290, -130], ['t3', d0, 367, 370, 225, -290, -130]];
  const forms = [...P.evs('far sketches form', 0, 1, 1), ...P.evs('far sketches form', 0, 1, 1), ...P.evs('near sketches form', 0, 2, 1), ...P.evs('near sketches form', 0, 2, 1)];
  const key = P.ev('key', 1, 1), L = P.beats(1);
  const A = S.map(([n, d, ax, ay, sp, ox, oy], i) => { const h = SPAN * (d / d0) / (sp / 600 / 0.94), a = P.artAt(n, 0, Z0 - d, h, forms[i], 2, { turn: false, fadeNear: false, sil: 1, gain: 1.3, fog: false }); return { a, d, ox, oy, h, fx: f(ax) - 0.5, fy: 0.5 - f(ay) }; });
  const dH = SPAN / 0.647 / P.META[P.keyOf('door')].aspect, dW = dH * P.META[P.keyOf('door')].aspect, Zn = Z0 - d0 + 0.02, bx = rayAt(d0)[0] - 0.145 * dW, by = GY + 0.12 * dH;
  const door = P.artAt('door', bx, Zn, dH, key, 1, { turn: false, fadeNear: false, sil: 1, gain: 1.6, fog: false });
  P.keep(door, { h: 2.6 });
  return { update(t) {
    const D = Math.max(cam.position.z - Z0, 0), far = P.smooth(clamp(D / 12)), dim = 0.5 * seg(t, key, key + L), gone = 1 - seg(t, P.T.leave, P.T.leave + P.beats(0.75));
    for (const s of A) { const [x, y] = rayAt(s.d), m = s.a.mesh, k = far / 1283 * (s.d + D); m.position.x = x - s.fx * s.h + s.ox * k; m.position.y = y - s.fy * s.h + s.oy * k; s.a.gain = 1.3 * (1 - dim); s.a.u.uA.value = gone; }
    // walking on: you stoop through the low opening, so it rises to your eye and centres on you, and goes dark past you
    const dist = cam.position.z - Zn, pass = t > P.T.leave ? P.smooth(1 - clamp((dist - 1) / (d0 - 1))) : 0, cx = bx - 0.056 * dW, cy = by - 0.12 * dH;
    door.mesh.position.x = bx + pass * (cam.position.x + dirx * dist - cx); door.mesh.position.y = by + pass * (2.4 - cy); door.u.uA.value = clamp((dist - 0.9) / 1.5);
  } };
}
