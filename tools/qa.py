# Automatic quality gate for a finished episode. Writes episodes/<slug>/qa/ (report.md, report.json, sheet.png)
# and appends one line to aprendizaje/BITACORA_QA.md so quality can be compared day after day.
#   python3 tools/qa.py episodes/<slug> [path/to/final.mp4]
# Checks: duration (Shorts ≤ 3 min, ideal 45-75 s), exposure (mean light, % blown-out and % crushed pixels per frame),
# visual change rate (how often the picture changes: a still screen > 3 s loses viewers), loudness (-14 LUFS ±1, peak ≤ -1 dBTP),
# voice intelligibility (Whisper transcript vs the script), pronunciation (every script word of 4+ letters heard as written),
# a complete ending (voice ends 0.8-2.5 s before the end, audible closing sting), and a 12-frame contact sheet.
import sys, os, json, re, subprocess, datetime, difflib
import numpy as np
from PIL import Image, ImageDraw

ep = sys.argv[1].rstrip('/'); slug = os.path.basename(ep)
mp4 = sys.argv[2] if len(sys.argv) > 2 else next((os.path.join(ep, 'publicar', f) for f in sorted(os.listdir(os.path.join(ep, 'publicar'))) if f.endswith('.mp4')), f'out/{ep}/final.mp4')
out = os.path.join(ep, 'qa'); os.makedirs(out, exist_ok=True)
run = lambda *a: subprocess.run(a, capture_output=True, text=True)
dur = float(run('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4).stdout.strip())

# ---- frames at 2 fps, small, for exposure + change rate
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp4, '-vf', 'fps=2,scale=135:240,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, 240, 135).astype(np.float32)
mean = F.mean(axis=(1, 2)); blown = (F > 250).mean(axis=(1, 2)) * 100; crushed = (F < 6).mean(axis=(1, 2)) * 100
# a visual change = at least 1.5 % of the picture changes clearly (new card, cut, big move); a slow drift does not count
diff = (np.abs(np.diff(F, axis=0)) > 20).mean(axis=(1, 2))
changes = np.where(diff > 0.015)[0]
gaps = np.diff(np.concatenate([[0], changes, [len(F) - 1]])) / 2.0
longest_still = float(gaps.max()) if len(gaps) else dur

# ---- loudness
eb = run('ffmpeg', '-hide_banner', '-nostats', '-i', mp4, '-af', 'ebur128=peak=true', '-f', 'null', '-').stderr
lufs = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', eb)[-1]); tp = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', eb)[-1])
tail = run('ffmpeg', '-hide_banner', '-nostats', '-sseof', '-1.0', '-i', mp4, '-af', 'volumedetect', '-f', 'null', '-').stderr
tail_db = float((re.findall(r'mean_volume:\s+(-?[\d.]+) dB', tail) or ['-99'])[-1])

# ---- voice intelligibility (optional)
match = None; misheard = []; last_word_end = None
lines = os.path.join(ep, 'audio', 'vo', 'lines.txt')
try:
    from faster_whisper import WhisperModel
    wav = os.path.join(out, 'a.wav'); run('ffmpeg', '-y', '-v', 'error', '-i', mp4, '-ac', '1', '-ar', '16000', wav)
    import soundfile as sf
    a, _ = sf.read(wav, dtype='float32')
    segs, _ = WhisperModel(os.environ.get('QA_WHISPER', 'medium'), device='cpu', compute_type='int8').transcribe(a, language='es', beam_size=5, word_timestamps=True)
    segs = list(segs); heard = ' '.join(s.text for s in segs); os.remove(wav)
    last_word_end = max((w.end for s in segs for w in (s.words or [])), default=None)
    import unicodedata
    plain = lambda s: ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
    norm = lambda s: re.sub(r'[^a-zñ0-9 ]', ' ', plain(s.lower().replace('%', ' por ciento '))).split()
    if os.path.exists(lines):
        from num2words import num2words
        script = []
        for w in norm(open(lines).read()): script += norm(num2words(int(w), lang='es')) if w.isdigit() else [w]
        hw = []
        for w in norm(heard): hw += norm(num2words(int(w), lang='es')) if w.isdigit() else [w]
        match = round(difflib.SequenceMatcher(None, script, hw).ratio(), 3)
        glued = ''.join(hw)
        misheard = sorted({w for w in script if len(w) >= 4 and w not in hw and w not in glued})
    open(os.path.join(out, 'transcripcion.txt'), 'w').write(heard)
except Exception as e:
    heard = f'(sin whisper: {e})'

# ---- contact sheet (12 frames)
sheet = Image.new('RGB', (6 * 180, 2 * 320), 'black')
for i in range(12):
    t = dur * (i + 0.5) / 12
    png = os.path.join(out, f'_f{i}.png'); run('ffmpeg', '-y', '-v', 'error', '-ss', f'{t:.2f}', '-i', mp4, '-frames:v', '1', '-vf', 'scale=180:320', png)
    im = Image.open(png).convert('RGB'); ImageDraw.Draw(im).text((5, 5), f'{t:.1f}s', fill='yellow'); sheet.paste(im, ((i % 6) * 180, (i // 6) * 320)); os.remove(png)
sheet.save(os.path.join(out, 'sheet.png'))

# ---- verdicts
R = dict(slug=slug, date=datetime.date.today().isoformat(), duration=round(dur, 1), mean_light=round(float(mean.mean()), 1),
         worst_blown_pct=round(float(blown.max()), 1), worst_crushed_pct=round(float(crushed.max()), 1),
         visual_changes_per_10s=round(len(changes) / dur * 10, 1), longest_still_s=round(longest_still, 1),
         lufs=lufs, true_peak_dbfs=tp, voice_match=match, misheard_words=misheard,
         voice_end_s=round(float(last_word_end), 2) if last_word_end else None, tail_mean_db=tail_db)
checks = [('Duración 30-90 s', 30 <= dur <= 90), ('Luz media 35-150', 35 <= R['mean_light'] <= 150),
          ('Sin zonas quemadas (<8 % de píxeles a blanco en el peor fotograma)', R['worst_blown_pct'] < 8),
          ('Sin pantallas negras (<70 % de píxeles negros en el peor fotograma)', R['worst_crushed_pct'] < 70),
          ('Cambio visual frecuente (≥ 3 por cada 10 s)', R['visual_changes_per_10s'] >= 3), ('Ninguna imagen quieta > 3 s', longest_still <= 3),
          ('Volumen -14 LUFS ±1', abs(lufs + 14) <= 1), ('Pico ≤ -1 dBTP', tp <= -1),
          ('Voz entendible (≥ 0,85 de coincidencia con el guion)', match is None or match >= 0.85),
          ('Pronunciación: ninguna palabra del guion mal dicha o cortada' + (f' (revisar: {", ".join(misheard)})' if misheard else ''), not misheard),
          ('Final completo: la voz termina entre 0,8 y 2,5 s antes del final', last_word_end is None or 0.8 <= dur - last_word_end <= 2.5),
          ('Cierre audible: el último segundo no es silencio (remate musical)', tail_db > -40)]
R['passed'] = sum(ok for _, ok in checks); R['total'] = len(checks)
json.dump(R, open(os.path.join(out, 'report.json'), 'w'), indent=1, ensure_ascii=False, default=lambda o: o.item() if hasattr(o, 'item') else str(o))
md = [f'# QA · {slug} · {R["date"]}', '', f'Resultado: **{R["passed"]}/{R["total"]}**', ''] + [f'- {"✅" if ok else "❌"} {name}' for name, ok in checks]
md += ['', '```', json.dumps(R, indent=1, ensure_ascii=False, default=lambda o: o.item() if hasattr(o, 'item') else str(o)), '```', '', '![hoja de contacto](sheet.png)']
open(os.path.join(out, 'report.md'), 'w').write('\n'.join(md))
os.makedirs('aprendizaje', exist_ok=True); log = 'aprendizaje/BITACORA_QA.md'
if not os.path.exists(log): open(log, 'w').write('| fecha | episodio | QA | dur | luz | quemado % | cambios/10s | quieto máx | LUFS | voz |\n|---|---|---|---|---|---|---|---|---|---|\n')
open(log, 'a').write(f'| {R["date"]} | {slug} | {R["passed"]}/{R["total"]} | {R["duration"]} | {R["mean_light"]} | {R["worst_blown_pct"]} | {R["visual_changes_per_10s"]} | {R["longest_still_s"]} | {lufs} | {match} |\n')
print('\n'.join(md[:4 + len(checks)]))
