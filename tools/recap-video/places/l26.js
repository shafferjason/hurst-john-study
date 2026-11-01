// Lesson 26 (short stop): the miracle or the miracle worker. A crowd from behind stares up at a small glow. It fades, and they look
// around for the next one, away, outward. A plain man has stood among them the whole time, looking level. One detail: one person turns to him.
export default async function (P) {
  await P.loadArt();
  const Z = P.Z, cam = P.camera, L = P.beats(1), cx = d => P.X + (P.pathX(Z - 12) - P.X) * d / 12;
  const fade = P.ev('glow fades', 1, 1), looks = P.evs('looks around', 1, 2, 3, 1), key = P.ev('key', 2, 1);
  const person = (a, b, d, off, h, flip, g = 1.4, sil = 0.55) => { const x = P.walker(a, cx(d) + off, Z - d, flip, h, { drawn: false, far: 26, near: 9, sil, gain: g, turn: false, fadeNear: false, map2: b ? P.keyOf(b) : undefined }); return { a: x, d }; };
  // everyone looks outward when they look away, so no glance lands on him by accident
  const crowd = [person('up1', 'around1', 5.4, -1.8, 3.4, false, 1.4, 0.85), person('up3', 'around3', 5.4, 2.0, 3.35, false, 1.4, 0.85), person('up2', 'around2', 10.5, -2.1, 3.1, true), person('up1', 'around1', 11.5, 2.4, 3.2, true)];
  const when = [looks[0], looks[1], looks[2], looks[1]];
  const he = person('he', null, 7.8, 0.72, 3.15, false, 1.5), turner = person('up4', 'turned', 7.2, -0.62, 3.1, false, 1.6);
  const sky = P.glow(cx(30), 7.0, Z - 30, 6, 0), core = P.glow(cx(30), 7.0, Z - 30, 1.3, 0);
  const warm = P.glow(cx(7.8) + 0.35, 1.7, Z - 7.9, 5.5, 0);
  P.keep(turner.a, { h: 4 });
  return { update(t) {
    const inK = seg(t, P.T.start, P.T.arrive), out = 1 - seg(t, P.T.leave, P.T.leave + L), gone = 1 - P.smooth(seg(t, fade, fade + L * 3)), quiet = 1 - 0.45 * seg(t, key, key + L * 2);   // the rest of the crowd drops back once he's noticed
    crowd.forEach((c, i) => { c.a.u.uMix.value = P.smooth(seg(t, when[i], when[i] + L * 0.75)); c.a.u.uA.value = inK * out * quiet; });
    he.a.u.uA.value = inK * out;
    turner.a.u.uMix.value = P.smooth(seg(t, key, key + L)); turner.a.u.uA.value = inK * out;
    sky.material.opacity = 0.5 * gone * inK; core.material.opacity = 0.8 * gone * inK;
    warm.material.opacity = (0.2 + 0.05 * P.listen('keys', t)) * seg(t, key, key + L * 2) * out;
  } };
}
