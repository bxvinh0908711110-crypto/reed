import soundfile as sf
from kokoro_onnx import Kokoro
k=Kokoro(r'E:\Your English\tools\models\kokoro-v1.0.onnx', r'E:\Your English\tools\models\voices-v1.0.bin')
text="On weekends, I usually hang out with my friends. We catch a movie and drink some coffee."
for v in ["af_heart","af_bella","af_sarah","am_michael","am_adam","bf_emma","bm_george"]:
    s,sr=k.create(text,voice=v,speed=0.95,lang="en-us" if v[0]=="a" else "en-gb")
    sf.write(rf'E:\Your English\tools\samples\kokoro_{v}.wav',s,sr)
    print(v,round(len(s)/sr,2),'s')
