import sys
sys.stdout.reconfigure(encoding='utf8')
s = open('E:/Your English/index.html', encoding='utf8').read()

def rep(a, b, cnt=1):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b, cnt)

# ---------- HTML: nút "?" cạnh sổ tay ----------
rep('<span class="right"><button id="nbBtn"',
    '<span class="right"><button id="tipBtn" class="nbBtn tipBtn" aria-label="Xem lại hướng dẫn" title="Hướng dẫn">?</button><button id="nbBtn"')

# ---------- CSS ----------
rep(".hero p{", '''.tipBtn{width:34px;height:34px;padding:0;justify-content:center;font-weight:800;font-size:15px;margin-right:2px}
.tip{position:fixed;z-index:65;left:0;top:0;max-width:min(280px,calc(100vw - 24px));padding:11px 14px;border-radius:14px;background:#0b0b0b;color:#fff;
  font-size:13.5px;font-weight:600;line-height:1.4;letter-spacing:0;box-shadow:0 10px 28px rgba(0,0,0,.28);cursor:pointer;
  opacity:0;transform:translateY(6px);pointer-events:none;transition:opacity .25s ease,transform .25s ease;display:flex;gap:10px;align-items:center}
.tip.on{opacity:1;transform:none;pointer-events:auto}
.tip::after{content:"";position:absolute;left:var(--ax,50%);width:12px;height:12px;background:#0b0b0b;transform:translateX(-50%) rotate(45deg);border-radius:2px}
.tip.up::after{bottom:-5px}
.tip.down::after{top:-5px}
.tip .ti{flex:0 0 auto;font-size:18px;line-height:1;animation:tipNudge 1.3s ease-in-out infinite}
@keyframes tipNudge{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.tip.fine .ti{animation-name:tipNudgeDown}
@keyframes tipNudgeDown{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}
.tip-ring{outline:3px solid rgba(27,59,255,.35);outline-offset:4px;border-radius:.3em;animation:tipRing 1.4s ease-in-out infinite}
@keyframes tipRing{0%,100%{outline-color:rgba(27,59,255,.15)}50%{outline-color:rgba(27,59,255,.6)}}
@media (prefers-reduced-motion:reduce){.tip .ti,.tip-ring{animation:none}}
.hero p{''')

# ---------- JS: module Tips (đặt trước phần khởi động) ----------
tips_js = r'''/* ---------- Hướng dẫn đúng lúc (contextual tips): hiện bong bóng nhỏ đúng chỗ, đúng thời điểm, mỗi gợi ý tối đa vài lần,
   biến mất ngay khi người dùng làm đúng việc đó. Nút "?" trên header để xem lại. ---------- */
const Tips=(function(){
  const KEY="reed_tips", VKEY="reed_visits";
  const coarse=matchMedia("(pointer: coarse)").matches;
  const el=document.createElement("div"); el.className="tip"+(coarse?"":" fine"); el.setAttribute("role","status");
  el.innerHTML='<span class="ti"></span><span class="tt"></span>'; document.body.appendChild(el);
  let st={}; try{ st=JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){}
  const save=()=>{ try{ localStorage.setItem(KEY,JSON.stringify(st)); }catch(e){} };
  let visits=1;
  try{ if(!sessionStorage.getItem("reed_sess")){ sessionStorage.setItem("reed_sess","1"); visits=(+localStorage.getItem(VKEY)||0)+1; localStorage.setItem(VKEY,String(visits)); } else visits=+localStorage.getItem(VKEY)||1; }catch(e){}

  const cur=()=>{ const pp=P[active.pi]; return {pp, s:pp&&pp.sents[active.si]}; };
  const phiOn=(s)=>s&&s.idx&&s.idx.length;
  const TIPS={
    swipe:{ icon:coarse?"👆":"🖱️", text:coarse?"Vuốt lên để sang bước tiếp":"Cuộn chuột xuống để sang bước tiếp", dwell:2000, max:3,
      ok:()=>{ const y=firstLessonY(); return scrollY<=y+4; }, anchor:()=>$("#player") },
    tap:{ icon:"✨", text:coarse?"Chạm vào cụm được tô sáng để xem cách nói tự nhiên hơn":"Bấm vào cụm được tô sáng để xem cách nói tự nhiên hơn", dwell:2200, max:2,
      need:["swipe"], ok:()=>{ const {s}=cur(); return phiOn(s)&&!s.recap&&(F[active.pi][s.idx[0]]||0)<.5; }, anchor:()=>{ const {s}=cur(); return s&&s.ph&&s.ph[0]; }, ring:true },
    listen:{ icon:"🔊", text:"Bấm ▶ để nghe. Bấm ⌄ để đổi giọng và tốc độ", dwell:900, max:2,
      need:["tap"], ok:()=>true, anchor:()=>$("#player") },
    save:{ icon:"🔖", text:"Chạm dấu trang để lưu cụm này vào sổ tay", dwell:5500, max:2,
      need:["tap","listen"], ok:()=>{ const {pp,s}=cur(); return pp&&s&&phiOn(s)&&(F[active.pi][s.idx[0]]||0)>=.5&&pp.sv&&!pp.sv.hidden&&pp.sv.getAttribute("aria-pressed")!=="true"; },
      anchor:()=>{ const {pp}=cur(); return pp&&pp.sv; } },
    recap:{ icon:"🔤", text:"Bấm A1 / A2 để đọc cả đoạn theo từng mức", dwell:1100, max:2,
      need:["tap"], ok:()=>{ const {s}=cur(); return s&&s.recap; }, anchor:()=>{ const {pp}=cur(); return pp&&pp.tg&&!pp.tg.hidden?pp.tg:null; } },
    hold:{ icon:"☝️", text:coarse?"Giữ ngón tay vào tên bài để chuyển sang bài khác":"Nhấn giữ tên bài để chuyển sang bài khác", dwell:3500, max:2,
      need:["tap"], ok:()=>visits>=2, anchor:()=>$("#lessonContent") }
  };
  const ORDER=["swipe","tap","listen","recap","save","hold"];
  let shown=null, shownAt=0, sig="", sigAt=performance.now(), lastHide=0, paused=false;

  function seen(id){ return !!st[id+"_done"]; }
  function done(id){ st[id+"_done"]=1; save(); if(shown===id) hide(); }
  function hide(){
    el.classList.remove("on");
    document.querySelectorAll(".tip-ring").forEach(n=>n.classList.remove("tip-ring"));
    shown=null; lastHide=performance.now();
  }
  function place(a){
    const r=a.getBoundingClientRect(), bw=el.offsetWidth, bh=el.offsetHeight, W=innerWidth;
    let top=r.top-bh-14, up=true;
    if(top<72){ top=r.bottom+14; up=false; }
    let left=r.left+r.width/2-bw/2; left=Math.max(12,Math.min(W-bw-12,left));
    el.style.left=left+"px"; el.style.top=top+"px";
    el.style.setProperty("--ax",Math.max(16,Math.min(bw-16,r.left+r.width/2-left))+"px");
    el.classList.toggle("up",up); el.classList.toggle("down",!up);
  }
  function show(id,a){
    const t=TIPS[id]; shown=id; shownAt=performance.now();
    st[id+"_n"]=(st[id+"_n"]||0)+1; save();
    el.querySelector(".ti").textContent=t.icon; el.querySelector(".tt").textContent=t.text;
    el.classList.add("on"); place(a);
    if(t.ring) a.classList.add("tip-ring");
  }
  function blocked(){
    return paused||document.hidden||stepping||switching||!P.length||
      $("#reed-splash")&&getComputedStyle($("#reed-splash")).display!=="none"||
      player.classList.contains("picker-open")||player.classList.contains("settings")||
      !$("#notebook").hidden;
  }
  function tick(){
    const now=performance.now(), s0=active.pi+":"+active.si+":"+Math.round(scrollY/6);
    if(s0!==sig){ sig=s0; sigAt=now; }
    if(blocked()){ if(shown) hide(); return; }
    if(shown){
      const t=TIPS[shown], a=t.anchor();
      if(!a||!t.ok()){ hide(); return; }      /* người dùng đã rời khỏi ngữ cảnh */
      if(now-shownAt>9000){ if((st[shown+"_n"]||0)>=t.max) done(shown); else hide(); return; }
      place(a); return;
    }
    if(now-lastHide<1800) return;
    const dwell=now-sigAt;
    for(const id of ORDER){
      const t=TIPS[id];
      if(seen(id)||(t.need&&!t.need.every(seen))) continue;
      if(!t.ok()||dwell<t.dwell) continue;
      const a=t.anchor(); if(!a) continue;
      show(id,a); break;
    }
  }
  setInterval(tick,400);
  addEventListener("resize",()=>{ if(shown){ const a=TIPS[shown].anchor(); a&&place(a); } });
  el.addEventListener("click",()=>{ if(shown) done(shown); });

  const EVT={ step:["swipe"], tap:["tap"], play:["listen"], save:["save"], recap:["recap"], hold:["hold"] };
  function event(n){ (EVT[n]||[]).forEach(done); }
  function replay(){
    st={}; save(); hide();
    const toast=$("#toast"); toast.textContent="Hướng dẫn sẽ hiện lại từng bước khi bạn dùng"; toast.classList.add("on"); setTimeout(()=>toast.classList.remove("on"),2200);
    scrollTo(0,0);
  }
  $("#tipBtn").addEventListener("click",replay);
  return {event,replay};
})();
function tipEvt(n){ try{ Tips.event(n); }catch(e){} }
'''
rep("/* ---------- Khởi động ---------- */", tips_js + "\n/* ---------- Khởi động ---------- */")

# ---------- hooks ----------
rep("else { scrollTo(0,t); stepping=false; }", "else { scrollTo(0,t); stepping=false; tipEvt(\"step\"); }")
rep('else if(ph.classList.contains("ph")){', 'else if(ph.classList.contains("ph")){\n      tipEvt("tap");')
rep('speak(currentText());\n}));', 'speak(currentText()); tipEvt("play");\n}));')
rep('sv.innerHTML=BOOKMARK(nowSaved);\n    return;', 'sv.innerHTML=BOOKMARK(nowSaved); tipEvt("save");\n    return;')
rep("    movePill(tg);\n    const w=$(\"#rc\"+pi);", "    movePill(tg); tipEvt(\"recap\");\n    const w=$(\"#rc\"+pi);")
rep('  $("#pickBubble").classList.add("on");\n  if(window.getSelection)', '  $("#pickBubble").classList.add("on"); tipEvt("hold");\n  if(window.getSelection)')
open('E:/Your English/index.html', 'w', encoding='utf8').write(s)
print('patched')
