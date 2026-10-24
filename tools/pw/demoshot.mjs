import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
const b=await chromium.launch(); const ph={hasTouch:true,isMobile:true,deviceScaleFactor:2};
for(const [n,o] of [['p320x568',{viewport:{width:320,height:568},...ph}],['p375x667',{viewport:{width:375,height:667},...ph}],['p390',{...devices['iPhone 13']}],['t834',{viewport:{width:834,height:1112}}],['d1280',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext(o); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); await p.goto(`http://localhost:${port}/`);
  await p.waitForFunction(()=>![...document.querySelectorAll('body > *')].some(e=>/splash/i.test(e.id+e.className)&&getComputedStyle(e).display!=='none'&&+getComputedStyle(e).opacity>.05),null,{timeout:20000}).catch(()=>{});
  await p.waitForFunction(()=>document.querySelectorAll('.dmCard .ph')[0]._f===1,null,{timeout:20000}).catch(()=>{});
  await p.waitForTimeout(500); await p.screenshot({path:`tools/pw/shots/demoshot_${n}.png`}); await ctx.close();
}
await b.close(); srv.close();
