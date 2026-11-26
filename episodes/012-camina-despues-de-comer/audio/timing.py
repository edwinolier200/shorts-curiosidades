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
T=dict(almorzar=at(1,'almorzar'), sientas=at(1,'sientas'), azucar=at(1,'azúcar'),
 barriga=at(2,'barriga'), movimiento=at(2,'movimiento'),
 comes=at(3,'comes'), sube=at(3,'sube'), normal=at(3,'normal'),
 sentado=at(4,'sentado'), tarda=at(4,'tarda'),
 caminar=at(5,'caminar'), musculos=at(5,'músculos'), gasolina=at(5,'gasolina'),
 estudio=at(6,'estudio'), diez=at(6,'diez'), doce=at(6,'doce'), sola=at(6,'sola'),
 cena=at(7,'cena'), veintidos=at(7,'veintidós'),
 glucometro=at(8,'medidor'), horas=at(8,'horas'), sentado2=at(8,'sentado'), caminando=at(8,'caminando'),
 diez2=at(9,'diez'), gimnasio=at(9,'gimnasio'), cuadra=at(9,'cuadra'),
 corazon=at(10,'corazón'), medico=at(10,'médico'),
 tio=at(11,'tío'), almuerzo=at(11,'almuerzo'),
 proxima=at(12,'próxima'), pie=at(12,'pie'), sigueme=at(12,'sígueme'),
 end=round(d['segments'][-1]['end']+1.7,2))   # end from the last spoken word (+ outro), never from the file length
json.dump({"S":S,"T":T,"twist_scene":5},open('timing.json','w'),indent=1)
print(S); print(T)
