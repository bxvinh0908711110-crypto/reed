import sys
sys.stdout.reconfigure(encoding='utf8')
s = open('E:/Your English/index.html', encoding='utf8').read()

def rep(a, b, cnt=1):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b, cnt)

# ---------- HTML ----------
rep('<div id="tourCard" class="tourCard"', '''<svg id="tourArrow" class="tourArrow" hidden aria-hidden="true"><path class="ta" d=""/><path class="th" d=""/></svg>
<div id="welcome" class="welcome" hidden role="dialog" aria-modal="true" aria-labelledby="wTitle">
  <div class="wc"><div class="wi">👋</div><h3 id="wTitle">Chào mừng đến Reed</h3>
    <p>Học tiếng Anh qua những câu ngắn mỗi ngày. Bạn có muốn xem hướng dẫn nhanh (khoảng 30 giây) không?</p>
    <div class="wb"><button class="w2" type="button">Đã hiểu</button><button class="w1" type="button">Xem hướng dẫn</button></div></div>
</div>
<div id="tourCard" class="tourCard"''')

# ---------- CSS ----------
rep(".tourCard{position:fixed;", '''.tourArrow{position:fixed;inset:0;width:100%;height:100%;z-index:81;pointer-events:none;overflow:visible;fill:none;stroke:#e4ffa4;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;
  filter:drop-shadow(0 2px 6px rgba(0,0,0,.35));opacity:0;transition:opacity .3s ease .12s}
.tourArrow.on{opacity:1}
.welcome{position:fixed;inset:0;z-index:85;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(8,10,28,.58);
  opacity:0;transition:opacity .3s ease}
.welcome.on{opacity:1}
.welcome[hidden]{display:none}
.welcome .wc{width:min(380px,100%);background:#fff;border-radius:24px;padding:26px 24px 22px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.4);
  transform:translateY(12px) scale(.97);transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.welcome.on .wc{transform:none}
.welcome .wi{font-size:38px;line-height:1;margin-bottom:10px}
.welcome h3{margin:0 0 8px;font-size:21px;font-weight:800;letter-spacing:-.02em}
.welcome p{margin:0 0 20px;color:#55514c;font-size:15px;line-height:1.55}
.welcome .wb{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.welcome .wb button{flex:1 1 120px;font:inherit;font-size:15px;font-weight:700;border-radius:999px;padding:12px 18px;cursor:pointer;border:1.5px solid #0b0b0b;background:#fff;color:#0b0b0b}
.welcome .wb .w1{background:var(--accent);border-color:var(--accent);color:#fff}
@media (prefers-reduced-motion:reduce){.welcome,.welcome .wc,.tourArrow{transition:none}}
.tourCard{position:fixed;''')

# ---------- JS: mũi tên ----------
rep("    card.style.left=left+\"px\"; card.style.top=top+\"px\";\n  }", '''    card.style.left=left+"px"; card.style.top=top+"px";
    arrow(left,top,cw,ch,x,y,w,h);
  }
  /* Mũi tên cong từ thẻ chỉ vào vùng được làm nổi (như demo) */
  const arr=$("#tourArrow"), pA=arr.querySelector(".ta"), pH=arr.querySelector(".th");
  function arrow(cl,ct,cw,ch,x,y,w,h){
    const cb=ct+ch, sb=y+h, cx0=x+w/2;
    let sx,sy,ex,ey;
    if(cb+10<=y){ sx=Math.max(cl+28,Math.min(cl+cw-28,cx0)); sy=cb+3; ex=Math.max(x+14,Math.min(x+w-14,cx0)); ey=y-9; }
    else if(ct-10>=sb){ sx=Math.max(cl+28,Math.min(cl+cw-28,cx0)); sy=ct-3; ex=Math.max(x+14,Math.min(x+w-14,cx0)); ey=sb+9; }
    else { arr.classList.remove("on"); return; }
    const dir=(ex>=sx?-1:1), mx=(sx+ex)/2+dir*42, my=(sy+ey)/2;
    pA.setAttribute("d","M"+sx+" "+sy+" Q"+mx+" "+my+" "+ex+" "+ey);
    const a=Math.atan2(ey-my,ex-mx), L=11, o=.55;
    pH.setAttribute("d","M"+(ex-L*Math.cos(a-o))+" "+(ey-L*Math.sin(a-o))+" L"+ex+" "+ey+" L"+(ex-L*Math.cos(a+o))+" "+(ey-L*Math.sin(a+o)));
    arr.hidden=false; arr.classList.add("on");
  }''')
rep("let top = (y+h/2 > H*.55) ? y-ch-18 : y+h+18;\n    if(top<10) top=y+h+18; if(top+ch>H-10) top=Math.max(10,y-ch-18);\n    if(top<10) top=Math.min(H-ch-10,y+h+18);",
    "const G=46;   /* khoảng trống giữa thẻ và vùng nổi: chỗ cho mũi tên */\n    let top = (y+h/2 > H*.55) ? y-ch-G : y+h+G;\n    if(top<10) top=y+h+G; if(top+ch>H-10) top=Math.max(10,y-ch-G);\n    if(top<10) top=Math.min(H-ch-10,y+h+G);")
# ẩn/hiện mũi tên theo thẻ
rep("    card.classList.remove(\"on\");\n    setTimeout(()=>{ if(!api.active) return;", "    card.classList.remove(\"on\"); arr.classList.remove(\"on\");\n    setTimeout(()=>{ if(!api.active) return;")
rep("    blk.hidden=spot.hidden=card.hidden=true; card.classList.remove(\"on\");", "    blk.hidden=spot.hidden=card.hidden=true; card.classList.remove(\"on\"); arr.classList.remove(\"on\"); arr.hidden=true;")

# ---------- JS: thông báo chào mừng ----------
rep("  api.maybeStart=function(){\n    let d=false; try{ d=!!localStorage.getItem(DONE)", '''  /* Hộp chào mừng ở lần vào đầu: "Xem hướng dẫn" hoặc "Đã hiểu" (không bắt người dùng đi tìm nút ?) */
  const wel=$("#welcome"); api.welcomeOpen=false;
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
    let d=false; try{ d=!!localStorage.getItem(DONE)''')
rep("if(!api.active) api.start(); } },250);\n  };\n  return api;\n})();\n", "if(!api.active) api.welcome(); } },250);\n  };\n  return api;\n})();\n")
# chặn thao tác khi hộp chào mừng mở
rep("function goStep(dir){\n  if(stepping||(typeof Tour!==\"undefined\"&&Tour.active)) return;", "function goStep(dir){\n  if(stepping||(typeof Tour!==\"undefined\"&&(Tour.active||Tour.welcomeOpen))) return;")
rep("(typeof Tour!==\"undefined\"&&Tour.active)||", "(typeof Tour!==\"undefined\"&&(Tour.active||Tour.welcomeOpen))||")
open('E:/Your English/index.html', 'w', encoding='utf8').write(s)
print('patched')
