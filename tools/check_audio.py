# Transcribe a finished video so the narration can be compared with the script:  python3 tools/check_audio.py <mp4>
import sys, subprocess, numpy as np
from faster_whisper import WhisperModel
a = np.frombuffer(subprocess.run(['ffmpeg','-loglevel','error','-i',sys.argv[1],'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout, np.float32)
s, _ = WhisperModel('small', device='cpu', compute_type='int8').transcribe(a, language='es')
print(' '.join(x.text for x in s))
