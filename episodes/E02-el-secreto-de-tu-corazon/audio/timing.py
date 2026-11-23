# Scene starts + key-word times for film.js and score.py, read from the aligned voice-over.
import json, re
d=json.load(open('vo.json'))
n=lambda w: re.sub(r'[^a-záéíóúñü]','',w.lower())
def at(seg, word, occ=1):
    c=0
    for w in d['segments'][seg-1]['words']:
        if n(w['w']).startswith(word):
            c+=1
            if c==occ: return w['t']
    raise SystemExit(f'missing {word} in {seg}')
seg=d['segments']
S=[0.0]+[s['start'] for s in seg[1:]]
T=dict(musculo=at(1,'músculo'), nacieras=at(1,'nacieras'), secreto=at(2,'secreto'), final=at(2,'final'),
 cien=at(3,'cien'), tres=at(3,'tres'), vida=at(3,'vida'),
 siete=at(4,'siete'), treinta=at(4,'treinta'), barriles=at(4,'barriles'),
 electricidad=at(5,'electricidad'), sacas=at(5,'sacas'), latiendo=at(5,'latiendo'),
 renueva=at(6,'renueva'), piel=at(6,'piel'), globulos=at(6,'glóbulos'), cuatro=at(6,'cuatro'),
 celulas=at(7,'células'), edad=at(7,'edad'),
 secreto2=at(8,'secreto'), descansa=at(8,'descansa'),
 relaja=at(9,'relaja'), dos=at(9,'dos'), descansando=at(9,'descansando'),
 trabajador=at(10,'trabajador'), tarde=at(10,'tarde'),
 mano=at(11,'mano'), trabajando=at(11,'trabajando'),
 compartele=at(12,'compártele'), corazon=at(12,'corazón'), end=round(d['duration']+0.6,2))
json.dump({"S":S,"T":T,"twist_scene":7},open('timing.json','w'),indent=1)
print(S); print(T)
