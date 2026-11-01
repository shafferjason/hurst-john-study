// Lesson 16 (short stop, S = deliberate symbol): everything said this conversation shouldn't happen; Jesus sat down anyway and offered living water.
// One detail: a thin stream that starts where he sits and washes out the line scratched across the dust between them. He gives no cup, and the stream is what he gives, not him.
export default async function (P) {
  await P.loadArt();
  const Z = P.Z, X = P.X, cam = P.camera, L = P.beats(1);
  const view = d => X + (P.pathX(Z - 12) - X) * d / 12;                      // the straight line of sight from where you stop
  const flows = P.evs('stream runs', 0, 3, 4, 1), HEADKEY = 0.6, key = P.ev('key', 1, 1), opens = P.evs('line goes', 1, 2, 3, 1);
  const HD = 4.7, WD = 8.2, LD = 6.3, hx = view(HD) - 1.05, wx = view(WD) + 1.15;
  const well = P.art('well', hx, Z - HD, 3.5, { flip: true, turn: false, far: 26, near: 9, gain: 1.6, sil: 0.6, fadeNear: false });
  const woman = P.walker('woman', wx, Z - WD, false, 3.15, { turn: false, far: 26, near: 9, gain: 1.55, sil: 0.45, fadeNear: false });
  // the stream: from the foot of the well, one gentle curve round his feet and away to the line on the key beat, across it, stopping just short of hers
  const pts = [[-1.05, 4.68], [-0.55, 4.5], [0, 4.75], [0.34, LD], [0.58, 7.15], [0.72, 7.95]].map(([o, d]) => [view(d) + o, d]), CX = pts[3][0];
  const cat = (a, b, c, e, s) => 0.5 * (2 * b + (c - a) * s + (2 * a - 5 * b + 4 * c - e) * s * s + (3 * b - a - 3 * c + e) * s * s * s);
  const NS = 80, path = []; for (let i = 0; i <= NS; i++) { const f = i / NS * (pts.length - 1), k = Math.min(Math.floor(f), pts.length - 2), s = f - k, q = j => pts[Math.max(0, Math.min(pts.length - 1, j))]; path.push([cat(q(k - 1)[0], q(k)[0], q(k + 1)[0], q(k + 2)[0], s), cat(q(k - 1)[1], q(k)[1], q(k + 1)[1], q(k + 2)[1], s)]); }
  const stream = [P.ribbon(0xf6e2bf, 0.85, NS), P.ribbon(0xf0d4a8, 0.22, NS)];
  // the line scratched in the dust, across your way, hand-drawn. It goes outward from where the stream crosses it.
  const NL = 120, HALF = 5, scratch = P.ribbon(0xf0d4a8, 0.85, NL);
  const light = P.glow(view(6), 7, Z - 6, 18, 0), ground = P.pool(view(6), Z - 6, 9, 9, 0);    // noon: flat high light, not a spot
  P.keep(well, { h: 3.6 });
  return { say: [0, 2], update(t) {
    const inK = seg(t, P.T.start, P.T.arrive), out = 1 - seg(t, P.T.leave, P.T.leave + L), near = d => clamp((cam.position.z - (Z - d) - 0.8) / 1.4), steps = T => T.reduce((a, f) => a + P.surge(clamp((t - f) / L)), 0) / T.length;
    well.u.uA.value = inK * out * near(HD); woman.u.uA.value = inK * out * near(WD);
    const v = steps(flows), head = (v < 0.5 ? v * 2 * HEADKEY : HEADKEY + (v - 0.5) * 2 * (1 - HEADKEY)) * NS, wave = P.listen('bass', t);                // the head of the stream moves on each beat, then rests
    stream.forEach((r, j) => { r.m.material.opacity = (j ? 0.22 : 0.85) * out * (t > flows[0] ? 1 : 0); r.set(u => { const k = Math.round(u * NS), p = path[k], a = path[Math.max(k - 1, 0)], b = path[Math.min(k + 1, NS)], dx = b[0] - a[0], dz = b[1] - a[1], m = Math.hypot(dx, dz) || 1, d = p[1];
      const px = (j ? 3.6 : 1.4) * (0.92 + 0.08 * Math.sin(k * 0.35 - t * 3 + j)) * (1 + 0.1 * wave) * clamp((head - k) / 4), sx = -dz / m * px * d / 1283, sz = dx / m * px * d * d / (1283 * 2.6);   // same width on screen whichever way it runs
      return [p[0] - sx, Z - d - sz, p[0] + sx, Z - d + sz]; }); });
    const reach = steps(opens) * 3.4;                                             // just past the screen's edges on the last beat
    scratch.m.material.opacity = 0.85 * inK * out;
    scratch.set(u => { const x = CX + (u - 0.5) * 2 * HALF, d = LD + 0.05 * Math.sin(x * 2.1) + 0.025 * Math.sin(x * 5.3 + 1), w = 0.032 * (0.7 + 0.6 * hash(Math.floor(u * NL / 3) + 3)) * clamp((Math.abs(u - 0.5) * 2 * HALF - reach) / 0.25 + (t < opens[0] ? 1 : 0)); const f = (cam.position.z - (Z - d)) / Math.max(cam.position.z - (Z - HD), 0.2), hid = x > cam.position.x + (view(HD) - 1.87 - cam.position.x) * f && x < cam.position.x + (view(HD) - 0.4 - cam.position.x) * f, g = hid ? 0 : w; return [x, Z - d - g, x, Z - d + g]; });   // he and the well are nearer than the line, so it passes behind them
    light.material.opacity = (0.15 + 0.03 * P.listen('keys', t)) * inK * out; ground.material.opacity = 0.14 * inK * out;
  } };
}
