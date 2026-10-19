# Tạo lại âm thanh của các CỤM (không có dấu câu cuối): thêm dấu chấm để Kokoro đọc trọn từ cuối (bản cũ bị cắt cụt, vd "brother").
# usage: tools/kokoro-venv/Scripts/python.exe tools/regen_phrases.py <phrases.json>   (mỗi mục {id,text})
import json, os, sys, time
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
ROOT = r'E:\Your English'
todo = json.load(open(sys.argv[1], encoding='utf-8'))
VOICES = {'female': 'af_sarah', 'male': 'am_adam'}
k = Kokoro(ROOT + r'\tools\models\kokoro-v1.0.onnx', ROOT + r'\tools\models\voices-v1.0.bin')
t0 = time.time()
for n, item in enumerate(todo):
    for kind, v in VOICES.items():
        f = os.path.join(ROOT, 'deploy', 'audio', kind, item['id'] + '.mp3')
        s, sr = k.create(item['text'], voice=v, speed=0.95, lang='en-us')
        pad = np.zeros(int(sr * 0.12), dtype=s.dtype)
        sf.write(f, np.concatenate([pad, s, pad]), sr, format='MP3')
    if n % 10 == 0: print(n, len(todo), round(time.time() - t0), 's', flush=True)
print('done', len(todo), round(time.time() - t0), 's')
