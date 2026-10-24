/* ---------- Ô tìm kiếm thông minh gộp với thanh chủ đề (một khối, phẳng, không viền/đổ bóng) ----------
   Khối #sbx = ô nhập (#sbox) + một hàng bên dưới. Hàng đó là thanh chủ đề; khi chạm ô, hàng gợi ý (#sug) thay chỗ thanh chủ đề
   (trên điện thoại) hoặc hiện ngay dưới ô (máy tính). Gõ thật diễn ra ngay trong ô, không mở trang/lớp phủ mới. Chỉ mục dựng lười, chạy trên máy. */
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
/* chữ chạy trong ô: hai lớp chữ chồng nhau, mỗi lần chỉ trượt + mờ (transform/opacity) một lần; dừng khi ẩn tab / đang gõ; đứng yên ở LITE và giảm chuyển động */
const SboxTicker=(function(){
  const box=document.getElementById("sbox"); if(!box) return {};
  const A=box.querySelector(".sbA"), B=box.querySelector(".sbB");
  let i=0, cur=A, nxt=B;
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
  setInterval(tick,3400);
  return {tick};
})();
const Sov=(function(){
  const top=document.querySelector(".top"), sbx=document.getElementById("sbx"), box=document.getElementById("sbox"), inp=document.getElementById("sbIn"), sug=document.getElementById("sug"), topics=document.getElementById("topics");
  let open=false, qT=0;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const readJSON=(k,def)=>{ try{ const v=JSON.parse(localStorage.getItem(k)||"null"); return v==null?def:v; }catch(e){ return def; } };
  const recent=()=>readJSON(SEARCH_RECENT_KEY,[]).filter(x=>typeof x==="string");
  function addRecent(q){ q=String(q||"").trim(); if(!q) return; try{ const r=recent().filter(x=>x.toLowerCase()!==q.toLowerCase()); r.unshift(q); localStorage.setItem(SEARCH_RECENT_KEY,JSON.stringify(r.slice(0,5))); }catch(e){} }
  function clearRecent(){ try{ localStorage.removeItem(SEARCH_RECENT_KEY); }catch(e){} }
  const topicOf=k=>TOPICS.find(t=>t.k===k)||{label:k,vb:"0 0 24 24",icon:""};
  const lessonOf=id=>ALL.find(p=>p.id===id);
  /* điện thoại: thanh chủ đề nằm trong khối cùng ô tìm kiếm; máy tính: thanh chủ đề ở hàng trên như cũ */
  const mq=matchMedia("(max-width:820px)");
  function placeTopics(){
    if(mq.matches){ if(topics.parentNode!==sbx) sbx.insertBefore(topics,sug); }
    else if(topics.parentNode===sbx) top.insertBefore(topics,top.querySelector(".right"));
    const pk=document.querySelector("#topics button[aria-pressed=true]"); if(pk&&typeof centerTab==="function") requestAnimationFrame(()=>centerTab(pk));
  }
  placeTopics(); if(mq.addEventListener) mq.addEventListener("change",placeTopics);
  /* một chip gợi ý */
  function chip(e){
    let a="", lead="", label=e.title||e.label;
    if(e.type==="topic"){ const t=topicOf(e.k); a=`data-a="topic" data-k="${e.k}"`; lead=`<svg viewBox="${t.vb}" fill="currentColor" aria-hidden="true">${t.icon}</svg>`; }
    else if(e.type==="tag"){ a=`data-a="tag" data-key="${esc(e.key)}" data-label="${esc(e.label)}"`; lead="#"; }
    else if(e.story){ a=`data-a="story" data-id="${e.id}"`; const s=STORIES.find(x=>x.id===e.id); lead=s&&s.cover?`<img src="${s.cover}" alt="" onerror="this.remove()">`:""; }
    else { a=`data-a="lesson" data-k="${e.k}" data-id="${e.id}"`; const p=lessonOf(e.id), src=p&&IMG[p.scene]; lead=src?`<img src="${src}" alt="" onerror="this.remove()">`:""; }
    const ck=e.type==="tag"?"tag":(e.story?"stories":e.k);
    return `<button type="button" class="sgChip sg-${e.type} c-${ck}" ${a}>${lead?`<span class="sgLead">${lead}</span>`:""}<span class="sgTx">${esc(label)}</span></button>`;
  }
  const qChip=(q,cls)=>`<button type="button" class="sgChip ${cls||""}" data-a="q" data-q="${esc(q)}"><span class="sgTx">${esc(q)}</span></button>`;
  function homeHTML(){
    const idx=searchIdx(); let h="";
    const L=readJSON("reed_last",null), lp=L&&lessonOf(L.id);
    if(lp&&L.k&&hasLessons(L.k)) h+=chip({type:"lesson",id:lp.id,k:L.k,title:lp.topic});
    const r=recent().slice(0,3);
    if(r.length) h+=r.map(q=>qChip(q,"sg-recent c-rec")).join("")+`<button type="button" class="sgChip sg-clear" data-a="clear" aria-label="Clear recent searches"><span class="sgTx">✕</span></button>`;
    const tg=Search.popularTags(idx,6,"sit");
    if(tg.length) h+=tg.map(t=>qChip(t.label,"c-tag")).join("");
    h+=TOPICS.filter(t=>hasLessons(t.k)).map(t=>chip({type:"topic",k:t.k,title:t.label})).join("");
    return h;
  }
  function resultsHTML(q){
    const idx=searchIdx(), r=Search.search(idx,q,{read:readSet,max:{topics:3,lessons:6,tags:4}});
    const all=[].concat(r.topics,r.lessons,r.tags);
    if(!all.length){
      const tg=Search.popularTags(idx,5,"sit");
      return `<span class="sgNone">No match</span>`+(tg.length?tg.map(t=>qChip(t.label,"c-tag")).join(""):"");
    }
    return all.map(chip).join("");
  }
  function render(){
    const q=inp.value;
    sug.innerHTML=q.trim()?resultsHTML(q):homeHTML();
    sug.scrollLeft=0;
    box.classList.toggle("hasv",!!q);
  }
  function setOpen(on){
    if(on===open) return;
    if(on&&typeof Tour!=="undefined"&&(Tour.active||Tour.welcomeOpen)) return;
    open=on;
    if(on){
      sug.style.setProperty("--sgh",(topics.offsetHeight||0)+"px");   /* hàng gợi ý cao bằng thanh chủ đề: header không nhảy */
      document.body.classList.add("sbxOn"); render();
    } else {
      document.body.classList.remove("sbxOn"); inp.value=""; box.classList.remove("hasv"); if(document.activeElement===inp) inp.blur();
      sug.innerHTML="";
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
  function submit(){
    const first=sug.querySelector(".sgChip:not([data-a=q]):not([data-a=clear])");
    if(inp.value.trim()&&first){ act(first); return; }
    if(inp.value.trim()) addRecent(inp.value); else setOpen(false);
  }
  inp.addEventListener("focus",()=>setOpen(true));
  inp.addEventListener("input",()=>{ box.classList.toggle("hasv",!!inp.value); clearTimeout(qT); qT=setTimeout(render,80); });
  inp.addEventListener("keydown",e=>{
    if(e.key==="Enter"){ e.preventDefault(); submit(); }
    else if(e.key==="ArrowDown"){ const c=sug.querySelector(".sgChip"); if(c){ e.preventDefault(); c.focus(); } }
  });
  sug.addEventListener("keydown",e=>{
    const all=[...sug.querySelectorAll(".sgChip")], i=all.indexOf(document.activeElement); if(i<0) return;
    if(e.key==="ArrowRight"&&all[i+1]){ e.preventDefault(); all[i+1].focus(); }
    else if(e.key==="ArrowLeft"){ e.preventDefault(); (all[i-1]||inp).focus(); }
    else if(e.key==="ArrowUp"){ e.preventDefault(); inp.focus(); }
  });
  sug.addEventListener("click",e=>{ const b=e.target.closest("[data-a]"); if(b) act(b); });
  /* chạm chip không làm ô mất focus (bàn phím không nháy) */
  sug.addEventListener("pointerdown",e=>{ if(e.target.closest(".sgChip")&&e.pointerType!=="mouse"&&document.activeElement===inp) e.preventDefault(); });
  document.getElementById("sbGo").addEventListener("click",e=>{ e.preventDefault(); if(!open){ inp.focus({preventScroll:true}); return; } submit(); });
  document.addEventListener("pointerdown",e=>{ if(open&&!sbx.contains(e.target)) setOpen(false); },true);
  addEventListener("keydown",e=>{ if(open&&e.key==="Escape"){ e.stopPropagation(); setOpen(false); } },true);
  addEventListener("keydown",e=>{   /* "/" mở ô tìm kiếm khi đang duyệt (không đang gõ ở ô nào) */
    if(e.key!=="/"||e.ctrlKey||e.metaKey||e.altKey||open) return;
    if(e.target.closest&&e.target.closest("input,textarea,select,[contenteditable]")) return;
    if(!box.getClientRects().length) return;
    e.preventDefault(); inp.focus({preventScroll:true});
  });
  /* rời màn hình duyệt (vào bài / mở story) thì đóng gợi ý */
  new MutationObserver(()=>{ if(open&&!box.getClientRects().length) setOpen(false); }).observe(document.body,{attributes:true,attributeFilter:["class"]});
  const api={isOpen:()=>open,open:()=>{ inp.focus({preventScroll:true}); setOpen(true); },close:()=>setOpen(false),render,get input(){ return inp; },get sug(){ return sug; }};
  window.__sov=api; return api;
})();
