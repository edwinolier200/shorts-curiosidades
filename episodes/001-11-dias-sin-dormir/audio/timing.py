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
T=dict(eleven=at(1,'once'), dormir=at(1,'dormir'), cerebro=at(1,'cerebro'),
 randy=at(2,'randy'), age=at(2,'diecisiete'), year=at(2,'mil'), feria=at(2,'feria'),
 ojos=at(3,'ojos'), enfocar=at(3,'enfocar'), reconoce=at(3,'reconoce'), tocar=at(3,'tocarlos'),
 senal=at(4,'señal'), persona=at(4,'persona'),
 famoso=at(5,'famoso'), futbol=at(5,'fútbol'),
 arrastra=at(6,'arrastra'), palabras=at(6,'palabras'), tiemblan=at(6,'tiemblan'),
 cien=at(7,'cien'), detiene=at(7,'detiene'), n65=at(7,'sesenta'), olvida=at(7,'ya'),
 h264=at(8,'doscientas'), duerme=at(8,'duerme'), catorce=at(8,'catorce'),
 prohibido=at(9,'prohibido'), guinness=at(9,'guinness'),
 cuantas=at(10,'cuántas'), d2=at(3,'dos'), d4=at(4,'cuatro'), d7=at(6,'siete'), d11=at(7,'once'), end=round(d['duration']+0.3,2))
json.dump({"S":S,"T":T},open('timing.json','w'),indent=1)
print(S); print(T)
