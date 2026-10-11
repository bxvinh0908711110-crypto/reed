import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8815);
const b=await chromium.launch();
for(const reduced of ['no-preference','reduce']){
  const ctx=await b.newContext({...devices['iPhone 13'],reducedMotion:reduced}); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1')}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); await p.goto('http://localhost:8815/index.html'); await p.waitForTimeout(5000);
  await p.evaluate(()=>{ const items=[]; ALL.filter(x=>x.id>0).slice(0,2).forEach((l,i)=>l.hl.slice(0,3).forEach((h,k)=>items.push({key:nbKey(h.o,h.u),base:h.o,upgraded:h.u,level:h.lv,meaning:h.vn,example:h.ex,topic:l.topic,category:nbCategory(h.u),savedAt:Date.now()-k*1000}))); nbSaveAll(items); nbPeeked=true; nbOpen(); });
  await p.waitForTimeout(800);
  const out=await p.evaluate(()=>new Promise(res=>{const ph=document.querySelector('#nbBody .nbph');const t0=performance.now(),arr=[];ph.click();(function f(){arr.push([Math.round(performance.now()-t0),+(ph._f||0).toFixed(2)]);if(performance.now()-t0<900)requestAnimationFrame(f);else res(arr.filter((_,i)=>i%6==0))})()}));
  console.log('reducedMotion =',reduced,JSON.stringify(out));
  await ctx.close();
}
await b.close(); srv.close();
