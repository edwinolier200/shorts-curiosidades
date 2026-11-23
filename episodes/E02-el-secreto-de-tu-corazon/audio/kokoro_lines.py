import soundfile as sf, numpy as np
from kokoro import KPipeline
p=KPipeline(lang_code='e', repo_id='hexgrad/Kokoro-82M')
lines=open('vo/lines.txt').read().splitlines()
for i,l in enumerate(lines,1):
    a=np.concatenate([au.numpy() for _,_,au in p(l,voice='em_alex',speed=1.08,split_pattern=None)])
    sf.write(f'vo/l{i}.wav',(a*32767).clip(-32768,32767).astype(np.int16),24000,subtype='PCM_16'); print(i,round(len(a)/24000,2))
