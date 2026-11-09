"""Derive reel-ready art from the invitation's own images into reel/assets/.
Run: python3 prep.py   (needs Pillow + numpy)"""
import re, numpy as np
from PIL import Image, ImageFilter
ROOT = '../img/'
OUT = 'assets/'

# Ganesha line-art: 273x330 is too small for a 1080-wide frame. Upscale the alpha
# smoothly, then steepen it so the edges come back crisp. White, so it can be tinted.
g = Image.open(ROOT + 'ganesha.png').convert('RGBA')
a = g.split()[3].resize((g.width * 4, g.height * 4), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.6))
a = np.asarray(a).astype(np.float32) / 255
a = np.clip((a - 0.5) * 6 + 0.5, 0, 1)
w = np.full(a.shape + (4,), 255, np.uint8); w[..., 3] = (a * 255).astype(np.uint8)
Image.fromarray(w).save(OUT + 'ganesha-hd.png')

# Impact frame: the couple photograph as two-tone ink, kumkum on ivory.
p = Image.open(ROOT + 'pair-silk-1086.webp').convert('L').filter(ImageFilter.GaussianBlur(1.2))
l = np.asarray(p).astype(np.float32)
ink = l < 150
img = np.zeros(l.shape + (3,), np.uint8); img[:] = (246, 239, 226); img[ink] = (179, 38, 30)
Image.fromarray(img).save(OUT + 'impact-couple.png')

# The brass diya without its painted flame and glow; the reel lights its own flame.
s = open(ROOT + 'book/diya.svg').read()
s = re.sub(r'<ellipse cx="111" cy="77"[^>]*/>', '', s)
s = re.sub(r'<path d="M112 115C[^>]*/>', '', s)
s = re.sub(r'<path d="M112 111c[^>]*/>', '', s)
open(OUT + 'diya-lamp.svg', 'w').write(s)
print('assets ready')

# The Shubham card's lotus-and-lamps ornament in white, so the reel can tint it gold.
s = open(ROOT + 'book/subham-muggu.svg').read()
for c in ('#aa783b', '#e9b749', '#647647', '#7e8954'): s = s.replace(c, '#ffffff')
open(OUT + 'ornament.svg', 'w').write(s.replace('stroke-width="1.3"', 'stroke-width="1.6"'))
print('ornament ready')

# The second impact frame: the same ink, inverted (ivory figures on kumkum).
inv = np.zeros(l.shape + (3,), np.uint8); inv[:] = (179, 38, 30); inv[ink] = (246, 239, 226)
Image.fromarray(inv).save(OUT + 'impact-couple-inv.png')
print('impact inverse ready')

# Watercolour portraits with their white paper made transparent (a soft matte from
# the distance to paper white), so they sit on any page and can be silhouetted.
for name, src in (('bride', 'portraits/nikhitha-watercolor.jpg'), ('groom', 'portraits/sai-koundinya.jpg')):
    im = np.asarray(Image.open(ROOT + src).convert('RGB')).astype(np.float32)
    paper = np.percentile(im.reshape(-1, 3), 92, axis=0)                    # the paper tone
    d = np.sqrt(((im - paper) ** 2).sum(-1))
    d = np.asarray(Image.fromarray(np.clip(d, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.2))).astype(np.float32)  # the paper's grain drops out
    a = np.clip((d - 22) / 34, 0, 1)
    a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255
    rgb = np.where(a[..., None] > 0.03, (im - paper * (1 - a[..., None])) / np.maximum(a[..., None], 0.03), im)
    Image.fromarray(np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8), 'RGBA').save(OUT + name + '-matte.png')
print('portrait mattes ready')
