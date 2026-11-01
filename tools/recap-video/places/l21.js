// Lesson 21 (short stop): John barely tells the walk on water; he wants your eyes on the bread.
// On the walk in, a boat and a far figure on the water, drawn in one beat and passed. Then baskets on a hillside and one plain loaf,
// drawn slowly, where you stop. One detail: the loaf.
export default async function (P) {
  await P.loadArt();
  const Z = P.Z, L = P.beats(1), vx = d => P.X + (P.pathX(Z - 12) - P.X) * d / 12;       // centre of the view from where you stop
  const quick = P.ev('boat', 0, 1), slope = P.ev('hillside', 0, 3), held = P.ev('baskets', 0, 4), key = P.ev('key', 1, 1);
  const bz = Z + 3.6, boat = P.artAt('boat', P.pathX(bz) - 0.6, bz, 2.15, quick, 1, { y0: -0.1, gain: 1.45, sil: 0.25, turn: false });
  const hill = P.artAt('hill', vx(10), Z - 10, 6.4, slope, 3, { y0: -0.7, gain: 1.0, sil: 0, turn: false, fadeNear: false });
  const baskets = P.artAt('baskets', vx(10) + 0.9, Z - 10, 1.5, held, 3, { y0: 1.75, gain: 1.35, sil: 0.9, turn: false, fadeNear: false });
  const lz = Z - 4.6, lx = vx(4.6), loaf = P.artAt('loaf', lx, lz, 0.85, key, 3, { y0: -0.03, gain: 1.6, sil: 1, turn: false, fadeNear: false });
  const warm = P.glow(lx, 0.7, lz - 0.1, 3.2, 0);
  P.keep(loaf, { h: 2.2 });
  return { update(t) {
    const out = 1 - seg(t, P.T.leave, P.T.leave + L);
    boat.u.uA.value = 1 - seg(t, P.T.arrive - L, P.T.arrive - L * 0.25);
    hill.u.uA.value = baskets.u.uA.value = out; loaf.u.uA.value = out; loaf.u.uSil.value = seg(t, key + L, key + L * 2.5);   // lines first, so no dark blob before the loaf is drawn
    warm.material.opacity = seg(t, key, key + L * 3) * out * (0.15 + 0.04 * P.listen('keys', t));
  } };
}
