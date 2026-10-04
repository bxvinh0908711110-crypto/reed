import sys
sys.stdout.reconfigure(encoding='utf8')
s = open('E:/Your English/index.html', encoding='utf8').read()

def rep(a, b, cnt=1):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b, cnt)

# ---------- 1) bài tập làm (không nằm trong thanh chủ đề, không vào database) ----------
rep("/* ---------- Chủ đề (topic): thanh chọn ở trang đầu", '''/* Bài tập làm: bài cực ngắn chỉ chạy ở lần dùng đầu (và khi bấm "?") để người dùng làm thử vuốt / chạm / nghe */
const PRACTICE={ id:0, topic:"Welcome to Reed", level:"A1", scene:"hobbies", cat:"practice",
  tpl:"Welcome to Reed! Today, you will {0} how it works. Reading a little every day makes English {1}.",
  hl:[
   {"o":"see","u":"find out","lv":"A2","vn":"to learn something new","ex":"I want to find out more."},
   {"o":"easy","u":"much easier","lv":"A2","vn":"a clear way to say it gets less difficult","ex":"Practice makes it much easier."}
  ]};
ALL.push(PRACTICE);
/* ---------- Chủ đề (topic): thanh chọn ở trang đầu''')

# ---------- 2) CSS ----------
rep(".hero p{", '''.coach{position:fixed;z-index:66;left:50%;transform:translate(-50%,10px);width:min(460px,calc(100vw - 24px));bottom:calc(env(safe-area-inset-bottom,0px) + 100px);
  display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:18px;background:#0b0b0b;color:#fff;box-shadow:0 14px 34px rgba(0,0,0,.3);
  opacity:0;pointer-events:none;transition:opacity .3s ease,transform .3s ease}
.coach.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}
.coach .cn{flex:0 0 auto;background:var(--leaf);color:#0b0b0b;font-weight:800;font-size:12px;padding:4px 10px;border-radius:999px}
.coach .ct{flex:1;font-size:14px;font-weight:600;line-height:1.4}
.coach .cs{flex:0 0 auto;border:0;background:none;color:rgba(255,255,255,.55);font:inherit;font-size:12px;font-weight:600;cursor:pointer;padding:4px 2px}
.coach .cb{flex:0 0 auto;border:0;background:var(--leaf);color:#0b0b0b;font:inherit;font-size:13px;font-weight:800;padding:8px 14px;border-radius:999px;cursor:pointer}
.coach.final .cs{display:none}
@media (max-width:820px){ .coach{bottom:auto;top:128px} }
@media (prefers-reduced-motion:reduce){ .coach{transition:none} }
.hero p{''')

# ---------- 3) HTML ----------
rep('<div id="toast" class="toast" role="status"></div>', '<div id="toast" class="toast" role="status"></div>\n<div id="coach" class="coach" role="status"><span class="cn"></span><span class="ct"></span><button class="cs" type="button">Bỏ qua</button><button class="cb" type="button" hidden>Bắt đầu học</button></div>')

# ---------- 4) Tips: chặn khi đang tập, expose mark(), replay -> tập lại ----------
rep("function blocked(){\n    return paused||", "function blocked(){\n    return paused||(window.Practice&&Practice.active)||")
rep("  return {event,replay};\n})();", "  function mark(ids){ ids.forEach(i=>{ st[i+\"_done\"]=1; }); save(); }\n  return {event,replay,mark};\n})();")
rep('''    st={}; save(); hide();
    const toast=$("#toast"); toast.textContent="Hướng dẫn sẽ hiện lại từng bước khi bạn dùng"; toast.classList.add("on"); setTimeout(()=>toast.classList.remove("on"),2200);
    scrollTo(0,0);''', '''    st={}; save(); hide();
    Practice.start();   /* "?" = làm lại bài tập làm, các gợi ý còn lại (A1/A2, lưu, giữ tên bài) hiện lại sau */''')
rep('function tipEvt(n){ try{ Tips.event(n); }catch(e){} }', 'function tipEvt(n){ try{ Tips.event(n); }catch(e){} try{ Practice.event(n); }catch(e){} }')

# ---------- 5) Practice module ----------
practice_js = r'''/* ---------- Bài tập làm: 4 chặng (vuốt → chạm cụm → nghe → xong), dùng đúng engine thật để người dùng học bằng tay ---------- */
const Practice=(function(){
  const coarse=matchMedia("(pointer: coarse)").matches, DONE="reed_practice_done";
  const box=$("#coach"), num=box.querySelector(".cn"), txt=box.querySelector(".ct"), skip=box.querySelector(".cs"), go=box.querySelector(".cb");
  const api={active:false};
  let stage=0, flags={}, timer=0;
  const STAGES=[
    {t:coarse?"Vuốt lên để sang bước tiếp":"Cuộn chuột xuống để sang bước tiếp", done:()=>active.si>=1&&!stepping},
    {t:coarse?"Chạm vào cụm được tô sáng để đổi sang cách nói tự nhiên hơn":"Bấm vào cụm được tô sáng để đổi sang cách nói tự nhiên hơn", done:()=>flags.tap, ring:true},
    {t:"Bấm ▶ ở thanh dưới để nghe câu này", done:()=>flags.play},
    {t:"Tuyệt! Bạn đã biết cách dùng Reed. Chọn một chủ đề để bắt đầu.", final:true}
  ];
  const ring=on=>{ document.querySelectorAll(".tip-ring").forEach(n=>n.classList.remove("tip-ring"));
    if(on){ const pp=P[active.pi], sl=pp&&pp.sents[active.si]; const ph=sl&&sl.ph&&sl.ph[0]; if(ph) ph.classList.add("tip-ring"); } };
  function render(){
    const st=STAGES[stage]; num.textContent=(stage+1)+"/"+STAGES.length; txt.textContent=st.t;
    box.classList.toggle("final",!!st.final); go.hidden=!st.final; box.classList.add("on");
  }
  function finish(){
    api.active=false; clearInterval(timer); box.classList.remove("on"); ring(false);
    try{ localStorage.setItem(DONE,"1"); }catch(e){}
    try{ Tips.mark(["swipe","tap","listen"]); }catch(e){}
  }
  function toTopics(){
    finish();
    let saved=null; try{ saved=localStorage.getItem("reed_topic"); }catch(e){}
    const first=TOPICS.find(t=>t.k!=="practice"&&hasLessons(t.k));
    setTopic(saved&&saved!=="practice"&&hasLessons(saved)?saved:(first?first.k:"family"),false);
    scrollTo(0,0);
  }
  function loop(){
    if(!api.active) return;
    const st=STAGES[stage];
    if(st.ring&&P[active.pi]&&!document.querySelector(".tip-ring")) ring(true);
    if(!st.final&&st.done()){ stage++; flags.tap=flags.tap||false; ring(false); render(); }
  }
  api.event=n=>{ if(!api.active) return; if(n==="tap") flags.tap=true; if(n==="play") flags.play=true; };
  api.start=function(){
    api.active=true; stage=0; flags={};
    try{ localStorage.removeItem(DONE); }catch(e){}
    $("#toast").classList.remove("on");
    curTopic="practice"; passages=ALL.filter(p=>p.cat==="practice");
    setTopic("practice",false);
    document.querySelectorAll("#topics button").forEach(b=>b.setAttribute("aria-pressed","false"));
    scrollTo(0,firstLessonY());
    render(); clearInterval(timer); timer=setInterval(loop,250);
  };
  api.end=()=>{ if(api.active) finish(); };
  skip.addEventListener("click",toTopics); go.addEventListener("click",toTopics);
  api.maybeStart=function(){
    let d=false; try{ d=!!localStorage.getItem(DONE)||!!(JSON.parse(localStorage.getItem("reed_tips")||"{}").swipe_done); }catch(e){}
    if(d) return;
    const sp=$("#reed-splash"); let n=0;
    const w=setInterval(()=>{ n++; if(!sp||getComputedStyle(sp).display==="none"||n>80){ clearInterval(w); if(!api.active) api.start(); } },250);
  };
  return api;
})();
'''
rep("/* ---------- Khởi động ---------- */", practice_js + "\n/* ---------- Khởi động ---------- */")

# thanh chủ đề: bấm chủ đề khi đang tập = kết thúc tập
rep("    animateTopic(b.dataset.k);\n  });", "    if(Practice.active){ Practice.end(); setTopic(b.dataset.k,true); return; }\n    animateTopic(b.dataset.k);\n  });")
# khởi động: sau khi dựng chủ đề mặc định
rep("  setTopic(saved&&hasLessons(saved)?saved:(first?first.k:\"family\"),false);\n})();", "  setTopic(saved&&saved!==\"practice\"&&hasLessons(saved)?saved:(first?first.k:\"family\"),false);\n  Practice.maybeStart();\n})();")
open('E:/Your English/index.html', 'w', encoding='utf8').write(s)
print('patched')
