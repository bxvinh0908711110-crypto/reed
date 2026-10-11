import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8810);
const b=await chromium.launch();
for(const [name,opts] of [['13',devices['iPhone 13']],['d1280',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto('http://localhost:8810/index.html'); await p.waitForTimeout(5000);
  // nạp sổ tay mẫu từ dữ liệu thật của app
  await p.evaluate(()=>{ const items=[]; let t=Date.now(); ALL.filter(x=>x.id>0).forEach(l=>l.hl.slice(0,2).forEach(h=>{ items.push({key:nbKey(h.o,h.u),base:h.o,upgraded:h.u,level:h.lv,meaning:h.vn,example:h.ex,topic:l.topic,category:nbCategory(h.u),savedAt:t-=3600e3*7}); })); items[0].learned=true; items[3].learned=true; nbSaveAll(items); nbRenderCount(); });
  await p.evaluate(()=>nbOpen()); await p.waitForTimeout(900);
  const info=()=>p.evaluate(()=>({sub:nbSub.textContent,pct:nbPct.textContent,count:nbCountTxt.textContent,tabs:[...document.querySelectorAll('.nbTab')].map(t=>t.textContent),cards:document.querySelectorAll('.nbItem').length,kinds:[...document.querySelectorAll('.nbKind')].map(k=>k.textContent).slice(0,6)}));
  console.log(name,'mở',await info());
  await p.screenshot({path:`tools/pw/shots/nb1_${name}.png`});
  await p.evaluate(()=>document.querySelector('.nbTab[data-tab="phrasal"]').click()); await p.waitForTimeout(500); console.log(' tab Phrasal',await info());
  await p.evaluate(()=>document.querySelector('.nbTab[data-tab="all"]').click()); await p.waitForTimeout(300);
  await p.fill('#nbSearch','bo me'); await p.waitForTimeout(500); console.log(' tìm "bo me" (không dấu)',(await info()).cards,await p.evaluate(()=>[...document.querySelectorAll('.nbItem .up')].map(e=>e.textContent)));
  await p.fill('#nbSearch','zzz'); await p.waitForTimeout(400); console.log(' tìm zzz',await p.evaluate(()=>nbBody.textContent.trim().slice(0,40)));
  await p.fill('#nbSearch',''); await p.waitForTimeout(400);
  await p.selectOption('#nbSort','az'); await p.waitForTimeout(500); console.log(' A–Z',await p.evaluate(()=>[...document.querySelectorAll('.nbItem .up')].slice(0,5).map(e=>e.textContent)));
  const before=await info(); await p.evaluate(()=>document.querySelectorAll('.nbLearn')[5].click()); await p.waitForTimeout(300); console.log(' đã thuộc +1:',before.sub,'→',(await info()).sub,(await info()).pct);
  await p.screenshot({path:`tools/pw/shots/nb1_${name}_b.png`});
  // nhảy về bài nguồn (chủ đề khác)
  await p.evaluate(()=>{ setTopic('tech'); });
  await p.evaluate(()=>{ const it=nbLoad().find(x=>x.topic==='My Family'); nbGoSource(it.key); }); await p.waitForTimeout(1500);
  console.log(' nhảy nguồn →',await p.evaluate(()=>({topic:curTopic,scrollY:Math.round(scrollY),active:active,nbHidden:notebook.hidden,away:player.classList.contains('away')})));
  console.log(' lỗi JS',errs);
  await ctx.close();
}
await b.close(); srv.close();
