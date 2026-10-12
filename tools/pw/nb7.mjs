import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8817);
const b=await chromium.launch();
for(const [name,opts] of [['13',devices['iPhone 13']],['SE',devices['iPhone SE']],['d1280',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1')}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto('http://localhost:8817/index.html'); await p.waitForTimeout(5000);
  const seed=n=>p.evaluate(n=>{ const items=[]; ALL.filter(x=>x.id>0).forEach((l,i)=>l.hl.forEach((h,k)=>items.push({key:nbKey(h.o,h.u),base:h.o,upgraded:h.u,level:h.lv,meaning:h.vn,example:h.ex,topic:l.topic,category:nbCategory(h.u),savedAt:Date.now()-i*36e5-k*1000}))); nbSaveAll(items.slice(0,n)); nbRenderCount(); nbPeeked=true; nbOpen(); },n);
  await seed(40); await p.waitForTimeout(900);
  const m=()=>p.evaluate(()=>({scrolled:notebook.classList.contains('scrolled'),headH:Math.round(document.querySelector('.nbFold').getBoundingClientRect().height),tabsTop:Math.round(document.querySelector('.nbTabs').getBoundingClientRect().top),bodyH:nbBody.clientHeight,top:nbBody.scrollTop}));
  console.log(name,'mở',await m()); await p.screenshot({path:`tools/pw/shots/nb7_${name}_a.png`});
  for(const y of [60,140,260]){ await p.evaluate(y=>{nbBody.scrollTop=y},y); await p.waitForTimeout(120); }
  await p.waitForTimeout(500); console.log(' cuộn xuống',await m()); await p.screenshot({path:`tools/pw/shots/nb7_${name}_b.png`});
  await p.evaluate(()=>{nbBody.scrollTop-=40}); await p.waitForTimeout(500); console.log(' cuộn lên chút',await m());
  await p.evaluate(()=>{nbBody.scrollTop=0}); await p.waitForTimeout(500); console.log(' về đầu',await m());
  await ctx.close();
  // danh sách ngắn: không gập
  const c2=await b.newContext(opts); await c2.addInitScript(()=>{localStorage.setItem('reed_tour_done','1')}); await c2.route('**/*supabase.co/**',r=>r.abort());
  const q=await c2.newPage(); await q.goto('http://localhost:8817/index.html'); await q.waitForTimeout(5000);
  await q.evaluate(()=>{ const items=[]; ALL.filter(x=>x.id>0).slice(0,1).forEach(l=>l.hl.slice(0,2).forEach((h,k)=>items.push({key:nbKey(h.o,h.u),base:h.o,upgraded:h.u,level:h.lv,meaning:h.vn,example:h.ex,topic:l.topic,category:nbCategory(h.u),savedAt:Date.now()-k}))); nbSaveAll(items); nbPeeked=true; nbOpen(); });
  await q.waitForTimeout(800); await q.evaluate(()=>{nbBody.scrollTop=200}); await q.waitForTimeout(500);
  console.log(' danh sách ngắn, cuộn:',await q.evaluate(()=>notebook.classList.contains('scrolled')),'| lỗi JS',errs); await c2.close();
}
await b.close(); srv.close();
