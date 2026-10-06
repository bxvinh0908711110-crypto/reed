import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/deploy/'+u))}catch{r.statusCode=404;r.end()}}).listen(8810);
fs.copyFileSync('E:/Your English/index.html','E:/Your English/deploy/index.html');
const b=await chromium.launch();
for(const [name,opts] of [['13',{...devices['iPhone 13']}],['se',{...devices['iPhone SE']}],['820',{viewport:{width:820,height:900}}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); await p.goto('http://localhost:8810/index.html'); await p.waitForTimeout(6500);
  const m=await p.evaluate(()=>{const t=document.querySelector('#topics'),r=t.getBoundingClientRect();const first=t.querySelector('button').getBoundingClientRect();return {W:innerWidth,left:Math.round(r.left),right:Math.round(r.right),radius:getComputedStyle(t).borderRadius,firstLeft:Math.round(first.left),scrollable:t.scrollWidth>t.clientWidth,docW:document.documentElement.scrollWidth}});
  console.log(name,JSON.stringify(m));
  await p.click('#topics button[data-k="tech"]'); await p.waitForTimeout(1500);
  console.log(name,'after tech: scrollLeft',await p.evaluate(()=>Math.round(document.querySelector('#topics').scrollLeft)));
  if(name==='13'){ await p.screenshot({path:'shots/bleed_13.png',clip:{x:0,y:0,width:390,height:150}}); await p.evaluate(()=>{document.querySelector('#topics').scrollLeft=0}); await p.waitForTimeout(300); await p.screenshot({path:'shots/bleed_13b.png',clip:{x:0,y:0,width:390,height:150}}); }
  await ctx.close();
}
await b.close(); srv.close();
