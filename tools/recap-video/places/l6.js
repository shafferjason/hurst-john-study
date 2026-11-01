// Lesson 6: God couldn't wave sin away, so he came and paid for it himself. S (deliberate symbol): a scroll of red debt marks lies over a
// kneeling man's back. A man standing beside him, out of frame, reaches down at human height and lifts it off. The marks go, no dripping;
// one still mark rests in his open palm. The kneeling man rises. One detail: the palm with the one mark. Never a hand from above: that reads as God.
import * as THREE from 'three';
export default async function (P) {
  await P.loadArt();
  const RED = '#c8453c', D = 5.1, Z = P.Z - D, MX = P.X - 0.15, L = P.beats(1), ease = P.smooth;
  const comes = P.ev('arm comes', 0, 3), takes = P.ev('arm takes the scroll', 1, 1), gone = P.evs('marks go', 1, 2, 3, 1), key = P.ev('key', 2, 1);
  // the man, from behind. Same feet for both poses, so he comes up from where he knelt.
  const KH = 1.8, SH = 3.4, kneel = P.walker('kneel', MX, Z, false, KH, { fadeNear: false, far: 24, near: 9, drawn: false, sil: 1, turn: false }), stand = P.walker('stand', MX, Z, false, SH, { fadeNear: false, sil: 1, turn: false });
  // the scroll lies across his shoulders and down his back, so it rests on him until a hand lifts it
  const SHH = 1.45, ROD0 = 1.46, ROD_V = 0.43, sc = P.art('scroll', MX, Z + 0.1, SHH, { y0: ROD0 - ROD_V - SHH / 2 + SHH / 2, far: 24, near: 9, sil: 0.97, gain: 1.35, turn: false, fadeNear: false });
  const SW = sc.wU, PX = 320, marks = [];
  for (let r = 0; r < 5; r++) for (let k = 0; k < 5 - (r === 2 ? 1 : 0); k++) marks.push([0.33 + k * 0.085 + 0.006 * Math.sin(r * 7 + k * 3), 0.24 + r * 0.125 + 0.007 * Math.sin(r * 3 + k * 11), r === 2 && k === 2 ? 3 : r < 2 ? 0 : r < 4 ? 1 : 2]);
  const goneAt = [...gone, key];   // three groups of marks one beat each; the last single mark stays until the palm opens
  const ink = P.thing(MX, Z + 0.12, SW, SHH, PX, (c, p, t) => { const W = c.canvas.width, H = c.canvas.height; c.lineCap = 'round'; c.strokeStyle = RED; c.lineWidth = 8;
    for (const [u, v, g] of marks) { c.globalAlpha = seg(p, 0.6, 1) * (1 - seg(t, goneAt[g], goneAt[g] + L * 0.8)); c.beginPath(); c.moveTo(u * W + 5, v * H - 12); c.lineTo(u * W - 5, v * H + 12); c.stroke(); } c.globalAlpha = 1;
  }, { live: true, turn: false, far: 24, near: 9 });
  // the arm: sleeve to the shoulder, closed then open. The mark is part of the palm, so it stays with the arm on the trail at the end.
  const AH = 1.75, TILT = 0.2, arm = P.art('armtake', 0, Z + 0.2, AH, { map2: 'armopen', drawn: true, turn: false, sil: 0.97, gain: 1.3, fadeNear: false }), AW = arm.wU;
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; const cx = cv.getContext('2d'); cx.lineCap = 'round'; cx.strokeStyle = RED; cx.lineWidth = 20; cx.shadowColor = RED; cx.shadowBlur = 8; cx.beginPath(); cx.moveTo(74, 38); cx.lineTo(54, 90); cx.stroke();
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const mk = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.24), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false })); mk.position.set((0.165 - 0.5) * AW, (0.5 - 0.5) * AH, 0.02); mk.renderOrder = 6; arm.mesh.renderOrder = 5; arm.mesh.add(mk);
  let markK = 0; mk.onBeforeRender = () => { mk.material.opacity = markK * arm.u.uA.value; };
  const FU = (0.125 - 0.5) * AW, FV = 0.03 * AH, co = Math.cos(TILT), si = Math.sin(TILT), RX = SW * 0.3;   // where the fist sits in the drawing; it grips the rod near its end
  arm.mesh.rotation.z = TILT;
  const GRIP = MX + RX, LIFTX = 0.8, LIFTY = 0.85;
  P.keep(arm, { h: 1.5 });
  return { update(t) {
    const inK = ease(seg(t, comes, takes, x => x)), up = ease(seg(t, takes, takes + L * 3, x => x)), fx = lerp(P.X + 3.6, GRIP, inK) + LIFTX * up, fy = lerp(ROD0 + 0.75, ROD0, inK) + LIFTY * up;
    const out = t > P.T.end ? 0 : seg(t, P.T.leave, P.T.leave + L), rise = ease(seg(t, key, key + L * 2, x => x));
    arm.mesh.position.set(fx - (FU * co - FV * si), fy - (FU * si + FV * co), Z + 0.2); arm.u.uA.value = seg(t, comes, comes + L) * (1 - out); arm.u.uMix.value = seg(t, key, key + L * 0.6);
    markK = seg(t, key, key + L * 0.5);
    // the scroll goes where the hand takes it, hanging straight down from the fist
    const sx = MX + LIFTX * up, sy = ROD0 + LIFTY * up + SHH * (0.5 - 0.93), so = 1 - seg(t, key, key + L);
    sc.mesh.position.x = sx; sc.mesh.position.y = sy; ink.mesh.position.x = sx; ink.mesh.position.y = sy; sc.u.uA.value = so; ink.mesh.material.opacity = so;
    const r0 = KH / SH, s = lerp(r0, 1, rise); stand.mesh.scale.set(s, s, 1); stand.mesh.position.y = stand.hU * s / 2; stand.u.uA.value = seg(t, key, key + L) * (1 - out);
    kneel.u.uA.value = (1 - seg(t, key, key + L)) * (1 - out);
  } };
}
