# Synthesize each line, place them with short gaps, and align every script word to the audio:
# whisper word timestamps matched to the script by sequence alignment (numbers normalized),
# unmatched words interpolated between matched neighbours.
import json, subprocess, wave, numpy as np, re, difflib, sys
from faster_whisper import WhisperModel
VOICE=sys.argv[1]; LS=sys.argv[2] if len(sys.argv)>2 else '0.95'
lines=open('vo/lines.txt').read().splitlines()
LEAD=0.25; GAP=float(sys.argv[3]) if len(sys.argv)>3 else 0.28
NUM={'11':'once','17':'diecisiete','1964':'mil novecientos sesenta y cuatro','7':'siete','100':'cien','65':'sesenta y cinco','264':'doscientas sesenta y cuatro','14':'catorce','2':'dos','4':'cuatro','1960':'mil novecientos sesenta'}
def nrm(w): return re.sub(r'[^a-záéíóúñü]','',w.lower())
def hyp_tokens(words):
    out=[]
    for w in words:
        parts=re.findall(r'\d+|[^\d\s]+',w.word.strip())
        for p in parts:
            if p.isdigit() and p in NUM:
                for x in NUM[p].split(): out.append((x,w.start,w.end))
            else:
                n=nrm(p)
                if n: out.append((n,w.start,w.end))
    return out
m=WhisperModel("small",device="cpu",compute_type="int8")
SR=None; buf=[]; t=LEAD; segs=[]
for i,txt in enumerate(lines,1):
    if VOICE!='pre': subprocess.run(['python3','-m','piper','-m',VOICE,'-f',f'vo/l{i}.wav','--length-scale',LS,'--sentence-silence','0.2'],input=txt.encode(),capture_output=True,check=True)
    w=wave.open(f'vo/l{i}.wav'); sr=w.getframerate(); a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
    if SR is None: SR=sr; buf.append(np.zeros(int(LEAD*SR),np.float32))
    nz=np.nonzero(np.abs(a)>0.01)[0]; a=a[nz[0]:nz[-1]+int(0.08*SR)]
    x=np.interp(np.arange(0,len(a)/SR,1/16000),np.arange(len(a))/SR,a).astype(np.float32)
    res,_=m.transcribe(x,language='es',word_timestamps=True)
    ww=[w for s in res for w in s.words]; H=hyp_tokens(ww)
    toks=txt.split(); S=[nrm(x) for x in toks]
    sm=difflib.SequenceMatcher(None,S,[h[0] for h in H],autojunk=False)
    st=[None]*len(toks)
    for b in sm.get_matching_blocks():
        for k in range(b.size): st[b.a+k]=H[b.b+k][1]
    # fuzzy: equal-length replace blocks map 1:1
    for op,a0,a1,b0,b1 in sm.get_opcodes():
        if op=='replace':
            for k in range(a1-a0):
                j=b0+round(k*(b1-b0)/(a1-a0)) if b1>b0 else None
                if j is not None and j<b1: st[a0+k]=H[j][1]
    d=len(a)/SR
    known=[(k,v) for k,v in enumerate(st) if v is not None]
    if not known: known=[(0,0.0)]
    xs=[k for k,_ in known]; ys=[v for _,v in known]
    xs=[-1]+xs+[len(toks)]; ys=[0.0]+ys+[d]
    st=[float(np.interp(k,xs,ys)) if v is None else v for k,v in enumerate(st)]
    for k in range(1,len(st)): st[k]=max(st[k],st[k-1]+0.04)
    matched=sum(b.size for b in sm.get_matching_blocks())
    segs.append({"i":i,"start":round(t,3),"end":round(t+d,3),"text":txt,"words":[{"w":tk,"t":round(t+s,3)} for tk,s in zip(toks,st)],"heard":" ".join(w.word for w in ww),"match":round(matched/len(S),2)})
    buf+=[a,np.zeros(int(GAP*SR),np.float32)]; t+=d+GAP
buf.append(np.zeros(int(0.7*SR),np.float32))
y=np.concatenate(buf); y=y/np.max(np.abs(y))*0.9
w=wave.open('vo.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y*32767).astype(np.int16).tobytes()); w.close()
json.dump({"duration":round(len(y)/SR,3),"segments":segs},open('../vo.json','w'),ensure_ascii=False,indent=1)
print('total',round(len(y)/SR,2))
for s in segs: print(s['i'],s['start'],s['end'],s['match'],'|',s['heard'])
