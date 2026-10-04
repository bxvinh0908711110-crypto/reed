/* ---------- Tour hướng dẫn (cách A): làm tối màn hình, làm nổi từng chỗ, mũi tên chỉ, bấm "Tiếp" qua 8 bước ---------- */
const Tour=(function(){
  const coarse=matchMedia("(pointer: coarse)").matches, DONE="reed_tour_done";
  const blk=$("#tourBlock"), spot=$("#tourSpot"), card=$("#tourCard");
  const nEl=card.querySelector(".tn"), tEl=card.querySelector(".tt"), skipB=card.querySelector(".tk"), backB=card.querySelector(".tb"), nextB=card.querySelector(".tg2"), tryB=card.querySelector(".tx");
  const arr=$("#tourArrow"), pA=arr.querySelector(".ta"), pH=arr.querySelector(".th");
  const api={active:false, welcomeOpen:false};
  let i=0, raf=0, steps=[], demoAdded=null, shownAt=0;
  const phraseSlide=()=>{ const pp=P[0]; if(!pp) return -1; return pp.sents.findIndex(s=>!s.recap&&s.idx&&s.idx.length); };
  const yOfSlide=si=>{ const pp=P[0], s=pp.sents[si]; return pp.el.getBoundingClientRect().top+scrollY+s.lo; };
  const union=(a,b)=>{ if(!a) return b; if(!b) return a; const l=Math.min(a.left,b.left), t=Math.min(a.top,b.top), r=Math.max(a.right,b.right), bt=Math.max(a.bottom,b.bottom); return {left:l,top:t,width:r-l,height:bt-t,right:r,bottom:bt}; };

  function build(){
    steps=[
      {t:"Chọn chủ đề bạn muốn học ở thanh này: Family, Friends, School, Work…", el:()=>$("#topics"), r:999, enter:()=>{ scrollTo(0,0); }},
      {t:"Mỗi bước là một câu ngắn. "+(coarse?"Vuốt lên":"Cuộn chuột xuống")+" để sang bước tiếp, mỗi lần chỉ qua một bước nên bạn không bỏ lỡ gì.", el:()=>P[0]&&P[0].el.querySelector(".sents"), r:18, enter:()=>{ scrollTo(0,firstLessonY()); }},
      {t:(coarse?"Chạm":"Bấm")+" vào cụm được tô sáng để đổi sang cách nói tự nhiên hơn (A1 → A2). Giải nghĩa hiện ngay bên dưới.", el:()=>{ const si=phraseSlide(); const sl=si>=0&&P[0].sents[si]; return sl&&sl.ph&&sl.ph[0]; }, r:12,
        enter:()=>{ const si=phraseSlide(); if(si>=0) scrollTo(0,yOfSlide(si)); }},
      {t:"Bấm ▶ để nghe câu đang đọc.", el:()=>$("#player .play"), r:999},
      {t:"Bấm ⌄ để mở cài đặt: chọn giọng nam / nữ và tốc độ chậm / thường.", el:()=>$("#player"), r:30, wait:480,
        enter:()=>{ player.classList.add("settings"); }, leave:()=>{ player.classList.remove("settings"); }},
      {t:"Chạm vào dấu trang để lưu cụm này vào sổ tay.", el:()=>{ const pp=P[0]; return pp&&pp.sv&&!pp.sv.hidden?pp.sv:$("#nbBtn"); }, r:999},
      {t:"Mọi cụm đã lưu nằm trong Sổ tay (nút ở góc trên), bạn xem lại và ôn tập ở đây.", el:()=>$("#notebook"), r:0, wait:650,
        enter:()=>{
          demoAdded=null;
          if(!nbLoad().length){ const h=passages[0]&&passages[0].hl[0]; if(h){ demoAdded={o:h.o,u:h.u,lv:h.lv,vn:h.vn,ex:h.ex,topic:passages[0].topic}; nbTogglePair(demoAdded); } }   /* cụm mẫu chỉ để minh hoạ, gỡ ngay khi rời bước */
          nbOpen();
        },
        leave:()=>{ nbClose(); if(demoAdded){ nbTogglePair(demoAdded); demoAdded=null; } }},
      {t:(coarse?"Giữ ngón tay":"Nhấn giữ")+" vào tên bài, rồi trượt sang trái / phải để chọn bài khác. Cần xem lại hướng dẫn? Bấm nút “?” trên cùng.", last:true, wait:520, r:30,
        rect:()=>union($("#player").getBoundingClientRect(), $("#pickBubble").getBoundingClientRect()),
        el:()=>$("#player"),
        enter:()=>{ openPicker(); }, leave:()=>{ closePicker(); }}
    ];
  }
  function clamp1(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function measure(){
    const st=steps[i], t=st&&st.el&&st.el(); if(!t) return;
    const r=st.rect?st.rect():t.getBoundingClientRect(), W=innerWidth, H=innerHeight, pad=st.r===999?6:(st.r===0?0:8);
    let x=r.left-pad, y=r.top-pad, w=r.width+pad*2, h=r.height+pad*2;
    spot.style.left=x+"px"; spot.style.top=y+"px"; spot.style.width=w+"px"; spot.style.height=h+"px";
    spot.style.borderRadius=(st.r===999?Math.min(w,h)/2:st.r)+"px";
    const cw=card.offsetWidth, ch=card.offsetHeight, G=46;
    let left, top;
    if(h>H*.6){   /* vùng nổi rất cao (vd. sổ tay): đặt thẻ bên cạnh nếu còn chỗ, nếu không thì ở mép dưới */
      if(x>cw+G+12){ left=x-cw-G; top=clamp1(y+h/2-ch/2,10,H-ch-10); }
      else if(W-(x+w)>cw+G+12){ left=x+w+G; top=clamp1(y+h/2-ch/2,10,H-ch-10); }
      else { left=clamp1(x+w/2-cw/2,12,W-cw-12); top=H-ch-14; }
    } else {
      top=(y+h/2>H*.55)?y-ch-G:y+h+G;
      if(top<10) top=y+h+G; if(top+ch>H-10) top=Math.max(10,y-ch-G);
      if(top<10) top=Math.min(H-ch-10,y+h+G);
      left=clamp1(x+w/2-cw/2,12,W-cw-12);
    }
    card.style.left=left+"px"; card.style.top=top+"px";
    arrow(left,top,cw,ch,x,y,w,h);
  }
  /* Mũi tên cong từ thẻ chỉ vào vùng được làm nổi (như demo) */
  function arrow(cl,ct,cw,ch,x,y,w,h){
    const cb=ct+ch, sb=y+h, cx0=x+w/2, cy0=y+h/2;
    let sx,sy,ex,ey,mx,my;
    if(cb+10<=y){ sx=clamp1(cx0,cl+28,cl+cw-28); sy=cb+3; ex=clamp1(cx0,x+14,x+w-14); ey=y-9; const d=ex>=sx?-1:1; mx=(sx+ex)/2+d*42; my=(sy+ey)/2; }
    else if(ct-10>=sb){ sx=clamp1(cx0,cl+28,cl+cw-28); sy=ct-3; ex=clamp1(cx0,x+14,x+w-14); ey=sb+9; const d=ex>=sx?-1:1; mx=(sx+ex)/2+d*42; my=(sy+ey)/2; }
    else if(cl+cw+10<=x){ sx=cl+cw+3; sy=clamp1(cy0,ct+24,ct+ch-24); ex=x-9; ey=clamp1(cy0,y+14,y+h-14); const d=ey>=sy?-1:1; mx=(sx+ex)/2; my=(sy+ey)/2+d*42; }
    else if(x+w+10<=cl){ sx=cl-3; sy=clamp1(cy0,ct+24,ct+ch-24); ex=x+w+9; ey=clamp1(cy0,y+14,y+h-14); const d=ey>=sy?-1:1; mx=(sx+ex)/2; my=(sy+ey)/2+d*42; }
    else { arr.classList.remove("on"); return; }
    pA.setAttribute("d","M"+sx+" "+sy+" Q"+mx+" "+my+" "+ex+" "+ey);
    const a=Math.atan2(ey-my,ex-mx), L=11, o=.55;
    pH.setAttribute("d","M"+(ex-L*Math.cos(a-o))+" "+(ey-L*Math.sin(a-o))+" L"+ex+" "+ey+" L"+(ex-L*Math.cos(a+o))+" "+(ey-L*Math.sin(a+o)));
    arr.hidden=false; arr.classList.add("on");
  }
  function cleanup(){ const st=steps[i]; if(st&&st.leave){ try{ st.leave(); }catch(e){} } }
  function go(n){ cleanup(); i=n; show(); }
  function show(){
    const st=steps[i];
    nEl.textContent=(i+1)+"/"+steps.length; tEl.textContent=st.t;
    backB.hidden=i===0; tryB.hidden=!st.last; nextB.textContent=st.last?"Xong":"Tiếp"; skipB.hidden=!!st.last;
    card.classList.remove("on"); arr.classList.remove("on");
    if(st.enter) st.enter();
    const token=++shownAt;
    setTimeout(()=>{ if(!api.active||token!==shownAt) return;   /* chờ cuộn / hoạt ảnh mở xong rồi mới đo */
      if(!(st.el&&st.el())){ if(i<steps.length-1){ go(i+1); } else end(); return; }
      measure(); card.classList.add("on"); },st.wait||80);
  }
  function loop(){ if(!api.active) return; measure(); raf=requestAnimationFrame(loop); }
  function end(){
    cleanup();
    api.active=false; cancelAnimationFrame(raf);
    blk.hidden=spot.hidden=card.hidden=true; card.classList.remove("on"); arr.classList.remove("on"); arr.hidden=true;
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
  api.end=()=>{ if(api.active) end(); };
  nextB.addEventListener("click",()=>{ if(i<steps.length-1) go(i+1); else end(); });
  backB.addEventListener("click",()=>{ if(i>0) go(i-1); });
  skipB.addEventListener("click",()=>end());
  tryB.addEventListener("click",()=>{ end(); Practice.start(); });
  addEventListener("keydown",e=>{ if(!api.active) return;
    if(e.key==="Escape") end(); else if(e.key==="ArrowRight"||e.key==="Enter") nextB.click(); else if(e.key==="ArrowLeft") backB.click();
    e.preventDefault(); e.stopPropagation(); },true);

  /* Hộp chào mừng ở lần vào đầu: "Xem hướng dẫn" hoặc "Đã hiểu" (không bắt người dùng đi tìm nút ?) */
  const wel=$("#welcome");
  function welcomeHide(){ api.welcomeOpen=false; wel.classList.remove("on"); setTimeout(()=>{ wel.hidden=true; },300); }
  api.welcome=function(){
    if(api.active||api.welcomeOpen) return;
    api.welcomeOpen=true; wel.hidden=false; requestAnimationFrame(()=>wel.classList.add("on"));
    wel.querySelector(".w1").focus({preventScroll:true});
  };
  wel.querySelector(".w1").addEventListener("click",()=>{ welcomeHide(); setTimeout(()=>api.start(),320); });
  wel.querySelector(".w2").addEventListener("click",()=>{ welcomeHide(); try{ localStorage.setItem(DONE,"1"); }catch(e){} });
  addEventListener("keydown",e=>{ if(api.welcomeOpen&&e.key==="Escape"){ wel.querySelector(".w2").click(); } },true);
  api.maybeStart=function(){
    let d=false; try{ d=!!localStorage.getItem(DONE)||!!localStorage.getItem("reed_practice_done")||!!(JSON.parse(localStorage.getItem("reed_tips")||"{}").swipe_done); }catch(e){}
    if(d) return;
    const sp=$("#reed-splash"); let n=0;
    const w=setInterval(()=>{ n++; if(!sp||getComputedStyle(sp).display==="none"||n>80){ clearInterval(w); if(!api.active) api.welcome(); } },250);
  };
  return api;
})();
