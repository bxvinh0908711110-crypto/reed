import re
s = open('E:/Your English/index.html', encoding='utf8').read()

def rep(a, b, cnt=1):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b, cnt)

# ---- 1) data: ALL + categories
rep("const passages = (window.__PASSAGES&&window.__PASSAGES.length) ? window.__PASSAGES : [",
    "const ALL = (window.__PASSAGES&&window.__PASSAGES.length) ? window.__PASSAGES : [")
rep('scene:"hobbies",', 'scene:"hobbies", cat:"lifestyle",')
rep('scene:"school",', 'scene:"school", cat:"school",')
rep('scene:"family",', 'scene:"family", cat:"family",')
i = s.index("];\n\n/* Chưa có phương án nâng cấp phụ")
topics_js = '''];
/* ---------- Chủ đề (topic): thanh chọn ở trang đầu; mỗi chủ đề có tiến trình mở khoá riêng ---------- */
const TOPICS=[
  {k:"family",label:"Family",icon:'<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'},
  {k:"friends",label:"Friends",icon:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'},
  {k:"school",label:"School",icon:'<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>'},
  {k:"work",label:"Work",icon:'<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>'},
  {k:"lifestyle",label:"Lifestyle",icon:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>'},
  {k:"health",label:"Health",icon:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>'},
  {k:"tech",label:"Tech",icon:'<path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z"/><path d="M20.054 15.987H3.946"/>'}
];
let passages=[], curTopic="family";
'''
s = s[:i] + topics_js + s[i + 3:]

# ---- 2) P / F / recapMode rebuildable
rep("const P = passages.map((p,pi)=>{", "function makeP(){ return passages.map((p,pi)=>{")
rep("  return {sents};\n});\nconst F = passages.map(()=>({}));       /* vị trí (số lẻ) hiện tại của từng cụm */\nconst recapMode = passages.map(()=> \"up\");",
    "  return {sents};\n}); }\nlet P=[], F=[], recapMode=[];   /* F: vị trí (số lẻ) hiện tại của từng cụm */")

# ---- 3) unlock per topic
rep('const UNLOCK_KEY="reed_unlocked";\nfunction loadUnlocked(){\n  try{ const n=+localStorage.getItem(UNLOCK_KEY);',
    'const UNLOCK_KEY=()=>"reed_unlocked_"+curTopic;\nfunction loadUnlocked(){\n  try{ const n=+localStorage.getItem(UNLOCK_KEY());')
rep("let unlockedCount=loadUnlocked(), lockBoundY=Infinity;", "let unlockedCount=1, lockBoundY=Infinity;")
rep("localStorage.setItem(UNLOCK_KEY,String(unlockedCount))", "localStorage.setItem(UNLOCK_KEY(),String(unlockedCount))")

# ---- 4) startup + setTopic + rotating slogan
rep("build(); buildPlayer(); layout(); measure(); movePills(); update();\nif(document.fonts", '''(function(){
  const w=$("#rotWord"), words=["speak","write","listen","learn"]; let i=0;
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  setInterval(()=>{ w.classList.add("out"); setTimeout(()=>{ i=(i+1)%words.length; w.textContent=words[i]; w.classList.remove("out"); },280); },2400);
})();
const hasLessons=k=>ALL.some(p=>p.cat===k);
function setTopic(k,jump){
  curTopic=k; try{localStorage.setItem("reed_topic",k)}catch(e){}
  passages=ALL.filter(p=>p.cat===k);
  P=makeP(); F=passages.map(()=>({})); recapMode=passages.map(()=>"up");
  unlockedCount=loadUnlocked(); active={pi:0,si:0}; live=[];
  build(); buildPlayer(); layout(); measure(); movePills(); update();
  document.querySelectorAll("#topics button").forEach(b=>{ b.setAttribute("aria-pressed",b.dataset.k===k); });
  if(jump) fadeJump(()=>{ const pp=P[0]; return pp.el.getBoundingClientRect().top+scrollY+pp.sents[0].lo; });
}
(function initTopics(){
  const bar=$("#topics"), toast=$("#toast"); let tt=0;
  bar.innerHTML=TOPICS.map(t=>`<button type="button" data-k="${t.k}" aria-pressed="false"${hasLessons(t.k)?"":' data-soon="1"'}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${t.icon}</svg><span>${t.label}</span></button>`).join("");
  bar.addEventListener("click",e=>{
    const b=e.target.closest("button"); if(!b) return;
    if(b.dataset.soon){ toast.textContent=b.textContent+" lessons are coming soon"; toast.classList.add("on"); clearTimeout(tt); tt=setTimeout(()=>toast.classList.remove("on"),1800); return; }
    setTopic(b.dataset.k,true);
  });
  let saved=null; try{saved=localStorage.getItem("reed_topic")}catch(e){}
  const first=TOPICS.find(t=>hasLessons(t.k));
  setTopic(saved&&hasLessons(saved)?saved:(first?first.k:"family"),false);
})();
if(document.fonts''')

# ---- 5) fade jump helper
rep("function jumpToLesson(pi){", '''function fadeJump(getY){
  let ov=$("#fadeOv");
  if(!ov){ ov=document.createElement("div"); ov.id="fadeOv";
    ov.style.cssText="position:fixed;inset:0;z-index:30;pointer-events:none;opacity:0;transition:opacity .14s ease;background:var(--bg)";
    document.body.appendChild(ov); }
  ov.style.opacity=1;
  setTimeout(()=>{ scrollTo(0,getY()); requestAnimationFrame(()=>requestAnimationFrame(()=>{ ov.style.opacity=0; })); },150);
}
function jumpToLesson(pi){''')

# ---- 6) hero + topics + toast html
i = s.index('<section class="hero">'); j = s.index('</section>', i) + len('</section>')
s = s[:i] + '''<section class="hero">
  <i class="snap" style="top:0"></i>
  <h1>You read to<br><span class="ph2 rot" style="color:var(--accent);background:var(--leaf)"><span id="rotWord">speak</span> better.</span></h1>
  <p>Each lesson is an everyday situation, split into short sentences. As you read, simple words slowly turn into more natural ones.</p>
  <nav class="topics" id="topics" aria-label="Topics"></nav>
  <div class="cue">PICK A TOPIC, THEN SCROLL ↓</div>
</section>
<div id="toast" class="toast" role="status"></div>''' + s[j:]

# ---- 7) CSS
rep(".hero p{", ''' .hero .rot{display:inline-block;padding:0 .12em;border-radius:.14em;-webkit-box-decoration-break:clone;box-decoration-break:clone}
#rotWord{display:inline-block;transition:opacity .28s ease,transform .28s ease}
#rotWord.out{opacity:0;transform:translateY(.25em)}
.topics{display:flex;gap:8px;margin-top:28px;padding:9px;background:var(--leaf);border-radius:999px;width:max-content;max-width:100%;
  overflow-x:auto;scrollbar-width:none;touch-action:pan-x;-webkit-overflow-scrolling:touch}
.topics::-webkit-scrollbar{display:none}
.topics button{flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border:0;border-radius:999px;background:#fff;color:var(--ink);
  font:inherit;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap;transition:background .2s ease,color .2s ease,transform .15s ease}
.topics button:active{transform:scale(.95)}
.topics button[aria-pressed=true]{background:var(--accent);color:#fff}
.topics button[data-soon]{opacity:.55}
.toast{position:fixed;z-index:70;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 100px);transform:translate(-50%,8px);padding:10px 16px;border-radius:999px;
  background:#0b0b0b;color:#fff;font-size:13px;font-weight:600;opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;white-space:nowrap}
.toast.on{opacity:1;transform:translate(-50%,0)}
.hero p{''')
rep(".hero{min-height:100vh;", ".hero{min-height:100vh;min-height:100dvh;")

# ---- 8) loader: category
rep('const q="/rest/v1/lessons?select=id,position,title,level,scene_key,template,version,phrases(idx,base,upgrade,level,vn,example)&status=eq.published&order=position";',
    'const q=c=>"/rest/v1/lessons?select=id,position,title,level,scene_key,"+(c?"category,":"")+"template,version,phrases(idx,base,upgrade,level,vn,example)&status=eq.published&order=position";\n  const TITLE_CAT={"My Hobbies":"lifestyle","Going to School":"school","My Family":"family"};')
rep('{id:r.position,uid:r.id,version:r.version,topic:r.title,level:r.level||"A1",scene:r.scene_key,tpl:r.template,',
    '{id:r.position,uid:r.id,version:r.version,topic:r.title,level:r.level||"A1",scene:r.scene_key,cat:r.category||TITLE_CAT[r.title]||"lifestyle",tpl:r.template,')
rep('const res=await fetch(SB+q,{headers:{apikey:KEY},signal:ctrl.signal}); clearTimeout(t);',
    'let res=await fetch(SB+q(true),{headers:{apikey:KEY},signal:ctrl.signal});\n    if(res.status===400) res=await fetch(SB+q(false),{headers:{apikey:KEY},signal:ctrl.signal});   /* cột category chưa tạo → vẫn nạp được */\n    clearTimeout(t);')

# ---- 9) touch: thanh chủ đề cuộn ngang
rep('function ownScroller(el){\n  for(;el&&el.nodeType===1&&el!==document.body;el=el.parentElement){\n    if(el.closest&&el.id==="player") return true;\n    const o=getComputedStyle(el).overflowY;\n    if((o==="auto"||o==="scroll")&&el.scrollHeight>el.clientHeight+1) return true;',
    'function ownScroller(el,axis){   /* axis "xy": cảm ứng (cả cuộn ngang); mặc định chỉ cuộn dọc (lăn chuột) */\n  for(;el&&el.nodeType===1&&el!==document.body;el=el.parentElement){\n    if(el.closest&&el.id==="player") return true;\n    const cs=getComputedStyle(el), o=cs.overflowY;\n    if((o==="auto"||o==="scroll")&&el.scrollHeight>el.clientHeight+1) return true;\n    if(axis==="xy"&&(cs.overflowX==="auto"||cs.overflowX==="scroll")&&el.scrollWidth>el.clientWidth+1) return "x";')
rep('let tY=null, tX=0, tOwn=false, swipeAt=0;', 'let tY=null, tX=0, tOwn=false, swipeAt=0, hOwn=false;')
rep('tOwn=ownScroller(e.target); },{passive:true});', 'const o=ownScroller(e.target,"xy"); tOwn=!!o; hOwn=o==="x"; },{passive:true});')
rep('addEventListener("touchmove",e=>{ if(!tOwn && tY!==null && e.cancelable) e.preventDefault(); },{passive:false});',
    'addEventListener("touchmove",e=>{\n  if(tOwn&&hOwn&&tY!==null){ const dy=Math.abs(e.touches[0].clientY-tY), dx=Math.abs(e.touches[0].clientX-tX); if(dy>dx+6){ tOwn=false; hOwn=false; } }   /* bắt đầu trên thanh chủ đề nhưng vuốt dọc → vẫn chuyển bước */\n  if(!tOwn && tY!==null && e.cancelable) e.preventDefault();\n},{passive:false});')

open('E:/Your English/index.html', 'w', encoding='utf8').write(s)
print("patched")
