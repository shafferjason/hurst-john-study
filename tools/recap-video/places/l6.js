// Lesson 6: God couldn't wave sin away, so he came and paid for it himself. S (deliberate symbol): a scroll of red debt marks hangs
// over a kneeling man. An arm reaches in and takes it; the marks go off the scroll, no dripping; one still mark rests in the open palm.
// The man rises. One detail: the palm with the one mark. Nothing is waved away: the mark is still there, on the hand that took it.
import * as THREE from 'three';
export default async function (P) {
  await P.loadArt();
  const RED = '#c8453c', D = 5.1, Z = P.Z - D, X = P.X, L = P.beats(1), ease = P.smooth;
  const comes = P.ev('arm comes', 0, 3), takes = P.ev('arm takes the scroll', 1, 1), gone = P.evs('marks go', 1, 2, 3, 1), key = P.ev('key', 2, 1);
  // the man, from behind. Same feet for both poses, so he comes up from where he knelt.
  const KH = 1.55, SH = 3.0, kneel = P.walker('kneel', X, Z + 0.2, false, KH, { fadeNear: false, far: 24, near: 9, drawn: false, sil: 1, turn: false }), stand = P.walker('stand', X, Z + 0.2, false, SH, { fadeNear: false, sil: 1, turn: false });
  // the scroll, hanging over him: the approved symbol
  const SHH = 2.0, sc = P.art('scroll', X, Z, SHH, { y0: 1.55, far: 24, near: 9, sil: 0.97, gain: 1.35, turn: false, fadeNear: false });
  const SW = sc.wU, PX = 320, marks = [];
  for (let r = 0; r < 6; r++) for (let k = 0; k < 7 - (r % 3 === 2 ? 2 : 0); k++) marks.push([0.32 + k * 0.062 + 0.006 * Math.sin(r * 7 + k * 3), 0.235 + r * 0.095 + 0.007 * Math.sin(r * 3 + k * 11), r === 3 && k === 3 ? 3 : r < 2 ? 0 : r < 4 ? 1 : 2]);
  const goneAt = [...gone, key];   // three rows of marks one beat each; the last single mark stays until the palm opens
  const ink = P.thing(X, Z + 0.02, SW, SHH, PX, (c, p, t) => { const W = c.canvas.width, H = c.canvas.height; c.lineCap = 'round'; c.strokeStyle = RED; c.lineWidth = 8;
    for (const [u, v, g] of marks) { c.globalAlpha = seg(p, 0.6, 1) * (1 - seg(t, goneAt[g], goneAt[g] + L * 0.8)); c.beginPath(); c.moveTo(u * W + 5, v * H - 12); c.lineTo(u * W - 5, v * H + 12); c.stroke(); } c.globalAlpha = 1;
  }, { live: true, turn: false, y0: 1.55, far: 24, near: 9 });
  // the arm comes in from the edge: gripping, then open. The mark is part of the palm, so it stays with the arm on the trail at the end.
  const AH = 1.52, arm = P.art('armtake', 0, Z + 0.1, AH, { map2: 'armopen', drawn: true, turn: false, sil: 0.97, gain: 1.35, fadeNear: false }), AW = arm.wU;
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; const cx = cv.getContext('2d'); cx.lineCap = 'round'; cx.strokeStyle = RED; cx.lineWidth = 20; cx.shadowColor = RED; cx.shadowBlur = 8; cx.beginPath(); cx.moveTo(74, 38); cx.lineTo(54, 90); cx.stroke();
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const mk = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false })); mk.position.set((0.27 - 0.5) * AW, (0.5 - 0.5) * AH, 0.02); arm.mesh.add(mk);
  let markK = 0; mk.onBeforeRender = () => { mk.material.opacity = markK * arm.u.uA.value; };
  const ROD = 1.55 + SHH * 0.93, GRIP = X + 0.28, AWAY = 0.62, armX = u => u + (0.5 - 0.235) * AW;
  P.keep(arm, { h: 1.7 });
  return { update(t) {
    const inK = ease(seg(t, comes, takes, x => x)), away = ease(seg(t, takes, takes + L * 3, x => x)), fx = lerp(X + 3.6, GRIP, inK) + AWAY * away;
    const out = t > P.T.end ? 0 : seg(t, P.T.leave, P.T.leave + L), rise = ease(seg(t, key, key + L * 2, x => x));
    arm.mesh.position.set(armX(fx), ROD - 0.32 * ease(seg(t, key, key + L, x => x)), Z + 0.1); arm.u.uA.value = seg(t, comes, comes + L) * (1 - out); arm.u.uMix.value = seg(t, key, key + L * 0.6);
    markK = seg(t, key, key + L * 0.5);
    const sx = X + AWAY * away, so = 1 - seg(t, key, key + L); sc.mesh.position.x = sx; ink.mesh.position.x = sx; sc.u.uA.value = so; ink.mesh.visible = ink.mesh.visible && so > 0.003; ink.mesh.material.opacity = so;
    const r0 = KH / SH, s = lerp(r0, 1, rise); stand.mesh.scale.set(s, s, 1); stand.mesh.position.y = stand.hU * s / 2; stand.u.uA.value = seg(t, key, key + L) * (1 - out);
    kneel.u.uA.value = (1 - seg(t, key, key + L)) * (1 - out);
  } };
}
