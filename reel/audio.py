"""Score for the reel: the invitation's song, cut so its drum drop lands at 30.09 s,
with quiet sound effects locked to the picture.
python3 audio.py out/sound.wav"""
import subprocess, sys, numpy as np
from scipy.signal import butter, sosfilt

SR, DUR, START = 48000, 42.0, 57.5
out = sys.argv[1] if len(sys.argv) > 1 else 'out/sound.wav'
raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(START), '-t', str(DUR), '-i', '../audio/dichotomy-of-fame.mp3',
                      '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
song = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
n = int(DUR * SR); song = np.pad(song, ((0, max(0, n - len(song))), (0, 0)))[:n]
t = np.arange(n) / SR
fade = np.clip(t / 0.25, 0, 1) * np.clip((DUR - t) / 1.4, 0, 1) ** 1.5
song *= fade[:, None]

fx = np.zeros((n, 2), np.float32)
rng = np.random.default_rng(4)
def band(x, lo, hi): return sosfilt(butter(2, [lo, hi], btype='band', fs=SR, output='sos'), x)
def low(x, f): return sosfilt(butter(2, f, btype='low', fs=SR, output='sos'), x)
def place(sig, at, gain, pan=0.0):
    i = int(at * SR); j = min(n, i + len(sig)); s = sig[:j - i] * gain
    fx[i:j, 0] += s * (1 - pan) ** 0.5; fx[i:j, 1] += s * (1 + pan) ** 0.5

def whoosh(length, rise=0.75):
    m = int(length * SR); x = rng.standard_normal(m)
    env = np.concatenate([np.linspace(0, 1, int(m * rise)) ** 2, np.linspace(1, 0, m - int(m * rise)) ** 1.5])
    y = np.zeros(m); seg = 8
    for k in range(seg):  # a band that sweeps upward
        a, b = k * m // seg, (k + 1) * m // seg; c = 300 + 2600 * (k / seg) ** 1.5
        y[a:b] = band(x, c * 0.6, c * 1.6)[a:b]
    return y * env
def shimmer(length=1.8, base=1568):
    m = int(length * SR); tt = np.arange(m) / SR; y = np.zeros(m)
    for k, f in enumerate([base, base * 1.5, base * 2, base * 2.997, base * 4.01]):
        y += np.sin(2 * np.pi * f * tt + k) * np.exp(-tt * (2.2 + k * 0.6)) / (k + 1)
    return y * np.clip(tt / 0.01, 0, 1)
def tick(): m = int(0.06 * SR); tt = np.arange(m) / SR; return band(rng.standard_normal(m), 2000, 6000) * np.exp(-tt * 90) + np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt * 60) * 0.5
def boom(length=1.6):
    m = int(length * SR); tt = np.arange(m) / SR; f = 70 * np.exp(-tt * 3) + 38
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.6)
    crack = low(rng.standard_normal(m), 3000) * np.exp(-tt * 28)
    return body + 0.5 * crack
def puff(): m = int(0.5 * SR); tt = np.arange(m) / SR; return band(rng.standard_normal(m), 400, 2500) * np.exp(-tt * 9) * np.clip(tt / 0.01, 0, 1)
def scatter(length, density, seed):
    m = int(length * SR); y = np.zeros(m); r = np.random.default_rng(seed)
    for _ in range(int(density * length)):
        i = int(r.random() * (m - 600)); g = r.random() ** 2
        y[i:i + 600] += band(r.standard_normal(600), 3000, 9000) * np.exp(-np.arange(600) / 70) * g
    return y * np.linspace(1, 0.2, m)
def riser(length):
    m = int(length * SR); tt = np.arange(m) / SR; x = rng.standard_normal(m)
    return band(x, 500, 5000) * (tt / length) ** 2.5

place(whoosh(0.5), 0.0, 0.10)                         # the flame catches
place(shimmer(2.2, 1318), 1.06, 0.05)                 # Ganesha appears
for a in (3.35, 8.6, 13.65, 22.35):                   # pushes, dives and the warp
    place(whoosh(T := ({3.35: 0.36, 8.6: 0.38, 13.65: 0.6, 22.35: 0.4}[a])), a, 0.14)
for i in range(4): place(puff(), 6.33 + i * 0.07, 0.07, -0.6 if i % 2 == 0 else 0.6)   # pasupu
for i in range(4): place(puff(), 7.63 + i * 0.07, 0.07, -0.6 if i % 2 == 0 else 0.6)   # kumkuma
place(shimmer(2.6, 1760), 15.2, 0.07)                 # two stars become one
place(shimmer(2.0, 2093), 20.47, 0.05)                # the names lock in gold
place(riser(1.5), 28.55, 0.08)                        # the build
for a in (28.75, 29.12, 29.49, 29.84): place(tick(), a, 0.16)   # 8:19 … 8:22
place(boom(), 30.09, 0.32)                            # the drop
place(scatter(0.5, 300, 1), 30.15, 0.05)              # rice leaves the hand
place(scatter(2.6, 160, 2), 31.06, 0.04)              # and showers down
place(whoosh(0.3, 0.6), 33.8, 0.10)                   # paper sweeps over silk
place(whoosh(0.32, 0.6), 38.75, 0.10)                 # silk rises for శుభం
place(shimmer(1.8, 1568), 39.7, 0.04)                 # the gleam

# let the effects through: dip the song briefly under the drop's boom
duck = 1 - 0.35 * np.exp(-np.clip(t - 30.09, 0, None) * 4) * (t >= 30.09)
mix = song * duck[:, None] + fx
peak = np.max(np.abs(mix)); mix *= min(1.0, 0.89 / peak)   # peaks at about -1 dBFS
pcm = (np.clip(mix, -1, 1) * 32767).astype('<i2')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', out], input=pcm.tobytes(), check=True)
print(f'wrote {out}: {DUR}s, peak {20 * np.log10(np.max(np.abs(mix)) + 1e-9):.1f} dBFS')
