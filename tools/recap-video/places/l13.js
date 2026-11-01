// Lesson 13 (short stop): a faith someone handed you isn't yours until you take it to God yourself.
// One detail: an older man, warm and unrebuked, hands a small clay oil lamp to a younger one, who goes on alone through a plain stone doorway.
export default async function (P) {
  await P.loadArt();
  const Z = P.Z, L = P.beats(1), DD = 12.5, PD = 5.5, H = 4.14, ease = u => u * u * (3 - 2 * u);
  const key = P.ev('key', 1, 1), through = P.ev('steps through', 1, 4);
  const dx = P.pathX(Z - DD), at = d => P.X + (dx - P.X) * d / DD;        // the middle of the view from where you stop
  const door = P.art('door', dx, Z - DD, 5.5, { far: 40, near: 20, sil: 0.8, gain: 1.35, turn: false, fadeNear: false });
  const PX = at(PD) - 0.7, YX = PX + 0.28 * H * 0.6573, LAMPX = PX + 0.09, LAMPY = 2.78;   // the pair sit left, so the opening is clear once he goes
  const pair = P.art('pair', PX, Z - PD, H, { map2: 'elder', far: 26, near: 11, sil: 0.72, gain: 1.45, turn: false, fadeNear: false });
  const goes = P.walker('goes', YX, Z - PD - 0.05, true, 3.4, { sil: 0.72, gain: 1.45, fadeNear: false });   // flipped: the lamp in the hand nearest where it was given
  const OX = goes.wU * 0.13, LX = goes.wU * 0.44, LY = goes.hU * 0.5;     // his body's centre and the lamp in his hand, measured on the drawing
  const flame = P.glow(LAMPX, LAMPY, Z - PD - 0.1, 1.5, 0);
  const lamp = P.art('lamp', P.X, Z - PD, 0.5, { drawn: true, gain: 1.5, sil: 0.8, fadeNear: false });
  lamp.u.uA.value = 0; P.keep(lamp, { h: 2.2, x: P.X, z: Z - PD });
  return { update(t) {
    const inK = seg(t, P.T.start, P.T.start + L * 2), outK = 1 - seg(t, P.T.leave, P.T.leave + L), mix = seg(t, key, key + L * 0.5);
    door.u.uA.value = inK * outK;
    pair.u.uMix.value = mix; pair.gain = lerp(1.45, 1.9, mix); pair.u.uA.value = inK * outK;
    const u = clamp((t - key) / (through - key)), s = Math.pow(u, 1.25) + Math.max(t - through, 0) / (through - key);   // he sets off, then keeps the pace
    const z = Z - PD - 0.05 - s * (DD - PD), x = lerp(YX, dx, ease(u)) - OX;
    goes.mesh.position.x = x; goes.mesh.position.z = z; P.gait(goes, t > key, t);
    goes.u.uA.value = mix * (1 - seg(t, through, through + L * 0.9)) * outK;   // past the threshold, he fades into the dark of it
    const after = seg(t, key, key + L);                                     // the lamp comes down into his one hand as he turns
    flame.position.set(lerp(LAMPX, x - LX, after), lerp(LAMPY, LY, after), z + 0.05);
    flame.material.opacity = (0.42 + 0.08 * P.listen('keys', t)) * inK * (1 - 0.65 * seg(t, through, through + L)) * outK;
  } };
}
