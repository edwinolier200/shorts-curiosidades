# Generic tension bed for any episode: drone + heartbeat that speeds up through the escalation,
# clock ticks in the middle, a riser that cuts dead right before the twist (scene index TWIST),
# then a calmer pulse into the ending. Reads timing.json; writes audio/music.wav + beats.json.
#   python3 audio/score.py   (run from the episode dir; copy of tools/score_generic.py)
import numpy as np, wave, json
tm=json.load(open('timing.json')); S=tm['S']; T=tm['T']
TWIST=tm.get('twist_scene', len(S)-3)
SR=48000; DUR=T['end']; N=int(SR*DUR); t=np.arange(N)/SR
rng=np.random.default_rng(7)
env=lambda keys: np.interp(t,[k[0] for k in keys],[k[1] for k in keys])
X=S[TWIST]; mid=S[2]
L=np.zeros(N); R=np.zeros(N)
lvl=env([(0,.5),(S[1],.4),(mid,.45),(X-0.4,.8),(X-0.05,.85),(X,0),(X+0.6,0),(X+1.2,.5),(DUR-1.2,.4),(DUR,0)])
for f,a,d in [(55,.5,0),(55.4,.35,.3),(82.4,.25,.6),(110.2,.12,.9),(130.8,.06,.2)]:
    lfo=1+.25*np.sin(2*np.pi*.11*t+d*5)
    L+=a*np.sin(2*np.pi*f*t+d)*lfo*lvl; R+=a*np.sin(2*np.pi*f*1.002*t+d*1.7)*lfo*lvl
nz=rng.standard_normal(N); air=np.convolve(nz,np.ones(60)/60,'same')*env([(0,.05),(X-0.05,.15),(X,0),(X+1,.06),(DUR,0)])
L+=air; R+=np.roll(air,500)
def thump(f0,dur=.16):
    n=int(dur*SR); tt=np.arange(n)/SR
    return np.sin(2*np.pi*(f0*np.exp(-tt*9))*tt)*np.exp(-tt*22)
hb=np.zeros(N); x=0.0; beats=[]
bpm=lambda s: np.interp(s,[0,S[1],mid,X,X+0.6,DUR],[64,60,70,112,64,56])
while x<DUR-0.6:
    if not (X-0.05<x<X+0.6):
        for off,amp in [(0,1),(0.18,.6)]:
            i=int((x+off)*SR); s=thump(52 if off==0 else 48)*amp; hb[i:i+len(s)]+=s[:N-i]
        beats.append(round(x,3))
    x+=60/bpm(x)
L+=hb*.8; R+=hb*.8
for s in np.arange(mid,X-0.05,0.5):
    i=int(s*SR); n=int(.02*SR); c=rng.standard_normal(n)*np.exp(-np.arange(n)/SR*400)*.15
    pan=.3 if int(s*2)%2 else -.3; L[i:i+n]+=c*(1-pan); R[i:i+n]+=c*(1+pan)
RS=max(mid,X-4.0); m=(t>RS)&(t<X); ph=np.cumsum(2*np.pi*np.where(m,220*2**((t-RS)/(X-RS)*1.5),0)/SR)
L+=np.sin(ph)*m*.05*((t-RS)/(X-RS)); R+=np.sin(ph*1.003)*m*.05*((t-RS)/(X-RS))
# ending: the bed ducks out and a short resolving sting (bright major chord + one soft thump) closes the video,
# so it never just fades into nothing. The sting starts 1.5 s before the end (on the outro card).
ST=max(0.0,DUR-1.5); m=t>=ST; L*=np.where(m,np.clip(1-(t-ST)/0.35,0,1),1); R*=np.where(m,np.clip(1-(t-ST)/0.35,0,1),1)
tt=np.clip(t-ST,0,None)
for f,a in [(261.63,.30),(329.63,.24),(392.0,.22),(523.25,.16),(659.25,.10)]:
    v=a*np.sin(2*np.pi*f*tt)*np.exp(-tt*1.6)*(1-np.exp(-tt*60))*m; L+=v; R+=v*0.96
i0=int(ST*SR); s=thump(60,.3)*0.9; L[i0:i0+len(s)]+=s[:N-i0]; R[i0:i0+len(s)]+=s[:N-i0]
y=np.stack([L,R],1); y/=np.max(np.abs(y))*1.12; y*=np.clip((DUR-t)/0.2,0,1)[:,None]
w=wave.open('audio/music.wav','w'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y*32767).astype(np.int16).tobytes()); w.close()
P=0.5; json.dump({"bpm":120,"period":P,"offset":0.0,"beats":[round(i*P,3) for i in range(int(DUR/P)+1)],"downbeats":[round(i*P*4,3) for i in range(int(DUR/(P*4))+1)],"heartbeats":beats},open('beats.json','w'))
print('music ok', round(DUR,2), 's; twist at', X)
