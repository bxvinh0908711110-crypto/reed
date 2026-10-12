import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8813);
const b=await chromium.launch();
for(const [name,opts] of [['13',devices['iPhone 13']],['SE',devices['iPhone SE']],['d1280',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto('http://localhost:8813/index.html'); await p.waitForTimeout(5000);
  await p.evaluate(()=>{ const items=[]; const now=Date.now(); ALL.filter(x=>x.id>0).slice(0,6).forEach((l,i)=>l.hl.slice(0,3).forEach((h,k)=>items.push({key:nbKey(h.o,h.u),base:h.o,upgraded:h.u,level:h.lv,meaning:h.vn,example:h.ex,topic:l.topic,category:nbCategory(h.u),savedAt:now-i*36e5*7-k*1000}))); items[0].learned=true; nbSaveAll(items); nbRenderCount(); nbOpen(); });
  await p.waitForTimeout(500);
  const f=()=>p.evaluate(()=>{const ph=document.querySelector('#nbBody .nbph');return {f:+(ph._f||0).toFixed(2),lv:document.querySelector('#nbBody .nbLv').textContent,w:Math.round(parseFloat(ph.style.width)||0)}});
  console.log(name,'t=500ms (trước khi tự đổi)',await f());
  await p.waitForTimeout(1100); console.log('  t≈1600ms (tự đổi sang A2)',await f());
  await p.waitForTimeout(1800); console.log('  t≈3400ms (tự quay về A1)',await f());
  await p.screenshot({path:`tools/pw/shots/nb4_${name}_a.png`});
  await p.evaluate(()=>document.querySelectorAll('#nbBody .nbph')[1].click()); await p.waitForTimeout(800);
  console.log('  chạm cụm thứ 2 →',await p.evaluate(()=>{const ph=document.querySelectorAll('#nbBody .nbph')[1];return {f:ph._f,lv:ph.closest('.nbItem').querySelector('.nbLv').textContent,color:getComputedStyle(ph).color}}));
  const h0=await p.evaluate(()=>document.querySelectorAll('#nbBody .nbItem')[0].offsetHeight);
  await p.evaluate(()=>document.querySelectorAll('#nbBody .nbItem')[0].querySelector('.nbMoreBtn').click()); await p.waitForTimeout(600);
  console.log('  chạm thẻ → mở nghĩa: cao',h0,'→',await p.evaluate(()=>document.querySelectorAll('#nbBody .nbItem')[0].offsetHeight));
  await p.screenshot({path:`tools/pw/shots/nb4_${name}_b.png`});
  // cụm dài có vừa thẻ không
  console.log('  cụm dài vừa thẻ:',await p.evaluate(()=>[...document.querySelectorAll('#nbBody .nbph')].map(ph=>{const box=ph.parentElement;const r=ph.getBoundingClientRect(),br=box.getBoundingClientRect();return r.right<=br.right+1?null:Math.round(r.right-br.right)+'px tràn '+ph.textContent.slice(0,30)}).filter(Boolean)),'| canvas hạt còn:',await p.evaluate(()=>document.querySelectorAll('#nbBody canvas').length),'| lỗi',errs);
  await ctx.close();
}
await b.close(); srv.close();
