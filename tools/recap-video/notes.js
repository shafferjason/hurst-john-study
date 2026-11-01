// Takeaway notes: small 'worth noticing' details from each lesson's full write-up (data.js summary_full).
// Verified against the write-ups 2026-10-31. L4 and L31 notes dropped to fit the music; L31 should end quietly. Shown as an extra beat at the end of the scene.
'use strict';
const NOTES = {
 "3": "Domitian's coins read “Lord and God.”|Thomas said it of Jesus.",
 "8": "“Dwelt among us”|literally: “tabernacled.”",
 "11": "“Do whatever he tells you” —|Pharaoh's words about Joseph.",
 "12": "The market filled the only court|where Gentiles could pray.",
 "16": "She came at noon,|when no one would see her.",
 "20": "Barley loaves and a boy:|an echo of Elisha.",
 "21": "Peter sinking?|Only Matthew tells that part.",
 "29": "“Lifted up” —|their softened word for crucifixion."
};
SCENES.forEach(s => { if (s.lesson && NOTES[s.lesson]) s.note = NOTES[s.lesson]; });

// Lay the scenes on the music's bar grid: every cut and every note lands on a downbeat.
// open = 3 bars, lesson = 2 bars, quiet lesson = 3 bars, note = +1 bar, close = 3 bars.
function beatTime(i) { if (i < BEATS.length) return i === 0 ? 0 : BEATS[i]; const n = BEATS.length, step = (BEATS[n - 1] - BEATS[n - 33]) / 32; return BEATS[n - 1] + (i - n + 1) * step; }
function buildTimeline(scenes) {
  let bar = 0;
  return scenes.map(s => {
    const bars = s.kind === 'open' ? 3 : s.kind === 'close' ? 3 : s.quiet ? 3 : 2;
    const nb = s.note ? 1 : 0;
    const start = beatTime(bar * 4), mid = beatTime((bar + bars) * 4), end = beatTime((bar + bars + nb) * 4);
    bar += bars + nb;
    return { ...s, start, dur: end - start, noteDur: end - mid };
  });
}
