import sys
sys.stdout.reconfigure(encoding='utf8')
s = open('E:/Your English/index.html', encoding='utf8').read()

def rep(a, b, cnt=1):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b, cnt)

# ---------- 1) speak/tts nhận callback khi đọc xong ----------
rep("function tts(t){", "function tts(t,onEnd){")
rep("  u.onend=()=>setPlayIcon(false);\n  speechSynthesis.speak(u); setPlayIcon(true);", "  u.onend=()=>{ setPlayIcon(false); if(onEnd) onEnd(); };\n  speechSynthesis.speak(u); setPlayIcon(true);")
rep("function speak(t){\n  stopAll();\n  const id=AUDIO[t];\n  if(!id){ tts(t); return; }", "function speak(t,onEnd){\n  stopAll();\n  const id=AUDIO[t];\n  if(!id){ tts(t,onEnd); return; }")
rep("const fallback=()=>{ if(audioEl===a){ audioEl=null; tts(t); } };\n  a.onerror=fallback; a.onended=()=>{ if(audioEl===a){ audioEl=null; setPlayIcon(false); } };",
    "const fallback=()=>{ if(audioEl===a){ audioEl=null; tts(t,onEnd); } };\n  a.onerror=fallback; a.onended=()=>{ if(audioEl===a){ audioEl=null; setPlayIcon(false); } if(onEnd) onEnd(); };")

# ---------- 2) HTML ----------
MIC = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/></svg>'
rep('''      <div class="row">
        <button class="play" aria-label="Play"><span class="playIconWrap"></span></button>
        <span class="divider"></span>
        <div class="lesson-content" id="lessonContent">''', '''      <div class="row">
        <button class="play" aria-label="Play"><span class="playIconWrap"></span></button>
        <button class="mic" id="micBtn" type="button" aria-label="Record your voice">%s</button>
        <div class="lesson-content" id="lessonContent">''' % MIC)
rep('<div id="toast" class="toast" role="status"></div>', '''<div id="toast" class="toast" role="status"></div>
<div id="recSheet" class="recSheet" hidden role="dialog" aria-label="Ghi âm giọng đọc">
  <div class="rtxt"></div>
  <div class="rst rec"><span class="rdot"></span><span class="rtime">0:00</span><span class="wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
    <button class="rb rcancel" type="button">Huỷ</button><button class="rb rstop" type="button">■ Dừng</button></div>
  <div class="rst rev">
    <div class="rrow"><button class="rb rmine" type="button">▶ Giọng bạn</button><button class="rb rmodel" type="button">🔊 Giọng mẫu</button><button class="rb rcmp" type="button">⇄ So sánh</button></div>
    <div class="rrow"><button class="rb rredo" type="button">↻ Ghi lại</button><button class="rb rdone" type="button">Xong</button></div>
  </div>
  <div class="rst err"><span class="rerr"></span><button class="rb rdone" type="button">Đóng</button></div>
</div>''')

# ---------- 3) CSS ----------
rep(".hero p{", '''.player .mic{width:34px;height:34px;flex:0 0 34px;margin-left:6px;border:0;border-radius:50%;background:#2c2c2f;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;
  transition:background .2s ease,transform .15s ease}
.player .mic:active{transform:scale(.9)}
.player .mic.has::after{content:"";position:absolute;margin:-22px -22px 0 0;width:7px;height:7px;border-radius:50%;background:#d9ff73;box-shadow:0 0 0 2px #090909}
.player .mic.rec{background:#e5483b;animation:micPulse 1.2s ease-in-out infinite}
@keyframes micPulse{0%,100%{box-shadow:0 0 0 0 rgba(229,72,59,.55)}50%{box-shadow:0 0 0 8px rgba(229,72,59,0)}}
.recSheet{position:fixed;z-index:70;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 100px);width:min(460px,calc(100vw - 24px));transform:translate(-50%,12px);
  background:#0b0b0b;color:#fff;border-radius:20px;padding:14px 16px;box-shadow:0 16px 40px rgba(0,0,0,.35);opacity:0;transition:opacity .25s ease,transform .25s ease}
.recSheet.on{opacity:1;transform:translate(-50%,0)}
.recSheet[hidden]{display:none}
.recSheet .rtxt{font-size:13px;color:rgba(255,255,255,.62);line-height:1.45;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.recSheet .rst{display:none;align-items:center;gap:10px;flex-wrap:wrap}
.recSheet.s-rec .rst.rec,.recSheet.s-rev .rst.rev,.recSheet.s-err .rst.err{display:flex}
.recSheet.s-rev .rst.rev{flex-direction:column;align-items:stretch}
.recSheet .rrow{display:flex;gap:8px;flex-wrap:wrap}
.recSheet .rb{font:inherit;font-size:13.5px;font-weight:700;border:0;border-radius:999px;padding:9px 14px;cursor:pointer;background:#2c2c2f;color:#fff;transition:background .2s ease,transform .12s ease}
.recSheet .rb:active{transform:scale(.95)}
.recSheet .rb.on{background:var(--leaf);color:#0b0b0b}
.recSheet .rstop{background:#e5483b;margin-left:auto}
.recSheet .rdone{background:var(--leaf);color:#0b0b0b;margin-left:auto}
.recSheet .rrow:last-child{justify-content:space-between}
.recSheet .rdot{width:10px;height:10px;border-radius:50%;background:#e5483b;animation:micPulse 1.2s ease-in-out infinite}
.recSheet .rtime{font-variant-numeric:tabular-nums;font-weight:700;font-size:15px;min-width:2.6em}
.recSheet .wave{display:inline-flex;align-items:center;gap:3px;height:26px;flex:1;min-width:60px}
.recSheet .wave i{display:block;width:4px;height:4px;border-radius:2px;background:var(--leaf);transition:height .08s linear}
.recSheet .rerr{flex:1;font-size:13.5px;line-height:1.45}
@media (prefers-reduced-motion:reduce){.player .mic.rec,.recSheet .rdot{animation:none}}
.hero p{''')
rep("@media (max-width:480px){\n  .player{", "@media (max-width:480px){\n  .player .mic{width:30px;height:30px;flex-basis:30px;margin-left:4px}\n  .recSheet{bottom:calc(env(safe-area-inset-bottom,0px) + 86px)}\n  .player{")

# ---------- 4) JS ----------
rec_js = r'''/* ---------- Ghi âm giọng đọc: ghi → nghe lại → so với giọng mẫu. Bản ghi chỉ lưu trong máy (IndexedDB). ---------- */
const Rec=(function(){
  const sheet=$("#recSheet"), txt=sheet.querySelector(".rtxt"), micB=$("#micBtn");
  const timeEl=sheet.querySelector(".rtime"), bars=[...sheet.querySelectorAll(".wave i")], errEl=sheet.querySelector(".rerr");
  const bMine=sheet.querySelector(".rmine"), bModel=sheet.querySelector(".rmodel"), bCmp=sheet.querySelector(".rcmp");
  const api={state:"idle", open:false};
  let stream=null, mr=null, chunks=[], t0=0, tmr=0, ac=null, an=null, raf=0, curText="", curKey="", curBlob=null, mine=null, seq=0;
  const MAX=60;
  /* ---- IndexedDB: giữ tối đa 20 bản ghi gần nhất ---- */
  function db(){ return new Promise((res,rej)=>{ const r=indexedDB.open("reed_rec",1); r.onupgradeneeded=()=>r.result.createObjectStore("rec"); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }
  async function dbGet(k){ try{ const d=await db(); return await new Promise(r=>{ const q=d.transaction("rec").objectStore("rec").get(k); q.onsuccess=()=>r(q.result||null); q.onerror=()=>r(null); }); }catch(e){ return null; } }
  async function dbPut(k,v){ try{ const d=await db(); await new Promise(r=>{ const tx=d.transaction("rec","readwrite"), st=tx.objectStore("rec"); st.put(v,k);
      const all=st.getAll(), keys=st.getAllKeys(); tx.oncomplete=r; all.onsuccess=()=>{ keys.onsuccess=()=>{ const rows=all.result.map((x,i)=>({k:keys.result[i],at:x.at})).sort((a,b)=>b.at-a.at);
        rows.slice(20).forEach(x=>st.delete(x.k)); }; }; }); }catch(e){} }
  const keyOf=t=>(passages[active.pi]?passages[active.pi].topic:"")+"|"+t;
  const fmt=s=>Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0");
  const setState=s=>{ api.state=s; sheet.classList.remove("s-rec","s-rev","s-err"); sheet.classList.add("s-"+s.slice(0,3)); };
  function showSheet(){ api.open=true; sheet.hidden=false; requestAnimationFrame(()=>sheet.classList.add("on")); }
  function hideSheet(){ api.open=false; sheet.classList.remove("on"); setTimeout(()=>{ if(!api.open) sheet.hidden=true; },260); }
  function stopPlay(){ if(mine){ mine.pause(); mine=null; } stopAll(); [bMine,bModel,bCmp].forEach(b=>b.classList.remove("on")); seq++; }
  function stopMeter(){ cancelAnimationFrame(raf); clearInterval(tmr); try{ ac&&ac.close(); }catch(e){} ac=null; an=null; bars.forEach(b=>b.style.height="4px"); }
  function release(){ stopMeter(); if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; } micB.classList.remove("rec"); }
  function fail(msg){ release(); mr=null; errEl.textContent=msg; setState("err"); showSheet(); }
  async function refreshDot(){ const r=await dbGet(keyOf(currentText())); micB.classList.toggle("has",!!r); }

  async function start(){
    stopAll(); stopPlay();
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||typeof MediaRecorder==="undefined"){ txt.textContent=curText; return fail("Trình duyệt này chưa hỗ trợ ghi âm. Hãy thử Chrome hoặc Safari bản mới."); }
    curText=currentText(); curKey=keyOf(curText); txt.textContent=curText;
    try{ stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}}); }
    catch(e){ return fail(e&&e.name==="NotAllowedError"?"Bạn chưa cho phép dùng micro. Bấm biểu tượng ổ khoá trên thanh địa chỉ, cho phép Micro rồi thử lại.":"Không mở được micro. Kiểm tra micro rồi thử lại."); }
    const mime=["audio/webm;codecs=opus","audio/mp4","audio/webm","audio/ogg"].find(m=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(m))||"";
    chunks=[]; try{ mr=new MediaRecorder(stream,mime?{mimeType:mime}:undefined); }catch(e){ return fail("Không khởi động được bộ ghi âm trên thiết bị này."); }
    mr.ondataavailable=e=>{ if(e.data&&e.data.size) chunks.push(e.data); };
    mr.onstop=()=>{ const type=mr.mimeType||mime||"audio/webm"; const blob=new Blob(chunks,{type}); release(); if(api.state!=="rec"&&api.state!=="recording") return;
      if(blob.size<800){ return fail("Chưa nghe thấy tiếng. Hãy đọc to hơn và thử lại."); }
      curBlob=blob; dbPut(curKey,{blob,type,at:Date.now(),text:curText}); micB.classList.add("has"); review(); };
    mr.start(250); t0=performance.now(); timeEl.textContent="0:00";
    setState("recording"); sheet.classList.add("s-rec"); showSheet(); micB.classList.add("rec");
    tmr=setInterval(()=>{ const s=(performance.now()-t0)/1000; timeEl.textContent=fmt(s); if(s>=MAX) stop(); },200);
    try{ ac=new (window.AudioContext||window.webkitAudioContext)(); const src=ac.createMediaStreamSource(stream); an=ac.createAnalyser(); an.fftSize=64; src.connect(an); const d=new Uint8Array(an.frequencyBinCount);
      const draw=()=>{ if(!an) return; an.getByteFrequencyData(d); bars.forEach((b,i)=>{ const v=d[2+i*2]/255; b.style.height=(4+v*22)+"px"; }); raf=requestAnimationFrame(draw); }; draw(); }catch(e){}
  }
  function stop(){ if(mr&&mr.state!=="inactive") mr.stop(); }
  function review(){ setState("review"); sheet.classList.remove("s-rec"); showSheet(); }
  function playMine(cb){ if(!curBlob) return; stopPlay(); const my=++seq; const a=new Audio(URL.createObjectURL(curBlob)); mine=a; bMine.classList.add("on");
    a.onended=()=>{ if(my!==seq) return; mine=null; bMine.classList.remove("on"); if(cb) cb(); }; a.play().catch(()=>{ bMine.classList.remove("on"); }); }
  function playModel(cb){ stopPlay(); const my=++seq; bModel.classList.add("on"); speak(curText,()=>{ if(my!==seq) return; bModel.classList.remove("on"); if(cb) cb(); }); }
  function compare(){ stopPlay(); bCmp.classList.add("on"); const my=seq+1; playMine(()=>{ if(seq!==my) return; setTimeout(()=>{ playModel(()=>bCmp.classList.remove("on")); },350); }); }
  function close(){ if(api.state==="recording"){ cancelRec(); } stopPlay(); hideSheet(); api.state="idle"; }
  function cancelRec(){ api.state="idle"; try{ if(mr&&mr.state!=="inactive") mr.stop(); }catch(e){} release(); }
  async function onMic(){
    if(api.open&&api.state==="recording"){ stop(); return; }
    if(api.open){ close(); return; }
    const t=currentText(); curText=t; curKey=keyOf(t); txt.textContent=t;
    const old=await dbGet(curKey);
    if(old&&old.blob){ curBlob=old.blob; review(); } else start();
  }
  micB.addEventListener("click",onMic);
  sheet.querySelector(".rstop").addEventListener("click",stop);
  sheet.querySelector(".rcancel").addEventListener("click",()=>{ cancelRec(); hideSheet(); });
  sheet.querySelectorAll(".rdone").forEach(b=>b.addEventListener("click",close));
  sheet.querySelector(".rredo").addEventListener("click",()=>{ stopPlay(); start(); });
  bMine.addEventListener("click",()=>{ if(mine){ stopPlay(); } else playMine(); });
  bModel.addEventListener("click",()=>{ if(bModel.classList.contains("on")){ stopPlay(); } else playModel(); });
  bCmp.addEventListener("click",()=>{ if(bCmp.classList.contains("on")){ stopPlay(); } else compare(); });
  addEventListener("keydown",e=>{ if(api.open&&e.key==="Escape") close(); });
  api.close=close; api.refreshDot=refreshDot;
  let lastSig=""; setInterval(()=>{ const sg=active.pi+":"+active.si+":"+(F[active.pi]?JSON.stringify(F[active.pi]):""); if(sg!==lastSig){ lastSig=sg; if(!api.open) refreshDot(); } },600);
  return api;
})();
'''
rep("/* ---------- Khởi động ---------- */", rec_js + "\n/* ---------- Khởi động ---------- */")

# ---------- 5) hooks ----------
rep("function goStep(dir){\n  if(stepping||(typeof Tour!==\"undefined\"&&(Tour.active||Tour.welcomeOpen))) return;",
    "function goStep(dir){\n  if(stepping||(typeof Tour!==\"undefined\"&&(Tour.active||Tour.welcomeOpen))) return;\n  if(typeof Rec!==\"undefined\"&&Rec.open){ if(Rec.state===\"recording\") return; Rec.close(); }   /* đang ghi: dừng rồi mới sang bước khác */")
rep("function blocked(){\n    return paused||", "function blocked(){\n    return paused||(typeof Rec!==\"undefined\"&&Rec.open)||")
# tour: thêm bước mic sau bước nghe
rep('''      {t:"Bấm ▶ để nghe câu đang đọc.", el:()=>$("#player .play"), r:999},''', '''      {t:"Bấm ▶ để nghe câu đang đọc.", el:()=>$("#player .play"), r:999},
      {t:"Bấm micro để đọc to câu này và nghe lại giọng của bạn, rồi so với giọng mẫu.", el:()=>$("#micBtn"), r:999},''')
open('E:/Your English/index.html', 'w', encoding='utf8').write(s)
print('patched')
