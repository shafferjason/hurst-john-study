// Lesson 3 (short stop): a real eyewitness wrote so you'd believe; "Lord and God" likely answers Caesar's own title.
// Deliberate symbol (picks-final 3 S). One detail: Caesar's coin rolls off a stone wall and lands in the dust, under an empty, scarred, open hand.
export default async function (P) {
  await P.loadArt();
  const z0 = P.Z - 5, zf = P.Z - 6.5, base = P.pathX(z0), fx = P.pathX(zf) - 0.4, H = 1.2, r = 0.23, cz = z0 + 0.06, tip = -0.081;   // tip levels the drawing's perspective and leaves the top falling gently toward the end
  const roll = P.ev('coin rolls', 0, 3), key = P.ev('key', 1, 1), palm = P.ev('palm', 1, 2), L = P.beats(1);
  const drop = key - P.beats(0.5), xE = base - 0.7, yE = 1.0, R = 0.8, vx = 2 * R / (drop - roll), xLand = xE + vx * (key - drop), xF = xLand + 0.12;
  const wall = P.art('ledge', xE - 2.04, z0, H, { far: 20, near: 9, sil: 0.95, turn: false, fadeNear: false, gain: 1.2 }); wall.mesh.rotation.z = tip;
  const man = P.walker('figure', fx, zf, false, 3.8, { drawn: false, far: 20, near: 9, fadeNear: false, sil: 1, turn: false });
  const coin = P.art('coin', xE - R, cz, r * 2, { far: 20, near: 9, sil: 1, gain: 1.6, turn: false, fadeNear: false });
  const light = P.glow(fx - 0.72, 1.69, zf - 0.02, 1.4, 0);
  const dust = P.ribbon(0xf0d4a8, 0, 48);
  P.keep(coin, { h: 1.7, x: P.X, z: z0 });
  return { update(t) {
    const out = 1 - seg(t, P.T.leave, P.T.leave + L), a = seg(t, P.T.start, P.T.arrive) * out;
    wall.u.uA.value = man.u.uA.value = coin.u.uA.value = a;
    // along the wall it rolls without slipping; over the end it falls; a small bounce in the dust, then it tips over flat, head up
    const u = clamp((t - roll) / (drop - roll)), f = clamp((t - drop) / (key - drop)), b = clamp((t - key) / L), s = clamp((t - key - L) / (L * 1.2));
    const x = t < drop ? xE - R * (1 - u * u) : t < key ? xE + vx * (t - drop) : lerp(xLand, xF, P.smooth(b));
    const tilt = -1.42 * s * s, top = yE + r, y = t < drop ? top + 0.02 * (xE - x) : t < key ? top - (top - r) * f * f : r * Math.cos(tilt) + 0.012 + 0.16 * 4 * b * (1 - b);
    coin.mesh.position.set(x, y, cz); coin.mesh.rotation.set(tilt, 0, -(x - xF) / r);
    const g = seg(t, key, key + L * 2), w = 0.012;
    dust.m.material.opacity = t < key ? 0 : 0.35 * (1 - g) * out;
    dust.set(k => { const th = k * Math.PI * 2, q = 0.25 + 0.7 * (1 - (1 - g) * (1 - g)); return [xLand + Math.cos(th) * (q - w), cz + Math.sin(th) * (q - w), xLand + Math.cos(th) * (q + w), cz + Math.sin(th) * (q + w)]; });
    light.material.opacity = 0.2 * seg(t, palm, palm + L * 2) * out * (1 + 0.15 * P.listen('keys', t));
  } };
}
