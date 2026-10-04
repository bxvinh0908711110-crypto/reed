import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');const f='E:/Your English/'+u;try{const ext=u.slice(u.lastIndexOf('.'));if(types[ext])r.setHeader('Content-Type',types[ext]);r.end(fs.readFileSync(f))}catch{r.statusCode=404;r.end()}}).listen(8780);
const b=await chromium.launch();
for(const [name,opts] of [['desktop',{viewport:{width:1280,height:800}}],['se',{...devices['iPhone SE']}],['p13',{...devices['iPhone 13']}]]){
  const ctx=await b.newContext(opts); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8780/index.html'); await p.waitForTimeout(5500);
  await p.screenshot({path:`shots/t_${name}_hero.png`});
  await p.click('#topics button[data-k="school"]'); await p.waitForTimeout(1000);
  await p.screenshot({path:`shots/t_${name}_school.png`});
  const over=await p.evaluate(()=>{const W=innerWidth;const bad=[];document.querySelectorAll('.top *,.art,.sents,.foot').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&r.right>W+1&&!e.closest('#topics'))bad.push(e.className||e.tagName)});return {docW:document.documentElement.scrollWidth,W,bad:[...new Set(bad)]}});
  console.log(name,JSON.stringify(over),'errors',errs);
  await ctx.close();
}
await b.close(); srv.close();
