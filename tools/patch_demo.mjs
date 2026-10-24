// Hero demo "Word to Word": thẻ ví dụ A1→A2 (chó / mèo) thay ảnh người đọc sách. Chạy: node tools/patch_demo.mjs
import fs from 'fs';
const F='index.html';
let s=fs.readFileSync(F,'utf8').split('\r\n').join('\n');
const rep=(a,b)=>{ const n=s.split(a).length-1; if(n!==1) throw new Error('match '+n+': '+a.slice(0,60)); s=s.replace(a,()=>b); };

/* ---- CSS ---- */
rep(`.hero p{font-size:clamp(16px,1.6vw,22px);color:var(--muted);max-width:30em;margin:0;line-height:1.5}`,
`.hero p{font-size:clamp(16px,1.6vw,22px);color:var(--muted);max-width:30em;margin:0;line-height:1.5}
/* ---- Hero demo: thẻ ví dụ Word to Word (chó / mèo), chữ dùng cơ chế .ph của bài học ---- */
.hero>.heroImg{display:none}
.heroDemo{width:min(460px,100%);box-sizing:border-box;margin-top:24px;padding:14px 16px 16px;border-radius:28px;container-type:inline-size;
  background:linear-gradient(180deg,#fcfdff,#f1f5ff);border:1px solid rgba(27,59,255,.07);box-shadow:0 16px 36px rgba(40,60,140,.09)}
.dmTop{display:flex;justify-content:space-between;align-items:center;gap:8px}
.dmChip,.dmTag{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;font-size:13px;line-height:1.2;white-space:nowrap}
.dmChip{background:#e8edff;color:#1d2433;font-weight:700}
.dmChip svg{width:12px;height:12px}
.dmTag{background:#eceaff;color:#6a68b8;font-weight:500}
.dmStage{display:grid;margin-top:6px}
.dmEx{grid-area:1/1;display:grid;grid-template-columns:minmax(0,1fr) 36%;align-items:center;gap:2%;opacity:0;visibility:hidden}
.dmEx.on{opacity:1;visibility:visible}
.dmLine{margin:0;max-width:none;min-width:0;font-size:min(30px,6.3cqw);line-height:1.22;letter-spacing:-.035em;font-weight:500;color:#3b3b3b;white-space:nowrap}
.dmArt{position:relative;aspect-ratio:1/1;width:100%}
.dmBlob{position:absolute;left:2%;bottom:0;width:96%;height:96%;transform-origin:50% 60%}
.dmAnimal{position:absolute;left:4%;bottom:0;width:92%;height:auto;transform-origin:50% 100%;pointer-events:none;user-select:none}
.dmSpark{position:absolute;left:-2%;top:-4%;width:34%;height:auto;overflow:visible}
.dmSpark line{stroke-linecap:round;stroke-width:5;transform-box:fill-box;transform-origin:center}
@media (min-width:1101px){
  .hero>.heroDemo:not(.snap):not(.heroImg){position:absolute;right:6vw;top:50%;margin:0;transform:translateY(-44%);width:min(440px,34vw)}
}
@media (max-width:1100px){ .heroDemo{margin-top:22px} }
@media (max-width:820px){ .heroDemo{margin-top:20px;width:100%;max-width:440px} .heroCta{margin-top:22px} }
.hero.heroRise .heroDemo{animation:heroIn .6s .1s cubic-bezier(.2,.8,.2,1) both}`);
rep(`  .hero.heroRise .heroImg{animation-name:heroImgInSoft}
}`,`  .hero.heroRise .heroImg{animation-name:heroImgInSoft}
  .hero.heroRise .heroDemo{animation-name:heroInSoft}
}`);
rep(`html.lite .hero.heroRise .heroImg{animation-name:heroImgInSoft}`,`html.lite .hero.heroRise .heroImg{animation-name:heroImgInSoft}
html.lite .hero.heroRise .heroDemo{animation-name:heroInSoft}`);

/* ---- HTML ---- */
rep(`  <p>Simple. Word to Word. Easy and Fun.</p>
  <button class="heroCta"`,`  <p>Simple. Word to Word. Easy and Fun.</p>
  <div class="heroDemo" id="heroDemo" role="img" aria-label="Example: I have a baby dog becomes I have a puppy">
    <div class="dmTop"><span class="dmChip">A1 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg> A2</span><span class="dmTag">Word to Word</span></div>
    <div class="dmStage" id="dmStage"></div>
  </div>
  <button class="heroCta"`);
rep(`src="img/hero.webp" srcset="img/hero-sm.webp 640w, img/hero.webp 1200w" sizes="(max-width:820px) 135vw, 62vw" width="1200" height="566" alt="" aria-hidden="true" fetchpriority="high" decoding="async"`,
    `src="img/hero.webp" srcset="img/hero-sm.webp 640w, img/hero.webp 1200w" sizes="(max-width:820px) 135vw, 62vw" width="1200" height="566" alt="" aria-hidden="true" loading="lazy" decoding="async"`);

/* ---- JS ---- */
rep(`})();
/*SEARCH-BEGIN*/`,`})();
/*DEMO-BEGIN*/
/* ---------- Hero demo: ví dụ Word to Word (chó ↔ mèo). Chữ là .ph thật (setPhrase), tự chạy theo thời gian; chỉ transform/opacity;
   đứng yên khi tab ẩn / thẻ ngoài màn hình; LITE: đổi tức thì, không hiệu ứng ảnh; giảm chuyển động: không tự chạy, chạm để đổi ---------- */
const HeroDemo=(function(){
  const root=document.getElementById("heroDemo"), stage=document.getElementById("dmStage"); if(!root||!stage) return {};
  const EX=[
    {pre:"I have a ",a:["baby dog","puppy"],img:"img/dm-dog.webp",blob:"#cfe2ff",spark:"#4433ff"},
    {pre:"I have a ",a:["baby cat","kitten"],img:"img/dm-cat.webp",blob:"#e0d8ff",spark:"#7b5cff"}
  ];
  const BLOB="M44 50C70 12 134 6 166 40c30 32 36 80 12 114-24 34-76 44-112 22C28 154 14 88 44 50Z";
  const reduce=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
  const instant=()=>LITE||reduce();
  const sc=EX.map((e,i)=>{
    const el=document.createElement("div"); el.className="dmEx"; if(i===0) el.classList.add("on");
    el.innerHTML='<p class="dmLine">'+e.pre+'<span class="ph" data-dm="'+i+'"><span class="bg"></span><span class="o">'+e.a[0]+'</span><span class="o">'+e.a[1]+'</span></span>.</p>'+
      '<div class="dmArt"><svg class="dmBlob" viewBox="0 0 200 200" aria-hidden="true"><path d="'+BLOB+'" fill="'+e.blob+'"/></svg>'+
      '<img class="dmAnimal" src="'+e.img+'" alt="" width="360" height="360" draggable="false" decoding="async">'+
      '<svg class="dmSpark" viewBox="0 0 60 60" aria-hidden="true" stroke="'+e.spark+'"><line x1="30" y1="6" x2="30" y2="20"/><line x1="46" y1="12" x2="38" y2="22"/><line x1="52" y1="30" x2="40" y2="30"/></svg></div>';
    stage.appendChild(el);
    const ph=el.querySelector(".ph"); ph._f=0; ph._floor=0;
    ph.addEventListener("click",()=>{ ph._tg=ph._f<.5?1:0; roll(ph,ph._tg); });
    return {el,ph,blob:el.querySelector(".dmBlob"),pet:el.querySelector(".dmAnimal"),sp:[...el.querySelectorAll(".dmSpark line")]};
  });
  function measure(){
    const rg=document.createRange();
    sc.forEach(x=>{ x.ph._w=[...x.ph.querySelectorAll(".o")].map(o=>{ rg.selectNodeContents(o); return rg.getBoundingClientRect().width; }); setPhrase(x.ph,x.ph._f); });
  }
  function roll(ph,t){
    cancelAnimationFrame(ph._raf);
    if(!ph._w) return;
    if(instant()){ ph._f=t; setPhrase(ph,t); return; }
    let last=performance.now();
    const tick=now=>{
      const dt=Math.min(now-last,64); last=now;
      ph._f+=(t-ph._f)*(1-Math.exp(-dt/PH_TAU()));
      if(Math.abs(t-ph._f)<.003){ ph._f=t; setPhrase(ph,t); return; }
      setPhrase(ph,ph._f); ph._raf=requestAnimationFrame(tick);
    };
    ph._raf=requestAnimationFrame(tick);
  }
  const E="cubic-bezier(.2,.8,.2,1)";
  function enter(x){
    if(instant()) return;
    x.blob.animate([{transform:"scale(.5) rotate(-10deg)",opacity:0},{transform:"none",opacity:1}],{duration:640,easing:E,fill:"both"});
    x.pet.animate([{transform:"translateY(16%) scale(.96)",opacity:0},{transform:"translateY(-3%) scale(1.01)",opacity:1,offset:.68},{transform:"none",opacity:1}],{duration:720,delay:90,easing:E,fill:"both"});
    x.sp.forEach((l,i)=>l.animate([{opacity:0,transform:"scale(.3)"},{opacity:1,transform:"none"}],{duration:260,delay:420+i*80,easing:E,fill:"both"}));
  }
  let cur=0, T=0, due=null, left=0, t0=0;
  const playing=()=>!document.hidden&&vis&&!reduce();
  function arm(){ clearTimeout(T); if(!due||!playing()) return; t0=performance.now(); T=setTimeout(()=>{ const f=due; due=null; f(); },left); }
  function sched(f,ms){ due=f; left=ms; arm(); }
  function pause(){ if(due&&T){ left=Math.max(0,left-(performance.now()-t0)); } clearTimeout(T); T=0; }
  function show(i){
    cur=i; const x=sc[i]; x.ph._f=0; setPhrase(x.ph,0); x.ph._tg=0;
    x.el.classList.add("on"); if(!instant()) x.el.animate([{opacity:0},{opacity:1}],{duration:260,easing:"ease",fill:"none"});
    enter(x);
    sched(()=>{ roll(x.ph,1); x.ph._tg=1; sched(leave,3100); },1700);
  }
  function leave(){
    const x=sc[cur], n=(cur+1)%sc.length;
    if(instant()){ x.el.classList.remove("on"); show(n); return; }
    x.el.animate([{opacity:1},{opacity:0}],{duration:240,easing:"ease",fill:"none"});
    sched(()=>{ x.el.classList.remove("on"); show(n); },240);
  }
  let vis=false, started=false;
  function boot(){
    measure();
    if(started) return; started=true;
    if(reduce()) return;
    sched(()=>{ enter(sc[0]); sched(()=>{ roll(sc[0].ph,1); sc[0].ph._tg=1; sched(leave,3100); },1700); },350);
  }
  if("IntersectionObserver" in window){
    new IntersectionObserver(es=>{ vis=es[es.length-1].isIntersecting; if(vis){ if(!started) boot(); arm(); } else pause(); },{threshold:.2}).observe(root);
  } else { vis=true; }
  document.addEventListener("visibilitychange",()=>{ if(document.hidden) pause(); else arm(); });
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>{ measure(); if(vis&&!started) boot(); });
  addEventListener("resize",()=>{ clearTimeout(HeroDemo._rt); HeroDemo._rt=setTimeout(measure,120); });
  return {sc,measure,get cur(){ return cur; }};
})();
/*DEMO-END*/
/*SEARCH-BEGIN*/`);

fs.writeFileSync(F,s.split('\n').join('\r\n'));
console.log('ok');
