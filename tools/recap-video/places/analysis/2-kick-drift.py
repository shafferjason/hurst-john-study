import json, numpy as np, soundfile as sf, scipy.signal as sg, librosa
D='out/music/pulse/'; B=np.array(json.load(open(D+'beats-drums.json'))['beats'])
y,sr=sf.read(D+'stems/1 Drums.wav'); y=y.mean(axis=1) if y.ndim>1 else y
sos=sg.butter(4,110,btype='low',fs=sr,output='sos'); k=np.abs(sg.sosfilt(sos,y))
hop=64; env=np.array([k[i:i+hop].max() for i in range(0,len(k),hop)]); fr=sr/hop
pk,_=sg.find_peaks(env,height=env.max()*.35,distance=int(.15*fr)); kt=pk/fr
snb=sg.butter(4,[1200,6000],btype='band',fs=sr,output='sos'); s=np.abs(sg.sosfilt(snb,y)); es=np.array([s[i:i+hop].max() for i in range(0,len(s),hop)]); ps,_=sg.find_peaks(es,height=es.max()*.3,distance=int(.2*fr)); st=ps/fr
print('kicks',len(kt),'snares',len(st))
T0=.859138*4
# bar-phase of kicks over time w/ local T
for T in [0.8591]:
    for a in range(0,360,15):
        m=kt[(kt>=a)&(kt<a+15)]; n=st[(st>=a)&(st<a+15)]
        if len(m)==0: print(a,'none'); continue
        ph=((m-1.0449)/(2*T))%1; 
        z=np.exp(2j*np.pi*ph).mean(); phs=np.angle(z)/(2*np.pi)%1
        print(f'{a//60}:{a%60:02d} kicks {len(m):2d} snares {len(n):2d}  kick phase(2-beat) {phs*2*T*1000:6.0f} ms  R={abs(z):.2f}')
# global fit: kicks on even beats
for T in np.arange(.855,.864,.0002):
    ph=np.exp(2j*np.pi*(kt-1.0449)/(2*T)); print(round(T,4),round(abs(ph.mean()),3),end=' | ')
print()
print('kicks 295-320',np.round(kt[(kt>295)&(kt<320)],2)); print('snares 298-320',np.round(st[(st>298)&(st<320)],2))
print('kicks 340-360',np.round(kt[kt>340],2)); print('snares 340-360',np.round(st[st>340],2))
print('kick 275-282',np.round(kt[(kt>272)&(kt<282)],2)); print('kicks 165-185',np.round(kt[(kt>165)&(kt<185)],2))
print('B 298-312',np.round(B[(B>298)&(B<312)],2))
