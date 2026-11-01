# Stretch the music bed to the video's bar layout by repeating whole bars under scenes that grew,
# so every cut stays on a downbeat. Layout rules MUST match buildTimeline in notes.js.
# Run with the librosa venv:  python build_music.py out/music/take3-1.mp3
import sys, json, numpy as np, librosa, soundfile as sf
src = sys.argv[1]
y, sr = librosa.load(src, sr=44100, mono=False)
if y.ndim == 1: y = np.stack([y, y])
B = json.load(open('beats.json'))['beats']
nbars = len(B) // 4
bar_start = lambda k: 0.0 if k == 0 else B[4 * k]
NOTES = {3, 8, 11, 12, 16, 20, 21, 29}; QUIET = {24, 31}; SLOW = {1, 5, 6, 7, 13, 14, 19, 23, 28, 30}
scenes = [('open', 3, 3)]
for n in range(1, 32):
    old = (3 if n in QUIET else 2) + (1 if n in NOTES else 0)
    new = (3 if (n in QUIET or n in SLOW) else 2) + (2 if n in NOTES else 0)
    scenes.append((n, old, new))
scenes.append(('close', 3, 3))
# source bar sequence: each scene plays its own old bars, extras repeat the scene's bars from its middle
seq, k = [], 0
for name, old, new in scenes:
    own = list(range(k, k + old)); k += old
    if name == 'close': seq += [('tail', own[0])]; continue
    extra = new - old
    body = own[:]
    for e in range(extra):  # repeat bars in order, inserted after the first `old` bars of the main scene part
        body.insert(min(len(body), (2 if name not in NOTES else old) + e), own[min(e + 1, len(own) - 1)] if old > 1 else own[0])
    seq += [('bar', b) for b in body]
fade = int(0.012 * sr); out = []; beats = []; t = 0.0
for kind, b in seq:
    a = int(bar_start(b) * sr)
    e = y.shape[1] if kind == 'tail' else int(bar_start(b + 1) * sr) if b + 1 < nbars else y.shape[1]
    seg = y[:, a:e].copy()
    if out and fade:
        seg[:, :fade] *= np.linspace(0, 1, fade); out[-1][:, -fade:] *= np.linspace(1, 0, fade)
    base_bt = [bar_start(b)] + [B[4 * b + i] for i in (1, 2, 3)] if 4 * b + 3 < len(B) else [bar_start(b) + i * 0.557 for i in range(4)]
    beats += [round(t + (x - bar_start(b)), 4) for x in base_bt]
    out.append(seg); t += seg.shape[1] / sr
audio = np.concatenate(out, axis=1)
sf.write('out/music/bed-stretched.wav', audio.T, sr)
open('beats.js', 'w').write("// Beat grid of the STRETCHED music bed (out/music/bed-stretched.wav), built by build_music.py from take3-1.\n// Bars start on beats 0,4,8,...  Regenerate both together if the layout or the music changes.\n'use strict';\nconst BEATS = %s;\nconst MUSIC_DUR = %.3f;\n" % (json.dumps(beats), audio.shape[1] / sr))
print('bars', len(seq), 'length', round(audio.shape[1] / sr, 2))
