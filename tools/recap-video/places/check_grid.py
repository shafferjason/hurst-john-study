# Is the beat grid itself true to the music we actually ship? Listens to the final bed and measures the grid against the
# real note attacks: for each beat in the grid, how far is the nearest strong attack? Run with the librosa venv:
#   python places/check_grid.py out/music/pulse/stems/'1 Drums.wav' beats-pulse.json
import sys, json, numpy as np, librosa
y, sr = librosa.load(sys.argv[1], sr=22050, mono=True)
g = json.load(open(sys.argv[2])); beats = np.array(g['beats']); dur = len(y) / sr
ons = librosa.onset.onset_detect(y=y, sr=sr, units='time', backtrack=False, delta=0.05)
soft = g.get('soft', [0, 0]); live = beats[(beats < 335) & ((beats < soft[0]) | (beats > soft[1]))]   # no drums to measure against in the hush or the ending
d = np.array([(ons[np.argmin(abs(ons - b))] - b) for b in live]) * 1000
down = d[::4]
print(f'{len(live)} beats, {len(ons)} attacks. Median offset {np.median(abs(d)):.0f} ms; 90% within {np.percentile(abs(d),90):.0f} ms; downbeats median {np.median(abs(down)):.0f} ms, 90% within {np.percentile(abs(down),90):.0f} ms.')
bad = [(round(float(live[i]),2), round(float(d[i]))) for i in np.argsort(-abs(d))[:6]]
print('worst:', bad)
