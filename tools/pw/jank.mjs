import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8820);
const b=await chromium.launch(); const ctx=await b.newContext(devices['iPhone 13']);
await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); await p.goto('http://localhost:8820/index.html'); await p.waitForTimeout(5500);
const cdp=await ctx.newCDPSession(p);
for(const rate of [1,4]){
  await cdp.send('Emulation.setCPUThrottlingRate',{rate});
  await p.evaluate(()=>{scrollTo(0,0)}); await p.waitForTimeout(800);
  const r=await p.evaluate(()=>new Promise(res=>{const ys=[],ts=[];let t0=performance.now();goStep(1);(function f(t){ys.push(Math.round(scrollY));ts.push(t);if(t-t0<1500)requestAnimationFrame(f);else{let maxGap=0,maxJump=0;for(let i=1;i<ts.length;i++){maxGap=Math.max(maxGap,ts[i]-ts[i-1]);maxJump=Math.max(maxJump,Math.abs(ys[i]-ys[i-1]));}const first=ys.findIndex(y=>y>0),last=ys.findIndex(y=>y===ys[ys.length-1]);res({dist:ys[ys.length-1],dur:Math.round(ts[last]-ts[first]),maxFrameGap:Math.round(maxGap),maxPxPerFrame:maxJump,firstFramePx:ys[first]})}})(t0)}));
  console.log('CPU x'+rate,JSON.stringify(r));
}
await b.close(); srv.close();
