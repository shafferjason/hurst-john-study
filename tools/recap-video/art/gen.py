#!/usr/bin/env python3
# Generate one line-art element with Gemini. Usage: gen.py name aspect "subject" [reference.png]
# Same style sentence for everything. Key comes from GEMINI_API_KEY; never printed.
import sys, os, json, base64, urllib.request
STYLE = ("Elegant minimalist single continuous line drawing, in the manner of a master artist's confident ink sketch. "
 "Thin warm gold line on a flat pure near-black background. Very few strokes, open contours, generous empty space, "
 "varied line weight from hairline to slightly thicker, nothing filled in, no shading, no text, no border, no ground line unless asked. "
 "Graceful, reverent, adult fine-art quality. Only this one subject, centered, fully inside the frame with margin.")
name, aspect, subject = sys.argv[1:4]
parts = [{"text": subject + " " + STYLE}]
if len(sys.argv) > 4:
    parts.insert(0, {"inlineData": {"mimeType": "image/png", "data": base64.b64encode(open(sys.argv[4], 'rb').read()).decode()}})
body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect}}}
url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent"
req = urllib.request.Request(url, json.dumps(body).encode(), {"Content-Type": "application/json", "x-goog-api-key": os.environ["GEMINI_API_KEY"]})
try:
    r = json.load(urllib.request.urlopen(req, timeout=180))
    for p in r["candidates"][0]["content"]["parts"]:
        d = p.get("inlineData") or p.get("inline_data")
        if d: open(f"src/{name}.png", "wb").write(base64.b64decode(d["data"])); print("ok", name); break
    else: print("no image", name)
except Exception as e:
    print("fail", name, type(e).__name__, str(e)[:120])
