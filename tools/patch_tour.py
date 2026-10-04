import sys
sys.stdout.reconfigure(encoding='utf8')
s = open('E:/Your English/index.html', encoding='utf8').read()

def rep(a, b, cnt=1):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b, cnt)

# ---------- HTML ----------
rep('<div id="coach" class="coach"', '''<div id="tourBlock" class="tourBlock" hidden></div>
<div id="tourSpot" class="tourSpot" hidden></div>
<div id="tourCard" class="tourCard" role="dialog" aria-live="polite" hidden>
  <div class="th"><span class="tn"></span><button class="tk" type="button">Bỏ qua</button></div>
  <div class="tt"></div>
  <div class="tf"><button class="tb" type="button">Quay lại</button><button class="tx" type="button">Làm thử</button><button class="tg2" type="button">Tiếp</button></div>
</div>
<div id="coach" class="coach"''')

# ---------- CSS ----------
rep(".hero p{", '''.tourBlock{position:fixed;inset:0;z-index:79;background:transparent}
.tourSpot{position:fixed;z-index:80;pointer-events:none;border-radius:16px;box-shadow:0 0 0 9999px rgba(8,10,28,.66);
  transition:left .38s cubic-bezier(.2,.8,.2,1),top .38s cubic-bezier(.2,.8,.2,1),width .38s cubic-bezier(.2,.8,.2,1),height .38s cubic-bezier(.2,.8,.2,1),border-radius .3s}
.tourSpot::after{content:"";position:absolute;inset:-5px;border-radius:inherit;border:2px solid rgba(228,255,164,.9);animation:tourPulse 1.6s ease-in-out infinite}
@keyframes tourPulse{0%,100%{opacity:.9;transform:scale(1)}50%{opacity:.25;transform:scale(1.03)}}
.tourCard{position:fixed;z-index:81;left:0;top:0;width:min(360px,calc(100vw - 24px));padding:16px 18px 14px;border-radius:20px;background:#fff;color:#0b0b0b;
  box-shadow:0 18px 44px rgba(0,0,0,.35);opacity:0;transform:translateY(8px);transition:opacity .25s ease,transform .25s ease,left .38s cubic-bezier(.2,.8,.2,1),top .38s cubic-bezier(.2,.8,.2,1)}
.tourCard.on{opacity:1;transform:none}
.tourCard .th{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.tourCard .tn{background:var(--leaf);font-weight:800;font-size:12px;padding:4px 11px;border-radius:999px}
.tourCard .tk{border:0;background:none;color:#8a8580;font:inherit;font-size:13px;font-weight:600;cursor:pointer;padding:4px}
.tourCard .tt{font-size:15px;font-weight:600;line-height:1.5;margin-bottom:14px}
.tourCard .tf{display:flex;gap:8px;justify-content:flex-end;align-items:center}
.tourCard .tf button{font:inherit;font-size:14px;font-weight:700;border-radius:999px;padding:9px 18px;cursor:pointer;border:1.5px solid #0b0b0b;background:#fff;color:#0b0b0b}
.tourCard .tf .tg2{background:var(--accent);border-color:var(--accent);color:#fff}
.tourCard .tf .tx{margin-right:auto;border-color:#d4d4d4;color:#55514c}
.tourCard .tf button[hidden]{display:none}
.hero p{''')

# ---------- JS ----------
tour_js = r'''/* ---------- Tour hướng dẫn (cách A): làm tối màn hình, làm nổi từng chỗ, bấm "Tiếp" qua 6 bước ---------- */
const Tour=(function(){
  const coarse=matchMedia("(pointer: coarse)").matches, DONE="reed_tour_done";
  const blk=$("#tourBlock"), spot=$("#tourSpot"), card=$("#tourCard");
  const nEl=card.querySelector(".tn"), tEl=card.querySelector(".tt"), skipB=card.querySelector(".tk"), backB=card.querySelector(".tb"), nextB=card.querySelector(".tg2"), tryB=card.querySelector(".tx");
  const api={active:false};
  let i=0, raf=0, steps=[];
  const phraseSlide=()=>{ const pp=P[0]; if(!pp) return -1; return pp.sents.findIndex(s=>!s.recap&&s.idx&&s.idx.length); };
  const yOfSlide=si=>{ const pp=P[0], s=pp.sents[si]; return pp.el.getBoundingClientRect().top+scrollY+s.lo; };
  function build(){
    steps=[
      {t:"Chọn chủ đề bạn muốn học ở thanh này: Family, Friends, School, Work…", el:()=>$("#topics"), r:999, go:()=>{ scrollTo(0,0); }},
      {t:"Mỗi bước là một câu ngắn. "+(coarse?"Vuốt lên":"Cuộn chuột xuống")+" để sang bước tiếp, mỗi lần chỉ qua một bước nên bạn không bỏ lỡ gì.", el:()=>P[0]&&P[0].el.querySelector(".sents"), r:18, go:()=>{ scrollTo(0,firstLessonY()); }},
      {t:(coarse?"Chạm":"Bấm")+" vào cụm được tô sáng để đổi sang cách nói tự nhiên hơn (A1 → A2). Giải nghĩa hiện ngay bên dưới.", el:()=>{ const si=phraseSlide(); const sl=si>=0&&P[0].sents[si]; return sl&&sl.ph&&sl.ph[0]; }, r:12,
        go:()=>{ const si=phraseSlide(); if(si>=0) scrollTo(0,yOfSlide(si)); }},
      {t:"Chạm vào dấu trang để lưu cụm này vào sổ tay. Mọi cụm đã lưu nằm ở nút sổ tay trên cùng.", el:()=>{ const pp=P[0]; return pp&&pp.sv&&!pp.sv.hidden?pp.sv:$("#nbBtn"); }, r:999},
      {t:"Bấm ▶ để nghe câu đang đọc. Bấm ⌄ để đổi giọng nam/nữ và tốc độ chậm/thường.", el:()=>$("#player"), r:30},
      {t:(coarse?"Giữ ngón tay":"Nhấn giữ")+" vào tên bài để chuyển sang bài khác. Cần xem lại hướng dẫn? Bấm nút “?” trên cùng.", el:()=>$("#lessonContent"), r:24, last:true}
    ];
  }
  function measure(){
    const st=steps[i], t=st&&st.el&&st.el(); if(!t){ return; }
    const r=t.getBoundingClientRect(), pad=st.r===999?6:8;
    let x=r.left-pad, y=r.top-pad, w=r.width+pad*2, h=r.height+pad*2;
    spot.style.left=x+"px"; spot.style.top=y+"px"; spot.style.width=w+"px"; spot.style.height=h+"px";
    spot.style.borderRadius=(st.r===999?Math.min(w,h)/2:st.r)+"px";
    const cw=card.offsetWidth, ch=card.offsetHeight, W=innerWidth, H=innerHeight;
    let top = (y+h/2 > H*.55) ? y-ch-18 : y+h+18;
    if(top<10) top=y+h+18; if(top+ch>H-10) top=Math.max(10,y-ch-18);
    if(top<10) top=Math.min(H-ch-10,y+h+18);   /* mục tiêu quá lớn: đặt thẻ ở mép dưới */
    let left=x+w/2-cw/2; left=Math.max(12,Math.min(W-cw-12,left));
    card.style.left=left+"px"; card.style.top=top+"px";
  }
  function show(){
    const st=steps[i];
    if(st.go) st.go();
    nEl.textContent=(i+1)+"/"+steps.length; tEl.textContent=st.t;
    backB.hidden=i===0; tryB.hidden=!st.last; nextB.textContent=st.last?"Xong":"Tiếp"; skipB.hidden=!!st.last;
    card.classList.remove("on");
    setTimeout(()=>{ if(!api.active) return; /* chờ cuộn/dựng xong rồi mới đo */
      if(!(st.el&&st.el())){ if(i<steps.length-1){ i++; show(); } else end(true); return; }
      measure(); card.classList.add("on"); },60);
  }
  function loop(){ if(!api.active) return; measure(); raf=requestAnimationFrame(loop); }
  function end(markDone){
    api.active=false; cancelAnimationFrame(raf);
    blk.hidden=spot.hidden=card.hidden=true; card.classList.remove("on");
    try{ localStorage.setItem(DONE,"1"); }catch(e){}
    try{ Tips.mark(["swipe","tap","listen","hold"]); }catch(e){}
    let saved=null; try{ saved=localStorage.getItem("reed_topic"); }catch(e){}
    const first=TOPICS.find(t=>hasLessons(t.k));
    setTopic(saved&&saved!=="practice"&&hasLessons(saved)?saved:(first?first.k:"family"),false);
    scrollTo(0,0);
  }
  api.start=function(){
    if(Practice.active) Practice.end();
    api.active=true; i=0; build();
    let saved=null; try{ saved=localStorage.getItem("reed_topic"); }catch(e){}
    const first=TOPICS.find(t=>hasLessons(t.k));
    setTopic(saved&&saved!=="practice"&&hasLessons(saved)?saved:(first?first.k:"family"),false);
    blk.hidden=spot.hidden=card.hidden=false;
    show(); cancelAnimationFrame(raf); raf=requestAnimationFrame(loop);
  };
  api.end=()=>{ if(api.active) end(true); };
  nextB.addEventListener("click",()=>{ if(i<steps.length-1){ i++; show(); } else end(true); });
  backB.addEventListener("click",()=>{ if(i>0){ i--; show(); } });
  skipB.addEventListener("click",()=>end(true));
  tryB.addEventListener("click",()=>{ end(true); Practice.start(); });
  addEventListener("keydown",e=>{ if(!api.active) return;
    if(e.key==="Escape") end(true); else if(e.key==="ArrowRight"||e.key==="Enter") nextB.click(); else if(e.key==="ArrowLeft") backB.click();
    e.preventDefault(); e.stopPropagation(); },true);
  api.maybeStart=function(){
    let d=false; try{ d=!!localStorage.getItem(DONE)||!!localStorage.getItem("reed_practice_done")||!!(JSON.parse(localStorage.getItem("reed_tips")||"{}").swipe_done); }catch(e){}
    if(d) return;
    const sp=$("#reed-splash"); let n=0;
    const w=setInterval(()=>{ n++; if(!sp||getComputedStyle(sp).display==="none"||n>80){ clearInterval(w); if(!api.active) api.start(); } },250);
  };
  return api;
})();
'''
rep("/* ---------- Khởi động ---------- */", tour_js + "\n/* ---------- Khởi động ---------- */")

# ---------- hooks ----------
rep("function goStep(dir){\n  if(stepping) return;", "function goStep(dir){\n  if(stepping||(window.Tour&&Tour.active)) return;")
rep("function blocked(){\n    return paused||(window.Practice&&Practice.active)||", "function blocked(){\n    return paused||(window.Practice&&Practice.active)||(window.Tour&&Tour.active)||")
rep("    Practice.start();   /* \"?\" = làm lại bài tập làm", "    Tour.start();   /* \"?\" = xem lại tour hướng dẫn (có nút \"Làm thử\" ở bước cuối); trước đây là bài tập làm")
rep("  Practice.maybeStart();\n})();", "  Tour.maybeStart();\n})();")
open('E:/Your English/index.html', 'w', encoding='utf8').write(s)
print('patched')
