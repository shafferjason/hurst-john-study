// Lesson 20 (short stop): the God who fed his people feeds them again, and they still miss who he is.
// Twelve full baskets around you. Hands go up to lift him; he walks up the hill alone and they stay raised. One detail: raised hands, empty. No crown.
export default async function (P) {
  await P.loadArt();
  const Z = P.Z, L = P.beats(1), far = P.pathX(Z - 12) - P.X, cx = d => P.X + far * d / 12, EYE = 2.6;
  const key = P.ev('key', 1, 1), set = P.evs('three baskets', 0, 1, 4, 1), rise = P.evs('hands', 1, 1, 3, 1), go = P.ev('he goes', 1, 4);
  // twelve baskets, three to a beat, farthest first, in loose rows either side of the road. All in front of the people, so they can be counted
  const B = [[-2.05, 6.2, 0.62], [1.05, 6.1, 0.62], [2.05, 6.2, 0.6], [-1.05, 6.0, 0.62], [-1.72, 5.4, 0.58], [1.74, 5.35, 0.58], [0.82, 5.25, 0.58], [-0.82, 5.2, 0.56], [1.32, 4.65, 0.54], [-1.3, 4.7, 0.54], [-0.64, 4.5, 0.52], [0.66, 4.5, 0.52]];
  const baskets = B.map(([x, d, h], i) => P.artAt(i % 3 === 1 ? 'basket2' : 'basket1', cx(d) + x, Z - d, h, set[Math.floor(i / 3)], 1, { flip: i % 2 === 0, gain: 1.45, sil: 0.85, fadeNear: false, turn: false }));
  // the hill, drawn behind everything, and the way he goes up it
  const HD = 30, HW = 44, HH = 9, hx = cx(HD), hill = P.thing(hx, Z - HD, HW, HH, 34, c => { const W = c.canvas.width, H = c.canvas.height, Y = u => H * (1 - (0.02 + 0.6 * Math.exp(-Math.pow((u - 0.58) / 0.17, 2)) + 0.12 * Math.exp(-Math.pow((u - 0.3) / 0.14, 2))));
    c.beginPath(); c.moveTo(0, H); for (let u = 0; u <= 1; u += 0.005) c.lineTo(u * W, Y(u)); c.lineTo(W, H); c.closePath(); c.fillStyle = '#100c09'; c.fill();
    c.beginPath(); for (let u = 0; u <= 1; u += 0.005) c.lineTo(u * W, Y(u)); c.strokeStyle = '#e8c48c'; c.lineWidth = 3.4; c.lineCap = 'round'; c.stroke();
    c.lineWidth = 1.5; c.globalAlpha = 0.34; for (let i = 0; i < 60; i++) { const u = 0.2 + 0.62 * hash(i + 0.17), v = hash(i + 0.41), y = Y(u) + (H - Y(u)) * v * 0.8 + 6, x = u * W; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 3, y - 7 - 4 * hash(i + 0.7)); c.moveTo(x + 5, y); c.lineTo(x + 5, y - 5); c.stroke(); } }, { far: 1e6, near: 0, turn: false });
  hill.mesh.position.y = HH / 2; hill.mesh.renderOrder = -5; hill.mesh.material.transparent = true;
  const he = P.walker('he', cx(12), Z - 12, false, 3.3, { fadeNear: false, turn: false, gain: 1.6, sil: 0.9 });
  const WALK = P.beats(5), SPEED = 12.5 / WALK;
  // hands up on both sides of him, then left holding the air
  const R = [['r1', -1.45, 10.2, false], ['r1', 1.5, 10, true], ['r3', -2.95, 9.7, false], ['r2', 2.9, 9.5, true]];
  const hands = R.map(([n, x, d, flip], i) => P.artAt(n, cx(d) + x, Z - d, 3.75, rise[Math.min(i, 2)], 1, { flip, gain: 1.5, sil: 0.92, fadeNear: false, turn: false }));
  P.keep(baskets[10], { h: 2.2, x: P.X, z: Z - 3 });
  return { update(t) {
    const inK = seg(t, P.T.start, P.T.arrive), out = 1 - seg(t, P.T.leave, P.T.leave + L);
    baskets.forEach(a => { a.u.uA.value = out; }); hands.forEach(a => { a.u.uA.value = out; });
    hill.mesh.material.opacity = inK * out * 0.95;
    const u = Math.max(t - go, 0), d = 12 + u * SPEED; he.mesh.position.z = Z - d; he.mesh.position.x = cx(d) + 0.7 * seg(t, go, go + WALK);
    P.gait(he, t > go, t); he.mesh.position.y += 4.2 * clamp((d - 12) / 12.5);
    he.u.uA.value = inK * out * (0.92 + 0.08 * P.listen('keys', t));
  } };
}
