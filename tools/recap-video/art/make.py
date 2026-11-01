#!/usr/bin/env python3
# Make one line-art element for a lesson: generate in the house style (with retries), key out the background,
# and write the reveal layer. Run from tools/recap-video with the venv that has scipy + pillow:
#   art/make.py l18 mat crop 1:1 "A rolled sleeping mat tied with cord, seen from the side."
# mode: crop = tight | person = feet at bottom of a tall canvas | full = keep the whole frame (poses that must register)
# Re-run prep only (no new image): art/make.py l18 mat crop --prep-only
# Output: art/l18/mat.png (R=line, G=draw order, B=silhouette) + art/l18/art.json. Key comes from GEMINI_API_KEY; never printed.
import sys, os, json, base64, time, urllib.request
import numpy as np
from PIL import Image
from scipy import ndimage as ni
from collections import deque
STYLE = ("Elegant minimalist single continuous line drawing, in the manner of a master artist's confident ink sketch. "
 "Thin warm gold line on a flat pure near-black background. Very few strokes, open contours, generous empty space, "
 "varied line weight from hairline to slightly thicker, nothing filled in, no shading, no text, no letters, no border, no ground line unless asked. "
 "Graceful, reverent, adult fine-art quality. Only this one subject, centered, fully inside the frame with margin.")
def gen(path, aspect, subject, ref=None, tries=3):
    parts = [{"text": subject + " " + STYLE}]
    if ref: parts.insert(0, {"inlineData": {"mimeType": "image/png", "data": base64.b64encode(open(ref, 'rb').read()).decode()}})
    body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect}}}
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent"
    for i in range(tries):
        try:
            req = urllib.request.Request(url, json.dumps(body).encode(), {"Content-Type": "application/json", "x-goog-api-key": os.environ["GEMINI_API_KEY"]})
            r = json.load(urllib.request.urlopen(req, timeout=180))
            for p in r["candidates"][0]["content"]["parts"]:
                d = p.get("inlineData") or p.get("inline_data")
                if d: open(path, "wb").write(base64.b64decode(d["data"])); return True
            print("no image, retrying")
        except Exception as e: print("failed, retrying:", type(e).__name__)
        time.sleep(4)
    return False
def prep(src, dst, mode):
    im = np.asarray(Image.open(src).convert('RGB')).astype(float)
    h,w,_ = im.shape; m = int(0.03*min(h,w)); im = im[m:h-m, m:w-m]; h,w,_ = im.shape
    bg = np.stack([ni.median_filter(im[::8,::8,c], size=31) for c in range(3)],-1)
    bg = np.stack([ni.zoom(bg[...,c], (h/bg.shape[0], w/bg.shape[1]), order=1) for c in range(3)],-1)
    d = np.clip((im-bg).max(axis=2),0,None)
    hi = np.percentile(d[d>18],92) if (d>18).any() else 1
    a = np.clip((d-12)/max(hi-12,1),0,1); a = np.maximum(a, ni.gaussian_filter(a,0.8)*1.25).clip(0,1)
    mask = a>0.28; lab,n = ni.label(mask, structure=np.ones((3,3)))
    sizes = ni.sum(mask,lab,range(1,n+1)); keep = [i+1 for i,s in enumerate(sizes) if s>14]
    clean = np.isin(lab,keep); a = a*ni.binary_dilation(clean,iterations=2)
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
    idx = ni.distance_transform_edt(order<0, return_distances=False, return_indices=True); G = G[idx[0],idx[1]]
    sil = ni.binary_fill_holes(ni.binary_closing(np.pad(clean,20),iterations=14))[20:-20,20:-20]; sil = ni.gaussian_filter(sil.astype(float),1.5)
    ys,xs = np.where(clean); y0,y1,x0,x1 = ys.min(),ys.max()+1,xs.min(),xs.max()+1
    rgb = np.stack([a*255,G,sil*255],-1)
    if mode=='full': out = rgb
    elif mode=='crop': p=6; out = rgb[max(y0-p,0):y1+p, max(x0-p,0):x1+p]
    else:
        body = rgb[y0:y1,x0:x1]; bh,bw = body.shape[:2]; H = int(max(bh*1.01, bw*2.4/0.98)); W = int(H/2.4)+1
        out = np.zeros((H,W,3)); xo = (W-bw)//2; out[H-bh:H, xo:xo+bw] = body
    Image.fromarray(out.round().astype(np.uint8),'RGB').save(dst)
    return {'aspect': round(out.shape[1]/out.shape[0],4), 'bodyH': round((y1-y0)/out.shape[0],3)}
if __name__ == '__main__':
    folder, name, mode = sys.argv[1:4]; d = f'art/{folder}'; os.makedirs(d+'/src', exist_ok=True); src = f'{d}/src/{name}.png'
    if sys.argv[4] != '--prep-only':
        aspect, subject = sys.argv[4], sys.argv[5]
        if not gen(src, aspect, subject, sys.argv[6] if len(sys.argv)>6 else None): sys.exit('could not generate '+name)
    meta = prep(src, f'{d}/{name}.png', mode); j = f'{d}/art.json'
    import fcntl
    with open(j + '.lock', 'w') as lk:   # safe to run several at once
        fcntl.flock(lk, fcntl.LOCK_EX)
        all_ = json.load(open(j)) if os.path.exists(j) else {}; all_[name] = {k: float(v) for k, v in meta.items()}; json.dump(all_, open(j,'w'), indent=0)
    os.remove(j + '.lock') if os.path.exists(j + '.lock') else None; print('ok', folder, name)
