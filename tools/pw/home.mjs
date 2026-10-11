import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8793);
const b=await chromium.launch();
for(const [name,opts] of [['13',devices['iPhone 13']],['d1280',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto('http://localhost:8793/index.html'); await p.waitForTimeout(5500);
  const st=()=>p.evaluate(()=>[Math.round(scrollY),player.classList.contains('away'),document.body.classList.contains('lang-vi')]);
  console.log(name,'đầu trang, bấm logo',await st()); await p.click('#brandHome'); await p.waitForTimeout(300); console.log(' vẫn 0',await st());
  await p.click('#topics button[data-k="work"]'); await p.waitForTimeout(900); await p.evaluate(()=>{goStep(1)}); await p.waitForTimeout(600);
  await p.evaluate(()=>langBtn.click()); await p.waitForTimeout(500); console.log(' trong bài (VI)',await st());
  await p.evaluate(()=>{window.__ys=[];const f=()=>{__ys.push(Math.round(scrollY));requestAnimationFrame(f)};f()}); await p.click('#brandHome'); await p.waitForTimeout(1500); console.log(' sau bấm logo',await st(),'các vị trí cuộn đã qua:',[...new Set(await p.evaluate(()=>__ys))].join(','));
  await p.evaluate(()=>{goStep(1)}); await p.waitForTimeout(700); console.log(' Start Reading lại được',await st(),errs);
  await ctx.close();
}
await b.close(); srv.close();
