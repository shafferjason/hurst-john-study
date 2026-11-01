// Lesson 27 (short stop, S = the trickle is a deliberate symbol): on the one day no water was poured, "If anyone is thirsty, come to me."
// Temple steps. The great pitcher stands upright and nobody touches it, the whole hold. On the key a figure stands above you, hand open (from behind).
// Then a thin trickle starts at his feet and comes down the steps toward you. It does not come from the pitcher, which stays dry.
export default async function (P) {
  await P.loadArt();
  const Z = P.Z, X = P.X, cam = P.camera, L = P.beats(1), D = 4.5, PZ = Z - D, CX = X + (P.pathX(Z - 12) - X) * D / 12, TH = -Math.atan((P.pathX(Z - 12) - X) / 12);
  const square = (m, dx, dz) => { m.rotation.y = TH; m.position.x = CX + dx * Math.cos(TH); m.position.z = PZ - dx * Math.sin(TH) + dz; };   // everything square to your line of sight, so the bottom step sits level
  const key = P.ev('key', 1, 1), flow = P.ev('trickle starts', 1, 2), FLOW = P.beats(3);
  // the steps: drawn by hand so the trickle can fall exactly over each edge. y is height in the picture plane, 0 at the ground.
  const W = 14, H = 2.2, PX = 300, TOP = 2.1, N = 8, ys = [TOP]; for (let i = 1, g = 0.205; i < N; i++, g *= 1.07) ys.push(ys[i - 1] - g); // ys[0] is the top edge
  const hw = i => 1.3 + 5.5 * Math.pow(i / (N - 1), 2.2), toX = x => (x + W / 2) * PX, toY = y => (H - y) * PX, RISE = 0.46;   // each step's half-width: broad as the whole view at the bottom, so no front corner ever shows
  const POTX = -0.72, POTH = 1.0, step = 4, potY = (ys[step] + ys[step + 1]) / 2 + 0.02;
  const stroke = (c, x0, y, x1, k, a, lw) => { c.globalAlpha = a; c.lineWidth = lw; const n = Math.ceil((x1 - x0) / 0.5); c.beginPath(); c.moveTo(toX(x0), toY(y));
    for (let j = 1; j <= n; j++) { const f = j / n, x = lerp(x0, x1, f), dy = (hash(k + j * 3.1) - 0.5) * 0.01; c.quadraticCurveTo(toX(x - 0.13), toY(y + dy * 1.4), toX(x), toY(y + dy)); } c.stroke(); };
  const steps = P.thing(CX, PZ, W, H, PX, (c, p) => { c.lineCap = c.lineJoin = 'round';
    c.fillStyle = '#0c0a08'; c.beginPath(); c.moveTo(toX(-hw(0)), toY(TOP));                                         // the stair is solid: the path ends at its foot
    ys.forEach((y, i) => { const g = i < N - 1 ? y - ys[i + 1] : y, r = g * RISE; c.lineTo(toX(-hw(i)), toY(y - r)); if (i < N - 1) c.lineTo(toX(-hw(i + 1)), toY(y - g)); });
    c.lineTo(toX(-hw(N - 1)), toY(0)); c.lineTo(toX(hw(N - 1)), toY(0)); [...ys.keys()].reverse().forEach(i => { const y = ys[i], g = i < N - 1 ? y - ys[i + 1] : y; c.lineTo(toX(hw(i)), toY(y - g * RISE)); c.lineTo(toX(hw(i)), toY(y)); }); c.closePath(); c.globalAlpha = 1; c.fill();
    c.strokeStyle = '#f0d4a8';
    ys.forEach((y, i) => { const h = hw(i), g = i < N - 1 ? y - ys[i + 1] : y, r = g * RISE;
      if (p * N < N - i - 0.5) return;                                                                               // the steps form from the bottom up
      stroke(c, -h, y, h, i * 11 + 2, 0.95, 2.6);                                                                    // the edge of the step
      stroke(c, -h, y - r, h, i * 13 + 5, 0.5, 1.5);                                                                 // the foot of its riser
      [-1, 1].forEach(s => { c.globalAlpha = 0.85; c.lineWidth = 2; c.beginPath(); c.moveTo(toX(s * h), toY(y)); c.lineTo(toX(s * h), toY(y - r)); if (i < N - 1) c.lineTo(toX(s * hw(i + 1)), toY(y - g)); c.stroke(); });
      for (let j = 0; j < 4; j++) { const x = -h + 2 * h * (0.12 + 0.76 * hash(i * 17 + j * 3 + 1)); if (Math.abs(x) < 0.3) continue;   // a few joints between the stones
        c.globalAlpha = 0.3; c.lineWidth = 1.2; c.beginPath(); c.moveTo(toX(x), toY(y - 0.012)); c.lineTo(toX(x + 0.006), toY(y - r + 0.012)); c.stroke(); } });
    stroke(c, -hw(N - 1), 0.015, hw(N - 1), 91, 0.5, 1.5);                                                         // where the stair meets the ground
    c.globalAlpha = 1; }, { turn: false, far: 26, near: 7 });
  const pitcher = P.art('pitcher', CX + POTX, PZ + 0.02, POTH, { y0: potY, turn: false, far: 26, near: 7, gain: 1.6, sil: 1, fadeNear: false });
  // the temple: the colonnade from Lesson 30, faint, standing along the top of the stair behind him
  const COLH = 1.3, colonnade = P.art('colonnade', CX, PZ - 0.04, COLH, { y0: TOP - 0.03, drawn: true, turn: false, fog: false, sil: 1, gain: 0.85, fadeNear: false });
  const CW = colonnade.wU, colBack = P.thing(CX, PZ - 0.06, CW * 0.97, COLH * 0.95, 20, c => { c.fillStyle = '#0c0a08'; c.fillRect(0, 0, c.canvas.width, c.canvas.height); }, { y0: TOP, turn: false, far: 26, near: 7 });   // so the far hills don't show through the columns
  const FIGH = 1.52, figure = P.artAt('figure', CX + 0.02, PZ + 0.03, FIGH, key, 2, { y0: TOP - 0.04, turn: false, gain: 1.6, sil: 1, fadeNear: false });
  // the trickle's course: starts just in front of his feet, eases right a little on each tread, drops straight down each riser; corners rounded so it reads as water, not a crack.
  const raw = [], END = 0.3, xAt = i => lerp(0.04, END, i / N) + 0.035 * Math.sin(i * 2.4); raw.push([xAt(0), TOP - 0.05]);
  ys.forEach((y, i) => { if (i === 0) return; const g = ys[i - 1] - y; raw.push([xAt(i - 1), ys[i - 1]], [xAt(i - 1), ys[i - 1] - g * RISE], [xAt(i), y]); }); raw.push([xAt(N - 1), ys[N - 1]], [xAt(N - 1), ys[N - 1] * (1 - RISE)], [END, 0.02]);
  const dense = []; raw.slice(1).forEach((b, i) => { const a = raw[i]; for (let j = 0; j < 12; j++) dense.push([lerp(a[0], b[0], j / 12), lerp(a[1], b[1], j / 12)]); }); dense.push(raw[raw.length - 1]);
  const course = dense.map((q, i) => { let sx = 0, n = 0; for (let j = Math.max(0, i - 4); j <= Math.min(dense.length - 1, i + 4); j++) { sx += dense[j][0]; n++; } return [sx / n, q[1]]; }), STAIR = 0.82;
  const TW = 3, tX = x => (x + TW / 2) * PX, trickle = P.thing(CX, PZ + 0.04, TW, H, PX, (c, p, t) => { const u = clamp((t - flow) / FLOW / STAIR); if (u <= 0) return; const last = Math.max(1, Math.floor(u * (course.length - 1)));
    c.strokeStyle = '#fff0d0'; c.lineCap = c.lineJoin = 'round'; c.shadowColor = 'rgba(255,240,208,.55)'; c.shadowBlur = 6; c.lineWidth = 2.8; c.beginPath(); c.moveTo(tX(course[0][0]), toY(course[0][1]));
    for (let i = 1; i <= last; i++) c.lineTo(tX(course[i][0]), toY(course[i][1])); c.stroke(); }, { turn: false, live: true, far: 1e6, near: 0 });
  // off the bottom step it runs on along the ground toward your feet
  const NR = 30, run = P.ribbon(0xfff0d0, 0, NR), runD = u => lerp(D, 2.9, u), runX = u => CX + END * Math.cos(TH) + 0.03 * Math.sin(u * 5) + u * 0.02;     // beside the path, not on it
  const light = P.glow(CX, TOP + 0.5, PZ - 0.1, 3.4, 0);
  [colBack, steps, colonnade, pitcher, figure, trickle].forEach((m, i) => { m.mesh.renderOrder = 2 + i; });
  square(steps.mesh, 0, 0); square(colonnade.mesh, 0, -0.04); square(colBack.mesh, 0, -0.06); square(pitcher.mesh, POTX, 0.02); square(figure.mesh, 0.02, 0.03); square(trickle.mesh, 0, 0.04);
  P.keep(pitcher, { h: 3 });
  return { update(t) {
    const inK = seg(t, P.T.start, P.T.arrive), out = 1 - seg(t, P.T.leave, P.T.leave + L), near = cam.position.z > PZ + 0.5 ? 1 : 0, k = inK * out * near;
    steps.mesh.material.opacity = k; pitcher.u.uA.value = k; figure.u.uA.value = k; colonnade.u.uA.value = 0.55 * k; colBack.mesh.material.opacity = k; trickle.mesh.material.opacity = k;
    const g = clamp(((t - flow) / FLOW - STAIR) / (1 - STAIR));
    run.set(v => { const u = v * g, d = runD(u), x = runX(u), w = 1.6 * d / 1283; return [x - w, Z - d - END * Math.sin(TH), x + w, Z - d - END * Math.sin(TH)]; }); run.m.material.opacity = (g > 0 ? 0.95 : 0) * out;
    light.material.opacity = (0.1 + 0.04 * P.listen('keys', t)) * seg(t, key, key + L * 2) * out;
  } };
}
