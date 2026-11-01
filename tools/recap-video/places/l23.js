// Lesson 23 (short stop): not a bread of life. THE bread of life.
// An ordinary road, stalls going away down it, one per beat. Then, close up, one plain loaf in an open hand, held out, and a
// second hand just taking it, one drawing. One detail: the loaf between the two hands. No altar, no raised loaf, no cupped hands in a line.
export default async function (P) {
  await P.loadArt();
  const Z = P.Z, L = P.beats(1), vx = d => P.X + (P.pathX(Z - 12) - P.X) * d / 12;       // centre of the view from where you stop
  const S = [[-3.4, 7, 'stall1', 4.1, false], [3.8, 10, 'stall2', 3.5, true], [-4.0, 15, 'stall2', 3.5, false], [4.0, 22, 'stall1', 4.0, true], [-4.0, 32, 'stall1', 4.0, false]];
  const when = P.evs('stall', 0, 1, S.length, 1);                                        // nearest first, the last two as you stop
  const stalls = S.map(([dx, d, n, h, flip], i) => P.artAt(n, P.pathX(Z - d) + dx, Z - d, h, when[i], 1, { flip, y0: -0.1, gain: 1.25, sil: 0.75, fadeNear: false }));
  const offer = P.ev('held out', 1, 1), key = P.ev('key', 2, 1);                        // the hand-off draws itself over bar 1 and is whole on the key
  const d = 2.8, hz = Z - d, cx = vx(d) + 0.02, h = 2.6 / 3.4908, ly = 1.52;              // wider than the screen, so both arms run off the edges; low, clear of the stalls and the track
  const handoff = P.artAt('handoff', cx - 0.1, hz, h, offer, 4, { y0: ly - h / 2, gain: 1.5, sil: 0.7, turn: false, fadeNear: false, fog: false });
  const warm = P.glow(cx, ly, hz - 0.1, 2.4, 0);
  P.keep(handoff, { h: 1.3 });
  return { update(t) {
    const out = 1 - seg(t, P.T.leave, P.T.leave + L);
    stalls.forEach(a => { a.u.uA.value = out; }); handoff.u.uA.value = out; handoff.u.uSil.value = 0.6 * seg(t, key - L, key + L);   // lines first, so no dark shape before the drawing is there
    warm.material.opacity = seg(t, offer, offer + L * 2) * out * (0.14 + 0.04 * P.listen('keys', t));
  } };
}
