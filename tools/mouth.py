# Mouth-opening track for a talking character, from the episode's voice-over.
#   python3 tools/mouth.py episodes/<slug>      -> episodes/<slug>/mouth.json  {"fps": 60, "v": [0..1, ...]}
import sys, json, numpy as np, soundfile as sf
ep = sys.argv[1].rstrip('/')
a, sr = sf.read(f'{ep}/audio/vo.wav', dtype='float32')
if a.ndim > 1: a = a.mean(1)
fps = 60; hop = sr // fps
rms = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2)) for i in range(0, len(a) - hop, hop)])
ref = np.percentile(rms[rms > 1e-4], 90) if (rms > 1e-4).any() else 1
v = np.clip(rms / ref, 0, 1) ** 0.7
v = np.convolve(v, np.ones(3) / 3, 'same')                  # soften
v[v < 0.12] = 0
json.dump({'fps': fps, 'v': [round(float(x), 3) for x in v]}, open(f'{ep}/mouth.json', 'w'))
print('mouth frames', len(v))
