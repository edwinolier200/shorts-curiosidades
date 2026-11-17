import json,re
d=json.load(open('vo.json'))
REP=[("mil novecientos sesenta y cuatro,","1964,"),("mil novecientos sesenta y cuatro","1964"),("doscientas sesenta y cuatro horas,","264 horas,"),("sesenta y cinco.","65."),
     ("diecisiete","17"),("Catorce","14"),("cien...","100…"),("día dos:","día 2:"),("día cuatro,","día 4,"),("día siete,","día 7,"),("día once,","día 11,"),
     ("siete en siete","7 en 7"),("once días","11 días"),("tú...","tú…"),("dormir...","dormir…")]
KEY={"11","días","dormir…","cerebro.","Randy","Gardner.","1964","17","feria","ciencias.","enfocar.","señal","tráfico","persona.","famoso","jugador",
     "fútbol","americano.","Arrastra","palabras.","tiemblan","manos.","7","100…","65.","recuerda","264 horas,","7 en 7","duerme.","14","prohibido.","peligroso.","Guinness","¿cuántas","anoche?","día 2:","día 4,","día 7,","día 11,","1964,","seguidos"}
out=[]
for s in d['segments']:
    toks=[(w['w'],w['t']) for w in s['words']]
    # merge replacements
    merged=[]; i=0
    while i<len(toks):
        hit=False
        for a,b in REP:
            n=len(a.split())
            if " ".join(x[0] for x in toks[i:i+n])==a:
                bt=b.split(' '); 
                for j,x in enumerate(bt): merged.append((x,toks[i][1] if j==0 else toks[min(i+n-1,i+j)][1]))
                i+=n; hit=True; break
        if not hit: merged.append(toks[i]); i+=1
    # chunk: <=3 words, <=16 chars, break after punctuation
    ch=[]; cur=[]
    for w,tt in merged:
        if cur and (len(cur)>=3 or len(" ".join(x[0] for x in cur+[(w,0)]))>17): ch.append(cur); cur=[]
        cur.append((w,tt))
        if re.search(r'[.,:?…]$',w): ch.append(cur); cur=[]
    if cur: ch.append(cur)
    for c in ch:
        out.append({"t":c[0][1],"seg":s['i'],"words":[{"w":w.upper(),"t":tt,"k":w in KEY} for w,tt in c]})
for i,c in enumerate(out):
    nxt=out[i+1]["t"] if i+1<len(out) else d["duration"]
    seg_end=[s['end'] for s in d['segments'] if s['i']==c['seg']][0]
    c["end"]=round(min(nxt, seg_end+0.25 if (i+1==len(out) or out[i+1]['seg']!=c['seg']) else nxt),3)
json.dump({"segments":[{k:s[k] for k in ('i','start','end')} for s in d['segments']],"captions":out},open('captions.json','w'),ensure_ascii=False,indent=0)
for c in out: print(f"{c['t']:6.2f}-{c['end']:6.2f}", " ".join(w['w'] for w in c['words']))
