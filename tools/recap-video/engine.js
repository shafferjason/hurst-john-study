// John recap video — drawing engine. Deterministic: renderAt(t) draws the frame for time t (seconds).
// Coordinates are a fixed 1920x1080 stage. Scenes live in scenes.js.
'use strict';

const W = 1920, H = 1080;
const GOLD = '#d4a574', GOLD_HI = '#f0d4a8', INK = '#e0ddd5', DIM = '#5c5446', BG = '#0f0f0f', WINE = '#8e2a3a';
const SERIF = 'Georgia, "Iowan Old Style", "Times New Roman", serif';

// ---------- math ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeIn = t => t * t * t;
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const back = t => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
// progress of p within [a,b], eased
const seg = (p, a, b, ease = easeInOut) => ease(clamp((p - a) / (b - a)));

// deterministic noise for the hand-drawn wobble
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
let _seed = 1;
function jitter(amp) { _seed++; return (hash(_seed) - 0.5) * 2 * amp; }

// ---------- shapes: arrays of polylines, revealed by drawn length ----------
function wob(pts, amp = 1.3) { return pts.map(([x, y]) => [x + jitter(amp), y + jitter(amp)]); }
const S = {
  line: (x1, y1, x2, y2, n = 12) => { const p = []; for (let i = 0; i <= n; i++) p.push([lerp(x1, x2, i / n), lerp(y1, y2, i / n)]); return wob(p); },
  poly: (pts, closed = false) => { const p = []; const all = closed ? [...pts, pts[0]] : pts; for (let i = 0; i < all.length - 1; i++) { const [a, b] = [all[i], all[i + 1]]; for (let k = 0; k < 8; k++) p.push([lerp(a[0], b[0], k / 8), lerp(a[1], b[1], k / 8)]); } p.push(all[all.length - 1]); return wob(p); },
  rect: (x, y, w, h) => S.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true),
  arc: (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, n = 72) => { const p = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return wob(p, 1.0); },
  circle: (cx, cy, r, n = 72) => S.arc(cx, cy, r, r, -Math.PI / 2, Math.PI * 1.5, n),
  bez: (p0, p1, p2, p3, n = 40) => { const p = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; p.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return wob(p, 0.8); },
  wave: (x1, x2, y, amp, waves, n = 120) => { const p = []; for (let i = 0; i <= n; i++) { const t = i / n; p.push([lerp(x1, x2, t), y + Math.sin(t * Math.PI * 2 * waves) * amp]); } return wob(p, 0.6); },
};
function plen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }

function strokePts(ctx, pts, upto) {
  if (pts.length < 2 || upto <= 0) return;
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + d >= upto) { const t = (upto - acc) / d; ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)); break; }
    ctx.lineTo(pts[i][0], pts[i][1]); acc += d;
  }
  ctx.stroke();
}
// draw a list of polylines in sequence, revealing `prog` (0..1) of their combined length
function draw(ctx, shapes, prog, o = {}) {
  if (prog <= 0) return;
  ctx.save();
  ctx.strokeStyle = o.color || GOLD; ctx.lineWidth = o.width || 3.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.globalAlpha *= (o.alpha ?? 1);
  if (o.glow !== false) { ctx.shadowColor = 'rgba(240,212,168,0.45)'; ctx.shadowBlur = o.blur ?? 10; }
  const lens = shapes.map(plen); const total = lens.reduce((a, b) => a + b, 0);
  let budget = clamp(prog) * total;
  for (let i = 0; i < shapes.length && budget > 0; i++) { strokePts(ctx, shapes[i], Math.min(budget, lens[i])); budget -= lens[i]; }
  ctx.restore();
}
function fillPoly(ctx, pts, color, alpha = 1) { ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill(); ctx.restore(); }

// ---------- text ----------
function font(size, o = {}) { return `${o.italic ? 'italic ' : ''}${o.bold ? 'bold ' : ''}${size}px ${SERIF}`; }
function txt(ctx, s, x, y, size, o = {}) {
  const a = o.alpha ?? 1; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.font = font(size, o); ctx.fillStyle = o.color || INK;
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  if (o.glow) { ctx.shadowColor = 'rgba(240,212,168,0.7)'; ctx.shadowBlur = o.glow; }
  if (o.spacing) ctx.letterSpacing = o.spacing + 'px';
  ctx.translate(x, y + (o.dy || 0)); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot);
  ctx.fillText(s, 0, 0); ctx.restore();
}
function measure(ctx, s, size, o = {}) { ctx.save(); ctx.font = font(size, o); if (o.spacing) ctx.letterSpacing = o.spacing + 'px'; const w = ctx.measureText(s).width; ctx.restore(); return w; }
// words rise in one after another across [a,b] of p. per-word style hook: o.style(word,i) -> extra opts
function words(ctx, s, x, y, size, p, a, b, o = {}) {
  const ws = s.split(' '); const space = measure(ctx, ' ', size, o);
  const widths = ws.map(w => measure(ctx, w, size, { ...o, ...(o.style ? o.style(w, 0) : {}) }));
  const total = widths.reduce((q, w) => q + w, 0) + space * (ws.length - 1);
  let cx = o.align === 'left' ? x : x - total / 2;
  ws.forEach((w, i) => {
    const k = seg(p, lerp(a, b, i / ws.length), lerp(a, b, (i + 1) / ws.length) + (b - a) * 0.25, easeOut);
    const extra = o.style ? o.style(w, i) : {};
    txt(ctx, w, cx, y, size, { ...o, ...extra, align: 'left', alpha: k * (o.alpha ?? 1) * (extra.alpha ?? 1), dy: (1 - k) * 18 });
    cx += widths[i] + space;
  });
}

// ---------- the chapter track (structure signal, always on screen) ----------
// stations: 0 = Foundations, 1..21 = John chapters
const TRACK = { x0: 200, x1: 1720, y: 1000 };
const stationX = i => lerp(TRACK.x0, TRACK.x1, i / 21);
function drawTrack(ctx, litTo, alpha = 1, drawIn = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  const xEnd = lerp(TRACK.x0, TRACK.x1, drawIn);
  ctx.lineCap = 'round';
  ctx.strokeStyle = DIM; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(TRACK.x0, TRACK.y); ctx.lineTo(xEnd, TRACK.y); ctx.stroke();
  const litX = Math.min(xEnd, stationX(litTo));
  if (litTo >= 0) { ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(240,212,168,0.5)'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.moveTo(TRACK.x0, TRACK.y); ctx.lineTo(litX, TRACK.y); ctx.stroke(); ctx.shadowBlur = 0; }
  for (let i = 0; i <= 21; i++) {
    const x = stationX(i); if (x > xEnd + 0.5) break;
    const lit = i <= Math.floor(litTo + 1e-6);
    ctx.fillStyle = lit ? GOLD : DIM;
    ctx.beginPath(); if (i === 0) { ctx.moveTo(x, TRACK.y - 7); ctx.lineTo(x + 7, TRACK.y); ctx.lineTo(x, TRACK.y + 7); ctx.lineTo(x - 7, TRACK.y); } else ctx.arc(x, TRACK.y, 4.5, 0, Math.PI * 2); ctx.fill();
    txt(ctx, i === 0 ? 'intro' : String(i), x, TRACK.y + 30, i === 0 ? 18 : 21, { color: lit ? GOLD : DIM, italic: i === 0 });
  }
  ctx.restore();
}
function drawMarker(ctx, pos, alpha = 1, pulse = 0) {
  const x = lerp(TRACK.x0, TRACK.x1, pos / 21);
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = GOLD_HI; ctx.shadowColor = 'rgba(240,212,168,0.9)'; ctx.shadowBlur = 18 + 22 * pulse;
  ctx.beginPath(); ctx.arc(x, TRACK.y, 8 + 4 * pulse, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

function background(ctx) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * 0.42, 100, W / 2, H * 0.45, 1100);
  g.addColorStop(0, 'rgba(60,44,28,0.55)'); g.addColorStop(0.6, 'rgba(25,19,13,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
