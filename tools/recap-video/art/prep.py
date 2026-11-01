#!/usr/bin/env python3
# Turn generated line art into a layer the page can reveal: R = line strength, G = draw order (0-255), B = silhouette.
# Run with the venv that has scipy + pillow. Writes <name>.png and art.json.
import numpy as np, json
from PIL import Image
from scipy import ndimage as ni
from collections import deque
# name: (mode, height-fit). person = feet at bottom of a 1:2.4 canvas; crop = tight; full = keep whole frame (paired poses must register)
ITEMS = {'jar1':('crop',),'jar2':('crop',),'cup':('crop',),'s1':('crop',),'s2':('crop',),'s3':('crop',),
 'john':('full',),'johng':('full',),'h1':('full',),'h2':('full',),
 'p1':('person',),'p2':('person',),'p3':('person',),'p4':('person',),'p5':('person',),'he':('person',),'m1':('person',),'m2':('person',),'b1':('person',)}
meta = {}
for name,(mode,) in ITEMS.items():
    im = np.asarray(Image.open(f'src/{name}.png').convert('RGB')).astype(float)
    h,w,_ = im.shape; m = int(0.03*min(h,w)); im = im[m:h-m, m:w-m]; h,w,_ = im.shape
    # background varies a little across the frame: subtract a heavily blurred copy of it
    bg = np.stack([ni.median_filter(im[::8,::8,c], size=31) for c in range(3)],-1)
    bg = np.stack([ni.zoom(bg[...,c], (h/bg.shape[0], w/bg.shape[1]), order=1) for c in range(3)],-1)
    d = np.clip((im-bg).max(axis=2),0,None)
    hi = np.percentile(d[d>18],92) if (d>18).any() else 1
    a = np.clip((d-12)/max(hi-12,1),0,1)
    a = np.maximum(a, ni.gaussian_filter(a,0.8)*1.25).clip(0,1)
    mask = a>0.28
    lab,n = ni.label(mask, structure=np.ones((3,3)))
    sizes = ni.sum(mask,lab,range(1,n+1)); keep = [i+1 for i,s in enumerate(sizes) if s>14]
    clean = np.isin(lab,keep); a = a*ni.binary_dilation(clean,iterations=2)
    # draw order: walk along each connected stroke, biggest first, top first
    order = -np.ones((h,w),int); k = 0
    for c in sorted(keep,key=lambda c:-sizes[c-1]):
        ys,xs = np.where(lab==c); j = np.argmin(ys+0.2*xs); q = deque([(ys[j],xs[j])]); lab[ys[j],xs[j]] = -c
        while q:
            y,x = q.popleft(); order[y,x] = k; k += 1
            for dy in (-1,0,1):
                for dx in (-1,0,1):
                    Y,X = y+dy,x+dx
                    if 0<=Y<h and 0<=X<w and lab[Y,X]==c: lab[Y,X] = -c; q.append((Y,X))
    G = np.zeros((h,w)); G[order>=0] = 1+order[order>=0]/max(k-1,1)*254
    # soft pixels around the line take the order of their nearest line pixel
    idx = ni.distance_transform_edt(order<0, return_distances=False, return_indices=True); G = G[idx[0],idx[1]]
    sil = ni.binary_fill_holes(ni.binary_closing(np.pad(clean,20),iterations=14))[20:-20,20:-20]
    sil = ni.gaussian_filter(sil.astype(float),1.5)
    ys,xs = np.where(clean); y0,y1,x0,x1 = ys.min(),ys.max()+1,xs.min(),xs.max()+1
    rgb = np.stack([a*255,G,sil*255],-1)
    if mode=='full': out = rgb
    elif mode=='crop':
        p=6; out = rgb[max(y0-p,0):y1+p, max(x0-p,0):x1+p]
    else:
        body = rgb[y0:y1,x0:x1]; bh,bw = body.shape[:2]; H = int(max(bh*1.01, bw*2.4/0.98)); W = int(H/2.4)+1
        out = np.zeros((H,W,3)); xo = (W-bw)//2; out[H-bh:H, xo:xo+bw] = body
    Image.fromarray(out.round().astype(np.uint8),'RGB').save(f'{name}.png')
    meta[name] = {'aspect': round(out.shape[1]/out.shape[0],4), 'bodyH': round((y1-y0)/out.shape[0],3)}
    print(name,out.shape[:2],'pixels',k,'parts',len(keep))
json.dump(meta,open('art.json','w'),indent=0)
