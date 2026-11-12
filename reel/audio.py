"""Score for the invitation film: "Dichotomy of Fame" from its first note, faded at the
end, with a few quiet, warm sounds where the picture asks for them.
python3 audio.py out/sound.wav [duration]"""
import subprocess, sys, numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
out = sys.argv[1] if len(sys.argv) > 1 else 'out/sound.wav'
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 69.0
START = float(sys.argv[3]) if len(sys.argv) > 3 else 44.91
raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(START), '-t', str(DUR), '-i', '../audio/dichotomy-of-fame.mp3', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                     capture_output=True, check=True).stdout
song = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
n = int(DUR * SR); song = np.pad(song, ((0, max(0, n - len(song))), (0, 0)))[:n]
t = np.arange(n) / SR
song *= (np.clip(t / 1.2, 0, 1) * np.clip((DUR - t) / 2.2, 0, 1) ** 1.6)[:, None]

fx = np.zeros((n, 2)); rng = np.random.default_rng(4)
def low(x, f): return sosfilt(butter(2, f, btype='low', fs=SR, output='sos'), x)
def place(sig, at, gain):
    i = int(at * SR); j = min(n, i + len(sig)); fx[i:j, 0] += sig[:j - i] * gain; fx[i:j, 1] += sig[:j - i] * gain
def shimmer(length, base):
    m = int(length * SR); tt = np.arange(m) / SR; y = np.zeros(m)
    for k, f in enumerate([base, base * 1.5, base * 2, base * 3.0, base * 4.0]): y += np.sin(2 * np.pi * f * tt + k) * np.exp(-tt * (1.4 + k * 0.5)) / (k + 1)
    return y * np.clip(tt / 0.05, 0, 1)
def swell(length):  # a warm, low bloom for the moment the arch fills with light
    m = int(length * SR); tt = np.arange(m) / SR
    body = (np.sin(2 * np.pi * 55 * tt) + 0.5 * np.sin(2 * np.pi * 82.5 * tt)) * np.exp(-tt * 1.3)
    air = low(rng.standard_normal(m), 900) * np.exp(-tt * 2.5) * 0.4
    return (body + air) * np.clip(tt / 0.08, 0, 1)

for song_t, sig, gain in [(46.6, shimmer(2.6, 1318), 0.035),   # Ganesha gathers from gold
                          (67.31, shimmer(3.0, 1760), 0.045),   # two stars become one
                          (69.5, shimmer(2.4, 2093), 0.035),   # the names settle in gold
                          (87.7, swell(3.5), 0.16),            # the arch fills with light
                          (104.0, shimmer(2.6, 1568), 0.03),   # శుభం
                          (109.0, shimmer(2.8, 1318), 0.025)]:  # the last, quiet note
    place(sig, song_t - START, gain)

mix = song + fx
mix *= min(1.0, 0.89 / np.max(np.abs(mix)))
pcm = (np.clip(mix, -1, 1) * 32767).astype('<i2')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', out], input=pcm.tobytes(), check=True)
print(f'wrote {out}: {DUR}s, peak {20 * np.log10(np.max(np.abs(mix)) + 1e-9):.1f} dBFS')
