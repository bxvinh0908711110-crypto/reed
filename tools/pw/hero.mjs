import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/deploy/'+u))}catch{r.statusCode=404;r.end()}}).listen(8812);
fs.copyFileSync('E:/Your English/index.html','E:/Your English/deploy/index.html');
const b=await chromium.launch();
for(const [name,opts] of [['d1440',{viewport:{width:1440,height:800}}],['d1280',{viewport:{width:1280,height:720}}],['d1000',{viewport:{width:1000,height:700}}],['m13',{...devices['iPhone 13']}],['se',{...devices['iPhone SE']}],['tab',{viewport:{width:820,height:1100}}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8812/index.html'); await p.waitForTimeout(6500);
  const m=await p.evaluate(()=>{const i=document.querySelector('.heroImg').getBoundingClientRect(),c=document.querySelector('#startBtn').getBoundingClientRect(),h=document.querySelector('.hero h1').getBoundingClientRect();return {W:innerWidth,docW:document.documentElement.scrollWidth,img:[Math.round(i.left),Math.round(i.top),Math.round(i.width),Math.round(i.height)],btn:[Math.round(c.left),Math.round(c.top),Math.round(c.bottom)],h1b:Math.round(h.bottom),imgLoaded:document.querySelector('.heroImg').naturalWidth}});
  console.log(name,JSON.stringify(m),errs); await p.screenshot({path:`shots/hero_${name}.png`});
  if(name==='d1280'){ await p.click('#startBtn'); await p.waitForTimeout(1200); console.log('start ->',await p.evaluate(()=>[Math.round(scrollY),!document.querySelector('#player').classList.contains('away')])); }
  await ctx.close();
}
await b.close(); srv.close();
