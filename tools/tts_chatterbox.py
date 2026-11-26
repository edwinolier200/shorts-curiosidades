# Voice-over with Chatterbox Multilingual (Resemble AI, MIT licence), one wav per line of vo/lines.txt.
#   cd episodes/<slug>/audio && PYTHONPATH=<repo>/tools/shim python3 <repo>/tools/tts_chatterbox.py
# Every line is checked with Whisper: a take is rejected if ANY script word of 4+ letters is not heard as written
# (mispronounced / cut) or the overall match is under 90 %; up to 6 tries (TRIES), best take kept, leftovers printed
# as WARNING so the line can be rewritten with easier words. Each take is trimmed and faded (no clipped endings).
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
import unicodedata
plain = lambda s: ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
norm = lambda s: [w for w in re.sub(r'[^a-zñ0-9 ]', ' ', plain(s.lower().replace('%', ' por ciento '))).split()]
def words(s):
    out = []
    for w in norm(s):
        out += norm(num2words(int(w), lang='es')) if w.isdigit() else [w]
    return out
def score(audio, sr, text):
    """(ratio, bad words): bad = script words of 4+ letters that Whisper did not hear as written (mispronounced,
    swallowed or cut). Names may be heard glued ("dontito"), so a word also counts if it appears inside the glued text."""
    x = np.interp(np.arange(0, len(audio) / sr, 1 / 16000), np.arange(len(audio)) / sr, audio).astype(np.float32)
    seg, _ = asr.transcribe(x, language='es', beam_size=5)
    a, b = words(text), words(' '.join(s.text for s in seg))
    glued = ''.join(b)
    bad = [w for w in a if len(w) >= 4 and w not in b and w not in glued]
    return difflib.SequenceMatcher(None, a, b).ratio(), bad
def tidy(w, sr):
    """trim leading/trailing silence, keep 0.12 s of air, fade the last 60 ms (no clicks, no clipped endings)"""
    env = np.abs(w); thr = max(1e-4, 0.02 * env.max()); idx = np.where(env > thr)[0]
    if len(idx): w = w[max(0, idx[0] - int(0.05 * sr)): min(len(w), idx[-1] + int(0.12 * sr))]
    f = int(0.06 * sr); w = w.copy(); w[-f:] *= np.linspace(1, 0, f); return w
lines = open('vo/lines.txt').read().splitlines()
# ONLY=3,9 regenerates just those lines; SEED=n changes the takes
ONLY = {int(x) for x in os.environ.get('ONLY', '').split(',') if x.strip()}
SEED = int(os.environ.get('SEED', 0))
for i, line in enumerate(lines, 1):
    if ONLY and i not in ONLY: continue
    best = (None, None)
    for k in range(int(os.environ.get('TRIES', 6))):
        torch.manual_seed(1000 * i + k + 97 * SEED)
        kw = dict(language_id='es', exaggeration=EXAG, cfg_weight=CFG)
        if os.path.exists(REF): kw['audio_prompt_path'] = REF
        w = tidy(m.generate(line, **kw).squeeze(0).numpy(), m.sr)
        r, bad = score(w, m.sr, line)
        key = (-len(bad), r)
        if best[0] is None or key > best[0]: best = (key, w, bad)
        if not bad and r >= float(os.environ.get('MIN_MATCH', 0.9)): break
    a = best[1] / max(1e-6, np.max(np.abs(best[1]))) * 0.9
    sf.write(f'vo/l{i}.wav', (a * 32767).astype(np.int16), m.sr, subtype='PCM_16')
    if best[2]: print(f'{i} WARNING mal pronunciadas: {best[2]}', flush=True)
    best = (best[0][1], best[1])
    print(i, round(len(a) / m.sr, 2), 's  match', round(best[0], 2), flush=True)
