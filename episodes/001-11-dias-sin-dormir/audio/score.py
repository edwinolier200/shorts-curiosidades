# Dark tension bed: drone + heartbeat that speeds up with sleep loss, stops at the blackout (65),
# slows to sleep at "duerme", returns for the twist and dies out on "¿y tú?".
import numpy as np, wave, json
tm=json.load(open('timing.json')); S=tm['S']; T=tm['T']
SR=48000; DUR=T['end']; N=int(SR*DUR); t=np.arange(N)/SR
rng=np.random.default_rng(7)
def env_lin(keys):  # [(time, value)]
    k=np.array(keys); return np.interp(t,k[:,0],k[:,1])
L=np.zeros(N); R=np.zeros(N)
# --- drone (A minor-ish, detuned), level follows tension
B0=T['n65']-0.02; R0=T['olvida']+0.3
lvl=env_lin([(0,.5),(S[1]-.3,.35),(S[2],.45),(S[6],.7),(B0-.05,.85),(B0,0),(R0-.6,0),(R0+.2,.6),(S[7],.6),(T['duerme'],.25),(S[8]-.2,.2),(S[8]+.1,.6),(S[9]-.3,.75),(DUR-1.2,.4),(DUR,0)])
for f,a,d in [(55,.5,.0),(55.4,.35,.3),(82.4,.25,.6),(110.2,.12,.9),(130.8,.06,.2)]:
    lfo=1+.25*np.sin(2*np.pi*.11*t+d*5)
    L+=a*np.sin(2*np.pi*f*t+d)*lfo*lvl; R+=a*np.sin(2*np.pi*f*1.002*t+d*1.7)*lfo*lvl
# airy noise, lowpassed by moving average
nz=rng.standard_normal(N); k=np.ones(60)/60; air=np.convolve(nz,k,'same')*env_lin([(0,.05),(S[6],.12),(B0-.05,.18),(B0,0),(R0-.3,0),(R0+.5,.08),(T['duerme'],.03),(S[8],.1),(DUR,0)])
L+=air; R+=np.roll(air,500)
# --- heartbeat
def thump(f0,dur=.16):
    n=int(dur*SR); tt=np.arange(n)/SR
    return np.sin(2*np.pi*(f0*np.exp(-tt*9))*tt*1.0+0)*np.exp(-tt*22)
hb=np.zeros(N); beats=[]
x=0.0
bpm=lambda s: np.interp(s,[0,S[1],S[2],S[5],S[6],B0,S[7],T['duerme'],S[8]-.4,S[8],S[9],DUR],[62,58,66,80,92,118,64,52,46,70,84,50])
while x<DUR-0.5:
    in_gap=(B0<x<R0) or (T['duerme']+0.6<x<S[8]) or x>DUR-1.0
    if not in_gap:
        for off,amp in [(0,1),(0.18,.6)]:
            i=int((x+off)*SR); s=thump(52 if off==0 else 48)*amp
            hb[i:i+len(s)]+=s[:N-i]
        beats.append(round(x,3))
    x+=60/bpm(x)
hbl=env_lin([(0,.9),(S[2],.7),(B0,1.1),(S[7],.6),(T['duerme'],.3),(S[8],.8),(DUR-1,.7)])
L+=hb*hbl*.9; R+=hb*hbl*.9
# --- clock ticks during the day countdown (13 s - 38.3 s)
for s in np.arange(S[2],B0,0.5):
    i=int(s*SR); n=int(.02*SR); c=rng.standard_normal(n)*np.exp(-np.arange(n)/SR*400)*.18
    pan=.3 if int(s*2)%2 else -.3
    L[i:i+n]+=c*(1-pan); R[i:i+n]+=c*(1+pan)
# --- rising tone into the blackout, cut dead at 38.32
RS=S[6]; RL=B0-RS
m=(t>RS)&(t<B0); f=np.where(m,220*2**((t-RS)/RL*1.5),0)
ph=np.cumsum(2*np.pi*f/SR); L+=np.sin(ph)*m*.05*((t-RS)/RL); R+=np.sin(ph*1.003)*m*.05*((t-RS)/RL)
y=np.stack([L,R],1); y/=np.max(np.abs(y))*1.12
fade=np.minimum(1,(DUR-t)/0.8)[:,None]; y*=np.clip(fade,0,1)
w=wave.open('audio/music.wav','w'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((y*32767).astype(np.int16).tobytes()); w.close()
P=0.5
json.dump({"bpm":120,"period":P,"offset":0.0,"beats":[round(i*P,3) for i in range(int(DUR/P)+1)],
           "downbeats":[round(i*P*4,3) for i in range(int(DUR/(P*4))+1)],"heartbeats":beats},open('beats.json','w'))
print('ok', len(beats),'heartbeats')
