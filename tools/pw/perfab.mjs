// So sánh A/B nhiều biến thể index.html, chạy xen kẽ để bớt nhiễu: node tools/pw/perfab.mjs v0.html,v1.html,v2.html [cpu=8] [vòng=5]
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const SP='C:/Users/luanh/AppData/Local/Temp/claude/E--Your-English/e267b374-1361-44fe-95be-89835c3e6d0f/scratchpad/';
const variants=(process.argv[2]||'v0.html,v1.html').split(','); const rate=+(process.argv[3]||8), rounds=+(process.argv[4]||5);
const MIME={'.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json','.js':'text/javascript'};
const srv=http.createServer((q,r)=>{const m=/^\/__v\/(.+)$/.exec(q.url.split('?')[0]); let u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,''); try{ let b; if(m){ b=fs.readFileSync(SP+m[1]); u='x.html'; } else b=fs.readFileSync('E:/Your English/deploy/'+(u||'index.html')); r.setHeader('Content-Type',MIME[path.extname(u||'x.html')]||'application/octet-stream'); r.end(b);}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
const b=await chromium.launch(); const med=a=>[...a].sort((x,y)=>x-y)[Math.floor(a.length/2)];
const res={}; variants.forEach(v=>res[v]=[]);
for(let k=0;k<rounds;k++) for(const v of variants){
  const ctx=await b.newContext({...devices['iPhone 13']}); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); await p.goto(`http://localhost:${port}/__v/${v}`); await p.waitForTimeout(5500);
  const cdp=await ctx.newCDPSession(p); await cdp.send('Performance.enable'); await cdp.send('Emulation.setCPUThrottlingRate',{rate}); await p.waitForTimeout(400);
  const m0=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
  const gaps=await p.evaluate(()=>new Promise(async r=>{ const g=[]; let last=performance.now(),run=true; (function f(t){ if(!run) return; g.push(t-last); last=t; requestAnimationFrame(f); })(performance.now()); for(let i=0;i<8;i++){ goStep(1); await new Promise(x=>setTimeout(x,i===0?1100:850)); } run=false; r(g); }));
  const m1=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
  const d=n=>+(((m1[n]||0)-(m0[n]||0))*1000).toFixed(0);
  res[v].push({layout:d('LayoutDuration'),style:d('RecalcStyleDuration'),script:d('ScriptDuration'),task:d('TaskDuration'),slow:gaps.filter(g=>g>24).length,maxGap:Math.round(Math.max(...gaps)),jank:Math.round(gaps.reduce((s,g)=>s+Math.max(0,g-17),0))});
  await ctx.close();
}
for(const v of variants){ const o={}; Object.keys(res[v][0]).forEach(k=>o[k]=med(res[v].map(x=>x[k]))); console.log(v.padEnd(8),JSON.stringify(o)); }
await b.close(); srv.close();
