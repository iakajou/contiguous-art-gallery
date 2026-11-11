# Crop the empty background around the screenshots (python3 -I scripts/trim-shots.py docs/screenshots)
import sys, glob, os
from PIL import Image, ImageChops
for f in sorted(glob.glob(os.path.join(sys.argv[1], '*.png'))):
    im = Image.open(f).convert('RGB')
    bg = Image.new('RGB', im.size, im.getpixel((im.width - 2, im.height - 2)))
    box = ImageChops.difference(im, bg).convert('L').point(lambda x: 255 if x > 12 else 0).getbbox()
    if box and 'hero' not in f:
        l, t, r, b = box
        pad = 24
        im = im.crop((max(0, l - pad), max(0, t - pad), min(im.width, r + pad), min(im.height, b + pad)))
        im.save(f)
    print(os.path.basename(f), im.size)

# JPEG copies, used by the PDF (much smaller than PNG)
for f in sorted(glob.glob(os.path.join(sys.argv[1], '*.png'))):
    Image.open(f).convert('RGB').save(f[:-4] + '.jpg', quality=84, optimize=True, progressive=True)
    os.remove(f)  # the PNG is only an intermediate file
