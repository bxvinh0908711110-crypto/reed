import json,os,sys,time
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
T=os.environ['TEMP']+'/gen/'
texts=json.load(open(T+'texts.json',encoding='utf-8'))
VOICES={'female':'af_sarah','male':'am_adam'}
out=r'E:\Your English\deploy\audio'
k=Kokoro(r'E:\Your English\tools\models\kokoro-v1.0.onnx', r'E:\Your English\tools\models\voices-v1.0.bin')
t0=time.time(); n=0; short=0
for i,t in enumerate(texts):
    for kind,v in VOICES.items():
        d=os.path.join(out,kind); os.makedirs(d,exist_ok=True)
        f=os.path.join(d,'a%03d.mp3'%i)
        s,sr=k.create(t,voice=v,speed=0.95,lang='en-us')
        pad=np.zeros(int(sr*0.12),dtype=s.dtype)      # đệm im lặng ngắn ở đầu/cuối cho khỏi cụt tiếng
        sf.write(f,np.concatenate([pad,s,pad]),sr,format='MP3')
        n+=1
    if i%20==0: print(i,len(texts),round(time.time()-t0),'s',flush=True)
print('done',n,round(time.time()-t0),'s')
