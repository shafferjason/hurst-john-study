import json, numpy as np, soundfile as sf, scipy.signal as sg, librosa
D='out/music/pulse/'; B=np.array(json.load(open(D+'beats-drums.json'))['beats'])
def load(n):
    s,sr=sf.read(D+f'stems/{n}.wav'); return (s.mean(axis=1) if s.ndim>1 else s).astype(np.float32),sr
d,sr=load('1 Drums'); hop=256; fr=sr/hop
def onset(y): return librosa.onset.onset_strength(y=y,sr=sr,hop_length=hop,aggregate=np.median)
od=onset(d); ok=onset(load('3 Guitar')[0])+onset(load('4 Keyboard')[0]); ob=onset(load('2 Bass')[0])
def at(e,t,w=.06): i=int(t*fr); j=int(w*fr); return e[max(i-j,0):i+j+1].max() if i<len(e) else 0
# 1. drum-to-grid scan, section by section: which shift of the tracker's grid catches the most drum energy? (+ = drums late)
print('section  best shift ms  (strength at 0 vs best)')
for a,b in [(25,60),(60,100),(100,140),(140,165),(180,220),(220,270),(305,330),(330,345)]:
    g=B[(B>=a)&(B<b)]; sh=np.arange(-.25,.25,.01); v=[np.mean([at(od,t+s,.03) for t in g]) for s in sh]; print(a,b,round(sh[int(np.argmax(v))]*1000),round(v[25],2),round(max(v),2))
# 2. bar-phase: bass and chord changes by phase of 4 in sections; which even beat is the downbeat?
ch=librosa.feature.chroma_cqt(y=load('4 Keyboard')[0]+load('3 Guitar')[0]+load('2 Bass')[0],sr=sr,hop_length=hop)
def chg(t,w=.35):
    i=int(t*fr);j=int(w*fr); a=ch[:,max(i-j,0):i].mean(axis=1);b=ch[:,i:i+j].mean(axis=1); return 1-np.dot(a,b)/(np.linalg.norm(a)*np.linalg.norm(b)+1e-6)
C=np.array([chg(t) for t in B]);O=np.array([at(ob,t) for t in B])
for a,b in [(5,60),(60,140),(140,165),(180,270),(280,300),(305,345)]:
    idx=np.where((B>=a)&(B<b))[0]; print(a,b,'chord change by phase',[round(float(C[idx[idx%4==p]].mean()),3) for p in range(4)],'bass attack',[round(float(O[idx[idx%4==p]].mean()),2) for p in range(4)])
# by phase-of-8 too (2-bar pattern) for the biggest changes
top=np.argsort(-C)[:40]; print('biggest chord changes (beat idx%4):',np.bincount(top%4,minlength=4),'at',[(round(float(B[i])),int(i%4)) for i in sorted(top)[:24]])
# 3. hush: which beat period and phase do guitar+keys follow from 280 to 302?
for a,b in [(278,303)]:
    best=[]
    for T in np.arange(.80,.92,.002):
        for p in np.arange(0,T,.02):
            g=np.arange(a+p,b,T); best.append((np.mean([at(ok,t,.03) for t in g]),T,a+p))
    best.sort(reverse=True); print('hush top fits:',[(round(x,2),round(T,3),round(p,2)) for x,T,p in best[:5]])
    g=B[(B>a)&(B<b)]; print('tracker grid catch',round(np.mean([at(ok,t,.03) for t in g]),2),'random baseline',round(np.mean(ok[int(a*fr):int(b*fr)]),2)); 
    print('hush attack vs tracker per beat ms:',[round(float((lambda w:(np.argmax(ok[int((t-.25)*fr):int((t+.25)*fr)])/fr-.25)*1000)(0))) for t in g])
print('grid idx at key times',[ (t,int(np.searchsorted(B,t))%4) for t in (312.6,314.34,316.07)])
print('B start',B[:3],'kick first', )
