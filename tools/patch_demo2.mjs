// Hero demo: hai thẻ (chó, mèo) hiện cùng lúc, mỗi thẻ tự lặp A1⇄A2. Chạy: node tools/patch_demo2.mjs
import fs from 'fs';
let s=fs.readFileSync('index.html','utf8').replace(/\r\n/g,'\n');
const rep=(a,b)=>{ const n=s.split(a).length-1; if(n!==1) throw new Error('match '+n+': '+a.slice(0,70)); s=s.replace(a,()=>b); };
// CSS
rep(`.heroDemo{width:min(460px,100%);box-sizing:border-box;margin-top:24px;padding:14px 16px 16px;border-radius:28px;container-type:inline-size;`,
`.heroDemo{display:flex;flex-direction:column;gap:14px;width:min(460px,100%);box-sizing:border-box}
.dmCard{box-sizing:border-box;padding:14px 16px 16px;border-radius:28px;container-type:inline-size;`);
rep(`.dmStage{display:grid;margin-top:6px}
.dmEx{grid-area:1/1;display:grid;grid-template-columns:minmax(0,1fr) 42%;align-items:center;gap:1%;opacity:0;visibility:hidden}
.dmEx.on{opacity:1;visibility:visible}
.heroDemo .dmLine{`,`.dmEx{display:grid;grid-template-columns:minmax(0,1fr) 42%;align-items:center;gap:1%;margin-top:2px}
.dmCard .dmLine{`);
rep(`.hero>.heroDemo:not(.snap):not(.heroImg){width:100%;max-width:460px;padding:12px 14px 14px} }`,
`.hero>.heroDemo:not(.snap):not(.heroImg){width:100%;max-width:460px;gap:12px} .dmCard{padding:10px 14px 10px} .dmEx{grid-template-columns:minmax(0,1fr) 36%} }`);
rep(`@media (max-width:820px) and (max-height:600px){ .dmTop{display:none} }`,
`@media (max-width:820px) and (max-height:700px){ .dmTop{display:none} .dmEx{grid-template-columns:minmax(0,1fr) 32%} .hero{padding-top:140px;padding-bottom:100px} .hero>.heroDemo:not(.snap):not(.heroImg){gap:8px} }`);
// HTML
const h0=s.indexOf('  <div class="heroDemo" id="heroDemo"'), h1=s.indexOf('  <button class="heroCta"');
s=s.slice(0,h0)+`  <div class="heroDemo" id="heroDemo" role="button" tabindex="0" aria-label="Word to Word examples: baby dog becomes puppy, baby cat becomes kitten. Open lessons"></div>\n`+s.slice(h1);
// JS
const j0=s.indexOf('/*DEMO-BEGIN*/'), j1=s.indexOf('/*DEMO-END*/');
const js=`/*DEMO-BEGIN*/
/* ---------- Hero demo: hai thẻ Word to Word (chó, mèo) hiện cùng lúc. Chữ là .ph thật (setPhrase), mỗi thẻ tự lặp A1 → A2 → A1 theo thời gian;
   chỉ transform/opacity; đứng yên khi tab ẩn / ngoài màn hình; LITE: đổi chữ tức thì, không hiệu ứng ảnh; giảm chuyển động: không tự chạy, chạm cụm để đổi ---------- */
const HeroDemo=(function(){
  const root=document.getElementById("heroDemo"); if(!root) return {};
  const EX=[
    {pre:"I have a ",a:["baby dog","puppy"],img:"img/dm-dog.webp",h:337,blob:"#cfe2ff",spark:"#4433ff",delay:350},
    {pre:"I have a ",a:["baby cat","kitten"],img:"img/dm-cat.webp",h:380,blob:"#e0d8ff",spark:"#7b5cff",delay:900}
  ];
  const BLOB="M44 50C70 12 134 6 166 40c30 32 36 80 12 114-24 34-76 44-112 22C28 154 14 88 44 50Z";
  const reduce=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
  const instant=()=>LITE||reduce();
  const ARROW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
  const E="cubic-bezier(.2,.8,.2,1)";
  let vis=false;
  const playing=()=>!document.hidden&&vis&&!reduce();
  const cards=EX.map((e,i)=>{
    const el=document.createElement("div"); el.className="dmCard";
    el.innerHTML='<div class="dmTop"><span class="dmChip">A1 '+ARROW+' A2</span><span class="dmTag">Word to Word</span></div>'+
      '<div class="dmEx"><p class="dmLine">'+e.pre+'<span class="ph"><span class="bg"></span><span class="o">'+e.a[0]+'</span><span class="o">'+e.a[1]+'</span></span>.</p>'+
      '<div class="dmArt"><svg class="dmBlob" viewBox="0 0 200 200" aria-hidden="true"><path d="'+BLOB+'" fill="'+e.blob+'"/></svg>'+
      '<img class="dmAnimal" src="'+e.img+'" alt="" width="380" height="'+e.h+'" draggable="false" decoding="async">'+
      '<svg class="dmSpark" viewBox="0 0 60 60" aria-hidden="true" stroke="'+e.spark+'"><line x1="30" y1="6" x2="30" y2="20"/><line x1="46" y1="12" x2="38" y2="22"/><line x1="52" y1="30" x2="40" y2="30"/></svg></div></div>';
    root.appendChild(el);
    const c={e,el,ph:el.querySelector(".ph"),blob:el.querySelector(".dmBlob"),pet:el.querySelector(".dmAnimal"),sp:[...el.querySelectorAll(".dmSpark line")],T:0,due:null,left:0,t0:0,entered:false,tg:0};
    c.ph._f=0; c.ph._floor=0;
    c.ph.addEventListener("click",ev=>{ ev.stopPropagation(); c.tg=c.ph._f<.5?1:0; roll(c,c.tg); });
    return c;
  });
  function measure(){
    const rg=document.createRange();
    cards.forEach(c=>{ c.ph._w=[...c.ph.querySelectorAll(".o")].map(o=>{ rg.selectNodeContents(o); return rg.getBoundingClientRect().width; }); setPhrase(c.ph,c.ph._f); });
  }
  function roll(c,t){
    const ph=c.ph; cancelAnimationFrame(ph._raf);
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
  function enter(c){
    if(instant()) return;
    c.blob.animate([{transform:"scale(.5) rotate(-10deg)",opacity:0},{transform:"none",opacity:1}],{duration:640,easing:E,fill:"both"});
    c.pet.animate([{transform:"translateY(16%) scale(.96)",opacity:0},{transform:"translateY(-3%) scale(1.01)",opacity:1,offset:.68},{transform:"none",opacity:1}],{duration:720,delay:90,easing:E,fill:"both"});
    c.sp.forEach((l,i)=>l.animate([{opacity:0,transform:"scale(.3)"},{opacity:1,transform:"none"}],{duration:260,delay:420+i*80,easing:E,fill:"both"}));
  }
  function arm(c){ clearTimeout(c.T); c.T=0; if(!c.due||!playing()) return; c.t0=performance.now(); c.T=setTimeout(()=>{ const f=c.due; c.due=null; f(); },c.left); }
  function sched(c,f,ms){ c.due=f; c.left=ms; arm(c); }
  function pause(c){ if(c.due&&c.T) c.left=Math.max(0,c.left-(performance.now()-c.t0)); clearTimeout(c.T); c.T=0; }
  /* vòng lặp một thẻ: vào → giữ A1 → cuộn A2 → giữ → cuộn lại A1 → giữ → … */
  function toA2(c){ c.tg=1; roll(c,1); sched(c,toA1,3100); }
  function toA1(c){ c.tg=0; roll(c,0); sched(c,()=>toA2(c),1900); }
  function start(c){ if(!c.entered){ c.entered=true; sched(c,()=>{ enter(c); sched(c,()=>toA2(c),1700); },c.e.delay); } }
  root.addEventListener("click",()=>document.getElementById("startBtn").click());
  root.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); document.getElementById("startBtn").click(); } });
  function boot(){ measure(); if(reduce()) return; cards.forEach(start); }
  if("IntersectionObserver" in window){
    new IntersectionObserver(es=>{ vis=es[es.length-1].isIntersecting; if(vis){ boot(); cards.forEach(arm); } else cards.forEach(pause); },{threshold:.15}).observe(root);
  } else { vis=true; boot(); }
  document.addEventListener("visibilitychange",()=>{ if(document.hidden) cards.forEach(pause); else cards.forEach(arm); });
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(measure);
  let rt=0; addEventListener("resize",()=>{ clearTimeout(rt); rt=setTimeout(measure,120); });
  return {cards,measure};
})();
`;
s=s.slice(0,j0)+js+s.slice(j1);
fs.writeFileSync('index.html',s);
console.log('ok');
