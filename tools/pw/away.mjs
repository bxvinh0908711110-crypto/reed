import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/deploy/'+u))}catch{r.statusCode=404;r.end()}}).listen(8811);
fs.copyFileSync('E:/Your English/index.html','E:/Your English/deploy/index.html');
const b=await chromium.launch();
for(const [name,opts] of [['mobile',{...devices['iPhone 13']}],['desktop',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(6500);
  const st=()=>p.evaluate(()=>{const e=document.querySelector('#player');const r=e.getBoundingClientRect();return {away:e.classList.contains('away'),top:Math.round(r.top),vh:innerHeight,op:+(+getComputedStyle(e).opacity).toFixed(2),y:Math.round(scrollY)}});
  console.log(name,'hero',JSON.stringify(await st())); await p.screenshot({path:`shots/away_${name}_0.png`});
  await p.evaluate(()=>goStep(1)); await p.waitForTimeout(900); console.log(name,'in lesson',JSON.stringify(await st())); await p.screenshot({path:`shots/away_${name}_1.png`});
  await p.evaluate(()=>goStep(-1)); await p.waitForTimeout(900); console.log(name,'back to hero',JSON.stringify(await st()));
  await p.click('#topics button[data-k="school"]'); await p.waitForTimeout(1500); console.log(name,'after picking topic',JSON.stringify(await st()),'errors',errs);
  await ctx.close();
}
await b.close(); srv.close();
