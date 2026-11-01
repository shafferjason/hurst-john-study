// John recap video — lessons 5-31. Same contract as scenes.js. Words grounded in data.js summaries.
'use strict';

// ---------- shared drawings ----------
function figure(x, y, s = 1) { // simple robed figure, feet at (x,y)
  return [S.circle(x, y - 150 * s, 22 * s, 40), S.bez([x - 10 * s, y - 126 * s], [x - 40 * s, y - 70 * s], [x - 50 * s, y - 20 * s], [x - 55 * s, y]),
    S.bez([x + 10 * s, y - 126 * s], [x + 40 * s, y - 70 * s], [x + 50 * s, y - 20 * s], [x + 55 * s, y]), S.line(x - 55 * s, y, x + 55 * s, y, 8)];
}
function typed(ctx, s, x, y, size, k, o = {}) { const n = Math.round(clamp(k) * s.length); if (n > 0) txt(ctx, s.slice(0, n), x, y, size, { align: 'left', ...o }); }
function jarShape(cx, base, w = 70, h = 150) {
  const L = S.bez([cx - w * 0.45, base - h], [cx - w * 1.1, base - h * 0.75], [cx - w * 0.9, base - h * 0.1], [cx - w * 0.5, base], 30);
  const R = S.bez([cx + w * 0.45, base - h], [cx + w * 1.1, base - h * 0.75], [cx + w * 0.9, base - h * 0.1], [cx + w * 0.5, base], 30);
  return { L, R, outline: [L, R, S.line(cx - w * 0.5, base, cx + w * 0.5, base, 6), S.arc(cx, base - h, w * 0.45, 8)], poly: [...L, ...R.slice().reverse()] };
}
function footprint(ctx, x, y, a, alpha) { ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = GOLD; ctx.beginPath(); ctx.ellipse(0, 0, 7, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, -19, 5, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
function flame(ctx, x, y, h, t, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.shadowColor = 'rgba(255,190,110,0.9)'; ctx.shadowBlur = 24;
  const sway = Math.sin(t * 9 + x) * h * 0.08, g = ctx.createLinearGradient(0, y, 0, y - h); g.addColorStop(0, '#e08a3c'); g.addColorStop(1, GOLD_HI);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - h * 0.28, y); ctx.bezierCurveTo(x - h * 0.4, y - h * 0.5, x + sway, y - h * 0.7, x + sway * 1.5, y - h);
  ctx.bezierCurveTo(x + h * 0.15 + sway, y - h * 0.6, x + h * 0.4, y - h * 0.4, x + h * 0.28, y); ctx.closePath(); ctx.fill(); ctx.restore();
}
function strike(ctx, x, y, w, k, color = GOLD_HI) { draw(ctx, [S.line(x - w / 2, y + 4, x + w / 2, y - 4, 10)], k, { color, width: 4 }); }

// ---------- JOHN 1 ----------
add({
  lesson: 5, station: 1, ref: 'The Prologue', fn(ctx, p) {
    const x = 470;
    txt(ctx, 'Genesis 1:1', x, 290, 26, { align: 'left', color: GOLD, italic: true, alpha: seg(p, 0, 0.08) });
    typed(ctx, 'In the beginning, God created…', x, 350, 58, seg(p, 0.02, 0.24, t => t), { color: INK });
    txt(ctx, 'John 1:1', x, 460, 26, { align: 'left', color: GOLD, italic: true, alpha: seg(p, 0.22, 0.28) });
    typed(ctx, 'In the beginning was the Word…', x, 520, 58, seg(p, 0.24, 0.46, t => t), { color: INK });
    const hl = seg(p, 0.48, 0.6); const w = measure(ctx, 'In the beginning', 58);
    if (hl > 0) { txt(ctx, 'In the beginning', x, 350, 58, { align: 'left', color: GOLD_HI, glow: 18 * hl, alpha: hl }); txt(ctx, 'In the beginning', x, 520, 58, { align: 'left', color: GOLD_HI, glow: 18 * hl, alpha: hl }); }
    draw(ctx, [S.bez([x + w + 20, 365], [x + w + 70, 400], [x + w + 70, 475], [x + w + 20, 505])], seg(p, 0.52, 0.62), { width: 3 });
    words(ctx, 'said again, on purpose.', W / 2, 740, 70, p, 0.64, 0.8, { italic: true, color: GOLD_HI });
  },
});
add({
  lesson: 6, station: 1, ref: 'The Necessity of the Incarnation', fn(ctx, p) {
    const k = seg(p, 0.22, 0.4);
    txt(ctx, 'Word', W / 2, 380, 140, { color: GOLD_HI, glow: 20, alpha: seg(p, 0, 0.1) * (1 - k), scale: 1 - 0.5 * k });
    draw(ctx, figure(W / 2, 520, 1.25), seg(p, 0.3, 0.5), { width: 3.4 });
    words(ctx, 'The Word became flesh.', W / 2, 650, 64, p, 0.36, 0.52, { style: w => (w === 'flesh.' ? { color: GOLD_HI, glow: 12 } : { color: INK }) });
    words(ctx, 'Why not simply pardon?', W / 2, 790, 58, p, 0.64, 0.8, { italic: true, color: GOLD });
  },
});
add({
  lesson: 7, station: 1, ref: 'The Voice in the Wilderness', fn(ctx, p, t) {
    const c = seg(p, 0.02, 0.32, t => t), out = 1 - seg(p, 0.38, 0.44);
    for (let i = 0; i < 6; i++) { // flipping pages
      const f = clamp(c * 6 - i); const sx = Math.cos(f * Math.PI);
      ctx.save(); ctx.globalAlpha *= out * 0.8; ctx.translate(W / 2, 360); ctx.scale(sx, 1);
      ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.strokeRect(0, -110, 170, 220); ctx.restore();
    }
    txt(ctx, String(Math.round(c * 400)), W / 2, 560, 90, { color: GOLD_HI, glow: 12, alpha: out });
    txt(ctx, 'years of silence', W / 2, 640, 40, { italic: true, color: GOLD, alpha: out * seg(p, 0.1, 0.2) });
    const titles = ['Messiah?', 'Elijah?', 'The Prophet?'], xs = [560, 960, 1380];
    titles.forEach((s, i) => {
      const a = seg(p, 0.42 + i * 0.05, 0.48 + i * 0.05) * (1 - seg(p, 0.7, 0.76));
      txt(ctx, s, xs[i], 380, 62, { color: INK, alpha: a });
      if (a > 0) strike(ctx, xs[i], 380, measure(ctx, s, 62) + 20, seg(p, 0.55 + i * 0.04, 0.6 + i * 0.04));
    });
    const v = seg(p, 0.74, 0.86);
    draw(ctx, [S.wave(560, 1360, 420, 26 * (0.6 + 0.4 * Math.sin(t * 6)), 7)], v, { color: GOLD, width: 2.5, alpha: 0.7 });
    txt(ctx, 'A voice.', W / 2, 600, 110, { italic: true, color: GOLD_HI, glow: 20, alpha: v, scale: lerp(0.8, 1, v) });
  },
});
add({
  lesson: 8, station: 1, ref: 'Decoding "The Prophet"', fn(ctx, p) {
    const sh = seg(p, 0.2, 0.5);
    fillPoly(ctx, [[540, 560], [560, 560], [lerp(560, 1290, sh), 560 - 30 * sh], [lerp(540, 1250, sh), 560 - 36 * sh]], GOLD, 0.25);
    draw(ctx, figure(550, 560, 0.8), seg(p, 0, 0.2), { width: 3 });
    txt(ctx, 'Moses', 550, 610, 30, { italic: true, color: GOLD, alpha: seg(p, 0.12, 0.2) });
    draw(ctx, figure(1340, 560, 1.5), seg(p, 0.42, 0.62), { width: 3.5, color: GOLD_HI, blur: 22 });
    words(ctx, 'Shadows of someone still coming.', W / 2, 780, 64, p, 0.6, 0.8, { color: GOLD_HI });
  },
});
add({
  lesson: 9, station: 1, ref: 'The Testimony of John', fn(ctx, p, t) {
    for (let i = 0; i < 7; i++) {
      const a = seg(p, 0.02 + i * 0.04, 0.06 + i * 0.04), x = 560 + i * 133;
      draw(ctx, [S.rect(x - 45, 250, 90, 90)], a, { width: 2.4 });
      txt(ctx, 'day ' + (i + 1), x, 295, 24, { italic: true, color: GOLD, alpha: a });
    }
    txt(ctx, 'A new creation week.', W / 2, 420, 52, { color: INK, alpha: seg(p, 0.3, 0.38) * (1 - seg(p, 0.5, 0.55)) });
    const d = seg(p, 0.42, 0.66, easeOut), dy = lerp(-80, 470, d) + Math.sin(t * 3) * 6 * d, flap = Math.sin(t * 10) * 18 * (1 - d * 0.7);
    draw(ctx, [S.bez([W / 2, dy], [W / 2 - 60, dy - 50 - flap], [W / 2 - 110, dy - 30 - flap], [W / 2 - 150, dy - 60 - flap], 20),
      S.bez([W / 2, dy], [W / 2 + 60, dy - 50 - flap], [W / 2 + 110, dy - 30 - flap], [W / 2 + 150, dy - 60 - flap], 20),
      S.arc(W / 2, dy + 8, 26, 12, 0, Math.PI * 2, 30)], seg(p, 0.42, 0.5), { color: GOLD_HI, width: 3.4, blur: 18 });
    words(ctx, 'The Spirit remained.', W / 2, 720, 72, p, 0.66, 0.82, { italic: true, color: GOLD_HI });
  },
});
add({
  lesson: 10, station: 1, ref: 'The Calling of the First Disciples', fn(ctx, p, t) {
    const o = seg(p, 0.02, 0.24, back);
    [760, 1160].forEach(x => {
      ctx.save(); ctx.translate(x, 360); ctx.scale(1, Math.max(0.04, o));
      draw(ctx, [S.bez([-130, 0], [-60, -90], [60, -90], [130, 0], 30), S.bez([-130, 0], [-60, 90], [60, 90], [130, 0], 30)], 1, { width: 3.4 });
      ctx.restore();
      if (o > 0.6) { ctx.save(); ctx.fillStyle = GOLD_HI; ctx.shadowColor = GOLD_HI; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(x + Math.sin(t * 2) * 8, 360, 30 * o, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    });
    for (let i = 0; i < 12; i++) { const x = 300 + i * 115, y = 600 + (i % 2) * 34; footprint(ctx, x, y, Math.PI / 2, seg(p, 0.3 + i * 0.022, 0.33 + i * 0.022)); }
    words(ctx, 'Come and see.', W / 2, 790, 96, p, 0.58, 0.74, { italic: true, color: GOLD_HI, glow: 14 });
  },
});

// ---------- JOHN 2 ----------
add({
  lesson: 11, station: 2, ref: 'The First Sign', fn(ctx, p) {
    const fill = seg(p, 0.18, 0.48), wine = seg(p, 0.5, 0.68);
    const col = `rgb(${lerp(120, 142, wine)},${lerp(150, 42, wine)},${lerp(165, 58, wine)})`;
    for (let i = 0; i < 6; i++) {
      const cx = 520 + i * 176, base = 600, j = jarShape(cx, base);
      draw(ctx, j.outline, seg(p, i * 0.025, 0.14 + i * 0.025), { width: 2.8 });
      if (fill > 0) { ctx.save(); ctx.beginPath(); j.poly.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip(); ctx.fillStyle = col; ctx.globalAlpha *= 0.85; ctx.fillRect(cx - 120, base - 150 * fill - 2, 240, 160); ctx.restore(); }
    }
    const wc = `rgb(${lerp(170, 200, wine)},${lerp(195, 70, wine)},${lerp(210, 85, wine)})`;
    txt(ctx, wine < 0.5 ? 'water' : 'wine', W / 2, 330, 76, { italic: true, color: wc, glow: 10, alpha: seg(p, 0.22, 0.3) * (1 - seg(p, 0.76, 0.8)) });
    txt(ctx, '120–180 gallons', W / 2, 650, 34, { italic: true, color: GOLD, alpha: seg(p, 0.4, 0.48) * 0.8 });
    words(ctx, 'The first sign.', W / 2, 790, 80, p, 0.7, 0.82, { color: GOLD_HI, glow: 10 });
  },
});
add({
  lesson: 12, station: 2, ref: 'Overturning the Tables', fn(ctx, p) {
    const f = seg(p, 0.3, 0.5, easeIn), gone = 1 - seg(p, 0.56, 0.64);
    ctx.save(); ctx.globalAlpha *= gone; ctx.translate(1120, 520); ctx.rotate(f * Math.PI * 0.6); ctx.translate(-1120, -520);
    draw(ctx, [S.line(800, 420, 1120, 420, 20), S.line(830, 420, 830, 520, 8), S.line(1090, 420, 1090, 520, 8)], seg(p, 0, 0.16), { width: 3.6 });
    ctx.restore();
    for (let i = 0; i < 14; i++) {
      const tt = clamp((p - 0.36) / 0.3), vx = (hash(i) - 0.5) * 1100, vy = -260 - hash(i + 9) * 300;
      const x = 820 + i * 20 + vx * tt, y = 405 + vy * tt + 700 * tt * tt;
      ctx.save(); ctx.globalAlpha *= gone;
      if (p < 0.36) { if (p > 0.12) { ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(840 + i * 18, 408, 8, 0, Math.PI * 2); ctx.fill(); } }
      else if (y < 660) { ctx.translate(x, y); ctx.scale(Math.cos(tt * 12 + i), 1); ctx.fillStyle = GOLD_HI; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    words(ctx, 'Overturning the tables.', W / 2, 260, 60, p, 0.08, 0.26, { color: INK, alpha: 1 - seg(p, 0.6, 0.66) });
    words(ctx, 'Why? Holiness.', W / 2, 780, 86, p, 0.64, 0.8, { style: w => (w === 'Holiness.' ? { color: GOLD_HI, glow: 18 } : { color: INK, italic: true }) });
  },
});

// ---------- JOHN 3 ----------
add({
  lesson: 13, station: 3, ref: 'Born of Water and Spirit', fn(ctx, p, t) {
    draw(ctx, [S.arc(1560, 210, 70, 70, -Math.PI * 0.6, Math.PI * 0.6, 40), S.bez([1560 + 70 * Math.cos(Math.PI * 0.6), 210 + 70 * Math.sin(Math.PI * 0.6)], [1610, 230], [1610, 190], [1560 + 70 * Math.cos(-Math.PI * 0.6), 210 + 70 * Math.sin(-Math.PI * 0.6)], 20)], seg(p, 0, 0.15), { width: 2.6 });
    txt(ctx, 'by night', 1560, 320, 26, { italic: true, color: GOLD, alpha: seg(p, 0.08, 0.15) * 0.8 });
    words(ctx, 'Born again.', W / 2, 260, 84, p, 0.06, 0.2, { color: GOLD_HI, glow: 12 });
    const m = seg(p, 0.42, 0.66), lx = lerp(620, 1300, m);
    draw(ctx, [S.arc(lx, 520, 80, 34, 0, Math.PI * 2, 50), S.bez([lx + 78, 510], [lx + 120, 490], [lx + 130, 500], [lx + 150, 492], 12), S.line(lx - 30, 554, lx + 30, 554, 4)], seg(p, 0.22, 0.36), { width: 3 });
    flame(ctx, lx + 150, 492, 60, t, seg(p, 0.34, 0.4));
    txt(ctx, 'inherited', 620, 660, 46, { italic: true, color: INK, alpha: seg(p, 0.36, 0.42) * 0.8 });
    draw(ctx, [S.line(800, 660, 1100, 660, 20), S.line(1080, 645, 1100, 660, 3), S.line(1080, 675, 1100, 660, 3)], seg(p, 0.44, 0.62), { width: 3 });
    txt(ctx, 'your own', 1300, 660, 56, { italic: true, color: GOLD_HI, glow: 12, alpha: seg(p, 0.62, 0.7) });
    words(ctx, 'faith', W / 2, 800, 48, p, 0.7, 0.8, { color: GOLD, spacing: 6 });
  },
});
add({
  lesson: 14, station: 3, ref: 'Working Out the Water', fn(ctx, p) {
    words(ctx, 'Water and Spirit.', W / 2, 240, 70, p, 0.02, 0.18, { color: INK, italic: true });
    // View IV is pushed off the table first; View II (baptism saves) is the one crossed off (data.js lesson 14)
    const push = seg(p, 0.32, 0.42, easeIn);
    for (let i = 0; i < 4; i++) {
      const x = 600 + i * 240, a = seg(p, 0.14 + i * 0.04, 0.22 + i * 0.04, back);
      const off = i === 3 ? push : 0;
      ctx.save(); ctx.translate(x + off * 260, 460 + (1 - a) * 40 + off * 80); ctx.rotate(off * 0.5); ctx.globalAlpha *= clamp(a * 2) * (1 - off * 0.85);
      draw(ctx, [S.rect(-80, -110, 160, 220)], 1, { width: 2.8 }); txt(ctx, ['I', 'II', 'III', 'IV'][i], 0, 0, 56, { color: GOLD });
      ctx.restore();
    }
    const x2 = 600 + 240; draw(ctx, [S.line(x2 - 95, 330, x2 + 95, 590, 10), S.line(x2 + 95, 330, x2 - 95, 590, 10)], seg(p, 0.44, 0.56), { color: WINE, width: 7, blur: 4 });
    txt(ctx, 'four readings', W / 2, 640, 30, { italic: true, color: GOLD, alpha: seg(p, 0.3, 0.38) * 0.8 });
    words(ctx, 'Grace, not works.', W / 2, 790, 86, p, 0.62, 0.78, { style: w => (w === 'Grace,' ? { color: GOLD_HI, glow: 16 } : { color: INK }) });
  },
});
add({
  lesson: 15, station: 3, ref: 'He Must Decrease', fn(ctx, p) {
    const k = seg(p, 0.15, 0.85);
    txt(ctx, 'HE MUST INCREASE', W / 2, 430, 64, { color: GOLD_HI, glow: 10 + 20 * k, spacing: 6, alpha: seg(p, 0, 0.1), scale: lerp(0.7, 1.55, k) });
    txt(ctx, 'but I must decrease', W / 2, 640, 60, { italic: true, color: INK, alpha: seg(p, 0.05, 0.15) * lerp(1, 0.45, k), scale: lerp(1, 0.22, k) });
    txt(ctx, 'John 3:30', W / 2, 800, 26, { italic: true, color: GOLD, alpha: seg(p, 0.75, 0.85) * 0.7 });
  },
});

// ---------- JOHN 4 ----------
add({
  lesson: 16, station: 4, ref: 'The Woman at the Well', fn(ctx, p) {
    const wall = 1 - seg(p, 0.32, 0.46);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      const y = 280 + r * 60, x = 900 + c * 60 - (r % 2) * 30;
      draw(ctx, [S.rect(x, y, 60, 60)], seg(p, 0.02 + (r * 3 + c) * 0.008, 0.08 + (r * 3 + c) * 0.008), { width: 2, alpha: wall, glow: false });
    }
    [[560, 'Jews'], [1360, 'Samaritans']].forEach(([x, s]) => { txt(ctx, s, x, 380, 46, { italic: true, color: GOLD, alpha: seg(p, 0.08, 0.16) * wall }); });
    const wl = seg(p, 0.4, 0.56);
    draw(ctx, [S.arc(W / 2, 480, 150, 34, 0, Math.PI * 2), S.line(810, 480, 810, 590, 6), S.line(1110, 480, 1110, 590, 6), S.arc(W / 2, 590, 150, 34, 0, Math.PI, 30), S.line(830, 400, 830, 480, 4), S.line(1090, 400, 1090, 480, 4), S.line(830, 400, 1090, 400, 10)], wl, { width: 3 });
    const j = jarShape(1240, 600, 46, 100); draw(ctx, j.outline, seg(p, 0.54, 0.64), { width: 2.6, color: GOLD_HI });
    txt(ctx, '“Give me a drink.”', W / 2, 250, 58, { italic: true, color: INK, alpha: seg(p, 0.46, 0.54) });
    words(ctx, 'Living water: the Spirit.', W / 2, 780, 70, p, 0.64, 0.82, { style: w => (w === 'Spirit.' ? { color: GOLD_HI, glow: 14, italic: true } : { color: GOLD_HI }) });
  },
});
add({
  lesson: 17, station: 4, ref: 'He Took Him at His Word', fn(ctx, p) {
    draw(ctx, [S.line(560, 760, 940, 330, 30), S.line(1360, 760, 980, 330, 30), S.line(400, 330, 1520, 330, 30)], seg(p, 0, 0.18), { width: 2.6 });
    draw(ctx, [S.poly([[1150, 330], [1150, 290], [1180, 265], [1210, 290], [1210, 330]])], seg(p, 0.12, 0.2), { width: 2.4 });
    txt(ctx, 'home', 1180, 230, 24, { italic: true, color: GOLD, alpha: seg(p, 0.16, 0.22) * 0.7 });
    const w = seg(p, 0.2, 0.92, t => t), s = lerp(1, 0.18, w), y = lerp(720, 345, w), bob = Math.abs(Math.sin(w * 40)) * 6 * s;
    draw(ctx, figure(W / 2, y - bob, s), 1, { width: lerp(3.2, 1.6, w), alpha: seg(p, 0.18, 0.24) });
    words(ctx, 'He took him at his word.', W / 2, 160, 66, p, 0.4, 0.6, { italic: true, color: GOLD_HI, glow: 10 });
  },
});

// ---------- JOHN 5 ----------
add({
  lesson: 18, station: 5, ref: 'The Healing at Bethesda', fn(ctx, p) {
    const cols = []; for (let i = 0; i < 5; i++) { const x = 560 + i * 200; cols.push(S.line(x, 250, x, 470, 10)); }
    draw(ctx, [S.line(520, 250, 1400, 250, 20), ...cols], seg(p, 0, 0.16), { width: 2.6 });
    txt(ctx, 'five porches', W / 2, 215, 24, { italic: true, color: GOLD, alpha: seg(p, 0.1, 0.16) * 0.7 });
    draw(ctx, [S.arc(W / 2, 520, 420, 50, 0, Math.PI * 2), S.wave(620, 1300, 520, 6, 6)], seg(p, 0.08, 0.24), { width: 2.4, alpha: 0.85 });
    const r = seg(p, 0.5, 0.62), mv = seg(p, 0.62, 0.85, easeIn);
    const mx = 760 + mv * 900, mw = lerp(220, 30, r);
    draw(ctx, [S.rect(mx, 650, mw, 34), r > 0.1 ? S.circle(mx + mw + 14, 667, lerp(4, 22, r), 30) : []], seg(p, 0.14, 0.24), { width: 2.6, color: GOLD_HI });
    words(ctx, 'Do you want to be healed?', W / 2, 820, 64, p, 0.22, 0.44, { italic: true, color: INK });
    txt(ctx, 'take up your mat', W / 2, 900, 34, { italic: true, color: GOLD, alpha: seg(p, 0.6, 0.68) * 0.8 });
  },
});
add({
  lesson: 19, station: 5, ref: 'Whose Day Was It', fn(ctx, p) {
    const bx = 760, by = 470;
    draw(ctx, [S.poly([[bx, by - 90], [bx - 170, by - 110], [bx - 170, by + 80], [bx, by + 100]], true), S.poly([[bx, by - 90], [bx + 170, by - 110], [bx + 170, by + 80], [bx, by + 100]], true)], seg(p, 0, 0.16), { width: 2.8 });
    txt(ctx, 'their law', bx, by + 150, 32, { italic: true, color: GOLD, alpha: seg(p, 0.1, 0.18) * 0.8 });
    // the law's own words go out... and come straight back
    const k = seg(p, 0.2, 0.62, t => t), ang = k * Math.PI * 2;
    const x = bx + 330 * Math.sin(ang) + 260 * (1 - Math.cos(ang)) * 0.5, y = by - 40 - 200 * Math.sin(ang * 0.5);
    if (k > 0 && k < 1) txt(ctx, 'word for word', x + 120, y, 40, { italic: true, color: GOLD_HI, glow: 12, rot: Math.sin(ang) * 0.2 });
    txt(ctx, '…turned back on them', 1290, 470, 40, { italic: true, color: INK, alpha: seg(p, 0.48, 0.58) * (1 - seg(p, 0.72, 0.76)) });
    words(ctx, 'Whose day was it?', W / 2, 780, 88, p, 0.66, 0.82, { style: w => (w === 'day' ? { color: GOLD_HI, glow: 16 } : { color: INK }) });
  },
});

// ---------- JOHN 6 ----------
function loaf(x, y, s = 1) { return [S.arc(x, y, 46 * s, 24 * s, Math.PI, Math.PI * 2, 24), S.line(x - 46 * s, y, x + 46 * s, y, 6), S.line(x - 14 * s, y - 20 * s, x - 4 * s, y - 6 * s, 2), S.line(x + 8 * s, y - 20 * s, x + 18 * s, y - 6 * s, 2)]; }
function fish(x, y, s = 1) { return [S.bez([x - 50 * s, y], [x - 20 * s, y - 30 * s], [x + 20 * s, y - 24 * s], [x + 40 * s, y], 16), S.bez([x - 50 * s, y], [x - 20 * s, y + 30 * s], [x + 20 * s, y + 24 * s], [x + 40 * s, y], 16), S.poly([[x + 40 * s, y], [x + 64 * s, y - 18 * s], [x + 64 * s, y + 18 * s]], true)]; }
add({
  lesson: 20, station: 6, ref: 'The Feeding of the Five Thousand', fn(ctx, p) {
    const base = []; for (let i = 0; i < 5; i++) base.push(...loaf(700 + i * 110, 420)); base.push(...fish(1300, 400), ...fish(1300, 460));
    draw(ctx, base, seg(p, 0, 0.18), { width: 2.6 });
    const many = seg(p, 0.22, 0.5);
    for (let i = 0; i < 46; i++) {
      const a = clamp(many * 46 - i); if (a <= 0) break;
      const x = 160 + hash(i * 3) * 1600, y = 220 + hash(i * 7) * 460; if (Math.abs(y - 420) < 70 && x > 600 && x < 1400) continue;
      draw(ctx, i % 3 ? loaf(x, y, 0.45) : fish(x, y, 0.45), 1, { width: 1.8, alpha: a * 0.55 * (1 - seg(p, 0.55, 0.62)), glow: false });
    }
    for (let i = 0; i < 4; i++) {
      const x = 540 + i * 280, a = seg(p, 0.54 + i * 0.03, 0.6 + i * 0.03);
      draw(ctx, [S.poly([[x, 560], [x - 80, 548], [x - 80, 650], [x, 662]], true), S.poly([[x, 560], [x + 80, 548], [x + 80, 650], [x, 662]], true)], a, { width: 2.2 });
      draw(ctx, [S.poly([[x - 26, 600], [x - 6, 624], [x + 34, 574]])], seg(p, 0.6 + i * 0.03, 0.64 + i * 0.03), { color: GOLD_HI, width: 5 });
    }
    words(ctx, 'Here John joins the other three.', W / 2, 800, 66, p, 0.64, 0.82, { color: GOLD_HI });
  },
});
add({
  lesson: 21, station: 6, ref: 'Walking on the Water', fn(ctx, p, t) {
    for (let i = 0; i < 4; i++) draw(ctx, [S.wave(200, 1720, 560 + i * 50, 14 - i * 2, 6 + i, 160).map(([x, y]) => [x, y + Math.sin(t * 2 + x / 150 + i) * 5])], seg(p, 0, 0.2), { width: 2, alpha: 0.6 - i * 0.1, glow: false });
    draw(ctx, figure(W / 2, 555, 0.9), seg(p, 0.14, 0.3), { width: 3, color: GOLD_HI, blur: 20 });
    txt(ctx, '“It is I.”', W / 2, 280, 30, { italic: true, color: GOLD_HI, alpha: seg(p, 0.34, 0.44) });
    words(ctx, 'John tells it in a whisper.', W / 2, 820, 44, p, 0.6, 0.78, { italic: true, color: INK, alpha: 0.85 });
  },
});
add({
  lesson: 22, station: 6, ref: 'I AM — Answering the Burning Bush', fn(ctx, p, t) {
    const br = []; for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.32; br.push(S.bez([W / 2, 620], [W / 2 + Math.cos(a) * 60, 620 + Math.sin(a) * 80], [W / 2 + Math.cos(a) * 140, 620 + Math.sin(a) * 150], [W / 2 + Math.cos(a) * 200, 620 + Math.sin(a) * 190], 16)); }
    draw(ctx, br, seg(p, 0, 0.18), { width: 2.6 });
    const f = seg(p, 0.16, 0.3);
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.25, r = 150 + hash(i) * 60; flame(ctx, W / 2 + Math.cos(a) * r, 620 + Math.sin(a) * r + 20, 50 + hash(i + 4) * 50, t + i, f * 0.85); }
    const ia = seg(p, 0.34, 0.48);
    txt(ctx, 'I AM', W / 2, 240, 140, { color: GOLD_HI, glow: 20 + Math.sin(t * 8) * 8, alpha: ia, scale: lerp(1.3, 1, ia), spacing: 14 });
    txt(ctx, 'ego eimi', W / 2, 372, 34, { italic: true, color: GOLD, alpha: seg(p, 0.48, 0.56) * 0.8 });
    words(ctx, 'Answering the burning bush.', W / 2, 820, 62, p, 0.62, 0.8, { color: INK });
  },
});
add({
  lesson: 23, station: 6, ref: 'The Bread of Life', fn(ctx, p) {
    const fall = seg(p, 0, 0.36, t => t), gather = seg(p, 0.36, 0.54);
    const target = loaf(W / 2, 470, 3.2).flat();
    for (let i = 0; i < 60; i++) {
      const x0 = 260 + hash(i) * 1400, y0 = -40 + ((fall * 900 + hash(i + 50) * 600) % 640) + 120;
      const tg = target[Math.floor(hash(i + 99) * target.length)];
      const x = lerp(x0, tg[0], gather), y = lerp(y0, tg[1], gather);
      ctx.save(); ctx.globalAlpha *= (1 - seg(p, 0.5, 0.58)) * clamp(fall * 6); ctx.fillStyle = GOLD_HI; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    txt(ctx, 'manna', 1600, 200, 30, { italic: true, color: GOLD, alpha: seg(p, 0.06, 0.14) * (1 - seg(p, 0.36, 0.42)) * 0.8 });
    draw(ctx, loaf(W / 2, 470, 3.2), seg(p, 0.48, 0.6), { color: GOLD_HI, width: 3.6, blur: 18 });
    txt(ctx, 'Not a bread.', W / 2 - 280, 740, 62, { italic: true, color: INK, alpha: seg(p, 0.58, 0.64) * 0.75 });
    const th = seg(p, 0.68, 0.76);
    txt(ctx, 'THE bread.', W / 2 + 260, 740, 76, { color: GOLD_HI, glow: 16, alpha: th, scale: lerp(1.3, 1, th) });
    draw(ctx, [S.line(W / 2 + 102, 790, W / 2 + 210, 790, 10)], seg(p, 0.76, 0.84), { color: GOLD_HI, width: 5 });
  },
});
add({
  lesson: 24, station: 6, quiet: true, ref: 'This Teaching Is Hard', fn(ctx, p) {
    // many trails lead away; a few stay near the center
    for (let k = 0; k < 9; k++) {
      const stay = k === 4 || k === 5 || k === 3, dir = k < 4 ? -1 : 1;
      for (let i = 0; i < 7; i++) {
        const tt = i / 7, x = W / 2 + (k - 4) * 26 + (stay ? 0 : dir * (90 + tt * 700 * (0.5 + hash(k)))), y = 600 - (stay ? tt * 60 : tt * 260 * hash(k + 3)) + i * (stay ? 0 : 6);
        const a = stay ? seg(p, 0.1 + i * 0.03, 0.14 + i * 0.03) : seg(p, 0.08 + i * 0.05, 0.13 + i * 0.05) * (1 - seg(p, 0.55 + i * 0.03, 0.7 + i * 0.03) * 0.85);
        if (stay && i > 2) continue;
        footprint(ctx, x, y, stay ? 0 : dir * (Math.PI / 2 + 0.3), a * (stay ? 1 : 0.7));
      }
    }
    words(ctx, 'Many turned back.', W / 2, 300, 72, p, 0.3, 0.46, { color: INK });
    words(ctx, 'He did not chase them.', W / 2, 800, 62, p, 0.6, 0.78, { italic: true, color: GOLD_HI });
  },
});

// ---------- JOHN 7 ----------
add({
  lesson: 25, station: 7, ref: 'Not Even His Brothers', fn(ctx, p, t) {
    const booths = []; for (let i = 0; i < 3; i++) { const x = 560 + i * 400; booths.push(S.line(x - 110, 640, x - 110, 470, 8), S.line(x + 110, 640, x + 110, 470, 8), S.poly([[x - 140, 480], [x, 400], [x + 140, 480]])); for (let j = 0; j < 5; j++) booths.push(S.line(x - 100 + j * 50, 470 - (j % 2) * 10, x - 80 + j * 50, 430 - (j % 2) * 20, 4)); }
    draw(ctx, booths, seg(p, 0, 0.24), { width: 2.4, alpha: 0.85 });
    txt(ctx, 'the Feast of Tabernacles', W / 2, 700, 30, { italic: true, color: GOLD, alpha: seg(p, 0.18, 0.26) * 0.8 });
    const b = seg(p, 0.34, 0.46, back);
    if (b > 0) {
      ctx.save(); ctx.translate(W / 2, 250); ctx.scale(b, b);
      draw(ctx, [S.arc(0, 0, 420, 95, 0, Math.PI * 2), S.poly([[-60, 89], [-110, 155], [-10, 93]])], 1, { width: 3 });
      txt(ctx, '“Show yourself to the world.”', 0, 0, 52, { italic: true, color: GOLD_HI, glow: 12 });
      ctx.restore();
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t, r = 360 + Math.sin(t * 5 + i) * 20; ctx.save(); ctx.globalAlpha *= seg(p, 0.46, 0.52) * (1 - seg(p, 0.8, 0.9)); txt(ctx, '✦', W / 2 + Math.cos(a) * r, 250 + Math.sin(a) * r * 0.36, 30, { color: GOLD_HI }); ctx.restore(); }
    }
    words(ctx, '— his own brothers', W / 2, 820, 50, p, 0.56, 0.72, { italic: true, color: INK });
  },
});
add({
  lesson: 26, station: 7, ref: 'The Miracle or the Miracle Worker', fn(ctx, p, t) {
    const wob = seg(p, 0.4, 0.75) * Math.sin(t * 7) * 0.05, fallTop = seg(p, 0.7, 0.85, easeIn);
    ctx.save(); ctx.translate(W / 2, 640); ctx.rotate(wob); ctx.translate(-W / 2, -640);
    const rows = [3, 2, 1], cards = [];
    rows.forEach((n, r) => { for (let i = 0; i < n; i++) { const x = W / 2 - (n - 1) * 90 + i * 180, yb = 640 - r * 150; cards.push(S.poly([[x - 75, yb], [x, yb - 145], [x + 75, yb]])); } });
    draw(ctx, cards.slice(0, 5), seg(p, 0, 0.3), { width: 2.6 });
    ctx.save(); ctx.translate(W / 2 + fallTop * 300, -fallTop * 0 + fallTop * fallTop * 500); ctx.rotate(fallTop * 2.4); ctx.translate(-W / 2, 0);
    draw(ctx, [cards[5]], seg(p, 0.26, 0.32), { width: 2.6 }); ctx.restore();
    ctx.restore();
    txt(ctx, 'SIGNS', W / 2, 680, 40, { color: GOLD, spacing: 12, alpha: seg(p, 0.28, 0.36) });
    words(ctx, 'A signs-based faith', W / 2, 800, 56, p, 0.5, 0.64, { color: INK });
    words(ctx, 'is a fragile faith.', W / 2, 880, 56, p, 0.62, 0.76, { italic: true, color: GOLD_HI });
  },
});
add({
  lesson: 27, station: 7, ref: 'The Day They Did Not Pour the Water', fn(ctx, p) {
    const w = seg(p, 0.05, 0.55, t => t), x = lerp(1500, 880, w);
    [0, 220].forEach(dx => {
      draw(ctx, [...figure(x + dx, 620, 1), S.line(x + dx + 70, 380, x + dx + 70, 640, 12), S.poly([[x + dx + 60, 395], [x + dx + 70, 360], [x + dx + 80, 395]])], seg(p, 0, 0.18), { width: 3 });
      // open, empty hands
      draw(ctx, [S.arc(x + dx - 60, 520, 20, 10, 0, Math.PI, 12), S.arc(x + dx + 40, 520, 20, 10, 0, Math.PI, 12)], seg(p, 0.5, 0.6), { color: GOLD_HI, width: 3 });
    });
    txt(ctx, 'the temple guards', 520, 400, 34, { italic: true, color: GOLD, alpha: seg(p, 0.15, 0.24) * 0.8 });
    words(ctx, 'They came back empty-handed.', W / 2, 800, 66, p, 0.56, 0.76, { style: w => (w === 'empty-handed.' ? { color: GOLD_HI, glow: 12, italic: true } : { color: INK }) });
  },
});

// ---------- JOHN 8 ----------
add({
  lesson: 28, station: 8, ref: 'The Story John Did Not Write', fn(ctx, p, t) {
    const px = 700, py = 200, lines = [];
    for (let i = 0; i < 9; i++) lines.push(S.line(px + 40, py + 40 + i * 30, px + 480 - (i % 3) * 30, py + 40 + i * 30, 10));
    draw(ctx, [S.rect(px, py, 520, 340), ...lines], seg(p, 0, 0.18), { width: 2.2, glow: false, alpha: 0.85 });
    const s = seg(p, 0.2, 0.36, easeOut), ix = lerp(1700, px + 60, s);
    draw(ctx, [S.line(ix, 330, ix - 12, 330, 3), S.line(ix - 12, 330, ix - 12, 420, 6), S.line(ix - 12, 420, ix, 420, 3), S.line(ix + 380, 330, ix + 392, 330, 3), S.line(ix + 392, 330, ix + 392, 420, 6), S.line(ix + 392, 420, ix + 380, 420, 3),
      S.line(ix + 10, 350, ix + 370, 350, 10), S.line(ix + 10, 375, ix + 340, 375, 10), S.line(ix + 10, 400, ix + 360, 400, 10)], s > 0 ? 1 : 0, { color: GOLD_HI, width: 2.6 });
    txt(ctx, 'Not in the earliest manuscripts.', W / 2, 610, 46, { italic: true, color: INK, alpha: seg(p, 0.34, 0.42) * (1 - seg(p, 0.6, 0.64)) });
    // writing in the dust
    for (let i = 0; i < 80; i++) { ctx.save(); ctx.globalAlpha *= seg(p, 0.5, 0.56) * 0.35; ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(560 + hash(i) * 800, 700 + hash(i + 3) * 40, 2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    draw(ctx, [S.bez([800, 720], [850, 690], [900, 750], [960, 712], 20), S.bez([960, 712], [1010, 690], [1050, 740], [1110, 716], 20)], seg(p, 0.54, 0.68), { width: 3, color: GOLD_HI });
    words(ctx, 'Still in our Bibles.', W / 2, 840, 70, p, 0.66, 0.82, { color: GOLD_HI, glow: 10 });
  },
});
add({
  lesson: 29, station: 8, ref: 'I Am the Light of the World', fn(ctx, p, t) {
    const l = seg(p, 0.22, 0.55);
    if (l > 0) { ctx.save(); const g = ctx.createRadialGradient(W / 2, 470, 10, W / 2, 470, lerp(60, self.WALK_MODE ? 520 : 1300, l)); g.addColorStop(0, `rgba(240,212,168,${0.32 * l})`); g.addColorStop(1, 'rgba(240,212,168,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    draw(ctx, [S.arc(W / 2, 470, 80, 34, 0, Math.PI * 2, 50), S.bez([W / 2 + 78, 460], [W / 2 + 120, 440], [W / 2 + 130, 450], [W / 2 + 150, 442], 12)], seg(p, 0, 0.16), { width: 3 });
    flame(ctx, W / 2 + 150, 442, 60, t, seg(p, 0.12, 0.2));
    draw(ctx, [S.line(820, 900, 940, 560, 20), S.line(1100, 900, 980, 560, 20)], seg(p, 0.46, 0.62), { width: 2.4, alpha: 0.8 });
    words(ctx, 'Light for everyone.', W / 2, 260, 72, p, 0.36, 0.5, { color: GOLD_HI, glow: 12 });
    words(ctx, 'Still — walk in it.', W / 2, 700, 62, p, 0.64, 0.8, { italic: true, color: INK });
  },
});
add({
  lesson: 30, station: 8, ref: 'Before Abraham Was, I Am', fn(ctx, p) {
    const hl = seg(p, 0.24, 0.36);
    words(ctx, 'Before Abraham was, I am.', W / 2, 330, 84, p, 0.02, 0.2, {
      style: w => (w === 'was,' ? { color: lerp(0, 1, hl) > 0.5 ? GOLD : INK, italic: true } : (w === 'I' || w === 'am.') ? { color: hl > 0.5 ? GOLD_HI : INK, glow: 20 * hl } : { color: INK }),
    });
    txt(ctx, 'was → am', W / 2, 430, 32, { italic: true, color: GOLD, alpha: seg(p, 0.34, 0.42) * (1 - seg(p, 0.66, 0.7)) * 0.8 });
    for (let i = 0; i < 9; i++) {
      const d = seg(p, 0.44 + i * 0.022, 0.52 + i * 0.022, easeIn), x = 700 + i * 62 + hash(i) * 30, y = lerp(-60, 690 - (i % 3) * 26, d);
      if (d > 0) { const r = 22 + hash(i + 5) * 14; draw(ctx, [S.poly([[x - r, y], [x - r * 0.6, y - r * 0.8], [x + r * 0.5, y - r * 0.9], [x + r, y - r * 0.1], [x + r * 0.6, y + r * 0.6], [x - r * 0.4, y + r * 0.7]], true)], 1, { width: 2.4, glow: false }); }
    }
    txt(ctx, 'and they picked up stones', W / 2, 560, 34, { italic: true, color: GOLD, alpha: seg(p, 0.5, 0.58) * 0.8 });
    words(ctx, 'They heard him.', W / 2, 850, 80, p, 0.7, 0.84, { color: GOLD_HI, glow: 14 });
  },
});

// ---------- JOHN 9 ----------
add({
  lesson: 31, station: 9, quiet: true, ref: 'The Man Born Blind', fn(ctx, p, t) {
    const open = seg(p, 0.42, 0.62), mud = 1 - seg(p, 0.36, 0.5);
    [760, 1160].forEach(x => {
      ctx.save(); ctx.translate(x, 430);
      const top = S.bez([-130, 0], [-60, lerp(0, -90, open)], [60, lerp(0, -90, open)], [130, 0], 30), bot = S.bez([-130, 0], [-60, 70], [60, 70], [130, 0], 30);
      draw(ctx, [top, bot], seg(p, 0, 0.16), { width: 3.2 });
      if (mud > 0) { ctx.globalAlpha *= mud * seg(p, 0.12, 0.2); ctx.fillStyle = '#6b4a2e'; ctx.beginPath(); ctx.ellipse(0, 18, 120, 44, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      if (open > 0.4) { ctx.save(); ctx.globalAlpha *= seg(p, 0.5, 0.62); ctx.fillStyle = GOLD_HI; ctx.shadowColor = GOLD_HI; ctx.shadowBlur = 22; ctx.beginPath(); ctx.arc(x, 410, 30, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    });
    const ws = seg(p, 0.1, 0.18) * (1 - seg(p, 0.34, 0.42));
    txt(ctx, '“Who sinned?”', W / 2, 220, 60, { italic: true, color: INK, alpha: ws * 0.85 });
    words(ctx, 'What will you do', W / 2, 720, 68, p, 0.62, 0.72, { color: INK });
    words(ctx, 'with your suffering?', W / 2, 810, 68, p, 0.7, 0.8, { italic: true, color: GOLD_HI, glow: 10 });
  },
});
