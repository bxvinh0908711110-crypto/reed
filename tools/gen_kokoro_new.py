import json, os, time
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ROOT = r'E:\Your English'
todo = json.load(open(ROOT + r'\tools\audio_new.json', encoding='utf-8'))
VOICES = {'female': 'af_sarah', 'male': 'am_adam'}   # giống bộ giọng đã dùng cho 3 bài đầu
out = ROOT + r'\deploy\audio'
k = Kokoro(ROOT + r'\tools\models\kokoro-v1.0.onnx', ROOT + r'\tools\models\voices-v1.0.bin')
t0 = time.time()
for n, item in enumerate(todo):
    for kind, v in VOICES.items():
        d = os.path.join(out, kind); os.makedirs(d, exist_ok=True)
        f = os.path.join(d, item['id'] + '.mp3')
        if os.path.exists(f):
            continue   # chạy lại được nếu bị ngắt giữa chừng
        s, sr = k.create(item['text'], voice=v, speed=0.95, lang='en-us')
        pad = np.zeros(int(sr * 0.12), dtype=s.dtype)
        sf.write(f, np.concatenate([pad, s, pad]), sr, format='MP3')
    if n % 10 == 0:
        print(n, len(todo), round(time.time() - t0), 's', flush=True)
print('done', len(todo), round(time.time() - t0), 's')
