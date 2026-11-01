# After the drumless stretch, which tracker beat is the downbeat? Compare the drum pattern after it with the pattern before it.
import json, numpy as np, soundfile as sf, librosa
D='out/music/pulse/'; B=np.array(json.load(open(D+'beats-drums.json'))['beats'])
s,sr=sf.read(D+'stems/1 Drums.wav'); s=(s.mean(axis=1) if s.ndim>1 else s).astype(np.float32); hop=256; fr=sr/hop
def tpl(idx, y_low=True):
    M=[]
    for i in idx:
        t0=B[i]; st=(B[i+4]-B[i])/16 if i+4<len(B) else .2148
        M.append([env[int((t0+k*st)*fr)-2:int((t0+k*st)*fr)+3].max() for k in range(16)])
    return np.median(np.array(M),axis=0)
import scipy.signal as sg
for band,(lo,hi) in {'low':(20,110),'high':(1200,8000)}.items():
    y=sg.sosfilt(sg.butter(4,[lo,hi],btype='band',fs=sr,output='sos'),s); env=librosa.onset.onset_strength(y=y.astype(np.float32),sr=sr,hop_length=hop)
    pre=np.array([i for i in range(0,len(B)-4,4) if 180<B[i]<275]); post0=np.array([i for i in range(356,len(B)-4,4) if 310<B[i]<335]); post2=post0+2
    P=tpl(pre); A=tpl(post0); C=tpl(post2)
    print(band,'pre',np.round(P/P.max(),1)); print(' post phase0',np.round(A/A.max(),1)); print(' post phase2',np.round(C/C.max(),1)); print(' corr phase0',round(float(np.corrcoef(P,A)[0,1]),3),'phase2',round(float(np.corrcoef(P,C)[0,1]),3))
