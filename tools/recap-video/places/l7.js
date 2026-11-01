// Lesson 7: asked who he was, John the Baptist kept saying no. He was the voice pointing to Jesus. Three questioners hold out an open
// hand in turn; a rough man beside the path raises one still palm and each lowers. On the key he points across your path to someone
// far ahead. One detail: the pointing arm. No crowns, no titles drawn, no faces.
export default async function (P) {
  await P.loadArt();
  const Z = P.Z, X = P.X, L = P.beats(1), JD = 6, JH = 4.1;
  const offer = P.evs('offer', 0, 3, 3, 2), no = P.evs('no', 0, 4, 3, 2), key = P.ev('key', 2, 1);
  const o = { far: 26, near: 13, turn: false, fadeNear: false, sil: 0.95, gain: 1.45 };
  const jr = P.art('jrest', X - 1.17, Z - JD, JH, { ...o, y0: -0.16, map2: 'jhand', gain: 1.6 });
  const jp = P.art('jhand', X - 1.17, Z - JD, JH, { ...o, y0: -0.16, map2: 'jpoint', gain: 1.6 });
  const q = [['q2', 1.57, 11, 3.95, false], ['q1', 1.98, 9.2, 3.8, true], ['q3', 1.62, 7.6, 3.85, false]]
    .map(([n, x, d, h, flip]) => P.art(n + 'a', X + x, Z - d, h, { ...o, y0: -0.04 * h, map2: n + 'b', flip }));
  const hz = Z - 30, hx = X + 3.2, he = P.walker('he', hx, hz, false, 3.5, { fog: false, fadeNear: false, gain: 1.7, sil: 0.9, turn: false });
  const light = P.glow(hx, 1.8, hz - 0.2, 10, 0);
  P.keep(jp, { h: 4.0 });
  return { update(t) {
    const out = seg(t, P.T.leave, P.T.leave + L), show = seg(t, P.T.start, P.T.start + L * 2) * (1 - out);
    jr.u.uMix.value = seg(t, no[0], no[0] + L * 0.6); const sw = t >= no[0] + L * 0.6;
    jr.u.uA.value = sw ? 0 : show; jp.u.uA.value = sw ? 1 - out : 0;
    jp.u.uMix.value = seg(t, key, key + L * 0.6);
    jp.u.uGain.value = 1.6 + 0.25 * P.hit('guitar', t) * seg(t, key, key + L);
    q.forEach((a, i) => { a.u.uMix.value = seg(t, offer[i], offer[i] + L * 0.7) * (1 - seg(t, no[i] + L * 0.2, no[i] + L * 0.9)); a.u.uA.value = show; });
    const k = seg(t, key, key + L * 1.5);
    he.u.uA.value = (0.14 + 0.86 * k) * seg(t, P.T.arrive - L * 2, P.T.arrive) * (1 - out);
    light.material.opacity = (0.34 * k * (1 + 0.12 * P.listen('keys', t))) * (1 - out);
  } };
}
