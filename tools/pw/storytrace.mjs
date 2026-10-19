// Cộng thời gian xử lý (CPU) của trang Stories từ trace Chromium: so sánh các cấu hình. Chạy: node tools/pw/storytrace.mjs "<query>" [throttle]
//   ví dụ: node tools/pw/storytrace.mjs "&lite=0" 4   |   node tools/pw/storytrace.mjs "&lite=1" 4
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const QS=process.argv[2]||'', THROTTLE=+(process.argv[3]||4);
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.wav':'audio/wav'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');if(u===''||u.endsWith('/'))u+='index.html';try{const b=fs.readFileSync('E:/Your English/stories/'+u.replace(/^stories\//,''));r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
const b=await chromium.launch({channel:process.env.CH||undefined,args:['--autoplay-policy=no-user-gesture-required']}); const ctx=await b.newContext(devices['iPhone 13']); const p=await ctx.newPage(); const cdp=await ctx.newCDPSession(p);
await p.goto(`http://localhost:${port}/ussr/${process.argv[4]||''}?lang=en_michael${QS}`); await p.waitForSelector('body[data-ready="1"]',{timeout:120000});
await p.evaluate(()=>document.querySelector('#go0').click()); await p.waitForTimeout(800);
await cdp.send('Emulation.setCPUThrottlingRate',{rate:THROTTLE});
const f='C:/Users/luanh/AppData/Local/Temp/story_trace.json';
await b.startTracing(p,{path:f,categories:['devtools.timeline','cc','disabled-by-default-devtools.timeline']});
const K=await p.evaluate(()=>document.querySelectorAll('.step').length);
for(let k=1;k<K;k++){ await p.evaluate(k=>scrollTo(0,k*innerHeight),k); await p.waitForTimeout(3800); }
await b.stopTracing();
const ev=JSON.parse(fs.readFileSync(f,'utf8')).traceEvents||[];
const sum={}; const pick=['FunctionCall','EvaluateScript','Layout','UpdateLayoutTree','RecalculateStyles','Paint','PrePaint','Layerize','RasterTask','ImageDecodeTask','Decode Image','ImageUploadTask','CompositeLayers','UpdateLayer','Commit','GPUTask','DrawFrame'];
for(const e of ev){ if(e.ph==='X'&&e.dur&&pick.includes(e.name)){ sum[e.name]=(sum[e.name]||0)+e.dur/1000; } }
const tot=Object.entries(sum).sort((a,b)=>b[1]-a[1]);
console.log('cấu hình',QS||'(mặc định)','| CPU',THROTTLE+'x','| bước',K-1);
tot.forEach(([k,v])=>console.log(k.padEnd(18),Math.round(v)+' ms'));


await b.close(); srv.close();
