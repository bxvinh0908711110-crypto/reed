// Đo độ nặng của bài Stories (khung hình, số phần tử, bộ nhớ) khi giả lập CPU yếu. Chạy: node tools/pw/storyperf.mjs [throttle=4] [url-query]
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const THROTTLE=+(process.argv[2]||4), QS=process.argv[3]||'';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.wav':'audio/wav'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');if(u===''||u.endsWith('/'))u+='index.html';try{const b=fs.readFileSync('E:/Your English/stories/'+u.replace(/^stories\//,''));r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}); const ctx=await b.newContext(devices['iPhone 13']); const p=await ctx.newPage(); const cdp=await ctx.newCDPSession(p);
await cdp.send('Emulation.setCPUThrottlingRate',{rate:THROTTLE}); await cdp.send('Performance.enable');
await p.goto(`http://localhost:${port}/ussr/?lang=en_michael${QS}`); await p.waitForSelector('body[data-ready="1"]',{timeout:120000});
await p.evaluate(()=>{ window.__fr=[]; let last=performance.now(); (function f(t){ window.__fr.push(t-last); last=t; requestAnimationFrame(f); })(last); });
const m0=await cdp.send('Performance.getMetrics'); const g=n=>m0.metrics.find(x=>x.name===n).value;
await p.evaluate(()=>document.querySelector('#go0').click()); await p.waitForTimeout(500);
const K=await p.evaluate(()=>document.querySelectorAll('.step').length); const res=[];
for(let k=1;k<K;k++){
  await p.evaluate(()=>{ window.__fr.length=0; }); await p.evaluate(k=>scrollTo(0,k*innerHeight),k); await p.waitForTimeout(4200);
  const fr=await p.evaluate(()=>window.__fr.slice()); const s=[...fr].sort((a,b)=>a-b); const avg=fr.reduce((a,b)=>a+b,0)/fr.length;
  res.push({k,fps:Math.round(1000/avg),p95:Math.round(s[Math.floor(s.length*.95)]),worst:Math.round(s[s.length-1])});
}
const m1=await cdp.send('Performance.getMetrics'); const g1=n=>m1.metrics.find(x=>x.name===n).value;
console.log('CPU throttle',THROTTLE+'x');
console.log('DOM nodes',g1('Nodes'),'| heap MB',Math.round(g1('JSHeapUsedSize')/1e6),'| layouts',Math.round(g1('LayoutCount')-g('LayoutCount')),'| style recalcs',Math.round(g1('RecalcStyleCount')-g('RecalcStyleCount')));
console.log('imgs in DOM',await p.evaluate(()=>document.images.length),'| elements',await p.evaluate(()=>document.getElementsByTagName('*').length));
console.log('beat: fps / p95 ms / worst ms'); res.forEach(r=>console.log(String(r.k).padStart(2),r.fps,r.p95,r.worst));
const all=res.map(r=>r.fps); console.log('fps trung bình %d, thấp nhất %d (beat %d)',Math.round(all.reduce((a,b)=>a+b,0)/all.length),Math.min(...all),res.find(r=>r.fps===Math.min(...all)).k);
await b.close(); srv.close();
