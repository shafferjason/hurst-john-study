// John recap video — timeline and scenes. Each scene: { lesson, station, ref, dur, quiet?, fn(ctx, p, t) }
// p = 0..1 progress through the scene, t = seconds into the scene. Words must stay grounded in the
// lesson summaries in ../../data.js (see STORYBOARD.md).
'use strict';

const LESSON_DUR = 5.2, QUIET_DUR = 6.5;
const SCENES = [];
const add = (s) => SCENES.push({ dur: s.quiet ? QUIET_DUR : LESSON_DUR, ...s });

// ---------- OPEN ----------
SCENES.push({
  kind: 'open', dur: 8, station: 0, fn(ctx, p, t) {
    txt(ctx, 'The Gospel of John', W / 2, 400, 104, { color: GOLD_HI, glow: 18, alpha: seg(p, 0.12, 0.32), dy: (1 - seg(p, 0.12, 0.32)) * 20 });
    draw(ctx, [S.line(660, 478, 1260, 478, 30)], seg(p, 0.25, 0.45), { width: 2 });
    txt(ctx, 'so far', W / 2, 545, 54, { italic: true, color: GOLD, alpha: seg(p, 0.38, 0.52) });
    txt(ctx, 'taught by Ben', W / 2, 660, 34, { color: INK, alpha: seg(p, 0.5, 0.64) * 0.85, spacing: 3 });
    txt(ctx, '31 lessons', W / 2, 860, 28, { italic: true, color: GOLD, alpha: seg(p, 0.66, 0.8) * 0.8 });
  },
});

// ---------- FOUNDATIONS ----------
add({
  lesson: 1, station: 0, ref: 'A Deep Dive into the Gospels', fn(ctx, p) {
    const books = [];
    for (let i = 0; i < 4; i++) {
      const cx = 450 + i * 340, y = 400;
      books.push(S.poly([[cx, y - 70], [cx - 130, y - 90], [cx - 130, y + 70], [cx, y + 90]], true));
      books.push(S.poly([[cx, y - 70], [cx + 130, y - 90], [cx + 130, y + 70], [cx, y + 90]], true));
    }
    draw(ctx, books, seg(p, 0.0, 0.3, easeOut), { width: 2.6 });
    // one story running through all four
    draw(ctx, [S.wave(300, 1620, 400, 16, 4)], seg(p, 0.22, 0.42), { color: GOLD_HI, width: 4, blur: 16 });
    words(ctx, 'Four tellings. One story.', W / 2, 640, 70, p, 0.3, 0.48, { color: GOLD_HI, alpha: 1 - seg(p, 0.6, 0.66) });
    // "gospel" splits to reveal "good news"
    const k = seg(p, 0.7, 0.86);
    const show = seg(p, 0.62, 0.68);
    txt(ctx, 'gos', W / 2 - 64 - k * 210, 640, 76, { color: GOLD, alpha: show * (1 - k), align: 'right' });
    txt(ctx, 'pel', W / 2 - 64 + k * 210, 640, 76, { color: GOLD, alpha: show * (1 - k), align: 'left' });
    const g = seg(p, 0.8, 0.92);
    txt(ctx, 'good news', W / 2 - 64, 640, 76, { italic: true, color: GOLD_HI, glow: 14, alpha: g, scale: lerp(0.6, 1, g) });
  },
});
add({
  lesson: 2, station: 0, ref: 'Reading with Humility and Context', fn(ctx, p) {
    const cx = 960, cy = 400;
    const lines = []; for (let i = 0; i < 5; i++) lines.push(S.line(cx - 90 + (i % 2) * 10, cy - 60 + i * 30, cx + 85 - (i % 3) * 20, cy - 60 + i * 30, 10));
    draw(ctx, lines, seg(p, 0.0, 0.18), { width: 2, color: INK, alpha: 0.7, glow: false });
    draw(ctx, [S.circle(cx, cy, 130), S.line(cx + 92, cy + 92, cx + 210, cy + 210, 10)], seg(p, 0.08, 0.32), { width: 5 });
    const lab = ['history', 'literature', 'author'];
    const pos = [[cx - 340, cy - 80], [cx + 360, cy - 80], [cx - 300, cy + 140]];
    lab.forEach((w, i) => txt(ctx, w, pos[i][0], pos[i][1], 44, { italic: true, color: GOLD, alpha: seg(p, 0.3 + i * 0.08, 0.4 + i * 0.08), dy: (1 - seg(p, 0.3 + i * 0.08, 0.4 + i * 0.08)) * 14 }));
    words(ctx, 'Hear it before you use it.', W / 2, 760, 72, p, 0.58, 0.78, { color: GOLD_HI });
  },
});
add({
  lesson: 3, station: 0, ref: "The Historical Witness of John's Gospel", fn(ctx, p, t) {
    const cx = 760, cy = 400;
    // spinning coin: horizontal radius follows cos, settles face-on
    const spin = seg(p, 0.0, 0.38, easeOut);
    const rx = 150 * Math.abs(Math.cos((1 - spin) * Math.PI * 3)) + 2;
    const coin = [S.arc(cx, cy, rx, 150), S.arc(cx, cy, rx * 0.82, 123)];
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; coin.push(S.line(cx + Math.cos(a) * rx * 0.86, cy + Math.sin(a) * 129, cx + Math.cos(a) * rx * 0.95, cy + Math.sin(a) * 142, 2)); }
    draw(ctx, coin, seg(p, 0.0, 0.2) , { width: 3 });
    // a profile on the coin face once it settles
    draw(ctx, [S.bez([cx - 20, cy - 70], [cx + 60, cy - 60], [cx + 20, cy + 10], [cx + 50, cy + 30]), S.bez([cx + 50, cy + 30], [cx + 10, cy + 50], [cx + 30, cy + 70], [cx - 30, cy + 80])], seg(p, 0.36, 0.5), { width: 2.5, alpha: seg(p, 0.34, 0.4) });
    // pen signs
    draw(ctx, [S.bez([1060, 460], [1120, 330], [1180, 520], [1240, 400]), S.bez([1240, 400], [1290, 330], [1310, 470], [1400, 420])], seg(p, 0.4, 0.58), { color: GOLD_HI, width: 4 });
    words(ctx, 'Testimony,', W / 2 - 200, 760, 80, p, 0.58, 0.68, { color: GOLD_HI, glow: 12 });
    words(ctx, 'not tradition.', W / 2 + 230, 760, 64, p, 0.68, 0.8, { italic: true, color: GOLD, alpha: 0.75 });
  },
});
add({
  lesson: 4, station: 0, ref: "A Map to John's Gospel", fn(ctx, p) {
    const k = seg(p, 0.0, 0.25, easeOut); const hw = lerp(10, 520, k), cx = 960, top = 220, bot = 560;
    draw(ctx, [S.rect(cx - hw, top, hw * 2, bot - top), S.circle(cx - hw, (top + bot) / 2 - 150, 22), S.circle(cx + hw, (top + bot) / 2 - 150, 22)], 1, { width: 3, alpha: seg(p, 0, 0.04) });
    const route = S.bez([cx - 460, 480], [cx - 200, 220], [cx + 120, 600], [cx + 460, 280], 80);
    ctx.save(); ctx.setLineDash([2, 14]); draw(ctx, [route], seg(p, 0.22, 0.42), { width: 4, glow: false }); ctx.restore();
    for (let i = 0; i < 7; i++) {
      const pt = route[Math.round((i + 0.5) / 7 * (route.length - 1))];
      const d = seg(p, 0.4 + i * 0.035, 0.46 + i * 0.035, back);
      if (d > 0) { const y = pt[1] - (1 - d) * 60; fillPoly(ctx, [[pt[0], y - 14], [pt[0] + 11, y], [pt[0], y + 14], [pt[0] - 11, y]], GOLD_HI, clamp(d * 2)); }
    }
    txt(ctx, 'seven signs', cx, 610, 30, { italic: true, color: GOLD, alpha: seg(p, 0.62, 0.68) * 0.8 });
    words(ctx, 'written so that you may believe', W / 2, 780, 66, p, 0.62, 0.8, {
      style: (w) => (w === 'believe' ? { color: GOLD_HI, glow: 10 + 20 * seg(p, 0.85, 0.95), italic: true } : { color: INK }),
    });
  },
});

// LESSONS 5-31 are in scenes2.js

// ---------- CLOSE ----------
const CLOSE = {
  kind: 'close', dur: 7, station: 9, fn(ctx, p) {
    txt(ctx, 'To be continued.', W / 2, 470, 96, { italic: true, color: GOLD_HI, glow: 16, alpha: seg(p, 0.25, 0.45), dy: (1 - seg(p, 0.25, 0.45)) * 16 });
    txt(ctx, 'John 10 – 21 still ahead', W / 2, 590, 32, { color: GOLD, alpha: seg(p, 0.45, 0.6) * 0.75, spacing: 2 });
  },
};

// ---------- timeline ----------
function buildTimeline(scenes) {
  let t = 0; return scenes.map((s) => { const o = { ...s, start: t }; t += s.dur; return o; });
}
