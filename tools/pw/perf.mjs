// Đo chi phí hiệu ứng bước đọc: node tools/pw/perf.mjs [cpuRate=4] [lần=3]
// Mỗi lần: iPhone 13 giả lập + giảm tốc CPU, đi qua 8 bước (hero → bài 1 → các cụm), đo thời gian bố cục/style/script/tác vụ chính và độ trễ khung hình.
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
const rate=+(process.argv[2]||4), runs=+(process.argv[3]||3);
const b=await chromium.launch(); const med=a=>[...a].sort((x,y)=>x-y)[Math.floor(a.length/2)];
const all=[];
for(let k=0;k<runs;k++){
  const ctx=await b.newContext({...devices['iPhone 13']}); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(5500);
  const cdp=await ctx.newCDPSession(p); await cdp.send('Performance.enable'); await cdp.send('Emulation.setCPUThrottlingRate',{rate});
  await p.waitForTimeout(500);
  const m0=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
  const frames=await p.evaluate(()=>new Promise(async res=>{ const gaps=[]; let last=performance.now(),run=true; (function f(t){ if(!run) return; gaps.push(t-last); last=t; requestAnimationFrame(f); })(performance.now());
    for(let i=0;i<8;i++){ goStep(1); await new Promise(r=>setTimeout(r,i===0?1100:850)); }
    run=false; res(gaps); }));
  const m1=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
  const d=n=>+(((m1[n]||0)-(m0[n]||0))*1000).toFixed(0);
  all.push({layoutMs:d('LayoutDuration'),styleMs:d('RecalcStyleDuration'),scriptMs:d('ScriptDuration'),taskMs:d('TaskDuration'),layouts:Math.round((m1.LayoutCount||0)-(m0.LayoutCount||0)),styles:Math.round((m1.RecalcStyleCount||0)-(m0.RecalcStyleCount||0)),slow:frames.filter(g=>g>24).length,maxGap:Math.round(Math.max(...frames)),frames:frames.length});
  await ctx.close();
}
const keys=Object.keys(all[0]); const out={}; keys.forEach(k=>out[k]=med(all.map(x=>x[k])));
console.log(`CPU x${rate}, ${runs} lần, trung vị:`,JSON.stringify(out));
await b.close(); srv.close();
