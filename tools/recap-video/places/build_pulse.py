# The song is the clock. Builds the one beat grid (beats-pulse.json) and the per-instrument envelopes (stems-pulse.json)
# from Jason's instrumental, played whole, uncut, at 6:00. Reads decoded .wav stems only (librosa truncates the .mp3 stems).
#   python places/build_pulse.py
# Grid findings (places/analysis/): kick on tracker beats 0 and 2 of each 4, snare on 1 and 3, biggest chord changes on 0, so beat 0
# of the tracker is a true downbeat. The tracker sits 10-20 ms late against the drums, corrected here.
# The drumless stretch (278.5-308 s): the tracker's filled-in 34 beats do no better than random against guitar and keys. 32 beats
# (0.924 s, the players slow down) catch them 57% better than random. The drum pattern after it also matches the pattern before it
# better if the downbeat moves two tracker beats, which is what 32 beats gives. Two independent signs agree, so the grid uses 32.
import json, numpy as np, soundfile as sf, librosa, scipy.ndimage as nd
D = 'out/music/pulse/'; RATE = 30; SHIFT = -0.012
raw = json.load(open(D + 'beats-drums.json'))['beats']; dur = 360.0
HUSH_A, HUSH_B, HUSH_N = 322, 356, 32
raw = raw[:HUSH_A] + list(np.linspace(raw[HUSH_A], raw[HUSH_B], HUSH_N + 1)[:-1]) + raw[HUSH_B:]
st = float(np.median(np.diff(raw[-64:]))); beats = [round(float(b) + SHIFT, 4) for b in raw]
while beats[-1] + st < dur + 8: beats.append(round(beats[-1] + st, 4))   # the ending has no drums; hold the last tempo
mix, sr = sf.read(D + 'pulse.wav'); mix = mix.mean(axis=1) if mix.ndim > 1 else mix
energy = []
for i in range(0, len(beats) - 4, 4):
    a, b = int(beats[i] * sr), int(beats[i + 4] * sr); energy.append(round(float(np.sqrt(np.mean(mix[a:b] ** 2))) if b <= len(mix) and b > a else 0.0, 4))
json.dump({'beats': beats, 'dur': dur, 'energy': energy, 'soft': [278.5, 308.0], 'firstBeat': beats[0]}, open('beats-pulse.json', 'w'))
GROUPS = {'drums': ['1 Drums', '5 Percussion'], 'bass': ['2 Bass'], 'guitar': ['3 Guitar'], 'keys': ['4 Keyboard'], 'swell': ['6 Strings', '9 Brass', '10 Woodwinds']}
out = {'rate': RATE, 'level': {}, 'hit': {}}; N = int(dur * RATE)
for g, names in GROUPS.items():
    y = None
    for n in names:
        s, sr2 = sf.read(D + f'stems/{n}.wav'); s = (s.mean(axis=1) if s.ndim > 1 else s).astype(np.float32); y = s if y is None else y[:len(s)] + s[:len(y)]
    hop = int(sr2 / RATE); rms = librosa.feature.rms(y=y, frame_length=hop * 2, hop_length=hop, center=True)[0][:N]; rms = np.pad(rms, (0, max(0, N - len(rms))))
    top = np.percentile(rms[rms > 1e-4], 97) if (rms > 1e-4).any() else 1
    lev = np.clip(rms / top, 0, 1)
    # breath, not a strobe: quick to rise, slow to fall
    a_up, a_dn = np.exp(-1 / (RATE * .05)), np.exp(-1 / (RATE * .45)); sm = np.zeros(N); v = 0
    for i, x in enumerate(lev): v = (a_up if x > v else a_dn) * v + (1 - (a_up if x > v else a_dn)) * x; sm[i] = v
    fl = librosa.onset.onset_strength(y=y, sr=sr2, hop_length=hop, center=True)[:N]; fl = np.pad(fl, (0, max(0, N - len(fl)))); ftop = np.percentile(fl[fl > 0], 98) if (fl > 0).any() else 1
    fl = np.clip(fl / ftop, 0, 1) * (lev > .03); dn = np.exp(-1 / (RATE * .28)); h = np.zeros(N); v = 0
    for i, x in enumerate(fl): v = max(x, v * dn); h[i] = v
    h = nd.uniform_filter1d(h, 3)   # no single-frame jump
    out['level'][g] = [int(round(x * 99)) for x in sm]; out['hit'][g] = [int(round(x * 99)) for x in h]
    print(g, 'level median', round(float(np.median(sm)), 2), 'hit median', round(float(np.median(h)), 2))
json.dump(out, open('stems-pulse.json', 'w'), separators=(',', ':'))
print('beats', len(beats), 'bars', len(beats) // 4, 'first', beats[0], 'last', beats[-1])
