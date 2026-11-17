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
T=dict(n382=at(1,'trescientos'), cuerpo=at(1,'cuerpo'),
 angus=at(2,'angus'), year=at(2,'mil'), age=at(2,'veintisiete'), kilos=at(2,'doscientos'),
 dias=at(3,'días'), seguir=at(3,'seguir'),
 agua=at(4,'agua'), te=at(4,'té'), cafe=at(4,'café'), vitaminas=at(4,'vitaminas'),
 grasa=at(5,'grasa'), combustible=at(5,'combustible'),
 hospital=at(6,'hospital'), analisis=at(6,'análisis'),
 d382=at(7,'trescientos'), ochenta=at(7,'ochenta',2), perdido=at(7,'perdido'), ciento=at(7,'ciento'),
 cinco=at(8,'cinco'), noventa=at(8,'noventa'),
 ojo=at(9,'ojo'), intentes=at(9,'intentes'),
 cuantas=at(10,'cuántas'), end=round(d['duration']+0.3,2))
json.dump({"S":S,"T":T},open('timing.json','w'),indent=1)
print(S); print(T)
