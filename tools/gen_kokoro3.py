import json,os,time
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
T=os.environ['TEMP']+'/gen3/'
texts=json.load(open(T+'texts.json',encoding='utf-8'))
VOICES={'female':'af_sarah','male':'am_adam'}
out=r'E:\Your English\deploy\audio'
k=Kokoro(r'E:\Your English\tools\models\kokoro-v1.0.onnx', r'E:\Your English\tools\models\voices-v1.0.bin')
manifest={}
t0=time.time()
for i,t in enumerate(texts):
    manifest[t]='a%03d'%i
    for kind,v in VOICES.items():
        d=os.path.join(out,kind); os.makedirs(d,exist_ok=True)
        f=os.path.join(d,'a%03d.mp3'%i)
        s,sr=k.create(t,voice=v,speed=0.95,lang='en-us')
        pad=np.zeros(int(sr*0.12),dtype=s.dtype)
        sf.write(f,np.concatenate([pad,s,pad]),sr,format='MP3')
    if i%15==0: print(i,len(texts),round(time.time()-t0),'s',flush=True)
json.dump(manifest,open(T+'manifest.json','w',encoding='utf-8'),ensure_ascii=False)
print('done',len(texts),round(time.time()-t0),'s')
