# What is the song's real grid? Checks the drum tracker's beats against the kick/snare pattern, finds the downbeat, and
# measures each stem through the song. Reads only decoded .wav stems (never the .mp3s; librosa truncates them).
import json, numpy as np, soundfile as sf, scipy.signal as sg, glob, os
D='out/music/pulse/'; B=np.array(json.load(open(D+'beats-drums.json'))['beats'])
y,sr=sf.read(D+'stems/1 Drums.wav'); y=y.mean(axis=1) if y.ndim>1 else y; dur=len(y)/sr; print('sr',sr,'dur',dur)
print('step median',np.median(np.diff(B)),'std',np.std(np.diff(B)),'min',np.diff(B).min(),'max',np.diff(B).max())
def band(y,lo,hi):
    s=sg.butter(4,[lo,hi] if lo else hi,btype='band' if lo else 'low',fs=sr,output='sos'); return np.abs(sg.sosfilt(s,y))
kick=band(y,0,110); snare=band(y,1200,6000); W=int(.06*sr)
def at(env,t): i=int(t*sr); return env[max(i-W//3,0):i+W].max() if i<len(env) else 0
K=np.array([at(kick,t) for t in B]); S=np.array([at(snare,t) for t in B]); K/=K.max(); S/=S.max()
for name,seg in [('all',np.arange(len(B))),('0-100s',np.where(B<100)[0]),('100-280',np.where((B>100)&(B<280))[0]),('300-350',np.where(B>300)[0])]:
    print(name,'kick by phase',[round(float(np.median(K[seg][seg%4==p])),2) for p in range(4)],'snare',[round(float(np.median(S[seg][seg%4==p])),2) for p in range(4)])
# offbeats
Ko=np.array([at(kick,t+.4295) for t in B]); So=np.array([at(snare,t+.4295) for t in B]); print('half-beat kick',[round(float(np.median(Ko[Ko.size and np.arange(len(B))%4==p]/Ko.max())),2) for p in range(4)],'snare',[round(float(np.median(So[np.arange(len(B))%4==p]/So.max())),2) for p in range(4)])
# stem levels per 10 s
names=sorted(glob.glob(D+'stems/*.wav')); L={}
for f in names:
    s,_=sf.read(f); s=s.mean(axis=1) if s.ndim>1 else s; n=os.path.basename(f)[:-4]
    L[n]=[float(np.sqrt(np.mean(s[int(a*sr):int((a+10)*sr)]**2))) for a in np.arange(0,360,10)]
print('t    '+' '.join(k.split()[1][:5].rjust(5) for k in L))
for i in range(36):
    print(f'{i*10//60}:{i*10%60:02d} '+' '.join(f'{L[k][i]*100:5.1f}' for k in L))
# hush: guitar and keys attacks against the extended grid
import librosa
ext=np.concatenate([B,B[-1]+np.arange(1,12)*0.8591])
for n in ['3 Guitar','4 Keyboard','7 Synth','6 Strings']:
    s,_=sf.read(D+f'stems/{n}.wav'); s=s.mean(axis=1) if s.ndim>1 else s
    a=int(275*sr); b=int(305*sr); ons=librosa.onset.onset_detect(y=s[a:b].astype(np.float32),sr=sr,units='time',delta=.08)+275
    d=[(o-ext[np.argmin(abs(ext-o))])*1000 for o in ons]
    print(n,'attacks',len(ons),'median off',round(float(np.median(np.abs(d))) if d else 0),'ms; signed',[round(x) for x in d[:14]])
g=[t for t in B if 278<t<302]; print('tracker in hush step',np.round(np.diff(g),3)[:30])
