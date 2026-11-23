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
T=dict(gota=at(1,'gota'), minuto=at(1,'minuto'), pulmones=at(2,'pulmones'), oxigeno=at(2,'oxígeno'), segundo=at(2,'segundo'), rojo=at(2,'rojo'),
 corazon2=at(3,'corazón'), cienmil=at(3,'cien'), vacaciones=at(3,'vacaciones'),
 camino=at(4,'camino'), cerebro=at(4,'cerebro'), dos=at(4,'dos'), quince=at(4,'quince'),
 rinones=at(5,'riñones'), ciento=at(5,'ciento'), banera=at(5,'bañera'),
 largo=at(6,'largo'), pies=at(6,'pies'), gravedad=at(6,'gravedad'),
 duermes=at(7,'duermes'), nacieras=at(7,'nacieras'),
 vuelve=at(8,'vuelve'), completa=at(8,'completa'),
 setenta=at(9,'setenta'), amigo=at(9,'amigo'), end=round(d['duration']+0.4,2))
json.dump({"S":S,"T":T,"twist_scene":6},open('timing.json','w'),indent=1)
print(S); print(T)
