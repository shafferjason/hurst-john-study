// Lesson 18 (short stop): a man walks after 38 years, and all the leaders can see is the mat he's carrying.
// One detail: at Bethesda's colonnade only the rolled mat shows past the pillar, with two men from behind looking at it. Then he
// walks out from behind it: the whole man in side view, face visible, mid-stride. The walking is the miracle. The men never move.
export default async function (P) {
  await P.loadArt();
  const cam = P.camera, L = P.beats(1), dirX = (P.pathX(P.Z - 12) - P.X) / 12;
  const at = (d, px) => P.X + dirX * d + (px - 540) * d / 1283;              // world x that lands on screen x px, seen from where you stop
  const go = P.ev('he sets off', 1, 3); P.ev('key', 2, 1);                   // key: he is out from behind the pillar
  const SP = 0.6, DM = 7.5, DP = 5, ZP = P.Z - DP, MX = at(DM, 342);

  // the pillar: a stone shaft on a plain base, rising into the dark below the words. Opaque: it has to hide him.
  const CW = 1.54, SW = 1.22, HT = 9, PX = 180;   // he stands further back than the pillar, so a slimmer shaft still hides his whole stride; only the roll's end shows past it.
  const pillar = P.thing(at(DP, 330), ZP, CW, HT, PX, c => { const cw = c.canvas.width, ch = c.canvas.height, d = cam.position.z - ZP, m = (CW - SW) / 2 * PX, b = 0.42 * PX;
    const yAt = sy => ch - (2.6 + (875 - sy) * d / 1283) * PX, g = c.createLinearGradient(0, yAt(570), 0, yAt(635));
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
    c.fillStyle = '#0c0a08'; c.fillRect(m, 0, cw - 2 * m, ch - b * 0.42); c.fillRect(0, ch - b * 0.42, cw, b * 0.42); c.beginPath(); c.moveTo(m * 0.45, ch - b * 0.8); c.lineTo(cw - m * 0.45, ch - b * 0.8); c.lineTo(cw, ch - b * 0.42); c.lineTo(0, ch - b * 0.42); c.fill();
    c.strokeStyle = '#e2b888';
    const edge = (x, w, a, top, bot) => { c.lineWidth = w; c.globalAlpha = a; c.beginPath(); c.moveTo(x, top); for (let k = 1; k <= 12; k++) c.lineTo(x + (hash(k + x) - 0.5) * 3, top + (bot - top) * k / 12); c.stroke(); };
    edge(m, 4.2, 1, 0, ch - b * 0.8); edge(cw - m, 4.2, 1, 0, ch - b * 0.8);
    [0.2, 0.36, 0.53, 0.72].forEach((f, i) => edge(m + (cw - 2 * m) * f, 2, 0.5, ch * (0.1 + 0.07 * hash(3 + i)), ch - b * 1.1));
    c.globalAlpha = 0.85; c.lineWidth = 2.6; c.beginPath(); c.moveTo(m * 0.45, ch - b * 0.8); c.quadraticCurveTo(cw / 2, ch - b * 0.62, cw - m * 0.45, ch - b * 0.8);   // the moulding
    c.moveTo(m * 0.45, ch - b * 0.8); c.quadraticCurveTo(m * 0.1, ch - b * 0.6, 3, ch - b * 0.42); c.lineTo(cw - 3, ch - b * 0.42); c.quadraticCurveTo(cw - m * 0.1, ch - b * 0.6, cw - m * 0.45, ch - b * 0.8);
    c.moveTo(3, ch - b * 0.42); c.lineTo(3, ch - 3); c.lineTo(cw - 3, ch - 3); c.lineTo(cw - 3, ch - b * 0.42); c.stroke();
    c.globalAlpha = 1; c.globalCompositeOperation = 'destination-in'; c.fillStyle = g; c.fillRect(0, 0, cw, ch); c.globalCompositeOperation = 'source-over'; }, { turn: false, live: true, far: 60, near: 40 });

  const man = P.walker('man', MX, P.Z - DM, false, 3.55, { fadeNear: false, turn: false, gain: 1.5, sil: 0.95 });
  const e1 = P.walker('elder1', at(6.5, 30), P.Z - 6.5, false, 3.0, { fadeNear: false, turn: false, gain: 1.2, sil: 0.92 });
  const e2 = P.walker('elder2', at(4.6, 115), P.Z - 4.6, false, 3.0, { fadeNear: false, turn: false, gain: 1.25, sil: 1 });
  const manY = man.mesh.position.y;
  P.keep(man, { h: 4 });
  return { update(t) {
    const inK = seg(t, P.T.start, P.T.arrive), out = 1 - seg(t, P.T.leave, P.T.leave + L * 0.8), moving = t >= go;
    pillar.mesh.material.opacity = clamp(inK * 2) * out;      // solid before he shows, so he never shows through it
    e1.u.uA.value = e2.u.uA.value = inK * out;
    man.mesh.position.x = MX + Math.max(0, t - go) * SP;
    P.gait(man, moving, t); if (!moving) man.mesh.position.y = manY;
    man.u.uA.value = clamp((inK - 0.5) * 2) * out;
  } };
}
