import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8797);
const b=await chromium.launch();
for(const [name,opts] of [['mobile',{...devices['iPhone 13']}],['desktop',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext(opts); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8797/index.html'); await p.waitForTimeout(9500);
  const info=()=>p.evaluate(()=>{const c=document.querySelector('#tourCard'),s=document.querySelector('#tourSpot');const r=s.getBoundingClientRect(),k=c.getBoundingClientRect();return {on:c.classList.contains('on'),n:c.querySelector('.tn').textContent,t:c.querySelector('.tt').textContent.slice(0,40),spot:[r.left,r.top,r.width,r.height].map(Math.round),card:[k.left,k.top,k.width,k.height].map(Math.round),vw:innerWidth,vh:innerHeight,active:Tour.active}});
  for(let n=1;n<=6;n++){ await p.waitForTimeout(700); const o=await info(); console.log(name,JSON.stringify(o)); await p.screenshot({path:`shots/tour_${name}_${n}.png`}); if(n<6) await p.click('#tourCard .tg2'); }
  // blocked scroll during tour
  const y0=await p.evaluate(()=>scrollY); await p.mouse.wheel(0,500); await p.waitForTimeout(600); console.log(name,'scroll blocked:',y0===await p.evaluate(()=>scrollY));
  await p.click('#tourCard .tg2'); await p.waitForTimeout(800);
  console.log(name,'end ->',await p.evaluate(()=>[Tour.active,curTopic,Math.round(scrollY),localStorage.getItem('reed_tour_done'),getComputedStyle(document.querySelector('#tourCard')).display]),'errors',errs);
  await p.reload(); await p.waitForTimeout(6000); console.log(name,'reload tour?',await p.evaluate(()=>Tour.active));
  await p.click('#tipBtn'); await p.waitForTimeout(900); console.log(name,'? ->',await p.evaluate(()=>Tour.active));
  await p.click('#tourCard .tk'); await p.waitForTimeout(500);
  await ctx.close();
}
await b.close(); srv.close();
