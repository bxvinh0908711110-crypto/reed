// Hero: thêm lại tiêu đề "Read English, [speak] better."; một "nhạc trưởng" (Conductor) chia lượt đổi chữ để các phần không đổi cùng lúc. Chạy: node tools/patch_demo3.mjs
import fs from 'fs';
let s=fs.readFileSync('index.html','utf8').replace(/\r\n/g,'\n');
const rep=(a,b)=>{ const n=s.split(a).length-1; if(n!==1) throw new Error('match '+n+': '+a.slice(0,70)); s=s.replace(a,()=>b); };
// HTML + CSS
rep('<h1>You read to<br>','<h1>Read English,<br>');
rep('.hero>h1,.hero>p,.hero>.heroCta{display:none}','.hero>p,.hero>.heroCta{display:none}\n.hero>h1{width:min(520px,100%);font-size:clamp(40px,11vw,56px);margin:0 0 22px}\n@media (min-width:1101px){ .hero>h1{width:min(980px,82vw);font-size:clamp(40px,4.4vw,64px);margin-bottom:26px} }');
rep('Hero = chỉ thẻ demo ở giữa. Tiêu đề, câu mô tả, nút Start Reading đã bỏ khỏi trang chủ','Hero = tiêu đề "Read English, [speak] better." + hai thẻ demo. Câu mô tả, nút Start Reading đã bỏ khỏi trang chủ');
// Conductor + tiêu đề xoay chữ theo lượt 2
rep(`/* ---------- Khởi động ---------- */`,`/* ---------- Nhạc trưởng: một nhịp 1s, 6 lượt; mỗi lượt chỉ MỘT thứ đổi chữ nên trang chủ không đổi đồng loạt.
   lượt 0 và 3: thẻ chó, 1 và 4: thẻ mèo, 2: chữ xoay trong tiêu đề, 5: câu gợi ý trong ô tìm kiếm ---------- */
const Conductor=(function(){
  const H=[[],[],[],[],[],[]], log=[]; let n=0;
  setInterval(()=>{
    if(document.hidden) return;
    const k=n++%6; log.push([k,Math.round(performance.now())]); if(log.length>60) log.shift();
    H[k].forEach(f=>{ try{ f(); }catch(e){} });
  },1000);
  return {on:(k,f)=>{ (Array.isArray(k)?k:[k]).forEach(i=>H[i].push(f)); },log};
})();
/* ---------- Khởi động ---------- */`);
rep(`  setInterval(()=>{ w.classList.add("out"); setTimeout(()=>{ i=(i+1)%words.length; w.textContent=words[i]; w.classList.remove("out"); },280); },2400);`,
    `  Conductor.on(2,()=>{ if(!w.getClientRects().length) return; w.classList.add("out"); setTimeout(()=>{ i=(i+1)%words.length; w.textContent=words[i]; w.classList.remove("out"); },280); });`);
rep(`  setInterval(tick,3400);`,`  Conductor.on(5,tick);`);
// HeroDemo: bỏ bộ hẹn giờ riêng, dùng Conductor
const a=s.indexOf('  function arm(c){'), b=s.indexOf('  root.addEventListener("click",()=>document.getElementById("startBtn")');
s=s.slice(0,a)+`  /* lượt của Conductor: thẻ chó 0 và 3, thẻ mèo 1 và 4; mỗi lượt đảo A1 ⇄ A2 */
  function flip(c){ if(!c.ready||!playing()) return; c.tg=c.ph._f<.5?1:0; roll(c,c.tg); }
  Conductor.on([0,3],()=>flip(cards[0])); Conductor.on([1,4],()=>flip(cards[1]));
  function start(c){ if(c.entered) return; c.entered=true; setTimeout(()=>{ enter(c); setTimeout(()=>{ c.ready=true; },900); },c.e.delay); }
`+s.slice(b);
rep(`    new IntersectionObserver(es=>{ vis=es[es.length-1].isIntersecting; if(vis){ boot(); cards.forEach(arm); } else cards.forEach(pause); },{threshold:.15}).observe(root);`,
    `    new IntersectionObserver(es=>{ vis=es[es.length-1].isIntersecting; if(vis) boot(); },{threshold:.15}).observe(root);`);
rep(`  document.addEventListener("visibilitychange",()=>{ if(document.hidden) cards.forEach(pause); else cards.forEach(arm); });\n`,'');
rep(`  function boot(){ measure(); if(reduce()) return; cards.forEach(start); }`,`  function boot(){ measure(); if(reduce()) return; cards.forEach(start); }`);
rep(`delay:900}`,`delay:1000}`);
rep(`/* ---------- Hero demo: hai thẻ Word to Word (chó, mèo) hiện cùng lúc. Chữ là .ph thật (setPhrase), mỗi thẻ tự lặp A1 → A2 → A1 theo thời gian;`,`/* ---------- Hero demo: hai thẻ Word to Word (chó, mèo) hiện cùng lúc. Chữ là .ph thật (setPhrase); mỗi thẻ đảo A1 ⇄ A2 theo lượt của Conductor (so le nhau, 3s/lần);`);
fs.writeFileSync('index.html',s);
console.log('ok');
