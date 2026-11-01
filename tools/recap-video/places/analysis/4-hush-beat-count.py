# The drumless stretch: do guitar and keys follow the tracker's filled-in beats there?
import json, numpy as np, soundfile as sf, librosa
D='out/music/pulse/'; B=np.array(json.load(open(D+'beats-drums.json'))['beats'])
def load(n):
    s,sr=sf.read(D+f'stems/{n}.wav'); return (s.mean(axis=1) if s.ndim>1 else s).astype(np.float32),sr
g,sr=load('3 Guitar'); k,_=load('4 Keyboard'); d,_=load('1 Drums'); hop=256; fr=sr/hop; off=265.0; a,b=int(265*sr),int(315*sr)
e=librosa.onset.onset_strength(y=g[a:b],sr=sr,hop_length=hop)+librosa.onset.onset_strength(y=k[a:b],sr=sr,hop_length=hop)
lvl=lambda x,y: np.sqrt(np.mean(d[int(x*sr):int(y*sr)]**2))
ts=np.arange(270,312,.25); lv=[lvl(t,t+.25) for t in ts]; last=[t for t,l in zip(ts,lv) if t<290 and l>.02][-1]; first=[t for t,l in zip(ts,lv) if t>285 and l>.02][0]; print('drums stop',last,'return',first)
ia=np.argmin(abs(B-last)); ib=np.argmin(abs(B-first)); ta,tb=B[ia],B[ib]; print('beats',ia,ib,'span',round(tb-ta,2),'phase',ia%4,ib%4)
at=lambda t,w=.05: e[max(int((t-off-w)*fr),0):int((t-off+w)*fr)+1].max()
print('random',round(float(np.mean([at(t) for t in np.random.uniform(ta,tb,3000)])),2),'tracker',round(float(np.mean([at(t) for t in B[ia:ib+1]])),2))
for n in range(ib-ia-6,ib-ia+7):
    print(n,round(float((tb-ta)/n),3),round(float(np.mean([at(t) for t in np.linspace(ta,tb,n+1)])),2),'keeps bar' if (n-(ib-ia))%4==0 else '')
