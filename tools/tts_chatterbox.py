# Voice-over with Chatterbox Multilingual (Resemble AI, MIT licence), one wav per line of vo/lines.txt.
#   cd episodes/<slug>/audio && PYTHONPATH=<repo>/tools/shim python3 <repo>/tools/tts_chatterbox.py
# Every line is checked with Whisper; a take whose transcript matches the script under 85% is
# regenerated (up to 4 tries) and the best take is kept.
# Optional: put a 10-20 s clean recording at <repo>/voices/narrador.wav (a voice you have the rights to)
# and every line is spoken in that voice. Without it the model's default voice is used.
import os, re, sys, difflib, numpy as np, soundfile as sf, torch
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from faster_whisper import WhisperModel
from num2words import num2words
torch.set_num_threads(os.cpu_count() or 4)
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
REF = os.path.join(REPO, 'voices', 'narrador.wav')
EXAG = float(os.environ.get('VOICE_EXAGGERATION', 0.6)); CFG = float(os.environ.get('VOICE_CFG', 0.4))
m = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
asr = WhisperModel('small', device='cpu', compute_type='int8')
norm = lambda s: [w for w in re.sub(r'[^a-záéíóúñü0-9 ]', ' ', s.lower()).split()]
def words(s):
    out = []
    for w in norm(s):
        out += norm(num2words(int(w), lang='es')) if w.isdigit() else [w]
    return out
def score(audio, sr, text):
    x = np.interp(np.arange(0, len(audio) / sr, 1 / 16000), np.arange(len(audio)) / sr, audio).astype(np.float32)
    seg, _ = asr.transcribe(x, language='es')
    a, b = words(text), words(' '.join(s.text for s in seg))
    return difflib.SequenceMatcher(None, a, b).ratio()
lines = open('vo/lines.txt').read().splitlines()
# ONLY=3,9 regenerates just those lines; SEED=n changes the takes
ONLY = {int(x) for x in os.environ.get('ONLY', '').split(',') if x.strip()}
SEED = int(os.environ.get('SEED', 0))
for i, line in enumerate(lines, 1):
    if ONLY and i not in ONLY: continue
    best = (-1, None)
    for k in range(4):
        torch.manual_seed(1000 * i + k + 97 * SEED)
        kw = dict(language_id='es', exaggeration=EXAG, cfg_weight=CFG)
        if os.path.exists(REF): kw['audio_prompt_path'] = REF
        w = m.generate(line, **kw).squeeze(0).numpy()
        s = score(w, m.sr, line)
        if s > best[0]: best = (s, w)
        if s >= float(os.environ.get('MIN_MATCH', 0.85)): break
    a = best[1] / max(1e-6, np.max(np.abs(best[1]))) * 0.9
    sf.write(f'vo/l{i}.wav', (a * 32767).astype(np.int16), m.sr, subtype='PCM_16')
    print(i, round(len(a) / m.sr, 2), 's  match', round(best[0], 2), flush=True)
