# Music bed for the 3D walk (walk.html). Same idea as build_music.py: start from the take's original
# bar layout (the v2 flat cut, which lined up with the music's sections) and repeat whole bars under
# any scene that got longer, so every arrival stays on a downbeat. Layout rules MUST match WALK_BARS in walk.html.
# Run with the librosa venv:  python build_music_walk.py out/music/take3-1.mp3
import sys, json, numpy as np, librosa, soundfile as sf
y, sr = librosa.load(sys.argv[1], sr=44100, mono=False)
if y.ndim == 1: y = np.stack([y, y])
B = json.load(open('beats.json'))['beats']; nbars = len(B) // 4
bs = lambda k: 0.0 if k == 0 else B[4 * k]
NOTES = {3, 8, 11, 12, 16, 20, 21, 29}; QUIET = {24, 31}
old = [3] + [(3 if n in QUIET else 2) + (1 if n in NOTES else 0) for n in range(1, 32)] + [3]
new = [3] + [4 if (n in QUIET or n in NOTES) else 3 for n in range(1, 32)] + [4]
seq, k = [], 0
for j, (o, n) in enumerate(zip(old, new)):
    own = list(range(k, k + o)); k += o
    if j == len(old) - 1: seq.append(('tail', own[0], n)); break
    body = own[:]; c = 1 if o > 1 else 0
    while len(body) < n: body.append(own[c % o]); c += 1
    seq += [('bar', b, 1) for b in body]
fade = int(0.012 * sr); out = []; beats = []; t = 0.0
for kind, b, n in seq:
    a = int(bs(b) * sr); e = y.shape[1] if kind == 'tail' or b + 1 >= nbars else int(bs(b + 1) * sr)
    seg = y[:, a:e].copy()
    if kind == 'tail':  # final chord + decay, padded with silence to fill the closing bars
        need = int(n * 2.23 * sr) + sr
        if seg.shape[1] < need: seg = np.concatenate([seg, np.zeros((2, need - seg.shape[1]), dtype=seg.dtype)], axis=1)
    if out and fade: seg[:, :fade] *= np.linspace(0, 1, fade); out[-1][:, -fade:] *= np.linspace(1, 0, fade)
    step = 0.5573
    bt = [bs(b) + i * step for i in range(4 * n)] if kind == 'tail' else [bs(b)] + [B[4 * b + i] for i in (1, 2, 3)]
    beats += [round(t + (x - bs(b)), 4) for x in bt]
    out.append(seg); t += seg.shape[1] / sr
audio = np.concatenate(out, axis=1)
sf.write('out/music/bed-walk.wav', audio.T, sr)
open('beats-walk.js', 'w').write("// Beat grid of the WALK music bed (out/music/bed-walk.wav), built by build_music_walk.py from take3-1.\n'use strict';\nconst BEATS = %s;\nconst MUSIC_DUR = %.3f;\n" % (json.dumps(beats), audio.shape[1] / sr))
print('bars', sum(new), 'length', round(audio.shape[1] / sr, 2))
