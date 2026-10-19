# Tìm file âm thanh bị cắt cụt ở cuối (năng lượng tụt đột ngột ở âm cuối). Chạy: PYTHONUTF8=1 tools/kokoro-venv/Scripts/python.exe tools/scan_clip.py
import glob, os, numpy as np, soundfile as sf
bad=[]
for kind in ('female','male'):
    for f in sorted(glob.glob(rf'E:\Your English\deploy\audio\{kind}\a*.mp3')):
        x,sr=sf.read(f); x=x if x.ndim==1 else x.mean(1); n=int(sr*0.025)
        rms=np.array([np.sqrt(np.mean(x[i:i+n]**2)+1e-12) for i in range(0,len(x)-n,n)]); db=20*np.log10(rms)
        v=np.where(db>-45)[0]
        if len(v)<4: continue
        last=v[-1]; peak=db[v].max()
        drop=db[last-1]-db[last+1] if last+1<len(db) else 0   # tụt trong 2 khung 25ms cuối
        tail=db[max(0,last-2):last+1]
        # cắt cụt: khung cuối còn rất to (chưa tắt dần) so với đỉnh
        if db[last]>peak-22: bad.append((kind,os.path.basename(f),round(float(peak-db[last]),1),round(len(x)/sr,2)))
print(len(bad)); [print(b) for b in bad]
