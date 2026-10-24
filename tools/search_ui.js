/* ---------- Ô tìm kiếm thông minh: ô ở đầu trang All / danh sách bài + lớp phủ gợi ý + chữ chạy ----------
   Ô trên trang (#sbox) chỉ là nút mở lớp phủ (#sov); gõ thật diễn ra trong lớp phủ. Chỉ mục dựng lười, chạy hoàn toàn trên máy. */
const SEARCH_PH=["What do you want to learn today?","Tell me what you like.","I’ll find a lesson for you.","Let’s learn something new."];
const SEARCH_RECENT_KEY="reed_recent";
let sovIdx=null, sovIdxN=-1;
function searchIdx(){
  const n=ALL.length+STORIES.length;
  if(!sovIdx||sovIdxN!==n){
    sovIdx=Search.buildIndex({lessons:ALL,stories:STORIES.map(s=>Object.assign({},s,{topic:s.title})),topics:TOPICS.filter(t=>hasLessons(t.k))});
    sovIdxN=n;
  }
  return sovIdx;
}
/* chữ chạy trong ô: hai lớp chữ chồng nhau, mỗi lần chỉ trượt + mờ (transform/opacity) một lần; dừng khi ẩn tab / lớp phủ mở; đứng yên ở LITE và giảm chuyển động */
const SboxTicker=(function(){
  const box=document.getElementById("sbox"); if(!box) return {};
  const A=box.querySelector(".sbA"), B=box.querySelector(".sbB"), tx=box.querySelector(".sbTxt");
  let i=0, cur=A, nxt=B, t=0;
  A.textContent=SEARCH_PH[0];
  const still=()=>LITE||matchMedia("(prefers-reduced-motion: reduce)").matches;
  function run(el,from,to){
    const a=el.animate([from,to],{duration:340,easing:"cubic-bezier(.3,.7,.2,1)",fill:"both"});
    a.onfinish=()=>{ el.style.opacity=to.opacity; el.style.transform=to.transform; a.cancel(); };
  }
  function tick(){
    if(still()||document.hidden||!box.getClientRects().length||(window.__sov&&window.__sov.isOpen())) return;
    i=(i+1)%SEARCH_PH.length; nxt.textContent=SEARCH_PH[i];
    run(nxt,{opacity:0,transform:"translateY(9px)"},{opacity:1,transform:"none"});
    run(cur,{opacity:1,transform:"none"},{opacity:0,transform:"translateY(-9px)"});
    const x=cur; cur=nxt; nxt=x;
  }
  t=setInterval(tick,3400);
  return {tick};
})();
const Sov=(function(){
  const el=document.getElementById("sov"), inp=document.getElementById("sovIn"), bd=document.getElementById("sovBody"), box=document.getElementById("sbox");
  let open=false, results=[], qT=0, lastFocus=null, hideT=0;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const readJSON=(k,def)=>{ try{ const v=JSON.parse(localStorage.getItem(k)||"null"); return v==null?def:v; }catch(e){ return def; } };
  const recent=()=>readJSON(SEARCH_RECENT_KEY,[]).filter(x=>typeof x==="string");
  function addRecent(q){ q=String(q||"").trim(); if(!q) return; try{ const r=recent().filter(x=>x.toLowerCase()!==q.toLowerCase()); r.unshift(q); localStorage.setItem(SEARCH_RECENT_KEY,JSON.stringify(r.slice(0,5))); }catch(e){} }
  function clearRecent(){ try{ localStorage.removeItem(SEARCH_RECENT_KEY); }catch(e){} }
  const topicOf=k=>TOPICS.find(t=>t.k===k)||{label:k,vb:"0 0 24 24",icon:""};
  const lessonOf=id=>ALL.find(p=>p.id===id);
  const nLess=n=>n+(n===1?" lesson":" lessons");
  function thumb(e){
    if(e.type==="topic"){ const t=topicOf(e.k); return `<span class="sovIc"><svg viewBox="${t.vb}" fill="currentColor" aria-hidden="true">${t.icon}</svg></span>`; }
    if(e.type==="tag") return `<span class="sovIc sovHash">#</span>`;
    let src=""; if(e.story){ const s=STORIES.find(x=>x.id===e.id); src=s&&s.cover; } else { const p=lessonOf(e.id); src=p&&IMG[p.scene]; }
    return src?`<span class="sovTh"><img src="${src}" alt="" ${imgLoad(src)} onerror="this.remove()"></span>`:`<span class="sovTh"></span>`;
  }
  function row(e){
    let a="", sub="", title=e.title||e.label;
    if(e.type==="topic"){ a=`data-a="topic" data-k="${e.k}"`; const n=topicLessons(e.k).length; sub=e.k==="stories"?n+(n===1?" story":" stories"):nLess(n); }
    else if(e.type==="tag"){ a=`data-a="tag" data-key="${esc(e.key)}" data-label="${esc(e.label)}"`; sub=nLess(e.ids.length); }
    else if(e.story){ a=`data-a="story" data-id="${e.id}"`; sub="Story · "+e.level; }
    else { a=`data-a="lesson" data-k="${e.k}" data-id="${e.id}"`; sub=topicOf(e.k).label+" · "+e.level+(readSet.has(e.id)?" · Read":""); }
    return `<button type="button" class="sovRow" ${a}>${thumb(e)}<span class="sovTx"><b>${esc(title)}</b><i>${esc(sub)}</i></span><span class="sovGo" aria-hidden="true">›</span></button>`;
  }
  const chip=(label,attrs)=>`<button type="button" class="sovChip" ${attrs}>${esc(label)}</button>`;
  function homeHTML(){
    const idx=searchIdx(); let h="";
    const L=readJSON("reed_last",null), lp=L&&lessonOf(L.id);
    if(lp&&L.k&&hasLessons(L.k)) h+=`<section class="sovSec"><h3>Continue</h3>${row({type:"lesson",id:lp.id,k:L.k,title:lp.topic,level:lp.level})}</section>`;
    const r=recent();
    if(r.length) h+=`<section class="sovSec"><h3>Recent<button type="button" class="sovClear" data-a="clear">Clear</button></h3><div class="sovChips">${r.map(q=>chip(q,`data-a="q" data-q="${esc(q)}"`)).join("")}</div></section>`;
    h+=`<section class="sovSec"><h3>Topics</h3><div class="sovChips">${TOPICS.filter(t=>hasLessons(t.k)).map(t=>chip(t.label,`data-a="topic" data-k="${t.k}"`)).join("")}</div></section>`;
    const tg=Search.popularTags(idx,8,"sit");
    if(tg.length) h+=`<section class="sovSec"><h3>Try</h3><div class="sovChips">${tg.map(t=>chip(t.label,`data-a="q" data-q="${esc(t.label)}"`)).join("")}</div></section>`;
    return h;
  }
  function resultsHTML(q){
    const idx=searchIdx(), r=Search.search(idx,q,{read:readSet});
    results=[].concat(r.topics,r.lessons,r.tags);
    if(!results.length){
      const tg=Search.popularTags(idx,6,"sit");
      return `<div class="sovEmpty">No match for “${esc(q.trim())}”.</div>`+(tg.length?`<section class="sovSec"><h3>Try</h3><div class="sovChips">${tg.map(t=>chip(t.label,`data-a="q" data-q="${esc(t.label)}"`)).join("")}</div></section>`:"");
    }
    let h="";
    if(r.topics.length) h+=`<section class="sovSec"><h3>Topics</h3>${r.topics.map(row).join("")}</section>`;
    if(r.lessons.length) h+=`<section class="sovSec"><h3>Lessons</h3>${r.lessons.map(row).join("")}</section>`;
    if(r.tags.length) h+=`<section class="sovSec"><h3>Tags</h3>${r.tags.map(row).join("")}</section>`;
    return h;
  }
  function render(){
    const q=inp.value; results=[];
    bd.innerHTML=q.trim()?resultsHTML(q):homeHTML();
    bd.scrollTop=0;
    el.classList.toggle("hasq",!!q.trim());
  }
  function setOpen(on){
    clearTimeout(hideT);
    if(on===open) return; open=on;
    if(on){
      if(typeof Tour!=="undefined"&&(Tour.active||Tour.welcomeOpen)){ open=false; return; }
      lastFocus=document.activeElement;
      el.hidden=false; inp.value=""; render();
      document.body.classList.add("sovOpen");
      requestAnimationFrame(()=>requestAnimationFrame(()=>{ el.classList.add("on"); }));
      inp.focus({preventScroll:true});   /* trong cùng cử chỉ chạm: iOS mới mở bàn phím */
    } else {
      el.classList.remove("on"); document.body.classList.remove("sovOpen"); inp.blur();
      hideT=setTimeout(()=>{ if(!open) el.hidden=true; },300);
      if(lastFocus&&lastFocus.focus&&document.contains(lastFocus)) try{ lastFocus.focus({preventScroll:true}); }catch(e){}
    }
  }
  function act(b){
    const a=b.dataset.a;
    if(a==="clear"){ clearRecent(); render(); return; }
    if(a==="q"){ inp.value=b.dataset.q; render(); inp.focus({preventScroll:true}); return; }
    const q=inp.value.trim(); if(q) addRecent(q);
    setOpen(false);
    if(a==="topic"){ switchView(b.dataset.k); }
    else if(a==="tag"){ openTag(b.dataset.key,b.dataset.label); }
    else if(a==="story"){ closeAllScreens(); const st=STORIES.find(x=>x.id===b.dataset.id); if(st) openStory(st.slug); }
    else if(a==="lesson"){
      const k=b.dataset.k, id=+b.dataset.id, i=topicLessons(k).findIndex(p=>p.id===id);
      if(i>=0&&i>=topicUnlocked(k)){ closeAllScreens(); openTopicList(k); }   /* bài còn khoá: mở danh sách chủ đề (có ổ khoá) */
      else goToLesson(k,id);
    }
  }
  function submit(){ const q=inp.value.trim(); if(!q) return; const first=bd.querySelector(".sovRow"); if(first) act(first); else addRecent(q); }
  inp.addEventListener("input",()=>{ clearTimeout(qT); qT=setTimeout(render,80); });
  inp.addEventListener("keydown",e=>{
    if(e.key==="Enter"){ e.preventDefault(); submit(); }
    else if(e.key==="ArrowDown"){ const r=bd.querySelector(".sovRow,.sovChip"); if(r){ e.preventDefault(); r.focus(); } }
  });
  bd.addEventListener("keydown",e=>{
    if(e.key!=="ArrowDown"&&e.key!=="ArrowUp") return;
    const all=[...bd.querySelectorAll(".sovRow,.sovChip")], i=all.indexOf(document.activeElement); if(i<0) return;
    e.preventDefault(); const n=e.key==="ArrowDown"?all[i+1]:all[i-1]; if(n) n.focus(); else if(e.key==="ArrowUp") inp.focus();
  });
  bd.addEventListener("click",e=>{ const b=e.target.closest("[data-a]"); if(b) act(b); });
  document.getElementById("sovCancel").addEventListener("click",()=>setOpen(false));
  document.getElementById("sovGo").addEventListener("click",submit);
  el.addEventListener("click",e=>{ if(e.target===el) setOpen(false); });
  addEventListener("keydown",e=>{ if(open&&e.key==="Escape"){ e.stopPropagation(); setOpen(false); } },true);
  /* lớp phủ tự cuộn: không để cuộn / vuốt lọt xuống engine cuộn của bài */
  for(const ev of ["wheel","touchstart","touchmove","touchend"]) el.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
  box.addEventListener("click",()=>setOpen(true));
  addEventListener("keydown",e=>{   /* "/" mở ô tìm kiếm khi đang duyệt (không đang gõ ở ô nào) */
    if(e.key!=="/"||e.ctrlKey||e.metaKey||e.altKey||open) return;
    if(e.target.closest&&e.target.closest("input,textarea,select,[contenteditable]")) return;
    if(!document.body.classList.contains("listOpen")||!box.getClientRects().length) return;
    e.preventDefault(); setOpen(true);
  });
  const api={isOpen:()=>open,open:()=>setOpen(true),close:()=>setOpen(false),render,get input(){ return inp; }};
  window.__sov=api; return api;
})();
