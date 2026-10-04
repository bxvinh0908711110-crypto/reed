/* ---------- Ghi âm giọng đọc: thanh player biến thành thanh ghi âm → dừng → thẻ nghe lại / so với giọng mẫu.
   Bản ghi chỉ lưu trong máy (IndexedDB). ---------- */
const Rec=(function(){
  const sheet=$("#recSheet"), txt=sheet.querySelector(".rtxt"), micB=$("#micBtn");
  const live=$("#recLive"), liveTxt=live.querySelector(".rl-text"), timeEl=live.querySelector(".rtime"), bars=[...live.querySelectorAll(".wave i")], errEl=sheet.querySelector(".rerr");
  const bMine=sheet.querySelector(".rmine"), bModel=sheet.querySelector(".rmodel"), bCmp=sheet.querySelector(".rcmp");
  const api={state:"idle", open:false};
  let stream=null, mr=null, chunks=[], t0=0, tmr=0, ac=null, an=null, raf=0, curText="", curKey="", curBlob=null, mine=null, seq=0, cmpTok=0, hist=[], lastPush=0;
  const MAX=60, NB=bars.length;
  /* ---- IndexedDB: giữ tối đa 20 bản ghi gần nhất ---- */
  function db(){ return new Promise((res,rej)=>{ const r=indexedDB.open("reed_rec",1); r.onupgradeneeded=()=>r.result.createObjectStore("rec"); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }
  async function dbGet(k){ try{ const d=await db(); return await new Promise(r=>{ const q=d.transaction("rec").objectStore("rec").get(k); q.onsuccess=()=>r(q.result||null); q.onerror=()=>r(null); }); }catch(e){ return null; } }
  async function dbPut(k,v){ try{ const d=await db(); await new Promise(res=>{ const tx=d.transaction("rec","readwrite"), st=tx.objectStore("rec"); st.put(v,k); const rows=[]; const cur=st.openCursor();
      cur.onsuccess=()=>{ const c=cur.result; if(c){ rows.push({k:c.key,at:c.value.at}); c.continue(); } else rows.sort((a,b)=>b.at-a.at).slice(20).forEach(x=>st.delete(x.k)); };
      tx.oncomplete=res; tx.onerror=res; }); }catch(e){} }
  const keyOf=t=>(passages[active.pi]?passages[active.pi].topic:"")+"|"+t;
  const fmt=s=>Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0");
  const setState=s=>{ api.state=s; sheet.classList.remove("s-rev","s-err"); if(s==="review") sheet.classList.add("s-rev"); if(s==="err") sheet.classList.add("s-err"); };
  function showSheet(){ api.open=true; sheet.hidden=false; requestAnimationFrame(()=>sheet.classList.add("on")); }
  function hideSheet(){ sheet.classList.remove("on"); setTimeout(()=>{ if(!api.open||api.state==="idle") sheet.hidden=true; },260); }
  function stopPlay(){ if(mine){ mine.pause(); mine=null; } stopAll(); [bMine,bModel,bCmp].forEach(b=>b.classList.remove("on")); seq++; cmpTok++; }
  function drawBars(){ bars.forEach((b,k)=>{ if(k<hist.length){ b.className=""; b.style.height=(4+hist[k]*24)+"px"; } else { b.className="off"; b.style.height="6px"; } }); }
  function stopMeter(){ cancelAnimationFrame(raf); clearInterval(tmr); try{ ac&&ac.close(); }catch(e){} ac=null; an=null; }
  function release(){ stopMeter(); if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; } player.classList.remove("recording"); micB.classList.remove("rec"); }
  function fail(msg){ release(); mr=null; errEl.textContent=msg; txt.textContent=""; setState("err"); showSheet(); }
  async function refreshDot(){ const r=await dbGet(keyOf(currentText())); micB.classList.toggle("has",!!r); }

  async function start(){
    stopAll(); stopPlay();
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||typeof MediaRecorder==="undefined"){ return fail("Trình duyệt này chưa hỗ trợ ghi âm. Hãy thử Chrome hoặc Safari bản mới."); }
    curText=currentText(); curKey=keyOf(curText);
    try{ stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}}); }
    catch(e){ return fail(e&&e.name==="NotAllowedError"?"Bạn chưa cho phép dùng micro. Bấm biểu tượng ổ khoá trên thanh địa chỉ, cho phép Micro rồi thử lại.":"Không mở được micro. Kiểm tra micro rồi thử lại."); }
    const mime=["audio/webm;codecs=opus","audio/mp4","audio/webm","audio/ogg"].find(m=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(m))||"";
    chunks=[]; try{ mr=new MediaRecorder(stream,mime?{mimeType:mime}:undefined); }catch(e){ return fail("Không khởi động được bộ ghi âm trên thiết bị này."); }
    mr.ondataavailable=e=>{ if(e.data&&e.data.size) chunks.push(e.data); };
    mr.onstop=()=>{ const type=(mr&&mr.mimeType)||mime||"audio/webm"; const blob=new Blob(chunks,{type}); const wasRec=api.state==="recording"; release(); if(!wasRec) return;
      if(blob.size<800){ return fail("Chưa nghe thấy tiếng. Hãy đọc to hơn và thử lại."); }
      curBlob=blob; dbPut(curKey,{blob,type,at:Date.now(),text:curText}); micB.classList.add("has"); review(); };
    mr.start(250); t0=performance.now(); timeEl.textContent="0:00"; hist=[]; lastPush=0; drawBars(); liveTxt.textContent=curText;
    player.classList.remove("settings"); player.classList.add("recording"); micB.classList.add("rec"); api.state="recording"; api.open=true; hideSheet();
    tmr=setInterval(()=>{ const s=(performance.now()-t0)/1000; timeEl.textContent=fmt(s); if(s>=MAX) stop(); },200);
    let lvl=0;
    try{ ac=new (window.AudioContext||window.webkitAudioContext)(); const src=ac.createMediaStreamSource(stream); an=ac.createAnalyser(); an.fftSize=512; src.connect(an); const d=new Uint8Array(an.fftSize);
      const draw=now=>{ if(!an) return; an.getByteTimeDomainData(d); let sum=0; for(let i=0;i<d.length;i++){ const v=(d[i]-128)/128; sum+=v*v; } lvl=Math.min(1,Math.sqrt(sum/d.length)*5);
        if(now-lastPush>140){ lastPush=now; hist.push(lvl); if(hist.length>NB) hist.shift(); drawBars(); } raf=requestAnimationFrame(draw); }; raf=requestAnimationFrame(draw); }
    catch(e){ tmr2=setInterval(()=>{ hist.push(.2+Math.random()*.5); if(hist.length>NB) hist.shift(); drawBars(); },140); }
  }
  let tmr2=0;
  function stop(){ clearInterval(tmr2); if(mr&&mr.state!=="inactive") mr.stop(); }
  function review(){ txt.textContent=curText; setState("review"); showSheet(); }
  function playMine(cb,keep){ if(!curBlob) return; if(!keep) stopPlay(); const my=++seq; const a=new Audio(URL.createObjectURL(curBlob)); mine=a; bMine.classList.add("on");
    a.onended=()=>{ if(my!==seq) return; mine=null; bMine.classList.remove("on"); if(cb) cb(); }; a.play().catch(()=>{ bMine.classList.remove("on"); }); }
  function playModel(cb,keep){ if(!keep) stopPlay(); const my=++seq; bModel.classList.add("on"); speak(curText,()=>{ if(my!==seq) return; bModel.classList.remove("on"); if(cb) cb(); }); }
  function compare(){ stopPlay(); const tok=++cmpTok; bCmp.classList.add("on");
    playMine(()=>{ if(tok!==cmpTok) return; setTimeout(()=>{ if(tok!==cmpTok) return; playModel(()=>{ if(tok===cmpTok) bCmp.classList.remove("on"); },true); },350); },true); }
  function close(){ if(api.state==="recording") cancelRec(); stopPlay(); api.open=false; api.state="idle"; hideSheet(); }
  function cancelRec(){ api.state="idle"; api.open=false; clearInterval(tmr2); try{ if(mr&&mr.state!=="inactive") mr.stop(); }catch(e){} release(); }
  async function onMic(){
    if(api.state==="recording") return;
    if(api.open){ close(); return; }
    const t=currentText(); curText=t; curKey=keyOf(t);
    const old=await dbGet(curKey);
    if(old&&old.blob){ curBlob=old.blob; review(); } else start();
  }
  micB.addEventListener("click",onMic);
  $("#recCancel").addEventListener("click",()=>{ cancelRec(); });
  sheet.querySelectorAll(".rdone").forEach(b=>b.addEventListener("click",close));
  sheet.querySelector(".rredo").addEventListener("click",()=>{ stopPlay(); start(); });
  bMine.addEventListener("click",()=>{ if(mine){ stopPlay(); } else playMine(); });
  bModel.addEventListener("click",()=>{ if(bModel.classList.contains("on")){ stopPlay(); } else playModel(); });
  bCmp.addEventListener("click",()=>{ if(bCmp.classList.contains("on")){ stopPlay(); } else compare(); });
  addEventListener("keydown",e=>{ if(api.open&&e.key==="Escape"){ if(api.state==="recording") cancelRec(); else close(); } });
  api.close=close; api.stop=stop; api.refreshDot=refreshDot;
  let lastSig=""; setInterval(()=>{ const sg=active.pi+":"+active.si+":"+(F[active.pi]?JSON.stringify(F[active.pi]):""); if(sg!==lastSig){ lastSig=sg; if(!api.open) refreshDot(); } },600);
  return api;
})();
