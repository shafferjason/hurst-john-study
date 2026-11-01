# Contact sheet from stills: python places/sheet.py out.png cols height a.png b.png ...
import sys
from PIL import Image, ImageDraw
out, cols, h, files = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4:]
ims = [Image.open(f).convert('RGB') for f in files]; w = int(h * ims[0].width / ims[0].height); rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * (w + 6), rows * (h + 6)), (30, 30, 30)); d = ImageDraw.Draw(S)
for i, im in enumerate(ims):
    x, y = (i % cols) * (w + 6), (i // cols) * (h + 6); S.paste(im.resize((w, h)), (x, y)); d.text((x + 6, y + 4), files[i].split('/')[-1].replace('.png', '').replace('still-', ''), fill=(255, 255, 0))
S.save(out)
