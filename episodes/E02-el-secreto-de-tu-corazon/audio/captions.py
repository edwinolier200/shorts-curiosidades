import json,re
d=json.load(open('vo.json'))
REP=[("cien mil","100.000"),("tres mil millones","3.000 millones"),("siete mil litros","7.000 litros"),("treinta y cinco","35"),("cuatro meses...","4 meses..."),("dos tercios","2/3")]
KEY={"músculo","nacieras.","secreto","final.","100.000","3.000","millones","7.000","litros","35","barriles.","electricidad.","solo","renueva.","piel","mes,","4","meses...","edad.","descansa.","relaja,","2/3","descansando.","trabajador","tarde.","pecho.","corazón."}
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
        out.append({"t":c[0][1],"seg":s['i'],"words":[{"w":w.upper(),"o":w.replace("\u00a0"," "),"t":tt,"k":w in KEY} for w,tt in c]})
for i,c in enumerate(out):
    nxt=out[i+1]["t"] if i+1<len(out) else d["duration"]
    seg_end=[s['end'] for s in d['segments'] if s['i']==c['seg']][0]
    c["end"]=round(min(nxt, seg_end+0.25 if (i+1==len(out) or out[i+1]['seg']!=c['seg']) else nxt),3)
json.dump({"segments":[{k:s[k] for k in ('i','start','end')} for s in d['segments']],"captions":out},open('captions.json','w'),ensure_ascii=False,indent=0)
for c in out: print(f"{c['t']:6.2f}-{c['end']:6.2f}", " ".join(w['w'] for w in c['words']))
